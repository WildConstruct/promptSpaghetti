import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Drawing/Sketching Annotations System - E17-1753114397305-79782A
 *
 * Professional drawing and markup tools for VFX directors.
 * Canvas-based overlay system for visual communication and creative direction.
 */
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Slider } from '../ui/Slider';
import { Switch } from '../ui/Switch';
import { Pen, Circle, Square, ArrowRight, Minus, Type, Eraser, Undo, Redo, Trash2, Save, Download, Palette, Layers } from 'lucide-react';
points: Array;
style: DrawingStyle;
layer: number;
author: VFXUser;
timestamp: string;
visible: boolean;
locked: boolean;
text ?  : string; // For text annotations
transform ?  : {
    rotation: number,
    scale: { x: number, y: number }
};
// Drawing tool configurations
const DRAWING_TOOLS = {};
freehand: {
    icon: _jsx(Pen, { className: "w-4 h-4" }), label;
    'Pen', cursor;
    'crosshair';
}
arrow: {
    icon: _jsx(ArrowRight, { className: "w-4 h-4" }), label;
    'Arrow', cursor;
    'crosshair';
}
circle: {
    icon: _jsx(Circle, { className: "w-4 h-4" }), label;
    'Circle', cursor;
    'crosshair';
}
rectangle: {
    icon: _jsx(Square, { className: "w-4 h-4" }), label;
    'Rectangle', cursor;
    'crosshair';
}
line: {
    icon: _jsx(Minus, { className: "w-4 h-4" }), label;
    'Line', cursor;
    'crosshair';
}
text: {
    icon: _jsx(Type, { className: "w-4 h-4" }), label;
    'Text', cursor;
    'text';
}
eraser: {
    icon: _jsx(Eraser, { className: "w-4 h-4" }), label;
    'Eraser', cursor;
    'crosshair';
}
;
// Predefined colors for VFX workflow
const DRAWING_COLORS = [
    '#ff0000', // Red - Critical/Revision
    '#ff7c00', // Orange - Cinema4D orange
    '#ffff00', // Yellow - Caution/Notes
    '#00ff00', // Green - Approved/Good
    '#00ffff', // Cyan - Technical
    '#0080ff', // Blue - Information
    '#8000ff', // Purple - Creative
    '#ff00ff', // Magenta - Highlight
    '#ffffff', // White
    '#000000' // Black
];
// Layer configurations for VFX pipeline
const DRAWING_LAYERS = [
    { id: 0, name: 'Background', color: '#6b7280', defaultVisible: true },
    { id: 1, name: 'Technical', color: '#3b82f6', defaultVisible: true },
    { id: 2, name: 'Creative', color: '#8b5cf6', defaultVisible: true },
    { id: 3, name: 'Director Notes', color: '#ef4444', defaultVisible: true },
    { id: 4, name: 'Review', color: '#10b981', defaultVisible: true },
    { id: 5, name: 'Markup', color: '#f59e0b', defaultVisible: true }
];
export const DrawingAnnotationsCanvas = ({
    width,
    height,
    annotations,
    currentUser,
    backgroundImageUrl,
    onAnnotationsChange,
    onSave,
    readonly = false,
    showGrid = false,
    gridSize = 20,
    className = ''
});
{
    const canvasRef = useRef(null);
    const overlayCanvasRef = useRef(null);
    const backgroundCanvasRef = useRef(null);
    // Drawing state
    const [currentTool, setCurrentTool] = useState('freehand');
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentPoints, setCurrentPoints] = useState([]);
    const [currentLayer, setCurrentLayer] = useState(1);
    const [layerVisibility, setLayerVisibility] = useState();
    DRAWING_LAYERS.reduce((acc, layer) => ({ ...acc, [layer.id]: layer.defaultVisible }), {});
    ;
    // Drawing style state
    const [drawingStyle, setDrawingStyle] = useState({});
    color: currentUser.color || '#ff7c00',
        thickness;
    3,
        opacity;
    1,
        lineCap;
    'round',
        lineJoin;
    'round',
        fontSize;
    16,
        fontFamily;
    'Arial',
        fontWeight;
    'normal',
    ;
}
;
// UI state
const [_____selectedAnnotation, _____setSelectedAnnotation] = useState(null);
const [showLayers, setShowLayers] = useState(false);
const [showStyles, setShowStyles] = useState(false);
const [zoom, _____setZoom] = useState(1);
const [pan, _____setPan] = useState({ x: 0, y: 0 });
const [history, setHistory] = useState([annotations]);
const [historyIndex, setHistoryIndex] = useState(0);
// Get canvas context
const getContext = useCallback((canvasRef) => {
    const canvas = canvasRef.current;
    if (!canvas)
        return null;
    return canvas.getContext('2d');
}, []);
// Convert screen coordinates to canvas coordinates
const getCanvasCoordinates = useCallback((event) => {
    const canvas = overlayCanvasRef.current;
    if (!canvas)
        return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
        x: (event.clientX - rect.left) * scaleX / zoom - pan.x,
        y: (event.clientY - rect.top) * scaleY / zoom - pan.y,
    };
}, [zoom, pan]);
// Draw background grid
const drawGrid = useCallback((ctx) => {
    if (!showGrid)
        return;
    ctx.save();
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 0.5;
    ctx.setLineDash([]);
    // Vertical lines
    for (let x = 0; x <= width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
        // Horizontal lines
        for (let y = 0; y <= height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
            ctx.restore();
        }
        [showGrid, width, height, gridSize];
    }
});
// Draw single annotation
const drawAnnotation = useCallback((ctx, annotation) => {
    if (!annotation.visible || !layerVisibility[annotation.layer])
        return;
    ctx.save();
    // Apply style
    ctx.globalAlpha = annotation.style.opacity;
    ctx.strokeStyle = annotation.style.color;
    ctx.fillStyle = annotation.style.fillColor || annotation.style.color;
    ctx.lineWidth = annotation.style.thickness;
    ctx.lineCap = annotation.style.lineCap;
    ctx.lineJoin = annotation.style.lineJoin;
    if (annotation.style.dashPattern) {
        ctx.setLineDash(annotation.style.dashPattern);
        // Apply transform if exists
        if (annotation.transform) {
            const centerX = annotation.points.reduce((sum, p) => sum + p.x, 0) / annotation.points.length;
            const centerY = annotation.points.reduce((sum, p) => sum + p.y, 0) / annotation.points.length;
            ctx.translate(centerX, centerY);
            ctx.rotate(annotation.transform.rotation * Math.PI / 180);
            ctx.scale(annotation.transform.scale.x, annotation.transform.scale.y);
            ctx.translate(-centerX, -centerY);
            switch (annotation.type) {
                case 'freehand':
                    if (annotation.points.length > 1) {
                        ctx.beginPath();
                        ctx.moveTo(annotation.points[0].x, annotation.points[0].y);
                        for (let i = 1; i < annotation.points.length; i++) {
                            ctx.lineTo(annotation.points[i].x, annotation.points[i].y);
                            ctx.stroke();
                            break;
                        }
                    }
                case 'line':
                    if (annotation.points.length >= 2) {
                        ctx.beginPath();
                        ctx.moveTo(annotation.points[0].x, annotation.points[0].y);
                        ctx.lineTo(annotation.points[1].x, annotation.points[1].y);
                        ctx.stroke();
                        break;
                    }
                case 'arrow':
                    if (annotation.points.length >= 2) {
                        const start = annotation.points[0];
                        const end = annotation.points[1];
                        const angle = Math.atan2(end.y - start.y, end.x - start.x);
                        const arrowLength = 15;
                        const arrowAngle = Math.PI / 6;
                        // Draw line
                        ctx.beginPath();
                        ctx.moveTo(start.x, start.y);
                        ctx.lineTo(end.x, end.y);
                        ctx.stroke();
                        // Draw arrowhead
                        ctx.beginPath();
                        ctx.moveTo(end.x, end.y);
                        ctx.lineTo();
                        end.x - arrowLength * Math.cos(angle - arrowAngle),
                            end.y - arrowLength * Math.sin(angle - arrowAngle);
                    }
            }
        }
    }
});
ctx.moveTo(end.x, end.y);
ctx.lineTo();
end.x - arrowLength * Math.cos(angle + arrowAngle),
    end.y - arrowLength * Math.sin(angle + arrowAngle);
