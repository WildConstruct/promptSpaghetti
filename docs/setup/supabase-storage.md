# Supabase Storage Setup for .psg Graphs

This guide walks you through configuring Supabase Storage for the in‑app file browser.

## Overview

- Bucket: `graphs`
- Object path convention: `users/{userId}/graphs/{name}.psg`
- Content type: `application/json`
- Upload behavior: upsert (overwrite if the name exists)

## 1) Create the Storage Bucket

1. Open your Supabase project → Storage → Create new bucket
2. Name: `graphs`
3. Public: leave UNCHECKED (private). Access will be controlled by policies.

## 2) Add Environment Variables

Add these to your `.env` (or CI envs). Only the URL and anon key are required for client access.

```
# Next.js-style (browser-accessible)
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Vite-style (browser-accessible)
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key

# Feature flags
NEXT_PUBLIC_FEATURE_SUPABASE=1  # set 0 to disable globally
NEXT_PUBLIC_FEATURE_DEV_USER=0  # set 1 to enable a local dev user id stub
```

Notes:

- Anon key is safe to ship to the client; use Storage policies to restrict access.
- Do not commit actual values to the repository.

## 3) Storage Policies (Basic Example)

Restrict access so users can only read/write under their own `users/{userId}/graphs/*` prefix.

In Storage → Policies → for the `objects` table of `graphs` bucket, create policies like:

```sql
-- Example: allow authenticated users to read their own objects
create policy "Read own graphs" on storage.objects
for select
using (
  bucket_id = 'graphs'
  and (auth.uid() is not null)
  and (position(('users/' || auth.uid() || '/graphs/') in name) = 1)
);

-- Example: allow authenticated users to insert/update their own objects
create policy "Write own graphs" on storage.objects
for insert
with check (
  bucket_id = 'graphs'
  and (auth.uid() is not null)
  and (position(('users/' || auth.uid() || '/graphs/') in name) = 1)
);

create policy "Update own graphs" on storage.objects
for update
using (
  bucket_id = 'graphs'
  and (auth.uid() is not null)
  and (position(('users/' || auth.uid() || '/graphs/') in name) = 1)
)
with check (
  bucket_id = 'graphs'
  and (auth.uid() is not null)
  and (position(('users/' || auth.uid() || '/graphs/') in name) = 1)
);
```

Adjust to your organization’s security standards. See Supabase docs for advanced policies and RLS.

## 4) Verify From the App

- Ensure `NEXT_PUBLIC_FEATURE_SUPABASE=1` and URL/anon key set.
- If using a dev user, set `NEXT_PUBLIC_FEATURE_DEV_USER=1` and ensure a deterministic id is available.
- Open the app → Save dialog → choose Supabase → save a graph named `example.psg`.
- Open the app → Open dialog → Supabase tab → confirm `example.psg` appears.

## 5) Troubleshooting

- Supabase tab hidden: check env vars, feature flag, and `userId` presence.
- 401/403 errors: confirm policies and that you are authenticated; for dev, enable the dev user stub.
- Missing files after save: ensure `contentType: application/json` and `upsert: true` are used (Story 1.11/1.13).

## Related Stories

- 1.11 Supabase client and storage utils
- 1.12 Open dialog — Supabase tab
- 1.13 Save to Supabase
- 1.14 Minimal auth and user context
- 1.18 CI preview and feature flags
