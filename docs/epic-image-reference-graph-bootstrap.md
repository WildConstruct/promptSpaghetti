# Epic: Image Reference Graph Bootstrap, Comparable Retrieval, and Preview

## Purpose

This epic defines the first real image-native bootstrap path for Prompt
Spaghetti.

The goal is not to build a full compositing pipeline inside the product. The
goal is to let a user:

- upload one or more reference images
- segment and analyze the subjects in those images
- infer a reusable variation structure
- draft a weighted-choice graph from that structure
- preview what that graph is likely to produce
- generate a comparable batch of new elements that fit the same world
- export or hand off the results for downstream compositing work such as
  Photoshop

This epic also addresses the retrieval gap around sparse libraries. The agent
must be able to:

- reuse existing fragments when they are a strong fit
- pull comparable fragments and references when exact matches are not available
- synthesize missing graph structure from scratch when the library is thin

That means this is both an image-analysis epic and an agent-retrieval epic.

## Product Outcome

When this epic is done, we should be able to say:

- the user can upload a small set of image references and get back an editable
  PSG graph draft
- the system can scaffold a crowd or character-variation batch from image
  references, not just from text
- the asset browser is useful to the agent as a retrieval surface, not just a
  manual preset shelf
- the agent never dead-ends on missing library coverage because it can fall
  back from exact reuse to comparable retrieval to synthesis
- the resulting graph can drive preview generation through one lightweight,
  abstracted backend path

## Current State

### Already Real In Code

- PSG already has contract support for:
  - fragments
  - crowd-plans
  - scene-plans
  - asset registration and derivation
  - scene assembly
  - Comfy export
- Current contract and service files:
  - [packages/core/services/psg/contracts.ts](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/packages/core/services/psg/contracts.ts)
  - [server/src/services/PsgService.ts](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/server/src/services/PsgService.ts)
  - [server/src/routes/psg.ts](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/server/src/routes/psg.ts)
- The canonical editor already has:
  - weighted-choice authoring
  - preview execution
  - asset browser integration
  - fragment suggestion plumbing
- Relevant editor and suggestion files:
  - [packages/core/components/epic1/Epic1GraphEditor.tsx](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/packages/core/components/epic1/Epic1GraphEditor.tsx)
  - [packages/core/components/epic1/SuggestedFragmentsPanel.tsx](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/packages/core/components/epic1/SuggestedFragmentsPanel.tsx)
  - [packages/core/components/epic1/services/AgentFragmentSuggestionService.ts](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/packages/core/components/epic1/services/AgentFragmentSuggestionService.ts)
  - [docs/asset-browser-agent-suggestions-plan.md](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/docs/asset-browser-agent-suggestions-plan.md)
- The runtime already contains an image-generation direction, even if it is not
  yet a trustworthy production path:
  - [packages/core/runtime/nodes/ImageGenerationNode.ts](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/packages/core/runtime/nodes/ImageGenerationNode.ts)

### Newly Real In Code For This Epic

- Generic image-bootstrap PSG contracts now exist for:
  - analyze
  - review
  - draft-graph
  - generate-batch
- Weighted scoring and reconciliation now exist in the staged analysis service:
  - [server/src/services/ImageBootstrapAnalysisService.ts](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/server/src/services/ImageBootstrapAnalysisService.ts)
- Explicit human review guidance now feeds back into the analysis checkpoint and
  draft metadata.
- The hosted client flow now exists in the editor:
  - `File -> Image Bootstrap...`
  - analyze -> review -> draft
  - insert bootstrap subgraph
  - refine bootstrap in place
- Bootstrap provenance and reuse signals now persist back into asset metadata
  and the local registry/browser path.
- Deterministic and real-server browser coverage now exists for:
  - menu access
  - refinement mode
  - analyze/review/draft roundtrip
  - explicit fixture locking

### Current Epic Milestone Status

- `Milestone 1: bootstrap to editable graph` -> complete
- `Milestone 2: refinement and provenance persistence` -> complete
- `Milestone 3: previewable graph comprehension` -> in progress
- `Milestone 4: beta-ready props workflow` -> pending
- `Milestone 5: crowd/extras quality pass` -> pending

### Missing or Not Yet Real

- There is no current image segmentation pipeline.
- There is not yet a real production analysis backend; current analysis is
  staged and deterministic/mock-backed.
