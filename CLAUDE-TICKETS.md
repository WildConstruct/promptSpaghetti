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
