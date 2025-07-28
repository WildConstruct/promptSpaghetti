import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

// Conflict types and resolution strategies
export enum ConflictType {
  NODE_POSITION = 'node_position',
  NODE_PROPERTIES = 'node_properties',
  NODE_CREATION = 'node_creation',
  NODE_DELETION = 'node_deletion',
  EDGE_CREATION = 'edge_creation',
  EDGE_DELETION = 'edge_deletion',
  EDGE_PROPERTIES = 'edge_properties'
}

export enum ResolutionStrategy {
  LAST_WRITER_WINS = 'last_writer_wins',
  FIRST_WRITER_WINS = 'first_writer_wins',
  MERGE_PROPERTIES = 'merge_properties',
  USER_RESOLUTION = 'user_resolution',
  SEMANTIC_MERGE = 'semantic_merge',
  POSITIONAL_OFFSET = 'positional_offset'
}

}
export interface ConflictOperation {
  id: string;
  type: ConflictType;
  nodeId?: string;
  edgeId?: string;
  property?: string;
  oldValue: any;
  newValue: any;
  userId: string;
  timestamp: number;
  documentId: string;
}
}

}
export interface Conflict {
  id: string;
  type: ConflictType;
  nodeId?: string;
  edgeId?: string;
  property?: string;
  operations: ConflictOperation[];
  detectedAt: number;
  documentId: string;
  status: 'pending' | 'resolved' | 'escalated';
  resolutionStrategy?: ResolutionStrategy;
  resolvedBy?: string;
  resolvedAt?: number;
  autoResolved: boolean;
  description: string;
}
}

}
export interface ResolutionResult {
  conflict: Conflict;
  resolvedValue: any;
  operations: ConflictOperation[];
  requiresUserInput: boolean;
  metadata?: {
    mergedFields?: string[];
    discardedOperations?: string[];
}
    offsetApplied?: { x: number; y: number };
  };
}

}
export interface ConflictResolverConfig {
  defaultStrategy: ResolutionStrategy;
  autoResolveThreshold: number; // ms
  maxConflictAge: number; // ms
  positionConflictThreshold: number; // pixels
  enableSemanticMerge: boolean;
  preserveConflictHistory: boolean;
  conflictHistoryRetention: number; // ms
}
}

export class ConflictResolver extends EventEmitter {
  private conflicts: Map<string, Conflict> = new Map();
  private operationHistory: Map<string, ConflictOperation[]> = new Map(); // nodeId/edgeId -> operations
  private config: ConflictResolverConfig;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(config: ConflictResolverConfig) {
    super();
    this.config = config;
    this.startCleanup();
  }

  /**
   * Process an incoming operation and detect conflicts
   */
  processOperation(operation: ConflictOperation): ResolutionResult | null {
    const key = this.getOperationKey(operation);
    
    // Get existing operations for this entity
    const existingOps = this.operationHistory.get(key) || [];
    
    // Check for conflicts
    const conflictingOps = this.findConflictingOperations(operation, existingOps);
    
    if (conflictingOps.length === 0) {
      // No conflict, just store the operation
      this.storeOperation(operation);
      return null;
    }

    // Create or update conflict
    const conflict = this.createOrUpdateConflict(operation, conflictingOps);
    
    // Attempt automatic resolution
    const resolution = this.attemptAutoResolution(conflict);
    
    if (resolution.requiresUserInput) {
      this.emit('conflict_detected', conflict);
    } else {
      this.emit('conflict_auto_resolved', resolution);
    }

    return resolution;
  }

  /**
   * Manually resolve a conflict
   */
  resolveConflict(
    conflictId: string, 
    strategy: ResolutionStrategy, 
    userSelection?: any,
    userId?: string
  ): ResolutionResult | null {
    const conflict = this.conflicts.get(conflictId);
    if (!conflict) {
      return null;
    }

    const resolution = this.resolveConflictWithStrategy(conflict, strategy, userSelection);
    
    // Update conflict status
    conflict.status = 'resolved';
    conflict.resolutionStrategy = strategy;
    conflict.resolvedBy = userId;
    conflict.resolvedAt = Date.now();
    conflict.autoResolved = false;

    this.emit('conflict_resolved', resolution);
    
    // Store in history if configured
    if (this.config.preserveConflictHistory) {
      // Keep conflict in history
    } else {
      this.conflicts.delete(conflictId);
    }

    return resolution;
  }

