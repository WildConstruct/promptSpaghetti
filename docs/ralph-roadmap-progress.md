# RALPH Roadmap Progress

_Last updated: 2026-05-05_

This file records the handoff for each roadmap project before the next RALPH
loop begins.

## 1. MVP Manual Smoke Closeout

### R - Read

- Confirmed branch: `codex/integrate-stabilize-baseline-to-main`.
- Confirmed worktree was clean before this documentation slice.
- Reviewed:
  - `docs/mvp-ship-verification.md`
  - `docs/demo-checklist.md`
  - launch screen/editor route files surfaced by active docs
  - SimpleMenuBar/editor surface labels
  - scene-assets, Comfy, hosted crowd, and local sandbox menu gates

### A - Assess

Gap summary:

- The launch, quick-start, tutorial, prompt bootstrap, editor load, local PSG
  import, flat PSG export, and crowd sidecar paths are demoable.
- Comfy export, local sandbox generation, and hosted crowd expansion remain
  runtime/capability gated in the local smoke environment and should not be
  claimed as fully exercised by this loop.
- The family snapshot has a minor grammar rough edge when parsed segments retain
  leading conjunctions, but the fixed-vs-variation rewrite behavior works and is
  not a demo blocker.

Blockers:

- Product: none found for the core demo flow.
- Technical: none requiring code changes in this slice.
- Environment: Browser Use/node_repl was unavailable because the configured
  Node runtime was below the plugin requirement; Playwright from repo
  dependencies was used instead. Headless browser launch required escalation in
  this Codex environment.
- External service: hosted crowd/cloud PSG, local Comfy, and local sandbox
  generation were not configured for live runtime checks.

Acceptance criteria for this slice:

- Quick-start launch cards reach the editor.
- Prompt bootstrap reaches the editor.
- Preview can show a parsed family member and fixed/variation rewrite.
- Tutorial reaches the editor.
- Save/open/local import/export surfaces are present and representative local
  export/import flows work.
- Scene-assets/crowd sidecar paths are present.
- Runtime-gated paths remain clearly labeled rather than faking success.

### L - List

Completed task list:

- Smoke launch cards: Character, Indy 500, Vehicle, Building, Blank Canvas.
- Smoke tutorial launch.
- Smoke prompt parse plus `Build PSG Family Graph`.
- Smoke prompt parse plus `Show Preview`, select trait, and move it to allowed
  variation.
- Smoke editor File menu labels and runtime-gated states.
- Smoke Save PSG, Open PSG, Open Local PSG with
  `docs/examples/mvp-vehicle-family-demo.psg`, and Export PSG download.
- Smoke `Advanced PSG Scene Assets...` from the Indy crowd quick start.
- Update MVP verification docs with pass/fail findings.

Explicit deferrals:

- Full Comfy bridge preview/download until a runtime-capable environment is
  available.
- Local sandbox 20-output generation and capture until Comfy is running with the
  pinned checkpoint.
- Hosted crowd generation/save until cloud PSG/auth are configured.
- Grammar polish for parsed family snapshot conjunction handling unless it
  becomes a demo comprehension issue.

### P - Patch

Documentation-only patch:

- Updated `docs/mvp-ship-verification.md` with 2026-05-05 browser smoke results,
  current build gate status, runtime-gated notes, and remaining unchecked items.
- Added this RALPH handoff file.

No product code changes were made in Project 1 because no core demo blocker was
identified.

### H - Handoff

Validation for this handoff:

- Passed after documentation patch:
  - `pnpm run validate:active`
  - `pnpm run validate:mvp:ship`
  - `pnpm run validate:artifacts:active`

Validation notes:

- The initial sandboxed `corepack pnpm run validate:active` attempt failed on
  Corepack cache access with `EPERM`; the same command passed after escalation.
- Vite emitted the existing large-chunk warning during build, but validation
  passed.

Next RALPH loop:

- Project 2: Deferred Image Generation Review.
- Start by comparing the deferred `origin/main` image bootstrap / scene-preview
  work against the branch-biased integration state, without weakening the
  current crowd/tool UX source of truth.

## 2. Deferred Image Generation Review

### R - Read

- Reviewed `docs/deferred-image-generation-review.md`.
- Compared current branch files against `origin/main` for image/bootstrap/scene
  preview changes.
