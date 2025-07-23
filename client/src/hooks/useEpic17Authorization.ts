/**
 * Epic 17 Authorization Hook
 * 
 * React hook that integrates Epic 17 Authorization Service with the existing
 * authentication system. Provides role-based access control, permission
 * checking, and resource authorization for admin controls.
 */

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import {
  Epic17AuthorizationService,
  AuthorizationContext,
  AuthorizationResult,
  ResourceType,
  UserContext,
  Permission,
  Role
} from '../../packages/core/services/Epic17AuthorizationService';

interface UseEpic17AuthorizationOptions {
  enableCaching?: boolean;
  strictMode?: boolean;
  auditLevel?: 'basic' | 'detailed' | 'comprehensive';
}

interface AuthorizationHookResult {
  // Permission checking
  hasPermission: (resource: ResourceType, action: string, resourceId?: string) => Promise<boolean>;
  canAccess: (section: string) => boolean;
  canPerformAction: (action: string, context?: Partial<AuthorizationContext>) => Promise<boolean>;
  
  // Bulk operations
  checkMultiplePermissions: (checks: PermissionCheck[]) => Promise<Map<string, boolean>>;
  
  // User data
  userRoles: string[];
  userPermissions: Permission[];
  availableSections: AdminSection[];
  
  // Authorization results
  lastAuthorizationResult: AuthorizationResult | null;
  isAuthorizing: boolean;
  authorizationError: string | null;
  
  // Management functions
  refreshPermissions: () => Promise<void>;
  clearCache: () => void;
}

interface PermissionCheck {
  id: string;
  resource: ResourceType;
  action: string;
  resourceId?: string;
  context?: Partial<AuthorizationContext>;
}

