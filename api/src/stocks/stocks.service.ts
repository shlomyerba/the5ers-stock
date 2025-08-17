import axios from 'axios';
import NodeCache from 'node-cache';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import dayjs from 'dayjs';
const cache = new NodeCache({ stdTTL: 60 });

export interface QuotePayload {
  symbol: string;
  price: number;
  changePercent: number | null;
  raw: any;
  fetchedAt: string;
}

@Injectable()
export class StocksService {
  private fmpBase = process.env.FMP_BASE_URL || 'https://financialmodelingprep.com/api/v3';
  private fmpKey = process.env.FMP_API_KEY || '';

  private buildPayload(raw: any): QuotePayload | null {
    const sym = String(raw?.symbol || '').toUpperCase();
    if (!sym) return null;
    const price = Number(raw?.price ?? raw?.c ?? raw?.last ?? 0);

    let changePercent: number | null = null;
    if (raw?.changesPercentage !== undefined) {
      const cp = String(raw.changesPercentage).replace('%', '');
      const n = Number(cp);
      changePercent = isNaN(n) ? null : n;
    } else if (raw?.change !== undefined && raw?.previousClose !== undefined) {
      const prev = Number(raw.previousClose);
      const ch = Number(raw.change);
      if (!isNaN(prev) && prev !== 0 && !isNaN(ch)) {
        changePercent = (ch / prev) * 100;
      }
    }

    return {
      symbol: sym,
      price,
      changePercent,
      raw,
      fetchedAt: new Date().toISOString(),
    };
  }

  async quote(symbol: string): Promise<QuotePayload> {
    const sym = symbol.toUpperCase();
    const fmpKey = `quote:${sym}`;
    const cached = cache.get<QuotePayload>(fmpKey);
    if (cached) return cached;

    const url = `${this.fmpBase}/quote/${encodeURIComponent(sym)}?apikey=${
      this.fmpKey
    }`;
    const { data } = await axios.get(url);
    const raw = Array.isArray(data) ? data[0] : data;
    const payload = this.buildPayload(raw)!;
    cache.set(fmpKey, payload);
    return payload;
  }

  async quotes(symbols: string[]): Promise<QuotePayload[]> {
    const list = Array.from(new Set((symbols || []).map((s) => String(s).toUpperCase().trim()).filter(Boolean)));
    if (list.length === 0) return [];

    const results: Record<string, QuotePayload> = {};
    const toFetch: string[] = [];

    for (const s of list) {
      const c = cache.get<QuotePayload>(`quote:${s}`);
      if (c) results[s] = c; else toFetch.push(s);
    }

    if (toFetch.length) {
      const url = `${this.fmpBase}/quote/${encodeURIComponent(toFetch.join(','))}?apikey=${this.fmpKey}`;
      const { data } = await axios.get(url);
      const arr = Array.isArray(data) ? data : [data];
      for (const raw of arr) {
        const p = this.buildPayload(raw);
        if (p) {
          results[p.symbol] = p;
          cache.set(`quote:${p.symbol}`, p);
        }
      }
    }

    return list.map((s) => results[s]).filter(Boolean);
  }

  async intraday(symbol: string, interval = '1min') {
    const url = `${this.fmpBase}/historical-chart/${interval}/${symbol}?apikey=${this.fmpKey}`;

    let rows: Array<{ date: string; close: number }>;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(String(res.status));
      rows = await res.json();
    } catch (e) {
      console.error(`intraday failed for ${symbol}`, (e as any)?.message);
      throw new InternalServerErrorException('Failed to load intraday data');
    }
    const points = (rows ?? [])
      .slice(0, 390)
      .map((r) => ({ t: dayjs(r.date).format('HH:mm'), p: r.close }))
      .reverse();

    return { symbol, interval, points };
  }
}
