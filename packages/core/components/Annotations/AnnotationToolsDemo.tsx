/**
 * Annotation Tools Demo - E17-1753114397305-79782A
 * 
 * Comprehensive demonstration of all annotation tools working together
 * for professional VFX director workflows.
 */
import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Switch } from '../ui/Switch';

// Import annotation components
import NodeAnnotationSystem from './NodeAnnotations';
import DrawingAnnotationsCanvas from './DrawingAnnotations';
import RegionAnnotationSystem from './RegionAnnotations';

// Import existing components for integration
import { 
  MessageCircle,
  Pen,
  Square,
  Link as LinkIcon,
  StickyNote as StickyNoteIcon,
  Eye,
  EyeOff,
  Settings,
  Save,
  Download,
  Upload,
  RefreshCw,
  Grid,
  Layers,
  Users,
  Camera,
  Film,
  Palette,
  Target,
  Zap
} from 'lucide-react';

// Import types
import type { NodeAnnotation } from './NodeAnnotations';
import type { DrawingAnnotation } from './DrawingAnnotations';
import type { RegionAnnotation } from './RegionAnnotations';

// Unified VFX User type

export interface VFXUser {
  id: string;
  name: string;
  role: 'director' | 'vfx_supervisor' | 'artist' | 'producer' | 'pipeline_td' | 'coordinator';
  avatar?: string;
  email: string;
  color: string;
  // Mock graph data for demonstration
  interface MockNode {
  id: string;
  name: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  interface MockConnection {
  id: string;
  source: string;
  target: string;
}
export interface AnnotationToolsDemoProps {
  className?: string;
  title?: string;
  showAllTools?: boolean;
  readonly?: boolean;
  initialUser?: VFXUser;

// Sample VFX workflow data
const SAMPLE_NODES: MockNode = [
  { id: 'node-001', name: 'Character Input', type: 'input', x: 50, y: 100, width: 120, height: 80 },
  { id: 'node-002', name: 'Motion Blur', type: 'effect', x: 250, y: 100, width: 120, height: 80 },
  { id: 'node-003', name: 'Color Correction', type: 'color', x: 450, y: 100, width: 120, height: 80 },
  { id: 'node-004', name: 'Composite', type: 'composite', x: 650, y: 100, width: 120, height: 80 },
  { id: 'node-005', name: 'Background Plate', type: 'input', x: 50, y: 250, width: 120, height: 80 },
  { id: 'node-006', name: 'Lighting', type: 'lighting', x: 250, y: 250, width: 120, height: 80 },
  { id: 'node-007', name: 'Atmosphere', type: 'effect', x: 450, y: 250, width: 120, height: 80 },
  { id: 'node-008', name: 'Final Output', type: 'output', x: 650, y: 250, width: 120, height: 80 }
];
const SAMPLE_CONNECTIONS: MockConnection = [
  { id: 'conn-001', source: 'node-001', target: 'node-002' },
  { id: 'conn-002', source: 'node-002', target: 'node-003' },
  { id: 'conn-003', source: 'node-003', target: 'node-004' },
  { id: 'conn-004', source: 'node-005', target: 'node-006' },
  { id: 'conn-005', source: 'node-006', target: 'node-007' },
  { id: 'conn-006', source: 'node-007', target: 'node-004' },
  { id: 'conn-007', source: 'node-004', target: 'node-008' }
];
const DEFAULT_USER: VFXUser = {,
  id: 'user-director',
  name: 'Sarah Director',
  role: 'director',
  email: 'sarah@vfxstudio.com',
  color: '#ff7c00',
  avatar: '/avatars/director.jpg',
};
const TEAM_MEMBERS: VFXUser = [
  DEFAULT_USER,
  {
  id: 'user-vfx-sup',
  name: 'Mike VFX Supervisor',
  role: 'vfx_supervisor',
  email: 'mike@vfxstudio.com',
  color: '#3b82f6',
  avatar: '/avatars/vfx-supervisor.jpg',
}
  {
  id: 'user-artist',
  name: 'Alex Artist',
  role: 'artist',
  email: 'alex@vfxstudio.com',
  color: '#10b981',
  avatar: '/avatars/artist.jpg',
}
  {
  id: 'user-pipeline',
  name: 'Jordan Pipeline TD',
  role: 'pipeline_td',
  email: 'jordan@vfxstudio.com',
  color: '#8b5cf6',
  avatar: '/avatars/pipeline-td.jpg'];
}
export const AnnotationToolsDemo: React.FC<AnnotationToolsDemoProps> = ({)
  className = '',
  title = 'VFX Annotation Tools Demonstration',
  showAllTools = true,
  readonly = false,
  initialUser = DEFAULT_USER
}) => {
  // State for current user and selected tools
  const [currentUser, setCurrentUser] = useState<VFXUser>(initialUser);
  const [selectedNode, setSelectedNode] = useState<string | null>('node-002');
  const [activeAnnotationTool, setActiveAnnotationTool] = useState<'node' | 'drawing' | 'region' | 'connection'>('node');
  // Annotation data state
  const [nodeAnnotations, setNodeAnnotations] = useState<NodeAnnotation>([)
    {
      id: 'node-ann-001',
      nodeId: 'node-002',
      type: 'review',
      content: 'Motion blur intensity needs adjustment - currently too strong for this shot',
      author: DEFAULT_USER,
      priority: 'high',
      status: 'open',
      timestamp: '2025-07-22T09:00:00Z',
      lastModified: '2025-07-22T09:00:00Z',
      attachments: [],
      replies: [,
        {
          id: 'reply-001',
          content: 'I can reduce the blur amount by 30%. Will that work?',
          author: TEAM_MEMBERS[2], // Artist
          timestamp: '2025-07-22T09:30:00Z',
          reactions: { '👍': [DEFAULT_USER] }
      ],
      tags: ['motion-blur', 'adjustment', 'character'],
      visibility: 'public',
      linkedAnnotations: [],
      estimatedTime: 1;
  }
    {
  id: 'node-ann-002',
  nodeId: 'node-003',
  type: 'creative',
  content: 'Color temperature should be warmer to match the sunset mood',
  author: DEFAULT_USER,
  priority: 'medium',
  status: 'in_progress',
  timestamp: '2025-07-22T08:30:00Z',
  lastModified: '2025-07-22T09:15:00Z',
  attachments: [],
  replies: [],
  tags: ['color', 'creative', 'sunset'],
  visibility: 'public',
  linkedAnnotations: [],
  assignee: TEAM_MEMBERS[2] // Artist,
}
    {
      id: 'node-ann-003',
      nodeId: 'node-006',
      type: 'technical',
      content: 'Lighting setup needs optimization - render time is too high',
      author: TEAM_MEMBERS[3], // Pipeline TD
      priority: 'critical',
      status: 'open',
      timestamp: '2025-07-22T07:45:00Z',
      lastModified: '2025-07-22T07:45:00Z',
      attachments: [],
      replies: [],
      tags: ['performance', 'lighting', 'optimization'],
      visibility: 'public',
      linkedAnnotations: [],
      estimatedTime: 3]);
  const [drawingAnnotations, setDrawingAnnotations] = useState<DrawingAnnotation>([)
    {
      id: 'draw-001',
      type: 'arrow',
      points: [{ x: 170, y: 140 }, { x: 250, y: 140 }],
      style: {
  color: '#ff7c00',
  thickness: 4,
  opacity: 1,
  lineCap: 'round',
  lineJoin: 'round',
},
  layer: 1,
      author: DEFAULT_USER,
      timestamp: '2025-07-22T09:00:00Z',
      visible: true,
      locked: false;
  }
    {
      id: 'draw-002',
      type: 'circle',
      points: [{ x: 310, y: 140 }, { x: 340, y: 170 }],
      style: {
  color: '#ef4444',
  thickness: 3,
  opacity: 0.8,
  fillColor: '#ef4444',
  fillOpacity: 0.1,
  lineCap: 'round',
  lineJoin: 'round',
},
  layer: 2,
      author: DEFAULT_USER,
      timestamp: '2025-07-22T09:05:00Z',
      visible: true,
      locked: false;
  }
    {
      id: 'draw-003',
      type: 'text',
      points: [{ x: 320, y: 200 }],
      style: {
  color: '#1f2937',
  thickness: 1,
  opacity: 1,
  fontSize: 14,
  fontFamily: 'Arial',
  fontWeight: 'bold',
  lineCap: 'round',
  lineJoin: 'round',
},
  layer: 3,
      author: DEFAULT_USER,
      timestamp: '2025-07-22T09:07:00Z',
      visible: true,
      locked: false,
      text: 'NEEDS ATTENTION']);
  const [regionAnnotations, setRegionAnnotations] = useState<RegionAnnotation>([)
    {
      id: 'region-001',
      name: 'Character Pipeline',
      type: 'mars_zone',
      shape: 'rectangle',
      area: {
  shape: 'rectangle',
        bounds: { x: 30, y: 80, width: 360, height: 120 },
        points: [,
          { x: 30, y: 80 },
          { x: 390, y: 200 }
        ]
  },
  style: {
  borderColor: '#8b5cf6',
  borderWidth: 3,
  borderStyle: 'dashed',
  fillColor: '#8b5cf6',
  fillOpacity: 0.1,
},
  description: 'Primary character processing pipeline - critical path for hero shots',
      author: TEAM_MEMBERS[1], // VFX Supervisor
      timestamp: '2025-07-22T08:00:00Z',
      lastModified: '2025-07-22T08:00:00Z',
      visible: true,
      locked: false,
      priority: 'critical',
      status: 'active',
      marsZone: 'subject_focus',
      nodeIds: ['node-001', 'node-002', 'node-003'],
      tags: ['character', 'hero', 'critical-path'],
      metadata: {
  nodeCount: 3,
  totalComplexity: 240,
  estimatedRenderTime: 12.5,
  performanceImpact: 'high',
  lastAnalysis: '2025-07-22T08:00:00Z',
}
    {
      id: 'region-002',
      name: 'Background Processing',
      type: 'optimization_zone',
      shape: 'rectangle',
      area: {
  shape: 'rectangle',
        bounds: { x: 30, y: 230, width: 360, height: 120 },
        points: [,
          { x: 30, y: 230 },
          { x: 390, y: 350 }
        ]
  },
  style: {
  borderColor: '#10b981',
  borderWidth: 2,
  borderStyle: 'solid',
  fillColor: '#10b981',
  fillOpacity: 0.08,
},
  description: 'Background elements - optimization candidate for render performance',
      author: TEAM_MEMBERS[3], // Pipeline TD
      timestamp: '2025-07-22T07:30:00Z',
      lastModified: '2025-07-22T09:00:00Z',
      visible: true,
      locked: false,
      priority: 'medium',
      status: 'active',
      nodeIds: ['node-005', 'node-006', 'node-007'],
      tags: ['background', 'optimization', 'performance'],
      metadata: {
  nodeCount: 3,
  totalComplexity: 180,
  estimatedRenderTime: 8.2,
  performanceImpact: 'medium',
  lastAnalysis: '2025-07-22T08:30:00Z']);
  // UI state
  const [showGrid, setShowGrid] = useState(true);
  const [showPerformanceMetrics, setShowPerformanceMetrics] = useState(true);
  const [showTeamPanel, setShowTeamPanel] = useState(false);
  const [globalVisibility, setGlobalVisibility] = useState({)
  nodeAnnotations: true,
  drawingAnnotations: true,
  regionAnnotations: true,
  connectionAnnotations: true,
});
  // Statistics calculations
  const stats = useMemo(() => {
  const totalAnnotations = nodeAnnotations.length + drawingAnnotations.length + regionAnnotations.length;
  const openIssues = nodeAnnotations.filter(a => ['open', 'in_progress'].includes(a.status)).length;
  const criticalIssues = nodeAnnotations.filter(a => a.priority === 'critical').length + ;
  regionAnnotations.filter(r => r.priority === 'critical').length;
  const teamMembers = new Set([);
  ...nodeAnnotations.map(a => a.author.id),
  ...drawingAnnotations.map(a => a.author.id),
  ...regionAnnotations.map(a => a.author.id)
  ]).size;
  const avgRenderTime = regionAnnotations.reduce((sum, r) => ;
  sum + (r.metadata.estimatedRenderTime || 0), 0
  ) / regionAnnotations.length || 0;
  return {
  totalAnnotations,
  openIssues,
  criticalIssues,
  teamMembers,
  avgRenderTime: avgRenderTime.toFixed(1),
};
  }, [nodeAnnotations, drawingAnnotations, regionAnnotations]);
  // Annotation handlers
  const handleNodeAnnotationCreate = useCallback(;);
    (annotation: Omit<NodeAnnotation)
    'id' | 'timestamp' | 'lastModified' | 'replies'>
  ) => {
    const newAnnotation: NodeAnnotation = {
      ...annotation,
      id: `node-ann-${Date.now()}`}
},
  timestamp: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      replies: [];
  };
    setNodeAnnotations(prev => [...prev, newAnnotation]);
  }, []);
  const handleNodeAnnotationUpdate = useCallback((annotationId: string, updates: Partial<NodeAnnotation>) => {
    setNodeAnnotations(prev => )
      prev.map(ann => )
        ann.id === annotationId 
          ? { ...ann, ...updates, lastModified: new Date().toISOString() }
          : ann
    );
  }, []);
  const handleNodeAnnotationDelete = useCallback((annotationId: string) => {
    setNodeAnnotations(prev => prev.filter(ann => ann.id !== annotationId));
  }, []);
  const handleReplyCreate = useCallback(;);
    (annotationId: string);
  reply: Omit<NodeAnnotation['replies'][0],
    'id' | 'timestamp' | 'reactions'>
  ) => {
    const newReply = {
      ...reply,
      id: `reply-${Date.now()}`}
},
  timestamp: new Date().toISOString(),
      reactions: {}
    };
    setNodeAnnotations(prev => )
      prev.map(ann => )
        ann.id === annotationId 
          ? { ...ann, replies: [...ann.replies, newReply], lastModified: new Date().toISOString() }
          : ann
    );
  }, []);
  // Export all annotations
  const exportAnnotations = useCallback(() => {
  const exportData = {
  metadata: {
  exportedBy: currentUser,
  exportedAt: new Date().toISOString(),
  version: '1.0.0',
  project: 'VFX Demo Scene',
}
      nodeAnnotations,
      drawingAnnotations,
      regionAnnotations,
      nodes: SAMPLE_NODES,
      connections: SAMPLE_CONNECTIONS,
      stats
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vfx-annotations-${Date.now()}.json`;}
    link.click();
    URL.revokeObjectURL(url);
  }, [nodeAnnotations, drawingAnnotations, regionAnnotations, currentUser, stats]);
  // Get annotations for selected node
  const selectedNodeAnnotations = useMemo(() => {
  return selectedNode ? nodeAnnotations.filter(ann => ann.nodeId === selectedNode) : [];
}, [nodeAnnotations, selectedNode]);
  // Get selected node details
  const selectedNodeDetails = useMemo(() => {
  return selectedNode ? SAMPLE_NODES.find(node => node.id === selectedNode) : null;
}, [selectedNode]);
  return;
    <div className={`annotation-tools-demo ${className}`}>}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Film className="w-6 h-6 text-blue-600" />
              <span>{title}</span>
              <Badge variant="secondary" className="text-xs">
                Professional VFX Workflow
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTeamPanel(!showTeamPanel)}
              >
                <Users className="w-4 h-4 mr-2" />
                Team ({TEAM_MEMBERS.length})
              </Button>
              <Select 
                value={currentUser.id} 
                onValueChange={(userId) => setCurrentUser(TEAM_MEMBERS.find(u => u.id === userId) || DEFAULT_USER)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEAM_MEMBERS.map(user => ()
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: user.color }}
                        />
                        <span>{user.name}</span>
                        <Badge variant="outline" className="text-xs ml-2">
                          {user.role.replace('_', ' ')}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={exportAnnotations}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </CardTitle>
          {/* Statistics Dashboard */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
            <div className="bg-blue-50 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-blue-900">{stats.totalAnnotations}</div>
              <div className="text-xs text-blue-700">Total Annotations</div>
            </div>
            <div className="bg-amber-50 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-amber-900">{stats.openIssues}</div>
              <div className="text-xs text-amber-700">Open Issues</div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-red-900">{stats.criticalIssues}</div>
              <div className="text-xs text-red-700">Critical</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-green-900">{stats.teamMembers}</div>
              <div className="text-xs text-green-700">Contributors</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-purple-900">{stats.avgRenderTime}s</div>
              <div className="text-xs text-purple-700">Avg Render Time</div>
            </div>
          </div>
          {/* Team Panel */}
          {showTeamPanel && ()
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm">Team Collaboration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {TEAM_MEMBERS.map(user => {)
  const userAnnotations = nodeAnnotations.filter(a => a.author.id === user.id).length;
                    const userDrawings = drawingAnnotations.filter(a => a.author.id === user.id).length;
                    const userRegions = regionAnnotations.filter(a => a.author.id === user.id).length;
                    const totalContributions = userAnnotations + userDrawings + userRegions;
                    return;
                      <div key={user.id} className="border rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: user.color }}
                          />
                          <span className="font-medium text-sm">{user.name}</span>
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          <div className="flex justify-between">
                            <span>Role:</span>
                            <Badge variant="outline" className="text-xs">
                              {user.role.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Contributions:</span>
                            <span className="font-medium">{totalContributions}</span>
                          </div>
                          <div className="text-xs mt-2">
                            <div>Annotations: {userAnnotations}</div>
                            <div>Drawings: {userDrawings}</div>
                            <div>Regions: {userRegions}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Visibility Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Annotation Visibility Controls
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(globalVisibility).map(([key, visible]) => ()
                    <div key={key} className="flex items-center gap-2">
                      <Switch
                        checked={visible}
                        onCheckedChange={(checked) => 
                          setGlobalVisibility(prev => ({ ...prev, [key]: checked }))
                      />
                      <span className="text-sm capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={showGrid}
                      onCheckedChange={setShowGrid}
                    />
                    <span className="text-sm">Show Grid</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={showPerformanceMetrics}
                      onCheckedChange={setShowPerformanceMetrics}
                    />
                    <span className="text-sm">Performance Metrics</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Main Annotation Interface */}
            <Tabs value={activeAnnotationTool} onValueChange={setActiveAnnotationTool}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="node" className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Node Annotations
                </TabsTrigger>
                <TabsTrigger value="drawing" className="flex items-center gap-2">
                  <Pen className="w-4 h-4" />
                  Drawing Tools
                </TabsTrigger>
                <TabsTrigger value="region" className="flex items-center gap-2">
                  <Square className="w-4 h-4" />
                  Region Annotations
                </TabsTrigger>
                <TabsTrigger value="connection" className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  Connections
                </TabsTrigger>
              </TabsList>
              <TabsContent value="node" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Node Selection */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Select Node for Annotation</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {SAMPLE_NODES.map(node => ()
                          <div
                            key={node.id}
                            className={`p-3 border rounded cursor-pointer transition-colors ${
  selectedNode === node.id ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:bg-gray-50',
}`}
                            onClick={() => setSelectedNode(node.id)}
                          >
                            <div className="font-medium text-sm">{node.name}</div>
                            <div className="text-xs text-gray-500">{node.type}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {nodeAnnotations.filter(a => a.nodeId === node.id).length} annotations
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  {/* Node Annotations */}
                  <div className="lg:col-span-2">
                    {selectedNodeDetails && ()
                      <NodeAnnotationSystem
                        nodeId={selectedNodeDetails.id}
                        nodeName={selectedNodeDetails.name}
                        nodeType={selectedNodeDetails.type}
                        annotations={selectedNodeAnnotations}
                        currentUser={currentUser}
                        onAnnotationCreate={handleNodeAnnotationCreate}
                        onAnnotationUpdate={handleNodeAnnotationUpdate}
                        onAnnotationDelete={handleNodeAnnotationDelete}
                        onReplyCreate={handleReplyCreate}
                      />
                    )}
                    {!selectedNode && ()
                      <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                          <MessageCircle className="w-16 h-16 text-gray-400 mb-4" />
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Node</h3>
                          <p className="text-gray-600 text-center">
                            Choose a node from the list to view and manage its annotations
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="drawing" className="space-y-4">
                {globalVisibility.drawingAnnotations && ()
                  <DrawingAnnotationsCanvas
                    width={800}
                    height={400}
                    annotations={drawingAnnotations}
                    currentUser={currentUser}
                    onAnnotationsChange={setDrawingAnnotations}
                    showGrid={showGrid}
                    readonly={readonly}
                  />
                )}
              </TabsContent>
              <TabsContent value="region" className="space-y-4">
                {globalVisibility.regionAnnotations && ()
                  <RegionAnnotationSystem
                    width={800}
                    height={400}
                    regions={regionAnnotations}
                    nodes={SAMPLE_NODES}
                    currentUser={currentUser}
                    onRegionsChange={setRegionAnnotations}
                    showGrid={showGrid}
                    readonly={readonly}
                  />
                )}
              </TabsContent>
              <TabsContent value="connection" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Connection Annotations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {SAMPLE_CONNECTIONS.map(conn => ()
                        <div key={conn.id} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <div className="text-sm font-medium">
                              {SAMPLE_NODES.find(n => n.id === conn.source)?.name} → {SAMPLE_NODES.find(n => n.id === conn.target)?.name}
                            </div>
                            <div className="text-xs text-gray-500">Connection ID: {conn.id}</div>
                          </div>
                          <Button variant="outline" size="sm">
                            Add Label
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            {/* Performance Metrics Panel */}
            {showPerformanceMetrics && ()
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Performance Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg">
                      <div className="text-sm font-medium text-blue-900 mb-2">Render Performance</div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Total Render Time:</span>
                          <span className="font-medium">{(parseFloat(stats.avgRenderTime) * regionAnnotations.length).toFixed(1)}s</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Critical Nodes:</span>
                          <span className="font-medium text-red-600">
                            {nodeAnnotations.filter(a => a.priority === 'critical').length}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Optimization Zones:</span>
                          <span className="font-medium text-green-600">
                            {regionAnnotations.filter(r => r.type === 'optimization_zone').length}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
                      <div className="text-sm font-medium text-purple-900 mb-2">MARS Analysis</div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>MARS Zones:</span>
                          <span className="font-medium">
                            {regionAnnotations.filter(r => r.marsZone).length}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Subject Focus Areas:</span>
                          <span className="font-medium">
                            {regionAnnotations.filter(r => r.marsZone === 'subject_focus').length}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Camera Influence:</span>
                          <span className="font-medium">
                            {regionAnnotations.filter(r => r.marsZone === 'camera_influence').length}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
                      <div className="text-sm font-medium text-green-900 mb-2">Workflow Status</div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Completed Tasks:</span>
                          <span className="font-medium">
                            {nodeAnnotations.filter(a => a.status === 'resolved').length}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>In Progress:</span>
                          <span className="font-medium text-amber-600">
                            {nodeAnnotations.filter(a => a.status === 'in_progress').length}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Open Issues:</span>
                          <span className="font-medium text-red-600">
                            {nodeAnnotations.filter(a => a.status === 'open').length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
      <style>{`
        .annotation-tools-demo {
          max-width: 1400px;
  margin: 0 auto;
          padding: 1rem;
        @media (max-width: 768px) {
          .annotation-tools-demo {
            padding: 0.5rem;
        .annotation-tools-demo .tabs-list {
          background-color: #f8fafc;
        .annotation-tools-demo .tabs-trigger[data-state="active"] {
          background-color: white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        .trend-indicator.up {
          color: #10b981;
        .trend-indicator.down {
          color: #ef4444;
        .trend-indicator.stable {
          color: #6b7280;
      `}</style>
    </div>
  );
};

export default AnnotationToolsDemo;