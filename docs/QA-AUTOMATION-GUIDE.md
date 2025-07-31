# QA Automation Guide

## Overview

The QA automation system has been completely redesigned to eliminate manual coordination and provide a unified, streamlined process for quality assurance.

## ⚠️ DEPRECATION NOTICE

**OLD MANUAL PROCESS (DEPRECATED):**

```bash
# DON'T USE - Manual two-step process
node src/qa-review-workflow.js  # Move COMPLETED → REVIEW
node src/run-qa-agent.js        # Process REVIEW → APPROVED
```

**NEW AUTOMATED PROCESS:**

```bash
# USE THIS - Single unified command
node src/auto-qa-pipeline.js
```

## 🚀 New QA Automation Features

### Unified Pipeline

- **Single command** handles entire QA workflow
- **Automatic state transitions**: COMPLETED → REVIEW → APPROVED/IN_PROGRESS
- **No manual coordination** required between scripts

### Comprehensive Evaluation

The new system evaluates tasks across 6 dimensions:

1. **Code Quality** (0-5.0 scale)
   - Implementation standards
   - Code maintainability
   - Architecture compliance

2. **Security** (0-5.0 scale)
   - Security best practices
   - Input validation
   - Authentication/authorization

3. **Testing** (0-5.0 scale)
   - Unit test coverage
   - Integration tests
   - Test quality

4. **Documentation** (0-5.0 scale)
   - Code comments
   - API documentation
   - User guides

5. **Integration** (0-5.0 scale)
   - Compatibility with existing code
   - API consistency
   - Performance impact

6. **Compliance** (0-5.0 scale)
   - Policy adherence
   - Regulatory requirements
   - Business rules

### Smart Pass/Fail Logic

- **Dynamic thresholds** based on task type
- **Security tasks**: Higher threshold (4.2/5.0)
- **Critical tasks**: Elevated threshold (4.1/5.0)
- **Bug fixes**: Standard threshold (3.9/5.0)
- **Default**: 3.8/5.0 threshold

## 🛠️ Usage Commands

### Full QA Pipeline

```bash
node src/auto-qa-pipeline.js
```

- Processes ALL eligible tasks (COMPLETED + REVIEW states)
- Comprehensive evaluation of each task
- Automatic state transitions

### Quick QA (High Priority Only)

```bash
node src/auto-qa-pipeline.js --quick
```

- Processes only high-priority tasks
- Faster execution for urgent items
- Same comprehensive evaluation

### Review-Only Mode

```bash
node src/auto-qa-pipeline.js --review-only
```

- Processes only tasks already in REVIEW state
- Useful when COMPLETED tasks should remain pending

### Help

```bash
node src/auto-qa-pipeline.js --help
```

## 📊 Dashboard Integration

### New QA Automation Buttons

The dashboard now includes integrated QA controls:

1. **🤖 Automated QA Pipeline** button
   - Shows eligible task counts
   - Options for Full Pipeline or Quick QA
   - Real-time processing status
   - Results summary with scores

2. **QA Status Display**
   - Current task counts by state
   - Processing progress indicators
   - Completion results with metrics

### QA Results Display

- **Approved count** with average quality score
- **Rejected count** with improvement recommendations
- **Detailed feedback** for failed tasks
- **Action items** for rejected tasks

## 🔄 Workflow Process

### 1. Task Completion

```
Developer completes work → finish-task.js → COMPLETED state
```

### 2. QA Processing

```
COMPLETED tasks → auto-qa-pipeline.js → REVIEW state → Evaluation
```

### 3. QA Results

```
Pass: REVIEW → APPROVED (ready for deployment)
Fail: REVIEW → IN_PROGRESS (back to developer with feedback)
```

## 📈 QA Metrics & Scoring

### Quality Score Calculation

- **Average** of all 6 evaluation dimensions
- **Weighted** by task type (security tasks get higher weight)
- **Rounded** to 1 decimal place (e.g., 4.2/5.0)

### Pass/Fail Criteria

Tasks pass QA when:

- Overall score ≥ threshold for task type
- No critical security issues identified
- All required documentation present
- Testing adequately covers scope

### Rejection Feedback

Failed tasks receive:

- **Specific issues** identified during evaluation
- **Actionable recommendations** for improvement
- **Score breakdown** by evaluation dimension
- **Priority guidance** for addressing issues

## 🎯 Best Practices for Agents

### For Development Agents

1. **Complete tasks properly**:

   ```bash
   node src/finish-task.js <task-id>
   ```

2. **Monitor QA feedback**:
   - Check rejected tasks for improvement areas
   - Address recommendations before resubmission
   - Focus on weak scoring dimensions

3. **Quality checklist** before completion:
   - Code follows project standards
   - Security considerations addressed
   - Tests cover functionality
   - Documentation updated

### For QA Agents

1. **Run regular QA cycles**:

   ```bash
   # Daily full pipeline
   node src/auto-qa-pipeline.js

   # Urgent items as needed
   node src/auto-qa-pipeline.js --quick
   ```

2. **Review rejection patterns**:
   - Identify common quality issues
   - Provide targeted feedback to development team
   - Adjust evaluation criteria if needed

3. **Dashboard monitoring**:
   - Use QA automation buttons for visual workflow
   - Track quality trends over time
   - Escalate systemic quality issues

### For Scrum Master Agents

1. **Quality metrics tracking**:
   - Monitor pass/fail rates by agent
   - Track average quality scores
   - Identify training opportunities

2. **Process optimization**:
   - Ensure agents use new automation (not old manual process)
   - Collect feedback on QA automation effectiveness
   - Adjust thresholds based on team performance

## 🚨 Troubleshooting

### Common Issues

**"No tasks available for QA"**

- Check that tasks are being completed with `finish-task.js`
- Verify task states in dashboard
- Ensure COMPLETED tasks exist in the system

**"QA keeps rejecting good work"**

- Review evaluation criteria and thresholds
- Check if task-specific requirements are met
- Consider if security/critical task standards apply

**"Dashboard shows different counts than script"**

- Refresh dashboard data
- Check for state transition delays
- Verify script is processing correct task states

### Error Recovery

If QA pipeline encounters errors:

1. Check task state in dashboard
2. Verify task data integrity
3. Retry with specific mode if needed:
   ```bash
   node src/auto-qa-pipeline.js --review-only
   ```

## 📋 Migration from Old System

### For Teams Currently Using Manual Process

1. **Stop using** qa-review-workflow.js and run-qa-agent.js
2. **Start using** auto-qa-pipeline.js for all QA needs
3. **Update** any automation scripts to use new command
4. **Train team** on new dashboard QA buttons

### Command Migration

| Old Commands                                | New Command           |
| ------------------------------------------- | --------------------- |
| `qa-review-workflow.js` + `run-qa-agent.js` | `auto-qa-pipeline.js` |
| Manual state coordination                   | Automatic transitions |
| Separate completion checking                | Integrated evaluation |

## 🔮 Future Enhancements

### Planned Features

- **AI-powered** evaluation improvements
- **Custom evaluation criteria** per epic/project
- **Integration** with CI/CD pipelines
- **Automated** performance regression testing
- **Quality trend** analytics and reporting

### Configuration Options

Future versions will support:

- Custom pass/fail thresholds per team
- Evaluation dimension weighting
- Integration with external QA tools
- Automated deployment triggers

---

**Questions or Issues?** Check the dashboard QA automation interface or review task states in `src/data/state.json`.
