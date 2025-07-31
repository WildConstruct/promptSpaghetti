/**
 * VFX Pipeline Visualizer - E17-1753114397343-6622FD
 * 
 * Advanced visualization components for Wild Construct VFX pipeline workflows.
 * Provides real-time visualization of historical accuracy, scene composition,
 * asset relationships, and creative workflow metrics.
 */
import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Slider } from '../ui/Slider';
import { 
  Film, 
  Palette, 
  Clock, 
  Globe, 
  Layers, 
  Eye, 
  Settings, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Play,
  Pause,
  SkipForward,
  Rewind,
  Camera,
  Sun,
  Users,
  Map,
  Brush,
  Zap
} from 'lucide-react';

// VFX Pipeline Data Types

}
export interface VFXScene {
  id: string;
  name: string;
  historicalPeriod: string;
  region: string;
  timeOfDay: 'dawn' | 'morning' | 'noon' | 'afternoon' | 'evening' | 'night';
  weather: string;
  characters: VFXCharacter;
  assets: VFXAsset;
  composition: SceneComposition;
  accuracy: HistoricalAccuracyMetrics;
}
}
}
export interface VFXCharacter {
  id: string;
  name: string;
  type: 'crowd' | 'hero' | 'background';
  period: string;
  culture: string;
  accuracy: number;
  clothing: string;
}
  position: { x: number; y: number; z: number };
}
}
export interface VFXAsset {
  id: string;
  name: string;
  type: 'building' | 'prop' | 'terrain' | 'vegetation' | 'texture';
  period: string;
  region: string;
  accuracy: number;
  materials: MaterialProperty;
  lod: number;
}
}
}
export interface MaterialProperty {
  name: string;
  type: 'diffuse' | 'roughness' | 'metallic' | 'normal' | 'displacement';
  value: number;
  historicallyAccurate: boolean;
}
}
}
export interface SceneComposition {
  cameraPosition: { x: number; y: number; z: number };
  focalLength: number;
  depth: number;
  layers: SceneLayer;
}
}
export interface SceneLayer {
  id: string;
  name: string;
  type: 'foreground' | 'midground' | 'background';
  opacity: number;
  elements: string;
}
}
}
export interface HistoricalAccuracyMetrics {
  overall: number;
  architecture: number;
  clothing: number;
  technology: number;
  culture: number;
  timeline: number;
  expertValidated: boolean;
  violations: AccuracyViolation;
}
}
}
export interface AccuracyViolation {
  type: 'anachronism' | 'cultural' | 'architectural' | 'technological';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  element: string;
  suggestion: string;
}
}
}
export interface VFXPipelineVisualizerProps {
  scene?: VFXScene;
  scenes?: VFXScene;
  realTimeUpdate?: boolean;
  showControls?: boolean;
  onSceneUpdate?: (scene: VFXScene) => void;
  className?: string;
}
}
export const VFXPipelineVisualizer: React.FC<VFXPipelineVisualizerProps> = ({)
  scene,
  scenes = [],
  realTimeUpdate = true,
  showControls = true,
  onSceneUpdate,
  className = ''
}) => {
  const [activeView, setActiveView] = useState<'scene' | 'accuracy' | 'assets' | 'timeline'>('scene');
  const [selectedScene, setSelectedScene] = useState<VFXScene | undefined>(scene || scenes[0]);
  const [viewMode, setViewMode] = useState<'2d' | '3d' | 'timeline'>('2d');
  const [showGrid, setShowGrid] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  // Enhanced 3D Scene Visualization
  const SceneVisualization3D: React.FC<{ scene: VFXScene }> = ({ scene }) => {
  const canvasWidth = 600;
  const canvasHeight = 400;
  // Calculate 3D positions for isometric projection
  const project3DToIsometric = useCallback((x: number, y: number, z: number) => {,
  const isoX = (x - z) * Math.cos(Math.PI / 6);
  const isoY = (x + z) * Math.sin(Math.PI / 6) - y;
  return {
  x: canvasWidth / 2 + isoX * 2,
  y: canvasHeight / 2 + isoY * 2,
};
    }, []);
    return;
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-600" />
            3D Scene Composition: {scene.name}
          </CardTitle>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>{scene.historicalPeriod}</span>
            <span>{scene.region}</span>
            <Badge variant={scene.accuracy.expertValidated ? 'default' : 'secondary'}>
              {scene.accuracy.overall}% Accurate
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <svg width={canvasWidth} height={canvasHeight} className="border rounded">
              {/* Grid */}
              {showGrid && ()
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="1" />
                  </pattern>
                </defs>
              )}
              {showGrid && <rect width="100%" height="100%" fill="url(#grid)" />}
              {/* Environment layers */}
              <g className="environment-layers">
                {/* Sky gradient */}
                <defs>
                  <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#87CEEB" />
                    <stop offset="100%" stopColor="#E0F6FF" />
                  </linearGradient>
                </defs>
                <rect width="100%" height="60%" fill="url(#skyGradient)" />
                {/* Ground plane */}
                <polygon 
                  points={`0,${canvasHeight * 0.6} ${canvasWidth},${canvasHeight * 0.6} ${canvasWidth},${canvasHeight} 0,${canvasHeight}`}
                  fill="#8B7355" 
                />
              </g>
              {/* Assets */}
              <g className="scene-assets">
                {scene.assets.map((asset, index) => {
                  const pos = project3DToIsometric(;);
                    (index % 5) * 100 - 200,
                    0,
                    Math.floor(index / 5) * 80 - 100
                  );
                  const color = asset.accuracy > 90 ? '#10b981' :
                    asset.accuracy > 70 ? '#f59e0b' : '#ef4444';
                  return;
                    <g key={asset.id} transform={`translate(${pos.x}, ${pos.y})`}>}
                      {/* Asset representation */}
                      {asset.type === 'building' && ()
                        <polygon 
                          points="-15,-20 15,-20 20,-15 20,20 -20,20 -20,-15"
                          fill={color}
                          fillOpacity="0.8"
                          stroke="#374151"
                          strokeWidth="2"
                        />
                      )}
                      {asset.type === 'prop' && ()
                        <circle r="8" fill={color} fillOpacity="0.8" stroke="#374151" strokeWidth="2" />
                      )}
                      {asset.type === 'vegetation' && ()
                        <polygon 
                          points="-8,15 0,-20 8,15"
                          fill="#22c55e"
                          fillOpacity="0.8"
                          stroke="#166534"
                          strokeWidth="2"
                        />
                      )}
                      {/* Accuracy indicator */}
                      <circle r="3" cx="15" cy="-15" fill={color} />
                      <text 
                        x="15" 
                        y="-10" 
                        textAnchor="middle" 
                        fontSize="10" 
                        fill="#374151"
                        fontWeight="600"
                      >
                        {Math.round(asset.accuracy)}
                      </text>
                    </g>
                  );
                })}
              </g>
              {/* Characters */}
              <g className="scene-characters">
                {scene.characters.map((character, index) => {
                  const pos = project3DToIsometric(;);
                    character.position.x || (index * 60 - 120),
                    character.position.y || 0,
                    character.position.z || (index * 30 - 60)
                  );
                  const color = character.type === 'hero' ? '#3b82f6' :
                    character.type === 'crowd' ? '#8b5cf6' : '#6b7280';
                  return;
                    <g key={character.id} transform={`translate(${pos.x}, ${pos.y})`}>}
                      {/* Character silhouette */}
                      <ellipse rx="6" ry="3" cy="20" fill={color} fillOpacity="0.3" />
                      <rect x="-3" y="5" width="6" height="15" rx="3" fill={color} />
                      <circle r="4" cy="-2" fill={color} />
                      {/* Type indicator */}
                      <text 
                        x="0" 
                        y="35" 
                        textAnchor="middle" 
                        fontSize="8" 
                        fill="#374151"
                        fontWeight="500"
                      >
                        {character.type.charAt(0).toUpperCase()}
                      </text>
                    </g>
                  );
                })}
              </g>
              {/* Camera view indicator */}
              <g className="camera-view">
                <g transform={`translate(${canvasWidth - 80}, 40)`}>}
                  <circle r="25" fill="rgba(59, 130, 246, 0.1)" stroke="#3b82f6" strokeWidth="2" />
                  <polygon 
                    points="-8,-8 8,-8 12,0 8,8 -8,8"
                    fill="#3b82f6"
                    transform="rotate(45)"
                  />
                  <text x="0" y="40" textAnchor="middle" fontSize="10" fill="#3b82f6">
                    Camera
                  </text>
                </g>
              </g>
            </svg>
            {/* Scene controls overlay */}
            {showControls && ()
              <div className="absolute top-2 right-2 flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowGrid(!showGrid)}
                  className="bg-white/90"
                >
                  Grid
                </Button>
                <Select value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
                  <SelectTrigger className="w-20 h-8 bg-white/90">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2d">2D</SelectItem>
                    <SelectItem value="3d">3D</SelectItem>
                    <SelectItem value="timeline">Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };
  // Historical Accuracy Dashboard
  const HistoricalAccuracyDashboard: React.FC<{ scene: VFXScene }> = ({ scene }) => {
    const accuracyMetrics = [;
      { label: 'Architecture', value: scene.accuracy.architecture, icon: <Map className="w-4 h-4" /> },
      { label: 'Clothing', value: scene.accuracy.clothing, icon: <Users className="w-4 h-4" /> },
      { label: 'Technology', value: scene.accuracy.technology, icon: <Zap className="w-4 h-4" /> },
      { label: 'Culture', value: scene.accuracy.culture, icon: <Globe className="w-4 h-4" /> },
      { label: 'Timeline', value: scene.accuracy.timeline, icon: <Clock className="w-4 h-4" /> }
    ];
    const getAccuracyColor = (value: number) => {
      if (value >= 90) return 'text-green-600 bg-green-100';
      if (value >= 80) return 'text-blue-600 bg-blue-100';
      if (value >= 70) return 'text-yellow-600 bg-yellow-100';
      if (value >= 60) return 'text-orange-600 bg-orange-100';
      return 'text-red-600 bg-red-100';
    };
    const getSeverityColor = (severity: string) => {
  switch (severity) {
  case 'critical': return 'bg-red-100 text-red-800';
  case 'high': return 'bg-orange-100 text-orange-800';
  case 'medium': return 'bg-yellow-100 text-yellow-800';
  case 'low': return 'bg-blue-100 text-blue-800';
  default: return 'bg-gray-100 text-gray-800';
};
    return;
      <div className="space-y-6">
        {/* Overall Accuracy Score */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Historical Accuracy Score
              </span>
              <Badge variant={scene.accuracy.expertValidated ? 'default' : 'secondary'}>
                {scene.accuracy.expertValidated ? 'Expert Validated' : 'Pending Review'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke={scene.accuracy.overall >= 80 ? '#10b981' : scene.accuracy.overall >= 60 ? '#f59e0b' : '#ef4444'}
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${(scene.accuracy.overall / 100) * 351.86} 351.86`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-gray-900">{scene.accuracy.overall}%</span>
                  <span className="text-sm text-gray-600">Accurate</span>
                </div>
              </div>
            </div>
            {/* Detailed Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {accuracyMetrics.map(metric => ()
                <div key={metric.label} className={`p-3 rounded-lg ${getAccuracyColor(metric.value)}`}>}
                  <div className="flex items-center gap-2 mb-2">
                    {metric.icon}
                    <span className="text-sm font-medium">{metric.label}</span>
                  </div>
                  <div className="text-lg font-bold">{metric.value}%</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        {/* Accuracy Violations */}
        {scene.accuracy.violations.length > 0 && ()
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                Accuracy Violations ({scene.accuracy.violations.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {scene.accuracy.violations.map((violation, index) => ()
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className={getSeverityColor(violation.severity)}>
                          {violation.severity.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">
                          {violation.type.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      {violation.element}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      {violation.description}
                    </p>
                    <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                      💡 Suggestion: {violation.suggestion}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };
  // Material Properties Visualization
  const MaterialPropertiesVisualizer: React.FC<{ assets: VFXAsset }> = ({ assets }) => {
    return;
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brush className="w-5 h-5 text-purple-600" />
            Material Properties Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assets.map(asset => ()
              <div key={asset.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{asset.name}</h4>
                  <Badge variant={asset.accuracy > 80 ? 'default' : 'secondary'}>
                    {asset.accuracy}%
                  </Badge>
                </div>
                <div className="space-y-2">
                  {asset.materials.map((material, idx) => ()
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{material.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${material.historicallyAccurate ? 'bg-green-500' : 'bg-orange-500'}`}
                            style={{ width: `${material.value * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">
                          {Math.round(material.value * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };
  // Real-time Performance Metrics Visualization
  const PerformanceMetricsVisualizer: React.FC<{ scene: VFXScene }> = ({ scene }) => {
  const [metrics, _____setMetrics] = useState({)
  renderTime: Math.random() * 120 + 80, // 80-200ms,
  memoryUsage: Math.random() * 40 + 20, // 20-60%,
  polyCount: scene.assets.length * 125000,
  textureMemory: scene.assets.length * 25, // MB,
  frameRate: 24 + Math.random() * 16, // 24-40 FPS,
  loadingProgress: 100,
});
    return;
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Real-Time Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {/* Render Time */}
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Render Time</span>
              </div>
              <div className="text-lg font-bold text-blue-900">{metrics.renderTime.toFixed(1)}ms</div>
              <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((metrics.renderTime / 200) * 100, 100)}%` }}
                />
              </div>
            </div>
            {/* Memory Usage */}
            <div className="p-3 rounded-lg bg-orange-50 border border-orange-200">
              <div className="flex items-center gap-2 mb-1">
                <Layers className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-900">Memory</span>
              </div>
              <div className="text-lg font-bold text-orange-900">{metrics.memoryUsage.toFixed(1)}%</div>
              <div className="w-full bg-orange-200 rounded-full h-2 mt-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
  metrics.memoryUsage > 80 ? 'bg-red-600' :,
  metrics.memoryUsage > 60 ? 'bg-orange-600' : 'bg-green-600',
}`}
                  style={{ width: `${metrics.memoryUsage}%` }}
                />
              </div>
            </div>
            {/* Polygon Count */}
            <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
              <div className="flex items-center gap-2 mb-1">
                <Eye className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Polygons</span>
              </div>
              <div className="text-lg font-bold text-purple-900">
                {(metrics.polyCount / 1000000).toFixed(1)}M
              </div>
              <div className="text-xs text-purple-700 mt-1">
                {scene.assets.length} assets
              </div>
            </div>
            {/* Frame Rate */}
            <div className="p-3 rounded-lg bg-green-50 border border-green-200">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">Frame Rate</span>
              </div>
              <div className="text-lg font-bold text-green-900">{metrics.frameRate.toFixed(1)} FPS</div>
              <div className={`text-xs mt-1 ${
  metrics.frameRate >= 30 ? 'text-green-700' :,
  metrics.frameRate >= 24 ? 'text-yellow-700' : 'text-red-700',
}`}>
                {metrics.frameRate >= 30 ? 'Excellent' : 
                  metrics.frameRate >= 24 ? 'Good' : 'Poor'}
              </div>
            </div>
            {/* Texture Memory */}
            <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-200">
              <div className="flex items-center gap-2 mb-1">
                <Palette className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-medium text-indigo-900">Textures</span>
              </div>
              <div className="text-lg font-bold text-indigo-900">{metrics.textureMemory}MB</div>
              <div className="text-xs text-indigo-700 mt-1">
                {scene.assets.reduce((sum, asset) => sum + asset.materials.length, 0)} materials
              </div>
            </div>
            {/* Loading Progress */}
            <div className="p-3 rounded-lg bg-cyan-50 border border-cyan-200">
              <div className="flex items-center gap-2 mb-1">
                <Settings className="w-4 h-4 text-cyan-600" />
                <span className="text-sm font-medium text-cyan-900">Status</span>
              </div>
              <div className="text-lg font-bold text-cyan-900">{metrics.loadingProgress}%</div>
              <div className="text-xs text-cyan-700 mt-1">
                {metrics.loadingProgress === 100 ? 'Ready' : 'Loading...'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };
  // Character Crowd Visualization
  const CrowdVisualization: React.FC<{ characters: VFXCharacter }> = ({ characters }) => {
    const crowdStats = useMemo(() => {
      const typeDistribution = characters.reduce((acc, char) => {
        acc[char.type] = (acc[char.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Crowd Analysis: {crowdStats.total} Characters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Character Type Distribution */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Character Types</h4>
              <div className="space-y-2">
                {Object.entries(crowdStats.types).map(([type, count]) => {
                  const percentage = (count / crowdStats.total) * 100;
                  const color = type === 'hero' ? 'bg-blue-500' :
                    type === 'crowd' ? 'bg-purple-500' : 'bg-gray-500';
                  return;
                    <div key={type} className="flex items-center gap-3">
                      <div className="w-16 text-sm text-gray-600 capitalize">{type}</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${color} transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="w-12 text-sm font-medium text-gray-900">
                        {count}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Cultural Distribution */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Cultural Diversity</h4>
              <div className="space-y-3">
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Globe className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-900">Average Accuracy</span>
                  </div>
                  <div className="text-xl font-bold text-green-900">
                    {crowdStats.avgAccuracy.toFixed(1)}%
                  </div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Map className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Cultures</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {crowdStats.cultures.map(culture => ()
                      <Badge key={culture} variant="secondary" className="text-xs">
                        {culture}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-900">Time Periods</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {crowdStats.periods.map(period => ()
                      <Badge key={period} variant="outline" className="text-xs">
                        {period}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };
  // Timeline Visualization for VFX workflow
  const TimelineVisualization: React.FC<{ scenes: VFXScene }> = ({ scenes }) => {
  const timelineItems = scenes.map((scene, index) => ({)
  id: scene.id,
  name: scene.name,
  period: scene.historicalPeriod,
  accuracy: scene.accuracy.overall,
  status: scene.accuracy.expertValidated ? 'completed' : 'in-progress',
  position: index,
}));
    return;
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            VFX Production Timeline
          </CardTitle>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button variant="outline" size="sm">
                <Rewind className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm">
                <SkipForward className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Speed:</span>
              <Slider
                value={[animationSpeed]}
                onValueChange={(value) => setAnimationSpeed(value[0])}
                max={5}
                min={0.5}
                step={0.5}
                className="w-20"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Timeline track */}
            <div className="relative h-2 bg-gray-200 rounded-full mb-8">
              <div 
                className="absolute h-full bg-blue-500 rounded-full transition-all duration-1000"
                style={{ width: `${(timelineItems.length > 0 ? (selectedScene ? timelineItems.findIndex(t => t.id === selectedScene.id) + 1 : 1) / timelineItems.length : 0) * 100}%` }}
              />
            </div>
            {/* Timeline items */}
            <div className="space-y-4">
              {timelineItems.map((item, index) => ()
                <div 
                  key={item.id} 
                  className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-all ${
  selectedScene?.id === item.id ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 hover:bg-gray-100',
}`}
                  onClick={() => {
                    const scene = scenes.find(s => s.id === item.id);
                    if (scene) setSelectedScene(scene);
                  }}
                >
                  <div className={`w-4 h-4 rounded-full flex-shrink-0 ${
  item.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500',
}`} />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    <p className="text-sm text-gray-600">{item.period}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">{item.accuracy}%</div>
                    <Badge variant={item.status === 'completed' ? 'default' : 'secondary'}>
                      {item.status === 'completed' ? 'Complete' : 'In Progress'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };
  // Asset Relationship Graph Visualization
  const AssetRelationshipGraph: React.FC<{ assets: VFXAsset }> = ({ assets }) => {
    const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
    const assetCategories = useMemo(() => {
      return assets.reduce((acc, asset) => {
        if (!acc[asset.type]) acc[asset.type] = [];
        acc[asset.type].push(asset);
        return acc;
      }, {} as Record<string, VFXAsset>);
    }, [assets]);
    const getCategoryColor = (type: string) => {
  const colors = {
  building: '#3b82f6',
  prop: '#10b981',
  terrain: '#f59e0b',
  vegetation: '#22c55e',
  texture: '#8b5cf6',
};
      return colors[type as keyof typeof colors] || '#6b7280';
    };
    return;
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            Asset Relationship Network
          </CardTitle>
          <div className="text-sm text-gray-600">
            {Object.keys(assetCategories).length} categories, {assets.length} total assets
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Category Overview */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {Object.entries(assetCategories).map(([type, typeAssets]) => ()
                <div 
                  key={type} 
                  className="p-3 rounded-lg border-2 border-gray-200 hover:border-gray-300 cursor-pointer transition-colors"
                  onClick={() => setSelectedAsset(selectedAsset === type ? null : type)}
                  style={{ 
                    borderColor: selectedAsset === type ? getCategoryColor(type) : undefined,
                    backgroundColor: selectedAsset === type ? `${getCategoryColor(type)}10` : undefined}
                  }}
                >
                  <div className="text-center">
                    <div 
                      className="w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center text-white text-sm font-bold"
                      style={{ backgroundColor: getCategoryColor(type) }}
                    >
                      {typeAssets.length}
                    </div>
                    <div className="text-xs font-medium text-gray-900 capitalize">{type}</div>
                    <div className="text-xs text-gray-600">
                      Avg: {(typeAssets.reduce((sum, a) => sum + a.accuracy, 0) / typeAssets.length).toFixed(0)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Asset Details */}
            {selectedAsset && assetCategories[selectedAsset] && ()
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3 capitalize">
                  {selectedAsset} Assets ({assetCategories[selectedAsset].length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {assetCategories[selectedAsset].map(asset => ()
                    <div key={asset.id} className="p-3 bg-gray-50 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="text-sm font-medium text-gray-900">{asset.name}</h5>
                        <Badge 
                          variant={asset.accuracy > 90 ? 'default' : asset.accuracy > 70 ? 'secondary' : 'outline'}
                          className="text-xs"
                        >
                          {asset.accuracy}%
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div><span className="font-medium">Period:</span> {asset.period}</div>
                        <div><span className="font-medium">Region:</span> {asset.region}</div>
                        <div><span className="font-medium">LOD:</span> Level {asset.lod}</div>
                        <div><span className="font-medium">Materials:</span> {asset.materials.length}</div>
                      </div>
                      {/* Material preview */}
                      <div className="mt-2 flex gap-1">
                        {asset.materials.slice(0, 3).map((material, idx) => ()
                          <div 
                            key={idx}
                            className={`w-3 h-3 rounded-full border ${
  material.historicallyAccurate ? 'bg-green-500' : 'bg-orange-500',
}`}
                            title={`${material.name}: ${material.historicallyAccurate ? 'Accurate' : 'Review needed'}`}
                          />
                        ))}
                        {asset.materials.length > 3 && ()
                          <div className="text-xs text-gray-500 ml-1">+{asset.materials.length - 3}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Global Asset Statistics */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
              <h4 className="text-sm font-semibold text-blue-900 mb-3">Asset Quality Overview</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-900">
                    {assets.filter(a => a.accuracy >= 90).length}
                  </div>
                  <div className="text-xs text-blue-700">High Quality (90%+)</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-900">
                    {assets.filter(a => a.accuracy >= 70 && a.accuracy < 90).length}
                  </div>
                  <div className="text-xs text-blue-700">Good Quality (70-89%)</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-900">
                    {assets.filter(a => a.accuracy < 70).length}
                  </div>
                  <div className="text-xs text-blue-700">Needs Review (&lt;70%)</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-900">
                    {assets.reduce((sum, a) => sum + a.materials.length, 0)}
                  </div>
                  <div className="text-xs text-blue-700">Total Materials</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };
  if (!selectedScene) {
    return;
      <div className={`vfx-pipeline-visualizer ${className}`}>}
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Film className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Scene Selected</h3>
            <p className="text-gray-600 text-center">
              Select a VFX scene to begin visualization and analysis
            </p>
          </CardContent>
        </Card>
      </div>
    );
  return;
    <div className={`vfx-pipeline-visualizer ${className}`}>}
      <Tabs value={activeView} onValueChange={setActiveView}>
        <div className="mb-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="scene" className="flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Scene
            </TabsTrigger>
            <TabsTrigger value="accuracy" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Accuracy
            </TabsTrigger>
            <TabsTrigger value="assets" className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Assets
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Timeline
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="scene" className="space-y-6">
          <SceneVisualization3D scene={selectedScene} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PerformanceMetricsVisualizer scene={selectedScene} />
            <CrowdVisualization characters={selectedScene.characters} />
          </div>
        </TabsContent>
        <TabsContent value="accuracy" className="space-y-6">
          <HistoricalAccuracyDashboard scene={selectedScene} />
        </TabsContent>
        <TabsContent value="assets" className="space-y-6">
          <MaterialPropertiesVisualizer assets={selectedScene.assets} />
          <AssetRelationshipGraph assets={selectedScene.assets} />
        </TabsContent>
        <TabsContent value="timeline" className="space-y-6">
          <TimelineVisualization scenes={scenes} />
        </TabsContent>
      </Tabs>
      <style>{`
        .vfx-pipeline-visualizer {
          max-width: 1200px;
  margin: 0 auto;
        .scene-visualization {
          position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
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
      `}</style>
    </div>
  );
};

export default VFXPipelineVisualizer;