# ⚠️ DEPRECATED SCRIPTS - DO NOT USE

## Overview

These scripts have been **DEPRECATED** and consolidated into unified automation systems. Using these old scripts may cause conflicts or inconsistent state.

## ❌ Deprecated Monitoring Scripts

**Use `node src/monitor-system.js` instead**

| Old Script                   | Status        | Replacement                                |
| ---------------------------- | ------------- | ------------------------------------------ |
| `monitor-agent-workflow.js`  | ❌ DEPRECATED | `node src/monitor-system.js --mode agents` |
| `monitor-available-tasks.js` | ❌ DEPRECATED | `node src/monitor-system.js --mode tasks`  |
| `monitor-complete.js`        | ❌ DEPRECATED | `node src/monitor-system.js` (full mode)   |

## ❌ Deprecated Analysis Scripts

**Use `node src/analyze-system.js` instead**

| Old Script                     | Status        | Replacement                               |
| ------------------------------ | ------------- | ----------------------------------------- |
| `analyze-epic-assignments.js`  | ❌ DEPRECATED | `node src/analyze-system.js epics`        |
| `analyze-task-distribution.js` | ❌ DEPRECATED | `node src/analyze-system.js distribution` |
| `analyze-missing-epics.js`     | ❌ DEPRECATED | `node src/analyze-system.js assignments`  |
| Various other `analyze-*.js`   | ❌ DEPRECATED | `node src/analyze-system.js overview`     |

## ❌ Deprecated Fix Scripts

**Use `node src/fix-system.js` instead**

| Old Script                       | Status        | Replacement                                        |
| -------------------------------- | ------------- | -------------------------------------------------- |
| `auto-fix-completed-tasks.js`    | ❌ DEPRECATED | `node src/fix-system.js --module completed-tasks`  |
| `final-fix.js`                   | ❌ DEPRECATED | `node src/fix-system.js --module specific-fixes`   |
| `fix-all-epic-assignments.js`    | ❌ DEPRECATED | `node src/fix-system.js --module epic-assignments` |
| `fix-rejected-tasks.js`          | ❌ DEPRECATED | `node src/fix-system.js --module rejected-tasks`   |
| `fix-ticket-epic-assignments.js` | ❌ DEPRECATED | `node src/fix-system.js --module epic-assignments` |

## ❌ Deprecated Epic Creation Scripts

**Use `node src/create-epic-tasks-unified.js` instead**

| Old Script                                               | Status        | Replacement                                                  |
| -------------------------------------------------------- | ------------- | ------------------------------------------------------------ |
| `create-epic6-tasks.js` through `create-epic29-tasks.js` | ❌ DEPRECATED | `node src/create-epic-tasks-unified.js [epic-number]`        |
| All 23+ individual epic creation scripts                 | ❌ DEPRECATED | `node src/create-epic-batch-manager.js` for batch processing |

## ❌ Deprecated QA Scripts (Partially)

**Use workflow orchestrator for full automation**

| Old Script              | Status                     | Replacement                                                            |
| ----------------------- | -------------------------- | ---------------------------------------------------------------------- |
| `auto-qa-pipeline.js`   | ❌ DEPRECATED/NON-EXISTENT | `node src/workflow-orchestrator.js --workflow qa-pipeline`             |
| `qa-review-workflow.js` | ⚠️ LEGACY (still works)    | `node src/workflow-orchestrator.js --workflow qa-pipeline` (preferred) |
| `run-qa-agent.js`       | ✅ ACTIVE (still used)     | Can be used directly or via workflow orchestrator                      |

## ✅ Current Unified Systems

### 🔧 Fix & Health System

```bash
# System health check
node src/fix-system.js --health-check

# Complete system repair
node src/fix-system.js --all

# Specific module fixes
node src/fix-system.js --module [completed-tasks|epic-assignments|rejected-tasks|data-integrity]
```

### 📊 Monitoring System

```bash
# Full dashboard
node src/monitor-system.js

# Specific modes
node src/monitor-system.js --mode [agents|tasks|epics|health]

# Real-time updates
node src/monitor-system.js --watch
```

### 📈 Analytics System

```bash
# System overview
node src/analyze-system.js overview

# Specific analysis
node src/analyze-system.js [epics|assignments|distribution|performance|health]
```

### 🚀 Workflow Orchestration

```bash
# List all workflows
node src/workflow-orchestrator.js --list

# Execute workflows
node src/workflow-orchestrator.js --workflow [daily-maintenance|health-check|qa-pipeline|epic-completion]
```

### 📝 Epic Management

```bash
# Create tasks for specific epic
node src/create-epic-tasks-unified.js [epic-number]

# Batch processing
node src/create-epic-batch-manager.js --epic-range="18-21" --dry-run
```

## 🚨 Migration Instructions

### For Developers

1. Update any scripts/workflows to use the new unified commands
2. Replace old monitoring commands in your daily workflows
3. Use `--help` flag with any new command to see options

### For Agents

1. Update agent code to reference the new unified systems
2. Remove references to deprecated scripts in documentation
3. Use workflow orchestrator for complex automation sequences

### For Documentation

1. Replace all references to deprecated scripts
2. Update examples and usage guides
3. Reference the new automation documentation in `docs/AUTOMATION-*` files

## 📚 Updated Documentation

- **Complete Technical Guide**: `docs/AUTOMATION-INFRASTRUCTURE.md`
- **Quick Reference**: `docs/AUTOMATION-QUICK-REFERENCE.md`
- **Executive Summary**: `docs/AUTOMATION-IMPROVEMENTS-SUMMARY.md`

## ⚠️ Warning Signs of Old Script Usage

If you see these in logs or documentation, they need to be updated:

- References to individual `create-epic[N]-tasks.js` files
- Commands calling `monitor-available-tasks.js`
- Commands calling `auto-qa-pipeline.js` (doesn't exist)
- Multiple fix scripts being called individually
- Analysis scripts being called individually

## 💡 Benefits of Unified Systems

- **90%+ Code Reduction** across all automation systems
- **Atomic State Management** prevents race conditions
- **Comprehensive Error Recovery** with rollback capabilities
- **Unified Logging** across all operations
- **Real-time Health Monitoring** with 96/100 health scores
- **Workflow Orchestration** with conditional execution
- **Performance Optimization** with sub-second operations

---

**Last Updated**: July 21, 2025
**Migration Complete**: All deprecated scripts consolidated into unified systems
**Documentation Status**: Fully updated in `docs/AUTOMATION-*` files