  /**
   * Get all pending conflicts for a document
   */
  getPendingConflicts(documentId: string): Conflict[] {
    return Array.from(this.conflicts.values())
      .filter(conflict => conflict.documentId === documentId && conflict.status === 'pending');
  }

  /**
   * Get conflict by ID
   */
  getConflict(conflictId: string): Conflict | null {
    return this.conflicts.get(conflictId) || null;
  }

  /**
   * Clear all conflicts for a document
   */
  clearDocumentConflicts(documentId: string): void {
    for (const [id, conflict] of this.conflicts) {
      if (conflict.documentId === documentId) {
        this.conflicts.delete(id);
      }
    }
  }

  /**
   * Get conflict statistics
   */
  getConflictStats(documentId?: string): {
    total: number;
    pending: number;
    resolved: number;
    escalated: number;
    autoResolved: number;
    avgResolutionTime: number;
  } {
    const conflicts = documentId 
      ? Array.from(this.conflicts.values()).filter(c => c.documentId === documentId)
      : Array.from(this.conflicts.values());

    const pending = conflicts.filter(c => c.status === 'pending').length;
    const resolved = conflicts.filter(c => c.status === 'resolved').length;
    const escalated = conflicts.filter(c => c.status === 'escalated').length;
    const autoResolved = conflicts.filter(c => c.autoResolved).length;
    
    const resolvedConflicts = conflicts.filter(c => c.status === 'resolved' && c.resolvedAt);
    const avgResolutionTime = resolvedConflicts.length > 0
      ? resolvedConflicts.reduce((sum, c) => sum + (c.resolvedAt! - c.detectedAt), 0) / resolvedConflicts.length
      : 0;

    return {
      total: conflicts.length,
      pending,
      resolved,
      escalated,
      autoResolved,
      avgResolutionTime
    };
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.conflicts.clear();
    this.operationHistory.clear();
  }

  /**
   * Find operations that conflict with the given operation
   */
  private findConflictingOperations(
    operation: ConflictOperation, 
    existingOps: ConflictOperation[]
  ): ConflictOperation[] {
    const conflicts: ConflictOperation[] = [];
    const operationTime = operation.timestamp;

    for (const existingOp of existingOps) {
      // Check if operations are within conflict threshold
      const timeDiff = Math.abs(operationTime - existingOp.timestamp);
      if (timeDiff > this.config.autoResolveThreshold) {
        continue;
      }

      // Different users
      if (existingOp.userId === operation.userId) {
        continue;
      }

      // Check for specific conflict types
      if (this.isConflicting(operation, existingOp)) {
        conflicts.push(existingOp);
      }
    }

    return conflicts;
  }

  /**
   * Check if two operations conflict
   */
  private isConflicting(op1: ConflictOperation, op2: ConflictOperation): boolean {
    if (op1.type !== op2.type) {
      return false;
    }

    switch (op1.type) {
    case ConflictType.NODE_POSITION:
      return this.isPositionConflict(op1, op2);
      
    case ConflictType.NODE_PROPERTIES:
    case ConflictType.EDGE_PROPERTIES:
      return op1.property === op2.property;
      
    case ConflictType.NODE_CREATION:
    case ConflictType.NODE_DELETION:
      return op1.nodeId === op2.nodeId;
      
    case ConflictType.EDGE_CREATION:
    case ConflictType.EDGE_DELETION:
      return op1.edgeId === op2.edgeId;
      
    default:
      return false;
    }
  }

  /**
   * Check if position operations conflict
   */
  private isPositionConflict(op1: ConflictOperation, op2: ConflictOperation): boolean {
    if (op1.nodeId !== op2.nodeId) {
      return false;
    }

    const pos1 = op1.newValue;
    const pos2 = op2.newValue;
    
    if (!pos1 || !pos2 || typeof pos1.x !== 'number' || typeof pos1.y !== 'number') {
      return false;
    }

    const distance = Math.sqrt(
      Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2)
    );

