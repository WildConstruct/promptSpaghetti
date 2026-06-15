type NodeLike = {
  id: string;
  type?: string;
  data?: Record<string, any>;
  position?: { x?: number; y?: number } | any;
  parentNode?: string;
  extent?: unknown;
  expandParent?: boolean;
  width?: number | null;
  height?: number | null;
  style?: Record<string, any>;
};

type EdgeLike = {
  id?: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  [key: string]: any;
};

function buildImportedNodeTypeMap<TNode extends NodeLike>(
  nodes: TNode[]
): Map<string, string> {
  const nodeTypeMap = new Map<string, string>();
  nodes.forEach(node => {
    nodeTypeMap.set(node.id, canonicalizeImportedNodeType(node.type));
  });
  return nodeTypeMap;
}

export function canonicalizeImportedNodeType(type: string | undefined): string {
  const typeMap: Record<string, string> = {
    WeightedChoice: 'weightedChoice',
    weightedChoice: 'weightedChoice',
    enhancedBranching: 'weightedChoice',
    enhancedBranchingNode: 'weightedChoice',
    Concat: 'concat',
    concat: 'concat',
    Output: 'output',
    output: 'output',
    TextBlock: 'textBlock',
    textBlock: 'textBlock',
    Variable: 'variable',
    variable: 'variable',
    SetVariable: 'setVariable',
    setVariable: 'setVariable',
    GetVariable: 'getVariable',
    getVariable: 'getVariable',
    Include: 'include',
    include: 'include',
    boundingBox: 'boundingBox',
    enhancedBoundingBox: 'enhancedBoundingBox'
  };

  return typeMap[type || ''] || type || '';
}

export function normalizeLegacyFlatPsgShape(data: any): any {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const normalized = { ...data };

  if (normalized.region && !normalized.regions && !normalized.version) {
    normalized.version = normalized.metadata?.version || '1.0.0';
    normalized.regions = [normalized.region];
    delete normalized.region;
  }

  if (Array.isArray(normalized.groups) && !normalized.regions) {
    normalized.regions = normalized.groups.map((group: any, index: number) => ({
      id:
        typeof group?.id === 'string' && group.id.length > 0
          ? group.id
          : `region-${index + 1}`,
      name:
        typeof group?.label === 'string' && group.label.length > 0
          ? group.label
          : typeof group?.name === 'string' && group.name.length > 0
            ? group.name
            : `Region ${index + 1}`,
      color: group?.color,
      nodes: Array.isArray(group?.nodeIds)
        ? group.nodeIds
        : Array.isArray(group?.nodes)
          ? group.nodes
          : [],
      description: group?.description,
      metadata: group?.metadata
    }));
    delete normalized.groups;
  }

  if (typeof normalized.name !== 'string' || normalized.name.length === 0) {
    normalized.name =
      normalized.metadata?.name ||
      normalized.metadata?.title ||
      normalized.description ||
      'Untitled Fragment';
  }

  if (!Array.isArray(normalized.edges)) {
    normalized.edges = [];
  }

  if (Array.isArray(normalized.nodes)) {
    normalized.nodes = normalized.nodes.map((node: any, index: number) => ({
      ...node,
      x:
        typeof node?.x === 'number'
          ? node.x
          : typeof node?.position?.x === 'number'
            ? node.position.x
            : 100,
      y:
        typeof node?.y === 'number'
          ? node.y
          : typeof node?.position?.y === 'number'
            ? node.position.y
            : 100 + index * 180
    }));
  }

  if (Array.isArray(normalized.regions)) {
    normalized.regions = normalized.regions.map(
      (region: any, index: number) => ({
        ...region,
        id:
          typeof region?.id === 'string' && region.id.length > 0
            ? region.id
            : `region-${index + 1}`,
        name:
          typeof region?.name === 'string' && region.name.length > 0
            ? region.name
            : typeof region?.label === 'string' && region.label.length > 0
              ? region.label
              : typeof region?.data?.label === 'string' &&
                region.data.label.length > 0
                ? region.data.label
                : `Region ${index + 1}`,
        nodes: Array.isArray(region?.nodes)
          ? region.nodes
          : Array.isArray(region?.nodeIds)
            ? region.nodeIds
            : []
      })
    );
  }

  if (normalized.type && normalized.type !== 'psglib') {
    delete normalized.type;
  }

  return normalized;
}

