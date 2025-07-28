/**
 * useConsentAwareToggle Hook
 * 
 * React hook for evaluating feature toggles with consent awareness
 * Automatically updates when consent status changes
 * 
 * Part of Epic 19 - Data Protection & Privacy Controls (substory 19.2.5)
 */
import { useState, useEffect, useCallback } from 'react';
import { useConsent } from './useConsent';
interface ToggleResult {
  enabled: boolean;
  value: unknown;
  reason: string;
  variantKey?: string;
  ruleMatched?: string;
  metadata?: {
    consentChecked?: boolean;
    consentRequired?: boolean;
    consentGranted?: boolean;
    requiredConsents?: string[];
    fallbackBehavior?: string;
    [key: string]: unknown;
  };
}
interface UseConsentAwareToggleOptions {
  userId?: string;
  orgId?: string;
  includeConsentData?: boolean;
  autoRefreshOnConsentChange?: boolean;
  fallbackEnabled?: boolean;
  context?: Record<string, unknown>;
}
interface UseConsentAwareToggleReturn {
  result: ToggleResult | null;
  isLoading: boolean;
  error: string | null;
  consentInfo?: {
    isConsentRequired: boolean;
    requiredConsents: string[];
    consentChecked: boolean;
    consentGranted: boolean;
  };
  refresh: () => Promise<void>;
  isFeatureAvailable: () => boolean;
}
interface BatchToggleResult {
  [key: string]: ToggleResult;
}
interface UseBatchConsentAwareToggleReturn {
  results: BatchToggleResult;
  isLoading: boolean;
  error: string | null;
  consentInfo?: Record<string, {
    isConsentRequired: boolean;
    requiredConsents: string[];
    consentChecked: boolean;
    consentGranted: boolean;
  }>;
  refresh: () => Promise<void>;
  getToggle: (key: string) => ToggleResult | null;
}
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
/**
 * Hook for single consent-aware feature toggle
 */
export function useConsentAwareToggle()
  toggleKey: string,
  options: UseConsentAwareToggleOptions = {}
): UseConsentAwareToggleReturn {
  const [result, setResult] = useState<ToggleResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consentInfo, setConsentInfo] = useState<unknown>(null);
  const { preferences, hasConsent } = useConsent();
  const {
    userId,
    orgId,
    includeConsentData = true,
    autoRefreshOnConsentChange = true,
    fallbackEnabled = false,
    context = {}
  } = options;
  const evaluateToggle = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (userId) queryParams.set('userId', userId);
      if (orgId) queryParams.set('orgId', orgId);
      if (preferences?.sessionId) queryParams.set('sessionId', preferences.sessionId);
      if (includeConsentData) queryParams.set('includeConsentData', 'true');
      const url = `${API_BASE_URL}/consent-toggles/${toggleKey}?${queryParams.toString()}`;}
      const response = await fetch(url, {)
        method: 'GET',
        headers: {,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);}
      }
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to evaluate toggle');
      }
      setResult(data.result);
      if (data.consentInfo) {
        setConsentInfo(data.consentInfo);
      }
    } catch (err) {
      console.error(`Failed to evaluate toggle ${toggleKey}:`, err);}
      setError(err instanceof Error ? err.message : 'Unknown error');
      // Fallback behavior
      if (fallbackEnabled) {
        setResult({)
          enabled: fallbackEnabled,
          value: fallbackEnabled,
          reason: 'Fallback due to evaluation error',
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [toggleKey, userId, orgId, preferences?.sessionId, includeConsentData, fallbackEnabled]);
  // Initial evaluation
  useEffect(() => {
    evaluateToggle();
  }, [evaluateToggle]);
  // Re-evaluate when consent changes
  useEffect(() => {
    if (autoRefreshOnConsentChange && preferences) {
      evaluateToggle();
    }
  }, [preferences, autoRefreshOnConsentChange, evaluateToggle]);
  const isFeatureAvailable = useCallback(() => {
    if (!result) return false;
    return result.enabled;
  }, [result]);
  return {
    result,
    isLoading,
    error,
    consentInfo,
    refresh: evaluateToggle,
    isFeatureAvailable
  };
}
/**
 * Hook for batch consent-aware feature toggle evaluation
 */
