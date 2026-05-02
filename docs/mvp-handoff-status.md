# MVP Handoff Status

_Last updated: 2026-04-16_

This is the short handoff readout for the frozen MVP branch.

## Green locally

- `pnpm run validate:mvp:ship`
- `pnpm run validate:active`
- `pnpm run validate:deploy:active`
- `pnpm run validate:artifacts:active`
- `pnpm run validate:unused`
- `pnpm run validate:cycles`
- `pnpm run validate:repo:quality`
- `pnpm run build:netlify`
- `pnpm run build:vercel-api`

These prove the active client shell, core canvas, Fastify runtime, and deterministic asset manifest are working together on a developer machine.

Canonical demo pack:

- `docs/examples/mvp-character-archetype-demo.psg`
- `docs/examples/mvp-vehicle-family-demo.psg`
- `docs/examples/mvp-building-family-demo.psg`

Optional local sandbox demo artifact:

- `docs/examples/mvp-tree-family-sandbox-demo.psg`
- `pnpm run dev:local-sandbox`
- `pnpm run dev:local-sandbox:status`
- `pnpm run setup:local-sandbox:runtime`
- `pnpm run start:local-sandbox:runtime`
- `pnpm run validate:local-sandbox:runtime`
- `pnpm run validate:local-sandbox:smoke`
- `pnpm run validate:local-sandbox:demo`
- local sandbox generation now derives the tree batch request from the active graph, targets the pinned `flux1-schnell-fp8.safetensors` checkpoint, and can capture results back into `PSG Scene Assets`

## Intentionally frozen

- active source of truth:
  - client shell + core canvas
  - canonical Fastify runtime in `server/src/index.ts`
  - deterministic `packages/asset-browser/public/graphs/manifest.json`
  - optional local-only sandbox image generation via `/api/local-image/*`
- compatibility-only:
  - legacy Vercel `api/` deployment surface
  - tracked `packages/core/dist/**` publish-compat output

## Repo quality source of truth

- canonical general CI workflow: `.github/workflows/active-checks.yml`
- active product confidence:
  - `validate:active`
  - `validate:deploy:active`
- repo hygiene confidence:
  - `validate:unused`
  - `validate:cycles`
  - `validate:repo:quality`

`validate:unused` is intentionally scoped to the maintained production
workspaces. Root PowerShell-launched runner scripts stay under the explicit
validation/deploy commands rather than static unused-file analysis.

The older enhanced/quality-gates workflow family is intentionally retired and
should not be treated as a supported CI path.

## Non-blocking noise

- `refresh:publish-compat` is explicit and optional; it is not part of `validate:active` or `validate:deploy:active`
- an already-dirty `packages/core/dist/**` worktree does not mean the active MVP lanes are broken
- refreshing publish-compat output does not imply product behavior changed

## Deferred after MVP

- hosting convergence between Vercel and the canonical Fastify runtime
- broad repo trim and deletion passes
- full test-harness simplification beyond the active validation lane