export function normalizePsgLikeData(data: any): any {
  return normalizeLegacyFlatPsgShape(data);
}

export function annotateLibraryWeightedChoiceBranchUsage<
  TNode extends NodeLike,
  TEdge extends EdgeLike
>(edges: TEdge[], nodes: TNode[]): void {
  const nodeTypeMap = buildImportedNodeTypeMap(nodes);

  const branchConnections = new Map<string, Set<number>>();
  edges.forEach(edge => {
    const sourceType = nodeTypeMap.get(edge.source);
    if (sourceType !== 'weightedChoice' || !edge.sourceHandle) {
      return;
    }
    const match = edge.sourceHandle.match(/(?:branch|option)-(\d+)/);
    if (!match) {
      return;
    }
    const branchIndex = parseInt(match[1], 10);
    const used = branchConnections.get(edge.source) || new Set<number>();
    used.add(branchIndex);
    branchConnections.set(edge.source, used);
  });

  nodes.forEach(node => {
    if (nodeTypeMap.get(node.id) !== 'weightedChoice') {
      return;
    }
    const connections = branchConnections.get(node.id);
    const options = Array.isArray(node.data?.options)
      ? node.data.options
      : undefined;
    if (connections && options) {
      options.forEach((option: any, index: number) => {
        option.hasBranch = connections.has(index);
      });
    }
  });
}

export function repairLegacyImportEdgeHandles<
  TNode extends NodeLike,
  TEdge extends EdgeLike
>(edges: TEdge[], nodes: TNode[]): TEdge[] {
  const nodeTypeMap = buildImportedNodeTypeMap(nodes);

  return edges.map(edge => {
    const sourceType = nodeTypeMap.get(edge.source);
    const targetType = nodeTypeMap.get(edge.target);
    let sourceHandle = edge.sourceHandle;
    let targetHandle = edge.targetHandle;

    if (
      sourceType !== 'weightedChoice' &&
      sourceType !== 'concat' &&
      sourceType !== 'output' &&
      (sourceHandle === 'output' ||
        sourceHandle === 'main' ||
        sourceHandle === 'main-output')
    ) {
      sourceHandle = 'source';
    }

    if (targetType === 'weightedChoice' && targetHandle === 'input') {
      targetHandle = 'target';
    }

    if (
      sourceType === 'weightedChoice' &&
      typeof sourceHandle === 'string' &&
      /^option-\d+$/.test(sourceHandle)
    ) {
      const legacyIndex = sourceHandle.match(/^option-(\d+)$/);
      if (legacyIndex) {
        sourceHandle = `branch-${legacyIndex[1]}`;
      }
    }

    if (
      sourceHandle === edge.sourceHandle &&
      targetHandle === edge.targetHandle
    ) {
      return edge;
    }

    return {
      ...edge,
      sourceHandle,
      targetHandle
    };
  });
}

export function normalizeLibraryImportEdges<
  TNode extends NodeLike,
  TEdge extends EdgeLike
