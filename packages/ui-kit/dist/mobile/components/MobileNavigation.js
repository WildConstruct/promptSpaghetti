import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { TOUCH_TARGETS, mobileStyles, MOBILE_SPACING, getSafeAreaPadding } from '../design-system';
import { cn } from '../../utils';
import { useDeviceDetection } from '../../responsive/utilities';
export const HamburgerMenu = ({ isOpen, onToggle, color = 'currentColor', size = 24, className, style, }) => {
    return (_jsx("button", { className: cn('hamburger-menu', isOpen && 'is-open', className), onClick: onToggle, "aria-label": isOpen ? 'Close menu' : 'Open menu', "aria-expanded": isOpen, style: {
            width: TOUCH_TARGETS.preferred,
            height: TOUCH_TARGETS.preferred,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            ...mobileStyles.tapHighlight,
            ...style,
        }, children: _jsx("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { d: isOpen ? 'M6 6L18 18M6 18L18 6' : 'M3 12H21M3 6H21M3 18H21', stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", style: {
                    transition: 'd 0.3s ease, opacity 0.3s ease',
                } }) }) }));
};
export const BottomNavigation = ({ items, activeId, onItemClick, showLabels = true, className, style, }) => {
    const { isTouch } = useDeviceDetection();
    const handleItemClick = (id) => {
        if (isTouch && 'vibrate' in navigator) {
            navigator.vibrate(10); // Light haptic feedback
        }
        onItemClick(id);
    };
    return (_jsx("nav", { className: cn('bottom-navigation', className), style: {
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            display: 'flex',
            backgroundColor: 'var(--color-background)',
            borderTop: '1px solid var(--color-border)',
            paddingBottom: getSafeAreaPadding('bottom'),
            zIndex: 999,
            ...style,
        }, children: items.map(item => {
            const isActive = item.id === activeId;
            return (_jsxs("button", { className: cn('bottom-nav-item', isActive && 'is-active'), onClick: () => handleItemClick(item.id), "aria-label": item.label, "aria-current": isActive ? 'page' : undefined, style: {
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: `${MOBILE_SPACING.sm}px ${MOBILE_SPACING.xs}px`,
                    minHeight: TOUCH_TARGETS.large,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    transition: 'color 0.2s ease',
                    position: 'relative',
                    ...mobileStyles.tapHighlight,
                    ...mobileStyles.noSelect,
                }, children: [_jsxs("div", { className: "bottom-nav-icon", style: { position: 'relative' }, children: [item.icon, item.badge && (_jsx("span", { className: "bottom-nav-badge", style: {
                                    position: 'absolute',
                                    top: -4,
                                    right: -8,
                                    minWidth: 16,
                                    height: 16,
                                    padding: '0 4px',
                                    backgroundColor: 'var(--color-error)',
                                    color: 'white',
                                    borderRadius: 8,
                                    fontSize: 10,
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }, children: item.badge }))] }), showLabels && (_jsx("span", { className: "bottom-nav-label", style: {
                            fontSize: 12,
                            marginTop: 4,
                            fontWeight: isActive ? 500 : 400,
                        }, children: item.label }))] }, item.id));
        }) }));
};
export const MobileHeader = ({ title, leftAction, rightActions = [], transparent = false, className, style, children, }) => {
    return (_jsxs("header", { className: cn('mobile-header', transparent && 'transparent', className), style: {
            position: 'sticky',
            top: 0,
            left: 0,
            right: 0,
            display: 'flex',
            alignItems: 'center',
            minHeight: TOUCH_TARGETS.large,
            paddingTop: getSafeAreaPadding('top'),
            paddingLeft: MOBILE_SPACING.sm,
            paddingRight: MOBILE_SPACING.sm,
            backgroundColor: transparent ? 'transparent' : 'var(--color-background)',
            borderBottom: transparent ? 'none' : '1px solid var(--color-border)',
            zIndex: 998,
            ...style,
        }, children: [leftAction && (_jsx("button", { className: "mobile-header-action left", onClick: leftAction.onClick, "aria-label": leftAction.label, style: {
                    width: TOUCH_TARGETS.preferred,
                    height: TOUCH_TARGETS.preferred,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    marginRight: MOBILE_SPACING.sm,
                    ...mobileStyles.tapHighlight,
                }, children: leftAction.icon })), title && (_jsx("h1", { className: "mobile-header-title", style: {
                    flex: 1,
                    fontSize: 18,
                    fontWeight: 600,
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                }, children: title })), children && (_jsx("div", { className: "mobile-header-content", style: { flex: 1 }, children: children })), rightActions.length > 0 && (_jsx("div", { className: "mobile-header-actions right", style: { display: 'flex', gap: 4 }, children: rightActions.map((action, index) => (_jsx("button", { className: "mobile-header-action", onClick: action.onClick, "aria-label": action.label, style: {
                        width: TOUCH_TARGETS.preferred,
                        height: TOUCH_TARGETS.preferred,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        ...mobileStyles.tapHighlight,
                    }, children: action.icon }, index))) }))] }));
};
export const SlideMenu = ({ isOpen, onClose, position = 'left', width = '80%', className, style, children, }) => {
    return (_jsxs(_Fragment, { children: [isOpen && (_jsx("div", { className: "slide-menu-backdrop", onClick: onClose, style: {
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    zIndex: 1000,
                    opacity: isOpen ? 1 : 0,
                    transition: 'opacity 0.3s ease',
                } })), _jsx("div", { className: cn('slide-menu', `position-${position}`, isOpen && 'is-open', className), style: {
                    position: 'fixed',
                    top: 0,
                    bottom: 0,
                    [position]: 0,
                    width,
                    maxWidth: '100vw',
                    backgroundColor: 'var(--color-background)',
                    transform: `translateX(${isOpen ? '0' : position === 'left' ? '-100%' : '100%'})`,
                    transition: 'transform 0.3s ease',
                    zIndex: 1001,
                    overflowY: 'auto',
                    ...mobileStyles.smoothScroll,
                    ...style,
                }, children: children })] }));
};
//# sourceMappingURL=MobileNavigation.js.map