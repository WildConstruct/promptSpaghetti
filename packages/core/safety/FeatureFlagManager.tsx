/**
 * Epic 1 Feature Flag Manager
 * React components and hooks for feature flag management
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { featureFlags } from './SafetyFramework';

export interface FeatureFlagConfig {
  key: string;
  name: string;
  description: string;
  defaultValue: boolean;
  rolloutPercentage?: number;
  tags: string[];
  dependencies?: string[];
  emergencyKillSwitch?: boolean;
}

// Epic 1 Feature Flags Configuration
export const EPIC1_FEATURE_FLAGS: Record<string, FeatureFlagConfig> = {
  'epic1-inline-editing': {
    key: 'epic1-inline-editing',
    name: 'Inline Node Editing',
    description: 'Enable direct editing of nodes on the canvas without side panel',
    defaultValue: false,
    rolloutPercentage: 0,
    tags: ['epic1', 'editor', 'ux'],
    emergencyKillSwitch: true,
  },
  'epic1-new-engine': {
    key: 'epic1-new-engine',
    name: 'New Execution Engine',
    description: 'Use the rebuilt deterministic execution engine',
    defaultValue: false,
    rolloutPercentage: 0,
    tags: ['epic1', 'engine', 'core'],
    dependencies: ['epic1-inline-editing'],
    emergencyKillSwitch: true,
  },
  'epic1-preview-system': {
    key: 'epic1-preview-system',
    name: 'Real-time Preview',
    description: 'Enable live preview updates as users edit nodes',
    defaultValue: false,
    rolloutPercentage: 0,
    tags: ['epic1', 'preview', 'performance'],
    dependencies: ['epic1-new-engine'],
    emergencyKillSwitch: true,
  },
  'epic1-asset-library': {
    key: 'epic1-asset-library',
    name: 'Asset Library',
    description: 'Enable drag-and-drop preset system',
    defaultValue: false,
    rolloutPercentage: 0,
    tags: ['epic1', 'assets', 'ux'],
    emergencyKillSwitch: false,
  },
  'epic1-medieval-demo': {
    key: 'epic1-medieval-demo',
    name: 'Medieval Demo',
    description: 'Show medieval merchant demo in onboarding',
    defaultValue: false,
    rolloutPercentage: 0,
    tags: ['epic1', 'demo', 'onboarding'],
    emergencyKillSwitch: false,
  },
};

// Feature Flag Context
interface FeatureFlagContextValue {
  flags: Record<string, boolean>;
  isEnabled: (flagKey: string) => boolean;
  setFlag: (flagKey: string, enabled: boolean) => void;
  killSwitch: (flagKey: string) => void;
  checkDependencies: (flagKey: string) => { satisfied: boolean; missing: string[] };
}

const FeatureFlagContext = createContext<FeatureFlagContextValue | null>(null);

/**
 * Feature Flag Provider Component
 */
export const FeatureFlagProvider: React.FC<{ children: React.ReactNode; userId?: string }> = ({
  children,
  userId,
}) => {
  const [flags, setFlags] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Initialize flags from configuration
    const initialFlags: Record<string, boolean> = {};
    
    Object.values(EPIC1_FEATURE_FLAGS).forEach(config => {
      initialFlags[config.key] = featureFlags.isEnabled(config.key, userId);
    });
    
    setFlags(initialFlags);
  }, [userId]);

  const isEnabled = (flagKey: string): boolean => {
    return flags[flagKey] || false;
  };

  const setFlag = (flagKey: string, enabled: boolean) => {
    // Check dependencies before enabling
    if (enabled) {
      const config = EPIC1_FEATURE_FLAGS[flagKey];
      if (config?.dependencies) {
        const allDependenciesSatisfied = config.dependencies.every(dep => flags[dep]);
        if (!allDependenciesSatisfied) {
          console.warn(`Cannot enable ${flagKey}: dependencies not satisfied`);
          return;
        }
      }
    }

    featureFlags.setFlag(flagKey, enabled);
    setFlags(prev => ({ ...prev, [flagKey]: enabled }));

    // If disabling, also disable dependent features
    if (!enabled) {
      Object.values(EPIC1_FEATURE_FLAGS).forEach(config => {
        if (config.dependencies?.includes(flagKey) && flags[config.key]) {
          setFlag(config.key, false);
        }
      });
    }
  };

  const killSwitch = (flagKey: string) => {
    const config = EPIC1_FEATURE_FLAGS[flagKey];
    if (config?.emergencyKillSwitch) {
      console.error(`EMERGENCY KILL SWITCH ACTIVATED: ${flagKey}`);
      setFlag(flagKey, false);
      
      // Log to monitoring
      if (window.monitoring) {
        window.monitoring.recordMetric('feature_flag.kill_switch', 1, {
          flag: flagKey,
        });
      }
    }
  };

  const checkDependencies = (flagKey: string): { satisfied: boolean; missing: string[] } => {
    const config = EPIC1_FEATURE_FLAGS[flagKey];
    if (!config?.dependencies) {
      return { satisfied: true, missing: [] };
    }

    const missing = config.dependencies.filter(dep => !flags[dep]);
    return {
      satisfied: missing.length === 0,
      missing,
    };
  };

  return (
    <FeatureFlagContext.Provider
      value={{
        flags,
        isEnabled,
        setFlag,
        killSwitch,
        checkDependencies,
      }}
    >
      {children}
    </FeatureFlagContext.Provider>
  );
};

