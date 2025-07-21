/**
 * Collaboration Service Integration
 * Integrates the Enhanced Collaboration Service with existing WebSocket infrastructure
 */

import { WebSocketServer } from './WebSocketServer';
import { EnhancedCollaborationService, EnhancedCollaborationConfig, CollaborationSession } from './EnhancedCollaborationService';
import { WSMessage } from './types';

export class CollaborationServiceIntegration {
  private wsServer: WebSocketServer;
  private collaborationService: EnhancedCollaborationService;

  constructor(wsServer: WebSocketServer) {
    this.wsServer = wsServer;
    
    const config: EnhancedCollaborationConfig = {
      maxSessionsPerDocument: 5,
      sessionTimeoutMs: 24 * 60 * 60 * 1000, // 24 hours
      lockTimeoutMs: 10 * 60 * 1000, // 10 minutes
      autoLockEnabled: true,
      snapshotEnabled: true,
      maxSnapshotsPerSession: 10,
      analyticsEnabled: true,
      enableAdvancedConflictResolution: true,
      enableSmartMerging: true,
      enableOperationalTransform: false // Future feature
    };

    this.collaborationService = new EnhancedCollaborationService(wsServer, config);
    this.setupMessageHandlers();
    this.setupCollaborationEventHandlers();
  }

  /**
   * Get the collaboration service instance
   */
  getCollaborationService(): EnhancedCollaborationService {
    return this.collaborationService;
  }

