# Active Deploy Packaging Lane

_Last updated: 2026-05-05_

This note defines the canonical local packaging lane for the current MVP deploy
model.

The deploy architecture remains intentionally split:

- Netlify-style static frontend packaging
- legacy Vercel `api/` compatibility surface for hosted backend routing

## Canonical Commands

- `pnpm run build:netlify`
- `pnpm run build:vercel-api`
- `pnpm run validate:deploy:active`
- `pnpm run validate:artifacts:active`
- `pnpm run refresh:publish-compat`

## Ordered Packaging Lane

The full local packaging lane runs these phases in order:

1. Netlify frontend packaging build
2. Vercel API compatibility build
3. deploy config consistency check
4. generated artifact hygiene check

## Canonical Deploy Truth

- frontend publish dir: `client/dist`
- backend API origin: `https://prompt-spaghetti-client.vercel.app`
- client `/api/*` proxy target:
  `https://prompt-spaghetti-client.vercel.app/api/:splat`
- Vercel mode for MVP: legacy `api/` compatibility only
- canonical backend entry packaged by this lane: `server/src/index.ts`
- post-MVP backend direction: `dedicated-fastify-backend`
- `packages/core/dist/**` remains publish-compat output, not active deploy source of truth

## What This Lane Proves

- the frontend package still builds for the active Netlify-style flow
- the canonical server build still packages cleanly for backend handoff
- active config and docs agree on one hosted backend origin
- active deploy packaging does not refresh `packages/core/dist/**`
- the repo does not claim Vercel already serves `server/src/index.ts`
- `refresh:publish-compat` remains a separate compatibility workflow and is not part of `validate:deploy:active`

## What This Lane Does Not Prove

- remote Netlify verification
- remote Vercel verification
- Vercel/Fastify runtime convergence
- credential validity for hosted deploy tooling
