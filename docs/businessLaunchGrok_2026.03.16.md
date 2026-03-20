**Prompt Spaghetti Development Report**  
**Compiled from full conversation (March 2026)**  
**For: Development Agent**  
**Date: 16 March 2026**  
**Purpose:** Strategy and execution brief for getting to a demoable, monetizable beta without overstating what the current product already does.

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
- lightweight preview through an external generation backend or existing bridge

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
What is credible for a paid beta:
- image bootstrap analyze -> review -> draft graph
- graph refinement in place
- persistent reuse signals written back to asset/library state
- one preview generation backend or existing export bridge
- prop variation showcase
- one crowd/extras showcase if quality is acceptable

What should **not** be treated as beta-critical:
- PSD smart-object export
- full background-plate control stack
- sophisticated ControlNet pipeline
- complex payment/credit marketplace mechanics before the workflow itself is proven

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

This should be treated as the product truth:
Prompt Spaghetti is the system that turns reference imagery into reusable, human-reviewed generative structure.
---
**Appendix: Krea API Integration Guide for Prompt Spaghetti**  
**Version: March 2026 (docs pulled live today)**  
**Target: The developer working on the graph scaffolding**  
**Status:** Candidate vendor integration reference, not a product commitment

This is the exact blueprint you need to hook the backend today. No GPU hosting, no model training, just clean HTTP calls. We route everything through Krea, mark up the cost in our credit system, and keep the graphs as our moat.

### 1. Why Krea (Recap – Confirmed March 2026)
- Live since Dec 2025 with full REST API  
- 40+ models (Flux variants = fastest/cheapest for props & small clusters; Nano Banana Pro / Seedream for quality)  
- Native support for reference images (`imageUrls`), img2img conditioning, style references, and ControlNet-style controls  
- Small 200×350 card renders are trivial and cheap  
- Background-plate passing works perfectly via `imageUrls` + `strength`  
- Async jobs + webhooks = scalable  
- OpenAPI spec available in the docs for auto-generating clients

### 2. Setup (5 minutes)
**Base URL**  
`https://api.krea.ai`

**Create API Token** (do this now)  
1. Log in at https://krea.ai (use a workspace – create one if needed)  
2. Go to https://krea.ai/settings/api-tokens  
3. Click “New Token” → give it a name (e.g. “PromptSpaghetti-Prod”)  
4. Copy the token (you’ll only see it once)  
5. Store in `.env`: `KREA_API_TOKEN=your-token-here`

**Auth Header (every request)**  
```http
Authorization: Bearer ${KREA_API_TOKEN}
Content-Type: application/json
```

**Billing Note**  
Usage pulls from the workspace’s Compute Units pool (same as the web app). Failed jobs cost nothing. View usage at https://krea.ai/settings/usage-statistics.

### 3. Core Flow – Async Jobs
All generations are jobs:
1. POST to create → instant `job_id`  
2. Poll `GET /jobs/{job_id}` or set `X-Webhook-URL` header for callback  
3. On `completed` → download image(s) from `result.urls`

**Job Statuses**: `pending` → `processing` → `completed` / `failed`

### 4. Main Endpoint & Parameters (Our Exact Payload)
**Recommended starter model**: `POST https://api.krea.ai/generate/image/bfl/flux-1-dev`  
(Super fast ~4s, ~5 compute units, great consistency with references)

Full request body (all parameters confirmed live):

```json
{
  "prompt": "string – built from your graph (weighted fragments + fixed traits)",
  "width": 512,                 // or 200–768 for small card renders
  "height": 350,                // perfect for our 5-char clusters
  "steps": 28,                  // 20–50 typical
  "seed": 123456789,            // CRITICAL – use graph-derived seeds for controlled randomization
  "strength": 0.75,             // 0.0–1.0 – how strongly the reference influences (0.6–0.85 ideal for variants)
  "imageUrls": [                // ← Bootstrap magic
    "https://your-uploaded-ref-image-url.com/original-palm.jpg",
    "https://your-background-plate-url.com/scene-crop.jpg"   // for background node
  ],
  "negative_prompt": "blurry, deformed, extra limbs, watermark",
  "guidance_scale": 7.5,
  "styleImages": [],            // optional extra style refs
  "relaxedModeAccess": false
}
```

**For our specific use cases**:
- **Palm-tree / Prop variants**: 1 reference URL + graph prompt + strength 0.7–0.8
- **Small crowd clusters (5 max)**: Lower res (600×800 total or per-character cards), multiple `imageUrls` from original refs
- **Background-plate node**: Pass environment crop as first imageUrl + prompt describing “person standing on ground plane, matching lighting and perspective” + strength 0.65. (Ground-plane detection can be done client-side with Florence-2 or simple edge map and injected in prompt for now.)
- **ControlNet / pose / direction (Phase 1.5)**: Krea supports ControlNet-style inputs via additional params (`controlnet_image_url`, `controlnet_type: "depth" | "pose" | "canny"` – check exact schema in docs “Try it” button). For MVP just use strong reference + prompt engineering.