- Sampled representative `origin/main` files:
  - `PsgImageBootstrapDialog.tsx`
  - `ScenePreviewV1Panel.tsx`
  - `ImageBootstrapAnalysisService.ts`
  - image route additions in `server/src/routes/psg.ts`
  - `docs/epic-image-reference-graph-bootstrap.md`
  - `docs/image-generation-done-roadmap.md`

### A - Assess

Gap summary:

- `origin/main` has a coherent image-bootstrap feature lane, but it is not a
  narrow compatibility patch.
- Restoring it now would widen active PSG operations, add hosted image routes,
  and introduce new editor surfaces before Cloud PSG/Auth Isolation and
  Deployment Convergence are settled.
- The current branch already keeps image-related output bounded through Comfy
  export contracts, scene assets, and optional local sandbox generation.

Blockers:

- Product: decide whether image bootstrap is post-MVP or an explicit
  feature-flagged beta lane.
- Technical: restore image contracts/routes/services as one scoped lane, not
  piecemeal into stabilization.
- Environment: no live image backend was available for verification.
- External service: segmentation/preview backend selection remains open.

Acceptance criteria for this slice:

- Decide whether any `origin/main` image code belongs in the active product now.
- Preserve crowd/tool UX and active-surface boundaries.
- Document the deferred image lane and next safe implementation slice.

### L - List

Completed task list:

- Identify `origin/main` image-bootstrap and scene-preview files.
- Confirm the current branch lacks the corresponding image contracts/routes.
- Decide that no image UI/API code should be restored in this stabilization
  pass.
- Update the deferred review with comparison, rationale, and next slice.

Explicit deferrals:

- `PsgImageBootstrapDialog`
- `ImageBootstrapSelectionPanel`
- `ScenePreviewV1Panel`
- `/api/psg/images/*`
- image preview providers/backends
- image segmentation provider seam
- image bootstrap provenance/storage utilities
- image bootstrap browser/performance specs
- ComfyUI custom node package

### P - Patch

Documentation-only patch:

- Expanded `docs/deferred-image-generation-review.md` with the Project 2
  decision record and implementation handoff.
- Updated this RALPH progress file.

No image-generation product code was restored.

### H - Handoff

Validation for this handoff:

- Passed after documentation patch:
  - `pnpm run validate:active`
  - `pnpm run validate:mvp:ship`

Validation notes:

- Vite emitted the existing large-chunk warning during the build phases, but the
  active and MVP ship gates passed.

Next RALPH loop:

- Project 3: Cloud PSG + Auth Isolation.
- Start with Supabase login/session restore and cloud PSG save/open/update/delete
  checks before adding billing behavior.

## 3. Cloud PSG + Auth Isolation

### R - Read

- Reviewed Cloud PSG/Auth docs and implementation paths:
  - `docs/epic-auth-billing-cloud-psg-readiness.md`
  - `docs/supabase-external-verification-checklist.md`
  - `docs/object-access-review-matrix.md`
  - `client/src/Epic1Editor/hooks/useSupabaseFileOperations.ts`
  - `packages/core/utils/supabaseClient.ts`
  - `packages/core/utils/supabaseFeature.ts`
  - `packages/core/utils/runtimeMode.ts`
  - `server/src/services/supabase.ts`
  - `server/src/utils/routeAccess.ts`
- Checked local Supabase config keys without printing secret values.

### A - Assess

Gap summary:

- Local auth/cloud PSG code exists and is wired.
- Live proof is blocked in this workspace because Supabase URL/key values are
  empty in `.env`.
- Cross-user graph isolation remains dependent on deployed Supabase RLS/storage
  policy, not just app code.
- Billing should be modeled as Stripe events syncing into Supabase-owned
  subscription state before Stripe routes are added.

Blockers:

- Environment: missing Supabase URL/key.
- External service: missing two live non-admin test accounts and RLS/storage
  policy review.
- Product: billing source of truth needed before checkout/webhook behavior.

Acceptance criteria for this slice:

- Do not fake live Supabase proof.
- Confirm local code paths and environment state.
- Document exact live-verification deferrals.
- Define billing/subscription source of truth before Stripe implementation.

### L - List

Completed task list:

- Confirmed local Supabase env is not configured.
- Confirmed session restore, auth-state subscription, save/open/update/delete,
  and route auth/capability/quota code paths exist.
- Updated auth/billing readiness docs with Project 3 RALPH findings.
- Defined Supabase as the runtime subscription source of truth, with Stripe as
  payment event source.

Explicit deferrals:

- live Supabase login/session restore
- live cloud PSG save/open/update/delete
- two-user graph isolation
- storage bucket isolation
- route capability/quota denial in deployed environment
- Stripe checkout/portal/webhook implementation

### P - Patch

Documentation-only patch:

- Expanded `docs/epic-auth-billing-cloud-psg-readiness.md` with the Project 3
  local-readiness findings, blockers, live-verification handoff, and billing
  source-of-truth decision.
- Updated this RALPH progress file.

No product code was changed.

### H - Handoff

Validation for this handoff:

- Passed after documentation patch:
  - `pnpm run validate:active`
  - `pnpm run validate:mvp:ship`

Validation notes:

- Vite emitted the existing large-chunk warning during build phases, but the
  active and MVP ship gates passed.

Next RALPH loop:

- Project 4: Deployment Convergence.
- Start by deciding whether the post-MVP target is Vercel API-only, canonical
  Fastify on Vercel, or a different backend host.

## 4. Deployment Convergence

### R - Read

- Reviewed:
  - `docs/vercel-convergence-decision.md`
  - `docs/deployment-current-state.md`
  - `docs/active-deploy-packaging-lane.md`
  - `vercel.json`
  - `netlify.toml`
  - `scripts/deploy/deploymentSurface.config.mjs`
  - `scripts/deploy/verifyDeploymentSurface.mjs`
  - `scripts/deploy/runDeployPackaging.mjs`

### A - Assess

Gap summary:

- MVP packaging is honest and passes locally.
- The backend runtime is still structurally split between canonical Fastify
  source and a legacy Vercel API compatibility surface.
- Keeping Vercel API-only would turn legacy compatibility into product
  architecture.
- Migrating Fastify onto Vercel is possible, but still keeps this branch tied to
  a currently placeholder/API-only Vercel config.

Decision:

- Post-MVP backend direction is `dedicated-fastify-backend`.
- Keep the Netlify/static frontend model.
- Move `server/src/index.ts` to a dedicated Fastify backend host when the
  migration project starts.
- Retire Vercel `api/` after the dedicated backend passes route/catalog/auth
  verification.

### L - List

Completed task list:

- Chose the post-MVP backend direction.
- Updated deploy docs with the selected direction and canonical backend entry.
- Added deploy-surface validation checks so docs/config agree on that direction.

Explicit deferrals:

- selecting the actual backend provider
- changing Netlify proxy origin
- deleting or migrating `api/`
- remote deploy verification
- Vercel retirement

### P - Patch

Patched:

- `scripts/deploy/deploymentSurface.config.mjs`
- `scripts/deploy/verifyDeploymentSurface.mjs`
- `docs/vercel-convergence-decision.md`
- `docs/deployment-current-state.md`
- `docs/active-deploy-packaging-lane.md`
- this RALPH progress file

### H - Handoff

Validation for this handoff:

- Passed after patch:
  - `pnpm run validate:deploy:active`
  - `pnpm run validate:mvp:ship`

Validation notes:

- Deploy config consistency now checks the post-MVP backend direction and
  canonical Fastify entry across config/docs.
- Vite emitted the existing large-chunk warning during build phases, but the
  deploy and MVP ship gates passed.

Next RALPH loop:

- Project 5: Agentic Fragment Retrieval.
- Start with the asset-browser/core insertion planner tests and make
  replace-vs-insert-edge intent explicit.

## 5. Agentic Fragment Retrieval

### R - Read

- Reviewed:
  - `docs/asset-browser-agent-suggestions-plan.md`
  - `docs/agent-fragment-index-implementation.md`
  - `packages/core/components/epic1/services/FragmentInsertionPlanner.ts`
  - `packages/core/components/epic1/services/AgentFragmentSuggestionService.ts`
  - `packages/core/components/epic1/services/FragmentExecution.ts`
  - `packages/core/components/epic1/services/FragmentDropTargeting.ts`
  - `packages/core/components/epic1/hooks/useDragDropHandlers.ts`
  - `packages/core/components/epic1/hooks/useGraphDragDrop.ts`
  - existing drag/drop helper tests

