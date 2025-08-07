/**
 * Epic 9.2.1 - Workspace Types
 * TypeScript types for workspace functionality (client-side)
 */
metadata: Record;
created_by: string;
created_at: Date;
updated_at: Date;
delivery_channel: 'in_app' | 'email' | 'push';
read_at ?  : Date;
delivered_at: Date;
// Permission constants
export const PERMISSIONS = {
    WORKSPACE_READ: 1 << 0,
    WORKSPACE_WRITE: 1 << 1,
    WORKSPACE_ADMIN: 1 << 2,
    WORKSPACE_DELETE: 1 << 3,
    // Project permissions
    PROJECT_READ: 1 << 4,
    PROJECT_WRITE: 1 << 5,
    PROJECT_CREATE: 1 << 6,
    PROJECT_DELETE: 1 << 7,
    // Resource permissions
    RESOURCE_READ: 1 << 8,
    RESOURCE_WRITE: 1 << 9,
    RESOURCE_CREATE: 1 << 10,
    RESOURCE_DELETE: 1 << 11,
    // Comment permissions
    COMMENT_READ: 1 << 12,
    COMMENT_WRITE: 1 << 13,
    COMMENT_DELETE: 1 << 14,
    // User management permissions
    USER_INVITE: 1 << 15,
    USER_REMOVE: 1 << 16,
    USER_ASSIGN_ROLES: 1 << 17,
    // Advanced permissions
    ACTIVITY_READ: 1 << 18,
    NOTIFICATION_MANAGE: 1 << 19,
    EXPORT_DATA: 1 << 20
};
as;
const ;
// Utility functions
export function hasPermission(userPermissions, requiredPermission) {
    return (userPermissions & requiredPermission) !== 0;
    export function getRoleName(permissions) {
        // Check for admin (has all key permissions)
        if (hasPermission(permissions, PERMISSIONS.WORKSPACE_ADMIN)) {
            return 'Admin';
            // Check for editor (can create/edit content)
            if (hasPermission(permissions, PERMISSIONS.PROJECT_CREATE) &&
                hasPermission(permissions, PERMISSIONS.RESOURCE_CREATE)) {
                return 'Editor';
                // Check for commenter (can view and comment)
                if (hasPermission(permissions, PERMISSIONS.COMMENT_WRITE)) {
                    return 'Commenter';
                    // Default to viewer
                    return 'Viewer';
                }
            }
        }
    }
}
