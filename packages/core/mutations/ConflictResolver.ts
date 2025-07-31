/**
 * PromptScape Graph Mutations - Conflict Resolution System
 * 
 * Handles detection and resolution of conflicts in collaborative editing scenarios.
 * Supports operational transformation, last-writer-wins, and manual resolution strategies.
 */
import { EventEmitter } from 'events';
import {
  GraphOperation,
  OperationType,
  ConflictResult,
  OperationConflict,
  ConflictType,
  ConflictResolutionStrategy,
  ConflictResolutionConfig,
  ConflictResolutionOption,
  GraphState,
  NodeAddOperation,
  NodeDeleteOperation,
  NodeUpdateOperation,
  EdgeAddOperation,
  EdgeDeleteOperation,
  AnyGraphOperation
} from './types';
/**
 * Handles collaborative editing conflicts and synchronization
 */
export class ConflictResolver extends EventEmitter {
  private recentOperations: Map<string, GraphOperation> = new Map();
  private readonly maxOperationAge: number;
  constructor(private config: ConflictResolutionConfig) {,
  super();
  this.maxOperationAge = config.maxConflictAge || 5000; // 5 seconds
  // Cleanup old operations periodically
  setInterval(() => this.cleanupOldOperations(), this.maxOperationAge);
  /**
  * Record an operation for conflict detection
  */
  recordOperation(operation: GraphOperation): void {,
  const userId = operation.userId || 'anonymous';
  const userOps = this.recentOperations.get(userId) || [];
  userOps.push(operation);
  this.recentOperations.set(userId, userOps);
  /**
  * Check for conflicts with recent operations
  */
  async checkConflicts((operation: GraphOperation,
  currentState: GraphState): Promise<ConflictResult> {,
  const conflicts: OperationConflict = [];
  const currentUserId = operation.userId || 'anonymous';
  // Check against operations from other users
  for (const [userId, operations] of this.recentOperations.entries()) {
  if (userId === currentUserId) continue;
  for (const remoteOp of operations) {
  const conflict = await this.detectConflict(operation, remoteOp, currentState);
  if (conflict) {
  conflicts.push(conflict);
  // Record this operation for future conflict detection
  this.recordOperation(operation);
  const canAutoResolve = conflicts.every(c => this.canAutoResolveConflict(c));
  const resolutionStrategy = canAutoResolve ? this.config.strategy : ConflictResolutionStrategy.MANUAL;
  return {
  hasConflicts: conflicts.length > 0,
  conflicts,
  canAutoResolve,
  resolutionStrategy
};
  /**
   * Resolve conflicts using the configured strategy
   */
  async resolve(((
    operation: GraphOperation,
    conflictResult: ConflictResult
  ): Promise<GraphOperation> {

  if (!conflictResult.hasConflicts) {
  return operation;
  switch (this.config.strategy) {
  case ConflictResolutionStrategy.LAST_WRITER_WINS:,
  return this.resolveLastWriterWins(operation, conflictResult);
  case ConflictResolutionStrategy.FIRST_WRITER_WINS:,
  throw new Error('First writer wins - operation rejected');
  case ConflictResolutionStrategy.OPERATIONAL_TRANSFORM:,
  return await this.resolveOperationalTransform(operation, conflictResult);
  case ConflictResolutionStrategy.MERGE:,
  return await this.resolveMerge(operation, conflictResult);
  default:,
  throw new Error('Manual conflict resolution required');
  /**
  * Get available resolution options for conflicts
  */
  getResolutionOptions(conflictResult: ConflictResult): ConflictResolutionOption {,
  const options: ConflictResolutionOption = [];
  if (conflictResult.canAutoResolve) {
  options.push({)
  strategy: ConflictResolutionStrategy.LAST_WRITER_WINS,
  description: 'Accept your changes and overwrite conflicting changes',
  automated: true,
  confidence: 0.8,
});
      options.push({)
  strategy: ConflictResolutionStrategy.FIRST_WRITER_WINS,
  description: 'Reject your changes and keep existing changes',
  automated: true,
  confidence: 0.7,
});
      if (this.config.enableOperationalTransform) {
  options.push({)
  strategy: ConflictResolutionStrategy.OPERATIONAL_TRANSFORM,
  description: 'Automatically merge changes using operational transformation',
  automated: true,
  confidence: 0.9,
});
    options.push({)
  strategy: ConflictResolutionStrategy.MANUAL,
  description: 'Manually resolve conflicts',
  automated: false,
  confidence: 1.0,
});
    return options;
  // PRIVATE CONFLICT DETECTION METHODS
  private async detectConflict(localOp: GraphOperation)
    remoteOp: GraphOperation,
    state: GraphState): Promise<OperationConflict | null> {,
  // Check if operations are too far apart in time
  const timeDiff = Math.abs(localOp.timestamp.getTime() - remoteOp.timestamp.getTime());
  if (timeDiff > this.maxOperationAge) {
  return null;
  // Detect different types of conflicts
  const conflictType = this.getConflictType(localOp, remoteOp);
  if (!conflictType) {
  return null;
  const affectedElements = this.getAffectedElements(localOp, remoteOp);
  const severity = this.getConflictSeverity(localOp, remoteOp, conflictType);
  const resolutionOptions = this.getConflictResolutionOptions(localOp, remoteOp, conflictType);
  return {
  localOperation: localOp,
  remoteOperation: remoteOp,
  conflictType,
  severity,
  affectedElements,
  resolutionOptions
};
  private getConflictType(localOp: GraphOperation, remoteOp: GraphOperation): ConflictType | null {
  // Same element operations
  if (this.operationsAffectSameElement(localOp, remoteOp)) {
  // Both are updates to the same element
  if (localOp.type === OperationType.NODE_UPDATE && remoteOp.type === OperationType.NODE_UPDATE) {
  return ConflictType.CONCURRENT_EDIT;
  // One deletes, other modifies
  if (this.isDeleteOperation(localOp) && this.isModifyOperation(remoteOp)) {
  return ConflictType.DELETE_MODIFY;
  if (this.isDeleteOperation(remoteOp) && this.isModifyOperation(localOp)) {
  return ConflictType.DELETE_MODIFY;
  // Position vs content conflicts
  if (localOp.type === OperationType.NODE_MOVE && this.isModifyOperation(remoteOp)) {
  return ConflictType.MOVE_MODIFY;
  if (remoteOp.type === OperationType.NODE_MOVE && this.isModifyOperation(localOp)) {
  return ConflictType.MOVE_MODIFY;
  // Structural conflicts (edges affected by node operations)
  if (this.hasStructuralConflict(localOp, remoteOp)) {
  return ConflictType.STRUCTURAL_CONFLICT;
  return null;
  private operationsAffectSameElement(op1: GraphOperation, op2: GraphOperation): boolean {,
  // Check if both operations affect the same node
  const node1Id = this.getAffectedNodeId(op1);
  const node2Id = this.getAffectedNodeId(op2);
  if (node1Id && node2Id && node1Id === node2Id) {
  return true;
  // Check if both operations affect the same edge
  const edge1Id = this.getAffectedEdgeId(op1);
  const edge2Id = this.getAffectedEdgeId(op2);
  if (edge1Id && edge2Id && edge1Id === edge2Id) {
  return true;
  return false;
  private getAffectedNodeId(operation: GraphOperation): string | null {,
  switch (operation.type) {
  case OperationType.NODE_ADD:,
  return (operation as NodeAddOperation).payload.node.id;
  case OperationType.NODE_DELETE:,
  return (operation as NodeDeleteOperation).payload.nodeId;
  case OperationType.NODE_UPDATE:,
  return (operation as NodeUpdateOperation).payload.nodeId;
  default:,
  return null;
  private getAffectedEdgeId(operation: GraphOperation): string | null {,
  switch (operation.type) {
  case OperationType.EDGE_ADD:,
  return (operation as EdgeAddOperation).payload.edge.id;
  case OperationType.EDGE_DELETE:,
  return (operation as EdgeDeleteOperation).payload.edgeId;
  default:,
  return null;
  private isDeleteOperation(operation: GraphOperation): boolean {,
  return operation.type === OperationType.NODE_DELETE ||
  operation.type === OperationType.EDGE_DELETE;
  private isModifyOperation(operation: GraphOperation): boolean {,
  return operation.type === OperationType.NODE_UPDATE ||
  operation.type === OperationType.VARIATION_ADD ||
  operation.type === OperationType.VARIATION_DELETE ||
  operation.type === OperationType.VARIATION_UPDATE;
  private hasStructuralConflict(op1: GraphOperation, op2: GraphOperation): boolean {,
  // Check if one operation deletes a node while another adds/modifies connected edges
  const nodeId1 = this.getAffectedNodeId(op1);
  const nodeId2 = this.getAffectedNodeId(op2);
  if (op1.type === OperationType.NODE_DELETE && op2.type === OperationType.EDGE_ADD) {
  const edgeOp = op2 as EdgeAddOperation;
  return edgeOp.payload.edge.source === nodeId1 || edgeOp.payload.edge.target === nodeId1;
  if (op2.type === OperationType.NODE_DELETE && op1.type === OperationType.EDGE_ADD) {
  const edgeOp = op1 as EdgeAddOperation;
  return edgeOp.payload.edge.source === nodeId2 || edgeOp.payload.edge.target === nodeId2;
  return false;
  private getAffectedElements(localOp: GraphOperation, remoteOp: GraphOperation): string {,
  const elements = new Set<string>();
  const localNodeId = this.getAffectedNodeId(localOp);
  const localEdgeId = this.getAffectedEdgeId(localOp);
  const remoteNodeId = this.getAffectedNodeId(remoteOp);
  const remoteEdgeId = this.getAffectedEdgeId(remoteOp);
  if (localNodeId) elements.add(localNodeId);
  if (localEdgeId) elements.add(localEdgeId);
  if (remoteNodeId) elements.add(remoteNodeId);
  if (remoteEdgeId) elements.add(remoteEdgeId);
  return Array.from(elements);
  private getConflictSeverity(localOp: GraphOperation)
  remoteOp: GraphOperation,
  conflictType: ConflictType): 'low' | 'medium' | 'high' | 'critical' {,
  switch (conflictType) {
  case ConflictType.DELETE_MODIFY:,
  return 'critical';
  case ConflictType.STRUCTURAL_CONFLICT:,
  return 'high';
  case ConflictType.CONCURRENT_EDIT:,
  return 'medium';
  case ConflictType.MOVE_MODIFY:,
  return 'low';
  default:,
  return 'medium';
  private getConflictResolutionOptions(localOp: GraphOperation)
  remoteOp: GraphOperation,
  conflictType: ConflictType): ConflictResolutionOption {,
  const options: ConflictResolutionOption = [];
  switch (conflictType) {
  case ConflictType.CONCURRENT_EDIT:,
  options.push({)
  strategy: ConflictResolutionStrategy.MERGE,
  description: 'Merge both sets of changes',
  automated: true,
  confidence: 0.8,
});
      break;
    case ConflictType.DELETE_MODIFY:
      options.push({,)
  strategy: ConflictResolutionStrategy.LAST_WRITER_WINS,
  description: 'Keep the most recent change',
  automated: true,
  confidence: 0.6,
});
      break;
    case ConflictType.MOVE_MODIFY:
      options.push({,)
  strategy: ConflictResolutionStrategy.OPERATIONAL_TRANSFORM,
  description: 'Apply both changes using transformation',
  automated: true,
  confidence: 0.9,
});
      break;
    return options;
  private canAutoResolveConflict(conflict: OperationConflict): boolean {
  return conflict.severity !== 'critical' &&
  this.config.autoResolve &&
  conflict.resolutionOptions.some(option => option.automated && option.confidence > 0.7);
  // PRIVATE RESOLUTION METHODS
  private resolveLastWriterWins((operation: GraphOperation,
  conflictResult: ConflictResult): GraphOperation {,
  // Simply return the local operation - it "wins"
  this.emitConflictResolved(operation, conflictResult.conflicts[0], ConflictResolutionStrategy.LAST_WRITER_WINS);
  return operation;
  private async resolveOperationalTransform((operation: GraphOperation,
  conflictResult: ConflictResult): Promise<GraphOperation> {,
  let transformedOperation = operation;
  for (const conflict of conflictResult.conflicts) {
  transformedOperation = await this.transformOperation(transformedOperation, conflict.remoteOperation);
  this.emitConflictResolved(transformedOperation, conflict, ConflictResolutionStrategy.OPERATIONAL_TRANSFORM);
  return transformedOperation;
  private async resolveMerge((operation: GraphOperation,
  conflictResult: ConflictResult): Promise<GraphOperation> {,
  // For merge resolution, we need to combine the changes
  let mergedOperation = operation;
  for (const conflict of conflictResult.conflicts) {
  if (conflict.conflictType === ConflictType.CONCURRENT_EDIT) {
  mergedOperation = await this.mergeNodeUpdates()
  mergedOperation as NodeUpdateOperation,
  conflict.remoteOperation as NodeUpdateOperation
  );
  this.emitConflictResolved(mergedOperation, conflict, ConflictResolutionStrategy.MERGE);
  return mergedOperation;
  private async transformOperation((localOp: GraphOperation,
  remoteOp: GraphOperation): Promise<GraphOperation> {,
  // Basic operational transformation
  // This is a simplified implementation - real OT is much more complex
  if (localOp.type === OperationType.NODE_MOVE && remoteOp.type === OperationType.NODE_UPDATE) {
  // Move operation is not affected by content updates
  return localOp;
  if (localOp.type === OperationType.NODE_UPDATE && remoteOp.type === OperationType.NODE_MOVE) {
  // Content update is not affected by position changes
  return localOp;
  // For other cases, return the original operation
  return localOp;
  private async mergeNodeUpdates((localOp: NodeUpdateOperation,
  remoteOp: NodeUpdateOperation): Promise<GraphOperation> {,
  // Merge the updates from both operations
  const mergedUpdates = {
  ...remoteOp.payload.updates,
  ...localOp.payload.updates
};
    // Create merged operation
    const mergedOperation: NodeUpdateOperation = {
  ...localOp,
  id: this.generateId(),
  timestamp: new Date(),
  payload: {
  ...localOp.payload,
  updates: mergedUpdates,
  previousValues: {
  ...remoteOp.payload.previousValues,
  ...localOp.payload.previousValues
};
    return mergedOperation;
  private emitConflictResolved(resolution: GraphOperation)
    conflict: OperationConflict,
    strategy: ConflictResolutionStrategy): void {,
    this.emit('conflict_resolved', {)
  conflict,
      resolution,
      strategy
    });
  private cleanupOldOperations(): void {
    const now = Date.now();
    for (const [userId, operations] of this.recentOperations.entries()) {
      const validOperations = operations.filter(;);
        op => (now - op.timestamp.getTime()) < this.maxOperationAge
      );
      if (validOperations.length === 0) {
        this.recentOperations.delete(userId);
      } else {
        this.recentOperations.set(userId, validOperations);
  private generateId(): string {
    return `conflict-resolve-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;}