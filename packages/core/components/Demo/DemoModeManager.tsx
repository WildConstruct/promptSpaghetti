/**
 * Demo Mode Manager
 * Epic 8.1: Task 5 - Demo-Ready Polish for presentation environments
 * 
 * Manages presentation modes, screenshot mode, and demo optimizations
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ProfessionalSpinner } from '../LoadingStates/ProfessionalSpinner';

export interface DemoModeConfig {
  screenshotMode: boolean;
  presentationFocus: boolean;
  performanceMode: boolean;
  accessibilityMode: boolean;
  brandingVisible: boolean;
  debugElementsHidden: boolean;
}

export interface DemoModeManagerProps {
  children: React.ReactNode;
  onModeChange?: (config: DemoModeConfig) => void;
  initialConfig?: Partial<DemoModeConfig>;
}

const DEFAULT_CONFIG: DemoModeConfig = {
  screenshotMode: false,
  presentationFocus: false,
  performanceMode: false,
  accessibilityMode: false,
  brandingVisible: true,
  debugElementsHidden: false
};

export const DemoModeManager: React.FC<DemoModeManagerProps> = ({
  children,
  onModeChange,
  initialConfig = {}
}) => {
  const [config, setConfig] = useState<DemoModeConfig>({
    ...DEFAULT_CONFIG,
    ...initialConfig
  });
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Auto-detect screen resolution and apply appropriate scaling
  useEffect(() => {
    const detectScreenMode = () => {
      const width = window.screen.width;
      const height = window.screen.height;
      const pixelRatio = window.devicePixelRatio || 1;
      
      // Apply demo scaling for presentation screens
      if (width === 1920 && height === 1080) {
        document.documentElement.className += ' presentation-1080p';
      } else if (width >= 3840 && height >= 2160) {
        document.documentElement.className += ' presentation-4k';
      } else if (width >= 2560) {
        document.documentElement.className += ' presentation-ultrawide';
      }
      
      // Apply high-DPI optimizations
      if (pixelRatio >= 2) {
        document.documentElement.className += ' presentation-hidpi';
      }
    };

    detectScreenMode();
    window.addEventListener('resize', detectScreenMode);
    return () => window.removeEventListener('resize', detectScreenMode);
  }, []);

  // Apply CSS classes based on config
  useEffect(() => {
    const classes = [];
    
    if (config.screenshotMode) classes.push('demo-screenshot-mode');
    if (config.presentationFocus) classes.push('presentation-focus');
    if (config.performanceMode) classes.push('demo-performance-mode');
    if (config.accessibilityMode) classes.push('presentation-a11y');
    if (config.debugElementsHidden) classes.push('hide-debug-elements');
    
    // Always add demo mode class
    classes.push('demo-mode', 'presentation-typography');
    
    // Apply classes to document body
    document.body.className = document.body.className
      .split(' ')
      .filter(cls => !cls.startsWith('demo-') && !cls.startsWith('presentation-'))
      .concat(classes)
      .join(' ');
      
    onModeChange?.(config);
  }, [config, onModeChange]);

  const updateConfig = useCallback((updates: Partial<DemoModeConfig>) => {
    setIsTransitioning(true);
    
    setTimeout(() => {
      setConfig(prev => ({ ...prev, ...updates }));
      setIsTransitioning(false);
    }, 150); // Brief transition for smooth mode changes
  }, []);

  // Keyboard shortcuts for demo control
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only handle if Alt + Shift are pressed (presenter shortcut)
      if (!e.altKey || !e.shiftKey) return;
      
      switch (e.key) {
      case 'S':
        // Alt+Shift+S: Toggle screenshot mode
        e.preventDefault();
        updateConfig({ screenshotMode: !config.screenshotMode });
        break;
      case 'F':
        // Alt+Shift+F: Toggle presentation focus
        e.preventDefault();
        updateConfig({ presentationFocus: !config.presentationFocus });
        break;
      case 'P':
        // Alt+Shift+P: Toggle performance mode
        e.preventDefault();
        updateConfig({ performanceMode: !config.performanceMode });
        break;
      case 'A':
        // Alt+Shift+A: Toggle accessibility mode
        e.preventDefault();
        updateConfig({ accessibilityMode: !config.accessibilityMode });
        break;
      case 'D':
        // Alt+Shift+D: Toggle debug elements
        e.preventDefault();
        updateConfig({ debugElementsHidden: !config.debugElementsHidden });
        break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [config, updateConfig]);

  return (
    <>
      {children}
      
      {/* Professional branding for demos */}
      {config.brandingVisible && !config.screenshotMode && (
        <div className="demo-branding" data-demo-safe="true">
          <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: 2 }}>
            🎬 PromptScape Studio
          </div>
          <div style={{ fontSize: '10px', opacity: 0.8 }}>
            Professional Prompt Generation
          </div>
        </div>
      )}
      
      {/* Demo mode transition overlay */}
      {isTransitioning && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            pointerEvents: 'none'
          }}
        >
          <ProfessionalSpinner
            size="medium"
            variant="cinema4d"
            type="pulse"
            message="Switching demo mode..."
          />
        </div>
      )}
      
      {/* Demo control panel (hidden in screenshot mode) */}
      {!config.screenshotMode && process.env.NODE_ENV === 'development' && (
        <DemoControlPanel config={config} onConfigChange={updateConfig} />
      )}
    </>
  );
};

