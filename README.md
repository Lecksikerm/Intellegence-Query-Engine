# Insighta Labs+ Platform

Stage 3 extends the Stage 2 Profile Intelligence System without removing existing filtering, sorting, pagination, and natural language search behavior.

## Repositories

- Backend repo: current repository
- CLI repo: `insighta-cli`
- Web portal repo: `insighta-web-portal`

## Live URLs

- Live backend URL: set your deployed API URL here
- Live web portal URL: set your deployed portal URL here

## System Architecture

- Single backend API with Prisma/PostgreSQL for profiles, users, and refresh-token sessions
- GitHub OAuth (with PKCE) for both browser and CLI clients
- Versioned profile APIs:
  - `v1`: legacy Stage 2-compatible response
  - `v2`: updated pagination envelope (`pagination` object)
- Two clients against same backend:
  - `insighta-cli` for terminal workflows
  - `insighta-web-portal` for browser workflows

## Authentication Flow

- Browser:
  - Portal redirects to `GET /api/auth/github?interface=web&code_verifier=...`
  - Backend stores OAuth state + verifier, completes callback, then sets:
    - `access_token` (HTTP-only cookie, short TTL)
    - `refresh_token` (HTTP-only cookie, short TTL, rotated)
    - `csrf_token` (readable cookie for double-submit CSRF)
- CLI:
  - CLI opens GitHub login via `GET /api/auth/github?interface=cli&code_verifier=...&cli_redirect_uri=...`
  - Backend callback redirects to local CLI callback with one-time `request_id`
  - CLI exchanges `request_id` through `POST /api/auth/cli/complete` to obtain tokens

## Token Handling Approach

- Access tokens are JWTs with short expiration (`ACCESS_TOKEN_TTL`, default `5m`)
- Refresh tokens are JWTs with short expiration (`REFRESH_TOKEN_TTL`, default `30m`)
- Refresh tokens are hashed before persistence in `refresh_tokens.token`
- Refresh endpoint rotates tokens and invalidates the previous refresh token
- CLI credentials stored at `~/.insighta/credentials.json`

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

## CLI Usage

From `insighta-cli`:

- `npm link`
- `insighta login`
- `insighta whoami`
- `insighta profiles list "page=1&limit=10"`
- `insighta profiles search "q=adult%20males%20from%20kenya"`
- `insighta profiles export`
- `insighta logout`

## Local Setup

1. Backend
   - `npm install`
   - set `.env` (minimum: `DATABASE_URL`, `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_CALLBACK_URL`, `WEB_PORTAL_URL`, `CORS_ORIGINS`)
   - `npx prisma migrate dev`
   - `npm run seed`
   - `npm run dev`
2. Web portal
   - `cd insighta-web-portal`
   - `npm start`
3. CLI
   - `cd insighta-cli`
   - `npm link`

