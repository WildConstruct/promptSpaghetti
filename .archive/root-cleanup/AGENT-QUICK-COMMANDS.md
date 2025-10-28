# 🚀 Agent Quick Commands Reference

**For all development agents working with the ticketing system**

## 📋 Before Starting Work

### 1. Check What You Should Work On

```bash
# See business priorities and available tasks
node src/show-priority-tasks.js

# See team coordination dashboard
node src/monitor-available-tasks.js
```

### 2. Grab Priority Tasks

```bash
# PRIORITY 1: Epic 8 (Film Industry Demo)
node src/grab-tasks.js <your-agent-id> 2 --epic=8

# Alternative: Grab any high-priority tasks
node src/grab-tasks.js <your-agent-id> 2 --priority-only

# Authentication tasks (if no Epic 8 available)
node src/grab-tasks.js <your-agent-id> 2 --story=20.1

# File browser tasks (if no auth available)
node src/grab-tasks.js <your-agent-id> 2 --story=20.2
```

## 🔧 During Development

### Task Progress Commands

```bash
# View your assigned task details
node src/view-task.js <task-id>

# Check system health
node src/monitor-system.js

# See what other agents are working on
node src/monitor-available-tasks.js
```

## ✅ Completing Work

### 1. Finish Task (CRITICAL)

```bash
# When implementation is complete - ALWAYS call this first
node src/finish-task.js <task-id>

# If task is fully done (rare)
node src/finish-task.js <task-id> COMPLETED

# If you're blocked
node src/finish-task.js <task-id> BLOCKED
```

### 2. Git Workflow (Only When Creating PR)

```bash
# DO NOT commit during development!
# Only commit when creating PR for approval

# When ready to submit for review:
# 1. First call finish-task.js
# 2. Then create PR (which handles commits)
```

## 🎯 Current Priorities (2025-07-22)

### PRIORITY 1: Epic 8 - Wild Construct Demo 🎬

- **Goal**: Demo-ready proof of concept for $2.3B film industry
- **Stories**: 8.1-8.8 (Professional Interface, Director Tools, etc.)
- **Timeline**: 4-6 weeks to demo readiness

### PRIORITY 2: Authentication 🔐

- **Goal**: Users can log in and save their work
- **Story**: 20.1 User Authentication & Routing

### PRIORITY 3: File Browser 📁

- **Goal**: Users don't lose their work
- **Story**: 20.2 Internal File Browser & Project Management

## ❌ What NOT to Do

- ❌ Don't work on Epic 19 (privacy/compliance) - deprioritized
- ❌ Don't commit files during development work
- ❌ Don't skip calling `finish-task.js` when done
- ❌ Don't grab random tasks - always check priorities first

## 🆘 If Something Goes Wrong

### Stuck Tasks

```bash
# Auto-detect completed but stuck tasks
node src/auto-detect-completed-tasks.js

# Auto-fix stuck tasks (QA agents)
node src/auto-fix-completed-tasks.js
```

### System Issues

```bash
# Run system health check
node src/fix-system.js --health-check

# Fix common issues
node src/fix-system.js --all
```

## 💡 Pro Tips

1. **Always check coordination dashboard** before grabbing tasks to avoid conflicts
2. **Epic 8 tasks are top priority** - these create the most business value
3. **Call finish-task.js immediately** when your code works - don't wait
4. **Don't commit during development** - only during PR creation
5. **Focus on user-facing features** over internal compliance work

---

**🎯 Remember: The goal is Epic 8 demo readiness, then authentication and file browser features that users actually need.**
