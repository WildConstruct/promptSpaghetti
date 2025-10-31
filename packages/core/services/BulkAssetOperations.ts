// Bulk Asset Operations for Advanced Asset Browser
// Story 2.5b: Advanced Asset Browser Features

import { Edge, Node } from 'reactflow';
import { Asset, AssetMetadata } from './assetMatcher';
import { TreeBuilder } from './TreeBuilder';

type FlowNode = Node<Record<string, unknown>>;
type FlowEdge = Edge<Record<string, unknown>>;

interface AssetChoice {
  id: string;
  text: string;
  weight: number;
  metadata?: AssetMetadata;
}

type ReplaceRollbackNode = {
  nodeId: string;
  originalData: Record<string, unknown>;
  originalType: string;
};

type MetadataRollbackNode = {
  nodeId: string;
  originalMetadata: Record<string, unknown> | undefined;
};

type BulkOperationRollback =
  | { type: 'add_choices'; originalChoices: AssetChoice[] }
  | { type: 'replace_multiple'; nodes: ReplaceRollbackNode[] }
  | { type: 'apply_metadata'; nodes: MetadataRollbackNode[] };

export interface BulkOperation {
  id: string;
  type:
    | 'add_choices'
    | 'create_sequence'
    | 'build_parallel'
    | 'replace_multiple'
    | 'apply_metadata';
  assets: Asset[];
  targetNodes?: string[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  results?: BulkOperationResult;
  error?: string;
}

export interface BulkOperationResult {
  success: boolean;
  nodesCreated: Node[];
  edgesCreated: Edge[];
  nodesModified: string[];
  errors: string[];
  rollbackData?: BulkOperationRollback;
}

export class BulkAssetOperations {
  private readonly operations: Map<string, BulkOperation> = new Map();
  private readonly treeBuilder: TreeBuilder;
  private readonly concurrencyLimit = 10;

  constructor(treeBuilder?: TreeBuilder) {
    this.treeBuilder = treeBuilder || new TreeBuilder();
  }

  // Add multiple assets as WeightedChoice options
  async addAsChoices(
    assets: Asset[],
    targetNodeId: string,
    existingNodes: FlowNode[]
  ): Promise<BulkOperationResult> {
    const operationId = this.createOperation('add_choices', assets, [
      targetNodeId
    ]);

    try {
      const targetNode = existingNodes.find(n => n.id === targetNodeId);
      if (!targetNode || targetNode.type !== 'weightedchoice') {
        throw new Error('Target must be a WeightedChoice node');
      }

      const nodeData = targetNode.data as Record<string, unknown> & {
        choices?: AssetChoice[];
      };
      const existingChoices: AssetChoice[] = Array.isArray(nodeData.choices)
        ? [...nodeData.choices]
        : [];
      const newChoices: AssetChoice[] = assets.map((asset, index) => ({
        id: `choice-${Date.now()}-${index}`,
        text: asset.name,
        weight: 5,
        metadata: asset.metadata
      }));

      // Update node with new choices
      nodeData.choices = [...existingChoices, ...newChoices];

      this.updateOperationProgress(operationId, 100);

      return {
        success: true,
        nodesCreated: [],
        edgesCreated: [],
        nodesModified: [targetNodeId],
        errors: [],
        rollbackData: {
          type: 'add_choices',
          originalChoices: existingChoices
        }
      };
    } catch (error) {
      const errorMessage = this.toErrorMessage(error);
      this.updateOperationStatus(operationId, 'failed', errorMessage);
      return {
        success: false,
        nodesCreated: [],
        edgesCreated: [],
        nodesModified: [],
        errors: [errorMessage]
      };
    }
  }