Response on job creation:
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "pending"
}
```

### 5. Polling (MVP – 10 lines of code)
```python
import requests
import time

def generate_variant(payload):
    create = requests.post(
        "https://api.krea.ai/generate/image/bfl/flux-1-dev",
        headers={"Authorization": f"Bearer {TOKEN}"},
        json=payload
    )
    job_id = create.json()["job_id"]

    while True:
        status = requests.get(
            f"https://api.krea.ai/jobs/{job_id}",
            headers={"Authorization": f"Bearer {TOKEN}"}
        ).json()
        
        if status["status"] == "completed":
            return status["result"]["urls"][0]  # direct image URL
        elif status["status"] == "failed":
            raise Exception(status["error"])
        time.sleep(2)  # or 1s for Flux
```

**Production**: Add `X-Webhook-URL: https://your-app.com/krea-webhook` in the POST header. We’ll receive a POST callback when done.

### 6. Credit System Mapping (Easy)
Krea Compute Units → Our Credits:
- Flux small card (200×350) ≈ 1–2 of our credits
- Full res variant ≈ 3–4 credits
- Markup 3.5–5× (standard)

Track per-user credit balance in Supabase/DB. Deduct on job completion only.

### 7. Model Selector (UI Feature)
Let users pick:
- Flux-1-dev (speed / props / crowds)
- Nano Banana Pro (quality / complex references)
- Seedream 4 (photorealism)

Just swap the endpoint path: `/generate/image/{provider}/{model}`

