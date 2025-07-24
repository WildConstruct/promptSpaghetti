# Dependency Management Guide

This document outlines the standardized dependency management procedures for the PromptScape monorepo.

## 🎯 Overview

Following [Story 1.1: Dependency Standardization and Conflict Resolution](./stories/1.1.dependency-standardization-conflict-resolution.story.md), this monorepo now has:

- **Standardized dependency versions** across all workspaces
- **Automated conflict detection** in CI/CD pipeline  
- **Security vulnerability scanning** integrated into workflows
- **Automated dependency updates** with validation and rollback

## 📋 Standardized Versions

### Core Dependencies
- **Zod**: `^3.22.4` (standardized across all workspaces)
- **TypeScript**: `^5.0.2` (consistent development environment)
- **Jest**: `^29.7.0` (unified testing framework)
- **React**: `^18.2.0` (consistent UI library)

### Package Naming Convention
All packages follow the `@promptscape/{package-name}` naming pattern:
- `@promptscape/core`
- `@promptscape/cli`
- `@promptscape/prompt-target-core`

## 🔄 Automated Dependency Updates

### Dependabot Configuration
Automated updates run on a staggered schedule:
- **Monday 9:00 UTC**: Root, client, server packages
- **Tuesday 9:00-10:30 UTC**: Core packages (analytics, claude-sdk, graph-core)
- **Wednesday 9:00-9:30 UTC**: UI kit, CLI packages
- **Monthly**: Docker and GitHub Actions

### Update Types
- **Patch/Minor**: Auto-approved after validation
- **Major**: Requires manual review
- **Critical dependencies** (Zod, React, TypeScript): Major updates ignored

## 🚨 Conflict Detection

### Automated Checks
The CI pipeline automatically detects:
1. **Zod version conflicts** (breaks CI if found)
2. **TypeScript version inconsistencies** (warning)
3. **Jest version inconsistencies** (warning)
4. **Security vulnerabilities** (high severity breaks CI)

### Manual Checks
To manually check for conflicts:
```bash
# Check Zod versions
grep -r '"zod"' */package.json packages/*/package.json | grep -v node_modules

# Check TypeScript versions  
grep -r '"typescript"' */package.json packages/*/package.json | grep -v node_modules

# Security audit
pnpm audit --audit-level high
```

## 🛠️ Dependency Update Process

### For Maintainers
1. **Review Dependabot PRs**: Check validation results and approve safe updates
2. **Manual Updates**: Use the standardized process below
3. **Conflict Resolution**: Follow the conflict resolution guide

### Manual Update Process
```bash
# 1. Check current state
./scripts/check-dependency-conflicts.sh

# 2. Update dependency in specific workspace
pnpm --filter {workspace} add {package}@{version}

# 3. Ensure consistency across workspaces if critical dependency
pnpm --filter client add zod@^3.22.4
pnpm --filter server add zod@^3.22.4  
pnpm --filter core add zod@^3.22.4

# 4. Install and validate
pnpm install
pnpm test
pnpm lint
pnpm typecheck

# 5. Final validation
./scripts/check-dependency-conflicts.sh
```

### Local Development Commands
```bash
# Quick conflict check (run before commits)
./scripts/check-dependency-conflicts.sh

# View current dependency versions
grep -r '"zod"' */package.json packages/*/package.json | grep -v node_modules

# Security audit for all workspaces
pnpm audit --audit-level moderate
```

## 🔧 Troubleshooting

### Common Issues

#### Zod Version Conflicts
```bash
# Check current versions
grep -r '"zod"' */package.json packages/*/package.json | grep -v node_modules

# Fix conflicts - standardize to 3.22.4
find . -name "package.json" -not -path "*/node_modules/*" -exec sed -i '' 's/"zod": "\^[0-9.]*"/"zod": "^3.22.4"/g' {} \;

# Reinstall
pnpm install
```

#### TypeScript Compilation Errors
```bash
# Check TypeScript versions
grep -r '"typescript"' */package.json packages/*/package.json | grep -v node_modules

# Standardize to 5.0.2
find . -name "package.json" -not -path "*/node_modules/*" -exec sed -i '' 's/"typescript": "\^[0-9.]*"/"typescript": "^5.0.2"/g' {} \;

# Clean and rebuild
pnpm clean
pnpm install
pnpm typecheck
```

#### Security Vulnerabilities
```bash
# Check vulnerabilities
pnpm audit

# Fix automatically where possible
pnpm audit fix

# Manual updates for critical issues
pnpm --filter {affected-workspace} add {secure-package}@{secure-version}
```

## 📊 Monitoring and Reporting

### Weekly Dependency Report
Automated dependency health reports are generated weekly and include:
- Version consistency across workspaces
- Security vulnerability status
- Outdated dependency summary
- Conflict detection results

### CI/CD Integration
- **GitHub Actions**: Dependency checks run on every PR
- **Build Validation**: Dependencies validated during build process
- **Security Scanning**: Continuous security monitoring
- **Performance Impact**: Installation time monitoring

## 🚀 Best Practices

### For Developers
1. **Always use workspace-specific commands**: `pnpm --filter {workspace}`
2. **Check for conflicts before commits**: Run dependency checks locally
3. **Update documentation**: Update this guide when adding new dependencies
4. **Test thoroughly**: Ensure React Flow integration remains functional

### For Package Maintainers
1. **Follow semantic versioning**: Proper version increments
2. **Document breaking changes**: Clear migration guides
3. **Coordinate updates**: Discuss major dependency changes with team
4. **Monitor CI**: Watch for dependency-related CI failures

## 📚 Related Documentation

- [Story 1.1: Dependency Standardization](./stories/1.1.dependency-standardization-conflict-resolution.story.md)
- [Package.json Template](../package-template.json)
- [GitHub Actions Workflows](../.github/workflows/)
- [Dependabot Configuration](../.github/dependabot.yml)

## 🆘 Support

For dependency management issues:
1. Check this guide first
2. Review CI/CD pipeline logs
3. Check GitHub Issues for similar problems
4. Contact the core team for complex conflicts

---

*Last updated: 2025-01-23 | Story 1.1 Implementation*