# Feature Flag Naming Conventions

## Overview

This document establishes naming conventions for feature flags in the Prompt Spaghetti codebase to ensure consistency, discoverability, and maintainability.

## Naming Structure

Feature flags follow this pattern:

```
[epic]-[feature]-[variant]
```

### Components

1. **Epic Identifier** (required)
   - Format: `epic1`, `epic2`, etc.
   - Identifies which epic introduced the feature
   - Examples: `epic1`, `epic8`, `epic15`

2. **Feature Name** (required)
   - Format: kebab-case descriptive name
   - Clear, concise description of the feature
   - Examples: `inline-editing`, `new-engine`, `preview-system`

3. **Variant** (optional)
   - Format: specific variant or experiment
   - Used for A/B testing or gradual rollouts
   - Examples: `v2`, `experimental`, `beta`

## Examples

### Good Examples ✅

```typescript
epic1-inline-editing          // Clear, follows convention
epic1-new-engine             // Specific to engine replacement
epic1-preview-system         // Describes the feature
epic1-asset-library-beta     // Includes variant for beta testing
epic8-vfx-metadata          // Different epic, same convention
```

### Bad Examples ❌

```typescript
inlineEditing               // Missing epic identifier, wrong case
EPIC1_NEW_FEATURE           // Wrong case, not descriptive
epic-1-feature              // Incorrect epic format
new-cool-feature            // Missing epic, too vague
flag1                       // Not descriptive at all
```

## Categories and Tags

Each feature flag should have associated metadata:

### Required Tags

- **Epic**: `epic1`, `epic2`, etc.
- **Category**: `editor`, `engine`, `ui`, `api`, `performance`
- **Risk Level**: `low`, `medium`, `high`, `critical`

### Optional Tags

- **Team**: `frontend`, `backend`, `fullstack`
- **Customer Segment**: `internal`, `beta`, `enterprise`, `public`
- **Experiment**: `experiment-id` for A/B tests

## Lifecycle Stages

Feature flags go through these stages:

1. **Development** (`dev`)
   - Internal testing only
   - 0% rollout
   - Can break without notice

2. **Staging** (`staging`)
   - QA and integration testing
   - 0-5% rollout to internal users
   - Should be stable

3. **Beta** (`beta`)
   - Limited user testing
   - 5-25% rollout
   - Monitoring for issues

4. **GA** (`ga`)
   - General availability
   - 25-100% rollout
   - Production ready

5. **Deprecated** (`deprecated`)
   - Scheduled for removal
   - Users migrated to new solution
   - Remove within 30 days

## Emergency Kill Switches

Critical features must have kill switches:

```typescript
interface KillSwitchConfig {
  flag: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  autoDisableOn: {
    errorRate?: number; // e.g., 0.01 for 1%
    latency?: number; // e.g., 5000 for 5s
    customMetric?: string; // e.g., 'memory_usage > 1GB'
  };
  notifyChannels: string[]; // ['slack', 'pagerduty', 'email']
}
```

### Kill Switch Naming

Kill switches use the prefix `kill-`:

```
kill-[epic]-[feature]
```

Examples:

- `kill-epic1-inline-editing`
- `kill-epic1-new-engine`

## Configuration Management

### Development

```json
{
  "epic1-inline-editing": {
    "enabled": true,
    "rollout": 100,
    "overrides": {
      "user:dev@example.com": true
    }
  }
}
```

### Staging

```json
{
  "epic1-inline-editing": {
    "enabled": true,
    "rollout": 10,
    "segments": ["internal-users"],
    "excludeSegments": ["enterprise"]
  }
}
```

### Production

```json
{
  "epic1-inline-editing": {
    "enabled": true,
    "rollout": 50,
    "segments": ["beta-users"],
    "schedule": {
      "startDate": "2025-08-15T00:00:00Z",
      "endDate": "2025-09-15T00:00:00Z"
    },
    "dependencies": ["epic1-new-engine"]
  }
}
```

## Code Usage Examples

### React Components

```typescript
const MyComponent = () => {
  const isInlineEditingEnabled = useFeatureFlag('epic1-inline-editing');

  if (isInlineEditingEnabled) {
    return <InlineEditor />;
  }

  return <LegacyEditor />;
};
```

### With Fallback

```typescript
<FeatureFlag flag="epic1-preview-system" fallback={<LegacyPreview />}>
  <ModernPreview />
</FeatureFlag>
```

### API Routes

```typescript
app.post('/api/execute', async (req, res) => {
  const useNewEngine = await featureFlags.isEnabled(
    'epic1-new-engine',
    req.user.id
  );

  const engine = useNewEngine ? newEngine : legacyEngine;
  const result = await engine.execute(req.body);

  res.json(result);
});
```

## Monitoring and Metrics

Every feature flag should track:

1. **Adoption Metrics**

   ```typescript
   analytics.track('feature_flag_exposure', {
     flag: 'epic1-inline-editing',
     variant: 'enabled',
     userId: user.id,
     timestamp: Date.now()
   });
   ```

2. **Performance Impact**

   ```typescript
   const timer = monitoring.startTimer('epic1-new-engine');
   const result = await executeWithNewEngine();
   timer.end({ success: true });
   ```

3. **Error Rates**
   ```typescript
   try {
     await newFeature();
   } catch (error) {
     monitoring.recordError('epic1-preview-system', error);
     throw error;
   }
   ```

## Cleanup Policy

Feature flags must be removed when:

1. **100% Rollout** for 30+ days with no issues
2. **Deprecated** and all users migrated
3. **Experiment Concluded** with decision made

### Removal Process

1. Set flag to deprecated state
2. Monitor for 2 weeks
3. Remove flag code
4. Remove configuration
5. Update documentation

## Documentation Requirements

Each feature flag must have:

1. **Code Comments**

   ```typescript
   /**
    * Feature Flag: epic1-inline-editing
    * Description: Enables inline editing of nodes without side panel
    * Owner: @frontend-team
    * Created: 2025-08-01
    * Target GA: 2025-09-01
    */
   ```

2. **README Entry**

   ```markdown
   ### Active Feature Flags

   - `epic1-inline-editing`: Inline node editing (Beta)
   - `epic1-new-engine`: Deterministic execution engine (GA)
   ```

3. **Runbook Entry**
   - How to enable/disable
   - Known issues
   - Rollback procedures
   - Contact information

---

Last Updated: 2025-08-01
Next Review: 2025-09-01