### A - Assess

Gap summary:

- Manual drag already had explicit drop targets and edge/node execution paths.
- Suggested-fragment click/top-insert actions still inferred intent indirectly
  from planner fields like `targetEdgeId`.
- The planner did not expose a first-class replace/edge/container/free-place
  execution target for commander/future-agent consumers.
- Rich ambiguous multi-node splice still needs curated entry/exit boundary
  metadata and should remain a later slice.

Blockers:

- Product: none for making current deterministic suggestion execution explicit.
- Technical: full Epic 1 component test harness has unrelated existing failures
  and cannot be used as a clean Project 5 gate.
- Environment: Corepack still requires escalation for pnpm cache access.
- External service: none.

Acceptance criteria for this slice:

- Planner returns explicit insertion intent.
- Suggested-fragment actions pass that plan into editor execution.
- Replace-vs-insert-edge labels come from intent, not heuristic fields.
- Future top-suggestion agent hook uses the same suggestion/planner/editor seam.
- Focused insertion tests cover replacement, edge insertion, free placement, and
  suggestion execution plan handoff.

### L - List

Completed task list:

- Added `InsertionIntent` to `FragmentInsertionPlanner`.
- Added explicit `replace-node`, `insert-edge`, `inside-container`, and
  `free-place` planner outputs.
- Passed planned suggestion insertion through `AgentFragmentSuggestionService`,
  `SuggestedFragmentsPanel`, `TabbedSidePanel`, and `Epic1GraphEditor`.
- Preserved drag-drop execution through the existing shared insertion routine.
- Added focused planner/service tests.
- Updated fragment retrieval docs with the new shared seam and remaining
  boundary-metadata deferral.

Explicit deferrals:

- explicit curated entry/exit IDs for ambiguous multi-node fragments
- richer multi-node splice using those boundary IDs
- a live agent consumer beyond the deterministic editor hook
- unrelated Epic 1 test harness repair

### P - Patch

Patched:

- `packages/core/components/epic1/services/FragmentInsertionPlanner.ts`
- `packages/core/components/epic1/services/AgentFragmentSuggestionService.ts`
- `packages/core/components/epic1/SuggestedFragmentsPanel.tsx`
- `packages/core/components/epic1/TabbedSidePanel.tsx`
- `packages/core/components/epic1/Epic1GraphEditor.tsx`
- `packages/core/components/epic1/services/__tests__/FragmentInsertionPlanner.test.ts`
- `docs/asset-browser-agent-suggestions-plan.md`
- `docs/agent-fragment-index-implementation.md`
- this RALPH progress file

### H - Handoff

Validation for this handoff:

- Passed:
  - `pnpm run typecheck:active`
  - `pnpm run test:epic1:components --runInBand services/__tests__/FragmentInsertionPlanner.test.ts hooks/__tests__/useDragDropHandlers.test.ts`
  - `pnpm run validate:active`
  - `pnpm run validate:mvp:ship`

Validation notes:

- Full `pnpm run test:epic1:components --runInBand` was run for signal and
  failed on existing unrelated harness/test drift:
  - `@/utils/performance/PerformanceMonitor` and `@/stores/graphStore` module
    mapping gaps
  - `react-dnd` ESM transform gap
  - existing MicroInteractions, presetUtils, FragmentContainer,
    BaseEditableNode, and TabbedSidePanel expectation drift
- The focused Project 5 planner/drag-drop tests passed.
- Active and MVP ship validation passed with the existing Vite large-chunk
  warning.

Next RALPH loop:

- Project 6: Local Sandbox Generation.
- Start by validating the local Comfy setup/runtime lane and keep all generation
  claims explicitly local-only.

## 6. Local Sandbox Generation

### R - Read

- Reviewed:
  - `docs/local-sandbox-tree-demo.md`
  - `docs/demo-checklist.md`
  - `docs/mvp-handoff-status.md`
  - `scripts/local-sandbox/localSandboxRuntime.mjs`
  - `scripts/local-sandbox/runLocalSandboxRuntime.mjs`
  - `scripts/local-sandbox/runLocalSandboxDemoValidation.mjs`
  - `scripts/validation/localSandbox.config.mjs`
  - `scripts/validation/runLocalSandboxValidation.mjs`
  - `server/src/services/LocalImageSandboxService.ts`
  - `server/src/routes/localImage.ts`
  - `client/src/Epic1Editor/components/LocalSandboxGenerationDialog.tsx`
  - `client/src/Epic1Editor/localSandboxPromptDerivation.ts`
  - local sandbox server/client tests

