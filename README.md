# Insighta Labs+ Platform

Stage 3 extends the Stage 2 Profile Intelligence System without removing existing filtering, sorting, pagination, and natural language search behavior.

## Repositories

- Backend repo: current repository
- CLI repo: separate repository (consumes this backend)
- Web portal repo: separate repository (consumes this backend)

## Live URLs

- Live backend URL: https://intellegence-query-engine-production.up.railway.app/
- Live web portal URL: https://insighta-web-portal-navy.vercel.app/

## System Architecture

- Single backend API with Prisma/PostgreSQL for profiles, users, and refresh-token sessions
- GitHub OAuth (with PKCE) for both browser and CLI clients
- Versioned profile APIs:
  - `v1`: legacy Stage 2-compatible response
  - `v2`: updated pagination envelope (`pagination` object)
- Two external clients integrate with the same backend:
  - CLI for terminal workflows
  - Web portal for browser workflows

## Authentication Flow

- Browser:
  - Portal redirects to `GET /api/auth/github?interface=web&code_verifier=...`
  - Backend stores OAuth state + verifier, completes callback, then sets:
    - `access_token` (HTTP-only cookie, short TTL)
    - `refresh_token` (HTTP-only cookie, short TTL, rotated)
    - `csrf_token` (readable cookie for double-submit CSRF)
- CLI:
  - CLI opens GitHub login via `GET /api/auth/github?interface=cli&code_verifier=...&cli_redirect_uri=...`
  - Backend callback redirects to local CLI callback with one-time `request_token`
  - CLI exchanges `request_token` through `POST /api/auth/cli/complete` to obtain tokens

## Token Handling Approach

- Access tokens are JWTs with short expiration (`ACCESS_TOKEN_TTL`, default `15m`)
- Refresh tokens are JWTs with short expiration (`REFRESH_TOKEN_TTL`, default `30m`)
- Refresh tokens are hashed before persistence in `refresh_tokens.token`
- Refresh endpoint rotates tokens and invalidates the previous refresh token
- CLI implementation should store credentials at `~/.insighta/credentials.json`

## Role Enforcement Logic

- `protect` middleware validates bearer token or secure cookie token
- `requireRoles` enforces role access:
  - `admin`, `analyst`: list/search profile endpoints
  - `admin` only: CSV export endpoint
- Enforcement is applied on all profile route groups (`/api/profiles`, `/api/v1/profiles`, `/api/v2/profiles`)

## Natural Language Parsing Approach

- Rule-based parser in `src/utils/queryParser.js`
- Extracts constrained filters from phrases (gender, age range/group, country)
- Falls back with `"Unable to interpret query"` on unknown intents
- Parsed filters reuse the same validation + query pipeline as structured filters

## Security Controls

- GitHub OAuth + PKCE
- HTTP-only cookie session support for web
- CSRF protection for cookie-authenticated state-changing routes
- Role-based access control for protected resources
- API + auth route rate limiting via `express-rate-limit`
- Request logging via `morgan`

## API Notes

- Auth:
  - `GET /api/auth/github`
  - `GET /api/auth/github/callback`
  - `POST /api/auth/cli/complete`
  - `POST /api/auth/refresh`
  - `POST /api/auth/logout`
  - `GET /api/auth/me`
- Profiles:
  - `GET /api/v1/profiles`
  - `GET /api/v1/profiles/search`
  - `GET /api/v1/profiles/export`
  - `GET /api/v2/profiles`
  - `GET /api/v2/profiles/search`
  - `GET /api/v2/profiles/export`

## CLI Usage Contract

Expected CLI capabilities against this backend:

- Login via GitHub PKCE (`/api/auth/github?interface=cli...`)
- Complete login via one-time exchange (`POST /api/auth/cli/complete`)
- Refresh token flow (`POST /api/auth/refresh`)
- Versioned profile listing/search/export (`/api/v2/profiles*`)

## Local Setup

1. `npm install`
2. Configure `.env` (minimum: `DATABASE_URL`, `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_CALLBACK_URL`, `WEB_PORTAL_URL`, `CORS_ORIGINS`)
3. `npx prisma migrate dev`
4. `npm run seed`
5. `npm run dev`

