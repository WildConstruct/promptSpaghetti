# Security Audit Summary - January 16, 2025

## GitHub Alert Summary

GitHub detected **8 vulnerabilities** on the default branch:

- 3 High severity
- 2 Moderate severity
- 3 Low severity

## Vulnerabilities Found via Audit

### Root Package (npm audit)

#### High Severity (2)

1. **cross-spawn <6.0.6**
   - Issue: Regular Expression Denial of Service (ReDoS)
   - Affected: pre-commit hooks dependency
   - Fix: Update cross-spawn to >=6.0.6

2. **tmp <=0.2.3**
   - Issue: Arbitrary temporary file/directory write via symbolic link
   - Affected: Direct dependency
   - Fix: Update tmp to >=0.2.4

#### Low Severity (1)

1. **tmp 0.0.33**
   - Location: packages/custom-node-sdk > inquirer > external-editor
   - Same issue as above but in nested dependency

## Outdated Dependencies

Major version updates available:

- **React 18 → 19**: Major version upgrade available
- **TypeScript 5.8 → 5.9**: Minor update available
- **Vite 7.0 → 7.1**: Minor update available
- **uuid 9 → 11**: Major version upgrade (breaking changes)
- **zod 3 → 4**: Major version upgrade (breaking changes)

## Recommendations

### Immediate Actions (Security)

1. Update `tmp` package to 0.2.4+
2. Update `cross-spawn` to 6.0.6+
3. Remove or update `pre-commit` package if possible

### Medium Priority (Maintenance)

1. Consider React 19 upgrade (test thoroughly first)
2. Update TypeScript to 5.9.x
3. Review breaking changes for uuid and zod before upgrading

### Low Priority

- Minor version updates for other packages

## Fix Commands

```bash
# Fix immediate security issues
pnpm update tmp@latest
pnpm update cross-spawn@latest

# Update specific workspace
pnpm --filter @prompt-spaghetti/custom-node-sdk update inquirer@latest

# Test after updates
pnpm test
pnpm build
```

## Notes

- Most vulnerabilities are in development dependencies (pre-commit hooks)
- Production code appears clean (client has 0 vulnerabilities)
- The workspace structure makes some automatic fixes difficult
