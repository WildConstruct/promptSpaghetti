# Deployment Current State

_Last updated: 2026-04-13_

This is the current deployment truth for the MVP branch.

## What is currently aligned

- Netlify is the practical frontend hosting target.
- The frontend build path is:
  - `pnpm --filter @prompt/asset-browser prebuild`
  - `pnpm --filter client build`
- The combined shortcut is:
  - `pnpm run build:netlify`
- `client/public/_redirects` proxies `/api/*` to:
  - `https://prompt-spaghetti-client.vercel.app/api/:splat`

## What is currently misaligned

- The canonical server runtime is [server/src/index.ts](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/server/src/index.ts).
- The root Vercel project is still configured through [vercel.json](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/vercel.json) as an API-only deployment around the legacy `api/` serverless surface.
- That means Vercel is not yet aligned with the canonical Fastify runtime.

## Practical MVP reading

- MVP ship confidence should be based on `pnpm run validate:mvp:ship`.
- Local validation confidence should be based on `pnpm run validate:active`.
- Frontend deploy packaging confidence should be based on `pnpm run build:netlify`.
- Backend deploy packaging confidence should be based on `pnpm run build:vercel-api` for now.
- Full local deploy packaging confidence should be based on `pnpm run validate:deploy:active`.
- Do not claim that Vercel is already serving the canonical `server/src/index.ts` runtime until the deployment surface is explicitly migrated.

## Phase 4a local validation truth

- `validate:active` is the canonical developer-machine confidence lane for the
  active MVP surface.
- That lane covers active typecheck, client build, server build, focused server
  runtime smoke, and focused client MVP smoke.
- This improves local confidence only. It does not imply deploy convergence
  between Netlify, Vercel, and the canonical Fastify runtime.

## Phase 4b deploy packaging truth

- `validate:deploy:active` is the canonical local packaging lane for the frozen
  Netlify-plus-Vercel MVP deploy model.
- The canonical hosted backend origin is:
  - `https://prompt-spaghetti-client.vercel.app`
- That lane proves local packaging and config consistency only.
- It does not prove remote deploy credentials, remote site state, or runtime
  convergence.

## Phase 4c generated artifact truth

- `validate:artifacts:active` is the canonical generated-artifact hygiene
  check.
- `packages/asset-browser/public/graphs/manifest.json` is active runtime-generated input and is expected to be deterministic.
- `packages/core/dist/**` is publish-compat output, not the source of truth for local MVP validation or deploy packaging.
- `refresh:publish-compat` is the explicit tracked-output refresh workflow and stays outside the normal MVP confidence lanes.

## Current blockers

- The local shell Vercel token is invalid, so remote Vercel project verification is blocked until credentials are refreshed.
- Netlify CLI monorepo selection is noisy in this repo; use the explicit build script above as the reliable MVP check.

## MVP deployment bar

The branch is deployment-ready enough for MVP handoff when these are true:

- `pnpm run validate:mvp:ship` passes
- `pnpm run validate:active` passes
- `pnpm run validate:deploy:active` passes
- `pnpm run validate:artifacts:active` passes
- `pnpm run build:netlify` passes
- `pnpm run build:vercel-api` passes
- launch/demo flows pass manual verification
- docs describe the Netlify frontend + Vercel backend split honestly

## Deferred deployment work

- migrate Vercel from legacy `api/` functions to the canonical Fastify runtime
- refresh Vercel CLI auth and verify the linked remote project directly
- decide whether Vercel remains backend-only or becomes a unified hosting target
