#!/bin/bash

# GitHub Automation Script
# This script provides manual controls for GitHub automation operations
# Usage: ./scripts/github-automation.sh [command] [options]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
BASE_BRANCH="main"
API_URL="http://localhost:8000/api"

# Function to print colored messages
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Function to check if server is running
check_server() {
    if ! curl -s "${API_URL}/health" > /dev/null 2>&1; then
        print_message $RED "Error: Server is not running at ${API_URL}"
        print_message $YELLOW "Start the server with: pnpm --filter server dev"
        exit 1
    fi
}

# Function to create a ticket
create_ticket() {
    local title=$1
    local description=$2
    local priority=${3:-medium}
    local created_by=${4:-developer}
    
    print_message $YELLOW "Creating ticket..."
    
    response=$(curl -s -X POST "${API_URL}/tickets" \
        -H "Content-Type: application/json" \
        -d "{
            \"title\": \"${title}\",
            \"description\": \"${description}\",
            \"priority\": \"${priority}\",
            \"created_by\": \"${created_by}\"
        }")
    
    ticket_id=$(echo "$response" | jq -r '.id')
    
    if [ "$ticket_id" != "null" ]; then
        print_message $GREEN "✓ Ticket created: ${ticket_id}"
        echo "$ticket_id"
    else
        print_message $RED "✗ Failed to create ticket"
        echo "$response"
        exit 1
    fi
}

# Function to update ticket status
update_ticket_status() {
    local ticket_id=$1
    local status=$2
    local changed_by=${3:-developer}
    
    print_message $YELLOW "Updating ticket ${ticket_id} to status: ${status}..."
    
    response=$(curl -s -X PATCH "${API_URL}/tickets/${ticket_id}/status" \
        -H "Content-Type: application/json" \
        -d "{
            \"status\": \"${status}\",
            \"changed_by\": \"${changed_by}\"
        }")
    
    if echo "$response" | jq -e '.id' > /dev/null 2>&1; then
        print_message $GREEN "✓ Ticket status updated to: ${status}"
    else
        print_message $RED "✗ Failed to update ticket status"
        echo "$response"
        exit 1
    fi
}

# Function to track a commit
track_commit() {
    local ticket_id=$1
    local commit_sha=$2
    local commit_message=$3
    local author=${4:-$(git config user.name)}
    
    # Get commit details
    files_changed=$(git diff-tree --no-commit-id --name-only -r "$commit_sha" | jq -R . | jq -s .)
    lines_added=$(git diff --shortstat "$commit_sha^" "$commit_sha" | grep -oE '[0-9]+ insertion' | grep -oE '[0-9]+' || echo 0)
    lines_deleted=$(git diff --shortstat "$commit_sha^" "$commit_sha" | grep -oE '[0-9]+ deletion' | grep -oE '[0-9]+' || echo 0)
    
    print_message $YELLOW "Tracking commit ${commit_sha} for ticket ${ticket_id}..."
    
    response=$(curl -s -X POST "${API_URL}/tickets/${ticket_id}/commits" \
        -H "Content-Type: application/json" \
        -d "{
            \"commit_sha\": \"${commit_sha}\",
            \"commit_message\": \"${commit_message}\",
            \"files_changed\": ${files_changed},
            \"lines_added\": ${lines_added},
            \"lines_deleted\": ${lines_deleted},
            \"author\": \"${author}\",
            \"committed_at\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
        }")
    
    if echo "$response" | jq -e '.success' > /dev/null 2>&1; then
        print_message $GREEN "✓ Commit tracked successfully"
    else
        print_message $RED "✗ Failed to track commit"
        echo "$response"
        exit 1
    fi
}

# Function to get GitHub automation config
get_config() {
    print_message $YELLOW "Fetching GitHub automation configuration..."
    
    response=$(curl -s "${API_URL}/tickets/config/github")
    
    echo "$response" | jq '.'
}

