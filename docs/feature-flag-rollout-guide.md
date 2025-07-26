# Feature Flag Rollout Guide

This document provides comprehensive guidance for rolling out feature flags in the PromptScape system using our Epic 17.1 feature toggle infrastructure.

## Table of Contents

1. [Overview](#overview)
2. [Feature Flag Types](#feature-flag-types)
3. [Rollout Strategies](#rollout-strategies)
4. [Step-by-Step Rollout Process](#step-by-step-rollout-process)
5. [Monitoring and Metrics](#monitoring-and-metrics)
6. [Emergency Procedures](#emergency-procedures)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

## Overview

Our feature flag system supports sophisticated rollout strategies with Claude-specific impact tracking, dependency management, and emergency controls. All feature flags go through a controlled deployment process to ensure system stability and optimal user experience.

### Key Components

- **Feature Toggle Service**: Core evaluation engine
- **Toggle Dashboard**: Web interface for management
- **API Endpoints**: Programmatic control
- **Audit System**: Complete change tracking
- **Emergency Overrides**: Instant rollback capabilities

## Feature Flag Types

### 1. Boolean Toggles
**Use Case**: Simple on/off switches
```typescript
{
  type: ToggleType.BOOLEAN,
  value: { enabled: true }
}
```

### 2. Percentage Rollout
**Use Case**: Gradual feature deployment
```typescript
{
  type: ToggleType.PERCENTAGE_ROLLOUT,
  value: { 
    percentage: 25,
    saltKey: "feature_xyz_2024"
  }
}
```

### 3. Multivariate Testing
**Use Case**: A/B/C testing with multiple variants
```typescript
{
  type: ToggleType.MULTIVARIATE,
  value: {
    variants: [
      { key: "control", value: false, percentage: 50 },
      { key: "variant_a", value: { theme: "dark" }, percentage: 25 },
      { key: "variant_b", value: { theme: "light" }, percentage: 25 }
    ]
  }
}
```

### 4. Scheduled Toggles
**Use Case**: Time-based feature activation
```typescript
{
  type: ToggleType.SCHEDULED,
  value: {
    enabled: true,
    startTime: "2024-01-15T09:00:00Z",
    endTime: "2024-01-15T17:00:00Z",
    timezone: "UTC"
  }
}
```

### 5. Segmentation
**Use Case**: User-specific targeting
```typescript
{
  type: ToggleType.SEGMENTATION,
  value: {
    rules: [
      {
        attribute: "plan_type",
        operator: "in",
        value: ["premium", "enterprise"]
      }
    ],
    defaultValue: false
  }
}
```

## Rollout Strategies

### 1. Canary Rollout (Recommended)
**Timeline**: Gradual increase over 7-14 days
- Day 1: 1% of users
- Day 3: 5% of users  
- Day 5: 10% of users
- Day 7: 25% of users
- Day 10: 50% of users
- Day 14: 100% of users

### 2. Ring-based Deployment
**Target Segments**:
- Ring 0: Internal users (0.1%)
- Ring 1: Beta users (1%)
- Ring 2: Premium users (10%)
- Ring 3: All users (100%)

### 3. Geographic Rollout
**Regions**:
- Phase 1: US West Coast
- Phase 2: US East Coast  
- Phase 3: Europe
- Phase 4: Asia-Pacific
- Phase 5: Global

## Step-by-Step Rollout Process

### Phase 1: Pre-Rollout (1-2 days)

#### 1.1 Create Feature Toggle
```bash
curl -X POST /api/feature-toggles \
  -H "Content-Type: application/json" \
  -d '{
    "key": "new_corrections_ui",
    "name": "Enhanced Corrections Interface",
    "description": "New UI for the corrections management system",
    "type": "PERCENTAGE_ROLLOUT",
    "value": { "percentage": 0 },
    "claudeCompat": ["sonnet", "opus"],
    "claudeImpact": "OUTPUT_QUALITY",
    "enabled": true
  }'
```

#### 1.2 Verify Dependencies
```bash
# Check for conflicting toggles
curl -X GET /api/feature-toggles/new_corrections_ui/dependencies

# Verify Claude compatibility
curl -X GET /api/feature-toggles/claude-compatibility?feature=new_corrections_ui
```

#### 1.3 Set Up Monitoring
```bash
# Configure metrics collection
curl -X POST /api/feature-toggles/new_corrections_ui/monitoring \
  -d '{
    "metrics": ["evaluation_count", "error_rate", "user_satisfaction"],
    "alerts": {
      "error_rate_threshold": 0.05,
      "notification_channels": ["#alerts-feature-flags"]
    }
  }'
```

### Phase 2: Initial Rollout (Day 1-3)

#### 2.1 Start with Internal Users (0.1%)
```bash
# Update to target internal users only
curl -X PUT /api/feature-toggles/new_corrections_ui \
  -d '{
    "type": "SEGMENTATION",
    "value": {
      "rules": [{
        "attribute": "user_type",
        "operator": "equals", 
        "value": "internal"
      }],
      "defaultValue": false
    }
  }'
```

#### 2.2 Monitor for 24-48 hours
- Check error rates < 1%
- Verify Claude API costs within expected range
- Monitor user feedback
- Review performance metrics

#### 2.3 Expand to 1% General Population
```bash
curl -X PUT /api/feature-toggles/new_corrections_ui \
  -d '{
    "type": "PERCENTAGE_ROLLOUT",
    "value": { "percentage": 1 }
  }'
```

### Phase 3: Gradual Expansion (Day 3-14)

#### 3.1 Daily Percentage Increases
```bash
# Day 3: 5%
curl -X PUT /api/feature-toggles/new_corrections_ui/value \
  -d '{ "percentage": 5 }'

# Day 5: 10%  
curl -X PUT /api/feature-toggles/new_corrections_ui/value \
  -d '{ "percentage": 10 }'

# Day 7: 25%
curl -X PUT /api/feature-toggles/new_corrections_ui/value \
  -d '{ "percentage": 25 }'

# Day 10: 50%
curl -X PUT /api/feature-toggles/new_corrections_ui/value \
  -d '{ "percentage": 50 }'

# Day 14: 100%
curl -X PUT /api/feature-toggles/new_corrections_ui/value \
  -d '{ "percentage": 100 }'
```

#### 3.2 Quality Gates Between Phases
Before each increase, verify:
- [ ] Error rate < 2%
- [ ] Claude cost impact within 10% of baseline
- [ ] User satisfaction score > 4.0/5.0
- [ ] Performance latency increase < 50ms
- [ ] No critical bugs reported

### Phase 4: Full Rollout & Graduation (Day 14+)

#### 4.1 Complete Feature Flag Removal
After 30 days of 100% rollout:
```bash
# Archive the toggle
curl -X DELETE /api/feature-toggles/new_corrections_ui \
  -d '{ "reason": "Feature fully deployed and stable" }'
```

#### 4.2 Code Cleanup
- Remove feature flag checks from code
- Update documentation
- Archive related monitoring dashboards

## Monitoring and Metrics

### Key Metrics to Track

#### 1. Toggle Health Metrics
```bash
# Get toggle health status
curl -X GET /api/feature-toggles/new_corrections_ui/health
```

Expected Response:
```json
{
  "status": "healthy",
  "evaluationLatency": 12.3,
  "errorRate": 0.001,
  "cacheHitRate": 0.95,
  "lastChecked": "2024-01-15T10:30:00Z"
}
```

#### 2. Business Impact Metrics
- User engagement changes
- Claude API cost variations
- Performance improvements/degradations
- Error rates and user complaints

#### 3. Technical Metrics
- Feature flag evaluation latency
- Cache hit rates
- Database query performance
- Memory usage patterns

### Monitoring Dashboard Access

Visit the [Feature Toggle Dashboard](http://localhost:3000/admin/feature-toggles) to view:
- Real-time toggle status
- Performance metrics graphs
- User distribution charts
- Error rate trends
- Cost impact analysis

## Emergency Procedures

### Immediate Rollback (< 5 minutes)

#### 1. Emergency Disable
```bash
# Instant disable with TTL
curl -X POST /api/feature-toggles/new_corrections_ui/emergency-override \
  -d '{
    "action": "disable",
    "reason": "Critical bug affecting user data",
    "ttlMinutes": 60
  }'
```

#### 2. Partial Rollback
```bash
# Reduce to 10% immediately
curl -X PUT /api/feature-toggles/new_corrections_ui/value \
  -d '{ "percentage": 10 }'
```

### Escalation Procedures

**Level 1** (Warning): Error rate 2-5%
- Reduce rollout percentage by 50%
- Investigate within 30 minutes
- Notify on-call engineer

**Level 2** (Critical): Error rate 5-10%
- Reduce rollout to 1%
- Page primary developer
- Create incident ticket

**Level 3** (Emergency): Error rate >10%
- Immediate emergency disable
- Page entire on-call team
- Create P0 incident

## Best Practices

### 1. Feature Flag Naming
- Use descriptive, kebab-case names
- Include epic/story identifier
- Examples: `epic17-corrections-export`, `story-42-dark-mode`

### 2. Documentation Requirements
- Document Claude compatibility impacts
- List dependent features/toggles
- Provide rollback procedures
- Include success criteria

### 3. Testing Guidelines
- Test all toggle states in CI/CD
- Verify feature works at 0%, 50%, and 100%
- Test emergency override scenarios
- Validate performance under load

### 4. Gradual Rollout Rules
- Never increase rollout >2x in single day
- Maintain 24-hour observation periods
- Have automatic rollback triggers
- Monitor weekend/holiday impacts

### 5. Claude-Specific Considerations
- Track prompt token usage changes
- Monitor output quality metrics
- Test with different Claude model versions
- Measure hallucination rates

## Troubleshooting

### Common Issues

#### 1. Toggle Not Evaluating
**Symptoms**: Always returns false/default value
**Causes**:
- Toggle disabled or archived
- Cache corruption
- Invalid scoping rules

**Resolution**:
```bash
# Check toggle status
curl -X GET /api/feature-toggles/toggle_key/debug

# Clear cache
curl -X DELETE /api/feature-toggles/toggle_key/cache

# Verify rules
curl -X GET /api/feature-toggles/toggle_key/scopes
```

#### 2. High Evaluation Latency
**Symptoms**: Slow page loads, timeout errors
**Causes**:
- Complex segmentation rules
- Database query performance
- Cache misses

**Resolution**:
```bash
# Simplify rules temporarily
curl -X PUT /api/feature-toggles/toggle_key/rules \
  -d '{ "rules": [] }'

# Check database performance
curl -X GET /api/admin/database/slow-queries

# Warm up cache
curl -X POST /api/feature-toggles/toggle_key/warm-cache
```

#### 3. Inconsistent Behavior
**Symptoms**: Users see different states
**Causes**:
- Cache inconsistency
- Multiple evaluation contexts
- Race conditions

**Resolution**:
```bash
# Force cache refresh
curl -X POST /api/feature-toggles/refresh-all-caches

# Check for multiple contexts
curl -X GET /api/feature-toggles/toggle_key/evaluations?debug=true
```

### Support Contacts

- **Feature Flag Team**: @feature-flags-team
- **On-Call Engineer**: Use PagerDuty escalation
- **Emergency Hotline**: Call +1-555-0123
- **Slack Channel**: #feature-flags-alerts

### Useful Commands

```bash
# Quick health check all toggles
curl -X GET /api/feature-toggles/health-summary

# Get user's toggle states
curl -X GET /api/feature-toggles/evaluate-all?userId=user123

# Export toggle configuration
curl -X GET /api/feature-toggles/export > toggles-backup.json

# Import toggle configuration  
curl -X POST /api/feature-toggles/import -d @toggles-backup.json
```

---

## Checklist Template

Use this checklist for each feature flag rollout:

### Pre-Rollout
- [ ] Feature toggle created and configured
- [ ] Dependencies verified
- [ ] Monitoring dashboards set up  
- [ ] Emergency contacts notified
- [ ] Rollback procedures documented
- [ ] Success criteria defined

### During Rollout
- [ ] Error rates monitored at each phase
- [ ] User feedback collected
- [ ] Performance metrics tracked
- [ ] Claude cost impact measured
- [ ] Quality gates passed before increases

### Post-Rollout
- [ ] Feature toggle archived after 30 days
- [ ] Code cleanup completed
- [ ] Documentation updated
- [ ] Lessons learned documented
- [ ] Team retrospective held

---

*Last updated: January 2024*
*Document version: 1.0*
*Owner: Feature Flags Team*