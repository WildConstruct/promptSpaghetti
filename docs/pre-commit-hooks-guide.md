# Epic 17 Pre-Commit Hooks Guide

## Overview

This project uses a comprehensive pre-commit hook system to enforce code quality, security, and documentation standards. The system includes both standard tools and Epic 17-specific quality checks.

## Pre-Commit Hooks Installed

### Standard Quality Checks

- **Prettier** - Code formatting consistency
- **ESLint** - JavaScript/TypeScript linting with Airbnb config
- **TypeScript** - Type checking
- **Security Scanning** - Detect secrets and credentials
- **SQL Formatting** - Database migration formatting

### Epic 17 Custom Quality Checks

- **Naming Conventions** - Enforces camelCase/PascalCase/CONSTANT_CASE standards
- **Security Patterns** - Detects security vulnerabilities and anti-patterns
- **API Documentation** - Ensures all API routes have proper JSDoc documentation
- **Migration Safety** - Validates database migrations for safety and performance

## Quick Setup

```bash
# Install pre-commit tool
brew install pre-commit

# Install hooks in repository
pre-commit install

# Test hooks on all files
pre-commit run --all-files
```

## How It Works

### Automatic Execution

Pre-commit hooks run automatically on every `git commit`. If any hook fails, the commit is blocked until issues are resolved.

### Manual Execution

```bash
# Run all hooks on staged files
pre-commit run

# Run specific hook
pre-commit run eslint
pre-commit run epic17-security-check

# Run on all files (not just staged)
pre-commit run --all-files

# Skip hooks for emergency commits (not recommended)
git commit --no-verify
```

## Epic 17 Quality Standards

### 1. Naming Conventions (`epic17-naming-conventions`)

**Requirements:**

- Functions, methods, variables: `camelCase`
- Classes, interfaces, types: `PascalCase`
- Constants: `SCREAMING_SNAKE_CASE`
- React components: `PascalCase` (automatically detected)

**Example:**

```typescript
// ✅ Good
const userName = 'john';
const MAX_RETRIES = 3;
class UserService {}
const UserComponent = () => <div />;

// ❌ Bad
const user_name = 'john';
const maxRetries = 3;
class userService {}
const user_component = () => <div />;
```

### 2. Security Patterns (`epic17-security-check`)

**Detects:**

- SQL injection vulnerabilities
- XSS risks (unsafe HTML manipulation)
- Code injection (eval, Function constructor)
- Hardcoded secrets/credentials
- Unsafe HTTP requests
- Authentication bypasses

**Example:**

```typescript
// ❌ Dangerous
const query = `SELECT * FROM users WHERE id = ${userId}`;
element.innerHTML = userInput + '<script>';
eval(userCode);
const apiKey = 'sk-1234567890abcdef';

// ✅ Safe
const query = `SELECT * FROM users WHERE id = ?`;
element.textContent = userInput;
// Use static analysis instead of eval
const apiKey = process.env.API_KEY;
```

### 3. API Documentation (`epic17-api-documentation`)

**Requirements:**

- All API routes must have JSDoc comments
- Include `@description`, `@route`, `@method`, `@access`
- Document parameters with `@param`
- Document responses with `@returns`
- Document errors with `@throws`

**Example:**

```typescript
/**
 * @description Get user profile information
 * @route GET /api/users/:id
 * @method GET
 * @access authenticated
 * @param {string} id - User ID
 * @returns {Object} User profile data
 * @throws {404} User not found
 * @throws {401} Authentication required
 */
fastify.get('/api/users/:id', async (request, reply) => {
  // Implementation
});
```

### 4. Migration Safety (`database-migration-check`)

**Requirements:**

- Follow naming convention: `NNN_descriptive_name.sql`
- Include rollback strategy for destructive operations
- Wrap operations in transactions
- Document backup strategy for data changes
- Include Epic 17 task references

**Example:**

```sql
-- Task: E17-1753114396XXX-XXXXXX
-- ROLLBACK: DROP TABLE user_preferences;
-- BACKUP: CREATE TABLE user_preferences_backup AS SELECT * FROM user_preferences;

BEGIN;

CREATE TABLE user_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    preference_key VARCHAR(255) NOT NULL,
    preference_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX idx_user_preferences_key ON user_preferences(preference_key);

COMMIT;
```

## Bypassing Hooks

### Temporary Bypass (Emergency Only)

```bash
# Skip all hooks (use sparingly)
git commit --no-verify

# Skip specific issues with security disable comments
// security-disable-line
eval(safeCode); // security-disable: code-injection
```

### File Exclusions

Some files are automatically excluded:

- Test files (`*.test.*`, `*.spec.*`)
- Development tools (`cypress/`, `jest/`)
- Lock files (`package-lock.json`, `pnpm-lock.yaml`)

## Troubleshooting

### Common Issues

**1. TypeScript Errors**

```bash
# Fix type errors first
pnpm typecheck
# Then commit
git commit
```

**2. ESLint Failures**

```bash
# Auto-fix where possible
pnpm lint --fix
# Manual fixes for remaining issues
```

**3. Naming Convention Violations**

- Rename variables to follow camelCase
- Use PascalCase for React components
- Use SCREAMING_SNAKE_CASE for constants

**4. Security Pattern Detections**

- Review flagged patterns carefully
- Use environment variables for secrets
- Implement proper input validation
- Add security disable comments only if absolutely safe

### Getting Help

1. **Check hook output** - Error messages include specific line numbers and suggestions
2. **Run individual hooks** - Test specific checks: `pre-commit run epic17-naming-conventions`
3. **Review documentation** - Each violation includes fix suggestions
4. **Consult security guidelines** - For security patterns, ensure fixes maintain security

## Configuration Files

- **`.pre-commit-config.yaml`** - Main configuration
- **`scripts/check-*.js`** - Epic 17 custom checks
- **`.secrets.baseline`** - Secrets detection baseline
- **`.eslintrc.json`** - ESLint configuration

## Benefits

### Code Quality

- Consistent naming conventions across codebase
- Automated security vulnerability detection
- Comprehensive API documentation requirements
- Database migration safety guarantees

### Development Velocity

- Catch issues before code review
- Automated formatting and linting
- Prevent security vulnerabilities early
- Maintain documentation standards

### Epic 17 Standards

- Enforce Epic 17 specific requirements
- Task ID tracking in migrations
- Security considerations for admin features
- Feature flag integration guidance

## Next Steps

1. **Run on existing code**: `pre-commit run --all-files`
2. **Address violations**: Follow error messages and fix suggestions
3. **Document exceptions**: Use security-disable comments sparingly
4. **Team training**: Ensure all developers understand standards

The pre-commit system helps maintain Epic 17's high code quality standards while catching issues early in the development process.