# Function to update GitHub automation config
update_config() {
    local field=$1
    local value=$2
    
    print_message $YELLOW "Updating GitHub automation config: ${field}=${value}..."
    
    # Build JSON based on field type
    if [[ "$value" == "true" || "$value" == "false" ]] || [[ "$value" =~ ^[0-9]+$ ]]; then
        json="{\"${field}\": ${value}}"
    elif [[ "$field" == "labels_to_add" || "$field" == "reviewers" ]]; then
        # Handle array fields
        json="{\"${field}\": ${value}}"
    else
        json="{\"${field}\": \"${value}\"}"
    fi
    
    response=$(curl -s -X PUT "${API_URL}/tickets/config/github" \
        -H "Content-Type: application/json" \
        -d "$json")
    
    if echo "$response" | jq -e '.id' > /dev/null 2>&1; then
        print_message $GREEN "✓ Config updated successfully"
        echo "$response" | jq '.'
    else
        print_message $RED "✗ Failed to update config"
        echo "$response"
        exit 1
    fi
}

# Function to manually push commits
push_commits() {
    local ticket_id=$1
    
    print_message $YELLOW "Manually pushing commits for ticket ${ticket_id}..."
    
    response=$(curl -s -X POST "${API_URL}/tickets/${ticket_id}/push")
    
    if echo "$response" | jq -e '.success' > /dev/null 2>&1; then
        print_message $GREEN "✓ Commits pushed successfully"
    else
        print_message $RED "✗ Failed to push commits"
        echo "$response"
        exit 1
    fi
}

# Function to show usage
show_usage() {
    cat << EOF
GitHub Automation Script

Usage: $0 [command] [options]

Commands:
    create-ticket <title> <description> [priority] [created_by]
        Create a new ticket
        
    update-status <ticket_id> <status> [changed_by]
        Update ticket status (open, in_progress, in_review, approved, merged, closed, blocked)
        
    track-commit <ticket_id> <commit_sha> <commit_message> [author]
        Track a commit for a ticket
        
    track-latest <ticket_id> [count]
        Track the latest N commits (default: 1) for a ticket
        
    push <ticket_id>
        Manually trigger push for a ticket's commits
        
    config
        Show current GitHub automation configuration
        
    config-set <field> <value>
        Update a configuration field
        
    enable
        Enable GitHub automation
        
    disable
        Disable GitHub automation
        
    workflow <ticket_id>
        Run complete workflow: create PR for approved ticket

Examples:
    # Create a ticket
    $0 create-ticket "Fix navigation bug" "Navigation menu not working on mobile"
    
    # Update ticket to approved (triggers PR creation)
    $0 update-status TICKET-123 approved qa-engineer
    
    # Track latest commit
    $0 track-latest TICKET-123
    
    # Configure auto-push interval
    $0 config-set auto_push_interval 5
    
    # Run full workflow
    $0 workflow TICKET-123

EOF
}

# Function to track latest commits
track_latest_commits() {
    local ticket_id=$1
    local count=${2:-1}
    
    print_message $YELLOW "Tracking latest ${count} commit(s) for ticket ${ticket_id}..."
    
    # Get latest commits
    commits=$(git log --oneline -n "$count" --pretty=format:"%H|%s")
    
    while IFS='|' read -r sha message; do
        track_commit "$ticket_id" "$sha" "$message"
    done <<< "$commits"
}

# Function to run complete workflow
run_workflow() {
    local ticket_id=$1
    
    print_message $YELLOW "Running workflow for ticket ${ticket_id}..."
    
    # First, ensure ticket is approved
    print_message $YELLOW "Step 1: Marking ticket as approved..."
    update_ticket_status "$ticket_id" "approved" "automation"
    
    print_message $GREEN "✓ Workflow completed. PR should be created automatically if enabled."
}

# Main script logic
case "$1" in
    create-ticket)
        check_server
        create_ticket "$2" "$3" "$4" "$5"
        ;;
    update-status)
        check_server
        update_ticket_status "$2" "$3" "$4"
        ;;
    track-commit)
        check_server
        track_commit "$2" "$3" "$4" "$5"
        ;;
    track-latest)
        check_server
        track_latest_commits "$2" "$3"
        ;;
    push)
        check_server
        push_commits "$2"
        ;;
    config)
        check_server
        get_config
        ;;
    config-set)
        check_server
        update_config "$2" "$3"
        ;;
    enable)
        check_server
        update_config "enabled" "true"
        ;;
    disable)
        check_server
        update_config "enabled" "false"
        ;;
    workflow)
        check_server
        run_workflow "$2"
        ;;
    *)
        show_usage
        exit 1
        ;;
esac