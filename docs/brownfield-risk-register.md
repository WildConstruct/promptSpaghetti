# Brownfield Risk Register

_Last updated: 2026-04-12_

This register orders brownfield risks by delivery impact, not code style.

The intent is to make follow-on implementation and Phase 4 stabilization land in
the right places without broad cleanup first.

## Risk Register

| Severity | Gate | Bucket | Risk | Why it matters | Evidence | Immediate action | Deferred action |
| --- | --- | --- | --- | --- | --- | --- | --- |
| High | Must address before Phase 4 execution | source-of-truth conflicts | Editor ownership is split between the client shell and the core monolithic canvas, while docs previously implied a single in-package editor entry. | Work can land in the wrong seam and increase drift between shell behavior and canvas behavior. | `client/src/Epic1Editor/Epic1EditorContainer-refactored.tsx`, `packages/core/components/epic1/Epic1GraphEditor.tsx`, `packages/core/components/epic1/SOURCE_OF_TRUTH.md` | Document shell owner vs canvas owner explicitly and treat the shell-plus-canvas pair as the supported editor path. | Reduce duplication between the shell and core-only editor surfaces after build/deploy stabilization. |
| High | Must address before Phase 4 execution | duplicate or drifting runtime paths | The repo still carries multiple alternate server mains plus a legacy `api/` deployment surface while `server/src/index.ts` is the canonical runtime. | Build and deploy work can stabilize the wrong backend path or overstate what production is serving. | `server/src/index.ts`, `server/src/index-cleaned.ts`, `server/src/server-minimal.ts`, `api/`, `docs/deployment-current-state.md` | Keep `server/src/index.ts` as canonical in docs and mark `api/` as deployment compatibility only. | Migrate Vercel off the legacy `api/` surface or formally retire the Fastify/Vercel split. |
| High | Must address before Phase 4 execution | misleading or overexposed product surface | The live editor exposes broader tabs and dialog paths than the current MVP story, including search, relationships, component tooling, scene assets, crowd expansion, and Comfy export. | Users and implementers can mistake secondary or partially supported flows for the launch wedge. | `packages/core/components/epic1/TabbedSidePanel.tsx`, `client/src/Epic1Editor/Epic1EditorContainer-refactored.tsx`, `docs/mvp-alignment.md` | Publish an MVP recovery backlog that distinguishes golden-path MVP flows from secondary or deferred surfaces. | Hide, relabel, or narrow non-MVP actions after stabilization begins. |
| Medium | Phase 4 input; safe to defer implementation until then | deploy/runtime mismatch | Deployment truth is honest in docs but still structurally misaligned: Netlify build targets the frontend while Vercel still fronts the legacy API surface. | Release verification and incident debugging will remain confusing until one deploy model is authoritative. | `docs/deployment-current-state.md`, `netlify.toml`, `vercel.json` | Keep deploy docs explicit and avoid claiming Vercel serves the canonical Fastify runtime. | Converge hosting on one clearly owned backend path. |
| Medium | Phase 4 input; safe to defer implementation until then | test harness/config drift | The repo has multiple Jest layers, specialized configs, and known config drift that can fail tests for harness reasons before product reasons. | Validation work during stabilization will be noisy and expensive unless the canonical harness model is clarified. | `docs/test-harness-repair-epic.md`, `jest.config.js`, package-level Jest configs | Keep this as a named Phase 4 workstream and avoid expanding test entry-point sprawl now. | Consolidate harness ownership, setup layers, and root scripts in stabilization. |
| Medium | Safe to defer until after stable build/deploy | repo bloat / stale artifacts | The repo contains many generated files, historical docs, alternate implementations, and one-off reports. | Broad deletion now would add risk and slow the recovery, but leaving the boundary implicit invites accidental edits. | `docs/launch-repo-trim-plan.md`, QA reports, backup files, alternate mains | Quarantine via source-of-truth docs and keep trim work prepared but not executed. | Run a deliberate repo trim after the active runtime is stable. |
| Low | Safe to defer | package boundary drift | `packages/custom-node-sdk`, `packages/cli`, and `python-executor` live in the workspace orbit but are not part of the MVP app path. | Engineers may overestimate their launch relevance or spend time stabilizing the wrong package set. | package manifests, `ACTIVE_SURFACE.md` | Mark them as support-only, non-MVP surfaces. | Re-scope or split them into separate workstreams if they become product-critical later. |

## Interpretation

- High risks block productive stabilization because they make it unclear where
  the real product lives.
- Medium risks should shape Phase 4 but do not require immediate repo surgery.
- Low risks need labeling, not urgent implementation.

## Current Rule

Prefer quarantine, deprecation markers, and contract tightening over deletion in
this phase.
