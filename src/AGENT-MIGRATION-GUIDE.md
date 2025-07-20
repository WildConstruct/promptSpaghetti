# Agent Migration Guide - Phase System Removal

## Overview
The task management system has been updated to remove the ASSIGN/BUILD phase system. Developers now directly self-assign tasks without waiting for phase changes.

## Key Changes

### 1. Phase System Removed
- **OLD**: Tasks were assigned during ASSIGN phase, work done in BUILD phase
- **NEW**: Developers grab tasks anytime using `grab-tasks.js`

### 2. Task States Simplified
```
UNASSIGNED → IN_PROGRESS → REVIEW → APPROVED → COMPLETED
                                       ↓
                                  (Auto GitHub PR)
```

### 3. New Database Integration
- Tasks are now persisted in SQLite database
- APPROVED status triggers automatic GitHub PR creation
- Every 10 commits triggers automatic push to GitHub

## Agent Code Updates Required

### Developer Agents (`devAgentTemplate.ts`)
```typescript
// REMOVE: Phase checking logic
- if (ev.type === 'TASK_ASSIGNED' && this.isPhase(state, 'BUILD')) {

// REMOVE: Waiting for phase changes
- case 'PHASE_CHANGED':
-   if (ev.payload.phase === 'BUILD') {

// ADD: Direct task monitoring
+ // Developers now use grab-tasks.js to self-assign
+ // No need for assignment event handling
```

### Scrum Master Agent (`scrumMasterAgent.ts`)
```typescript
// REMOVE: Phase transition logic
- checkPhaseTransition(state) {
-   switch (phase) {
-     case 'ASSIGN':
-     case 'BUILD':

// KEEP: Task creation from stories
createTaskForStory(storyId, storyTitle) // Still needed

// MODIFY: Focus on task monitoring instead of phases
+ monitorTaskProgress(state) {
+   // Check for blocked tasks
+   // Monitor overall progress
+   // No phase management needed
+ }
```

### QA Agent
```typescript
// ADD: Webhook trigger awareness
+ // When setting task to APPROVED:
+ // - Triggers webhook to create GitHub PR
+ // - Updates commit counter for auto-push
+ 
+ async approveTask(taskId: string) {
+   // Database will handle GitHub automation
+   await updateTaskStatus(taskId, 'APPROVED');
+ }
```

## Database Schema Reference

### Tickets Table
```sql
CREATE TABLE tickets (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  status TEXT NOT NULL, -- 'open', 'in_progress', 'in_review', 'approved', 'merged', 'closed'
  priority INTEGER DEFAULT 3,
  assignee TEXT,
  created_by TEXT NOT NULL,
  pr_number INTEGER,
  pr_url TEXT,
  commit_count INTEGER DEFAULT 0,
  -- ... other fields
);
```

### GitHub Automation Config
```sql
CREATE TABLE github_automation_config (
  enabled BOOLEAN DEFAULT true,
  auto_create_pr BOOLEAN DEFAULT true,
  auto_push_threshold INTEGER DEFAULT 10,
  -- ... other settings
);
```

## Testing the New System

1. **Monitor Available Tasks**:
   ```bash
   node monitor-available-tasks.js
   ```

2. **Grab Tasks (Developer)**:
   ```bash
   node grab-tasks.js dev_A 2
   ```

3. **Complete Task**:
   ```bash
   node finish-task.js T-12345 REVIEW
   ```

4. **Approve Task (QA)**:
   - Set status to APPROVED in database
   - Watch for automatic PR creation
   - Monitor commit counter for auto-push

## Migration Checklist

- [ ] Remove all phase-related logic from agents
- [ ] Update task assignment logic to work with new states
- [ ] Remove PHASE_CHANGED event handlers
- [ ] Add awareness of GitHub automation triggers
- [ ] Update any phase-dependent decision logic
- [ ] Test agents with new self-assignment workflow

## Support

For questions about the new system:
- Check `dev-workflow.md` for developer workflow
- Check `docs/ticket-system.md` for database details and GitHub automation
- Review `github-automation-service.ts` for PR automation implementation