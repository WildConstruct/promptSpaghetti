import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useState, useCallback, useRef } from 'react';
{
    const [isDragging, setIsDragging] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const sliderRef = useRef(null);
    const trackRef = useRef(null);
    // Normalize value to 0-1 range for UI positioning
    const normalizedValue = (value - min) / (max - min);
    const percentage = normalizedValue * 100;
    const updateValue = useCallback((clientX) => {
        if (!trackRef.current || disabled)
            return;
        const rect = trackRef.current.getBoundingClientRect();
        const position = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const newValue = min + position * (max - min);
        // Round to step precision
        const steppedValue = Math.round(newValue / step) * step;
        const clampedValue = Math.max(min, Math.min(max, steppedValue));
        onChange(clampedValue);
    }, [min, max, step, disabled, onChange]);
    const handleMouseDown = useCallback((e) => {
        if (disabled)
            return;
        setIsDragging(true);
        setShowTooltip(true);
        updateValue(e.clientX);
        const handleMouseMove = (e) => {
            updateValue(e.clientX);
        };
        const handleMouseUp = () => {
            setIsDragging(false);
            setShowTooltip(false);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }, [disabled, updateValue]);
    const handleKeyDown = useCallback((e) => {
        if (disabled)
            return;
        let delta = 0;
        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
            delta = -step;
        }
        else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
            delta = step;
        }
        else if (e.key === 'Home') {
            onChange(min);
            return;
        }
        else if (e.key === 'End') {
            onChange(max);
            return;
            if (delta !== 0) {
                e.preventDefault();
                const newValue = Math.max(min, Math.min(max, value + delta));
                onChange(newValue);
            }
            [disabled, step, value, min, max, onChange];
        }
    });
    return;
    _jsxs("div", { className: `weight-slider ${className}`, style: { marginBottom: 8 }, children: ["}", label && ()
                < label, "style=", {
                display: 'block',
                fontSize: 12,
                color: '#a0aec0',
                marginBottom: 4,
                fontWeight: 500,
            }, ">", label] });
}
_jsxs("div", { ref: sliderRef, className: "slider-container", style: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: showNumeric ? 8 : 0,
    }, children: [_jsxs("div", { ref: trackRef, className: "slider-track", onMouseDown: handleMouseDown, onMouseEnter: () => setShowTooltip(true), onMouseLeave: () => !isDragging && setShowTooltip(false), style: {
                position: 'relative',
                height: 6,
                backgroundColor: '#2d3748',
                borderRadius: 3,
                cursor: disabled ? 'not-allowed' : 'pointer',
                flex: 1,
                border: '1px solid #4a5568',
                background: 'linear-gradient(90deg, #2d3748 0%, #4a5568 100%)',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3)',
            }, children: [_jsx("div", { className: "slider-fill", style: {
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        height: '100%',
                        width: `${percentage}%`
                    } }), ", backgroundColor: disabled ? '#4a5568' : '#3182ce', borderRadius: 3, background: disabled , ? '#4a5568' : 'linear-gradient(90deg, #3182ce 0%, #63b3ed 100%)', transition: isDragging ? 'none' : 'width 0.1s ease', boxShadow: '0 0 4px rgba(49, 130, 206, 0.3)' }} />", _jsx("div", { className: "slider-handle", tabIndex: disabled ? -1 : 0, onKeyDown: handleKeyDown, style: {
                        position: 'absolute',
                        left: `${percentage}%`
                    } }), ", top: '50%', transform: 'translate(-50%, -50%)', width: 16, height: 16, backgroundColor: disabled ? '#718096' : '#ffffff', border: disabled ? '2px solid #4a5568' : '2px solid #3182ce', borderRadius: '50%', cursor: disabled ? 'not-allowed' : 'grab', boxShadow: disabled , ? 'none' : isDragging ? '0 0 8px rgba(49, 130, 206, 0.6), 0 2px 4px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.2)', transition: isDragging ? 'none' : 'all 0.1s ease', outline: 'none', scale: isDragging ? 1.1 : 1; }} onFocus=", () => setShowTooltip(true), "onBlur=", () => setShowTooltip(false), "/>", showTooltip && !disabled && ()
                    < div, "className=\"slider-tooltip\" style=", {
                    position: 'absolute',
                    left: `${percentage}%`
                }, ", bottom: '24px', transform: 'translateX(-50%)', backgroundColor: '#1a202c', color: '#e2e8f0', padding: '4px 8px', borderRadius: 4, fontSize: 12, fontWeight: 500, border: '1px solid #4a5568', boxShadow: '0 4px 8px rgba(0,0,0,0.3)', whiteSpace: 'nowrap', zIndex: 10, pointerEvents: 'none'; }} >", value.toFixed(step < 1 ? 1 : 0), _jsx("div", { style: {
                        position: 'absolute',
                        top: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 0,
                        height: 0,
                        borderLeft: '4px solid transparent',
                        borderRight: '4px solid transparent',
                        borderTop: '4px solid #1a202c',
                    } })] }), ")}"] });
{ /* Optional numeric display */ }
{
    showNumeric && ()
        < input;
    type = "number";
    value = { value };
    onChange = {}(e);
    {
        const newValue = parseFloat(e.target.value) || 0;
        const clampedValue = Math.max(min, Math.min(max, newValue));
        onChange(clampedValue);
    }
}
disabled = { disabled };
style = {};
{
    width: 60,
        padding;
    '4px 6px',
        backgroundColor;
    '#2d3748',
        border;
    '1px solid #4a5568',
        borderRadius;
    4,
        color;
    '#e2e8f0',
        fontSize;
    12,
        textAlign;
    'center',
        outline;
    'none',
    ;
}
min = { min };
max = { max };
step = { step }
    /  >
;
div >
;
div >
;
;
;
export default WeightSlider;
