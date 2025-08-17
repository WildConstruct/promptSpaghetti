/**
 * PSG File Format Parser
 * Handles .psg fragment files which have a different structure than .psglib
 */

import { z } from 'zod';

// PSG file schema for fragments
export const PSGNodeOptionSchema = z.object({
  text: z.string(),
  weight: z.number(),
  meta: z.record(z.any()).optional()
});

export const PSGNodeSchema = z.object({
  id: z.string(),
  type: z.string(),
  name: z.string().optional(),
  description: z.string().optional(),
  x: z.number(),
  y: z.number(),
  options: z.array(PSGNodeOptionSchema).optional(),
  template: z.string().optional(),
  value: z.any().optional(),
  data: z.record(z.any()).optional()
});

export const PSGEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string()
});

export const PSGRegionSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string().optional(),
  color_comment: z.string().optional(),
  nodes: z.array(z.string()),
  description: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  ports: z.array(z.object({
    id: z.string(),
    label: z.string(),
    type: z.string().optional(),
    direction: z.enum(['input', 'output']),
    position: z.number().optional(),
    color: z.string().optional()
  })).optional()
});

export const PSGFileSchema = z.object({
  version: z.string(),
  name: z.string(),
  description: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  nodes: z.array(PSGNodeSchema),
  edges: z.array(PSGEdgeSchema),
  regions: z.array(PSGRegionSchema).optional()
});

export type PSGFile = z.infer<typeof PSGFileSchema>;
export type PSGNode = z.infer<typeof PSGNodeSchema>;
export type PSGEdge = z.infer<typeof PSGEdgeSchema>;
export type PSGRegion = z.infer<typeof PSGRegionSchema>;

/**
 * Parse a PSG file (fragment format)
 */
export function parsePSG(content: string): PSGFile {
  try {
    const data = JSON.parse(content);
    const result = PSGFileSchema.safeParse(data);
    
    if (!result.success) {
      throw new Error(`Invalid PSG file: ${result.error.message}`);
    }
    
    return result.data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to parse PSG file');
  }
}

/**
 * Convert PSG format to PSGLib format for compatibility
 */
