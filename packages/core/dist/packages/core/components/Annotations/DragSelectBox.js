import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Drag Select Box Component
 * Epic 8.7: Story 8.7 - Collaboration & Documentation Tools - Task 3
 *
 * Interactive drag-to-select rectangle for creating region groups
 * by selecting multiple nodes through mouse drag operation.
 */
import { useState, useCallback, useRef, useEffect } from 'react';
export const DragSelectBox = ({ onSelectionComplete, onSelectionCancel, canvasOffset, zoom, isActive }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
    const [currentPoint, setCurrentPoint] = useState({ x: 0, y: 0 });
    const overlayRef = useRef(null);
    // Calculate selection bounds
    const getSelectionBounds = useCallback(() => {
        const minX = Math.min(startPoint.x, currentPoint.x);
        const minY = Math.min(startPoint.y, currentPoint.y);
        const maxX = Math.max(startPoint.x, currentPoint.x);
        const maxY = Math.max(startPoint.y, currentPoint.y);
        return {
            x: (minX - canvasOffset.x) / zoom,
            y: (minY - canvasOffset.y) / zoom,
            width: (maxX - minX) / zoom,
            height: (maxY - minY) / zoom
        };
    }, [startPoint, currentPoint, canvasOffset, zoom]);
    // Handle mouse down to start selection
    const handleMouseDown = useCallback((e) => {
        if (!isActive)
            return;
        e.preventDefault();
        e.stopPropagation();
        const rect = overlayRef.current?.getBoundingClientRect();
        if (!rect)
            return;
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setStartPoint({ x, y });
        setCurrentPoint({ x, y });
        setIsDragging(true);
    }, [isActive]);
    // Handle mouse move during selection
    useEffect(() => {
        if (!isDragging)
            return;
        const handleMouseMove = (e) => {
            const rect = overlayRef.current?.getBoundingClientRect();
            if (!rect)
                return;
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            setCurrentPoint({ x, y });
        };
        const handleMouseUp = (e) => {
            setIsDragging(false);
            const bounds = getSelectionBounds();
            // Only create selection if it's large enough
            if (bounds.width > 20 && bounds.height > 20) {
                onSelectionComplete(bounds);
            }
            else {
                onSelectionCancel();
            }
        };
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setIsDragging(false);
                onSelectionCancel();
            }
        };
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isDragging, getSelectionBounds, onSelectionComplete, onSelectionCancel]);
    // Don't render if not active
    if (!isActive)
        return null;
    const selectionStyle = isDragging ? {
        left: Math.min(startPoint.x, currentPoint.x),
        top: Math.min(startPoint.y, currentPoint.y),
        width: Math.abs(currentPoint.x - startPoint.x),
        height: Math.abs(currentPoint.y - startPoint.y)
    } : { display: 'none' };
    return (_jsx(_Fragment, { children: _jsxs("div", { ref: overlayRef, "data-testid": "drag-select-overlay", style: {
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 10000,
                cursor: 'crosshair',
                pointerEvents: 'all'
            }, onMouseDown: handleMouseDown, children: [_jsx("div", { "data-testid": "drag-select-box", style: {
                        position: 'absolute',
                        border: '2px dashed #3b82f6',
                        background: 'rgba(59, 130, 246, 0.1)',
                        borderRadius: '4px',
                        pointerEvents: 'none',
                        transition: 'none',
                        ...selectionStyle
                    } }), !isDragging && (_jsxs("div", { style: {
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        background: 'rgba(0, 0, 0, 0.8)',
                        color: 'white',
                        padding: '12px 20px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        textAlign: 'center',
                        pointerEvents: 'none',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                    }, children: [_jsx("div", { style: { fontWeight: 600, marginBottom: '4px' }, children: "\uD83C\uDFAF Create Region Group" }), _jsxs("div", { style: { fontSize: '12px', opacity: 0.9 }, children: ["Drag to select nodes and create a group", _jsx("br", {}), "Press ", _jsx("kbd", { style: {
                                        background: 'rgba(255, 255, 255, 0.2)',
                                        padding: '2px 6px',
                                        borderRadius: '3px',
                                        fontSize: '11px'
                                    }, children: "Esc" }), " to cancel"] })] })), isDragging && (_jsxs("div", { style: {
                        position: 'absolute',
                        left: Math.max(startPoint.x, currentPoint.x) + 10,
                        top: Math.min(startPoint.y, currentPoint.y) - 35,
                        background: 'rgba(0, 0, 0, 0.8)',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        pointerEvents: 'none',
                        whiteSpace: 'nowrap'
                    }, children: [Math.round(Math.abs(currentPoint.x - startPoint.x) / zoom), " \u00D7 ", Math.round(Math.abs(currentPoint.y - startPoint.y) / zoom)] }))] }) }));
};
export default DragSelectBox;
