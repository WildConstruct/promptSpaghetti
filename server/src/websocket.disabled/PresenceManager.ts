import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

// Enhanced presence data models
}
}
export interface UserPresenceData {
  userId: string;
  userName?: string;
  userAvatar?: string;
  connectionId: string;
  documentId: string;
  // Cursor and selection state
  cursor?: {
    x: number;
    y: number;
    nodeId?: string;
    viewportBounds?: {
      top: number;
      left: number;
      width: number;
      height: number;
      zoom: number;
}
}
    };
  };
  selection?: {
    nodeIds: string[];
    edgeIds: string[];
    selectionBox?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  };
  // Activity state
  status: 'active' | 'idle' | 'away' | 'offline';
  lastSeen: number;
  lastActivity: number;
  currentTool?: string;
  // Awareness indicators
  isTyping?: boolean;
  focusedNodeId?: string;
  // Privacy settings
  shareLocation: boolean;
  shareSelection: boolean;
  shareActivity: boolean;
  // Session metadata
  sessionId: string;
  joinedAt: number;
  userAgent?: string;
  platform?: string;
}

}
}
export interface DocumentPresence {
  documentId: string;
  users: Map<string, UserPresenceData>;
  activeUsers: number;
  maxConcurrentUsers: number;
  lastActivity: number;
  createdAt: number;
}
}
}

}
}
export interface PresenceStats {
  totalUsers: number;
  activeUsers: number;
  idleUsers: number;
  awayUsers: number;
  documentsWithUsers: number;
  averageSessionDuration: number;
  peakConcurrentUsers: number;
  lastUpdated: number;
}
}
}

}
}
export interface PresenceConfig {
  idleTimeout: number; // Time before marking user as idle (ms)
  awayTimeout: number; // Time before marking user as away (ms)
  offlineTimeout: number; // Time before removing user presence (ms)
  cleanupInterval: number; // How often to clean up stale presence data (ms)
  maxUsersPerDocument: number;
  enableLocationSharing: boolean;
  enableActivityTracking: boolean;
  retainPresenceHistory: boolean;
  historyRetentionPeriod: number; // How long to keep presence history (ms)
}
}
}

export class PresenceManager extends EventEmitter {
  private documentPresence: Map<string, DocumentPresence> = new Map();
  private userSessions: Map<string, UserPresenceData> = new Map(); // connectionId -> presence
  private config: PresenceConfig;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private stats: PresenceStats;

  constructor(config: PresenceConfig) {
    super();
    this.config = config;
    this.stats = {
      totalUsers: 0,
      activeUsers: 0,
      idleUsers: 0,
      awayUsers: 0,
      documentsWithUsers: 0,
      averageSessionDuration: 0,
      peakConcurrentUsers: 0,
      lastUpdated: Date.now()
    };

    this.startCleanup();
  }

  /**
   * Add user presence when they join a document
   */
  addUserPresence(
    connectionId: string,
    userId: string,
    documentId: string,
    metadata: Partial<UserPresenceData> = {}
  ): UserPresenceData {
    const now = Date.now();
    
    const presence: UserPresenceData = {
      userId,
      connectionId,
      documentId,
      status: 'active',
      lastSeen: now,
      lastActivity: now,
      sessionId: uuidv4(),
      joinedAt: now,
      shareLocation: this.config.enableLocationSharing,
      shareSelection: true,
      shareActivity: this.config.enableActivityTracking,
      ...metadata
    };

    // Add to user sessions
    this.userSessions.set(connectionId, presence);

    // Add to document presence
    let docPresence = this.documentPresence.get(documentId);
    if (!docPresence) {
      docPresence = {
        documentId,
        users: new Map(),
        activeUsers: 0,
        maxConcurrentUsers: 0,
        lastActivity: now,
        createdAt: now
      };
      this.documentPresence.set(documentId, docPresence);
    }

    docPresence.users.set(userId, presence);
    docPresence.activeUsers = docPresence.users.size;
    docPresence.maxConcurrentUsers = Math.max(docPresence.maxConcurrentUsers, docPresence.activeUsers);
    docPresence.lastActivity = now;

    this.updateStats();
    this.emit('user_joined', documentId, presence);

    return presence;
  }

