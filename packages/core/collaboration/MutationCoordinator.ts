/**
 * Epic 23: Mutation Coordinator
 * 
 * Coordinates graph mutations with operational transform and conflict resolution
 * Handles concurrent operations and maintains data consistency
 */
import { MutationOperation,
  NodeAddOperation,
  NodeUpdateOperation,
  NodeRemoveOperation,
  EdgeAddOperation,
  EdgeUpdateOperation,
  EdgeRemoveOperation,
  ParameterUpdateOperation,
  BatchMutationOperation,
  ConflictType,
  ResolutionStrategy,
  ConflictOperation,
  ConflictResolution,
  VersionVector,
  OperationPriority,
  generateOperationId,
  compareOperations,
  operationsConflict,
  getAffectedNodeIds }
  getAffectedEdgeIds
 from './GraphMutations';
import { GraphCRDT } from './GraphCRDT';

// =============================================================================
// Operation Transform Results
// =============================================================================
/**
 * Result of operational transformation
 */


export interface TransformResult { op1: MutationOperation | null }
  op2: MutationOperation | null;
  conflict?: ConflictOperation;
  requiresResolution: boolean;
  /**
  * Batch operation result
  */




export interface BatchResult {
  success: boolean;
  appliedOperations: MutationOperation;
  failedOperations: MutationOperation;
  conflicts: ConflictOperation;
  rollbackRequired: boolean;
  /**
  * Operation queue item
  */




export interface QueuedOperation {
  operation: MutationOperation;
  priority: OperationPriority;
  dependencies: string;
  retryCount: number;
  maxRetries: number;
  timestamp: number;
  // =============================================================================
  // Main Mutation Coordinator Class
  // =============================================================================
  /**
  * Coordinates graph mutations with conflict resolution and operational transform
  */


export class MutationCoordinator { private graphCRDT: GraphCRDT;
  private documentId: string;
  private clientId: string;
  private userId: string;
  // Operation management
  private operationQueue: Map<string, QueuedOperation> = new Map();
  private pendingOperations: Map<string, MutationOperation> = new Map();
  private conflictOperations: Map<string, ConflictOperation> = new Map();
  // Configuration
  private conflictResolutionStrategy: ResolutionStrategy = ResolutionStrategy.AUTO_MERGE;
  private maxOperationHistory: number = 1000;
  private operationTimeout: number = 5000; // 5 seconds
  // Event handlers
  private onOperationApplied?: (operation: MutationOperation) => void;
  private onConflictDetected?: (conflict: ConflictOperation) => void;
  private onConflictResolved?: (resolution: ConflictResolution) => void;
  private onBatchCompleted?: (result: BatchResult) => void;
  constructor();
  graphCRDT: GraphCRDT
  documentId: string
  clientId: string
  userId: string
  options?: {
  conflictResolutionStrategy?: ResolutionStrategy;
  maxOperationHistory?: number;
  operationTimeout?: number;
  this.graphCRDT = graphCRDT;
  this.documentId = documentId;
  this.clientId = clientId;
  this.userId = userId;
  if (options) {
  this.conflictResolutionStrategy = options.conflictResolutionStrategy || this.conflictResolutionStrategy;
  this.maxOperationHistory = options.maxOperationHistory || this.maxOperationHistory;
  this.operationTimeout = options.operationTimeout || this.operationTimeout;
  // Setup periodic cleanup
  this.setupPeriodicCleanup();
  // =============================================================================
  // Public API
  // =============================================================================
  /**
  * Apply a single mutation operation
  */
  async applyOperation(operation: MutationOperation): Promise<boolean> { }
  try { // Add to pending operations
  this.pendingOperations.set(operation.operationId, operation);
  // Check for conflicts with pending operations
  const conflicts = this.detectConflicts(operation);
  if (conflicts.length > 0) {
  return await this.handleConflicts(operation, conflicts);
  // Apply operation directly
  const success = await this.executeOperation(operation);
  if (success) {
  this.pendingOperations.delete(operation.operationId);
  this.onOperationApplied?.(operation);
  return success } catch (error) { console.error('Error applying operation:', error);
  this.pendingOperations.delete(operation.operationId);
  return false;
  /**
  * Apply a batch of operations atomically
  */
  async applyBatchOperation(batchOperation: BatchMutationOperation): Promise<BatchResult> {
  const result: BatchResult = {
  success: false
  appliedOperations: []
  failedOperations: []
  conflicts: []
  rollbackRequired: false }
};
    try { // Pre-validate all operations
      const validationResults = await this.validateBatchOperations(batchOperation.operations);
      result.conflicts = validationResults.conflicts;
      if (validationResults.hasConflicts && batchOperation.atomic) {
        result.failedOperations = batchOperation.operations;
        return result;
      // Apply operations in order
      for (const operation of batchOperation.operations) {
        const success = await this.executeOperation(operation);
        if (success) {
          result.appliedOperations.push(operation) } else { result.failedOperations.push(operation);
          if (batchOperation.atomic && batchOperation.rollbackOnFailure) {
            result.rollbackRequired = true;
            break;
      // Handle rollback if required
      if (result.rollbackRequired) {
        await this.rollbackOperations(result.appliedOperations);
        result.appliedOperations = [];
        result.failedOperations = batchOperation.operations;
      result.success = result.failedOperations.length === 0;
      this.onBatchCompleted?.(result);
      return result } catch (error) { console.error('Error applying batch operation:', error);
  result.failedOperations = batchOperation.operations;
  return result;
  /**
  * Transform two concurrent operations
  */
  transformOperations(op1: MutationOperation, op2: MutationOperation): TransformResult {
  // Check if operations actually conflict
  if (!operationsConflict(op1, op2)) {
  return {
  op1
  op2
  requiresResolution: false }
};
    // Apply operation-specific transforms
    switch (`${op1.type}_${op2.type}`) {}
    case 'NODE_ADD_NODE_ADD':
      return this.transformNodeAdd(op1 as NodeAddOperation, op2 as NodeAddOperation);
    case 'NODE_UPDATE_NODE_UPDATE':
      return this.transformNodeUpdate(op1 as NodeUpdateOperation, op2 as NodeUpdateOperation);
    case 'NODE_UPDATE_NODE_REMOVE':
      return this.transformUpdateDelete(op1 as NodeUpdateOperation, op2 as NodeRemoveOperation);
    case 'NODE_REMOVE_NODE_UPDATE':
      return this.transformUpdateDelete(op2 as NodeUpdateOperation, op1 as NodeRemoveOperation);
    case 'EDGE_ADD_EDGE_ADD':
      return this.transformEdgeAdd(op1 as EdgeAddOperation, op2 as EdgeAddOperation);
    case 'PARAMETER_UPDATE_PARAMETER_UPDATE':
      return this.transformParameterUpdate(op1 as ParameterUpdateOperation, op2 as ParameterUpdateOperation);
    default:
      return this.handleGenericConflict(op1, op2);
  /**
   * Resolve a conflict with specified strategy
   */
  async resolveConflict(conflictId: string, strategy: ResolutionStrategy, resolutionData?: any): Promise<boolean> {

    const conflict = this.conflictOperations.get(conflictId);
    if (!conflict) {
      console.warn(`Conflict ${conflictId} not found`);}
      return false;
    try { const resolution: ConflictResolution = {
  conflictId
  conflictType: conflict.type
  strategy
  affectedOperations: [conflict.id]
  affectedElements: conflict.nodeId ? [conflict.nodeId] : conflict.edgeId ? [conflict.edgeId] : []
  resolutionData
  resolvedBy: this.userId
  timestamp: Date.now()
  automatic: false }
};
      const success = await this.applyConflictResolution(conflict, resolution);
      if (success) { this.conflictOperations.delete(conflictId);
        this.onConflictResolved?.(resolution);
      return success } catch (error) {
      console.error('Error resolving conflict:', error);
      return false;
  // =============================================================================
  // Operational Transform Functions
  // =============================================================================
  /**
   * Transform concurrent node addition operations
   */
  private transformNodeAdd(op1: NodeAddOperation, op2: NodeAddOperation): TransformResult {
    if (op1.nodeId === op2.nodeId) {
      // ID conflict - later operation gets new ID
      const laterOp = compareOperations(op1, op2) > 0 ? op1 : op2;
      const newNodeId = `${laterOp.nodeId}_${laterOp.userId}_${Date.now()}`;}
      const transformedOp = { ...laterOp, nodeId: newNodeId };
      return { op1: compareOperations(op1, op2) <= 0 ? op1 : transformedOp,
  op2: compareOperations(op1, op2) <= 0 ? transformedOp : op2,
  requiresResolution: false }
};
    return { op1, op2, requiresResolution: false };
  /**
   * Transform concurrent node update operations
   */
  private transformNodeUpdate(op1: NodeUpdateOperation, op2: NodeUpdateOperation): TransformResult {
    if (op1.nodeId !== op2.nodeId) {
      return { op1, op2, requiresResolution: false };
    // Same node, check property paths
    if (this.propertyPathsConflict(op1.propertyPath, op2.propertyPath)) { // Property conflict - create conflict operation
      const conflict: ConflictOperation = { }
  id: `conflict_${generateOperationId(this.userId)}`}
},
  type: ConflictType.NODE_PROPERTIES,
        nodeId: op1.nodeId,
        property: op1.propertyPath.join('.'),
        localValue: op1.newValue,
        remoteValue: op2.newValue,
        baseValue: op1.oldValue,
        userId: this.userId,
        timestamp: Date.now(),
        documentId: this.documentId,
        requiresUserInput: this.requiresUserInput(op1, op2),
        suggestedResolution: this.suggestResolution(op1, op2),
        options: this.getResolutionOptions(op1, op2)
      };
      return { op1: null,
  op2: null,
  conflict,
  requiresResolution: true }
};
    return { op1, op2, requiresResolution: false };
  /**
   * Transform update vs delete operations
   */
  private transformUpdateDelete(updateOp: NodeUpdateOperation, deleteOp: NodeRemoveOperation): TransformResult { if (updateOp.nodeId === deleteOp.nodeId) {
  // Delete wins - nullify update
  return {
  op1: null,
  op2: deleteOp,
  requiresResolution: false }
};
    return { op1: updateOp, op2: deleteOp, requiresResolution: false };
  /**
   * Transform concurrent edge addition operations
   */
  private transformEdgeAdd(op1: EdgeAddOperation, op2: EdgeAddOperation): TransformResult { // Check for same connection
  if (op1.sourceNodeId === op2.sourceNodeId && )
  op1.targetNodeId === op2.targetNodeId &&
  op1.sourcePort === op2.sourcePort &&
  op1.targetPort === op2.targetPort) {
  // First operation wins
  const winner = compareOperations(op1, op2) <= 0 ? op1 : op2;
  return {
  op1: winner === op1 ? op1 : null,
  op2: winner === op2 ? op2 : null,
  requiresResolution: false }
};
    return { op1, op2, requiresResolution: false };
  /**
   * Transform concurrent parameter updates
   */
  private transformParameterUpdate(op1: ParameterUpdateOperation, op2: ParameterUpdateOperation): TransformResult {
    if (op1.nodeId !== op2.nodeId || op1.parameterKey !== op2.parameterKey) {
      return { op1, op2, requiresResolution: false };
    // Same parameter - create conflict
    const conflict: ConflictOperation = {,
  id: `conflict_${generateOperationId(this.userId)}`}
},
  type: ConflictType.PARAMETER_UPDATE,
      nodeId: op1.nodeId,
      property: op1.parameterKey,
      localValue: op1.newValue,
      remoteValue: op2.newValue,
      baseValue: op1.oldValue,
      userId: this.userId,
      timestamp: Date.now(),
      documentId: this.documentId,
      requiresUserInput: true,
      suggestedResolution: ResolutionStrategy.LAST_WRITER_WINS,
      options: [
        { strategy: ResolutionStrategy.ACCEPT_LOCAL,
  label: 'Keep Local Value',
  description: 'Use your local changes',
  preview: op1.newValue,
  recommended: false }

        { strategy: ResolutionStrategy.ACCEPT_REMOTE,
  label: 'Accept Remote Value',
  description: 'Use the remote changes',
  preview: op2.newValue,
  recommended: false }

        { strategy: ResolutionStrategy.LAST_WRITER_WINS,
  label: 'Last Writer Wins',
  description: 'Use the most recent change',
  preview: compareOperations(op1, op2) > 0 ? op1.newValue : op2.newValue }
  recommended: true];
};
    return { op1: null,
  op2: null,
  conflict,
  requiresResolution: true }
};
  /**
   * Handle generic conflict between operations
   */
  private handleGenericConflict(op1: MutationOperation, op2: MutationOperation): TransformResult { // Default to last-writer-wins for generic conflicts
  const winner = compareOperations(op1, op2) > 0 ? op1 : op2;
  const loser = winner === op1 ? op2 : op1;
  return {
  op1: winner === op1 ? op1 : null,
  op2: winner === op2 ? op2 : null,
  requiresResolution: false }
};
  // =============================================================================
  // Operation Execution
  // =============================================================================
  /**
   * Execute a single operation on the CRDT
   */
  private async executeOperation(operation: MutationOperation): Promise<boolean> {

    switch (operation.type) {
    case 'NODE_ADD':
      return this.graphCRDT.addNode(operation as NodeAddOperation);
    case 'NODE_UPDATE':
      return this.graphCRDT.updateNode(operation as NodeUpdateOperation);
    case 'NODE_REMOVE':
      return this.graphCRDT.removeNode(operation as NodeRemoveOperation);
    case 'EDGE_ADD':
      return this.graphCRDT.addEdge(operation as EdgeAddOperation);
    case 'EDGE_UPDATE':
      return this.graphCRDT.updateEdge(operation as EdgeUpdateOperation);
    case 'EDGE_REMOVE':
      return this.graphCRDT.removeEdge(operation as EdgeRemoveOperation);
    case 'PARAMETER_UPDATE':
      return this.graphCRDT.updateParameter(operation as ParameterUpdateOperation);
    case 'BATCH_MUTATION':
      const result = await this.applyBatchOperation(operation as BatchMutationOperation);
      return result.success;
    default:
      console.warn(`Unknown operation type: ${(operation as any).type}`);}
      return false;
  // =============================================================================
  // Conflict Detection and Resolution
  // =============================================================================
  /**
   * Detect conflicts with pending operations
   */
  private detectConflicts(operation: MutationOperation): MutationOperation { const conflicts: MutationOperation = [];
  this.pendingOperations.forEach((pendingOp) => {
  if (operationsConflict(operation, pendingOp)) {
  conflicts.push(pendingOp) });
    return conflicts;
  /**
   * Handle detected conflicts
   */
  private async handleConflicts(operation: MutationOperation, conflicts: MutationOperation): Promise<boolean> {

    for (const conflictOp of conflicts) {
      const transformResult = this.transformOperations(operation, conflictOp);
      if (transformResult.requiresResolution) {
        if (transformResult.conflict) {
          this.conflictOperations.set(transformResult.conflict.id, transformResult.conflict);
          this.onConflictDetected?.(transformResult.conflict);
        // Apply automatic resolution if configured
        if (this.conflictResolutionStrategy !== ResolutionStrategy.MANUAL_RESOLUTION) {
          return await this.applyAutomaticResolution(transformResult);
        return false; // Requires manual resolution
 else { // Apply transformed operations
  if (transformResult.op1) {
  await this.executeOperation(transformResult.op1);
  if (transformResult.op2) {
  await this.executeOperation(transformResult.op2);
  return true;
  /**
  * Apply automatic conflict resolution
  */
  private async applyAutomaticResolution(transformResult: TransformResult): Promise<boolean> {
  if (!transformResult.conflict) return false;
  const resolution: ConflictResolution = {
  conflictId: transformResult.conflict.id
  conflictType: transformResult.conflict.type
  strategy: this.conflictResolutionStrategy
  affectedOperations: [transformResult.conflict.id]
  affectedElements: transformResult.conflict.nodeId ? [transformResult.conflict.nodeId] : []
  resolvedBy: 'system'
  timestamp: Date.now()
  automatic: true }
};
    return await this.applyConflictResolution(transformResult.conflict, resolution);
  /**
   * Apply conflict resolution
   */
  private async applyConflictResolution(conflict: ConflictOperation, resolution: ConflictResolution): Promise<boolean> { try {
  let valueToApply: any;
  switch (resolution.strategy) {
  case ResolutionStrategy.ACCEPT_LOCAL:
  valueToApply = conflict.localValue;
  break;
  case ResolutionStrategy.ACCEPT_REMOTE:
  valueToApply = conflict.remoteValue;
  break;
  case ResolutionStrategy.LAST_WRITER_WINS:
  valueToApply = conflict.localValue; // Assume local is newer
  break;
  case ResolutionStrategy.FIRST_WRITER_WINS:
  valueToApply = conflict.remoteValue; // Assume remote was first
  break;
  case ResolutionStrategy.AUTO_MERGE:
  valueToApply = this.attemptAutoMerge(conflict.localValue, conflict.remoteValue);
  break;
  default:
  return false;
  // Create and apply resolution operation
  if (conflict.nodeId) {
  const resolutionOp: NodeUpdateOperation = {
  type: 'NODE_UPDATE'
  operationId: generateOperationId(this.userId)
  documentId: this.documentId
  nodeId: conflict.nodeId
  propertyPath: conflict.property ? [conflict.property] : []
  oldValue: conflict.baseValue
  newValue: valueToApply
  partialUpdate: true
  timestamp: Date.now()
  userId: resolution.resolvedBy }
};
        return await this.executeOperation(resolutionOp);
      return false;
 catch (error) { console.error('Error applying conflict resolution:', error);
  return false;
  // =============================================================================
  // Utility Functions
  // =============================================================================
  /**
  * Check if property paths conflict (overlap)
  */
  private propertyPathsConflict(path1: string, path2: string): boolean {
  const minLength = Math.min(path1.length, path2.length);
  for (let i = 0; i < minLength; i++) {
  if (path1[i] !== path2[i]) {
  return false;
  return true; // One path is a prefix of the other
  /**
  * Check if conflict requires user input
  */
  private requiresUserInput(op1: MutationOperation, op2: MutationOperation): boolean {,
  // Complex objects or critical operations require user input
  return typeof op1.newValue === 'object' ||
  typeof op2.newValue === 'object' ||
  (op1.priority && op1.priority >= OperationPriority.HIGH) ||
  (op2.priority && op2.priority >= OperationPriority.HIGH);
  /**
  * Suggest resolution strategy
  */
  private suggestResolution(op1: MutationOperation, op2: MutationOperation): ResolutionStrategy {,
  // Use configured strategy or last-writer-wins as default
  return this.conflictResolutionStrategy !== ResolutionStrategy.MANUAL_RESOLUTION
  ? this.conflictResolutionStrategy
  : ResolutionStrategy.LAST_WRITER_WINS;
  /**
  * Get resolution options for conflict UI
  */
  private getResolutionOptions(op1: MutationOperation, op2: MutationOperation): any {,
  return [
  {
  strategy: ResolutionStrategy.ACCEPT_LOCAL,
  label: 'Keep Local',
  description: 'Use your local changes',
  preview: op1.newValue,
  recommended: false }

      { strategy: ResolutionStrategy.ACCEPT_REMOTE,
  label: 'Accept Remote',
  description: 'Use remote changes',
  preview: op2.newValue,
  recommended: false }

      { strategy: ResolutionStrategy.LAST_WRITER_WINS,
        label: 'Last Writer Wins',
        description: 'Use most recent change' }
        recommended: true];
  /**
   * Attempt automatic merge of conflicting values
   */
  private attemptAutoMerge(localValue: any, remoteValue: any): any {
    // Simple auto-merge logic
    if (typeof localValue === 'string' && typeof remoteValue === 'string') {
      return `${localValue} | ${remoteValue}`;}
    if (Array.isArray(localValue) && Array.isArray(remoteValue)) {
      return [...new Set([...localValue, ...remoteValue])];
    if (typeof localValue === 'object' && typeof remoteValue === 'object') {
      return { ...localValue, ...remoteValue };
    // Fallback to local value
    return localValue;
  /**
   * Validate batch operations for conflicts
   */
  private async validateBatchOperations(operations: MutationOperation): Promise<{ ,
  hasConflicts: boolean;
  conflicts: ConflictOperation }> { const conflicts: ConflictOperation = [];
  // Check for internal conflicts within the batch
  for (let i = 0; i < operations.length; i++) {
  for (let j = i + 1; j < operations.length; j++) {
  if (operationsConflict(operations[i], operations[j])) {
  const transformResult = this.transformOperations(operations[i], operations[j]);
  if (transformResult.conflict) {
  conflicts.push(transformResult.conflict);
  return {
  hasConflicts: conflicts.length > 0 }
  conflicts
};
  /**
   * Rollback applied operations
   */
  private async rollbackOperations(operations: MutationOperation): Promise<void> { // Rollback in reverse order
  for (let i = operations.length - 1; i >= 0; i--) {
  const operation = operations[i];
  // Create inverse operation and apply
  const inverseOp = this.createInverseOperation(operation);
  if (inverseOp) {
  await this.executeOperation(inverseOp);
  /**
  * Create inverse operation for rollback
  */
  private createInverseOperation(operation: MutationOperation): MutationOperation | null {
  switch (operation.type) {
  case 'NODE_ADD':
  const nodeRemoveOp: NodeRemoveOperation = {
  type: 'NODE_REMOVE'
  operationId: generateOperationId(this.userId)
  documentId: operation.documentId
  nodeId: operation.nodeId
  cascadeDelete: true
  preserveConnections: false
  timestamp: Date.now()
  userId: operation.userId }
};
      return nodeRemoveOp;
    case 'NODE_REMOVE':
      // Cannot easily inverse node removal without snapshot data
      return null;
    case 'NODE_UPDATE':
      const nodeUpdateOp: NodeUpdateOperation = { 
  type: 'NODE_UPDATE'
  operationId: generateOperationId(this.userId)
  documentId: operation.documentId
  nodeId: operation.nodeId
  propertyPath: operation.propertyPath
  oldValue: operation.newValue
  newValue: operation.oldValue
  partialUpdate: operation.partialUpdate
  timestamp: Date.now()
  userId: operation.userId }
};
      return nodeUpdateOp;
      // Add other operation types as needed
    default:
      return null;
  /**
   * Setup periodic cleanup of old operations and conflicts
   */
  private setupPeriodicCleanup(): void { setInterval(() => {
      const now = Date.now();
      // Clean up old pending operations
      this.pendingOperations.forEach((op, id) => {
        if (now - op.timestamp > this.operationTimeout) {
          this.pendingOperations.delete(id) });
      // Clean up resolved conflicts
      this.conflictOperations.forEach((conflict, id) => { if (now - conflict.timestamp > this.operationTimeout * 2) {
          this.conflictOperations.delete(id) });
    }, 30000); // Clean up every 30 seconds
  // =============================================================================
  // Public Getters and Setters
  // =============================================================================
  /**
   * Get pending operations
   */
  getPendingOperations(): MutationOperation { return Array.from(this.pendingOperations.values());
  /**
  * Get active conflicts
  */
  getActiveConflicts(): ConflictOperation {
  return Array.from(this.conflictOperations.values());
  /**
  * Set event handlers
  */
  setEventHandlers(handlers: {) }
  onOperationApplied?: (operation: MutationOperation) => void;
  onConflictDetected?: (conflict: ConflictOperation) => void;
  onConflictResolved?: (resolution: ConflictResolution) => void;
  onBatchCompleted?: (result: BatchResult) => void;
}): void { this.onOperationApplied = handlers.onOperationApplied;
  this.onConflictDetected = handlers.onConflictDetected;
  this.onConflictResolved = handlers.onConflictResolved;
  this.onBatchCompleted = handlers.onBatchCompleted;
  /**
  * Set conflict resolution strategy
  */
  setConflictResolutionStrategy(strategy: ResolutionStrategy): void {
  this.conflictResolutionStrategy = strategy;
  /**
  * Get current configuration
  */
  getConfiguration(): {
  conflictResolutionStrategy: ResolutionStrategy;
  maxOperationHistory: number;
  operationTimeout: number;
  return {
  conflictResolutionStrategy: this.conflictResolutionStrategy
  maxOperationHistory: this.maxOperationHistory
  operationTimeout: this.operationTimeout }
};

export default MutationCoordinator;