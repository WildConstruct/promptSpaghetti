# Supabase Quick Setup Guide

## Step 1: Create Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Click "New project"
3. Enter:
   - Organization: Your org name
   - Project name: `prompt-spaghetti` (or your choice)
   - Database Password: Generate a strong password (save this!)
   - Region: Choose closest to your users
4. Click "Create new project" (takes ~2 minutes)

## Step 2: Get Your API Keys

Once project is created:

1. Go to Settings (gear icon) > API
2. Copy these values:
   - **Project URL**: `https://YOUR-PROJECT-ID.supabase.co`
   - **Anon/Public Key**: `eyJhbGc...` (long string)

## Step 3: Configure Authentication

1. Go to Authentication > Providers
2. Under "Email" provider:
   - Toggle ON "Enable Email provider"
   - Enable "Confirm email" (recommended)
   - Set "Minimum password length" to 8

3. Go to Authentication > URL Configuration
4. Add site URLs:
   ```
   http://localhost:3000
   http://localhost:3000/*
   https://YOUR-APP.netlify.app
   https://YOUR-APP.netlify.app/*
   ```

## Step 4: Create Storage Bucket

1. Go to Storage > Buckets
2. Click "New bucket"
3. Name: `psg-files`
4. Public bucket: OFF (keep private)
5. Click "Create bucket"

## Step 5: Set Up Storage Policies

1. Click on `psg-files` bucket
2. Go to Policies tab
3. Click "New policy" > "For full customization"

**Upload Policy:**

```sql
-- Name: Authenticated users can upload
-- Allowed operation: INSERT
-- Target roles: authenticated

(bucket_id = 'psg-files'::text)
```

**View Policy:**

```sql
-- Name: Users can view own files
-- Allowed operation: SELECT
-- Target roles: authenticated

(bucket_id = 'psg-files'::text) AND
(auth.uid()::text = (storage.foldername(name))[1])
```

**Delete Policy:**

```sql
-- Name: Users can delete own files
-- Allowed operation: DELETE
-- Target roles: authenticated

(bucket_id = 'psg-files'::text) AND
(auth.uid()::text = (storage.foldername(name))[1])
```

## Step 6: Local Development Setup

1. Create `.env` file in project root:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc... # Your anon key

# Feature Flags
VITE_FEATURE_AUTH=true
VITE_FEATURE_SUPABASE=true
VITE_AUTH_OPTIONAL=true

# API Configuration
VITE_API_URL=http://localhost:8000
```

2. Test connection:

```bash
# Start dev server
pnpm dev

# Open browser console and check:
# Should see no Supabase warnings if configured correctly
```

## Step 7: Netlify Deployment Setup

1. In Netlify Dashboard > Site Settings > Environment Variables
2. Add these variables:

```bash
VITE_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc... # Your anon key
VITE_FEATURE_AUTH=true
VITE_FEATURE_SUPABASE=true
VITE_AUTH_OPTIONAL=true
VITE_API_URL=https://api.promptscape.app # Or your API URL
```

3. Clear cache and redeploy:
   - Go to Deploys tab
   - Click "Trigger deploy" > "Clear cache and deploy site"

## Step 8: Verify Integration

### Test Authentication:

1. Open your deployed site
2. Click "Sign In"
3. Create a test account
4. Check email for verification link
5. Verify you can log in/out

### Test Storage:

1. Create a graph while logged in
2. Save to cloud
3. Refresh page
4. Load from cloud
5. Verify graph loads correctly

## Common Issues & Solutions

### "Supabase client is null"

- Check environment variables are set
- Verify VITE\_ prefix for Vite projects
- Check browser console for specific errors

### "Invalid API key"

- Verify you copied the full anon key
- Check for extra spaces or line breaks
- Ensure using anon key, not service key

### "Email not sending"

- Check spam folder
- Verify email settings in Supabase
- Use "Resend confirmation" option

### "Storage upload fails"

- Check bucket policies are correct
- Verify user is authenticated
- Check file size limits (default 50MB)

## Security Notes

- The anon key is safe to expose (it's meant to be public)
- Row Level Security (RLS) protects your data
- Never expose service role key in client code
- Always use HTTPS in production

## Testing Checklist

- [ ] Can create account
- [ ] Receive verification email
- [ ] Can log in/out
- [ ] Session persists on refresh
- [ ] Can save graph to cloud
- [ ] Can load graph from cloud
- [ ] Anonymous mode works without auth
- [ ] Upgrade prompts appear for anonymous users

## Support

- Supabase Docs: [supabase.com/docs](https://supabase.com/docs)
- Supabase Discord: [discord.supabase.com](https://discord.supabase.com)
- Project Issues: GitHub Issues

---

Created: 2025-01-10
Version: 1.0