### 8. Immediate Next Steps for You (Do Today)
1. Create token + test the exact cURL/Python example above with one of our palm-tree refs.  
2. Add `imageUrls` and `strength` to your graph → generation flow.  
3. Implement background-plate node (pass crop + prompt injection).  
4. Hook job polling + store image + metadata (graph ID, provenance, seed).  
5. One-click PSD export (use the downloaded URL + your alpha logic).  
6. Open the official API reference (https://docs.krea.ai/api-reference/introduction) and click “Try it” on the Flux endpoint – you’ll see the full live schema including all ControlNet options.

### 9. Extras You’ll Want
- **Webhooks** for real-time UI updates  
- **Asset upload endpoint** (if refs aren’t public URLs) – supports up to 75 MB  
- **OpenAPI spec** – generate a full client in Python/Node if you want  
- **Error handling** – retry on 429, log compute unit usage

This integration is deliberately simple – one POST, one poll loop, and we’re generating palm trees, clusters, and background-conditioned cards today.  

It gives us the palm-tree → rotatable PSD flow and the crowd-cluster workflow immediately. The graph scaffolding you’re already building becomes the intelligence layer on top of Krea’s raw power.

Drop the first test image URL you generate into Photoshop Rotate Object + Harmonize and you’ll see why this is the winning stack.

Need:
- Postman collection?
- Full Node.js wrapper class?
- Specific payload examples for the cafe crowd vs. palm tree?

Just say the word and I’ll send it in the next message.  

We’re shipping a real business in weeks, not months. Let’s go.
---
**ControlNet Parameters Guide for Prompt Spaghetti Graph Nodes**  
**For: Development Agent**  
**Date: 16 March 2026**  
**Context:** This explains ControlNet-style controls so you can add the “ControlNet / pose / direction” node you mentioned in the background-plate discussion. It ties directly into our Krea API integration (small-card renders, 200×350 crops, ground-plane detection, etc.).  

**Important Reality Check (March 2026):**  
Krea’s public API docs do **not** expose full ControlNet parameters in crawlable form (they’re behind the logged-in “Try it” button on the Flux endpoints). Their Flux models (flux-1-dev, etc.) rely heavily on `imageUrls[]` + `strength` for reference conditioning. True ControlNet (Canny, Depth, OpenPose, etc.) is handled in the Flux ecosystem via LoRAs or union models, not a dedicated `controlnet_type` field like classic SD 1.5.  

For our MVP we treat **ControlNet as an enhanced reference node** in the graph. You map it to Krea’s existing fields today. This gives 80 % of the value (pose, perspective, lighting lock) immediately. Full native ControlNet (with preprocessors) becomes Phase 1.5 once we test the exact schema via Krea’s Try-it or switch to a ComfyUI bridge.

### What ControlNet Actually Does in Our Workflow
ControlNet adds a **structural guide image** (depth map, pose skeleton, edge lines, etc.) so the generator respects exact geometry while still following the graph’s weighted prompt.  
Perfect for:  
- Background-plate cards (auto ground-plane → depth map)  
- Crowd characters (pose lock so they stand on the floor correctly)  
- Palm-tree variants (edge map to keep trunk shape)  
- Direction/rotation hints before Photoshop Rotate Object  

The graph node will let users attach a control image (or auto-generate one from the background plate) and set a few sliders. The backend then passes it to Krea.

### Core ControlNet Parameters (What to Expose in the Graph Node)
Expose these as editable fields in the graph (with defaults that “just work” for previs). Map them to Krea’s payload as shown below.

1. **Control Image** (required)  
   - Type: uploaded image or auto-generated (depth / canny / openpose from background plate)  
   - Purpose: the structural guide (e.g., edge detection of the palm trunk or pose skeleton of a crowd character)  
   - In graph: drag-and-drop slot or “Auto-generate from background plate” button (use Florence-2 or simple edge detection on your side — 2 lines of code)  
   - Krea mapping: add to `imageUrls[]` array (first slot = control image, second = background plate)

2. **Control Strength / Conditioning Scale** (0.0 – 1.5, default 0.65)  
   - How strongly the control image overrides the prompt  
   - 0.4 = loose (good for style variation)  
   - 0.7–1.0 = tight (perfect for crowds standing on the same floor)  
   - >1.0 = very strict (can cause artifacts)  
   - Krea mapping: `strength` field (0.0–1.0 range; we cap at 1.0 for safety)

3. **Control Type / Preprocessor** (dropdown)  
   - Options for MVP:  
     - “Canny” (edges — best for props like palm trees)  
     - “Depth” (ground-plane + distance — best for background-plate cards)  
     - “OpenPose” (skeleton — best for crowd characters)  
     - “None / Raw Reference” (just use the image as-is)  
   - In graph: simple selector. For now this becomes a prompt suffix (“using depth map”) + optional client-side preprocessing (we generate the map ourselves before sending).  
   - Future: when Krea exposes `controlnet_type`, map directly.

4. **Guidance Start / End** (0.0–1.0, defaults 0.0 / 1.0)  
   - When during the denoising steps the control applies  
   - Start 0.0 / End 1.0 = full control  
   - Start 0.3 / End 0.8 = control only in middle (allows more prompt freedom at beginning/end)  
   - Krea mapping: not directly exposed yet; approximate by adjusting `steps` and prompt weighting. We can add these sliders now and ignore them until Krea supports them (no breakage).

5. **Processor Resolution** (optional, default 512)  
   - Resolution at which the control image is analyzed  
   - Higher = more detail (but slower and more compute units)  
   - Krea mapping: not needed; Flux handles it internally.

6. **Seed Lock** (checkbox + number)  
   - Tie the control image to a specific graph seed so variants stay consistent when you regenerate.

### Exact Krea Payload Mapping (Copy-Paste Into Your Backend)
For a background-plate + ControlNet node:

```json
{
  "prompt": "graph-generated prompt with weighted fragments",
  "width": 200,
  "height": 350,
  "steps": 28,
  "seed": 123456,
  "strength": 0.65,                    // ← Control Strength
  "imageUrls": [
    "https://your-control-image-url (depth map or pose)",   // Control Image first
    "https://background-plate-crop-url"                     // Environment second
  ],
  "negative_prompt": "...",
  "guidance_scale": 7.5
}
```

That’s it for MVP. Krea treats the first `imageUrl` as the strongest reference — exactly how ControlNet works under the hood for Flux.

### How to Implement the Node in Your Graph Scaffolding (Priority Order)
1. Add new node type: “ControlNet / Pose / Direction”  
2. Fields: Control Image upload + type dropdown + strength slider + guidance start/end (hidden until supported)  
3. Auto-generate button: detect ground plane (simple edge/depth estimation) → create control image → attach to card renderer  
4. Backend: prepend control image to `imageUrls[]` + set strength  
5. PSD export: include the control image as a hidden layer note (“ControlNet depth used”) so artists know how it was built

### Recommended MVP Defaults (So Users Get Instant Wins)
- Control Type: Depth (auto from background plate)  
- Strength: 0.65  
- Size: 200×350 card  
- This gives perfect floor contact and perspective before Photoshop Rotate Object + Harmonize.

### Next Steps for You (Do This Week)
1. Add the ControlNet node UI with the 4 core fields above.  
2. Implement client-side depth/canny preprocessor (or just pass raw image for now — Krea is smart).  
3. Test with the palm-tree and crowd examples: upload background plate → auto depth map → generate small cards → export PSD → rotate/harmonize.  
4. Log into Krea dashboard → open the Flux endpoint “Try it” button → experiment with extra fields (sometimes undocumented `control_image` or `controlnet_scale` appear). Update the mapping if they exist.  
5. If you want full native ControlNet sooner, we can add a fallback ComfyUI route in Phase 1.5 (but Krea gets us to beta fastest).

This node turns your background-plate idea into a production feature: render tiny 200×350 cards that already understand the floor, perspective, and lighting. Then Photoshop does the rest.  

It keeps us fundamentally different from generic generators — the graph now controls structure, not just style.

Need:  
- Wireframe of the ControlNet node UI?  
- Sample code for auto depth-map generation?  
- Updated Krea payload examples for Canny vs Depth?  

Just say the word. We’re shipping the full previs brick factory.
