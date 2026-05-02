# Deduplication Assessment

## Critical Assessment

The codebase has a few clear, high-confidence duplication seams, but it does not need a broad abstraction sweep. Most of the active-surface repetition is in tiny utility helpers that were reimplemented in multiple places during the local-sandbox and Supabase/runtime work. Those are safe to consolidate. By contrast, the sandbox setup scripts, checkpoint discovery, and branch/demo content each have intentional duplication across runtime boundaries and should stay separate for now.

The main risk is overcorrecting: collapsing unrelated setup paths, browser/runtime env handling, and deploy scripts into one shared layer would reduce clarity more than it reduces complexity. The best DRY wins here are the small helpers that already behave identically and have no product-specific behavior.

## Concrete Duplication Hotspots

1. Environment lookup and boolean parsing are repeated across `packages/core/utils/runtimeMode.ts`, `packages/core/utils/supabaseFeature.ts`, `server/src/utils/routeAccess.ts`, and `server/src/services/LocalImageSandboxService.ts`.
2. JSON response parsing is duplicated in `packages/core/services/psg/client.ts` and `packages/core/services/localImage/client.ts`.
3. Local image runtime configuration is re-read in several methods inside `server/src/services/LocalImageSandboxService.ts` instead of being assembled once per operation.
4. Sandbox script helpers in `scripts/local-sandbox/*.mjs` intentionally duplicate some runtime checks because they are standalone bootstrap tooling with a different module format and execution model.

## Recommendations

1. Introduce a small shared env utility for the TypeScript runtime surface with `readEnvVar`, `parseBoolean`, and `readEnvNumber`, then use it in core runtime, Supabase feature gating, server route access, and the local image sandbox service.
2. Introduce one shared HTTP response helper for the core API clients and use it in both PSG and local-image clients.
3. Refactor `LocalImageSandboxService` to derive its runtime config once per call path instead of repeating `process.env` lookups in status, batch generation, and prompt payload construction.

## High-Confidence Recommendations

- Shared env utility for TypeScript runtime/server code.
- Shared JSON response helper for the core API clients.
- Local image service runtime config consolidation.

## Lower-Confidence Items Deferred

- Sandbox script helper consolidation across `.mjs` and `.ts` boundaries.
- Checkpoint-name extraction sharing between the sandbox runtime script and the server service.
- Broader comment cleanup or text deduplication in docs and demo assets.
- Any consolidation that would force new package exports or a build-system change.
