import { jsx as _jsx } from "react/jsx-runtime";
export const Alert = ({ children, className, variant = 'default', ...props }) => (_jsx("div", { className: `alert alert-${variant} ${className || ''}`, ...props, children: children }));
export const AlertTitle = ({ children, className, ...props }) => (_jsx("h5", { className: `alert-title ${className || ''}`, ...props, children: children }));
export const AlertDescription = ({ children, className, ...props }) => (_jsx("p", { className: `alert-description ${className || ''}`, ...props, children: children }));
