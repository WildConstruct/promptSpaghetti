export var UIComponentCategory;
(function (UIComponentCategory) {
    UIComponentCategory["EDITOR"] = "editor";
    UIComponentCategory["PANEL"] = "panel";
    UIComponentCategory["MODAL"] = "modal";
    UIComponentCategory["TOOLBAR"] = "toolbar";
    UIComponentCategory["MENU"] = "menu";
    UIComponentCategory["WIDGET"] = "widget";
    UIComponentCategory["OVERLAY"] = "overlay";
    UIComponentCategory["CUSTOM"] = "custom";
    // UI Component UI Configuration
    UIComponentCategory[UIComponentCategory["export"] = void 0] = "export";
    UIComponentCategory[UIComponentCategory["interface"] = void 0] = "interface";
    UIComponentCategory[UIComponentCategory["UIComponentUIConfiguration"] = void 0] = "UIComponentUIConfiguration";
})(UIComponentCategory || (UIComponentCategory = {}));
{
    // Layout
    layout ?  : UIComponentLayout;
    // Styling
    styling ?  : UIComponentStyling;
    // Responsive behavior
    responsive ?  : UIComponentResponsive;
    // Accessibility
    accessibility ?  : UIComponentAccessibility;
    // UI Component Layout
}
export var MenuTarget;
(function (MenuTarget) {
    MenuTarget["MAIN_MENU"] = "main";
    MenuTarget["CONTEXT_MENU"] = "context";
    MenuTarget["TOOLBAR"] = "toolbar";
    MenuTarget["PALETTE"] = "palette";
    MenuTarget["INSPECTOR"] = "inspector";
    MenuTarget["GRAPH"] = "graph";
    MenuTarget["CUSTOM"] = "custom";
    // Keybinding Contribution
    MenuTarget[MenuTarget["export"] = void 0] = "export";
    MenuTarget[MenuTarget["interface"] = void 0] = "interface";
    MenuTarget[MenuTarget["KeybindingContribution"] = void 0] = "KeybindingContribution";
})(MenuTarget || (MenuTarget = {}));
{
    id: string;
    key: string;
    command: string;
    when ?  : string; // Boolean expression,
    args ?  : any;
    // Platform-specific
    mac ?  : string;
    win ?  : string;
    linux ?  : string;
    // Theme Interface
}
export var UIExtensionHelpers;
(function (UIExtensionHelpers) {
    function createTheme(partial) {
        return {
            id: partial.id || 'custom-theme',
            name: partial.name || 'Custom Theme',
            description: partial.description || 'A custom theme',
            type: partial.type || 'light',
            colors: {
                primary: '#007bff',
                secondary: '#6c757d',
                accent: '#17a2b8',
                background: '#ffffff',
                surface: '#f8f9fa',
                text: '#212529',
                textSecondary: '#6c757d',
                border: '#e9ecef',
                error: '#dc3545',
                warning: '#ffc107',
                success: '#28a745',
                info: '#17a2b8',
                ...partial.colors
            },
            typography: {
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: {
                    xs: '0.75rem',
                    sm: '0.875rem',
                    md: '1rem',
                    lg: '1.125rem',
                    xl: '1.25rem',
                    '2xl': '1.5rem',
                    '3xl': '1.875rem',
                },
                fontWeight: {
                    light: 300,
                    normal: 400,
                    medium: 500,
                    semibold: 600,
                    bold: 700,
                },
                lineHeight: {
                    tight: 1.25,
                    normal: 1.5,
                    relaxed: 1.75,
                },
                letterSpacing: {
                    tight: '-0.025em',
                    normal: '0em',
                    wide: '0.025em',
                },
                ...partial.typography
            },
            spacing: {
                xs: '0.25rem',
                sm: '0.5rem',
                md: '1rem',
                lg: '1.5rem',
                xl: '2rem',
                '2xl': '3rem',
                '3xl': '4rem',
                ...partial.spacing
            },
            shadows: {
                sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
                md: '0 1px 3px rgba(0, 0, 0, 0.1)',
                lg: '0 4px 6px rgba(0, 0, 0, 0.1)',
                xl: '0 10px 15px rgba(0, 0, 0, 0.1)',
                none: 'none',
                ...partial.shadows
            },
            borders: {
                width: {
                    thin: '1px',
                    normal: '2px',
                    thick: '4px',
                },
                radius: {
                    none: '0',
                    sm: '0.125rem',
                    md: '0.25rem',
                    lg: '0.5rem',
                    full: '9999px',
                },
                style: {
                    solid: 'solid',
                    dashed: 'dashed',
                    dotted: 'dotted',
                },
                ...partial.borders
            },
            transitions: {
                duration: {
                    fast: '150ms',
                    normal: '200ms',
                    slow: '300ms',
                },
                easing: {
                    linear: 'linear',
                    ease: 'ease',
                    easeIn: 'ease-in',
                    easeOut: 'ease-out',
                    easeInOut: 'ease-in-out',
                },
                ...partial.transitions
            },
            custom: partial.custom
        };
        function createCommand(partial) {
            return {
                id: partial.id || 'custom-command',
                title: partial.title || 'Custom Command',
                description: partial.description,
                category: partial.category,
                icon: partial.icon,
                handler: partial.handler || (() => { }),
                enablement: partial.enablement,
                keybinding: partial.keybinding,
                context: partial.context
            };
            function createMenu(partial) {
                return {
                    id: partial.id || 'custom-menu',
                    label: partial.label || 'Custom Menu',
                    icon: partial.icon,
                    order: partial.order || 0,
                    type: partial.type || 'item',
                    command: partial.command,
                    submenu: partial.submenu,
                    when: partial.when,
                    menu: partial.menu || MenuTarget.CUSTOM,
                };
                function validateUIComponent(definition) {
                    const errors = [];
                    const warnings = [];
                    // Basic validation
                    if (!definition.id)
                        errors.push('Component ID is required');
                    if (!definition.name)
                        errors.push('Component name is required');
                    if (!definition.component)
                        errors.push('Component class is required');
                    // React component validation
                    if (definition.component && typeof definition.component !== 'function') {
                        errors.push('Component must be a valid React component');
                        return {
                            valid: errors.length === 0,
                            errors,
                            warnings
                        };
                    }
                }
                UIExtensionHelpers.validateUIComponent = validateUIComponent;
            }
            UIExtensionHelpers.createMenu = createMenu;
        }
        UIExtensionHelpers.createCommand = createCommand;
    }
    UIExtensionHelpers.createTheme = createTheme;
})(UIExtensionHelpers || (UIExtensionHelpers = {}));
