# Weak Types Agent Report

Batch 2 / Agent 5: weak type removal and strong typing.

## Scope

Scanned active TypeScript source in:

- `client/src`
- `packages/core`
- `packages/asset-browser`
- `server/src`

Primary query:

```sh
rg "\bany\b|unknown|as any|Record<string, unknown>|z\.any" client/src packages/core packages/asset-browser server/src
```

The repo is already heavily dirty and multiple agents are editing nearby files. I only changed high-confidence locations and did not revert or delete user/agent-owned work.

## Assessment

The largest weak-type risk is not a single `any`; it is a mix of old runtime/parser surfaces, React Flow node data, and external JSON boundaries. The right cleanup strategy is therefore selective:

- Replace `any` where the package contract already proves a shape.
- Keep `unknown` at JSON, parser, HTTP, Supabase, and localStorage boundaries until validated.
- Avoid broad runtime refactors in corrupted or legacy files during this batch.

## Implemented

### Asset browser active source

- Replaced context user `any` with `AssetBrowserUser | null` in `packages/asset-browser/src/providers/UserProvider.tsx`.
- Replaced resize hook callback and vendor CSS casts with typed tuple args and a `MsUserSelectStyle` helper in `packages/asset-browser/src/hooks/useSectionResize.ts`.
- Replaced `z.any()`, parser `any`, and format detection casts with `unknown` plus an `isRecord` guard in `packages/asset-browser/src/services/FragmentValidator.ts`.
- Replaced preset metadata casts with the existing `Preset` contract in:
  - `packages/asset-browser/src/components/EnhancedPresetCard.tsx`
  - `packages/asset-browser/src/components/EnhancedPresetGrid.tsx`
  - `packages/asset-browser/src/stores/assetBrowserStore.ts`
- Replaced graph-save `any[]` casts with `SaveableGraphNode`, `SaveableGraphEdge`, and item-level guards in `packages/asset-browser/src/components/SaveGraphDialog.tsx`.
- Replaced Pro browser graph preview `any` casts with local graph-node guards and accessors in `packages/asset-browser/src/components/ProAssetBrowser.tsx`.

### Core active source

- Replaced `z.ZodSchema<any>` and validator data `any` with `z.ZodTypeAny` plus `unknown` input/output in `packages/core/nodeSchemas.ts`.
- Replaced graph store annotation metadata and React Flow node-data casts with typed helpers in `packages/core/graphStore.ts`.
- Replaced replacement-action node/edge arrays, option casts, and asset casts with React Flow `Node`/`Edge` generics and typed node data in `packages/core/hooks/useReplacementActions.ts`.
- Relaxed `AssetSummary.id` to optional in `packages/core/services/assetTypeMapping.ts` because the mapper only consumes `name`/`metadata`.
- Replaced persisted-state `z.any()` arrays with `z.unknown()` in `packages/core/utils/persistenceUtils.ts`.
- Replaced advanced-node `custom` schema `z.any()` with `z.unknown()` in `packages/core/graphSchema.ts`.

## Intentional Boundaries

These `unknown` usages should remain unless a nearby validator narrows them:

- JSON parsing and open/save graph payloads.
- Fragment and manifest parsing.
- HTTP response helpers and route request bodies.
- Supabase metadata and external service payloads.
- LocalStorage deserialization.
- Generic cache and worker payloads.

## Deferred Hotspots

High-value future cleanup, intentionally not done here:

- `packages/core/fileFormats/psg.ts` and `psglib.ts`: many weak types remain, but they sit on legacy/compat parser boundaries and should be handled with a dedicated parser-contract pass.
- `packages/core/runtime/nodes/Sequential.ts` and `Markov.ts`: these files appear syntactically corrupted in the current checkout, so strong typing them would become a runtime rewrite.
- `packages/core/runtime/nodes/epic1/*`: variable and inline editable nodes intentionally carry arbitrary user values; they need a shared `JsonValue` or graph value union before removing `any`.
- `server/src` request/service boundaries: most remaining `unknown` is appropriate for request bodies, external APIs, or parser inputs. Replace only after route schemas prove the shape.
- Tests and mocks still use `any` for Jest globals, React Flow mocks, and negative parser cases. That is lower risk than active source.

## Validation

Passed:

```sh
& 'C:\Program Files\nodejs\npx.cmd' tsc --noEmit -p tsconfig.active.json
& 'C:\Program Files\nodejs\npx.cmd' tsc -p packages\asset-browser\tsconfig.json --noEmit
& 'C:\Program Files\nodejs\npx.cmd' jest -c jest.config.cjs --runInBand --runTestsByPath src\services\__tests__\FragmentValidator.test.ts
```

Notes:

- `pnpm.cmd` was not available in this shell.
- `npx.ps1` is blocked by PowerShell execution policy, so validation used `C:\Program Files\nodejs\npx.cmd`.
- Full asset-browser Jest initially failed with `spawn EPERM`; rerunning with `--runInBand` executed but reported pre-existing UI expectation failures around labels/fixtures. The touched validator suite passed.
