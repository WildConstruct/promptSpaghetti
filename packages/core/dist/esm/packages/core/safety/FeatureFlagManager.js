import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Epic 1 Feature Flag Manager
 * React components and hooks for feature flag management
 */
import { createContext, useContext, useEffect, useState } from 'react';
import { featureFlags } from './SafetyFramework';
// Epic 1 Feature Flags Configuration
export const EPIC1_FEATURE_FLAGS = {
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
const FeatureFlagContext = createContext(null);
/**
 * Feature Flag Provider Component
 */
export const FeatureFlagProvider = ({ children, userId, }) => {
    const [flags, setFlags] = useState({});
    useEffect(() => {
        // Initialize flags from configuration
        const initialFlags = {};
        Object.values(EPIC1_FEATURE_FLAGS).forEach(config => {
            initialFlags[config.key] = featureFlags.isEnabled(config.key, userId);
        });
        setFlags(initialFlags);
    }, [userId]);
    const isEnabled = (flagKey) => {
        return flags[flagKey] || false;
    };
    const setFlag = (flagKey, enabled) => {
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
    const killSwitch = (flagKey) => {
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
    const checkDependencies = (flagKey) => {
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
    return (_jsx(FeatureFlagContext.Provider, { value: {
            flags,
            isEnabled,
            setFlag,
            killSwitch,
            checkDependencies,
        }, children: children }));
};
/**
 * Hook to use feature flags
 */
export const useFeatureFlag = (flagKey) => {
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
export const FeatureFlag = ({ flag, children, fallback = null }) => {
    const isEnabled = useFeatureFlag(flag);
    return _jsx(_Fragment, { children: isEnabled ? children : fallback });
};
/**
 * Feature flag admin panel component
 */
export const FeatureFlagAdminPanel = () => {
    const { flags, setFlag, checkDependencies } = useFeatureFlags();
    return (_jsxs("div", { className: "feature-flag-admin-panel", children: [_jsx("h2", { children: "Feature Flags - Epic 1" }), Object.values(EPIC1_FEATURE_FLAGS).map(config => {
                const isEnabled = flags[config.key];
                const { satisfied, missing } = checkDependencies(config.key);
                return (_jsxs("div", { className: "feature-flag-item", children: [_jsxs("div", { className: "flag-header", children: [_jsx("h3", { children: config.name }), config.emergencyKillSwitch && (_jsx("span", { className: "kill-switch-badge", children: "\u26A0\uFE0F Kill Switch" }))] }), _jsx("p", { className: "flag-description", children: config.description }), _jsxs("div", { className: "flag-metadata", children: [_jsxs("span", { className: "flag-key", children: ["Key: ", config.key] }), _jsxs("span", { className: "flag-tags", children: ["Tags: ", config.tags.join(', ')] })] }), !satisfied && (_jsxs("div", { className: "flag-warning", children: ["\u26A0\uFE0F Dependencies required: ", missing.join(', ')] })), _jsxs("div", { className: "flag-controls", children: [_jsxs("label", { className: "toggle-switch", children: [_jsx("input", { type: "checkbox", checked: isEnabled, onChange: (e) => setFlag(config.key, e.target.checked), disabled: !satisfied && !isEnabled }), _jsx("span", { className: "toggle-slider" })] }), config.rolloutPercentage !== undefined && (_jsxs("div", { className: "rollout-control", children: [_jsx("label", { children: "Rollout %: " }), _jsx("input", { type: "range", min: "0", max: "100", value: config.rolloutPercentage, onChange: (e) => {
                                                featureFlags.setFlag(config.key, isEnabled, parseInt(e.target.value));
                                            } }), _jsxs("span", { children: [config.rolloutPercentage, "%"] })] }))] })] }, config.key));
            }), _jsx("style", { jsx: true, children: `
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
      ` })] }));
};
