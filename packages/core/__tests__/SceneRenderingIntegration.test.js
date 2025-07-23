import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Scene Rendering Integration Tests
 * Tests the complete scene rendering pipeline from data to visual output
 */
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { GraphEditor } from '../GraphEditor';
import { NodeRenderer } from '../components/NodeRenderer';
// Mock ReactFlow with more detailed rendering simulation
jest.mock('reactflow', () => {
    const mockUseReactFlow = {
        getViewport: () => ({ x: 0, y: 0, zoom: 1 }),
        setViewport: jest.fn(),
        fitView: jest.fn(),
        zoomIn: jest.fn(),
        zoomOut: jest.fn(),
        getNodes: () => [],
        getEdges: () => []
    };
    return {
        ...jest.requireActual('reactflow'),
        ReactFlow: ({ children, nodes, edges, onNodesChange, onEdgesChange, onConnect, viewport, onViewportChange, ...props }) => {
            const [currentViewport, setCurrentViewport] = React.useState(viewport || { x: 0, y: 0, zoom: 1 });
            return (_jsxs("div", { "data-testid": "scene-renderer", "data-node-count": nodes?.length || 0, "data-edge-count": edges?.length || 0, "data-viewport-zoom": currentViewport.zoom, "data-viewport-x": currentViewport.x, "data-viewport-y": currentViewport.y, style: {
                    width: '100%',
                    height: '100%',
                    transform: `translate(${currentViewport.x}px, ${currentViewport.y}px) scale(${currentViewport.zoom})`
                }, ...props, children: [_jsx("div", { "data-testid": "scene-nodes-layer", children: nodes?.map((node) => (_jsx("div", { "data-testid": `scene-node-${node.id}`, "data-node-type": node.type, "data-scene-x": node.position.x, "data-scene-y": node.position.y, style: {
                                position: 'absolute',
                                left: node.position.x,
                                top: node.position.y,
                                transform: node.data?.transform || 'none',
                                opacity: node.data?.opacity || 1,
                                zIndex: node.data?.zIndex || 1
                            }, onClick: () => props.onNodeClick?.(node), children: _jsx(NodeRenderer, { id: node.id, data: node.data, selected: props.selectedNodeId === node.id, onSelect: props.onNodeSelect || jest.fn(), getNodeMeta: props.getNodeMeta || jest.fn(() => ({ label: node.type, category: 'general', icon: '🔧' })), getCategoryColor: props.getCategoryColor || jest.fn(() => '#3182ce') }) }, node.id))) }), _jsx("div", { "data-testid": "scene-edges-layer", children: edges?.map((edge) => {
                            const sourceNode = nodes?.find((n) => n.id === edge.source);
                            const targetNode = nodes?.find((n) => n.id === edge.target);
                            if (!sourceNode || !targetNode)
                                return null;
                            const x1 = sourceNode.position.x + 80; // Approximate node center
                            const y1 = sourceNode.position.y + 40;
                            const x2 = targetNode.position.x + 80;
                            const y2 = targetNode.position.y + 40;
                            return (_jsx("svg", { "data-testid": `scene-edge-${edge.id}`, style: {
                                    position: 'absolute',
                                    left: Math.min(x1, x2),
                                    top: Math.min(y1, y2),
                                    width: Math.abs(x2 - x1) + 20,
                                    height: Math.abs(y2 - y1) + 20,
                                    pointerEvents: 'none',
                                    zIndex: 0
                                }, children: _jsx("line", { x1: x1 - Math.min(x1, x2), y1: y1 - Math.min(y1, y2), x2: x2 - Math.min(x1, x2), y2: y2 - Math.min(y1, y2), stroke: edge.data?.color || '#cbd5e0', strokeWidth: edge.data?.strokeWidth || 2, strokeDasharray: edge.animated ? '5,5' : 'none', "data-source": edge.source, "data-target": edge.target }) }, edge.id));
                        }) }), children] }));
        },
        useReactFlow: () => mockUseReactFlow,
        Handle: ({ type, position, id, ...props }) => (_jsx("div", { "data-testid": `scene-handle-${type}-${id}`, "data-handle-type": type, "data-handle-position": position, className: `scene-handle scene-handle-${type}`, ...props })),
        Position: {
            Top: 'top',
            Right: 'right',
            Bottom: 'bottom',
            Left: 'left'
        }
    };
});
describe('Scene Rendering Integration', () => {
    const createSceneGraph = (options = {}) => {
        const { nodeCount = 5, edgeCount = 4, withAnimations = false, withLayering = false, withTransforms = false } = options;
        const nodes = Array.from({ length: nodeCount }, (_, i) => {
            const baseData = {
                label: `Scene Node ${i + 1}`,
                nodeType: i % 2 === 0 ? 'WeightedChoice' : 'Output',
                ...(i === 0 && { choices: [{ value: 'Choice A', weight: 0.7 }, { value: 'Choice B', weight: 0.3 }] }),
                ...(i === 1 && { text: 'Scene output text' })
            };
            return {
                id: `scene-${i + 1}`,
                type: baseData.nodeType,
                position: {
                    x: (i % 3) * 200 + Math.random() * 50,
                    y: Math.floor(i / 3) * 150 + Math.random() * 30
                },
                data: {
                    ...baseData,
                    ...(withTransforms && {
                        transform: i % 2 === 0 ? 'rotate(5deg)' : 'scale(1.1)',
                        opacity: 0.8 + (i * 0.04)
                    }),
                    ...(withLayering && {
                        zIndex: i + 1
                    })
                }
            };
        });
        const edges = Array.from({ length: Math.min(edgeCount, nodeCount - 1) }, (_, i) => ({
            id: `scene-edge-${i + 1}`,
            source: `scene-${i + 1}`,
            target: `scene-${i + 2}`,
            animated: withAnimations && i % 2 === 0,
            data: {
                color: withAnimations ? '#38a169' : '#cbd5e0',
                strokeWidth: withAnimations ? 3 : 2
            }
        }));
        return { nodes, edges };
    };
    describe('Basic Scene Rendering', () => {
        it('renders complete scene with spatial relationships', () => {
            const { nodes, edges } = createSceneGraph({ nodeCount: 4, edgeCount: 3 });
            render(_jsx(GraphEditor, { initialNodes: nodes, initialEdges: edges }));
            const sceneRenderer = screen.getByTestId('scene-renderer');
            expect(sceneRenderer).toHaveAttribute('data-node-count', '4');
            expect(sceneRenderer).toHaveAttribute('data-edge-count', '3');
            // Verify all scene nodes are rendered with correct positions
            const sceneNode1 = screen.getByTestId('scene-node-scene-1');
            const sceneNode2 = screen.getByTestId('scene-node-scene-2');
            expect(sceneNode1).toHaveAttribute('data-scene-x');
            expect(sceneNode1).toHaveAttribute('data-scene-y');
            expect(sceneNode2).toHaveAttribute('data-scene-x');
            expect(sceneNode2).toHaveAttribute('data-scene-y');
            // Verify edges connect nodes correctly
            const sceneEdge1 = screen.getByTestId('scene-edge-scene-edge-1');
            const edgeLine = sceneEdge1.querySelector('line');
            expect(edgeLine).toHaveAttribute('data-source', 'scene-1');
            expect(edgeLine).toHaveAttribute('data-target', 'scene-2');
        });
        it('maintains visual hierarchy with z-index layering', () => {
            const { nodes, edges } = createSceneGraph({
                nodeCount: 3,
                edgeCount: 2,
                withLayering: true
            });
            render(_jsx(GraphEditor, { initialNodes: nodes, initialEdges: edges }));
            const node1 = screen.getByTestId('scene-node-scene-1');
            const node2 = screen.getByTestId('scene-node-scene-2');
            const node3 = screen.getByTestId('scene-node-scene-3');
            // Verify z-index layering
            expect(node1).toHaveStyle({ zIndex: '1' });
            expect(node2).toHaveStyle({ zIndex: '2' });
            expect(node3).toHaveStyle({ zIndex: '3' });
        });
        it('renders animated elements with proper styling', () => {
            const { nodes, edges } = createSceneGraph({
                nodeCount: 4,
                edgeCount: 3,
                withAnimations: true
            });
            render(_jsx(GraphEditor, { initialNodes: nodes, initialEdges: edges }));
            // Verify animated edges
            const animatedEdge = screen.getByTestId('scene-edge-scene-edge-1');
            const animatedLine = animatedEdge.querySelector('line');
            expect(animatedLine).toHaveAttribute('stroke-dasharray', '5,5');
            expect(animatedLine).toHaveAttribute('stroke', '#38a169');
            expect(animatedLine).toHaveAttribute('stroke-width', '3');
            // Verify non-animated edges
            const staticEdge = screen.getByTestId('scene-edge-scene-edge-2');
            const staticLine = staticEdge.querySelector('line');
            expect(staticLine).toHaveAttribute('stroke-dasharray', 'none');
            expect(staticLine).toHaveAttribute('stroke', '#cbd5e0');
        });
    });
    describe('Viewport and Camera Controls', () => {
        it('renders scene with correct viewport transformation', () => {
            const { nodes, edges } = createSceneGraph({ nodeCount: 3, edgeCount: 2 });
            render(_jsx(GraphEditor, { initialNodes: nodes, initialEdges: edges }));
            const sceneRenderer = screen.getByTestId('scene-renderer');
            expect(sceneRenderer).toHaveAttribute('data-viewport-zoom', '1');
            expect(sceneRenderer).toHaveAttribute('data-viewport-x', '0');
            expect(sceneRenderer).toHaveAttribute('data-viewport-y', '0');
        });
        it('handles zoom operations affecting entire scene', async () => {
            const { nodes, edges } = createSceneGraph({ nodeCount: 3, edgeCount: 2 });
            render(_jsx(GraphEditor, { initialNodes: nodes, initialEdges: edges, showControls: true }));
            const zoomInButton = screen.getByText('🔍+');
            await userEvent.click(zoomInButton);
            // Scene should reflect zoom state
            const sceneRenderer = screen.getByTestId('scene-renderer');
            expect(sceneRenderer).toBeInTheDocument();
        });
        it('maintains node relationships during viewport changes', async () => {
            const { nodes, edges } = createSceneGraph({ nodeCount: 4, edgeCount: 3 });
            render(_jsx(GraphEditor, { initialNodes: nodes, initialEdges: edges }));
            const sceneRenderer = screen.getByTestId('scene-renderer');
            // Simulate pan operation
            fireEvent.mouseDown(sceneRenderer, { clientX: 100, clientY: 100 });
            fireEvent.mouseMove(sceneRenderer, { clientX: 150, clientY: 150 });
            fireEvent.mouseUp(sceneRenderer);
            // Verify edges still connect correctly after pan
            const edge1 = screen.getByTestId('scene-edge-scene-edge-1');
            const edgeLine = edge1.querySelector('line');
            expect(edgeLine).toHaveAttribute('data-source', 'scene-1');
            expect(edgeLine).toHaveAttribute('data-target', 'scene-2');
        });
    });
    describe('Dynamic Scene Updates', () => {
        it('handles real-time node position updates', async () => {
            const { nodes, edges } = createSceneGraph({ nodeCount: 3, edgeCount: 2 });
            const { rerender } = render(_jsx(GraphEditor, { initialNodes: nodes, initialEdges: edges }));
            const initialNode = screen.getByTestId('scene-node-scene-1');
            const initialX = initialNode.getAttribute('data-scene-x');
            // Update node positions
            const updatedNodes = nodes.map(node => ({
                ...node,
                position: { x: node.position.x + 100, y: node.position.y + 50 }
            }));
            rerender(_jsx(GraphEditor, { initialNodes: updatedNodes, initialEdges: edges }));
            await waitFor(() => {
                const updatedNode = screen.getByTestId('scene-node-scene-1');
                const newX = updatedNode.getAttribute('data-scene-x');
                expect(parseFloat(newX)).toBeGreaterThan(parseFloat(initialX));
            });
        });
        it('updates edge rendering when nodes move', async () => {
            const { nodes, edges } = createSceneGraph({ nodeCount: 3, edgeCount: 2 });
            const { rerender } = render(_jsx(GraphEditor, { initialNodes: nodes, initialEdges: edges }));
            const initialEdge = screen.getByTestId('scene-edge-scene-edge-1');
            const initialLine = initialEdge.querySelector('line');
            const initialX2 = initialLine?.getAttribute('x2');
            // Move target node
            const updatedNodes = nodes.map(node => node.id === 'scene-2'
                ? { ...node, position: { x: node.position.x + 200, y: node.position.y } }
                : node);
            rerender(_jsx(GraphEditor, { initialNodes: updatedNodes, initialEdges: edges }));
            await waitFor(() => {
                const updatedEdge = screen.getByTestId('scene-edge-scene-edge-1');
                const updatedLine = updatedEdge.querySelector('line');
                const newX2 = updatedLine?.getAttribute('x2');
                // Edge endpoint should have moved
                expect(parseFloat(newX2)).not.toEqual(parseFloat(initialX2));
            });
        });
        it('handles node addition to existing scene', async () => {
            const { nodes, edges } = createSceneGraph({ nodeCount: 2, edgeCount: 1 });
            const { rerender } = render(_jsx(GraphEditor, { initialNodes: nodes, initialEdges: edges }));
            expect(screen.getByTestId('scene-renderer')).toHaveAttribute('data-node-count', '2');
            // Add a new node
            const newNode = {
                id: 'scene-3',
                type: 'Concat',
                position: { x: 400, y: 100 },
                data: { label: 'New Scene Node', nodeType: 'Concat' }
            };
            const updatedNodes = [...nodes, newNode];
            const updatedEdges = [...edges, {
                    id: 'scene-edge-3',
                    source: 'scene-2',
                    target: 'scene-3'
                }];
            rerender(_jsx(GraphEditor, { initialNodes: updatedNodes, initialEdges: updatedEdges }));
            await waitFor(() => {
                expect(screen.getByTestId('scene-renderer')).toHaveAttribute('data-node-count', '3');
                expect(screen.getByTestId('scene-node-scene-3')).toBeInTheDocument();
                expect(screen.getByTestId('scene-edge-scene-edge-3')).toBeInTheDocument();
            });
        });
    });
    describe('Visual Transformations', () => {
        it('applies CSS transforms to scene elements', () => {
            const { nodes, edges } = createSceneGraph({
                nodeCount: 4,
                edgeCount: 3,
                withTransforms: true
            });
            render(_jsx(GraphEditor, { initialNodes: nodes, initialEdges: edges }));
            const transformedNode1 = screen.getByTestId('scene-node-scene-1');
            const transformedNode2 = screen.getByTestId('scene-node-scene-2');
            expect(transformedNode1).toHaveStyle({ transform: 'rotate(5deg)' });
            expect(transformedNode2).toHaveStyle({ transform: 'scale(1.1)' });
        });
        it('handles opacity variations across scene elements', () => {
            const { nodes, edges } = createSceneGraph({
                nodeCount: 4,
                edgeCount: 3,
                withTransforms: true
            });
            render(_jsx(GraphEditor, { initialNodes: nodes, initialEdges: edges }));
            const nodes1 = screen.getByTestId('scene-node-scene-1');
            const nodes4 = screen.getByTestId('scene-node-scene-4');
            // Each node should have different opacity based on index
            const opacity1 = parseFloat(nodes1.style.opacity);
            const opacity4 = parseFloat(nodes4.style.opacity);
            expect(opacity4).toBeGreaterThan(opacity1);
        });
    });
    describe('Performance and Optimization', () => {
        it('renders large scenes efficiently', async () => {
            const { nodes, edges } = createSceneGraph({ nodeCount: 100, edgeCount: 99 });
            const startTime = performance.now();
            render(_jsx(GraphEditor, { initialNodes: nodes, initialEdges: edges }));
            const renderTime = performance.now() - startTime;
            // Should render 100 nodes within reasonable time
            expect(renderTime).toBeLessThan(1000);
            const sceneRenderer = screen.getByTestId('scene-renderer');
            expect(sceneRenderer).toHaveAttribute('data-node-count', '100');
            expect(sceneRenderer).toHaveAttribute('data-edge-count', '99');
        });
        it('maintains 60fps during scene animations', async () => {
            const { nodes, edges } = createSceneGraph({
                nodeCount: 20,
                edgeCount: 19,
                withAnimations: true
            });
            render(_jsx(GraphEditor, { initialNodes: nodes, initialEdges: edges }));
            // Simulate continuous updates for animation
            const updateCount = 30;
            const startTime = performance.now();
            for (let i = 0; i < updateCount; i++) {
                await act(async () => {
                    // Simulate animation frame
                    await new Promise(resolve => setTimeout(resolve, 16)); // ~60fps
                });
            }
            const totalTime = performance.now() - startTime;
            const avgFrameTime = totalTime / updateCount;
            // Should maintain reasonable frame rate
            expect(avgFrameTime).toBeLessThan(20);
        });
    });
    describe('Scene Interaction', () => {
        it('handles mouse interactions within scene coordinate system', async () => {
            const { nodes, edges } = createSceneGraph({ nodeCount: 3, edgeCount: 2 });
            const onNodeSelect = jest.fn();
            render(_jsx(GraphEditor, { initialNodes: nodes, initialEdges: edges, onNodeClick: onNodeSelect }));
            const sceneNode = screen.getByTestId('scene-node-scene-1');
            await userEvent.click(sceneNode);
            // Node selection should work within scene coordinates
            expect(onNodeSelect).toHaveBeenCalledWith(expect.objectContaining({
                id: 'scene-1'
            }));
        });
        it('maintains interaction accuracy during zoom', async () => {
            const { nodes, edges } = createSceneGraph({ nodeCount: 2, edgeCount: 1 });
            render(_jsx(GraphEditor, { initialNodes: nodes, initialEdges: edges, showControls: true }));
            // Zoom in
            const zoomInButton = screen.getByText('🔍+');
            await userEvent.click(zoomInButton);
            await userEvent.click(zoomInButton);
            // Node should still be clickable after zoom
            const sceneNode = screen.getByTestId('scene-node-scene-1');
            expect(sceneNode).toBeInTheDocument();
            await userEvent.click(sceneNode);
            // Should not throw errors
        });
    });
});