  /**
   * Remove user presence when they leave
   */
  removeUserPresence(connectionId: string): UserPresenceData | null {
    const presence = this.userSessions.get(connectionId);
    if (!presence) {
      return null;
    }

    this.userSessions.delete(connectionId);

    const docPresence = this.documentPresence.get(presence.documentId);
    if (docPresence) {
      docPresence.users.delete(presence.userId);
      docPresence.activeUsers = docPresence.users.size;
      
      // Clean up empty document presence
      if (docPresence.users.size === 0) {
        this.documentPresence.delete(presence.documentId);
      } else {
        docPresence.lastActivity = Date.now();
      }
    }

    this.updateStats();
    this.emit('user_left', presence.documentId, presence);

    return presence;
  }

  /**
   * Update user presence data
   */
  updateUserPresence(
    connectionId: string,
    updates: Partial<UserPresenceData>
  ): UserPresenceData | null {
    const presence = this.userSessions.get(connectionId);
    if (!presence) {
      return null;
    }

    const now = Date.now();
    
    // Update presence data
    Object.assign(presence, updates, {
      lastSeen: now,
      lastActivity: updates.cursor || updates.selection || updates.isTyping ? now : presence.lastActivity
    });

    // Update document presence
    const docPresence = this.documentPresence.get(presence.documentId);
    if (docPresence) {
      docPresence.users.set(presence.userId, presence);
      docPresence.lastActivity = now;
    }

    // Check for status changes
    const newStatus = this.calculateUserStatus(presence);
    if (newStatus !== presence.status) {
      presence.status = newStatus;
      this.emit('user_status_changed', presence.documentId, presence, presence.status);
    }

    this.updateStats();
    this.emit('user_updated', presence.documentId, presence);

    return presence;
  }

  /**
   * Update user cursor position
   */
  updateUserCursor(
    connectionId: string,
    cursor: UserPresenceData['cursor']
  ): UserPresenceData | null {
    return this.updateUserPresence(connectionId, { cursor });
  }

  /**
   * Update user selection
   */
  updateUserSelection(
    connectionId: string,
    selection: UserPresenceData['selection']
  ): UserPresenceData | null {
    return this.updateUserPresence(connectionId, { selection });
  }

  /**
   * Update user activity status
   */
  updateUserActivity(
    connectionId: string,
    activity: {
      currentTool?: string;
      isTyping?: boolean;
      focusedNodeId?: string;
    }
  ): UserPresenceData | null {
    return this.updateUserPresence(connectionId, activity);
  }

  /**
   * Get presence data for a specific user
   */
  getUserPresence(connectionId: string): UserPresenceData | null {
    return this.userSessions.get(connectionId) || null;
  }

  /**
   * Get all users in a document
   */
  getDocumentUsers(documentId: string): UserPresenceData[] {
    const docPresence = this.documentPresence.get(documentId);
    return docPresence ? Array.from(docPresence.users.values()) : [];
  }

  /**
   * Get document presence info
   */
  getDocumentPresence(documentId: string): DocumentPresence | null {
    return this.documentPresence.get(documentId) || null;
  }

  /**
   * Get users near a specific location
   */
  getUsersNearLocation(
    documentId: string,
    location: { x: number; y: number },
    radius: number = 100
  ): UserPresenceData[] {
    const users = this.getDocumentUsers(documentId);
    
    return users.filter(user => {
      if (!user.cursor || !user.shareLocation) {
        return false;
      }
      
      const distance = Math.sqrt(
        Math.pow(user.cursor.x - location.x, 2) + 
        Math.pow(user.cursor.y - location.y, 2)
      );
      
      return distance <= radius;
    });
  }

