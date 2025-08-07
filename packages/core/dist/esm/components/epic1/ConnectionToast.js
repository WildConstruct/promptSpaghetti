import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import './ConnectionToast.css';
/**
 * Toast notification component for connection validation feedback
 */
export const ConnectionToast = ({ message, onDismiss }) => {
    const [isVisible, setIsVisible] = useState(false);
    useEffect(() => {
        if (message) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(onDismiss, 300); // Wait for animation to complete
            }, message.duration || 3000);
            return () => clearTimeout(timer);
        }
    }, [message, onDismiss]);
    if (!message)
        return null;
    return (_jsxs("div", { className: `epic1-toast epic1-toast-${message.type} ${isVisible ? 'visible' : ''}`, children: [_jsxs("div", { className: "epic1-toast-icon", children: [message.type === 'error' && '❌', message.type === 'warning' && '⚠️', message.type === 'success' && '✅'] }), _jsx("div", { className: "epic1-toast-message", children: message.message }), _jsx("button", { className: "epic1-toast-close", onClick: () => {
                    setIsVisible(false);
                    setTimeout(onDismiss, 300);
                }, "aria-label": "Dismiss", children: "\u00D7" })] }));
};
/**
 * Hook to manage toast messages
 */
export const useToast = () => {
    const [toasts, setToasts] = useState([]);
    const showToast = (type, message, duration) => {
        const id = Date.now().toString();
        const toast = { id, type, message, duration };
        setToasts(prev => [...prev, toast]);
    };
    const dismissToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };
    return { toasts, showToast, dismissToast };
};