  // Create a sequence of nodes from multiple assets
  async createSequence(
    assets: Asset[],
    startPosition: { x: number; y: number }
  ): Promise<BulkOperationResult> {
    const operationId = this.createOperation('create_sequence', assets);
    const nodes: FlowNode[] = [];
    const edges: FlowEdge[] = [];

    try {
      const currentX = startPosition.x;
      let currentY = startPosition.y;
      let previousNodeId: string | null = null;

      for (let i = 0; i < assets.length; i++) {
        const asset = assets[i];
        this.updateOperationProgress(operationId, (i / assets.length) * 100);

        // Create node based on asset type
        const nodeId = `${asset.type}-${Date.now()}-${i}`;
        const node: FlowNode = {
          id: nodeId,
          type: this.getNodeTypeFromAsset(asset),
          position: { x: currentX, y: currentY },
          data: {
            label: asset.name,
            ...asset.metadata
          }
        };

        nodes.push(node);

        // Create edge from previous node
        if (previousNodeId) {
          edges.push({
            id: `edge-${previousNodeId}-${nodeId}`,
            source: previousNodeId,
            target: nodeId
          });
        }

        previousNodeId = nodeId;
        currentY += 120; // Vertical spacing
      }

      // Add final output node
      const outputId = `output-${Date.now()}`;
      nodes.push({
        id: outputId,
        type: 'output',
        position: { x: currentX, y: currentY },
        data: { label: 'Sequence Output' }
      });

      if (previousNodeId) {
        edges.push({
          id: `edge-${previousNodeId}-${outputId}`,
          source: previousNodeId,
          target: outputId
        });
      }

      this.updateOperationProgress(operationId, 100);

      return {
        success: true,
        nodesCreated: nodes,
        edgesCreated: edges,
        nodesModified: [],
        errors: []
      };
    } catch (error) {
      const errorMessage = this.toErrorMessage(error);
      this.updateOperationStatus(operationId, 'failed', errorMessage);
      return {
        success: false,
        nodesCreated: [],
        edgesCreated: [],
        nodesModified: [],
        errors: [errorMessage]
      };
    }
  }

  // Build parallel branches from multiple assets
  async buildParallelBranches(
    assets: Asset[],
    startPosition: { x: number; y: number }
  ): Promise<BulkOperationResult> {
    const operationId = this.createOperation('build_parallel', assets);
    const nodes: FlowNode[] = [];
    const edges: FlowEdge[] = [];

    try {
      // Create a split node (WeightedChoice)
      const splitNodeId = `split-${Date.now()}`;
      nodes.push({
        id: splitNodeId,
        type: 'weightedchoice',
        position: startPosition,
        data: { label: 'Branch Selection', choices: [] }
      });

      // Create concat node to merge branches
      const mergeNodeId = `merge-${Date.now()}`;
      const mergeY = startPosition.y + 300;
      nodes.push({
        id: mergeNodeId,
        type: 'concat',
        position: { x: startPosition.x, y: mergeY },
        data: { label: 'Merge Branches' }
      });

      // Create parallel branches
      const branchSpacing = 200;
      const startX =
        startPosition.x - ((assets.length - 1) * branchSpacing) / 2;

      for (let i = 0; i < assets.length; i++) {
        const asset = assets[i];
        this.updateOperationProgress(operationId, (i / assets.length) * 100);

        const branchX = startX + i * branchSpacing;
        const branchY = startPosition.y + 150;

        // Create branch node
        const branchNodeId = `branch-${Date.now()}-${i}`;
        nodes.push({
          id: branchNodeId,
          type: this.getNodeTypeFromAsset(asset),
          position: { x: branchX, y: branchY },
          data: {
            label: asset.name,
            ...asset.metadata
          }
        });

        // Connect from split to branch
        edges.push({
          id: `edge-split-${i}`,
          source: splitNodeId,
          target: branchNodeId
        });

        // Connect from branch to merge
        edges.push({
          id: `edge-merge-${i}`,
          source: branchNodeId,
          target: mergeNodeId
        });
      }

      // Add output
      const outputId = `output-${Date.now()}`;
      nodes.push({
        id: outputId,
        type: 'output',
        position: { x: startPosition.x, y: mergeY + 100 },
        data: { label: 'Parallel Output' }
      });

      edges.push({
        id: `edge-output`,
        source: mergeNodeId,
        target: outputId
      });

      this.updateOperationProgress(operationId, 100);

      return {
        success: true,
        nodesCreated: nodes,
        edgesCreated: edges,
        nodesModified: [],
        errors: []
      };
    } catch (error) {
      const errorMessage = this.toErrorMessage(error);
      this.updateOperationStatus(operationId, 'failed', errorMessage);
      return {
        success: false,
        nodesCreated: [],
        edgesCreated: [],
        nodesModified: [],
        errors: [errorMessage]
      };
    }
  }