>(edges: TEdge[], nodes: TNode[]): TEdge[] {
  const nodeTypeMap = buildImportedNodeTypeMap(nodes);

  const concatInputUsage = new Map<string, Set<string>>();
  edges.forEach(edge => {
    const targetType = nodeTypeMap.get(edge.target);
    if (targetType !== 'concat') {
      return;
    }
    const used = concatInputUsage.get(edge.target) || new Set<string>();
    if (edge.targetHandle === 'input1' || edge.targetHandle === 'input2') {
      used.add(edge.targetHandle);
    }
    concatInputUsage.set(edge.target, used);
  });

  return edges.map(edge => {
    const sourceType = nodeTypeMap.get(edge.source);
    const targetType = nodeTypeMap.get(edge.target);
    let sourceHandle = edge.sourceHandle;
    let targetHandle = edge.targetHandle;

    if (sourceType === 'weightedChoice') {
      const isBranch =
        typeof sourceHandle === 'string' &&
        /^(?:branch|option)-\d+$/.test(sourceHandle);
      if (!isBranch) {
        const sourceNode = nodes.find(node => node.id === edge.source);
        const rawOptions = sourceNode?.data?.options;
        const options = Array.isArray(rawOptions) ? rawOptions : undefined;
        const hasBranching =
          Array.isArray(options) &&
          options.some((option: any) => option?.hasBranch === true);
        sourceHandle = hasBranching ? 'main' : 'source';
      } else if (
        typeof sourceHandle === 'string' &&
        /^option-\d+$/.test(sourceHandle)
      ) {
        const legacyIndex = sourceHandle.match(/^option-(\d+)$/);
        if (legacyIndex) {
          sourceHandle = `branch-${legacyIndex[1]}`;
        }
      }
    } else if (sourceType === 'concat') {
      sourceHandle = 'source';
    } else if (sourceType === 'output') {
      sourceHandle = undefined;
    } else if (!sourceHandle) {
      sourceHandle = 'source';
    }

    if (targetType === 'weightedChoice') {
      if (!targetHandle) {
        targetHandle = 'target';
      }
    } else if (targetType === 'output') {
      targetHandle = undefined;
    } else if (targetType === 'concat') {
      const used = concatInputUsage.get(edge.target) || new Set<string>();
      if (targetHandle !== 'input1' && targetHandle !== 'input2') {
        if (!used.has('input1')) {
          targetHandle = 'input1';
          used.add('input1');
        } else if (!used.has('input2')) {
          targetHandle = 'input2';
          used.add('input2');
        } else {
          targetHandle = 'input2';
        }
        concatInputUsage.set(edge.target, used);
      }
    } else if (!targetHandle) {
      targetHandle = 'target';
    }

    return {
      ...edge,
      sourceHandle,
      targetHandle
    };
  });
}

export function normalizeImportedEdges<
  TNode extends NodeLike,
  TEdge extends EdgeLike
>(edges: TEdge[], nodes: TNode[]): TEdge[] {
  const repairedEdges = repairLegacyImportEdgeHandles(edges, nodes);
  annotateLibraryWeightedChoiceBranchUsage(repairedEdges, nodes);
  return normalizeLibraryImportEdges(repairedEdges, nodes);
}

export function getImportedFragmentWrapperPolicy<
  TNode extends NodeLike & { parentNode?: string }
>(params: {
  presetData?: any;
  nodes?: TNode[];
  preservePositionsRequested?: boolean;
}): {
  shouldPreservePositions: boolean;
  hasImportedFragmentLayout: boolean;
  shouldSkipAutoLayout: boolean;
  shouldSkipParentRepair: boolean;
} {
  const { presetData, nodes = [], preservePositionsRequested = false } = params;

  const graphNodes = Array.isArray(presetData?.graph?.nodes)
    ? presetData.graph.nodes
    : [];
  const hasRegions =
    Array.isArray(presetData?.regions) && presetData.regions.length > 0;
  const hasGroups =
    Array.isArray(presetData?.groups) && presetData.groups.length > 0;
  const hasEnhancedBoundingBox = graphNodes.some(
    (node: any) =>
      node && typeof node === 'object' && node.type === 'enhancedBoundingBox'
  );

  const shouldPreservePositions =
    preservePositionsRequested ||
    hasRegions ||
    hasGroups ||
    hasEnhancedBoundingBox;

  const importedFragmentBoxes = nodes.filter(node => {
    if (canonicalizeImportedNodeType(node.type) !== 'enhancedBoundingBox') {
      return false;
    }
    return node.data?.fragmentImported === true;
  });

  const hasParentedChildren = nodes.some(
    node =>
      typeof (node as TNode & { parentNode?: string }).parentNode === 'string'
  );

  const hasImportedFragmentLayout =
    importedFragmentBoxes.length > 0 && hasParentedChildren;

  const shouldSkipParentRepair =
    importedFragmentBoxes.length === 1 &&
    nodes.every(node => {
      if (canonicalizeImportedNodeType(node.type) === 'enhancedBoundingBox') {
        return true;
      }
      return node.parentNode === importedFragmentBoxes[0].id;
    });

  return {
    shouldPreservePositions,
    hasImportedFragmentLayout,
    shouldSkipAutoLayout: shouldPreservePositions || hasImportedFragmentLayout,
    shouldSkipParentRepair
  };
}

