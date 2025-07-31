# Agent System Documentation

## Overview

The agent system has been updated to work with the new ticket management system. The phase-based workflow (ASSIGN/BUILD) has been removed in favor of direct task assignment and GitHub automation.

## Updated Agent Architecture

### Base Agent (`agentBase-updated.ts`)

- Provides common functionality for all agents
- No longer includes phase-related utilities
- Focuses on task state management and metrics

### Agent Types

#### 1. Product Owner Agent (`productOwnerAgent-updated.ts`)

**Responsibilities:**

- Creates stories from product goals
- Monitors story backlog levels
- Tracks feature completion via PR merges
- Adjusts priorities based on velocity metrics

**Key Events:**

- `GOAL_CREATED` → Creates stories
- `PR_MERGED` → Tracks feature completion
- `METRICS_ANALYZED` → Adjusts priorities

#### 2. Scrum Master Agent (`scrumMasterAgent-updated.ts`)

**Responsibilities:**

- Creates tasks from stories (no phase dependency)
- Monitors blocked/stuck tasks
- Tracks project health metrics
- Observes approved tasks (GitHub automation)

**Key Events:**

- `STORY_CREATED` → Creates tasks
- `TASK_BLOCKED` → Helps resolve blockers
- `TASK_APPROVED` → Monitors GitHub automation

#### 3. Developer Agent (`devAgentTemplate-updated.ts`)

**Responsibilities:**

- Monitors assigned tasks
- Adds progress notes
- Responds to review feedback
- Works on blocked tasks

**Key Events:**

- `TASK_BLOCKED` → Investigates blockers
- `TASK_REVIEW_REQUESTED` → Addresses feedback

#### 4. QA Agent (`qaAgent-updated.ts`)

**Responsibilities:**

- Reviews tasks in REVIEW state
- Approves/rejects tasks
- **Triggers GitHub automation on approval**
- Monitors PR creation and auto-push events

**CRITICAL: Use unified QA workflow for task reviews**

- Use `node src/workflow-orchestrator.js --workflow qa-pipeline` for complete QA automation
- Or use `node src/run-qa-agent.js` for manual QA reviews
- The unified workflow integrates with GitHub automation and system health monitoring

**Key Events:**

- `TASK_MOVED_TO_REVIEW` → Performs QA review
- `PR_CREATED` → Logs automated PR creation
- `AUTO_PUSH_TRIGGERED` → Tracks auto-push events

## Task Flow

```
1. UNASSIGNED (created by Scrum Master)
   ↓
2. IN_PROGRESS (developer grabs via src/grab-tasks.js)
   ↓
3. REVIEW (developer submits via src/finish-task.js)
   ↓
4. APPROVED (QA agent approves)
   ↓ [Automatic GitHub PR creation]
5. COMPLETED (after PR merge)
```

## GitHub Automation Integration

When QA approves a task (status → APPROVED):

1. Database webhook triggers automatically
2. GitHub PR is created (if `auto_create_pr` enabled)
3. Commit counter increments
4. Auto-push triggers at threshold (default: 10 commits)

## Developer Workflow

Developers no longer wait for agent assignments:

```bash
# Check available tasks
node src/monitor-system.js --mode tasks

# Grab tasks (self-assign) - SAFE for concurrent agents
node src/grab-tasks.js dev_A 2

# Submit for review - CRITICAL STEP
node src/finish-task.js T-12345 REVIEW
```

**🚨 CRITICAL**: Every agent MUST call `src/finish-task.js` when implementation is complete.
Not calling this script leaves tasks stuck in IN_PROGRESS status even when work is done.

**⚡ IMPORTANT: Race Condition Protection**
The `src/grab-tasks.js` script now uses file locking to prevent multiple agents from grabbing the same tasks simultaneously. You'll see lock acquisition/release messages during operation.

## Configuration

GitHub automation settings are stored in the database:

```sql
github_automation_config {
  enabled: true,
  auto_create_pr: true,
  auto_push_threshold: 10,
  base_branch: 'main',
  pr_template: '...'
}
```

## Migration Notes

If updating existing agents:

1. Remove all phase-related logic (`isPhase`, `PHASE_CHANGED`)
2. Remove task assignment logic (developers self-assign)
3. Update QA agent to understand GitHub automation
4. Focus on task states, not phases

## Related Documentation

- `/docs/ticket-system.md` - Complete ticket system documentation
- `/src/dev-workflow.md` - Developer workflow guide
- `/src/AGENT-MIGRATION-GUIDE.md` - Detailed migration instructions
- `/CLAUDE-TICKETS.md` - Inter-agent communication format

## Testing Agents

To test agent behavior with the new system:

1. Create test stories and tasks
2. Run agents against test state
3. Verify:
   - Tasks created without phase dependency
   - QA approval triggers PR creation
   - Developers can self-assign anytime
   - No phase-related errors

## Example Agent Run

```javascript
const state = await loadState();
const events = await getRecentEvents();

const qaAgent = new QAAgent();
const decision = await qaAgent.run(events, state);

if (decision.type === 'TASK_APPROVED') {
  // Database will automatically create GitHub PR
  console.log('Task approved, PR will be created automatically');
}
```
