// useDataAccess Hook - Epic 19.4
// Custom React hook for managing data access operations

import { useState, useCallback } from 'react';

interface DataAccessGrant {
  id: string;
  resourceId: string;
  resourceType: string;
  operations: string[];
  classification: string;
  grantedBy: string;
  grantedAt: Date;
  expiresAt: Date;
  reason: string;
  restrictions: AccessRestriction[];
}

interface AccessRestriction {
  type: string;
  value: string;
  description: string;
}

interface AccessHistoryEvent {
  id: string;
  userId: string;
  resourceId: string;
  operation: string;
  allowed: boolean;
  reason: string;
  classification: string;
  accessLevel: string;
  timestamp: Date;
  riskScore: number;
}

interface AccessRequest {
  resourceId: string;
  resourceType: string;
  operation: string;
  reason: string;
  expiresAt?: Date;
}

interface AccessPermissions {
  allowed: boolean;
  reason: string;
  classification: string;
  accessLevel: string;
  requiredPermissions: string[];
  actualPermissions: string[];
  restrictions: AccessRestriction[];
  auditId: string;
}

interface UseDataAccessOptions {
  apiBaseUrl?: string;
  authToken?: string;
}

interface UseDataAccessResult {
  // State
  grants: DataAccessGrant[];
  history: AccessHistoryEvent[];
  loading: boolean;
  error: string | null;
  
  // Actions
  loadGrants: (userId: string) => Promise<void>;
  loadHistory: (userId: string, filters?: HistoryFilters) => Promise<void>;
  requestAccess: (request: AccessRequest) => Promise<{ requestId: string; status: string; message: string }>;
  checkAccess: (resourceId: string, resourceType: string, operation: string) => Promise<AccessPermissions | null>;
  revokeAccess: (grantId: string, reason: string) => Promise<boolean>;
  clearError: () => void;
}

interface HistoryFilters {
  operation?: string;
  allowed?: boolean;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export const useDataAccess = (options: UseDataAccessOptions = {}): UseDataAccessResult => {
  const { apiBaseUrl = '/api', authToken } = options;

  // State
  const [grants, setGrants] = useState<DataAccessGrant[]>([]);
  const [history, setHistory] = useState<AccessHistoryEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper function for API requests
  const apiRequest = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    const token = authToken || localStorage.getItem('authToken');
    
    const response = await fetch(`${apiBaseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    return response.json();
  }, [apiBaseUrl, authToken]);

  // Load user's current access grants
  const loadGrants = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiRequest(`/data-access/grants/${userId}`);
      
      // Parse dates
      const grantsWithDates = response.grants.map((grant: any) => ({
        ...grant,
        grantedAt: new Date(grant.grantedAt),
        expiresAt: new Date(grant.expiresAt)
      }));
      
      setGrants(grantsWithDates);
    } catch (err: any) {
      setError(`Failed to load access grants: ${err.message}`);
      setGrants([]);
    } finally {
      setLoading(false);
    }
  }, [apiRequest]);

  // Load user's access history
  const loadHistory = useCallback(async (userId: string, filters: HistoryFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams({
        limit: String(filters.limit || 50),
        offset: String(filters.offset || 0),
        ...(filters.operation && { operation: filters.operation }),
        ...(filters.allowed !== undefined && { allowed: String(filters.allowed) }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate })
      });

      const response = await apiRequest(`/data-access/audit/${userId}?${queryParams}`);
      
      // Parse dates
      const historyWithDates = response.data.map((event: any) => ({
        ...event,
        timestamp: new Date(event.timestamp)
      }));
      
      setHistory(historyWithDates);
    } catch (err: any) {
      setError(`Failed to load access history: ${err.message}`);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, [apiRequest]);

  // Request new access
  const requestAccess = useCallback(async (request: AccessRequest) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiRequest('/data-access/request', {
        method: 'POST',
        body: JSON.stringify(request)
      });
      
      return response;
    } catch (err: any) {
      setError(`Failed to submit access request: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiRequest]);

  // Check specific resource access
  const checkAccess = useCallback(async (
    resourceId: string, 
    resourceType: string, 
    operation: string
  ): Promise<AccessPermissions | null> => {
    try {
      const response = await apiRequest(
        `/data-access/permissions/${resourceId}?resourceType=${resourceType}&operation=${operation}`
      );
      return response;
    } catch (err: any) {
      console.error('Failed to check resource access:', err);
      return null;
    }
  }, [apiRequest]);

  // Revoke access grant (admin function)
  const revokeAccess = useCallback(async (grantId: string, reason: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiRequest('/data-access/revoke', {
        method: 'POST',
        body: JSON.stringify({ grantId, reason })
      });
      
      return response.success;
    } catch (err: any) {
      setError(`Failed to revoke access: ${err.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  }, [apiRequest]);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    grants,
    history,
    loading,
    error,
    
    // Actions
    loadGrants,
    loadHistory,
    requestAccess,
    checkAccess,
    revokeAccess,
    clearError
  };
};

export default useDataAccess;