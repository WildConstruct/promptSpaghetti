# Deployment Current State

_Last updated: 2026-07-14_ (work-loop **C5**)

This is the current deployment truth for the active product surface.
See also [`vercel-convergence-decision.md`](./vercel-convergence-decision.md) and
[`ACTIVE_SURFACE.md`](../ACTIVE_SURFACE.md).

## What is currently aligned

- **Netlify** is the practical frontend hosting target.
- Frontend build path:
  - `pnpm --filter @prompt/asset-browser prebuild`
  - `pnpm --filter client build`
- Combined shortcut: `pnpm run build:netlify`
- API proxy from the static client:
  - `client/public/_redirects` and `netlify.toml` proxy `/api/*` →
    `https://prompt-spaghetti-client.vercel.app/api/:splat`
- **Local Fastify** (`server/src/index.ts`) is the canonical **dev** backend:
  - default bind **`HOST=127.0.0.1`** (loopback) as of local-sandbox hardening
  - set `HOST=0.0.0.0` only when intentionally exposing the process
- Graph **preview/export** is **client-side** (`Epic1ExecutionEngine`). There is no
  mounted Fastify `POST /preview`.

## What is currently misaligned

- Hosted backend on Vercel is still the legacy **`api/**` serverless surface**
  (`vercel.json` API-only style deploy), **not** the Fastify app in `server/src`.
- That means production `/api/*` behavior can diverge from local Fastify routes
  (local-image / local-fragments exist only on Fastify; do not assume they exist
  on Vercel).
- Local sandbox routes are **dev-machine only** (loopback + optional
  `LOCAL_FRAGMENT_ROOTS`); they are not part of the hosted product API story.

## Practical confidence lanes

| Goal | Command / signal |
| --- | --- |
| MVP ship (when scripted) | `pnpm run validate:mvp:ship` |
| Active local product | `pnpm run validate:active` |
| Deploy packaging | `pnpm run validate:deploy:active` |
| Frontend package | `pnpm run build:netlify` |
| Vercel API package | `pnpm run build:vercel-api` |
| Artifacts | `pnpm run validate:artifacts:active` |
| Type safety | `pnpm typecheck` |

Do **not** claim Vercel serves `server/src/index.ts` until convergence is executed.

## Phase notes (still valid)

### Local validation

`validate:active` covers active typecheck, client build, server build, and focused
smoke for the MVP surface on a developer machine. It does not prove remote deploy
state or hosting convergence.

### Deploy packaging

`validate:deploy:active` proves local packaging/config consistency for the frozen
Netlify + Vercel split. Canonical hosted backend origin for the proxy model:

`https://prompt-spaghetti-client.vercel.app`

### Generated artifacts

- `packages/asset-browser/public/graphs/manifest.json` — deterministic runtime input
- `packages/core/dist/**` — publish-compat only; not source of truth for MVP validation
- `refresh:publish-compat` — optional; outside normal MVP lanes

## Known blockers / caveats

- Remote Vercel project verification may be blocked without valid CLI credentials
  (historically noted; re-check when converging).
- Netlify monorepo CLI can be noisy; prefer explicit `build:netlify`.
- Supabase RLS for cloud isolation remains an **external** verification gate
  ([runbook](./supabase-rls-verification-runbook.md)) — not a deploy packaging concern,
  but blocks “cloud is safe” claims.

## Deferred deployment work

1. Migrate Vercel from `api/**` to canonical Fastify **or** formally document `api/**`
   as the permanent hosted backend (see convergence options).
2. Refresh Vercel CLI auth and verify linked project.
3. Decide unified hosting vs permanent split.

## Honest external wording

**Say:** Netlify (or static) frontend; Vercel serverless `api/**` backend; local
Fastify for development; client-side graph execution.

**Do not say:** unified backend, Fastify-on-Vercel, or “server preview API” for graphs.
