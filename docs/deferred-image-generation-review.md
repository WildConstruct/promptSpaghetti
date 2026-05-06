# Deferred Image Generation Review

_Created during the branch-biased merge of `fix/stabilize-functional-baseline`._

## Context

`origin/main` contains newer image bootstrap, scene preview, and image generation work that was intentionally not blended into the stabilization merge. The stabilization branch remains the product source of truth for the current crowd tool UX, active validation lane, route catalog, and launch/editor shell.

## Follow-Up Work

- Review the image bootstrap and scene preview changes from `origin/main` after the stabilization merge lands.
- Decide which pieces belong in the active MVP surface versus a later image-generation lane.
- Reintroduce only the compatible UI, API, service, and validation changes behind the current active-surface boundaries.
- Run the active validation and MVP ship lanes before promoting any restored image-generation work.

## RALPH Project 2 Review - 2026-05-05

### R - Read

Compared the branch-biased integration state against `origin/main` for the
deferred image lane. The relevant `origin/main` additions are concentrated in:

- `client/src/Epic1Editor/components/PsgImageBootstrapDialog.tsx`
- `client/src/Epic1Editor/components/ImageBootstrapSelectionPanel.tsx`
- `client/src/Epic1Editor/components/ScenePreviewV1Panel.tsx`
- `client/src/Epic1Editor/utils/imageBootstrap*.ts`
- `client/src/Epic1Editor/utils/scenePreview*.ts`
- `server/src/services/ImageBootstrapAnalysisService.ts`
- `server/src/services/imageBootstrapFixtures.ts`
- `server/src/services/imagePreviewBackends.ts`
- `server/src/services/imagePreviewProviders.ts`
- `server/src/services/imageSegmentationProviders.ts`
- `server/src/routes/psg.ts` image routes:
  - `/api/psg/images/register-batch`
  - `/api/psg/images/analyze`
  - `/api/psg/images/review`
  - `/api/psg/images/draft-graph`
  - `/api/psg/images/preview`
  - `/api/psg/images/generate-batch`
- related tests for image bootstrap, scene preview, and preview-provider state
- roadmap docs from `origin/main`:
  - `docs/epic-image-reference-graph-bootstrap.md`
  - `docs/image-generation-done-roadmap.md`

### A - Assess

The `origin/main` image work is valuable but not a small compatible merge into
this stabilization branch.

Reasons:

- It widens `PSG_OPERATIONS` and the active PSG route family beyond the current
  MVP route-access policy.
- The hosted image routes require capability, quota, and auth-policy decisions
  that belong with Cloud PSG/Auth Isolation, not this stabilization loop.
- The client dialogs depend on image contracts, preview backends, selection
  persistence, and scene-preview state utilities that were not part of the
  branch-biased shell.
- `ScenePreviewV1Panel` is a new comprehension surface. It should be feature
  flagged and reviewed after the active crowd/tool UX is stable, not introduced
  during the merge closeout.
- The current branch already has a bounded output path:
  - flat `.psg` export
  - scene sidecar
  - Comfy export contract
  - optional local-only sandbox generation

Project 2 blockers:

- Product: decide whether image bootstrap is an MVP-visible feature or a
  post-MVP lane.
- Technical: route contracts and client dialogs are cross-cutting and need their
  own validation slice.
- Environment: no live image backend is configured for this branch.
- External service: segmentation/preview backend choice remains open.

### L - List

Compatible slice for this stabilization branch:

- Keep the current branch code as the product source of truth.
- Do not restore `origin/main` image bootstrap UI, scene preview UI, or PSG image
  routes in this loop.
- Preserve the deferred image lane as documented follow-up work.
- Use this file as the immediate handoff for the later image-generation review.

Explicit deferrals:

- image reference upload/analyze/review/draft graph flow
- scene-preview-v1 panel
- `/api/psg/images/*` hosted route family
- preview backend abstraction and real image backend adapter
- image bootstrap provenance persistence
- image bootstrap browser/performance specs
- ComfyUI custom node package from `origin/main`

### P - Patch

Documentation-only patch. No product code was restored from `origin/main`.

This is intentional: the safe compatible piece for Project 2 is the decision
record, not a partial code import that would expose dormant or unvalidated image
surfaces.

### H - Handoff

Image generation remains a separate lane after this stabilization merge.

Recommended next implementation slice when this lane starts:

1. Add a narrow image-bootstrap contract module behind non-active exports or an
   explicit feature flag.
2. Add one focused server-side analysis service test using deterministic fixture
   assets.
3. Add route-catalog entries as `deferred` or `cloud-only`, not active MVP.
4. Wire no client menu item until capabilities and route policy are in place.
5. Only then restore a feature-flagged dialog entry point.

Acceptance criteria before image bootstrap becomes active product:

- route catalog and access policy explicitly include the image operations
- hosted/cloud capability checks cannot be bypassed from the client
- active validation proves the existing crowd/tool UX still works
- image preview uses a real or clearly mocked backend with visible provenance
- scene preview is feature-flagged and does not replace the graph editor or
  crowd sidecar as the source of truth
