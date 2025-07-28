/**
 * Enhanced Collaboration Service
 * Extends the existing WebSocket collaboration infrastructure with advanced features
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { WebSocketServer } from './WebSocketServer';
import { SynchronizationManager, StateUpdate, StateOperation } from './SynchronizationManager';
import { ConflictResolver, ConflictOperation, ResolutionStrategy } from './ConflictResolver';
import { PresenceManager } from './PresenceManager';
import { ConnectionManager } from './ConnectionManager';

// Enhanced collaboration types
}
export interface CollaborationSession {
  sessionId: string;
  documentId: string;
  title: string;
  description?: string;
  owner: string;
  participants: CollaborationParticipant[];
  createdAt: number;
  lastActivity: number;
  status: 'active' | 'paused' | 'ended';
  settings: SessionSettings;
  permissions: SessionPermissions;
  locks: DocumentLock[];
  snapshots: SessionSnapshot[];
  analytics: SessionAnalytics;
}
}

}
export interface CollaborationParticipant {
  userId: string;
  userName: string;
  userAvatar?: string;
  role: 'owner' | 'editor' | 'viewer' | 'reviewer';
  joinedAt: number;
  lastSeen: number;
  permissions: ParticipantPermissions;
  connectionId?: string;
  isOnline: boolean;
  contribution: ContributionMetrics;
}
}

}
export interface SessionSettings {
  enableRealTimeSync: boolean;
  enableConflictResolution: boolean;
  enableVersionControl: boolean;
  enableComments: boolean;
  enableLocking: boolean;
  enablePresenceIndicators: boolean;
  autoSaveInterval: number; // ms
  conflictResolutionStrategy: ResolutionStrategy;
  maxParticipants: number;
  allowAnonymousUsers: boolean;
  requireAuthentication: boolean;
}
}

}
export interface SessionPermissions {
  canEdit: boolean;
  canComment: boolean;
  canInvite: boolean;
  canExport: boolean;
  canModifyPermissions: boolean;
  canDeleteSession: boolean;
  canLockElements: boolean;
  canResolveConflicts: boolean;
}
}

}
export interface ParticipantPermissions extends SessionPermissions {
  canViewPresence: boolean;
  canAccessHistory: boolean;
  canCreateSnapshots: boolean;
  canRestoreSnapshots: boolean;
}

}
export interface DocumentLock {
  lockId: string;
  type: 'node' | 'edge' | 'document' | 'selection';
  targetId: string;
  userId: string;
  userName: string;
  lockedAt: number;
  expiresAt?: number;
  reason?: string;
  isAutoLock: boolean;
}
}

}
export interface SessionSnapshot {
  snapshotId: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: number;
  documentVersion: number;
  documentState: unknown;
  participantCount: number;
  tags: string[];
}
}

}
export interface SessionAnalytics {
  totalEdits: number;
  totalConflicts: number;
  averageResolutionTime: number;
  participantActivity: Map<string, ContributionMetrics>;
  peakConcurrentUsers: number;
  sessionDuration: number;
  documentSize: {
    nodeCount: number;
    edgeCount: number;
    complexity: number;
}
  };
  performanceMetrics: PerformanceMetrics;
}

}
export interface ContributionMetrics {
  editsCount: number;
  commentsCount: number;
  conflictsCreated: number;
  conflictsResolved: number;
  timeActive: number; // ms
  elementsCreated: number;
  elementsModified: number;
  elementsDeleted: number;
}
}

}
export interface PerformanceMetrics {
  averageLatency: number;
  syncThroughput: number;
  errorRate: number;
  reconnections: number;
  messagingVolume: number;
}
}

}
export interface CollaborationEvent {
  eventId: string;
  sessionId: string;
  type: CollaborationEventType;
  userId: string;
  timestamp: number;
  data: unknown;
  metadata?: unknown;
}
}

export enum CollaborationEventType {
  SESSION_CREATED = 'session_created',
  USER_JOINED = 'user_joined',
  USER_LEFT = 'user_left',
  DOCUMENT_EDITED = 'document_edited',
  ELEMENT_LOCKED = 'element_locked',
  ELEMENT_UNLOCKED = 'element_unlocked',
  CONFLICT_DETECTED = 'conflict_detected',
  CONFLICT_RESOLVED = 'conflict_resolved',
  SNAPSHOT_CREATED = 'snapshot_created',
  SNAPSHOT_RESTORED = 'snapshot_restored',
  COMMENT_ADDED = 'comment_added',
  PERMISSIONS_CHANGED = 'permissions_changed',
  SESSION_ENDED = 'session_ended'
}

}
export interface EnhancedCollaborationConfig {
  maxSessionsPerDocument: number;
  sessionTimeoutMs: number;
  lockTimeoutMs: number;
  autoLockEnabled: boolean;
  snapshotEnabled: boolean;
  maxSnapshotsPerSession: number;
  analyticsEnabled: boolean;
  enableAdvancedConflictResolution: boolean;
  enableSmartMerging: boolean;
  enableOperationalTransform: boolean;
}
}

export class EnhancedCollaborationService extends EventEmitter {
  private sessions: Map<string, CollaborationSession> = new Map();
  private documentSessions: Map<string, string[]> = new Map(); // documentId -> sessionIds[]
  private userSessions: Map<string, string[]> = new Map(); // userId -> sessionIds[]
  private locks: Map<string, DocumentLock> = new Map();
  private eventHistory: CollaborationEvent[] = [];
  
  private wsServer: WebSocketServer;
  private syncManager: SynchronizationManager;
  private conflictResolver: ConflictResolver;
  private presenceManager: PresenceManager;
  private connectionManager: ConnectionManager;
  private config: EnhancedCollaborationConfig;
  
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(
    wsServer: WebSocketServer,
    config: EnhancedCollaborationConfig
  ) {
    super();
    this.wsServer = wsServer;
    this.config = config;
    
    // Get managers from WebSocket server
    this.syncManager = (wsServer as any).syncManager;
    this.conflictResolver = (wsServer as any).conflictResolver;
    this.presenceManager = (wsServer as any).presenceManager;
    this.connectionManager = (wsServer as any).connectionManager;
    
    this.setupEventHandlers();
    this.startCleanupProcess();
  }

  /**
   * Create a new collaboration session
   */
  createSession(
    documentId: string,
    owner: string,
    title: string,
    settings: Partial<SessionSettings> = {},
    permissions: Partial<SessionPermissions> = {}
  ): CollaborationSession {
    const sessionId = uuidv4();
    
    const defaultSettings: SessionSettings = {
      enableRealTimeSync: true,
      enableConflictResolution: true,
      enableVersionControl: true,
      enableComments: true,
      enableLocking: true,
      enablePresenceIndicators: true,
      autoSaveInterval: 5000,
      conflictResolutionStrategy: ResolutionStrategy.LAST_WRITER_WINS,
      maxParticipants: 20,
      allowAnonymousUsers: false,
      requireAuthentication: true,
      ...settings
    };

    const defaultPermissions: SessionPermissions = {
      canEdit: true,
      canComment: true,
      canInvite: true,
      canExport: true,
      canModifyPermissions: false,
      canDeleteSession: false,
      canLockElements: true,
      canResolveConflicts: true,
      ...permissions
    };

    const session: CollaborationSession = {
      sessionId,
      documentId,
      title,
      owner,
      participants: [{
        userId: owner,
        userName: 'Owner', // This would be populated from user data
        role: 'owner',
        joinedAt: Date.now(),
        lastSeen: Date.now(),
        permissions: { ...defaultPermissions, canDeleteSession: true, canModifyPermissions: true },
        isOnline: true,
        contribution: this.createEmptyContributionMetrics()
      }],
      createdAt: Date.now(),
      lastActivity: Date.now(),
      status: 'active',
      settings: defaultSettings,
      permissions: defaultPermissions,
      locks: [],
      snapshots: [],
      analytics: this.createEmptySessionAnalytics()
    };

    // Store session
    this.sessions.set(sessionId, session);
    this.addDocumentSession(documentId, sessionId);
    this.addUserSession(owner, sessionId);

    // Initialize document for collaboration
    this.wsServer.initializeDocument(documentId);

    // Emit session created event
    this.emitCollaborationEvent({
      eventId: uuidv4(),
      sessionId,
      type: CollaborationEventType.SESSION_CREATED,
      userId: owner,
      timestamp: Date.now(),
      data: { title, documentId }
    });

    this.emit('session_created', session);
    return session;
  }

  /**
   * Join a collaboration session
   */
  joinSession(
    sessionId: string,
    userId: string,
    userName: string,
    userAvatar?: string,
    role: CollaborationParticipant['role'] = 'editor'
  ): CollaborationParticipant | null {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== 'active') {
      return null;
    }

    // Check if user is already in session
    let participant = session.participants.find(p => p.userId === userId);
    
    if (participant) {
      // Update existing participant
      participant.isOnline = true;
      participant.lastSeen = Date.now();
    } else {
      // Add new participant
      if (session.participants.length >= session.settings.maxParticipants) {
        return null; // Session is full
      }

      participant = {
        userId,
        userName,
        userAvatar,
        role,
        joinedAt: Date.now(),
        lastSeen: Date.now(),
        permissions: this.getDefaultPermissionsForRole(role, session.permissions),
        isOnline: true,
        contribution: this.createEmptyContributionMetrics()
      };

      session.participants.push(participant);
      this.addUserSession(userId, sessionId);
    }

    session.lastActivity = Date.now();
    session.analytics.peakConcurrentUsers = Math.max(
      session.analytics.peakConcurrentUsers,
      session.participants.filter(p => p.isOnline).length
    );

    // Emit user joined event
    this.emitCollaborationEvent({
      eventId: uuidv4(),
      sessionId,
      type: CollaborationEventType.USER_JOINED,
      userId,
      timestamp: Date.now(),
      data: { userName, role }
    });

    // Broadcast to other session participants
    this.broadcastToSession(sessionId, {
      type: 'collaboration_user_joined',
      payload: {
        participant: participant,
        sessionId,
        documentId: session.documentId
      }
    }, userId);

    this.emit('user_joined', sessionId, participant);
    return participant;
  }

  /**
   * Leave a collaboration session
   */
  leaveSession(sessionId: string, userId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return false;
    }

    const participant = session.participants.find(p => p.userId === userId);
    if (!participant) {
      return false;
    }

    // Mark as offline instead of removing (keep contribution history)
    participant.isOnline = false;
    participant.lastSeen = Date.now();
    
    // Update analytics
    const sessionDuration = Date.now() - participant.joinedAt;
    participant.contribution.timeActive += sessionDuration;
    
    session.lastActivity = Date.now();

    // Release any locks held by this user
    this.releaseUserLocks(sessionId, userId);

    // Emit user left event
    this.emitCollaborationEvent({
      eventId: uuidv4(),
      sessionId,
      type: CollaborationEventType.USER_LEFT,
      userId,
      timestamp: Date.now(),
      data: { sessionDuration }
    });

    // Broadcast to other session participants
    this.broadcastToSession(sessionId, {
      type: 'collaboration_user_left',
      payload: {
        userId,
        userName: participant.userName,
        sessionId,
        documentId: session.documentId
      }
    }, userId);

    this.emit('user_left', sessionId, participant);
    return true;
  }

  /**
   * Lock a document element
   */
  lockElement(
    sessionId: string,
    userId: string,
    targetId: string,
    type: DocumentLock['type'],
    reason?: string,
    expiresAt?: number
  ): DocumentLock | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const participant = session.participants.find(p => p.userId === userId);
    if (!participant?.permissions.canLockElements) {
      return null;
    }

    // Check if element is already locked by someone else
    const existingLock = Array.from(this.locks.values()).find(
      lock => lock.targetId === targetId && lock.userId !== userId
    );
    
    if (existingLock) {
      return null; // Already locked
    }

    const lock: DocumentLock = {
      lockId: uuidv4(),
      type,
      targetId,
      userId,
      userName: participant.userName,
      lockedAt: Date.now(),
      expiresAt: expiresAt || Date.now() + this.config.lockTimeoutMs,
      reason,
      isAutoLock: false
    };

    this.locks.set(lock.lockId, lock);
    session.locks.push(lock);

    // Emit lock event
    this.emitCollaborationEvent({
      eventId: uuidv4(),
      sessionId,
      type: CollaborationEventType.ELEMENT_LOCKED,
      userId,
      timestamp: Date.now(),
      data: { lock }
    });

    // Broadcast lock to session participants
    this.broadcastToSession(sessionId, {
      type: 'element_locked',
      payload: { lock, sessionId }
    });

    this.emit('element_locked', sessionId, lock);
    return lock;
  }

  /**
   * Unlock a document element
   */
  unlockElement(sessionId: string, userId: string, lockId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const lock = this.locks.get(lockId);
    if (!lock || (lock.userId !== userId && session.owner !== userId)) {
      return false;
    }

    // Remove lock
    this.locks.delete(lockId);
    session.locks = session.locks.filter(l => l.lockId !== lockId);

    // Emit unlock event
    this.emitCollaborationEvent({
      eventId: uuidv4(),
      sessionId,
      type: CollaborationEventType.ELEMENT_UNLOCKED,
      userId,
      timestamp: Date.now(),
      data: { lock }
    });

    // Broadcast unlock to session participants
    this.broadcastToSession(sessionId, {
      type: 'element_unlocked',
      payload: { lockId, targetId: lock.targetId, sessionId }
    });

    this.emit('element_unlocked', sessionId, lock);
    return true;
  }

  /**
   * Create a session snapshot
   */
  createSnapshot(
    sessionId: string,
    userId: string,
    name: string,
    description?: string,
    tags: string[] = []
  ): SessionSnapshot | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const participant = session.participants.find(p => p.userId === userId);
    if (!participant?.permissions.canEdit) {
      return null;
    }

    // Check snapshot limit
    if (session.snapshots.length >= this.config.maxSnapshotsPerSession) {
      // Remove oldest snapshot
      session.snapshots.shift();
    }

    // Get current document state
    const documentState = this.syncManager.getDocumentState(session.documentId);
    if (!documentState) return null;

    const snapshot: SessionSnapshot = {
      snapshotId: uuidv4(),
      name,
      description,
      createdBy: userId,
      createdAt: Date.now(),
      documentVersion: documentState.version,
      documentState: this.serializeDocumentState(documentState),
      participantCount: session.participants.filter(p => p.isOnline).length,
      tags
    };

    session.snapshots.push(snapshot);

    // Emit snapshot created event
    this.emitCollaborationEvent({
      eventId: uuidv4(),
      sessionId,
      type: CollaborationEventType.SNAPSHOT_CREATED,
      userId,
      timestamp: Date.now(),
      data: { snapshot: { ...snapshot, documentState: undefined } } // Don't include full state in event
    });

    // Broadcast snapshot creation
    this.broadcastToSession(sessionId, {
      type: 'snapshot_created',
      payload: {
        snapshot: { ...snapshot, documentState: undefined },
        sessionId
      }
    });

    this.emit('snapshot_created', sessionId, snapshot);
    return snapshot;
  }

  /**
   * Restore from a session snapshot
   */
  restoreSnapshot(
    sessionId: string,
    userId: string,
    snapshotId: string
  ): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const participant = session.participants.find(p => p.userId === userId);
    if (!participant?.permissions.canEdit) {
      return false;
    }

    const snapshot = session.snapshots.find(s => s.snapshotId === snapshotId);
    if (!snapshot) return false;

    // Create state update from snapshot
    try {
      const currentState = this.syncManager.getDocumentState(session.documentId);
      if (!currentState) return false;

      // Generate operations to restore to snapshot state
      const restoreOperations: StateOperation[] = [];
      
      // This is a simplified restoration - in practice, you'd want more sophisticated diffing
      const stateUpdate: StateUpdate = {
        id: uuidv4(),
        documentId: session.documentId,
        version: currentState.version + 1,
        timestamp: Date.now(),
        userId,
        operations: restoreOperations,
        checksum: ''
      };

      this.syncManager.applyStateUpdate(stateUpdate);

      // Emit snapshot restored event
      this.emitCollaborationEvent({
        eventId: uuidv4(),
        sessionId,
        type: CollaborationEventType.SNAPSHOT_RESTORED,
        userId,
        timestamp: Date.now(),
        data: { snapshot: { ...snapshot, documentState: undefined } }
      });

      // Broadcast restoration
      this.broadcastToSession(sessionId, {
        type: 'snapshot_restored',
        payload: { snapshotId, restoredBy: userId, sessionId }
      });

      this.emit('snapshot_restored', sessionId, snapshot);
      return true;
      
    } catch (error) {
      console.error('Failed to restore snapshot:', error);
      return false;
    }
  }

  /**
   * Get collaboration session by ID
   */
  getSession(sessionId: string): CollaborationSession | null {
    return this.sessions.get(sessionId) || null;
  }

  /**
   * Get all sessions for a document
   */
  getDocumentSessions(documentId: string): CollaborationSession[] {
    const sessionIds = this.documentSessions.get(documentId) || [];
    return sessionIds
      .map(id => this.sessions.get(id))
      .filter(Boolean) as CollaborationSession[];
  }

  /**
   * Get all active sessions for a user
   */
  getUserSessions(userId: string): CollaborationSession[] {
    const sessionIds = this.userSessions.get(userId) || [];
    return sessionIds
      .map(id => this.sessions.get(id))
      .filter(session => session?.status === 'active') as CollaborationSession[];
  }

  /**
   * Get session analytics
   */
  getSessionAnalytics(sessionId: string): SessionAnalytics | null {
    const session = this.sessions.get(sessionId);
    return session?.analytics || null;
  }

  /**
   * Update session settings
   */
  updateSessionSettings(
    sessionId: string,
    userId: string,
    settings: Partial<SessionSettings>
  ): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const participant = session.participants.find(p => p.userId === userId);
    if (!participant?.permissions.canModifyPermissions && session.owner !== userId) {
      return false;
    }

    Object.assign(session.settings, settings);
    session.lastActivity = Date.now();

    // Broadcast settings update
    this.broadcastToSession(sessionId, {
      type: 'session_settings_updated',
      payload: { settings: session.settings, updatedBy: userId, sessionId }
    });

    this.emit('session_settings_updated', sessionId, settings);
    return true;
  }

  /**
   * End a collaboration session
   */
  endSession(sessionId: string, userId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session || session.owner !== userId) {
      return false;
    }

    // Mark session as ended
    session.status = 'ended';
    session.lastActivity = Date.now();

    // Calculate final analytics
    this.updateFinalAnalytics(session);

    // Release all locks
    this.releaseSessionLocks(sessionId);

    // Emit session ended event
    this.emitCollaborationEvent({
      eventId: uuidv4(),
      sessionId,
      type: CollaborationEventType.SESSION_ENDED,
      userId,
      timestamp: Date.now(),
      data: { analytics: session.analytics }
    });

    // Broadcast session end to participants
    this.broadcastToSession(sessionId, {
      type: 'session_ended',
      payload: { sessionId, endedBy: userId, analytics: session.analytics }
    });

    this.emit('session_ended', sessionId, session);
    return true;
  }

  /**
   * Set up event handlers for WebSocket server
   */
  private setupEventHandlers(): void {
    // Listen to WebSocket server events
    this.wsServer.on('graph_update', (documentId: string, updatePayload: unknown, connectionInfo: unknown) => {
      this.handleGraphUpdate(documentId, updatePayload, connectionInfo);
    });

    // Listen to conflict resolver events
    this.conflictResolver.on('conflict_detected', (conflict: unknown) => {
      this.handleConflictDetected(conflict);
    });

    this.conflictResolver.on('conflict_resolved', (resolution: unknown) => {
      this.handleConflictResolved(resolution);
    });
  }

  /**
   * Handle graph update from WebSocket
   */
  private handleGraphUpdate(documentId: string, updatePayload: unknown, connectionInfo: unknown): void {
    const sessions = this.getDocumentSessions(documentId);
    
    for (const session of sessions) {
      if (session.status !== 'active') continue;

      const participant = session.participants.find(p => p.userId === connectionInfo.userId);
      if (!participant) continue;

      // Update participant contribution
      participant.contribution.editsCount++;
      participant.lastSeen = Date.now();

      // Update session analytics
      session.analytics.totalEdits++;
      session.lastActivity = Date.now();

      // Emit collaboration event
      this.emitCollaborationEvent({
        eventId: uuidv4(),
        sessionId: session.sessionId,
        type: CollaborationEventType.DOCUMENT_EDITED,
        userId: connectionInfo.userId,
        timestamp: Date.now(),
        data: { updateType: updatePayload.type, targetId: updatePayload.nodeId || updatePayload.edgeId }
      });
    }
  }

  /**
   * Handle conflict detection
   */
  private handleConflictDetected(conflict: unknown): void {
    const sessions = this.getDocumentSessions(conflict.documentId);
    
    for (const session of sessions) {
      if (session.status !== 'active') continue;

      session.analytics.totalConflicts++;
      session.lastActivity = Date.now();

      // Emit collaboration event
      this.emitCollaborationEvent({
        eventId: uuidv4(),
        sessionId: session.sessionId,
        type: CollaborationEventType.CONFLICT_DETECTED,
        userId: 'system',
        timestamp: Date.now(),
        data: { conflictId: conflict.id, type: conflict.type, description: conflict.description }
      });

      // Broadcast conflict to session participants
      this.broadcastToSession(session.sessionId, {
        type: 'collaboration_conflict_detected',
        payload: {
          conflict: {
            id: conflict.id,
            type: conflict.type,
            description: conflict.description,
            requiresResolution: true
  }
          sessionId: session.sessionId
        }
      });
    }
  }

  /**
   * Handle conflict resolution
   */
  private handleConflictResolved(resolution: unknown): void {
    const sessions = this.getDocumentSessions(resolution.conflict.documentId);
    
    for (const session of sessions) {
      if (session.status !== 'active') continue;

      const participant = session.participants.find(p => p.userId === resolution.conflict.resolvedBy);
      if (participant) {
        participant.contribution.conflictsResolved++;
      }

      // Update analytics
      const resolutionTime = Date.now() - resolution.conflict.detectedAt;
      session.analytics.averageResolutionTime = 
        (session.analytics.averageResolutionTime + resolutionTime) / 2;

      session.lastActivity = Date.now();

      // Emit collaboration event
      this.emitCollaborationEvent({
        eventId: uuidv4(),
        sessionId: session.sessionId,
        type: CollaborationEventType.CONFLICT_RESOLVED,
        userId: resolution.conflict.resolvedBy || 'system',
        timestamp: Date.now(),
        data: { 
          conflictId: resolution.conflict.id, 
          strategy: resolution.conflict.resolutionStrategy,
          resolutionTime 
        }
      });

      // Broadcast resolution to session participants
      this.broadcastToSession(session.sessionId, {
        type: 'collaboration_conflict_resolved',
        payload: {
          conflictId: resolution.conflict.id,
          resolvedBy: resolution.conflict.resolvedBy,
          strategy: resolution.conflict.resolutionStrategy,
          sessionId: session.sessionId
        }
      });
    }
  }

  /**
   * Broadcast message to all participants in a session
   */
  private broadcastToSession(sessionId: string, message: unknown, excludeUserId?: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const activeParticipants = session.participants.filter(p => p.isOnline && p.connectionId);
    
    for (const participant of activeParticipants) {
      if (participant.userId === excludeUserId) continue;
      
      if (participant.connectionId) {
        this.wsServer.broadcastToDocument(session.documentId, {
          ...message,
          timestamp: Date.now(),
          messageId: uuidv4(),
          documentId: session.documentId
        }, participant.connectionId);
      }
    }
  }

  /**
   * Emit collaboration event
   */
  private emitCollaborationEvent(event: CollaborationEvent): void {
    this.eventHistory.push(event);
    
    // Keep event history limited
    if (this.eventHistory.length > 10000) {
      this.eventHistory = this.eventHistory.slice(-5000);
    }
    
    this.emit('collaboration_event', event);
  }

  /**
   * Helper methods
   */
  private createEmptyContributionMetrics(): ContributionMetrics {
    return {
      editsCount: 0,
      commentsCount: 0,
      conflictsCreated: 0,
      conflictsResolved: 0,
      timeActive: 0,
      elementsCreated: 0,
      elementsModified: 0,
      elementsDeleted: 0
    };
  }

  private createEmptySessionAnalytics(): SessionAnalytics {
    return {
      totalEdits: 0,
      totalConflicts: 0,
      averageResolutionTime: 0,
      participantActivity: new Map(),
      peakConcurrentUsers: 1,
      sessionDuration: 0,
      documentSize: { nodeCount: 0, edgeCount: 0, complexity: 0 },
      performanceMetrics: {
        averageLatency: 0,
        syncThroughput: 0,
        errorRate: 0,
        reconnections: 0,
        messagingVolume: 0
      }
    };
  }

  private getDefaultPermissionsForRole(
    role: CollaborationParticipant['role'],
    sessionPermissions: SessionPermissions
  ): ParticipantPermissions {
    const basePermissions = { ...sessionPermissions } as ParticipantPermissions;
    
    switch (role) {
    case 'owner':
      return {
        ...basePermissions,
        canModifyPermissions: true,
        canDeleteSession: true,
        canViewPresence: true,
        canAccessHistory: true,
        canCreateSnapshots: true,
        canRestoreSnapshots: true
      };
      
    case 'editor':
      return {
        ...basePermissions,
        canViewPresence: true,
        canAccessHistory: true,
        canCreateSnapshots: true,
        canRestoreSnapshots: false
      };
      
    case 'viewer':
      return {
        ...basePermissions,
        canEdit: false,
        canLockElements: false,
        canResolveConflicts: false,
        canViewPresence: true,
        canAccessHistory: false,
        canCreateSnapshots: false,
        canRestoreSnapshots: false
      };
      
    case 'reviewer':
      return {
        ...basePermissions,
        canEdit: false,
        canComment: true,
        canLockElements: false,
        canResolveConflicts: false,
        canViewPresence: true,
        canAccessHistory: true,
        canCreateSnapshots: false,
        canRestoreSnapshots: false
      };
      
    default:
      return basePermissions;
    }
  }

  private addDocumentSession(documentId: string, sessionId: string): void {
    const sessions = this.documentSessions.get(documentId) || [];
    sessions.push(sessionId);
    this.documentSessions.set(documentId, sessions);
  }

  private addUserSession(userId: string, sessionId: string): void {
    const sessions = this.userSessions.get(userId) || [];
    sessions.push(sessionId);
    this.userSessions.set(userId, sessions);
  }

  private releaseUserLocks(sessionId: string, userId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const userLocks = session.locks.filter(lock => lock.userId === userId);
    
    for (const lock of userLocks) {
      this.unlockElement(sessionId, userId, lock.lockId);
    }
  }

  private releaseSessionLocks(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    for (const lock of session.locks) {
      this.locks.delete(lock.lockId);
    }
    
    session.locks = [];
  }

  private updateFinalAnalytics(session: CollaborationSession): void {
    const now = Date.now();
    session.analytics.sessionDuration = now - session.createdAt;
    
    // Update participant activity
    for (const participant of session.participants) {
      if (participant.isOnline) {
        participant.contribution.timeActive += now - participant.lastSeen;
      }
      session.analytics.participantActivity.set(participant.userId, participant.contribution);
    }
  }

  private serializeDocumentState(documentState: unknown): unknown {
    return {
      version: documentState.version,
      nodes: Object.fromEntries(documentState.nodes),
      edges: Object.fromEntries(documentState.edges),
      metadata: documentState.metadata
    };
  }

  private startCleanupProcess(): void {
    this.cleanupInterval = setInterval(() => {
      this.performCleanup();
    }, 60000); // Clean up every minute
  }

  private performCleanup(): void {
    const now = Date.now();
    
    // Clean up expired sessions
    for (const [sessionId, session] of this.sessions) {
      if (session.status === 'ended' && now - session.lastActivity > this.config.sessionTimeoutMs) {
        this.sessions.delete(sessionId);
      }
    }

    // Clean up expired locks
    for (const [lockId, lock] of this.locks) {
      if (lock.expiresAt && now > lock.expiresAt) {
        this.locks.delete(lockId);
      }
    }
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    this.sessions.clear();
    this.documentSessions.clear();
    this.userSessions.clear();
    this.locks.clear();
    this.eventHistory = [];
  }
}