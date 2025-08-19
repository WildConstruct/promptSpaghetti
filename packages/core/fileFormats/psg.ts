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
  target: z.string(),
  sourceHandle: z.string().optional(),
  targetHandle: z.string().optional()
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
    console.log('[PSG] Raw parsed JSON:', {
      hasNodes: !!data.nodes,
      hasEdges: !!data.edges,
      hasRegions: !!data.regions,
      rawEdges: data.edges
    });
    console.log('[PSG] Parsed JSON data:', {
      nodes: data.nodes?.length || 0,
      edges: data.edges?.length || 0,
      regions: data.regions?.length || 0,
      edgeIds: data.edges?.map((e: any) => e.id)
    });
    
    // Try to parse edges separately to see what's happening
    if (data.edges) {
      console.log('[PSG] Validating edges individually:');
      data.edges.forEach((edge: any, i: number) => {
        const edgeResult = PSGEdgeSchema.safeParse(edge);
        if (!edgeResult.success) {
          console.error(`[PSG] Edge ${i} validation failed:`, edge, edgeResult.error);
        } else {
          console.log(`[PSG] Edge ${i} valid:`, edge);
        }
      });
    }
    
    const result = PSGFileSchema.safeParse(data);
    
    if (!result.success) {
      console.error('[PSG] Schema validation failed:', result.error);
      console.error('[PSG] Full error details:', JSON.stringify(result.error.errors, null, 2));
      throw new Error(`Invalid PSG file: ${result.error.message}`);
    }
    
    console.log('[PSG] Schema validation passed:', {
      nodes: result.data.nodes?.length || 0,
      edges: result.data.edges?.length || 0,
      regions: result.data.regions?.length || 0
    });
    
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
  console.log('[PSG] Converting PSG to PSGLib:', {
    nodes: psg.nodes?.length || 0,
    edges: psg.edges?.length || 0,
    regions: psg.regions?.length || 0,
    edgeDetails: psg.edges
  });
  
  // Check if this is a fragment
  const isFragment = psg.metadata?.type === 'MULTI-ASPECT' || psg.metadata?.type === 'ASSET_FRAGMENT' || psg.regions?.length > 0;
  
  // Include all nodes - Output nodes are needed for preview functionality
  const nodesToImport = psg.nodes;
  
  // Get the IDs of nodes we're actually importing
  const importedNodeIds = new Set(nodesToImport.map(n => n.id));
  
  // Initialize the nodes array
  const graphNodes: any[] = [];
  
  // For fragments with regions, create an EnhancedBoundingBox to contain them
  let boundingBoxId: string | null = null;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  
  // Optimize layout for fragments - compact vertical stacking
  let optimizedPositions: Record<string, {x: number, y: number}> = {};
  
  if (isFragment && nodesToImport.length <= 5) {
    // For small fragments, use compact vertical stacking with more spacing
    let currentY = 0;
    nodesToImport.forEach((node, index) => {
      optimizedPositions[node.id] = {
        x: 0,  // All nodes in single column
        y: currentY
      };
      // Calculate height based on node type
      let nodeHeight = 180;
      if (node.type === 'WeightedChoice') {
        const optionCount = node.options?.length || 5;
        nodeHeight = Math.max(200, 80 + (optionCount * 35));
      } else if (node.type === 'Output') {
        nodeHeight = 100; // Output nodes are smaller
      }
      currentY += nodeHeight + 60; // Increased spacing between nodes for edges
    });
  } else if (isFragment) {
    // For larger fragments, use multi-column layout
    const cols = Math.ceil(Math.sqrt(nodesToImport.length));
    nodesToImport.forEach((node, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      optimizedPositions[node.id] = {
        x: col * 520,  // 520px spacing for wider WeightedChoice nodes
        y: row * 250   // Vertical spacing
      };
    });
  }

  if (isFragment && psg.regions && psg.regions.length > 0) {
    const region = psg.regions[0];
    
    // Calculate bounds for the bounding box
    minX = 0;
    minY = 0;
    maxX = 0;
    maxY = 0;
    
    // If we're using optimized layout, calculate based on that
    if (Object.keys(optimizedPositions).length > 0) {
      // Calculate bounds from optimized positions
      nodesToImport.forEach(node => {
        const pos = optimizedPositions[node.id];
        let nodeWidth = 520; // Wider WeightedChoice width to prevent cutoff
        let nodeHeight = 180; // default
        
        if (node.type === 'WeightedChoice') {
          const optionCount = node.options?.length || 5;
          nodeHeight = Math.max(200, 80 + (optionCount * 35));
        } else if (node.type === 'Output') {
          nodeHeight = 100; // Output nodes are smaller
        }
        
        maxX = Math.max(maxX, pos.x + nodeWidth);
        maxY = Math.max(maxY, pos.y + nodeHeight);
      });
    } else {
      // Fall back to original position calculation
      nodesToImport.forEach(node => {
        const x = node.x || 0;
        const y = node.y || 0;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        
        let nodeWidth = 520; // Wider to accommodate WeightedChoice nodes
        let nodeHeight = 180;
        
        if (node.type === 'WeightedChoice') {
          const optionCount = node.options?.length || 5;
          nodeHeight = Math.max(200, 100 + (optionCount * 35));
        }
        
        maxX = Math.max(maxX, x + nodeWidth);
        maxY = Math.max(maxY, y + nodeHeight);
      });
    }
    
    console.log('Fragment bounds calculation:', {
      minX, minY, maxX, maxY,
      nodeCount: nodesToImport.length,
      hasOptimizedLayout: Object.keys(optimizedPositions).length > 0
    });
    
    // Add padding around the content
    const boxPadding = 60; // Increased padding for better spacing
    const boxWidth = (maxX - minX) + (boxPadding * 2);
    const boxHeight = (maxY - minY) + (boxPadding * 2) + 80; // Extra space for header
    
    console.log('Final box dimensions:', {
      boxWidth, boxHeight,
      calculatedMaxX: maxX,
      calculatedMaxY: maxY
    });
    
    // Create a unique ID for this bounding box
    boundingBoxId = `region-${region.id || 'fragment'}-${Date.now()}`;
    
    // Create an EnhancedBoundingBox - the existing working system
    const boundingBox = {
      id: boundingBoxId,
      type: 'enhancedBoundingBox',
      position: {
        x: 0,  // Will be positioned by drop location
        y: 0   // Will be positioned by drop location
      },
      data: {
        title: region.name || psg.name || 'Asset Fragment',
        description: region.description || psg.description || '',
        backgroundColor: '#1a202c',
        opacity: 0.1,
        borderColor: region.color || '#22d3ee',
        borderStyle: 'solid' as const,
        borderWidth: 2,
        locked: false,
        isCollapsed: false,  // Start expanded so nodes are visible
        ports: region.ports || [],
        // IMPORTANT: EnhancedBoundingBox expects dimensions in data, not at top level
        width: boxWidth,
        height: boxHeight
      },
      style: {
        width: boxWidth,
        height: boxHeight,
        zIndex: -1  // Behind the nodes
      }
    };
    
    graphNodes.push(boundingBox);
  }
  
  // Create the graph nodes using optimized or original positions
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
    
    // Handle Output nodes
    if (node.type === 'Output') {
      nodeData.template = node.template || '';
      nodeData.value = node.template || '';
    }
    
    // Build the node with proper parent relationship
    const result: any = {
      id: node.id,
      type: nodeType,
      data: nodeData
    };
    
    // Position nodes appropriately
    if (boundingBoxId) {
      // Use optimized positions if available, otherwise fall back to original
      const pos = optimizedPositions[node.id] || {x: node.x || 0, y: node.y || 0};
      
      // For optimized layout, positions are already relative
      if (optimizedPositions[node.id]) {
        result.position = {
          x: pos.x + 40,  // Add padding
          y: pos.y + 80   // Add header space
        };
      } else {
        // Use original positions, make them relative to box
        result.position = {
          x: (pos.x - minX) + 40,  // Relative position inside box with padding
          y: (pos.y - minY) + 80   // Add extra padding for the header
        };
      }
    } else {
      // Standalone node, use absolute position
      result.position = {
        x: node.x || 100,
        y: node.y || 100
      };
    }
    
    console.log('Created node:', result);
    return result;
  });
  
  // Add content nodes after the bounding box
  graphNodes.push(...contentNodes);
  
  // Process edges
  const processedEdges = psg.edges ? psg.edges
          .filter(edge => {
            // Only include edges where both source and target are imported
            return importedNodeIds.has(edge.source) && importedNodeIds.has(edge.target);
          })
          .map(edge => {
            // Find source and target nodes to determine their types
            const sourceNode = nodesToImport.find(n => n.id === edge.source);
            const targetNode = nodesToImport.find(n => n.id === edge.target);
            
            // Set handles based on node types
            let sourceHandle = edge.sourceHandle || null;
            let targetHandle = edge.targetHandle || null;
            
            // Source handles (only set if not already specified)
            if (!sourceHandle) {
              if (sourceNode?.type === 'WeightedChoice') {
                sourceHandle = 'source'; // WeightedChoice outputs from 'source' (not 'main')
              } else if (sourceNode?.type === 'Output') {
                sourceHandle = 'source'; // Output nodes also use 'source'
              } else {
                sourceHandle = 'source'; // Default source handle for most nodes
              }
            }
            
            // Target handles (only set if not already specified)
            if (!targetHandle) {
              // All nodes receive at 'target' handle
              targetHandle = 'target';
            }
            
            return {
              id: edge.id,
              source: edge.source,
              target: edge.target,
              sourceHandle,
              targetHandle
            };
          }) : [];
  
  console.log('[PSG] Processing edges for fragment:', {
    originalEdges: psg.edges,
    processedEdges,
    nodeIds: Array.from(importedNodeIds),
    edgeDetails: processedEdges.map(e => ({
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: e.sourceHandle,
      targetHandle: e.targetHandle
    }))
  });
  
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
      edges: processedEdges
    },
    // Store regions in metadata for preservation
    additionalData: {
      regions: psg.regions
    }
  };
}