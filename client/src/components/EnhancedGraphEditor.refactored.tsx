/**
 * Enhanced Graph Editor - Refactored with modular data structure
 * REFACTOR-001: EnhancedGraphEditor Data Extraction
 * 
 * This is a streamlined version of the EnhancedGraphEditor that uses
 * externalized data templates and improved architecture.
 */
import React, { useState, useCallback, useRef } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  NodeTypes,
  Handle,
  Position,
  useReactFlow,
  ReactFlowProvider
} from 'reactflow';

// Import modular data templates
import { 
  panelArchetypeTemplate,
  aestheticInfluenceTemplate, 
  wearLevelTemplate,
  colorPaletteTemplate,
  materialsTemplate,
  retroGamingDemoTemplate
} from '../data/nodeTemplates';

// Import new components
import { TemplateSelector, useNodeFactory } from './GraphTemplates';

// Professional Design System (kept from original)
interface ProfessionalColors {
  background: {
    primary: string,
    secondary: string;
    tertiary: string;
  };
  text: {
    primary: string,
    secondary: string;
    accent: string;
  };
  accent: {
    orange: string,
    blue: string;
    cyan: string,
    purple: string;
    green: string,
    red: string;
  };
  nodes: {
  text: string,
  logic: string;,
  output: string,
  variable: string;,
  advanced: string,
  transform: string;
};
  ui: {
  border: string,
  borderHover: string;,
  borderActive: string,
  hover: string;,
  selection: string;
};
const professionalColors: ProfessionalColors = {,
  background: {
  primary: '#1e1e1e',
  secondary: '#2a2a2a',
  tertiary: '#353535'
},
  text: {
  primary: '#e8e8e8',
  secondary: '#b8b8b8',
  accent: '#ff7c00'
},
  accent: {
  orange: '#ff7c00',
  blue: '#4a9eff',
  cyan: '#00d4ff',
  purple: '#b45cff',
  green: '#4ade80',
  red: '#ef4444'
},
  nodes: {
  text: '#4f46e5',
  logic: '#059669',
  output: '#dc2626',
  variable: '#7c3aed',
  advanced: '#6366f1',
  transform: '#f59e0b'
},
  ui: {
  border: '#404040',
  borderHover: '#5a5a5a',
  borderActive: '#ff7c00',
  hover: '#2d2d2d',
  selection: '#ff7c0040'
};
const professionalShadows = {
  node: {
  default: '0 4px 12px rgba(0, 0, 0, 0.35), 0 2px 4px rgba(0, 0, 0, 0.2)',
  hover: '0 8px 25px rgba(0, 0, 0, 0.45), 0 4px 10px rgba(0, 0, 0, 0.25)',
  selected: '0 0 0 2px #ff7c00, 0 8px 25px rgba(255, 124, 0, 0.25), 0 4px 12px rgba(0, 0, 0, 0.4)'
};

// Node components
const TextNode = ({ data, selected }: { data: any, selected: boolean }) => (
  <div className={`bg-slate-800 border-2 rounded-xl p-4 min-w-[200px] transition-all duration-200 ${
  selected ? 'border-orange-500 shadow-orange-glow' : 'border-slate-600 hover:border-slate-500'
}`} style={{ boxShadow: selected ? professionalShadows.node.selected : professionalShadows.node.default }}>
    <Handle type="target" position={Position.Top} className="w-3 h-3 bg-slate-600" />
    <div className="font-semibold text-slate-100 mb-1">{data.label}</div>
    <div className="text-sm text-slate-300">{data.description}</div>
    <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-slate-600" />
  </div>
);
const LogicNode = ({ data, selected }: { data: any, selected: boolean }) => (
  <div className={`bg-emerald-900 border-2 rounded-xl p-4 min-w-[220px] transition-all duration-200 ${
  selected ? 'border-orange-500 shadow-orange-glow' : 'border-emerald-600 hover:border-emerald-500'
}`} style={{ boxShadow: selected ? professionalShadows.node.selected : professionalShadows.node.default }}>
    <Handle type="target" position={Position.Top} className="w-3 h-3 bg-emerald-600" />
    <div className="font-semibold text-emerald-100 mb-1">{data.label}</div>
    <div className="text-sm text-emerald-200 mb-2">{data.description}</div>
    {data.options && ()
      <div className="text-xs text-emerald-300">
        {data.options.length} options available
      </div>
    )}
    <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-emerald-600" />
  </div>
);
const TransformNode = ({ data, selected }: { data: any, selected: boolean }) => (
  <div className={`bg-amber-900 border-2 rounded-xl p-4 min-w-[220px] transition-all duration-200 ${
  selected ? 'border-orange-500 shadow-orange-glow' : 'border-amber-600 hover:border-amber-500'
}`} style={{ boxShadow: selected ? professionalShadows.node.selected : professionalShadows.node.default }}>
    <Handle type="target" position={Position.Top} className="w-3 h-3 bg-amber-600" />
    <div className="font-semibold text-amber-100 mb-1">{data.label}</div>
    <div className="text-sm text-amber-200 mb-2">{data.description}</div>
    {data.options && ()
      <div className="text-xs text-amber-300">
        {data.options.length} options available
      </div>
    )}
    <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-amber-600" />
  </div>
);
const OutputNode = ({ data, selected }: { data: any, selected: boolean }) => (
  <div className={`bg-red-900 border-2 rounded-xl p-4 min-w-[200px] transition-all duration-200 ${
  selected ? 'border-orange-500 shadow-orange-glow' : 'border-red-600 hover:border-red-500'
}`} style={{ boxShadow: selected ? professionalShadows.node.selected : professionalShadows.node.default }}>
    <Handle type="target" position={Position.Top} className="w-3 h-3 bg-red-600" />
    <div className="font-semibold text-red-100 mb-1">{data.label}</div>
    <div className="text-sm text-red-200">{data.description}</div>
  </div>
);
const nodeTypes: NodeTypes = {,
  text: TextNode,
  logic: LogicNode,
  transform: TransformNode,
  output: OutputNode
};

// Create default nodes using the modular templates
const createDefaultNodes = (): Node => [;
  {
    id: "start-1",
    type: "text",
    position: { x: 200, y: 100 },
    data: {
  label: "Tech Panel Generator",
  description: "Anachronistic Tech Panel Generator - Creates retro-futuristic interface prompts",
  category: "content"
}
  // Use the imported templates
  panelArchetypeTemplate,
  aestheticInfluenceTemplate,
  {
    id: "faction-4",
    type: "logic",
    position: { x: 800, y: 50 },
    data: {
  label: "Faction Alignment",
  description: "Empire/Corporate, Rebel/Resistance, Civilian/Smuggler, etc.",
  category: "logic"
}
  wearLevelTemplate,
  colorPaletteTemplate,
  materialsTemplate,
  {
    id: "screen-8",
    type: "logic",
    position: { x: 200, y: 250 },
    data: {
  label: "Screen Type",
  description: "CRT, LED Matrix, Hologram, etc.",
  category: "logic"
}
  {
    id: "final-9",
    type: "output",
    position: { x: 1000, y: 200 },
    data: {
  label: "Final Prompt",
      description: "Generated tech panel description",
      category: "output"];
const defaultEdges: Edge = [
  { id: 'e1-2', source: 'start-1', target: 'archetype-2' },
  { id: 'e2-3', source: 'archetype-2', target: 'aesthetic-3' },
  { id: 'e3-4', source: 'aesthetic-3', target: 'faction-4' },
  { id: 'e4-5', source: 'faction-4', target: 'wear-5' },
  { id: 'e5-6', source: 'wear-5', target: 'colors-6' },
  { id: 'e6-7', source: 'colors-6', target: 'materials-7' },
  { id: 'e7-8', source: 'materials-7', target: 'screen-8' },
  { id: 'e8-9', source: 'screen-8', target: 'final-9' }];

// Professional control panel component
const ProfessionalControlPanel = ({ onRun }: { onRun: () => void }) => (
  <div className="absolute top-4 left-4 bg-slate-900 border border-slate-700 rounded-xl p-4 shadow-xl z-10">
    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
        <span className="text-slate-300 text-sm font-medium">Ready</span>
      </div>
      <button
        onClick={onRun}
        className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors"
      >
        ▶️ Run
      </button>
    </div>
  </div>
);

// Main component
interface EnhancedGraphEditorProps {
  }

className?: string;
  showTemplateSelector?: boolean;
}

const EnhancedGraphEditor: React.FC<EnhancedGraphEditorProps> = ({
  className = "",
  showTemplateSelector = false
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(createDefaultNodes());
  const [edges, setEdges, onEdgesChange] = useEdgesState(defaultEdges);
  const [isRunning, setIsRunning] = useState(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { getIntersectingNodes } = useReactFlow();
  const { createNode } = useNodeFactory();
  const onConnect = useCallback(() => {});
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );
  const onRun = useCallback(() => {
    setIsRunning(true);
    console.log('Running graph execution...');
    // Simulate graph execution
    setTimeout(() => {
      setIsRunning(false);
      console.log('Graph execution completed');
    }, 2000);
  }, []);
  const onTemplateLoad = useCallback((template: any) => {
    if (template.nodes && template.edges) {
      setNodes(template.nodes);
      setEdges(template.edges);
  }, [setNodes, setEdges]);
  const onAddNode = useCallback((nodeTemplate: any) => {
    const newNode = createNode(nodeTemplate.id, {
  position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 }
    });
    if (newNode) {
      setNodes((nds) => [...nds, newNode]);
  }, [createNode, setNodes]);
  return;
    <div className={`w-full h-screen bg-slate-950 ${className}`}>}
      <div className="flex h-full">
        {/* Template Selector Panel */}
        {showTemplateSelector && ()
          <div className="w-80 bg-slate-900 border-r border-slate-700 p-4 overflow-y-auto">
            <TemplateSelector
              onTemplateSelect={onTemplateLoad}
              onNodeTemplateSelect={onAddNode}
            />
          </div>
        )}
        {/* Main Graph Editor */}
        <div className="flex-1 relative" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="top-right"
            style={{
  backgroundColor: professionalColors.background.primary
}}
          >
            <Controls />
            <MiniMap />
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
          </ReactFlow>
          <ProfessionalControlPanel onRun={onRun} />
          {/* Template selector toggle */}
          {!showTemplateSelector && ()
            <button
              onClick={() => {
                // This would be handled by parent component state
                console.log('Toggle template selector');
              }}
              className="absolute top-4 right-4 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors"
            >
              Templates
            </button>
          )}
        </div>
      </div>
      {/* Running indicator */}
      {isRunning && ()
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <div className="text-slate-200">Executing graph...</div>
          </div>
        </div>
      )}
    </div>
  );
};

// Wrapper component with ReactFlowProvider
const EnhancedGraphEditorWithProviders: React.FC<EnhancedGraphEditorProps> = (props) => {
  return;
    <ReactFlowProvider>
      <EnhancedGraphEditor {...props} />
    </ReactFlowProvider>
  );
};

export default EnhancedGraphEditorWithProviders;