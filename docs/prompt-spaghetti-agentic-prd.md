# Prompt Spaghetti Agentic Rebuild PRD

_Last updated: 2026-03-06_

## 1. Product Thesis

Prompt Spaghetti is a PSG-native visual editor and execution environment for building prompt randomization surfaces.

It is not just a graph editor and not just an AI prompt helper. It is an agentic development tool for authors, prompt engineers, and pipeline builders who need to:

- design deterministic prompt systems
- inspect and modify them visually
- save them in a stable, portable format
- use AI to propose structured changes instead of opaque text blobs

The source of truth is `PSG`. The canvas, preview engine, storage layer, and AI assistant all operate on PSG documents or PSG-derived graph state.

## 2. Product Definition

### Core Positioning

Prompt Spaghetti helps users build prompt randomization systems the way a level editor helps build game spaces:

- visual enough to explore
- deterministic enough to trust
- structured enough to automate
- AI-assisted enough to move quickly

### Primary Product Statement

Users should be able to create, load, edit, preview, and refine a PSG document end-to-end without depending on hidden internal state or one-off demo code paths.

### Product Boundary

Prompt Spaghetti is:

- a PSG editor
- a PSG preview and execution surface
- a PSG-aware assistant for authoring and refactoring prompt systems

Prompt Spaghetti is not:

- a generic chat UI
- a graph toy with ad hoc JSON persistence
- a loose collection of AI endpoints without document semantics

## 3. Users and Jobs

### Primary Users

1. Prompt Systems Designer
Designs reusable prompt surfaces with branching, weighting, sequencing, and reusable fragments.

2. Creative Pipeline Builder
Needs deterministic prompt outputs that can feed image, video, story, or workflow pipelines.

3. Agent Operator
Uses AI assistance to generate first drafts, refactor prompt systems, expand options, and explain graph behavior.

### Core Jobs To Be Done

1. Turn an idea or rough text prompt into a structured PSG graph.
2. Iterate on that graph visually and deterministically.
3. Ask an assistant to improve or transform the graph without losing structure.
4. Save the result in a durable format that can be versioned, reviewed, and executed.

## 4. Product Principles

1. PSG is canonical.
All durable state must serialize to PSG cleanly.

2. AI produces structure, not mystery.
AI outputs should become PSG patches, node insertions, metadata suggestions, or validation notes.

3. Local-first by default.
The editor must remain useful without cloud dependencies.

4. Determinism is a feature.
Seeded preview and execution are part of the value proposition, not internal implementation detail.

5. Visible UI must map to real capabilities.
Do not ship menu items, dialogs, or assistant actions that are not actually wired.

6. One supported path beats many partial paths.
Prefer one coherent document flow over multiple overlapping legacy routes.

## 5. Source of Truth Model

### Canonical Artifact

`PSG` is the canonical persisted representation of:

- nodes
- edges
- graph metadata
- layout information
- document version
- optional assistant annotations

### Derived State

The following are derived, not canonical:

- React Flow node state
- preview cache
- local UI preferences
- server request payload wrappers
- asset browser projections

### Required Rule

Every major workflow must either:

- read PSG
- write PSG
- compute against PSG
- propose a PSG patch

If a feature cannot describe its relationship to PSG, it is outside the core architecture.

## 6. MVP Scope

### In Scope

1. PSG document open, edit, save, save as, export, and import.
2. Visual graph editing for the supported node set.
3. Deterministic preview and execution from PSG-backed state.
4. Prompt-to-graph bootstrapping from text into PSG-backed graph state.
5. Asset insertion and fragment reuse that ultimately produce PSG graph changes.
6. AI-assisted actions that either generate a draft graph or propose graph/document changes.
7. Optional Supabase-backed PSG storage after local-first flow works reliably.

### Out of Scope for MVP

1. Broad platform admin surfaces unrelated to PSG authoring.
2. Multiple authentication systems in parallel.
3. Generic LLM endpoint families with no product workflow attached.
4. Large extension ecosystems before the base document flow is stable.
5. Collaboration and multiplayer editing before single-user durability is solid.

## 7. Functional Requirements

### FR1: PSG-Native Document Lifecycle

Users shall be able to create, open, edit, save, and export PSG documents as the primary document format.

Acceptance notes:

- local save must produce PSG, not ad hoc JSON
- local open must support PSG first
- cloud save, if enabled, must persist PSG-backed documents

### FR2: Visual Graph Editing

