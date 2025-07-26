// packages/core/components/Settings/UIControls.tsx
// UI settings controls for Epic 7.3 Advanced Settings Modal

import React, { useCallback } from 'react';
import { UISettings } from '../../settings/types';
import { FiEye, FiSun, FiMoon, FiMonitor, FiHelpCircle, FiKeyboard, FiZap, FiContrast } from 'react-icons/fi';
import { uiColors } from '../../styles/professional-design-system';

// Enhanced color palette for better UI consistency
const uiColors = {
  ...uiColors,
  accent: {
    ...uiColors.accent,
    primary: uiColors.accent.orange,
    secondary: uiColors.accent.blue
  },
  ui: {
    ...uiColors.ui,
    selected: '#353535',
    disabled: '#6b7280'
  },
  text: {
    ...uiColors.text,
    disabled: '#6b7280'
  }
};

export interface UIControlsProps {
  settings: UISettings;
  onChange: (settings: UISettings) => void;
}

/**
 * UI Settings Controls Component
 * Manages user interface and accessibility preferences
 */
export const UIControls: React.FC<UIControlsProps> = ({
  settings,
  onChange
}) => {

  // Handle theme change
  const handleThemeChange = useCallback((theme: 'light' | 'dark' | 'auto') => {
    onChange({
      ...settings,
      theme
    });
  }, [settings, onChange]);

  // Handle tooltips toggle
  const handleShowTooltipsChange = useCallback((showTooltips: boolean) => {
    onChange({
      ...settings,
      showTooltips
    });
  }, [settings, onChange]);

  // Handle keyboard shortcuts toggle
  const handleEnableKeyboardShortcutsChange = useCallback((enableKeyboardShortcuts: boolean) => {
    onChange({
      ...settings,
      enableKeyboardShortcuts
    });
  }, [settings, onChange]);

  // Handle animations toggle
  const handleReduceAnimationsChange = useCallback((reduceAnimations: boolean) => {
    onChange({
      ...settings,
      reduceAnimations
    });
  }, [settings, onChange]);

  // Handle high contrast toggle
  const handleHighContrastChange = useCallback((highContrast: boolean) => {
    onChange({
      ...settings,
      highContrast
    });
  }, [settings, onChange]);

  // Theme options
  const themeOptions = [
    {
      value: 'light' as const,
      label: 'Light Theme',
      description: 'Bright interface for well-lit environments',
      icon: FiSun
    },
    {
      value: 'dark' as const,
      label: 'Dark Theme', 
      description: 'Dark interface for low-light environments',
      icon: FiMoon
    },
    {
      value: 'auto' as const,
      label: 'System Theme',
      description: 'Follow your system theme preference',
      icon: FiMonitor
    }
  ];

  // UI features sections
  const uiSections = [
    {
      id: 'appearance',
      title: 'Theme & Appearance',
      icon: FiEye,
      content: 'theme-selector'
    },
    {
      id: 'interaction',
      title: 'User Interaction',
      icon: FiHelpCircle,
      settings: [
        {
          key: 'showTooltips' as const,
          label: 'Show tooltips',
          description: 'Display helpful tooltips when hovering over elements',
          enabled: settings.showTooltips,
          handler: handleShowTooltipsChange,
          icon: FiHelpCircle
        },
        {
          key: 'enableKeyboardShortcuts' as const,
          label: 'Enable keyboard shortcuts',
          description: 'Allow keyboard shortcuts for faster navigation',
          enabled: settings.enableKeyboardShortcuts,
          handler: handleEnableKeyboardShortcutsChange,
          icon: FiKeyboard
        }
      ]
    },
    {
      id: 'accessibility',
      title: 'Accessibility',
      icon: FiContrast,
      settings: [
        {
          key: 'reduceAnimations' as const,
          label: 'Reduce animations',
          description: 'Minimize motion for users with vestibular disorders',
          enabled: settings.reduceAnimations,
          handler: handleReduceAnimationsChange,
          icon: FiZap
        },
        {
          key: 'highContrast' as const,
          label: 'High contrast mode',
          description: 'Increase contrast for better visibility',
          enabled: settings.highContrast,
          handler: handleHighContrastChange,
          icon: FiContrast
        }
      ]
    }
  ];

  // Get theme icon and color
  const getThemeInfo = (theme: string) => {
    const option = themeOptions.find(opt => opt.value === theme);
    return {
      Icon: option?.icon || FiMonitor,
      color: theme === 'light' ? '#f59e0b' : theme === 'dark' ? '#6366f1' : uiColors.accent.primary
    };
  };

  const currentThemeInfo = getThemeInfo(settings.theme);

  return (
    <div style={{ marginBottom: '24px' }}>
      {/* Section Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '16px'
      }}>
        <FiEye size={18} color={uiColors.accent.primary} />
        <h3 style={{
          margin: 0,
          fontSize: '16px',
          fontWeight: 600,
          color: uiColors.text.primary
        }}>
          Interface & Accessibility Settings
        </h3>
      </div>

      {/* Current Theme Overview */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '20px',
        padding: '12px',
        backgroundColor: uiColors.ui.hover,
        borderRadius: '8px',
        border: `1px solid ${uiColors.ui.border}`
      }}>
        <currentThemeInfo.Icon size={16} color={currentThemeInfo.color} />
        <div style={{
          fontSize: '14px',
          fontWeight: 500,
          color: uiColors.text.primary
        }}>
          Current Theme: {themeOptions.find(opt => opt.value === settings.theme)?.label}
        </div>
        
        <div style={{
          fontSize: '12px',
          color: uiColors.text.secondary,
          marginLeft: 'auto'
        }}>
          {settings.highContrast && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 6px',
              borderRadius: '3px',
              backgroundColor: '#6366f1' + '20',
              color: '#6366f1',
              fontSize: '10px',
              fontWeight: 500
            }}>
              <FiContrast size={10} />
              High Contrast
            </span>
          )}
        </div>
      </div>

      {/* UI Settings Sections */}
      {uiSections.map((section) => {
        const SectionIcon = section.icon;
        
        return (
          <div key={section.id} style={{ marginBottom: '24px' }}>
            {/* Section Title */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '12px'
            }}>
              <SectionIcon size={16} color={uiColors.accent.primary} />
              <h4 style={{
                margin: 0,
                fontSize: '14px',
                fontWeight: 600,
                color: uiColors.text.primary
              }}>
                {section.title}
              </h4>
            </div>

            {/* Theme Selector */}
            {section.content === 'theme-selector' && (
              <div style={{
                marginLeft: '24px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '8px'
              }}>
                {themeOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = settings.theme === option.value;
                  
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleThemeChange(option.value)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '12px',
                        backgroundColor: isSelected
                          ? uiColors.accent.primary + '20'
                          : uiColors.ui.hover,
                        border: isSelected
                          ? `1px solid ${uiColors.accent.primary}`
                          : `1px solid ${uiColors.ui.border}`,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        textAlign: 'center'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = uiColors.ui.selected;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = uiColors.ui.hover;
                        }
                      }}
                    >
                      <Icon 
                        size={20} 
                        color={isSelected ? uiColors.accent.primary : uiColors.text.secondary}
                        style={{ marginBottom: '6px' }}
                      />
                      <div style={{
                        fontSize: '13px',
                        fontWeight: 500,
                        color: isSelected ? uiColors.accent.primary : uiColors.text.primary,
                        marginBottom: '4px'
                      }}>
                        {option.label}
                      </div>
                      <div style={{
                        fontSize: '10px',
                        color: isSelected ? uiColors.accent.primary : uiColors.text.secondary,
                        lineHeight: 1.3
                      }}>
                        {option.description}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Section Settings */}
            {section.settings && (
              <div style={{
                marginLeft: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                {section.settings.map((setting) => {
                  const SettingIcon = setting.icon;
                  
                  return (
                    <div key={setting.key} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '12px',
                      backgroundColor: setting.enabled 
                        ? uiColors.accent.primary + '10'
                        : uiColors.ui.hover,
                      border: setting.enabled
                        ? `1px solid ${uiColors.accent.primary}`
                        : `1px solid ${uiColors.ui.border}`,
                      borderRadius: '6px',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}>
                      {/* Setting Icon */}
                      <SettingIcon 
                        size={16} 
                        color={setting.enabled 
                          ? uiColors.accent.primary 
                          : uiColors.text.secondary
                        } 
                        style={{ marginTop: '2px' }}
                      />
                      
                      {/* Setting Content */}
                      <div style={{ flex: 1 }}>
                        <label style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: 500,
                          marginBottom: '4px'
                        }}>
                          <input
                            type="checkbox"
                            checked={setting.enabled}
                            onChange={(e) => setting.handler(e.target.checked)}
                            style={{ accentColor: uiColors.accent.primary }}
                          />
                          <span style={{ 
                            color: setting.enabled 
                              ? uiColors.accent.primary 
                              : uiColors.text.primary 
                          }}>
                            {setting.label}
                          </span>
                        </label>
                        
                        <div style={{
                          fontSize: '11px',
                          color: uiColors.text.secondary,
                          marginLeft: '24px'
                        }}>
                          {setting.description}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Accessibility Notice */}
      {(settings.reduceAnimations || settings.highContrast) && (
        <div style={{
          padding: '12px',
          backgroundColor: '#6366f1' + '10',
          border: '1px solid #6366f1',
          borderRadius: '6px',
          marginTop: '16px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: 500,
            color: '#6366f1',
            marginBottom: '6px'
          }}>
            <FiContrast size={14} />
            Accessibility Mode Active
          </div>
          
          <div style={{
            fontSize: '11px',
            color: uiColors.text.secondary,
            lineHeight: 1.4
          }}>
            You have accessibility options enabled. The interface has been optimized for better visibility and reduced motion.
          </div>
        </div>
      )}

      {/* Current Configuration Summary */}
      <div style={{
        padding: '12px',
        backgroundColor: uiColors.ui.hover,
        borderRadius: '6px',
        border: `1px solid ${uiColors.ui.border}`,
        marginTop: '16px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '8px',
          fontSize: '12px',
          fontWeight: 500,
          color: uiColors.text.primary
        }}>
          <FiEye size={14} />
          Interface Configuration Summary
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          gap: '4px 12px',
          fontSize: '11px',
          color: uiColors.text.secondary
        }}>
          <span>Theme:</span>
          <span>{themeOptions.find(opt => opt.value === settings.theme)?.label}</span>
          
          <span>Tooltips:</span>
          <span>{settings.showTooltips ? 'Enabled' : 'Disabled'}</span>
          
          <span>Keyboard Shortcuts:</span>
          <span>{settings.enableKeyboardShortcuts ? 'Enabled' : 'Disabled'}</span>
          
          <span>Animations:</span>
          <span>{settings.reduceAnimations ? 'Reduced' : 'Full'}</span>
          
          <span>Contrast:</span>
          <span>{settings.highContrast ? 'High' : 'Standard'}</span>
        </div>
      </div>
    </div>
  );
};