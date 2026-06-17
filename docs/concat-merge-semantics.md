# Concat & Merge semantics (locked)

> Status: **design lock + implementation plan.** The core capability already
> exists in the engine; this document makes the intended behavior canonical so
> it stops regressing between changes, and plans the gaps.

## 1. The model

Prompt Spaghetti has **two distinct ways to join text**, and they are not
interchangeable:

### Implicit concatenation — the default flow
An edge from a **content node** (Text Block, Weighted Choice, Variable) into
another content node's input **auto-concatenates**: the upstream resolved
string is **prepended** to the downstream node's own value, joined with a single
**space**. No glue node is required.

```
[Weighted Choice "Weather" → "rainy"]  →  [Text Block "alley"]      ⇒ "rainy alley"
[Weighted Choice "Condition" → "mud-covered"]  →  [Weighted Choice "Hat" → "fedora"]  ⇒ "mud-covered fedora"
```

Rules:
- **Direction:** upstream value is a **prefix** (`input + " " + ownValue`).
  (A per-node prefix/suffix toggle is a future option, not part of the lock.)
- **Default separator:** a single **space**. This is correct for the
  overwhelmingly common case (adjective + noun, clause + clause).
- **Multiple inputs into one content node** are space-joined in arrival order —
  but needing explicit ordering or a non-space join is precisely the signal to
  reach for a **Merge** instead.

This is what makes the **parts-of-speech** pattern clean: a "hat" fragment is a
region of `{Condition WC} → {Hat WC}`, giving combinatorial variety
(conditions × hats) that reads like English, with zero Merge nodes.

### Explicit Merge — fan-in
The **Merge** node (PSG type `Concat`) combines **multiple independent
branches/chains** with an explicit **join style**. It is **not** required
between every content node — reserve it for true junctions where several
complete sub-prompts converge.

Join styles (the Merge dropdown):

| Style | Output | Status |
| --- | --- | --- |
| Space | `a b c` | exists |
| Comma list | `a, b, c` | exists |
| Oxford list | `a, b, and c` | exists |
| Sentence | `A b c.` (capitalized, terminal punctuation) | exists |
| **Bullet list** | `- a`⏎`- b`⏎`- c` | **proposed** |
| **Structured JSON** | `{ "parts": ["a","b","c"] }` (shape TBD) | **proposed** |
| Separator (legacy) | custom separator string | exists, de-emphasize |

### Why the split
One input → **implicit concat** (space, no node). Several inputs converging →
**Merge** (explicit, styled). The rule is self-delineating, keeps Merge nodes
rare and meaningful, and makes graphs read as pipelines instead of a thicket of
glue nodes.

> **Authoring rule of thumb:** *Do not put a Merge between two content nodes.*
> Wire them directly (implicit concat). Use a Merge only to combine multiple
> branches or to apply a non-space join style.

## 2. Current implementation (what already exists)

This behavior is **live today** — the regression was in convention and
discoverability, not the engine.

- **Engine** — `packages/core/runtime/nodes/epic1/Epic1ExecutionEngine.ts`
  - `executeTextBlock()` (~L344): incoming inputs are space-joined and
    **prepended** to the block's value.
  - `executeWeightedChoice()` (~L376): incoming inputs are space-joined and
    prepended to the selected option.
  - `getNodeInputs()` (~L565): follows incoming edges and gathers upstream
    outputs for every node, so any content node with an input concatenates.
  - `executeOutput()` (~L539): concatenates all inputs (the terminal join).
- **Assembly** — `packages/core/runtime/assembly.ts`
  - `assemble(parts, { style })` with `style` ∈ `space` (default) | `comma` |
    `and` (Oxford) | `sentence` | `separator`; plus `normalizePrompt()` that
    fixes spacing/punctuation so the result reads naturally.
- **Merge node** — `runtime/nodes/epic1/ConcatNode.ts` + UI
  `components/epic1/nodes/ConcatNode.tsx`
  - Join-style dropdown (Space/Comma/Oxford/Sentence/legacy separator) + dedupe.
- **Connections** — `packages/core/validation.ts`
  - `validateConnection()` only blocks self-loops, duplicates, and missing
    endpoints. Content→content edges are **allowed**, so implicit concat is
    usable right now.
- **UI handles** — content nodes render a `target` input handle
  (`BaseEditableNode`), so they are pluggable.

## 3. Gaps / what regressed

1. **Undocumented & unsurfaced.** Examples lean on Merge, so users *and agents*
   reach for Merge by habit; the intended model drifted out of the codebase's
   "muscle memory."
2. **Auto-concat separator is hardcoded to space** in the node executors rather
   than routed through `assemble()`. That matches the locked model (space for
   chains; Merge for styled joins) but it's accidental, not deliberate.
3. **Missing Merge styles:** Bullet list and Structured JSON.
4. **No visual cue** distinguishing an implicit-concat edge from a Merge input;
   the content-node input handle is under-labeled.

## 4. Implementation plan

1. **Lock + document** (this file). Make it the source of truth; reference from
   `CLAUDE.md` and the user guide. Add the authoring rule of thumb.
2. **Centralize the join path.** Route content-node concatenation through
   `assemble({ style: 'space' })` so behavior is unified and future-proof.
   Behavior must stay byte-identical for existing graphs (regression test on the
   determinism suite).
3. **Add Merge styles** to `JoinStyle` + `assemble()` + the ConcatNode dropdown:
   - `bullet` → newline-prefixed `- ` items.
   - `json` → structured object (see Open decisions for shape).
4. **UX cues.**
   - Label the content-node input handle (e.g. "prefix in").
   - Optionally render implicit-concat edges with a subtle distinct style so the
     join is legible at a glance.
   - (Later) per-node separator + prefix/suffix override for advanced cases.
5. **Canonical example.** Build the **parts-of-speech** fragment
   (`{Condition WC} → {Noun WC}`, in a region, no Merge) as the reference
   demonstration. Audit existing templates (e.g. Character Archetype) and remove
   Merges that a direct chain replaces.
6. **Backward compatibility.** Implicit concat is already in the engine; existing
   Merge-based graphs are untouched. Migration is opt-in (rebuild chains without
   interstitial Merges).
7. **Docs.** Update `CLAUDE.md`, the user guide, and the examples catalog with
   the two-mode model and the rule of thumb.

## 5. Open decisions (need product input)

- **Structured JSON shape.** `{ "parts": [...] }`, or labeled keys derived from
  node names (`{ "hat": "...", "shirt": "..." }`), or both via a sub-option?
- **Separator policy.** Keep "space-only for implicit chains, Merge for
  everything else" (recommended — keeps the two modes clean), or expose a
  per-node separator override on content nodes?
- **Prefix vs suffix.** Default **prefix** (locked); ship the suffix toggle now
  or defer?

## 6. Related work
- Backdrop convention: characters/extraction docs should default to a neutral
  light-gray studio backdrop (not greenscreen) for clean matting — see the
  characters fragments and scene composition.
- Card Normalization / scene composition consume assembled prompts downstream.
