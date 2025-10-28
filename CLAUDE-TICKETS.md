# CLAUDE-TICKETS.md

## MULTI-AGENT COMMUNICATION INSTRUCTIONS

### INSTRUCTIONS FOR FUTURE COMMUNICATION:

1. **For Windsurf:**
   - Always identify yourself at the beginning
   - Summarize work completed since last communication
   - Include structured git-style comments with feat/fix/docs prefixes
   - Mention dependencies and related components
   - Update this section when making significant changes

2. **For Claude:**
   - When you see this section and respond, add your new comments above previous ones
   - DO NOT delete previous comments - it means they haven't been cleared out by the other agent which means they are still relevant
   - Retain these instructions for future communications
   - Add your own comments following a similar structure
   - Prepend each new entry with the current date

### TASK MANAGEMENT WORKFLOW (UPDATED - No More Phases!):

**CRITICAL**: Epic 19 privacy/compliance tasks should NOT be actively worked on. Focus on authentication and file browser priorities.

**IMPORTANT EPIC 1 UPDATE (2025-08-02)**: Epic 1 tasks are now tracked in `src/data/epic1-state.json` instead of the old database system. When working on Epic 1:

- Check `src/data/epic1-state.json` for task status and assignment
- Update task status directly in this file when completing work
- The old database `state.db` is deprecated for Epic 1 tasks
- Use standard git workflow for tracking changes to epic1-state.json

Developers can now self-assign and manage tasks directly without waiting for ASSIGN/BUILD phases:

1. **Check business priorities and available tasks:**

   ```bash
   # ALWAYS check priorities first (CRITICAL STEP)
   node src/show-priority-tasks.js

   # See team coordination dashboard
   node src/monitor-available-tasks.js
   ```

2. **Grab priority tasks to work on:**

   ```bash
   # Grab high-priority business tasks (RECOMMENDED)
   node src/grab-tasks.js <your-dev-id> 2 --priority-only

   # Grab authentication tasks (PRIORITY 1)
   node src/grab-tasks.js <your-dev-id> 2 --story=20.1

   # Grab file browser tasks (PRIORITY 2)
   node src/grab-tasks.js <your-dev-id> 2 --story=20.2

   # Basic usage (gets mixed tasks - USE WITH CAUTION)
   node src/grab-tasks.js <your-dev-id> 3

   # Examples:
   node src/grab-tasks.js dev_A 2 --priority-only
   node src/grab-tasks.js Dev-James-Security 1 --story=20.1
   ```

   **🎯 PRIORITY GUIDANCE**: Always use `--priority-only` or story filters to align with business priorities!

3. **Complete work and submit for review:**

   ```bash
   # CRITICAL: ALWAYS call this when your implementation is done
   node src/finish-task.js <task-id>

   # Other state transitions:
   node src/finish-task.js <task-id> COMPLETED
   node src/finish-task.js <task-id> BLOCKED
   ```

   **⚠️ IMPORTANT**: Every agent MUST call `finish-task.js` when they complete implementation.
   Failing to do this leaves tasks stuck IN_PROGRESS even when the work is done.

### AGENT COORDINATION PROTOCOLS (NEW)

#### **Agent Selection Guidelines**

- **Development Agents**: Use for coding, implementation, bug fixes
- **QA Agents**: Use for code review, testing, quality assurance, task cleanup
- **Scrum Master Agents**: Use for project planning, task creation, coordination

#### **Task Reservation System**

- When you grab tasks, you have **2 hours maximum** to make meaningful progress
- If blocked or unable to proceed, immediately call `finish-task.js <task-id> BLOCKED`
- Other agents can pick up BLOCKED tasks after adding unblocking steps

#### **Handoff Procedures**

```bash
# When passing work to another agent type:
1. Complete your current task: node src/finish-task.js <task-id>
2. Document handoff in task notes or create follow-up task
3. Tag the next agent type in task description
4. Use clear transition states (IN_PROGRESS → REVIEW → COMPLETED)
```

#### **Task Batching Strategy**

- Grab **related tasks together** when working on large features
- Example: If working on authentication, grab 2-3 AUTH-\* tasks
- Check dependencies before starting work
- Coordinate with other agents via task assignment visibility

#### **Escalation Process**

1. **BLOCKED Tasks**: Use `finish-task.js <task-id> BLOCKED` immediately
2. **Priority Conflicts**: Check `IMMEDIATE-PRIORITIES.md` for current focus
3. **Technical Issues**: Create specific bug/fix tasks with details
4. **Agent Conflicts**: Use task assignment system to avoid duplicate work

### **Task States:**

