/**
 * Enhanced Collaboration Service Tests
 * Comprehensive tests for the enhanced collaboration features
 */

import { EventEmitter } from 'events';
import { EnhancedCollaborationService, EnhancedCollaborationConfig } from '../EnhancedCollaborationService';
import { WebSocketServer } from '../WebSocketServer';
import { SynchronizationManager } from '../SynchronizationManager';
import { ConflictResolver } from '../ConflictResolver';
import { PresenceManager } from '../PresenceManager';
import { ConnectionManager } from '../ConnectionManager';

// Mock the WebSocket server and its components
class MockSynchronizationManager extends EventEmitter {
  initializeDocument = jest.fn();
  getDocumentState = jest.fn(() => ({
    documentId: 'test-doc',
    version: 1,
    lastModified: Date.now(),
    checksum: 'mock-checksum',
    nodes: new Map(),
    edges: new Map(),
    metadata: {}
  }));
  createStateUpdate = jest.fn();
  applyStateUpdate = jest.fn();
}

class MockConflictResolver extends EventEmitter {
  processOperation = jest.fn();
  getConflictStats = jest.fn(() => ({
    total: 0,
    pending: 0,
    resolved: 0,
    escalated: 0,
    autoResolved: 0,
    avgResolutionTime: 0
  }));
}

class MockPresenceManager extends EventEmitter {
  addUserPresence = jest.fn();
  updateUserPresence = jest.fn();
  removeUserPresence = jest.fn();
  getDocumentUsers = jest.fn(() => []);
}

class MockConnectionManager extends EventEmitter {
  getConnectionInfo = jest.fn();
  hasPermission = jest.fn(() => true);
  broadcastToDocument = jest.fn();
}

class MockWebSocketServer extends EventEmitter {
  syncManager = new MockSynchronizationManager();
  conflictResolver = new MockConflictResolver();
  presenceManager = new MockPresenceManager();
  connectionManager = new MockConnectionManager();
  
  initializeDocument = jest.fn();
  broadcastToDocument = jest.fn();
}