Users shall be able to manipulate the active PSG graph through the visual editor with supported node creation, deletion, connection, and editing behaviors.

### FR3: Deterministic Preview

Users shall be able to preview multiple seeded outputs from the current PSG graph and rerun them predictably with the same seeds.

### FR4: Prompt Bootstrapping

Users shall be able to paste text and create an initial graph draft that is represented as PSG-backed graph state.

### FR5: Agentic Assistance

Users shall be able to invoke AI assistance for bounded authoring tasks, including:

- parse text into a starting graph
- suggest edits to nodes or branches
- generate additional weighted choices
- explain graph behavior
- audit the graph for structural issues

### FR6: Structured AI Output

AI-assisted actions shall return either:

- PSG patches
- node/edge insertion proposals
- field-level edits
- analysis and warnings tied to graph entities

Freeform text may be shown to the user, but it cannot be the only usable output of an assistant action.

### FR7: Asset and Fragment Reuse

Users shall be able to insert reusable content into the graph from an asset browser or fragment library, with results becoming PSG-backed graph changes.

### FR8: Runtime Trustworthiness

The system shall execute the supported node set consistently in editor preview and server-side execution.

## 8. Non-Functional Requirements

1. One supported build path must stay green for `client` and `server`.
2. One supported typecheck path must stay green.
3. The core editor must remain usable with no network connectivity.
4. Preview of typical graphs should feel immediate for normal authoring use.
5. The codebase must have a clearly defined active app surface.
6. Stubs must not be exposed as production functionality.

## 9. AI Architecture Direction

### Assistant Role

The assistant is a graph-aware copilot, not a chat-only feature.

### First-Class AI Workflows

1. `Prompt -> Graph Draft`
Take pasted text and propose a PSG graph draft.

2. `Selection -> Improve`
Take selected nodes and propose refined text, options, metadata, or branching.

3. `Graph -> Explain`
Summarize what the graph does, where variation occurs, and where outputs may be weak.

4. `Graph -> Audit`
Flag dead ends, disconnected nodes, empty outputs, missing output paths, and suspicious weight distributions.

5. `Graph -> Expand`
Generate additional options, variants, or reusable fragments for targeted regions.

### AI Contract

The AI layer should be expressed through a narrow service boundary:

- input: PSG document or PSG-derived selection context
- output: structured result with patches, insertions, warnings, and human-readable notes

Avoid shipping endpoint families that are only thin wrappers around model completion without a graph-level contract.

## 10. Technical Direction

### Active Product Layers

1. `client`
Application shell, document UX, editor integration, assistant interaction surface.

2. `packages/core`
PSG codec, graph/runtime model, preview engine, editor primitives, assistant contracts.

3. `server`
Execution APIs, bounded AI orchestration, optional storage integration, health endpoints.

### Canonical Flow

`PSG document -> editor state -> preview/runtime -> PSG save/export`

### Storage Direction

1. Local PSG file workflow is mandatory.
2. Local autosave can remain browser-based, but it should represent a recoverable PSG-backed document state.
3. Supabase is optional and should store PSG documents or PSG-equivalent canonical payloads.

## 11. Success Criteria

The rebuild is successful when:

1. A user can create and save a PSG document locally.
2. That document can be reopened and round-tripped without structural loss.
3. The document previews deterministically from seeded execution.
4. At least one real AI workflow can transform or generate PSG-backed graph changes.
5. The visible UI no longer advertises dead or stub-only capabilities.
6. The repo has one well-defined active path that new work can safely extend.

## 12. Delivery Phases

### Phase 1: Base Layer Recovery

- define active app surface
- remove or quarantine dead paths
- make PSG the default save/load contract
- get build and typecheck green

### Phase 2: Product Core

- stabilize graph editing
- stabilize preview/runtime parity
- stabilize asset insertion and file flows

### Phase 3: Agentic Layer

- wire real AI service boundary
- implement graph draft, refine, explain, and audit
- return structured graph-aware results instead of placeholders

### Phase 4: Optional Cloud Layer

- add reliable PSG storage in Supabase
- add document listing/sharing only after local-first is solid

## 13. Repo Decision

The immediate recommendation is to continue in the current repo long enough to:

- prove the new architecture
- prune cruft
- stabilize the base layer

A new repo should only be created if the active surface cannot be made coherent after that pruning pass. If a future split happens, the split should move a clarified PSG-native system, not restart discovery from zero.
