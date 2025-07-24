import { PresenceManager, PresenceConfig } from '../PresenceManager';

describe('PresenceManager', () => {
  let presenceManager: PresenceManager;
  let config: PresenceConfig;

  beforeEach(() => {
    config = {
      idleTimeout: 1000, // 1 second for testing
      awayTimeout: 2000, // 2 seconds for testing
      offlineTimeout: 3000, // 3 seconds for testing
      cleanupInterval: 500, // 0.5 seconds for testing
      maxUsersPerDocument: 10,
      enableLocationSharing: true,
      enableActivityTracking: true,
      retainPresenceHistory: false,
      historyRetentionPeriod: 1000
    };
    
    presenceManager = new PresenceManager(config);
  });

  afterEach(() => {
    presenceManager.cleanup();
  });

  describe('user presence management', () => {
    it('should add user presence successfully', () => {
      const presence = presenceManager.addUserPresence(
        'conn-1',
        'user-1',
        'doc-1',
        { userName: 'Alice' }
      );

      expect(presence).toBeDefined();
      expect(presence.userId).toBe('user-1');
      expect(presence.userName).toBe('Alice');
      expect(presence.documentId).toBe('doc-1');
      expect(presence.status).toBe('active');
    });

    it('should remove user presence successfully', () => {
      presenceManager.addUserPresence('conn-1', 'user-1', 'doc-1');
      
      const removedPresence = presenceManager.removeUserPresence('conn-1');
      
      expect(removedPresence).toBeDefined();
      expect(removedPresence?.userId).toBe('user-1');
      
      const presence = presenceManager.getUserPresence('conn-1');
      expect(presence).toBeNull();
    });

    it('should return null when removing non-existent user', () => {
      const removedPresence = presenceManager.removeUserPresence('non-existent');
      expect(removedPresence).toBeNull();
    });

    it('should get user presence', () => {
      presenceManager.addUserPresence('conn-1', 'user-1', 'doc-1');
      
      const presence = presenceManager.getUserPresence('conn-1');
      expect(presence).toBeDefined();
      expect(presence?.userId).toBe('user-1');
    });
  });

  describe('presence updates', () => {
    beforeEach(() => {
      presenceManager.addUserPresence('conn-1', 'user-1', 'doc-1');
    });

    it('should update user cursor position', () => {
      const cursor = { x: 100, y: 200, nodeId: 'node-1' };
      
      const updatedPresence = presenceManager.updateUserCursor('conn-1', cursor);
      
      expect(updatedPresence).toBeDefined();
      expect(updatedPresence?.cursor).toEqual(cursor);
    });

    it('should update user selection', () => {
      const selection = { nodeIds: ['node-1', 'node-2'], edgeIds: [] };
      
      const updatedPresence = presenceManager.updateUserSelection('conn-1', selection);
      
      expect(updatedPresence).toBeDefined();
      expect(updatedPresence?.selection).toEqual(selection);
    });

    it('should update user activity', () => {
      const activity = {
        currentTool: 'select',
        isTyping: true,
        focusedNodeId: 'node-1'
      };
      
      const updatedPresence = presenceManager.updateUserActivity('conn-1', activity);
      
      expect(updatedPresence).toBeDefined();
      expect(updatedPresence?.currentTool).toBe('select');
      expect(updatedPresence?.isTyping).toBe(true);
      expect(updatedPresence?.focusedNodeId).toBe('node-1');
    });

    it('should return null when updating non-existent user', () => {
      const updatedPresence = presenceManager.updateUserCursor('non-existent', { x: 0, y: 0 });
      expect(updatedPresence).toBeNull();
    });
  });

  describe('document presence', () => {
    it('should get document users', () => {
      presenceManager.addUserPresence('conn-1', 'user-1', 'doc-1');
      presenceManager.addUserPresence('conn-2', 'user-2', 'doc-1');
      presenceManager.addUserPresence('conn-3', 'user-3', 'doc-2');
      
      const doc1Users = presenceManager.getDocumentUsers('doc-1');
      const doc2Users = presenceManager.getDocumentUsers('doc-2');
      const doc3Users = presenceManager.getDocumentUsers('doc-3');
      
      expect(doc1Users).toHaveLength(2);
      expect(doc2Users).toHaveLength(1);
      expect(doc3Users).toHaveLength(0);
    });

    it('should get document presence info', () => {
      presenceManager.addUserPresence('conn-1', 'user-1', 'doc-1');
      presenceManager.addUserPresence('conn-2', 'user-2', 'doc-1');
      
      const docPresence = presenceManager.getDocumentPresence('doc-1');
      
      expect(docPresence).toBeDefined();
      expect(docPresence?.documentId).toBe('doc-1');
      expect(docPresence?.activeUsers).toBe(2);
      expect(docPresence?.users.size).toBe(2);
    });

    it('should clean up empty document sessions', () => {
      presenceManager.addUserPresence('conn-1', 'user-1', 'doc-1');
      
      let docPresence = presenceManager.getDocumentPresence('doc-1');
      expect(docPresence).toBeDefined();
      
      presenceManager.removeUserPresence('conn-1');
      
      docPresence = presenceManager.getDocumentPresence('doc-1');
      expect(docPresence).toBeNull();
    });

    it('should check document capacity', () => {
      // Add users up to the limit
      for (let i = 0; i < config.maxUsersPerDocument; i++) {
        presenceManager.addUserPresence(`conn-${i}`, `user-${i}`, 'doc-1');
      }
      
      expect(presenceManager.isDocumentAtCapacity('doc-1')).toBe(true);
      expect(presenceManager.isDocumentAtCapacity('doc-2')).toBe(false);
    });
  });

  describe('location-based queries', () => {
    beforeEach(() => {
      presenceManager.addUserPresence('conn-1', 'user-1', 'doc-1');
      presenceManager.addUserPresence('conn-2', 'user-2', 'doc-1');
      presenceManager.addUserPresence('conn-3', 'user-3', 'doc-1');
      
      presenceManager.updateUserCursor('conn-1', { x: 100, y: 100 });
      presenceManager.updateUserCursor('conn-2', { x: 110, y: 110 });
      presenceManager.updateUserCursor('conn-3', { x: 200, y: 200 });
    });

    it('should find users near a location', () => {
      const nearbyUsers = presenceManager.getUsersNearLocation('doc-1', { x: 105, y: 105 }, 20);
      
      expect(nearbyUsers).toHaveLength(2);
      expect(nearbyUsers.some(u => u.userId === 'user-1')).toBe(true);
      expect(nearbyUsers.some(u => u.userId === 'user-2')).toBe(true);
      expect(nearbyUsers.some(u => u.userId === 'user-3')).toBe(false);
    });

    it('should find users with overlapping selections', () => {
      presenceManager.updateUserSelection('conn-1', { nodeIds: ['node-1', 'node-2'], edgeIds: [] });
      presenceManager.updateUserSelection('conn-2', { nodeIds: ['node-2', 'node-3'], edgeIds: [] });
      presenceManager.updateUserSelection('conn-3', { nodeIds: ['node-4'], edgeIds: [] });
      
      const overlappingUsers = presenceManager.getUsersWithOverlappingSelection('doc-1', ['node-2']);
      
      expect(overlappingUsers).toHaveLength(2);
      expect(overlappingUsers.some(u => u.userId === 'user-1')).toBe(true);
      expect(overlappingUsers.some(u => u.userId === 'user-2')).toBe(true);
      expect(overlappingUsers.some(u => u.userId === 'user-3')).toBe(false);
    });
  });

  describe('presence statistics', () => {
    it('should provide presence statistics', () => {
      presenceManager.addUserPresence('conn-1', 'user-1', 'doc-1');
      presenceManager.addUserPresence('conn-2', 'user-2', 'doc-1');
      presenceManager.addUserPresence('conn-3', 'user-3', 'doc-2');
      
      const stats = presenceManager.getPresenceStats();
      
      expect(stats.totalUsers).toBe(3);
      expect(stats.activeUsers).toBe(3);
      expect(stats.documentsWithUsers).toBe(2);
      expect(typeof stats.averageSessionDuration).toBe('number');
    });

    it('should get all active users', () => {
      presenceManager.addUserPresence('conn-1', 'user-1', 'doc-1');
      presenceManager.addUserPresence('conn-2', 'user-2', 'doc-2');
      
      const activeUsers = presenceManager.getAllActiveUsers();
      
      expect(activeUsers).toHaveLength(2);
      expect(activeUsers.every(u => u.status === 'active')).toBe(true);
    });
  });

  describe('status transitions', () => {
    beforeEach(() => {
      presenceManager.addUserPresence('conn-1', 'user-1', 'doc-1');
    });

    it('should transition user status based on activity', async () => {
      let statusChangeCount = 0;
      
      const statusChangePromise = new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Status change timeout after 5s'));
        }, 5000);
        
        presenceManager.on('user_status_changed', (documentId, presence, newStatus) => {
          statusChangeCount++;
          
          if (statusChangeCount === 1) {
            expect(newStatus).toBe('idle');
          } else if (statusChangeCount === 2) {
            expect(newStatus).toBe('away');
            clearTimeout(timeout);
            resolve();
          }
        });
      });

      // Wait for status transitions
      setTimeout(() => {
        // Should be idle now
      }, config.idleTimeout + 100);

      setTimeout(() => {
        // Should be away now
      }, config.awayTimeout + 100);
      
      await statusChangePromise;
    });

    it('should update lastSeen on activity', () => {
      const presence = presenceManager.getUserPresence('conn-1');
      const originalLastSeen = presence?.lastSeen;
      
      // Wait a bit and update cursor
      setTimeout(() => {
        presenceManager.updateUserCursor('conn-1', { x: 100, y: 100 });
        
        const updatedPresence = presenceManager.getUserPresence('conn-1');
        expect(updatedPresence?.lastSeen).toBeGreaterThan(originalLastSeen || 0);
      }, 100);
    });
  });

  describe('cleanup', () => {
    it('should remove stale users during cleanup', async () => {
      presenceManager.addUserPresence('conn-1', 'user-1', 'doc-1');
      
      // Wait for user to become stale and get cleaned up
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Cleanup timeout after 5s'));
        }, 5000);
        
        setTimeout(() => {
          const presence = presenceManager.getUserPresence('conn-1');
          expect(presence).toBeNull();
          clearTimeout(timeout);
          resolve();
        }, Math.min(config.offlineTimeout + config.cleanupInterval + 100, 3000));
      });
    });

    it('should emit user_left event during cleanup', async () => {
      presenceManager.addUserPresence('conn-1', 'user-1', 'doc-1');
      
      const userLeftPromise = new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('User left event timeout after 5s'));
        }, 5000);
        
        presenceManager.on('user_left', (documentId, presence) => {
          expect(documentId).toBe('doc-1');
          expect(presence.userId).toBe('user-1');
          clearTimeout(timeout);
          resolve();
        });
      });
      
      // Wait for cleanup to occur
      await userLeftPromise;
    });

    it('should clean up all resources', () => {
      presenceManager.addUserPresence('conn-1', 'user-1', 'doc-1');
      presenceManager.addUserPresence('conn-2', 'user-2', 'doc-2');
      
      presenceManager.cleanup();
      
      const stats = presenceManager.getPresenceStats();
      expect(stats.totalUsers).toBe(0);
      expect(stats.documentsWithUsers).toBe(0);
    });
  });

  describe('privacy settings', () => {
    beforeEach(() => {
      presenceManager.addUserPresence('conn-1', 'user-1', 'doc-1', {
        shareLocation: false,
        shareSelection: false
      });
    });

    it('should respect location sharing privacy', () => {
      presenceManager.updateUserCursor('conn-1', { x: 100, y: 100 });
      
      const nearbyUsers = presenceManager.getUsersNearLocation('doc-1', { x: 100, y: 100 }, 10);
      expect(nearbyUsers).toHaveLength(0);
    });

    it('should respect selection sharing privacy', () => {
      presenceManager.updateUserSelection('conn-1', { nodeIds: ['node-1'], edgeIds: [] });
      
      const overlappingUsers = presenceManager.getUsersWithOverlappingSelection('doc-1', ['node-1']);
      expect(overlappingUsers).toHaveLength(0);
    });
  });
});