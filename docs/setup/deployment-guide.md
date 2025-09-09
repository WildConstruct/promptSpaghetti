# Deployment & Integration Guide

## Overview

This guide walks through deploying the Prompt Spaghetti application with all features from Stories 1.22-1.28 integrated, including authentication, cloud storage, and advanced UI features.

## Prerequisites

- Node.js 20.11.0+
- pnpm 8.0.0+
- Netlify account (for deployment)
- Supabase account (for auth & storage)

## 1. Supabase Setup

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and anon key from Settings > API

### 1.2 Configure Authentication

1. Navigate to Authentication > Providers
2. Enable Email/Password authentication:
   - Enable email confirmations (recommended)
   - Set password min length to 8 characters
   - Configure password strength requirements

3. Configure email templates:
   - Go to Authentication > Email Templates
   - Customize confirmation, password reset, and magic link emails
   - Add your app name and branding

4. Set redirect URLs:
   - Add your production URL: `https://your-app.netlify.app`
   - Add localhost for development: `http://localhost:3000`

### 1.3 Create Storage Bucket

```sql
-- Run in Supabase SQL Editor
CREATE POLICY "Authenticated users can upload PSG files"
ON storage.objects FOR INSERT
TO authenticated
USING (bucket_id = 'psg-files');

CREATE POLICY "Users can view their own PSG files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'psg-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own PSG files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'psg-files' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### 1.4 Database Schema (Optional)

```sql
-- For graph metadata and sharing features
CREATE TABLE graphs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE graphs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can CRUD their own graphs"
ON graphs FOR ALL
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Public graphs are viewable by all"
ON graphs FOR SELECT
TO authenticated
USING (is_public = true);
```

## 2. Environment Configuration

### 2.1 Local Development (.env)

Create `.env` file in project root:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR-ANON-KEY

# Feature Flags
VITE_FEATURE_AUTH=true
VITE_FEATURE_SUPABASE=true
VITE_REQUIRE_AUTH=false
VITE_AUTH_OPTIONAL=true

# API Configuration
VITE_API_URL=http://localhost:8000
VITE_DEBUG_MODE=true
```

### 2.2 Netlify Environment Variables

In Netlify Dashboard > Site Settings > Environment Variables:

```bash
# Required for Supabase Integration
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR-ANON-KEY

# Feature Flags (Production)
VITE_FEATURE_AUTH=true
VITE_FEATURE_SUPABASE=true
VITE_REQUIRE_AUTH=false
VITE_AUTH_OPTIONAL=true

# API Configuration
VITE_API_URL=https://api.promptscape.app
VITE_ANALYTICS_ENABLED=true
VITE_DEBUG_MODE=false

# Build Configuration
NODE_VERSION=20.11.0
NPM_CONFIG_LEGACY_PEER_DEPS=true
```

## 3. Feature Integration Verification

### 3.1 Authentication Components (Story 1.22)

✅ Components implemented:

- `AuthModal` with login/signup tabs
- `UserAvatar` with dropdown menu
- Form validation with password strength
- Loading states and error handling

### 3.2 Supabase Auth Integration (Story 1.23)

✅ Features implemented:

- Session restoration on app load
- Token refresh before expiration
- Cross-tab synchronization
- Offline queue for auth operations

### 3.3 Protected Features (Story 1.24)

✅ Feature gating implemented:

- Anonymous mode with full editor access
- Cloud features gated behind auth
- Work preservation during auth transitions
- Smart upgrade prompts

### 3.4 Post-it Notes (Story 1.25)

✅ Annotation system ready:

- Note creation and editing
- Markdown support
- Color customization
- Node attachment

### 3.5 Bounding Boxes (Story 1.26)

✅ Region system ready:

- Box drawing with Alt+drag
- Visual organization
- Node containment
- Style customization

### 3.6 Node Grouping (Story 1.27)

✅ Performance-optimized grouping:

- Hierarchical groups
- Batch operations
- Virtual rendering
- 60fps maintained

### 3.7 Edge Routing (Story 1.28)

✅ Advanced routing algorithms:

- 5 routing algorithms
- Control points
- Auto-routing
- Performance caching

## 4. Deployment Steps

### 4.1 Pre-deployment Checklist

```bash
# 1. Run tests
pnpm test

# 2. Build locally to verify
pnpm build

# 3. Check for TypeScript errors
pnpm --filter packages/core tsc --noEmit

# 4. Verify environment variables
node -e "console.log('Supabase URL:', process.env.VITE_SUPABASE_URL ? 'Set' : 'Missing')"
```