- There is not yet a lightweight abstract preview backend for image-bootstrap
  graphs, even though preview is beta-critical for user comprehension.
- There is no current comparable retrieval ranker that clearly explains why an
  exact or comparable match surfaced from the browser/library.
- The asset browser is still primarily oriented around preset browsing instead
  of provenance-aware agent retrieval.
- There is no explicit orchestration layer that combines:
  - exact fragment reuse
  - comparable retrieval
  - synthesized graph deltas

## Core Product Shape

### Primary User Story

A user working on a crowd, scene population pass, or character variation set can
upload a few image references and quickly get:

- a reusable world-style scaffold
- a graph draft with weighted variation axes
- a batch of comparable new people

The user then takes those generated results into Photoshop or another downstream
compositing tool.

### Non-Goal

This epic does not try to make Prompt Spaghetti the compositing tool.

### MVP Input and Output

**Input**

- 1 to 10 reference images
- most often people, crowd references, or repeated archetype references
- optional user hint such as:
  - `punk show crowd`
  - `same world, more extras`
  - `build 20 background characters`

**Output**

- registered image assets and analysis records
- segmented subject and optional region masks
- inferred variation axes
- a draft fragment graph
- one previewable output path so the user can see what the graph means
- optional crowd-plan document
- a generation batch request for 10 to 20 comparable outputs
- preview generation path through one abstract backend interface

## Key Design Rule

The system should separate:

- locked world traits
- randomized person traits

The system should also include one explicit human-in-the-loop checkpoint before
the graph is drafted.

Locked world traits include things like:

- lighting
- palette
- camera feel
- rendering style
- grit / finish level
- venue or scenario framing

Randomized person traits include things like:

- pose
- silhouette
- hair
- wardrobe details
- accessories
- expression
- orientation

This separation is the difference between:

- “20 people from the same world”

and:

- “20 inconsistent or near-duplicate outputs”

The human review checkpoint is the difference between:

- “the system drafted the wrong graph very quickly”

and:

- “the system showed its interpretation, the user corrected the important
  assumptions, and the graph draft started from aligned structure”

## Human-in-the-Loop Checkpoint

Before the actual graph is built, the user should get one structured review
moment.

This review step should happen after:

- segmentation
- semantic analysis
- retrieval of exact and comparable candidates
- scoring and reconciliation

and before:

- graph drafting
- batch generation

### What the User Reviews

The review surface should show:

- detected primary subject or subjects
- important segmented regions
- inferred bootstrap mode
  - `character variation`
  - `prop variation`
  - `set dressing variation`
  - `environment/world anchor`
  - `crowd/archetype expansion`
- proposed locked traits
- proposed variable traits
- top exact matches
- top comparable matches
- uncertain or conflicting inferences

### What Structured Guidance the User Can Give

The user should be able to provide structured corrections such as:

- confirm or change the bootstrap mode
- mark which detected subject is the primary target
- exclude irrelevant segments or background regions
- move a trait from `locked` to `variable`
- move a trait from `variable` to `locked`
- reject a bad inferred trait
- add a missing trait or variation axis
- prefer library reuse over synthesis for a given area
- force synthesis for a given area
- choose one comparable reference as the preferred starting point

### Why This Matters

This checkpoint keeps the system from overcommitting to a bad early read of the
image.

It also gives the user a fast way to inject production intent without having to
manually author the graph from scratch.

### MVP Constraint

This should be exactly one review step in the MVP, not a long wizard.

The user should be able to review the structured interpretation, make a handful
of corrections, and then continue to graph drafting.

## Preview Requirement

Preview is not a downstream convenience in this epic. It is part of product
comprehension.

Without preview:

- the drafted graph is too abstract for most users
- the review checkpoint has no visible payoff
- the product risks reading like internal tooling instead of a usable creative
  system

### Beta-Critical Preview Rule

The MVP must include one lightweight preview-generation path behind an abstract
interface.

This does **not** mean:

- PSD export is beta-critical
- one specific vendor is committed
- full background-plate or ControlNet support is required

It **does** mean:

- the user can review a graph and see a preview of what it produces
- preview metadata should preserve provenance such as backend, seed, and model
- the backend should be swappable later

## Agent Acquisition Strategy

The agent should follow a strict three-tier acquisition order:

1. exact reuse
2. comparable retrieval
3. synthesis

### Tier 1: Exact Reuse

