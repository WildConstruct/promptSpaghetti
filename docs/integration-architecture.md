# Prompt Spaghetti Integration Architecture

## Overview

This document maps all integration points between the new Prompt Spaghetti rebuild and the existing system, identifying risks and defining safe integration strategies.

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser Client                           │
├─────────────────────────────────────────────────────────────────┤
│  Legacy Components          │  New Components (Feature Flagged) │
│  - GraphEditor (existing)   │  - InlineEditor (new)           │
│  - InspectorPanel (keep)    │  - PromptAnalyzer (new)         │
│  - Palette (enhance)        │  - AssetLibrary (new)           │
│  - PreviewModal (enhance)   │  - LivePreview (new)            │
├─────────────────────────────────────────────────────────────────┤
│                    Shared State (Zustand)                       │
│  - graphStore (enhanced)                                        │
│  - featureFlagStore (new)                                       │
│  - migrationStore (new)                                         │
├─────────────────────────────────────────────────────────────────┤
│                    API Layer (Fastify)                          │
│  /api/v1/* (legacy)        │  /api/v2/* (new)                 │
├─────────────────────────────────────────────────────────────────┤
│                    Core Packages                                │
│  @promptscape/core (enhanced with backward compatibility)       │
└─────────────────────────────────────────────────────────────────┘
```

## Critical Integration Points

### 1. Frontend Integration Points

#### 1.1 React Flow Integration

**Current State**: Using React Flow for node-based UI  
**Integration Strategy**:

- Extend existing React Flow implementation
- Create wrapper components for new inline editing
- Maintain backward compatibility via feature flags

**Risk Level**: MEDIUM  
**Mitigation**:

```typescript
// Feature flag wrapper
const NodeComponent = featureFlags.inlineEditing
  ? InlineEditableNode
  : LegacyNode;
```

#### 1.2 State Management (Zustand)

**Current State**: Zustand store for graph state  
**Integration Strategy**:

- Extend existing store with new actions
- Add migration layer for state shape changes
- Version state for compatibility

**Risk Level**: HIGH  
**Mitigation**:

```typescript
// State migration
const migrateState = oldState => {
  if (oldState.version < 2) {
    return {
      ...oldState,
      version: 2,
      editStates: {}, // New field
      featureFlags: getDefaultFlags()
    };
  }
  return oldState;
};
```

#### 1.3 Component Library

**Current State**: Custom components + React Flow  
**Integration Strategy**:

- Preserve existing component APIs
- Add new components behind feature flags
- Gradual migration path

**Risk Level**: LOW

### 2. Backend Integration Points

#### 2.1 API Versioning

**Current Endpoints**:

- POST /preview
- POST /export
- GET /health

**Integration Strategy**:

```javascript
// Parallel API versions
app.post('/api/v1/preview', legacyPreviewHandler);
app.post('/api/v2/preview', newPreviewHandler);

// Route based on feature flag
app.post('/preview', (req, res) => {
  const version = req.headers['x-api-version'] || 'v1';
  return version === 'v2'
    ? newPreviewHandler(req, res)
    : legacyPreviewHandler(req, res);
});
```

**Risk Level**: LOW

#### 2.2 Execution Engine

**Current State**: Deterministic execution with seedrandom  
**Integration Strategy**:

- New engine extends existing functionality
- Maintains same input/output contract
- Performance improvements transparent

**Risk Level**: MEDIUM  
**Mitigation**:

- Comprehensive test suite comparing outputs
- A/B testing with result comparison
- Gradual rollout with monitoring

#### 2.3 File Format (.psg)

**Current Format**: YAML/JSON hybrid  
**Integration Strategy**:

```typescript
interface PSGFile {
  version: string; // Add version field
  nodes: Node[];
  edges: Edge[];
  metadata: {
    created: Date;
    modified: Date;
    backwardCompatibility?: {
      legacyFormat?: any;
    };
  };
}
```

**Risk Level**: HIGH  
**Mitigation**:

- Version detection and auto-migration
- Preserve legacy format in metadata
- Two-way conversion support

### 3. Data Integration Points

#### 3.1 LocalStorage

**Current Usage**: Graph persistence  
**Integration Strategy**:

- Namespace new data: `promptscape_v2_*`
- Migration utility for existing data
- Parallel storage during transition

**Risk Level**: MEDIUM

```javascript
// Data migration
const migrateLocalStorage = () => {
  const legacyData = localStorage.getItem('promptscape_graph');
  if (legacyData && !localStorage.getItem('promptscape_v2_graph')) {
    const migrated = migrateGraphData(legacyData);
    localStorage.setItem('promptscape_v2_graph', migrated);
    localStorage.setItem('promptscape_migration_backup', legacyData);
  }
};
```

#### 3.2 External Integrations

**Current**: ComfyUI export compatibility  
**Integration Strategy**:

- Maintain export format compatibility
- Add new fields as optional
- Version the export format

**Risk Level**: LOW

### 4. Deployment Integration

#### 4.1 Blue-Green Deployment

```yaml
# Vercel configuration
{
  'routes':
    [
      {
        'src': '/api/(.*)',
        'dest': '/api/$1',
        'headers': { 'x-deployment-version': 'blue|green' }
      }
    ]
}
```

#### 4.2 Feature Flag Service

```typescript
interface FeatureFlags {
  'inline-editing': boolean;
  'prompt-analyzer': boolean;
  'asset-library': boolean;
  'live-preview': boolean;
  'new-execution-engine': boolean;
}

// Gradual rollout
const getRolloutPercentage = (feature: string, userId: string) => {
  const hash = hashUserId(userId);
  return hash % 100 < featureRollouts[feature];
};
```

### 5. Monitoring Integration Points

#### 5.1 Performance Monitoring

```typescript
// Wrap critical functions
const monitorPerformance = (fn: Function, metric: string) => {
  return async (...args) => {
    const start = performance.now();
    try {
      const result = await fn(...args);
      const duration = performance.now() - start;
      metrics.record(metric, duration);
      return result;
    } catch (error) {
      metrics.recordError(metric, error);
      throw error;
    }
  };
};
```

#### 5.2 Error Tracking

```typescript
// Unified error boundary
class IntegrationErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    // Log to both legacy and new systems
    legacyErrorTracker.log(error);
    newErrorTracker.log(error, {
      ...errorInfo,
      integrationPoint: this.props.integrationPoint
    });
  }
}
```

## Risk Matrix

| Integration Point | Risk Level | Impact             | Mitigation Strategy                   |
| ----------------- | ---------- | ------------------ | ------------------------------------- |
| State Migration   | HIGH       | Data loss          | Backup, versioning, gradual migration |
| File Format       | HIGH       | Compatibility      | Version detection, two-way conversion |
| React Flow        | MEDIUM     | UI breaks          | Feature flags, component wrappers     |
| API Changes       | LOW        | Service disruption | Versioning, parallel endpoints        |
| External APIs     | LOW        | Export failures    | Format compatibility layer            |

## Integration Testing Strategy

### 1. Compatibility Tests

```typescript
describe('Integration Compatibility', () => {
  test('legacy graphs load in new system', () => {
    const legacyGraph = loadLegacyGraph();
    const result = newSystem.loadGraph(legacyGraph);
    expect(result.success).toBe(true);
    expect(result.nodes).toEqual(legacyGraph.nodes);
  });
});
```

### 2. A/B Testing

```typescript
// Compare execution results
const compareExecutions = async graph => {
  const legacyResult = await legacyEngine.execute(graph);
  const newResult = await newEngine.execute(graph);

  return {
    identical: deepEqual(legacyResult, newResult),
    performanceGain: newResult.time / legacyResult.time
  };
};
```

### 3. Rollback Testing

- Test each rollback procedure
- Verify data integrity after rollback
- Measure rollback time (target: <30s)

## Migration Checklist

### Pre-Deployment

- [ ] All regression tests pass
- [ ] Feature flags configured
- [ ] Rollback procedures tested
- [ ] Monitoring dashboards ready
- [ ] Team training complete

### During Deployment

- [ ] Blue environment ready
- [ ] Feature flags at 0%
- [ ] Monitoring active
- [ ] Support team briefed
- [ ] Rollback ready

### Post-Deployment

- [ ] Gradual feature flag increase
- [ ] Monitor error rates
- [ ] Track performance metrics
- [ ] Gather user feedback
- [ ] Document issues

## Emergency Procedures

### Critical Failure Response

1. **Immediate Actions** (< 5 minutes)
   - Disable all feature flags
   - Route traffic to legacy system
   - Alert on-call team

2. **Investigation** (< 30 minutes)
   - Check error logs
   - Review monitoring dashboards
   - Identify affected users

3. **Recovery** (< 1 hour)
   - Implement fix or full rollback
   - Verify system stability
   - Communicate with users

## Success Metrics

### Integration Success Criteria

- Error rate increase < 0.1%
- Performance degradation < 10%
- Zero data loss incidents
- User satisfaction maintained
- Successful progressive rollout

### Monitoring Thresholds

| Metric        | Normal  | Warning   | Critical |
| ------------- | ------- | --------- | -------- |
| Error Rate    | < 0.1%  | 0.1-1%    | > 1%     |
| Response Time | < 200ms | 200-500ms | > 500ms  |
| CPU Usage     | < 60%   | 60-80%    | > 80%    |
| Memory Usage  | < 70%   | 70-85%    | > 85%    |
