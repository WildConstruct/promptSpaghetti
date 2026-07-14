# Supabase RLS Verification Runbook

_Work-loop **C4** · 2026-07-14_  
_Expands [`supabase-external-verification-checklist.md`](./supabase-external-verification-checklist.md)
into ordered, runnable steps. Completing this runbook is the only way to claim
“cloud graph isolation verified.” Until then, treat isolation as **unverified**._

## Preconditions

| Item | Check |
| --- | --- |
| Supabase project URL + service role | Dashboard or vault (service role **server-only**) |
| Two test users | `User A` and `User B` (email/password or magic link) |
| App local/staging with cloud PSG enabled | Auth + `ENABLE_CLOUD_*` as in prod-like env |
| SQL editor or `psql` | Ability to inspect policies (read-only is fine) |
| Browser two profiles / incognito | Separate sessions for A and B |

**Do not** paste service-role keys into the client or this repo.

---

## Phase 0 — Record environment

Fill this before testing:

```
Date:
Operator:
Supabase project ref:
App base URL (local/staging/prod):
App git SHA / branch:
User A id (auth.users):
User B id (auth.users):
```

---

## Phase 1 — Schema inventory (read-only SQL)

In Supabase SQL editor (adjust table names if your project differs — common names
include `graphs`, `projects`, `presets`, storage buckets):

```sql
-- Tables that look graph/document related
select table_schema, table_name
from information_schema.tables
where table_schema = 'public'
order by table_name;

-- RLS enabled?
select relname as table_name, relrowsecurity as rls_enabled
from pg_class
join pg_namespace on pg_namespace.oid = pg_class.relnamespace
where nspname = 'public' and relkind = 'r'
order by relname;

-- Policies
select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
```

**Pass criteria:** every table that stores user-owned graphs/files has `rls_enabled = true`
and explicit policies for SELECT/INSERT/UPDATE/DELETE as needed.

**Record:** screenshot or export of policies; note any table without RLS.

---

## Phase 2 — Policy intent review (manual)

For each user-owned table (e.g. graphs):

| Check | Pass? | Notes |
| --- | --- | --- |
| SELECT limited to `auth.uid() = user_id` (or equivalent) | | |
| INSERT sets/checks `user_id = auth.uid()` (no client spoof) | | |
| UPDATE only own rows | | |
| DELETE only own rows | | |
| Public-read path (if any) is intentional and read-only | | |
| No policy with `true` for all roles on private tables | | |

For **Storage** buckets:

| Check | Pass? | Notes |
| --- | --- | --- |
| Object paths include user id prefix | | |
| SELECT/INSERT/UPDATE/DELETE scoped to that prefix | | |
| Public buckets are intentional and non-writable by anon for private data | | |
| Service role not in browser | | |

---

## Phase 3 — Live cross-user tests (app UI or API)

Use **User A** and **User B** sessions. Prefer UI (Save/Open dialogs); API with bearer
tokens is acceptable.

### 3.1 Private graph isolation

| Step | Action | Expected |
| --- | --- | --- |
| 1 | A signs in, saves a **private** graph with a unique name | Save succeeds |
| 2 | A can reopen that graph | Load succeeds |
| 3 | B signs in, opens cloud list | A’s private graph **not** listed |
| 4 | B attempts load by id (API if needed) | **403/404**, not content |
| 5 | B attempts update by id | Fail |
| 6 | B attempts delete by id | Fail |
| 7 | A deletes own graph | Succeeds |

### 3.2 Storage isolation (if file upload path used)

| Step | Action | Expected |
| --- | --- | --- |
| 1 | A uploads/saves object | Succeeds |
| 2 | B lists A’s prefix | Empty / denied |
| 3 | B GET by guessed path | Denied |
| 4 | B delete/overwrite A’s object | Denied |

### 3.3 Public boundary (only if product supports public graphs)

| Step | Action | Expected |
| --- | --- | --- |
| 1 | A marks graph public | Allowed by product rules |
| 2 | B can read public graph | Yes |
| 3 | B cannot update/delete A’s public graph | Fail |
| 4 | Anon cannot see private graphs | Fail |

### 3.4 App route gates (deployed server)

| Step | Action | Expected |
| --- | --- | --- |
| 1 | Cloud route without `Authorization` | 401 |
| 2 | Valid user without capability (if enforced) | 403 |
| 3 | Quota exceed (if testable) | 429, no side effect |

---

## Phase 4 — Logging spot-check

Trigger one failed and one successful cloud save. Inspect server logs (staging):

| Check | Pass? |
| --- | --- |
| No full PSG / prompt body in normal logs | |
| No service-role or provider keys | |
| User ids only as needed for ops | |

---

## Phase 5 — Verdict

| Outcome | Criteria |
| --- | --- |
| **VERIFIED** | Phases 1–4 pass; evidence linked below |
| **PARTIAL** | Policies look good but live tests incomplete |
| **FAILED** | Any cross-user read/update/delete succeeded |
| **NOT RUN** | Default for the repo until this runbook is executed |

```
Verdict: NOT RUN | PARTIAL | FAILED | VERIFIED
Evidence links:
Signed off by:
Date:
```

**Repo rule:** Do not update `security-posture-pre-beta.md` to claim full tenant
isolation until verdict is **VERIFIED**.

---

## Related

- [`security-posture-pre-beta.md`](./security-posture-pre-beta.md)
- [`epic-auth-billing-cloud-psg-readiness.md`](./epic-auth-billing-cloud-psg-readiness.md)
- [`object-access-review-matrix.md`](./object-access-review-matrix.md)
- App cloud hooks: `client/src/Epic1Editor/hooks/useSupabaseFileOperations.ts`
- Server auth: `server/src/utils/routeAccess.ts`, `server/src/services/supabase.ts`