export function convertPSGToPSGLib(psg: PSGFile): any {
  console.log('Converting PSG to PSGLib:', psg);
  
  // Check if this is a fragment
  const isFragment = psg.metadata?.type === 'MULTI-ASPECT' || psg.regions?.length > 0;
  
  // Filter out Output nodes for fragments
  const nodesToImport = isFragment 
    ? psg.nodes.filter(n => n.type !== 'Output')
    : psg.nodes;
  
  console.log('Nodes to import:', nodesToImport);
  
  // Initialize the nodes array
  const graphNodes: any[] = [];
  
  // For fragments with regions, create an enhancedBoundingBox
  if (isFragment && psg.regions?.length > 0) {
    const region = psg.regions[0]; // Use the first region
    
    // Find the bounds of all nodes in the fragment (use original positions)
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    // WeightedChoice nodes in display mode are much smaller than edit mode
    const nodeWidth = 280; // Approximate width in display mode
    const nodeHeight = 180; // Approximate height in display mode
    
    nodesToImport.forEach(node => {
      const x = node.x || 0;
      const y = node.y || 0;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + nodeWidth);
      maxY = Math.max(maxY, y + nodeHeight);
    });
    
    // Add padding around the content
    const boxPadding = 40;
    const boxX = minX - boxPadding;
    const boxY = minY - boxPadding - 40; // Extra space for title
    const boxWidth = (maxX - minX) + (boxPadding * 2);
    const boxHeight = (maxY - minY) + (boxPadding * 2) + 40; // Extra for title
    
    // Create a bounding box that contains all the nodes
    const boundingBox = {
      id: `region-${region.id}`,
      type: 'enhancedBoundingBox',
      position: {
        x: boxX,
        y: boxY
      },
      data: {
        title: region.name || 'Fragment Group',
        description: region.description || psg.description || '',
        backgroundColor: '#1a202c',
        opacity: 0.1, // Slightly visible background
        borderColor: '#22d3ee',
        borderStyle: 'solid' as const,
        borderWidth: 2,
        locked: false,
        width: boxWidth,
        height: boxHeight,
        isCollapsed: false, // Start expanded
        // Define explicit ports for the bounding box (optional)
        ports: region.ports || []
      },
      style: {
        width: boxWidth,
        height: boxHeight,
        zIndex: -1 // Ensure it's behind other nodes
      },
      zIndex: -1 // Lower z-index to render behind
    };
    
    // Add the bounding box first
    graphNodes.push(boundingBox);
  }
  
  // Create the graph nodes using their original positions
  const contentNodes = nodesToImport.map((node) => {
    // Use the node registry to convert PSG type to React Flow type
    // This ensures consistent type mapping across the system
    let nodeType: string;
    try {
      // Try to import the registry dynamically to avoid circular dependencies
      const { convertNodeType } = require('../runtime/nodeRegistry');
      nodeType = convertNodeType(node.type, 'psg');
    } catch (e) {
      // Fallback to manual mapping if registry not available
      console.warn('Node registry not available, using fallback mapping');
      nodeType = node.type === 'WeightedChoice' ? 'weightedChoice' : 
                      node.type === 'Output' ? 'output' :
                      node.type === 'Concat' ? 'concat' :
                      node.type === 'TextBlock' ? 'textBlock' :
                      node.type === 'Variable' ? 'variable' :
                      node.type;
    }
    
    // Build proper data structure based on node type
    let nodeData: any = {
      nodeType,
      label: node.name || node.id
    };
    
    // Handle WeightedChoice nodes
    if (node.type === 'WeightedChoice') {
      // Convert options to the expected format
      if (node.options) {
        nodeData.options = node.options.map((opt: any, idx: number) => ({
          id: `option-${idx + 1}`,
          text: opt.text || '',
          weight: opt.weight || 1,
          hasBranch: false
        }));
        // Store the raw JSON for the editor
        nodeData.value = JSON.stringify(node.options, null, 2);
      }
    }
    
    // Use the original positions from the PSG file
    const result = {
      id: node.id,
      type: nodeType,
      position: {
        x: node.x || 100,
        y: node.y || 100
      },
      data: nodeData
    };
    
    console.log('Created node:', result);
    return result;
  });
  
  // Add content nodes after the bounding box
  graphNodes.push(...contentNodes);
  
  return {
    fileType: 'psglib',
    formatVersion: '1.0.0',
    metadata: {
      id: psg.name.toLowerCase().replace(/\s+/g, '-'),
      name: psg.name,
      description: psg.description || '',
      author: psg.metadata?.author || 'Unknown',
      version: psg.version,
      tags: psg.metadata?.tags || [],
      nodeTypes: Array.from(new Set(nodesToImport.map(n => n.type))),
      lastModified: new Date().toISOString(),
      license: 'MIT',
      usageStats: {
        timesUsed: 0,
        lastUsed: null,
        popularity: 0
      },
      isFragment,
      regions: psg.regions
    },
    graph: {
      nodes: graphNodes,
      edges: isFragment 
        ? // For fragments, filter out edges that connect to Output nodes we've removed
          psg.edges.filter(edge => {
            const sourceExists = nodesToImport.some(n => n.id === edge.source);
            const targetExists = nodesToImport.some(n => n.id === edge.target);
            return sourceExists && targetExists;
          }).map(edge => {
            // Find source and target nodes to determine their types
            const sourceNode = psg.nodes.find(n => n.id === edge.source);
            const targetNode = psg.nodes.find(n => n.id === edge.target);
            
            // Set handles based on node types
            let sourceHandle = null;
            let targetHandle = null;
            
            // Source handles
            if (sourceNode?.type === 'WeightedChoice') {
              sourceHandle = 'main'; // WeightedChoice outputs from 'main'
            } else if (sourceNode?.type === 'Output') {
              sourceHandle = 'output'; // Output nodes output from 'output'
            }
            
            // Target handles  
            if (targetNode?.type === 'Output') {
              targetHandle = 'target'; // Output nodes receive at 'target'
            } else if (targetNode?.type === 'WeightedChoice') {
              targetHandle = 'target'; // WeightedChoice receives at 'target'
            } else if (targetNode?.type === 'Concat') {
              targetHandle = 'target'; // Concat receives at 'target'
            }
            
            return {
              id: edge.id,
              source: edge.source,
              target: edge.target,
              sourceHandle,
              targetHandle
            };
          })
        : // For non-fragments, map all edges with proper handles
          psg.edges.map(edge => {
            // Find source and target nodes to determine their types
            const sourceNode = psg.nodes.find(n => n.id === edge.source);
            const targetNode = psg.nodes.find(n => n.id === edge.target);
            
            // Set handles based on node types
            let sourceHandle = null;
            let targetHandle = null;
            
            // Source handles
            if (sourceNode?.type === 'WeightedChoice') {
              sourceHandle = 'main'; // WeightedChoice outputs from 'main'
            } else if (sourceNode?.type === 'Output') {
              sourceHandle = 'output'; // Output nodes output from 'output'
            }
            
            // Target handles  
            if (targetNode?.type === 'Output') {
              targetHandle = 'target'; // Output nodes receive at 'target'
            } else if (targetNode?.type === 'WeightedChoice') {
              targetHandle = 'target'; // WeightedChoice receives at 'target'
            } else if (targetNode?.type === 'Concat') {
              targetHandle = 'target'; // Concat receives at 'target'
            }
            
            return {
              id: edge.id,
              source: edge.source,
              target: edge.target,
              sourceHandle,
              targetHandle
            };
          })
    },
    // Store regions in metadata for preservation
    additionalData: {
      regions: psg.regions
    }
  };
}