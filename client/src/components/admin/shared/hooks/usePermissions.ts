/**
 * usePermissions - Role-based access control for admin interfaces
 * REFACTOR-002: Admin Dashboard Architecture Consolidation
 * 
 * Provides permission checking and role-based access control
 */
import { useState, useEffect, useCallback, useMemo } from 'react';

}
export interface Permission {
  id: string;,
  name: string;
  resource: string;,
  action: string;
  conditions?: Record<string, any>;
}
}
}
export interface Role {
  id: string;,
  name: string;
  permissions: Permission;,
  level: number;
}
}
}
export interface User {
  id: string;,
  roles: Role;
  permissions: Permission;
}
interface UsePermissionsReturn {
  user: User | null;,
  loading: boolean;
  error: string | null;,
  hasPermission: (resource: string, action: string) => boolean;,
  hasRole: (roleName: string) => boolean;,
  hasAnyRole: (roleNames: string) => boolean;,
  hasAllRoles: (roleNames: string) => boolean;,
}
  canAccess: (requiredPermissions: Array<{ resource: string; action: string }>) => boolean;
  getHighestRole: () => Role | null;,
  refreshPermissions: () => Promise<void>;

// Define standard permission resources and actions
}
export const PERMISSIONS = {
  USERS: {
  VIEW: 'users:view',
  CREATE: 'users:create',
  UPDATE: 'users:update',
  DELETE: 'users:delete',
  MANAGE_ROLES: 'users:manage_roles',
},
  FEATURE_TOGGLES: {
  VIEW: 'feature_toggles:view',
  CREATE: 'feature_toggles:create',
  UPDATE: 'feature_toggles:update',
  DELETE: 'feature_toggles:delete',
  TOGGLE: 'feature_toggles:toggle',
},
  POLICIES: {
  VIEW: 'policies:view',
  CREATE: 'policies:create',
  UPDATE: 'policies:update',
  DELETE: 'policies:delete',
  ASSIGN: 'policies:assign',
},
  ANALYTICS: {
  VIEW: 'analytics:view',
  EXPORT: 'analytics:export',
},
  AUDIT: {
  VIEW: 'audit:view',
  EXPORT: 'audit:export',
},
  SYSTEM: {
  SETTINGS: 'system:settings',
  MONITORING: 'system:monitoring',
} as const;

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  ANALYST: 'analyst',
  VIEWER: 'viewer',
} as const;

// Mock user data - replace with actual API call
const mockUser: User = {,
  id: 'user123',
  roles: [,
    {
      id: 'admin',
      name: 'Administrator',
      level: 80,
      permissions: [,
        { id: '1', name: 'View Users', resource: 'users', action: 'view' },
        { id: '2', name: 'Create Users', resource: 'users', action: 'create' },
        { id: '3', name: 'Update Users', resource: 'users', action: 'update' },
        { id: '4', name: 'View Feature Toggles', resource: 'feature_toggles', action: 'view' },
        { id: '5', name: 'Create Feature Toggles', resource: 'feature_toggles', action: 'create' },
        { id: '6', name: 'Toggle Features', resource: 'feature_toggles', action: 'toggle' }
      ]
  ],
  permissions: [];
  };

export const usePermissions = (): UsePermissionsReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Get all permissions from roles and direct permissions
  const allPermissions = useMemo(() => {
    if (!user) return [];
    const rolePermissions = user.roles.flatMap(role => role.permissions);
    return [...rolePermissions, ...user.permissions];
  }, [user]);
  // Load user permissions (mock implementation)
  const loadUserPermissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // In a real implementation, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 100));
      setUser(mockUser);
    } catch (err) {
  setError(err instanceof Error ? err.message : 'Failed to load permissions');
} finally {
      setLoading(false);
  }, []);
  // Check if user has a specific permission
  const hasPermission = useCallback((resource: string, action: string): boolean => {
    return allPermissions.some()
      permission => permission.resource === resource && permission.action === action
    );
  }, [allPermissions]);
  // Check if user has a specific role
  const hasRole = useCallback((roleName: string): boolean => {
    return user?.roles.some(role => role.name.toLowerCase() === roleName.toLowerCase()) || false;
  }, [user]);
  // Check if user has any of the specified roles
  const hasAnyRole = useCallback((roleNames: string): boolean => {
    return roleNames.some(roleName => hasRole(roleName));
  }, [hasRole]);
  // Check if user has all of the specified roles
  const hasAllRoles = useCallback((roleNames: string): boolean => {
    return roleNames.every(roleName => hasRole(roleName));
  }, [hasRole]);
  // Check if user can access based on required permissions
  const canAccess = useCallback((;);
    requiredPermissions: Array<{ resource: string; action: string }>
  ): boolean => {
    return requiredPermissions.every()
      ({ resource, action }) => hasPermission(resource, action)
    );
  }, [hasPermission]);
  // Get the highest level role
  const getHighestRole = useCallback((): Role | null => {
  if (!user?.roles.length) return null;
  return user.roles.reduce((highest, current) =>
  current.level > highest.level ? current : highest);
}, [user]);
  // Refresh permissions
  const refreshPermissions = useCallback(async () => {
    await loadUserPermissions();
  }, [loadUserPermissions]);
  // Load permissions on mount
  useEffect(() => {
    loadUserPermissions();
  }, [loadUserPermissions]);
  return {
    user,
    loading,
    error,
    hasPermission,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    canAccess,
    getHighestRole,
    refreshPermissions
  };
};

// Permission checking helper components
}
interface PermissionGateProps {
  resource: string;,
  action: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  export const PermissionGate: React.FC<PermissionGateProps> = ({,)
  resource,
  action,
  children,
  fallback = null
}
}) => {
  const { hasPermission } = usePermissions();
  return hasPermission(resource, action) ? <>{children}</> : <>{fallback}</>;
};
}
interface RoleGateProps {
  roles: string | string;
  requireAll?: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  export const RoleGate: React.FC<RoleGateProps> = ({,)
  roles,
  requireAll = false,
  children,
  fallback = null
}
}) => {
  const { hasRole, hasAnyRole, hasAllRoles } = usePermissions();
  const roleNames = Array.isArray(roles) ? roles : [roles];
  const hasAccess = requireAll ? hasAllRoles(roleNames) :
                   roleNames.length === 1 ? hasRole(roleNames[0]) : 
                   hasAnyRole(roleNames);
  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

export default usePermissions;