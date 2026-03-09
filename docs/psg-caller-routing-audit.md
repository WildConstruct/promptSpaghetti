# PSG caller routing audit

This is a **doc-only** caller audit for the next boundary split.

Focus:

- `packages/core/fileFormats/psg.ts`
- `packages/core/runtime/presetInsertion.ts`
- `packages/core/fileFormats/psgRepair.ts`

Goal:

- identify which callers should remain on compatibility wrappers
- identify which callers should move to library-only helpers later

## Routing rule

- use **compatibility wrappers** when the caller intentionally accepts old or unknown PSG shapes
- use **library-only helpers** when the caller is consuming repaired repo assets or already-supported PSG/graph shapes

## `packages/core/fileFormats/psg.ts`

### Callers that should stay compatibility-backed

- `parsePsgWithCompatibility(...)`
- transitional `parsePSG(...)` alias while migration is still active

Reason:

- these surfaces exist specifically to normalize legacy flat-PSG shape before canonical parsing

### Callers that should move or remain library-only

- `parseCanonicalPsg(...)`
  - canonical/library-safe path only
- `convertPSGToPSGLib(...)`
  - should eventually assume compatibility repair already happened upstream
  - should later rely on library-only edge normalization

### Practical routing for downstream callers

- unknown or historical PSG intake should enter through `parsePsgWithCompatibility(...)`
- repaired library assets and strict canonical tests should enter through `parseCanonicalPsg(...)`
- PSG-to-PSGLib conversion should remain downstream of that choice, not make the compatibility decision itself

## `packages/core/runtime/presetInsertion.ts`

### Callers that should stay compatibility-backed later

- `parseCompatiblePsgPreset(...)`

Reason:

- this is the explicit compatibility intake path for PSG fragments that may still need legacy flat-PSG repair

### Callers that should move or remain library-only later

- `parseCanonicalOrLibraryPsgPreset(...)`
  - should stay on canonical/library-safe parsing
- `insertPreset(...)`
  - should eventually split into library-first vs compatibility-backed entrypoints instead of hiding the choice internally
- known asset-library insertion flows
  - should prefer canonical/library-safe parsing and library-only edge normalization

### Current boundary observation

`presetInsertion.ts` already has the beginnings of the caller split:

- canonical/library path:
  - `parseCanonicalOrLibraryPsgPreset(...)`
- compatibility path:
  - `parseCompatiblePsgPreset(...)`

The later cleanup step is to make downstream normalization follow the same split rather than sharing mixed helpers by default.

## `packages/core/fileFormats/psgRepair.ts`

### Callers that should stay compatibility-backed

- `repairPsgContent(...)` and its internal normalization flow

Reason:

- the repair tool is intentionally a compatibility-oriented path
- it exists to accept older flat PSG and normalize it into a safer library/canonical shape

### Callers that should not move to library-only first

- any normalization inside repair that depends on old field promotion, metadata fallback, or legacy region/group repair

Reason:

- moving repair tooling to library-only helpers too early would defeat the point of the repair pass

## Recommended later routing by caller class

### Keep on compatibility wrappers

- legacy flat-PSG parse wrappers
- unknown user-provided PSG import paths
- repair tooling
- transitional alias surfaces kept only for migration safety

### Move to library-only helpers

- repaired repo asset ingestion
- known asset-browser/library insert flows
- PSG-to-PSGLib conversion after parser choice is already made
- strict canonical tests and roundtrip tests

## Bottom line

The caller split later should be:

- **compatibility stays at intake and repair boundaries**
- **library-only helpers take over once content is already known to be repaired or supported**

Concretely:

- `psg.ts` should keep both parser entrypoints, but conversion should become library-only
- `presetInsertion.ts` should make its existing canonical-vs-compatible parse split visible in downstream normalization behavior
- `psgRepair.ts` should remain explicitly compatibility-backed
