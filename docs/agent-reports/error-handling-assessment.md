# Error Handling Assessment

## Summary

I reviewed the Epic 1 and related utility code for unnecessary `try/catch` and equivalent defensive wrappers that hide failures without serving a clear boundary role.

The strongest pattern in this codebase is that many `try/catch` blocks are doing legitimate work at boundaries:
- browser storage reads and writes
- JSON parsing of user-authored or imported content
- async calls into optional intelligence or preview systems
- cleanup around external observers or drag-and-drop events

Those should generally stay. The cleanup work in this pass targeted only wrappers that were clearly redundant or were masking a deterministic internal lookup.

## Critical Assessment

The codebase has a real tendency to blur two different cases:

- boundary handling, where a failure is expected and should be converted into a safe fallback or a user-visible error
- internal programming errors, where the right answer is to let the exception surface or to remove the wrapper entirely

That distinction is important here because several wrappers currently collapse internal mistakes into silent fallbacks. That makes diagnosis harder and can hide regressions in Epic 1 graph behavior.

## Examples Reviewed

High-confidence cleanup:

- `packages/core/components/epic1/nodes/NodeContextMenu.tsx`
  - The Help action wrapped `getDocUrl(...)` in `try/catch`, then fell back to `/docs/index.md`.
  - `getDocUrl` is a deterministic local mapping and already has its own fallback, so the outer wrapper was redundant and obscured failures.

- `packages/core/components/epic1/nodes/EnhancedBranchingNode.tsx`
  - The `ResizeObserver` and `MutationObserver` cleanup path wrapped `disconnect()` in `try/catch`.
  - Those cleanup calls are not handling untrusted input or a network/storage boundary; failures there should not be hidden.

Examples I reviewed but left in place because they serve a real role:

- `packages/core/components/epic1/hooks/presetSourcePolicy.ts`
  - JSON parsing of inline preset content is a content-validation boundary.

- `packages/core/components/epic1/hooks/useGraphPreview.ts`
  - Runtime graph conversion is part of the preview pipeline and already degrades safely if the graph is malformed.

- `packages/core/components/epic1/GraphCommander.tsx`
  - LocalStorage reads/writes can fail in real browsers, so the wrapper protects a browser storage boundary.

- `packages/core/components/epic1/contexts/PreviewContext.tsx`
  - Per-seed preview execution needs to keep going when one seed fails.

## Recommendations

1. Keep removing wrappers only when the code is doing deterministic internal work and the wrapper only suppresses bugs.
2. Keep wrappers that protect browser storage, imported content, preview execution, or optional remote services.
3. Prefer explicit error propagation for internal logic and use boundary-specific handling only where the failure mode is expected.
4. When a fallback is required, make it obvious and narrow, not silent and generic.

## High-Confidence Changes Implemented

- Removed the Help-menu fallback wrapper in `packages/core/components/epic1/nodes/NodeContextMenu.tsx`.
- Removed the observer cleanup `try/catch` blocks in `packages/core/components/epic1/nodes/EnhancedBranchingNode.tsx`.

## Residual Risks

- The codebase still contains many `try/catch` blocks that are appropriate boundary handling and should not be removed blindly.
- Some preview and import pipelines still return fallback values on malformed graph data; those should be reviewed separately if the goal is to make failures more explicit.
