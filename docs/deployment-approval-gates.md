# Deployment Approval Gates

## Overview

This document describes the comprehensive deployment approval gating system that integrates with GitHub Actions, Vercel deployments, and the existing approval infrastructure to ensure controlled, safe deployments across all environments.

## Architecture

### Components

1. **GitHub Actions** - Custom actions for approval workflow integration
2. **Deployment Gate API** - Serverless endpoint for validation and auto-approval
3. **Approval Rules Engine** - Environment-specific criteria and thresholds
4. **Dashboard Integration** - UI for monitoring and managing deployment approvals
5. **Database Extensions** - Enhanced approval tracking for deployments

### Flow Diagram

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Git Push/PR    │───▶│  GitHub Actions  │───▶│ Approval Gate   │
│  (main branch)  │    │  CI/CD Pipeline  │    │ Validation      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │                        │
                              ▼                        ▼
                    ┌──────────────────┐    ┌─────────────────┐
                    │  Quality Gates   │    │ Auto-Approval   │
                    │  (Tests/Security)│    │ Criteria Check  │
                    └──────────────────┘    └─────────────────┘
                              │                        │
                              ▼                        ▼
                    ┌──────────────────┐    ┌─────────────────┐
                    │ Request Approval │    │ Manual Approval │
                    │ (if required)    │    │ Workflow        │
                    └──────────────────┘    └─────────────────┘
                              │                        │
                              └────────┬───────────────┘
                                       ▼
                              ┌─────────────────┐
                              │ Deploy to       │
                              │ Vercel/Target   │
                              └─────────────────┘
