import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
export const Progress = React.forwardRef(({ className, value = 0, max = 100, ...props }, ref) => (_jsx("div", { ref: ref, className: `progress ${className || ''}`, role: "progressbar", "aria-valuemin": 0, "aria-valuemax": max, "aria-valuenow": value, ...props, children: _jsx("div", { className: "progress-bar", style: { width: `${(value / max) * 100}%` } }) })));
Progress.displayName = 'Progress';
