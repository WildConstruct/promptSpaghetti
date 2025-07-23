# Epic 16 Prerequisite System Documentation

The Epic 16 Prerequisite System provides comprehensive dependency validation and setup verification for the marketplace and community features. This system ensures all required Epic dependencies, infrastructure components, and service integrations are properly configured before Epic 16 deployment.

## Overview

Epic 16 has complex dependencies on multiple other epics and external services. The prerequisite system validates these dependencies systematically and provides automated fixing capabilities where possible.

### Key Dependencies

- **Epic 11 (Auth/RBAC)**: Authentication and role-based access control
- **Epic 13 (Analytics)**: Analytics infrastructure and ClickHouse
- **Epic 14 (Experimentation)**: A/B testing framework for marketplace optimization
- **Epic 15 (Cross-platform clients)**: Multi-platform client support
- **External Services**: Stripe, Claude API, Elasticsearch, Redis, PostgreSQL
- **Infrastructure**: CloudFront CDN, SSL certificates, security headers

## System Architecture

### Core Components

1. **Epic16PrerequisiteSystem**: Main validation engine with event-driven architecture
2. **Epic16PrerequisiteRunner**: CLI and programmatic runner with formatted reporting
3. **CLI Script**: Command-line interface with comprehensive options

### Check Categories

- **epic_dependency**: Validation of Epic 11, 13, 14, 15 services
- **infrastructure**: Core infrastructure (DB, cache, search, CDN)
- **service**: External service integrations (Stripe, Claude, etc.)
- **configuration**: Environment variables and database schemas
- **security**: SSL certificates and security headers

## Usage

### Basic Usage

```bash
# Run all prerequisite checks
node scripts/epic16-prerequisites.js

# Quick health check
node scripts/epic16-prerequisites.js --health

# Auto-fix failed checks
node scripts/epic16-prerequisites.js --auto-fix --verbose
```

### Advanced Usage

```bash
# Check only critical infrastructure
node scripts/epic16-prerequisites.js --categories infrastructure,service

# Generate HTML report
node scripts/epic16-prerequisites.js --format html --output epic16-report.html

# Production environment validation
node scripts/epic16-prerequisites.js --env production --verbose

# Skip specific checks
node scripts/epic16-prerequisites.js --skip ssl_certificates,cloudfront_cdn
```

### Programmatic Usage

```typescript
import { Epic16PrerequisiteSystem, Epic16PrerequisiteRunner } from '@/services/Epic16PrerequisiteSystem';

// Basic system usage
const system = new Epic16PrerequisiteSystem({
  environment: 'production',
  autoFixEnabled: true
});

const report = await system.runAllChecks();
console.log('Overall status:', report.overall.passed);

// Using the runner for formatted output
const runner = new Epic16PrerequisiteRunner({
  format: 'json',
  autoFix: true,
  verbose: true
});

const result = await runner.run();
```

## Configuration

### Environment Variables

Required environment variables for Epic 16:

```bash
# Epic Dependencies
EPIC11_AUTH_SERVICE_URL=https://auth.example.com
EPIC13_ANALYTICS_SERVICE_URL=https://analytics.example.com

# Core Infrastructure
DATABASE_URL=postgresql://user:pass@localhost:5432/marketplace
REDIS_URL=redis://localhost:6379
ELASTICSEARCH_URL=https://search.example.com:9200

# External Services
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
CLAUDE_API_KEY=sk-ant-...
ANTHROPIC_API_KEY=sk-ant-...  # Alternative to CLAUDE_API_KEY

# CDN and Domains
CLOUDFRONT_DISTRIBUTION_URL=https://d123456789.cloudfront.net
MARKETPLACE_DOMAIN=marketplace.example.com
API_DOMAIN=api.example.com

# Security
JWT_SECRET=your-jwt-secret
NODE_ENV=production
```

### Configuration File

Create a JSON configuration file for complex setups:

```json
{
  "environment": "production",
  "autoFix": false,
  "categories": ["epic_dependency", "infrastructure", "service"],
  "skipChecks": ["cloudfront_cdn"],
  "timeout": 60,
  "concurrency": 3,
  "format": "html",
  "outputFile": "epic16-prod-report.html",
  "verbose": true
}
```

Use with: `node scripts/epic16-prerequisites.js --config config.json`

## Check Definitions

### Epic 11 (Auth/RBAC) Checks

#### epic11_auth_service
- **Description**: Verify Epic 11 authentication service is available
- **Critical**: Yes
- **Auto-fix**: Service deployment (manual intervention required)
- **Validation**: HTTP health check to auth service endpoint

#### epic11_rbac_roles
- **Description**: Verify required marketplace roles exist
- **Critical**: Yes
- **Auto-fix**: Create missing roles (buyer, creator, admin, moderator)
- **Dependencies**: epic11_auth_service

### Epic 13 (Analytics) Checks

#### epic13_analytics_service
- **Description**: Verify Epic 13 analytics infrastructure is operational
- **Critical**: High
- **Auto-fix**: Service deployment (manual intervention required)

#### epic13_clickhouse
- **Description**: Verify ClickHouse database with required tables
- **Critical**: High
- **Dependencies**: epic13_analytics_service
- **Validation**: Database connectivity and table existence

### Infrastructure Checks

#### elasticsearch_cluster
- **Description**: Verify Elasticsearch 8 cluster for template search
- **Critical**: Yes
- **Auto-fix**: Create missing indices
- **Required Indices**: templates, kb_articles

#### redis_cache
- **Description**: Verify Redis cache availability and performance
- **Critical**: Yes
- **Auto-fix**: Limited (connection issues require manual intervention)
- **Performance**: Response time must be < 50ms

#### postgres_database
- **Description**: Verify PostgreSQL 15 with marketplace schemas
- **Critical**: Yes
- **Auto-fix**: Run database migrations
- **Required Tables**: users, templates, purchases, ratings, forum_posts, support_tickets

### Service Integration Checks

#### stripe_integration
- **Description**: Verify Stripe API keys and webhook configuration
- **Critical**: Yes
- **Auto-fix**: Limited (API keys require manual configuration)
- **Validation**: API connectivity test

#### claude_api_access
- **Description**: Verify Claude API access for template previews
- **Critical**: Yes
- **Auto-fix**: Limited (API keys require manual configuration)
- **Validation**: API test with rate limit check

### Security Checks

#### ssl_certificates
- **Description**: Verify SSL certificates for marketplace domains
- **Critical**: High
- **Auto-fix**: Not available (certificate management required)
- **Validation**: Certificate validity and expiration (> 30 days)

#### security_headers
- **Description**: Verify security headers configuration
- **Critical**: Medium
- **Auto-fix**: Update server configuration
- **Required Headers**: HSTS, CSP, X-Frame-Options, X-Content-Type-Options

## Dependency Management

The system automatically manages check dependencies:

1. **Dependency Graph**: Builds execution order based on dependencies
2. **Parallel Execution**: Runs independent checks concurrently
3. **Failure Propagation**: Skips dependent checks when dependencies fail
4. **Smart Retry**: Retries failed checks with exponential backoff

### Dependency Examples

```
epic11_rbac_roles → depends on → epic11_auth_service
epic13_clickhouse → depends on → epic13_analytics_service
marketplace_schema → depends on → postgres_database
```

## Auto-Fix Capabilities

The system can automatically resolve certain issues:

### Supported Auto-Fixes

- **Database**: Run migrations, create missing tables/indices
- **Roles**: Create missing RBAC roles
- **Configuration**: Set default environment variables
- **Security**: Update security headers configuration

### Manual Intervention Required

- **Service Deployment**: Epic services must be manually deployed
- **API Keys**: External service credentials require manual setup
- **SSL Certificates**: Certificate provisioning and management
- **Infrastructure**: Initial infrastructure provisioning

