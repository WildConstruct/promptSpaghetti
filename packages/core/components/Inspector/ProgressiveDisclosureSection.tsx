import React, { ReactNode } from 'react';
import { useUISettingsStore } from '../../stores/uiSettingsStore';

export interface ProgressiveDisclosureSectionProps {
  title: string;
  level: 'basic' | 'advanced' | 'debug';
  children: ReactNode;
  description?: string;
  defaultExpanded?: boolean;
  icon?: string;
  className?: string;
}

/**
 * Epic 8.4 - Progressive Disclosure Section Component
 * 
 * Automatically shows/hides content based on current complexity level:
 * - Basic: Essential fields only
 * - Advanced: Power user options with collapsible sections
 * - Debug: All technical details visible
 */
export   const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

  // Determine if this section should be visible based on current complexity level
  const shouldShow = React.useMemo(() => {
    switch (level) {
      case 'basic':
        return true; // Always show basic sections
      case 'advanced':
        return shouldShowAdvancedFeatures() || complexityLevel !== 'basic';
      case 'debug':
        return shouldShowTechnicalFields() || complexityLevel === 'expert';
      default:
        return true;
    }
  }, [level, complexityLevel, shouldShowAdvancedFeatures, shouldShowTechnicalFields]);

  // Don't render if section shouldn't be shown
  if (!shouldShow) {
    return null;
  }

  // Auto-expand for basic level or debug level
  const shouldAutoExpand = level === 'basic' || complexityLevel === 'expert';
  const effectivelyExpanded = shouldAutoExpand ? true : isExpanded;

  // Style variations based on disclosure level
  const getSectionStyles = () => {
    const baseStyles = {
      marginBottom: 12,
      borderRadius: 6,
      overflow: 'hidden' as const,
    };

    switch (level) {
      case 'basic':
        return {
          ...baseStyles,
          background: '#1e2a3a', // Slightly lighter for essential content
          border: '1px solid #2d3748',
        };
      case 'advanced':
        return {
          ...baseStyles,
          background: '#1a202c', // Standard background
          border: '1px solid #4a5568',
        };
      case 'debug':
        return {
          ...baseStyles,
          background: '#2d1b69', // Purple tint for debug content
          border: '1px solid #553c9a',
        };
      default:
        return baseStyles;
    }
  };

  const getHeaderStyles = () => {
    const baseStyles = {
      padding: '8px 12px',
      cursor: shouldAutoExpand ? 'default' : 'pointer',
      display: 'flex' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      fontSize: 12,
      fontWeight: 500,
      userSelect: 'none' as const,
    };

    switch (level) {
      case 'basic':
        return {
          ...baseStyles,
          background: '#2d3748',
          color: '#e2e8f0',
          borderBottom: effectivelyExpanded ? '1px solid #4a5568' : 'none',
        };
      case 'advanced':
        return {
          ...baseStyles,
          background: '#2a4365',
          color: '#90cdf4',
          borderBottom: effectivelyExpanded ? '1px solid #4a5568' : 'none',
        };
      case 'debug':
        return {
          ...baseStyles,
          background: '#553c9a',
          color: '#c4b5fd',
          borderBottom: effectivelyExpanded ? '1px solid #7c3aed' : 'none',
        };
      default:
        return baseStyles;
    }
  };

  const getLevelIndicator = () => {
    switch (level) {
      case 'basic':
        return '🎯'; // Target - essential
      case 'advanced':
        return '⚡'; // Lightning - power features
      case 'debug':
        return '🔧'; // Wrench - technical tools
      default:
        return '';
    }
  };

  return (
    <div style={getSectionStyles()} className={className}>
      <div
        style={getHeaderStyles()}
        onClick={shouldAutoExpand ? undefined : () => setIsExpanded(!isExpanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>{icon || getLevelIndicator()}</span>
          <span>{title}</span>
          {description && (
            <span 
              style={{ 
                fontSize: 10, 
                opacity: 0.7, 
                fontStyle: 'italic' 
              }}
              title={description}
            >
              {description.length > 20 ? `${description.substring(0, 20)}...` : description}
            </span>
          )}
        </div>
        {!shouldAutoExpand && (
          <span 
            style={{ 
              fontSize: 10,
              transform: effectivelyExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
            }}
          >
            ▶
          </span>
        )}
      </div>
      
      {effectivelyExpanded && (
        <div 
          style={{ 
            padding: '12px',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
};