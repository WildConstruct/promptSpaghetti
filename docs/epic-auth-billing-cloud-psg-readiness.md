# Epic: Auth, Billing, and Cloud PSG Readiness

## Purpose

This epic captures the current state of:

- login/session handling
- Supabase-backed cloud PSG save/open/load
- subscription/capability gating
- future Stripe enablement

The goal is not to redesign auth or billing. The goal is to confirm what is already wired, identify what is only partial scaffolding, and define the smallest set of stories needed to make this area trustworthy for wider use.

## Current State

### Already Real In Code

These pieces appear to be genuinely wired, not placeholders:

- Supabase auth UI exists in:
  - `packages/core/components/auth/LoginForm.tsx`
  - `packages/core/components/auth/SignupForm.tsx`
  - `packages/core/components/auth/AuthModal.tsx`
- Session lifecycle is handled in:
  - `packages/core/providers/AuthUserProvider.tsx`
  - session restore
  - auth-state subscription
  - sign in / sign up / sign out / reset password
- Supabase feature/env resolution exists in:
  - `packages/core/utils/supabaseFeature.ts`
  - `packages/core/utils/supabaseClient.ts`
- Server-side bearer-token verification and auth context exists in:
  - `server/src/services/supabase.ts`
- Cloud route access policy already uses auth + capability + quota checks in:
  - `server/src/utils/routeAccess.ts`
- Cloud PSG open/save UI exists in:
  - `client/src/Epic1Editor/components/SupabaseOpenDialog.tsx`
  - `client/src/Epic1Editor/components/SupabaseSaveDialog.tsx`
- Cloud graph fetch/save/load/delete behavior exists in:
  - `client/src/Epic1Editor/hooks/useSupabaseFileOperations.ts`
- Runtime-mode/status plumbing already models auth, subscription, Supabase, LLM, and PSG availability in:
  - `packages/core/utils/runtimeMode.ts`
  - `packages/core/hooks/useRuntimeMode.ts`

### Partially Wired / Not Yet Proven

- Cloud graph isolation still depends on deployed Supabase RLS/storage policy, not just app code.
- Subscription state and plan are read from Supabase auth metadata, but that is not the same as a complete billing system.
- Stripe libraries are installed in `packages/core/package.json`, but there is no clearly active checkout / billing portal / webhook backbone in the current runtime.
- The product can present cloud-vs-local capability state, but it is not yet proven that subscription lifecycle updates are being driven by a live billing provider.

### Likely Missing For Stripe

I did not find a clear active implementation for:

- creating Stripe checkout sessions
- customer portal / billing portal entry
- webhook handling for subscription lifecycle
- syncing Stripe subscription state into Supabase user/app metadata
- explicit paid-plan provisioning flow

There are old migrations and marketplace/payment-era artifacts in the repo, but that should not be treated as launch-ready billing.

## Epic Outcome

When this epic is done, we should be able to say:

- login works end to end against Supabase
- the app can save and reopen PSG documents from the cloud for the correct user
- cloud capability state is derived from real auth + subscription state
- Stripe can be added without inventing a new auth/subscription model

## Stories

### Story 1: Prove Login and Session Flow

**Goal**

Verify that email/password auth works end to end and that session state survives reloads correctly.

**Scope**

- confirm sign in
- confirm sign up
- confirm sign out
- confirm session restore on reload
- confirm auth modal and provider stay consistent

**Acceptance Criteria**

- valid login creates an authenticated session
- invalid login fails with a user-facing error
- reload restores the session when a valid session exists
- sign out clears local authenticated state
- cloud-only UI updates when auth state changes

### Story 2: Prove Cloud PSG Save / Open / Load

**Goal**

Verify that a logged-in user can save a PSG graph to Supabase and load it back correctly.

**Scope**

- save current graph to `graphs`
- reopen from cloud dialog
- load graph into editor
- update existing saved graph
- delete owned graph

**Acceptance Criteria**

- authenticated save writes a cloud graph row successfully
- reopening loads the saved nodes/edges back into the editor
- update preserves the same cloud object identity where expected
- delete only works for owned graphs
- unauthenticated save falls back to local export as currently designed

### Story 3: Verify Supabase Ownership and Isolation

**Goal**

Prove that saved graphs are isolated correctly in the deployed Supabase environment.

**Scope**

- RLS policy review
- storage policy review if cloud assets are involved
- live cross-user checks

**Acceptance Criteria**

- one user cannot read another user’s private graph
- one user cannot update/delete another user’s graph
- public graphs are readable as intended
- policy behavior matches the app’s assumptions in `useSupabaseFileOperations.ts`

**Note**

This is the real gate for claiming cloud PSG isolation confidently.

### Story 4: Define Billing Backbone Without Shipping Full Billing Yet

**Goal**

Create the minimum server/data contract needed so Stripe can be added cleanly later.

**Scope**

- define subscription source of truth
- define plan states
- define capability mapping
- define how Stripe events will sync into Supabase metadata

**Acceptance Criteria**

- one documented subscription model exists
- `subscriptionActive`, `subscriptionState`, and `plan` have one canonical origin
- cloud capability checks can rely on that model without special cases

### Story 5: Add Stripe Checkout / Portal / Webhook Path

**Goal**

Implement actual billing only after the contract above is settled.

**Scope**

- checkout session creation
- customer portal entry
- webhook verification and handling
- subscription sync into Supabase metadata or profile tables

**Acceptance Criteria**

- a user can start checkout
- successful checkout upgrades subscription state
- canceled/expired subscriptions downgrade cleanly
- route capability checks reflect the latest billing state