### A - Assess

Gap summary:

- Local sandbox code paths already exist and are intentionally local-only:
  `/api/local-image/status`, `/api/local-image/batch`, and generated file
  reads are separated from hosted/public image generation.
- Smoke coverage already proves the server routes, runtime status behavior,
  dialog disabled state, 20-tree request, and scene-asset capture callback.
- Live runtime validation is blocked in this workspace because the local
  sandbox env is not enabled and no local Comfy runtime/checkpoint was proven.
- The operator doc referenced an old absolute path, and the env template named
  by docs/scripts was missing from the worktree.
- The dialog had stale SDXL fallback copy even though the supported v1 lane is
  Flux Schnell FP8.

Blockers:

- Environment: `ENABLE_LOCAL_IMAGE_SANDBOX` is not enabled locally.
- External-service/local-runtime: no reachable Comfy runtime with
  `flux1-schnell-fp8.safetensors` was available for live generation.
- Product: none for keeping the lane local-only.
- Technical: none for smoke validation.

Acceptance criteria for this slice:

- Keep local sandbox clearly labeled local-only.
- Preserve the pinned Flux Schnell FP8 checkpoint as the supported v1 target.
- Prove smoke tests for local routes/dialog/capture still pass.
- Run runtime preflight and document the honest blocker instead of faking live
  generation.
- Leave full 20-output live generation and capture as pending until Comfy is
  actually running.

### L - List

Completed task list:

- Ran the local sandbox smoke lane.
- Ran the runtime preflight and captured the disabled-env blocker.
- Added the missing local sandbox env template.
- Allowed tracked `.env*.example` templates while keeping real env files
  ignored.
- Updated the tree-demo guide links to this workspace.
- Fixed stale SDXL fallback copy in the local sandbox dialog.
- Added dialog assertions for the pinned Flux Schnell FP8 checkpoint copy.

Explicit deferrals:

- live `validate:local-sandbox:runtime` pass
- live `validate:local-sandbox:demo` pass
- actual 20-output Comfy generation
- capture of a real generated batch into PSG Scene Assets
- checkpoint/provider switching

### P - Patch

Patched:

- `.gitignore`
- `.env.local-sandbox.example`
- `docs/local-sandbox-tree-demo.md`
- `client/src/Epic1Editor/components/LocalSandboxGenerationDialog.tsx`
- `client/src/Epic1Editor/components/__tests__/LocalSandboxGenerationDialog.test.tsx`
- this RALPH progress file

### H - Handoff

Validation for this handoff:

- Passed:
  - `pnpm run validate:local-sandbox:smoke`
  - `pnpm run typecheck:active`
  - `pnpm run validate:active`
  - `pnpm run validate:mvp:ship`
- Failed as expected in this environment:
  - `pnpm run validate:local-sandbox:runtime`

Validation notes:

- Runtime preflight reports:
  - `Enabled: false`
  - `Pinned checkpoint: flux1-schnell-fp8.safetensors`
  - `Reason: Local sandbox generation is disabled. Set ENABLE_LOCAL_IMAGE_SANDBOX=true in a local sandbox env file.`
- The env template now exists at `.env.local-sandbox.example`.

Next RALPH loop:

- Project 7: Security / Beta Verification.
- Start with Supabase RLS/storage policy review and live cross-user test
  readiness; do not add hosted billing or image behavior in that lane.

## 7. Security / Beta Verification

### R - Read

- Reviewed:
  - `docs/supabase-external-verification-checklist.md`
  - `docs/server-route-access-policy.md`
  - `docs/security-posture-pre-beta.md`
  - `docs/mvp-security-handoff.md`
  - `docs/object-access-review-matrix.md`
  - `docs/server-logging-review.md`
  - `server/src/utils/routeAccess.ts`
  - `server/src/utils/usageQuota.ts`
  - `server/src/services/supabase.ts`
  - `server/src/routeSurfaceCatalog.ts`
  - active server route tests
  - client Supabase graph save/open/delete path

