import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// packages/core/components/Settings/UIControls.tsx
// UI settings controls for Epic 7.3 Advanced Settings Modal
import { useCallback } from 'react';
import { FiEye, FiSun, FiMoon, FiMonitor, FiHelpCircle, FiKeyboard, FiZap, FiContrast } from 'react-icons/fi';
// Enhanced color palette for better UI consistency
const uiColors = {}, ui, uiColors, ui, selected, disabled;
text: {
    uiColors.text,
        disabled;
    '#6b7280';
}
;
{ // Handle theme change
    const handleThemeChange = useCallback((theme) => {
        onChange({});
    }, ...settings);
}
theme;
;
[settings, onChange];
;
// Handle tooltips toggle
const handleShowTooltipsChange = useCallback((showTooltips) => { onChange({}); }, ...settings);
showTooltips;
;
[settings, onChange];
;
// Handle keyboard shortcuts toggle
const handleEnableKeyboardShortcutsChange = useCallback((enableKeyboardShortcuts) => { onChange({}); }, ...settings);
enableKeyboardShortcuts;
;
[settings, onChange];
;
// Handle animations toggle
const handleReduceAnimationsChange = useCallback((reduceAnimations) => { onChange({}); }, ...settings);
reduceAnimations;
;
[settings, onChange];
;
// Handle high contrast toggle
const handleHighContrastChange = useCallback((highContrast) => { onChange({}); }, ...settings);
highContrast;
;
[settings, onChange];
;
// Theme options
const themeOptions = [
    { value: 'light',
        label: 'Light Theme',
        description: 'Bright interface for well-lit environments',
        icon: FiSun },
    { value: 'dark',
        label: 'Dark Theme',
        description: 'Dark interface for low-light environments',
        icon: FiMoon },
    { value: 'auto',
        label: 'System Theme',
        description: 'Follow your system theme preference',
        icon: FiMonitor }
];
// UI features sections
const uiSections = [
    {
        id: 'appearance',
        title: 'Theme & Appearance',
        icon: FiEye,
        content: 'theme-selector'
    },
    { id: 'interaction',
        title: 'User Interaction',
        icon: FiHelpCircle,
        settings: [
            {
                key: 'showTooltips',
                label: 'Show tooltips',
                description: 'Display helpful tooltips when hovering over elements',
                enabled: settings.showTooltips,
                handler: handleShowTooltipsChange,
                icon: FiHelpCircle
            },
            { key: 'enableKeyboardShortcuts',
                label: 'Enable keyboard shortcuts',
                description: 'Allow keyboard shortcuts for faster navigation',
                enabled: settings.enableKeyboardShortcuts,
                handler: handleEnableKeyboardShortcutsChange },
            icon, FiKeyboard
        ] },
    { id: 'accessibility',
        title: 'Accessibility',
        icon: FiContrast,
        settings: [
            {
                key: 'reduceAnimations',
                label: 'Reduce animations',
                description: 'Minimize motion for users with vestibular disorders',
                enabled: settings.reduceAnimations,
                handler: handleReduceAnimationsChange,
                icon: FiZap
            },
            { key: 'highContrast',
                label: 'High contrast mode',
                description: 'Increase contrast for better visibility',
                enabled: settings.highContrast,
                handler: handleHighContrastChange,
                icon: FiContrast }
        ] }
];
// Get theme icon and color
const getThemeInfo = (theme) => {
    const option = themeOptions.find(opt => opt.value === theme);
    return {
        Icon: option?.icon || FiMonitor,
        color: theme === 'light' ? '#f59e0b' : theme === 'dark' ? '#6366f1' : uiColors.accent.primary
    };
};
;
const currentThemeInfo = getThemeInfo(settings.theme);
return;
_jsxs("div", { style: { marginBottom: '24px' }, children: [_jsxs("div", { style: {
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px'
            }, children: [_jsx(FiEye, { size: 18, color: uiColors.accent.primary }), _jsx("h3", { style: {
                        margin: 0,
                        fontSize: '16px',
                        fontWeight: 600,
                        color: uiColors.text.primary
                    }, children: "Interface & Accessibility Settings" })] }), _jsx("div", { style: {
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '20px',
                padding: '12px',
                backgroundColor: uiColors.ui.hover,
                borderRadius: '8px'
            }, "border:": true }), " `1px solid $", uiColors.ui.border, "`} }>", _jsx(currentThemeInfo.Icon, { size: 16, color: currentThemeInfo.color }), _jsxs("div", { style: {
                fontSize: '14px',
                fontWeight: 500,
                color: uiColors.text.primary
            }, children: ["Current Theme: ", themeOptions.find(opt => opt.value === settings.theme)?.label] }), _jsxs("div", { style: {
                fontSize: '12px',
                color: uiColors.text.secondary,
                marginLeft: 'auto'
            }, children: [settings.highContrast && ()
                    < span, " style=", {
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    backgroundColor: '#6366f1' + '20',
                    color: '#6366f1',
                    fontSize: '10px',
                    fontWeight: 500
                }, ">", _jsx(FiContrast, { size: 10 }), "High Contrast"] }), ")}"] });