## Recommended Order

1. Story 1: Prove Login and Session Flow
2. Story 2: Prove Cloud PSG Save / Open / Load
3. Story 3: Verify Supabase Ownership and Isolation
4. Story 4: Define Billing Backbone
5. Story 5: Add Stripe Checkout / Portal / Webhook Path

## Practical Readiness Summary

### Reasonably True Now

- auth UI and session provider are real
- server-side bearer verification exists
- cloud graph dialogs and save/load hooks exist
- runtime mode already understands auth/subscription/Supabase/PSG state

### Not Yet Proven

- deployed login flow against the real Supabase project
- cloud PSG isolation in the deployed Supabase environment
- real Stripe billing lifecycle
- subscription metadata being driven by a live billing provider

## Suggested Next Verification Pass

Use this epic as the checklist for the next concrete validation run:

1. login with a real Supabase-backed account
2. save a PSG graph to the cloud
3. reload and reopen it from the cloud dialog
4. validate cross-user isolation in the deployed Supabase project
5. only then start building the Stripe checkout/webhook path

## RALPH Project 3 Pass - 2026-05-05

### R - Read

Reviewed the active branch docs and implementation paths for Cloud PSG/Auth:

- `docs/epic-auth-billing-cloud-psg-readiness.md`
- `docs/supabase-external-verification-checklist.md`
- `docs/object-access-review-matrix.md`
- `client/src/Epic1Editor/hooks/useSupabaseFileOperations.ts`
- `client/src/Epic1Editor/components/SupabaseOpenDialog.tsx`
- `client/src/Epic1Editor/components/SupabaseSaveDialog.tsx`
- `packages/core/utils/supabaseClient.ts`
- `packages/core/utils/supabaseFeature.ts`
- `packages/core/utils/runtimeMode.ts`
- `server/src/services/supabase.ts`
- `server/src/utils/routeAccess.ts`

### A - Assess

The local code is ready for a live Supabase verification pass, but the current
workspace cannot complete that pass because Supabase credentials are not
configured:

- `.env` contains empty `NEXT_PUBLIC_SUPABASE_URL`
- `.env` contains empty `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `.env` contains empty `VITE_SUPABASE_URL`
- `.env` contains empty `VITE_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_FEATURE_SUPABASE=1` is set, so the feature flag is on but the
  project URL/key are absent

Local code findings:

- Client session restore uses `sb.auth.getSession()` plus
  `onAuthStateChange`.
- Cloud graph list uses the `graphs` table and filters owned/public rows in the
  client.
- Cloud save inserts or updates `graphs` with `user_id = user.id`.
- Cloud update/delete add `.eq('user_id', user.id)` client-side filters.
- The hook now explicitly documents that client filters are not authorization
  and that Supabase RLS must enforce insert/update/delete ownership.
- Server protected PSG routes require bearer auth, capability checks, and quota
  checks through `requireRouteAccess`.

Blockers:

- Environment: live Supabase URL/key and two non-admin test accounts are
  missing.
- External service: deployed `graphs` RLS and storage policies must be reviewed
  in the Supabase project.
- Product: billing/subscription source of truth must be defined before adding
  Stripe behavior.

### L - List

Completed in this slice:

- Confirmed local Supabase config is absent without exposing secret values.
- Confirmed client cloud PSG save/open/update/delete paths exist.
- Confirmed server PSG routes have auth/capability/quota gates.
- Confirmed live cross-user isolation remains an external verification gate.
- Added the billing/subscription source-of-truth decision below.

Deferred to live environment:

- email/password login success/failure
- session restore after reload against real Supabase
- cloud PSG save/open/update/delete against real `graphs`
- two-user read/update/delete denial tests
- storage bucket isolation tests
- route capability-denial and quota-denial tests against deployed config

### P - Patch

Documentation-only patch. No product code was changed because the blocker is
environment/external-service verification, not an identified local code defect.

### H - Handoff

Run the external checklist in `docs/supabase-external-verification-checklist.md`
as soon as a Supabase project and two test accounts are available.

Do not add Stripe checkout, portal, or webhook behavior until the billing source
of truth below is accepted.

## Billing / Subscription Source Of Truth

Stripe should not be the direct source of truth consulted by runtime feature
gates.

Canonical runtime source of truth:

- Supabase auth user metadata or an owner-scoped Supabase profile/subscription
  table.

Stripe's role:

- Stripe is the payment event source.
- Stripe webhooks update the canonical Supabase subscription state.
- Runtime route gates and client runtime mode read the canonical Supabase state,
  not Stripe directly.

Canonical fields:

- `plan`: `free`, `pro`, `team`, or a future explicit plan id
- `subscription_state`: `active`, `trialing`, `inactive`, `canceled`,
  `expired`, or `past_due`
- `subscription_active`: boolean derived from the state
- `capabilities`: explicit string array such as `cloud-psg`, `cloud-llm`,
  `cloud-agent`
- `stripe_customer_id`: stored server-side only
- `stripe_subscription_id`: stored server-side only
- `subscription_updated_at`: ISO timestamp from the webhook sync

Runtime interpretation:

- Server route gates use `server/src/services/supabase.ts` to resolve plan,
  subscription state, and capabilities from the verified Supabase user.
- `requireRouteAccess` remains the enforcement point for protected routes.
- Client runtime mode may display availability, but client state is never the
  authorization boundary.

Stripe implementation prerequisites:

- webhook signature verification
- idempotent event handling
- service-role-only writes to subscription fields
- downgrade path for canceled, expired, or payment-failed subscriptions
- tests proving capability changes affect `requireRouteAccess`
