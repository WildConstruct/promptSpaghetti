# LLM Stack Migration Plan

## Goal

Converge the repo onto one LLM architecture:

- Browser/UI code calls typed server-backed clients only.
- Server owns provider credentials, model selection, retries, and policy.
- `packages/core` exposes stable capability interfaces instead of multiple competing LLM implementations.

The target is not "perfect AI infra." The target is one durable path that can absorb more LLM features later without adding more ad hoc clients.

## Current State

### Live surfaces today

- Legacy browser-side parser/config path:
  - `packages/core/services/SimpleLLMService.ts`
  - `packages/core/components/LLMToggle/LLMToggle.tsx`
  - `packages/core/components/LLMToggle/LLMToggleInline.tsx`
  - `packages/core/components/LLMConfigDialog/LLMConfigDialog.tsx`

- Newer server-backed/browser-safe path:
  - `packages/core/services/ApiLLMService.ts`
  - `packages/core/services/llm/index.ts`
  - `server/src/routes/llm.ts`
  - `server/src/services/LLMService.ts`
  - `server/src/routes/agent.ts`
  - `server/src/services/AgentDraftService.ts`
  - `client/src/shims/llm-service.ts`
  - `client/src/components/LaunchScreen/PromptDissector/hooks/useParsingEngine.ts`

### Main architectural problems

1. The repo has three different meanings of "`LLMService`".
   - `packages/core/services/SimpleLLMService.ts`
   - `packages/core/services/ApiLLMService.ts`
   - `packages/core/services/llm/LLMService.ts`
   - plus `server/src/services/LLMService.ts`

2. The browser still has UX and state built around local API keys.
   - `LLMConfigDialog` stores `llm-config` in `localStorage`
   - dialog text says the API key is stored locally and not sent to servers
   - `SimpleLLMService` reads browser config and exposes `isEnabled()` / `estimateCost()`

3. Some newer flows already assume server ownership.
   - `PromptDissector` uses `client/src/shims/llm-service.ts`
   - agentic drafting goes through `/api/agent/draft-graph`
   - `packages/core/services/llm/index.ts` already re-exports `ApiLLMService` as the public core LLM surface

4. Shared UI contracts are still tied to the legacy service shape.
   - toggles/config dialog depend on `getLLMService()`
   - `IntelligenceContext` still reasons about local/browser keys and consent separately from server availability

### Direction call

The shortest safe convergence path is:

- authoritative browser/client surface: API-backed LLM client
- demoted legacy surface: `SimpleLLMService`
- removed duplicate adapter over time: `client/src/shims/llm-service.ts`

That matches the codebase reality that newer product-critical flows already use server APIs, while the older browser-key flow survives mostly through UI/config legacy.

## Target Architecture

### Principles

- One browser entrypoint for LLM capabilities.
- One server orchestration layer for model-backed work.
- Core package defines capability-level clients, not provider SDK ownership.
- Local/offline fallback remains possible, but it is explicit and heuristic, not a second hidden "real" LLM stack.

### Proposed layers

#### 1. Browser capability client

Create a single browser-safe client module, for example:

- `packages/core/services/llm/browser-client.ts`

Responsibilities:

- call server endpoints
- expose typed methods for capabilities
- expose server availability/capability metadata
- never store or handle raw provider API keys

Example capability surface:

- `getStatus()`
- `draftGraphFromPrompt()`
- `complete()`
- `suggestChoices()`
- `optimizeWeights()`
- `refineText()`
- `extractMetadata()`
- `analyzeGraph()`

#### 2. Server orchestration layer

Keep provider SDK logic on the server and grow it there:

- `server/src/services/LLMService.ts`

Responsibilities:

- provider credentials
- model selection
- retry/timeout logic
- response normalization
- cost/token accounting
- fallback behavior
- policy enforcement

This service should become the only component allowed to talk to OpenAI/OpenRouter/Anthropic SDKs directly.

#### 3. Feature services built on top of the browser client

Refactor `ApiLLMService.ts` into clearer names, for example:

