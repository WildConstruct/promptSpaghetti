# Windsurf Next Tasks

This is the recommended continuation queue for Windsurf. Work top to bottom unless blocked.

## Task 1: Add LLM status contract

Goal:
- create one canonical browser-visible availability contract for AI features

Deliverables:
- add `GET /api/llm/status` or equivalent status endpoint on the server
- return:
  - `available`
  - `mode`
  - `provider`
  - `defaultModel`
  - `capabilities`
- document the response contract in code comments or types

Success criteria:
- UI no longer has to infer availability from local API key storage
- server remains the owner of provider/config truth

## Task 2: Introduce one shared browser LLM client contract

Goal:
- define a single API-backed browser client interface for all UI consumers

Deliverables:
- create or refactor a shared browser client module under `packages/core/services/llm/`
- include typed methods for:
  - `getStatus`
  - `draftGraphFromPrompt`
  - `complete`
  - `suggest`
  - `metadata`
  - `refine`
  - `analyze`
  - `populateChoices`
  - `optimizeChoices`
- keep any endpoint alias fallback logic inside this client only

Success criteria:
- components no longer own raw endpoint path logic
- there is one obvious import path for browser-side LLM access

## Task 3: Migrate Launch Screen parsing to the shared client

Goal:
- stop maintaining a separate launch-screen-only LLM adapter

Deliverables:
- migrate `client/src/components/LaunchScreen/PromptDissector/hooks/useParsingEngine.ts`
- remove direct dependency on `client/src/shims/llm-service.ts`
- either delete the shim or reduce it to a compatibility re-export with a deprecation note

Success criteria:
- `PromptDissector` uses the same client contract as the rest of the app
- `draftGraphFromPrompt` has one canonical client path

## Task 4: Migrate shared AI UI off `SimpleLLMService`

Goal:
- remove legacy browser-key assumptions from shared UI

Deliverables:
- migrate:
  - `packages/core/components/LLMToggle/LLMToggle.tsx`
  - `packages/core/components/LLMToggle/LLMToggleInline.tsx`
  - `packages/core/components/LLMConfigDialog/LLMConfigDialog.tsx`
  - `packages/core/components/epic1/contexts/IntelligenceContext.tsx`
- replace `getLLMService()` calls with the shared API-backed client
- update copy that currently implies users provide local browser API keys

Success criteria:
- shared AI UI reflects server-configured AI availability
- no new local-storage API-key flow remains in primary UI

## Task 5: Deprecate `SimpleLLMService`

Goal:
- make the legacy surface clearly non-authoritative before removal

Deliverables:
- add a deprecation note to `packages/core/services/SimpleLLMService.ts`
- add a restricted-import lint rule or equivalent guard against new imports
- identify any remaining legitimate heuristic logic worth extracting

Success criteria:
- no new consumers are added
- remaining legacy responsibilities are explicit and bounded

## Task 6: Remove client-side aliasing and legacy wiring

Goal:
- eliminate bundler-era LLM ambiguity after migration

Deliverables:
- remove `SimpleLLMService` aliasing from:
  - `client/vite.config.ts`
  - `client/vite.config.production-safe.ts`
- remove dead compatibility code once no consumers remain

Success criteria:
- browser build has one canonical LLM client path
- there is no special-case remapping for legacy LLM service identity

## Task 7: Add tests and guardrails

Goal:
- keep the stack from drifting again

Deliverables:
- add unit tests for the shared browser client
- add server route tests for canonical `/api/llm/*` contracts
- add UI tests for AI available/unavailable states
- add a build/bundle guard to prevent provider SDKs from leaking into browser bundles
- add a guard against new imports from `SimpleLLMService`

Success criteria:
- future changes fail fast when they reintroduce split LLM surfaces

## Task 8: Quarantine or remove stale Epic 1 refactor artifacts

Goal:
- finish the source-of-truth cleanup for the editor split

Deliverables:
- decide whether to move `packages/core/components/epic1/Epic1GraphEditorRefactored.tsx` into a quarantined location or leave it in place with stronger deprecation language
- update any stale sandbox or notes files that still imply the refactor is authoritative

Success criteria:
- the repo no longer presents two plausible Epic 1 editor authorities

## Task 9: Keep documentation aligned

Goal:
- make architecture docs reflect live code, not aspirations

Deliverables:
- update any docs that still imply:
  - the refactored Epic 1 editor is canonical
  - browser-side API keys are the preferred LLM path
  - alternate server mains are valid defaults

Success criteria:
- docs, exports, tests, and runtime paths tell the same story
