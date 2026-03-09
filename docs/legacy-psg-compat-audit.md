# Legacy PSG Compatibility Audit

This note tracks the remaining active reliance on the legacy graph-wrapper PSG codec after the flat PSG source contract became the MVP default.

## Current truth

The active MVP PSG source contract is the flat document shape described in:
- `docs/psg-weekend-mvp-contract.md`
- `docs/examples/psg-weekend-mvp-canonical-example.psg`

The legacy graph-wrapper codec still exists in:
- `packages/core/utils/psgCodec.ts`

That codec is compatibility infrastructure for older `kind: "graph"` documents. It is no longer the primary authoring format.

## Active compatibility branches still in use

### 1. Editor PSG load utility
File:
- `client/src/Epic1Editor/utils/psgDocument.ts`

Status:
- intentional compatibility boundary
- flat PSG is attempted first via `parsePSG()`
- legacy graph-wrapper fallback still exists via `readPsg()`

Recommendation:
- keep for now
- this is the right single place for legacy PSG parsing in the editor surface

### 2. Local editor open flow
File:
- `client/src/Epic1Editor/hooks/useFileOperations.ts`

Status:
- cleaned up
- no longer translates legacy graph-wrapper documents inline
- now uses `loadReactFlowFromAnyPsgContent()` so the compatibility branch stays behind `psgDocument.ts`

Recommendation:
- no further action needed beyond keeping this path thin

### 3. Supabase/local file open hook
File:
- `client/src/Epic1Editor/hooks/useSupabaseFileOperations.ts`

Status:
- still performs a light legacy-shape check before routing PSG text to `loadReactFlowFromPsgContent()`
- does not reimplement legacy graph translation itself

Recommendation:
- acceptable for now
- later, replace the `kind === "graph"` sniff with a shared document-shape helper if this path keeps evolving

### 4. Asset-browser open dialog
File:
- `packages/asset-browser/src/components/OpenGraphDialog.tsx`

Status:
- still falls back from flat PSG parsing to `readPsg()`
- returns raw parsed graph payloads rather than ReactFlow nodes/edges

Recommendation:
- keep for now as compatibility-only
- if the asset-browser product surface narrows further, this can eventually stop accepting the legacy wrapper shape

### 5. Core public surface
File:
- `packages/core/public.ts`

Status:
- still exports `readPsg`, `writePsg`, and `fromLegacyGraph`
- comments already mark them as legacy graph-wrapper codec exports

Recommendation:
- keep exported for compatibility
- do not promote them in docs or new code
- eventually move behind an explicitly named legacy export surface if package build/export cleanup happens

## Surfaces that are already aligned to flat PSG

### Editor save/export
Files:
- `client/src/Epic1Editor/hooks/useFileOperations.ts`
- `client/src/Epic1Editor/hooks/useSupabaseFileOperations.ts`
- `packages/core/fileFormats/psg.ts`

Status:
- flat PSG is the active save/export format

### Asset-browser save path
File:
- `packages/asset-browser/src/components/SaveGraphDialog.tsx`

Status:
- graph-shaped payloads now save as flat PSG instead of raw JSON pretending to be PSG

## Compatibility branches that should stay for now

Keep:
- `psgDocument.ts` legacy fallback
- `OpenGraphDialog.tsx` legacy fallback
- `packages/core/utils/psgCodec.ts`
- `packages/core/public.ts` legacy exports

Reason:
- they provide a controlled migration path for older saved files and older graph-wrapper fixtures

## Compatibility branches that should not spread further

Do not add new active code that:
- writes `kind: "graph"` PSG files as the default format
- stores editor-only wrapper nodes into source PSG
- imports `readPsg()` into new editor save/export flows unless the code is explicitly compatibility-only

## Next removal candidates

These are the first branches to revisit once the repaired asset corpus and representative saved files are confirmed flat-PSG-only:

1. `packages/asset-browser/src/components/OpenGraphDialog.tsx`
   - remove legacy fallback if the asset-browser no longer needs to open graph-wrapper payloads

2. `client/src/Epic1Editor/hooks/useSupabaseFileOperations.ts`
   - replace inline `kind === "graph"` detection with a shared shape helper, or remove it if no longer needed

3. `packages/core/public.ts`
   - move legacy codec exports behind a more explicit compatibility namespace if the package surface is cleaned up

## Decision rule

The legacy codec should stay until at least one of these is true:
- the repaired asset corpus is fully classified and representative files are flat PSG
- the editor no longer needs to open historical graph-wrapper files
- there is a documented migration step for old graph-wrapper documents

Until then:
- keep legacy support narrow
- keep it behind named compatibility boundaries
- do not let it define the authored source contract
