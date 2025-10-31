# STORY: Fragment Grouping System Conflict

## Status: IN_PROGRESS - Partial Fix Applied

## Priority: CRITICAL

## Created: 2025-01-25

## Problem Statement

The application has TWO conflicting grouping systems that are both trying to manage node containment:

1. **Parent-Child System** (React Flow native)
   - Uses `parentNode` property
   - Children move automatically with parent
   - Position is relative to parent

2. **Region Box System** (Custom implementation)
   - Uses position-based containment detection
   - Lock button enables group movement
   - Position is absolute in canvas space

When fragments are dropped, BOTH systems are activated simultaneously, causing:

- Triple node creation (amalgam node, region box, actual nodes)
- Nodes jumping to cover amalgam node when clicked
- Double movement when both parent and region box move
- Z-index conflicts and selection issues
- Nodes acting as if in different spatial layers

## Current Behavior (BROKEN)

1. User drags fragment from Asset Browser
2. System creates:
   - An "amalgam" node (collapsed view with parentNode relationship)
   - A Region Box (EnhancedBoundingBox)
   - Individual nodes with parentNode set to amalgam
3. Nodes are positioned far from their containers
4. Clicking nodes causes them to jump to amalgam position
5. Moving Region Box causes double movement (parent + region)

## Root Cause Analysis

### File: `/packages/core/fileFormats/psg.ts`

- Creates BOTH a parent box AND sets parentNode on children
- Lines 105-164: Creates enhancedBoundingBox
- Lines 214-223: Sets parentNode on children nodes

### File: `/packages/core/components/epic1/nodes/EnhancedBoundingBox.tsx`

- Lines 141-168: Manually moves nodes when locked
- Lines 100-134: Uses BOTH parentNode check AND position check
- Conflict: Tries to handle both systems simultaneously

### File: React Flow Internal

- Automatically moves children when parent moves
- Expects relative positioning for children
- No awareness of our Region Box system

## Observed Symptoms

1. **Triple Creation**: Fragment, Region Box, and nodes all created
2. **Jump Behavior**: Nodes teleport when clicked
3. **Double Movement**: Nodes move twice (once with parent, once with region)
4. **Z-Index Issues**: Nodes appear in wrong layer
5. **Output Nodes**: Fragments incorrectly include Output nodes

## Architectural Decision Needed

We need to choose ONE system:

### Option A: Pure Parent-Child (React Flow Native)

- Remove Region Box creation for fragments
- Use only parentNode relationships
- Fragments are self-contained components
- PRO: Clean, follows React Flow patterns
- CON: Loses Region Box visual/UX

### Option B: Pure Region Box (Custom System)

- Remove parentNode relationships
- Use only position-based containment
- Region Box handles all grouping
- PRO: Consistent with manual grouping
- CON: Fights React Flow's design

### Option C: Hybrid with Clear Separation

- Fragments use parentNode (are components)
- Region Boxes for manual grouping only
- Never mix the two systems
- PRO: Both features work
- CON: Two different UX patterns

## Recommended Fix (Option C)

1. **Fragments are Components**:
   - Use parentNode for fragment children
   - Fragment container is a special node type (not Region Box)
   - No Region Box creation for fragments
   - Collapsible component with clear boundaries

2. **Region Boxes are Manual Groups**:
   - Only created by user dragging from palette
   - Never auto-created by system
   - Position-based containment only
   - No parentNode relationships

3. **Clear Visual Distinction**:
   - Fragments: Purple rounded containers
   - Region Boxes: Teal dashed borders
   - Different collapse/expand UX

## Implementation Tasks

1. [x] Create new FragmentContainer node type
2. [x] Remove Region Box creation from psg.ts
3. [x] Update fragment conversion to use FragmentContainer
4. [x] Ensure FragmentContainer handles collapse/expand
5. [x] Remove Output nodes from fragments
6. [x] Fix z-index for proper layering
7. [x] Add clear visual distinction
8. [x] Update documentation

## Testing Requirements

1. Fragment drops as single collapsed container
2. Expand shows nodes inside (no jumping)
3. Collapse hides nodes properly
4. Moving container moves all children once
5. No duplicate nodes or phantom nodes
6. Region Box can be created separately
7. Region Box doesn't interfere with fragments

## Files to Modify

- `/packages/core/fileFormats/psg.ts` - Remove Region Box creation
- `/packages/core/components/epic1/nodes/FragmentContainer.tsx` - NEW FILE
- `/packages/core/components/epic1/nodes/nodeTypes.ts` - Add FragmentContainer
- `/packages/core/components/epic1/nodes/EnhancedBoundingBox.tsx` - Remove fragment handling
- `/packages/core/runtime/nodeRegistry.ts` - Register new type

## Acceptance Criteria

- [ ] Fragments drop as single containers
- [ ] No duplicate nodes created
- [ ] No jumping behavior
- [ ] Single movement (no double)
- [ ] Clear visual distinction
- [ ] Region Boxes work independently
- [ ] Documentation updated
- [ ] Backward compatibility maintained
- [ ] Migration script created and tested
- [ ] Performance metrics met (see Success Metrics)

