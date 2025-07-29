/**
 * Time Travel Debugging
 * REFACTOR-006: Advanced State Management & Data Flow Architecture
 * Phase 4: State Debugging & DevTools
 * 
 * Advanced time-travel debugging with state history navigation and replay
 */
import { EventEmitter } from 'events';
import { StateSnapshot, StateChange } from '../containers/BaseStateContainer';

// Time travel types

export interface TimeTravelConfig {
  maxHistorySize: number;
  enableBranching: boolean;
  enableSnapshots: boolean;
  enableDiffing: boolean;
  compressionEnabled: boolean;
  persistHistory: boolean;
  autoSnapshot: {
  enabled: boolean;
  interval: number;
  maxSnapshots: number;
};
}
export interface TimelineEntry<T = any> {
  id: string;
  timestamp: number;
  type: 'snapshot' | 'change' | 'branch' | 'merge' | 'marker';
  domain: string;
  snapshot?: StateSnapshot<T>;
  change?: StateChange<T>;
  metadata: {
  description?: string;
  author?: string;
  tags: string;
  branchId?: string;
  parentId?: string;
  childIds: string;
  size: number;
  compressed: boolean;
};

export interface TimeBranch {
  id: string;
  name: string;
  description: string;
  created: number;
  lastModified: number;
  parentEntryId: string;
  headEntryId: string;
  entryIds: string;
  metadata: {
  author: string;
  tags: string;
  protected: boolean;
  color: string;
};
}
export interface TimeTravelState {
  currentPosition: number;
  currentBranch: string;
  totalEntries: number;
  isReplaying: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
  branches: string;
  markers: TimelineMarker;
}
export interface TimelineMarker {
  id: string;
  entryId: string;
  name: string;
  description: string;
  color: string;
  timestamp: number;
  type: 'bookmark' | 'bug' | 'feature' | 'test' | 'milestone'
  }
export interface StateDiff {
  path: string;
  type: 'added' | 'removed' | 'modified' | 'unchanged';
  oldValue?: any;
  newValue?: any;
  children?: StateDiff;
}
export interface ReplaySession {
  id: string;
  name: string;
  description: string;
  timeline: TimelineEntry;
  currentIndex: number;
  playbackSpeed: number;
  autoPlay: boolean;
  loop: boolean;
  breakpoints: number;
  created: number;
  lastPlayed: number;
}
export interface TimelineQuery {
  timeRange?: { start: number; end: number };
  domains?: string;
  types?: string;
  branches?: string;
  tags?: string;
  search?: string;
  limit?: number;
  offset?: number;

// Main TimeTravel class
}
export class TimeTravel extends EventEmitter {
  private config: TimeTravelConfig;
  private timeline: Map<string, TimelineEntry> = new Map();
  private timelineOrder: string = [];
  private branches: Map<string, TimeBranch> = new Map();
  private currentPosition = -1;
  private currentBranch = 'main';
  private markers: Map<string, TimelineMarker> = new Map();
  private replaySessions: Map<string, ReplaySession> = new Map();
  private isRecording = true;
  private isReplaying = false;
  constructor(config: Partial<TimeTravelConfig> = {}) {
  super();
  this.config = {
  maxHistorySize: 1000,
  enableBranching: true,
  enableSnapshots: true,
  enableDiffing: true,
  compressionEnabled: true,
  persistHistory: false,
  autoSnapshot: {
  enabled: true,
  interval: 60000, // 1 minute,
  maxSnapshots: 50,
}
      ...config
    };
    this.initializeMainBranch();
    this.setupAutoSnapshot();
  // Recording state changes
  recordStateSnapshot<T>(snapshot: StateSnapshot<T>, domain: string, options: {)
  description?: string;
  tags?: string;
  marker?: Omit<TimelineMarker, 'id' | 'entryId' | 'timestamp'>;
} = {}): string {
    if (!this.isRecording) return '';
    const entryId = this.generateEntryId();
    const compressed = this.config.compressionEnabled ? this.compressSnapshot(snapshot) : snapshot;
    const entry: TimelineEntry<T> = {,
  id: entryId,
      timestamp: snapshot.timestamp,
      type: 'snapshot',
      domain,
      snapshot: compressed,
      metadata: {
  description: options.description || `Snapshot for ${domain}`}
},
  tags: options.tags || [],
        branchId: this.currentBranch,
        parentId: this.getCurrentEntryId(),
        childIds: [],
        size: JSON.stringify(snapshot).length,
        compressed: this.config.compressionEnabled;
  };
    this.addEntryToTimeline(entry);
    // Add marker if specified
    if (options.marker) {
  this.addMarker({)
  ...options.marker,
  entryId,
  timestamp: snapshot.timestamp,
});
    this.emit('snapshotRecorded', { entry, domain });
    return entryId;
  recordStateChange<T>(change: StateChange<T>, domain: string, options: {)
  description?: string;
  tags?: string;
} = {}): string {
    if (!this.isRecording) return '';
    const entryId = this.generateEntryId();
    const entry: TimelineEntry<T> = {,
  id: entryId,
      timestamp: change.timestamp,
      type: 'change',
      domain,
      change,
      metadata: {
  description: options.description || `${change.type} in ${domain}`}
},
  tags: options.tags || [],
        branchId: this.currentBranch,
        parentId: this.getCurrentEntryId(),
        childIds: [],
        size: JSON.stringify(change).length,
        compressed: false;
  };
    this.addEntryToTimeline(entry);
    this.emit('changeRecorded', { entry, domain });
    return entryId;
  // Navigation
  goToPosition(position: number): boolean {
  if (position < 0 || position >= this.timelineOrder.length) {
  return false;
  const previousPosition = this.currentPosition;
  this.currentPosition = position;
  const entry = this.timeline.get(this.timelineOrder[position]);
  if (!entry) return false;
  this.emit('positionChanged', {)
  previousPosition,
  currentPosition: position,
  entry,
  canGoBack: this.canGoBack(),
  canGoForward: this.canGoForward(),
});
    return true;
  goToEntry(entryId: string): boolean {
  const position = this.timelineOrder.indexOf(entryId);
  if (position === -1) return false;
  return this.goToPosition(position);
  goToTimestamp(timestamp: number): boolean {,
  // Find closest entry to timestamp
  let closestIndex = -1;
  let minDiff = Infinity;
  for (let i = 0; i < this.timelineOrder.length; i++) {
  const entry = this.timeline.get(this.timelineOrder[i]);
  if (entry) {
  const diff = Math.abs(entry.timestamp - timestamp);
  if (diff < minDiff) {
  minDiff = diff;
  closestIndex = i;
  return closestIndex !== -1 ? this.goToPosition(closestIndex) : false;
  goBack(steps: number = 1): boolean {,
  const newPosition = this.currentPosition - steps;
  return this.goToPosition(Math.max(0, newPosition));
  goForward(steps: number = 1): boolean {,
  const newPosition = this.currentPosition + steps;
  return this.goToPosition(Math.min(this.timelineOrder.length - 1, newPosition));
  goToStart(): boolean {,
  return this.goToPosition(0);
  goToEnd(): boolean {,
  return this.goToPosition(this.timelineOrder.length - 1);
  // Branching
  createBranch(name: string, options: {)
  description?: string;
  fromEntryId?: string;
  author?: string;
  tags?: string;
  color?: string;
} = {}): string {
    if (!this.config.enableBranching) {
      throw new Error('Branching is disabled');
    const branchId = this.generateBranchId();
    const fromEntryId = options.fromEntryId || this.getCurrentEntryId();
    const branch: TimeBranch = {,
  id: branchId,
      name,
      description: options.description || `Branch: ${name}`}
},
  created: Date.now(),
      lastModified: Date.now(),
      parentEntryId: fromEntryId,
      headEntryId: fromEntryId,
      entryIds: [fromEntryId],
      metadata: {
  author: options.author || 'anonymous',
  tags: options.tags || [],
  protected: false,
  color: options.color || this.generateRandomColor(),
};
    this.branches.set(branchId, branch);
    this.emit('branchCreated', { branch, fromEntryId });
    return branchId;
  switchBranch(branchId: string): boolean {
  const branch = this.branches.get(branchId);
  if (!branch) return false;
  const previousBranch = this.currentBranch;
  this.currentBranch = branchId;
  // Move to the head of the new branch
  const headPosition = this.timelineOrder.indexOf(branch.headEntryId);
  if (headPosition !== -1) {
  this.currentPosition = headPosition;
  this.emit('branchSwitched', {)
  previousBranch,
  currentBranch: branchId,
  branch
});
    return true;
  mergeBranch(sourceBranchId: string, targetBranchId: string, options: {)
  strategy?: 'fast-forward' | 'merge-commit' | 'squash';
  message?: string;
} = {}): string | null {
    const sourceBranch = this.branches.get(sourceBranchId);
    const targetBranch = this.branches.get(targetBranchId);
    if (!sourceBranch || !targetBranch) return null;
    const { strategy = 'merge-commit', message } = options;
    // Create merge entry
    const mergeEntryId = this.generateEntryId();
    const mergeEntry: TimelineEntry = {,
  id: mergeEntryId,
      timestamp: Date.now(),
      type: 'merge',
      domain: 'system',
      metadata: {
  description: message || `Merge ${sourceBranch.name} into ${targetBranch.name}`}
},
  tags: ['merge'],
        branchId: targetBranchId,
        parentId: targetBranch.headEntryId,
        childIds: [],
        size: 0,
        compressed: false;
  };
    this.addEntryToTimeline(mergeEntry);
    // Update target branch
    targetBranch.headEntryId = mergeEntryId;
    targetBranch.lastModified = Date.now();
    this.emit('branchMerged', {)
  sourceBranch,
      targetBranch,
      mergeEntry,
      strategy
    });
    return mergeEntryId;
  // Replay functionality
  createReplaySession(name: string, options: {)
  description?: string;
    timeRange?: { start: number; end: number };
    domains?: string;
    speed?: number;
  } = {}): string {
  const sessionId = this.generateSessionId();
  const timeline = this.getFilteredTimeline({)
  timeRange: options.timeRange,
  domains: options.domains,
});
    const session: ReplaySession = {,
  id: sessionId,
      name,
      description: options.description || `Replay session: ${name}`}
}
      timeline,
      currentIndex: 0,
      playbackSpeed: options.speed || 1,
      autoPlay: false,
      loop: false,
      breakpoints: [],
      created: Date.now(),
      lastPlayed: 0;
  };
    this.replaySessions.set(sessionId, session);
    this.emit('replaySessionCreated', { session });
    return sessionId;
  startReplay(sessionId: string, options: {)
  autoPlay?: boolean;
  loop?: boolean;
  speed?: number;
  fromIndex?: number;
} = {}): boolean {
    const session = this.replaySessions.get(sessionId);
    if (!session) return false;
    this.isReplaying = true;
    session.autoPlay = options.autoPlay || false;
    session.loop = options.loop || false;
    session.playbackSpeed = options.speed || session.playbackSpeed;
    session.currentIndex = options.fromIndex || 0;
    session.lastPlayed = Date.now();
    this.emit('replayStarted', { session, options });
    if (session.autoPlay) {
  this.executeAutoReplay(session);
  return true;
  stepReplay(sessionId: string, direction: 'forward' | 'backward' = 'forward'): boolean {,
  const session = this.replaySessions.get(sessionId);
  if (!session || !this.isReplaying) return false;
  const step = direction === 'forward' ? 1 : -1;
  const newIndex = session.currentIndex + step;
  if (newIndex < 0 || newIndex >= session.timeline.length) {
  if (session.loop && direction === 'forward') {
  session.currentIndex = 0;
} else {
        return false;
    } else {
  session.currentIndex = newIndex;
  const entry = session.timeline[session.currentIndex];
  this.emit('replayStep', {)
  session,
  entry,
  direction,
  index: session.currentIndex,
});
    return true;
  stopReplay(): void {
  this.isReplaying = false;
  this.emit('replayStopped');
  // State diffing
  createStateDiff(fromEntryId: string, toEntryId: string): StateDiff {,
  if (!this.config.enableDiffing) {
  throw new Error('State diffing is disabled');
  const fromEntry = this.timeline.get(fromEntryId);
  const toEntry = this.timeline.get(toEntryId);
  if (!fromEntry || !toEntry) {
  throw new Error('One or both entries not found');
  const fromState = this.extractStateFromEntry(fromEntry);
  const toState = this.extractStateFromEntry(toEntry);
  return this.calculateDeepDiff(fromState, toState, '');
  // Markers
  addMarker(marker: Omit<TimelineMarker, 'id' | 'timestamp'>): string {,
  const markerId = this.generateMarkerId();
  const fullMarker: TimelineMarker = {,
  ...marker,
  id: markerId,
  timestamp: Date.now(),
};
    this.markers.set(markerId, fullMarker);
    this.emit('markerAdded', { marker: fullMarker });
    return markerId;
  removeMarker(markerId: string): boolean {
    const removed = this.markers.delete(markerId);
    if (removed) {
      this.emit('markerRemoved', { markerId });
    return removed;
  // Query and search
  queryTimeline(query: TimelineQuery): TimelineEntry {
  return this.getFilteredTimeline(query);
  searchTimeline(searchTerm: string, options: {)
  fields?: string;
  caseSensitive?: boolean;
  regex?: boolean;
} = {}): TimelineEntry {
    const { fields = ['description', 'tags'], caseSensitive = false, regex = false } = options;
    const searchValue = caseSensitive ? searchTerm : searchTerm.toLowerCase();
    const searchRegex = regex ? new RegExp(searchTerm, caseSensitive ? 'g' : 'gi') : null;
    return Array.from(this.timeline.values()).filter(entry => {)
  return fields.some(field => {)
  const value = this.getFieldValue(entry, field);
  if (!value) return false;
  const stringValue = caseSensitive ? String(value) : String(value).toLowerCase();
  if (searchRegex) {
  return searchRegex.test(stringValue);
} else {
          return stringValue.includes(searchValue);
      });
    });
  // Utility methods
  private initializeMainBranch(): void {
  const mainBranch: TimeBranch = {,
  id: 'main',
  name: 'main',
  description: 'Main development branch',
  created: Date.now(),
  lastModified: Date.now(),
  parentEntryId: '',
  headEntryId: '',
  entryIds: [],
  metadata: {
  author: 'system',
  tags: ['main'],
  protected: true,
  color: '#007acc',
};
    this.branches.set('main', mainBranch);
  private setupAutoSnapshot(): void {
    if (!this.config.autoSnapshot.enabled) return;
    setInterval(() => {
      this.createAutoSnapshot();
    }, this.config.autoSnapshot.interval);
  private createAutoSnapshot(): void {
    // This would integrate with the state management system to create automatic snapshots
    this.emit('autoSnapshotTriggered');
  private addEntryToTimeline(entry: TimelineEntry): void {
    this.timeline.set(entry.id, entry);
    this.timelineOrder.push(entry.id);
    // Update parent-child relationships
    if (entry.metadata.parentId) {
      const parentEntry = this.timeline.get(entry.metadata.parentId);
      if (parentEntry) {
        parentEntry.metadata.childIds.push(entry.id);
    // Update current branch
    const branch = this.branches.get(this.currentBranch);
    if (branch) {
      branch.headEntryId = entry.id;
      branch.entryIds.push(entry.id);
      branch.lastModified = Date.now();
    // Maintain history size limit
    if (this.timelineOrder.length > this.config.maxHistorySize) {
      const oldestId = this.timelineOrder.shift()!;
      this.timeline.delete(oldestId);
    // Update current position
    this.currentPosition = this.timelineOrder.length - 1;
  private getCurrentEntryId(): string {
    return this.currentPosition >= 0 ? this.timelineOrder[this.currentPosition] : '';
  private compressSnapshot<T>(snapshot: StateSnapshot<T>): StateSnapshot<T> {
    // Simple compression - in production, use proper compression
    const compressed = { ...snapshot };
    if (compressed.state) {
      compressed.state = JSON.parse(JSON.stringify(compressed.state));
    return compressed;
  private getFilteredTimeline(query: TimelineQuery): TimelineEntry {
    let entries = Array.from(this.timeline.values());
    if (query.timeRange) {
      entries = entries.filter(entry => )
        entry.timestamp >= query.timeRange!.start && 
        entry.timestamp <= query.timeRange!.end
      );
    if (query.domains) {
      entries = entries.filter(entry => query.domains!.includes(entry.domain));
    if (query.types) {
      entries = entries.filter(entry => query.types!.includes(entry.type));
    if (query.branches) {
      entries = entries.filter(entry => )
        query.branches!.includes(entry.metadata.branchId || '')
      );
    if (query.tags) {
      entries = entries.filter(entry => )
        query.tags!.some(tag => entry.metadata.tags.includes(tag))
      );
    if (query.search) {
      entries = this.searchTimeline(query.search, { fields: ['description'] });
    // Apply pagination
    if (query.offset || query.limit) {
      const start = query.offset || 0;
      const end = query.limit ? start + query.limit : undefined;
      entries = entries.slice(start, end);
    return entries.sort((a, b) => a.timestamp - b.timestamp);
  private async executeAutoReplay(session: ReplaySession): Promise<void> {
    while (this.isReplaying && session.autoPlay && session.currentIndex < session.timeline.length) {
      if (session.breakpoints.includes(session.currentIndex)) {
        session.autoPlay = false;
        this.emit('replayBreakpoint', { session, index: session.currentIndex });
        break;
      this.stepReplay(session.id);
      const delay = 1000 / session.playbackSpeed;
      await new Promise(resolve => setTimeout(resolve, delay));
    if (session.currentIndex >= session.timeline.length) {
      if (session.loop) {
        session.currentIndex = 0;
        this.executeAutoReplay(session);
      } else {
        this.emit('replayCompleted', { session });
  private extractStateFromEntry(entry: TimelineEntry): any {
    if (entry.snapshot) {
      return entry.snapshot.state;
    } else if (entry.change) {
      return entry.change.payload;
    return {};
  private calculateDeepDiff(from: any, to: any, path: string): StateDiff {
    const diffs: StateDiff = [];
    // Handle primitive values
    if (from === to) {
      diffs.push({ path, type: 'unchanged', oldValue: from, newValue: to });
      return diffs;
    if (typeof from !== typeof to || from === null || to === null) {
      diffs.push({ path, type: 'modified', oldValue: from, newValue: to });
      return diffs;
    // Handle objects
    if (typeof from === 'object' && typeof to === 'object') {
      const allKeys = new Set([...Object.keys(from), ...Object.keys(to)]);
      for (const key of allKeys) {
        const keyPath = path ? `${path}.${key}` : key;}
        if (!(key in from)) {
          diffs.push({ path: keyPath, type: 'added', newValue: to[key] });
        } else if (!(key in to)) {
          diffs.push({ path: keyPath, type: 'removed', oldValue: from[key] });
        } else {
          const childDiffs = this.calculateDeepDiff(from[key], to[key], keyPath);
          diffs.push(...childDiffs);
    } else {
      diffs.push({ path, type: 'modified', oldValue: from, newValue: to });
    return diffs;
  private getFieldValue(entry: TimelineEntry, field: string): any {
    switch (field) {
      case 'description':
        return entry.metadata.description;
      case 'tags':
        return entry.metadata.tags.join(' ');
      case 'domain':
        return entry.domain;
      case 'type':
        return entry.type;
      default:
        return null;
  private generateEntryId(): string {
    return `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;}
  private generateBranchId(): string {
    return `branch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;}
  private generateMarkerId(): string {
    return `marker_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;}
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;}
  private generateRandomColor(): string {
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#98d8c8'];
  return colors[Math.floor(Math.random() * colors.length)];
  // Public API methods
  getTimeTravelState(): TimeTravelState {,
  return {
  currentPosition: this.currentPosition,
  currentBranch: this.currentBranch,
  totalEntries: this.timelineOrder.length,
  isReplaying: this.isReplaying,
  canGoBack: this.canGoBack(),
  canGoForward: this.canGoForward(),
  branches: Array.from(this.branches.keys()),
  markers: Array.from(this.markers.values()),
};
  canGoBack(): boolean {
  return this.currentPosition > 0;
  canGoForward(): boolean {,
  return this.currentPosition < this.timelineOrder.length - 1;
  getTimeline(): TimelineEntry {,
  return this.timelineOrder.map(id => this.timeline.get(id)!).filter(Boolean);
  getBranches(): TimeBranch {,
  return Array.from(this.branches.values());
  getMarkers(): TimelineMarker {,
  return Array.from(this.markers.values());
  getReplaySessions(): ReplaySession {,
  return Array.from(this.replaySessions.values());
  getCurrentEntry(): TimelineEntry | null {,
  if (this.currentPosition < 0 || this.currentPosition >= this.timelineOrder.length) {
  return null;
  return this.timeline.get(this.timelineOrder[this.currentPosition]) || null;
  startRecording(): void {,
  this.isRecording = true;
  this.emit('recordingStarted');
  stopRecording(): void {,
  this.isRecording = false;
  this.emit('recordingStopped');
  clearHistory(): void {,
  this.timeline.clear();
  this.timelineOrder = [];
  this.currentPosition = -1;
  this.markers.clear();
  // Keep main branch but clear entries
  const mainBranch = this.branches.get('main');
  if (mainBranch) {
  mainBranch.entryIds = [];
  mainBranch.headEntryId = '';
  this.emit('historyCleared');
  exportHistory(): any {,
  return {
  timeline: Object.fromEntries(this.timeline),
  timelineOrder: this.timelineOrder,
  branches: Object.fromEntries(this.branches),
  markers: Object.fromEntries(this.markers),
  config: this.config,
  metadata: {
  currentPosition: this.currentPosition,
  currentBranch: this.currentBranch,
  exported: Date.now(),
};
  importHistory(data: any): void {
    this.timeline = new Map(Object.entries(data.timeline || {}));
    this.timelineOrder = data.timelineOrder || [];
    this.branches = new Map(Object.entries(data.branches || {}));
    this.markers = new Map(Object.entries(data.markers || {}));
    this.currentPosition = data.metadata?.currentPosition || -1;
    this.currentBranch = data.metadata?.currentBranch || 'main';
    this.emit('historyImported', { data });

// Global TimeTravel instance
export const globalTimeTravel = new TimeTravel();