### A - Assess

Gap summary:

- Supabase cloud graph/storage isolation still cannot be proven locally because
  this workspace has no Supabase URL/key/service-role env configured.
- Deployed RLS/storage policy review and two-user live tests remain external
  beta gates.
- The route surface catalog is already explicit about public, authenticated,
  local-only, and internal routes.
- The strongest local gap was focused coverage for `requireRouteAccess`
  behavior itself: missing bearer auth, disabled capabilities, missing account
  capability, and quota exhaustion.

Blockers:

- Environment: Supabase URL, anon key, and service-role key are absent.
- External service: no deployed Supabase project policy review or two test
  users were available.
- Product: billing/subscription behavior is still a separate source-of-truth
  lane and was not added here.
- Technical: route-access local coverage was missing before this slice.

Acceptance criteria for this slice:

- Prove local route auth/capability/quota denial behavior.
- Ensure protected handlers do not run after `401`, `403`, or `429` decisions.
- Add route-access smoke coverage to the active validation lane.
- Update security docs with local verification status and explicit external
  Supabase blockers.
- Do not claim live cross-user RLS/storage verification without credentials.

### L - List

Completed task list:

- Added focused `requireRouteAccess` tests.
- Covered public bypass, missing bearer auth, disabled capability, denied
  capability, allowed quota path, and exhausted quota.
- Added the route-access test to active server smoke validation.
- Updated server route access/security/Supabase checklist docs.
- Checked Supabase env presence without printing secret values.

Explicit deferrals:

- deployed Supabase RLS policy review
- storage bucket policy review
- two-user live graph read/update/delete isolation
- two-user live storage list/read/write/delete isolation
- billing/subscription Stripe behavior
- hosted image-generation security review

### P - Patch

Patched:

- `server/__tests__/route-access.test.ts`
- `scripts/validation/activeValidation.config.mjs`
- `docs/server-route-access-policy.md`
- `docs/security-posture-pre-beta.md`
- `docs/supabase-external-verification-checklist.md`
- `docs/active-validation-lane.md`
- this RALPH progress file

### H - Handoff

Validation for this handoff:

- Passed:
  - `pnpm --filter server test -- --runInBand __tests__/route-access.test.ts`
  - `pnpm run validate:active:server-smoke`
  - `pnpm run validate:active`
  - `pnpm run validate:mvp:ship`
  - `pnpm run validate:artifacts:active`

Validation notes:

- Supabase env presence check showed all checked Supabase URL/key values absent
  in this process:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Live RLS/storage verification remains blocked until a deployed Supabase
  project and two non-admin test accounts are available.
- `validate:mvp:ship` also reran `validate:deploy:active` and
  `validate:artifacts:active`; both passed inside the ship gate.

Next RALPH loop:

- Project 8: Test Harness Repair.
- Start by consolidating canonical test layers and setup ownership; the full
  Epic 1 component suite still has known unrelated harness drift.

## 8. Test Harness Repair

### R - Read

- Reviewed:
  - root/package Jest scripts
  - root `jest.config.js`
  - `packages/core/jest.config.cjs`
  - `packages/core/components/epic1/jest.config.cjs`
  - `jest.setup.js`
  - `tests/utils/browserTestSetup.js`
  - Epic 1 component tests and failing output

### A - Assess

Gap summary:

- The Epic 1 component suite had a mix of harness failures and stale
  expectation drift.
- Harness failures included wrong `react-markdown` mock path resolution,
  missing `@/` alias mapping, ESM-only `react-dnd` imports in a CommonJS Jest
  config, and an underspecified shared `@testing-library/user-event` mock.
- Product expectation drift included normalized weighted-choice preset options,
  current TabbedSidePanel panel rendering, current FragmentContainer DOM shape,
  current EnhancedBoundingBox movement callbacks, and micro-interaction event
  targeting.

Acceptance criteria for this slice:

- Make `pnpm run test:epic1:components` pass through the canonical script.
- Preserve the active product and MVP ship gates.
- Keep changes scoped to test harness/config and stale tests.
- Do not broaden the active MVP surface or reintroduce deferred feature work.

### L - List

Completed task list:

