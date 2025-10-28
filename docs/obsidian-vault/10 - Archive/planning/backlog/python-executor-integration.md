# Python Executor Integration - Backlog Item

## Status: DEFERRED TO BACKLOG

**Date Moved**: 2025-08-15
**Reason**: TypeScript client corrupted, feature not critical for MVP

## Overview

Epic 8 implements a Python Executor Service that allows users to create nodes that execute Python code within their prompt graphs. This provides powerful data transformation capabilities but requires significant infrastructure.

## Components

### 1. Python Executor Service (`python-executor/`)

- **Status**: Service implementation appears complete
- **Location**: `python-executor/` directory
- **Technology**: FastAPI, Docker, RestrictedPython
- **Features**:
  - Sandboxed Python execution
  - Security monitoring
  - Resource limits
  - Performance metrics
  - Docker deployment

### 2. TypeScript Client (`packages/core/python-executor-client.ts`)

- **Status**: CORRUPTED - severe syntax errors
- **Action Taken**: Renamed to `.ts.disabled`
- **Needs**: Complete rewrite from scratch

### 3. PythonTransform Node (`packages/core/runtime/nodes/PythonTransform.ts`)

- **Status**: Depends on corrupted client
- **Action Taken**: Renamed to `.ts.disabled`, export commented out
- **Location**: `packages/core/runtime/index.ts:190`

## Work Required to Re-enable

1. **Rewrite TypeScript Client**
   - Create new `python-executor-client.ts` from scratch
   - Implement proper interfaces for request/response
   - Add error handling and retry logic
   - Include authentication if needed

2. **Fix PythonTransform Node**
   - Update to use new client
   - Add proper validation
   - Implement caching strategy
   - Add UI components for code editor

3. **Security Review**
   - Audit sandboxing implementation
   - Test resource limits
   - Review allowed Python modules
   - Implement rate limiting

4. **Infrastructure Setup**
   - Docker compose configuration
   - Kubernetes deployment specs
   - Monitoring and logging
   - Performance optimization

5. **UI Integration**
   - Add Python node to palette
   - Create code editor component
   - Add syntax highlighting
   - Implement error display

## Business Value

- **Pros**:
  - Powerful data transformation capabilities
  - Advanced user features
  - Competitive differentiator
- **Cons**:
  - Infrastructure complexity
  - Security risks
  - Maintenance overhead
  - Not essential for MVP

## Recommendation

Focus on core prompt graph functionality first. Revisit Python execution when:

1. Core features are stable
2. User demand justifies complexity
3. Security infrastructure is mature
4. DevOps resources available

## Files to Restore When Ready

1. Rename `packages/core/python-executor-client.ts.disabled` back to `.ts` (after rewrite)
2. Rename `packages/core/runtime/nodes/PythonTransform.ts.disabled` back to `.ts`
3. Uncomment export in `packages/core/runtime/index.ts:190`
4. Add Python node to UI palette
5. Update documentation

## Related Documentation

- `python-executor/documentation.md` - Service documentation
- `docs/stories/archive-old/epic8-*.md` - Original epic stories
