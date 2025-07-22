# TASK COMPLETION WORKFLOW - CRITICAL FOR ALL AGENTS

**Date**: 2025-07-21  
**Status**: MANDATORY READING FOR ALL DEVELOPMENT AGENTS  
**Purpose**: Prevent tasks from getting stuck in IN_PROGRESS status

---

## 🚨 CRITICAL PROBLEM IDENTIFIED

**103 tasks were stuck in IN_PROGRESS status** due to agents not properly completing their workflow. This blocks the entire development pipeline and creates coordination chaos.

**ROOT CAUSE**: Agents complete their implementation work but forget to call `finish-task.js` to transition tasks to REVIEW status.

---

## 🎯 MANDATORY WORKFLOW FOR ALL AGENTS

### **STEP 1: Check Business Priorities FIRST**
```bash
# ALWAYS run this before grabbing tasks
node src/show-priority-tasks.js

# Then check coordination dashboard
node src/monitor-available-tasks.js
```

**🎯 PRIORITY ORDER (per IMMEDIATE-PRIORITIES.md):**
1. **Authentication tasks** (Story 20.1) - LOGIN SYSTEM
2. **File Browser tasks** (Story 20.2) - PROJECT SAVE/LOAD  
3. **Core product polish** - Bug fixes and UX improvements
4. **🚫 AVOID Epic 19** (privacy/compliance) - Deprioritized

### **STEP 2: Grab Priority Tasks Only**
```bash
# Grab authentication tasks (HIGHEST PRIORITY)
node src/grab-tasks.js <your-dev-id> 2 --story=20.1

# Grab file browser tasks (SECOND PRIORITY)  
node src/grab-tasks.js <your-dev-id> 2 --story=20.2

# Grab any high-priority business tasks
node src/grab-tasks.js <your-dev-id> 2 --priority-only

# AVOID: Don't grab Epic 19 privacy tasks (they're everywhere but not priorities)
```

### **STEP 3: Do Your Implementation Work**
- Write code, run tests, fix bugs
- Follow existing code conventions
- Ensure tests pass
- Document any important decisions
- **DO NOT commit files yet - this happens later during PR process**

### **STEP 4: 🚨 CRITICAL - ALWAYS CALL FINISH-TASK**
```bash
# When your implementation is COMPLETE, ALWAYS call this:
node src/finish-task.js <task-id>

# This transitions the task from IN_PROGRESS → REVIEW
# Example:
node src/finish-task.js AUTH-985111-5751

# Other valid transitions:
node src/finish-task.js <task-id> COMPLETED  # If fully done
node src/finish-task.js <task-id> BLOCKED    # If you're stuck
```

**⚠️ WARNING**: Skipping Step 4 leaves your task stuck in IN_PROGRESS forever, blocking other agents and QA review.

### **STEP 5: Verify Task Transition**
```bash
# Check that your task moved to REVIEW status
node src/monitor-available-tasks.js | grep REVIEW
```

### **STEP 6: Git Workflow (When Ready for PR)**
**ONLY after task is in REVIEW status and you're ready to submit for approval:**

```bash
# Create PR (this will handle commits)
# PR creation handles: git add, git commit, git push
```

**🚨 CRITICAL: DO NOT use `git commit` during development work.**

**Correct Git Workflow:**
1. ✅ Work on files (edit, create, modify)
2. ✅ Call `finish-task.js` to move task to REVIEW
3. ✅ **ONLY THEN** create PR when asked or when submitting for approval
4. ✅ Commits happen automatically during PR creation

**❌ INCORRECT: Committing individual files during development**

---

## 🔧 AUTOMATED CLEANUP SYSTEM

If tasks get stuck in IN_PROGRESS, QA agents can run:

```bash
# Detect completed tasks stuck in progress
node src/auto-detect-completed-tasks.js

# Auto-fix detected completed tasks  
node src/auto-fix-completed-tasks.js
```

**Detection Criteria:**
- Task has recent file modifications matching the task title/description
- Files are substantive (>5KB typically) 
- Files are recently created/modified
- High confidence based on file naming patterns

---

## 📊 CURRENT PRIORITY TASKS (Updated 2025-07-21)

### **🔐 AUTHENTICATION TASKS (Story 20.1) - GRAB THESE FIRST**
1. `AUTH-985111-5751` - Setup React Router Foundation (4h)
2. `AUTH-985113-F18F` - Create Authentication Store with Zustand (5h) 
3. `AUTH-985113-C8A3` - Implement Protected Routes System (3h)
4. `AUTH-985113-EC3E` - Convert Auth Components to Routed Pages (4h)
5. `AUTH-985114-99B7` - Integrate Authentication API with Store (5h)
6. `AUTH-985114-AF38` - Update Navigation System for Authentication (3h)

### **📁 FILE BROWSER TASKS (Story 20.2) - SECOND PRIORITY**
1. `FILE-985115-B006` - Setup File Browser Foundation Components (6h)
2. `FILE-985115-27A6` - Create File Management API Endpoints (5h)
3. `FILE-985115-8397` - Implement Project File Format (.psg) System (4h) 
4. `FILE-985115-EE9B` - Integrate Graph Editor with File Browser (5h)
5. `FILE-985116-5A41` - Build Search and Filter System (4h)
6. `FILE-985116-DBFA` - Create File Preview and Recent Files (4h)

**📈 Business Impact**: Authentication = users can log in, File Browser = users don't lose work

---

## ❌ WHAT NOT TO DO

### **🚫 DON'T Grab Epic 19 Tasks**
- Epic 19 has 584+ unassigned privacy/compliance tasks
- They're NOT customer-requested features
- They're deprioritized per product management decision
- Focus on authentication and file browser instead

### **🚫 DON'T Skip finish-task.js**
- This is the #1 cause of task pipeline blockage
- QA can't review incomplete workflow
- Other agents can't see progress accurately
- Creates coordination chaos

### **🚫 DON'T Work Without Checking Priorities** 
- Always check `show-priority-tasks.js` first
- Epic 19 tasks dominate the backlog but aren't priorities
- Business needs authentication and file browser features

---

## 🎯 SUCCESS METRICS

### **For Development Agents:**
- ✅ Always call `finish-task.js` when implementation complete
- ✅ Focus 80%+ effort on authentication + file browser tasks
- ✅ Less than 20% effort on Epic 19 privacy features
- ✅ Check priorities before grabbing new tasks

### **For QA Agents:**
- ✅ Run cleanup scripts when IN_PROGRESS tasks accumulate  
- ✅ Prioritize review of authentication and file browser features
- ✅ Use `run-qa-agent.js` for proper GitHub integration

### **For All Agents:**
- ✅ Use coordination dashboard to avoid task conflicts
- ✅ Follow the mandatory 5-step workflow above
- ✅ Focus on user-facing features over internal compliance

---

## 🚀 QUICK COMMANDS REFERENCE

```bash
# Check what you should work on
node src/show-priority-tasks.js

# Check team coordination 
node src/monitor-available-tasks.js  

# Grab priority tasks
node src/grab-tasks.js <agent-id> 2 --story=20.1

# CRITICAL: Finish your tasks
node src/finish-task.js <task-id>

# QA: Fix stuck tasks
node src/auto-fix-completed-tasks.js

# QA: Review tasks
node src/run-qa-agent.js
```

---

**🎯 Remember: The goal is working authentication and file browser features that users actually need, not privacy compliance features that weren't requested.**

**⚠️ Failing to follow this workflow breaks the entire development pipeline.**