- Fixed Epic 1 Jest alias paths for core test mocks and `@/` imports.
- Added stable local Jest mocks for `react-dnd` and `react-dnd-html5-backend`.
- Expanded the shared user-event mock to support `setup`, hover/unhover, and
  React-controlled input updates through Testing Library `fireEvent`.
- Updated stale Epic 1 assertions for normalized preset options, side-panel
  panel content, fragment container style target selection, bounding-box group
  movement callback selection, and micro-interaction event targeting.

Explicit deferrals:

- Consolidating duplicate root/package Jest config ownership.
- Moving `ts-jest` `isolatedModules` into `packages/core/tsconfig.json`.
- Reducing expected console output in onboarding tests.
- Reviewing broader non-Epic 1 legacy test suites outside the active product
  lane.

### P - Patch

Patched:

- `packages/core/components/epic1/jest.config.cjs`
- `packages/core/tests/mocks/reactDnd.tsx`
- `packages/core/tests/mocks/reactDndHtml5Backend.ts`
- `tests/utils/browserTestSetup.js`
- `packages/core/components/epic1/asset-library/__tests__/presetUtils.test.ts`
- `packages/core/components/epic1/asset-library/__tests__/AssetLibrary.test.tsx`
- `packages/core/components/epic1/interactions/__tests__/MicroInteractions.test.tsx`
- `packages/core/components/epic1/__tests__/TabbedSidePanel.test.tsx`
- `packages/core/components/epic1/nodes/__tests__/FragmentContainer.test.tsx`
- `packages/core/components/epic1/nodes/__tests__/EnhancedBoundingBox-separation.test.tsx`

### H - Handoff

Validation for this handoff:

- Passed:
  - `pnpm exec jest --config packages/core/components/epic1/jest.config.cjs --runInBand`
  - `pnpm run test:epic1:components`
  - `pnpm run validate:active`
  - `pnpm run validate:mvp:ship`
  - `pnpm run validate:artifacts:active`

Validation notes:

- Epic 1 component suite now passes: 39 suites, 438 tests.
- `validate:mvp:ship` reran active validation, artifact hygiene, deploy
  packaging, and focused MVP demo flows successfully.
- The Epic 1 component suite still emits expected console output from
  onboarding negative-path tests and a `ts-jest` deprecation warning for
  `isolatedModules`; both are cleanup debt, not failing gates.

Next RALPH loop:

- Project 9: Repo Trim.
- Start with reviewed deletion batches only; preserve active product, deploy,
  security, PSG contract, and handoff material.

## 9. Repo Trim

### R - Read

- Reviewed:
  - `docs/launch-repo-trim-plan.md`
  - `docs/first-pass-cruft-inventory.md` before it was consolidated and
    removed in docs batch 2
  - `scripts/artifacts/generatedArtifactPolicy.mjs`
  - surviving references for first-batch trim candidates
  - `/docs` tree inventory and `docs/agent-reports` reference check
  - historical docs batch 2 candidates:
    `brownfield-architecture-map.md`, `brownfield-risk-register.md`,
    `asset-browser-fragment-audit.md`, and
    `first-pass-cruft-inventory.md`

### A - Assess

Gap summary:

- The repo still contains old root-level QA reports, one-off helper scripts,
  temporary analysis outputs, obsolete deploy config variants, and a generated
  server performance report that are outside the active launch surface.
- These files are documented as launch-irrelevant and are not referenced by
  active product, deploy, security, PSG contract, or handoff paths.
- `/performance-test-runner.js` is not safe for this first deletion batch
  because `scripts/run-performance-tests.js` and
  `tests/performance/PerformanceTestSuite.ts` still reference it.
- `docs/agent-reports` had no surviving repo references, but it contained
  useful broad technical-debt themes that should be preserved before deleting
  the historical report files.
- The second docs batch candidates were either unreferenced or only referenced
  from this RALPH handoff. Their current decisions were suitable for
  consolidation into the active recovery backlog and fragment retrieval docs.

Acceptance criteria for this slice:

- Remove only reviewed root/report artifacts with no active launch value.
- Preserve active product, deploy, security, PSG contract, and RALPH handoff
  material.
- Keep referenced performance harness files until their ownership is reviewed.
- Prove artifact hygiene, active validation, and MVP ship gates after deletion.

### L - List

