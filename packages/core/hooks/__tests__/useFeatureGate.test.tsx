/**
 * Tests for feature gating hooks and components
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import { 
  useFeatureGate, 
  useFeatureFlags, 
  getFeatureConfig,
  useFeatureAvailability,
  useUnavailableFeatures,
  FEATURE_MATRIX
} from '../useFeatureGate';
import { AuthUserProvider } from '../../providers/AuthUserProvider';

// Mock AuthUserProvider
jest.mock('../../providers/AuthUserProvider', () => ({
  AuthUserProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAuth: jest.fn(() => ({
    isAuthenticated: false,
    user: null,
    loading: false,
    error: null
  }))
}));

// Mock environment variables
const mockEnv = (vars: Record<string, string>) => {
  Object.keys(vars).forEach(key => {
    process.env[key] = vars[key];
  });
};

// Clear environment variables
const clearEnv = () => {
  Object.keys(process.env).forEach(key => {
    if (key.startsWith('NEXT_PUBLIC_') || key.startsWith('VITE_')) {
      delete process.env[key];
    }
  });
};

describe('getFeatureConfig', () => {
  beforeEach(() => {
    clearEnv();
  });
  
  it('should return default config when no env vars set', () => {
    const config = getFeatureConfig();
    
    expect(config.auth.enabled).toBe(false);
    expect(config.auth.required).toBe(false);
    expect(config.auth.optional).toBe(true);
    expect(config.supabase.enabled).toBe(false);
  });
  
  it('should read Next.js environment variables', () => {
    mockEnv({
      NEXT_PUBLIC_FEATURE_AUTH: 'true',
      NEXT_PUBLIC_REQUIRE_AUTH: 'true',
      NEXT_PUBLIC_AUTH_OPTIONAL: 'false',
      NEXT_PUBLIC_FEATURE_SUPABASE: 'true'
    });
    
    const config = getFeatureConfig();
    
    expect(config.auth.enabled).toBe(true);
    expect(config.auth.required).toBe(true);
    expect(config.auth.optional).toBe(false);
    expect(config.supabase.enabled).toBe(true);
  });
  
  it('should read Vite environment variables', () => {
    mockEnv({
      VITE_FEATURE_AUTH: 'true',
      VITE_REQUIRE_AUTH: 'false',
      VITE_AUTH_OPTIONAL: 'true',
      VITE_FEATURE_SUPABASE: 'true'
    });
    
    const config = getFeatureConfig();
    
    expect(config.auth.enabled).toBe(true);
    expect(config.auth.required).toBe(false);
    expect(config.auth.optional).toBe(true);
    expect(config.supabase.enabled).toBe(true);
  });
});

describe('useFeatureFlags', () => {
  beforeEach(() => {
    clearEnv();
  });
  
  it('should return feature configuration', () => {
    mockEnv({
      NEXT_PUBLIC_FEATURE_AUTH: 'true',
      NEXT_PUBLIC_FEATURE_SUPABASE: 'true'
    });
    
    const { result } = renderHook(() => useFeatureFlags());
    
    expect(result.current.auth.enabled).toBe(true);
    expect(result.current.supabase.enabled).toBe(true);
  });
  
  it('should memoize configuration', () => {
    const { result, rerender } = renderHook(() => useFeatureFlags());
    
    const config1 = result.current;
    rerender();
    const config2 = result.current;
    
    expect(config1).toBe(config2);
  });
});

describe('useFeatureGate', () => {
  beforeEach(() => {
    clearEnv();
    jest.clearAllMocks();
  });
  
  it('should enable feature when no requirements', () => {
    const { result } = renderHook(() => useFeatureGate());
    
    expect(result.current.isEnabled).toBe(true);
  });
  
  it('should disable feature when auth required but not authenticated', () => {
    mockEnv({ NEXT_PUBLIC_FEATURE_AUTH: 'true' });
    
    const { result } = renderHook(() => 
      useFeatureGate({ requireAuth: true })
    );
    
    expect(result.current.isEnabled).toBe(false);
  });
  
  it('should enable feature when auth required and authenticated', () => {
    mockEnv({ NEXT_PUBLIC_FEATURE_AUTH: 'true' });
    
    // Mock authenticated state
    const mockUseAuth = require('../../providers/AuthUserProvider').useAuth;
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: 'user-123' }
    });
    
    const { result } = renderHook(() => 
      useFeatureGate({ requireAuth: true })
    );
    
    expect(result.current.isEnabled).toBe(true);
  });
  
  it('should disable feature when Supabase required but not enabled', () => {
    const { result } = renderHook(() => 
      useFeatureGate({ requireSupabase: true })
    );
    
    expect(result.current.isEnabled).toBe(false);
  });
  
  it('should enable feature when Supabase required and enabled', () => {
    mockEnv({ NEXT_PUBLIC_FEATURE_SUPABASE: 'true' });
    
    const { result } = renderHook(() => 
      useFeatureGate({ requireSupabase: true })
    );
    
    expect(result.current.isEnabled).toBe(true);
  });
  
  it('should respect custom feature flags', () => {
    // Custom flag not set
    const { result: result1 } = renderHook(() => 
      useFeatureGate({ featureFlag: 'customFeature' })
    );
    expect(result1.current.isEnabled).toBe(false);
    
    // Set custom flag in config
    mockEnv({ NEXT_PUBLIC_CUSTOM_FEATURE: 'true' });
    const { result: result2 } = renderHook(() => 
      useFeatureGate({ featureFlag: 'customFeature' })
    );
    // Note: This would need actual implementation to read custom flags
  });
});

describe('Gate component', () => {
  beforeEach(() => {
    clearEnv();
  });
  
  it('should render children when enabled', () => {
    const { result } = renderHook(() => useFeatureGate());
    const { Gate } = result.current;
    
    render(
      <Gate>
        <div>Protected Content</div>
      </Gate>
    );
    
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
  
  it('should render fallback when disabled', () => {
    const { result } = renderHook(() => 
      useFeatureGate({ 
        requireAuth: true,
        fallback: <div>Please sign in</div>
      })
    );
    const { Gate } = result.current;
    
    render(
      <Gate>
        <div>Protected Content</div>
      </Gate>
    );
    
    expect(screen.getByText('Please sign in')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
  
  it('should use prop fallback over config fallback', () => {
    const { result } = renderHook(() => 
      useFeatureGate({ 
        requireAuth: true,
        fallback: <div>Config Fallback</div>
      })
    );
    const { Gate } = result.current;
    
    render(
      <Gate fallback={<div>Prop Fallback</div>}>
        <div>Protected Content</div>
      </Gate>
    );
    
    expect(screen.getByText('Prop Fallback')).toBeInTheDocument();
    expect(screen.queryByText('Config Fallback')).not.toBeInTheDocument();
  });
});

describe('useFeatureAvailability', () => {
  beforeEach(() => {
    clearEnv();
    jest.clearAllMocks();
  });
  
  it('should check core features availability', () => {
    const { result } = renderHook(() => 
      useFeatureAvailability('core.createEditGraphs')
    );
    
    expect(result.current).toBe(true);
  });
  
  it('should check premium features availability when not authenticated', () => {
    const { result } = renderHook(() => 
      useFeatureAvailability('premium.cloudSaveLoad')
    );
    
    expect(result.current).toBe(false);
  });
  
  it('should check premium features availability when authenticated', () => {
    mockEnv({ 
      NEXT_PUBLIC_FEATURE_AUTH: 'true',
      NEXT_PUBLIC_FEATURE_SUPABASE: 'true'
    });
    
    // Mock authenticated state
    const mockUseAuth = require('../../providers/AuthUserProvider').useAuth;
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: 'user-123' }
    });
    
    const { result } = renderHook(() => 
      useFeatureAvailability('premium.cloudSaveLoad')
    );
    
    expect(result.current).toBe(true);
  });
  
  it('should warn on unknown feature', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    const { result } = renderHook(() => 
      useFeatureAvailability('unknown.feature')
    );
    
    expect(result.current).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith('Unknown feature: unknown.feature');
    
    consoleSpy.mockRestore();
  });
});

describe('useUnavailableFeatures', () => {
  beforeEach(() => {
    clearEnv();
    jest.clearAllMocks();
  });
  
  it('should list unavailable features for anonymous user', () => {
    mockEnv({ 
      NEXT_PUBLIC_FEATURE_AUTH: 'true',
      NEXT_PUBLIC_FEATURE_SUPABASE: 'true'
    });
    
    const { result } = renderHook(() => useUnavailableFeatures());
    
    expect(result.current).toContain('cloudSaveLoad');
    expect(result.current).toContain('crossDeviceSync');
    expect(result.current).toContain('sharingCollaboration');
    expect(result.current).toContain('versionHistory');
  });
  
  it('should show no unavailable features for authenticated user', () => {
    mockEnv({ 
      NEXT_PUBLIC_FEATURE_AUTH: 'true',
      NEXT_PUBLIC_FEATURE_SUPABASE: 'true'
    });
    
    // Mock authenticated state
    const mockUseAuth = require('../../providers/AuthUserProvider').useAuth;
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: 'user-123' }
    });
    
    const { result } = renderHook(() => useUnavailableFeatures());
    
    expect(result.current).toHaveLength(0);
  });
  
  it('should list Supabase features when Supabase disabled', () => {
    mockEnv({ 
      NEXT_PUBLIC_FEATURE_AUTH: 'true',
      NEXT_PUBLIC_FEATURE_SUPABASE: 'false'
    });
    
    // Mock authenticated state
    const mockUseAuth = require('../../providers/AuthUserProvider').useAuth;
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: 'user-123' }
    });
    
    const { result } = renderHook(() => useUnavailableFeatures());
    
    expect(result.current).toContain('cloudSaveLoad');
    expect(result.current).toContain('crossDeviceSync');
  });
});

describe('Feature Matrix', () => {
  it('should have correct core features configuration', () => {
    expect(FEATURE_MATRIX.core.createEditGraphs.requireAuth).toBe(false);
    expect(FEATURE_MATRIX.core.localSaveLoad.requireAuth).toBe(false);
    expect(FEATURE_MATRIX.core.exportImport.requireAuth).toBe(false);
    expect(FEATURE_MATRIX.core.browserPersistence.requireAuth).toBe(false);
  });
  
  it('should have correct premium features configuration', () => {
    expect(FEATURE_MATRIX.premium.cloudSaveLoad.requireAuth).toBe(true);
    expect(FEATURE_MATRIX.premium.cloudSaveLoad.requireSupabase).toBe(true);
    
    expect(FEATURE_MATRIX.premium.crossDeviceSync.requireAuth).toBe(true);
    expect(FEATURE_MATRIX.premium.crossDeviceSync.requireSupabase).toBe(true);
    
    expect(FEATURE_MATRIX.premium.sharingCollaboration.requireAuth).toBe(true);
    expect(FEATURE_MATRIX.premium.sharingCollaboration.requireSupabase).toBe(true);
    
    expect(FEATURE_MATRIX.premium.versionHistory.requireAuth).toBe(true);
    expect(FEATURE_MATRIX.premium.versionHistory.requireSupabase).toBe(true);
  });
});