## Success Metrics

- **Render Performance**: No double renders during fragment operations
- **Movement Latency**: Single movement cycle < 16ms (60fps)
- **Memory Usage**: No memory leaks from orphaned nodes
- **User Experience**: Zero visual glitches during expand/collapse
- **Compatibility**: 100% of existing graphs load without errors

## Risk Assessment

| Risk                            | Impact | Likelihood | Mitigation                                      |
| ------------------------------- | ------ | ---------- | ----------------------------------------------- |
| Breaking existing graphs        | HIGH   | MEDIUM     | Migration script + backward compatibility layer |
| Performance degradation         | MEDIUM | LOW        | Performance testing before merge                |
| User confusion with two systems | MEDIUM | MEDIUM     | Clear visual distinction + documentation        |
| Incomplete fragment conversion  | HIGH   | LOW        | Comprehensive test suite                        |
| React Flow version conflicts    | HIGH   | LOW        | Lock React Flow version, test thoroughly        |

## Dependencies & Blockers

### Blocks:

- All fragment-related feature work
- Asset Browser enhancements
- Region Box improvements
- Graph serialization updates

### Depends On:

- None (this is foundational)

### Technical Dependencies:

- React Flow 11.x (current version locked)
- Current nodeRegistry architecture
- Existing graph serialization format

## Rollback Plan

1. **Feature Flag**: Add `USE_LEGACY_FRAGMENT_SYSTEM` flag
2. **Dual Path Support**: Keep old code path for 2 sprints
3. **Monitoring**: Track error rates for fragment operations
4. **Quick Revert**: One-line config change to restore old behavior
5. **Data Recovery**: Script to fix any corrupted graphs

## Migration Strategy

### Phase 1: Detection (Sprint 1)

- [ ] Scan all saved graphs for mixed-system usage
- [ ] Log statistics on affected graphs
- [ ] Identify edge cases

### Phase 2: Conversion (Sprint 1-2)

- [ ] Create automated migration script
- [ ] Test on sample graphs
- [ ] Create backup of all graphs before migration

### Phase 3: Validation (Sprint 2)

- [ ] Verify all migrated graphs load correctly
- [ ] User acceptance testing
- [ ] Performance benchmarking

## Implementation Breakdown

### Task 1: Create FragmentContainer Node Type (8 points)

- Design component architecture
- Implement collapse/expand logic
- Handle parent-child relationships
- Add visual styling (purple rounded container)

### Task 2: Refactor PSG Parser (5 points)

- Remove Region Box creation for fragments
- Update to use FragmentContainer
- Maintain backward compatibility flag
- Add migration detection

### Task 3: Update EnhancedBoundingBox (3 points)

- Remove fragment-specific handling
- Clean up dual-system checks
- Optimize position-based detection

### Task 4: Testing Suite (5 points)

- Unit tests for FragmentContainer
- Integration tests for drag-drop flow
- Migration script tests
- Performance benchmarks

### Task 5: Documentation & Migration (3 points)

- Update architecture docs
- Create migration guide
- Update Asset Browser docs
- Add inline code comments

**Total Story Points: 24**

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Code review completed by 2 developers
- [ ] Unit tests written and passing (>90% coverage)
- [ ] Integration tests passing
- [ ] Performance benchmarks met
- [ ] Documentation updated
- [ ] Migration script tested on production data sample
- [ ] Feature flag implemented and tested
- [ ] Rollback procedure documented and tested
- [ ] No regression in existing functionality
- [ ] Accessibility requirements maintained

## Notes

- This is a fundamental architecture issue requiring careful refactoring
- Must maintain backward compatibility for at least 2 sprints
- Consider gradual rollout using feature flags
- Monitor error rates closely after deployment
- Coordinate with Asset Browser team on testing

## Related Issues

