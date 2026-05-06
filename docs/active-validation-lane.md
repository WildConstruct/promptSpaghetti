# Active Validation Lane

_Last updated: 2026-04-13_

This note defines the canonical local validation lane for the active MVP
surface.

It exists because the older root `validate:active` script depended on nested
`pnpm` calls that were not reliable on Windows/Corepack shells.

The current entrypoint uses a small PowerShell launcher to locate Node
reliably on Windows, then hands off to the Node-based validation runner that
executes the ordered phases.

## Canonical Commands

- `pnpm run validate:active`
- `pnpm run validate:active:server-smoke`
- `pnpm run validate:active:client-smoke`
- `pnpm run validate:demo:flows`
- `pnpm run validate:mvp:ship`
- `pnpm run validate:local-sandbox:runtime`
- `pnpm run validate:local-sandbox:smoke`
- `pnpm run validate:local-sandbox:demo`
- `pnpm run validate:artifacts:active`
- `pnpm run refresh:publish-compat`

## Ordered Active Lane

The full local validation lane runs these phases in order:

1. `typecheck:active`
2. `client build`
3. `server build`
4. focused server runtime smoke
5. focused client MVP surface smoke
6. generated artifact hygiene check

Use `validate:mvp:ship` when you want the narrow teammate-facing ship subset on top of this lane. It adds the focused demo-flow wrapper and deploy packaging checks without widening into broad Jest, integration, or E2E coverage.

## What This Lane Covers

- active TypeScript contract check via [tsconfig.active.json](../tsconfig.active.json)
- canonical client build via [client/package.json](../client/package.json)
- canonical server build via [server/package.json](../server/package.json)
- route catalog, LLM, and PSG runtime smoke in `server`
- launch, editor surface policy, Comfy export, crowd expansion, and button-path smoke in `client`
- route access denial behavior for authenticated cloud routes in `server`
- generated artifact policy enforcement via [generated-artifact-policy.md](generated-artifact-policy.md)

## Generated Artifact Truth

- `packages/asset-browser/public/graphs/manifest.json` is active runtime-generated input and is expected to stay deterministic.
- `packages/core/dist/**` is publish-compat output, not the source of truth for local MVP validation.
- `refresh:publish-compat` is the explicit compatibility-output workflow and is not part of `validate:active`.

## Intentional Non-Goals

This lane is intentionally narrower than full-repo confidence.

It does not claim:

- full legacy Jest coverage
- integration or E2E coverage
- deploy packaging convergence
- Vercel/Fastify hosting alignment

`validate:local-sandbox:runtime`, `validate:local-sandbox:smoke`, and
`validate:local-sandbox:demo` are optional companion lanes for the local-only
image-generation demo path. They stay outside `validate:active` because local
Comfy/runtime availability is not part of the hosted MVP claim.

Those remain follow-on work after the active local lane is stable.
