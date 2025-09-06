# Epic 11 – Catch-Up TODOs

This document lists Epic 11 deliverables that are incomplete or only partially complete according to `epic11plan.md` (snapshot 2025-07-18).

| Story                                             | Verification Status | Notes                                                |
| ------------------------------------------------- | ------------------- | ---------------------------------------------------- |
| 11.1.5 OAuth Integration                          | ❌ Not started      | No provider config, callback handlers, or UI present |
| 11.1.6 Session Management                         | ❌ Not started      | No session storage/renewal service or UI components  |
| 11.1.7 API Authentication                         | ❌ Not started      | JWT issuance & middleware not implemented            |
| 11.2 User Profile & Preferences (all sub-stories) | ❌ Not started      | Data models, UI, and preference systems missing      |
| 11.3 Access Control System (all sub-stories)      | ❌ Not started      | RBAC backend, UI, and admin panel not implemented    |
| 11.4 Teams & Organizations                        | ❌ Not started      | Plan exists but no code/docs evidence                |

Legend: ✅ Verified ⚠️ Partial ❌ Not found / Not started

## Next Steps

1. Search repository for any `auth/session`, `oauth`, or RBAC WIP branches to verify no hidden progress.
2. Estimate effort and dependencies for completing the above authentication & user-management work.
3. Create implementation tickets and link PRs here as they are opened.

Keep this file synchronized with updates to `epic11plan.md`.
