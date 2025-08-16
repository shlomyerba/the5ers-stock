import { AppBar, Box, Button, Container, Toolbar, Typography } from '@mui/material';
import { Link, Route, Routes } from 'react-router-dom';
import PortfolioPage from '../pages/PortfolioPage';
import StockPage from '../pages/StockPage';

export default function App() {
  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>The5ers Stocks</Typography>
          <Button color="inherit" component={Link} to="/">Portfolio</Button>
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 3 }}>
        <Routes>
          <Route path="/" element={<PortfolioPage />} />
          <Route path="/stocks/:symbol" element={<StockPage />} />
        </Routes>
      </Container>
    </Box>
  );
}