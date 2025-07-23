import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
export const WeightControlSlider = ({ options, onOptionsChange, onPreviewRequest, className = '' }) => {
    const [localOptions, setLocalOptions] = useState(options);
    useEffect(() => {
        setLocalOptions(options);
    }, [options]);
    const handleWeightChange = (optionId, newWeight) => {
        const updatedOptions = localOptions.map(option => option.id === optionId ? { ...option, weight: Math.max(0, newWeight) } : option);
        setLocalOptions(updatedOptions);
        onOptionsChange(updatedOptions);
    };
    const handleTextChange = (optionId, newText) => {
        const updatedOptions = localOptions.map(option => option.id === optionId ? { ...option, text: newText } : option);
        setLocalOptions(updatedOptions);
        onOptionsChange(updatedOptions);
    };
    if (localOptions.length === 0) {
        return (_jsx("div", { className: `weight-control-slider ${className}`, style: {
                padding: 16,
                background: '#2d3748',
                borderRadius: 6,
                color: 'white',
                textAlign: 'center'
            }, children: _jsx("p", { children: "No options available" }) }));
    }
    return (_jsxs("div", { className: `weight-control-slider ${className}`, style: {
            padding: 16,
            background: '#2d3748',
            borderRadius: 6,
            color: 'white'
        }, children: [_jsx("h3", { style: { marginBottom: 16, color: '#e2e8f0' }, children: "Weight Control" }), localOptions.map((option, index) => (_jsxs("div", { style: { marginBottom: 12 }, children: [_jsxs("div", { style: {
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: 4
                        }, children: [_jsx("input", { type: "text", value: option.text, onChange: (e) => handleTextChange(option.id, e.target.value), style: {
                                    background: '#4a5568',
                                    border: 'none',
                                    borderRadius: 4,
                                    padding: '4px 8px',
                                    color: 'white',
                                    flex: 1,
                                    marginRight: 8
                                } }), _jsxs("span", { style: {
                                    minWidth: 40,
                                    textAlign: 'right',
                                    fontSize: 12,
                                    color: '#a0aec0'
                                }, children: [option.weight, "%"] })] }), _jsx("input", { type: "range", min: "0", max: "100", value: option.weight, onChange: (e) => handleWeightChange(option.id, parseInt(e.target.value)), disabled: option.locked, style: {
                            width: '100%',
                            height: 6,
                            borderRadius: 3,
                            background: '#4a5568',
                            outline: 'none',
                            opacity: option.locked ? 0.5 : 1
                        } })] }, option.id))), onPreviewRequest && (_jsx("button", { onClick: () => onPreviewRequest(localOptions), style: {
                    marginTop: 16,
                    padding: '8px 16px',
                    background: '#4299e1',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer'
                }, children: "Preview" }))] }));
};
// Helper function to get consistent colors for options
const getOptionColor = (index) => {
    const colors = [
        '#4299e1', // Blue
        '#48bb78', // Green
        '#ed8936', // Orange
        '#9f7aea', // Purple
        '#38b2ac', // Teal
        '#ec4899' // Pink
    ];
    return colors[index % colors.length];
};
export default WeightControlSlider;
