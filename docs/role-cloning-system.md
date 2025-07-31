# Role Cloning System

## Overview

The Role Cloning System is a comprehensive RBAC (Role-Based Access Control) enhancement that allows administrators to efficiently create new roles by cloning existing ones. This system supports selective permission copying, conflict resolution, and maintains detailed audit trails of all cloning operations.

## Features

### Core Functionality

- **Complete Role Duplication**: Clone roles with all permissions and metadata
- **Selective Permission Copying**: Choose which permissions to include or exclude
- **Role Template System**: Identify and reuse commonly cloned roles as templates
- **Conflict Resolution**: Handle permission scope mismatches and compatibility issues
- **Clone History Tracking**: Maintain detailed records of all cloning operations
- **Validation Framework**: Comprehensive validation before clone operations

### Security Features

- **Permission-Based Access Control**: Requires `perm_clone_roles` permission
- **Scope Validation**: Ensures permission scopes are compatible with target role scope
- **Audit Trail**: Complete audit logging of all clone operations
- **Name Conflict Detection**: Prevents duplicate role names within the same scope
- **Transaction Safety**: Uses database transactions for atomic operations

## Architecture

### Components

1. **RoleCloneManager** (`client/src/components/admin/RoleCloneManager.tsx`)
   - React component for the admin interface
   - Provides interactive role cloning with preview and validation

2. **RoleCloneService** (`server/src/admin/RoleCloneService.ts`)
   - Backend service handling clone operations
   - Includes validation, conflict resolution, and audit logging

3. **Role Cloning API** (`server/src/routes/role-cloning.ts`)
   - RESTful endpoints for role cloning operations
   - Authentication and authorization middleware

4. **Database Schema** (`server/database/migrations/033_role_cloning_system.sql`)
   - Extended roles table with clone metadata
   - Clone operations tracking
   - Clone history views

### Data Flow

```
User Request → API Validation → Service Layer → Database Transaction → Audit Log
     ↓              ↓                ↓                ↓                ↓
UI Validation → Auth Check → Business Logic → Data Persistence → History Update
```

## API Reference

### Clone Role

**POST** `/api/roles/clone`

Clone an existing role with specified configuration.

**Request Body:**

```json
{
  "sourceRoleId": "string",
  "targetName": "string",
  "targetDescription": "string",
  "targetScope": "global|organization|team",
  "organizationId": "string",
  "includePermissions": ["permission_id1", "permission_id2"],
  "excludePermissions": ["permission_id3"],
  "cloneMetadata": {
    "templateVersion": "string",
    "customProperties": {}
  }
}
```

**Response:**

```json
{
  "success": true,
  "clonedRole": {
    "id": "string",
    "name": "string",
    "description": "string",
    "scope": "string",
    "permissions": ["string"],
    "createdAt": "string",
    "metadata": {
      "clonedFrom": "string",
      "cloneCount": 0
    }
  },
  "warnings": ["string"]
}
```

### Get Clone History

**GET** `/api/roles/:roleId/clone-history`

Retrieve the clone history for a specific role.

**Response:**

```json
{
  "success": true,
  "history": {
    "roleId": "string",
    "cloneCount": 3,
    "clonedFrom": "string",
    "clonedTo": [
      {
        "roleId": "string",
        "roleName": "string",
        "clonedAt": "string",
        "clonedBy": "string"
      }
    ],
    "templateUsage": {
      "timesUsedAsTemplate": 3,
      "lastUsedAsTemplate": "string"
    }
  }
}
```

### Get Role Templates

**GET** `/api/roles/templates`

Get roles commonly used as templates (sorted by clone frequency).

**Query Parameters:**

- `organizationId` (optional): Filter by organization
- `limit` (optional): Maximum number of templates to return (default: 10)

**Response:**

```json
{
  "success": true,
  "templates": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "scope": "string",
      "permissions": ["string"],
      "metadata": {
        "cloneCount": 5,
        "templateUsage": {}
      }
    }
  ]
}
```

### Validate Clone Request

