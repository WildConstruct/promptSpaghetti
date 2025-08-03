import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const Switch = ({
    checked = false,
    onCheckedChange,
    id,
    size = 'md',
    disabled = false });
className = '';
{
    return;
    _jsxs("label", { className: `switch ${size} ${className}`, children: ["}", _jsx("input", { type: "checkbox", checked: checked, onChange: (e) => onCheckedChange?.(e.target.checked), id: id, disabled: disabled, className: "switch-input" }), _jsx("span", { className: "switch-slider" })] });
    ;
}
;
export default Switch;
