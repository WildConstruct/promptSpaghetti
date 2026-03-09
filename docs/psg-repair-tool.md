# PSG Repair Tool

## Purpose

`pnpm psg:repair` scans fragment-style `.psg` files and deterministically rewrites safe cases toward the weekend MVP PSG contract.

Canonical contract references:

- `docs/psg-weekend-mvp-contract.md`
- `docs/examples/psg-weekend-mvp-canonical-example.psg`

## Usage

Dry-run a directory:

```bash
pnpm psg:repair --dry-run --path assets/library
```

Rewrite safe files in place:

```bash
pnpm psg:repair --write --path assets/library
```

Target a single file:

```bash
pnpm psg:repair --dry-run --path assets/library/facial-features/age-indicators.psg
```

If `--path` is omitted, the tool defaults to `assets/library`.

## Report statuses

For each file, the tool reports one of:

- `canonical`
- `rewritten`
- `skipped`
- `unsafe`

### Meaning

- `canonical`
  - already matches the current repair rules
  - no rewrite needed
- `rewritten`
  - safely normalized toward the weekend MVP contract
  - dry-run reports the changes
  - write mode rewrites the file in place
- `skipped`
  - looks like a non-fragment/editor-project PSG shape
  - intentionally left alone
- `unsafe`
  - contains ambiguity or unsupported structure
  - reported for manual follow-up instead of auto-rewritten

## What it rewrites

Current deterministic rewrites include:

- ensure top-level `version`
- ensure top-level `name` using fallback from `metadata.name` or `metadata.title`
- ensure `edges` defaults to `[]`
- normalize `groups` to `regions`
- normalize singular `region` to `regions`
- canonicalize source node types to PascalCase source types
- normalize node coordinates to top-level `x` / `y`
- hoist `WeightedChoice` options from `data.options` or compatible `data.value`
- hoist `TextBlock` text to top-level `value`
- normalize `Output` payloads to top-level `template`
- normalize `Concat` payloads to top-level `value`
- remove obvious editor-only node fields where safe
- normalize generic stale edge handles like `output` / `input`
- preserve deterministic `Concat` handles as `input1` / `input2`
- preserve weighted branch handles like `branch-N`
- normalize legacy region examples to the semantic `regions` shape
- normalize missing region ids and names

## What it refuses to rewrite

The first version intentionally refuses cases like:

- invalid JSON
- missing `nodes` array
- missing top-level `name` with no safe fallback
- unknown node types
- source files that already contain editor wrapper nodes such as `enhancedBoundingBox` or `fragmentContainer`
- conflicting node payloads where two candidate source-of-truth values disagree
- unsupported or ambiguous edge handles
- `Concat` targets with more than two incoming edges

## Safety rules

The tool is deterministic and does not:

- call a model
- invent creative prompt content
- split or merge fragments
- repair semantic prompt quality
- restructure graphs beyond obvious shape normalization

If a transform is not obviously safe, the tool reports the file as `unsafe` instead of rewriting it.
