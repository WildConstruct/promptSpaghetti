export interface CorrectionsTheme {
    colors: {
        primary: string;
        secondary: string;
        success: string;
        warning: string;
        error: string;
        info: string;
        background: {
            primary: string;
            secondary: string;
            tertiary: string;
            elevated: string;
            overlay: string;
        };
        text: {
            primary: string;
            secondary: string;
            disabled: string;
            inverse: string;
        };
        border: {
            primary: string;
            secondary: string;
            active: string;
        };
        status: {
            active: string;
            inactive: string;
            regex: string;
            priority: string;
        };
    };
    spacing: {
        xs: string;
        sm: string;
        md: string;
        lg: string;
        xl: string;
        xxl: string;
    };
    typography: {
        fontFamily: string;
        fontSize: {
            xs: string;
            sm: string;
            md: string;
            lg: string;
            xl: string;
            xxl: string;
        };
        fontWeight: {
            normal: number;
            medium: number;
            semibold: number;
            bold: number;
        };
        lineHeight: {
            tight: number;
            normal: number;
            loose: number;
        };
    };
    shadows: {
        sm: string;
        md: string;
        lg: string;
        xl: string;
    };
    radius: {
        none: string;
        xs: string;
        sm: string;
        md: string;
        lg: string;
        xl: string;
        full: string;
    };
    transitions: {
        fast: string;
        normal: string;
        slow: string;
    };
    breakpoints: {
        mobile: string;
        tablet: string;
        desktop: string;
    };
}
export declare const darkTheme: CorrectionsTheme, createContext: any, useContext: any, ReactNode: any, from: any;
export declare const useCorrectionsTheme: () => any, secondary: {
    backgroundColor: theme.colors.background.secondary;
    color: theme.colors.text.primary;
    border: `1px solid ${theme.colors.border.primary}`;
};
export declare const animations: {
    fadeIn: {
        from: {
            opacity: number;
        };
        to: {
            opacity: number;
        };
    };
    slideIn: {
        from: {
            transform: string;
        };
        to: {
            transform: string;
        };
    };
    scaleIn: {
        from: {
            transform: string;
            opacity: number;
        };
        to: {
            transform: string;
            opacity: number;
        };
    };
};
//# sourceMappingURL=corrections-theme.d.ts.map