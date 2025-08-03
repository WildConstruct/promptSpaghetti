import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * VFX Visualization Demo - E17-1753114397343-6622FD
 *
 * Comprehensive demo component showcasing Wild Construct VFX Pipeline Visualizer
 * with realistic sample data and interactive features for director workflow.
 */
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Switch } from '../ui/Switch';
import { VFXPipelineVisualizer } from './VFXPipelineVisualizer';
import { sampleScenes } from generateRandomScene;
from;
'./VFXSceneSamples';
import { Play, Pause, RotateCcw, Settings, Eye, Layers, Activity, Zap, Globe, Clock, Film, Palette, Users } from Camera;
from;
'lucide-react';
export const VFXVisualizationDemo = ({
    className = '',
    title = 'Wild Construct VFX Pipeline Demo',
    showControlPanel = true });
autoRotateScenes = false;
{
    const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
    const [scenes, setScenes] = useState(sampleScenes);
    const [isAutoRotating, setIsAutoRotating] = useState(autoRotateScenes);
    const [showDebugInfo, setShowDebugInfo] = useState(false);
    const [realTimeUpdate, setRealTimeUpdate] = useState(true);
    const [selectedVisualizationMode, setSelectedVisualizationMode] = useState('full');
    // Auto-rotation effect
    useEffect(() => {
        if (!isAutoRotating)
            return;
        const interval = setInterval(() => {
            setCurrentSceneIndex((prevIndex) => prevIndex >= scenes.length - 1 ? 0 : prevIndex + 1);
        }, 8000); // Rotate every 8 seconds
        return () => clearInterval(interval);
    }, [isAutoRotating, scenes.length]);
    const currentScene = scenes[currentSceneIndex];
    const handleSceneChange = (sceneId) => {
        const index = scenes.findIndex(scene => scene.id === sceneId);
        if (index !== -1) {
            setCurrentSceneIndex(index);
        }
        ;
        const addRandomScene = () => {
            const periods = [
                'Ancient Egypt (3100-332 BCE)',
                'Classical Greece (5th-4th century BCE)',
                'Byzantine Empire (330-1453 CE)',
                'Renaissance Italy (14th-16th century)'
            ];
        };
        'Edo Japan (1603-1868)';
    };
    ;
    const randomPeriod = periods[Math.floor(Math.random() * periods.length)];
    const newScene = generateRandomScene();
    ;
    `generated-${Date.now()}`;
}
`Generated ${randomPeriod.split(' ')[0]} Scene`;
randomPeriod;
;
setScenes(prev => [...prev, newScene]);
;
const resetToDefaults = () => {
    setScenes(sampleScenes);
    setCurrentSceneIndex(0);
    setIsAutoRotating(false);
    setShowDebugInfo(false);
    setRealTimeUpdate(true);
};
return;
_jsxs("div", { className: `vfx-visualization-demo ${className}`, children: ["}", _jsxs(Card, { className: "mb-6", children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Film, { className: "w-6 h-6 text-blue-600" }), _jsx("span", { children: title }), _jsx(Badge, { variant: "secondary", className: "text-xs", children: "Wild Construct v1.0" })] }), showControlPanel && ()
                                    < div, " className=\"flex items-center gap-2\">", _jsxs(Button, { variant: "outline", size: "sm", onClick: () => setIsAutoRotating(!isAutoRotating), className: "flex items-center gap-2", children: [isAutoRotating ? _jsx(Pause, { className: "w-4 h-4" }) : _jsx(Play, { className: "w-4 h-4" }), isAutoRotating ? 'Pause' : 'Auto-Rotate'] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: addRandomScene, className: "flex items-center gap-2", children: [_jsx(Zap, { className: "w-4 h-4" }), "Generate Scene"] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: resetToDefaults, className: "flex items-center gap-2", children: [_jsx(RotateCcw, { className: "w-4 h-4" }), "Reset"] })] }), ")}"] }), _jsxs("div", { className: "flex items-center justify-between mt-4", children: [_jsx("div", { className: "flex items-center gap-4", children: _jsxs(Select, { value: currentScene.id, onValueChange: handleSceneChange, children: [_jsx(SelectTrigger, { className: "w-64", children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: scenes.map(scene => ()
                                            < SelectItem, key = { scene, : .id }, value = { scene, : .id } >
                                            { scene, : .name }) }), "))}"] }) }), _jsxs(Select, { value: selectedVisualizationMode, onValueChange: (value) => setSelectedVisualizationMode(value), children: [_jsx(SelectTrigger, { className: "w-32", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "full", children: "Full View" }), _jsx(SelectItem, { value: "compact", children: "Compact" }), _jsx(SelectItem, { value: "analysis", children: "Analysis" })] })] })] }), _jsxs("div", { className: "flex items-center gap-6", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Switch, { id: "realtime-updates", checked: realTimeUpdate, onCheckedChange: setRealTimeUpdate }), _jsx("label", { htmlFor: "realtime-updates", className: "text-sm text-gray-600", children: "Real-time Updates" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Switch, { id: "debug-info", checked: showDebugInfo, onCheckedChange: setShowDebugInfo }), _jsx("label", { htmlFor: "debug-info", className: "text-sm text-gray-600", children: "Debug Info" })] })] })] })] });