```

## Implementation Details

### 1. GitHub Actions Integration

#### Custom Actions Created

**`.github/actions/request-approval/action.yml`**
- Creates approval requests via API
- Integrates with existing approval system
- Posts PR comments with approval status
- Creates GitHub checks for visibility

**`.github/actions/wait-approval/action.yml`**
- Polls for approval completion
- Handles timeouts and escalation
- Updates GitHub checks with progress
- Supports cancellation and rejection

**`.github/actions/check-approval-status/action.yml`**
- Quick status checks for approval requests
- Provides detailed approval progress
- Extractable approval metadata

#### Deployment Workflow

**`.github/workflows/deployment-approval.yml`**
- Triggered on main branch pushes
- Environment-specific deployment gates
- Auto-approval for eligible changes
- Manual approval workflow for complex deployments
- Integration with Vercel deployment
- Real-time status updates and notifications

### 2. Deployment Gate API

**`api/deployment-gate.js`** - Vercel serverless function providing:

#### Core Features
- Environment-specific approval validation
- Auto-approval criteria evaluation
- Real-time approval status checking
- Integration with existing approval database

#### Auto-Approval Conditions
```javascript
const AUTO_APPROVAL_CONDITIONS = {
  production: {
    testCoverage: 90,
    securityScan: 'passed',
    maxRegressionPercent: 5,
    breakingChanges: false,
    maxChangedFiles: 10,
    maxLinesChanged: 500
  },
  staging: {
    testCoverage: 80,
    securityScan: 'passed',
    maxRegressionPercent: 15,
    breakingChanges: true
  }
};
```

#### API Endpoints
- `GET /api/deployment-gate` - Check approval status
- `POST /api/deployment-gate` - Validate and create approvals

### 3. Approval Rules Engine

**`server/src/config/deployment-approval-rules.ts`**

#### Environment Rules
```typescript
const DEPLOYMENT_APPROVAL_RULES = {
  production: {
    required: true,
    minimumApprovals: 2,
    requiredCriteria: [
      'security-review',
      'performance-impact', 
      'business-approval'
    ],
    escalationRules: [
      { triggerAfterHours: 4, escalateTo: ['engineering-manager'] },
      { triggerAfterHours: 8, escalateTo: ['cto'] }
    ]
  }
};
```

#### Reviewer Assignment
- **Automatic**: System-assigned based on expertise
- **Round-robin**: Balanced workload distribution
- **Load-balanced**: Assignment based on current capacity
- **Manual**: Explicit reviewer specification

### 4. Dashboard Integration

#### Deployment Approval Dashboard
**`packages/core/components/DeploymentApprovalDashboard.tsx`**

Features:
- Real-time deployment approval status
- Environment-specific filtering
- Progress tracking and metrics
- Integration with existing approval UI
- Auto-refresh and live updates

#### API Routes
**`server/src/routes/deployment-approvals.ts`**
- `GET /api/approval/deployment-requests` - List deployments
- `POST /api/approval/deployment-requests` - Create approval
- `GET /api/approval/deployment-requests/:id` - Get details
- `PUT /api/approval/deployment-requests/:id/review` - Submit review

### 5. Configuration

#### Vercel Integration
Updated `vercel.json`:
```json
{
  "functions": {
    "api/deployment-gate.js": {
      "maxDuration": 30
    }
  }
}
```

#### Environment Variables Required
- `APPROVAL_API_TOKEN` - Authentication for approval API
- `VERCEL_TOKEN` - Vercel deployment token
- `GITHUB_TOKEN` - GitHub API access
- `WORKSPACE_ID` - Default workspace identifier

## Usage Guide

### Setting Up Approval Gating

1. **Configure Environment Rules**
   ```typescript
   // Update deployment-approval-rules.ts
   const rules = {
     environment: 'production',
     minimumApprovals: 2,
     requiredCriteria: ['security-review', 'business-approval']
   };
   ```

2. **Set Repository Secrets**
   ```bash
   # GitHub repository secrets
   APPROVAL_API_TOKEN=<your-api-token>
   VERCEL_TOKEN=<vercel-deployment-token>
   VERCEL_ORG_ID=<vercel-org-id>
   VERCEL_PROJECT_ID=<vercel-project-id>
   ```

3. **Enable Workflow**
   - Deployment approval workflow runs automatically on main branch pushes
   - Manual triggers available for specific environments
   - Auto-approval for qualifying changes

### Manual Deployment Approval

1. **Trigger Workflow**
   ```bash
   # Manual workflow dispatch
   gh workflow run "Deployment Approval Gates" \
     -f environment=production \
     -f urgency=high
   ```

2. **Review in Dashboard**
   - Navigate to `/approval/dashboard`
   - Filter by deployment type
   - Review criteria and approve/reject

3. **Monitor Progress**
   - GitHub checks show real-time status
   - PR comments track approval progress
   - Email/Slack notifications for escalation

### Auto-Approval Setup

Deployments are automatically approved when they meet all criteria:

```typescript
const autoApprovalCriteria = {
  testCoverage: '>= 90%',
  securityScan: 'passed',
  performanceRegression: '< 5%',
  breakingChanges: false,
  changedFiles: '< 10',
  businessHours: 'optional' // for production
};
```

## Monitoring & Analytics

### Deployment Metrics
- Approval request frequency and duration
- Auto-approval success rates
- Review time by environment and reviewer
- Escalation patterns and bottlenecks

### Quality Metrics
- Test coverage impact on approvals
- Security scan effectiveness
- Performance regression detection
- Breaking change identification accuracy

### Dashboard Features
- Real-time approval queue status
- Reviewer workload distribution
- Environment-specific approval rates
- Historical trend analysis

## Security Considerations

### Access Control
- Approval reviewers assigned by role and expertise
- Environment-specific permissions
- Audit trail for all approval actions
- Rate limiting on approval API endpoints

### Validation
- Input sanitization on all approval data
- SQL injection protection in database queries
- CORS and authentication on all endpoints
- Encrypted storage of sensitive approval metadata

### Compliance
- Complete audit trail of deployment decisions
- Reviewer assignment transparency
- Approval criteria documentation
- Retention policies for approval records

## Troubleshooting

### Common Issues

1. **Approval Timeout**
   - Default timeout: 24 hours production, 8 hours staging
   - Automatic escalation after 4 hours
   - Manual escalation available via dashboard

2. **Auto-Approval Failures**
   - Check test coverage requirements
   - Verify security scan status
   - Review performance regression thresholds
   - Validate deployment size limits

3. **Reviewer Assignment**
   - Verify reviewer pool configuration
   - Check availability and workload balance
   - Fallback to manual assignment if needed

### Debugging

1. **API Logs**
   ```bash
   # Check Vercel function logs
   vercel logs --follow api/deployment-gate
   ```

2. **GitHub Actions**
   ```bash
   # Check workflow run status
   gh run list --workflow="Deployment Approval Gates"
   ```

3. **Database Queries**
   ```sql
   -- Check approval request status
   SELECT * FROM approval_requests 
   WHERE resource_id LIKE 'deploy-%' 
   ORDER BY created_at DESC;
   ```

## Integration Examples

### Custom Approval Criteria
```typescript
// Add custom validation step
const customCriterion = {
  type: 'compliance-check',
  weight: 0.2,
  description: 'GDPR compliance verification',
  validationSteps: [
    {
      name: 'Data Privacy Scan',
      automatable: true,
      command: 'npm run privacy:scan'
    }
  ]
};
```

### External Tool Integration
```yaml
# GitHub Actions workflow extension
- name: External Security Scan
  run: |
    # Integrate with external security tools
    security-scanner --format json > scan-results.json
    
    # Update approval metadata
    curl -X POST /api/deployment-gate \
      -d "scan_results=$(cat scan-results.json)"
```

## Future Enhancements

### Planned Features
1. **Machine Learning**: Predictive approval recommendations
2. **A/B Testing**: Approval criteria optimization
3. **Integration**: Slack/Teams approval workflows
4. **Analytics**: Advanced deployment success correlation
5. **Mobile**: Mobile app for approval reviews

### Extensibility
- Plugin architecture for custom approval criteria
- Webhook system for external tool integration
- GraphQL API for advanced dashboard customization
- Multi-tenancy support for large organizations

## Conclusion

The deployment approval gating system provides comprehensive control over deployment processes while maintaining development velocity through intelligent auto-approval capabilities. The system integrates seamlessly with existing infrastructure and provides extensive monitoring and analytics capabilities for continuous improvement.