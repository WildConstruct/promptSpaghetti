# April 2 Phase 2 Gate Criteria

_Status: Canonical / Governs Decision_  
_Date: 2026-03-16_

## Decision Question

Should the ArtCraft validation spike advance into Phase 2 implementation
planning as the leading expression-layer candidate for Prompt Spaghetti?

This document does not change mainline scope. It only governs the April 2,
2026 decision on the spike outcome.

## Required Inputs

The decision meeting should not happen without:

- a short demo of the current Prompt Spaghetti graph-plus-preview path
- a short demo of the ArtCraft spike path
- tester notes from internal dogfood
- tester notes from external pre-viz users
- an estimate of integration burden and architecture risk

## Hard Gates

ArtCraft does not advance unless all of the following are true:

1. **Comprehension uplift is clear**
   - testers understand the graph-backed workflow faster in the ArtCraft path
     than in the graph-plus-preview-only path
   - at least a majority of testers can explain the system back in terms of
     reusable structure, not only “AI populated the scene”

2. **The graph remains the product center**
   - Prompt Spaghetti graph, reconciliation, review, and provenance logic still
     act as the source of truth
   - no meaningful core-contract distortion was required to make the spike work

3. **Integration burden is containable**
   - the adapter work remains narrow
   - the path to a maintained Phase 2 integration looks realistic without
     starving Track A

4. **Signal is about our value, not just novelty**
   - user enthusiasm is tied to understanding and using the intelligence layer
   - feedback is not dominated by generic excitement about a 3D canvas

## Scoring Rubric

Use a simple `pass / needs work / fail` rating for each category:

- user comprehension uplift
- workflow relevance to pre-viz and set dressing
- architecture fit
- maintenance burden
- strategic fit with Prompt Spaghetti positioning

Recommended interpretation:

- `5 pass` -> proceed to Phase 2 planning
- `4 pass + 1 needs work` -> proceed only with explicit mitigation plan
- `3 pass or fewer` -> remain in R&D and keep mainline direction unchanged

## Questions To Answer In The Decision Memo

- Do users understand what the graph is doing more clearly in the ArtCraft path?
- Do they see it as a better expression layer for the same core loop, or as a
  different product entirely?
- What new technical burden appears if ArtCraft becomes a Phase 2 candidate?
- Does the spike strengthen the props-first wedge specifically?
- What would we stop or delay on Track A if we promoted this path?

## Explicit Non-Decision

Passing this gate does **not** mean:

- Prompt Spaghetti is pivoting immediately
- ArtCraft becomes the product source of truth
- a full scene-editor roadmap is approved

Passing this gate means only:

- ArtCraft enters Phase 2 implementation planning as the leading
  expression-layer candidate for further architecture review and validation
