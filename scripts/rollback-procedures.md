# Rollback Procedures for Epic 1

## Overview

This document outlines the rollback procedures for the Epic 1 Prompt Spaghetti MVP rebuild. Each procedure is designed to be executed within 30 seconds to minimize user impact.

## Rollback Decision Matrix

| Condition               | Threshold     | Action                        | Time Limit |
| ----------------------- | ------------- | ----------------------------- | ---------- |
| Error Rate              | >1%           | Automatic rollback            | Immediate  |
| Performance Degradation | >50%          | Alert + Manual decision       | 5 minutes  |
| User Complaints         | >10 in 1 hour | Investigate + Decide          | 15 minutes |
| System Crash            | Any           | Immediate rollback            | Immediate  |
| Data Corruption         | Any detected  | Immediate rollback + Recovery | Immediate  |

## Pre-Rollback Checklist

- [ ] Confirm issue severity matches rollback criteria
- [ ] Create incident ticket with details
- [ ] Notify on-call team via PagerDuty
- [ ] Take screenshot of error metrics
- [ ] Ensure backup systems are ready

## Rollback Procedures by Component

### 1. Frontend Rollback

**Trigger**: UI crashes, rendering errors, performance issues

```bash
#!/bin/bash
# frontend-rollback.sh

# 1. Switch CDN to previous version
aws cloudfront create-invalidation --distribution-id $DIST_ID --paths "/*"

# 2. Update index.html to point to previous bundle
aws s3 cp s3://prompt-spaghetti-prod/releases/previous/index.html \
         s3://prompt-spaghetti-prod/index.html

# 3. Clear service worker cache
echo "self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.map(key => caches.delete(key)))
  ));
});" > clear-cache.js

# 4. Verify rollback
curl -I https://app.promptspaghetti.com/health
```

### 2. Backend API Rollback

**Trigger**: API errors, data inconsistency, authentication failures

```bash
#!/bin/bash
# backend-rollback.sh

# 1. Blue-green switch
kubectl set image deployment/api-server \
  api-server=prompt-spaghetti:$PREVIOUS_VERSION \
  -n production

# 2. Wait for rollout
kubectl rollout status deployment/api-server -n production

# 3. Verify health
for i in {1..10}; do
  curl -f https://api.promptspaghetti.com/health || exit 1
  sleep 2
done

# 4. Update API gateway
aws apigateway update-stage \
  --rest-api-id $API_ID \
  --stage-name prod \
  --patch-operations op=replace,path=/deploymentId,value=$PREVIOUS_DEPLOYMENT
```

### 3. Database Rollback

**Trigger**: Schema migration failure, data corruption

```sql
-- database-rollback.sql

-- 1. Stop write traffic
UPDATE system_config SET read_only = true WHERE key = 'database_mode';

-- 2. Create backup point
BACKUP DATABASE prompt_spaghetti TO '/backups/emergency_rollback.bak';

-- 3. Restore from previous backup
BEGIN TRANSACTION;
  RESTORE DATABASE prompt_spaghetti
  FROM '/backups/pre_deployment.bak'
  WITH REPLACE, NORECOVERY;

  -- Apply transaction logs up to deployment time
  RESTORE LOG prompt_spaghetti
  FROM '/backups/logs/deployment_point.trn'
  WITH STOPAT = '2025-08-01 00:00:00';
COMMIT;

-- 4. Re-enable writes
UPDATE system_config SET read_only = false WHERE key = 'database_mode';
```

### 4. Feature Flag Rollback

**Trigger**: Feature causing issues in production

```typescript
// feature-flag-rollback.ts

import { FeatureFlags } from '@core/safety/SafetyFramework';

const flags = FeatureFlags.getInstance();

// Immediate disable of problematic features
const rollbackFeatures = async () => {
  // 1. Disable new features
  flags.setFlag('epic1-inline-editing', false);
  flags.setFlag('epic1-new-engine', false);
  flags.setFlag('epic1-preview-system', false);

  // 2. Notify connected clients
  await broadcastToClients({
    type: 'FEATURE_FLAG_UPDATE',
    flags: flags.getAllFlags()
  });

  // 3. Clear client caches
  await redis.del('feature_flags:*');

  // 4. Log rollback
  await auditLog.record({
    action: 'FEATURE_FLAG_ROLLBACK',
    timestamp: new Date(),
    flags: flags.getAllFlags()
  });
};
```

### 5. CDN/Static Asset Rollback

**Trigger**: Corrupted assets, broken dependencies