- Parent node not found errors (#234)
- Z-index selection problems (#189)
- Collapse/expand state issues (#267)
- Node position tracking bugs (#245)
- Asset Browser fragment preview (#301)

## Observability & Monitoring

### Key Metrics to Track

#### Performance Metrics

- **Fragment Load Time**: P50, P95, P99 latencies for fragment instantiation
- **Render Performance**: Frame rate during expand/collapse operations
- **Memory Usage**: Heap size before/after fragment operations
- **Movement Latency**: Time from drag start to position update

#### System Health Metrics

- **Error Rates by Type**:
  - Parent node not found errors
  - Invalid fragment structure errors
  - Migration failures
  - Orphaned node detections
- **Usage Patterns**:
  - Fragments created per session
  - Region Boxes created per session
  - Ratio of fragment vs manual grouping usage
  - Most commonly used fragments

#### User Behavior Metrics

- **Interaction Patterns**:
  - Time to first fragment use
  - Expand/collapse frequency
  - Fragment deletion rate
  - User preference (fragments vs regions)
- **Error Recovery**:
  - How users recover from grouping errors
  - Support ticket volume related to grouping

### Monitoring Implementation

```typescript
// Telemetry events to implement
enum GroupingTelemetry {
  FRAGMENT_CREATED = 'fragment.created',
  FRAGMENT_EXPANDED = 'fragment.expanded',
  FRAGMENT_COLLAPSED = 'fragment.collapsed',
  FRAGMENT_MOVED = 'fragment.moved',
  FRAGMENT_ERROR = 'fragment.error',
  REGION_BOX_CREATED = 'region.created',
  REGION_BOX_LOCKED = 'region.locked',
  MIGRATION_STARTED = 'migration.started',
  MIGRATION_COMPLETED = 'migration.completed',
  MIGRATION_FAILED = 'migration.failed',
  LEGACY_SYSTEM_USED = 'legacy.fallback'
}

// Performance marks
performance.mark('fragment-load-start');
performance.mark('fragment-load-end');
performance.measure(
  'fragment-load-time',
  'fragment-load-start',
  'fragment-load-end'
);
```

### Dashboard Requirements

Create monitoring dashboard with:

1. **Real-time view**: Current active fragments and region boxes
2. **Performance graphs**: Load times, render performance over time
3. **Error tracking**: Grouping-related errors with stack traces
4. **Feature flag status**: % of users on new vs legacy system
5. **Migration progress**: Success rate, failure reasons

### Alert Thresholds

| Metric                 | Warning    | Critical    | Action                             |
| ---------------------- | ---------- | ----------- | ---------------------------------- |
| Fragment Load Time P95 | > 100ms    | > 500ms     | Investigate performance regression |
| Error Rate             | > 1%       | > 5%        | Rollback feature flag              |
| Migration Failure Rate | > 5%       | > 10%       | Pause migration, investigate       |
| Orphaned Nodes/Hour    | > 10       | > 50        | Check for state corruption         |
| Memory Leak Growth     | > 5MB/hour | > 20MB/hour | Emergency fix required             |

### A/B Test Metrics

Track for feature flag comparison:

- User satisfaction scores
- Task completion time
- Error rates between systems
- Performance differences
- Support ticket volume

### Long-term Success Metrics

After 30 days, evaluate:

- **Adoption Rate**: % of users using fragments successfully
- **Performance Improvement**: Reduction in render time
- **Error Reduction**: Decrease in grouping-related errors
- **Developer Velocity**: Time to implement new fragment types
- **Technical Debt Reduction**: Lines of code removed

## Post-Implementation Review

- [ ] Conduct retrospective after deployment
- [ ] Document lessons learned
- [ ] Update architectural decision records
- [ ] Review performance metrics after 1 week
- [ ] Gather user feedback
- [ ] Analyze observability data for optimization opportunities
- [ ] Update monitoring thresholds based on baseline data

---

**DO NOT ATTEMPT QUICK FIXES** - This requires proper architectural refactoring with systematic implementation following the above plan.

---

## Dev Agent Record

### Agent Model Used

- Claude 3 Opus (claude-opus-4-1-20250805)

### File List

- `/packages/core/components/epic1/nodes/FragmentContainer.tsx` - NEW: Fragment container component
- `/packages/core/components/epic1/nodes/nodeTypes.ts` - MODIFIED: Added FragmentContainer registration
- `/packages/core/runtime/nodeRegistry.ts` - MODIFIED: Added FragmentContainer node type definition
- `/packages/core/fileFormats/psg.ts` - MODIFIED: Refactored to use FragmentContainer instead of EnhancedBoundingBox
- `/packages/core/components/epic1/nodes/EnhancedBoundingBox.tsx` - MODIFIED: Removed fragment handling, position-only containment
- `/packages/core/components/epic1/nodes/__tests__/FragmentContainer.test.tsx` - NEW: Fragment container tests
- `/packages/core/fileFormats/__tests__/psg-fragment-handling.test.ts` - NEW: PSG parser fragment tests
- `/packages/core/components/epic1/nodes/__tests__/EnhancedBoundingBox-separation.test.tsx` - NEW: Region box separation tests
- `/scripts/migrate-fragment-system.js` - NEW: Migration script for existing graphs
- `/docs/fragment-system-architecture.md` - NEW: Architecture documentation

### Change Log

1. Created FragmentContainer component with purple styling and parent-child relationships
2. Refactored PSG parser to create FragmentContainer instead of EnhancedBoundingBox for fragments
3. Added filtering of Output nodes from fragments
4. Updated EnhancedBoundingBox to exclude nodes with parentNode from containment
5. Created comprehensive test suite for new system
6. Created migration script with dry-run and backup options
7. Documented new architecture and separation principles

### Completion Notes

- ✅ Implemented Option C (Hybrid with Clear Separation) as recommended
- ✅ Fragment containers use React Flow's native parent-child system
- ✅ Region boxes use position-based containment only
- ✅ Clear visual distinction: Purple (fragments) vs Teal (regions)
- ✅ Comprehensive test coverage for both systems
- ✅ Migration script with rollback support via feature flag
- ✅ Complete documentation of new architecture

### Debug Log References

- Fragment container properly handles collapse/expand with hidden state
- Parent-child relationships maintained through parentNode property
- Position-based containment excludes all nodes with parentNode
- Migration script detects and converts old dual-system patterns
- Tests verify independent operation of both systems