CardHeader >
    _jsxs(CardContent, { children: [_jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6", children: [_jsxs("div", { className: "bg-blue-50 p-3 rounded-lg border border-blue-200 text-center", children: [_jsx(Camera, { className: "w-5 h-5 text-blue-600 mx-auto mb-1" }), _jsx("div", { className: "text-lg font-bold text-blue-900", children: scenes.length }), _jsx("div", { className: "text-xs text-blue-700", children: "Scenes" })] }), _jsxs("div", { className: "bg-purple-50 p-3 rounded-lg border border-purple-200 text-center", children: [_jsx(Users, { className: "w-5 h-5 text-purple-600 mx-auto mb-1" }), _jsx("div", { className: "text-lg font-bold text-purple-900", children: currentScene.characters.length }), _jsx("div", { className: "text-xs text-purple-700", children: "Characters" })] }), _jsxs("div", { className: "bg-green-50 p-3 rounded-lg border border-green-200 text-center", children: [_jsx(Layers, { className: "w-5 h-5 text-green-600 mx-auto mb-1" }), _jsx("div", { className: "text-lg font-bold text-green-900", children: currentScene.assets.length }), _jsx("div", { className: "text-xs text-green-700", children: "Assets" })] }), _jsxs("div", { className: "bg-orange-50 p-3 rounded-lg border border-orange-200 text-center", children: [_jsx(Palette, { className: "w-5 h-5 text-orange-600 mx-auto mb-1" }), _jsx("div", { className: "text-lg font-bold text-orange-900", children: currentScene.assets.reduce((sum, asset) => sum + asset.materials.length, 0) }), _jsx("div", { className: "text-xs text-orange-700", children: "Materials" })] }), _jsxs("div", { className: "bg-indigo-50 p-3 rounded-lg border border-indigo-200 text-center", children: [_jsx(Eye, { className: "w-5 h-5 text-indigo-600 mx-auto mb-1" }), _jsxs("div", { className: "text-lg font-bold text-indigo-900", children: [currentScene.accuracy.overall, "%"] }), _jsx("div", { className: "text-xs text-indigo-700", children: "Accuracy" })] }), _jsxs("div", { className: "bg-cyan-50 p-3 rounded-lg border border-cyan-200 text-center", children: [_jsx(Globe, { className: "w-5 h-5 text-cyan-600 mx-auto mb-1" }), _jsx("div", { className: "text-lg font-bold text-cyan-900", children: currentScene.region }), _jsx("div", { className: "text-xs text-cyan-700", children: "Region" })] }), _jsxs("div", { className: "bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-center", children: [_jsx(Clock, { className: "w-5 h-5 text-yellow-600 mx-auto mb-1" }), _jsx("div", { className: "text-lg font-bold text-yellow-900", children: currentScene.timeOfDay }), _jsx("div", { className: "text-xs text-yellow-700", children: "Time" })] })] }), _jsxs("div", { className: "mb-4 flex items-center gap-2", children: [_jsx(Badge, { variant: "default", className: "text-sm px-3 py-1", children: currentScene.historicalPeriod }), _jsx(Badge, { variant: currentScene.accuracy.expertValidated ? 'default' : 'secondary', className: "text-sm", children: currentScene.accuracy.expertValidated ? 'Expert Validated' : 'Pending Review' }), currentScene.accuracy.violations.length > 0 && ()
                        < Badge, " variant=\"destructive\" className=\"text-sm\">", currentScene.accuracy.violations.length, " Issues"] }), ")}"] });
