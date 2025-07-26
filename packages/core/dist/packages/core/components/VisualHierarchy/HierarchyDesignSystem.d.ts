import React from 'react';
/**
 * Epic 8.4 Task 2 - Visual Hierarchy Design System
 *
 * Defines consistent visual cues for field importance and information architecture
 * across the progressive disclosure system.
 */
export declare const TypographyScale: {
    primary: {
        fontSize: number;
        fontWeight: number;
        lineHeight: number;
        letterSpacing: string;
    };
    secondary: {
        fontSize: number;
        fontWeight: number;
        lineHeight: number;
        letterSpacing: string;
    };
    tertiary: {
        fontSize: number;
        fontWeight: number;
        lineHeight: number;
        letterSpacing: string;
    };
    caption: {
        fontSize: number;
        fontWeight: number;
        lineHeight: number;
        letterSpacing: string;
    };
    micro: {
        fontSize: number;
        fontWeight: number;
        lineHeight: number;
        letterSpacing: string;
    };
};
export declare const HierarchyColors: {
    basic: {
        primary: string;
        secondary: string;
        background: string;
        border: string;
        text: string;
        accent: string;
    };
    advanced: {
        primary: string;
        secondary: string;
        background: string;
        border: string;
        text: string;
        accent: string;
    };
    debug: {
        primary: string;
        secondary: string;
        background: string;
        border: string;
        text: string;
        accent: string;
    };
    neutral: {
        primary: string;
        secondary: string;
        background: string;
        border: string;
        text: string;
        accent: string;
    };
};
export declare const SpacingScale: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    xxxl: number;
};
export declare const ComponentSizes: {
    field: {
        height: number;
        padding: string;
    };
    section: {
        padding: string;
        marginBottom: number;
    };
    header: {
        height: number;
        padding: string;
    };
};
export declare const FieldImportanceStyles: {
    critical: {
        fontSize: number;
        fontWeight: number;
        lineHeight: number;
        letterSpacing: string;
        borderLeftWidth: number;
        borderLeftStyle: "solid";
        borderLeftColor: string;
        backgroundColor: string;
    };
    important: {
        fontSize: number;
        fontWeight: number;
        lineHeight: number;
        letterSpacing: string;
        borderLeftWidth: number;
        borderLeftStyle: "solid";
        borderLeftColor: string;
        backgroundColor: string;
    };
    standard: {
        fontSize: number;
        fontWeight: number;
        lineHeight: number;
        letterSpacing: string;
        borderLeftWidth: number;
        borderLeftStyle: "solid";
        borderLeftColor: string;
        backgroundColor: string;
    };
    supplementary: {
        opacity: number;
        fontSize: number;
        fontWeight: number;
        lineHeight: number;
        letterSpacing: string;
        borderLeftWidth: number;
        borderLeftStyle: "solid";
        borderLeftColor: string;
        backgroundColor: string;
    };
};
export type FieldPriority = 'critical' | 'important' | 'standard' | 'supplementary';
export declare const classifyFieldPriority: (fieldName: string, nodeType?: string) => FieldPriority;
export interface HierarchyHeaderProps {
    title: string;
    level: 'basic' | 'advanced' | 'debug';
    priority?: FieldPriority;
    description?: string;
    icon?: string;
    isCollapsible?: boolean;
    isExpanded?: boolean;
    onToggle?: () => void;
    children?: React.ReactNode;
}
export declare const HierarchyHeader: React.FC<HierarchyHeaderProps>;
export interface HierarchyFieldProps {
    priority: FieldPriority;
    level: 'basic' | 'advanced' | 'debug';
    children: React.ReactNode;
    label?: string;
    description?: string;
    required?: boolean;
    error?: string;
    className?: string;
}
export declare const HierarchyField: React.FC<HierarchyFieldProps>;
export interface ComplexityIndicatorProps {
    level: 'basic' | 'advanced' | 'debug';
    showLabel?: boolean;
    size?: 'small' | 'medium' | 'large';
}
export declare const ComplexityIndicator: React.FC<ComplexityIndicatorProps>;
export declare const AccessibilityUtils: {
    getAriaLabel: (level: "basic" | "advanced" | "debug", title: string) => string;
    getAriaDescription: (priority: FieldPriority) => string;
    getFocusableElements: (container: HTMLElement) => HTMLElement[];
};
declare const _default: {
    TypographyScale: {
        primary: {
            fontSize: number;
            fontWeight: number;
            lineHeight: number;
            letterSpacing: string;
        };
        secondary: {
            fontSize: number;
            fontWeight: number;
            lineHeight: number;
            letterSpacing: string;
        };
        tertiary: {
            fontSize: number;
            fontWeight: number;
            lineHeight: number;
            letterSpacing: string;
        };
        caption: {
            fontSize: number;
            fontWeight: number;
            lineHeight: number;
            letterSpacing: string;
        };
        micro: {
            fontSize: number;
            fontWeight: number;
            lineHeight: number;
            letterSpacing: string;
        };
    };
    HierarchyColors: {
        basic: {
            primary: string;
            secondary: string;
            background: string;
            border: string;
            text: string;
            accent: string;
        };
        advanced: {
            primary: string;
            secondary: string;
            background: string;
            border: string;
            text: string;
            accent: string;
        };
        debug: {
            primary: string;
            secondary: string;
            background: string;
            border: string;
            text: string;
            accent: string;
        };
        neutral: {
            primary: string;
            secondary: string;
            background: string;
            border: string;
            text: string;
            accent: string;
        };
    };
    SpacingScale: {
        xs: number;
        sm: number;
        md: number;
        lg: number;
        xl: number;
        xxl: number;
        xxxl: number;
    };
    ComponentSizes: {
        field: {
            height: number;
            padding: string;
        };
        section: {
            padding: string;
            marginBottom: number;
        };
        header: {
            height: number;
            padding: string;
        };
    };
    FieldImportanceStyles: {
        critical: {
            fontSize: number;
            fontWeight: number;
            lineHeight: number;
            letterSpacing: string;
            borderLeftWidth: number;
            borderLeftStyle: "solid";
            borderLeftColor: string;
            backgroundColor: string;
        };
        important: {
            fontSize: number;
            fontWeight: number;
            lineHeight: number;
            letterSpacing: string;
            borderLeftWidth: number;
            borderLeftStyle: "solid";
            borderLeftColor: string;
            backgroundColor: string;
        };
        standard: {
            fontSize: number;
            fontWeight: number;
            lineHeight: number;
            letterSpacing: string;
            borderLeftWidth: number;
            borderLeftStyle: "solid";
            borderLeftColor: string;
            backgroundColor: string;
        };
        supplementary: {
            opacity: number;
            fontSize: number;
            fontWeight: number;
            lineHeight: number;
            letterSpacing: string;
            borderLeftWidth: number;
            borderLeftStyle: "solid";
            borderLeftColor: string;
            backgroundColor: string;
        };
    };
    classifyFieldPriority: (fieldName: string, nodeType?: string) => FieldPriority;
    HierarchyHeader: React.FC<HierarchyHeaderProps>;
    HierarchyField: React.FC<HierarchyFieldProps>;
    ComplexityIndicator: React.FC<ComplexityIndicatorProps>;
    AccessibilityUtils: {
        getAriaLabel: (level: "basic" | "advanced" | "debug", title: string) => string;
        getAriaDescription: (priority: FieldPriority) => string;
        getFocusableElements: (container: HTMLElement) => HTMLElement[];
    };
};
export default _default;
//# sourceMappingURL=HierarchyDesignSystem.d.ts.map