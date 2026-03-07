# Supabase Graph Ownership Checklist

This checklist documents the backend policy contract required by the current MVP cloud graph flows.

## Repo Migration Convention

The repo already has a SQL migration convention under `server/database/migrations/*.sql`, including existing policy examples that use `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` plus `CREATE POLICY ...` statements. The snippets below are written to match that convention while using Supabase-native `auth.uid()` for identity.

## Required RLS Policies

- Read private rows: authenticated users may read rows where `user_id = auth.uid()`.
- Read public rows: any user may read rows where `is_public = true`.
- Insert own rows only: authenticated users may insert rows only when `user_id = auth.uid()`.
- Update own rows only: authenticated users may update rows only where `user_id = auth.uid()`.
- Delete own rows only: authenticated users may delete rows only where `user_id = auth.uid()`.
- No anonymous writes: anonymous users may not insert, update, or delete graph rows.

## Exact Supabase SQL Policy Snippets

### `public.graphs` table RLS

```sql
ALTER TABLE public.graphs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS graphs_select_public_policy ON public.graphs;
CREATE POLICY graphs_select_public_policy ON public.graphs
    FOR SELECT
    TO anon, authenticated
    USING (is_public = true);

DROP POLICY IF EXISTS graphs_select_own_policy ON public.graphs;
CREATE POLICY graphs_select_own_policy ON public.graphs
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS graphs_insert_own_policy ON public.graphs;
CREATE POLICY graphs_insert_own_policy ON public.graphs
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS graphs_update_own_policy ON public.graphs;
CREATE POLICY graphs_update_own_policy ON public.graphs
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS graphs_delete_own_policy ON public.graphs;
CREATE POLICY graphs_delete_own_policy ON public.graphs
    FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());
```

### Optional hardening for `public.graphs`

If the table exists but ownership and visibility columns are still nullable, tighten them so policy behavior stays predictable.

```sql
ALTER TABLE public.graphs
    ALTER COLUMN user_id SET NOT NULL,
    ALTER COLUMN is_public SET NOT NULL,
    ALTER COLUMN is_public SET DEFAULT false;
```

### Supabase Storage policy snippets for bucket-backed graph files

The current repo also contains a separate helper path in `packages/core/utils/psgStorage.ts` that reads and writes Supabase Storage objects under the `graphs` bucket using caller-supplied `userId` path prefixes. If that helper remains in use, table RLS is not enough on its own; the storage bucket needs matching policies.

```sql
DROP POLICY IF EXISTS graphs_bucket_select_own_policy ON storage.objects;
CREATE POLICY graphs_bucket_select_own_policy ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'graphs'
        AND owner = auth.uid()
    );

DROP POLICY IF EXISTS graphs_bucket_insert_own_policy ON storage.objects;
CREATE POLICY graphs_bucket_insert_own_policy ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'graphs'
        AND owner = auth.uid()
    );

DROP POLICY IF EXISTS graphs_bucket_update_own_policy ON storage.objects;
CREATE POLICY graphs_bucket_update_own_policy ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'graphs'
        AND owner = auth.uid()
    )
    WITH CHECK (
        bucket_id = 'graphs'
        AND owner = auth.uid()
    );

DROP POLICY IF EXISTS graphs_bucket_delete_own_policy ON storage.objects;
CREATE POLICY graphs_bucket_delete_own_policy ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'graphs'
        AND owner = auth.uid()
    );
```

If the bucket does not set `storage.objects.owner` consistently, these policies need to be replaced with a path-based check such as `name LIKE ('users/' || auth.uid()::text || '/graphs/%')`. The helper contract in `psgStorage.ts` currently assumes exactly that path layout.

## Client Assumptions

- UI gating is not authorization. Showing or hiding Supabase controls does not protect data.
- Caller-provided `userId` is untrusted until backend policy enforcement applies.
- Cached `supabase_id` values in local storage are hints only and must not bypass ownership checks.
- Client-side `.eq('user_id', user.id)` filters are convenience filters, not a substitute for RLS.

## Trusted Identity And Object References

| Call site | Trusted field | Controlled by | Current mitigation | Required mitigation |
| --- | --- | --- | --- | --- |
| `packages/asset-browser/src/components/OpenGraphDialog.tsx` | `userId` passed to `supabaseList(userId)` | client/session caller | UI gating only | helper implementation plus RLS must enforce own/public visibility |
| `packages/asset-browser/src/components/OpenGraphDialog.tsx` | `userId` passed to `supabaseGet(userId, name)` | client/session caller | UI gating only | helper implementation plus RLS must enforce own/public visibility |
| `client/src/Epic1Editor/hooks/useSupabaseFileOperations.ts` | `localStorage['epic1-graph'].supabase_id` | local client state | update query also filters on `user_id` | treat cached ID as a hint only; backend RLS must enforce ownership |
| `client/src/Epic1Editor/hooks/useSupabaseFileOperations.ts` | `sb.auth.getUser()` result | Supabase auth session | anonymous cloud save is rejected client-side | keep server policy aligned so unauthenticated writes are impossible |
| `client/src/Epic1Editor/hooks/useSupabaseFileOperations.ts` | Supabase row `graph.nodes` / `graph.edges` | persisted row content | client graph validator now runs before editor mutation | preserve validation before every raw graph-state mutation path |