export function useBatchConsentAwareToggle()
  toggleKeys: string[],
  options: UseConsentAwareToggleOptions = {}
): UseBatchConsentAwareToggleReturn {
  const [results, setResults] = useState<BatchToggleResult>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consentInfo, setConsentInfo] = useState<unknown>(null);
  const { preferences } = useConsent();
  const {
    userId,
    orgId,
    includeConsentData = true,
    autoRefreshOnConsentChange = true,
    fallbackEnabled = false,
    context = {}
  } = options;
  const evaluateToggles = useCallback(async () => {
    if (toggleKeys.length === 0) return;
    setIsLoading(true);
    setError(null);
    try {
      const requestBody = {
        keys: toggleKeys,
        context: {,
          userId,
          orgId,
          sessionId: preferences?.sessionId,
          ...context
        },
        includeConsentData
      };
      const response = await fetch(`${API_BASE_URL}/consent-toggles/batch`, {)}
        method: 'POST',
        headers: {,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);}
      }
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to evaluate toggles');
      }
      setResults(data.results);
      if (data.consentInfo) {
        setConsentInfo(data.consentInfo);
      }
    } catch (err) {
      console.error('Failed to evaluate batch toggles:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      // Fallback behavior
      if (fallbackEnabled) {
        const fallbackResults: BatchToggleResult = {};
        for (const key of toggleKeys) {
          fallbackResults[key] = {
            enabled: fallbackEnabled,
            value: fallbackEnabled,
            reason: 'Fallback due to evaluation error',
          };
        }
        setResults(fallbackResults);
      }
    } finally {
      setIsLoading(false);
    }
  }, [toggleKeys, userId, orgId, preferences?.sessionId, includeConsentData, fallbackEnabled, context]);
  // Initial evaluation
  useEffect(() => {
    evaluateToggles();
  }, [evaluateToggles]);
  // Re-evaluate when consent changes
  useEffect(() => {
    if (autoRefreshOnConsentChange && preferences) {
      evaluateToggles();
    }
  }, [preferences, autoRefreshOnConsentChange, evaluateToggles]);
  const getToggle = useCallback((key: string): ToggleResult | null => {
    return results[key] || null;
  }, [results]);
  return {
    results,
    isLoading,
    error,
    consentInfo,
    refresh: evaluateToggles,
    getToggle
  };
}
/**
 * Helper component for conditional rendering based on consent-aware toggles
 */
interface ConsentAwareFeatureProps {
  toggleKey: string;
  options?: UseConsentAwareToggleOptions;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onConsentRequired?: (requiredConsents: string[]) => void;
}

export function ConsentAwareFeature({)
  toggleKey,
  options = {},
  children,
  fallback = null,
  onConsentRequired
}: ConsentAwareFeatureProps): React.ReactElement | null {
  const { result, isLoading, consentInfo } = useConsentAwareToggle(toggleKey, options);
  // Notify parent about consent requirements
  useEffect(() => {
    if (onConsentRequired && consentInfo?.isConsentRequired && !consentInfo.consentGranted) {
      onConsentRequired(consentInfo.requiredConsents);
    }
  }, [onConsentRequired, consentInfo]);
  if (isLoading) {
    return null; // or a loading indicator
  }
  if (!result?.enabled) {
    return fallback as React.ReactElement | null;
  }
  return children as React.ReactElement;
}
/**
 * Higher-order component for wrapping components with consent-aware toggle logic
 */
export function withConsentAwareToggle<T extends object>()
  Component: React.ComponentType<T>,
  toggleKey: string,
  options: UseConsentAwareToggleOptions = {}
  return function ConsentAwareComponent(props: T) {
    const { result, isLoading, consentInfo } = useConsentAwareToggle(toggleKey, options);
    if (isLoading) {
      return null; // or a loading indicator
    }
    if (!result?.enabled) {
      return null; // Feature is disabled
    }
    return <Component {...props} />;
  };
}

export default useConsentAwareToggle;