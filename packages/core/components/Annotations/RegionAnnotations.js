import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Area/Region Annotations System - E17-1753114397305-79782A
 *
 * Professional region selection and annotation tools for VFX pipeline workflows.
 * Supports multi-node selection, highlighting, MARS zone annotations, and area-based feedback.
 */
import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Switch } from '../ui/Switch';
import { Square, Circle, Polygon, Paintbrush, Edit3, Save, Target, Settings, AlertTriangle, Clock, Camera, Zap } from 'lucide-react';
// Region type configurations for VFX workflow
const REGION_TYPES = {
    selection: {
        icon: _jsx(Square, { className: "w-4 h-4" }),
        label: 'Selection',
        color: '#3b82f6',
        fillOpacity: 0.1,
        description: 'Basic node selection area'
    },
    highlight: {
        icon: _jsx(Target, { className: "w-4 h-4" }),
        label: 'Highlight',
        color: '#f59e0b',
        fillOpacity: 0.2,
        description: 'Important area highlighting'
    },
    problem_area: {
        icon: _jsx(AlertTriangle, { className: "w-4 h-4" }),
        label: 'Problem Area',
        color: '#ef4444',
        fillOpacity: 0.15,
        description: 'Issues or problems requiring attention'
    },
    optimization_zone: {
        icon: _jsx(Zap, { className: "w-4 h-4" }),
        label: 'Optimization Zone',
        color: '#10b981',
        fillOpacity: 0.12,
        description: 'Areas for performance optimization'
    },
    mars_zone: {
        icon: _jsx(Camera, { className: "w-4 h-4" }),
        label: 'MARS Zone',
        color: '#8b5cf6',
        fillOpacity: 0.18,
        description: 'MARS methodology zone annotation'
    },
    performance_area: {
        icon: _jsx(Clock, { className: "w-4 h-4" }),
        label: 'Performance Area',
        color: '#06b6d4',
        fillOpacity: 0.14,
        description: 'Performance monitoring region'
    }
};
// MARS zone configurations for VFX directors
const MARS_ZONES = {
    motion_source: { color: '#ef4444', label: 'Motion Source', icon: '🎬' },
    action_trigger: { color: '#f97316', label: 'Action Trigger', icon: '⚡' },
    reaction_output: { color: '#eab308', label: 'Reaction Output', icon: '💥' },
    subject_focus: { color: '#22c55e', label: 'Subject Focus', icon: '🎯' },
    camera_influence: { color: '#3b82f6', label: 'Camera Zone', icon: '📹' },
    lighting_zone: { color: '#8b5cf6', label: 'Lighting Zone', icon: '💡' },
    effects_region: { color: '#ec4899', label: 'Effects Region', icon: '✨' },
    audio_sync: { color: '#06b6d4', label: 'Audio Sync', icon: '🔊' },
    timing_critical: { color: '#dc2626', label: 'Timing Critical', icon: '⏰' },
    creative_decision: { color: '#7c3aed', label: 'Creative Decision', icon: '🎨' }
};
// Drawing tools for region creation
const REGION_TOOLS = {
    rectangle: { icon: _jsx(Square, { className: "w-4 h-4" }), label: 'Rectangle' },
    circle: { icon: _jsx(Circle, { className: "w-4 h-4" }), label: 'Circle' },
    polygon: { icon: _jsx(Polygon, { className: "w-4 h-4" }), label: 'Polygon' },
    freehand: { icon: _jsx(Paintbrush, { className: "w-4 h-4" }), label: 'Freehand' }
};
export const RegionAnnotationSystem = ({ width, height, regions, nodes = [], currentUser, onRegionsChange, onRegionSelect, onNodesInRegion, selectedRegion, readonly = false, showGrid = false, className = '' }) => {
    const canvasRef = useRef(null);
    const overlayRef = useRef(null);
    // Region creation state
    const [isCreating, setIsCreating] = useState(false);
    const [creationTool, setCreationTool] = useState('rectangle');
    const [creationPoints, setCreationPoints] = useState([]);
    const [newRegion, setNewRegion] = useState({
        type: 'selection',
        priority: 'medium',
        marsZone: undefined
    });
    // UI state
    const [showRegionDetails, setShowRegionDetails] = useState(false);
    const [filterType, setFilterType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [zoom, _____setZoom] = useState(1);
    const [pan, _____setPan] = useState({ x: 0, y: 0 });
    // Get canvas context
    const getContext = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas)
            return null;
        return canvas.getContext('2d');
    }, []);
    // Convert screen coordinates to canvas coordinates
    const getCanvasCoordinates = useCallback((event) => {
        const canvas = overlayRef.current;
        if (!canvas)
            return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
            x: (event.clientX - rect.left) * scaleX / zoom - pan.x,
            y: (event.clientY - rect.top) * scaleY / zoom - pan.y
        };
    }, [zoom, pan]);
    // Check if point is inside region
    const isPointInRegion = useCallback((point, region) => {
        switch (region.area.shape) {
            case 'rectangle':
                const bounds = region.area.bounds;
                return point.x >= bounds.x &&
                    point.x <= bounds.x + bounds.width &&
                    point.y >= bounds.y &&
                    point.y <= bounds.y + bounds.height;
            case 'circle':
                if (!region.area.center || !region.area.radius)
                    return false;
                const dx = point.x - region.area.center.x;
                const dy = point.y - region.area.center.y;
                return Math.sqrt(dx * dx + dy * dy) <= region.area.radius;
            case 'polygon':
            case 'freehand':
                // Ray casting algorithm for polygon containment
                const points = region.area.points;
                let inside = false;
                for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
                    if (((points[i].y > point.y) !== (points[j].y > point.y)) &&
                        (point.x < (points[j].x - points[i].x) * (point.y - points[i].y) / (points[j].y - points[i].y) + points[i].x)) {
                        inside = !inside;
                    }
                }
                return inside;
            default:
                return false;
        }
    }, []);
    // Find nodes within a region
    const getNodesInRegion = useCallback((region) => {
        return nodes
            .filter(node => {
            const nodeCenter = {
                x: node.x + node.width / 2,
                y: node.y + node.height / 2
            };
            return isPointInRegion(nodeCenter, region);
        })
            .map(node => node.id);
    }, [nodes, isPointInRegion]);
    // Draw grid on canvas
    const drawGrid = useCallback((ctx) => {
        if (!showGrid)
            return;
        ctx.save();
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 0.5;
        ctx.setLineDash([]);
        const gridSize = 20;
        for (let x = 0; x <= width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        for (let y = 0; y <= height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        ctx.restore();
    }, [showGrid, width, height]);
    // Draw single region
    const drawRegion = useCallback((ctx, region) => {
        if (!region.visible)
            return;
        ctx.save();
        // Apply styles
        ctx.strokeStyle = region.style.borderColor;
        ctx.lineWidth = region.style.borderWidth;
        ctx.fillStyle = region.style.fillColor;
        ctx.globalAlpha = region.style.fillOpacity;
        // Set line style
        switch (region.style.borderStyle) {
            case 'dashed':
                ctx.setLineDash([5, 5]);
                break;
            case 'dotted':
                ctx.setLineDash([2, 2]);
                break;
            default:
                ctx.setLineDash([]);
        }
        // Draw shape
        switch (region.area.shape) {
            case 'rectangle':
                const bounds = region.area.bounds;
                ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
                ctx.globalAlpha = 1;
                ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
                break;
            case 'circle':
                if (region.area.center && region.area.radius) {
                    ctx.beginPath();
                    ctx.arc(region.area.center.x, region.area.center.y, region.area.radius, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.globalAlpha = 1;
                    ctx.stroke();
                }
                break;
            case 'polygon':
            case 'freehand':
                if (region.area.points.length > 2) {
                    ctx.beginPath();
                    ctx.moveTo(region.area.points[0].x, region.area.points[0].y);
                    for (let i = 1; i < region.area.points.length; i++) {
                        ctx.lineTo(region.area.points[i].x, region.area.points[i].y);
                    }
                    ctx.closePath();
                    ctx.fill();
                    ctx.globalAlpha = 1;
                    ctx.stroke();
                }
                break;
        }
        // Draw selection indicator
        if (selectedRegion === region.id) {
            ctx.setLineDash([]);
            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = 3;
            ctx.globalAlpha = 0.8;
            // Draw selection border
            const selectionBounds = {
                x: region.area.bounds.x - 5,
                y: region.area.bounds.y - 5,
                width: region.area.bounds.width + 10,
                height: region.area.bounds.height + 10
            };
            ctx.strokeRect(selectionBounds.x, selectionBounds.y, selectionBounds.width, selectionBounds.height);
            // Draw corner handles
            const handleSize = 8;
            const handles = [
                { x: selectionBounds.x, y: selectionBounds.y },
                { x: selectionBounds.x + selectionBounds.width, y: selectionBounds.y },
                { x: selectionBounds.x + selectionBounds.width, y: selectionBounds.y + selectionBounds.height },
                { x: selectionBounds.x, y: selectionBounds.y + selectionBounds.height }
            ];
            ctx.fillStyle = '#3b82f6';
            handles.forEach(handle => {
                ctx.fillRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
            });
        }
        // Draw label
        ctx.globalAlpha = 1;
        ctx.fillStyle = region.style.borderColor;
        ctx.font = '12px system-ui, sans-serif';
        ctx.fillText(region.name, region.area.bounds.x + 5, region.area.bounds.y + 15);
        // Draw MARS zone indicator
        if (region.marsZone) {
            const marsConfig = MARS_ZONES[region.marsZone];
            ctx.font = '16px system-ui, sans-serif';
            ctx.fillText(marsConfig.icon, region.area.bounds.x + region.area.bounds.width - 20, region.area.bounds.y + 20);
        }
        // Draw node count
        const nodeCount = region.metadata.nodeCount;
        if (nodeCount > 0) {
            ctx.fillStyle = '#6b7280';
            ctx.font = '10px system-ui, sans-serif';
            ctx.fillText(`${nodeCount} nodes`, region.area.bounds.x + 5, region.area.bounds.y + region.area.bounds.height - 5);
        }
        ctx.restore();
    }, [selectedRegion]);
    // Render all regions
    const renderRegions = useCallback(() => {
        const ctx = getContext();
        if (!ctx)
            return;
        ctx.clearRect(0, 0, width, height);
        // Draw grid
        drawGrid(ctx);
        // Draw regions (sorted by priority and selection)
        const sortedRegions = [...regions].sort((a, b) => {
            if (selectedRegion === a.id)
                return 1;
            if (selectedRegion === b.id)
                return -1;
            const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
        sortedRegions.forEach(region => drawRegion(ctx, region));
        // Draw current creation preview
        if (isCreating && creationPoints.length > 0) {
            ctx.save();
            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.globalAlpha = 0.7;
            if (creationTool === 'rectangle' && creationPoints.length === 2) {
                const startX = Math.min(creationPoints[0].x, creationPoints[1].x);
                const startY = Math.min(creationPoints[0].y, creationPoints[1].y);
                const rectWidth = Math.abs(creationPoints[1].x - creationPoints[0].x);
                const rectHeight = Math.abs(creationPoints[1].y - creationPoints[0].y);
                ctx.strokeRect(startX, startY, rectWidth, rectHeight);
            }
            ctx.restore();
        }
    }, [regions, selectedRegion, width, height, drawGrid, drawRegion, getContext, isCreating, creationPoints, creationTool]);
    // Handle mouse events for region creation and selection
    const handleMouseDown = useCallback((event) => {
        if (readonly)
            return;
        const point = getCanvasCoordinates(event);
        if (isCreating) {
            setCreationPoints(prev => [...prev, point]);
            if (creationTool === 'rectangle' && creationPoints.length === 1) {
                // Complete rectangle creation on second click
                return;
            }
        }
        else {
            // Check if clicking on existing region
            const clickedRegion = regions.find(region => isPointInRegion(point, region));
            if (clickedRegion) {
                onRegionSelect?.(clickedRegion.id);
                // Update node selection if callback provided
                const nodeIds = getNodesInRegion(clickedRegion);
                onNodesInRegion?.(nodeIds);
            }
            else {
                onRegionSelect?.(null);
                onNodesInRegion?.([]);
            }
        }
    }, [readonly, isCreating, creationTool, creationPoints, regions, getCanvasCoordinates, isPointInRegion, onRegionSelect, onNodesInRegion, getNodesInRegion]);
    const handleMouseMove = useCallback((event) => {
        if (!isCreating || readonly)
            return;
        const point = getCanvasCoordinates(event);
        if (creationTool === 'rectangle' && creationPoints.length === 1) {
            setCreationPoints([creationPoints[0], point]);
        }
    }, [isCreating, readonly, creationTool, creationPoints, getCanvasCoordinates]);
    // Complete region creation
    const completeRegionCreation = useCallback(() => {
        if (creationPoints.length < 2)
            return;
        const regionConfig = REGION_TYPES[newRegion.type];
        let area;
        if (creationTool === 'rectangle') {
            const startX = Math.min(creationPoints[0].x, creationPoints[1].x);
            const startY = Math.min(creationPoints[0].y, creationPoints[1].y);
            const rectWidth = Math.abs(creationPoints[1].x - creationPoints[0].x);
            const rectHeight = Math.abs(creationPoints[1].y - creationPoints[0].y);
            area = {
                shape: 'rectangle',
                bounds: { x: startX, y: startY, width: rectWidth, height: rectHeight },
                points: creationPoints
            };
        }
        else {
            area = {
                shape: creationTool,
                bounds: {
                    x: Math.min(...creationPoints.map(p => p.x)),
                    y: Math.min(...creationPoints.map(p => p.y)),
                    width: Math.max(...creationPoints.map(p => p.x)) - Math.min(...creationPoints.map(p => p.x)),
                    height: Math.max(...creationPoints.map(p => p.y)) - Math.min(...creationPoints.map(p => p.y))
                },
                points: creationPoints
            };
        }
        const region = {
            id: `region-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: newRegion.name || `${regionConfig.label} ${regions.length + 1}`,
            type: newRegion.type || 'selection',
            shape: creationTool,
            area,
            style: {
                borderColor: regionConfig.color,
                borderWidth: 2,
                borderStyle: 'solid',
                fillColor: regionConfig.color,
                fillOpacity: regionConfig.fillOpacity
            },
            description: newRegion.description || '',
            author: currentUser,
            timestamp: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            visible: true,
            locked: false,
            priority: newRegion.priority || 'medium',
            status: 'active',
            marsZone: newRegion.marsZone,
            nodeIds: getNodesInRegion({ ...newRegion, area }),
            tags: [],
            metadata: {
                nodeCount: 0 // Will be updated after creation
            }
        };
        // Update node count
        region.metadata.nodeCount = getNodesInRegion(region).length;
        onRegionsChange([...regions, region]);
        // Reset creation state
        setIsCreating(false);
        setCreationPoints([]);
        setNewRegion({ type: 'selection', priority: 'medium' });
    }, [creationPoints, creationTool, newRegion, regions, currentUser, onRegionsChange, getNodesInRegion]);
    // Filter regions
    const filteredRegions = useMemo(() => {
        return regions.filter(region => {
            if (filterType !== 'all' && region.type !== filterType)
                return false;
            if (filterStatus !== 'all' && region.status !== filterStatus)
                return false;
            return true;
        });
    }, [regions, filterType, filterStatus]);
    // Statistics
    const stats = useMemo(() => {
        const total = regions.length;
        const active = regions.filter(r => r.status === 'active').length;
        const critical = regions.filter(r => r.priority === 'critical').length;
        const totalNodes = regions.reduce((sum, r) => sum + r.metadata.nodeCount, 0);
        return { total, active, critical, totalNodes };
    }, [regions]);
    // Re-render when regions change
    useEffect(() => {
        renderRegions();
    }, [renderRegions]);
    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && isCreating) {
                setIsCreating(false);
                setCreationPoints([]);
            }
            else if (event.key === 'Enter' && isCreating && creationPoints.length >= 2) {
                completeRegionCreation();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isCreating, creationPoints, completeRegionCreation]);
    return (_jsx("div", { className: `region-annotation-system ${className}`, children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Square, { className: "w-5 h-5 text-purple-600" }), _jsx("span", { children: "Region Annotations" }), _jsxs(Badge, { variant: "secondary", children: [filteredRegions.length, " regions"] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: () => setShowRegionDetails(!showRegionDetails), children: _jsx(Settings, { className: "w-4 h-4" }) }), _jsxs(Button, { variant: isCreating ? 'default' : 'outline', size: "sm", onClick: () => setIsCreating(!isCreating), disabled: readonly, children: [_jsx(Edit3, { className: "w-4 h-4 mr-2" }), isCreating ? 'Cancel' : 'Create Region'] })] })] }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3 mt-4", children: [_jsxs("div", { className: "bg-blue-50 p-3 rounded-lg text-center", children: [_jsx("div", { className: "text-lg font-bold text-blue-900", children: stats.total }), _jsx("div", { className: "text-xs text-blue-700", children: "Total Regions" })] }), _jsxs("div", { className: "bg-green-50 p-3 rounded-lg text-center", children: [_jsx("div", { className: "text-lg font-bold text-green-900", children: stats.active }), _jsx("div", { className: "text-xs text-green-700", children: "Active" })] }), _jsxs("div", { className: "bg-red-50 p-3 rounded-lg text-center", children: [_jsx("div", { className: "text-lg font-bold text-red-900", children: stats.critical }), _jsx("div", { className: "text-xs text-red-700", children: "Critical" })] }), _jsxs("div", { className: "bg-purple-50 p-3 rounded-lg text-center", children: [_jsx("div", { className: "text-lg font-bold text-purple-900", children: stats.totalNodes }), _jsx("div", { className: "text-xs text-purple-700", children: "Nodes in Regions" })] })] })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [isCreating && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-sm", children: "Create New Region" }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium mb-2", children: "Shape" }), _jsx("div", { className: "flex gap-1", children: Object.entries(REGION_TOOLS).map(([tool, config]) => (_jsx(Button, { variant: creationTool === tool ? 'default' : 'outline', size: "sm", onClick: () => setCreationTool(tool), children: config.icon }, tool))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium mb-2", children: "Type" }), _jsxs(Select, { value: newRegion.type || 'selection', onValueChange: (value) => setNewRegion(prev => ({ ...prev, type: value })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: Object.entries(REGION_TYPES).map(([type, config]) => (_jsx(SelectItem, { value: type, children: _jsxs("div", { className: "flex items-center gap-2", children: [config.icon, _jsx("span", { children: config.label })] }) }, type))) })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium mb-2", children: "Priority" }), _jsxs(Select, { value: newRegion.priority || 'medium', onValueChange: (value) => setNewRegion(prev => ({ ...prev, priority: value })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "low", children: "Low" }), _jsx(SelectItem, { value: "medium", children: "Medium" }), _jsx(SelectItem, { value: "high", children: "High" }), _jsx(SelectItem, { value: "critical", children: "Critical" })] })] })] }), newRegion.type === 'mars_zone' && (_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium mb-2", children: "MARS Zone" }), _jsxs(Select, { value: newRegion.marsZone || '', onValueChange: (value) => setNewRegion(prev => ({ ...prev, marsZone: value })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select zone..." }) }), _jsx(SelectContent, { children: Object.entries(MARS_ZONES).map(([zone, config]) => (_jsx(SelectItem, { value: zone, children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { children: config.icon }), _jsx("span", { children: config.label })] }) }, zone))) })] })] }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium mb-2", children: "Name" }), _jsx("input", { type: "text", value: newRegion.name || '', onChange: (e) => setNewRegion(prev => ({ ...prev, name: e.target.value })), placeholder: "Region name...", className: "w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" })] }), _jsxs("div", { className: "flex justify-end gap-2", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: () => {
                                                            setIsCreating(false);
                                                            setCreationPoints([]);
                                                        }, children: "Cancel" }), _jsxs(Button, { size: "sm", onClick: completeRegionCreation, disabled: creationPoints.length < 2, children: [_jsx(Save, { className: "w-4 h-4 mr-2" }), "Create Region"] })] }), _jsx("div", { className: "text-xs text-gray-500", children: creationTool === 'rectangle' ? 'Click and drag to create rectangle' :
                                                    'Click points to create shape, press Enter to complete' })] })] })), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("label", { className: "text-sm", children: "Type:" }), _jsxs(Select, { value: filterType, onValueChange: setFilterType, children: [_jsx(SelectTrigger, { className: "w-32", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Types" }), Object.entries(REGION_TYPES).map(([type, config]) => (_jsx(SelectItem, { value: type, children: config.label }, type)))] })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("label", { className: "text-sm", children: "Status:" }), _jsxs(Select, { value: filterStatus, onValueChange: setFilterStatus, children: [_jsx(SelectTrigger, { className: "w-32", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Statuses" }), _jsx(SelectItem, { value: "active", children: "Active" }), _jsx(SelectItem, { value: "resolved", children: "Resolved" }), _jsx(SelectItem, { value: "archived", children: "Archived" })] })] })] })] }), _jsxs("div", { className: "relative border border-gray-300 rounded-lg overflow-hidden", style: { width, height }, children: [_jsx("canvas", { ref: canvasRef, width: width, height: height, className: "absolute inset-0" }), _jsx("canvas", { ref: overlayRef, width: width, height: height, className: "absolute inset-0 cursor-crosshair", onMouseDown: handleMouseDown, onMouseMove: handleMouseMove, style: { pointerEvents: readonly ? 'none' : 'all' } }), readonly && (_jsx("div", { className: "absolute top-2 right-2", children: _jsx(Badge, { variant: "secondary", children: "Read Only" }) }))] }), showRegionDetails && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-sm", children: "Region Details" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-2 max-h-64 overflow-y-auto", children: [filteredRegions.map(region => {
                                                    const typeConfig = REGION_TYPES[region.type];
                                                    return (_jsxs("div", { className: `p-3 border rounded cursor-pointer transition-colors ${selectedRegion === region.id ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`, onClick: () => onRegionSelect?.(region.id), children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { style: { color: typeConfig.color }, children: typeConfig.icon }), _jsx("span", { className: "font-medium", children: region.name })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { variant: "secondary", className: "text-xs", style: { backgroundColor: `${typeConfig.color}20`, color: typeConfig.color }, children: region.priority }), _jsx(Switch, { checked: region.visible, onCheckedChange: (checked) => {
                                                                                    const updatedRegions = regions.map(r => r.id === region.id ? { ...r, visible: checked } : r);
                                                                                    onRegionsChange(updatedRegions);
                                                                                }, size: "sm" })] })] }), _jsxs("div", { className: "text-xs text-gray-600", children: [_jsx("div", { children: region.description }), _jsxs("div", { className: "mt-1 flex items-center gap-4", children: [_jsxs("span", { children: [region.metadata.nodeCount, " nodes"] }), _jsx("span", { children: region.author.name }), _jsx("span", { children: new Date(region.timestamp).toLocaleDateString() })] })] }), region.marsZone && (_jsx("div", { className: "mt-2", children: _jsxs(Badge, { variant: "outline", className: "text-xs", children: [MARS_ZONES[region.marsZone].icon, " ", MARS_ZONES[region.marsZone].label] }) }))] }, region.id));
                                                }), filteredRegions.length === 0 && (_jsxs("div", { className: "text-center py-8 text-gray-500", children: [_jsx(Square, { className: "w-8 h-8 mx-auto mb-2 opacity-50" }), _jsx("div", { children: "No regions found" }), _jsx("div", { className: "text-sm", children: "Try adjusting your filters or create a new region" })] }))] }) })] }))] }) })] }) }));
};
export default RegionAnnotationSystem;