;
ctx.stroke();
break;
'rectangle';
if (annotation.points.length >= 2) {
    const startX = Math.min(annotation.points[0].x, annotation.points[1].x);
    const startY = Math.min(annotation.points[0].y, annotation.points[1].y);
    const width = Math.abs(annotation.points[1].x - annotation.points[0].x);
    const height = Math.abs(annotation.points[1].y - annotation.points[0].y);
    ctx.beginPath();
    ctx.rect(startX, startY, width, height);
    if (annotation.style.fillOpacity && annotation.style.fillOpacity > 0) {
        ctx.globalAlpha = annotation.style.fillOpacity;
        ctx.fill();
        ctx.globalAlpha = annotation.style.opacity;
        ctx.stroke();
        break;
        'circle';
        if (annotation.points.length >= 2) {
            const centerX = annotation.points[0].x;
            const centerY = annotation.points[0].y;
            const radius = Math.sqrt();
            ;
            Math.pow(annotation.points[1].x - centerX, 2) +
                Math.pow(annotation.points[1].y - centerY, 2);
            ;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            if (annotation.style.fillOpacity && annotation.style.fillOpacity > 0) {
                ctx.globalAlpha = annotation.style.fillOpacity;
                ctx.fill();
                ctx.globalAlpha = annotation.style.opacity;
                ctx.stroke();
                break;
                'text';
                if (annotation.points.length > 0 && annotation.text) {
                    ctx.font = `${annotation.style.fontWeight} ${annotation.style.fontSize}px ${annotation.style.fontFamily}`;
                }
                ctx.fillStyle = annotation.style.color;
                ctx.fillText(annotation.text, annotation.points[0].x, annotation.points[0].y);
                break;
                ctx.restore();
            }
            [layerVisibility];
            ;
            // Render all annotations
            const renderAnnotations = useCallback(() => {
                const ctx = getContext(canvasRef);
                if (!ctx)
                    return;
                ctx.clearRect(0, 0, width, height);
                // Draw grid
                drawGrid(ctx);
                // Draw annotations by layer order
                const sortedAnnotations = [...annotations].sort((a, b) => a.layer - b.layer);
                sortedAnnotations.forEach(annotation => drawAnnotation(ctx, annotation));
                // Draw current drawing
                if (isDrawing && currentPoints.length > 0) {
                    ctx.save();
                    ctx.globalAlpha = drawingStyle.opacity;
                    ctx.strokeStyle = drawingStyle.color;
                    ctx.lineWidth = drawingStyle.thickness;
                    ctx.lineCap = drawingStyle.lineCap;
                    ctx.lineJoin = drawingStyle.lineJoin;
                    switch (currentTool) {
                        case 'freehand':
                            if (currentPoints.length > 1) {
                                ctx.beginPath();
                                ctx.moveTo(currentPoints[0].x, currentPoints[0].y);
                                for (let i = 1; i < currentPoints.length; i++) {
                                    ctx.lineTo(currentPoints[i].x, currentPoints[i].y);
                                    ctx.stroke();
                                    break;
                                }
                            }
                        case 'line':
                        case 'arrow':
                            if (currentPoints.length === 2) {
                                ctx.beginPath();
                                ctx.moveTo(currentPoints[0].x, currentPoints[0].y);
                                ctx.lineTo(currentPoints[1].x, currentPoints[1].y);
                                ctx.stroke();
                                break;
                            }
                        case 'rectangle':
                            if (currentPoints.length === 2) {
                                const startX = Math.min(currentPoints[0].x, currentPoints[1].x);
                                const startY = Math.min(currentPoints[0].y, currentPoints[1].y);
                                const rectWidth = Math.abs(currentPoints[1].x - currentPoints[0].x);
                                const rectHeight = Math.abs(currentPoints[1].y - currentPoints[0].y);
                                ctx.beginPath();
                                ctx.rect(startX, startY, rectWidth, rectHeight);
                                ctx.stroke();
                                break;
                            }
                        case 'circle':
                            if (currentPoints.length === 2) {
                                const centerX = currentPoints[0].x;
                                const centerY = currentPoints[0].y;
                                const radius = Math.sqrt();
                            }
                    }
                }
            });
            Math.pow(currentPoints[1].x - centerX, 2) +
                Math.pow(currentPoints[1].y - centerY, 2);
            ;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.stroke();
            break;
            ctx.restore();
        }
        [annotations, drawingStyle, currentTool, currentPoints, isDrawing, width, height, drawGrid, drawAnnotation, getContext];
        ;
        // Handle mouse down
        const handleMouseDown = useCallback((event) => {
            if (readonly)
                return;
            const point = getCanvasCoordinates(event);
            if (currentTool === 'eraser') {
                // Find annotation to erase
                const annotationToErase = annotations.find(annotation => { });
                // Simple hit detection - could be improved
                return annotation.points.some(p => );
                Math.abs(p.x - point.x) < 10 && Math.abs(p.y - point.y) < 10;
            }
        });
    }
    ;
    if (annotationToErase) {
        const updatedAnnotations = annotations.filter(a => a.id !== annotationToErase.id);
        onAnnotationsChange(updatedAnnotations);
        addToHistory(updatedAnnotations);
        return;
        setIsDrawing(true);
        setCurrentPoints([point]);
    }
    [readonly, currentTool, annotations, onAnnotationsChange, getCanvasCoordinates];
    ;
    // Handle mouse move
    const handleMouseMove = useCallback((event) => {
        if (!isDrawing || readonly)
            return;
        const point = getCanvasCoordinates(event);
        if (currentTool === 'freehand') {
            setCurrentPoints(prev => [...prev, point]);
        }
        else {
            setCurrentPoints(prev => [prev[0], point]);
        }
        [isDrawing, readonly, currentTool, getCanvasCoordinates];
    });
    // Handle mouse up
    const handleMouseUp = useCallback(() => {
        if (!isDrawing || readonly)
            return;
        if (currentPoints.length > 0) {
            const newAnnotation = {
                id: `drawing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` };
        }
        type: currentTool === 'eraser' ? 'freehand' : currentTool,
            points;
        [...currentPoints],
            style;
        { }
    }, ...drawingStyle);
}
layer: currentLayer,
    author;