/**
 * Hook to use feature flags
 */
export const useFeatureFlag = (flagKey: string): boolean => {
  const context = useContext(FeatureFlagContext);
  if (!context) {
    throw new Error('useFeatureFlag must be used within FeatureFlagProvider');
  }
  return context.isEnabled(flagKey);
};

/**
 * Hook to get all feature flag functions
 */
export const useFeatureFlags = () => {
  const context = useContext(FeatureFlagContext);
  if (!context) {
    throw new Error('useFeatureFlags must be used within FeatureFlagProvider');
  }
  return context;
};

/**
 * Feature flag wrapper component
 */
export const FeatureFlag: React.FC<{
  flag: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ flag, children, fallback = null }) => {
  const isEnabled = useFeatureFlag(flag);
  return <>{isEnabled ? children : fallback}</>;
};

/**
 * Feature flag admin panel component
 */
export const FeatureFlagAdminPanel: React.FC = () => {
  const { flags, setFlag, checkDependencies } = useFeatureFlags();

  return (
    <div className="feature-flag-admin-panel">
      <h2>Feature Flags - Epic 1</h2>
      
      {Object.values(EPIC1_FEATURE_FLAGS).map(config => {
        const isEnabled = flags[config.key];
        const { satisfied, missing } = checkDependencies(config.key);
        
        return (
          <div key={config.key} className="feature-flag-item">
            <div className="flag-header">
              <h3>{config.name}</h3>
              {config.emergencyKillSwitch && (
                <span className="kill-switch-badge">⚠️ Kill Switch</span>
              )}
            </div>
            
            <p className="flag-description">{config.description}</p>
            
            <div className="flag-metadata">
              <span className="flag-key">Key: {config.key}</span>
              <span className="flag-tags">Tags: {config.tags.join(', ')}</span>
            </div>
            
            {!satisfied && (
              <div className="flag-warning">
                ⚠️ Dependencies required: {missing.join(', ')}
              </div>
            )}
            
            <div className="flag-controls">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={(e) => setFlag(config.key, e.target.checked)}
                  disabled={!satisfied && !isEnabled}
                />
                <span className="toggle-slider"></span>
              </label>
              
              {config.rolloutPercentage !== undefined && (
                <div className="rollout-control">
                  <label>Rollout %: </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={config.rolloutPercentage}
                    onChange={(e) => {
                      featureFlags.setFlag(
                        config.key,
                        isEnabled,
                        parseInt(e.target.value)
                      );
                    }}
                  />
                  <span>{config.rolloutPercentage}%</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
      
      <style jsx>{`
        .feature-flag-admin-panel {
          padding: 20px;
          background: #f5f5f5;
          border-radius: 8px;
        }
        
        .feature-flag-item {
          background: white;
          padding: 15px;
          margin: 10px 0;
          border-radius: 6px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .flag-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        
        .flag-header h3 {
          margin: 0;
        }
        
        .kill-switch-badge {
          background: #ff4444;
          color: white;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
        }
        
        .flag-description {
          color: #666;
          margin: 5px 0;
        }
        
        .flag-metadata {
          display: flex;
          gap: 20px;
          font-size: 12px;
          color: #999;
          margin: 10px 0;
        }
        
        .flag-warning {
          background: #fff3cd;
          color: #856404;
          padding: 8px;
          border-radius: 4px;
          margin: 10px 0;
        }
        
        .flag-controls {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-top: 15px;
        }
        
        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 24px;
        }
        
        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        
        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: .4s;
          border-radius: 24px;
        }
        
        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }
        
        input:checked + .toggle-slider {
          background-color: #2196F3;
        }
        
        input:checked + .toggle-slider:before {
          transform: translateX(26px);
        }
        
        .rollout-control {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .rollout-control input[type="range"] {
          width: 150px;
        }
      `}</style>
    </div>
  );
};