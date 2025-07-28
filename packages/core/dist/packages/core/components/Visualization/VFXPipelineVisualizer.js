import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * VFX Pipeline Visualizer - E17-1753114397343-6622FD
 *
 * Advanced visualization components for Wild Construct VFX pipeline workflows.
 * Provides real-time visualization of historical accuracy, scene composition,
 * asset relationships, and creative workflow metrics.
 */
import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Slider } from '../ui/Slider';
import { Film, Palette, Clock, Globe, Layers, Eye, Settings, TrendingUp, AlertTriangle, CheckCircle, Play, Pause, SkipForward, Rewind, Camera, Users, Map, Brush, Zap } from 'lucide-react';
export const VFXPipelineVisualizer = ({
    scene,
    scenes = [],
    realTimeUpdate = true,
    showControls = true,
    onSceneUpdate,
    className = ''
});
{
    const [activeView, setActiveView] = useState('scene');
    const [selectedScene, setSelectedScene] = useState(scene || scenes[0]);
    const [viewMode, setViewMode] = useState('2d');
    const [showGrid, setShowGrid] = useState(true);
    const [animationSpeed, setAnimationSpeed] = useState(1);
    const [isPlaying, setIsPlaying] = useState(false);
    // Enhanced 3D Scene Visualization
    const SceneVisualization3D = ({ scene }) => {
        const canvasWidth = 600;
        const canvasHeight = 400;
        // Calculate 3D positions for isometric projection
        const project3DToIsometric = useCallback((x, y, z) => {
            const isoX = (x - z) * Math.cos(Math.PI / 6);
            const isoY = (x + z) * Math.sin(Math.PI / 6) - y;
            return {
                x: canvasWidth / 2 + isoX * 2,
                y: canvasHeight / 2 + isoY * 2,
            };
        }, []);
        return;
        _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Camera, { className: "w-5 h-5 text-blue-600" }), "3D Scene Composition: ", scene.name] }), _jsxs("div", { className: "flex items-center gap-4 text-sm text-gray-600", children: [_jsx("span", { children: scene.historicalPeriod }), _jsx("span", { children: scene.region }), _jsxs(Badge, { variant: scene.accuracy.expertValidated ? 'default' : 'secondary', children: [scene.accuracy.overall, "% Accurate"] })] })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "relative", children: [_jsx("svg", { width: canvasWidth, height: canvasHeight, className: "border rounded", children: showGrid && ()
                                        < defs >
                                        _jsx("pattern", { id: "grid", width: "40", height: "40", patternUnits: "userSpaceOnUse", children: _jsx("path", { d: "M 40 0 L 0 0 0 40", fill: "none", stroke: "#e5e7eb", strokeWidth: "1" }) }) }), ")}", showGrid && _jsx("rect", { width: "100%", height: "100%", fill: "url(#grid)" }), _jsxs("g", { className: "environment-layers", children: [_jsx("defs", { children: _jsxs("linearGradient", { id: "skyGradient", x1: "0%", y1: "0%", x2: "0%", y2: "100%", children: [_jsx("stop", { offset: "0%", stopColor: "#87CEEB" }), _jsx("stop", { offset: "100%", stopColor: "#E0F6FF" })] }) }), _jsx("rect", { width: "100%", height: "60%", fill: "url(#skyGradient)" }), _jsx("polygon", { points: `0,${canvasHeight * 0.6} ${canvasWidth},${canvasHeight * 0.6} ${canvasWidth},${canvasHeight} 0,${canvasHeight}`, fill: "#8B7355" })] }), _jsxs("g", { className: "scene-assets", children: [scene.assets.map((asset, index) => {
                                            const pos = project3DToIsometric();
                                        }), "; (index % 5) * 100 - 200, 0, Math.floor(index / 5) * 80 - 100 ); const color = asset.accuracy > 90 ? '#10b981' :; asset.accuracy > 70 ? '#f59e0b' : '#ef4444'; return;", _jsxs("g", { transform: `translate(${pos.x}, ${pos.y})`, children: ["}", asset.type === 'building' && ()
                                                    < polygon, "points=\"-15,-20 15,-20 20,-15 20,20 -20,20 -20,-15\" fill=", color, "fillOpacity=\"0.8\" stroke=\"#374151\" strokeWidth=\"2\" /> )}", asset.type === 'prop' && ()
                                                    < circle, " r=\"8\" fill=", color, " fillOpacity=\"0.8\" stroke=\"#374151\" strokeWidth=\"2\" /> )}", asset.type === 'vegetation' && ()
                                                    < polygon, "points=\"-8,15 0,-20 8,15\" fill=\"#22c55e\" fillOpacity=\"0.8\" stroke=\"#166534\" strokeWidth=\"2\" /> )}", _jsx("circle", { r: "3", cx: "15", cy: "-15", fill: color }), _jsx("text", { x: "15", y: "-10", textAnchor: "middle", fontSize: "10", fill: "#374151", fontWeight: "600", children: Math.round(asset.accuracy) })] }, asset.id), "); })}"] }), _jsxs("g", { className: "scene-characters", children: [scene.characters.map((character, index) => {
                                            const pos = project3DToIsometric();
                                        }), "; character.position.x || (index * 60 - 120), character.position.y || 0, character.position.z || (index * 30 - 60) ); const color = character.type === 'hero' ? '#3b82f6' :; character.type === 'crowd' ? '#8b5cf6' : '#6b7280'; return;", _jsxs("g", { transform: `translate(${pos.x}, ${pos.y})`, children: ["}", _jsx("ellipse", { rx: "6", ry: "3", cy: "20", fill: color, fillOpacity: "0.3" }), _jsx("rect", { x: "-3", y: "5", width: "6", height: "15", rx: "3", fill: color }), _jsx("circle", { r: "4", cy: "-2", fill: color }), _jsx("text", { x: "0", y: "35", textAnchor: "middle", fontSize: "8", fill: "#374151", fontWeight: "500", children: character.type.charAt(0).toUpperCase() })] }, character.id), "); })}"] }), _jsx("g", { className: "camera-view", children: _jsxs("g", { transform: `translate(${canvasWidth - 80}, 40)`, children: ["}", _jsx("circle", { r: "25", fill: "rgba(59, 130, 246, 0.1)", stroke: "#3b82f6", strokeWidth: "2" }), _jsx("polygon", { points: "-8,-8 8,-8 12,0 8,8 -8,8", fill: "#3b82f6", transform: "rotate(45)" }), _jsx("text", { x: "0", y: "40", textAnchor: "middle", fontSize: "10", fill: "#3b82f6", children: "Camera" })] }) })] }), showControls && ()
                            < div, " className=\"absolute top-2 right-2 flex flex-col gap-2\">", _jsx(Button, { variant: "outline", size: "sm", onClick: () => setShowGrid(!showGrid), className: "bg-white/90", children: "Grid" }), _jsxs(Select, { value: viewMode, onValueChange: (value) => setViewMode(value), children: [_jsx(SelectTrigger, { className: "w-20 h-8 bg-white/90", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "2d", children: "2D" }), _jsx(SelectItem, { value: "3d", children: "3D" }), _jsx(SelectItem, { value: "timeline", children: "Time" })] })] })] }), ")}"] });
    };
    CardContent >
    ;
    Card >
    ;
    ;
}
;
// Historical Accuracy Dashboard
const HistoricalAccuracyDashboard = ({ scene }) => {
    const accuracyMetrics = [];
    {
        label: 'Architecture', value;
        scene.accuracy.architecture, icon;
        _jsx(Map, { className: "w-4 h-4" });
    }
    {
        label: 'Clothing', value;
        scene.accuracy.clothing, icon;
        _jsx(Users, { className: "w-4 h-4" });
    }
    {
        label: 'Technology', value;
        scene.accuracy.technology, icon;
        _jsx(Zap, { className: "w-4 h-4" });
    }
    {
        label: 'Culture', value;
        scene.accuracy.culture, icon;
        _jsx(Globe, { className: "w-4 h-4" });
    }
    {
        label: 'Timeline', value;
        scene.accuracy.timeline, icon;
        _jsx(Clock, { className: "w-4 h-4" });
    }
};
;
const getAccuracyColor = (value) => {
    if (value >= 90)
        return 'text-green-600 bg-green-100';
    if (value >= 80)
        return 'text-blue-600 bg-blue-100';
    if (value >= 70)
        return 'text-yellow-600 bg-yellow-100';
    if (value >= 60)
        return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
};
const getSeverityColor = (severity) => {
    switch (severity) {
        case 'critical': return 'bg-red-100 text-red-800';
        case 'high': return 'bg-orange-100 text-orange-800';
        case 'medium': return 'bg-yellow-100 text-yellow-800';
        case 'low': return 'bg-blue-100 text-blue-800';
        default: return 'bg-gray-100 text-gray-800';
    }
    ;
    return;
    _jsx("div", { className: "space-y-6", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center justify-between", children: [_jsxs("span", { className: "flex items-center gap-2", children: [_jsx(CheckCircle, { className: "w-5 h-5 text-green-600" }), "Historical Accuracy Score"] }), _jsx(Badge, { variant: scene.accuracy.expertValidated ? 'default' : 'secondary', children: scene.accuracy.expertValidated ? 'Expert Validated' : 'Pending Review' })] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "flex items-center justify-center mb-6", children: _jsxs("div", { className: "relative w-32 h-32", children: [_jsxs("svg", { className: "w-full h-full transform -rotate-90", children: [_jsx("circle", { cx: "64", cy: "64", r: "56", stroke: "#e5e7eb", strokeWidth: "8", fill: "none" }), _jsx("circle", { cx: "64", cy: "64", r: "56", stroke: scene.accuracy.overall >= 80 ? '#10b981' : scene.accuracy.overall >= 60 ? '#f59e0b' : '#ef4444', strokeWidth: "8", fill: "none", strokeDasharray: `${(scene.accuracy.overall / 100) * 351.86} 351.86`, strokeLinecap: "round" })] }), _jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center", children: [_jsxs("span", { className: "text-3xl font-bold text-gray-900", children: [scene.accuracy.overall, "%"] }), _jsx("span", { className: "text-sm text-gray-600", children: "Accurate" })] })] }) }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-4", children: [accuracyMetrics.map(metric => ()
                                    < div, key = { metric, : .label }, className = {} `p-3 rounded-lg ${getAccuracyColor(metric.value)}`), ">}", _jsxs("div", { className: "flex items-center gap-2 mb-2", children: [metric.icon, _jsx("span", { className: "text-sm font-medium", children: metric.label })] }), _jsxs("div", { className: "text-lg font-bold", children: [metric.value, "%"] })] }), "))}"] })] }) });
    { /* Accuracy Violations */ }
    {
        scene.accuracy.violations.length > 0 && ()
            < Card >
            (_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(AlertTriangle, { className: "w-5 h-5 text-orange-600" }), "Accuracy Violations (", scene.accuracy.violations.length, ")"] }) })
                ,
                    _jsxs(CardContent, { children: [_jsx("div", { className: "space-y-3", children: scene.accuracy.violations.map((violation, index) => ()
                                    < div, key = { index }, className = "border rounded-lg p-4" >
                                    (_jsx("div", { className: "flex items-start justify-between mb-2", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { className: getSeverityColor(violation.severity), children: violation.severity.toUpperCase() }), _jsx(Badge, { variant: "outline", children: violation.type.toUpperCase() })] }) })
                                        ,
                                            _jsx("p", { className: "text-sm font-medium text-gray-900 mb-1", children: violation.element })
                                                ,
                                                    _jsx("p", { className: "text-sm text-gray-600 mb-2", children: violation.description })
                                                        ,
                                                            _jsxs("div", { className: "text-xs text-blue-600 bg-blue-50 p-2 rounded", children: ["\uD83D\uDCA1 Suggestion: ", violation.suggestion] }))) }), "))}"] }));
    }
};
CardContent >
;
Card >
;
div >
;
;
;
// Material Properties Visualization
const MaterialPropertiesVisualizer = ({ assets }) => {
    return;
    _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Brush, { className: "w-5 h-5 text-purple-600" }), "Material Properties Analysis"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: [assets.map(asset => ()
                            < div, key = { asset, : .id }, className = "border rounded-lg p-4" >
                            (_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx("h4", { className: "font-medium text-gray-900", children: asset.name }), _jsxs(Badge, { variant: asset.accuracy > 80 ? 'default' : 'secondary', children: [asset.accuracy, "%"] })] })
                                ,
                                    _jsx("div", { className: "space-y-2", children: asset.materials.map((material, idx) => ()
                                            < div, key = { idx }, className = "flex items-center justify-between text-sm" >
                                            (_jsx("span", { className: "text-gray-600", children: material.name })
                                                ,
                                                    _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-16 h-2 bg-gray-200 rounded-full overflow-hidden", children: _jsx("div", { className: `h-full rounded-full ${material.historicallyAccurate ? 'bg-green-500' : 'bg-orange-500'}`, style: { width: `${material.value * 100}%` } }) }), _jsxs("span", { className: "text-xs text-gray-500", children: [Math.round(material.value * 100), "%"] })] }))) }))), ")}"] }) }), "))}"] });
};
CardContent >
;
Card >
;
;
;
// Real-time Performance Metrics Visualization
const PerformanceMetricsVisualizer = ({ scene }) => {
    const [metrics, _____setMetrics] = useState({});
    renderTime: Math.random() * 120 + 80, // 80-200ms,
        memoryUsage;
    Math.random() * 40 + 20, // 20-60%,
        polyCount;
    scene.assets.length * 125000,
        textureMemory;
    scene.assets.length * 25, // MB,
        frameRate;
    24 + Math.random() * 16, // 24-40 FPS,
        loadingProgress;
    100,
    ;
};
return;
_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(TrendingUp, { className: "w-5 h-5 text-green-600" }), "Real-Time Performance"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "p-3 rounded-lg bg-blue-50 border border-blue-200", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx(Clock, { className: "w-4 h-4 text-blue-600" }), _jsx("span", { className: "text-sm font-medium text-blue-900", children: "Render Time" })] }), _jsxs("div", { className: "text-lg font-bold text-blue-900", children: [metrics.renderTime.toFixed(1), "ms"] }), _jsx("div", { className: "w-full bg-blue-200 rounded-full h-2 mt-2", children: _jsx("div", { className: "bg-blue-600 h-2 rounded-full transition-all duration-500", style: { width: `${Math.min((metrics.renderTime / 200) * 100, 100)}%` } }) })] }), _jsxs("div", { className: "p-3 rounded-lg bg-orange-50 border border-orange-200", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx(Layers, { className: "w-4 h-4 text-orange-600" }), _jsx("span", { className: "text-sm font-medium text-orange-900", children: "Memory" })] }), _jsxs("div", { className: "text-lg font-bold text-orange-900", children: [metrics.memoryUsage.toFixed(1), "%"] }), _jsx("div", { className: "w-full bg-orange-200 rounded-full h-2 mt-2", children: _jsx("div", { className: `h-2 rounded-full transition-all duration-500 ${metrics.memoryUsage > 80 ? 'bg-red-600' : ,
                                        metrics.memoryUsage > 60 ? 'bg-orange-600' : 'bg-green-600',
                                    }`, style: { width: `${metrics.memoryUsage}%` } }) })] }), _jsxs("div", { className: "p-3 rounded-lg bg-purple-50 border border-purple-200", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx(Eye, { className: "w-4 h-4 text-purple-600" }), _jsx("span", { className: "text-sm font-medium text-purple-900", children: "Polygons" })] }), _jsxs("div", { className: "text-lg font-bold text-purple-900", children: [(metrics.polyCount / 1000000).toFixed(1), "M"] }), _jsxs("div", { className: "text-xs text-purple-700 mt-1", children: [scene.assets.length, " assets"] })] }), _jsxs("div", { className: "p-3 rounded-lg bg-green-50 border border-green-200", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx(Zap, { className: "w-4 h-4 text-green-600" }), _jsx("span", { className: "text-sm font-medium text-green-900", children: "Frame Rate" })] }), _jsxs("div", { className: "text-lg font-bold text-green-900", children: [metrics.frameRate.toFixed(1), " FPS"] }), _jsx("div", { className: `text-xs mt-1 ${metrics.frameRate >= 30 ? 'text-green-700' : ,
                                    metrics.frameRate >= 24 ? 'text-yellow-700' : 'text-red-700',
                                }`, children: metrics.frameRate >= 30 ? 'Excellent' :
                                    metrics.frameRate >= 24 ? 'Good' : 'Poor' })] }), _jsxs("div", { className: "p-3 rounded-lg bg-indigo-50 border border-indigo-200", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx(Palette, { className: "w-4 h-4 text-indigo-600" }), _jsx("span", { className: "text-sm font-medium text-indigo-900", children: "Textures" })] }), _jsxs("div", { className: "text-lg font-bold text-indigo-900", children: [metrics.textureMemory, "MB"] }), _jsxs("div", { className: "text-xs text-indigo-700 mt-1", children: [scene.assets.reduce((sum, asset) => sum + asset.materials.length, 0), " materials"] })] }), _jsxs("div", { className: "p-3 rounded-lg bg-cyan-50 border border-cyan-200", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx(Settings, { className: "w-4 h-4 text-cyan-600" }), _jsx("span", { className: "text-sm font-medium text-cyan-900", children: "Status" })] }), _jsxs("div", { className: "text-lg font-bold text-cyan-900", children: [metrics.loadingProgress, "%"] }), _jsx("div", { className: "text-xs text-cyan-700 mt-1", children: metrics.loadingProgress === 100 ? 'Ready' : 'Loading...' })] })] }) })] });
