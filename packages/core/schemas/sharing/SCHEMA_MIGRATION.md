# Sharing Schemas Migration Guide

## Overview
The massive 12,800-line `sharing-schemas.d.ts` file has been split into organized domain modules for better maintainability and faster compilation.

## New Structure

```
schemas/sharing/
├── index.ts              # Main export file
├── core-schemas.ts       # Basic enums and types
├── user-schemas.ts       # User and collaborator schemas
├── security-schemas.ts   # Security and access control schemas
├── content-schemas.ts    # Content, versioning, and annotation schemas
├── analytics-schemas.ts  # Analytics and metrics schemas
├── collaboration-schemas.ts # Collaboration event schemas
├── api-schemas.ts        # API request/response schemas
├── event-schemas.ts      # Event and notification schemas
└── config-schemas.ts     # System configuration schemas
```

## Migration Steps

### 1. Update Import Statements

**Before:**
```typescript
import { 
  ShareAccessLevelSchema,
  SharePermissionSchema,
  CollaboratorSchema,
  ShareSecurityConfigSchema 
} from '@promptscape/core/schemas/sharing-schemas';
```

**After (Option 1 - Specific imports):**
```typescript
import { ShareAccessLevelSchema, SharePermissionSchema } from '@promptscape/core/schemas/sharing/core-schemas';
import { CollaboratorSchema } from '@promptscape/core/schemas/sharing/user-schemas';
import { ShareSecurityConfigSchema } from '@promptscape/core/schemas/sharing/security-schemas';
```

**After (Option 2 - Convenience import):**
```typescript
// All schemas are still available from the index
import { 
  ShareAccessLevelSchema,
  SharePermissionSchema,
  CollaboratorSchema,
  ShareSecurityConfigSchema 
} from '@promptscape/core/schemas/sharing';
```

### 2. Type Imports

**Before:**
```typescript
import type { ShareAccessLevel, Collaborator } from '@promptscape/core/schemas/sharing-schemas';
```

**After:**
```typescript
import type { ShareAccessLevel } from '@promptscape/core/schemas/sharing/core-schemas';
import type { Collaborator } from '@promptscape/core/schemas/sharing/user-schemas';
```

### 3. Find and Replace Script

Run this bash script to update imports automatically:

```bash
# Update imports in TypeScript files
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i '' \
  's|@promptscape/core/schemas/sharing-schemas|@promptscape/core/schemas/sharing|g'

# For more specific replacements, use:
# This will help identify which specific module to import from
grep -r "import.*from.*sharing-schemas" --include="*.ts" --include="*.tsx"
```

## Benefits

1. **Faster Compilation**: TypeScript doesn't need to parse 12,800 lines for every import
2. **Better Organization**: Related schemas are grouped together
3. **Easier Maintenance**: Changes to one domain don't affect others
4. **Improved IDE Performance**: Autocomplete and IntelliSense work faster
5. **Selective Imports**: Import only what you need

## Schema Categories

### Core Schemas (`core-schemas.ts`)
- Basic enums (access levels, permissions, status)
- Base types used across other schemas
- Common metadata structures

### User Schemas (`user-schemas.ts`)
- UserInfo
- Collaborator
- ViewerInfo
- UserSharingPreferences

### Security Schemas (`security-schemas.ts`)
- ShareSecurityConfig
- AccessControls
- EncryptionSettings
- AuditEntry

### Content Schemas (`content-schemas.ts`)
- ContentVersion
- VersionControl
- Annotations (StickyNote, ConnectionLabel, AnnotationRegion)
- SharedContentMetadata

### Analytics Schemas (`analytics-schemas.ts`)
- ShareView
- ShareDownload
- GeographicStats
- DeviceStats
- ConversionMetrics

### API Schemas (`api-schemas.ts`)
- Request/Response schemas
- Validation schemas for API endpoints

## Backward Compatibility

The main `index.ts` file re-exports all schemas, so existing code will continue to work without changes. However, we recommend updating to specific imports for better performance.

## Next Steps

1. Update your imports to use the new modular structure
2. Run tests to ensure everything works correctly
3. Consider enabling TypeScript's `isolatedModules` flag for better performance
4. Remove the old `sharing-schemas.d.ts` file once migration is complete