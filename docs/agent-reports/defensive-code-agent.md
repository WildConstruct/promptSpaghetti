# Defensive Programming / Try-Catch Cleanup - Batch 2 Agent 6

## Scope

Audited active TS/JS source under `client/src`, `packages/core`, `packages/asset-browser`, and `server/src` using:

```sh
rg "try\s*\{|catch\s*\(|catch\s*\{|fallback|Ignore|ignore|silently" client/src packages/core packages/asset-browser server/src
```

After excluding generated `dist`, tests, and backup files for triage, the scoped source still has about 277 catch sites. Most are boundary-oriented rather than purely defensive noise.

## Implemented Cleanup

- `client/src/App.tsx`
  - Fixed localStorage write failures so they no longer prevent launch/back navigation.
  - Kept the localStorage boundary catch, but changed it from control-flow suppression to warning plus continued UI transition.
- `client/src/env-shim.ts`
  - Removed a no-op top-level catch around static Vite env reads and `globalThis.__env__` assignment.
  - If this shim breaks, startup should fail visibly instead of silently losing runtime env diagnostics.
- `client/src/ThemeProvider.tsx`
  - Added an explicit `fetch` availability guard before the optional theme request.
  - This keeps local/test environments graceful without relying on a promise `.catch()` that cannot run when `fetch` is undefined.
- `packages/core/hooks/useRuntimeMode.ts`
  - Removed a redundant `.catch()` after `Promise.allSettled`.
  - Individual API failures are already represented by rejected settled results and converted to `null` status values.
- `server/src/utils/rateLimit.ts`
  - Preserved existing fail-open behavior but added a warning when the limiter cannot evaluate a bucket.
  - This avoids silently disabling rate limiting if internal assumptions break.

## Intentional Boundary Catches Kept

- `packages/core/services/http.ts`
  - `readJsonResponse` intentionally returns `null` for malformed/non-JSON responses. This is the right API boundary for optional error payloads.
- `packages/asset-browser/src/utils/storage.ts`
  - Catches around localStorage availability, reads/writes, and stored JSON parsing are intentional browser API boundaries.
- `client/src/services/fileService.ts`, `packages/core/services/ApiLLMService.ts`, `client/src/stores/authStore.ts`
  - Response error parsing catches preserve useful fallback messages when servers return non-JSON errors.
- `server/src/routes/psg.ts`, `server/src/routes/localImage.ts`, `server/src/services/LocalImageSandboxService.ts`
  - Route/service catches convert validation, runtime, fetch, and filesystem/process boundary failures into explicit API responses.
- `packages/core/services/PromptParser.ts`, `packages/core/services/ParserFallback.ts`, `packages/core/services/TreeBuilder.ts`
  - LLM/JSON parsing failures fall back to deterministic parser or template behavior; this is product behavior, not accidental swallowing.
- LocalStorage/preferences/consent surfaces in `packages/core/hooks/useLocalStorageToggle.ts`, `packages/core/services/preferences.ts`, `packages/core/services/consent.ts`, and `packages/core/components/epic1/GraphCommander.tsx`
  - These should remain tolerant of security-restricted storage and malformed legacy state.

## Deferred Hotspots / Recommendations

- `packages/core/components/epic1/hooks/useDragDropHandlers.ts`
  - Many nested catches handle drag payload parsing, manifest probing, fallback layouts, and visual bounce animations. Most are reasonable boundaries, but the file mixes business-critical parsing with best-effort UI effects. A future pass should split helper functions and log only failed preset insertion/layout cases.
- `packages/asset-browser/src/components/ProAssetBrowser.tsx`
  - Manifest probing intentionally tries multiple URLs, but the catch at the drag image setup is a silent DOM boundary. Low priority: convert to a debug-only warning if drag image regressions become hard to diagnose.
- `packages/core/components/epic1/Epic1GraphEditor.tsx`
  - Supabase session init and unsubscribe catches are defensive. Recommend logging session init failure, but avoid changing now because the file is large and actively edited.
- `server/src/admin-panel-enhanced.ts` and `server/src/theme.ts`
  - Admin/theme routes contain many catches around database calls, request handling, and config persistence. They look route-boundary oriented, but deserve a dedicated server-admin pass because changing them can alter operator UX.
- `packages/core/services/llm/*`
  - Retry/fallback catches are generally meaningful. The highest-value future improvement is structured error metadata rather than catch removal.
- `packages/core/runtime/presetInsertion.ts`
  - The empty JSON catch only decides whether imported fragment positions should be preserved before `insertPreset` performs real validation. It is safe but under-explained; a future small cleanup could add a reason comment or helper.

## Assessment

The codebase has many catch blocks because it touches untrusted graph JSON, optional server features, browser storage, drag/drop payloads, LLM responses, and local runtime services. Removing catches broadly would make the app more brittle. The high-confidence fixes were places where error handling either hid an impossible/internal failure, duplicated settled-promise behavior, or accidentally changed user-facing control flow.