Use existing fragments, presets, crowd archetypes, and graph templates when the
library already contains strong matches.

### Tier 2: Comparable Retrieval

When the library does not contain exact matches, retrieve comparable material
based on:

- semantic similarity
- visual similarity
- graph-topology similarity
- matching variation-axis coverage
- domain and tone metadata

The point of this tier is to avoid unnecessary synthesis when the repo already
contains something close enough to adapt.

## Story Sequence

This epic should now be executed in the following order.

### Completed

1. contracts for image bootstrap, reconciliation, and review
2. staged analysis service with weighted scoring
3. hosted client flow for analyze -> review -> draft
4. draft insertion, refinement, and provenance persistence
5. fixture-aware and real-server browser test coverage

### Next

6. preview backend abstraction
7. first preview backend implementation
8. preview UX from selected bootstrap graphs
9. `scene-preview-v1` precursor surface behind a feature flag
10. retrieval ranking explanations in browser/search surfaces
11. props-first beta hardening
12. crowd/extras quality validation

## Parallel Validation Track

This epic owns Track A.

Track A is the authoritative implementation path in the Prompt Spaghetti repo:

- preview-backed graph comprehension
- props-first beta hardening
- retrieval trust and explanation surfaces

Track B is a separate ArtCraft validation spike with a narrower purpose:

- test whether a scene or canvas surface makes the graph loop easier to
  understand for pre-viz users
- keep Prompt Spaghetti graph, review, and provenance logic as the source of
  truth
- remain timeboxed through the April 2 decision

The Track B spike does not change story sequencing inside this epic unless it
passes the explicit Phase 2 gate.

Before any heavier expression-layer work, mainline should add one bounded
precursor surface:

- `scene-preview-v1`
- feature-flagged in the current editor
- uses existing bootstrap metadata and preview logic
- proves whether a scene surface improves comprehension without adding mesh or
  desktop complexity first

### Tier 3: Synthesis

Only synthesize the missing graph structure after exact and comparable retrieval
have been attempted.

Synthesis should generate the uncovered delta, not blindly replace the whole
graph.

## Browser Expansion

The content browser should become a retrieval workbench rather than only a
preset picker.

For this epic, the browser should eventually support three result groups:

- `Exact Matches`
- `Comparable References`
- `Generate From Scratch`

Each surfaced fragment or asset should carry explicit provenance:

- `library`
- `comparable`
- `synthesized`

That provenance should remain visible in agent output and, where practical, in
the inserted graph metadata.

## Proposed Architecture

### 1. Image Analysis Layer

Add a server-side `ImageAnalysisService` responsible for:

- ingesting image references
- running segmentation or region detection
- extracting attributes
- computing embeddings
- clustering similar references
- drafting variation axes

This should produce structured intermediate analysis records, not just freeform
text.

### 2. Retrieval Layer

Add a retrieval service that can score:

- existing fragments
- existing image references
- crowd archetypes
- prior generated graph templates

using both metadata and embeddings.

This should be deterministic-first and ranking-oriented, not LLM-first.

### 3. Graph Drafting Layer

Add a graph bootstrap service that converts:

- analysis outputs
- human review guidance
- retrieved fragment candidates
- optional user intent

into a first-pass PSG fragment graph with:

- top-level weighted archetype choices where appropriate
- shared world-style nodes
- randomized person-trait subgraphs
- an output template suitable for prompt generation

### 4. Batch Generation Layer

Add a batch generation request shape that can:

- lock world traits
- vary person traits
- target a count such as 20
- optionally enforce diversity constraints

### Scoring and Reconciliation Layer

Add a dedicated scoring and reconciliation layer between analysis/retrieval and
graph drafting.

This layer should:

- merge segmentation findings, multimodal model findings, and retrieval
  evidence
- assign confidence and provenance to inferred traits
- surface disagreements explicitly
- prepare a review model for the human-in-the-loop checkpoint

The graph drafting layer should consume the reconciled and reviewed structure,
not raw model output.

### 5. Preview Bridge

Use the existing PSG Comfy export path for preview generation first.

Do not create a second preview/export protocol for this MVP unless the current
bridge proves insufficient.

## Proposed Contracts

### New Operation Family

Add new image-native routes under the PSG or adjacent API surface:

- `POST /api/psg/images/register-batch`
- `POST /api/psg/images/analyze`
- `POST /api/psg/images/draft-graph`
- `POST /api/psg/images/generate-batch`

