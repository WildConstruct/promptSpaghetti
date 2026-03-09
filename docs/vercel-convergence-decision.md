# Vercel Convergence Decision

_Last updated: 2026-03-08_

This note exists to remove ambiguity around Vercel for the MVP branch.

## Current truth

- The canonical backend runtime is [server/src/index.ts](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/server/src/index.ts).
- The root Vercel surface is still configured by [vercel.json](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/vercel.json) as a legacy API-only deployment around the `api/` directory.
- The frontend build/deploy path is currently better represented by Netlify plus `client/public/_redirects`.

## Decision for MVP

Do not migrate Vercel to the canonical Fastify runtime during MVP closeout.

Reason:

- it changes deployment architecture, not just implementation
- current remote verification is blocked by invalid Vercel CLI credentials
- the MVP already has a working deploy check through:
  - `pnpm run build:netlify`
  - `pnpm run build:vercel-api`

## What to say externally

For MVP handoff:

- frontend deploy target: Netlify-style static client build
- backend deploy target: current Vercel/backend surface or equivalent server hosting
- canonical runtime in code: `server/src/index.ts`

Do not say:

- that Vercel already serves the canonical Fastify runtime
- that deployment has been fully unified

## Post-MVP options

Only after MVP handoff, choose one:

1. Keep Vercel backend-only
- Treat `api/` as the supported hosted backend surface.
- Update docs so the legacy serverless path becomes explicit instead of accidental.

2. Migrate Vercel to canonical runtime
- Replace the legacy `api/` surface with a deployment that serves `server/src/index.ts`.
- Update `vercel.json`, env handling, health checks, and routing accordingly.

3. Move backend off Vercel
- Keep Netlify/static frontend and deploy the Fastify runtime somewhere more natural.
- Leave Vercel out of the active deployment story.

## Recommendation

For MVP:

- freeze Vercel architecture changes
- keep the deployment story honest
- defer convergence until product direction settles and Vercel credentials are available
