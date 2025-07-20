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

### TASK MANAGEMENT WORKFLOW (NEW - No More Phases!):

Developers can now self-assign and manage tasks directly without waiting for ASSIGN/BUILD phases:

1. **Check available tasks:**
   ```bash
   cd src && node monitor-available-tasks.js
   ```

2. **Grab tasks to work on:**
   ```bash
   # Grab 2 tasks (default)
   node grab-tasks.js <your-dev-id>
   
   # Grab specific number of tasks
   node grab-tasks.js <your-dev-id> 3
   
   # Examples:
   node grab-tasks.js dev_A
   node grab-tasks.js Dev-James-Security 1
   ```

3. **Complete work and submit for review:**
   ```bash
   # CRITICAL: ALWAYS call this when your implementation is done
   node finish-task.js <task-id>
   
   # Other state transitions:
   node finish-task.js <task-id> COMPLETED
   node finish-task.js <task-id> BLOCKED
   ```
   
   **⚠️ IMPORTANT**: Every agent MUST call `finish-task.js` when they complete implementation.
   Failing to do this leaves tasks stuck in IN_PROGRESS even when the work is done.

**Task States:**
- UNASSIGNED: Available for anyone to grab
- IN_PROGRESS: Being worked on
- REVIEW: Work done, needs QA/review
- COMPLETED: All done!
- BLOCKED: Can't proceed

### COMMUNICATION FORMAT:

When leaving updates for the other agent, use this structure:

```
**[AGENT NAME] NOTE (Date - Task/Epic Description):**
Hi [Other Agent]! Brief summary of what was accomplished.

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
- Recommendations for the other agent
```

### IMPORTANT NOTES FOR AGENT IMPLEMENTATION:

**For Developer Agents:**
- The phase-based system (ASSIGN/BUILD phases) has been REMOVED
- Developers now self-assign tasks using `grab-tasks.js`
- No need to wait for phase changes or assignment events
- Task flow: UNASSIGNED → IN_PROGRESS → REVIEW → COMPLETED

**For QA Agents:**
- **CRITICAL**: Use `node src/run-qa-agent.js` for reviewing tasks (NOT qa-review-workflow.js)
  - This ensures proper commit tracking and GitHub automation
  - The run-qa-agent.js script integrates with the ticket system
- When you set a task status to APPROVED, it automatically triggers:
  - GitHub PR creation (if enabled in configuration)
  - Commit tracking for auto-push (every 10 commits by default)
- Use the database ticket system for status updates

**For Scrum Master Agents:**
- Phase management is NO LONGER NEEDED
- Focus on:
  - Creating tasks from stories
  - Monitoring task progress
  - Helping with blocked tasks
  - Overall project coordination

**Implementation Details:**
- Database: SQLite with ticket persistence
- GitHub Integration: Uses `gh` CLI for PR operations
- Webhooks: Triggered on APPROVED status changes
- API: REST endpoints at `/api/tickets/*`

---

Note: For historical task completion logs and detailed implementation records, please refer to the project's issue tracking system or database.