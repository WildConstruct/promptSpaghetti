# Ticket System with GitHub Automation

## Overview

This ticket system provides automated GitHub PR creation and commit management, triggered by ticket status changes. When a QA agent approves a ticket (sets status to APPROVED), the system automatically creates a pull request. Additionally, commits are automatically pushed to GitHub every 10 commits (configurable).

## Key Features

- **Automatic PR Creation**: When a ticket is approved, a PR is automatically created
- **Commit Tracking**: Track commits associated with tickets
- **Auto-Push**: Automatically push commits every N commits (default: 10)
- **Status Workflow**: Enforced status transitions (Open → In Progress → In Review → Approved → Merged → Closed)
- **Webhook Notifications**: Status changes trigger webhook notifications
- **GitHub CLI Integration**: Uses `gh` CLI for GitHub operations

## API Endpoints

### Ticket Management

- `POST /api/tickets` - Create a new ticket
- `GET /api/tickets` - List tickets (with optional filters)
- `GET /api/tickets/:id` - Get ticket details
- `PATCH /api/tickets/:id/status` - Update ticket status (triggers automation)
- `POST /api/tickets/:id/commits` - Track a commit
- `GET /api/tickets/:id/history` - Get ticket history
- `GET /api/tickets/:id/commits/unpushed` - Get unpushed commits
- `POST /api/tickets/:id/push` - Manually push commits

### Configuration

- `GET /api/tickets/config/github` - Get GitHub automation config
- `PUT /api/tickets/config/github` - Update GitHub automation config

## Ticket Status Flow

```
OPEN → IN_PROGRESS → IN_REVIEW → APPROVED → MERGED → CLOSED
                         ↓           ↓
                      BLOCKED    (Auto PR)
```

## GitHub Automation Configuration

```json
{
  "enabled": true,
  "auto_create_pr": true,
  "auto_push_interval": 10,
  "base_branch": "main",
  "pr_title_template": "[{{ticket.id}}] {{ticket.title}}",
  "commit_message_template": "feat({{ticket.id}}): {{description}}",
  "labels_to_add": ["automated-pr"],
  "reviewers": [],
  "draft_pr": false
}
```

## Usage Examples

### 1. Create a Ticket

```bash
curl -X POST http://localhost:8000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Implement user authentication",
    "description": "Add JWT-based authentication to the API",
    "priority": "high",
    "created_by": "developer"
  }'
```

### 2. Update Ticket Status to Approved (Triggers PR Creation)

```bash
curl -X PATCH http://localhost:8000/api/tickets/TICKET-123/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "approved",
    "changed_by": "qa-engineer"
  }'
```

### 3. Track a Commit

```bash
curl -X POST http://localhost:8000/api/tickets/TICKET-123/commits \
  -H "Content-Type: application/json" \
  -d '{
    "commit_sha": "abc123def456",
    "commit_message": "feat: implement login endpoint",
    "files_changed": ["src/auth/login.ts", "src/auth/types.ts"],
    "lines_added": 150,
    "lines_deleted": 20,
    "author": "developer",
    "committed_at": "2024-01-15T10:30:00Z"
  }'
```

### 4. Using the CLI Script

A convenience script is provided at `scripts/github-automation.sh`:

```bash
# Create a ticket
./scripts/github-automation.sh create-ticket "Fix bug" "Description here"

# Approve ticket (triggers PR)
./scripts/github-automation.sh update-status TICKET-123 approved

# Track latest commit
./scripts/github-automation.sh track-latest TICKET-123

# Configure auto-push interval
./scripts/github-automation.sh config-set auto_push_interval 5

# Run complete workflow
./scripts/github-automation.sh workflow TICKET-123
```

## Integration with QA Agent

The QA agent should:

1. Retrieve tickets in "in_review" status
2. Perform testing/validation
3. Update ticket status to "approved" when tests pass
4. The system will automatically create a PR

Example QA integration:

```javascript
// QA Agent approving a ticket
async function approveTicket(ticketId: string) {
  const response = await fetch(`/api/tickets/${ticketId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status: 'approved',
      changed_by: 'qa-agent'
    })
  });
  
  // PR will be created automatically
  console.log('Ticket approved, PR creation triggered');
}
```

## Webhook Events

When a ticket status changes, a webhook is sent with this payload:

```json
{
  "event_type": "ticket_status_changed",
  "ticket_id": "TICKET-123",
  "old_status": "in_review",
  "new_status": "approved",
  "changed_by": "qa-agent",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

Configure webhook URL via environment variable:
```bash
NOTIFICATION_WEBHOOK_URL=https://your-webhook-endpoint.com/webhooks
```

## Prerequisites

1. **GitHub CLI**: Install `gh` command line tool
   ```bash
   # macOS
   brew install gh
   
   # Login to GitHub
   gh auth login
   ```

2. **Database**: SQLite database is automatically initialized

3. **Environment Variables**:
   ```bash
   NOTIFICATION_WEBHOOK_URL=https://your-webhook-endpoint.com
   ANALYTICS_ENABLED=true
   ```

## Auto-Push Behavior

- Commits are tracked but not immediately pushed
- When commit count reaches `auto_push_interval` (default: 10), commits are automatically pushed
- You can manually trigger a push using the API or CLI script
- Pushed commits are marked in the database to avoid duplicate pushes

## Security Considerations

- All GitHub operations use the authenticated `gh` CLI
- Webhook endpoints should validate signatures
- Consider adding authentication to ticket API endpoints
- Limit who can approve tickets in production

## Troubleshooting

### PR Creation Fails
- Ensure `gh` CLI is authenticated: `gh auth status`
- Check branch exists and has commits
- Verify base branch is correct in config

### Auto-Push Not Working
- Check GitHub automation is enabled in config
- Verify commit tracking is working
- Check server logs for errors

### Status Transition Rejected
- Review allowed transitions in `TICKET_TRANSITIONS`
- Ensure current status allows transition to new status

## Database Schema

The system creates these tables:
- `tickets` - Main ticket data
- `commit_tracking` - Tracks commits per ticket
- `ticket_history` - Audit trail of changes
- `github_automation_config` - Configuration settings