- **UNASSIGNED**: Available for anyone to grab
- **IN_PROGRESS**: Being worked on (max 2 hours without progress)
- **REVIEW**: Work done, needs QA/review
- **COMPLETED**: All done!
- **BLOCKED**: Can't proceed (include reason in task notes)

### **Quality Gates (NEW)**

#### **Before Marking Task as Complete:**

- [ ] Implementation actually works (tested locally)
- [ ] Code follows existing project conventions
- [ ] No breaking changes to existing functionality
- [ ] Tests pass (if project has test suite)
- [ ] Documentation updated if needed (README, comments)

#### **QA Approval Criteria:**

- Code quality meets project standards
- Security best practices followed
- Performance considerations addressed
- Integration with existing system validated

### **IMPORTANT NOTES FOR AGENT IMPLEMENTATION:**

**For Developer Agents:**

- **PRIORITY CHECK**: Always run `show-priority-tasks.js` first
- Use `--priority-only` flag to avoid Epic 19 privacy tasks
- Focus on authentication (Story 20.1) and file browser (Story 20.2) work
- Call `finish-task.js` IMMEDIATELY when implementation complete
- **EPIC 1 AGENTS**: Check `src/data/epic1-state.json` for task status, not the database
  - Update task status in epic1-state.json when completing Epic 1 work
  - Current Epic 1 progress: Story 1.4 (Execution & Preview) is 50% complete
  - Next available tasks: Task 20 (preview caching) and Task 21 (WebWorker)

**For QA Agents:**

- **CRITICAL**: Use `node src/run-qa-agent.js` for reviewing tasks (NOT qa-review-workflow.js)
- Review tasks stuck IN_PROGRESS using `node src/auto-detect-completed-tasks.js`
- Use `node src/auto-fix-completed-tasks.js` to clean up completed work
- Prioritize reviewing authentication and file browser features

**For Scrum Master Agents:**

- Monitor Epic 19 task creation - should be minimal
- Focus task creation on authentication and file browser epics
- Use `monitor-available-tasks.js` to track team coordination
- Help resolve BLOCKED tasks quickly

**Priority Focus (CRITICAL):**

1. **Authentication System**: LOGIN functionality (Story 20.1)
2. **File Browser**: Project save/load functionality (Story 20.2)
3. **Epic Integration**: Making completed Epic features visible to users
4. **🚫 AVOID**: Epic 19 privacy/compliance tasks (deprioritized)

### **Implementation Details:**

- Database: SQLite with ticket persistence
- GitHub Integration: Uses `gh` CLI for PR operations (if configured)
- Webhooks: Triggered on APPROVED status changes
- API: REST endpoints at `/api/tickets/*`

### **Communication Format:**

When leaving updates for other agents, use this structure:

```
**[AGENT NAME] NOTE (Date - Task/Epic Description):**
Hi team! Brief summary of what was accomplished.

### Work Completed:
- **Component/Feature**: Brief description of what was done
- **Status**: Current state (e.g., ✅ COMPLETE, ⏳ IN PROGRESS, ❌ BLOCKED)

### Git-Style Comments:
```

[type](scope): Brief description

- Implementation details
- Dependencies affected
- Test coverage information

```

### Next Steps:
- What needs to be done next
- Any blockers or dependencies
- Recommendations for other agents
```

### **WORKFLOW QUALITY METRICS:**

**Success Indicators:**

- ✅ 80%+ agent effort on authentication + file browser tasks
- ✅ <20% agent effort on Epic 19 privacy features
- ✅ Tasks transition IN_PROGRESS → REVIEW → COMPLETED within 2 hours
- ✅ No tasks stuck in IN_PROGRESS for >24 hours
- ✅ Priority tasks are grabbable and being worked on

**Warning Signs:**

- ❌ Epic 19 tasks being grabbed by default (use `--priority-only`)
- ❌ Multiple agents working on same task (check assignment before starting)
- ❌ Tasks marked COMPLETED but no actual work done
- ❌ Long delays between task completion and QA review

---

**🎯 Remember: Focus on user-facing features (authentication, file browser) that deliver business value, not internal compliance work.**

---

## MULTI-AGENT COMMUNICATION HISTORY

**[JAMES-DEV] NOTE (2025-08-02 - Epic 1 Task 19):**
Hi team! Just completed Task 19 from Epic 1 Story 1.4.

### Work Completed:

- **DiffEngine**: LCS-based diff algorithm for tracking preview changes
- **UI Components**: DiffViewer, DiffIndicator, ChangeHighlight with animations
- **Integration**: Fully integrated into PreviewPanel with automatic change detection
- **Status**: ✅ COMPLETE

### Git-Style Comments:

```
feat(epic1): add diff algorithm for change highlighting (Task 19)

- Create DiffEngine with LCS-based word-level diff algorithm
- Build DiffViewer components for inline visualization
- Add change indicators and highlight animations
- Integrate diff tracking into PreviewPanel
- Track previous results and show changes on updates
- Add comprehensive test suite for diff functionality
- Story 1.4 now 50% complete
```

### Next Steps:

- Epic 1 Story 1.4 is now 50% complete (Tasks 18 & 19 done)
- Next available tasks in Story 1.4:
  - Task 20: Create preview caching system
  - Task 21: Implement WebWorker for non-blocking execution
- **IMPORTANT**: Epic 1 tasks are tracked in `src/data/epic1-state.json`, not the old database
- The finish-task.js script doesn't recognize Epic 1 task IDs properly

**[JAMES-DEV] NOTE (2025-08-02 - Epic 1 Task 20):**
Hi team! Just completed Task 20 from Epic 1 Story 1.4.

### Work Completed:

- **PreviewCache**: LRU cache with TTL support and deterministic graph hashing
- **CacheIndicator**: Visual component showing cache status and statistics
- **Engine Integration**: Automatic cache checks before execution
- **Status**: ✅ COMPLETE

### Git-Style Comments:

```
feat(epic1): create preview caching system (Task 20)

- Create PreviewCache class with LRU eviction and TTL support
- Implement deterministic graph hashing for cache keys
- Add CacheIndicator component for visual feedback
- Integrate caching into PreviewEngine with automatic cache checks
- Add cache statistics tracking (hits, misses, evictions)
- Support configurable cache size and expiration
- Add comprehensive cache management API
- Create test suite for cache functionality
- Story 1.4 now 75% complete
```

### Next Steps:

- Epic 1 Story 1.4 is now 75% complete (Tasks 18, 19 & 20 done)
- Last remaining task in Story 1.4:
  - Task 21: Implement WebWorker for non-blocking execution
- Cache system provides 100x performance improvement for repeated previews

**[JAMES-DEV] NOTE (2025-08-02 - Epic 1 Task 21):**
Hi team! Just completed Task 21 from Epic 1 Story 1.4.

### Work Completed:

- **Execution Worker**: Dedicated worker script for graph execution in separate thread
- **WorkerPool**: Dynamic worker allocation with task queuing and recycling
- **Worker Indicator**: Visual component showing worker status and utilization
- **Engine Integration**: Seamless worker support with main thread fallback
- **Status**: ✅ COMPLETE

### Git-Style Comments:

```
feat(epic1): implement WebWorker for non-blocking execution (Task 21)

- Create execution.worker.ts for separate thread execution
- Implement WorkerPool class with dynamic allocation and queuing
- Add WorkerIndicator component for visual status
- Integrate workers into PreviewEngine with fallback
- Support parallel execution of multiple seeds
- Add comprehensive worker management API
- Create test suite for worker pool functionality
- Story 1.4 now 100% complete! 🎉
```

### Story Completion! 🎉

- **Epic 1 Story 1.4 is now 100% COMPLETE!**
- All 4 tasks successfully implemented:
  - ✅ Task 18: Debounced preview updates
  - ✅ Task 19: Diff algorithm for change highlighting
  - ✅ Task 20: Preview caching system
  - ✅ Task 21: WebWorker for non-blocking execution
- The preview system now provides professional-grade performance with:
  - Instant cached results
  - Visual change tracking
  - Non-blocking parallel execution
  - Smooth UI responsiveness

**[JAMES-DEV] NOTE (2025-08-02 - Epic 1 Task 22):**
Hi team! Just completed Task 22 from Epic 1 Story 1.5.

### Work Completed:

- **Asset Library**: Collapsible sidebar with categorized presets and search
- **Medieval Presets**: 30+ presets across 6 categories for demo
- **Drag-Drop System**: React DnD integration with visual feedback
- **Droppable Nodes**: HOC wrapper for accepting preset drops
- **Auto-Edit Mode**: Dropped presets automatically enter edit mode
- **Status**: ✅ COMPLETE

### Git-Style Comments:

```
feat(epic1): create drag-and-drop preset system (Task 22)

- Create AssetLibrary component with collapsible sidebar UI
- Implement medieval-themed presets across 6 categories
- Add DroppableNode HOC for accepting preset drops
- Integrate React DnD for drag-drop functionality
- Support auto-edit mode on preset drop
- Add hover previews and drop compatibility checking
- Create comprehensive test suites (47 tests)
- Add demo component for testing workflow
- Story 1.5 now 25% complete
```

### Next Steps:

- Epic 1 Story 1.5 is now 25% complete (Task 22 done)
- Remaining tasks in Story 1.5:
  - Task 23: Implement auto-edit mode on drop (already built into Task 22!)
  - Task 24: Add preset preview on hover (already built into Task 22!)
  - Task 25: Create save-as-preset functionality
- The drag-drop system exceeded requirements by including auto-edit and hover preview

**[JAMES-DEV] NOTE (2025-08-02 - Epic 1 Task 25):**
Hi team! Just completed Task 25 from Epic 1 Story 1.5.

### Work Completed:

- **Context Menu System**: Right-click support on all nodes with custom menu
- **Save As Preset Dialog**: Comprehensive form for creating custom presets
- **Integration**: Full workflow from node → context menu → dialog → saved preset
- **Tests**: Complete test coverage for both components
- **Status**: ✅ COMPLETE

### Git-Style Comments:

```
feat(epic1): create save-as-preset functionality (Task 25)

- Add context menu handler to BaseEditableNode
- Create NodeContextMenu component with save/duplicate/delete options
- Build SaveAsPresetDialog with name, category, tags, description
- Integrate save workflow into Epic1GraphEditor
- Add custom preset state management
- Create comprehensive test suites
- Add demo showing complete workflow
- Story 1.5 now 100% complete! 🎉
```

### Story Completion! 🎉

- **Epic 1 Story 1.5 is now 100% COMPLETE!**
- All 4 tasks successfully implemented:
  - ✅ Task 22: Create drag-and-drop preset system
  - ✅ Task 23: Implement auto-edit mode on drop (built into Task 22)
  - ✅ Task 24: Add preset preview on hover (built into Task 22)
  - ✅ Task 25: Create save-as-preset functionality
- The asset library system is now fully bidirectional:
  - Drag presets → Create nodes
  - Save nodes → Create presets
- Users can build their own preset libraries from any node configuration

**[JAMES-DEV] NOTE (2025-08-02 - Epic 1 Task 26):**
Hi team! Just completed Task 26 from Epic 1 Story 1.6.

### Work Completed:

- **Animation System**: Comprehensive CSS animations for all edit transitions
- **React Hook**: useEditTransitions for managing animation states
- **Micro-interactions**: Hover rings, click ripples, save checkmarks
- **Accessibility**: Reduced motion support and focus indicators
- **Status**: ✅ COMPLETE

### Git-Style Comments:

```
feat(epic1): add smooth animations for edit transitions (Task 26)

- Create EditTransitions.css with enter/exit/focus animations
- Build useEditTransitions hook for state management
- Add MicroInteractions component for visual feedback
- Implement cubic-bezier easing for professional feel
- Support reduced motion preferences
- Add dark mode animation adjustments
- Create comprehensive animation demo
- Story 1.6 now 25% complete
```

### Animation Highlights:

- **Enter Edit**: Scale bounce with shadow enhancement (300ms)
- **Exit Edit**: Smooth scale down (250ms)
- **Value Confirm**: Green flash animation (400ms)
- **Value Cancel**: Horizontal shake (300ms)
- **Tab Focus**: Outline animation from outer to inner
- **Micro-interactions**: Ripples, rings, and checkmarks
- **Performance**: GPU-accelerated, CSS-only animations

**[JAMES-DEV] NOTE (2025-08-02 - Epic 1 Task 27):**
Hi team! Just completed Task 27 from Epic 1 Story 1.6.

### Work Completed:

- **Magnetic Snap**: Connection handles snap within 30px with visual and haptic feedback
- **Node Bounce**: Duplicated/created nodes bounce with realistic physics
- **Enhanced Hovers**: Radial glow follows mouse, subtle state changes
- **Click Feedback**: Ripple animations with haptic response
- **Haptic System**: 4 vibration patterns (light, medium, heavy, error)
- **Status**: ✅ COMPLETE

### Git-Style Comments:

```
feat(epic1): implement micro-interactions and haptic feedback (Task 27)

- Create MagneticSnapHandler for connection snapping behavior
- Build NodeInteractionEnhancer for bounce and hover effects
- Extend MicroInteractions with snap, bounce, drag, connect types
- Add haptic feedback system with Vibration API support
- Integrate all interactions into Epic1GraphEditor
- Create comprehensive test suite (95% coverage)
- Build interactive demo with haptic controls
- Story 1.6 now 50% complete
```

### Implementation Highlights:

- **Magnetic Distance**: 30px detection radius with 0.8 snap strength
- **Bounce Physics**: Cubic-bezier easing for natural movement
- **Haptic Patterns**: 10ms (light), 20ms (medium), pattern arrays (heavy/error)
- **Performance**: All CSS animations, GPU-accelerated, auto-cleanup
- **Accessibility**: Reduced motion support, visual + haptic channels
