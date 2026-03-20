**Prompt Spaghetti Development Report**  
**Compiled from full conversation + developer feedback (March 2026)**  
**For: Development Agent**  
**Date: 16 March 2026**  
**Purpose:** Execution-aligned plan that matches what actually exists in the repo today.

### 1. Executive Summary & Core Product Vision
Prompt Spaghetti is **not** another prompt blob, general image generator, or compositor.  
It is the **upstream structured creative control layer** for visual generation:
- users build editable **graphs** of reusable fragments, weighted choices, style controls, and scene scaffolds
- the system converts messy references into reusable structure instead of throwing them away after one generation
- the long-term value is controllable variation, reuse, provenance, and world consistency

The key feature under active construction is the **Image-Bootstrap Workflow**:
1. user attaches one or more reference images
2. system analyzes them with segmentation, multimodal interpretation, retrieval, and scoring
3. system pauses at a human review checkpoint
4. system drafts an editable weighted-choice graph
5. that graph becomes the durable reusable asset

That graph, not the first generated image, is the core product output.

**Strategic positioning:**
- upstream of Photoshop, Midjourney, Runway, Kling, ComfyUI, and similar tools
- not a Photoshop replacement
- not a black-box generation app
- moat = provenance-aware graphs + reusable library inventory + retrieval plus synthesis + human-reviewed structure

**Phase framing:**
- Beta truth: reference image -> reviewed graph -> reusable library signal -> lightweight preview path
- Post-beta expansion: managed generation vendors, PSD export, background-plate nodes, richer scene assembly

### 2. Beta Truth vs. Expansion
The product needs a cleaner separation between what is real now, what is near-term, and what is aspirational.

**Beta truth**
- any-image bootstrap for props, people, set dressing, and related references
- segmentation + multimodal analysis + reconciliation + confidence
- one structured human review checkpoint before graph drafting
- editable weighted-choice graph insertion and refinement inside the editor
- reusable provenance and retrieval signals saved back into the library/scene manifest
- **one lightweight preview generation backend** (abstract interface required so users can immediately see what the graph produces)

**Near-term expansion**
- batch generation of comparable variants from a reviewed graph
- vendor-backed preview generation with credits
- stronger comparable retrieval and ranking from the browser/library
- downstream export conveniences for Photoshop or other tools

**Later expansion**
- PSD smart-object exports
- background-plate and perspective-aware nodes
- viewpoint-aware / LOD scene branches
- richer scene assembly and video-conditioning workflows

This separation matters because the beta can be monetizable without pretending the full previs stack already exists.

### 3. Priority Use Cases
Ordered by a mix of technical tractability and commercial clarity.

1. **Props / Set Dressing**
   - easiest path to reliable segmentation and comparable variation
   - strongest near-term demo because “upload one prop ref, get multiple usable world-consistent variants” is easy to understand
   - best first commercial wedge for art departments and concept artists

2. **Crowds / Extras**
   - stronger marketing story than props
   - technically harder than props, but still credible as a beta if scope stays to small groups and “comparable extras” rather than full crowd simulation
   - especially strong when framed as “same event, same world, different individuals”

3. **Set Elements / Environment Anchors**
   - references become reusable world-style anchors and scaffold set dressing
   - useful, but should follow after prop and crowd bootstrap are stable

### 4. Product Differentiation
The strongest differentiator is not raw generation quality. It is:
- reference image -> structured interpretation
- reviewed rather than hidden inference
- editable graph rather than one-shot prompt text
- reuse of exact/comparable library material before synthesis
- persistent provenance that improves later retrieval

Closest alternatives only cover parts of this:
- ComfyUI gives manual node control but not automatic graph drafting from references
- Midjourney and similar apps give black-box variation but not reusable structure
- Photoshop gives downstream compositing power but not upstream generative scaffolding

Prompt Spaghetti should be described as the **structured variation layer** across these tools.

### 5. Technical Architecture
The pipeline should stay multi-stage and provenance-aware:
1. segmentation + region detection
2. multimodal semantic interpretation
3. retrieval and comparable matching
4. reconciliation and confidence scoring
5. structured human review checkpoint
6. graph drafting
7. optional preview generation via external backend

Important rule: do not let any single model silently author the final graph.

### 6. Recommended Beta Scope
Shippable paid beta:
- image bootstrap -> review -> draft graph
- graph refinement in place
- persistent library/retrieval signals
- **one lightweight preview generation backend** (abstract interface — required for product comprehension)
- prop-variation showcase (crowd showcase only if quality holds)

**Not beta-critical**
- PSD smart-object export
- background-plate node
- full ControlNet pipeline
- advanced credits/billing complexity

### 7. Business Model Direction
Two models are possible:

**Model A: structured creative tool first**
- charge for graph/library/productivity value
- generation is an add-on or pass-through
- strongest if the moat is the graph system, not cheap image credits

**Model B: managed generation workflow**
- subscription plus credits
- vendor markup on preview/batch generation
- more familiar market model, but easier to drift toward commodity behavior

For beta, the safer posture is:
- sell the structured workflow first
- treat generation credits as secondary
- avoid positioning the product as “another generator with a nicer UI”

### 8. Go-to-Market
Best early users:
- freelance concept artists
- art department / previs-heavy creative leads
- indie worldbuilders and small studios that need repeatable visual consistency

Best launch hook:
- “Turn a reference image into an editable variation graph.”

Best first demo:
- one prop reference -> reviewed graph -> multiple consistent variants -> reusable asset in the library

Crowd demos are valuable, but they should come after the prop flow is stable enough to be dependable.

### 9. Risks
- segmentation quality on messy or occluded references
- hallucinated trait inference without strong reconciliation and review
- overpromising downstream export and vendor integration before the core graph workflow is solid
- drifting into generic generation-app positioning

### 10. Immediate Product Priorities
1. finish the image bootstrap workflow as a stable beta path
2. improve retrieval/comparable ranking using persisted bootstrap signals
3. add one preview-generation backend behind an abstract interface
4. validate the strongest commercial wedge with real users: props first, crowds second
5. only then decide how much to invest in PSD export, credits, and vendor-specific depth

## Parallel Validation Track

The mainline implementation path remains Prompt Spaghetti.

- Track A: Prompt Spaghetti mainline is authoritative and continues shipping the
  beta-critical graph-plus-preview workflow.
- Track B: a separate ArtCraft validation spike may run in parallel only as a
  bounded comprehension test.

The ArtCraft spike does **not** override this brief. It exists only to test
whether a scene or canvas surface makes the graph loop materially easier for
target users to understand.

If the spike succeeds, it advances only into Phase 2 implementation planning as
the leading expression-layer candidate, pending architecture review and a
second validation pass.

This should be treated as the product truth:  
Prompt Spaghetti is the system that turns reference imagery into reusable, human-reviewed generative structure.
