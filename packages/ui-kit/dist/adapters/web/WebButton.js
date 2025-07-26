import { jsx as _jsx } from "react/jsx-runtime";
import { Button } from '../../components/Button';
import { usePlatformAdapter } from '../usePlatformAdapter';
export const WebButton = ({ href, target = '_blank', download, onClick, children, ...props }) => {
    const adapter = usePlatformAdapter();
    const handleClick = () => {
        if (href) {
            if (target === '_blank') {
                adapter.openUrl(href);
            }
            else {
                window.location.href = href;
            }
        }
        onClick?.();
    };
    // If href is provided, render as link button
    if (href) {
        return (_jsx(Button, { ...props, onClick: handleClick, style: {
                ...props.style,
                textDecoration: 'none'
            }, role: "link", "aria-label": props['aria-label'] || `Navigate to ${href}`, children: children }));
    }
    // Enhanced web button with additional features
    return (_jsx(Button, { ...props, onClick: handleClick, style: {
            ...props.style,
            // Web-specific enhancements
            transition: 'all 0.2s ease',
            userSelect: 'none',
            WebkitTapHighlightColor: 'transparent'
        }, onMouseDown: (e) => {
            // Prevent text selection on mouse down
            e.preventDefault();
        }, onContextMenu: (e) => {
            // Prevent right-click context menu on buttons
            e.preventDefault();
        }, children: children }));
};
//# sourceMappingURL=WebButton.js.map