## Reporting and Output

### Console Output

Default colorized console output with progress tracking:

```
🔍 Starting Epic 16 prerequisite checks...
✅ epic11_auth_service: Epic 11 authentication service is healthy
❌ stripe_integration: Stripe secret key not configured
⚠️  2 of 15 checks failed (1 critical)
```

### JSON Report

Structured JSON output for automation:

```json
{
  "overall": {
    "passed": false,
    "totalChecks": 15,
    "failedChecks": 2,
    "criticalFailures": 1
  },
  "results": {
    "epic11_auth_service": {
      "passed": true,
      "message": "Epic 11 authentication service is healthy"
    }
  },
  "recommendations": [
    "Address critical failures immediately"
  ]
}
```

### HTML Report

Comprehensive HTML report with visual indicators:

- Interactive dashboard with metrics
- Color-coded check results
- Detailed error messages and recommendations
- Auto-fix results when applicable

### Markdown Report

GitHub-friendly markdown format:

```markdown
# Epic 16 Prerequisites Report

## ✅ Overall Status: PASSED

| Metric | Value |
|--------|-------|
| Total Checks | 15 |
| Passed | 13 |
| Failed | 2 |
```

## Monitoring Integration

### Health Check Endpoint

Use for monitoring and alerting:

```bash
# Returns exit code: 0=healthy, 1=degraded, 2=critical
node scripts/epic16-prerequisites.js --health
```

### CI/CD Integration

```yaml
# GitHub Actions example
- name: Check Epic 16 Prerequisites
  run: |
    node scripts/epic16-prerequisites.js \
      --env production \
      --format json \
      --output epic16-report.json
  
- name: Upload Report
  uses: actions/upload-artifact@v3
  with:
    name: epic16-prerequisites
    path: epic16-report.json
```

### Monitoring Script

```bash
#!/bin/bash
# Production monitoring script

# Run health check
node scripts/epic16-prerequisites.js --health

case $? in
  0)
    echo "✅ Epic 16 prerequisites healthy"
    ;;
  1)
    echo "⚠️ Epic 16 prerequisites degraded - non-critical issues"
    # Send warning alert
    ;;
  2)
    echo "❌ Epic 16 prerequisites critical failure"
    # Send critical alert
    ;;
  3)
    echo "💥 Epic 16 health check error"
    # Send error alert
    ;;
esac
```

## Development and Testing

### Adding New Checks

```typescript
// Add to Epic16PrerequisiteSystem constructor
this.addCheck({
  id: 'my_custom_check',
  name: 'My Custom Check',
  description: 'Validates custom requirement',
  category: 'configuration',
  severity: 'medium',
  check: this.checkCustomRequirement.bind(this),
  autoFix: this.fixCustomRequirement.bind(this),
  estimatedFixTime: 10
});

private async checkCustomRequirement(): Promise<PrerequisiteResult> {
  // Implementation
  return {
    passed: true,
    message: 'Custom requirement satisfied',
    timestamp: new Date()
  };
}
```

### Testing Prerequisites

```typescript
import { Epic16PrerequisiteSystem } from './Epic16PrerequisiteSystem';

describe('Epic16PrerequisiteSystem', () => {
  it('should validate Epic 11 auth service', async () => {
    const system = new Epic16PrerequisiteSystem({
      services: { authService: 'https://test-auth.example.com' }
    });
    
    const results = await system.runChecks(['epic11_auth_service']);
    expect(results.epic11_auth_service.passed).toBe(true);
  });
});
```

## Troubleshooting

### Common Issues

#### Epic 11 Auth Service Not Found
```
❌ epic11_auth_service: Epic 11 auth service endpoint not configured
```
**Solution**: Set `EPIC11_AUTH_SERVICE_URL` environment variable

#### Database Connection Failed
```
❌ postgres_database: PostgreSQL is not responding
```
**Solutions**:
1. Check `DATABASE_URL` format
2. Verify database server is running
3. Check network connectivity
4. Validate credentials