  /**
   * Set up message handlers for collaboration-specific WebSocket messages
   */
  private setupMessageHandlers(): void {
    // Add collaboration-specific message handlers to WebSocket server
    const messageHandlers = (this.wsServer as any).messageHandlers;

    // Create collaboration session
    messageHandlers.set('collaboration_create_session', (connectionId: string, payload: any) => {
      const { documentId, title, settings, permissions } = payload;
      const connectionInfo = (this.wsServer as any).connectionManager.getConnectionInfo(connectionId);
      
      if (!connectionInfo) {
        this.sendToConnection(connectionId, {
          type: 'error',
          payload: { error: 'Authentication required' }
        });
        return;
      }

      try {
        const session = this.collaborationService.createSession(
          documentId,
          connectionInfo.userId,
          title,
          settings,
          permissions
        );

        this.sendToConnection(connectionId, {
          type: 'collaboration_session_created',
          payload: { session }
        });
      } catch (error) {
        this.sendToConnection(connectionId, {
          type: 'error',
          payload: { error: 'Failed to create collaboration session' }
        });
      }
    });

    // Join collaboration session
    messageHandlers.set('collaboration_join_session', (connectionId: string, payload: any) => {
      const { sessionId, userName, userAvatar, role } = payload;
      const connectionInfo = (this.wsServer as any).connectionManager.getConnectionInfo(connectionId);
      
      if (!connectionInfo) {
        this.sendToConnection(connectionId, {
          type: 'error',
          payload: { error: 'Authentication required' }
        });
        return;
      }

      try {
        const participant = this.collaborationService.joinSession(
          sessionId,
          connectionInfo.userId,
          userName || connectionInfo.userName || 'Anonymous',
          userAvatar,
          role || 'editor'
        );

        if (participant) {
          // Update connection info to link to collaboration session
          connectionInfo.collaborationSessionId = sessionId;
          
          this.sendToConnection(connectionId, {
            type: 'collaboration_session_joined',
            payload: { 
              sessionId, 
              participant,
              session: this.collaborationService.getSession(sessionId)
            }
          });
        } else {
          this.sendToConnection(connectionId, {
            type: 'error',
            payload: { error: 'Failed to join collaboration session' }
          });
        }
      } catch (error) {
        this.sendToConnection(connectionId, {
          type: 'error',
          payload: { error: 'Failed to join collaboration session' }
        });
      }
    });

    // Leave collaboration session
    messageHandlers.set('collaboration_leave_session', (connectionId: string, payload: any) => {
      const { sessionId } = payload;
      const connectionInfo = (this.wsServer as any).connectionManager.getConnectionInfo(connectionId);
      
      if (!connectionInfo) return;

      try {
        const success = this.collaborationService.leaveSession(sessionId, connectionInfo.userId);
        
        if (success) {
          connectionInfo.collaborationSessionId = undefined;
          
          this.sendToConnection(connectionId, {
            type: 'collaboration_session_left',
            payload: { sessionId }
          });
        }
      } catch (error) {
        this.sendToConnection(connectionId, {
          type: 'error',
          payload: { error: 'Failed to leave collaboration session' }
        });
      }
    });

    // Lock element
    messageHandlers.set('collaboration_lock_element', (connectionId: string, payload: any) => {
      const { sessionId, targetId, type, reason, expiresAt } = payload;
      const connectionInfo = (this.wsServer as any).connectionManager.getConnectionInfo(connectionId);
      
      if (!connectionInfo) return;

      try {
        const lock = this.collaborationService.lockElement(
          sessionId,
          connectionInfo.userId,
          targetId,
          type,
          reason,
          expiresAt
        );

        if (lock) {
          this.sendToConnection(connectionId, {
            type: 'collaboration_element_locked',
            payload: { lock }
          });
        } else {
          this.sendToConnection(connectionId, {
            type: 'error',
            payload: { error: 'Failed to lock element' }
          });
        }
      } catch (error) {
        this.sendToConnection(connectionId, {
          type: 'error',
          payload: { error: 'Failed to lock element' }
        });
      }
    });

    // Unlock element
    messageHandlers.set('collaboration_unlock_element', (connectionId: string, payload: any) => {
      const { sessionId, lockId } = payload;
      const connectionInfo = (this.wsServer as any).connectionManager.getConnectionInfo(connectionId);
      
      if (!connectionInfo) return;

      try {
        const success = this.collaborationService.unlockElement(sessionId, connectionInfo.userId, lockId);
        
        if (success) {
          this.sendToConnection(connectionId, {
            type: 'collaboration_element_unlocked',
            payload: { lockId }
          });
        } else {
          this.sendToConnection(connectionId, {
            type: 'error',
            payload: { error: 'Failed to unlock element' }
          });
        }
      } catch (error) {
        this.sendToConnection(connectionId, {
          type: 'error',
          payload: { error: 'Failed to unlock element' }
        });
      }
    });

    // Create snapshot
    messageHandlers.set('collaboration_create_snapshot', (connectionId: string, payload: any) => {
      const { sessionId, name, description, tags } = payload;
      const connectionInfo = (this.wsServer as any).connectionManager.getConnectionInfo(connectionId);
      
      if (!connectionInfo) return;

      try {
        const snapshot = this.collaborationService.createSnapshot(
          sessionId,
          connectionInfo.userId,
          name,
          description,
          tags
        );

        if (snapshot) {
          this.sendToConnection(connectionId, {
            type: 'collaboration_snapshot_created',
            payload: { snapshot: { ...snapshot, documentState: undefined } } // Don't send full state
          });
        } else {
          this.sendToConnection(connectionId, {
            type: 'error',
            payload: { error: 'Failed to create snapshot' }
          });
        }
      } catch (error) {
        this.sendToConnection(connectionId, {
          type: 'error',
          payload: { error: 'Failed to create snapshot' }
        });
      }
    });

    // Restore snapshot
    messageHandlers.set('collaboration_restore_snapshot', (connectionId: string, payload: any) => {
      const { sessionId, snapshotId } = payload;
      const connectionInfo = (this.wsServer as any).connectionManager.getConnectionInfo(connectionId);
      
      if (!connectionInfo) return;

      try {
        const success = this.collaborationService.restoreSnapshot(
          sessionId,
          connectionInfo.userId,
          snapshotId
        );

        if (success) {
          this.sendToConnection(connectionId, {
            type: 'collaboration_snapshot_restored',
            payload: { snapshotId }
          });
        } else {
          this.sendToConnection(connectionId, {
            type: 'error',
            payload: { error: 'Failed to restore snapshot' }
          });
        }
      } catch (error) {
        this.sendToConnection(connectionId, {
          type: 'error',
          payload: { error: 'Failed to restore snapshot' }
        });
      }
    });

    // Get session info
    messageHandlers.set('collaboration_get_session', (connectionId: string, payload: any) => {
      const { sessionId } = payload;
      
      try {
        const session = this.collaborationService.getSession(sessionId);
        
        if (session) {
          this.sendToConnection(connectionId, {
            type: 'collaboration_session_info',
            payload: { session }
          });
        } else {
          this.sendToConnection(connectionId, {
            type: 'error',
            payload: { error: 'Session not found' }
          });
        }
      } catch (error) {
        this.sendToConnection(connectionId, {
          type: 'error',
          payload: { error: 'Failed to get session info' }
        });
      }
    });

    // Get session analytics
    messageHandlers.set('collaboration_get_analytics', (connectionId: string, payload: any) => {
      const { sessionId } = payload;
      
      try {
        const analytics = this.collaborationService.getSessionAnalytics(sessionId);
        
        if (analytics) {
          this.sendToConnection(connectionId, {
            type: 'collaboration_analytics',
            payload: { sessionId, analytics }
          });
        } else {
          this.sendToConnection(connectionId, {
            type: 'error',
            payload: { error: 'Analytics not found' }
          });
        }
      } catch (error) {
        this.sendToConnection(connectionId, {
          type: 'error',
          payload: { error: 'Failed to get analytics' }
        });
      }
    });

    // Update session settings
    messageHandlers.set('collaboration_update_settings', (connectionId: string, payload: any) => {
      const { sessionId, settings } = payload;
      const connectionInfo = (this.wsServer as any).connectionManager.getConnectionInfo(connectionId);
      
      if (!connectionInfo) return;

      try {
        const success = this.collaborationService.updateSessionSettings(
          sessionId,
          connectionInfo.userId,
          settings
        );

        if (success) {
          this.sendToConnection(connectionId, {
            type: 'collaboration_settings_updated',
            payload: { sessionId, settings }
          });
        } else {
          this.sendToConnection(connectionId, {
            type: 'error',
            payload: { error: 'Failed to update settings' }
          });
        }
      } catch (error) {
        this.sendToConnection(connectionId, {
          type: 'error',
          payload: { error: 'Failed to update settings' }
        });
      }
    });

    // End session
    messageHandlers.set('collaboration_end_session', (connectionId: string, payload: any) => {
      const { sessionId } = payload;
      const connectionInfo = (this.wsServer as any).connectionManager.getConnectionInfo(connectionId);
      
      if (!connectionInfo) return;

      try {
        const success = this.collaborationService.endSession(sessionId, connectionInfo.userId);

        if (success) {
          this.sendToConnection(connectionId, {
            type: 'collaboration_session_ended',
            payload: { sessionId }
          });
        } else {
          this.sendToConnection(connectionId, {
            type: 'error',
            payload: { error: 'Failed to end session' }
          });
        }
      } catch (error) {
        this.sendToConnection(connectionId, {
          type: 'error',
          payload: { error: 'Failed to end session' }
        });
      }
    });
  }

