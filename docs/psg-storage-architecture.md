# PSG Storage Architecture

This note sets the storage boundary for PSG as the product grows beyond text-only graph fragments.

## Decision

Keep `.psg` as a portable JSON file.

Do not turn `.psg` into a binary/blob container for MVP or near-term product work.

Generated or uploaded media assets should be stored externally and referenced from PSG by stable asset metadata:

- local file path or app-local URI for local/self-hosted mode
- Supabase/blob/object storage URI for cloud mode

## Why

Prompt Spaghetti's core value is the graph and its structured intent, not a custom packed media container.

Keeping `.psg` text-first preserves:

- easy diffing and debugging
- compatibility with existing import/export flows
- copy/paste and AI-assisted generation workflows
- renderer-agnostic protocol design
- a clean boundary between document semantics and storage implementation

Packing images or video directly into `.psg` would make the format:

- harder to diff
- harder to version-control
- heavier to sync
- awkward for browser/cloud workflows
- unnecessarily opinionated before the rendering stack is stable

## Canonical Model

There are three distinct layers:

1. Flat `.psg` file

- canonical portable fragment file
- JSON-based
- graph-first
- may carry metadata
- should remain lightweight

2. PSG API document envelope

- used for API operations and richer runtime workflows
- may include:
  - fragment
  - crowd plan
  - scene assembly plan
  - asset references
- still JSON
- not required to be the same thing as the flat on-disk `.psg` file

3. External asset storage

- actual reference stills
- motion plates
- masks
- depth passes
- renderer workflow payloads

These should be referenced by id + storage URI, not embedded inline as media blobs.

## Practical Rule

For the MVP and near-term product:

- `.psg` stays basically its JSON self
- media is external
- PSG stores references, provenance, and scene placement metadata

This keeps the file format stable while letting the API and runtime grow toward richer scene assembly.

## Local vs Cloud

Local mode:

- asset refs may point to app-local paths or local URIs
- users can keep assets next to their project files if they want

Cloud mode:

- asset refs should point to stable hosted storage
- Supabase storage is a reasonable default

The important detail is that the PSG manifest should not care whether the backing store is local disk or Supabase blob storage. It should only care about:

- asset id
- semantic kind
- storage provider
- storage URI
- provenance

## What Not To Do Yet

Do not introduce a packed `.mtbl` or similar custom blob format now.

That would only make sense later if there is a strong product need for:

- offline vault-style bundling
- single-file export/import with embedded assets
- deterministic archival snapshots

If that need appears later, it should be a separate optional packaging format, not a mutation of `.psg` itself.

Possible future forms:

- `.psgpack`
- zipped project bundle
- export/archive package for offline handoff

But those should wrap PSG, not replace it.

## MVP Guidance

For MVP and near-MVP work:

- keep `.psg` simple
- keep rich media out of the file
- let the API envelope and asset registry carry future-facing richness
- use Supabase/blob storage only for cloud-backed asset refs

That gives the product room to evolve toward:

- crowd reference generation
- renderer dialect adapters
- scene assembly workflows
- small pre-rendered motion elements

without destabilizing the base file format.
