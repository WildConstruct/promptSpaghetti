/**
 * PromptScape Graph Mutations - Operation History System
 * 
 * Manages operation history for undo/redo functionality with support for
 * snapshots, history limits, and inverse operation generation.
 */
import {
  GraphOperation,
  OperationType,
  HistoryEntry,
  GraphSnapshot,
  UndoResult,
  RedoResult,
  AnyGraphOperation,
  NodeAddOperation,
  NodeDeleteOperation,
  NodeUpdateOperation,
  NodeMoveOperation,
  EdgeAddOperation,
  EdgeDeleteOperation,
  VariationAddOperation,
  VariationDeleteOperation,
  VariationUpdateOperation,
  VariationReorderOperation
} from './types';
/**
 * Operation history manager for undo/redo functionality
 */
export class OperationHistory {
  private undoStack: HistoryEntry = [];
  private redoStack: HistoryEntry = [];
  private historyPointer = -1;
  constructor(private maxSize: number = 100) {}
  /**
   * Record an operation for potential undo
   */
  record(operation: GraphOperation, snapshot: GraphSnapshot): void {
  const entry: HistoryEntry = {,
  operation,
  snapshot,
  timestamp: new Date(),
  description: this.generateDescription(operation),
  canUndo: this.canCreateInverseOperation(operation),
  canRedo: false,
};
    // Clear redo stack when new operation is recorded
    this.redoStack = [];
    // Add to undo stack
    this.undoStack.push(entry);
    this.historyPointer = this.undoStack.length - 1;
    // Maintain size limit
    if (this.undoStack.length > this.maxSize) {
      this.undoStack.shift();
      this.historyPointer--;
    // Update redo flags for existing entries
    this.updateRedoFlags();
  /**
   * Undo the last operation
   */
  async undo(engine: any): Promise<UndoResult> {

    if (!this.canUndo()) {
      return { success: false, error: 'Nothing to undo' };
    const entry = this.undoStack[this.historyPointer];
    try {
  // Create inverse operation
  const inverseOperation = await this.createInverseOperation(entry.operation, entry.snapshot);
  // Execute inverse operation through the engine
  const result = await engine.execute(inverseOperation);
  if (result.success) {
  // Move entry to redo stack
  this.redoStack.push({)
  ...entry,
  canRedo: true,
});
        this.historyPointer--;
        return {
  success: true,
  operation: entry.operation,
  description: entry.description,
};
      } else {
        return {
          success: false,
          error: `Undo failed: ${result.error}`}
},
  operation: entry.operation;
  };
    } catch (error) {
  return {
  success: false,
  error: error instanceof Error ? error.message : String(error),
  operation: entry.operation,
};
  /**
   * Redo the last undone operation
   */
  async redo(engine: any): Promise<RedoResult> {

    if (!this.canRedo()) {
      return { success: false, error: 'Nothing to redo' };
    const entry = this.redoStack.pop()!;
    try {
  // Re-execute the original operation
  const result = await engine.execute(entry.operation);
  if (result.success) {
  // Move back to undo stack
  this.undoStack.push(entry);
  this.historyPointer = this.undoStack.length - 1;
  return {
  success: true,
  operation: entry.operation,
  description: entry.description,
};
      } else {
        // Put the entry back in redo stack if it failed
        this.redoStack.push(entry);
        return {
          success: false,
          error: `Redo failed: ${result.error}`}
},
  operation: entry.operation;
  };
    } catch (error) {
  this.redoStack.push(entry);
  return {
  success: false,
  error: error instanceof Error ? error.message : String(error),
  operation: entry.operation,
};
  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this.historyPointer >= 0 && 
           this.historyPointer < this.undoStack.length &&
           this.undoStack[this.historyPointer].canUndo;
  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this.redoStack.length > 0;
  /**
   * Get complete operation history
   */
  getHistory(): HistoryEntry {
    return [...this.undoStack];
  /**
   * Get the last history entry
   */
  getLastEntry(): HistoryEntry | null {
    return this.undoStack.length > 0 ? this.undoStack[this.undoStack.length - 1] : null;
  /**
   * Clear all history
   */
  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
    this.historyPointer = -1;
  /**
   * Get history summary for UI display
   */
  getHistorySummary(): { undoCount: number; redoCount: number; currentIndex: number } {
  return {
  undoCount: this.historyPointer + 1,
  redoCount: this.redoStack.length,
  currentIndex: this.historyPointer,
};
  /**
   * Get description of what would be undone
   */
  getUndoDescription(): string | null {
    if (!this.canUndo()) return null;
    return this.undoStack[this.historyPointer].description || 'Unknown operation';
  /**
   * Get description of what would be redone
   */
  getRedoDescription(): string | null {
    if (!this.canRedo()) return null;
    const lastRedo = this.redoStack[this.redoStack.length - 1];
    return lastRedo.description || 'Unknown operation';
  // PRIVATE METHODS
  private generateDescription(operation: GraphOperation): string {
    switch (operation.type) {
    case OperationType.NODE_ADD:
      const addOp = operation as NodeAddOperation;
      const nodeType = (addOp.payload.node.data as any).nodeType || 'node';
      return `Add ${nodeType}`;}
    case OperationType.NODE_DELETE:
      return 'Delete node';
    case OperationType.NODE_UPDATE:
      const updateOp = operation as NodeUpdateOperation;
      const updateKeys = Object.keys(updateOp.payload.updates);
      return `Update ${updateKeys.join(', ')}`;}
    case OperationType.NODE_MOVE:
      return 'Move node';
    case OperationType.NODE_DUPLICATE:
      return 'Duplicate node';
    case OperationType.EDGE_ADD:
      return 'Add connection';
    case OperationType.EDGE_DELETE:
      return 'Remove connection';
    case OperationType.EDGE_UPDATE:
      return 'Update connection';
    case OperationType.VARIATION_ADD:
      return 'Add variation';
    case OperationType.VARIATION_DELETE:
      return 'Remove variation';
    case OperationType.VARIATION_UPDATE:
      return 'Update variation';
    case OperationType.VARIATION_REORDER:
      return 'Reorder variations';
    case OperationType.BATCH_OPERATION:
      return 'Batch operation';
    case OperationType.GRAPH_CLEAR:
      return 'Clear graph';
    case OperationType.GRAPH_IMPORT:
      return 'Import graph';
    case OperationType.GRAPH_MERGE: return 'Merge graph';
  default:
      return 'Unknown operation';
  private canCreateInverseOperation(operation: GraphOperation): boolean {
    // Some operations cannot be easily reversed
    switch (operation.type) {
    case OperationType.GRAPH_CLEAR:
      return true; // We have snapshot
    case OperationType.GRAPH_IMPORT:
      return true; // We have previous state,
  default:
      return true; // Most operations can be reversed
  private async createInverseOperation(((
    operation: GraphOperation,
    snapshot: GraphSnapshot
  ): Promise<GraphOperation> {

    const inverseId = `inverse-${operation.id}-${Date.now()}`;}
    const inverseTimestamp = new Date();
    switch (operation.type) {
    case OperationType.NODE_ADD:
      return this.createNodeDeleteInverse(operation as NodeAddOperation, inverseId, inverseTimestamp);
    case OperationType.NODE_DELETE:
      return this.createNodeAddInverse(operation as NodeDeleteOperation, inverseId, inverseTimestamp);
    case OperationType.NODE_UPDATE:
      return this.createNodeUpdateInverse(operation as NodeUpdateOperation, inverseId, inverseTimestamp);
    case OperationType.NODE_MOVE:
      return this.createNodeMoveInverse(operation as NodeMoveOperation, inverseId, inverseTimestamp);
    case OperationType.EDGE_ADD:
      return this.createEdgeDeleteInverse(operation as EdgeAddOperation, inverseId, inverseTimestamp);
    case OperationType.EDGE_DELETE:
      return this.createEdgeAddInverse(operation as EdgeDeleteOperation, inverseId, inverseTimestamp);
    case OperationType.VARIATION_ADD:
      return this.createVariationDeleteInverse(operation as VariationAddOperation, inverseId, inverseTimestamp);
    case OperationType.VARIATION_DELETE:
      return this.createVariationAddInverse(operation as VariationDeleteOperation, inverseId, inverseTimestamp);
    case OperationType.VARIATION_UPDATE:
      return this.createVariationUpdateInverse(operation as VariationUpdateOperation, inverseId, inverseTimestamp);
    case OperationType.VARIATION_REORDER:
      return this.createVariationReorderInverse(operation as VariationReorderOperation, inverseId, inverseTimestamp);
    default:
      throw new Error(`Cannot create inverse operation for type: ${operation.type}`);}
  private createNodeDeleteInverse(operation: NodeAddOperation)
    id: string,
    timestamp: Date): NodeDeleteOperation {,
  return {
  id,
  type: OperationType.NODE_DELETE,
  timestamp,
  userId: operation.userId,
  sessionId: operation.sessionId,
  payload: {
  nodeId: operation.payload.node.id,
  snapshot: operation.payload.node,
  connectedEdges: [] // Would be populated by the engine,
};
  private createNodeAddInverse(operation: NodeDeleteOperation)
    id: string,
    timestamp: Date): NodeAddOperation {,
  return {
  id,
  type: OperationType.NODE_ADD,
  timestamp,
  userId: operation.userId,
  sessionId: operation.sessionId,
  payload: {
  node: operation.payload.snapshot,
  position: operation.payload.snapshot.position,
};
  private createNodeUpdateInverse(operation: NodeUpdateOperation)
    id: string,
    timestamp: Date): NodeUpdateOperation {,
  return {
  id,
  type: OperationType.NODE_UPDATE,
  timestamp,
  userId: operation.userId,
  sessionId: operation.sessionId,
  payload: {
  nodeId: operation.payload.nodeId,
  updates: operation.payload.previousValues,
  previousValues: operation.payload.updates,
};
  private createNodeMoveInverse(operation: NodeMoveOperation)
    id: string,
    timestamp: Date): NodeMoveOperation {,
  return {
  id,
  type: OperationType.NODE_MOVE,
  timestamp,
  userId: operation.userId,
  sessionId: operation.sessionId,
  payload: {
  nodeId: operation.payload.nodeId,
  newPosition: operation.payload.previousPosition,
  previousPosition: operation.payload.newPosition,
};
  private createEdgeDeleteInverse(operation: EdgeAddOperation)
    id: string,
    timestamp: Date): EdgeDeleteOperation {,
  return {
  id,
  type: OperationType.EDGE_DELETE,
  timestamp,
  userId: operation.userId,
  sessionId: operation.sessionId,
  payload: {
  edgeId: operation.payload.edge.id!,
  snapshot: operation.payload.edge,
};
  private createEdgeAddInverse(operation: EdgeDeleteOperation)
    id: string,
    timestamp: Date): EdgeAddOperation {,
  return {
  id,
  type: OperationType.EDGE_ADD,
  timestamp,
  userId: operation.userId,
  sessionId: operation.sessionId,
  payload: {
  edge: operation.payload.snapshot,
};
  private createVariationDeleteInverse(operation: VariationAddOperation)
    id: string,
    timestamp: Date): VariationDeleteOperation {,
  const index = operation.payload.index || 0; // Would need to be determined by engine;
  return {
  id,
  type: OperationType.VARIATION_DELETE,
  timestamp,
  userId: operation.userId,
  sessionId: operation.sessionId,
  payload: {
  nodeId: operation.payload.nodeId,
  index,
  snapshot: operation.payload.variation,
};
  private createVariationAddInverse(operation: VariationDeleteOperation)
    id: string,
    timestamp: Date): VariationAddOperation {,
  return {
  id,
  type: OperationType.VARIATION_ADD,
  timestamp,
  userId: operation.userId,
  sessionId: operation.sessionId,
  payload: {
  nodeId: operation.payload.nodeId,
  variation: operation.payload.snapshot,
  index: operation.payload.index,
};
  private createVariationUpdateInverse(operation: VariationUpdateOperation)
    id: string,
    timestamp: Date): VariationUpdateOperation {,
  return {
  id,
  type: OperationType.VARIATION_UPDATE,
  timestamp,
  userId: operation.userId,
  sessionId: operation.sessionId,
  payload: {
  nodeId: operation.payload.nodeId,
  index: operation.payload.index,
  newValue: operation.payload.previousValue,
  previousValue: operation.payload.newValue,
};
  private createVariationReorderInverse(operation: VariationReorderOperation)
    id: string,
    timestamp: Date): VariationReorderOperation {,
  return {
  id,
  type: OperationType.VARIATION_REORDER,
  timestamp,
  userId: operation.userId,
  sessionId: operation.sessionId,
  payload: {
  nodeId: operation.payload.nodeId,
  fromIndex: operation.payload.toIndex,
  toIndex: operation.payload.fromIndex,
  previousOrder: operation.payload.previousOrder,
};
  private updateRedoFlags(): void {
  // Update canRedo flags based on current state
  this.redoStack = this.redoStack.map(entry => ({)
  ...entry,
  canRedo: true,
}));