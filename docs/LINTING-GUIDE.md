# Linting and Formatting Guide

## Overview

This project uses a flexible linting system that can operate in different modes depending on your needs. The system includes ESLint for code quality, Prettier for formatting, and various pre-commit hooks.

## Linting Modes

### 1. **Safe Mode** (Recommended for complex JSX)

- **Command**: `npm run lint:mode:safe`
- **Behavior**: Checks only, no auto-fixing
- **When to use**: When working with complex JSX files or Epic1 components
- **Pre-commit**: Shows warnings but doesn't block commits

### 2. **Active Mode** (Default for general development)

- **Command**: `npm run lint:mode:active`
- **Behavior**: Moderate auto-fixing with 50 warnings allowed
- **When to use**: Regular development work
- **Pre-commit**: Auto-fixes common issues

### 3. **Strict Mode** (For production-ready code)

- **Command**: `npm run lint:mode:strict`
- **Behavior**: Aggressive auto-fixing with strict rules
- **When to use**: Before merging to main branch
- **Pre-commit**: Enforces all rules strictly

### 4. **Emergency Mode** (Quick fixes)

- **Command**: `npm run lint:mode:emergency`
- **Behavior**: Minimal checks, allows up to 500 warnings
- **When to use**: Emergency hotfixes or when dealing with legacy code
- **Pre-commit**: Very permissive

## Configuration Files

### Prettier Configuration

- **Main config**: `.prettierrc` (JSON format)
  - Print width: 80 characters
  - Tab width: 2 spaces
  - Single quotes
  - No trailing commas
  - LF line endings

### ESLint Configuration

- **Main config**: `.eslintrc.js`
  - TypeScript support
  - React and React Hooks rules
  - Very permissive settings for development
  - Extensive ignore patterns for problematic files

### Ignored Files

Both ESLint and Prettier ignore:

- Epic1 components (`**/epic1/**/*.tsx`)
- Complex JSX files (ActivityFeed, ConnectionLabel)
- Command Palette components
- Build outputs and node_modules
- Auto-generated files

## Common Commands

### Formatting

- `npm run format` - Format all files with Prettier
- `npm run format:check` - Check if files are formatted
- `npx prettier --write <file>` - Format specific file

### Linting

- `npm run lint` - Run ESLint on all files
- `npm run lint:fix` - Auto-fix ESLint issues
- `npx eslint <file>` - Lint specific file
- `npx eslint --fix <file>` - Auto-fix specific file

### Committing

- `git commit` - Normal commit (runs pre-commit hooks)
- `git commit --no-verify` - Skip all pre-commit checks
- `npm run commit:safe` - Auto-fix then commit
- `npm run commit:force` - Force commit without checks

## Troubleshooting

### File keeps getting malformed

1. Switch to safe mode: `npm run lint:mode:safe`
2. Add file to `.prettierignore` and `.eslintignore`
3. Commit with `--no-verify` flag

### Too many ESLint errors

1. Run `npm run lint:fix` to auto-fix what's possible
2. Switch to emergency mode temporarily: `npm run lint:mode:emergency`
3. Fix issues incrementally

### Prettier and ESLint conflicts

1. Prettier config takes precedence for formatting
2. ESLint handles code quality rules
3. If they conflict, adjust `.prettierrc` settings

### Pre-commit hook failures

1. Check which mode you're in: `cat .linting-mode`
2. Switch to a more permissive mode if needed
3. Use `git commit --no-verify` as last resort

## Best Practices

1. **Use Safe Mode** when working with:
   - Epic1 components
   - Complex JSX with many nested elements
   - Files that have been problematic in the past

2. **Regular Development**:
   - Use Active Mode for day-to-day work
   - Run `npm run lint:fix` before committing
   - Format files with `npm run format`

3. **Before PR/Merge**:
   - Switch to Strict Mode
   - Fix all warnings and errors
   - Ensure all tests pass

4. **Emergency Situations**:
   - Use Emergency Mode sparingly
   - Document why strict linting was skipped
   - Plan to fix issues in follow-up commits

## File-Specific Notes

### Epic1 Components

- These files have complex JSX that doesn't format well
- They are excluded from auto-formatting
- Manual formatting may be required

### ActivityFeed.tsx & ConnectionLabel.tsx

- Known formatting issues with these files
- Excluded from auto-formatting
- Check syntax manually before committing

### Test Files

- More relaxed rules for test files
- `any` types are allowed
- Unused variables are permitted

## Adding New Exclusions

If a file consistently has formatting issues:

1. Add to `.prettierignore`:

   ```
   path/to/problematic-file.tsx
   ```

2. Add to `.eslintrc.js` ignorePatterns:

   ```javascript
   ignorePatterns: [
     // ... existing patterns
     'path/to/problematic-file.tsx'
   ];
   ```

3. Update `.lintstagedrc.safe.js` if needed:
   ```javascript
   'path/to/file.tsx': [
     () => 'echo "File skipped - known issues"',
   ],
   ```
