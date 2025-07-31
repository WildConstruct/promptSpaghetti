# Deployment Guide

This document outlines the deployment process for the PromptScape Randomizer Graph application.

## Overview

The application is deployed using Vercel with the following architecture:

- **Frontend**: React + Vite application deployed to Vercel Edge Network
- **API**: Serverless functions deployed to Vercel Edge Functions
- **CDN**: Global CDN distribution for static assets

## Environments

### Development

- **URL**: `http://localhost:3000`
- **API**: `http://localhost:8000`
- **Purpose**: Local development and testing

### Staging

- **URL**: `https://promptscape-graph-staging.vercel.app`
- **API**: `https://promptscape-graph-staging.vercel.app/api`
- **Purpose**: Pre-production testing and validation

### Production

- **URL**: `https://promptscape-graph.vercel.app`
- **API**: `https://promptscape-graph.vercel.app/api`
- **Purpose**: Live production environment

## Deployment Process

### Automatic Deployment

The application automatically deploys on:

1. **Pull Request**: Creates preview deployment
2. **Main Branch**: Deploys to production
3. **Develop Branch**: Deploys to staging (if configured)

### Manual Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Environment Variables

Configure these environment variables in Vercel dashboard:

#### Production Environment

```bash
NODE_ENV=production
ENABLE_CORRECTIONS=false
VITE_API_BASE_URL=https://promptscape-graph.vercel.app/api
VITE_ANALYTICS_ID=your-analytics-id
VITE_SENTRY_DSN=your-sentry-dsn
VITE_SENTRY_ENVIRONMENT=production
```

#### Staging Environment

```bash
NODE_ENV=staging
ENABLE_CORRECTIONS=true
VITE_API_BASE_URL=https://promptscape-graph-staging.vercel.app/api
VITE_ANALYTICS_ID=your-staging-analytics-id
VITE_SENTRY_DSN=your-sentry-dsn
VITE_SENTRY_ENVIRONMENT=staging
```

## Build Configuration

### Vercel Configuration (`vercel.json`)

```json
{
  "version": 2,
  "name": "promptscape-graph",
  "builds": [
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/client/$1"
    }
  ],
  "functions": {
    "api/preview.js": {
      "maxDuration": 30
    },
    "api/export.js": {
      "maxDuration": 30
    }
  }
}
```

### Build Process

1. **Client Build**: Vite builds the React application
2. **API Functions**: Serverless functions are deployed to Vercel Edge
3. **Static Assets**: Built files are uploaded to Vercel CDN
4. **Health Checks**: Automated health checks validate deployment

## API Endpoints

### Health Check

- **URL**: `/api/health`
- **Method**: GET
- **Purpose**: Service health monitoring

### Preview

- **URL**: `/api/preview`
- **Method**: POST
- **Purpose**: Execute graph with multiple seeds

### Export

- **URL**: `/api/export`
- **Method**: POST
- **Purpose**: Convert graph to GeneratorBundle format

## Monitoring & Observability

### Health Monitoring

```bash
# Check service health
curl https://promptscape-graph.vercel.app/api/health

# Expected response
{
  "status": "healthy",
  "timestamp": "2025-07-15T10:30:00.000Z",
  "version": "0.1.0-alpha",
  "environment": "production",
  "uptime": 3600,
  "memory": {
    "rss": 50331648,
    "heapTotal": 20971520,
    "heapUsed": 15728640,
    "external": 1638400
  }
}
```

### Performance Monitoring

- **Vercel Analytics**: Built-in performance monitoring
- **Custom Metrics**: Application-specific performance tracking
- **Error Tracking**: Sentry integration for error monitoring

### Logs

```bash
# View deployment logs
vercel logs

# View function logs
vercel logs --function=api/preview

# View real-time logs
vercel logs --follow
```

## Security

### Content Security Policy

```javascript
// Implemented in client/index.html
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline';
```

### CORS Configuration

```javascript
// API functions include CORS headers
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
```

### Environment Security

- Sensitive data stored in Vercel environment variables
- API keys and secrets not exposed to client
- Regular security audits and updates

## Performance Optimization

### CDN Configuration

- **Static Assets**: Cached for 1 year
- **API Responses**: Cached for 5 minutes
- **Edge Locations**: Global distribution

### Bundle Optimization

```bash
# Analyze bundle size
npm run build
npm run analyze

# Expected bundle sizes
# - Main bundle: < 2MB
# - Vendor bundle: < 1MB
# - Total gzipped: < 1MB
```

### Function Optimization

- **Cold Start**: < 200ms
- **Execution Time**: < 1s for graph preview
- **Memory Usage**: < 128MB per function

## Troubleshooting

### Common Issues

1. **Build Failures**

   ```bash
   # Check build logs
   vercel logs --build

   # Common causes:
   # - Missing environment variables
   # - TypeScript errors
   # - Missing dependencies
   ```

2. **Function Timeouts**

   ```bash
   # Increase timeout in vercel.json
   "functions": {
     "api/preview.js": {
       "maxDuration": 60
     }
   }
   ```

3. **CORS Issues**
   ```bash
   # Verify CORS headers in API functions
   # Check browser network tab for preflight requests
   ```

### Rollback Process

1. **Automatic Rollback**: Vercel automatically rolls back failed deployments
2. **Manual Rollback**:
   ```bash
   vercel rollback [deployment-url]
   ```
3. **Database Rollback**: If using database, follow separate rollback procedure

### Support

- **Documentation**: [Vercel Docs](https://vercel.com/docs)
- **Status Page**: [Vercel Status](https://vercel-status.com)
- **Support**: Create ticket in Vercel dashboard

## Maintenance

### Regular Tasks

1. **Security Updates**: Monthly dependency updates
2. **Performance Review**: Quarterly performance analysis
3. **Cost Optimization**: Monthly billing review
4. **Backup Verification**: Weekly backup validation

### Monitoring Checklist

- [ ] Health endpoint responds correctly
- [ ] All API functions are operational
- [ ] Performance metrics within acceptable ranges
- [ ] Error rates below threshold
- [ ] SSL certificates are valid
- [ ] CDN is functioning properly

---

_Last updated: 2025-07-15_
_Next review: 2025-08-15_
