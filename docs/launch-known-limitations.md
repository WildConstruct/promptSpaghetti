# Prompt Spaghetti — Known Limitations (launch)

Honest framing for the Lab launch, per the "First Two Signals" strategy and the Artist's Compact
(show the seams; don't oversell). This reflects the **actual** state of the code as of the
codebase-review pass, not aspirations. Keep it current — an out-of-date limitations note is worse
than none.

## What it does well
- **Deterministic generation.** Same graph + same seed → identical output, every time
  (`Epic1ExecutionEngine`, per-node seeded PRNG). Good for reproducible variation sets.
- **Bounded variation.** `WeightedChoice` picks one option by weight; `Concat`/Merge assembles
  fragments. "Branching" is constrained variation within an envelope, not arbitrary control flow.
- **Natural-language assembly.** Merge nodes can join fragments as prose (space / comma / Oxford
  list / sentence), with article-aware helpers, punctuation/whitespace normalization, and graceful
  handling of empty fragments — so output reads as a sentence, not a tag list. (Opt-in per node;
  see below.)

## Current limitations
- **Prose join is opt-in, not the default.** A Merge node still space-joins by default; the
  natural-language styles (`joinStyle: 'sentence' | 'and' | 'comma'`) and `dedupe` are set per node.
  There is not yet an inspector control to toggle them from the UI — they apply when present in the
  saved graph data.
- **No Template/slot node in the UI yet.** The slot-fill engine exists and is tested
  (`fillTemplate`, the chosen primary natural-language mechanism), but the editor node + inspector
  for authoring a `"a {age} {profession}"` skeleton is not wired into the canvas.
- **`Include` / fragment composition is not executed by the canonical engine.** Fragments are a
  first-class concept in the file format and meant to grow, but the runtime engine
  (`Epic1ExecutionEngine`) handles TextBlock / WeightedChoice / Concat / Variable / Output only.
  Referencing a saved fragment by name does not yet expand it at execution time.
- **Generation is local and deterministic only.** No LLM "naturalize" pass, no image generation in
  the core loop — output is the assembled text. (An optional, off-by-default naturalize pass is
  contemplated, not built.)
- **Single canonical execution path.** Preview and export both run the client-side engine on the
  same ReactFlow graph, so what you preview is what you ship. The older server `/preview` engine and
  the `@promptscape/cli` package are **legacy/unused** and should not be relied on; they accept a
  different (lossy) format and are not on the supported path.
- **Two file representations exist.** Export currently emits the ReactFlow-graph JSON; the documented
  PSG `inputs[]` format diverges from it (edges/handles, variable model). Until reconciled, treat the
  exported graph JSON as the source of truth for round-tripping.
- **Retired node tier.** The Epic 7 "advanced" nodes (WeightedAdvanced / Conditional / Sequential /
  Markov) and the Epic 8 PythonTransform node were never executable and have been removed from the
  schema surface. Graphs referencing them will be rejected by validation.
- **Test suite is partially red.** ~91% of unit tests pass; some legacy component/node suites assert
  against drifted internal APIs and are stale. `pnpm typecheck` is the reliable green signal.

## Not in scope for this launch
- Cloud accounts, billing, multi-user sharing beyond simple file export/import.
- Server-side or batched generation at scale.
- Arbitrary scripting / Turing-complete graph logic (deliberately — see the Compact on avoiding the
  "circuit diagram").