describe('EnhancedCollaborationService', () => {
  let collaborationService: EnhancedCollaborationService;
  let mockWsServer: MockWebSocketServer;
  let config: EnhancedCollaborationConfig;

  beforeEach(() => {
    mockWsServer = new MockWebSocketServer();
    config = {
      maxSessionsPerDocument: 5,
      sessionTimeoutMs: 24 * 60 * 60 * 1000,
      lockTimeoutMs: 10 * 60 * 1000,
      autoLockEnabled: true,
      snapshotEnabled: true,
      maxSnapshotsPerSession: 10,
      analyticsEnabled: true,
      enableAdvancedConflictResolution: true,
      enableSmartMerging: true,
      enableOperationalTransform: false
    };

    collaborationService = new EnhancedCollaborationService(
      mockWsServer as any,
      config
    );
  });

  afterEach(() => {
    collaborationService.cleanup();
  });

  describe('Session Management', () => {
    test('should create a new collaboration session', () => {
      const session = collaborationService.createSession(
        'doc-123',
        'user-456',
        'Test Session'
      );

      expect(session).toBeDefined();
      expect(session.documentId).toBe('doc-123');
      expect(session.owner).toBe('user-456');
      expect(session.title).toBe('Test Session');
      expect(session.status).toBe('active');
      expect(session.participants).toHaveLength(1);
      expect(session.participants[0].role).toBe('owner');
    });

    test('should join an existing session', () => {
      const session = collaborationService.createSession(
        'doc-123',
        'user-456',
        'Test Session'
      );

      const participant = collaborationService.joinSession(
        session.sessionId,
        'user-789',
        'John Doe',
        'avatar.jpg',
        'editor'
      );

      expect(participant).toBeDefined();
      expect(participant?.userId).toBe('user-789');
      expect(participant?.userName).toBe('John Doe');
      expect(participant?.role).toBe('editor');
      expect(participant?.isOnline).toBe(true);

      const updatedSession = collaborationService.getSession(session.sessionId);
      expect(updatedSession?.participants).toHaveLength(2);
    });

    test('should not allow joining when session is full', () => {
      // Create session with max 2 participants
      const session = collaborationService.createSession(
        'doc-123',
        'user-456',
        'Test Session',
        { maxParticipants: 2 }
      );

      // Join as second participant
      const participant1 = collaborationService.joinSession(
        session.sessionId,
        'user-789',
        'John Doe',
        undefined,
        'editor'
      );
      expect(participant1).toBeDefined();

      // Try to join as third participant (should fail)
      const participant2 = collaborationService.joinSession(
        session.sessionId,
        'user-101',
        'Jane Doe',
        undefined,
        'editor'
      );
      expect(participant2).toBeNull();
    });

    test('should leave a session successfully', () => {
      const session = collaborationService.createSession(
        'doc-123',
        'user-456',
        'Test Session'
      );

      collaborationService.joinSession(
        session.sessionId,
        'user-789',
        'John Doe'
      );

      const success = collaborationService.leaveSession(session.sessionId, 'user-789');
      expect(success).toBe(true);

      const updatedSession = collaborationService.getSession(session.sessionId);
      const participant = updatedSession?.participants.find(p => p.userId === 'user-789');
      expect(participant?.isOnline).toBe(false);
    });

    test('should get sessions for a document', () => {
      collaborationService.createSession('doc-123', 'user-1', 'Session 1');
      collaborationService.createSession('doc-123', 'user-2', 'Session 2');
      collaborationService.createSession('doc-456', 'user-3', 'Session 3');

      const docSessions = collaborationService.getDocumentSessions('doc-123');
      expect(docSessions).toHaveLength(2);
      expect(docSessions.every(s => s.documentId === 'doc-123')).toBe(true);
    });

    test('should get user sessions', () => {
      const session1 = collaborationService.createSession('doc-123', 'user-1', 'Session 1');
      const session2 = collaborationService.createSession('doc-456', 'user-2', 'Session 2');
      
      collaborationService.joinSession(session2.sessionId, 'user-1', 'User 1');

      const userSessions = collaborationService.getUserSessions('user-1');
      expect(userSessions).toHaveLength(2);
    });
  });

  describe('Element Locking', () => {
    let session: any;
    let participantId: string;

    beforeEach(() => {
      session = collaborationService.createSession('doc-123', 'user-owner', 'Test Session');
      const participant = collaborationService.joinSession(
        session.sessionId,
        'user-editor',
        'Editor User',
        undefined,
        'editor'
      );
      participantId = participant!.userId;
    });

    test('should lock an element', () => {
      const lock = collaborationService.lockElement(
        session.sessionId,
        participantId,
        'node-123',
        'node',
        'Editing properties'
      );

      expect(lock).toBeDefined();
      expect(lock?.targetId).toBe('node-123');
      expect(lock?.type).toBe('node');
      expect(lock?.userId).toBe(participantId);
      expect(lock?.reason).toBe('Editing properties');
      expect(lock?.isAutoLock).toBe(false);
    });

    test('should not allow locking already locked element', () => {
      // First user locks the element
      const lock1 = collaborationService.lockElement(
        session.sessionId,
        participantId,
        'node-123',
        'node'
      );
      expect(lock1).toBeDefined();

      // Second user tries to lock same element
      const participant2 = collaborationService.joinSession(
        session.sessionId,
        'user-other',
        'Other User'
      );

      const lock2 = collaborationService.lockElement(
        session.sessionId,
        participant2!.userId,
        'node-123',
        'node'
      );
      expect(lock2).toBeNull();
    });

    test('should unlock an element', () => {
      const lock = collaborationService.lockElement(
        session.sessionId,
        participantId,
        'node-123',
        'node'
      );

      const success = collaborationService.unlockElement(
        session.sessionId,
        participantId,
        lock!.lockId
      );
      expect(success).toBe(true);
    });

    test('should not allow unlocking someone elses lock', () => {
      const lock = collaborationService.lockElement(
        session.sessionId,
        participantId,
        'node-123',
        'node'
      );

      const participant2 = collaborationService.joinSession(
        session.sessionId,
        'user-other',
        'Other User'
      );

      const success = collaborationService.unlockElement(
        session.sessionId,
        participant2!.userId,
        lock!.lockId
      );
      expect(success).toBe(false);
    });

    test('should allow owner to unlock any element', () => {
      const lock = collaborationService.lockElement(
        session.sessionId,
        participantId,
        'node-123',
        'node'
      );

      const success = collaborationService.unlockElement(
        session.sessionId,
        'user-owner', // Session owner
        lock!.lockId
      );
      expect(success).toBe(true);
    });
  });

  describe('Snapshots', () => {
    let session: any;
    let participantId: string;

    beforeEach(() => {
      session = collaborationService.createSession('doc-123', 'user-owner', 'Test Session');
      const participant = collaborationService.joinSession(
        session.sessionId,
        'user-editor',
        'Editor User',
        undefined,
        'editor'
      );
      participantId = participant!.userId;
    });

    test('should create a snapshot', () => {
      const snapshot = collaborationService.createSnapshot(
        session.sessionId,
        participantId,
        'Test Snapshot',
        'A test snapshot',
        ['test', 'snapshot']
      );

      expect(snapshot).toBeDefined();
      expect(snapshot?.name).toBe('Test Snapshot');
      expect(snapshot?.description).toBe('A test snapshot');
      expect(snapshot?.tags).toContain('test');
      expect(snapshot?.createdBy).toBe(participantId);
    });

    test('should limit number of snapshots per session', () => {
      // Create maximum number of snapshots
      for (let i = 0; i < config.maxSnapshotsPerSession; i++) {
        const snapshot = collaborationService.createSnapshot(
          session.sessionId,
          participantId,
          `Snapshot ${i}`
        );
        expect(snapshot).toBeDefined();
      }

      // Creating one more should remove the oldest
      const extraSnapshot = collaborationService.createSnapshot(
        session.sessionId,
        participantId,
        'Extra Snapshot'
      );
      expect(extraSnapshot).toBeDefined();

      const updatedSession = collaborationService.getSession(session.sessionId);
      expect(updatedSession?.snapshots).toHaveLength(config.maxSnapshotsPerSession);
      expect(updatedSession?.snapshots[0].name).toBe('Snapshot 1'); // First one removed
    });

    test('should restore from snapshot', () => {
      const snapshot = collaborationService.createSnapshot(
        session.sessionId,
        participantId,
        'Test Snapshot'
      );

      const success = collaborationService.restoreSnapshot(
        session.sessionId,
        participantId,
        snapshot!.snapshotId
      );

      expect(success).toBe(true);
    });

    test('should not allow viewer to create snapshots', () => {
      const viewer = collaborationService.joinSession(
        session.sessionId,
        'user-viewer',
        'Viewer User',
        undefined,
        'viewer'
      );

      const snapshot = collaborationService.createSnapshot(
        session.sessionId,
        viewer!.userId,
        'Viewer Snapshot'
      );

      expect(snapshot).toBeNull();
    });
  });

  describe('Analytics', () => {
    test('should track session analytics', () => {
      const session = collaborationService.createSession('doc-123', 'user-owner', 'Test Session');
      
      // Join users
      collaborationService.joinSession(session.sessionId, 'user-1', 'User 1');
      collaborationService.joinSession(session.sessionId, 'user-2', 'User 2');

      const analytics = collaborationService.getSessionAnalytics(session.sessionId);
      
      expect(analytics).toBeDefined();
      expect(analytics?.peakConcurrentUsers).toBe(3); // owner + 2 joiners
      expect(analytics?.totalEdits).toBe(0); // No edits yet
      expect(analytics?.totalConflicts).toBe(0); // No conflicts yet
    });

    test('should update analytics on graph updates', () => {
      const session = collaborationService.createSession('doc-123', 'user-owner', 'Test Session');
      
      // Simulate graph update event
      (collaborationService as any).handleGraphUpdate(
        'doc-123',
        { type: 'node_add', nodeId: 'node-1' },
        { userId: 'user-owner' }
      );

      const analytics = collaborationService.getSessionAnalytics(session.sessionId);
      expect(analytics?.totalEdits).toBe(1);
    });
  });

  describe('Session Settings', () => {
    test('should update session settings', () => {
      const session = collaborationService.createSession('doc-123', 'user-owner', 'Test Session');
      
      const success = collaborationService.updateSessionSettings(
        session.sessionId,
        'user-owner',
        {
          enableComments: false,
          maxParticipants: 5
        }
      );

      expect(success).toBe(true);
      
      const updatedSession = collaborationService.getSession(session.sessionId);
      expect(updatedSession?.settings.enableComments).toBe(false);
      expect(updatedSession?.settings.maxParticipants).toBe(5);
    });

    test('should not allow non-owner to modify settings', () => {
      const session = collaborationService.createSession('doc-123', 'user-owner', 'Test Session');
      const participant = collaborationService.joinSession(
        session.sessionId,
        'user-editor',
        'Editor User'
      );

      const success = collaborationService.updateSessionSettings(
        session.sessionId,
        participant!.userId,
        { enableComments: false }
      );

      expect(success).toBe(false);
    });
  });

  describe('Event Handling', () => {
    test('should emit session created event', (done) => {
      collaborationService.on('session_created', (session) => {
        expect(session.documentId).toBe('doc-123');
        expect(session.title).toBe('Test Session');
        done();
      });

      collaborationService.createSession('doc-123', 'user-owner', 'Test Session');
    });

    test('should emit user joined event', (done) => {
      const session = collaborationService.createSession('doc-123', 'user-owner', 'Test Session');

      collaborationService.on('user_joined', (sessionId, participant) => {
        expect(sessionId).toBe(session.sessionId);
        expect(participant.userId).toBe('user-editor');
        done();
      });

      collaborationService.joinSession(session.sessionId, 'user-editor', 'Editor');
    });

    test('should emit element locked event', (done) => {
      const session = collaborationService.createSession('doc-123', 'user-owner', 'Test Session');

      collaborationService.on('element_locked', (sessionId, lock) => {
        expect(sessionId).toBe(session.sessionId);
        expect(lock.targetId).toBe('node-123');
        done();
      });

      collaborationService.lockElement(session.sessionId, 'user-owner', 'node-123', 'node');
    });
  });

  describe('Session Lifecycle', () => {
    test('should end a session successfully', () => {
      const session = collaborationService.createSession('doc-123', 'user-owner', 'Test Session');
      
      const success = collaborationService.endSession(session.sessionId, 'user-owner');
      expect(success).toBe(true);

      const updatedSession = collaborationService.getSession(session.sessionId);
      expect(updatedSession?.status).toBe('ended');
    });

    test('should not allow non-owner to end session', () => {
      const session = collaborationService.createSession('doc-123', 'user-owner', 'Test Session');
      const participant = collaborationService.joinSession(
        session.sessionId,
        'user-editor',
        'Editor User'
      );

      const success = collaborationService.endSession(session.sessionId, participant!.userId);
      expect(success).toBe(false);
    });
  });

  describe('Permissions', () => {
    test('should assign correct permissions based on role', () => {
      const session = collaborationService.createSession('doc-123', 'user-owner', 'Test Session');
      
      const editor = collaborationService.joinSession(
        session.sessionId,
        'user-editor',
        'Editor User',
        undefined,
        'editor'
      );

      const viewer = collaborationService.joinSession(
        session.sessionId,
        'user-viewer',
        'Viewer User',
        undefined,
        'viewer'
      );

      expect(editor?.permissions.canEdit).toBe(true);
      expect(editor?.permissions.canComment).toBe(true);
      expect(editor?.permissions.canDeleteSession).toBe(false);

      expect(viewer?.permissions.canEdit).toBe(false);
      expect(viewer?.permissions.canComment).toBe(true);
      expect(viewer?.permissions.canDeleteSession).toBe(false);
    });
  });
});