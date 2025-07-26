import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { action } from '@storybook/addon-actions';
import { useState } from 'react';
import { GraphCanvas } from './GraphCanvas';
// Sample graph data for stories
const simpleGraph = {
    nodes: [
        {
            id: 'node1',
            type: 'WeightedChoice',
            data: { choices: [{ value: 'Option A', weight: 0.7 }, { value: 'Option B', weight: 0.3 }] },
            position: { x: 100, y: 100 }
        },
        {
            id: 'node2',
            type: 'Output',
            data: { text: 'Hello {{node1}}!' },
            position: { x: 400, y: 100 }
        }
    ],
    edges: [
        {
            id: 'edge1',
            source: 'node1',
            target: 'node2'
        }
    ]
};
const complexGraph = {
    nodes: [
        {
            id: 'start',
            type: 'WeightedChoice',
            data: { choices: [{ value: 'Morning', weight: 0.5 }, { value: 'Evening', weight: 0.5 }] },
            position: { x: 50, y: 100 }
        },
        {
            id: 'greeting',
            type: 'Concat',
            data: { template: 'Good {{start}}, ' },
            position: { x: 300, y: 50 }
        },
        {
            id: 'name',
            type: 'Include',
            data: { name: 'userName' },
            position: { x: 300, y: 150 }
        },
        {
            id: 'output',
            type: 'Output',
            data: { text: '{{greeting}}{{name}}!' },
            position: { x: 550, y: 100 }
        },
        {
            id: 'var1',
            type: 'SetVariable',
            data: { key: 'count', value: '1' },
            position: { x: 50, y: 250 }
        },
        {
            id: 'var2',
            type: 'GetVariable',
            data: { key: 'count' },
            position: { x: 300, y: 250 }
        }
    ],
    edges: [
        { id: 'e1', source: 'start', target: 'greeting' },
        { id: 'e2', source: 'start', target: 'name' },
        { id: 'e3', source: 'greeting', target: 'output' },
        { id: 'e4', source: 'name', target: 'output' },
        { id: 'e5', source: 'var1', target: 'var2' }
    ]
};
const meta = {
    title: 'Components/GraphCanvas',
    component: GraphCanvas,
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component: 'Interactive graph canvas for visualizing and editing node-based graphs. Supports drag-and-drop, zoom, pan, and node selection.'
            }
        }
    },
    tags: ['autodocs'],
    argTypes: {
        readOnly: {
            control: 'boolean',
            description: 'Disables editing capabilities'
        },
        showControls: {
            control: 'boolean',
            description: 'Shows zoom and navigation controls'
        },
        showMinimap: {
            control: 'boolean',
            description: 'Shows minimap for navigation'
        },
        fitView: {
            control: 'boolean',
            description: 'Automatically fits graph to view on load'
        },
        onNodeSelect: {
            action: 'node-selected',
            description: 'Called when a node is selected'
        },
        onNodeMove: {
            action: 'node-moved',
            description: 'Called when a node is moved'
        },
        onEdgeCreate: {
            action: 'edge-created',
            description: 'Called when an edge is created'
        },
        onEdgeDelete: {
            action: 'edge-deleted',
            description: 'Called when an edge is deleted'
        }
    },
    args: {
        onNodeSelect: action('node-selected'),
        onNodeMove: action('node-moved'),
        onEdgeCreate: action('edge-created'),
        onEdgeDelete: action('edge-deleted')
    }
};
export default meta;
export const Default = {
    args: {
        graph: simpleGraph
    },
    parameters: {
        docs: {
            description: {
                story: 'Basic graph canvas with two connected nodes'
            }
        }
    }
};
export const ComplexGraph = {
    args: {
        graph: complexGraph,
        fitView: true
    },
    parameters: {
        docs: {
            description: {
                story: 'More complex graph with multiple node types and connections'
            }
        }
    }
};
export const ReadOnly = {
    args: {
        graph: complexGraph,
        readOnly: true,
        fitView: true
    },
    parameters: {
        docs: {
            description: {
                story: 'Read-only mode disables editing and hides connection handles'
            }
        }
    }
};
export const WithControls = {
    args: {
        graph: complexGraph,
        showControls: true,
        showMinimap: true,
        fitView: true
    },
    parameters: {
        docs: {
            description: {
                story: 'Canvas with zoom controls and minimap enabled'
            }
        }
    }
};
export const Interactive = {
    render: () => {
        const [selectedNodeId, setSelectedNodeId] = useState(null);
        const [graph, setGraph] = useState(complexGraph);
        const handleNodeSelect = (node) => {
            setSelectedNodeId(node?.id || null);
        };
        const handleNodeMove = (nodeId, position) => {
            setGraph(prev => ({
                ...prev,
                nodes: prev.nodes.map(node => node.id === nodeId
                    ? { ...node, position }
                    : node)
            }));
        };
        const handleEdgeCreate = (edge) => {
            const newEdge = {
                id: `edge-${Date.now()}`,
                ...edge
            };
            setGraph(prev => ({
                ...prev,
                edges: [...prev.edges, newEdge]
            }));
        };
        const handleEdgeDelete = (edgeId) => {
            setGraph(prev => ({
                ...prev,
                edges: prev.edges.filter(edge => edge.id !== edgeId)
            }));
        };
        return (_jsxs("div", { style: { height: '600px' }, children: [_jsxs("div", { style: {
                        padding: '10px',
                        background: '#f5f5f5',
                        borderBottom: '1px solid #ddd',
                        fontSize: '14px'
                    }, children: ["Selected Node: ", selectedNodeId || 'None'] }), _jsx("div", { style: { height: 'calc(100% - 50px)' }, children: _jsx(GraphCanvas, { graph: graph, selectedNodeId: selectedNodeId, onNodeSelect: handleNodeSelect, onNodeMove: handleNodeMove, onEdgeCreate: handleEdgeCreate, onEdgeDelete: handleEdgeDelete, showControls: true, fitView: true }) })] }));
    },
    parameters: {
        docs: {
            description: {
                story: 'Fully interactive graph canvas with state management. Try selecting nodes, dragging them around, and creating connections!'
            }
        }
    }
};
export const EmptyCanvas = {
    args: {
        graph: { nodes: [], edges: [] },
        showControls: true
    },
    parameters: {
        docs: {
            description: {
                story: 'Empty canvas ready for new content'
            }
        }
    }
};
export const NodeTypes = {
    args: {
        graph: {
            nodes: [
                {
                    id: 'weighted',
                    type: 'WeightedChoice',
                    data: { choices: [{ value: 'A', weight: 1 }] },
                    position: { x: 50, y: 50 }
                },
                {
                    id: 'concat',
                    type: 'Concat',
                    data: { template: 'Hello {{name}}' },
                    position: { x: 250, y: 50 }
                },
                {
                    id: 'output',
                    type: 'Output',
                    data: { text: 'Final output' },
                    position: { x: 450, y: 50 }
                },
                {
                    id: 'include',
                    type: 'Include',
                    data: { name: 'reference' },
                    position: { x: 50, y: 150 }
                },
                {
                    id: 'setvar',
                    type: 'SetVariable',
                    data: { key: 'var', value: 'value' },
                    position: { x: 250, y: 150 }
                },
                {
                    id: 'getvar',
                    type: 'GetVariable',
                    data: { key: 'var' },
                    position: { x: 450, y: 150 }
                },
                {
                    id: 'advanced',
                    type: 'WeightedAdvanced',
                    data: {},
                    position: { x: 50, y: 250 }
                },
                {
                    id: 'conditional',
                    type: 'Conditional',
                    data: {},
                    position: { x: 250, y: 250 }
                },
                {
                    id: 'sequential',
                    type: 'Sequential',
                    data: {},
                    position: { x: 450, y: 250 }
                },
                {
                    id: 'markov',
                    type: 'Markov',
                    data: {},
                    position: { x: 350, y: 350 }
                }
            ],
            edges: []
        },
        fitView: true
    },
    parameters: {
        docs: {
            description: {
                story: 'Showcase of all available node types with their distinctive styling'
            }
        }
    }
};
export const MobileOptimized = {
    args: {
        graph: simpleGraph,
        showControls: true,
        fitView: true
    },
    parameters: {
        viewport: {
            defaultViewport: 'mobile'
        },
        docs: {
            description: {
                story: 'Graph canvas optimized for mobile devices with touch-friendly controls'
            }
        }
    }
};
//# sourceMappingURL=GraphCanvas.stories.js.map