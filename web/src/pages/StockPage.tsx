import { useParams, Link as RouterLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  Divider,
  Skeleton,
  Chip,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

type Quote = {
  price?: number;
  changePercent?: number;
  changesPercentage?: number;
  name?: string;
  exchange?: string;
  raw?: any;
};

type Point = { t: string; p: number };

function ChangePill({ value }: { value: number | null | undefined }) {
  if (value == null) return <Chip size="small" label="n/a" />;
  const color = value === 0 ? 'default' : value > 0 ? 'success' : 'error';
  const label = `${value.toFixed(2)}%`;
  return <Chip size="small" color={color as any} label={label} />;
}

function IntradayChart({ data }: { data: Point[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data}>
        <XAxis dataKey="t" minTickGap={40} />
        <YAxis domain={['auto', 'auto']} />
        <Tooltip />
        <Line type="monotone" dataKey="p" strokeOpacity={0.9} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default function StockPage() {
  const { symbol = '' } = useParams();

  const quote = useQuery({
    queryKey: ['quote', symbol],
    queryFn: () =>
      fetch(`/api/stocks/${symbol}/quote`).then(
        (r) => r.json() as Promise<Quote>
      ),
    refetchInterval: 60_000,
  });

  const intraday = useQuery({
    queryKey: ['intraday', symbol],
    queryFn: () =>
      fetch(`/api/stocks/${symbol}/intraday?interval=1min`).then(
        (r) => r.json() as Promise<{ points: Point[] }>
      ),
    refetchInterval: 60_000,
  });

  const quoteInfo = (quote.data?.raw ?? quote.data) as Quote | undefined;
  const dailyChangePercent = quoteInfo?.changePercent ?? quoteInfo?.changesPercentage ?? null;

  return (
    <Box p={3}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Typography variant="h5" fontWeight={700}>
          {symbol}
        </Typography>
        <Button component={RouterLink} to="/" variant="outlined">
          Back to Portfolio
        </Button>
      </Stack>

      <Card>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={3} mb={1}>
            <Typography variant="h4" fontWeight={700}>
              {quoteInfo?.price != null ? `$${quoteInfo.price.toFixed(2)}` : '—'}
            </Typography>
            <ChangePill value={dailyChangePercent} />
            <Typography color="text.secondary">
              {quoteInfo?.name ?? ''}
              {quoteInfo?.name ? ' • ' : ''}
              {quoteInfo?.exchange ?? ''}
            </Typography>
          </Stack>

          <Divider sx={{ my: 2 }} />

          {intraday.isLoading ? (
            <Skeleton variant="rounded" height={260} />
          ) : (
            <IntradayChart data={intraday.data?.points ?? []} />
          )}

          <Typography variant="caption" color="text.secondary">
            Interval: 1min • Fetched at: {new Date().toLocaleTimeString()}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
