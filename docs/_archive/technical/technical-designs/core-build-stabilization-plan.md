# Core Build Stabilization Technical Design

## Overview
This document provides technical implementation guidance for Story 1.30: Core Build Stabilization. It details the current issues, root causes, and step-by-step remediation plan.

## Current State Analysis

### Build Errors Identified
```
1. "number only refers to a type, but is being used as a value"
   - Location: packages/core/index.ts
   - Cause: TypeScript misconfiguration or missing type imports

2. "Cannot write file ... would overwrite input file"
   - Location: TypeScript compilation
   - Cause: Declaration output path overlaps with source files

3. Module resolution failures
   - Location: Downstream packages
   - Cause: Incorrect export mappings in package.json
```

### Shim Inventory
Current workarounds that need removal after fix:

1. **Asset Browser Jest Config**
```javascript
// packages/asset-browser/jest.config.cjs
moduleNameMapper: {
  '^@promptscape/core/utils$': '<rootDir>/../core/utils/index.ts',
  '^@promptscape/core/utils/(.*)$': '<rootDir>/../core/utils/$1'
}
```

2. **TypeScript Path Mappings** (if present)
```json
// tsconfig.json paths
"paths": {
  "@promptscape/core/utils": ["../core/utils"],
  "@promptscape/core/utils/*": ["../core/utils/*"]
}
```

## Implementation Plan

### Phase 1: Discovery & Assessment
```bash
# Audit current build output
pnpm -w --filter @promptscape/core build 2>&1 | tee build-errors.log

# Check what's actually exported
ls -la packages/core/dist/

# Verify package.json exports
cat packages/core/package.json | jq .exports
```

### Phase 2: TypeScript Configuration Alignment

#### Target Configuration Structure
```json
// packages/core/tsconfig.json (base)
{
  "compilerOptions": {
    "rootDir": "./",
    "baseUrl": "./",
    "outDir": "./dist",
    "declaration": false  // Handled by specific configs
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": ["dist", "node_modules", "**/*.test.ts"]
}

// packages/core/tsconfig.esm.json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "module": "ESNext",
    "outDir": "./dist/esm",
    "declaration": false
  }
}

// packages/core/tsconfig.types.json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "declaration": true,
    "declarationDir": "./dist/types",
    "emitDeclarationOnly": true,
    "outDir": "./dist/types"
  }
}
```

### Phase 3: Package.json Export Configuration

```json
{
  "exports": {
    ".": {
      "types": "./dist/types/index.d.ts",
      "import": "./dist/esm/index.js",
      "require": "./dist/cjs/index.js"
    },
    "./utils": {
      "types": "./dist/types/utils/index.d.ts",
      "import": "./dist/esm/utils/index.js",
      "require": "./dist/cjs/utils/index.js"
    },
    "./utils/*": {
      "types": "./dist/types/utils/*.d.ts",
      "import": "./dist/esm/utils/*.js",
      "require": "./dist/cjs/utils/*.js"
    }
  }
}
```

### Phase 4: Build Script Updates

```json
// packages/core/package.json
{
  "scripts": {
    "clean": "rm -rf dist",
    "build:esm": "tsc -p tsconfig.esm.json",
    "build:cjs": "tsc -p tsconfig.cjs.json",
    "build:types": "tsc -p tsconfig.types.json",
    "build": "pnpm clean && pnpm build:esm && pnpm build:cjs && pnpm build:types",
    "postbuild": "node ./scripts/verify-exports.js"
  }
}
```

### Phase 5: Export Verification Script

```javascript
// packages/core/scripts/verify-exports.js
const fs = require('fs');
const path = require('path');

const requiredExports = [
  'dist/esm/index.js',
  'dist/cjs/index.js',
  'dist/types/index.d.ts',
  'dist/esm/utils/index.js',
  'dist/cjs/utils/index.js',
  'dist/types/utils/index.d.ts'
];

const missing = requiredExports.filter(
  file => !fs.existsSync(path.join(__dirname, '..', file))
);

if (missing.length > 0) {
  console.error('Missing required exports:', missing);
  process.exit(1);
}

console.log('✅ All required exports present');
```

## Testing Strategy

### Local Validation
```bash
# 1. Build core package
cd packages/core
pnpm build

# 2. Test import in Node REPL
node -e "const utils = require('@promptscape/core/utils'); console.log(utils)"

# 3. Test in downstream package
cd ../asset-browser
pnpm test --no-coverage
```

### CI Integration Test
```yaml
# .github/workflows/ci.yml addition
- name: Validate Core Exports
  run: |
    pnpm -w --filter @promptscape/core build
    node packages/core/scripts/verify-exports.js
```

## Rollback Plan

If build breaks catastrophically:

```bash
# 1. Immediate rollback
git checkout HEAD~1 -- packages/core/tsconfig*.json packages/core/package.json

# 2. Restore shims temporarily
git checkout main -- packages/asset-browser/jest.config.cjs

# 3. Communicate to team
echo "Core build stabilization rolled back - investigating issues"
```

## Success Metrics

- [ ] Zero build errors from `pnpm -w --filter @promptscape/core build`
- [ ] All downstream packages pass tests without shims
- [ ] No TypeScript "overwrite" warnings
- [ ] CI pipeline green without workarounds
- [ ] Import statements work: `import { utils } from '@promptscape/core/utils'`

## Migration Checklist for Downstream Packages

After core stabilization is complete, each downstream package needs:

1. **Remove Jest shims**
   - Delete moduleNameMapper entries for @promptscape/core

2. **Remove TypeScript path mappings**
   - Delete paths entries for @promptscape/core

3. **Update imports** (if needed)
   ```typescript
   // Before (with shim)
   import { someUtil } from '../../../core/utils/someUtil';
   
   // After (clean import)
   import { someUtil } from '@promptscape/core/utils';
   ```

4. **Run validation**
   ```bash
   pnpm typecheck
   pnpm test
   ```

## Communication Plan

### For 1.18 Agent
"Continue with current shims. Story 1.30 will handle the cleanup after you ship."

### For Team
"Core build stabilization planned for post-1.18. Shims are temporary and documented."

### Post-Implementation
"Core exports stabilized. Please remove shims from your packages per migration checklist."