Completed task list:

- Deleted the first reviewed root one-off/report/helper batch.
- Deleted the generated server performance report.
- Rechecked references after deletion.
- Updated the launch repo trim plan with completed-batch status and the
  deferred performance harness note.
- Preserved the actionable themes from `docs/agent-reports` in the active MVP
  recovery backlog.
- Removed `docs/agent-reports` as docs batch 1 after confirming there were no
  surviving repo references.
- Ran a local Markdown link check across remaining docs and repaired stale
  absolute/missing references in active handoff docs.
- Promoted active handoff, validation, local sandbox, agent retrieval, test
  harness, generated artifact, and example PSG docs into the launch keep list.
- Consolidated active decisions from brownfield architecture/risk notes, asset
  fragment audit, and first-pass cruft inventory into current handoff docs.
- Removed the four superseded historical docs from batch 2.

Explicit deferrals:

- `/performance-test-runner.js` until the performance harness references are
  removed or replaced.
- Broad `/docs` tree pruning until each doc batch is reviewed against MVP,
  deploy, security, PSG contract, and handoff value.
- Remaining non-keep docs until each file is classified as current handoff,
  launch support, or historical.
- Historical context docs once their active decisions have been preserved in
  current handoff docs.
- Archive/report deletion outside the reviewed first batch.

### P - Patch

Patched:

- `docs/launch-repo-trim-plan.md`
- `docs/mvp-recovery-backlog.md`
- `docs/active-validation-lane.md`
- `docs/test-harness-canonical-layers.md`
- `docs/mvp-security-handoff.md`
- `docs/mvp-task-board.md`
- `docs/server-logging-review.md`
- `docs/agent-fragment-index-implementation.md`
- this RALPH progress file

Deleted:

- `QA-FINAL-REPORT-2025-01-28.md`
- `QA-PHASE2-COMPLETE-2025-01-28.md`
- `QA-PHASE3-PROGRESS-2025-01-28.md`
- `QA-PHASE4-FINAL-2025-01-28.md`
- `QA-PHASE5-COVERAGE-2025-01-28.md`
- `QA-REPORT-2025-01-28.md`
- `QA-SESSION-COMPLETE-2025-01-28.md`
- `EPIC-2-INTEGRATION-STATUS.md`
- `dependency-plan-1757297539122.json`
- `prompt_parsing_fix.txt`
- `psg-analysis-report.json`
- `remove-deprecated-files.js`
- `run-prompt-parser-tests.sh`
- `serve-dashboard.js`
- `setup-supabase.sh`
- `simple-auth-server.js`
- `start-ticket-dashboard.js`
- `tasks.db`
- `temp-validator.js`
- `temp_patch.txt`
- `test-enhanced-bounding-box.html`
- `update-epic1-task.js`
- `vercel-full-app.json`
- `vercel-minimal.json`
- `server/performance-report-2025-07-23T03-09-11-472Z.html`
- `docs/agent-reports/`
- `docs/brownfield-architecture-map.md`
- `docs/brownfield-risk-register.md`
- `docs/asset-browser-fragment-audit.md`
- `docs/first-pass-cruft-inventory.md`

### H - Handoff

Validation for this handoff:

- Passed:
  - `pnpm run validate:artifacts:active`
  - `pnpm run validate:active`
  - `pnpm run validate:mvp:ship`

Validation notes:

- `validate:mvp:ship` reran active validation, artifact hygiene, deploy
  packaging, and focused MVP demo flows successfully.
- First docs-batch follow-up validation passed:
  - local Markdown link check across `docs/**/*.md`
  - `pnpm run validate:artifacts:active`
  - `pnpm run validate:active`
- Second docs-batch validation passed:
  - local Markdown link check across `docs/**/*.md`
  - `pnpm run validate:artifacts:active`
  - `pnpm run validate:active`
  - `pnpm run validate:mvp:ship`
- Vite still reports existing chunk-size warnings during production builds;
  the warning is not caused by this trim batch and does not fail the gate.
- Supabase env values remain absent during client builds, matching prior
  external-service blockers.

Next repo trim slice:

- Review the docs tree in small batches and keep only current MVP, deploy,
  security, PSG contract, and handoff material.
- Review performance harness ownership before deleting
  `/performance-test-runner.js`.