CardContent >
;
Card >
    { /* Debug Information Panel */};
{
    showDebugInfo && ()
        < Card;
    className = "mb-6" >
        (_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Settings, { className: "w-5 h-5 text-gray-600" }), "Debug Information"] }) })
            ,
                _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: [_jsxs("div", { className: "bg-gray-50 p-3 rounded-lg", children: [_jsx("h4", { className: "font-semibold text-gray-900 mb-2", children: "Scene Composition" }), _jsxs("div", { className: "text-sm text-gray-600 space-y-1", children: [_jsxs("div", { children: ["Camera: [", currentScene.composition.cameraPosition.x, ", ", currentScene.composition.cameraPosition.y, ", ", currentScene.composition.cameraPosition.z, "]"] }), _jsxs("div", { children: ["Focal Length: ", currentScene.composition.focalLength, "mm"] }), _jsxs("div", { children: ["Depth: ", currentScene.composition.depth, "m"] }), _jsxs("div", { children: ["Layers: ", currentScene.composition.layers.length] })] })] }), _jsxs("div", { className: "bg-gray-50 p-3 rounded-lg", children: [_jsx("h4", { className: "font-semibold text-gray-900 mb-2", children: "Render Stats" }), _jsxs("div", { className: "text-sm text-gray-600 space-y-1", children: [_jsxs("div", { children: ["Est. Polygons: ", (currentScene.assets.length * 125000).toLocaleString()] }), _jsxs("div", { children: ["Texture Memory: ~", currentScene.assets.length * 25, "MB"] }), _jsxs("div", { children: ["Characters: ", currentScene.characters.length] }), _jsxs("div", { children: ["Hero Characters: ", currentScene.characters.filter(c => c.type === 'hero').length] })] })] }), _jsxs("div", { className: "bg-gray-50 p-3 rounded-lg", children: [_jsx("h4", { className: "font-semibold text-gray-900 mb-2", children: "Quality Metrics" }), _jsxs("div", { className: "text-sm text-gray-600 space-y-1", children: [_jsxs("div", { children: ["Architecture: ", currentScene.accuracy.architecture, "%"] }), _jsxs("div", { children: ["Clothing: ", currentScene.accuracy.clothing, "%"] }), _jsxs("div", { children: ["Technology: ", currentScene.accuracy.technology, "%"] }), _jsxs("div", { children: ["Culture: ", currentScene.accuracy.culture, "%"] })] })] })] }) }));
    Card >
    ;
}
{ /* Main VFX Pipeline Visualizer */ }
_jsxs("div", { className: selectedVisualizationMode === 'compact' ? 'max-w-4xl' : '', children: [_jsx(VFXPipelineVisualizer, { scene: currentScene, scenes: scenes, realTimeUpdate: realTimeUpdate, showControls: selectedVisualizationMode !== 'compact', onSceneUpdate: (updatedScene) => {
                const updatedScenes = scenes.map(scene => );
            } }), "); scene.id === updatedScene.id ? updatedScene : scene); setScenes(updatedScenes) }} className=", selectedVisualizationMode === 'compact' ? 'compact-mode' : '', "/>"] });
{ /* Auto-rotation Progress Indicator */ }
{
    isAutoRotating && ()
        < div;
    className = "fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-3" >
        _jsxs("div", { className: "flex items-center gap-2 text-sm text-gray-600", children: [_jsx(Activity, { className: "w-4 h-4 animate-pulse text-blue-600" }), "Auto-rotating scenes", _jsxs("div", { className: "flex gap-1", children: [scenes.map((_, index) => ()
                            < div, key = { index }, className = {} `w-2 h-2 rounded-full transition-colors ${index === currentSceneIndex ? 'bg-blue-600' : 'bg-gray-300'}
`), "/> ))}"] })] });
    div >
    ;
}
_jsx("style", { children: `
        .vfx-visualization-demo {
          max-width: 1400px;
  margin: 0 auto;
          padding: 1rem;
        .compact-mode {
          transform: scale(0.85);
          transform-origin: top left;
        @media (max-width: 768px) {
          .vfx-visualization-demo {
            padding: 0.5rem;
          .compact-mode {
            transform: scale(0.9);
        .auto-rotate-indicator {
          animation: pulse 2s ease-in-out infinite;
        @keyframes pulse {
          0%, 100% { opacity: 1 }
          50% { opacity: 0.5 }
      ` });
div >
;
;
;
export default VFXVisualizationDemo;