**POST** `/api/roles/validate-clone`

Validate a clone request without performing the actual clone.

**Request Body:**

```json
{
  "sourceRoleId": "string",
  "targetName": "string",
  "targetScope": "string",
  "organizationId": "string",
  "includePermissions": ["string"]
}
```

**Response:**

```json
{
  "success": true,
  "validation": {
    "isValid": true,
    "errors": ["string"],
    "warnings": ["string"],
    "conflicts": [
      {
        "type": "permission_scope_mismatch",
        "permissionId": "string",
        "description": "string",
        "resolution": "skip"
      }
    ]
  }
}
```

### Get Clone Operations

**GET** `/api/roles/clone-operations`

Get recent clone operations for monitoring and auditing.

**Query Parameters:**

- `limit`: Maximum number of operations (default: 20)
- `offset`: Pagination offset (default: 0)
- `organizationId`: Filter by organization

**Response:**

```json
{
  "success": true,
  "operations": [
    {
      "operationId": "string",
      "sourceRoleId": "string",
      "sourceRoleName": "string",
      "clonedRoleId": "string",
      "clonedRoleName": "string",
      "timestamp": "string",
      "clonedBy": "string",
      "permissionsCloned": 5,
      "permissionsSkipped": 1
    }
  ],
  "total": 100
}
```

## Usage Examples

### Basic Role Cloning

```typescript
import { RoleCloneManager } from './components/admin/RoleCloneManager';

// In your admin interface
<RoleCloneManager
  onRoleCloned={(clonedRole) => {
    console.log('Role cloned successfully:', clonedRole.name);
    // Refresh role list or redirect
  }}
  onClose={() => setShowCloneManager(false)}
/>
```

### API Usage

```typescript
// Clone a role via API
const response = await fetch('/api/roles/clone', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    sourceRoleId: 'role_admin',
    targetName: 'Project Manager',
    targetDescription: 'Custom project management role',
    targetScope: 'organization',
    organizationId: 'org_123',
    includePermissions: ['perm_read_projects', 'perm_edit_projects', 'perm_share_projects'],
  }),
});

const result = await response.json();
if (result.success) {
  console.log('Cloned role:', result.clonedRole);
}
```

### Service Layer Usage

```typescript
import { RoleCloneService } from '../admin/RoleCloneService';

const roleCloneService = new RoleCloneService(db, auditService);

const cloneRequest = {
  sourceRoleId: 'role_editor',
  targetName: 'Content Creator',
  targetDescription: 'Specialized content creation role',
  targetScope: 'team',
  organizationId: 'org_456',
  includePermissions: ['perm_read_projects', 'perm_edit_projects'],
  excludePermissions: ['perm_delete_projects'],
};

const result = await roleCloneService.cloneRole(cloneRequest, userId);
```

## Configuration

### Required Permissions

Users must have the following permissions to use role cloning:

- `perm_clone_roles`: Create new roles by cloning existing ones
- `perm_view_clone_history`: View role cloning history and operations
- `perm_manage_role_templates`: Create and manage role templates

### Database Configuration

The system requires the following database tables:

1. **Extended `roles` table**: Additional clone metadata columns
2. **`clone_operations`**: Tracking table for all clone operations
3. **`clone_conflicts`**: Conflict resolution tracking
4. **Views**: `role_templates`, `role_clone_history`

### Environment Variables

```bash
# Enable role cloning features
ENABLE_ROLE_CLONING=true

# Clone operation timeout (milliseconds)
CLONE_OPERATION_TIMEOUT=30000

# Maximum permissions per role
MAX_PERMISSIONS_PER_ROLE=100

# Clone history retention days
CLONE_HISTORY_RETENTION_DAYS=365
```

## Best Practices

### UI/UX Guidelines

1. **Progressive Disclosure**: Show basic options first, advanced options behind toggles
2. **Visual Feedback**: Clearly indicate which permissions come from the source role
3. **Validation Feedback**: Show real-time validation as users type
4. **Conflict Visualization**: Clearly show permission conflicts and resolutions

