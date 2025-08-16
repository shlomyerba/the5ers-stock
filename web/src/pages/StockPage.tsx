import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import {
  Alert,
  Card,
  CardContent,
  Stack,
  Typography,
  Chip,
  Button, 
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; 

export default function StockPage() {
  const { symbol = '' } = useParams();
  const navigate = useNavigate(); 

  const { data, isLoading, isError } = useQuery({
    queryKey: ['quote', symbol],
    queryFn: async () => (await api.get(`/stocks/${symbol}/quote`)).data,
    enabled: !!symbol,
  });

  if (isLoading) return <div>Loading…</div>;
  if (isError || !data) return <Alert severity="error">Failed to load stock data</Alert>;

  const pct = typeof data.changePercent === 'number' ? data.changePercent : null;
  const color = pct === null ? 'default' : pct >= 0 ? 'success' : 'error';
  const pctText = pct === null ? 'N/A' : `${pct.toFixed(2)}%`;

  // Fallback: go back if possible, otherwise navigate home
  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };

  return (
    <Stack spacing={2}>
      <Button
        variant="text"
        startIcon={<ArrowBackIcon />}
        onClick={goBack}
        component={RouterLink}
        to="/"
        sx={{ alignSelf: 'flex-start' }}
      >
        Back to Portfolio
      </Button>

      <Card>
        <CardContent>
          <Stack spacing={1}>
            <Typography variant="h5">{data.symbol}</Typography>
            <Typography variant="h6">
              {data.raw?.name || data.symbol} {data.raw?.exchange ? `• ${data.raw.exchange}` : ''}
            </Typography>
            <Typography variant="h4">${data.price?.toFixed?.(2) ?? data.price}</Typography>
            <Stack direction="row" spacing={1}>
              <Chip label={`Daily change: ${pctText}`} color={color as any} />
              <Chip label={`Fetched at: ${new Date(data.fetchedAt).toLocaleTimeString()}`} />
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
