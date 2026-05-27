# Deploying to Railway

This app runs as **two Railway services + one Redis database**, all in a single
Railway project that pulls from the `Teaching-assistant` GitHub repo.

| Railway service | Builds from | Start command | Needs public domain? |
|---|---|---|---|
| **api** (API + workers) | `railway.api.json` | `node apps/api/dist/combined.js` | Yes |
| **web** (Next.js) | `railway.web.json` | `npm run start -w @veda/web` | Yes |
| **Redis** | Railway plugin | — | No (private) |

MongoDB Atlas, Supabase, and Groq stay external — Railway only talks to them over the network.

---

## Step 1 — Create the project + Redis

1. Railway dashboard → **New Project → Deploy from GitHub repo** → pick `Kuldeep2602/Teaching-assistant`.
   This creates your first service from the repo.
2. In the project, **New → Database → Add Redis**. This gives you a `REDIS_URL` variable other services can reference.

## Step 2 — Configure the **api** service

1. Rename the first service to `api`.
2. **Settings → Config-as-code / Railway Config File** → set the path to `railway.api.json`.
3. **Settings → Networking → Generate Domain.** Copy the URL — you need it for the web service. Call it `<API_URL>` (e.g. `https://teaching-assistant-api-production.up.railway.app`).
4. **Variables** → add the values from the table below.
5. Deploy. Then open `<API_URL>/api/health` — you want `{"ok":true,...}`. If `ok:false`, check the `mongo`/`redis` fields.

## Step 3 — Add the **web** service

1. **New → GitHub Repo → same `Teaching-assistant` repo.** Name it `web`.
2. **Settings → Config-as-code** → set path to `railway.web.json`.
3. **Settings → Networking → Generate Domain.** This is your public app URL.
4. **Variables** → set `NEXT_PUBLIC_API_BASE_URL` and `NEXT_PUBLIC_SOCKET_URL` **both to `<API_URL>`** from Step 2.
   > These are baked into the browser bundle at **build time** — if you change them later you must redeploy the web service, not just restart it.
5. Deploy. Open the web domain and create a test assignment.

---

## Environment variables

### api service

| Variable | Value | Notes |
|---|---|---|
| `MONGODB_URI` | your Atlas SRV string | Use a real DB name, e.g. `.../veda_ai?retryWrites=true&w=majority` |
| `REDIS_URL` | `${{Redis.REDIS_URL}}` | Railway reference variable — points at the private Redis |
| `AI_PROVIDER_MODE` | `groq` | |
| `GROQ_API_KEY` | your Groq key | |
| `SUPABASE_URL` | `https://dacweprclvpljnpczlyq.supabase.co` | |
| `SUPABASE_SERVICE_ROLE_KEY` | your Supabase service-role key | |
| `SUPABASE_UPLOAD_BUCKET` | `assignment-uploads` | |
| `SUPABASE_PDF_BUCKET` | `assignment-uploads` | |
| `NPM_CONFIG_PRODUCTION` | `false` | So `typescript`/`tsx` install and the `tsc` build can run |

Do **not** set `API_PORT` — Railway injects `PORT` and the server uses it automatically ([env.ts](apps/api/src/config/env.ts)).

### web service

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | `<API_URL>` (the api service's public domain) |
| `NEXT_PUBLIC_SOCKET_URL` | `<API_URL>` |
| `NPM_CONFIG_PRODUCTION` | `false` |

---

## Gotchas (already handled in code, listed so you know why)

- **Redis over IPv6** — Railway's private network is IPv6-only and `ioredis` defaults to IPv4. `family: 0` is set in [redis.ts](apps/api/src/db/redis.ts) so the `*.railway.internal` host resolves.
- **Build skipping devDependencies** — `tsc` and `next` are devDependencies. `NPM_CONFIG_PRODUCTION=false` keeps them installed during the Railway build.
- **`NEXT_PUBLIC_*` is build-time** — set on the web service *before* the first build; redeploy after any change.
- **One Redis, shared** — the api service runs both the queue producer (HTTP) and consumer (workers) in one process, plus Redis pub/sub for socket events. They must all point at the same Redis instance (the reference variable handles this).
