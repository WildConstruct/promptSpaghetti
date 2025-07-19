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

---

Note: For historical task completion logs and detailed implementation records, please refer to the project's issue tracking system or database.