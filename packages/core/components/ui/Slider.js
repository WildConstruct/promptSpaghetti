import { jsx as _jsx } from "react/jsx-runtime";
export const Slider = ({ value = [0], onValueChange, max = 100, min = 0, step = 1, className = '', disabled = false }) => {
    const handleChange = (e) => {
        const newValue = parseFloat(e.target.value);
        onValueChange?.([newValue]);
    };
    return (_jsx("input", { type: "range", value: value[0] || 0, onChange: handleChange, max: max, min: min, step: step, disabled: disabled, className: `slider ${className}`, style: {
            width: '100%',
            height: '4px',
            background: '#4a5568',
            outline: 'none',
            borderRadius: '2px',
            ...(!disabled && {
                cursor: 'pointer'
            })
        } }));
};
export default Slider;
