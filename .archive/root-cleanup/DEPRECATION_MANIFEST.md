# Epic 1 Deprecation Manifest

## Overview
This manifest identifies all components and features that are OUTSIDE the Epic 1 MVP scope and should be deprecated before deployment. Epic 1 focuses solely on the core prompt manipulation tool with inline editing capabilities.

## Epic 1 Core Features (KEEP)
- Prompt manipulation with inline editing
- Node-based visual editor (TextBlock, WeightedChoice, Concat, Variable, Output)
- Deterministic execution engine
- Real-time preview with multiple seeds
- Keyboard navigation and shortcuts
- Save/load functionality (.psg format)
- Medieval demo showcase

## Components to Deprecate

### 1. Authentication & User Management (NOT NEEDED for MVP)
```
client/src/components/auth/                    # 25 files
client/src/pages/*Page.tsx                    # 5 auth-related pages
client/src/hooks/use*Auth*.ts                 # 5 auth hooks
client/src/stores/authStore.ts
client/src/types/MFATypes.ts
packages/core/auth/                           # 4 files
```
**Reason**: MVP is a standalone tool, no user accounts needed

### 2. Admin Systems (NOT NEEDED for MVP)
```
client/src/components/admin/                  # 68 files!
packages/core/admin/                          # 2 files
packages/core/components/Admin/               # 31 files
packages/core/domains/admin-dashboard/        # Multiple files
```
**Reason**: No admin functionality in MVP

### 3. Marketplace & Commerce (NOT NEEDED for MVP)
```
client/src/components/marketplace/            # 49 files!
client/src/hooks/useMarketplace.ts
packages/core/components/MarketplaceAttribution/
packages/core/analytics/MarketplaceMetrics.*
```
**Reason**: No marketplace features in MVP

### 4. Advanced Analytics (NOT NEEDED for MVP)
```
client/src/components/analytics/
client/src/hooks/use*Analytics.ts            # 5 analytics hooks
client/src/services/analyticsService.ts
client/src/types/analytics.ts
client/src/types/revenue.ts
packages/core/analytics/                     # 36 files (keep only basic tracking)
packages/core/components/Analytics/          # 30 files
```
**Reason**: MVP only needs basic usage metrics

### 5. Enterprise Features (NOT NEEDED for MVP)
```
client/src/components/consent/               # 6 files
client/src/components/approval/              # 1 file
client/src/components/collaboration/         # 1 file
client/src/components/compliance/            # Not found but referenced
client/src/components/moderation/            # 3 files
client/src/components/oauth/                 # 4 files
client/src/components/payment/               # 2 files
client/src/components/policy/                # 1 file
client/src/components/revenue/               # 2 files
client/src/components/security/              # 7 files
client/src/components/transparency/          # 1 file
packages/core/collaboration/                 # 17 files
packages/core/security/                      # 23 files
packages/core/audit/                         # 6 files
```
**Reason**: No enterprise features in MVP

### 6. Non-Core Features (NOT NEEDED for MVP)
```
client/src/components/file-browser/          # 10 files
client/src/components/knowledge/             # 1 file
client/src/components/preferences/           # 1 file
client/src/components/profile/               # 1 file
client/src/components/quality/               # 7 files
client/src/components/reports/               # 3 files
packages/core/community/                     # 14 files
packages/core/checkpoint/                    # 1 file
```
**Reason**: Not part of core prompt manipulation

### 7. Unnecessary Services & Utils
```
client/src/services/DeviceFingerprintService.ts
client/src/services/searchApiService.ts
client/src/utils/payloadEncryption.ts
client/src/utils/securityUtils.ts
```
**Reason**: Not needed for standalone MVP

## Deprecation Approach

### Phase 1: Mark for Deprecation (Immediate)
1. Add `@deprecated Epic 1 - Out of scope` JSDoc comments to all files
2. Create `deprecated/` directory structure
3. Move files maintaining import paths temporarily

### Phase 2: Remove Imports (Pre-deployment)
1. Remove all imports from deprecated components
2. Update package.json to exclude deprecated paths
3. Update build configs to skip deprecated directories

### Phase 3: Archive & Remove (Post-deployment verification)
1. Create separate archive branch with full codebase
2. Remove deprecated directories from main branch
3. Update documentation to reflect MVP scope

## Build Configuration Updates

### Vite Config (client/vite.config.ts)
```typescript
// Exclude deprecated paths from build
build: {
  rollupOptions: {
    external: [
      /deprecated/,
      /components\/(auth|admin|marketplace|analytics|security)/
    ]
  }
}
```

### TypeScript Config
```json
{
  "exclude": [
    "**/deprecated/**",
    "client/src/components/auth/**",
    "client/src/components/admin/**",
    "client/src/components/marketplace/**"
  ]
}
```

## Estimated Impact
- **Files to deprecate**: ~950+
- **Code reduction**: ~90%
- **Bundle size reduction**: ~80-85%
- **Build time improvement**: ~70%
- **Deployment complexity**: Greatly simplified

## Next Steps
1. Run deprecation script to mark files
2. Test build with exclusions
3. Verify Epic 1 features still work
4. Create deployment-ready branch
5. Archive full codebase separately