### Security Considerations

1. **Principle of Least Privilege**: Default to minimal permission sets
2. **Scope Validation**: Always validate permission scopes against target role scope
3. **Audit Everything**: Log all clone operations for security review
4. **Rate Limiting**: Prevent abuse of clone operations

### Performance Optimization

1. **Batch Operations**: Group related database operations
2. **Lazy Loading**: Load permission details on demand
3. **Caching**: Cache frequently cloned roles as templates
4. **Async Processing**: Use background jobs for complex clones

## Monitoring and Alerting

### Key Metrics

- **Clone Success Rate**: Percentage of successful clone operations
- **Average Clone Time**: Time taken to complete clone operations
- **Template Usage**: Most frequently cloned roles
- **Conflict Rate**: Percentage of clones with permission conflicts
- **Error Rate**: Failed clone operations

### Alerts

Set up alerts for:

- High clone failure rate (>10%)
- Slow clone operations (>30 seconds)
- Unusual clone patterns (many clones in short time)
- Permission conflicts requiring manual review

### Logging

All clone operations generate structured logs:

```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "operation": "role_clone",
  "operationId": "clone_1234567890_abc123",
  "sourceRoleId": "role_admin",
  "clonedRoleId": "role_1234567890_def456",
  "clonedBy": "user_admin",
  "duration": 1250,
  "permissionsCloned": 15,
  "permissionsSkipped": 2,
  "conflicts": [
    {
      "type": "permission_scope_mismatch",
      "permissionId": "perm_global_admin",
      "resolution": "skip"
    }
  ],
  "success": true
}
```

## Troubleshooting

### Common Issues

**Issue**: Role cloning fails with "Permission scope mismatch"
**Solution**: Check that all permissions are compatible with the target role scope. Global permissions cannot be assigned to organization or team-scoped roles.

**Issue**: Clone operation times out
**Solution**: Reduce the number of permissions being cloned, or check database performance.

**Issue**: Name conflicts during clone
**Solution**: The target role name already exists. Choose a different name or check for soft-deleted roles.

**Issue**: Missing permissions after clone
**Solution**: Some permissions may have been skipped due to conflicts. Check the warnings in the response and the conflict resolution log.

### Debug Mode

Enable debug logging:

```bash
DEBUG_ROLE_CLONING=true
```

This will provide detailed logs of:

- Validation steps
- Permission resolution process
- Database queries
- Conflict detection logic

## Migration Guide

### From Manual Role Creation

If you're currently creating roles manually, the cloning system provides:

1. **Faster Role Creation**: Clone similar roles instead of starting from scratch
2. **Consistency**: Ensure similar roles have consistent permission sets
3. **Audit Trail**: Track the origin and evolution of roles
4. **Template Reuse**: Identify and reuse successful role configurations

### Database Migration

Run the migration script to add role cloning support:

```bash
# Run the role cloning migration
npm run migrate -- --name=033_role_cloning_system
```

This will:

- Add clone metadata columns to the roles table
- Create clone tracking tables
- Set up indexes for performance
- Create views for clone history
- Add stored procedures for safe cloning

## Future Enhancements

### Planned Features

1. **Role Versioning**: Track changes to cloned roles over time
2. **Smart Templates**: AI-powered role suggestions based on user patterns
3. **Bulk Cloning**: Clone multiple roles in a single operation
4. **Permission Dependencies**: Auto-include dependent permissions
5. **Clone Approval Workflow**: Require approval for sensitive role clones

### Integration Opportunities

1. **Active Directory**: Import/sync role clones with AD groups
2. **Compliance Frameworks**: Map cloned roles to compliance requirements
3. **Workflow Systems**: Integrate with approval and review workflows
4. **Analytics**: Advanced analytics on role usage and evolution

## Support

For technical support or questions about the role cloning system:

1. Check this documentation first
2. Review the troubleshooting section
3. Check the application logs for error details
4. Contact the system administrator or development team

Remember to include relevant log entries and error messages when reporting issues.
