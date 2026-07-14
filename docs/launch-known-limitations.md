# Prompt Spaghetti — Known Limitations (launch)

_Last verified against code: 2026-07-14_

Honest framing for the Lab launch, per the "First Two Signals" strategy and the Artist's Compact
(show the seams; don't oversell). This reflects the **actual** state of the code, not aspirations.
Keep it current — an out-of-date limitations note is worse than none.

Tracked follow-ups: [`docs/audit-work-loop.md`](./audit-work-loop.md).

## What it does well
- **Deterministic generation.** Same graph + same seed → identical output, every time
  (`Epic1ExecutionEngine`, per-node seeded PRNG). Good for reproducible variation sets.
- **Bounded variation.** `WeightedChoice` picks one option by weight; `Concat`/Merge assembles
  fragments. "Branching" is constrained variation within an envelope, not arbitrary control flow.
  Options can be locked (fixed DNA) and per-option `branch-*` handles support nested variation.
- **Natural-language assembly.** Merge nodes can join fragments as prose (space / comma / Oxford
  list / sentence), with article-aware helpers, punctuation/whitespace normalization, and graceful
  handling of empty fragments — so output reads as a sentence, not a tag list. (Opt-in per node;
  editable on the Merge node — see below.)
- **Teaching surface.** Explore document browser, tutorial ladder, and example pack help first-run
  learning without claiming a full production suite.

## Current limitations
- **Prose join defaults for new Merge nodes (B5).** New Merge nodes are created with
  `joinStyle: 'sentence'`. Graphs that never stored `joinStyle` still space-join at runtime
  (legacy), so older demos keep their meaning. Authors can still pick space/comma/and/legacy
  separator on the Merge card.
- **Template/slot node is available (B2).** Palette **Template** node fills a sentence skeleton
  via `slot-{name}` handles and `fillTemplate`. Prose join on Merge remains opt-in (separate control).
- **Preview Copy All supports output templates (B3).** Choose **Plain seed list** or **3-up image
  prompt** in the preview tray; incomplete triples are skipped for 3-up (needs ≥3 seeds).
- **`Include` is format-only (B4 decision).** Fragments are first-class at **authoring** time
  (Library, Explore, region save). `Epic1ExecutionEngine` does not expand Include at runtime.
  Schema may still accept the type for forward-compat; see `docs/include-node-decision.md`.
  Executable types: TextBlock, WeightedChoice, Concat, Variable, Template, Output.
- **Generation is local and deterministic only.** No LLM "naturalize" pass in the core loop —
  preview output is assembled text. Optional cloud LLM helpers exist for authoring (authenticated);
  local image sandbox is a separate optional lane, not the core product loop.
- **Single canonical execution path.** Preview and export both run the **client-side**
  `Epic1ExecutionEngine` on the same React Flow graph, so what you preview is what you ship.
  There is no mounted Fastify `POST /preview` and no `packages/cli` package in this repo.
- **Two file representations still diverge.** Editor export / React Flow graph JSON and the
  documented PSG `inputs[]` shape differ on edges/handles and the variable model
  (`Variable` vs historical Set/Get). Until reconciled, treat round-tripping carefully and prefer
  the paths the editor actually saves/loads.
- **Advanced node tier removed from source (C1 P1).** Conditional / Sequential / Markov /
  WeightedAdvanced implementations are gone; algorithms live in
  `docs/parked-implementations/README.md`. Weighted distributions remain on live WeightedChoice.
- **Cloud isolation is not fully verified in-repo.** App routes enforce auth/capability/quota;
  Supabase RLS/storage for tenant isolation remains an external verification gate
  (`docs/security-posture-pre-beta.md`).
- **Test suite is partially red.** Some legacy component/node suites assert against drifted APIs.
  Prefer `pnpm typecheck` and active validation lanes (`validate:active` when used) as ship signals.

## Not in scope for this launch
- Full billing (Stripe checkout / webhooks) as a finished product surface.
- Multi-user real-time collaboration.
- Server-side or batched generation at scale as the primary path.
- Arbitrary scripting / Turing-complete graph logic (deliberately — see the Compact on avoiding the
  "circuit diagram").
