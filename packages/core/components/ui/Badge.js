import { jsx as _jsx } from "react/jsx-runtime";
export const Badge = ({ children, className, variant = 'default', ...props }) => (_jsx("span", { className: `badge badge-${variant} ${className || ''}`, ...props, children: children }));
