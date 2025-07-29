/**
 * Conflict Resolver
 * REFACTOR-006: Advanced State Management & Data Flow Architecture
 * 
 * Handles concurrent state modifications and conflict resolution
 */
import { StateChange } from '../containers/BaseStateContainer';

// Conflict resolution types

export interface StateConflict<T = any> {
  id: string;
  timestamp: number;
  localChange: StateChange<T>;
  remoteChange: StateChange<T>;
  conflictType: ConflictType;
  severity: ConflictSeverity;
  affectedPaths: string;
  metadata?: Record<string, any>;
  export type ConflictType =
  | 'CONCURRENT_UPDATE'
  | 'DELETE_UPDATE'
  | 'CREATE_CREATE'
  | 'TYPE_MISMATCH'
  | 'DEPENDENCY_VIOLATION'
  | 'PERMISSION_CONFLICT'
  | 'SCHEMA_VIOLATION';
  export type ConflictSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  export type ResolutionStrategy =
  | 'LAST_WRITER_WINS'
  | 'FIRST_WRITER_WINS'
  | 'MERGE_CHANGES'
  | 'OPERATIONAL_TRANSFORM'
  | 'USER_INTERVENTION'
  | 'CUSTOM_RESOLVER'
  | 'SECURITY_PRIORITY'
  | 'ROLLBACK_ALL';
  export interface ConflictResolution<T = any> {
  id: string;
  conflictId: string;
  strategy: ResolutionStrategy;
  resolvedState: T;
  timestamp: number;
  appliedChanges: StateChange<T>[];
  rejectedChanges: StateChange<T>[];
  userAction?: 'approved' | 'rejected' | 'modified';
  confidence: number; // 0-1 confidence in resolution,
  export interface ConflictResolutionRule {
  name: string;
  domain?: string;
  pathPattern?: RegExp;
  conflictTypes: ConflictType;
  strategy: ResolutionStrategy;
  priority: number;
  condition?: (conflict: StateConflict) => boolean;
  customResolver?: (conflict: StateConflict) => ConflictResolution;
}
export interface OperationalTransform {
  apply(operation: any, state: any): any;
  transform(op1: any, op2: any): [any, any];
  compose(ops: any): any;
  inverse(operation: any): any;
  // Graph-specific operational transforms
}
export interface GraphMutation {
  type: 'ADD_NODE' | 'REMOVE_NODE' | 'UPDATE_NODE' | 'ADD_EDGE' | 'REMOVE_EDGE' | 'UPDATE_EDGE';
  nodeId?: string;
  edgeId?: string;
  data?: any;
  position?: { x: number; y: number };
  timestamp: number;
}
export interface Permission {
  resource: string;
  action: string;
  level: 'none' | 'read' | 'write' | 'admin';
  conditions?: Record<string, any>;
}
export interface DashboardLayout {
  widgets: Array<{,
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  static?: boolean;
}>;
  breakpoints: Record<string, number>;
  cols: Record<string, number>;

// Main conflict resolver class
}
export class ConflictResolver {
  private resolutionRules: ConflictResolutionRule = [];
  private activeConflicts = new Map<string, StateConflict>();
  private resolutionHistory: ConflictResolution = [];
  private maxHistorySize = 1000;
  constructor() {
  this.setupDefaultRules();
  // Main conflict detection and resolution
  async detectAndResolveConflicts<T>(localChanges: StateChange<T>[])
  remoteChanges: StateChange<T>[],
  currentState: T,
  domain: string): Promise<ConflictResolution<T>[]> {,
  // Detect conflicts
  const conflicts = this.detectConflicts(localChanges, remoteChanges, currentState, domain);
  // Resolve each conflict
  const resolutions: ConflictResolution<T>[] = [];
  for (const conflict of conflicts) {
  try {
  const resolution = await this.resolveConflict(conflict);
  resolutions.push(resolution);
  // Store in history
  this.addToHistory(resolution);
  // Remove from active conflicts
  this.activeConflicts.delete(conflict.id);
} catch (error) {
        console.error(`Failed to resolve conflict ${conflict.id}:`, error);}
        // Keep in active conflicts for retry
        this.activeConflicts.set(conflict.id, conflict);
    return resolutions;
  private detectConflicts<T>(localChanges: StateChange<T>[])
    remoteChanges: StateChange<T>[],
    currentState: T,
    domain: string): StateConflict<T>[] {,
  const conflicts: StateConflict<T>[] = [];
  // Check for overlapping changes
  for (const localChange of localChanges) {
  for (const remoteChange of remoteChanges) {
  const conflict = this.analyzeChangePair(localChange, remoteChange, currentState, domain);
  if (conflict) {
  conflicts.push(conflict);
  return conflicts;
  private analyzeChangePair<T>(localChange: StateChange<T>)
  remoteChange: StateChange<T>,
  currentState: T,
  domain: string): StateConflict<T> | null {,
  // Check if changes affect overlapping paths
  const localPaths = this.extractAffectedPaths(localChange);
  const remotePaths = this.extractAffectedPaths(remoteChange);
  const overlappingPaths = localPaths.filter(path => ;);
  remotePaths.some(remotePath => this.pathsOverlap(path, remotePath))
  );
  if (overlappingPaths.length === 0) {
  return null; // No conflict
  // Determine conflict type and severity
  const conflictType = this.determineConflictType(localChange, remoteChange);
  const severity = this.assessConflictSeverity(conflictType, overlappingPaths, domain);
  return {
  id: this.generateConflictId(),
  timestamp: Date.now(),
  localChange,
  remoteChange,
  conflictType,
  severity,
  affectedPaths: overlappingPaths,
  metadata: {
  domain,
  localTimestamp: localChange.timestamp,
  remoteTimestamp: remoteChange.timestamp,
};
  private async resolveConflict<T>(conflict: StateConflict<T>): Promise<ConflictResolution<T>> {
    // Find applicable resolution rule
    const rule = this.findResolutionRule(conflict);
    if (!rule) {
      throw new Error(`No resolution rule found for conflict ${conflict.id}`);}
    // Apply resolution strategy
    let resolution: ConflictResolution<T>;
    if (rule.customResolver) {
      resolution = rule.customResolver(conflict);
    } else {
      resolution = await this.applyResolutionStrategy(conflict, rule.strategy);
    return resolution;
  private async applyResolutionStrategy<T>(()
    conflict: StateConflict<T>,
    strategy: ResolutionStrategy,
  ): Promise<ConflictResolution<T>> {
    switch (strategy) {
      case 'LAST_WRITER_WINS':
        return this.lastWriterWins(conflict);
      case 'FIRST_WRITER_WINS':
        return this.firstWriterWins(conflict);
      case 'MERGE_CHANGES':
        return this.mergeChanges(conflict);
      case 'OPERATIONAL_TRANSFORM':
        return this.operationalTransform(conflict);
      case 'SECURITY_PRIORITY':
        return this.securityPriorityResolution(conflict);
      case 'USER_INTERVENTION':
        return this.requestUserIntervention(conflict);
      default:
        throw new Error(`Unsupported resolution strategy: ${strategy}`);}
  // Resolution strategy implementations
  private lastWriterWins<T>(conflict: StateConflict<T>): ConflictResolution<T> {
  const winner = conflict.localChange.timestamp > conflict.remoteChange.timestamp;
  ? conflict.localChange
  : conflict.remoteChange;
  const loser = winner === conflict.localChange ? conflict.remoteChange : conflict.localChange;
  return {
  id: this.generateResolutionId(),
  conflictId: conflict.id,
  strategy: 'LAST_WRITER_WINS',
  resolvedState: this.applyChangeToState(winner),
  timestamp: Date.now(),
  appliedChanges: [winner],
  rejectedChanges: [loser],
  confidence: 0.8,
};
  private firstWriterWins<T>(conflict: StateConflict<T>): ConflictResolution<T> {
  const winner = conflict.localChange.timestamp < conflict.remoteChange.timestamp;
  ? conflict.localChange
  : conflict.remoteChange;
  const loser = winner === conflict.localChange ? conflict.remoteChange : conflict.localChange;
  return {
  id: this.generateResolutionId(),
  conflictId: conflict.id,
  strategy: 'FIRST_WRITER_WINS',
  resolvedState: this.applyChangeToState(winner),
  timestamp: Date.now(),
  appliedChanges: [winner],
  rejectedChanges: [loser],
  confidence: 0.7,
};
  private mergeChanges<T>(conflict: StateConflict<T>): ConflictResolution<T> {
  // Intelligent merge based on change types and data
  const mergedPayload = this.mergePaylods(;);
  conflict.localChange.payload,
  conflict.remoteChange.payload
  );
  const mergedChange: StateChange<T> = {,
  ...conflict.localChange,
  id: this.generateChangeId(),
  timestamp: Date.now(),
  payload: mergedPayload,
  source: 'system',
};
    return {
  id: this.generateResolutionId(),
  conflictId: conflict.id,
  strategy: 'MERGE_CHANGES',
  resolvedState: this.applyChangeToState(mergedChange),
  timestamp: Date.now(),
  appliedChanges: [mergedChange],
  rejectedChanges: [],
  confidence: 0.6,
};
  private operationalTransform<T>(conflict: StateConflict<T>): ConflictResolution<T> {
  // Apply operational transform based on conflict type
  if (conflict.conflictType === 'CONCURRENT_UPDATE') {
  return this.applyOperationalTransform(conflict);
  // Fallback to merge for non-OT cases
  return this.mergeChanges(conflict);
  private securityPriorityResolution<T>(conflict: StateConflict<T>): ConflictResolution<T> {,
  // Security conflicts always favor more restrictive permissions
  const isSecurityRelated = (change: StateChange<T>) => ;
  JSON.stringify(change.payload).includes('permission') ||
  JSON.stringify(change.payload).includes('security') ||
  JSON.stringify(change.payload).includes('access');
  if (isSecurityRelated(conflict.localChange) || isSecurityRelated(conflict.remoteChange)) {
  // Choose the more restrictive change
  const moreRestrictive = this.selectMoreRestrictiveChange(;);
  conflict.localChange,
  conflict.remoteChange
  );
  const lessRestrictive = moreRestrictive === conflict.localChange ;
  ? conflict.remoteChange
  : conflict.localChange;
  return {
  id: this.generateResolutionId(),
  conflictId: conflict.id,
  strategy: 'SECURITY_PRIORITY',
  resolvedState: this.applyChangeToState(moreRestrictive),
  timestamp: Date.now(),
  appliedChanges: [moreRestrictive],
  rejectedChanges: [lessRestrictive],
  confidence: 0.9,
};
    // Non-security conflicts use last writer wins
    return this.lastWriterWins(conflict);
  private async requestUserIntervention<T>(conflict: StateConflict<T>): Promise<ConflictResolution<T>> {
    // Store conflict for user review
    this.activeConflicts.set(conflict.id, conflict);
    // Create pending resolution
    return {
      id: this.generateResolutionId(),
      conflictId: conflict.id,
      strategy: 'USER_INTERVENTION',
      resolvedState: {} as T, // Will be filled when user resolves
      timestamp: Date.now(),
      appliedChanges: [],
      rejectedChanges: [],
      confidence: 0.0;
  };
  // Specialized conflict resolution methods
  resolveGraphConflicts();
    localChanges: GraphMutation,
    remoteChanges: GraphMutation): GraphMutation {,
    // Implement operational transform for graph operations
    const resolvedMutations: GraphMutation = [];
    // Group mutations by type and apply transforms
    const localByType = this.groupMutationsByType(localChanges);
    const remoteByType = this.groupMutationsByType(remoteChanges);
    // Apply graph-specific resolution logic
    for (const [type, locals] of localByType) {
      const remotes = remoteByType.get(type) || [];
      const resolved = this.resolveGraphMutationType(type, locals, remotes);
      resolvedMutations.push(...resolved);
    return resolvedMutations;
  resolveSecurityConflicts();
    localPermissions: Permission,
    remotePermissions: Permission): Permission {,
    // Security conflicts always favor more restrictive permissions
    const mergedPermissions = new Map<string, Permission>();
    // Process local permissions
    localPermissions.forEach(perm => {)
  const key = `${perm.resource}:${perm.action}`;}
      mergedPermissions.set(key, perm);
    });
    // Process remote permissions, choosing more restrictive
    remotePermissions.forEach(remotePerm => {)
  const key = `${remotePerm.resource}:${remotePerm.action}`;}
      const localPerm = mergedPermissions.get(key);
      if (!localPerm) {
        mergedPermissions.set(key, remotePerm);
      } else {
        // Choose more restrictive permission
        const moreRestrictive = this.selectMoreRestrictivePermission(localPerm, remotePerm);
        mergedPermissions.set(key, moreRestrictive);
    });
    return Array.from(mergedPermissions.values());
  resolveDashboardConflicts();
    localLayout: DashboardLayout,
    remoteLayout: DashboardLayout): DashboardLayout {,
    // Merge dashboard layouts using spatial conflict resolution
    const mergedWidgets = new Map<string, any>();
    // Add local widgets
    localLayout.widgets.forEach(widget => {)
  mergedWidgets.set(widget.id, widget);
    });
    // Merge remote widgets, resolving spatial conflicts
    remoteLayout.widgets.forEach(remoteWidget => {)
  const localWidget = mergedWidgets.get(remoteWidget.id);
      if (!localWidget) {
        // New widget, check for spatial conflicts
        const resolved = this.resolveSpatialConflict(remoteWidget, Array.from(mergedWidgets.values()));
        mergedWidgets.set(remoteWidget.id, resolved);
      } else {
        // Existing widget, merge properties
        const merged = this.mergeWidgetProperties(localWidget, remoteWidget);
        mergedWidgets.set(remoteWidget.id, merged);
    });
    return {
      widgets: Array.from(mergedWidgets.values()),
      breakpoints: { ...localLayout.breakpoints, ...remoteLayout.breakpoints },
      cols: { ...localLayout.cols, ...remoteLayout.cols }
    };
  // Setup default resolution rules
  private setupDefaultRules(): void {
  // Graph editor rules
  this.addResolutionRule({)
  name: 'graph-concurrent-updates',
  domain: 'graph-editor',
  conflictTypes: ['CONCURRENT_UPDATE'],
  strategy: 'OPERATIONAL_TRANSFORM',
  priority: 100,
});
    // Security rules
    this.addResolutionRule({)
  name: 'security-priority',
  domain: 'security',
  conflictTypes: ['CONCURRENT_UPDATE', 'PERMISSION_CONFLICT'],
  strategy: 'SECURITY_PRIORITY',
  priority: 200,
});
    // Admin dashboard rules
    this.addResolutionRule({)
  name: 'dashboard-layout',
  domain: 'admin-dashboard',
  pathPattern: /^layout\./,
  conflictTypes: ['CONCURRENT_UPDATE'],
  strategy: 'MERGE_CHANGES',
  priority: 150,
});
    // General fallback rule
    this.addResolutionRule({)
  name: 'fallback-last-writer',
  conflictTypes: ['CONCURRENT_UPDATE', 'DELETE_UPDATE', 'CREATE_CREATE'],
  strategy: 'LAST_WRITER_WINS',
  priority: 1,
});
  // Utility methods
  private findResolutionRule(conflict: StateConflict): ConflictResolutionRule | null {
    return this.resolutionRules
      .filter(rule => {)
  // Check domain match
        if (rule.domain && rule.domain !== conflict.metadata?.domain) {
          return false;
        // Check conflict type match
        if (!rule.conflictTypes.includes(conflict.conflictType)) {
          return false;
        // Check path pattern match
        if (rule.pathPattern && !conflict.affectedPaths.some(path => rule.pathPattern!.test(path))) {
          return false;
        // Check custom condition
        if (rule.condition && !rule.condition(conflict)) {
          return false;
        return true;
  }
      .sort((a, b) => b.priority - a.priority)[0] || null;
  // Public API methods
  addResolutionRule(rule: ConflictResolutionRule): void {
    this.resolutionRules.push(rule);
    this.resolutionRules.sort((a, b) => b.priority - a.priority);
  removeResolutionRule(name: string): void {
    this.resolutionRules = this.resolutionRules.filter(rule => rule.name !== name);
  getActiveConflicts(): StateConflict {
    return Array.from(this.activeConflicts.values());
  getResolutionHistory(): ConflictResolution {
    return [...this.resolutionHistory];
  // Helper methods (simplified implementations)
  private extractAffectedPaths<T>(change: StateChange<T>): string {
    // Extract paths from change payload
    return Object.keys(change.payload || {});
  private pathsOverlap(path1: string, path2: string): boolean {
    return path1 === path2 || path1.startsWith(path2 + '.') || path2.startsWith(path1 + '.');
  private determineConflictType<T>(local: StateChange<T>, remote: StateChange<T>): ConflictType {
    if (local.type === 'DELETE' && remote.type === 'UPDATE') return 'DELETE_UPDATE';
    if (local.type === 'CREATE' && remote.type === 'CREATE') return 'CREATE_CREATE';
    return 'CONCURRENT_UPDATE';
  private assessConflictSeverity(type: ConflictType, paths: string, domain: string): ConflictSeverity {
    if (domain === 'security' || paths.some(p => p.includes('security'))) return 'CRITICAL';
    if (type === 'DELETE_UPDATE') return 'HIGH';
    if (type === 'CONCURRENT_UPDATE') return 'MEDIUM';
    return 'LOW';
  private generateConflictId(): string {
    return `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;}
  private generateResolutionId(): string {
    return `resolution_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;}
  private generateChangeId(): string {
    return `change_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;}
  private addToHistory(resolution: ConflictResolution): void {
    this.resolutionHistory.push(resolution);
    if (this.resolutionHistory.length > this.maxHistorySize) {
      this.resolutionHistory = this.resolutionHistory.slice(-this.maxHistorySize);
  // Placeholder implementations for complex methods
  private applyChangeToState<T>(change: StateChange<T>): T {
    // Apply change to state and return new state
    return {} as T;
  private mergePaylods(local: any, remote: any): any {
    return { ...local, ...remote };
  private applyOperationalTransform<T>(conflict: StateConflict<T>): ConflictResolution<T> {
  // Implement operational transform logic
  return this.lastWriterWins(conflict);
  private selectMoreRestrictiveChange<T>(local: StateChange<T>, remote: StateChange<T>): StateChange<T> {,
  // Logic to determine which change is more restrictive
  return local;
  private selectMoreRestrictivePermission(local: Permission, remote: Permission): Permission {,
  const levels = ['none', 'read', 'write', 'admin'];
  const localLevel = levels.indexOf(local.level);
  const remoteLevel = levels.indexOf(remote.level);
  return localLevel < remoteLevel ? local : remote;
  private groupMutationsByType(mutations: GraphMutation): Map<string, GraphMutation> {,
  const groups = new Map<string, GraphMutation>();
  mutations.forEach(mutation => {)
  const existing = groups.get(mutation.type) || [];
  existing.push(mutation);
  groups.set(mutation.type, existing);
});
    return groups;
  private resolveGraphMutationType(type: string, local: GraphMutation, remote: GraphMutation): GraphMutation {
    // Graph-specific resolution logic
    return [...local, ...remote];
  private resolveSpatialConflict(widget: any, existingWidgets: any): any {
    // Resolve spatial conflicts in dashboard layout
    return widget;
  private mergeWidgetProperties(local: any, remote: any): any {
    return { ...local, ...remote };

// Global conflict resolver instance
export const globalConflictResolver = new ConflictResolver();