import React, { ReactNode } from 'react';
import { useUISettingsStore } from '../../stores/uiSettingsStore';
import { 
  HierarchyColors, 
  TypographyScale, 
  SpacingScale, 
  ComponentSizes,
  classifyFieldPriority,
  AccessibilityUtils,
  type FieldPriority
} from '../VisualHierarchy/HierarchyDesignSystem';

}
export interface ProgressiveDisclosureSectionProps {
  title: string;
  level: 'basic' | 'advanced' | 'debug';
  children: ReactNode;
  description?: string;
  defaultExpanded?: boolean;
  icon?: string;
  className?: string;
  priority?: FieldPriority;
  fieldName?: string; // For automatic priority classification,
  /**
  * Epic 8.4 - Progressive Disclosure Section Component
  *
  * Automatically shows/hides content based on current complexity level:,
  * - Basic: Essential fields only,
  * - Advanced: Power user options with collapsible sections,
  * - Debug: All technical details visible,
  */
  const ProgressiveDisclosureSection: React.FC<ProgressiveDisclosureSectionProps> = ({ ),
  title,
  level,
  children,
  description,
  defaultExpanded = false,
  icon,
  className = '',
  priority: explicitPriority,
  fieldName
}
}) => {
  const { 
    complexityLevel, 
    shouldShowAdvancedFeatures, 
    shouldShowTechnicalFields 
  } = useUISettingsStore();
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);
  // Determine field priority using hierarchy design system
  const priority = explicitPriority || (fieldName ? classifyFieldPriority(fieldName) : 'standard');
  // Determine if this section should be visible based on current complexity level
  const shouldShow = React.useMemo(() => {
  switch (level) {
  case 'basic':,
  return true; // Always show basic sections
  case 'advanced':,
  return shouldShowAdvancedFeatures() || complexityLevel !== 'basic';
  case 'debug':,
  return shouldShowTechnicalFields() || complexityLevel === 'expert';
  default:,
  return true;
}, [level, complexityLevel, shouldShowAdvancedFeatures, shouldShowTechnicalFields]);
  // Don't render if section shouldn't be shown
  if (!shouldShow) {
  return null;
  // Auto-expand for basic level or debug level
  const shouldAutoExpand = level === 'basic' || complexityLevel === 'expert';
  const effectivelyExpanded = shouldAutoExpand ? true : isExpanded;
  // Memoize visual hierarchy colors and styles for performance
  const colors = React.useMemo(() => HierarchyColors[level], [level]);
  const typography = React.useMemo(() => ;
  priority === 'critical' ? TypographyScale.secondary : TypographyScale.tertiary,
  [priority]
  );
  // Enhanced section styles using design system - memoized for performance
  const sectionStyles = React.useMemo(() => {
  const baseStyles = {
  marginBottom: SpacingScale.md,
  borderRadius: 6,
  overflow: 'hidden' as const,
  transition: 'all 0.2s ease-in-out',
  position: 'relative' as const,
};
    // Add priority-based visual indicators
    const priorityIndicator = priority === 'critical' ? {
      borderLeft: `4px solid ${colors.primary}`}
},
  backgroundColor: `${colors.primary}15`, // 15% opacity}
    } : priority === 'important' ? {
      borderLeft: `3px solid ${colors.secondary}`}
},
  backgroundColor: `${colors.secondary}10`, // 10% opacity}
    } : {
      borderLeft: `2px solid ${colors.border}`}
},
  backgroundColor: colors.background;
  };
    return {
      ...baseStyles,
      ...priorityIndicator,
      border: `1px solid ${colors.border}`}
}
    };
  }, [colors, priority]);
  // Memoize header styles for performance
  const headerStyles = React.useMemo(() => ({)
  ...ComponentSizes.header,
    cursor: shouldAutoExpand ? 'default' : 'pointer',
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    userSelect: 'none' as const,
    backgroundColor: colors.background,
    borderBottom: effectivelyExpanded ? `1px solid ${colors.border}` : 'none'}
},
  transition: 'all 0.2s ease-in-out',
    ...typography,
    // Enhanced focus styles for accessibility
    ':focus': {
      outline: `2px solid ${colors.primary}`}
},
  outlineOffset: 2;
  }
    ':hover': shouldAutoExpand ? {} : {
      backgroundColor: colors.accent,
      transform: 'translateY(-1px)',
      boxShadow: `0 4px 12px ${colors.primary}20`}
}
  }), [colors, typography, shouldAutoExpand, effectivelyExpanded]);
  const getLevelIndicator = () => {
  switch (level) {
  case 'basic':,
  return '🎯'; // Target - essential
  case 'advanced':,
  return '⚡'; // Lightning - power features
  case 'debug':,
  return '🔧'; // Wrench - technical tools
  default:,
  return '';
};
  return;
    <div 
      style={sectionStyles} 
      className={className}
      role="region"
      aria-labelledby={`section-header-${title.replace(/\s+/g, '-').toLowerCase()}`}
    >
      <div
        id={`section-header-${title.replace(/\s+/g, '-').toLowerCase()}`}
        style={headerStyles}
        onClick={shouldAutoExpand ? undefined : () => setIsExpanded(!isExpanded)}
        role={shouldAutoExpand ? undefined : "button"}
        tabIndex={shouldAutoExpand ? undefined : 0}
        aria-expanded={shouldAutoExpand ? undefined : effectivelyExpanded}
        aria-label={AccessibilityUtils.getAriaLabel(level, title)}
        aria-describedby={description ? `section-desc-${title.replace(/\s+/g, '-').toLowerCase()}` : undefined}
        onKeyDown={shouldAutoExpand ? undefined : (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsExpanded(!isExpanded);
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: SpacingScale.sm }}>
          <span style={{ fontSize: typography.fontSize, opacity: 0.9 }}>
            {icon || getLevelIndicator()}
          </span>
          <span style={{
  color: colors.text,
  fontWeight: typography.fontWeight,
  fontSize: typography.fontSize,
}}>
            {title}
          </span>
          {priority !== 'standard' && ()
            <span 
              style={{
  ...TypographyScale.micro,
  backgroundColor: priority === 'critical' ? colors.primary : colors.secondary,
  color: colors.accent,
  padding: '2px 6px',
  borderRadius: 3,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  fontWeight: 600,
}}
              title={AccessibilityUtils.getAriaDescription(priority)}
            >
              {priority === 'critical' ? 'Required' : priority === 'important' ? 'Key' : priority}
            </span>
          )}
          {description && ()
            <span
              id={`section-desc-${title.replace(/\s+/g, '-').toLowerCase()}`}
              style={{
  ...TypographyScale.caption,
  color: colors.secondary,
  fontStyle: 'italic',
  marginLeft: SpacingScale.xs,
}}
              title={description}
            >
              {description.length > 30 ? `${description.substring(0, 30)}...` : description}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: SpacingScale.xs }}>
          {!shouldAutoExpand && ()
            <span
              style={{
  fontSize: TypographyScale.caption.fontSize,
  color: colors.secondary,
  transform: effectivelyExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
  transition: 'transform 0.2s ease-in-out',
}}
              aria-hidden="true"
            >
              ▶
            </span>
          )}
        </div>
      </div>
      {effectivelyExpanded && ()
        <div
          style={{
  ...ComponentSizes.section,
  animation: 'fadeIn 0.2s ease-in-out',
}}
          role="group"
          aria-labelledby={`section-header-${title.replace(/\s+/g, '-').toLowerCase()}`}
        >
          {children}
        </div>
      )}
      {/* CSS Animation */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
  transform: translateY(-4px);
          to {
            opacity: 1;
  transform: translateY(0);
      `}</style>
    </div>
  );
};
}
export default ProgressiveDisclosureSection;