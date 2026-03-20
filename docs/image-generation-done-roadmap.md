**Image Generation Done Roadmap**
**Date:** 16 March 2026
**Status:** Canonical for the generation track

This is the shortest path from the current mocked preview stack to a props-first image generation workflow that is actually usable.

**Current Truth**
- Analyze, review, draft, refine, preview, and scene-comprehension flows exist.
- Preview contracts and UI are real.
- Segmentation now has a real async provider seam and a Replicate adapter path, with fallback preserved.
- Preview/generation still needs one live backend path to become meaningfully usable.
- The main gap is not product structure. The main gap is replacing mock output with real image generation quality.

**Definition Of Done**
Image generation is "done enough for beta" when all of the following are true:

1. One real image backend returns actual images through the PSG preview path.
2. The returned images visibly reflect reviewed graph state:
   - locked traits
   - variable traits
   - preferred comparable refs
   - force synthesis keys
   - review notes
3. Promotion and refinement cause a visible directional change in the next preview run.
4. The props/set-dressing wedge works reliably across a small fixed test pack of scenarios.

**Execution Order**

1. **Real Backend Adapter**
- Keep the existing `/api/psg/images/preview` contract.
- Replace one preview provider implementation with a real vendor adapter.
- Do not change the review or graph contracts to fit the vendor.
- The vendor adapter must live behind the provider seam, not inline in `PsgService`.

2. **Prompt Mapping**
- Map reviewed bootstrap state into vendor prompt inputs.
- Minimum mapping:
  - locked trait keys
  - variable trait keys
  - preferred comparable labels
  - force synthesis keys
  - notes
- The prompt blueprint produced by PSG remains the canonical debug artifact.

3. **UI Validation**
- Real backend must work from:
  - bootstrap dialog preview
  - selected-bootstrap panel preview
  - scene preview surface
- No new UI surfaces are required before this is working.

4. **Refinement Validation**
- Promote a preview result.
- Re-run preview.
- Confirm the next result shifts in the intended direction.
- If this is not visible, the prompt mapping is not done.

5. **Props-First Hardening**
- Use a fixed scenario pack of 3-5 prop/set-dressing cases.
- Measure:
  - latency
  - failure rate
  - directional controllability
  - “fits the same world” consistency
- Crowds are explicitly out of scope until props are reliable.

**Non-Goals Until The Above Is Done**
- More scene-preview polish
- More cross-panel affordances
- PSD/export work
- Crowd hero workflow
- ArtCraft/R3F expression-layer decisions

**Immediate Next Implementation Step**
- Wire one real backend into the preview provider seam.
- Start with preview, not batch generation.
- Once preview quality is acceptable, extend the same provider path into `generate-batch`.
- Keep segmentation scoped to subject/region boxes for props-first cases while preview quality is hardened.