// Demo control panel for development/presentation setup
interface DemoControlPanelProps {
  config: DemoModeConfig;
  onConfigChange: (updates: Partial<DemoModeConfig>) => void;
}

const DemoControlPanel: React.FC<DemoControlPanelProps> = ({ config, onConfigChange }) => {
  const [panelVisible, setPanelVisible] = useState(false);

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setPanelVisible(!panelVisible)}
        style={{
          position: 'fixed',
          top: 10,
          right: 10,
          background: 'rgba(31, 41, 55, 0.95)',
          border: '1px solid rgba(55, 65, 81, 0.6)',
          borderRadius: '6px',
          color: '#e5e7eb',
          padding: '8px',
          cursor: 'pointer',
          fontSize: '12px',
          zIndex: 10001,
          backdropFilter: 'blur(8px)',
          transition: 'all 0.2s ease'
        }}
        className="development-only"
        title="Demo Controls (Alt+Shift+[key])"
      >
        🎭 Demo
      </button>
      
      {/* Control panel */}
      {panelVisible && (
        <div
          style={{
            position: 'fixed',
            top: 50,
            right: 10,
            background: 'rgba(31, 41, 55, 0.98)',
            border: '1px solid rgba(55, 65, 81, 0.6)',
            borderRadius: '8px',
            padding: '16px',
            fontSize: '12px',
            color: '#e5e7eb',
            zIndex: 10000,
            backdropFilter: 'blur(16px)',
            minWidth: '220px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)'
          }}
          className="development-only"
        >
          <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>
            Demo Mode Controls
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={config.screenshotMode}
                onChange={(e) => onConfigChange({ screenshotMode: e.target.checked })}
                style={{ cursor: 'pointer' }}
              />
              <span>Screenshot Mode (Alt+Shift+S)</span>
            </label>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={config.presentationFocus}
                onChange={(e) => onConfigChange({ presentationFocus: e.target.checked })}
                style={{ cursor: 'pointer' }}
              />
              <span>Focus Mode (Alt+Shift+F)</span>
            </label>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={config.performanceMode}
                onChange={(e) => onConfigChange({ performanceMode: e.target.checked })}
                style={{ cursor: 'pointer' }}
              />
              <span>Performance Mode (Alt+Shift+P)</span>
            </label>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={config.accessibilityMode}
                onChange={(e) => onConfigChange({ accessibilityMode: e.target.checked })}
                style={{ cursor: 'pointer' }}
              />
              <span>High Contrast (Alt+Shift+A)</span>
            </label>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={config.debugElementsHidden}
                onChange={(e) => onConfigChange({ debugElementsHidden: e.target.checked })}
                style={{ cursor: 'pointer' }}
              />
              <span>Hide Debug (Alt+Shift+D)</span>
            </label>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={config.brandingVisible}
                onChange={(e) => onConfigChange({ brandingVisible: e.target.checked })}
                style={{ cursor: 'pointer' }}
              />
              <span>Show Branding</span>
            </label>
          </div>
          
          <div style={{ marginTop: 12, fontSize: 10, opacity: 0.7, lineHeight: 1.4 }}>
            Screen: {window.screen.width}×{window.screen.height} ({window.devicePixelRatio}x DPI)
          </div>
        </div>
      )}
    </>
  );
};

export default DemoModeManager;