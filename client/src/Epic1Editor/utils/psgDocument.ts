import type { Node, Edge } from 'reactflow';
import { readPsg } from '@promptscape/core/utils/psgCodec';
import type {
  Graph,
  GraphNode as PSGGraphNode,
  GraphEdge as PSGGraphEdge
} from '@promptscape/core/types/graph';
import {
  parsePsgWithCompatibility,
  convertPSGToPSGLib
} from '@promptscape/core/fileFormats/psg';
import type { PSGLibFile } from '@promptscape/core/fileFormats/psglib';
import { validateEditorGraphPayload } from './graphValidation';

const CONTAINER_NODE_TYPES = new Set([
  'enhancedBoundingBox',
  'fragmentContainer'
]);

const isPositionsMap = (
  val: unknown
): val is Record<string, { x: number; y: number }> => {
  if (!val || typeof val !== 'object') {
    return false;
  }

  for (const v of Object.values(val as Record<string, unknown>)) {
    if (
      v &&
      typeof v === 'object' &&
      typeof (v as Record<string, unknown>).x === 'number' &&
      typeof (v as Record<string, unknown>).y === 'number'
    ) {
      return true;
    }
  }

  return true;
};

export type LoadedPsgDocument = {
  nodes: Node[];
  edges: Edge[];
  source: 'flat' | 'legacy';
};

export function convertGraphToReactFlow(graph: Graph): {
  nodes: Node[];
  edges: Edge[];
} {
  const layout = graph.layout as Record<string, unknown> | undefined;
  const positionsUnknown = layout && layout.positions;
  const positions: Record<string, { x: number; y: number }> = isPositionsMap(
    positionsUnknown
  )
    ? positionsUnknown
    : {};

  const xSpacing = 300;
  const ySpacing = 160;
  const cols = 3;

  const runtimeNodes = (graph.nodes as PSGGraphNode[]).filter(
    node => !CONTAINER_NODE_TYPES.has(node.type)
  );

  const nodes: Node[] = runtimeNodes.map((node, index) => {
    const pos = positions[node.id] || {
      x: (index % cols) * xSpacing + 200,
      y: Math.floor(index / cols) * ySpacing + 120
    };

    const type = node.type || 'textBlock';
    const dataRaw = (node.data || {}) as Record<string, unknown>;
    const labelFromData =
      typeof dataRaw.label === 'string' ? dataRaw.label : undefined;
    const label = node.label || labelFromData || node.id;

    let data: Record<string, unknown> = { label };

    switch (type) {
      case 'textBlock': {
        const contentVal = dataRaw.content;
        const textVal = dataRaw.text;
        const valueVal = dataRaw.value;
        const content =
          typeof contentVal === 'string'
            ? contentVal
            : typeof textVal === 'string'
              ? textVal
              : label;
        const value = typeof valueVal === 'string' ? valueVal : content;
        data = {
          nodeType: 'textBlock',
          content,
          text: content,
          value,
          label
        };
        break;
      }
      case 'weightedChoice': {
        const optionsVal = dataRaw.options;
        const options = Array.isArray(optionsVal) ? optionsVal : [];
        data = {
          nodeType: 'weightedChoice',
          options,
          label: label || 'Choice'
        };
        break;
      }
      case 'output': {
        const outVal = dataRaw.outputName;
        const valueVal = dataRaw.value;
        const templateVal = dataRaw.template;
        data = {
          nodeType: 'output',
          outputName: typeof outVal === 'string' ? outVal : 'output',
          value:
            typeof valueVal === 'string'
              ? valueVal
              : typeof templateVal === 'string'
                ? templateVal
                : '',
          label: 'Output'
        };
        break;
      }
      case 'concat': {
        const valueVal = dataRaw.value;
        const separatorVal = dataRaw.separator;
        data = {
          nodeType: 'concat',
          value:
            typeof valueVal === 'string'
              ? valueVal
              : typeof separatorVal === 'string'
                ? separatorVal
                : '',
          label
        };
        break;
      }
      default:
        data = { ...dataRaw, label };
    }

    return {
      id: node.id,
      type,
      position: pos,
      data
    } as Node;
  });

  const validNodeIds = new Set(runtimeNodes.map(node => node.id));
  const edges: Edge[] = (graph.edges as PSGGraphEdge[])
    .filter(
      edge => validNodeIds.has(edge.source) && validNodeIds.has(edge.target)
    )
    .map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: 'smoothstep',
      sourceHandle: (edge.data as Record<string, unknown> | undefined)
        ?.sourceHandle as string | undefined,
      targetHandle: (edge.data as Record<string, unknown> | undefined)
        ?.targetHandle as string | undefined
    }));

  return { nodes, edges };
}

function loadLegacyGraphWrapper(
  psgText: string,
  strictValidation: boolean
): LoadedPsgDocument {
  const psgFile = readPsg(psgText, { strictValidation });
  const validated = validateEditorGraphPayload(
    convertGraphToReactFlow(psgFile.graph)
  );
  if (!validated.ok) {
    throw new Error(validated.error);
  }
  return {
    ...validated.data,
    source: 'legacy'
  };
}

export function loadReactFlowFromPsgContent(
  psgText: string,
  strictValidation = true
): LoadedPsgDocument {
  try {
    const fragment = parsePsgWithCompatibility(psgText);
    const psglib: PSGLibFile = convertPSGToPSGLib(fragment);
    const validated = validateEditorGraphPayload(
      convertGraphToReactFlow(psglib.graph as Graph)
    );
    if (!validated.ok) {
      throw new Error(validated.error);
    }
    return {
      ...validated.data,
      source: 'flat'
    };
  } catch {
    return loadLegacyGraphWrapper(psgText, strictValidation);
  }
}

export function loadReactFlowFromAnyPsgContent(
  psgText: string
): LoadedPsgDocument {
  try {
    return loadReactFlowFromPsgContent(psgText, true);
  } catch {
    return loadReactFlowFromPsgContent(psgText, false);
  }
}