The exact route names can change, but the operation split should remain clear.

### Suggested Data Shapes

The MVP likely needs explicit types for:

- `ImageReferenceBatch`
- `ImageAnalysisRecord`
- `DetectedSubject`
- `DetectedRegion`
- `VariationAxis`
- `ComparableMatch`
- `ReconciledTrait`
- `ReviewCheckpoint`
- `ReviewGuidance`
- `GraphBootstrapPlan`
- `GenerationBatchRequest`
- `GenerationBatchResult`

Where possible, use `asset.metadata` extensions and new Zod schemas rather than
inventing ad hoc freeform payloads.

## Graph Drafting Rules

The first graph draft should be opinionated and simple.

Preferred graph shape:

- shared world-style branch
- archetype weighted-choice branch
- one weighted-choice node per major person variation axis
- concat or templating nodes to assemble a stable final output
- one output node

Likely first-class variation axes:

- archetype
- pose / motion energy
- wardrobe upper
- wardrobe lower
- hair / head styling
- accessories
- expression
- distance / framing

Likely world-style anchors:

- venue or environment
- camera feel
- lighting
- texture / grit
- color palette

## Acceptance Scenario

The canonical acceptance scenario for this epic should be:

1. Upload 3 to 5 reference images of people at a punk show.
2. The system registers and analyzes the images.
3. The system identifies shared world traits and a small set of variation axes.
4. The agent first checks the fragment library for strong matches.
5. The agent then pulls comparable references where the library is thin.
6. The system presents one structured human review checkpoint before graph
   drafting.
7. The user confirms or corrects bootstrap mode, locked traits, variable traits,
   and any bad matches.
8. The agent synthesizes only the missing graph pieces.
9. The system produces an editable graph draft.
10. The user requests 20 variants.
11. The resulting batch reads as one coherent event and visual world while still
   containing distinct individuals.

## Stories

### Story 1: Define Analysis and Retrieval Contracts

**Goal**

Define the canonical data contracts for image analysis, comparable retrieval,
graph bootstrap planning, and batch generation.

**Scope**

- define new Zod schemas
- decide what belongs in PSG asset metadata versus first-class contracts
- define provenance and confidence fields
- define response shapes for draft graph and generation batch paths

**Acceptance Criteria**

- one canonical contract module exists for the new feature area
- provenance and confidence are explicit in the contract
- the contracts support exact reuse, comparable retrieval, and synthesis
- contracts are small enough to mock during early implementation

### Story 2: Add Image Asset Ingest and Analysis Records

**Goal**

Make uploaded image references first-class assets with analysis-ready metadata.

**Scope**

- register image batches
- persist or attach analysis records
- capture segmentation outputs and embeddings
- store detected subject- and region-level metadata

**Acceptance Criteria**

- uploaded image references can be registered as PSG assets
- analysis records can be associated back to those assets
- at least one subject per person image can be represented consistently
- the ingest path supports mocked analysis before real models are wired

### Story 3: Build Comparable Retrieval for Fragments and References

**Goal**

Add a deterministic retrieval layer that can return comparable graph fragments
and references when exact matches are unavailable.

**Scope**

- add retrieval scoring inputs
- support metadata and embedding-backed ranking
- define exact-match vs comparable-match thresholds
- expose provenance and reason codes to the caller

**Acceptance Criteria**

- a query can return exact and comparable results separately
- each result exposes why it matched
- the retrieval layer can operate without LLM reasoning
- low-confidence retrieval is distinguishable from strong reuse

### Story 4: Expand the Content Browser for Agent Retrieval

**Goal**

Turn the browser into a retrieval and provenance surface for this workflow.

**Scope**

- surface result groups:
  - exact matches
  - comparable references
  - generate from scratch
- display provenance and confidence
- allow inserting or promoting synthesized outputs back into the library

**Acceptance Criteria**

- the browser can show exact and comparable results distinctly
- synthesized outputs are clearly marked
- the agent and the user can inspect result origin
- the browser remains usable even before full remote retrieval exists

### Story 5: Draft a Graph From Image Analysis

**Goal**

Convert analysis output and retrieval candidates into an editable PSG graph.

**Scope**

- world-style extraction
- variation-axis drafting
- weighted-choice graph construction
- synthesis of missing graph deltas
- application of reviewed guidance before graph drafting

