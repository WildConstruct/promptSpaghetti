# Linting Guide - Preventing Commit Failures

This guide explains how to avoid linting errors that block commits and provides tools to make development smoother.

## Quick Solutions

### 🚀 Immediate Fix for Blocked Commits

If your commit is blocked by linting errors:

```bash
# Option 1: Auto-fix and retry
npm run lint:fix
git add -u
git commit

# Option 2: Use safe commit (auto-fixes then commits)
npm run commit:safe -m "your commit message"

# Option 3: Force commit (skip all checks)
npm run commit:force -m "your commit message"
```

### 🔧 Switch to Permissive Linting Mode

For easier development, switch to permissive mode:

```bash
npm run lint:permissive
```

This allows:

- ✅ Console.log statements
- ✅ Unused variables (prefixed with \_)
- ✅ Up to 10 linting warnings per file
- ✅ More lenient line length (120 chars + strings/comments)
- ✅ Auto-fixing of common issues

## Available Linting Modes

### Strict Mode (Production Ready)

```bash
npm run lint:strict
```

- Errors fail commits
- Enforces consistent style
- Best for production code

### Permissive Mode (Development Friendly)

```bash
npm run lint:permissive
```

- Warnings don't fail commits
- More forgiving rules
- Auto-fixes common issues
- Best for rapid development

### Check Current Mode

```bash
npm run lint:status
```

## Auto-Fix Common Issues

The `lint:fix` script automatically resolves:

- ✅ Unused variable declarations (prefixes with \_)
- ✅ Missing semicolons
- ✅ Quote consistency
- ✅ Indentation issues
- ✅ Trailing commas
- ✅ Import/export formatting

## File-Specific Rules

### Auto-Generated Files

Files matching these patterns get special treatment:

- `src/auto-*.js` - Only formatting, no linting
- `src/monitor-*.js` - Only formatting, no linting
- `**/*.generated.ts` - Ignored completely

### Test Files

- Allow up to 20 warnings
- More permissive rules
- Focus on functionality over style

### Security-Critical Files

- Extra validation for expression evaluators
- AST node whitelists get comprehensive checks
- Still allow warnings in permissive mode

## Commit Hooks

### Standard Hook (Strict)

```bash
git commit -m "message"  # Uses .eslintrc.js
```

### Improved Hook (Permissive)

```bash
# After switching to permissive mode
git commit -m "message"  # Uses .eslintrc.improved.js
```

The improved hook:

1. Auto-fixes common issues
2. Re-stages fixed files
3. Allows commits with warnings
4. Falls back to ultra-permissive mode if needed

## Configuration Files

| File                         | Purpose                     |
| ---------------------------- | --------------------------- |
| `.eslintrc.js`               | Strict linting rules        |
| `.eslintrc.improved.js`      | Permissive linting rules    |
| `.lintstagedrc.js`           | Strict pre-commit rules     |
| `.lintstagedrc.improved.js`  | Permissive pre-commit rules |
| `.husky/pre-commit`          | Standard commit hook        |
| `.husky/pre-commit.improved` | Permissive commit hook      |

When you switch modes, these create:

- `.eslintrc.active.js` - Current ESLint config
- `.lintstagedrc.active.js` - Current lint-staged config
- `.husky/pre-commit.active` - Current commit hook

## IDE Integration

### VS Code

Update your settings to use the active config:

```json
{
  "eslint.options": {
    "configFile": ".eslintrc.active.js"
  }
}
```

### Other IDEs

Point your ESLint integration to `.eslintrc.active.js`

## Troubleshooting

### "Module not found" errors during commit

```bash
# Install missing dependencies
npm install
# Or try permissive mode
npm run lint:permissive
```

### Pre-commit hook failures

```bash
# Check hook permissions
chmod +x .husky/pre-commit.active
# Or bypass hooks entirely
git commit --no-verify -m "message"
```

### ESLint errors in specific files

```bash
# Fix specific file
npx eslint path/to/file.js --fix --max-warnings 10
# Or ignore the file (add to .eslintignore)
echo "path/to/problematic/file.js" >> .eslintignore
```

## Best Practices

### During Development

1. Use permissive mode: `npm run lint:permissive`
2. Fix issues incrementally
3. Use `npm run lint:fix` before major commits

### Before Production

1. Switch to strict mode: `npm run lint:strict`
2. Fix all remaining issues
3. Ensure tests pass: `npm test`

### Team Workflow

1. Permissive mode for feature development
2. Strict mode for code review
3. Document mode choice in PR description

## Emergency Procedures

### Completely Broken Linting

```bash
# 1. Disable all linting temporarily
mv .eslintrc.js .eslintrc.js.backup
echo 'module.exports = { rules: {} }' > .eslintrc.js

# 2. Commit your changes
git commit --no-verify -m "emergency commit"

# 3. Restore linting and fix gradually
mv .eslintrc.js.backup .eslintrc.js
npm run lint:permissive
```

### CI/CD Pipeline Issues

If linting blocks your CI:

1. Use permissive mode configs in CI
2. Run linting as separate, non-blocking step
3. Gradually tighten rules over time

## Additional Resources

- [ESLint Documentation](https://eslint.org/docs/rules/)
- [Prettier Configuration](https://prettier.io/docs/en/configuration.html)
- [Husky Git Hooks](https://typicode.github.io/husky/)
- [lint-staged Configuration](https://github.com/okonet/lint-staged)

---

💡 **Remember**: The goal is to maintain code quality while not blocking productivity. Use permissive mode during development and strict mode for production readiness.
