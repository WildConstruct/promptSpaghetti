# Developer Workflow - Simplified Task Management

## Overview

No more ASSIGN/BUILD phases! Developers can directly grab and work on tasks using simple scripts.

## Commands

### 1. Check Business Priorities & Available Tasks

ALWAYS start by checking what you should be working on:

```bash
# STEP 1: See business priority guidance (CRITICAL)
node src/show-priority-tasks.js

# STEP 2: See full coordination dashboard
node src/monitor-system.js --mode tasks
```

**💡 KEY INSIGHT:** The priority dashboard tells you what business needs most right now!

### 2. Grab Priority Tasks (Race-Condition Safe)

Automatically assign yourself priority tasks using smart filtering and file locking:

**Recommended Approach (Business Priority Aligned):**

```bash
# Grab high-priority business-critical tasks only
node src/grab-tasks.js <your-dev-id> 2 --priority-only

# Focus on authentication (PRIORITY 1 per IMMEDIATE-PRIORITIES.md)
node src/grab-tasks.js <your-dev-id> 2 --story=20.1

# Focus on file browser (PRIORITY 2)
node src/grab-tasks.js <your-dev-id> 2 --story=20.2
```

**Basic Usage (Automatically Priority Sorted):**

```bash
# Gets top priority tasks automatically
node src/grab-tasks.js <your-dev-id> 3

# Examples with filtering:
node src/grab-tasks.js dev_A 2 --priority-only
node src/grab-tasks.js Dev-James-Security 1 --story=20.1
```

**Available Filters:**

- `--priority-only` - Only business-critical tasks
- `--story=20.1` - Authentication tasks only
- `--story=20.2` - File browser tasks only
- `--epic=19` - Specific epic (use cautiously)

**🔒 Concurrent Access Protection:**

- Uses file locking to prevent duplicate task assignments
- Automatically retries if another agent is grabbing tasks
- Shows clear "lock acquired/released" messages
- Handles concurrent agent access safely

### 3. Finish a Task

Move a task to review when you're done:

```bash
# Move to REVIEW (default)
node src/finish-task.js <task-id>

# Move to a specific state
node src/finish-task.js <task-id> REVIEW
node src/finish-task.js <task-id> COMPLETED
node src/finish-task.js <task-id> BLOCKED

# Example:
node src/finish-task.js T-1752951043927-918
```

## Typical Workflow

1. **Check available work:**

   ```bash
   node src/monitor-system.js --mode tasks
   ```

2. **Grab priority tasks:**

   ```bash
   # RECOMMENDED: Grab priority tasks aligned with business needs
   node src/grab-tasks.js dev_A 2 --priority-only
   ```

   This will:
   - Find up to 2 HIGH-PRIORITY tasks (auth/file-browser focus)
   - Assign them to you in business priority order
   - Set them to IN_PROGRESS
   - Show you what you're working on with priority context

3. **Work on the tasks** (implement the features, write tests, etc.)

4. **Submit for review:**

   ```bash
   node src/finish-task.js T-1752951043927-918 REVIEW
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
