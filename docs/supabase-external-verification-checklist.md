# Supabase External Verification Checklist

This checklist is the next gate for proving cloud-object isolation against the deployed Supabase project.

## 2026-05-06 Project 7 Status

Local application checks completed:

- Fastify route-access middleware now has focused smoke coverage for:
  - missing bearer auth returning `401`
  - disabled cloud capability returning `403`
  - missing account capability returning `403`
  - quota exhaustion returning `429`
  - protected handlers not running after denial
- The active validation lane includes that route-access smoke coverage.

Still external / not proved in this workspace:

- Supabase URL, anon key, and service-role key are not configured locally.
- Live Supabase login/session restore cannot be exercised here.
- Live two-user graph read/update/delete isolation cannot be exercised here.
- Live storage bucket list/read/write/delete isolation cannot be exercised here.

## RLS Policy Review

- Confirm the `graphs` table has explicit `select`, `insert`, `update`, and `delete` policies.
- Confirm private rows are limited to `auth.uid() = user_id`.
- Confirm public rows, if allowed, are read-only for non-owners.
- Confirm there is no policy path allowing arbitrary `user_id` spoofing on insert/update.
- Confirm any related project, preset, or metadata tables use equivalent owner-scoped policies.

## Storage Policy Review

- Confirm graph/file bucket policies are scoped to the authenticated user prefix.
- Confirm users cannot list, read, overwrite, move, or delete another user’s objects.
- Confirm public/static asset buckets are intentionally public and non-mutable by normal users.
- Confirm service-role usage is only server-side and never exposed to the browser.

## Live Cross-User Tests

Use two non-admin accounts, `User A` and `User B`.

### Saved Graph Isolation

- `User A` creates a private graph.
- `User B` cannot list or load `User A`'s private graph.
- `User B` cannot update `User A`'s graph by id.
- `User B` cannot delete `User A`'s graph by id.
- `User B` can only read graphs intentionally marked public.

### File Storage Isolation

- `User A` uploads a graph/file object.
- `User B` cannot list `User A`'s bucket prefix.
- `User B` cannot download `User A`'s object by guessed filename.
- `User B` cannot delete or overwrite `User A`'s object.

### Public/Private Boundary

- Public graphs are readable by the intended audience only.
- Private graphs stay invisible to anonymous users and other authenticated users.
- Public asset buckets do not expose private user uploads.

## Route Verification

- Authenticated cloud routes still require bearer auth in the deployed environment.
- Capability-denied users receive `403`, not successful execution.
- Quota-exceeded users receive `429` with no backend action performed.

## Logging Verification

- Server logs do not retain raw prompt payloads, PSG documents, graph content, or provider secrets during normal operation.
- Error logging does not leak Supabase keys, provider keys, or cross-user object identifiers unnecessarily.

## Exit Criteria

Cloud graph isolation can be treated as verified only after:

- RLS review is complete
- storage policy review is complete
- live cross-user tests pass for read, update, and delete isolation
