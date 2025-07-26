import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
export const Label = React.forwardRef(({ className, ...props }, ref) => (_jsx("label", { ref: ref, className: `label ${className || ''}`, ...props })));
Label.displayName = 'Label';
