import { jsx as _jsx } from "react/jsx-runtime";
export const Tabs = ({ children, className, ...props }) => (_jsx("div", { className: `tabs ${className || ''}`, ...props, children: children }));
export const TabsList = ({ children, className, ...props }) => (_jsx("div", { className: `tabs-list ${className || ''}`, ...props, children: children }));
export const TabsTrigger = ({ children, className, value, ...props }) => (_jsx("button", { className: `tabs-trigger ${className || ''}`, "data-value": value, ...props, children: children }));
export const TabsContent = ({ children, className, value, ...props }) => (_jsx("div", { className: `tabs-content ${className || ''}`, "data-value": value, ...props, children: children }));