## Current MVP Safeguards

- Anonymous cloud writes are rejected in the client before insert/update.
- Cloud update and delete flows filter on both row ID and `user_id`.
- Graph payloads loaded from Supabase are validated before mutating editor state.

## Follow-On Hardening

- Move list/get/save/delete graph operations behind server-owned APIs if the product outgrows direct client table access.
- Reduce or remove helper contracts that accept caller-supplied `userId`.
- Add automated verification for RLS policy presence in deployment or setup tooling.

## Preset Loader Source-Policy Audit

This audit is specifically about whether preset-loading paths outside `packages/core/components/epic1/hooks/useDragDropHandlers.ts` still bypass the new preset source policy.

### Confirmed bypasses

- `packages/core/runtime/presetInsertion.ts`
  - `loadPresetFromPath(path, options)` still does a raw `fetch(path)` and then `insertPreset(content, options)`.
  - It does not normalize the path through the drag/drop allowlist and does not call `isSafePresetSourcePath(...)`.
  - If any caller passes untrusted input into this helper, it bypasses the new source policy entirely.

### Not a source-policy bypass, but still an ingestion surface

- `packages/asset-browser/src/components/OpenGraphDialog.tsx`
  - This file loads full graphs, not preset drop payloads.
  - `ServerPane` fetches `/graphs/${filename}` from a server manifest.
  - `SupabasePane` calls injected `supabaseList(userId)` and `supabaseGet(userId, name)` helpers.
  - `LocalPane` reads a user-selected local file.
  - These are outside preset-source policy scope, but they remain important graph-ingestion paths and should keep their own validation boundaries.

- `client/src/Epic1Editor/utils/psgDocument.ts`
  - `loadReactFlowFromPsgContent(...)` parses raw PSG text content directly.
  - This is content parsing, not remote source resolution.

### Current non-bypass preset-related paths

- `packages/asset-browser/src/components/PresetCard.tsx`
  - Emits preset drag payload metadata only.
  - Does not itself fetch preset content.

- `packages/asset-browser/src/components/EnhancedPresetCard.tsx`
  - Emits preset drag payload metadata only.
  - Does not itself fetch preset content.

- `packages/asset-browser/src/services/FragmentManifestLoader.ts`
  - Produces normalized preset entries rooted at `/assets/library/...`.
  - It is a manifest/entry producer, not a preset fetch/insertion bypass by itself.

## Next-Pass Security Backlog

### 1. Move Supabase graph operations behind server-owned APIs

- Replace direct client `.from('graphs')` CRUD in `client/src/Epic1Editor/hooks/useSupabaseFileOperations.ts` with server endpoints.
- Replace direct storage calls in `packages/core/utils/psgStorage.ts` with server-owned list/get/put/delete APIs.
- Have the server derive identity from the Supabase session or verified token, not from client parameters.
- Preserve current client graph validation before editor mutation even after server mediation.

### 2. Reduce caller-supplied `userId` helper contracts

- Remove `userId` from `OpenGraphDialog` helper contracts where possible.
- Change `supabaseList(userId)` to a zero-argument "list current user graphs" helper.
- Change `supabaseGet(userId, name)` to a server-validated object fetch keyed by graph id or opaque handle.
- Refactor `packages/core/utils/psgStorage.ts` so path prefixes are derived from trusted session identity, not function arguments.

### 3. Add structured validation for metadata and LLM analysis responses

- Define explicit schemas for graph metadata, preset metadata, and any persisted analysis payloads.
- Validate LLM-produced JSON before storage, rendering, or graph mutation.
- Reject unknown high-risk fields where possible instead of silently preserving them.
- Separate "display-only" metadata from "execution-affecting" metadata.

### 4. Narrow legacy compatibility parsing further

- Split trusted canonical parsing from compatibility parsing at the API boundary.
- Keep `validatePreset(...)` and editor open flows on the narrowest parser that satisfies the current asset corpus.
- Review `parsePsgWithCompatibility(...)`, `readPsg(..., { strictValidation: false })`, and `loadReactFlowFromPsgContent(...)` callers for opportunities to default back to stricter parsing.
- Reserve the loosest compatibility path for explicit import/migration flows rather than normal trusted-runtime ingestion.

### 5. Close the remaining preset-source gap

- Either remove `loadPresetFromPath(...)` or make it consume the shared preset source policy helper before fetch.
- Add tests proving unsafe absolute URLs, traversal-like paths, and out-of-root paths are rejected across every preset fetch helper, not just drag/drop.
- Keep the source policy centralized in `presetSourcePolicy.ts` so future loaders do not fork the allowlist rules.
