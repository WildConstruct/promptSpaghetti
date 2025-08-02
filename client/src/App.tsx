import React, { useCallback, lazy, Suspense } from 'react';
import ReactFlow, { 
  Node, 
  Edge, 
  Controls, 
  Background,
  ReactFlowProvider,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  NodeProps
} from 'reactflow';
import 'reactflow/dist/style.css';
import './App.css';

// Import the Epic1GraphEditor and its provider
import { Epic1GraphEditorWithProvider } from '@promptscape/core/components/epic1/Epic1GraphEditor';

// Custom node with better styling and draggability
const CustomNode = ({ data }: NodeProps) => {
  return (
    <div style={{
      background: '#ffffff',
      border: '2px solid #4a5568',
      borderRadius: '8px',
      padding: '16px 24px',
      fontSize: '16px',
      fontWeight: '500',
      color: '#1a202c',
      minWidth: '180px',
      textAlign: 'center',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      cursor: 'grab'
    }}>
      <Handle 
        type="target" 
        position={Position.Top}
        style={{
          background: '#4a5568',
          width: '12px',
          height: '12px',
          border: '2px solid #ffffff'
        }}
      />
      <div>{data.label}</div>
      <Handle 
        type="source" 
        position={Position.Bottom}
        style={{
          background: '#4a5568',
          width: '12px',
          height: '12px',
          border: '2px solid #ffffff'
        }}
      />
    </div>
  );
};

// Simple TextBlock node for testing
const SimpleTextBlockNode = ({ data }: NodeProps) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [text, setText] = React.useState(data.content || '');

  return (
    <div style={{
      background: '#f7fafc',
      border: '2px solid #cbd5e0',
      borderRadius: '8px',
      padding: '12px',
      minWidth: '200px',
      minHeight: '80px',
      cursor: 'pointer'
    }}
    onDoubleClick={() => setIsEditing(true)}
    >
      <Handle 
        type="target" 
        position={Position.Top}
        style={{
          background: '#4a5568',
          width: '12px',
          height: '12px',
          border: '2px solid #ffffff'
        }}
      />
      {isEditing ? (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => setIsEditing(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              setIsEditing(false);
            }
          }}
          style={{
            width: '100%',
            minHeight: '60px',
            border: 'none',
            outline: 'none',
            background: 'transparent',
            resize: 'none',
            fontSize: '14px',
            fontFamily: 'inherit'
          }}
          autoFocus
        />
      ) : (
        <div style={{ whiteSpace: 'pre-wrap' }}>
          {text || 'Double-click to edit...'}
        </div>
      )}
      <Handle 
        type="source" 
        position={Position.Bottom}
        style={{
          background: '#4a5568',
          width: '12px',
          height: '12px',
          border: '2px solid #ffffff'
        }}
      />
    </div>
  );
};

// WeightedChoice node
const SimpleWeightedChoiceNode = ({ data }: NodeProps) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [options, setOptions] = React.useState(data.options || [
    { text: 'Option 1', weight: 50 },
    { text: 'Option 2', weight: 50 }
  ]);

  return (
    <div style={{
      background: '#fff5f5',
      border: '2px solid #feb2b2',
      borderRadius: '8px',
      padding: '12px',
      minWidth: '240px',
      cursor: 'pointer'
    }}
    onDoubleClick={() => setIsEditing(true)}
    >
      <Handle 
        type="target" 
        position={Position.Top}
        style={{
          background: '#e53e3e',
          width: '12px',
          height: '12px',
          border: '2px solid #ffffff'
        }}
      />
      <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#c53030' }}>
        ⚖️ Weighted Choice
      </div>
      {options.map((opt, idx) => (
        <div key={idx} style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          padding: '4px 0',
          fontSize: '14px'
        }}>
          <span>{opt.text}</span>
          <span style={{ color: '#718096' }}>{opt.weight}%</span>
        </div>
      ))}
      <Handle 
        type="source" 
        position={Position.Bottom}
        style={{
          background: '#e53e3e',
          width: '12px',
          height: '12px',
          border: '2px solid #ffffff'
        }}
      />
    </div>
  );
};

