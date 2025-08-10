/**
 * Feature gating hook for controlling access to features based on auth state and feature flags
 */

import { useMemo, ReactNode } from 'react';
import { useAuth } from '../providers/AuthUserProvider';

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
  const isClient = typeof window !== 'undefined';
  
  // Support both Next.js and Vite environments
  const getEnvVar = (key: string): string => {
    if (isClient) {
      // Client-side: check window object for Vite
      if (typeof (window as any).import !== 'undefined' && (window as any).import.meta?.env) {
        return (window as any).import.meta.env[key] || '';
      }
    }
    // Server-side or Next.js
    return process.env[key] || '';
  };
  
  return {
    auth: {
      enabled: getEnvVar('NEXT_PUBLIC_FEATURE_AUTH') === 'true' || 
               getEnvVar('VITE_FEATURE_AUTH') === 'true',
      required: getEnvVar('NEXT_PUBLIC_REQUIRE_AUTH') === 'true' || 
                getEnvVar('VITE_REQUIRE_AUTH') === 'true',
      optional: getEnvVar('NEXT_PUBLIC_AUTH_OPTIONAL') !== 'false' && 
                getEnvVar('VITE_AUTH_OPTIONAL') !== 'false'
    },
    supabase: {
      enabled: getEnvVar('NEXT_PUBLIC_FEATURE_SUPABASE') === 'true' || 
               getEnvVar('VITE_FEATURE_SUPABASE') === 'true'
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
    return isEnabled ? <>{children}</> : <>{finalFallback}</>;
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