currentUser,
    timestamp;
new Date().toISOString(),
    visible;
true,
    locked;
false;
;
const updatedAnnotations = [...annotations, newAnnotation];
onAnnotationsChange(updatedAnnotations);
addToHistory(updatedAnnotations);
setIsDrawing(false);
setCurrentPoints([]);
[isDrawing, readonly, currentPoints, currentTool, drawingStyle, currentLayer, currentUser, annotations, onAnnotationsChange];
;
// History management
const addToHistory = useCallback((newAnnotations) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newAnnotations]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
}, [history, historyIndex]);
// Undo/Redo
const undo = useCallback(() => {
    if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        onAnnotationsChange([...history[newIndex]]);
    }
    [historyIndex, history, onAnnotationsChange];
});
const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        onAnnotationsChange([...history[newIndex]]);
    }
    [historyIndex, history, onAnnotationsChange];
});
// Clear all annotations
const clearAll = useCallback(() => {
    onAnnotationsChange([]);
    addToHistory([]);
}, [onAnnotationsChange, addToHistory]);
// Export annotations as image
const exportAsImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas)
        return;
    const link = document.createElement('a');
    link.download = `annotations-${Date.now()}.png`;
}, link.href = canvas.toDataURL());
link.click();
[];
;
// Re-render when annotations change
useEffect(() => {
    renderAnnotations();
}, [renderAnnotations]);
// Layer visibility statistics
const layerStats = useMemo(() => {
    return DRAWING_LAYERS.map(layer => ({}), ...layer, count, annotations.filter(a => a.layer === layer.id).length, visible, layerVisibility[layer.id]);
});
[annotations, layerVisibility];
;
return;
_jsxs("div", { className: `drawing-annotations ${className}`, children: ["}", _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Pen, { className: "w-5 h-5 text-blue-600" }), _jsx("span", { children: "Drawing Annotations" }), _jsxs(Badge, { variant: "secondary", children: [annotations.length, " drawings"] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: () => setShowLayers(!showLayers), children: _jsx(Layers, { className: "w-4 h-4" }) }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => setShowStyles(!showStyles), children: _jsx(Palette, { className: "w-4 h-4" }) }), onSave && ()
                                        < Button, "variant=\"default\" size=\"sm\" onClick=", () => onSave(annotations), ">", _jsx(Save, { className: "w-4 h-4 mr-2" }), "Save"] }), ")}"] }) }), _jsxs("div", { className: "flex items-center gap-2 py-2 border-t", children: [_jsxs("div", { className: "flex items-center gap-1 pr-2 border-r", children: [Object.entries(DRAWING_TOOLS).map(([tool, config]) => ()
                                    < Button, key = { tool }, variant = { currentTool } === tool ? 'default' : 'ghost'), "size=\"sm\" onClick=", () => setCurrentTool(tool), "disabled=", readonly, "title=", config.label, ">", config.icon] }), "))}"] }), _jsxs("div", { className: "flex items-center gap-1 pr-2 border-r", children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: undo, disabled: readonly || historyIndex <= 0, title: "Undo", children: _jsx(Undo, { className: "w-4 h-4" }) }), _jsx(Button, { variant: "ghost", size: "sm", onClick: redo, disabled: readonly || historyIndex >= history.length - 1, title: "Redo", children: _jsx(Redo, { className: "w-4 h-4" }) })] }), _jsxs("div", { className: "flex items-center gap-1 pr-2 border-r", children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: exportAsImage, title: "Export as Image", children: _jsx(Download, { className: "w-4 h-4" }) }), _jsx(Button, { variant: "ghost", size: "sm", onClick: clearAll, disabled: readonly, title: "Clear All", children: _jsx(Trash2, { className: "w-4 h-4" }) })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Layer:" }), _jsxs(Select, { value: currentLayer.toString(), onValueChange: (value) => setCurrentLayer(parseInt(value)), children: [_jsx(SelectTrigger, { className: "w-32", children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: DRAWING_LAYERS.map(layer => ()
                                        < SelectItem, key = { layer, : .id }, value = { layer, : .id.toString() } >
                                        _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-3 h-3 rounded-full", style: { backgroundColor: layer.color } }), _jsx("span", { children: layer.name })] })) }), "))}"] })] })] })] });
