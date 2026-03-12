# Windsurf Instructions

These instructions are repo-specific. Follow them over stale local patterns when they conflict.

## Source Of Truth

- Epic 1 editor: `packages/core/components/epic1/Epic1GraphEditor.tsx` is canonical.
- Do not treat `packages/core/components/epic1/Epic1GraphEditorRefactored.tsx` as the product-authoritative editor.
- Treat `packages/core/components/epic1/REFACTORING_GUIDE.md` and `packages/core/components/epic1/ARCHITECTURE.md` as historical notes unless they are updated alongside the live source-of-truth files.
- Epic 1 guidance files that must stay aligned:
  - `packages/core/components/epic1/SOURCE_OF_TRUTH.md`
  - `packages/core/components/epic1/AGENTS.md`
  - `packages/core/components/epic1/index.ts`
  - `packages/core/index.ts`

- Server runtime: `server/src/index.ts` is canonical.
- Do not treat alternate mains in `server/src/` as live runtime unless the source-of-truth docs and scripts are updated in the same change.

- LLM direction: converge on one API-backed browser client surface.
- Do not introduce new primary UI/client usage of `packages/core/services/SimpleLLMService.ts`.
- Keep provider keys, provider SDKs, model routing, and retry policy on the server.

## Editor Rules

- Do not add new product imports of `Epic1GraphEditorRefactored.tsx`.
- If you touch Epic 1 docs or exports, keep all source-of-truth files consistent in the same change.
- If you propose reviving the refactored editor, first prove feature parity with the monolith across:
  - preview tray flow
  - import/export flow
  - undo/redo history
  - selection helpers
  - tutorial/auth/wizard integrations
  - prompt-to-node conversion behavior

## LLM Rules

- Do not add new imports from `packages/core/services/SimpleLLMService.ts`.
- Prefer one shared API-backed browser client contract used by:
  - shared core UI
  - launch screen parsing flows
  - future AI features
- Do not add endpoint fallback logic inside components.
- If temporary endpoint compatibility is required, keep that fallback in one shared client only.
- Treat `client/src/shims/llm-service.ts` as transitional, not the long-term source of truth.

## Server Rules

- Do not add new `.bak` entrypoints or alternate mains under `server/src/` unless explicitly quarantined and documented.
- Prefer quarantining experiments under `server/src/_quarantined/`.
- Keep `server/package.json` and `server/tsconfig.json` aligned with the canonical runtime entrypoint.

## Review Bias

- Prefer deleting ambiguity over adding abstractions.
- Flag contradictions between live code, exports, tests, and docs.
- Treat historical docs as stale unless they match current imports and runtime paths.
- If there are two competing implementations, do not “keep both” by default. Pick the live one, quarantine the other, or prove the migration.

## Working Style

- Make small, source-of-truth-preserving changes first.
- When cleanup is architectural, document the direction before broad code churn.
- Do not rewrite large surfaces opportunistically when a narrower convergence step is available.

## Active References

- Epic 1 source of truth:
  - `packages/core/components/epic1/SOURCE_OF_TRUTH.md`
  - `packages/core/components/epic1/AGENTS.md`
- Server source of truth:
  - `server/AGENTS.md`
- LLM migration direction:
  - `docs/llm-stack-migration-plan.md`
