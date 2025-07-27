/**
 * DevTools Integration Test
 * Verifies that state containers properly integrate with DevTools
 */

import { GraphStateContainer } from '../domains/graph-editor/state/GraphStateContainer';
import { AdminStateContainer } from '../domains/admin-dashboard/state/AdminStateContainer';
import { globalStateDevTools } from '../devtools/StateDevTools';

describe('DevTools Integration', () => {
  beforeEach(() => {
    // Clear any existing state
    globalStateDevTools.clearHistory();
    jest.clearAllMocks();
  });

  it('should record state changes in DevTools for GraphStateContainer', async () => {
    const container = new GraphStateContainer();
    const recordSpy = jest.spyOn(globalStateDevTools, 'recordStateChange');

    // Perform a state change
    await container.executeOperation({
      type: 'ADD_NODE',
      node: {
        id: 'test-node',
        type: 'test',
        position: { x: 100, y: 100 },
        data: { label: 'Test Node' },
        metadata: { created: Date.now(), updated: Date.now(), version: 1 }
      }
    });

    // Verify DevTools recorded the change
    expect(recordSpy).toHaveBeenCalled();
    
    const history = globalStateDevTools.getStateHistory();
    expect(history.length).toBeGreaterThan(0);
    expect(history[0].metadata.domain).toBe('graph-editor');
  });

  it('should record state changes in DevTools for AdminStateContainer', async () => {
    const container = new AdminStateContainer();
    const recordSpy = jest.spyOn(globalStateDevTools, 'recordStateChange');

    // Perform a state change
    await container.addUser({
      id: 'test-user',
      username: 'testuser',
      email: 'test@example.com',
      role: 'user',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      profile: {
        firstName: 'Test',
        lastName: 'User',
        preferences: {
          theme: 'light',
          language: 'en',
          timezone: 'UTC',
          notifications: {
            email: true,
            push: false,
            desktop: true
          }
        }
      },
      permissions: [],
      activity: {
        loginCount: 0,
        lastActions: [],
        sessionsActive: 0,
        ipAddresses: [],
        devices: []
      }
    });

    // Verify DevTools recorded the change
    expect(recordSpy).toHaveBeenCalled();
    
    const history = globalStateDevTools.getStateHistory();
    expect(history.length).toBeGreaterThan(0);
    expect(history[0].metadata.domain).toBe('admin-dashboard');
  });

  it('should support time travel functionality', async () => {
    const container = new GraphStateContainer();
    
    // Record multiple state changes
    await container.executeOperation({
      type: 'ADD_NODE',
      node: {
        id: 'node1',
        type: 'test',
        position: { x: 100, y: 100 },
        data: { label: 'Node 1' },
        metadata: { created: Date.now(), updated: Date.now(), version: 1 }
      }
    });

    await container.executeOperation({
      type: 'ADD_NODE',
      node: {
        id: 'node2',
        type: 'test',
        position: { x: 200, y: 200 },
        data: { label: 'Node 2' },
        metadata: { created: Date.now(), updated: Date.now(), version: 1 }
      }
    });

    const history = globalStateDevTools.getStateHistory();
    expect(history.length).toBe(2);

    // Test replay functionality
    const fromTime = history[0].timestamp;
    const toTime = history[1].timestamp;
    
    expect(() => {
      globalStateDevTools.replayStateChanges(fromTime, toTime);
    }).not.toThrow();
  });

  it('should provide performance metrics', async () => {
    const container = new GraphStateContainer();
    
    // Perform operations that should be tracked
    await container.executeOperation({
      type: 'ADD_NODE',
      node: {
        id: 'perf-test-node',
        type: 'test',
        position: { x: 100, y: 100 },
        data: { label: 'Performance Test' },
        metadata: { created: Date.now(), updated: Date.now(), version: 1 }
      }
    });

    const report = globalStateDevTools.detectStateBottlenecks();
    
    expect(report).toHaveProperty('summary');
    expect(report).toHaveProperty('bottlenecks');
    expect(report).toHaveProperty('recommendations');
    expect(report).toHaveProperty('trends');
  });

  it('should validate state integrity', async () => {
    const container = new GraphStateContainer();
    const state = container.getState();
    
    const validation = globalStateDevTools.validateStateIntegrity(state, 'graph-editor');
    
    expect(validation).toHaveProperty('valid');
    expect(validation).toHaveProperty('errors');
    expect(validation).toHaveProperty('performance');
    expect(validation.performance).toHaveProperty('validationTime');
  });

  it('should support dependency visualization', () => {
    const graph = globalStateDevTools.visualizeStateDependencies({
      domains: ['graph-editor', 'admin-dashboard'],
      includeComponents: true,
      includeSelectors: true,
      layout: 'hierarchical'
    });

    expect(graph).toHaveProperty('nodes');
    expect(graph).toHaveProperty('edges');
    expect(graph).toHaveProperty('metadata');
    expect(Array.isArray(graph.nodes)).toBe(true);
    expect(Array.isArray(graph.edges)).toBe(true);
  });
});