interface AdminSection {
  id: string;
  label: string;
  description: string;
  icon: string;
  requiredPermissions: {
    resource: ResourceType;
    actions: string[];
  }[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  category: string;
}

// Default Epic 17 admin sections
const EPIC17_ADMIN_SECTIONS: AdminSection[] = [
  {
    id: 'feature-toggles',
    label: 'Feature Toggles',
    description: 'Manage feature flags and rollouts',
    icon: 'ToggleLeft',
    requiredPermissions: [
      { resource: ResourceType.FEATURE_TOGGLE, actions: ['read', 'list'] }
    ],
    riskLevel: 'high',
    category: 'feature_management'
  },
  {
    id: 'users',
    label: 'User Management',
    description: 'Manage users and permissions',
    icon: 'Users',
    requiredPermissions: [
      { resource: ResourceType.USER_ACCOUNT, actions: ['read', 'list', 'manage'] }
    ],
    riskLevel: 'critical',
    category: 'user_management'
  },
  {
    id: 'content',
    label: 'Content Management',
    description: 'Moderate and manage content',
    icon: 'FileText',
    requiredPermissions: [
      { resource: ResourceType.CONTENT_ITEM, actions: ['read', 'list', 'moderate'] }
    ],
    riskLevel: 'medium',
    category: 'content_management'
  },
  {
    id: 'api-management',
    label: 'API Management',
    description: 'Manage API keys and access control',
    icon: 'Key',
    requiredPermissions: [
      { resource: ResourceType.API_KEY, actions: ['read', 'list', 'manage'] }
    ],
    riskLevel: 'high',
    category: 'api_management'
  },
  {
    id: 'marketplace',
    label: 'Marketplace Admin',
    description: 'Review templates and transactions',
    icon: 'ShoppingCart',
    requiredPermissions: [
      { resource: ResourceType.MARKETPLACE_ITEM, actions: ['read', 'list', 'moderate'] }
    ],
    riskLevel: 'medium',
    category: 'marketplace'
  },
  {
    id: 'analytics',
    label: 'Analytics & Monitoring',
    description: 'View system metrics and health',
    icon: 'BarChart3',
    requiredPermissions: [
      { resource: ResourceType.DASHBOARD, actions: ['read', 'view'] },
      { resource: ResourceType.REPORT, actions: ['read', 'generate'] }
    ],
    riskLevel: 'low',
    category: 'analytics'
  },
  {
    id: 'system',
    label: 'System Configuration',
    description: 'Configure system settings',
    icon: 'Settings',
    requiredPermissions: [
      { resource: ResourceType.SYSTEM_CONFIG, actions: ['read', 'write', 'manage'] }
    ],
    riskLevel: 'critical',
    category: 'system_admin'
  },
  {
    id: 'audit-logs',
    label: 'Audit Logs',
    description: 'View system audit trail and security logs',
    icon: 'ScrollText',
    requiredPermissions: [
      { resource: ResourceType.AUDIT_LOG, actions: ['read', 'list', 'export'] }
    ],
    riskLevel: 'high',
    category: 'security_audit'
  }
];

let authorizationServiceInstance: Epic17AuthorizationService | null = null;

/**
 * Get or create the authorization service singleton
 */
function getAuthorizationService(): Epic17AuthorizationService {
  if (!authorizationServiceInstance) {
    authorizationServiceInstance = new Epic17AuthorizationService({
      evaluation: {
        enableCaching: true,
        cacheTimeToLive: 300, // 5 minutes
        evaluationTimeout: 1000,
        strictMode: true
      },
      audit: {
        enableAuditLogging: true,
        logLevel: 'detailed',
        auditAllDecisions: true
      },
      permissions: {
        defaultDenyMode: true,
        inheritanceEnabled: true
      },
      security: {
        requireMfaForHighRisk: true,
        sessionValidation: true
      }
    });
  }
  return authorizationServiceInstance;
}

/**
 * Epic 17 Authorization Hook
 */
export const useEpic17Authorization = (
  options: UseEpic17AuthorizationOptions = {}
): AuthorizationHookResult => {
  const { user, isAuthenticated } = useAuthStore();
  const authService = getAuthorizationService();

  // State
  const [userPermissions, setUserPermissions] = useState<Permission[]>([]);
  const [lastAuthorizationResult, setLastAuthorizationResult] = useState<AuthorizationResult | null>(null);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [authorizationError, setAuthorizationError] = useState<string | null>(null);

  // Convert auth store user to authorization user context
  const userContext: UserContext | null = useMemo(() => {
    if (!user || !isAuthenticated) return null;
    
    return {
      id: user.id || user.email, // Fallback to email as ID
      email: user.email,
      roles: user.roles || [],
      groups: user.groups || [],
      permissions: userPermissions,
      attributes: {
        firstName: user.firstName,
        lastName: user.lastName,
        department: user.department,
        organization: user.organization,
        ...user.customAttributes
      },
      sessionId: user.sessionId,
      lastLogin: user.lastLogin ? new Date(user.lastLogin) : undefined
    };
  }, [user, isAuthenticated, userPermissions]);

  // Get user roles from the user object
  const userRoles = useMemo(() => {
    return user?.roles || [];
  }, [user]);

  // Load user permissions on authentication or role changes
  useEffect(() => {
    const loadUserPermissions = async () => {
      if (!userContext) {
        setUserPermissions([]);
        return;
      }

      try {
        const permissions = await authService.getUserPermissions(userContext.id);
        setUserPermissions(permissions);
      } catch (error) {
        console.error('Failed to load user permissions:', error);
        setUserPermissions([]);
      }
    };

    loadUserPermissions();
  }, [authService, userContext?.id, userContext?.roles]);

  // Permission checking function
  const hasPermission = useCallback(async (
    resource: ResourceType, 
    action: string, 
    resourceId?: string
  ): Promise<boolean> => {
    if (!userContext) return false;

    setIsAuthorizing(true);
    setAuthorizationError(null);

    try {
      const result = await authService.hasPermission(userContext, resource, action, resourceId);
      return result;
    } catch (error) {
      setAuthorizationError(error instanceof Error ? error.message : 'Authorization check failed');
      return false;
    } finally {
      setIsAuthorizing(false);
    }
  }, [authService, userContext]);

  // Section access checking
  const canAccess = useCallback((section: string): boolean => {
    if (!userContext) return false;

    const sectionConfig = EPIC17_ADMIN_SECTIONS.find(s => s.id === section);
    if (!sectionConfig) return false;

    // Check if user has any of the required permissions for this section
    return sectionConfig.requiredPermissions.some(reqPerm =>
      reqPerm.actions.some(action =>
        userPermissions.some(userPerm =>
          (userPerm.resource === reqPerm.resource || userPerm.resource === '*') &&
          (userPerm.actions.includes(action) || userPerm.actions.includes('*'))
        )
      )
    );
  }, [userContext, userPermissions]);

  // Generic action permission checking
  const canPerformAction = useCallback(async (
    action: string, 
    context?: Partial<AuthorizationContext>
  ): Promise<boolean> => {
    if (!userContext) return false;

    setIsAuthorizing(true);
    setAuthorizationError(null);

    try {
      const authContext: AuthorizationContext = {
        user: userContext,
        action,
        environment: {
          environment: 'production', // Default
          region: process.env.REACT_APP_REGION || 'us-west-2',
          version: process.env.REACT_APP_VERSION || '1.0.0',
          featureFlags: {}
        },
        ...context
      };

      const result = await authService.authorize(authContext);
      setLastAuthorizationResult(result);
      return result.granted;
    } catch (error) {
      setAuthorizationError(error instanceof Error ? error.message : 'Authorization check failed');
      return false;
    } finally {
      setIsAuthorizing(false);
    }
  }, [authService, userContext]);

  // Bulk permission checking
  const checkMultiplePermissions = useCallback(async (
    checks: PermissionCheck[]
  ): Promise<Map<string, boolean>> => {
    if (!userContext) {
      return new Map(checks.map(check => [check.id, false]));
    }

    const results = new Map<string, boolean>();
    
    const authPromises = checks.map(async (check) => {
      try {
        const context: AuthorizationContext = {
          user: userContext,
          resource: check.resourceId ? {
            type: check.resource,
            id: check.resourceId,
            attributes: {},
            tags: []
          } : undefined,
          action: check.action,
          environment: {
            environment: 'production',
            region: 'us-west-2',
            version: '1.0.0',
            featureFlags: {}
          },
          ...check.context
        };

        const result = await authService.authorize(context);
        results.set(check.id, result.granted);
      } catch (error) {
        results.set(check.id, false);
      }
    });

    await Promise.all(authPromises);
    return results;
  }, [authService, userContext]);

  // Get available admin sections for current user
  const availableSections = useMemo(() => {
    if (!userContext) return [];

    return EPIC17_ADMIN_SECTIONS.filter(section => canAccess(section.id));
  }, [userContext, canAccess]);

  // Refresh permissions
  const refreshPermissions = useCallback(async (): Promise<void> => {
    if (!userContext) return;

    try {
      const permissions = await authService.getUserPermissions(userContext.id);
      setUserPermissions(permissions);
      setAuthorizationError(null);
    } catch (error) {
      setAuthorizationError(error instanceof Error ? error.message : 'Failed to refresh permissions');
    }
  }, [authService, userContext]);

  // Clear authorization cache
  const clearCache = useCallback((): void => {
    // Reset local state
    setLastAuthorizationResult(null);
    setAuthorizationError(null);
    
    // This would clear the service cache if exposed
    // authService.clearCache();
  }, []);

  return {
    // Permission checking
    hasPermission,
    canAccess,
    canPerformAction,
    
    // Bulk operations
    checkMultiplePermissions,
    
    // User data
    userRoles,
    userPermissions,
    availableSections,
    
    // Authorization results
    lastAuthorizationResult,
    isAuthorizing,
    authorizationError,
    
    // Management functions
    refreshPermissions,
    clearCache
  };
};

/**
 * Higher-order component for protecting routes with Epic 17 authorization
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredResource: ResourceType;
  requiredAction: string;
  resourceId?: string;
  fallback?: React.ReactNode;
}

export const Epic17ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredResource,
  requiredAction,
  resourceId,
  fallback = React.createElement('div', null, 'Access Denied')
}) => {
  const { hasPermission, isAuthorizing } = useEpic17Authorization();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      const access = await hasPermission(requiredResource, requiredAction, resourceId);
      setHasAccess(access);
    };

    checkAccess();
  }, [hasPermission, requiredResource, requiredAction, resourceId]);

  if (isAuthorizing || hasAccess === null) {
    return React.createElement('div', 
      { className: 'flex items-center justify-center p-8' },
      React.createElement('div', 
        { className: 'animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600' }
      ),
      React.createElement('span', 
        { className: 'ml-2 text-gray-600' },
        'Checking permissions...'
      )
    );
  }

  return hasAccess 
    ? React.createElement(React.Fragment, null, children) 
    : React.createElement(React.Fragment, null, fallback);
};

export default useEpic17Authorization;