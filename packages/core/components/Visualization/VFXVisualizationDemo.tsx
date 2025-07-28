/**
 * VFX Visualization Demo - E17-1753114397343-6622FD
 * 
 * Comprehensive demo component showcasing Wild Construct VFX Pipeline Visualizer
 * with realistic sample data and interactive features for director workflow.
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Switch } from '../ui/Switch';
import { VFXPipelineVisualizer } from './VFXPipelineVisualizer';
import { 
  medievalCourtyard, 
  vikingVillage, 
  romanForum, 
  sampleScenes, 
  generateRandomScene 
} from './VFXSceneSamples';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  Eye, 
  Layers, 
  Activity,
  Zap,
  Globe,
  Clock,
  Film,
  Palette,
  Users,
  Camera
} from 'lucide-react';

export interface VFXVisualizationDemoProps {
  className?: string;
  title?: string;
  showControlPanel?: boolean;
  autoRotateScenes?: boolean;
}

export const VFXVisualizationDemo: React.FC<VFXVisualizationDemoProps> = ({)
  className = '',
  title = 'Wild Construct VFX Pipeline Demo',
  showControlPanel = true,
  autoRotateScenes = false
}) => {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [scenes, setScenes] = useState(sampleScenes);
  const [isAutoRotating, setIsAutoRotating] = useState(autoRotateScenes);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [realTimeUpdate, setRealTimeUpdate] = useState(true);
  const [selectedVisualizationMode, setSelectedVisualizationMode] = useState<'full' | 'compact' | 'analysis'>('full');
  // Auto-rotation effect
  useEffect(() => {
    if (!isAutoRotating) return;
    const interval = setInterval(() => {
      setCurrentSceneIndex((prevIndex) => 
        prevIndex >= scenes.length - 1 ? 0 : prevIndex + 1
      );
    }, 8000); // Rotate every 8 seconds
    return () => clearInterval(interval);
  }, [isAutoRotating, scenes.length]);
  const currentScene = scenes[currentSceneIndex];
  const handleSceneChange = (sceneId: string) => {
    const index = scenes.findIndex(scene => scene.id === sceneId);
    if (index !== -1) {
      setCurrentSceneIndex(index);
    }
  };
  const addRandomScene = () => {
    const periods = [;
      'Ancient Egypt (3100-332 BCE)',
      'Classical Greece (5th-4th century BCE)', 
      'Byzantine Empire (330-1453 CE)',
      'Renaissance Italy (14th-16th century)',
      'Edo Japan (1603-1868)'
    ];
    const randomPeriod = periods[Math.floor(Math.random() * periods.length)];
    const newScene = generateRandomScene(;)
      `generated-${Date.now()}`,}
      `Generated ${randomPeriod.split(' ')[0]} Scene`,}
      randomPeriod
    );
    setScenes(prev => [...prev, newScene]);
  };
  const resetToDefaults = () => {
    setScenes(sampleScenes);
    setCurrentSceneIndex(0);
    setIsAutoRotating(false);
    setShowDebugInfo(false);
    setRealTimeUpdate(true);
  };
  return ()
    <div className={`vfx-visualization-demo ${className}`}>}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Film className="w-6 h-6 text-blue-600" />
              <span>{title}</span>
              <Badge variant="secondary" className="text-xs">
                Wild Construct v1.0
              </Badge>
            </div>
            {showControlPanel && ()
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAutoRotating(!isAutoRotating)}
                  className="flex items-center gap-2"
                >
                  {isAutoRotating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isAutoRotating ? 'Pause' : 'Auto-Rotate'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addRandomScene}
                  className="flex items-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Generate Scene
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetToDefaults}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </Button>
              </div>
            )}
          </CardTitle>
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-4">
              <Select 
                value={currentScene.id} 
                onValueChange={handleSceneChange}
              >
                <SelectTrigger className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {scenes.map(scene => ()
                    <SelectItem key={scene.id} value={scene.id}>
                      {scene.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select 
                value={selectedVisualizationMode} 
                onValueChange={(value) => setSelectedVisualizationMode(value as any)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full View</SelectItem>
                  <SelectItem value="compact">Compact</SelectItem>
                  <SelectItem value="analysis">Analysis</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch 
                  id="realtime-updates" 
                  checked={realTimeUpdate}
                  onCheckedChange={setRealTimeUpdate}
                />
                <label htmlFor="realtime-updates" className="text-sm text-gray-600">
                  Real-time Updates
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Switch 
                  id="debug-info" 
                  checked={showDebugInfo}
                  onCheckedChange={setShowDebugInfo}
                />
                <label htmlFor="debug-info" className="text-sm text-gray-600">
                  Debug Info
                </label>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Scene Overview Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 text-center">
              <Camera className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-blue-900">{scenes.length}</div>
              <div className="text-xs text-blue-700">Scenes</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200 text-center">
              <Users className="w-5 h-5 text-purple-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-purple-900">{currentScene.characters.length}</div>
              <div className="text-xs text-purple-700">Characters</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg border border-green-200 text-center">
              <Layers className="w-5 h-5 text-green-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-green-900">{currentScene.assets.length}</div>
              <div className="text-xs text-green-700">Assets</div>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg border border-orange-200 text-center">
              <Palette className="w-5 h-5 text-orange-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-orange-900">
                {currentScene.assets.reduce((sum, asset) => sum + asset.materials.length, 0)}
              </div>
              <div className="text-xs text-orange-700">Materials</div>
            </div>
            <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200 text-center">
              <Eye className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-indigo-900">{currentScene.accuracy.overall}%</div>
              <div className="text-xs text-indigo-700">Accuracy</div>
            </div>
            <div className="bg-cyan-50 p-3 rounded-lg border border-cyan-200 text-center">
              <Globe className="w-5 h-5 text-cyan-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-cyan-900">{currentScene.region}</div>
              <div className="text-xs text-cyan-700">Region</div>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-center">
              <Clock className="w-5 h-5 text-yellow-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-yellow-900">{currentScene.timeOfDay}</div>
              <div className="text-xs text-yellow-700">Time</div>
            </div>
          </div>
          {/* Historical Period Badge */}
          <div className="mb-4 flex items-center gap-2">
            <Badge variant="default" className="text-sm px-3 py-1">
              {currentScene.historicalPeriod}
            </Badge>
            <Badge variant={currentScene.accuracy.expertValidated ? 'default' : 'secondary'} className="text-sm">
              {currentScene.accuracy.expertValidated ? 'Expert Validated' : 'Pending Review'}
            </Badge>
            {currentScene.accuracy.violations.length > 0 && ()
              <Badge variant="destructive" className="text-sm">
                {currentScene.accuracy.violations.length} Issues
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
      {/* Debug Information Panel */}
      {showDebugInfo && ()
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-600" />
              Debug Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Scene Composition</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Camera: [{currentScene.composition.cameraPosition.x}, {currentScene.composition.cameraPosition.y}, {currentScene.composition.cameraPosition.z}]</div>
                  <div>Focal Length: {currentScene.composition.focalLength}mm</div>
                  <div>Depth: {currentScene.composition.depth}m</div>
                  <div>Layers: {currentScene.composition.layers.length}</div>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Render Stats</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Est. Polygons: {(currentScene.assets.length * 125000).toLocaleString()}</div>
                  <div>Texture Memory: ~{currentScene.assets.length * 25}MB</div>
                  <div>Characters: {currentScene.characters.length}</div>
                  <div>Hero Characters: {currentScene.characters.filter(c => c.type === 'hero').length}</div>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Quality Metrics</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Architecture: {currentScene.accuracy.architecture}%</div>
                  <div>Clothing: {currentScene.accuracy.clothing}%</div>
                  <div>Technology: {currentScene.accuracy.technology}%</div>
                  <div>Culture: {currentScene.accuracy.culture}%</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Main VFX Pipeline Visualizer */}
      <div className={selectedVisualizationMode === 'compact' ? 'max-w-4xl' : ''}>
        <VFXPipelineVisualizer
          scene={currentScene}
          scenes={scenes}
          realTimeUpdate={realTimeUpdate}
          showControls={selectedVisualizationMode !== 'compact'}
          onSceneUpdate={(updatedScene) => {
            const updatedScenes = scenes.map(scene => ;)
              scene.id === updatedScene.id ? updatedScene : scene
            );
            setScenes(updatedScenes);
          }}
          className={selectedVisualizationMode === 'compact' ? 'compact-mode' : ''}
        />
      </div>
      {/* Auto-rotation Progress Indicator */}
      {isAutoRotating && ()
        <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Activity className="w-4 h-4 animate-pulse text-blue-600" />
            Auto-rotating scenes
            <div className="flex gap-1">
              {scenes.map((_, index) => ()
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentSceneIndex ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
      <style>{`
        .vfx-visualization-demo {
          max-width: 1400px;
          margin: 0 auto;
          padding: 1rem;
        }
        .compact-mode {
          transform: scale(0.85);
          transform-origin: top left;
        }
        @media (max-width: 768px) {
          .vfx-visualization-demo {
            padding: 0.5rem;
          }
          .compact-mode {
            transform: scale(0.9);
          }
        }
        .auto-rotate-indicator {
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default VFXVisualizationDemo;