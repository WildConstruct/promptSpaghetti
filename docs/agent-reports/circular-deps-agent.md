# Circular Dependency Agent Report

## Scope

Batch 1 / Agent 4 focused on import graph risk in `client/src`, `packages/core`,
and `packages/asset-browser/src`, with extra attention to browser bundle loading
and the prior React vendor / asset-browser chunk failure.

## Findings

- `madge` found no direct source-level circular dependencies in the maintained
  source surfaces.
- `node scripts/validation/runCyclesValidation.mjs` also reports no maintained
  source cycles.
- The higher-risk issue was not a direct TypeScript import cycle. It was a
  chunk/load boundary smell: browser-facing code imported the bare
  `@promptscape/core` entry for leaf helpers. In this repo, Vite aliases that
  bare entry to the source package root, which can pull the broad core barrel,
  Epic 1 UI, and asset-browser bridge code into chunks that only need PSG or
  prompt segmentation helpers.
- `packages/asset-browser` also needed a declared core subpath export for
  `@promptscape/core/fileFormats/*` so it can consume file-format helpers
  without falling back to the broad bare entry.

## Changes Implemented

- Replaced bare `@promptscape/core` imports in browser-facing leaf consumers:
  - `client/src/lib/simplePromptParser.ts`
  - `client/src/Epic1Editor/utils/psgDocument.ts`
  - `packages/asset-browser/src/components/OpenGraphDialog.tsx`
  - `packages/asset-browser/src/components/SaveGraphDialog.tsx`
- Added the `@promptscape/core/fileFormats/*` package export in
  `packages/core/package.json`.
- Normalized Vite manual chunk module IDs before classification in:
  - `client/vite.config.ts`
  - `client/vite.config.js`

## Validation

- `.\node_modules\.bin\madge.CMD --circular --extensions ts,tsx --ts-config tsconfig.json client/src packages/core packages/asset-browser/src`
  - Passed: no circular dependency found.
- `node scripts/validation/runCyclesValidation.mjs`
  - Passed: no maintained source cycles detected.
- `npm.cmd run typecheck` from `packages/asset-browser`
  - Passed.
- `npm.cmd run build` from `client`
  - Passed in the repo's safe production build mode.
- `npm.cmd run build-dev` from `client`
  - Blocked in sandbox by esbuild `spawn EPERM`; escalated retry approval timed
    out twice.
- `..\node_modules\.bin\tsc.CMD -p tsconfig.json --noEmit` from `client`
  - Failed on pre-existing unrelated type errors across admin/theme,
    performance dashboard, deleted/missing Epic 1 modules, local sandbox width
    and height contracts, and missing optional dependency types.

## Recommendations

- Keep browser code off the bare `@promptscape/core` entry unless it truly needs
  the full public API. Prefer exported leaf subpaths for PSG, utils, runtime
  prompt segmentation, and local service contracts.
- Keep `@promptscape/core` package exports aligned with actual supported
  browser-facing subpaths. Missing exports encourage broad imports and make
  package consumers harder to typecheck.
- Once the sandbox permits it, rerun the non-safe Vite build to confirm manual
  chunks with `BUILD_SAFE` disabled. That is the closest validation for the
  original asset-browser chunk-load failure.
