/**
 * TimeTravel Tests
 * REFACTOR-006: Advanced State Management & Data Flow Architecture
 * Phase 4: State Debugging & DevTools - Time Travel Test Coverage
 */
import { TimeTravel, TimeTravelConfig, globalTimeTravel } from '../TimeTravel';
describe('TimeTravel', () => { let timeTravel: TimeTravel;
  beforeEach(() => {
  timeTravel = new TimeTravel();
  jest.clearAllMocks() });
  afterEach(() => { timeTravel.removeAllListeners();
    timeTravel.stopRecording() });
  describe('Initialization', () => { it('should initialize with default configuration', () => {
  const config: TimeTravelConfig = {,
  maxHistorySize: 500,
  enableBranching: true,
  enableSnapshots: true,
  enableDiffing: true,
  compressionEnabled: false,
  persistHistory: false,
  autoSnapshot: {,
  enabled: false,
  interval: 30000,
  maxSnapshots: 10 }
};
      const timeTravelWithConfig = new TimeTravel(config);
      expect(timeTravelWithConfig).toBeInstanceOf(TimeTravel);
    });
    it('should initialize main branch', () => { const branches = timeTravel.getBranches();
      expect(branches).toHaveLength(1);
      expect(branches[0].id).toBe('main');
      expect(branches[0].name).toBe('main');
      expect(branches[0].metadata.protected).toBe(true) });
    it('should start with empty timeline', () => { const timeline = timeTravel.getTimeline();
      const state = timeTravel.getTimeTravelState();
      expect(timeline).toHaveLength(0);
      expect(state.totalEntries).toBe(0);
      expect(state.currentPosition).toBe(-1) });
  });
  describe('Recording', () => { beforeEach(() => {
      timeTravel.startRecording() });
    it('should record state snapshots', () => { const snapshot = {
        id: 'snapshot_1',
        timestamp: Date.now() }
        state: { count: 1, name: 'test' },
        metadata: { domain: 'test', step: 1 }
      };
      const entryId = timeTravel.recordStateSnapshot(snapshot, 'test-domain', { )
  description: 'Test snapshot',
  tags: ['test', 'snapshot'] }
});
      expect(entryId).toBeDefined();
      const timeline = timeTravel.getTimeline();
      expect(timeline).toHaveLength(1);
      expect(timeline[0].type).toBe('snapshot');
      expect(timeline[0].domain).toBe('test-domain');
      expect(timeline[0].metadata.description).toBe('Test snapshot');
      expect(timeline[0].metadata.tags).toContain('test');
    });
    it('should record state changes', () => { const change = {
        id: 'change_1',
        timestamp: Date.now(),
        type: 'UPDATE' }
        payload: { count: 2 },
        source: 'local';
  };
      const entryId = timeTravel.recordStateChange(change, 'test-domain', { )
  description: 'Update count',
  tags: ['update'] }
});
      expect(entryId).toBeDefined();
      const timeline = timeTravel.getTimeline();
      expect(timeline).toHaveLength(1);
      expect(timeline[0].type).toBe('change');
      expect(timeline[0].change).toEqual(change);
    });
    it('should maintain timeline order', () => {
      const entries = [];
      for (let i = 0; i < 5; i++) {
        const snapshot = {
          id: `snapshot_${i}`}
},
  timestamp: Date.now() + i * 1000,
          state: { index: i },
          metadata: { step: i }
        };
        entries.push(timeTravel.recordStateSnapshot(snapshot, 'test'));
      const timeline = timeTravel.getTimeline();
      expect(timeline).toHaveLength(5);
      // Should be in chronological order
      for (let i = 1; i < timeline.length; i++) { expect(timeline[i].timestamp).toBeGreaterThanOrEqual(timeline[i - 1].timestamp) });
    it('should respect history size limit', () => {
      const limitedTimeTravel = new TimeTravel({ maxHistorySize: 3 });
      limitedTimeTravel.startRecording();
      // Record more entries than the limit
      for (let i = 0; i < 5; i++) {
        const snapshot = {
          id: `snapshot_${i}`}
},
  timestamp: Date.now() + i,
          state: { index: i },
          metadata: {}
        };
        limitedTimeTravel.recordStateSnapshot(snapshot, 'test');
      const timeline = limitedTimeTravel.getTimeline();
      expect(timeline).toHaveLength(3);
      limitedTimeTravel.stopRecording();
    });
  });
  describe('Navigation', () => {
    beforeEach(() => {
      timeTravel.startRecording();
      // Record some test entries
      for (let i = 0; i < 5; i++) {
        const snapshot = {
          id: `nav_snapshot_${i}`}
},
  timestamp: Date.now() + i * 1000,
          state: { step: i },
          metadata: { index: i }
        };
        timeTravel.recordStateSnapshot(snapshot, 'nav-test');
    });
    it('should navigate to specific positions', () => { const success = timeTravel.goToPosition(2);
      expect(success).toBe(true);
      const state = timeTravel.getTimeTravelState();
      expect(state.currentPosition).toBe(2) });
    it('should navigate by entry ID', () => { const timeline = timeTravel.getTimeline();
      const targetEntry = timeline[3];
      const success = timeTravel.goToEntry(targetEntry.id);
      expect(success).toBe(true);
      const state = timeTravel.getTimeTravelState();
      expect(state.currentPosition).toBe(3) });
    it('should navigate by timestamp', () => { const timeline = timeTravel.getTimeline();
      const targetTimestamp = timeline[1].timestamp;
      const success = timeTravel.goToTimestamp(targetTimestamp);
      expect(success).toBe(true);
      const state = timeTravel.getTimeTravelState();
      expect(state.currentPosition).toBe(1) });
    it('should step backward and forward', () => { timeTravel.goToPosition(2);
      // Step back
      const backSuccess = timeTravel.goBack();
      expect(backSuccess).toBe(true);
      expect(timeTravel.getTimeTravelState().currentPosition).toBe(1);
      // Step forward
      const forwardSuccess = timeTravel.goForward();
      expect(forwardSuccess).toBe(true);
      expect(timeTravel.getTimeTravelState().currentPosition).toBe(2) });
    it('should respect navigation boundaries', () => { // Try to go before start
      const beforeStart = timeTravel.goToPosition(-1);
      expect(beforeStart).toBe(false);
      // Try to go beyond end
      const timeline = timeTravel.getTimeline();
      const beyondEnd = timeTravel.goToPosition(timeline.length);
      expect(beyondEnd).toBe(false) });
    it('should update navigation state correctly', () => { timeTravel.goToPosition(2);
      const state = timeTravel.getTimeTravelState();
      expect(state.canGoBack).toBe(true);
      expect(state.canGoForward).toBe(true);
      timeTravel.goToStart();
      const startState = timeTravel.getTimeTravelState();
      expect(startState.canGoBack).toBe(false);
      expect(startState.canGoForward).toBe(true);
      timeTravel.goToEnd();
      const endState = timeTravel.getTimeTravelState();
      expect(endState.canGoBack).toBe(true);
      expect(endState.canGoForward).toBe(false) });
    it('should emit position change events', () => { const eventHandler = jest.fn();
  timeTravel.on('positionChanged', eventHandler);
  timeTravel.goToPosition(1);
  expect(eventHandler).toHaveBeenCalledWith({)
  previousPosition: -1,
  currentPosition: 1,
  entry: expect.any(Object),
  canGoBack: true,
  canGoForward: true }
});
    });
  });
  describe('Branching', () => {
    beforeEach(() => {
      timeTravel.startRecording();
      // Create some timeline entries
      for (let i = 0; i < 3; i++) {
        const snapshot = {
          id: `branch_snapshot_${i}`}
},
  timestamp: Date.now() + i * 1000,
          state: { step: i },
          metadata: { index: i }
        };
        timeTravel.recordStateSnapshot(snapshot, 'branch-test');
    });
    it('should create new branches', () => { timeTravel.goToPosition(1);
  const branchId = timeTravel.createBranch('feature-branch', {)
  description: 'Feature development branch',
  author: 'developer',
  tags: ['feature'] }
});
      expect(branchId).toBeDefined();
      const branches = timeTravel.getBranches();
      expect(branches).toHaveLength(2); // main + new branch
      const newBranch = branches.find(b => b.id === branchId);
      expect(newBranch?.name).toBe('feature-branch');
      expect(newBranch?.metadata.author).toBe('developer');
    });
    it('should switch between branches', () => { const branchId = timeTravel.createBranch('test-branch');
      const success = timeTravel.switchBranch(branchId);
      expect(success).toBe(true);
      const state = timeTravel.getTimeTravelState();
      expect(state.currentBranch).toBe(branchId) });
    it('should emit branch events', () => { const createHandler = jest.fn();
      const switchHandler = jest.fn();
      timeTravel.on('branchCreated', createHandler);
      timeTravel.on('branchSwitched', switchHandler);
      const branchId = timeTravel.createBranch('event-test');
      timeTravel.switchBranch(branchId);
      expect(createHandler).toHaveBeenCalled();
      expect(switchHandler).toHaveBeenCalled() });
    it('should merge branches', () => { const sourceBranchId = timeTravel.createBranch('source');
  const targetBranchId = timeTravel.createBranch('target');
  const mergeEntryId = timeTravel.mergeBranch(sourceBranchId, targetBranchId, {)
  strategy: 'merge-commit',
  message: 'Merge source into target' }
});
      expect(mergeEntryId).toBeDefined();
      const timeline = timeTravel.getTimeline();
      const mergeEntry = timeline.find(e => e.id === mergeEntryId);
      expect(mergeEntry?.type).toBe('merge');
    });
  });
  describe('Markers', () => {
    beforeEach(() => {
      timeTravel.startRecording();
      // Create timeline entries
      for (let i = 0; i < 3; i++) {
        const snapshot = {
          id: `marker_snapshot_${i}`}
},
  timestamp: Date.now() + i * 1000,
          state: { step: i },
          metadata: { index: i }
        };
        timeTravel.recordStateSnapshot(snapshot, 'marker-test');
    });
    it('should add markers to timeline entries', () => { const timeline = timeTravel.getTimeline();
  const entryId = timeline[1].id;
  const markerId = timeTravel.addMarker({)
  entryId,
  name: 'Important Point',
  description: 'This is an important point in the timeline',
  color: '#ff0000',
  type: 'milestone' }
});
      expect(markerId).toBeDefined();
      const markers = timeTravel.getMarkers();
      expect(markers).toHaveLength(1);
      expect(markers[0].name).toBe('Important Point');
      expect(markers[0].entryId).toBe(entryId);
    });
    it('should remove markers', () => { const timeline = timeTravel.getTimeline();
  const entryId = timeline[0].id;
  const markerId = timeTravel.addMarker({)
  entryId,
  name: 'Temporary Marker',
  description: 'Will be removed',
  color: '#00ff00',
  type: 'bookmark' }
});
      expect(timeTravel.getMarkers()).toHaveLength(1);
      const removed = timeTravel.removeMarker(markerId);
      expect(removed).toBe(true);
      expect(timeTravel.getMarkers()).toHaveLength(0);
    });
    it('should emit marker events', () => { const addHandler = jest.fn();
  const removeHandler = jest.fn();
  timeTravel.on('markerAdded', addHandler);
  timeTravel.on('markerRemoved', removeHandler);
  const timeline = timeTravel.getTimeline();
  const markerId = timeTravel.addMarker({)
  entryId: timeline[0].id,
  name: 'Test Marker',
  description: 'Test',
  color: '#0000ff',
  type: 'test' }
});
      timeTravel.removeMarker(markerId);
      expect(addHandler).toHaveBeenCalled();
      expect(removeHandler).toHaveBeenCalled();
    });
  });
  describe('Replay Sessions', () => {
    beforeEach(() => {
      timeTravel.startRecording();
      // Create timeline entries
      for (let i = 0; i < 5; i++) {
        const change = {
          id: `replay_change_${i}`}
},
  timestamp: Date.now() + i * 1000,
          type: 'UPDATE',
          payload: { step: i },
          source: 'local';
  };
        timeTravel.recordStateChange(change, 'replay-test');
    });
    it('should create replay sessions', () => { const sessionId = timeTravel.createReplaySession('Test Session', {)
  description: 'Test replay session',
  speed: 2 }
});
      expect(sessionId).toBeDefined();
      const sessions = timeTravel.getReplaySessions();
      expect(sessions).toHaveLength(1);
      expect(sessions[0].name).toBe('Test Session');
      expect(sessions[0].playbackSpeed).toBe(2);
    });
    it('should start replay sessions', () => { const sessionId = timeTravel.createReplaySession('Auto Session');
  const success = timeTravel.startReplay(sessionId, {)
  autoPlay: false,
  speed: 1 }
});
      expect(success).toBe(true);
      const state = timeTravel.getTimeTravelState();
      expect(state.isReplaying).toBe(true);
    });
    it('should step through replay sessions', () => {
      const sessionId = timeTravel.createReplaySession('Step Session');
      timeTravel.startReplay(sessionId, { autoPlay: false });
      const forwardSuccess = timeTravel.stepReplay(sessionId, 'forward');
      expect(forwardSuccess).toBe(true);
      const backwardSuccess = timeTravel.stepReplay(sessionId, 'backward');
      expect(backwardSuccess).toBe(true);
    });
    it('should emit replay events', () => {
      const startHandler = jest.fn();
      const stepHandler = jest.fn();
      const stopHandler = jest.fn();
      timeTravel.on('replayStarted', startHandler);
      timeTravel.on('replayStep', stepHandler);
      timeTravel.on('replayStopped', stopHandler);
      const sessionId = timeTravel.createReplaySession('Event Session');
      timeTravel.startReplay(sessionId, { autoPlay: false });
      timeTravel.stepReplay(sessionId);
      timeTravel.stopReplay();
      expect(startHandler).toHaveBeenCalled();
      expect(stepHandler).toHaveBeenCalled();
      expect(stopHandler).toHaveBeenCalled();
    });
  });
  describe('State Diffing', () => { beforeEach(() => {
      timeTravel.startRecording();
      // Create snapshots with different states
      const snapshot1 = {
        id: 'diff_snapshot_1',
        timestamp: Date.now() }
        state: { count: 1, name: 'first', items: ['a', 'b'] },
        metadata: {}
      };
      const snapshot2 = { id: 'diff_snapshot_2',
        timestamp: Date.now() + 1000 }
        state: { count: 2, name: 'second', items: ['a', 'b', 'c'], newField: true },
        metadata: {}
      };
      timeTravel.recordStateSnapshot(snapshot1, 'diff-test');
      timeTravel.recordStateSnapshot(snapshot2, 'diff-test');
    });
    it('should create state diffs between snapshots', () => { const timeline = timeTravel.getTimeline();
      const fromEntryId = timeline[0].id;
      const toEntryId = timeline[1].id;
      const diffs = timeTravel.createStateDiff(fromEntryId, toEntryId);
      expect(Array.isArray(diffs)).toBe(true);
      expect(diffs.length).toBeGreaterThan(0);
      // Should detect the count change
      const countDiff = diffs.find(d => d.path === 'count');
      expect(countDiff?.type).toBe('modified');
      expect(countDiff?.oldValue).toBe(1);
      expect(countDiff?.newValue).toBe(2);
      // Should detect the new field
      const newFieldDiff = diffs.find(d => d.path === 'newField');
      expect(newFieldDiff?.type).toBe('added');
      expect(newFieldDiff?.newValue).toBe(true) });
    it('should handle missing entries gracefully', () => { expect(() => {
        timeTravel.createStateDiff('nonexistent1', 'nonexistent2') }).toThrow('One or both entries not found');
    });
  });
  describe('Timeline Queries', () => {
    beforeEach(() => {
      timeTravel.startRecording();
      // Create diverse timeline entries
      const domains = ['domain-a', 'domain-b'];
      const types = ['snapshot', 'change'];
      for (let i = 0; i < 10; i++) {
        const domain = domains[i % 2];
        const isSnapshot = i % 2 === 0;
        if (isSnapshot) {
          const snapshot = {
            id: `query_snapshot_${i}`}
},
  timestamp: Date.now() + i * 1000,
            state: { index: i, domain },
            metadata: {}
          };
          timeTravel.recordStateSnapshot(snapshot, domain, { )
  tags: ['test', domain] }
});
 else {
          const change = {
            id: `query_change_${i}`}
},
  timestamp: Date.now() + i * 1000,
            type: 'UPDATE',
            payload: { index: i },
            source: 'local';
  };
          timeTravel.recordStateChange(change, domain, { )
  tags: ['test', domain] }
});
    });
    it('should query timeline by time range', () => { const now = Date.now();
  const results = timeTravel.queryTimeline({)
  timeRange: {,
  start: now + 2000,
  end: now + 6000 }
});
      expect(results.length).toBe(5); // Entries 2, 3, 4, 5, 6
      results.forEach(entry => { )
  expect(entry.timestamp).toBeGreaterThanOrEqual(now + 2000);
        expect(entry.timestamp).toBeLessThanOrEqual(now + 6000) });
    });
    it('should query timeline by domains', () => { const results = timeTravel.queryTimeline({)
  domains: ['domain-a'] }
});
      expect(results.length).toBe(5); // Half the entries
      results.forEach(entry => { )
  expect(entry.domain).toBe('domain-a') });
    });
    it('should query timeline by types', () => { const results = timeTravel.queryTimeline({)
  types: ['snapshot'] }
});
      expect(results.length).toBe(5); // Half the entries
      results.forEach(entry => { )
  expect(entry.type).toBe('snapshot') });
    });
    it('should query timeline by tags', () => { const results = timeTravel.queryTimeline({)
  tags: ['domain-b'] }
});
      expect(results.length).toBe(5); // Half the entries
      results.forEach(entry => { )
  expect(entry.metadata.tags).toContain('domain-b') });
    });
    it('should support pagination', () => { const page1 = timeTravel.queryTimeline({)
  limit: 3,
  offset: 0 }
});
      const page2 = timeTravel.queryTimeline({ )
  limit: 3,
  offset: 3 }
});
      expect(page1).toHaveLength(3);
      expect(page2).toHaveLength(3);
      expect(page1[0].id).not.toBe(page2[0].id);
    });
    it('should search timeline by text', () => { const results = timeTravel.searchTimeline('domain-a', {)
  fields: ['tags'],
  caseSensitive: false }
});
      expect(results.length).toBe(5);
      results.forEach(entry => { )
  expect(entry.metadata.tags.join(' ').toLowerCase()).toContain('domain-a') });
    });
  });
  describe('Data Management', () => {
    beforeEach(() => {
      timeTravel.startRecording();
      // Create some test data
      for (let i = 0; i < 3; i++) {
        const snapshot = {
          id: `data_snapshot_${i}`}
},
  timestamp: Date.now() + i * 1000,
          state: { index: i },
          metadata: {}
        };
        timeTravel.recordStateSnapshot(snapshot, 'data-test');
    });
    it('should export history data', () => { const exportData = timeTravel.exportHistory();
      expect(exportData).toHaveProperty('timeline');
      expect(exportData).toHaveProperty('timelineOrder');
      expect(exportData).toHaveProperty('branches');
      expect(exportData).toHaveProperty('markers');
      expect(exportData).toHaveProperty('config');
      expect(exportData).toHaveProperty('metadata');
      expect(exportData.metadata.currentPosition).toBe(2); // Last entry
      expect(exportData.metadata.currentBranch).toBe('main') });
    it('should import history data', () => { const originalData = timeTravel.exportHistory();
      // Clear and import
      timeTravel.clearHistory();
      expect(timeTravel.getTimeline()).toHaveLength(0);
      const importHandler = jest.fn();
      timeTravel.on('historyImported', importHandler);
      timeTravel.importHistory(originalData);
      expect(timeTravel.getTimeline()).toHaveLength(3);
      expect(importHandler).toHaveBeenCalled() });
    it('should clear history', () => { expect(timeTravel.getTimeline()).toHaveLength(3);
      const clearHandler = jest.fn();
      timeTravel.on('historyCleared', clearHandler);
      timeTravel.clearHistory();
      expect(timeTravel.getTimeline()).toHaveLength(0);
      expect(timeTravel.getMarkers()).toHaveLength(0);
      expect(clearHandler).toHaveBeenCalled();
      // Main branch should still exist but be empty
      const branches = timeTravel.getBranches();
      expect(branches).toHaveLength(1);
      expect(branches[0].id).toBe('main');
      expect(branches[0].entryIds).toHaveLength(0) });
  });
  describe('Global Instance', () => { it('should provide a global TimeTravel instance', () => {
      expect(globalTimeTravel).toBeInstanceOf(TimeTravel) });
    it('should maintain singleton behavior', async () => {
      const { globalTimeTravel: imported } = await import('../TimeTravel');
      expect(imported).toBe(globalTimeTravel);
    });
  });
  describe('Edge Cases', () => { it('should handle recording when disabled', () => {
      timeTravel.stopRecording();
      const snapshot = {
        id: 'disabled_snapshot',
        timestamp: Date.now() }
        state: { test: true },
        metadata: {}
      };
      const entryId = timeTravel.recordStateSnapshot(snapshot, 'test');
      expect(entryId).toBe(''); // Should return empty string when not recording
      expect(timeTravel.getTimeline()).toHaveLength(0);
    });
    it('should handle navigation on empty timeline', () => { const state = timeTravel.getTimeTravelState();
      expect(state.canGoBack).toBe(false);
      expect(state.canGoForward).toBe(false);
      const success = timeTravel.goToPosition(0);
      expect(success).toBe(false) });
    it('should handle invalid branch operations', () => { const switchSuccess = timeTravel.switchBranch('nonexistent');
      expect(switchSuccess).toBe(false);
      const mergeResult = timeTravel.mergeBranch('nonexistent1', 'nonexistent2');
      expect(mergeResult).toBeNull() });
    it('should handle replay on empty timeline', () => {
      const sessionId = timeTravel.createReplaySession('Empty Session');
      const sessions = timeTravel.getReplaySessions();
      expect(sessions[0].timeline).toHaveLength(0);
      const startSuccess = timeTravel.startReplay(sessionId);
      expect(startSuccess).toBe(true); // Should still start but have nothing to replay
    });
  });
});