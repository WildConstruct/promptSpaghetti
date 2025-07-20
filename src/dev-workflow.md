# Developer Workflow - Simplified Task Management

## Overview
No more ASSIGN/BUILD phases! Developers can directly grab and work on tasks using simple scripts.

## Commands

### 1. Monitor Available Tasks
See what tasks are available and the current state:
```bash
node monitor-available-tasks.js
```

### 2. Grab Tasks (Race-Condition Safe)
Automatically assign yourself the next available tasks using file locking:
```bash
# Grab 2 tasks (default) - SAFE for concurrent agents
node grab-tasks.js <your-dev-id>

# Grab a specific number of tasks
node grab-tasks.js <your-dev-id> 3

# Examples:
node grab-tasks.js dev_A
node grab-tasks.js Dev-James-Security 1
```

**🔒 Concurrent Access Protection:**
- Uses file locking to prevent duplicate task assignments
- Automatically retries if another agent is grabbing tasks
- Shows clear "lock acquired/released" messages
- Handles concurrent agent access safely

### 3. Finish a Task
Move a task to review when you're done:
```bash
# Move to REVIEW (default)
node finish-task.js <task-id>

# Move to a specific state
node finish-task.js <task-id> REVIEW
node finish-task.js <task-id> COMPLETED
node finish-task.js <task-id> BLOCKED

# Example:
node finish-task.js T-1752951043927-918
```

## Typical Workflow

1. **Check available work:**
   ```bash
   node monitor-available-tasks.js
   ```

2. **Grab some tasks:**
   ```bash
   node grab-tasks.js dev_A 2
   ```
   This will:
   - Find up to 2 UNASSIGNED tasks
   - Assign them to you
   - Set them to IN_PROGRESS
   - Show you what you're working on

3. **Work on the tasks** (implement the features, write tests, etc.)

4. **Submit for review:**
   ```bash
   node finish-task.js T-1752951043927-918 REVIEW
   ```

5. **Repeat!**

## Task States
- **UNASSIGNED**: Available for anyone to grab
- **IN_PROGRESS**: Someone is actively working on it
- **REVIEW**: Work is done, needs QA/review
- **COMPLETED**: All done!
- **BLOCKED**: Can't proceed due to dependencies or issues

## Benefits
- No waiting for phase changes
- Developers can self-assign work anytime
- Simple command-line workflow
- Automatic state management
- Clear task ownership
- **Race-condition safe** - multiple agents can't grab the same tasks
- **Automatic retries** if another agent is currently grabbing tasks