// Output node
const SimpleOutputNode = ({ data }: NodeProps) => {
  return (
    <div style={{
      background: '#f0fff4',
      border: '2px solid #9ae6b4',
      borderRadius: '8px',
      padding: '12px',
      minWidth: '180px',
      textAlign: 'center'
    }}>
      <Handle 
        type="target" 
        position={Position.Top}
        style={{
          background: '#48bb78',
          width: '12px',
          height: '12px',
          border: '2px solid #ffffff'
        }}
      />
      <div style={{ fontWeight: 'bold', color: '#276749' }}>
        🎯 Output
      </div>
      <div style={{ fontSize: '14px', marginTop: '4px', color: '#2f855a' }}>
        {data.outputName || 'main'}
      </div>
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
  textBlock: SimpleTextBlockNode,
  weightedChoice: SimpleWeightedChoiceNode,
  output: SimpleOutputNode,
};

// Test nodes with better positioning - Epic 1 MVP demo
const initialNodes: Node[] = [
  {
    id: '1',
    type: 'textBlock',
    position: { x: 100, y: 100 },
    data: { 
      content: 'Generate a name for a medieval character' 
    },
  },
  {
    id: '2',
    type: 'weightedChoice',
    position: { x: 100, y: 250 },
    data: { 
      options: [
        { text: 'Sir Galahad', weight: 30 },
        { text: 'Lady Eleanor', weight: 30 },
        { text: 'Lord Blackwood', weight: 40 }
      ]
    },
  },
  {
    id: '3',
    type: 'textBlock',
    position: { x: 400, y: 250 },
    data: { 
      content: 'the Brave' 
    },
  },
  {
    id: '4',
    type: 'output',
    position: { x: 250, y: 400 },
    data: { outputName: 'character_name' },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e2-4', source: '2', target: '4', animated: true },
  { id: 'e3-4', source: '3', target: '4', animated: true },
];

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [showPreview, setShowPreview] = React.useState(false);
  const [previewResults, setPreviewResults] = React.useState<string[]>([]);
  const [useRealEditor, setUseRealEditor] = React.useState(false);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const executeGraph = () => {
    // Simple mock execution for demo
    const results = [
      'Sir Galahad the Brave',
      'Lady Eleanor the Brave',
      'Lord Blackwood the Brave',
      'Sir Galahad the Brave',
      'Lord Blackwood the Brave'
    ];
    setPreviewResults(results);
    setShowPreview(true);
  };

  console.log('App component rendering with Epic 1 MVP nodes...');
  
  // Try to render the real Epic1GraphEditor
  if (useRealEditor) {
    return (
      <div className="App" style={{ width: '100vw', height: '100vh' }}>
        <button
          onClick={() => setUseRealEditor(false)}
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            zIndex: 1000,
            padding: '10px 20px',
            background: '#e53e3e',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          Back to Simple Version
        </button>
        <Epic1GraphEditorWithProvider 
          showPreview={true}
          showAssetLibrary={true}
        />
      </div>
    );
  }
  
  return (
    <div className="App" style={{ width: '100vw', height: '100vh', display: 'flex' }}>
      <ReactFlowProvider>
        <div style={{ flex: 1, position: 'relative' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-right"
          >
            <Background color="#aaa" gap={16} />
            <Controls />
          </ReactFlow>
          
          {/* Execute button */}
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            display: 'flex',
            gap: '10px'
          }}>
            <button
              onClick={executeGraph}
              style={{
                padding: '10px 20px',
                background: '#4a9eff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              ▶️ Execute
            </button>
            <button
              onClick={() => setShowPreview(!showPreview)}
              style={{
                padding: '10px 20px',
                background: showPreview ? '#48bb78' : '#718096',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              👁️ Preview
            </button>
            <button
              onClick={() => setUseRealEditor(true)}
              style={{
                padding: '10px 20px',
                background: '#805ad5',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              🚀 Load Real Editor
            </button>
          </div>
        </div>
        
        {/* Preview panel */}
        {showPreview && (
          <div style={{
            width: '300px',
            background: '#f7fafc',
            borderLeft: '1px solid #e2e8f0',
            padding: '20px',
            overflowY: 'auto'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Preview Results</h3>
            {previewResults.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {previewResults.map((result, idx) => (
                  <div key={idx} style={{
                    background: 'white',
                    padding: '12px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    fontSize: '14px'
                  }}>
                    {result}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#718096' }}>Click Execute to see results</p>
            )}
          </div>
        )}
      </ReactFlowProvider>
    </div>
  );
}

export default App;