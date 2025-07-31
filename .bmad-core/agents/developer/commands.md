# Developer Agent Commands

## Task Management Commands

### Primary Task Workflow

```bash
# 1. Grab available tasks (assign to yourself)
node src/grab-tasks.js claude_dev [task_count]

# 2. Check your current tasks
node src/monitor-available-tasks.js

# 3. Finish a task (move to review)
node src/finish-task.js <task-id> REVIEW

# 4. Mark task as blocked (if dependencies are missing)
node src/finish-task.js <task-id> BLOCKED
```

### Task Status Management

```bash
# Check all available tasks
node src/monitor-available-tasks.js

# Find QA tasks that need review
node src/qa-task-finder.js

# Auto-detect completed tasks (for QA)
node src/auto-detect-completed-tasks.js

# Check commit status
node src/check-commit-status.js
```

## Development Commands

### Environment Setup

```bash
# Install all dependencies
pnpm install

# Start development environment
pnpm dev

# Start client only
pnpm --filter client dev

# Start server only
pnpm --filter server dev
```

### Testing Commands

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test -- --coverage

# Run tests in watch mode
pnpm test -- --watch

# Run specific component tests
pnpm test --testPathPattern="ComponentName"

# Run client tests only
pnpm --filter client test

# Run server tests only
pnpm --filter server test

# Run core package tests only
pnpm --filter core test
```

### Code Quality Commands

```bash
# Run ESLint across all packages
pnpm lint

# Fix ESLint issues automatically
pnpm lint -- --fix

# Type check all TypeScript
pnpm build
```

### Build Commands

```bash
# Build production bundle for client
pnpm build

# Build specific package
pnpm --filter client build
pnpm --filter server build
pnpm --filter core build
```

## CLI and Execution Commands

### Graph Execution

```bash
# Execute a graph via CLI
npx promptgraph exec <graph.json> --seed 1234

# Execute using local CLI package
pnpm --filter cli exec <graph.json>

# Execute with multiple seeds
npx promptgraph exec <graph.json> --seeds 1,2,3,4,5
```

### Development Tools

```bash
# Create a new prompt extension
node tools/create-prompt-extension.js

# Validate extensions
node tools/extension-validator.js

# Run extension test framework
node tools/extension-test-framework.js
```

## Git and Deployment Commands

### Version Control

```bash
# Check git status
git status

# Stage changes
git add .

# Commit with message
git commit -m "feat: implement task feature"

# Push changes
git push origin main

# Create feature branch
git checkout -b feature/task-implementation

# View commit history
git log --oneline
```

### Branch Management

```bash
# Switch to main branch
git checkout main

# Pull latest changes
git pull origin main

# Merge feature branch
git merge feature/task-implementation

# Delete feature branch
git branch -d feature/task-implementation
```

## Performance and Monitoring Commands

### Performance Testing

```bash
# Run performance tests
node scripts/performance-test.js

# Test large graph performance
pnpm test tests/performance/large-graph.spec.ts

# Monitor build performance
pnpm build -- --analyze
```

### System Monitoring

```bash
# Check server health
curl http://localhost:8000/health

# Monitor WebSocket connections
curl http://localhost:8000/websocket/status

# Check API endpoints
curl -X POST http://localhost:8000/preview -H "Content-Type: application/json" -d '{"graph":{},"runs":1}'
```

## Security and Validation Commands

### Security Testing

```bash
# Run security tests
node scripts/test-security-fixes.js

# Validate input schemas
pnpm test -- --testPathPattern="validation"

# Check for security vulnerabilities
npm audit

# Run penetration tests
pnpm test -- --testPathPattern="security"
```

### Schema Validation

```bash
# Validate graph schemas
node temp-validator.js

# Test serialization
node test-serialization.js

# Debug schema issues
node debug-schema.js
```

## File System Commands

### Navigation

```bash
# List files in packages
ls packages/

# Navigate to core package
cd packages/core

# Find files by pattern
find . -name "*.test.ts"

# Search for code patterns
grep -r "AdvancedRuntimeNode" packages/
```

### Project Structure

```bash
# View package dependencies
pnpm list

# Check workspace structure
pnpm -r list

# View package.json configurations
cat packages/core/package.json
```

## Command Aliases and Shortcuts

### Common Development Patterns

```bash
# Full development cycle
alias dev-cycle="pnpm install && pnpm test && pnpm lint && pnpm build"

# Quick test and lint
alias quick-check="pnpm test -- --passWithNoTests && pnpm lint"

# Task workflow
alias grab-task="node src/grab-tasks.js claude_dev"
alias finish-task="node src/finish-task.js"
alias check-tasks="node src/monitor-available-tasks.js"
```

### Environment Variables

```bash
# Set development environment
export NODE_ENV=development

# Enable debug logging
export DEBUG=true

# Set API port
export PORT=8000

# Enable preview API
export ENABLE_PREVIEW_API=true
```

## Emergency and Recovery Commands

### Rollback Commands

```bash
# Revert last commit
git revert HEAD

# Reset to specific commit
git reset --hard <commit-hash>

# Stash current changes
git stash

# Apply stashed changes
git stash pop
```

### System Recovery

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json && pnpm install

# Reset development database
# (if applicable - check server setup docs)

# Restart development servers
pnpm dev
```