    return distance < this.config.positionConflictThreshold;
  }

  /**
   * Create or update a conflict
   */
  private createOrUpdateConflict(
    operation: ConflictOperation, 
    conflictingOps: ConflictOperation[]
  ): Conflict {
    // Check if there's an existing conflict for this entity
    const existingConflict = this.findExistingConflict(operation);
    
    if (existingConflict) {
      // Add operation to existing conflict
      existingConflict.operations.push(operation);
      return existingConflict;
    }

    // Create new conflict
    const conflict: Conflict = {
      id: uuidv4(),
      type: operation.type,
      nodeId: operation.nodeId,
      edgeId: operation.edgeId,
      property: operation.property,
      operations: [operation, ...conflictingOps],
      detectedAt: Date.now(),
      documentId: operation.documentId,
      status: 'pending',
      autoResolved: false,
      description: this.generateConflictDescription(operation, conflictingOps)
    };

    this.conflicts.set(conflict.id, conflict);
    return conflict;
  }

  /**
   * Find existing conflict for an operation
   */
  private findExistingConflict(operation: ConflictOperation): Conflict | null {
    for (const conflict of this.conflicts.values()) {
      if (conflict.status !== 'pending') continue;
      
      if (conflict.type === operation.type &&
          conflict.nodeId === operation.nodeId &&
          conflict.edgeId === operation.edgeId &&
          conflict.property === operation.property) {
        return conflict;
      }
    }
    return null;
  }

  /**
   * Attempt automatic conflict resolution
   */
  private attemptAutoResolution(conflict: Conflict): ResolutionResult {
    // Use default strategy for auto-resolution
    return this.resolveConflictWithStrategy(conflict, this.config.defaultStrategy);
  }

  /**
   * Resolve conflict using specified strategy
   */
  private resolveConflictWithStrategy(
    conflict: Conflict, 
    strategy: ResolutionStrategy, 
    userSelection?: any
  ): ResolutionResult {
    switch (strategy) {
    case ResolutionStrategy.LAST_WRITER_WINS:
      return this.resolveLastWriterWins(conflict);
      
    case ResolutionStrategy.FIRST_WRITER_WINS:
      return this.resolveFirstWriterWins(conflict);
      
    case ResolutionStrategy.MERGE_PROPERTIES:
      return this.resolveMergeProperties(conflict);
      
    case ResolutionStrategy.POSITIONAL_OFFSET:
      return this.resolvePositionalOffset(conflict);
      
    case ResolutionStrategy.SEMANTIC_MERGE:
      return this.resolveSemanticMerge(conflict);
      
    case ResolutionStrategy.USER_RESOLUTION:
      return this.resolveUserSelection(conflict, userSelection);
      
    default:
      return this.resolveLastWriterWins(conflict);
    }
  }

  /**
   * Resolve using last writer wins strategy
   */
  private resolveLastWriterWins(conflict: Conflict): ResolutionResult {
    const latestOp = conflict.operations.reduce((latest, op) => 
      op.timestamp > latest.timestamp ? op : latest
    );

    return {
      conflict,
      resolvedValue: latestOp.newValue,
      operations: [latestOp],
      requiresUserInput: false,
      metadata: {
        discardedOperations: conflict.operations
          .filter(op => op.id !== latestOp.id)
          .map(op => op.id)
      }
    };
  }

  /**
   * Resolve using first writer wins strategy
   */
  private resolveFirstWriterWins(conflict: Conflict): ResolutionResult {
    const earliestOp = conflict.operations.reduce((earliest, op) => 
      op.timestamp < earliest.timestamp ? op : earliest
    );

    return {
      conflict,
      resolvedValue: earliestOp.newValue,
      operations: [earliestOp],
      requiresUserInput: false,
      metadata: {
        discardedOperations: conflict.operations
          .filter(op => op.id !== earliestOp.id)
          .map(op => op.id)
      }
    };
  }

  /**
   * Resolve by merging properties
   */
  private resolveMergeProperties(conflict: Conflict): ResolutionResult {
    if (conflict.type !== ConflictType.NODE_PROPERTIES && 
        conflict.type !== ConflictType.EDGE_PROPERTIES) {
      return this.resolveLastWriterWins(conflict);
    }

    const mergedValue = {};
    const mergedFields: string[] = [];

    // Merge all property changes
    for (const op of conflict.operations) {
      if (typeof op.newValue === 'object' && op.newValue !== null) {
        Object.assign(mergedValue, op.newValue);
        mergedFields.push(...Object.keys(op.newValue));
      }
    }

    return {
      conflict,
      resolvedValue: mergedValue,
      operations: conflict.operations,
      requiresUserInput: false,
      metadata: { mergedFields: [...new Set(mergedFields)] }
    };
  }

  /**
   * Resolve position conflicts with offset
   */
  private resolvePositionalOffset(conflict: Conflict): ResolutionResult {
    if (conflict.type !== ConflictType.NODE_POSITION) {
      return this.resolveLastWriterWins(conflict);
    }

    const operations = conflict.operations.sort((a, b) => a.timestamp - b.timestamp);
    const baseOp = operations[0];
    const offsetOps = operations.slice(1);

    const resolvedPositions = offsetOps.map((op, index) => {
      const offset = (index + 1) * 20; // 20px offset per conflicting operation
      return {
        ...op,
        newValue: {
          x: op.newValue.x + offset,
          y: op.newValue.y + offset
        }
      };
    });

    return {
      conflict,
      resolvedValue: baseOp.newValue,
      operations: [baseOp, ...resolvedPositions],
      requiresUserInput: false,
      metadata: { 
        offsetApplied: { x: 20, y: 20 }
      }
    };
  }

  /**
   * Resolve using semantic merge (placeholder for future AI-based resolution)
   */
  private resolveSemanticMerge(conflict: Conflict): ResolutionResult {
    // Placeholder for semantic merge - would use AI/ML for intelligent merging
    // For now, fall back to property merge or last writer wins
    
    if (conflict.type === ConflictType.NODE_PROPERTIES || 
        conflict.type === ConflictType.EDGE_PROPERTIES) {
      return this.resolveMergeProperties(conflict);
    }
    
    return this.resolveLastWriterWins(conflict);
  }

  /**
   * Resolve using user selection
   */
  private resolveUserSelection(conflict: Conflict, userSelection?: any): ResolutionResult {
    if (!userSelection) {
      return {
        conflict,
        resolvedValue: null,
        operations: [],
        requiresUserInput: true
      };
    }

    const selectedOp = conflict.operations.find(op => op.id === userSelection.operationId);
    if (!selectedOp) {
      return this.resolveLastWriterWins(conflict);
    }

    return {
      conflict,
      resolvedValue: userSelection.value || selectedOp.newValue,
      operations: [selectedOp],
      requiresUserInput: false,
      metadata: {
        discardedOperations: conflict.operations
          .filter(op => op.id !== selectedOp.id)
          .map(op => op.id)
      }
    };
  }

  /**
   * Store operation in history
   */
  private storeOperation(operation: ConflictOperation): void {
    const key = this.getOperationKey(operation);
    const existing = this.operationHistory.get(key) || [];
    existing.push(operation);
    
    // Keep only recent operations
    const cutoff = Date.now() - this.config.maxConflictAge;
    const filtered = existing.filter(op => op.timestamp > cutoff);
    
    this.operationHistory.set(key, filtered);
  }

  /**
   * Get key for operation storage
   */
  private getOperationKey(operation: ConflictOperation): string {
    if (operation.nodeId) {
      return `node:${operation.nodeId}`;
    }
    if (operation.edgeId) {
      return `edge:${operation.edgeId}`;
    }
    return `doc:${operation.documentId}`;
  }

  /**
   * Generate human-readable conflict description
   */
  private generateConflictDescription(
    operation: ConflictOperation, 
    conflictingOps: ConflictOperation[]
  ): string {
    const userCount = new Set([operation.userId, ...conflictingOps.map(op => op.userId)]).size;
    
    switch (operation.type) {
    case ConflictType.NODE_POSITION:
      return `${userCount} users moved the same node to different positions`;
      
    case ConflictType.NODE_PROPERTIES:
      return `${userCount} users changed properties of the same node`;
      
    case ConflictType.NODE_CREATION:
      return `${userCount} users created nodes at the same location`;
      
    case ConflictType.NODE_DELETION:
      return `${userCount} users tried to modify a deleted node`;
      
    case ConflictType.EDGE_CREATION:
      return `${userCount} users created conflicting edges`;
      
    case ConflictType.EDGE_DELETION:
      return `${userCount} users tried to modify a deleted edge`;
      
    case ConflictType.EDGE_PROPERTIES:
      return `${userCount} users changed properties of the same edge`;
      
    default:
      return `${userCount} users made conflicting changes`;
    }
  }

  /**
   * Start periodic cleanup of old conflicts and operations
   */
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.performCleanup();
    }, 60000); // Clean up every minute
  }

  /**
   * Perform cleanup of old data
   */
  private performCleanup(): void {
    const cutoff = Date.now() - this.config.conflictHistoryRetention;

    // Clean up old conflicts
    for (const [id, conflict] of this.conflicts) {
      if (conflict.status === 'resolved' && conflict.resolvedAt && conflict.resolvedAt < cutoff) {
        this.conflicts.delete(id);
      }
    }

    // Clean up old operations
    for (const [key, operations] of this.operationHistory) {
      const filtered = operations.filter(op => op.timestamp > cutoff);
      if (filtered.length === 0) {
        this.operationHistory.delete(key);
      } else {
        this.operationHistory.set(key, filtered);
      }
    }
  }
}