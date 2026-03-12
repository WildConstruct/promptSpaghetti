/**
 * Feature gating hook for controlling access to features based on auth state and feature flags
 */

import { useMemo, ReactNode } from 'react';
import { useAuth } from '../providers/AuthUserProvider';
import { getRuntimeFeatureFlags } from '../utils/runtimeMode';

/**
 * Feature gate configuration
 */
interface FeatureGateConfig {
  requireAuth?: boolean;
  requireSupabase?: boolean;
  featureFlag?: string;
  fallback?: ReactNode;
}

/**
 * Feature flag configuration from environment
 */
export interface FeatureConfig {
  auth: {
    enabled: boolean;
    required: boolean;
    optional: boolean;
  };
  supabase: {
    enabled: boolean;
  };
  [key: string]: any;
}

/**
 * Get feature configuration from environment variables
 */
export function getFeatureConfig(): FeatureConfig {
  const flags = getRuntimeFeatureFlags();

  return {
    auth: {
      enabled: flags.authEnabled,
      required: flags.authRequired,
      optional: !flags.authRequired
    },
    supabase: {
      enabled: flags.supabaseEnabled
    }
  };
}

/**
 * Hook for feature flags
 */
export function useFeatureFlags(): FeatureConfig {
  return useMemo(() => getFeatureConfig(), []);
}

/**
 * Gate component for conditional rendering
 */
interface GateProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Feature gating hook
 */
export function useFeatureGate(config: FeatureGateConfig = {}) {
  const { isAuthenticated } = useAuth();
  const flags = useFeatureFlags();
  
  const isEnabled = useMemo(() => {
    // Check custom feature flag
    if (config.featureFlag && !flags[config.featureFlag]) {
      return false;
    }
    
    // Check auth requirement
    if (config.requireAuth && !isAuthenticated) {
      return false;
    }
    
    // Check Supabase requirement
    if (config.requireSupabase && !flags.supabase.enabled) {
      return false;
    }
    
    // Check if auth is disabled globally
    if (config.requireAuth && !flags.auth.enabled) {
      return false;
    }
    
    return true;
  }, [config, isAuthenticated, flags]);
  
  // Gate component for conditional rendering
  const Gate = ({ children, fallback }: GateProps) => {
    const finalFallback = fallback ?? config.fallback;
    return isEnabled ? children : finalFallback ?? null;
  };
  
  return {
    isEnabled,
    Gate,
    flags,
    isAuthenticated
  };
}

/**
 * Feature availability matrix
 */
export const FEATURE_MATRIX = {
  // Core features - always available
  core: {
    createEditGraphs: { requireAuth: false },
    localSaveLoad: { requireAuth: false },
    exportImport: { requireAuth: false },
    browserPersistence: { requireAuth: false }
  },
  
  // Premium features - require authentication
  premium: {
    cloudSaveLoad: { requireAuth: true, requireSupabase: true },
    crossDeviceSync: { requireAuth: true, requireSupabase: true },
    sharingCollaboration: { requireAuth: true, requireSupabase: true },
    versionHistory: { requireAuth: true, requireSupabase: true }
  }
};

/**
 * Check if a specific feature is available
 */
export function useFeatureAvailability(featurePath: string): boolean {
  const parts = featurePath.split('.');
  const category = parts[0] as keyof typeof FEATURE_MATRIX;
  const feature = parts[1];
  
  if (!FEATURE_MATRIX[category] || !FEATURE_MATRIX[category][feature]) {
    console.warn(`Unknown feature: ${featurePath}`);
    return false;
  }
  
  const config = FEATURE_MATRIX[category][feature];
  const { isEnabled } = useFeatureGate(config);
  
  return isEnabled;
}

/**
 * Get list of unavailable features for current user
 */
export function useUnavailableFeatures(): string[] {
  const { isAuthenticated } = useAuth();
  const flags = useFeatureFlags();
  
  return useMemo(() => {
    const unavailable: string[] = [];
    
    // Check premium features
    Object.entries(FEATURE_MATRIX.premium).forEach(([key, config]) => {
      if (config.requireAuth && !isAuthenticated) {
        unavailable.push(key);
      } else if (config.requireSupabase && !flags.supabase.enabled) {
        unavailable.push(key);
      }
    });
    
    return unavailable;
  }, [isAuthenticated, flags]);
}