### 4.2 Deploy to Netlify

1. Connect GitHub repository to Netlify
2. Configure build settings:
   - Build command: `pnpm install && cd packages/asset-browser && npm run prebuild && cd ../.. && pnpm --filter client build`
   - Publish directory: `client/dist`
   - Node version: 20.11.0

3. Add environment variables (see section 2.2)

4. Deploy site

### 4.3 Post-deployment Verification

```javascript
// Test authentication flow
1. Visit deployed site
2. Click "Sign In"
3. Create new account
4. Verify email (check Supabase logs)
5. Test login/logout

// Test cloud storage
1. Create a graph
2. Save to cloud (requires auth)
3. Reload page
4. Load from cloud

// Test feature gating
1. Log out
2. Verify anonymous mode works
3. Try cloud features (should prompt upgrade)
4. Log in and verify features unlock
```

## 5. Bug Checking & Monitoring

### 5.1 Common Issues & Solutions

**Issue: Supabase connection fails**

```javascript
// Check browser console for errors
// Verify environment variables:
console.log('Supabase Config:', {
  url: import.meta.env.VITE_SUPABASE_URL,
  hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY
});
```

**Issue: Authentication state not persisting**

```javascript
// Check localStorage for session
localStorage.getItem('supabase.auth.token');

// Verify cross-tab sync
// Open multiple tabs and test auth state
```

**Issue: Build fails on Netlify**

```bash
# Clear cache and retry
# In Netlify: Deploy Settings > Clear cache and deploy

# Or update cache bust in netlify.toml:
NETLIFY_CACHE_BUST = "v6-auth-integration"
```

### 5.2 Performance Monitoring

```javascript
// Add to main app component
useEffect(() => {
  // Monitor performance
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'measure') {
          console.log(`${entry.name}: ${entry.duration}ms`);
        }
      }
    });
    observer.observe({ entryTypes: ['measure'] });
  }
}, []);
```

### 5.3 Error Tracking

```javascript
// Global error boundary
window.addEventListener('unhandledrejection', event => {
  console.error('Unhandled promise rejection:', event.reason);
  // Send to error tracking service
});
```

## 6. Security Checklist

- [ ] Supabase RLS policies configured
- [ ] Environment variables not exposed in client bundle
- [ ] HTTPS enforced in production
- [ ] CSP headers configured in netlify.toml
- [ ] Rate limiting on auth endpoints
- [ ] Input validation on all forms
- [ ] XSS protection in markdown rendering
- [ ] CSRF tokens for state-changing operations

## 7. Testing Integration

### Manual Testing Script

```bash
# 1. Anonymous User Flow
- Open app in incognito
- Create complex graph (10+ nodes)
- Test local save/load
- Verify upgrade prompts appear
- Sign up and verify work preserved

# 2. Authenticated User Flow
- Sign in with test account
- Create graph with notes and boxes
- Test cloud save/load
- Test cross-device sync
- Test sign out and data persistence

# 3. Edge Cases
- Network offline during auth
- Token expiration during work
- Large graph performance (100+ nodes)
- Concurrent edits (multiple tabs)
```

### Automated Testing

```javascript
// Run integration tests
pnpm test -- --testPathPattern="integration"

// Run E2E tests (if configured)
pnpm test:e2e
```

## 8. Rollback Plan

If deployment issues occur:

1. Revert to previous deployment in Netlify
2. Check Supabase logs for auth issues
3. Review browser console for client errors
4. Disable features via environment flags:
   - Set `VITE_FEATURE_AUTH=false` to disable auth
   - Set `VITE_FEATURE_SUPABASE=false` to disable cloud features

## Support & Troubleshooting

### Logs & Monitoring

- Netlify Functions logs: Netlify Dashboard > Functions
- Supabase logs: Supabase Dashboard > Logs
- Client errors: Browser DevTools Console

### Debug Mode

Enable debug mode for verbose logging:

```javascript
// Set in environment
VITE_DEBUG_MODE = true;
VITE_LOG_LEVEL = debug;
```

### Contact

- GitHub Issues: Report bugs and feature requests
- Documentation: `/docs/stories/` for feature details
- Architecture: `/docs/technical-designs/` for system design

---

Last Updated: 2025-01-10
Version: 1.0
