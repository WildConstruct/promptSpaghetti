import { jsx as _jsx } from "react/jsx-runtime";
export const Select = ({ children, ...props }) => (_jsx("div", { className: "select", ...props, children: children }));
export const SelectTrigger = ({ children, className, ...props }) => (_jsx("button", { className: `select-trigger ${className || ''}`, ...props, children: children }));
export const SelectValue = ({ placeholder }) => (_jsx("span", { className: "select-value", children: placeholder }));
export const SelectContent = ({ children, className, ...props }) => (_jsx("div", { className: `select-content ${className || ''}`, ...props, children: children }));
export const SelectItem = ({ children, className, value, ...props }) => (_jsx("div", { className: `select-item ${className || ''}`, "data-value": value, ...props, children: children }));