**Acceptance Criteria**

- given a reference batch, the system can return a valid draft graph
- the graph is editable in the canonical Epic1 editor
- the graph separates world-style anchors from randomized person traits
- reused, comparable, and synthesized graph pieces can be traced
- the graph reflects the user’s structured review choices

### Story 5A: Add Human Review Checkpoint Before Graph Drafting

**Goal**

Give the user one fast structured review step between analysis and graph
construction.

**Scope**

- show reconciled analysis results
- show locked vs variable trait proposals
- show bootstrap mode proposal
- show exact and comparable matches
- accept structured guidance from the user

**Acceptance Criteria**

- the user can review the interpretation before the graph is drafted
- the user can provide structured corrections without manual graph editing
- the review step is short and does not become a multi-screen wizard
- downstream graph drafting consumes reviewed guidance rather than raw analysis

### Story 6: Add Crowd / Character Batch Generation Request Flow

**Goal**

Generate a controlled batch of comparable people from the drafted graph.

**Scope**

- define generation batch request shape
- add count, seed, and diversity controls
- lock world-style attributes
- vary person-trait attributes

**Acceptance Criteria**

- the user can request a batch such as 20 variants
- world-style anchors remain stable across the batch
- person-level variety is materially visible
- the batch can be previewed through the current generation bridge

### Story 7: Wire Preview Export Through the Existing Bridge

**Goal**

Use existing PSG export infrastructure to produce honest previews for the new
graph bootstrap path.

**Scope**

- connect drafted graphs to the current Comfy export bridge
- ensure batch requests can emit preview-ready payloads
- avoid introducing a parallel preview protocol

**Acceptance Criteria**

- a drafted graph can be exported through the existing preview bridge
- preview requests preserve asset references and placement-relevant metadata
- preview limitations are explicit rather than hidden behind placeholders

### Story 8: Add Save-Back Curation for Accepted Outputs

**Goal**

Turn successful generated or synthesized outputs into reusable library material.

**Scope**

- save accepted graph fragments back into the library
- preserve provenance and review state
- allow promoted fragments to participate in future retrieval

**Acceptance Criteria**

- a synthesized or hybrid result can be promoted into the browser inventory
- promoted fragments are retrievable in later sessions
- provenance is retained even after promotion

## Recommended Order

1. Story 1: Define Analysis and Retrieval Contracts
2. Story 2: Add Image Asset Ingest and Analysis Records
3. Story 3: Build Comparable Retrieval for Fragments and References
4. Story 4: Expand the Content Browser for Agent Retrieval
5. Story 5A: Add Human Review Checkpoint Before Graph Drafting
6. Story 5: Draft a Graph From Image Analysis
7. Story 6: Add Crowd / Character Batch Generation Request Flow
8. Story 7: Wire Preview Export Through the Existing Bridge
9. Story 8: Add Save-Back Curation for Accepted Outputs

## Implementation Notes

### Keep the first implementation honest

- mocked segmentation is acceptable before real segmentation is wired
- mocked comparable retrieval is acceptable if the contract and ranking path are
  real
- fake thumbnails or fabricated previews are not acceptable if they appear as
  production behavior

### Prefer extension over parallel systems

- extend PSG contracts rather than creating a separate image-graph document
- extend the asset browser rather than creating a disconnected retrieval UI
- extend the current suggestion and planner surfaces where possible

### Keep the agent deterministic-first

The retrieval layer should not start with a freeform LLM deciding what to use.

Preferred order:

1. deterministic filters and ranking
2. optional LLM reasoning for adaptation or tie-breaking
3. explicit synthesis only where the deterministic path has coverage gaps

## Open Questions

- Which segmentation backend should be the first real production integration?
- Should image embeddings and fragment embeddings share one retrieval index or
  remain separate with a blended ranker?
- How much of the first generation batch path should be synchronous versus job
  based?
- Should save-back curation require explicit user review before promoted
  fragments become retrieval candidates?
- How should UTDG participation interact with comparable retrieval once that
  system is live?

## Suggested Next Step

Use this epic as the planning and implementation backbone for the feature.

Immediate follow-up should be:

1. settle Story 1 contracts
2. choose a minimal mocked analysis pipeline for Story 2
3. define the browser retrieval grouping and provenance UI for Story 4
4. implement one end-to-end acceptance path for the punk-show crowd scenario