- `packages/core/services/llm/client/LLMClient.ts`
- `packages/core/services/llm/client/NodeIntelligenceClient.ts`
- `packages/core/services/llm/client/TextRefinementClient.ts`
- `packages/core/services/llm/client/MetadataClient.ts`

The important point is not the exact filenames. The important point is that these are all thin capability clients over server APIs, not alternate engines.

#### 4. Explicit heuristic fallback layer

Preserve useful local fallback behavior, but isolate it:

- `packages/core/services/llm/fallback/heuristics.ts`

This replaces the current ambiguity where `SimpleLLMService` is part parser, part fake LLM, part browser config store.

## Recommended Migration Shape

### Phase 0: Rename and declare source of truth

Before moving behavior, reduce naming ambiguity.

- Keep `server/src/services/LLMService.ts` as the canonical provider runtime.
- Treat `packages/core/services/ApiLLMService.ts` as the canonical browser-side capability client for now.
- Mark `packages/core/services/SimpleLLMService.ts` as legacy.
- Stop introducing new imports from `SimpleLLMService`.

Immediate naming cleanup target:

- rename exported browser class in `ApiLLMService.ts` from `LLMService` to `ApiLLMClient` or `BrowserLLMClient`
- stop exporting two unrelated classes under the same `LLMService` name

If you want the absolute shortest migration with minimal rename churn, an acceptable transitional variant is:

- keep the API-backed browser class named `LLMService`
- rename the legacy class to `LegacySimpleLLMService`
- then migrate consumers before doing any broader naming cleanup

That is less clean architecturally, but lower-risk if you want to preserve consumer ergonomics during the cutover.

### Phase 1: Introduce a stable browser contract

Add one interface that the UI depends on.

Suggested interface:

```ts
export interface LLMCapabilityClient {
  getStatus(): Promise<{
    available: boolean;
    mode: 'server' | 'offline';
    provider?: string;
    defaultModel?: string;
    capabilities: string[];
  }>;
  draftGraphFromPrompt(...): Promise<...>;
  complete(...): Promise<...>;
  suggest(...): Promise<...>;
  metadata(...): Promise<...>;
  refine(...): Promise<...>;
  analyze(...): Promise<...>;
  populateChoices(...): Promise<...>;
  optimizeChoices(...): Promise<...>;
}
```

UI should depend on this interface, not on `SimpleLLMService`.

### Phase 2: Replace legacy UI dependencies

Refactor these to use the browser capability client:

- `packages/core/components/LLMToggle/LLMToggle.tsx`
- `packages/core/components/LLMToggle/LLMToggleInline.tsx`
- `packages/core/components/LLMConfigDialog/LLMConfigDialog.tsx`
- `packages/core/components/epic1/contexts/IntelligenceContext.tsx`

What changes:

- `isEnabled()` becomes `getStatus()` or cached availability state from the server
- `estimateCost()` becomes server-provided estimate or is removed from the toggle
- local API key config UI becomes provider/status/preferences UI

Important UX change:

- replace "enter your API key" with "AI features are configured by the server"
- optional future admin-only settings can live in a separate server/admin surface, not in general browser UI

### Phase 3: Move parser enhancement onto the same client

`PromptDissector` is already closer to the target. Formalize it.

- Merge or align `client/src/shims/llm-service.ts` with the shared browser LLM client
- stop having a launch-screen-specific shim and a different core API client
- route `draftGraphFromPrompt` through the same typed client used elsewhere
- keep endpoint alias fallback logic inside one shared client only during transition, not in individual components

This is a high-value step because it proves the architecture works for product-critical flows, not just side tools.

### Phase 4: Collapse `SimpleLLMService`

Once all UI imports are gone:

- remove `getLLMService()`
- delete local-storage config coupling
- extract any genuinely useful heuristics into a fallback module
- quarantine or remove showcase/demo code that depends on `SimpleLLMService`

Files likely affected:

- `packages/core/services/SimpleLLMService.ts`
- `packages/core/services/LLMParserShowcase.ts`
- `client/vite.config.ts`
- `client/vite.config.production-safe.ts`