;
;
// Character Crowd Visualization
const CrowdVisualization = ({ characters }) => {
    const crowdStats = useMemo(() => {
        const typeDistribution = characters.reduce((acc, char) => {
            acc[char.type] = (acc[char.type] || 0) + 1;
            return acc;
        }, {});
        const avgAccuracy = characters.reduce((sum, char) => sum + char.accuracy, 0) / characters.length;
        return {
            total: characters.length,
            types: typeDistribution,
            avgAccuracy,
            cultures: [...new Set(characters.map(c => c.culture))],
            periods: [...new Set(characters.map(c => c.period))],
        };
    }, [characters]);
    return;
    _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Users, { className: "w-5 h-5 text-purple-600" }), "Crowd Analysis: ", crowdStats.total, " Characters"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("h4", { className: "text-sm font-semibold text-gray-900 mb-3", children: "Character Types" }), _jsxs("div", { className: "space-y-2", children: [Object.entries(crowdStats.types).map(([type, count]) => {
                                            const percentage = (count / crowdStats.total) * 100;
                                            const color = type === 'hero' ? 'bg-blue-500' : ;
                                            type === 'crowd' ? 'bg-purple-500' : 'bg-gray-500';
                                            return;
                                            _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-16 text-sm text-gray-600 capitalize", children: type }), _jsx("div", { className: "flex-1 bg-gray-200 rounded-full h-2", children: _jsx("div", { className: `h-2 rounded-full ${color} transition-all duration-500`, style: { width: `${percentage}%` } }) }), _jsx("div", { className: "w-12 text-sm font-medium text-gray-900", children: count })] }, type);
                                        }), "; })}"] })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-sm font-semibold text-gray-900 mb-3", children: "Cultural Diversity" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "bg-green-50 p-3 rounded-lg border border-green-200", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx(Globe, { className: "w-4 h-4 text-green-600" }), _jsx("span", { className: "text-sm font-medium text-green-900", children: "Average Accuracy" })] }), _jsxs("div", { className: "text-xl font-bold text-green-900", children: [crowdStats.avgAccuracy.toFixed(1), "%"] })] }), _jsxs("div", { className: "bg-blue-50 p-3 rounded-lg border border-blue-200", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx(Map, { className: "w-4 h-4 text-blue-600" }), _jsx("span", { className: "text-sm font-medium text-blue-900", children: "Cultures" })] }), _jsx("div", { className: "flex flex-wrap gap-1 mt-2", children: crowdStats.cultures.map(culture => ()
                                                        < Badge, key = { culture }, variant = "secondary", className = "text-xs" >
                                                        { culture }) }), "))}"] })] }), _jsxs("div", { className: "bg-orange-50 p-3 rounded-lg border border-orange-200", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx(Clock, { className: "w-4 h-4 text-orange-600" }), _jsx("span", { className: "text-sm font-medium text-orange-900", children: "Time Periods" })] }), _jsx("div", { className: "flex flex-wrap gap-1 mt-2", children: crowdStats.periods.map(period => ()
                                                < Badge, key = { period }, variant = "outline", className = "text-xs" >
                                                { period }) }), "))}"] })] })] }) })] });
};
CardContent >
;
Card >
;
;
;
// Timeline Visualization for VFX workflow
const TimelineVisualization = ({ scenes }) => {
    const timelineItems = scenes.map((scene, index) => ({}), id, scene.id, name, scene.name, period, scene.historicalPeriod, accuracy, scene.accuracy.overall, status, scene.accuracy.expertValidated ? 'completed' : 'in-progress', position, index);
};
return;
_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Clock, { className: "w-5 h-5 text-indigo-600" }), "VFX Production Timeline"] }), _jsxs("div", { className: "flex items-center gap-4 mt-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: () => setIsPlaying(!isPlaying), children: isPlaying ? _jsx(Pause, { className: "w-4 h-4" }) : _jsx(Play, { className: "w-4 h-4" }) }), _jsx(Button, { variant: "outline", size: "sm", children: _jsx(Rewind, { className: "w-4 h-4" }) }), _jsx(Button, { variant: "outline", size: "sm", children: _jsx(SkipForward, { className: "w-4 h-4" }) })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Speed:" }), _jsx(Slider, { value: [animationSpeed], onValueChange: (value) => setAnimationSpeed(value[0]), max: 5, min: 0.5, step: 0.5, className: "w-20" })] })] })] }), _jsx(CardContent, { children: _jsxs("div", { className: "relative", children: [_jsx("div", { className: "relative h-2 bg-gray-200 rounded-full mb-8", children: _jsx("div", { className: "absolute h-full bg-blue-500 rounded-full transition-all duration-1000", style: { width: `${(timelineItems.length > 0 ? (selectedScene ? timelineItems.findIndex(t => t.id === selectedScene.id) + 1 : 1) / timelineItems.length : 0) * 100}%` } }) }), _jsxs("div", { className: "space-y-4", children: [timelineItems.map((item, index) => ()
                                < div, key = { item, : .id }, className = {} `flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-all ${selectedScene?.id === item.id ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 hover:bg-gray-100',
                            }`), "onClick=", () => {
                                const scene = scenes.find(s => s.id === item.id);
                                if (scene)
                                    setSelectedScene(scene);
                            }, ">", _jsx("div", { className: `w-4 h-4 rounded-full flex-shrink-0 ${item.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500',
                                }` }), _jsxs("div", { className: "flex-1", children: [_jsx("h4", { className: "font-medium text-gray-900", children: item.name }), _jsx("p", { className: "text-sm text-gray-600", children: item.period })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "text-lg font-bold text-gray-900", children: [item.accuracy, "%"] }), _jsx(Badge, { variant: item.status === 'completed' ? 'default' : 'secondary', children: item.status === 'completed' ? 'Complete' : 'In Progress' })] })] }), "))}"] }) })] });
