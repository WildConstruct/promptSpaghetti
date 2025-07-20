import { jsx as _jsx } from "react/jsx-runtime";
export const Card = ({ children, className, ...props }) => (_jsx("div", { className: `card ${className || ''}`, ...props, children: children }));
export const CardHeader = ({ children, className, ...props }) => (_jsx("div", { className: `card-header ${className || ''}`, ...props, children: children }));
export const CardTitle = ({ children, className, ...props }) => (_jsx("h3", { className: `card-title ${className || ''}`, ...props, children: children }));
export const CardContent = ({ children, className, ...props }) => (_jsx("div", { className: `card-content ${className || ''}`, ...props, children: children }));
export const CardDescription = ({ children, className, ...props }) => (_jsx("p", { className: `card-description ${className || ''}`, ...props, children: children }));
export const CardFooter = ({ children, className, ...props }) => (_jsx("div", { className: `card-footer ${className || ''}`, ...props, children: children }));
