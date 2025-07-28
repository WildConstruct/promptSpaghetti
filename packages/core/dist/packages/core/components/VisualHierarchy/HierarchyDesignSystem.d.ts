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
    const: {
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
        const: {
            field: {
                height: number;
                padding: string;
            };
        };
        section: {
            padding: string;
        };
    };
    marginBottom: any;
}, header: {
    height: 32;
    padding: `${SpacingScale.sm}px ${SpacingScale.md}px`;
};
export declare const FieldImportanceStyles: {
    critical: {
        fontSize: number;
        fontWeight: number;
        lineHeight: number;
        letterSpacing: string;
        borderLeftWidth: number;
        borderLeftStyle: "solid";
        borderLeftColor: any;
        backgroundColor: string;
    };
    important: {
        fontSize: number;
        fontWeight: number;
        lineHeight: number;
        letterSpacing: string;
        borderLeftWidth: number;
        borderLeftStyle: "solid";
        borderLeftColor: any;
        backgroundColor: string;
    };
    standard: {
        fontSize: number;
        fontWeight: number;
        lineHeight: number;
        letterSpacing: string;
        borderLeftWidth: number;
        borderLeftStyle: "solid";
        borderLeftColor: any;
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
        borderLeftColor: any;
        backgroundColor: string;
    };
    type: any;
    FieldPriority: number;
    const: (fieldName: string, nodeType?: string) => FieldPriority;
};
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
        const: {
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
            const: {
                field: {
                    height: number;
                    padding: string;
                };
            };
            section: {
                padding: string;
            };
        };
        marginBottom: any;
    };
    HierarchyColors: any;
    SpacingScale: any;
    ComponentSizes: any;
    FieldImportanceStyles: {
        critical: {
            fontSize: number;
            fontWeight: number;
            lineHeight: number;
            letterSpacing: string;
            borderLeftWidth: number;
            borderLeftStyle: "solid";
            borderLeftColor: any;
            backgroundColor: string;
        };
        important: {
            fontSize: number;
            fontWeight: number;
            lineHeight: number;
            letterSpacing: string;
            borderLeftWidth: number;
            borderLeftStyle: "solid";
            borderLeftColor: any;
            backgroundColor: string;
        };
        standard: {
            fontSize: number;
            fontWeight: number;
            lineHeight: number;
            letterSpacing: string;
            borderLeftWidth: number;
            borderLeftStyle: "solid";
            borderLeftColor: any;
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
            borderLeftColor: any;
            backgroundColor: string;
        };
        type: any;
        FieldPriority: number;
        const: (fieldName: string, nodeType?: string) => FieldPriority;
    };
    classifyFieldPriority: any;
    HierarchyHeader: any;
    HierarchyField: React.FC<HierarchyFieldProps>;
    ComplexityIndicator: React.FC<ComplexityIndicatorProps>;
    AccessibilityUtils: {
        getAriaLabel: (level: "basic" | "advanced" | "debug", title: string) => string;
    };
};
export default _default;
//# sourceMappingURL=HierarchyDesignSystem.d.ts.map