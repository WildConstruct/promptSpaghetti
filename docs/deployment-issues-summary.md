# Deployment Issues Summary - Post Epic 18 Merge

## Fixed Issues ✅

### 1. Netlify Build Configuration
- **Issue**: npm doesn't understand pnpm's `workspace:*` protocol
- **Fix**: Updated `netlify.toml` to use pnpm with corepack
- **Status**: ✅ Complete

### 2. Environment Variables Migration
- **Issue**: Client using `process.env.REACT_APP_*` instead of Vite's `import.meta.env.VITE_*`
- **Fix**: Created `client/src/config/environment.ts` and migrated all references
- **Status**: ✅ Complete

### 3. Epic 18 Component TODOs
- **FeatureToggleDashboard**: Added audit history modal and archive functionality
- **TemplateCard**: Added preview modal and creator profile navigation
- **Status**: ✅ Complete

## Remaining Issues to Address 🔧

### 1. API Endpoint Configuration
- **Issue**: Client assumes API is on same domain (`/api/marketplace`)
- **TODO**: Update production API URL in `netlify.toml` when backend is deployed
- **Current**: Set to placeholder `https://api.promptscape.app`

### 2. Missing Environment Variables
Several services expect environment variables not yet documented:
- `VITE_PYTHON_EXECUTOR_URL`
- `VITE_WEBSOCKET_URL`
- `VITE_STRIPE_PUBLISHABLE_KEY`

### 3. Backend Deployment Requirements
The following services need production configuration:
- PostgreSQL database connection
- Redis connection
- SMTP server for emails
- Python executor service
- WebSocket server

### 4. Remaining TODOs in Codebase
Found 93 TODO comments across the codebase, including:
- Email service integration (`server/src/auth/services/EmailService.ts`)
- Claude SDK implementation (`packages/claude-sdk/src/client.ts`)
- Various API integrations and error handlers

### 5. OAuth Configuration
- **Issue**: OAuth redirect URIs hardcoded to localhost
- **Location**: `server/src/auth/config.ts`
- **TODO**: Update with production URLs

## Next Steps

1. **Deploy Backend Services**
   - Set up production database (PostgreSQL)
   - Configure Redis instance
   - Deploy Python executor service
   - Set up WebSocket server

2. **Update Environment Variables**
   - Create production `.env` file
   - Configure all required services
   - Update `netlify.toml` with actual API endpoints

3. **Complete Remaining Features**
   - Implement email service
   - Complete Claude SDK integration
   - Address remaining TODO items

4. **Security Review**
   - Audit all environment variables
   - Ensure no hardcoded secrets
   - Review OAuth configurations

## Testing Checklist

Before production deployment:
- [ ] Test Netlify build with new pnpm configuration
- [ ] Verify all environment variables are set
- [ ] Test API connectivity from deployed frontend
- [ ] Verify OAuth flows with production URLs
- [ ] Test marketplace functionality end-to-end
- [ ] Verify feature toggles work correctly
- [ ] Test WebSocket connections
- [ ] Verify Python executor integration