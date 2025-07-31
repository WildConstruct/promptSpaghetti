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
}
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

export declare }
}
interface CorrectionsThemeProviderProps {
    children: ReactNode;
    initialTheme?: 'light' | 'dark';

export declare export declare             color: string;
            border: string;
            padding: string;
            borderRadius: string;
            fontSize: string;
            fontWeight: number;
            cursor: string;
            transition: string;
}
        };
        secondary: {
            backgroundColor: string;
            color: string;
            border: string;
            padding: string;
            borderRadius: string;
            fontSize: string;
            fontWeight: number;
            cursor: string;
            transition: string;
        };
        danger: {
            backgroundColor: string;
            color: string;
            border: string;
            padding: string;
            borderRadius: string;
            fontSize: string;
            fontWeight: number;
            cursor: string;
            transition: string;
        };
    };
    input: {
        base: {
            backgroundColor: string;
            color: string;
            border: string;
            padding: string;
            borderRadius: string;
            fontSize: string;
            transition: string;
            '&:focus': {
                borderColor: string;
                outline: string;
            };
        };
        search: {
            backgroundColor: string;
            color: string;
            border: string;
            padding: string;
            borderRadius: string;
            fontSize: string;
            width: string;
            transition: string;
            '&:focus': {
                borderColor: string;
                outline: string;
            };
        };
    };
    card: {
        base: {
            backgroundColor: string;
            border: string;
            borderRadius: string;
            padding: string;
            boxShadow: string;
            transition: string;
        };
        elevated: {
            backgroundColor: string;
            border: string;
            borderRadius: string;
            padding: string;
            boxShadow: string;
            transition: string;
        };
    };
    panel: {
        base: {
            backgroundColor: string;
            color: string;
            borderLeft: string;
            height: string;
            overflow: string;
            display: string;
            flexDirection: "column";
            transition: string;
        };
        mobile: {
            backgroundColor: string;
            color: string;
            height: string;
            width: string;
            overflow: string;
            display: string;
            flexDirection: "column"
  };
    };
    status: {
        active: {
            color: string;
        };
        inactive: {
            color: string;
        };
        regex: {
            backgroundColor: string;
            color: string;
            padding: string;
            borderRadius: string;
            fontSize: string;
            fontWeight: number;
        };
    };
    text: {
        heading: {
            fontSize: string;
            fontWeight: number;
            color: string;
            lineHeight: number;
        };
        subheading: {
            fontSize: string;
            fontWeight: number;
            color: string;
            lineHeight: number;
        };
        body: {
            fontSize: string;
            fontWeight: number;
            color: string;
            lineHeight: number;
        };
        caption: {
            fontSize: string;
            fontWeight: number;
            color: string;
            lineHeight: number;
        };
    };
};
export declare const mediaQueries: {
    mobile: string;
    tablet: string;
    desktop: string;
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
export {};
//# sourceMappingURL=corrections-theme.d.ts.map