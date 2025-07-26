import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Adaptive navigation patterns for different platforms
 */
import React, { useState } from 'react';
import { deviceDetector } from '../responsive/device-detection';
import { useBreakpoint } from '../responsive/hooks';
import { IOSNavigationBar, IOSTabBar } from './ios/IOSAdaptations';
import { MaterialAppBar, MaterialBottomNav } from './android/AndroidAdaptations';
/**
 * Main adaptive navigation component
 */
export const AdaptiveNavigation = ({ title, items, activeItem, onNavigate, onBack, actions, showBackButton = false, variant = 'auto' }) => {
    const platform = deviceDetector.getPlatform();
    const os = deviceDetector.getOS();
    const breakpoint = useBreakpoint();
    const [isCollapsed, setIsCollapsed] = useState(false);
    // Determine navigation variant based on platform and screen size
    const getNavigationVariant = () => {
        if (variant !== 'auto')
            return variant;
        if (platform === 'mobile') {
            return 'bottom';
        }
        if (breakpoint === 'xs' || breakpoint === 'sm') {
            return 'bottom';
        }
        if (breakpoint === 'md') {
            return 'rail';
        }
        return 'side';
    };
    const navVariant = getNavigationVariant();
    // Mobile bottom navigation
    if (navVariant === 'bottom') {
        const bottomItems = items.slice(0, 5).map(item => ({
            id: item.id,
            label: item.label,
            icon: item.icon,
            activeIcon: item.activeIcon,
            badge: item.badge
        }));
        if (os === 'iOS') {
            return (_jsxs(_Fragment, { children: [title && (_jsx(IOSNavigationBar, { title: title, leftItems: showBackButton && onBack ? [] : undefined, rightItems: actions, onBack: showBackButton ? onBack : undefined })), _jsx(IOSTabBar, { items: bottomItems, activeItem: activeItem, onItemSelect: onNavigate })] }));
        }
        return (_jsxs(_Fragment, { children: [title && (_jsx(MaterialAppBar, { title: title, navigationIcon: showBackButton && onBack ? (_jsx("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "currentColor", children: _jsx("path", { d: "M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" }) })) : undefined, actions: actions, onNavigationClick: onBack })), _jsx(MaterialBottomNav, { items: bottomItems, activeItem: activeItem, onItemSelect: onNavigate })] }));
    }
    // Desktop side navigation
    if (navVariant === 'side') {
        return (_jsx("div", { className: "adaptive-navigation-side", style: {
                display: 'flex',
                height: '100vh'
            }, children: _jsxs("nav", { style: {
                    width: isCollapsed ? '64px' : '280px',
                    backgroundColor: 'var(--color-surface)',
                    borderRight: '1px solid var(--color-border)',
                    transition: 'width 0.3s ease',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }, children: [_jsxs("div", { style: {
                            padding: '16px',
                            borderBottom: '1px solid var(--color-border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }, children: [!isCollapsed && title && (_jsx("h2", { style: { margin: 0, fontSize: '20px' }, children: title })), _jsx("button", { onClick: () => setIsCollapsed(!isCollapsed), style: {
                                    width: '32px',
                                    height: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }, children: _jsx("svg", { width: "20", height: "20", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { d: isCollapsed ?
                                            'M7 4L13 10L7 16' :
                                            'M13 16L7 10L13 4' }) }) })] }), _jsx("div", { style: { flex: 1, padding: '8px' }, children: items.map(item => (_jsx(NavItem, { item: item, isActive: activeItem === item.id, isCollapsed: isCollapsed, onClick: () => onNavigate(item.id) }, item.id))) }), actions && (_jsx("div", { style: {
                            padding: '16px',
                            borderTop: '1px solid var(--color-border)',
                            display: 'flex',
                            gap: '8px',
                            justifyContent: isCollapsed ? 'center' : 'flex-end'
                        }, children: actions }))] }) }));
    }
    // Navigation rail (narrow side nav)
    if (navVariant === 'rail') {
        return (_jsx("nav", { className: "adaptive-navigation-rail", style: {
                position: 'fixed',
                left: 0,
                top: 0,
                bottom: 0,
                width: '80px',
                backgroundColor: 'var(--color-surface)',
                borderRight: '1px solid var(--color-border)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '16px 0'
            }, children: items.slice(0, 7).map(item => (_jsxs("button", { onClick: () => onNavigate(item.id), style: {
                    width: '56px',
                    height: '56px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    backgroundColor: activeItem === item.id ? 'var(--color-primary-container)' : 'transparent',
                    border: 'none',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    margin: '4px 0',
                    position: 'relative',
                    color: activeItem === item.id ? 'var(--color-on-primary-container)' : 'var(--color-on-surface)'
                }, children: [_jsx("div", { style: { fontSize: '24px' }, children: activeItem === item.id && item.activeIcon ? item.activeIcon : item.icon }), _jsx("span", { style: { fontSize: '12px' }, children: item.label }), item.badge && item.badge > 0 && (_jsx("div", { style: {
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            backgroundColor: 'var(--color-error)',
                            color: 'white',
                            borderRadius: '10px',
                            padding: '2px 6px',
                            fontSize: '10px',
                            minWidth: '16px'
                        }, children: item.badge > 99 ? '99+' : item.badge }))] }, item.id))) }));
    }
    // Top navigation (desktop)
    return (_jsxs("nav", { className: "adaptive-navigation-top", style: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '64px',
            backgroundColor: 'var(--color-surface)',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            zIndex: 1000
        }, children: [showBackButton && onBack && (_jsxs("button", { onClick: onBack, style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px',
                    marginRight: '16px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--color-primary)'
                }, children: [_jsx("svg", { width: "20", height: "20", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { d: "M15 18l-8-8 8-8" }) }), "Back"] })), title && (_jsx("h1", { style: { margin: 0, fontSize: '20px', marginRight: 'auto' }, children: title })), _jsx("div", { style: { display: 'flex', gap: '24px', alignItems: 'center' }, children: items.slice(0, 6).map(item => (_jsxs("button", { onClick: () => onNavigate(item.id), style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        borderBottom: activeItem === item.id ? '2px solid var(--color-primary)' : '2px solid transparent',
                        cursor: 'pointer',
                        color: activeItem === item.id ? 'var(--color-primary)' : 'var(--color-on-surface)',
                        fontWeight: activeItem === item.id ? 600 : 400
                    }, children: [item.icon, item.label] }, item.id))) }), actions && (_jsx("div", { style: { display: 'flex', gap: '8px', marginLeft: '24px' }, children: actions }))] }));
};
const NavItem = ({ item, isActive, isCollapsed, onClick }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    return (_jsxs("div", { children: [_jsxs("button", { onClick: () => {
                    if (item.children) {
                        setIsExpanded(!isExpanded);
                    }
                    else {
                        onClick();
                    }
                }, style: {
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    backgroundColor: isActive ? 'var(--color-primary-container)' : 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    color: isActive ? 'var(--color-on-primary-container)' : 'var(--color-on-surface)',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                }, children: [_jsx("div", { style: { fontSize: '20px', width: '20px', flexShrink: 0 }, children: isActive && item.activeIcon ? item.activeIcon : item.icon }), !isCollapsed && (_jsxs(_Fragment, { children: [_jsx("span", { style: { flex: 1, textAlign: 'left' }, children: item.label }), item.badge && item.badge > 0 && (_jsx("div", { style: {
                                    backgroundColor: 'var(--color-error)',
                                    color: 'white',
                                    borderRadius: '10px',
                                    padding: '2px 8px',
                                    fontSize: '12px',
                                    minWidth: '20px',
                                    textAlign: 'center'
                                }, children: item.badge > 99 ? '99+' : item.badge })), item.children && (_jsx("svg", { width: "16", height: "16", viewBox: "0 0 16 16", fill: "currentColor", style: {
                                    transform: isExpanded ? 'rotate(90deg)' : 'rotate(0)',
                                    transition: 'transform 0.2s ease'
                                }, children: _jsx("path", { d: "M6 4L10 8L6 12" }) }))] }))] }), !isCollapsed && item.children && isExpanded && (_jsx("div", { style: { marginLeft: '32px', marginTop: '4px' }, children: item.children.map(child => (_jsx(NavItem, { item: child, isActive: isActive, isCollapsed: isCollapsed, onClick: onClick }, child.id))) }))] }));
};
export const AdaptiveBreadcrumb = ({ items, onNavigate }) => {
    const platform = deviceDetector.getPlatform();
    if (platform === 'mobile') {
        // Mobile: Show only current and parent
        const current = items[items.length - 1];
        const parent = items.length > 1 ? items[items.length - 2] : null;
        return (_jsxs("div", { style: {
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                fontSize: '14px'
            }, children: [parent && (_jsxs(_Fragment, { children: [_jsx("button", { onClick: () => onNavigate(parent), style: {
                                backgroundColor: 'transparent',
                                border: 'none',
                                color: 'var(--color-primary)',
                                cursor: 'pointer',
                                padding: '4px'
                            }, children: parent.label }), _jsx("span", { style: { color: 'var(--color-text-secondary)' }, children: "\u203A" })] })), _jsx("span", { style: { fontWeight: 600 }, children: current.label })] }));
    }
    // Desktop: Show full breadcrumb
    return (_jsx("nav", { style: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            fontSize: '14px'
        }, children: items.map((item, index) => (_jsxs(React.Fragment, { children: [index > 0 && (_jsx("span", { style: { color: 'var(--color-text-secondary)' }, children: "\u203A" })), index < items.length - 1 ? (_jsx("button", { onClick: () => onNavigate(item), style: {
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: 'var(--color-primary)',
                        cursor: 'pointer',
                        padding: '4px',
                        textDecoration: 'none'
                    }, onMouseEnter: (e) => {
                        e.currentTarget.style.textDecoration = 'underline';
                    }, onMouseLeave: (e) => {
                        e.currentTarget.style.textDecoration = 'none';
                    }, children: item.label })) : (_jsx("span", { style: { fontWeight: 600, color: 'var(--color-text)' }, children: item.label }))] }, item.id))) }));
};
//# sourceMappingURL=AdaptiveNavigation.js.map