export function repairImportedFragmentWrapperNodes<
  TNode extends NodeLike
>(params: {
  nodes: TNode[];
  getNodeWidth: (node: TNode) => number;
  getNodeHeight: (node: TNode) => number;
}): TNode[] {
  let nodes = params.nodes;
  const { getNodeWidth, getNodeHeight } = params;

  const importedBoxes = nodes.filter(
    node => canonicalizeImportedNodeType(node.type) === 'enhancedBoundingBox'
  );
  if (importedBoxes.length === 0) {
    return nodes;
  }

  const boxesById = new Map(importedBoxes.map(box => [box.id, box]));

  nodes = nodes.map(node => {
    if (
      canonicalizeImportedNodeType(node.type) === 'enhancedBoundingBox' ||
      typeof node.parentNode === 'string'
    ) {
      return node;
    }

    const matchBox =
      importedBoxes.length === 1
        ? importedBoxes[0]
        : importedBoxes.find(box => {
          const width = getNodeWidth(box);
          const height = getNodeHeight(box);
          const x = node.position?.x ?? 0;
          const y = node.position?.y ?? 0;
          const bx = box.position?.x ?? 0;
          const by = box.position?.y ?? 0;
          return x >= bx && x <= bx + width && y >= by && y <= by + height;
        });

    if (!matchBox) {
      return node;
    }

    const bx = matchBox.position?.x ?? 0;
    const by = matchBox.position?.y ?? 0;
    return {
      ...node,
      parentNode: matchBox.id,
      extent: 'parent',
      expandParent: true,
      position: {
        x: (node.position?.x ?? 0) - bx,
        y: (node.position?.y ?? 0) - by
      }
    };
  });

  nodes = nodes.map(node => {
    const parent = node.parentNode;
    if (parent && !boxesById.has(parent)) {
      const fallback = importedBoxes[0];
      if (fallback) {
        return {
          ...node,
          parentNode: fallback.id,
          extent: 'parent',
          expandParent: true
        };
      }
    }
    return node;
  });

  nodes = nodes.map(node => {
    const parent = node.parentNode;
    if (!parent || !boxesById.has(parent)) {
      return node;
    }
    const parentNode = boxesById.get(parent);
    const parentWidth = parentNode ? getNodeWidth(parentNode) : 0;
    const parentHeight = parentNode ? getNodeHeight(parentNode) : 0;
    const childWidth = getNodeWidth(node);
    const childHeight = getNodeHeight(node);
    const maxX = Math.max(0, parentWidth - childWidth);
    const maxY = Math.max(0, parentHeight - childHeight);
    return {
      ...node,
      position: {
        x: Math.min(maxX, Math.max(0, node.position?.x ?? 0)),
        y: Math.min(maxY, Math.max(0, node.position?.y ?? 0))
      }
    };
  });

  const childrenByBox = new Map<string, TNode[]>();
  nodes.forEach(node => {
    const parent = node.parentNode;
    if (!parent || !boxesById.has(parent)) {
      return;
    }
    const existing = childrenByBox.get(parent) || [];
    existing.push(node);
    childrenByBox.set(parent, existing);
  });

  const rebasedOffsets = new Map<string, { dx: number; dy: number }>();
  childrenByBox.forEach((children, boxId) => {
    const box = boxesById.get(boxId);
    if (!box || children.length === 0) {
      return;
    }
    const boxHeight = getNodeHeight(box);
    const minX = Math.min(...children.map(child => child.position?.x ?? 0));
    const minY = Math.min(...children.map(child => child.position?.y ?? 0));
    const clearlyOffset =
      minY > 140 ||
      children.some(child => (child.position?.y ?? 0) >= boxHeight - 12);
    if (!clearlyOffset) {
      return;
    }
    rebasedOffsets.set(boxId, {
      dx: minX - 24,
      dy: minY - 96
    });
  });

  if (rebasedOffsets.size > 0) {
    nodes = nodes.map(node => {
      const parent = node.parentNode;
      if (!parent) {
        return node;
      }
      const shift = rebasedOffsets.get(parent);
      if (!shift) {
        return node;
      }
      return {
        ...node,
        position: {
          x: Math.max(0, (node.position?.x ?? 0) - shift.dx),
          y: Math.max(0, (node.position?.y ?? 0) - shift.dy)
        }
      };
    });
  }

  const childNodesByBox = new Map<string, TNode[]>();
  nodes.forEach(node => {
    const parent = node.parentNode;
    if (parent && boxesById.has(parent)) {
      const existing = childNodesByBox.get(parent) || [];
      existing.push(node);
      childNodesByBox.set(parent, existing);
    }
  });

  nodes = nodes.map(node => {
    if (canonicalizeImportedNodeType(node.type) !== 'enhancedBoundingBox') {
      return node;
    }
    const children = childNodesByBox.get(node.id) || [];
    if (children.length === 0) {
      return node;
    }

    const currentWidth = getNodeWidth(node);
    const currentHeight = getNodeHeight(node);
    const padding = 40;
    const requiredWidth = children.reduce((max, child) => {
      const right = (child.position?.x ?? 0) + getNodeWidth(child);
      return Math.max(max, right + padding);
    }, currentWidth);
    const requiredHeight = children.reduce((max, child) => {
      const bottom = (child.position?.y ?? 0) + getNodeHeight(child);
      return Math.max(max, bottom + padding);
    }, currentHeight);

    if (requiredWidth === currentWidth && requiredHeight === currentHeight) {
      return node;
    }

    return {
      ...node,
      width: requiredWidth,
      height: requiredHeight,
      style: {
        ...(node.style ?? {}),
        width: requiredWidth,
        height: requiredHeight
      },
      data: {
        ...(node.data ?? {}),
        width: requiredWidth,
        height: requiredHeight
      }
    };
  });

  return nodes;
}