Card >
;
;
;
// Asset Relationship Graph Visualization
const AssetRelationshipGraph = ({ assets }) => {
    const [selectedAsset, setSelectedAsset] = useState(null);
    const assetCategories = useMemo(() => {
        return assets.reduce((acc, asset) => {
            if (!acc[asset.type])
                acc[asset.type] = [];
            acc[asset.type].push(asset);
            return acc;
        }, {});
    }, [assets]);
    const getCategoryColor = (type) => {
        const colors = {
            building: '#3b82f6',
            prop: '#10b981',
            terrain: '#f59e0b',
            vegetation: '#22c55e',
            texture: '#8b5cf6',
        };
        return colors[type] || '#6b7280';
    };
    return;
    _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Layers, { className: "w-5 h-5 text-indigo-600" }), "Asset Relationship Network"] }), _jsxs("div", { className: "text-sm text-gray-600", children: [Object.keys(assetCategories).length, " categories, ", assets.length, " total assets"] })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-2 md:grid-cols-5 gap-3", children: [Object.entries(assetCategories).map(([type, typeAssets]) => ()
                                        < div, key = { type }, className = "p-3 rounded-lg border-2 border-gray-200 hover:border-gray-300 cursor-pointer transition-colors", onClick = {}()), " => setSelectedAsset(selectedAsset === type ? null : type)} style=", {
                                        borderColor: selectedAsset === type ? getCategoryColor(type) : undefined,
                                        backgroundColor: selectedAsset === type ? `${getCategoryColor(type)}10` : undefined
                                    }, "} >", _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center text-white text-sm font-bold", style: { backgroundColor: getCategoryColor(type) }, children: typeAssets.length }), _jsx("div", { className: "text-xs font-medium text-gray-900 capitalize", children: type }), _jsxs("div", { className: "text-xs text-gray-600", children: ["Avg: ", (typeAssets.reduce((sum, a) => sum + a.accuracy, 0) / typeAssets.length).toFixed(0), "%"] })] })] }), "))}"] }), selectedAsset && assetCategories[selectedAsset] && ()
                        < div, " className=\"border-t pt-4\">", _jsxs("h4", { className: "text-sm font-semibold text-gray-900 mb-3 capitalize", children: [selectedAsset, " Assets (", assetCategories[selectedAsset].length, ")"] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3", children: [assetCategories[selectedAsset].map(asset => ()
                                < div, key = { asset, : .id }, className = "p-3 bg-gray-50 rounded-lg border" >
                                (_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("h5", { className: "text-sm font-medium text-gray-900", children: asset.name }), _jsxs(Badge, { variant: asset.accuracy > 90 ? 'default' : asset.accuracy > 70 ? 'secondary' : 'outline', className: "text-xs", children: [asset.accuracy, "%"] })] })
                                    ,
                                        _jsxs("div", { className: "text-xs text-gray-600 space-y-1", children: [_jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Period:" }), " ", asset.period] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Region:" }), " ", asset.region] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "LOD:" }), " Level ", asset.lod] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Materials:" }), " ", asset.materials.length] })] })), { /* Material preview */}
                                < div, className = "mt-2 flex gap-1" >
                                { asset, : .materials.slice(0, 3).map((material, idx) => ()
                                        < div, key = { idx }, className = {} `w-3 h-3 rounded-full border ${material.historicallyAccurate ? 'bg-green-500' : 'bg-orange-500',
                                    }`) }, title = {} `${material.name}: ${material.historicallyAccurate ? 'Accurate' : 'Review needed'}`), "/> ))}", asset.materials.length > 3 && ()
                                < div, " className=\"text-xs text-gray-500 ml-1\">+", asset.materials.length - 3] }), ")}"] })] });
};
div >
;
div >
;
{ /* Global Asset Statistics */ }
_jsxs("div", { className: "bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200", children: [_jsx("h4", { className: "text-sm font-semibold text-blue-900 mb-3", children: "Asset Quality Overview" }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-lg font-bold text-blue-900", children: assets.filter(a => a.accuracy >= 90).length }), _jsx("div", { className: "text-xs text-blue-700", children: "High Quality (90%+)" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-lg font-bold text-blue-900", children: assets.filter(a => a.accuracy >= 70 && a.accuracy < 90).length }), _jsx("div", { className: "text-xs text-blue-700", children: "Good Quality (70-89%)" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-lg font-bold text-blue-900", children: assets.filter(a => a.accuracy < 70).length }), _jsx("div", { className: "text-xs text-blue-700", children: "Needs Review (<70%)" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-lg font-bold text-blue-900", children: assets.reduce((sum, a) => sum + a.materials.length, 0) }), _jsx("div", { className: "text-xs text-blue-700", children: "Total Materials" })] })] })] });
div >
;
CardContent >
;
Card >
;
;
;
if (!selectedScene) {
    return;
    _jsxs("div", { className: `vfx-pipeline-visualizer ${className}`, children: ["}", _jsx(Card, { children: _jsxs(CardContent, { className: "flex flex-col items-center justify-center py-12", children: [_jsx(Film, { className: "w-16 h-16 text-gray-400 mb-4" }), _jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "No Scene Selected" }), _jsx("p", { className: "text-gray-600 text-center", children: "Select a VFX scene to begin visualization and analysis" })] }) })] });
    ;
    return;
    _jsxs("div", { className: `vfx-pipeline-visualizer ${className}`, children: ["}", _jsxs(Tabs, { value: activeView, onValueChange: setActiveView, children: [_jsx("div", { className: "mb-6", children: _jsxs(TabsList, { className: "grid w-full grid-cols-4", children: [_jsxs(TabsTrigger, { value: "scene", className: "flex items-center gap-2", children: [_jsx(Camera, { className: "w-4 h-4" }), "Scene"] }), _jsxs(TabsTrigger, { value: "accuracy", className: "flex items-center gap-2", children: [_jsx(CheckCircle, { className: "w-4 h-4" }), "Accuracy"] }), _jsxs(TabsTrigger, { value: "assets", className: "flex items-center gap-2", children: [_jsx(Layers, { className: "w-4 h-4" }), "Assets"] }), _jsxs(TabsTrigger, { value: "timeline", className: "flex items-center gap-2", children: [_jsx(Clock, { className: "w-4 h-4" }), "Timeline"] })] }) }), _jsxs(TabsContent, { value: "scene", className: "space-y-6", children: [_jsx(SceneVisualization3D, { scene: selectedScene }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsx(PerformanceMetricsVisualizer, { scene: selectedScene }), _jsx(CrowdVisualization, { characters: selectedScene.characters })] })] }), _jsx(TabsContent, { value: "accuracy", className: "space-y-6", children: _jsx(HistoricalAccuracyDashboard, { scene: selectedScene }) }), _jsxs(TabsContent, { value: "assets", className: "space-y-6", children: [_jsx(MaterialPropertiesVisualizer, { assets: selectedScene.assets }), _jsx(AssetRelationshipGraph, { assets: selectedScene.assets })] }), _jsx(TabsContent, { value: "timeline", className: "space-y-6", children: _jsx(TimelineVisualization, { scenes: scenes }) })] }), _jsx("style", { children: `
        .vfx-pipeline-visualizer {
          max-width: 1200px;,
  margin: 0 auto;
        .scene-visualization {
          position: relative;,
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;,
  overflow: hidden;
        .accuracy-indicator {
          animation: pulse-accuracy 2s ease-in-out infinite;
        @keyframes pulse-accuracy {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        .timeline-item {
          transition: all 0.3s ease;
        .timeline-item:hover {,
  transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        @media (max-width: 768px) {
          .vfx-pipeline-visualizer {
            padding: 1rem;
      ` })] });
    ;
}
;
export default VFXPipelineVisualizer;