  // Replace multiple nodes with assets
  async replaceMultipleNodes(
    nodeAssetPairs: Array<{ nodeId: string; asset: Asset }>,
    existingNodes: FlowNode[]
  ): Promise<BulkOperationResult> {
    const assets = nodeAssetPairs.map(p => p.asset);
    const nodeIds = nodeAssetPairs.map(p => p.nodeId);
    const operationId = this.createOperation(
      'replace_multiple',
      assets,
      nodeIds
    );

    const modifiedNodes: string[] = [];
    const errors: string[] = [];
    const rollbackNodes: ReplaceRollbackNode[] = [];

    try {
      // Process replacements in parallel batches
      const batchSize = this.concurrencyLimit;
      for (let i = 0; i < nodeAssetPairs.length; i += batchSize) {
        const batch = nodeAssetPairs.slice(i, i + batchSize);

        await Promise.all(
          batch.map(async ({ nodeId, asset }) => {
            try {
              const node = existingNodes.find(n => n.id === nodeId);
              if (!node) {
                errors.push(`Node ${nodeId} not found`);
                return;
              }

              // Store original data for rollback
              rollbackNodes.push({
                nodeId,
                originalData: { ...node.data },
                originalType: node.type
              });

              // Update node with asset data
              node.type = this.getNodeTypeFromAsset(asset);
              node.data = {
                ...node.data,
                label: asset.name,
                ...asset.metadata
              };

              modifiedNodes.push(nodeId);
            } catch (error) {
              const errorMessage = this.toErrorMessage(error);
              errors.push(`Failed to replace ${nodeId}: ${errorMessage}`);
            }
          })
        );

        this.updateOperationProgress(
          operationId,
          ((i + batch.length) / nodeAssetPairs.length) * 100
        );
      }

      return {
        success: errors.length === 0,
        nodesCreated: [],
        edgesCreated: [],
        nodesModified: modifiedNodes,
        errors,
        rollbackData:
          rollbackNodes.length > 0
            ? { type: 'replace_multiple', nodes: rollbackNodes }
            : undefined
      };
    } catch (error) {
      const errorMessage = this.toErrorMessage(error);
      this.updateOperationStatus(operationId, 'failed', errorMessage);
      return {
        success: false,
        nodesCreated: [],
        edgesCreated: [],
        nodesModified: [],
        errors: [errorMessage]
      };
    }
  }

  // Apply metadata to multiple nodes
  async applyMetadataToNodes(
    nodeIds: string[],
    metadata: Record<string, unknown>,
    existingNodes: FlowNode[]
  ): Promise<BulkOperationResult> {
    const operationId = this.createOperation('apply_metadata', [], nodeIds);
    const modifiedNodes: string[] = [];
    const errors: string[] = [];
    const rollbackNodes: MetadataRollbackNode[] = [];

    try {
      for (let i = 0; i < nodeIds.length; i++) {
        const nodeId = nodeIds[i];
        const node = existingNodes.find(n => n.id === nodeId);

        if (!node) {
          errors.push(`Node ${nodeId} not found`);
          continue;
        }

        // Store original metadata
        rollbackNodes.push({
          nodeId,
          originalMetadata: (
            node.data as Record<string, unknown> & {
              metadata?: Record<string, unknown>;
            }
          ).metadata
        });

        // Apply new metadata
        const nodeData = node.data as Record<string, unknown> & {
          metadata?: Record<string, unknown>;
        };
        nodeData.metadata = {
          ...(nodeData.metadata || {}),
          ...metadata
        };

        modifiedNodes.push(nodeId);
        this.updateOperationProgress(
          operationId,
          ((i + 1) / nodeIds.length) * 100
        );
      }

      return {
        success: errors.length === 0,
        nodesCreated: [],
        edgesCreated: [],
        nodesModified: modifiedNodes,
        errors,
        rollbackData:
          rollbackNodes.length > 0
            ? { type: 'apply_metadata', nodes: rollbackNodes }
            : undefined
      };
    } catch (error) {
      const errorMessage = this.toErrorMessage(error);
      this.updateOperationStatus(operationId, 'failed', errorMessage);
      return {
        success: false,
        nodesCreated: [],
        edgesCreated: [],
        nodesModified: [],
        errors: [errorMessage]
      };
    }
  }