/**
 * Resize any imported bounding-box containers so they are large enough to
 * contain all of their parented children. This is intentionally separated
 * from the full parent-repair pass so it can run even when parent
 * assignments are already correct (shouldSkipParentRepair === true).
 */
export function resizeContainersToFitChildren<
  TNode extends NodeLike
>(params: {
  nodes: TNode[];
  getNodeWidth: (node: TNode) => number;
  getNodeHeight: (node: TNode) => number;
}): TNode[] {
  const { nodes, getNodeWidth, getNodeHeight } = params;

  const boxIds = new Set(
    nodes
      .filter(n => canonicalizeImportedNodeType(n.type) === 'enhancedBoundingBox')
      .map(n => n.id)
  );
  if (boxIds.size === 0) {
    return nodes;
  }

  const childrenByBox = new Map<string, TNode[]>();
  nodes.forEach(node => {
    const parent = node.parentNode;
    if (parent && boxIds.has(parent)) {
      const existing = childrenByBox.get(parent) || [];
      existing.push(node);
      childrenByBox.set(parent, existing);
    }
  });

  return nodes.map(node => {
    if (canonicalizeImportedNodeType(node.type) !== 'enhancedBoundingBox') {
      return node;
    }
    const children = childrenByBox.get(node.id) || [];
    if (children.length === 0) {
      return node;
    }

    const currentWidth = getNodeWidth(node);
    const currentHeight = getNodeHeight(node);
    const padding = 40;
    const requiredWidth = children.reduce((max, child) => {
      const right = (child.position?.x ?? 0) + getNodeWidth(child);
      return Math.max(max, right + padding);
    }, currentWidth);
    const requiredHeight = children.reduce((max, child) => {
      const bottom = (child.position?.y ?? 0) + getNodeHeight(child);
      return Math.max(max, bottom + padding);
    }, currentHeight);

    if (requiredWidth === currentWidth && requiredHeight === currentHeight) {
      return node;
    }

    return {
      ...node,
      width: requiredWidth,
      height: requiredHeight,
      style: {
        ...(node.style ?? {}),
        width: requiredWidth,
        height: requiredHeight
      },
      data: {
        ...(node.data ?? {}),
        width: requiredWidth,
        height: requiredHeight
      }
    };
  });
}

