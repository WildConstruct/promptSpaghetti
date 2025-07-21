# OAuth Setup Guide

This guide explains how to configure OAuth providers for the Prompt Spaghetti application.

## Overview

The OAuth workflow implementation supports three providers:
- **Google** - OAuth 2.0 with OpenID Connect
- **GitHub** - OAuth 2.0 for developer-friendly authentication 
- **Microsoft** - OAuth 2.0 with Azure AD integration

## Provider Configuration

### Google OAuth Setup

1. **Go to Google Cloud Console**
   - Visit [https://console.developers.google.com](https://console.developers.google.com)
   - Create a new project or select an existing one

2. **Enable Google+ API**
   - Navigate to "APIs & Services" → "Library"
   - Search for "Google+ API" and enable it
   - Also enable "Google Identity" if available

3. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Select "Web application"

4. **Configure OAuth Settings**
   - **Name**: Prompt Spaghetti OAuth
   - **Authorized JavaScript origins**: 
     - `http://localhost:3000` (development)
     - `https://yourdomain.com` (production)
   - **Authorized redirect URIs**:
     - `http://localhost:8000/auth/oauth/callback/google` (development)
     - `https://yourdomain.com/auth/oauth/callback/google` (production)

5. **Update Environment Variables**
   ```bash
   GOOGLE_CLIENT_ID=your-actual-client-id.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-actual-client-secret
   GOOGLE_REDIRECT_URI=http://localhost:8000/auth/oauth/callback/google
   ```

### GitHub OAuth Setup

1. **Go to GitHub Developer Settings**
   - Visit [https://github.com/settings/applications/new](https://github.com/settings/applications/new)
   - Or navigate to Settings → Developer settings → OAuth Apps

2. **Register New Application**
   - **Application name**: Prompt Spaghetti
   - **Homepage URL**: `http://localhost:3000` (or your domain)
   - **Authorization callback URL**: `http://localhost:8000/auth/oauth/callback/github`

3. **Get Client Credentials**
   - After creating, copy the Client ID
   - Generate a new client secret

4. **Update Environment Variables**
   ```bash
   GITHUB_CLIENT_ID=your-actual-github-client-id
   GITHUB_CLIENT_SECRET=your-actual-github-client-secret
   GITHUB_REDIRECT_URI=http://localhost:8000/auth/oauth/callback/github
   ```

### Microsoft OAuth Setup

1. **Go to Azure Portal**
   - Visit [https://portal.azure.com](https://portal.azure.com)
   - Navigate to "Azure Active Directory" → "App registrations"

2. **Register New Application**
   - Click "New registration"
   - **Name**: Prompt Spaghetti
   - **Supported account types**: Accounts in any organizational directory and personal Microsoft accounts
   - **Redirect URI**: Web → `http://localhost:8000/auth/oauth/callback/microsoft`

3. **Configure API Permissions**
   - Go to "API permissions"
   - Add "Microsoft Graph" permissions:
     - `openid` (Sign in and read user profile)
     - `profile` (Read user's basic profile)
     - `email` (Read user's email address)

4. **Create Client Secret**
   - Go to "Certificates & secrets"
   - Click "New client secret"
   - Copy the secret value immediately (it won't be shown again)

5. **Update Environment Variables**
   ```bash
   MICROSOFT_CLIENT_ID=your-actual-microsoft-client-id
   MICROSOFT_CLIENT_SECRET=your-actual-microsoft-client-secret
   MICROSOFT_REDIRECT_URI=http://localhost:8000/auth/oauth/callback/microsoft
   ```

## Development Setup

### Quick Start for Development

1. **Copy Environment Template**
   ```bash
   cp .env.example .env
   ```

2. **Configure OAuth State Secret**
   ```bash
   # Generate a secure random key (at least 32 characters)
   OAUTH_STATE_SECRET=$(openssl rand -base64 32)
   ```

3. **Update .env File**
   - Replace placeholder OAuth credentials with actual values from providers
   - Ensure `OAUTH_ENABLED=true`

### Testing OAuth Flow

1. **Start the Application**
   ```bash
   # Start server
   cd server && npm start

   # Start client (in another terminal)
   cd client && npm start
   ```

2. **Test OAuth Login**
   - Navigate to `http://localhost:3000/login`
   - You should see OAuth provider buttons
   - Click any provider to test the OAuth flow

3. **Verify OAuth Callback**
   - After OAuth consent, you should be redirected to `/auth/callback`
   - The application should complete authentication and redirect to the main app

## Production Deployment

### Security Considerations

1. **Use HTTPS URLs**
   - All redirect URIs must use HTTPS in production
   - Update OAuth provider configurations accordingly

2. **Secure Environment Variables**
   - Store OAuth credentials in secure environment variables
   - Never commit OAuth secrets to version control

3. **Configure CORS**
   - Ensure CORS is properly configured for your production domain
   - Update `VITE_TRUSTED_DOMAINS` in environment variables

### Production Environment Variables

```bash
# Production OAuth Configuration
OAUTH_ENABLED=true
OAUTH_STATE_SECRET=your-production-secret-key-64-characters-minimum
OAUTH_SESSION_TIMEOUT=3600

# Update redirect URIs for production
GOOGLE_REDIRECT_URI=https://yourdomain.com/auth/oauth/callback/google
GITHUB_REDIRECT_URI=https://yourdomain.com/auth/oauth/callback/github
MICROSOFT_REDIRECT_URI=https://yourdomain.com/auth/oauth/callback/microsoft
```

## Troubleshooting

### Common Issues

1. **Invalid Redirect URI**
   - Ensure redirect URIs in OAuth provider settings exactly match your configuration
   - Check for trailing slashes and protocol mismatches

2. **CORS Errors**
   - Verify that your OAuth provider allows your domain as an authorized origin
   - Check CORS configuration in your server

3. **State Parameter Mismatch**
   - Ensure `OAUTH_STATE_SECRET` is set and consistent
   - Check that session storage is working properly

4. **Access Denied Errors**
   - Verify OAuth provider credentials are correct
   - Check that required API permissions are granted

### Debug Mode

Enable OAuth debugging by adding to your `.env`:

```bash
DEBUG_OAUTH=true
LOG_LEVEL=debug
```

This will provide detailed logging of OAuth flows for troubleshooting.

## OAuth Workflow Architecture

The OAuth implementation consists of:

1. **Frontend Components**:
   - `OAuthProviderButtons` - OAuth provider selection buttons
   - `OAuthCallback` - Handles OAuth callback processing

2. **Backend Services**:
   - `OAuthService` - Core OAuth provider integration
   - `OAuthPolicyService` - OAuth policy management and compliance

3. **Routes**:
   - `GET /auth/oauth/authorize` - Initiates OAuth flow
   - `GET /auth/oauth/callback/:provider` - Handles OAuth callbacks

4. **Authentication Flow**:
   - User clicks OAuth provider button
   - Frontend requests OAuth authorization URL from backend
   - Backend generates secure state and returns OAuth provider URL
   - User completes OAuth consent with provider
   - Provider redirects to callback URL with authorization code
   - Backend exchanges code for tokens and creates user session
   - Frontend completes authentication and redirects to app

This architecture ensures secure, compliant OAuth authentication with comprehensive audit trails and policy enforcement.