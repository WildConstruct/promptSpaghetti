# First Commit Slice

_Last updated: 2026-03-08_

This is the recommended first clean commit slice for the MVP wrap-up branch.

## Purpose

Commit the wedge and first-run teaching improvements together as one coherent product shift.

Do not mix in:

- asset-library churn
- broad PSG infrastructure work
- unrelated deployment drift
- generated-output noise outside the explicitly audited cases

## Commit intent

Good commit messages:

- `refine first-run MVP around archetype/family logic`
- `align launch surface to archetype and controlled variation wedge`

## Include

- [client/src/components/LaunchScreen/LaunchScreen.tsx](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/client/src/components/LaunchScreen/LaunchScreen.tsx)
- [client/src/components/LaunchScreen/LaunchScreen.css](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/client/src/components/LaunchScreen/LaunchScreen.css)
- [client/src/components/LaunchScreen/NodePreview.tsx](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/client/src/components/LaunchScreen/NodePreview.tsx)
- [client/src/components/LaunchScreen/NodePreview.css](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/client/src/components/LaunchScreen/NodePreview.css)
- [client/src/components/LaunchScreen/QuickActions.tsx](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/client/src/components/LaunchScreen/QuickActions.tsx)
- [client/src/components/LaunchScreen/QuickActions.css](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/client/src/components/LaunchScreen/QuickActions.css)
- [client/src/components/LaunchScreen/__tests__/LaunchScreenQuickActions.test.tsx](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/client/src/components/LaunchScreen/__tests__/LaunchScreenQuickActions.test.tsx)
- [client/src/templates/quickStartTemplates.ts](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/client/src/templates/quickStartTemplates.ts)
- [docs/mvp-alignment.md](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/docs/mvp-alignment.md)
- [docs/mvp-finish-plan.md](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/docs/mvp-finish-plan.md)
- [docs/demo-checklist.md](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/docs/demo-checklist.md)
- [docs/mvp-ship-verification.md](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/docs/mvp-ship-verification.md)
- [docs/mvp-task-board.md](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/docs/mvp-task-board.md)
- [docs/first-run-walkthrough-note.md](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/docs/first-run-walkthrough-note.md)
- [docs/first-commit-slice.md](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/docs/first-commit-slice.md)

## Review before staging

- [client/src/components/LaunchScreen/PromptDissector.tsx](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/client/src/components/LaunchScreen/PromptDissector.tsx)
- [client/src/components/LaunchScreen/PromptDissector/hooks/useParsingEngine.ts](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/client/src/components/LaunchScreen/PromptDissector/hooks/useParsingEngine.ts)

Those files are in the launch area but also overlap with the LLM convergence lane. Keep them out of this first slice unless there is a direct first-run wedge reason to include them.

## Exclude

- `assets/library/**`
- `packages/*/dist/**` except audited keepers needed for build correctness
- `packages/custom-node-sdk/dist/**`
- `pnpm-lock.yaml` unless a final dependency review says it is required
- deployment convergence files unrelated to the first-run wedge
