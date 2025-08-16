# The5ers — Stock Management

Minimal instructions to run the project locally.

## Prerequisites
- Node.js 20+ and npm 10+
- Docker Desktop
- Financial Modeling Prep API key ([Get one here](https://financialmodelingprep.com/))

## Environment Setup

1. **API Environment** - Create `api/.env`:
```bash
PORT=3333
MONGODB_URI=mongodb://localhost:27017/the5ers
FMP_API_KEY=your_fmp_api_key_here
FMP_BASE_URL=https://financialmodelingprep.com/api/v3
```

2. **Web Environment** - Create `web/.env`:
```bash
VITE_API_BASE=/api
```

> **Note:** Copy from `.env.example` files and replace `your_fmp_api_key_here` with your actual API key.

## Quick Start (Development)

```bash
# 1) Install dependencies
npm i

# 2) Start MongoDB (Docker)
docker compose up -d

# 3) Start the API (terminal A)
npx nx serve api
# → http://localhost:3333

# 4) Start the Web app (terminal B)
npx nx serve web
# → http://localhost:4200


## First-time Seed (3 default stocks)

After the API is running, seed the portfolio with three symbols:

```bash
curl -s -X PUT http://localhost:3333/api/portfolio \
  -H "Content-Type: application/json" \
  -d '{"symbols":["AAPL","MSFT","GOOGL"]}'