#### Stripe Integration Issues
```
❌ stripe_integration: Stripe secret key not configured
```
**Solution**: Set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`

#### High Prerequisites Failure Rate
```
⚠️ High failure rate detected - consider reviewing Epic 16 prerequisites documentation
```
**Solutions**:
1. Review this documentation
2. Check Epic 16 deployment guide
3. Verify all dependencies are properly deployed
4. Run with `--verbose` for detailed diagnostics

### Debug Mode

```bash
# Enable detailed debugging
DEBUG=1 node scripts/epic16-prerequisites.js --verbose

# Check specific category
node scripts/epic16-prerequisites.js --categories infrastructure --verbose

# Test individual check
node scripts/epic16-prerequisites.js --only postgres_database --verbose
```

## Best Practices

### Development Environment

1. Run prerequisites before starting Epic 16 development
2. Use auto-fix for development setup automation
3. Include prerequisite checks in development setup scripts

### Staging Environment

1. Run full prerequisite validation before deployment
2. Generate HTML reports for review
3. Validate Epic dependencies are properly configured

### Production Environment

1. Run prerequisites as part of deployment pipeline
2. Set up monitoring with health check endpoint
3. Generate comprehensive reports for compliance
4. Never use auto-fix in production without review

### CI/CD Pipeline

```yaml
stages:
  - prerequisites
  - test
  - build
  - deploy

prerequisites:
  stage: prerequisites
  script:
    - node scripts/epic16-prerequisites.js --env ${CI_ENVIRONMENT_NAME}
  artifacts:
    reports:
      junit: epic16-prerequisites-junit.xml
    paths:
      - epic16-report.html
  only:
    - main
    - staging
    - production
```

## API Reference

### Epic16PrerequisiteSystem

Main system class for running prerequisite checks.

#### Constructor Options

```typescript
interface Epic16PrerequisiteConfig {
  enabledCategories: string[];
  skipChecks: string[];
  autoFixEnabled: boolean;
  timeoutMs: number;
  concurrentChecks: number;
  retryAttempts: number;
  saveReports: boolean;
  reportRetentionDays: number;
  services: Record<string, string>;
  environment: 'development' | 'staging' | 'production';
}
```

#### Methods

- `runAllChecks()`: Run all enabled checks
- `runChecks(checkIds)`: Run specific checks
- `autoFixFailures()`: Attempt to fix failed checks
- `getQuickStatus()`: Quick health check for monitoring
- `addCheck(check)`: Add custom prerequisite check

### Epic16PrerequisiteRunner

CLI and programmatic runner with formatting options.

#### Constructor Options

```typescript
interface PrerequisiteRunnerOptions {
  categories?: string[];
  skipChecks?: string[];
  onlyChecks?: string[];
  autoFix?: boolean;
  timeout?: number;
  concurrency?: number;
  format?: 'console' | 'json' | 'html' | 'markdown';
  outputFile?: string;
  verbose?: boolean;
  colors?: boolean;
  configFile?: string;
  environment?: 'development' | 'staging' | 'production';
}
```

#### Methods

- `run()`: Execute prerequisite checks with configured options
- `getQuickStatus()`: Get quick health status

### CLI Script

Command-line interface with comprehensive options.

#### Exit Codes

- `0`: All checks passed
- `1`: Some checks failed (non-critical)
- `2`: Critical checks failed
- `3`: Error during execution

## Support

For issues with the Epic 16 Prerequisite System:

1. Check this documentation for common solutions
2. Review Epic 16 detailed design document
3. Verify environment configuration
4. Run with `--verbose` for detailed diagnostics
5. Check individual Epic documentation (11, 13, 14, 15)

The prerequisite system is designed to provide clear, actionable feedback for resolving Epic 16 deployment blockers. Most issues can be resolved by following the recommendations in the generated reports.