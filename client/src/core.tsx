// Core components re-export for App.tsx compatibility
// This file bridges the gap between App.tsx and the actual core directory
import React from 'react';
// Import professional components from the core package (using exports)
import { ProfessionalIntegration } from '../../packages/core';
import type { Node, Edge } from 'reactflow';

// Professional GraphEditor that uses modular architecture
const ProfessionalGraphEditor: React.FC<{ initialNodes?: Node[]; initialEdges?: Edge[] }> = ({ )
  initialNodes = [], 
  initialEdges = [] 
}) => {
  return ()
    <ProfessionalIntegration
      nodes={initialNodes}
      edges={initialEdges}
      selectedNodes={[]}
      selectedEdges={[]}
      onNodesChange={() => {}}
      onEdgesChange={() => {}}
      onNodesSelect={() => {}}
      onEdgesSelect={() => {}}
      onNodeCreate={() => {}}
      onNodeDelete={() => {}}
      onExport={() => {}}
      onSave={() => {}}
      onLoad={() => {}}
      theme="cinema"
    />
  );
};

// Re-export the main components
export { ProfessionalGraphEditor as GraphEditor };
export { RandomizerPanel } from './core/RandomizerPanel';

// Also export the types that might be needed
export type { Node, Edge, Graph } from './core/index';