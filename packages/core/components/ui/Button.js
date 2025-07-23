import { jsx as _jsx } from "react/jsx-runtime";
export const Button = ({ children, className, variant = 'default', size = 'default', ...props }) => (_jsx("button", { className: `button button-${variant} button-${size} ${className || ''}`, ...props, children: children }));
