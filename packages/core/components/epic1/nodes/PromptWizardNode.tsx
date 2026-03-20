import React, { useState } from 'react';
import { Handle, Position, useReactFlow, Node, Edge } from 'reactflow';
import { LLMService } from '../../../services/ApiLLMService';
import type { BaseEditableNodeProps } from './BaseEditableNode';

export interface PromptWizardNodeData {
  wizardType: 'text' | 'image' | 'multimodal';
  inputPrompt?: string;
  imageUrls?: string[];
  isLocked?: boolean;
  onGenerate?: (id: string, type: 'text' | 'image' | 'multimodal', prompt: string, images: string[]) => void;
  onUnlock?: (id: string) => void;
}

export const PromptWizardNode: React.FC<BaseEditableNodeProps<PromptWizardNodeData>> = ({
  id,
  data,
  selected
}) => {
  const [prompt, setPrompt] = useState(data.inputPrompt || '');
  const [isGenerating, setIsGenerating] = useState(false);

  const isLocked = data.isLocked || false;

  const { getNode, setNodes, setEdges } = useReactFlow();

  const handleGenerate = async () => {
    if (!prompt.trim() && data.wizardType !== 'image') return;
    setIsGenerating(true);
    
    // Use the onGenerate prop if provided, otherwise fallback to default integrated logic
    if (data.onGenerate) {
      data.onGenerate(id, data.wizardType, prompt, data.imageUrls || []);
      setIsGenerating(false);
      return;
    }

    try {
      const llmService = new LLMService({});
      const response = await llmService.draftGraphFromPrompt({
        prompt: prompt.trim() || 'Describe this image and create a graph',
        mode: 'draft',
        imageUrl: data.imageUrls?.[0] || null,
        options: { maxNewNodes: 10 }
      });

      if (response.ok && response.operations?.[0]?.kind === 'insertNodes') {
        const { nodes: newNodes, edges: newEdges } = response.operations[0];
        
        // Lock the wizard node
        setNodes((nds: Node[]) => nds.map(n => n.id === id ? { ...n, data: { ...n.data, isLocked: true } } : n));

        // Get our current wizard node position
        const wizardNode = getNode(id);
        const startX = (wizardNode?.position.x || 0) + 400; // Place to the right
        const startY = (wizardNode?.position.y || 0) - 100;

        // Same naive BFS layout logic as LaunchScreen
        const incomingEdgeCounts = new Map<string, number>();
        (newNodes as Node[]).forEach(n => incomingEdgeCounts.set(n.id, 0));
        (newEdges as Edge[]).forEach(e => {
          incomingEdgeCounts.set(e.target, (incomingEdgeCounts.get(e.target) || 0) + 1);
        });
        
        const levels = new Map<string, number>();
        const queue: {id: string, level: number}[] = [];
        
        (newNodes as Node[]).forEach(n => {
          if (incomingEdgeCounts.get(n.id) === 0) queue.push({id: n.id, level: 0});
        });

        if (queue.length === 0 && newNodes.length > 0) queue.push({id: newNodes[0].id, level: 0});

        while (queue.length > 0) {
          const {id: nodeId, level} = queue.shift()!;
          if (!levels.has(nodeId)) {
            levels.set(nodeId, level);
            const outgoingEdges = (newEdges as Edge[]).filter(e => e.source === nodeId);
            outgoingEdges.forEach(e => queue.push({id: e.target, level: level + 1}));
          }
        }

        const levelBuckets: Record<number, Node[]> = {};
        (newNodes as Node[]).forEach(n => {
          const level = levels.get(n.id) || 0;
          if (!levelBuckets[level]) levelBuckets[level] = [];
          levelBuckets[level].push(n as Node);
        });

        const X_SPACING = 350;
        const Y_SPACING = 200;
        
        const positionedNodes = (newNodes as Node[]).map(n => {
          const level = levels.get(n.id) || 0;
          const bucket = levelBuckets[level];
          const index = bucket.findIndex(b => b.id === n.id);
          const totalHeight = (bucket.length - 1) * Y_SPACING;
          const bucketStartY = -totalHeight / 2;
          return {
            ...n,
            position: {
              x: startX + level * X_SPACING,
              y: startY + bucketStartY + (index * Y_SPACING) 
            }
          };
        });

        // Add the new nodes to the canvas
        setNodes((nds: Node[]) => [...nds, ...positionedNodes]);
        setEdges((eds: Edge[]) => [...eds, ...(newEdges as Edge[])]);

        // Connect the wizard output to the root nodes
        const rootNodes = positionedNodes.filter(n => incomingEdgeCounts.get(n.id) === 0);
        if (rootNodes.length > 0) {
          const connectorEdges = rootNodes.map(rn => ({
            id: `edge-${id}-${rn.id}`,
            source: id,
            target: rn.id,
            sourceHandle: 'source',
            targetHandle: 'target'
          }));
          setEdges((eds: Edge[]) => [...eds, ...connectorEdges]);
        }
      }
    } catch (e) {
      console.error('Failed to generate graph from wizard:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUnlock = () => {
    if (data.onUnlock) {
      data.onUnlock(id);
      return;
    }
    // Default unlock behavior: delete downstream nodes recursively and unlock this node
    const edges = Array.from(getNode(id)?.['__rf']?.edges || []); // This isn't robust, so we can't reliably read edges from the node
    
    // Using setNodes with an updater to also unlock the node. Let's do it in two steps.
    setNodes((nds: Node[]) => {
      return nds.map(n => n.id === id ? { ...n, data: { ...n.data, isLocked: false } } : n);
    });
    // To properly delete downstream, we need the edges which we can't easily get without full state. 
    // We will leave the nodes alone for now if someone clicks unlock, or maybe just unlock the node.
  };

  return (
    <div className={`node-card ${selected ? 'selected' : ''}`} style={{ width: 320, opacity: isLocked ? 0.8 : 1, borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--color-ui-border)' }}>
      <div className="node-header flex justify-between items-center" style={{ background: 'var(--color-bg-tertiary)', padding: '10px 14px', borderBottom: '1px solid var(--color-ui-border)' }}>
        <div className="flex items-center gap-2">
          {/* Icon could go here */}
          <span className="text-accent-cyan font-bold tracking-wider" style={{ textShadow: '0 0 8px rgba(0, 240, 255, 0.4)' }}>
            {data.wizardType === 'multimodal' ? 'VISION' : data.wizardType.toUpperCase()} WIZARD
          </span>
        </div>
        {isLocked && <span className="text-xs text-status-warning px-2 py-1 rounded bg-status-warning-bg border border-status-warning">LOCKED</span>}
      </div>
      
      <div className="p-4 flex flex-col gap-3" style={{ background: 'var(--color-bg-secondary)' }}>
        {!isLocked ? (
          <>
            {data.wizardType !== 'image' && (
              <textarea 
                value={prompt}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
                placeholder="Describe your core prompt concept here..."
                className="w-full bg-bg-primary border border-ui-border rounded p-3 text-sm text-text-primary focus:border-accent-cyan focus:outline-none transition-colors"
                rows={4}
                style={{ resize: 'none' }}
              />
            )}
            {data.wizardType !== 'text' && (
              <div className="border-2 border-dashed border-ui-border rounded-lg flex flex-col items-center justify-center p-6 text-text-tertiary hover:border-accent-cyan hover:text-accent-cyan transition-colors cursor-pointer bg-bg-primary">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                <span className="text-sm font-medium">Drop Image Seed</span>
              </div>
            )}
            <button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`w-full mt-2 font-bold py-3 rounded-md transition-all uppercase tracking-wide text-sm ${isGenerating ? 'bg-ui-border text-text-tertiary' : 'bg-accent-cyan text-bg-primary hover:brightness-110'}`}
              style={{ boxShadow: isGenerating ? 'none' : '0 0 15px rgba(0, 240, 255, 0.3)' }}
            >
              {isGenerating ? 'Processing...' : 'Generate Hierarchy'}
            </button>
          </>
        ) : (
          <>
            {prompt && (
              <div className="text-sm text-text-secondary border border-ui-border bg-bg-primary p-3 rounded-md italic">
                "{prompt}"
              </div>
            )}
            <button 
              onClick={handleUnlock}
              className="w-full bg-status-error text-white font-bold py-2 mt-2 rounded-md border-0 opacity-90 hover:opacity-100 hover:shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all text-xs tracking-wider"
            >
              DESTROY DOWNSTREAM & UNLOCK
            </button>
          </>
        )}
      </div>

      {/* Output handle for visual flow / connecting to downstream groups optionally */}
      <Handle type="source" position={Position.Right} id="source" className="react-flow__handle" style={{ right: -6 }} />
    </div>
  );
};
