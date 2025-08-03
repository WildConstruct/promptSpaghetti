import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Micro-interactions component
 * Adds subtle animations and feedback for user interactions
 */
import { useEffect, useState } from 'react';
import './MicroInteractions.css';
export const MicroInteraction = ({ trigger, x = 0, y = 0, message }) => {
    const [visible, setVisible] = useState(true);
    useEffect(() => {
        const duration = trigger === 'error' ? 2000 : 1000;
        const timer = setTimeout(() => setVisible(false), duration);
        return () => clearTimeout(timer);
    }, [trigger]);
    if (!visible)
        return null;
    const renderInteraction = () => {
        switch (trigger) {
            case 'hover':
                return _jsx("div", { className: "micro-hover-ring" });
            case 'click':
                return _jsx("div", { className: "micro-click-ripple" });
            case 'edit':
                return (_jsx("div", { className: "micro-edit-indicator", children: _jsx("span", { className: "edit-icon", children: "\u270F\uFE0F" }) }));
            case 'save':
                return (_jsx("div", { className: "micro-save-success", children: _jsxs("svg", { className: "checkmark", viewBox: "0 0 52 52", children: [_jsx("circle", { className: "checkmark-circle", cx: "26", cy: "26", r: "25", fill: "none" }), _jsx("path", { className: "checkmark-check", fill: "none", d: "M14.1 27.2l7.1 7.2 16.7-16.8" })] }) }));
            case 'error':
                return (_jsxs("div", { className: "micro-error-shake", children: [_jsx("span", { className: "error-icon", children: "\u26A0\uFE0F" }), message && _jsx("span", { className: "error-message", children: message })] }));
            case 'snap':
                return (_jsxs("div", { className: "micro-magnetic-snap", children: [_jsx("div", { className: "snap-ring" }), _jsx("div", { className: "snap-pulse" })] }));
            case 'bounce':
                return (_jsx("div", { className: "micro-node-bounce", children: _jsx("div", { className: "bounce-shadow" }) }));
            case 'drag':
                return (_jsxs("div", { className: "micro-drag-trail", children: [_jsx("div", { className: "trail-dot" }), _jsx("div", { className: "trail-dot" }), _jsx("div", { className: "trail-dot" })] }));
            case 'connect':
                return (_jsx("div", { className: "micro-connection-pulse", children: _jsx("svg", { className: "connection-line", width: "100", height: "100", children: _jsx("path", { className: "pulse-path", d: `M ${x} ${y} Q ${(x + (targetX || x)) / 2} ${y - 20} ${targetX || x} ${targetY || y}`, fill: "none", stroke: "#4A90E2", strokeWidth: "2" }) }) }));
            default:
                return null;
        }
    };
    return (_jsx("div", { className: `micro-interaction micro-${trigger}`, style: {
            position: 'absolute',
            left: x,
            top: y,
            pointerEvents: 'none'
        }, children: renderInteraction() }));
};
// Haptic feedback support
export const triggerHaptic = (type) => {
    // Check if Vibration API is available
    if ('vibrate' in navigator) {
        switch (type) {
            case 'light':
                navigator.vibrate(10);
                break;
            case 'medium':
                navigator.vibrate(20);
                break;
            case 'heavy':
                navigator.vibrate([40, 20, 40]);
                break;
            case 'error':
                navigator.vibrate([100, 50, 100]);
                break;
        }
    }
};
// Hook for managing micro-interactions
export function useMicroInteractions() {
    const [interactions, setInteractions] = useState([]);
    const trigger = (type, x, y, options) => {
        const id = `${Date.now()}-${Math.random()}`;
        setInteractions(prev => [...prev, {
                id,
                type,
                x,
                y,
                message: options?.message,
                targetX: options?.targetX,
                targetY: options?.targetY,
                nodeId: options?.nodeId
            }]);
        // Trigger haptic feedback if requested
        if (options?.haptic) {
            triggerHaptic(options.haptic);
        }
        // Auto-remove after animation
        const duration = type === 'error' ? 2500 :
            type === 'snap' ? 600 :
                type === 'bounce' ? 800 :
                    type === 'connect' ? 1000 : 1500;
        setTimeout(() => {
            setInteractions(prev => prev.filter(i => i.id !== id));
        }, duration);
    };
    return { interactions, trigger };
}