  // Helper methods
  private getNodeTypeFromAsset(asset: Asset): string {
    // Map asset types to node types
    const typeMap: Record<string, string> = {
      text: 'textblock',
      choice: 'weightedchoice',
      variable: 'variable',
      template: 'concat'
    };

    const assetCategory = asset.metadata?.category?.toLowerCase() || '';
    return typeMap[assetCategory] || 'textblock';
  }

  private createOperation(
    type: BulkOperation['type'],
    assets: Asset[],
    targetNodes?: string[]
  ): string {
    const id = `op-${Date.now()}`;
    const operation: BulkOperation = {
      id,
      type,
      assets,
      targetNodes,
      status: 'processing',
      progress: 0
    };

    this.operations.set(id, operation);
    return id;
  }

  private updateOperationProgress(operationId: string, progress: number): void {
    const operation = this.operations.get(operationId);
    if (operation) {
      operation.progress = progress;
      if (progress >= 100) {
        operation.status = 'completed';
      }
    }
  }

  private updateOperationStatus(
    operationId: string,
    status: BulkOperation['status'],
    error?: string
  ): void {
    const operation = this.operations.get(operationId);
    if (operation) {
      operation.status = status;
      if (error) {
        operation.error = error;
      }
    }
  }

  // Get operation status
  getOperationStatus(operationId: string): BulkOperation | undefined {
    return this.operations.get(operationId);
  }

  // Cancel operation
  cancelOperation(operationId: string): boolean {
    const operation = this.operations.get(operationId);
    if (operation && operation.status === 'processing') {
      operation.status = 'failed';
      operation.error = 'Cancelled by user';
      return true;
    }
    return false;
  }

  // Rollback operation
  async rollbackOperation(
    operationId: string,
    rollbackData: BulkOperationRollback | undefined,
    nodes: FlowNode[]
  ): Promise<boolean> {
    if (!rollbackData) {
      return false;
    }

    try {
      // Restore original state based on operation type
      switch (rollbackData.type) {
        case 'add_choices': {
          const targetNode = nodes.find(
            n => n.id === this.operations.get(operationId)?.targetNodes?.[0]
          );
          if (targetNode) {
            const nodeData = targetNode.data as Record<string, unknown> & {
              choices?: AssetChoice[];
            };
            nodeData.choices = rollbackData.originalChoices;
          }
          break;
        }

        case 'replace_multiple': {
          rollbackData.nodes.forEach(item => {
            const node = nodes.find(n => n.id === item.nodeId);
            if (node) {
              node.type = item.originalType;
              node.data = { ...item.originalData };
            }
          });
          break;
        }

        case 'apply_metadata': {
          rollbackData.nodes.forEach(item => {
            const node = nodes.find(n => n.id === item.nodeId);
            if (node) {
              const nodeData = node.data as Record<string, unknown> & {
                metadata?: Record<string, unknown>;
              };
              nodeData.metadata = item.originalMetadata;
            }
          });
          break;
        }
      }

      return true;
    } catch (error) {
      console.error('Rollback failed:', error);
      return false;
    }
  }

  private toErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    try {
      return JSON.stringify(error);
    } catch {
      return 'Unknown error';
    }
  }
}