div >
;
CardHeader >
    _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: showStyles && ()
                < Card >
                (_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-sm", children: "Drawing Style" }) })
                    ,
                        _jsx(CardContent, { className: "space-y-4", children: _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium mb-2", children: "Color" }), _jsxs("div", { className: "flex flex-wrap gap-1", children: [DRAWING_COLORS.map(color => ()
                                                        < button, key = { color }, className = {} `w-6 h-6 rounded border-2 ${drawingStyle.color === color ? 'border-gray-800' : 'border-gray-300',
                                                    }`), "style=", { backgroundColor: color }, "onClick=", () => setDrawingStyle(prev => ({ ...prev, color })), "/> ))}"] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium mb-2", children: "Thickness" }), _jsx(Slider, { value: [drawingStyle.thickness], onValueChange: (value) => setDrawingStyle(prev => ({ ...prev, thickness: value[0] })), min: 1, max: 20, step: 1 }), _jsxs("div", { className: "text-xs text-gray-500 mt-1", children: [drawingStyle.thickness, "px"] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium mb-2", children: "Opacity" }), _jsx(Slider, { value: [drawingStyle.opacity * 100], onValueChange: (value) => setDrawingStyle(prev => ({ ...prev, opacity: value[0] / 100 })), min: 10, max: 100, step: 10 }), _jsxs("div", { className: "text-xs text-gray-500 mt-1", children: [Math.round(drawingStyle.opacity * 100), "%"] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium mb-2", children: "Line Style" }), _jsx(Select, { value: drawingStyle.dashPattern ? 'dashed' : 'solid', onValueChange: (value) => setDrawingStyle(prev => ({}), ...prev, dashPattern) }), ": value === 'dashed' ? [5, 5] : undefined }))} >", _jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "solid", children: "Solid" }), _jsx(SelectItem, { value: "dashed", children: "Dashed" })] })] })] }) })) }) });
