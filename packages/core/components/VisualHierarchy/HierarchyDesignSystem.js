import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Epic 8.4 Task 2 - Visual Hierarchy Design System
 *
 * Defines consistent visual cues for field importance and information architecture
 * across the progressive disclosure system.
 */
// Typography scale for visual hierarchy
export const TypographyScale = {
    primary: {
        fontSize: 16,
        fontWeight: 600,
        lineHeight: 1.4,
        letterSpacing: '-0.01em'
    },
    secondary: {
        fontSize: 14,
        fontWeight: 500,
        lineHeight: 1.4,
        letterSpacing: '0em'
    },
    tertiary: {
        fontSize: 12,
        fontWeight: 500,
        lineHeight: 1.3,
        letterSpacing: '0.01em'
    },
    caption: {
        fontSize: 11,
        fontWeight: 400,
        lineHeight: 1.2,
        letterSpacing: '0.02em'
    },
    micro: {
        fontSize: 10,
        fontWeight: 400,
        lineHeight: 1.2,
        letterSpacing: '0.03em'
    }
};
// Color system for progressive disclosure levels
export const HierarchyColors = {
    basic: {
        primary: '#4ade80', // Green - Essential/Primary
        secondary: '#22c55e', // Darker green
        background: '#1e2a3a', // Slightly lighter background
        border: '#2d3748', // Subtle border
        text: '#e2e8f0', // High contrast text
        accent: '#065f46' // Dark green accent
    },
    advanced: {
        primary: '#60a5fa', // Blue - Advanced features
        secondary: '#3b82f6', // Darker blue
        background: '#1a202c', // Standard background
        border: '#4a5568', // Standard border
        text: '#90cdf4', // Blue-tinted text
        accent: '#1e3a8a' // Dark blue accent
    },
    debug: {
        primary: '#c4b5fd', // Purple - Technical/Debug
        secondary: '#a78bfa', // Darker purple
        background: '#2d1b69', // Purple-tinted background
        border: '#553c9a', // Purple border
        text: '#c4b5fd', // Light purple text
        accent: '#581c87' // Dark purple accent
    },
    neutral: {
        primary: '#e2e8f0', // Neutral text
        secondary: '#a0aec0', // Muted text
        background: '#1a202c', // Standard background
        border: '#4a5568', // Standard border
        text: '#e2e8f0', // Standard text
        accent: '#4a5568' // Neutral accent
    }
};
// Spacing scale for consistent layout rhythm
export const SpacingScale = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32
};
// Component sizes for consistent proportions
export const ComponentSizes = {
    field: {
        height: 36,
        padding: `${SpacingScale.sm}px ${SpacingScale.md}px`
    },
    section: {
        padding: `${SpacingScale.md}px`,
        marginBottom: SpacingScale.md
    },
    header: {
        height: 32,
        padding: `${SpacingScale.sm}px ${SpacingScale.md}px`
    }
};
// Visual weight indicators for field importance
export const FieldImportanceStyles = {
    critical: {
        borderLeftWidth: 4,
        borderLeftStyle: 'solid',
        borderLeftColor: HierarchyColors.basic.primary,
        backgroundColor: `${HierarchyColors.basic.primary}15`, // 15% opacity
        ...TypographyScale.secondary
    },
    important: {
        borderLeftWidth: 3,
        borderLeftStyle: 'solid',
        borderLeftColor: HierarchyColors.advanced.primary,
        backgroundColor: `${HierarchyColors.advanced.primary}10`, // 10% opacity
        ...TypographyScale.tertiary
    },
    standard: {
        borderLeftWidth: 2,
        borderLeftStyle: 'solid',
        borderLeftColor: HierarchyColors.neutral.border,
        backgroundColor: 'transparent',
        ...TypographyScale.tertiary
    },
    supplementary: {
        borderLeftWidth: 1,
        borderLeftStyle: 'solid',
        borderLeftColor: HierarchyColors.neutral.secondary,
        backgroundColor: 'transparent',
        ...TypographyScale.caption,
        opacity: 0.8
    }
};
export const classifyFieldPriority = (fieldName, _____nodeType) => {
    const lowerName = fieldName.toLowerCase();
    // Critical fields - always essential for node function
    const criticalPatterns = ['template', 'text', 'content', 'name', 'choices', 'output'];
    if (criticalPatterns.some(pattern => lowerName.includes(pattern))) {
        return 'critical';
    }
    // Important fields - commonly used advanced features
    const importantPatterns = ['weight', 'probability', 'seed', 'variable', 'count'];
    if (importantPatterns.some(pattern => lowerName.includes(pattern))) {
        return 'important';
    }
    // Supplementary fields - technical or rarely used
    const supplementaryPatterns = ['id', 'config', 'debug', 'internal', 'metadata', 'raw'];
    if (supplementaryPatterns.some(pattern => lowerName.includes(pattern))) {
        return 'supplementary';
    }
    // Default to standard
    return 'standard';
};
export const HierarchyHeader = ({ title, level, priority = 'standard', description, icon, isCollapsible = false, isExpanded = true, onToggle, children }) => {
    const colors = HierarchyColors[level];
    const typography = priority === 'critical' ? TypographyScale.secondary : TypographyScale.tertiary;
    return (_jsxs("div", { style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            ...ComponentSizes.header,
            backgroundColor: colors.background,
            borderBottom: `1px solid ${colors.border}`,
            cursor: isCollapsible ? 'pointer' : 'default',
            transition: 'all 0.2s ease-in-out',
            ...typography
        }, onClick: isCollapsible ? onToggle : undefined, role: isCollapsible ? 'button' : undefined, tabIndex: isCollapsible ? 0 : undefined, onKeyDown: isCollapsible ? (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onToggle?.();
            }
        } : undefined, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: SpacingScale.sm }, children: [icon && (_jsx("span", { style: { fontSize: typography.fontSize, opacity: 0.8 }, children: icon })), _jsx("span", { style: { color: colors.text, fontWeight: typography.fontWeight }, children: title }), description && (_jsx("span", { style: {
                            ...TypographyScale.caption,
                            color: colors.secondary,
                            fontStyle: 'italic',
                            marginLeft: SpacingScale.xs
                        }, title: description, children: description.length > 30 ? `${description.substring(0, 30)}...` : description }))] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: SpacingScale.xs }, children: [children, isCollapsible && (_jsx("span", { style: {
                            fontSize: TypographyScale.caption.fontSize,
                            color: colors.secondary,
                            transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s ease-in-out'
                        }, children: "\u25B6" }))] })] }));
};
export const HierarchyField = ({ priority, level, children, label, description, required = false, error, className }) => {
    const colors = HierarchyColors[level];
    const fieldStyles = FieldImportanceStyles[priority];
    return (_jsxs("div", { className: className, style: {
            marginBottom: SpacingScale.md,
            ...fieldStyles,
            padding: ComponentSizes.field.padding,
            borderRadius: 4,
            transition: 'all 0.2s ease-in-out'
        }, children: [label && (_jsxs("div", { style: {
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: SpacingScale.xs,
                    gap: SpacingScale.xs
                }, children: [_jsx("label", { style: {
                            ...TypographyScale.caption,
                            color: colors.text,
                            fontWeight: 500,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }, children: label }), required && (_jsx("span", { style: { color: '#ef4444', fontSize: TypographyScale.caption.fontSize }, children: "*" }))] })), _jsx("div", { style: { marginBottom: description ? SpacingScale.xs : 0 }, children: children }), description && (_jsx("div", { style: {
                    ...TypographyScale.micro,
                    color: colors.secondary,
                    fontStyle: 'italic',
                    marginTop: SpacingScale.xs
                }, children: description })), error && (_jsxs("div", { style: {
                    ...TypographyScale.micro,
                    color: '#ef4444',
                    marginTop: SpacingScale.xs,
                    display: 'flex',
                    alignItems: 'center',
                    gap: SpacingScale.xs
                }, children: [_jsx("span", { children: "\u274C" }), error] }))] }));
};
export const ComplexityIndicator = ({ level, showLabel = true, size = 'medium' }) => {
    const colors = HierarchyColors[level];
    const icons = {
        basic: '🎯',
        advanced: '⚡',
        debug: '🔧'
    };
    const labels = {
        basic: 'Essential',
        advanced: 'Advanced',
        debug: 'Technical'
    };
    const sizes = {
        small: { fontSize: 10, padding: '2px 6px' },
        medium: { fontSize: 11, padding: '4px 8px' },
        large: { fontSize: 12, padding: '6px 10px' }
    };
    return (_jsxs("div", { style: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            backgroundColor: colors.primary,
            color: colors.accent,
            borderRadius: 12,
            ...sizes[size],
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
        }, children: [_jsx("span", { children: icons[level] }), showLabel && _jsx("span", { children: labels[level] })] }));
};
// Accessibility utilities
export const AccessibilityUtils = {
    // Generate ARIA labels for hierarchy levels
    getAriaLabel: (level, title) => {
        const levelDescriptions = {
            basic: 'Essential setting',
            advanced: 'Advanced option',
            debug: 'Technical detail'
        };
        return `${levelDescriptions[level]}: ${title}`;
    },
    // Generate ARIA descriptions for field priorities
    getAriaDescription: (priority) => {
        const priorityDescriptions = {
            critical: 'Required for basic functionality',
            important: 'Commonly used advanced feature',
            standard: 'Standard configuration option',
            supplementary: 'Optional technical setting'
        };
        return priorityDescriptions[priority];
    },
    // Focus management utilities
    getFocusableElements: (container) => {
        const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        return Array.from(container.querySelectorAll(focusableSelector));
    }
};
export default {
    TypographyScale,
    HierarchyColors,
    SpacingScale,
    ComponentSizes,
    FieldImportanceStyles,
    classifyFieldPriority,
    HierarchyHeader,
    HierarchyField,
    ComplexityIndicator,
    AccessibilityUtils
};
