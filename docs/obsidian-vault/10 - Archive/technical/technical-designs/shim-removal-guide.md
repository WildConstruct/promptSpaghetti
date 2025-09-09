# Shim Removal Guide

## Purpose

This guide documents all temporary shims/workarounds in the codebase and provides instructions for their removal after Story 1.30 completes.

## Current Shims Inventory

### 1. Asset Browser Jest Configuration

**Location:** `packages/asset-browser/jest.config.cjs`
**Purpose:** Maps @promptscape/core/utils imports to source files directly
**Added:** During Story 1.18 implementation
**Remove After:** Story 1.30 completion

```javascript
// CURRENT (with shim)
module.exports = {
  moduleNameMapper: {
    '^@promptscape/core/utils$': '<rootDir>/../core/utils/index.ts',
    '^@promptscape/core/utils/(.*)$': '<rootDir>/../core/utils/$1'
  }
};

// AFTER REMOVAL
module.exports = {
  // moduleNameMapper entries for core removed
};
```

### 2. TypeScript Path Mappings (if present)

**Location:** Various `tsconfig.json` files
**Purpose:** Redirects TypeScript to find core utils
**Check:** `grep -r "@promptscape/core" --include="tsconfig.json"`

```json
// REMOVE these entries if found
"paths": {
  "@promptscape/core/utils": ["../core/utils"],
  "@promptscape/core/utils/*": ["../core/utils/*"]
}
```

## Removal Process

### Step 1: Verify Core Build Success

```bash
# Ensure core builds cleanly first
pnpm -w --filter @promptscape/core build
ls -la packages/core/dist/
```

### Step 2: Remove Shims Package by Package

#### For each package with shims:

1. Remove Jest moduleNameMapper entries
2. Remove TypeScript path mappings
3. Run tests to verify
4. Run typecheck to verify

```bash
# Example for asset-browser
cd packages/asset-browser

# Edit jest.config.cjs - remove moduleNameMapper
vim jest.config.cjs

# Test
pnpm test --no-coverage

# Typecheck
pnpm typecheck
```

### Step 3: Update Import Statements

Search for any hardcoded relative imports that should use package imports:

```bash
# Find potential candidates
grep -r "from '\.\./\.\./core" packages/
grep -r 'from "\.\./\.\./core' packages/

# Update to proper imports
# from '../../../core/utils/something'
# to '@promptscape/core/utils/something'
```

### Step 4: Validate Full Build

```bash
# From root
pnpm install
pnpm build
pnpm test
```

## Affected Packages Checklist

- [ ] packages/asset-browser
  - [ ] Remove jest.config.cjs moduleNameMapper
  - [ ] Check tsconfig.json for path mappings
  - [ ] Run tests
- [ ] packages/cli (if using core)
  - [ ] Check for any workarounds
  - [ ] Validate imports
- [ ] client/ (if using core)
  - [ ] Check vite.config.ts for aliases
  - [ ] Check tsconfig.json
- [ ] server/ (if using core)
  - [ ] Check tsconfig.json
  - [ ] Validate runtime imports

## Verification Commands

```bash
# Quick check for remaining shims
echo "Checking for moduleNameMapper..."
grep -r "moduleNameMapper.*@promptscape/core" packages/

echo "Checking for tsconfig paths..."
grep -r '"@promptscape/core' packages/ --include="tsconfig*.json"

echo "Checking for hardcoded core paths..."
grep -r "'\.\./.*core/" packages/ --include="*.ts" --include="*.tsx"
```

## Expected Outcome

After shim removal:

- ✅ All packages import from `@promptscape/core` using package exports
- ✅ No moduleNameMapper entries for core
- ✅ No TypeScript path mappings for core
- ✅ All tests pass
- ✅ All typechecks pass
- ✅ Build succeeds

## Rollback Instructions

If removal causes issues:

```bash
# Revert the specific config file
git checkout HEAD -- packages/[package-name]/jest.config.cjs
git checkout HEAD -- packages/[package-name]/tsconfig.json

# Or full rollback
git stash
git checkout main
```

## Communication Template

### PR Description

```
## Shim Removal - Post Story 1.30

This PR removes temporary shims added during Story 1.18 implementation.

### Changes
- Removed Jest moduleNameMapper for @promptscape/core from [packages]
- Removed TypeScript path mappings for @promptscape/core from [packages]
- Updated import statements to use package exports

### Testing
- [ ] Core builds successfully
- [ ] All affected packages pass tests
- [ ] All affected packages pass typecheck
- [ ] Full build succeeds

### Related
- Story 1.30: Core Build Stabilization
- Story 1.18: CI Preview and Feature Flags (added shims)
```

## Timeline

1. **Now**: Shims in place, Story 1.18 proceeding
2. **After 1.18 ships**: Story 1.30 begins
3. **Story 1.30 complete**: Core exports work
4. **Shim removal PR**: Remove all workarounds
5. **Future**: Clean imports across codebase
