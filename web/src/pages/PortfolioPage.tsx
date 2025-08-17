import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  Stack,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Container,
  CircularProgress,
  Paper,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function PortfolioPage() {
  const qc = useQueryClient();

  // 1) Hooks first, always same order
  const {
    data: portfolio,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['portfolio'],
    queryFn: async () => (await api.get('/portfolio')).data,
  });

  const [symbolInput, setSymbolInput] = useState('');

  const symbols: string[] = portfolio?.symbols ?? [];
  const symbolsKey = symbols.length ? symbols.slice().sort().join(',') : '';

  const quotes = useQuery({
    queryKey: ['quotes', symbolsKey],
    queryFn: async () =>
      (
        await api.get('/stocks/quotes', {
          params: { symbols: symbols.join(',') },
        })
      ).data,
    enabled: symbols.length > 0,
  });

  const save = useMutation({
    mutationFn: async (next: string[]) =>
      (await api.put('/portfolio', { symbols: next })).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['portfolio'] });
      qc.invalidateQueries({ queryKey: ['quotes'] });
    },
  });

  // 2) Early returns AFTER hooks
  if (isLoading) return <div>Loading…</div>;
  if (isError) return <Alert severity="error">Failed to load portfolio</Alert>;

  // 3) Plain variables (not hooks)
  const quotesArr = Array.isArray(quotes.data)
    ? quotes.data
    : quotes.data?.quotes || [];
  const qMap = new Map<string, any>();
  quotesArr.forEach((q: any) => qMap.set(q.symbol, q));

  const rows = symbols.map((s) => ({
    symbol: s,
    price: qMap.get(s)?.price as number | undefined,
    changePercent: (qMap.get(s)?.changePercent as number | null) ?? null,
  }));

  const list = Array.isArray(rows) ? rows : [];
  const count = list.length;
  const sum = list.reduce((s: number, r: any) => s + (r.price ?? 0), 0);
  const avg = count
    ? list.reduce((s: number, r: any) => s + (r.changePercent ?? 0), 0) / count
    : 0;

  const totals = { count, sum, avg };

  const add = () => {
    const s = symbolInput.toUpperCase().trim();
    if (!s) return;
    const next = Array.from(new Set([...symbols, s]));
    save.mutate(next);
    setSymbolInput('');
  };

  const removeAt = (s: string) => {
    save.mutate(symbols.filter((x) => x !== s));
  };

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Paper
          elevation={0}
          sx={{ p: 2, borderRadius: 3, bgcolor: '#0ea5e9', color: '#fff' }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems="center"
            justifyContent="space-between"
            spacing={2}
          >
            <Typography variant="h6" fontWeight={700}>
              Portfolio
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Chip
                variant="outlined"
                sx={{ borderColor: 'rgba(255,255,255,0.6)', color: '#fff' }}
                label={`Symbols: ${totals.count}`}
              />
              <Chip
                variant="outlined"
                sx={{ borderColor: 'rgba(255,255,255,0.6)', color: '#fff' }}
                label={`Total price: $${totals.sum.toFixed(2)}`}
              />
              <Chip
                variant="filled"
                color={
                  totals.avg > 0
                    ? 'success'
                    : totals.avg < 0
                    ? 'error'
                    : 'default'
                }
                label={`Avg change: ${totals.avg.toFixed(2)}%`}
              />
            </Stack>
          </Stack>
        </Paper>
      </Box>
      <Stack spacing={2}>
        <Stack direction="row" spacing={1}>
          <TextField
            size="small"
            label="Add symbol (e.g., AAPL)"
            value={symbolInput}
            onChange={(e) => setSymbolInput(e.target.value)}
          />
          <Button variant="contained" onClick={add}>
            Add
          </Button>
        </Stack>

        {symbols.length === 0 && (
          <Box sx={{ opacity: 0.7 }}>
          No stocks yet in your portfolio. Add one above, then click the symbol for details.
          </Box>
        )}

        {symbols.length > 0 && (
          <Box sx={{ position: 'relative' }}>
            {quotes.isFetching && (
              <Box sx={{ position: 'absolute', top: -40 }}>
                <CircularProgress size={16} />
              </Box>
            )}
            {quotes.isError && (
              <Alert severity="warning">
              Couldn't fetch quotes right now (might be rate limited). We'll retry automatically.
              </Alert>
            )}
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Symbol</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Daily Change</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((r) => {
                const pct = typeof r.changePercent === 'number' ? r.changePercent : null;
                const color = pct === null ? 'default' : pct >= 0 ? 'success' : 'error';
                  const pctText = pct === null ? 'N/A' : `${pct.toFixed(2)}%`;
                  return (
                    <TableRow key={r.symbol} hover>
                      <TableCell>
                        <Link to={`/stocks/${r.symbol}`}>{r.symbol}</Link>
                      </TableCell>
                      <TableCell align="right">
                      {r.price !== undefined ? `$${r.price.toFixed?.(2) ?? r.price}` : '—'}
                      </TableCell>
                      <TableCell align="right">
                      <Chip size="small" label={pctText} color={color as any} />
                      </TableCell>
                      <TableCell align="right">
                      <IconButton size="small" onClick={() => removeAt(r.symbol)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Box>
        )}
      </Stack>
    </Container>
  );
}
