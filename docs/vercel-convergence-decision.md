# Vercel Convergence Decision

_Last updated: 2026-07-14_ (work-loop **C5**)

This note removes ambiguity around Vercel vs the canonical Fastify runtime.

## Current truth

| Surface | Role |
| --- | --- |
| `server/src/index.ts` | Canonical **local/dev** Fastify backend (Node ≥ 20) |
| `api/**` + root `vercel.json` | **Hosted** backend (serverless); production `/api/*` target |
| Netlify + `client/public/_redirects` | Frontend; proxies `/api/*` to Vercel origin |
| Client `Epic1ExecutionEngine` | Graph preview/export (not on Vercel/Fastify) |

Hosted backend origin (proxy model):

`https://prompt-spaghetti-client.vercel.app`

## Decision (still in force)

**Do not migrate Vercel onto Fastify as part of routine product work** until:

1. Product/ops explicitly choose a convergence option below, and  
2. Deploy credentials and a cutover plan exist.

Reasons unchanged from MVP freeze:

- architecture change, not a small implementation tweak
- dual surfaces already work for Lab-style deploys if docs stay honest
- local Fastify can iterate (e.g. sandbox hardening) without forcing a prod cutover

## What to say externally

- Frontend: Netlify-style static client  
- Backend: Vercel `api/**` (or equivalent)  
- Dev backend: Fastify in `server/src`  
- Graph execution: **browser / client engine**

Do **not** say Vercel already runs Fastify or that deploy is fully unified.

## Post-freeze options

| # | Option | When to pick |
| --- | --- | --- |
| 1 | **Keep Vercel backend-only** — treat `api/**` as permanent hosted API; mirror critical route policy there | Lowest ops risk; accept dual implementation |
| 2 | **Migrate Vercel → Fastify** — replace serverless with Fastify (or adapter); one runtime | Want one codebase for local + prod API |
| 3 | **Move backend off Vercel** — Netlify static + Fly/Railway/etc. for Fastify | Prefer long-running Node over serverless |

**Recommendation until a written choice is made:** Option behaviorally **#1** (honest dual surface), with optional later move to **#2** when credentials and appetite exist.

## Interaction with local-only routes

Routes such as `/api/local-image/*` and `/api/local-fragments/*` are Fastify
dev/demo lanes (loopback-gated). They are **not** part of the hosted Vercel story
and must not be required for production frontend flows.

## Related

- [`deployment-current-state.md`](./deployment-current-state.md)
- [`server-route-access-policy.md`](./server-route-access-policy.md)
- [`ACTIVE_SURFACE.md`](../ACTIVE_SURFACE.md)