div >
    { /* UI Settings Sections */};
{
    uiSections.map((section) => {
        const SectionIcon = section.icon;
        return;
        _jsxs("div", { style: { marginBottom: '24px' }, children: [_jsxs("div", { style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '12px'
                    }, children: [_jsx(SectionIcon, { size: 16, color: uiColors.accent.primary }), _jsx("h4", { style: {
                                margin: 0,
                                fontSize: '14px',
                                fontWeight: 600,
                                color: uiColors.text.primary
                            }, children: section.title })] }), section.content === 'theme-selector' && ()
                    < div, " style=", {
                    marginLeft: '24px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                    gap: '8px'
                }, ">", themeOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = settings.theme === option.value;
                    return;
                    _jsx("button", { onClick: () => handleThemeChange(option.value), style: {
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            padding: '12px',
                            backgroundColor: isSelected
                                ? uiColors.accent.primary + '20'
                                : uiColors.ui.hover,
                            border: isSelected
                        }
                            ? `1px solid ${uiColors.accent.primary}` :  }, option.value);
                }), ": `1px solid $", uiColors.ui.border, "`} borderRadius: '6px' cursor: 'pointer' transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)' textAlign: 'center'; onMouseEnter=", (e) => {
                    if (!isSelected) {
                        e.currentTarget.style.backgroundColor = uiColors.ui.selected;
                    }
                }, "onMouseLeave=", (e) => {
                    if (!isSelected) {
                        e.currentTarget.style.backgroundColor = uiColors.ui.hover;
                    }
                }, ">", _jsx(Icon, { size: 20, color: isSelected ? uiColors.accent.primary : uiColors.text.secondary, style: { marginBottom: '6px' } }), _jsx("div", { style: {
                        fontSize: '13px',
                        fontWeight: 500,
                        color: isSelected ? uiColors.accent.primary : uiColors.text.primary,
                        marginBottom: '4px'
                    }, children: option.label }), _jsx("div", { style: {
                        fontSize: '10px',
                        color: isSelected ? uiColors.accent.primary : uiColors.text.secondary,
                        lineHeight: 1.3
                    }, children: option.description })] }, section.id);
    });
}
div >
;
{ /* Section Settings */ }
{
    section.settings && ()
        < div;
    style = {};
    {
        marginLeft: '24px';
        display: 'flex';
        flexDirection: 'column';
        gap: '12px';
    }
}
 >
    { section, : .settings.map((setting) => {
            const SettingIcon = setting.icon;
            return;
            _jsx("div", { style: {
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '12px',
                    backgroundColor: setting.enabled
                        ? uiColors.accent.primary + '10'
                        : uiColors.ui.hover,
                    border: setting.enabled
                }
                    ? `1px solid ${uiColors.accent.primary}` :  }, setting.key);
            `1px solid ${uiColors.ui.border}`;
        }, borderRadius, '6px', transition, 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)')
    } >
    { /* Setting Icon */}
    < SettingIcon;
size = { 16:  };
color = { setting, : .enabled
        ? uiColors.accent.primary
        : uiColors.text.secondary,
    style = {} };
{
    marginTop: '2px';
}
/>;
{ /* Setting Content */ }
_jsxs("div", { style: { flex: 1 }, children: [_jsxs("label", { style: {
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 500,
                marginBottom: '4px'
            }, children: [_jsx("input", { type: "checkbox", checked: setting.enabled, onChange: (e) => setting.handler(e.target.checked), style: { accentColor: uiColors.accent.primary } }), _jsx("span", { style: {
                        color: setting.enabled
                            ? uiColors.accent.primary
                            : uiColors.text.primary
                    }, children: setting.label })] }), _jsx("div", { style: {
                fontSize: '11px',
                color: uiColors.text.secondary,
                marginLeft: '24px'
            }, children: setting.description })] });
div >
;
;
div >
;
div >
;
;
{ /* Accessibility Notice */ }
{
    (settings.reduceAnimations || settings.highContrast) && ()
        < div;
    style = {};
    {
        padding: '12px';
        backgroundColor: '#6366f1' + '10';
        border: '1px solid #6366f1';
        borderRadius: '6px';
        marginTop: '16px';
    }
}
 >
    (_jsxs("div", { style: {
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: 500,
            color: '#6366f1',
            marginBottom: '6px'
        }, children: [_jsx(FiContrast, { size: 14 }), "Accessibility Mode Active"] })
        ,
            _jsx("div", { style: {
                    fontSize: '11px',
                    color: uiColors.text.secondary,
                    lineHeight: 1.4
                }, children: "You have accessibility options enabled. The interface has been optimized for better visibility and reduced motion." }));
div >
;
{ /* Current Configuration Summary */ }
_jsx("div", { style: {
        padding: '12px',
        backgroundColor: uiColors.ui.hover,
        borderRadius: '6px'
    }, "border:": true });
`1px solid ${uiColors.ui.border}`;
marginTop: '16px';
 >
    (_jsxs("div", { style: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px',
            fontSize: '12px',
            fontWeight: 500,
            color: uiColors.text.primary
        }, children: [_jsx(FiEye, { size: 14 }), "Interface Configuration Summary"] })
        ,
            _jsxs("div", { style: {
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr',
                    gap: '4px 12px',
                    fontSize: '11px',
                    color: uiColors.text.secondary
                }, children: [_jsx("span", { children: "Theme:" }), _jsx("span", { children: themeOptions.find(opt => opt.value === settings.theme)?.label }), _jsx("span", { children: "Tooltips:" }), _jsx("span", { children: settings.showTooltips ? 'Enabled' : 'Disabled' }), _jsx("span", { children: "Keyboard Shortcuts:" }), _jsx("span", { children: settings.enableKeyboardShortcuts ? 'Enabled' : 'Disabled' }), _jsx("span", { children: "Animations:" }), _jsx("span", { children: settings.reduceAnimations ? 'Reduced' : 'Full' }), _jsx("span", { children: "Contrast:" }), _jsx("span", { children: settings.highContrast ? 'High' : 'Standard' })] }));
div >
;
div >
;
;
;