  /**
   * Get users with overlapping selections
   */
  getUsersWithOverlappingSelection(
    documentId: string,
    nodeIds: string[]
  ): UserPresenceData[] {
    const users = this.getDocumentUsers(documentId);
    
    return users.filter(user => {
      if (!user.selection || !user.shareSelection) {
        return false;
      }
      
      return user.selection.nodeIds.some(nodeId => nodeIds.includes(nodeId));
    });
  }

  /**
   * Get presence statistics
   */
  getPresenceStats(): PresenceStats {
    return { ...this.stats };
  }

  /**
   * Get active users across all documents
   */
  getAllActiveUsers(): UserPresenceData[] {
    return Array.from(this.userSessions.values()).filter(user => user.status === 'active');
  }

  /**
   * Check if document has reached user limit
   */
  isDocumentAtCapacity(documentId: string): boolean {
    const docPresence = this.documentPresence.get(documentId);
    return docPresence ? docPresence.activeUsers >= this.config.maxUsersPerDocument : false;
  }

  /**
   * Clean up stale presence data
   */
  cleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    // Clear all data
    this.documentPresence.clear();
    this.userSessions.clear();
    
    // Update stats to reflect the cleared state
    this.updateStats();
  }

  /**
   * Calculate user status based on activity
   */
  private calculateUserStatus(presence: UserPresenceData): UserPresenceData['status'] {
    const now = Date.now();
    const timeSinceLastSeen = now - presence.lastSeen;
    const timeSinceLastActivity = now - presence.lastActivity;

    if (timeSinceLastSeen > this.config.offlineTimeout) {
      return 'offline';
    } else if (timeSinceLastActivity > this.config.awayTimeout) {
      return 'away';
    } else if (timeSinceLastActivity > this.config.idleTimeout) {
      return 'idle';
    } else {
      return 'active';
    }
  }

  /**
   * Start periodic cleanup of stale presence data
   */
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.performCleanup();
    }, this.config.cleanupInterval);
  }

  /**
   * Perform cleanup of stale presence data
   */
  private performCleanup(): void {
    const now = Date.now();
    const toRemove: string[] = [];

    // Check for stale user sessions
    for (const [connectionId, presence] of this.userSessions) {
      const timeSinceLastSeen = now - presence.lastSeen;
      
      if (timeSinceLastSeen > this.config.offlineTimeout) {
        toRemove.push(connectionId);
      } else {
        // Update status based on activity
        const newStatus = this.calculateUserStatus(presence);
        if (newStatus !== presence.status) {
          presence.status = newStatus;
          this.emit('user_status_changed', presence.documentId, presence, newStatus);
        }
      }
    }

    // Remove stale sessions
    for (const connectionId of toRemove) {
      this.removeUserPresence(connectionId);
    }

    this.updateStats();
  }

  /**
   * Update presence statistics
   */
  private updateStats(): void {
    const allUsers = Array.from(this.userSessions.values());
    const now = Date.now();

    this.stats = {
      totalUsers: allUsers.length,
      activeUsers: allUsers.filter(u => u.status === 'active').length,
      idleUsers: allUsers.filter(u => u.status === 'idle').length,
      awayUsers: allUsers.filter(u => u.status === 'away').length,
      documentsWithUsers: this.documentPresence.size,
      averageSessionDuration: this.calculateAverageSessionDuration(allUsers, now),
      peakConcurrentUsers: Math.max(this.stats.peakConcurrentUsers, allUsers.length),
      lastUpdated: now
    };
  }

  /**
   * Calculate average session duration
   */
  private calculateAverageSessionDuration(users: UserPresenceData[], now: number): number {
    if (users.length === 0) {
      return 0;
    }

    const totalDuration = users.reduce((sum, user) => {
      return sum + (now - user.joinedAt);
    }, 0);

    return totalDuration / users.length;
  }
}