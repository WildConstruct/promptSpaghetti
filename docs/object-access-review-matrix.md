# Object Access Review Matrix

This document captures the Phase 2 cross-user access review for MVP/beta hardening.

Cross-user result meanings:

- `Pass`: owner scope is enforced in the server/runtime path reviewed here.
- `External dependency`: isolation depends on Supabase RLS/storage policy that is not defined in this repo.
- `Local-only`: object is browser-local or downloaded/exported and has no shared server object boundary.
- `Public read-only`: intentionally public and non-mutable in the reviewed path.

| Surface | Owner Scope | Auth Requirement | Allowed Operations | Cross-user Test Result | Notes |
| --- | --- | --- | --- | --- | --- |
| `/api/files/*` storage objects | Per authenticated user id | Bearer Supabase JWT | list, upload, download, delete | Pass | [server/src/routes/files.ts](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/server/src/routes/files.ts#L1) derives storage path from verified `req.authUserId`; caller cannot choose another owner prefix. |
| Saved cloud graphs in `graphs` table | Per `user_id`, plus optional public rows | Supabase auth for private rows | list, insert, update, delete | External dependency | [useSupabaseFileOperations.ts](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/client/src/Epic1Editor/hooks/useSupabaseFileOperations.ts#L247) uses client-side filters like `.eq('user_id', user.id)`, but real isolation depends on Supabase RLS not present in this repo. |
| Public graphs (`is_public = true`) | Shared public | None for read | read/list | External dependency | Public rows are intentionally cross-user readable; write protection still depends on RLS. |
| Presets in `client/public/presets` and `assets/library` | Shared public static assets | None | read | Public read-only | [presetSourcePolicy.ts](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/packages/core/components/epic1/hooks/presetSourcePolicy.ts#L1) restricts preset imports to approved static roots and blocks path traversal / external URLs. |
| Local editor graph cache (`epic1-graph`, autosave, workspace recovery) | Per browser profile | None | read, write, clear | Local-only | Stored in browser `localStorage`; no server-side cross-user surface. |
| PSG sidecar scene manifest (`epic1-psg-scene-manifest`) | Per browser profile | None | read, write, export | Local-only | Sidecar assets, placements, and crowd members are local draft state unless explicitly exported. |
| Local `.psg` / `.psg.scene.json` / `.scene-assembly.json` files | User filesystem | None | import, export | Local-only | Imported files should still be treated as hostile input; there is no cross-user server object once downloaded. |
| PSG API request documents (`/api/psg/*`) | Per authenticated caller, not persisted by default | Bearer Supabase JWT for POST routes | validate, normalize, asset register/derive, expand, assemble, export | Pass | [server/src/routes/psg.ts](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/server/src/routes/psg.ts#L1) now requires authenticated access and applies request/document caps, but these are request/response surfaces, not shared stored objects. |
| Agent draft requests (`/api/agent/draft-graph`) | Per authenticated caller, not persisted by default | Bearer Supabase JWT | draft graph | Pass | Response is request-scoped only; no shared persisted object layer in reviewed path. |
| LLM route requests (`/api/llm/*`) | Per authenticated caller, not persisted by default | Bearer Supabase JWT except `/status` | complete, parse, suggest, refine, analyze, optimize, populate | Pass | Request-scoped only. Server does not expose another caller’s payload or response history in the reviewed path. |
| Comfy / scene assembly exports | Browser download for current caller | Same as calling route | export/download | Local-only | Export payloads are returned directly to the caller and downloaded client-side; no shared export store exists in the reviewed path. |

Open risk that remains after this review:

- Cloud graph ownership is still only provable if the deployed Supabase `graphs` table has correct RLS for `select`, `insert`, `update`, and `delete`.
- The repo does not currently expose a server-owned saved-project surface beyond `/api/files/*`; most project persistence is either direct-to-Supabase table access or browser-local.