  /**
   * Set up collaboration event handlers
   */
  private setupCollaborationEventHandlers(): void {
    this.collaborationService.on('session_created', (session: CollaborationSession) => {
      console.log(`Collaboration session created: ${session.sessionId} for document: ${session.documentId}`);
    });

    this.collaborationService.on('user_joined', (sessionId: string, participant: any) => {
      console.log(`User ${participant.userName} joined collaboration session: ${sessionId}`);
    });

    this.collaborationService.on('user_left', (sessionId: string, participant: any) => {
      console.log(`User ${participant.userName} left collaboration session: ${sessionId}`);
    });

    this.collaborationService.on('element_locked', (sessionId: string, lock: any) => {
      console.log(`Element ${lock.targetId} locked in session: ${sessionId} by ${lock.userName}`);
    });

    this.collaborationService.on('element_unlocked', (sessionId: string, lock: any) => {
      console.log(`Element ${lock.targetId} unlocked in session: ${sessionId}`);
    });

    this.collaborationService.on('snapshot_created', (sessionId: string, snapshot: any) => {
      console.log(`Snapshot '${snapshot.name}' created in session: ${sessionId}`);
    });

    this.collaborationService.on('snapshot_restored', (sessionId: string, snapshot: any) => {
      console.log(`Snapshot '${snapshot.name}' restored in session: ${sessionId}`);
    });

    this.collaborationService.on('session_ended', (sessionId: string, session: CollaborationSession) => {
      console.log(`Collaboration session ended: ${sessionId}, duration: ${session.analytics.sessionDuration}ms`);
    });

    this.collaborationService.on('collaboration_event', (event: any) => {
      // Could emit to external analytics service
      console.log(`Collaboration event: ${event.type} in session: ${event.sessionId}`);
    });
  }

  /**
   * Send message to specific connection
   */
  private sendToConnection(connectionId: string, message: Omit<WSMessage, 'timestamp' | 'messageId'>): boolean {
    return (this.wsServer as any).sendToConnection(connectionId, message);
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    this.collaborationService.cleanup();
  }

  /**
   * Get collaboration statistics for monitoring
   */
  getCollaborationStats(): {
    activeSessions: number;
    totalParticipants: number;
    totalLocks: number;
    totalSnapshots: number;
  } {
    const sessions = Array.from((this.collaborationService as any).sessions.values());
    const activeSessions = sessions.filter((s: any) => s.status === 'active');
    
    return {
      activeSessions: activeSessions.length,
      totalParticipants: activeSessions.reduce((sum: number, s: any) => sum + s.participants.filter((p: any) => p.isOnline).length, 0),
      totalLocks: (this.collaborationService as any).locks.size,
      totalSnapshots: activeSessions.reduce((sum: number, s: any) => sum + s.snapshots.length, 0)
    };
  }
}