The Vite aliases remapping `SimpleLLMService` should disappear by the end of this phase.

At the end of Phase 4, the intended direction is:

- components import one shared API-backed browser client contract
- `SimpleLLMService` no longer acts as the primary UI/client entrypoint
- any remaining heuristic parsing code is isolated as fallback logic, not service identity

### Phase 5: Normalize server contracts

Converge the existing server endpoints into a coherent API family.

Current patterns are mixed:

- `/api/llm/*`
- `/api/llm-*`
- `/api/ai-parse`
- `/api/agent/draft-graph`

Recommended end state:

- `/api/llm/status`
- `/api/llm/complete`
- `/api/llm/suggest`
- `/api/llm/metadata`
- `/api/llm/refine`
- `/api/llm/analyze`
- `/api/llm/populate`
- `/api/llm/optimize`
- `/api/llm/draft-graph`

Keep legacy aliases temporarily, but make one family canonical and document deprecation dates.

### Phase 6: Add the future-facing pieces

Once the stack is unified, add the pieces that matter long term:

- per-capability policies
- provider abstraction on the server
- token/cost telemetry
- request tracing
- caching policy
- rate limiting by capability
- model routing by task type
- structured output schemas as first-class contracts

This is where "LLMs will touch everything" becomes manageable rather than chaotic.

## Migration Risks

### 1. Hidden UI dependencies on legacy methods

`SimpleLLMService` currently provides convenience methods that the newer client does not:

- `isEnabled()`
- `updateConfig()`
- `estimateCost()`
- `parse()`

If those are removed too early, UI regressions will follow.

Mitigation:

- add compatibility adapters first
- migrate UI callsites second
- delete legacy service last

### 2. Consent and availability are currently mixed together

`IntelligenceContext` blends:

- user consent
- local API-key presence
- offline mode
- service construction

Mitigation:

- split policy state from transport state
- consent remains a UI/policy decision
- availability comes from server status

### 3. Endpoint drift

The client shim currently tries multiple endpoint aliases.

Mitigation:

- define one canonical path family
- keep compatibility aliases temporarily on the server
- add tests for canonical paths only

### 4. Browser bundle regressions

The old system has historical bundling workarounds to avoid pulling provider SDKs into the browser.

Mitigation:

- keep all provider SDK imports server-only
- add a browser-bundle verification test that rejects `openai` in client output

## Recommended Order of Implementation

1. Introduce `LLMCapabilityClient` and `getStatus()` endpoint.
2. Rename browser-side `ApiLLMService` exports to remove `LLMService` ambiguity.
3. Migrate `LLMToggle`, `LLMToggleInline`, and `LLMConfigDialog`.
4. Migrate `IntelligenceContext`.
5. Unify `client/src/shims/llm-service.ts` with the shared browser client.
6. Remove `SimpleLLMService` imports and Vite aliases.
7. Quarantine or delete `SimpleLLMService`.
8. Normalize endpoint names and keep temporary aliases.
9. Add telemetry/tests/guardrails.

## Testing and Guardrails

Add or update tests around these contracts:

- browser client unit tests for canonical endpoint calls
- server route tests for `/api/llm/*` and `/api/llm/draft-graph`
- UI tests for "AI available/unavailable" states without local API keys
- bundle verification to ensure no provider SDK leaks into browser builds
- migration guard: forbid new imports from `SimpleLLMService`

Good guardrails:

- ESLint restricted import rule for `SimpleLLMService`
- repo guidance naming `server/src/services/LLMService.ts` as the only provider-runtime owner
- deprecation note in `SimpleLLMService.ts`

## Practical End State

If this migration is done correctly:

- the browser never needs a raw provider key
- all AI features use one typed client contract
- the server can add models/providers without UI churn
- heuristics stay available as explicit fallback behavior
- future AI features plug into an existing capability layer instead of creating more one-off services

That is the right level of "future-proof" for this repo: not overbuilt, but structurally hard to drift again.
