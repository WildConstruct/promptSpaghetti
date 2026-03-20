**Analysis: Alternative Expression Layers (March 16 2026)**

We now have four viable alternatives to ArtCraft that could serve as the “scene surface” for our agentic populate loop. I evaluated them strictly against our constraints:  
- Must support click-on-surface → graph-driven population (props/set-dressing wedge first).  
- Must keep our graph/reconciliation/provenance as the decision engine.  
- Must minimize integration drag and strategic confusion during the validation spike.  
- Preference for web-first or low-dependency paths to protect Track A.

**Ranked Alternatives (from lowest risk to highest power)**

1. **Custom React Three Fiber (R3F) Canvas inside Prompt Spaghetti** (Strongest no-fork option)  
   Repo foundation: pmndrs/react-three-fiber (mature, 2026 still dominant).  
   Why it fits: Declarative 3D scene in React. We add one 3D viewport panel. Click any imported mesh/image → our existing graph triggers populate → outputs GLTF/OBJ straight into the Three.js scene graph with depth, occlusion, and lighting.  
   Pros: Zero external fork, stays 100% in our repo, web-native (no desktop install), easy undo/state via React.  
   Cons: Less “Photoshop desktop feel” initially (we’d add layers/masks later).  
   Spike effort: 3–5 days to prototype a clickable 3D panel. Perfect validation harness.

2. **Brush (Gaussian Splatting Engine)** – ArthurBrussee/brush  
   Cross-platform (web + desktop via Burn + WebGPU).  
   Why it fits: Image → splat reconstruction is native. Our graph can drive iterative splat population with depth-aware compositing. Browser version means instant testing.  
   Pros: Lightweight, modern (splats > traditional mesh for quick pre-viz), already handles multi-platform.  
   Cons: Splats are less editable than meshes (fine for props blocking).  
   Spike effort: Clone + wrap one command; lower than ArtCraft.

3. **Blender + StableGen-style Addon** (sakalond/StableGen + TRELLIS.2 integration)  
   Full professional desktop 3D editor millions of film users already own.  
   Why it fits: TRELLIS.2 gives image-to-textured-mesh; our agent loop becomes a custom operator that reads our graph and populates props with proper occlusion.  
   Pros: Instant pro credibility, powerful rigging/kit-bashing out of the box.  
   Cons: Users must have Blender; addon maintenance overhead.  
   Spike effort: Higher (Python API bridge), but reusable for Phase 2 if pre-viz pros demand it.

4. **ComfyUI + 3D Custom Nodes + Canvas Extension**  
   If our graph feels node-native, this is a natural evolution.  
   Why it fits: Extend existing workflows with 3D viewer nodes; click events can trigger our reconciliation.  
   Pros: Many AI pre-viz users already live in ComfyUI.  
   Cons: Still feels like “more nodes” instead of a true scene canvas → weaker comprehension uplift.  
   Spike effort: Medium, but risks polluting our differentiation signal.

**Verdict on Alternatives vs ArtCraft**  
R3F inside Prompt Spaghetti wins for the validation spike: zero strategic confusion, lowest drag, and still gives real 3D click-to-populate. ArtCraft remains the desktop gold standard if the spike proves uplift, but we now have a clean web-native path that keeps everything in Track A. Brush is a close second for splat speed. Blender is Phase-2 only. ComfyUI is a fallback if we want to stay purely node-based.

I’ve scoped the spike to test R3F first (parallel to ArtCraft if we want side-by-side data). This gives us two expression-layer candidates with almost no extra cost.

**User Journeys – Comparative (Same Scenarios, Both Workflows)**  
I built three realistic journeys for the props/set-dressing wedge. Each compares:  
- **Workflow A**: Pure Graph (current Prompt Spaghetti + 2D preview)  
- **Workflow B**: Canvas-Enhanced (using R3F as the lightweight alternative; identical logic if we used ArtCraft/Brush)

**Journey 1 – Junior Set Dresser (blocking a living-room scene, 10-minute task)**  
Workflow A (Graph-only):  
Opens node graph → uploads reference photo of empty room → runs analysis → sees scored prop library → drags nodes to build weighted graph (“sofa 70%, lamp 40%”) → hits “Preview” → gets static 2D composite.  
Feels abstract: “Is the lamp behind the sofa? Does the scale look right?” Takes 9 min, ends with “I think this works?” comprehension score low.

Workflow B (R3F Canvas):  
Same upload/analysis/graph step → clicks “Open Scene View” → 3D room loads with depth → clicks floor plane → agent populates from graph (sofa drops in with occlusion) → drags lamp in real-time, sees instant depth feedback and provenance highlight (“this lamp matches your reference 92%”).  
Junior says: “Oh! The lamp is floating – I’ll fix that.” Completes in 6 min, explains the system perfectly: “The graph tells it what to put, the canvas shows me if it actually fits.”

**Journey 2 – Senior Concept Artist (iterating a cyberpunk alley, client feedback loop)**  
Workflow A:  
Builds complex graph with provenance links to client refs → multiple 2D previews → exports stills → sends to client → gets “make the neon sign bigger and add trash piles” → back to nodes, re-weights, re-renders.  
Loop feels slow and disconnected; artist notes “I’m fighting the preview every time.”

Workflow B:  
Graph same → opens R3F canvas → clicks wall → agent adds neon sign (graph-driven size/position) → clicks ground → trash piles auto-populate with depth blending → live rotate/orbit, drag to adjust, provenance overlay shows “this trash matches your mood board.”  
One-click “Regenerate from graph” updates everything consistently. Artist: “This is what I actually show directors – I can sell the idea in 30 seconds instead of exporting 5 stills.”

**Journey 3 – Director / Producer Review (quick approval pass)**  
Workflow A:  
Receives graph export + 2D preview PDF → struggles to visualize scale/occlusion → asks for 3 more variations → back-and-forth email thread.  
Comprehension: “Clever backend, but I can’t see the blocking.”

Workflow B:  
Shares link to R3F scene (or exported ArtCraft/Brush file) → director opens browser → clicks any prop → sees live agent suggestions from the graph (“want more neon variants?”) → rotates, approves on the spot, leaves notes directly on the 3D surface.  
Director: “Finally a tool that shows me the set before we build it.” Approval in one 15-minute call.

**Key Insight from Journeys**  
The comprehension uplift is not about prettier pictures — it’s about turning our graph from “smart backend” into “visible decision engine.” In every case, Workflow B makes the provenance, scoring, and reconciliation instantly legible because users see the consequences in 3D space. R3F delivers 80% of that value with almost zero risk.

**Next Step Recommendation**  
Run the 2-week spike on R3F first (cheapest, stays in Track A). If it wins, we have a web-native path ready. If we still want desktop polish, then layer ArtCraft or Brush on top in Phase 2.  

This keeps us ruthlessly focused on validating the core loop while giving it the best possible expression surface.

Lucas — I’ve incorporated your user-type feedback (junior + senior + director). The journeys above are ready for the spike test script. Want me to expand any into full click-flow wireframes or add a fourth journey (e.g., crowds later)? Or shall we pick R3F as the spike default and start the branch today?  

Go/no-go on spiking R3F in parallel with the ArtCraft one?
--