Card >
;
{ /* Layer Panel */ }
{
    showLayers && ()
        < Card >
        (_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-sm", children: "Layers" }) })
            ,
                _jsxs(CardContent, { children: [_jsx("div", { className: "space-y-2", children: layerStats.map(layer => ()
                                < div, key = { layer, : .id }, className = "flex items-center justify-between p-2 rounded border" >
                                (_jsx("div", { className: "flex items-center gap-3", children: _jsx(Switch, { checked: layer.visible, onCheckedChange: (checked) => setLayerVisibility(prev => ({ ...prev, [layer.id]: checked }))
                                            /  >
                                            (_jsx("div", { className: "w-4 h-4 rounded-full", style: { backgroundColor: layer.color } })
                                                ,
                                                    _jsx("span", { className: "text-sm font-medium", children: layer.name })) }) })
                                    ,
                                        _jsx(Badge, { variant: "secondary", className: "text-xs", children: layer.count }))) }), "))}"] }));
    CardContent >
    ;
    Card >
    ;
}
{ /* Canvas Container */ }
_jsxs("div", { className: "relative border border-gray-300 rounded-lg overflow-hidden", style: { width, height }, children: [backgroundImageUrl && ()
            < canvas, "ref=", backgroundCanvasRef, "width=", width, "height=", height, "className=\"absolute inset-0\" style=", {
            backgroundImage: `url(${backgroundImageUrl})`
        }, ", backgroundSize: 'cover', backgroundPosition: 'center'; }} /> )}", _jsx("canvas", { ref: canvasRef, width: width, height: height, className: "absolute inset-0" }), _jsx("canvas", { ref: overlayCanvasRef, width: width, height: height, className: "absolute inset-0 cursor-crosshair", onMouseDown: handleMouseDown, onMouseMove: handleMouseMove, onMouseUp: handleMouseUp, onMouseLeave: () => {
                setIsDrawing(false);
                setCurrentPoints([]);
            }, style: {
                cursor: DRAWING_TOOLS[currentTool]?.cursor || 'crosshair',
                pointerEvents: readonly ? 'none' : 'all',
            } }), readonly && ()
            < div, " className=\"absolute inset-0 bg-gray-500 bg-opacity-10 flex items-center justify-center\">", _jsx(Badge, { variant: "secondary", children: "Read Only" })] });
div >
;
div >
;
CardContent >
;
Card >
;
div >
;
;
;
export default DrawingAnnotationsCanvas;
