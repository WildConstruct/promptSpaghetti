# MVP And Security Handoff

## Product Wedge

The branch is aligned around a narrower MVP wedge:

- Prompt Spaghetti is presented as a tool for defining reusable archetypes and controlled family variation.
- The first-run surface teaches fixed DNA, allowed variation, and one believable in-family output.
- Scene, crowd, and broader PSG infrastructure remain available as supporting substrate rather than the launch promise.

Key launch-facing references:

- [mvp-alignment.md](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/docs/mvp-alignment.md#L1)
- [mvp-finish-plan.md](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/docs/mvp-finish-plan.md#L1)
- [demo-checklist.md](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/docs/demo-checklist.md#L1)

## First-Run Validation State

- Launch copy and quick starts now use archetype and family language consistently.
- Preview behavior teaches fixed DNA, allowed variation, and resolved family output.
- `Example Family Member` / `One believable in-family output` was hardened to read like production-facing language rather than debug output.
- Historical first-run walkthrough notes are no longer retained as standalone
  files; current launch walkthrough expectations live in
  [demo-checklist.md](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/docs/demo-checklist.md#L1)
  and
  [mvp-ship-verification.md](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/docs/mvp-ship-verification.md#L1).

Current expectation:

- Any additional launch-surface changes should stay presentation-only unless manual verification finds a real wedge/comprehension failure.

## Security Phases Completed

### Phase 0

- Deployable legacy Vercel admin/debug handlers were disabled.
- Admin surfaces were made opt-in and explicitly gated.
- Runtime `.env` mutation was disabled.

### Phase 1

- Mock auth utilities were quarantined from production-like environments.
- LLM, agent, PSG, and admin routes were moved onto explicit server-side access policy.
- PSG request caps were added beyond schema validation.

### Phase 2

- Cross-user object-access review completed.
- Logging review completed for active beta-facing surfaces.
- Per-user capability checks and basic daily quotas were added to authenticated cloud routes.
- File routes now rely on server-authenticated owner scope rather than caller-supplied owner hints.

Key references:

- [server-route-access-policy.md](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/docs/server-route-access-policy.md#L1)
- [object-access-review-matrix.md](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/docs/object-access-review-matrix.md#L1)
- [server-logging-review.md](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/docs/server-logging-review.md#L1)
- [security-posture-pre-beta.md](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/docs/security-posture-pre-beta.md#L1)

## Remaining External Gate

The main unresolved isolation question is now external to application code:

- cloud saved graph isolation
- deployed Supabase RLS and storage policy correctness
- final tenant isolation across persisted cloud objects

That external verification is the next gate before wider beta or paid API exposure.
