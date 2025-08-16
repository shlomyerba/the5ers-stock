# AI Setup

**Tool:** ChatGPT (GPT-5 Thinking)

## Scope of Use
- Planned the overall architecture (Nx monorepo with `apps/api` + `apps/web`).
- Scaffolded base projects (NestJS API, React + Vite web) and initial wiring.
- Implemented portfolio CRUD, quotes fetching (single + batch), and simple server-side caching (~60s) to mitigate API rate limits.
- Helped troubleshoot issues during development (e.g., Mongoose `_id` type for a single-document portfolio, React hooks order errors, Vite dev proxy).
- Wrote initial README instructions and first-time seed commands.

## Principles
- AI output is reviewed and adapted; everything was built and run locally before committing.
- Separation of concerns: controllers ↔ services ↔ data models; pages ↔ API client.
- No secrets or API keys are generated or stored by AI; keys are provided locally via `.env`.
- Prefer resilience and clarity over cleverness: explicit types, simple DTO validation, friendly error states.

## What Was Done Manually
- Creating the FMP account and managing the API key.
- Local environment setup (Docker, `.env` files), testing, and verification.
- Final UI/UX tweaks and copy.

## Notable Files/Areas Influenced by AI
- **Backend:** `apps/api/src/**` (Portfolio & Stocks modules, batch quotes endpoint, NodeCache).
- **Frontend:** `apps/web/src/**` (PortfolioPage, StockPage, React Query integration, Vite proxy usage).
- **Docs:** `README.md` (run instructions), seed commands.

> All AI-assisted changes were validated with local runs (`npx nx serve api`, `npx nx serve web`) and quick cURL checks to ensure correctness.
