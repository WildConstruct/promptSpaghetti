# Automation Quick Reference Guide

## 🚀 Daily Operations

### Morning Health Check

```bash
# Check system health and get recommendations
node src/fix-system.js --health-check

# Run daily maintenance workflow (automated)
node src/workflow-orchestrator.js --workflow daily-maintenance
```

### Task Management

```bash
# Move completed tasks to review
node src/fix-system.js --module completed-tasks

# Process QA reviews
node src/run-qa-agent.js

# Fix any system violations
node src/fix-system.js --all
```

### Monitoring & Analytics

```bash
# Real-time system dashboard
node src/monitor-system.js

# Export system metrics
node src/analyze-system.js overview --export
```

## 🔧 Common Fixes

### System Health Issues

| Issue                      | Command                                            | Description                    |
| -------------------------- | -------------------------------------------------- | ------------------------------ |
| Low health score (<90)     | `node src/fix-system.js --all`                     | Comprehensive system repair    |
| Tasks stuck in IN_PROGRESS | `node src/fix-system.js --module completed-tasks`  | Move completed tasks to review |
| Assignment inconsistencies | `node src/fix-system.js --module data-integrity`   | Fix data consistency issues    |
| Missing epic assignments   | `node src/fix-system.js --module epic-assignments` | Update task classifications    |

### QA Workflow Issues

| Issue                      | Command                                                    | Description                 |
| -------------------------- | ---------------------------------------------------------- | --------------------------- |
| Pending reviews backing up | `node src/workflow-orchestrator.js --workflow qa-pipeline` | Full QA automation          |
| Rejected tasks need fixes  | `node src/fix-system.js --module rejected-tasks`           | Process rejected task fixes |
| QA workflow compliance     | `node src/monitor-system.js --mode agents`                 | Check agent compliance      |

## 📊 Monitoring Dashboard Modes

```bash
# Full comprehensive dashboard
node src/monitor-system.js

# Focused monitoring modes
node src/monitor-system.js --mode agents    # Agent compliance
node src/monitor-system.js --mode tasks     # Task allocation
node src/monitor-system.js --mode epics     # Epic progress
node src/monitor-system.js --mode health    # System health

# Real-time updates (refreshes every 30 seconds)
node src/monitor-system.js --watch
```

## 🎯 Epic & Task Creation

```bash
# Create tasks for specific epic
node src/create-epic-tasks-unified.js 20

# Batch processing with filters
node src/create-epic-batch-manager.js --epic-range="18-21" --dry-run

# Create priority tickets
node src/create-priority-tickets.js
```

## 🔍 Analytics & Reporting

```bash
# System analysis modes
node src/analyze-system.js overview        # Complete system stats
node src/analyze-system.js epics          # Epic progress analysis
node src/analyze-system.js assignments    # Agent workload
node src/analyze-system.js performance    # Performance metrics

# Export analytics data
node src/analyze-system.js overview --export
```

## ⚡ Workflow Orchestration

### Available Workflows

| Workflow            | Purpose                           | Duration      |
| ------------------- | --------------------------------- | ------------- |
| `daily-maintenance` | Daily health & maintenance        | 2-5 minutes   |
| `health-check`      | System health assessment & repair | 3-8 minutes   |
| `qa-pipeline`       | Complete QA processing            | 5-15 minutes  |
| `epic-completion`   | Epic completion workflow          | 10-20 minutes |
| `full-automation`   | Complete automation suite         | 15-30 minutes |

```bash
# List all workflows
node src/workflow-orchestrator.js --list

# Execute workflow (safe preview first)
node src/workflow-orchestrator.js --workflow daily-maintenance --dry-run
node src/workflow-orchestrator.js --workflow daily-maintenance
```

## 🚨 Emergency Commands

### System Recovery

```bash
# Emergency health check
node src/fix-system.js --health-check

# Force system repair (continue on errors)
node src/fix-system.js --all --continue-on-error

# Recovery workflow
node src/workflow-orchestrator.js --workflow health-check
```

### Data Validation

```bash
# Validate database integrity
node src/enhance-database-schema.js --validate

# Check task assignments
node src/monitor-system.js --mode agents

# Verify epic classifications
node src/fix-system.js --module epic-assignments --dry-run
```

## 📈 Performance Monitoring

### Key Metrics to Watch

- **System Health Score**: Should be >90/100
- **Agent Compliance**: Should be >95%
- **Task Distribution**: <20% unassigned
- **QA Throughput**: <15 tasks in REVIEW state

### Performance Commands

```bash
# Get current metrics
node src/monitor-system.js --mode health

# Performance analysis
node src/analyze-system.js performance

# Export metrics for trending
node src/monitor-system.js --export
```

## 🔄 Integration Commands

### Git Integration

```bash
# Check commit status
node src/check-commit-status.js

# Mark commits as pushed
node src/mark-commits-pushed.js
```

### Task Assignment

```bash
# Grab priority tasks
node src/grab-tasks.js <agent-id> 3 --priority-only

# Reassign task
node src/reassign-task.js <task-id> <new-agent>

# View task details
node src/view-task.js <task-id>
```

## ⚙️ Configuration

### Environment Setup

```bash
# Set log level
export AUTOMATION_LOG_LEVEL=debug

# Set batch size
export AUTOMATION_BATCH_SIZE=20

# Set max retries
export AUTOMATION_MAX_RETRIES=3
```

### Configuration Files

- `src/config/automation.json` - Main automation settings
- `src/config/qa.json` - QA workflow configuration

## 🧪 Testing & Validation

### Safe Testing

```bash
# Always test with --dry-run first
node src/fix-system.js --all --dry-run
node src/workflow-orchestrator.js --workflow daily-maintenance --dry-run

# Validate system state
node src/test-unified-infrastructure.js
```

### Health Validation

```bash
# Comprehensive health check
node src/fix-system.js --health-check

# System validation
node src/enhance-database-schema.js --validate
```

## 🚀 Best Practices

### Daily Routine

1. **Morning**: Run `daily-maintenance` workflow
2. **Midday**: Check `monitor-system.js` dashboard
3. **Evening**: Review analytics with `analyze-system.js overview`

### Weekly Routine

1. **Monday**: Full system health check and repair
2. **Wednesday**: Epic progress review
3. **Friday**: Performance analysis and optimization

### Emergency Response

1. Check system health score
2. Run emergency repairs if needed
3. Validate system state
4. Resume normal operations

---

## 📞 Support & Troubleshooting

### Get Help

```bash
# Any script help
node src/<script-name>.js --help

# System status
node src/monitor-system.js --mode health

# Error logs
tail -f src/data/coordination.log
```

### Common Error Resolution

| Error Type        | Quick Fix                          |
| ----------------- | ---------------------------------- |
| File lock timeout | Wait 30 seconds, retry             |
| Health score <70  | Run `fix-system.js --all`          |
| High memory usage | Reduce batch size in config        |
| Slow operations   | Check system load, adjust timeouts |

This quick reference provides all the essential commands and workflows needed for daily automation operations.
