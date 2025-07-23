import { jsx as _jsx } from "react/jsx-runtime";
export const Dialog = ({ children, ...props }) => (_jsx("div", { className: "dialog", ...props, children: children }));
export const DialogTrigger = ({ children, ...props }) => (_jsx("button", { className: "dialog-trigger", ...props, children: children }));
export const DialogContent = ({ children, className, ...props }) => (_jsx("div", { className: `dialog-content ${className || ''}`, ...props, children: children }));
export const DialogHeader = ({ children, className, ...props }) => (_jsx("div", { className: `dialog-header ${className || ''}`, ...props, children: children }));
export const DialogTitle = ({ children, className, ...props }) => (_jsx("h2", { className: `dialog-title ${className || ''}`, ...props, children: children }));
export const DialogDescription = ({ children, className, ...props }) => (_jsx("p", { className: `dialog-description ${className || ''}`, ...props, children: children }));
export const DialogClose = ({ children, ...props }) => (_jsx("button", { className: "dialog-close", ...props, children: children }));