```bash
#!/bin/bash
# cdn-rollback.sh

# 1. Switch to previous asset version
PREVIOUS_VERSION=$(aws s3 ls s3://prompt-spaghetti-assets/versions/ | tail -2 | head -1 | awk '{print $2}')

# 2. Update CDN origin
aws cloudfront update-distribution \
  --id $DISTRIBUTION_ID \
  --distribution-config file://previous-config.json

# 3. Invalidate cache
aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*" \
  --caller-reference "rollback-$(date +%s)"

# 4. Update asset manifest
echo "{\"version\": \"$PREVIOUS_VERSION\", \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" > manifest.json
aws s3 cp manifest.json s3://prompt-spaghetti-assets/manifest.json
```

## Automated Rollback Script

```bash
#!/bin/bash
# auto-rollback.sh - Main rollback orchestrator

set -e

ROLLBACK_TYPE=$1
REASON=$2

log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a /var/log/rollback.log
}

notify_team() {
  curl -X POST $SLACK_WEBHOOK -d "{
    \"text\": \"🚨 Rollback initiated: $1\",
    \"attachments\": [{
      \"color\": \"danger\",
      \"fields\": [
        {\"title\": \"Type\", \"value\": \"$ROLLBACK_TYPE\"},
        {\"title\": \"Reason\", \"value\": \"$REASON\"},
        {\"title\": \"Time\", \"value\": \"$(date)\"}
      ]
    }]
  }"
}

# Main rollback logic
case $ROLLBACK_TYPE in
  "full")
    log "Starting full system rollback"
    notify_team "Full System Rollback"
    ./frontend-rollback.sh
    ./backend-rollback.sh
    ./database-rollback.sh
    ;;
  "frontend")
    log "Starting frontend rollback"
    notify_team "Frontend Rollback"
    ./frontend-rollback.sh
    ;;
  "backend")
    log "Starting backend rollback"
    notify_team "Backend Rollback"
    ./backend-rollback.sh
    ;;
  "database")
    log "Starting database rollback"
    notify_team "Database Rollback"
    ./database-rollback.sh
    ;;
  "feature")
    log "Starting feature flag rollback"
    notify_team "Feature Flag Rollback"
    node ./feature-flag-rollback.js
    ;;
  *)
    log "Unknown rollback type: $ROLLBACK_TYPE"
    exit 1
    ;;
esac

# Verify system health after rollback
sleep 10
HEALTH_CHECK=$(curl -s https://api.promptspaghetti.com/health | jq -r '.status')

if [ "$HEALTH_CHECK" = "healthy" ]; then
  log "Rollback completed successfully"
  notify_team "Rollback completed - System healthy"
else
  log "Rollback may have failed - Manual intervention required"
  notify_team "⚠️ Rollback completed but system unhealthy - MANUAL CHECK REQUIRED"
fi
```

## Post-Rollback Actions

1. **Immediate (0-5 minutes)**
   - Verify system stability
   - Check error rates returning to normal
   - Monitor user sessions
   - Update status page

2. **Short-term (5-30 minutes)**
   - Gather diagnostic data
   - Create incident report
   - Notify affected users
   - Schedule post-mortem

3. **Long-term (24-48 hours)**
   - Complete root cause analysis
   - Update rollback procedures
   - Implement fixes
   - Plan re-deployment

## Communication Templates

### Status Page Update

```
We are currently experiencing issues with [COMPONENT].
Our team has initiated a rollback to restore service stability.
Expected resolution: [TIME]
Updates will be posted every 15 minutes.
```

### User Notification

```
Subject: Brief Service Interruption - Action May Be Required

We experienced a brief service issue at [TIME].
Your work has been automatically saved.
If you were in the middle of an action, please retry.

We apologize for any inconvenience.
```

### Internal Alert

```
ROLLBACK EXECUTED
Type: [ROLLBACK_TYPE]
Reason: [REASON]
Started: [START_TIME]
Completed: [END_TIME]
Status: [SUCCESS/FAILED]
Action Required: [NEXT_STEPS]
```

## Testing Rollback Procedures

Run monthly drills:

```bash
# rollback-drill.sh
#!/bin/bash

# Run in staging environment
export ENVIRONMENT=staging

# Test each rollback type
for type in frontend backend database feature; do
  echo "Testing $type rollback..."
  ./auto-rollback.sh $type "Monthly drill test"
  sleep 60

  # Verify recovery
  if curl -f https://staging.promptspaghetti.com/health; then
    echo "✓ $type rollback successful"
  else
    echo "✗ $type rollback failed"
    exit 1
  fi
done

echo "All rollback procedures tested successfully"
```

---

Last Updated: 2025-08-01
Next Review: 2025-09-01
