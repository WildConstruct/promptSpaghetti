# Deployment Current State

_Last updated: 2026-03-08_

This is the current deployment truth for the MVP branch.

## What is currently aligned

- Netlify is the practical frontend hosting target.
- The frontend build path is:
  - `pnpm --filter @promptscape/core build`
  - `pnpm --filter @prompt/asset-browser prebuild`
  - `pnpm --filter client build`
- The combined shortcut is:
  - `pnpm run build:netlify`
- `client/public/_redirects` proxies `/api/*` to the Vercel backend host.

## What is currently misaligned

- The canonical server runtime is [server/src/index.ts](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/server/src/index.ts).
- The root Vercel project is still configured through [vercel.json](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/vercel.json) as an API-only deployment around the legacy `api/` serverless surface.
- That means Vercel is not yet aligned with the canonical Fastify runtime.

## Practical MVP reading

- Frontend deploy confidence should be based on `pnpm run build:netlify`.
- Backend deploy confidence should be based on `pnpm run build:vercel-api` for now.
- Do not claim that Vercel is already serving the canonical `server/src/index.ts` runtime until the deployment surface is explicitly migrated.

## Current blockers

- The local shell Vercel token is invalid, so remote Vercel project verification is blocked until credentials are refreshed.
- Netlify CLI monorepo selection is noisy in this repo; use the explicit build script above as the reliable MVP check.

## MVP deployment bar

The branch is deployment-ready enough for MVP handoff when these are true:

- `pnpm run build:netlify` passes
- `pnpm run build:vercel-api` passes
- launch/demo flows pass manual verification
- docs describe the Netlify frontend + Vercel backend split honestly

## Deferred deployment work

- migrate Vercel from legacy `api/` functions to the canonical Fastify runtime
- refresh Vercel CLI auth and verify the linked remote project directly
- decide whether Vercel remains backend-only or becomes a unified hosting target