export function prepareImportedGraphBatch<
  TNode extends NodeLike,
  TEdge extends EdgeLike
>(params: {
  presetData?: any;
  nodes: TNode[];
  edges: TEdge[];
  preservePositionsRequested?: boolean;
  existingNodes?: TNode[];
  getNodeWidth: (node: TNode) => number;
  getNodeHeight: (node: TNode) => number;
  layoutNodes?: (nodes: TNode[], edges: TEdge[]) => TNode[] | null | undefined;
  containerNode?: TNode | null;
  attachNodesToContainer?: (nodes: TNode[], container: TNode) => TNode[];
}): {
  nodes: TNode[];
  edges: TEdge[];
  policy: ReturnType<typeof getImportedFragmentWrapperPolicy<TNode>>;
} {
  const {
    presetData,
    preservePositionsRequested = false,
    existingNodes = [],
    getNodeWidth,
    getNodeHeight,
    layoutNodes,
    containerNode,
    attachNodesToContainer
  } = params;

  let nodes = params.nodes;
  let edges = params.edges;

  const policy = getImportedFragmentWrapperPolicy<TNode>({
    presetData,
    nodes,
    preservePositionsRequested
  });

  if (nodes.length > 1 && !policy.shouldSkipAutoLayout && layoutNodes) {
    const layoutedNodes = layoutNodes(nodes, edges);
    if (layoutedNodes && layoutedNodes.length > 0) {
      nodes = layoutedNodes;
    }
  }

  const importedBoxes = nodes.filter(
    node => canonicalizeImportedNodeType(node.type) === 'enhancedBoundingBox'
  );
  if (importedBoxes.length > 0 && !policy.shouldSkipParentRepair) {
    nodes = repairImportedFragmentWrapperNodes({
      nodes,
      getNodeWidth,
      getNodeHeight
    });
  }

  // Always resize containers to fit children, even when the full parent
  // repair was skipped (parent assignments may be correct but geometry wrong).
  if (importedBoxes.length > 0) {
    nodes = resizeContainersToFitChildren({
      nodes,
      getNodeWidth,
      getNodeHeight
    });
  }

  const existingOutput = existingNodes.find(
    node => canonicalizeImportedNodeType(node.type) === 'output'
  );
  if (existingOutput) {
    const removedOutputIds = new Set<string>(
      nodes
        .filter(node => canonicalizeImportedNodeType(node.type) === 'output')
        .map(node => node.id)
    );
    if (removedOutputIds.size > 0) {
      nodes = nodes.filter(
        node => canonicalizeImportedNodeType(node.type) !== 'output'
      );
      edges = edges.map(edge =>
        removedOutputIds.has(edge.target)
          ? {
            ...edge,
            target: existingOutput.id,
            targetHandle: undefined
          }
          : edge
      ) as TEdge[];
    }
  }

  if (containerNode && attachNodesToContainer) {
    nodes = attachNodesToContainer(nodes, containerNode);
  }

  return {
    nodes,
    edges,
    policy
  };
}
