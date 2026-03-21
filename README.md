# VedaAI Assessment Creator

Greenfield monorepo for AI-assisted assessment creation.

## Apps

- `apps/web`: Next.js teacher UI
- `apps/api`: Express API, BullMQ workers, WebSocket server
- `packages/shared`: shared schemas and types

## Local setup

### Option A: without Docker

1. Install and start MongoDB locally.
2. Install and start Redis locally.
3. Copy `.env.example` to `.env`.
4. Set `MONGODB_URI` and `REDIS_URL` to your local service addresses.
5. Install dependencies with `npm install`.
6. Start the API and web app with `npm run dev`.
7. Start the worker in a separate terminal with `npm run dev:worker`.

Default local values:

- `MONGODB_URI=mongodb://localhost:27017/veda_ai`
- `REDIS_URL=redis://localhost:6379`

### Option B: with Docker

1. Copy `.env.example` to `.env`.
2. Start infra with `docker compose up -d`.
3. Install dependencies with `npm install`.
4. Start API and web with `npm run dev`.
5. Start the worker in a separate terminal with `npm run dev:worker`.

## AI mode

- `AI_PROVIDER_MODE=mock` works without an API key.
- Set `AI_PROVIDER_MODE=gemini` and `GEMINI_API_KEY` to enable Gemini generation.
