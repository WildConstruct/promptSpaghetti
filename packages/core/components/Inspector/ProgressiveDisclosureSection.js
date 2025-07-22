import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { HierarchyColors, TypographyScale, SpacingScale, ComponentSizes, classifyFieldPriority } from '../VisualHierarchy/HierarchyDesignSystem';
/**
 * Epic 8.4 - Progressive Disclosure Section Component
 *
 * Automatically shows/hides content based on current complexity level:
 * - Basic: Essential fields only
 * - Advanced: Power user options with collapsible sections
 * - Debug: All technical details visible
 */
export const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);
// Determine field priority using hierarchy design system
const priority = explicitPriority || (fieldName ? classifyFieldPriority(fieldName) : 'standard');
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
// Get visual hierarchy colors and styles
const colors = HierarchyColors[level];
const typography = priority === 'critical' ? TypographyScale.secondary : TypographyScale.tertiary;
// Enhanced section styles using design system
const getSectionStyles = () => {
    const baseStyles = {
        marginBottom: SpacingScale.md,
        borderRadius: 6,
        overflow: 'hidden',
        transition: 'all 0.2s ease-in-out',
        position: 'relative',
    };
    // Add priority-based visual indicators
    const priorityIndicator = priority === 'critical' ? {
        borderLeft: `4px solid ${colors.primary}`,
        backgroundColor: `${colors.primary}15`, // 15% opacity
    } : priority === 'important' ? {
        borderLeft: `3px solid ${colors.secondary}`,
        backgroundColor: `${colors.secondary}10`, // 10% opacity
    } : {
        borderLeft: `2px solid ${colors.border}`,
        backgroundColor: colors.background,
    };
    return {
        ...baseStyles,
        ...priorityIndicator,
        border: `1px solid ${colors.border}`,
    };
};
const getHeaderStyles = () => {
    return {
        ...ComponentSizes.header,
        cursor: shouldAutoExpand ? 'default' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        userSelect: 'none',
        backgroundColor: colors.background,
        borderBottom: effectivelyExpanded ? `1px solid ${colors.border}` : 'none',
        transition: 'all 0.2s ease-in-out',
        ...typography,
        // Enhanced focus styles for accessibility
        ':focus': {
            outline: `2px solid ${colors.primary}`,
            outlineOffset: 2,
        },
        ':hover': shouldAutoExpand ? {} : {
            backgroundColor: colors.accent,
            transform: 'translateY(-1px)',
            boxShadow: `0 4px 12px ${colors.primary}20`,
        }
    };
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
return (_jsxs("div", { style: getSectionStyles(), className: className, role: "region", "aria-labelledby": `section-header-${title.replace(/\s+/g, '-').toLowerCase()}`, children: [_jsxs("div", { id: `section-header-${title.replace(/\s+/g, '-').toLowerCase()}`, style: getHeaderStyles(), onClick: shouldAutoExpand ? undefined : () => setIsExpanded(!isExpanded), role: shouldAutoExpand ? undefined : "button", tabIndex: shouldAutoExpand ? undefined : 0, "aria-expanded": shouldAutoExpand ? undefined : effectivelyExpanded, "aria-label": AccessibilityUtils.getAriaLabel(level, title), "aria-describedby": description ? `section-desc-${title.replace(/\s+/g, '-').toLowerCase()}` : undefined, onKeyDown: shouldAutoExpand ? undefined : (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setIsExpanded(!isExpanded);
                }
            }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: SpacingScale.sm }, children: [_jsx("span", { style: { fontSize: typography.fontSize, opacity: 0.9 }, children: icon || getLevelIndicator() }), _jsx("span", { style: {
                                color: colors.text,
                                fontWeight: typography.fontWeight,
                                fontSize: typography.fontSize
                            }, children: title }), priority !== 'standard' && (_jsx("span", { style: {
                                ...TypographyScale.micro,
                                backgroundColor: priority === 'critical' ? colors.primary : colors.secondary,
                                color: colors.accent,
                                padding: '2px 6px',
                                borderRadius: 3,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                fontWeight: 600,
                            }, title: AccessibilityUtils.getAriaDescription(priority), children: priority === 'critical' ? 'Required' : priority === 'important' ? 'Key' : priority })), description && (_jsx("span", { id: `section-desc-${title.replace(/\s+/g, '-').toLowerCase()}`, style: {
                                ...TypographyScale.caption,
                                color: colors.secondary,
                                fontStyle: 'italic',
                                marginLeft: SpacingScale.xs,
                            }, title: description, children: description.length > 30 ? `${description.substring(0, 30)}...` : description }))] }), _jsx("div", { style: { display: 'flex', alignItems: 'center', gap: SpacingScale.xs }, children: !shouldAutoExpand && (_jsx("span", { style: {
                            fontSize: TypographyScale.caption.fontSize,
                            color: colors.secondary,
                            transform: effectivelyExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s ease-in-out',
                        }, "aria-hidden": "true", children: "\u25B6" })) })] }), effectivelyExpanded && (_jsx("div", { style: {
                ...ComponentSizes.section,
                animation: 'fadeIn 0.2s ease-in-out',
            }, role: "group", "aria-labelledby": `section-header-${title.replace(/\s+/g, '-').toLowerCase()}`, children: children })), _jsx("style", { jsx: true, children: `
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      ` })] }));
;
