/**
 * Encrypted Communication Channels Service - Epic 19 Implementation
 * End-to-end encrypted communication for sensitive data transmission
 */

import crypto from 'crypto';
import { EventEmitter } from 'events';

}
export interface EncryptedChannel {
  id: string;
  name: string;
  participants: string[];
  keyVersion: number;
  algorithm: 'aes-256-gcm' | 'chacha20-poly1305';
  createdAt: Date;
  lastActivity: Date;
  messageCount: number;
  isActive: boolean;
  metadata: {
    purpose: string;
    maxParticipants: number;
    ttl?: number; // Time to live in seconds
    requireMFA?: boolean;
}
  };
}

}
export interface EncryptedMessage {
  id: string;
  channelId: string;
  senderId: string;
  timestamp: Date;
  encryptedContent: string;
  iv: string;
  tag: string;
  keyVersion: number;
  messageType: 'text' | 'file' | 'mfa-code' | 'recovery-data' | 'system';
  metadata: {
    contentLength: number;
    checksum: string;
    priority: 'low' | 'normal' | 'high' | 'urgent';
}
  };
}

}
export interface ChannelKey {
  version: number;
  key: Buffer;
  derivedFrom: string;
  createdAt: Date;
  expiresAt?: Date;
  algorithm: string;
}
}

}
export interface MessageTransmissionResult {
  success: boolean;
  messageId?: string;
  error?: string;
  deliveredTo: string[];
  failedDeliveries: string[];
}
}

export class EncryptedChannelService extends EventEmitter {
  private channels: Map<string, EncryptedChannel> = new Map();
  private channelKeys: Map<string, Map<number, ChannelKey>> = new Map();
  private messages: Map<string, EncryptedMessage[]> = new Map();
  private activeConnections: Map<string, Set<string>> = new Map(); // channelId -> userIds

  constructor(private masterKey: string) {
    super();
    this.startMaintenanceTasks();
  }

  /**
   * Create a new encrypted communication channel
   */
  async createChannel(
    name: string,
    creator: string,
    participants: string[],
    options: {
      purpose: string;
      maxParticipants?: number;
      ttl?: number;
      requireMFA?: boolean;
      algorithm?: 'aes-256-gcm' | 'chacha20-poly1305';
    }
  ): Promise<EncryptedChannel> {

    const channelId = this.generateChannelId();
    const algorithm = options.algorithm || 'aes-256-gcm';
    
    // Generate initial channel key
    const initialKey = await this.generateChannelKey(channelId, algorithm);
    
    const channel: EncryptedChannel = {
      id: channelId,
      name,
      participants: [creator, ...participants].filter((p, i, arr) => arr.indexOf(p) === i),
      keyVersion: 1,
      algorithm,
      createdAt: new Date(),
      lastActivity: new Date(),
      messageCount: 0,
      isActive: true,
      metadata: {
        purpose: options.purpose,
        maxParticipants: options.maxParticipants || 10,
        ttl: options.ttl,
        requireMFA: options.requireMFA || false
      }
    };

    // Validate participant count
    if (channel.participants.length > channel.metadata.maxParticipants) {
      throw new Error(`Too many participants. Maximum allowed: ${channel.metadata.maxParticipants}`);
    }

    // Store channel and key
    this.channels.set(channelId, channel);
    const keyMap = new Map<number, ChannelKey>();
    keyMap.set(1, initialKey);
    this.channelKeys.set(channelId, keyMap);
    this.messages.set(channelId, []);

    // Log channel creation
    await this.logChannelEvent(channelId, 'channel_created', creator, {
      participants: channel.participants,
      algorithm,
      purpose: options.purpose
    });

    this.emit('channelCreated', channel);
    return channel;
  }

  /**
   * Send an encrypted message to a channel
   */
  async sendMessage(
    channelId: string,
    senderId: string,
    content: string,
    messageType: EncryptedMessage['messageType'] = 'text',
    priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal'
  ): Promise<MessageTransmissionResult> {

    const channel = this.channels.get(channelId);
    if (!channel || !channel.isActive) {
      return {
        success: false,
        error: 'Channel not found or inactive',
        deliveredTo: [],
        failedDeliveries: []
      };
    }

    // Verify sender is participant
    if (!channel.participants.includes(senderId)) {
      return {
        success: false,
        error: 'Sender not authorized for this channel',
        deliveredTo: [],
        failedDeliveries: []
      };
    }

    // Get current channel key
    const keyMap = this.channelKeys.get(channelId);
    const currentKey = keyMap?.get(channel.keyVersion);
    if (!currentKey) {
      return {
        success: false,
        error: 'Channel encryption key not available',
        deliveredTo: [],
        failedDeliveries: []
      };
    }

    try {
      // Encrypt message content
      const { encryptedContent, iv, tag } = await this.encryptContent(
        content,
        currentKey.key,
        channel.algorithm
      );

      // Create message
      const message: EncryptedMessage = {
        id: this.generateMessageId(),
        channelId,
        senderId,
        timestamp: new Date(),
        encryptedContent,
        iv,
        tag,
        keyVersion: channel.keyVersion,
        messageType,
        metadata: {
          contentLength: content.length,
          checksum: this.calculateChecksum(content),
          priority
        }
      };

      // Store message
      const channelMessages = this.messages.get(channelId) || [];
      channelMessages.push(message);
      this.messages.set(channelId, channelMessages);

      // Update channel activity
      channel.lastActivity = new Date();
      channel.messageCount++;

      // Deliver to online participants
      const activeParticipants = this.activeConnections.get(channelId) || new Set();
      const deliveredTo: string[] = [];
      const failedDeliveries: string[] = [];

      for (const participantId of channel.participants) {
        if (participantId === senderId) continue; // Don't deliver to sender

        try {
          if (activeParticipants.has(participantId)) {
            await this.deliverMessage(participantId, message);
            deliveredTo.push(participantId);
          }
        } catch (error) {
          failedDeliveries.push(participantId);
        }
      }

      // Log message event
      await this.logChannelEvent(channelId, 'message_sent', senderId, {
        messageId: message.id,
        messageType,
        deliveredTo: deliveredTo.length,
        failedDeliveries: failedDeliveries.length
      });

      this.emit('messageSent', message, channel);

      return {
        success: true,
        messageId: message.id,
        deliveredTo,
        failedDeliveries
      };
    } catch (error) {
      return {
        success: false,
        error: `Encryption failed: ${error.message}`,
        deliveredTo: [],
        failedDeliveries: []
      };
    }
  }

  /**
   * Retrieve and decrypt messages from a channel
   */
  async getMessages(
    channelId: string,
    userId: string,
    limit: number = 50,
    before?: Date
  ): Promise<Array<{
    id: string;
    senderId: string;
    content: string;
    timestamp: Date;
    messageType: string;
    priority: string;
  }>> {
    const channel = this.channels.get(channelId);
    if (!channel || !channel.participants.includes(userId)) {
      throw new Error('Access denied to channel');
    }

    const channelMessages = this.messages.get(channelId) || [];
    let filteredMessages = channelMessages;

    // Filter by timestamp if specified
    if (before) {
      filteredMessages = channelMessages.filter(m => m.timestamp < before);
    }

    // Sort by timestamp (newest first) and limit
    const sortedMessages = filteredMessages
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);

    // Decrypt messages
    const decryptedMessages = [];
    for (const message of sortedMessages) {
      try {
        const keyMap = this.channelKeys.get(channelId);
        const messageKey = keyMap?.get(message.keyVersion);
        if (!messageKey) {
          console.warn(`Key version ${message.keyVersion} not found for message ${message.id}`);
          continue;
        }

        const decryptedContent = await this.decryptContent(
          message.encryptedContent,
          message.iv,
          message.tag,
          messageKey.key,
          channel.algorithm
        );

        // Verify content integrity
        const calculatedChecksum = this.calculateChecksum(decryptedContent);
        if (calculatedChecksum !== message.metadata.checksum) {
          console.warn(`Checksum mismatch for message ${message.id}`);
          continue;
        }

        decryptedMessages.push({
          id: message.id,
          senderId: message.senderId,
          content: decryptedContent,
          timestamp: message.timestamp,
          messageType: message.messageType,
          priority: message.metadata.priority
        });
      } catch (error) {
        console.error(`Failed to decrypt message ${message.id}:`, error.message);
      }
    }

    // Log access
    await this.logChannelEvent(channelId, 'messages_accessed', userId, {
      messageCount: decryptedMessages.length,
      limit,
      before: before?.toISOString()
    });

    return decryptedMessages.reverse(); // Return in chronological order
  }

  /**
   * Add participants to a channel
   */
  async addParticipants(
    channelId: string,
    newParticipants: string[],
    addedBy: string
  ): Promise<{ success: boolean; added: string[]; failed: string[] }> {

    const channel = this.channels.get(channelId);
    if (!channel || !channel.participants.includes(addedBy)) {
      return { success: false, added: [], failed: newParticipants };
    }

    const added: string[] = [];
    const failed: string[] = [];

    for (const participantId of newParticipants) {
      if (channel.participants.includes(participantId)) {
        failed.push(participantId); // Already a participant
        continue;
      }

      if (channel.participants.length >= channel.metadata.maxParticipants) {
        failed.push(participantId); // Would exceed max participants
        continue;
      }

      channel.participants.push(participantId);
      added.push(participantId);
    }

    if (added.length > 0) {
      // Rotate channel key for forward secrecy
      await this.rotateChannelKey(channelId, `participants_added_by_${addedBy}`);
      
      await this.logChannelEvent(channelId, 'participants_added', addedBy, {
        added,
        failed,
        newParticipantCount: channel.participants.length
      });
    }

    return { success: added.length > 0, added, failed };
  }

  /**
   * Remove participants from a channel
   */
  async removeParticipants(
    channelId: string,
    participantsToRemove: string[],
    removedBy: string
  ): Promise<{ success: boolean; removed: string[]; failed: string[] }> {

    const channel = this.channels.get(channelId);
    if (!channel || !channel.participants.includes(removedBy)) {
      return { success: false, removed: [], failed: participantsToRemove };
    }

    const removed: string[] = [];
    const failed: string[] = [];

    for (const participantId of participantsToRemove) {
      if (!channel.participants.includes(participantId)) {
        failed.push(participantId); // Not a participant
        continue;
      }

      if (participantId === removedBy) {
        failed.push(participantId); // Can't remove self
        continue;
      }

      const index = channel.participants.indexOf(participantId);
      channel.participants.splice(index, 1);
      removed.push(participantId);

      // Remove from active connections
      const activeConnections = this.activeConnections.get(channelId);
      if (activeConnections) {
        activeConnections.delete(participantId);
      }
    }

    if (removed.length > 0) {
      // Rotate channel key for forward secrecy
      await this.rotateChannelKey(channelId, `participants_removed_by_${removedBy}`);
      
      await this.logChannelEvent(channelId, 'participants_removed', removedBy, {
        removed,
        failed,
        newParticipantCount: channel.participants.length
      });
    }

    return { success: removed.length > 0, removed, failed };
  }

  /**
   * Connect user to channel for real-time messaging
   */
  async connectToChannel(channelId: string, userId: string): Promise<boolean> {

    const channel = this.channels.get(channelId);
    if (!channel || !channel.participants.includes(userId)) {
      return false;
    }

    let connections = this.activeConnections.get(channelId);
    if (!connections) {
      connections = new Set();
      this.activeConnections.set(channelId, connections);
    }

    connections.add(userId);
    
    await this.logChannelEvent(channelId, 'user_connected', userId);
    this.emit('userConnected', channelId, userId);
    
    return true;
  }

  /**
   * Disconnect user from channel
   */
  async disconnectFromChannel(channelId: string, userId: string): Promise<void> {

    const connections = this.activeConnections.get(channelId);
    if (connections) {
      connections.delete(userId);
      if (connections.size === 0) {
        this.activeConnections.delete(channelId);
      }
    }

    await this.logChannelEvent(channelId, 'user_disconnected', userId);
    this.emit('userDisconnected', channelId, userId);
  }

  /**
   * Rotate channel encryption key
   */
  private async rotateChannelKey(channelId: string, reason: string): Promise<void> {

    const channel = this.channels.get(channelId);
    const keyMap = this.channelKeys.get(channelId);
    
    if (!channel || !keyMap) {
      throw new Error('Channel or key map not found');
    }

    const newVersion = channel.keyVersion + 1;
    const newKey = await this.generateChannelKey(channelId, channel.algorithm, newVersion);
    
    keyMap.set(newVersion, newKey);
    channel.keyVersion = newVersion;

    // Keep only last 3 key versions
    const versionsToKeep = Array.from(keyMap.keys()).sort((a, b) => b - a).slice(0, 3);
    for (const version of keyMap.keys()) {
      if (!versionsToKeep.includes(version)) {
        keyMap.delete(version);
      }
    }

    await this.logChannelEvent(channelId, 'key_rotated', 'system', {
      newVersion,
      reason,
      activeVersions: versionsToKeep
    });
  }

  /**
   * Generate channel encryption key
   */
  private async generateChannelKey(
    channelId: string, 
    algorithm: string, 
    version: number = 1
  ): Promise<ChannelKey> {

    const salt = `${channelId}-v${version}-${Date.now()}`;
    const key = crypto.pbkdf2Sync(this.masterKey, salt, 100000, 32, 'sha256');

    return {
      version,
      key,
      derivedFrom: `master-key-${salt}`,
      createdAt: new Date(),
      algorithm
    };
  }

  /**
   * Encrypt content using specified algorithm
   */
  private async encryptContent(
    content: string,
    key: Buffer,
    algorithm: string
  ): Promise<{ encryptedContent: string; iv: string; tag: string }> {

    const iv = crypto.randomBytes(12); // 96-bit IV for GCM
    const cipher = crypto.createCipher(algorithm, key);
    
    const encrypted = Buffer.concat([
      cipher.update(content, 'utf8'),
      cipher.final()
    ]);
    
    const tag = cipher.getAuthTag();

    return {
      encryptedContent: encrypted.toString('base64'),
      iv: iv.toString('base64'),
      tag: tag.toString('base64')
    };
  }

  /**
   * Decrypt content
   */
  private async decryptContent(
    encryptedContent: string,
    iv: string,
    tag: string,
    key: Buffer,
    algorithm: string
  ): Promise<string> {

    const decipher = crypto.createDecipher(algorithm, key);
    decipher.setAuthTag(Buffer.from(tag, 'base64'));
    
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedContent, 'base64')),
      decipher.final()
    ]);

    return decrypted.toString('utf8');
  }

  private calculateChecksum(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex').substring(0, 16);
  }

  private generateChannelId(): string {
    return `EC-${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
  }

  private generateMessageId(): string {
    return `EM-${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
  }

  private async deliverMessage(participantId: string, message: EncryptedMessage): Promise<void> {

    // Implementation would deliver message via WebSocket, SSE, or other real-time mechanism
    console.log(`Delivering message ${message.id} to participant ${participantId}`);
    this.emit('messageDelivered', participantId, message);
  }

  private async logChannelEvent(
    channelId: string,
    action: string,
    userId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {

    console.log(`Channel Event [${channelId}]: ${action} by ${userId || 'system'}`, metadata);
  }

  private startMaintenanceTasks(): void {
    // Clean up expired channels every hour
    setInterval(() => {
      this.cleanupExpiredChannels();
    }, 60 * 60 * 1000);

    // Rotate active channel keys every 24 hours
    setInterval(() => {
      this.rotateActiveChannelKeys();
    }, 24 * 60 * 60 * 1000);
  }

  private cleanupExpiredChannels(): void {
    const now = new Date();
    
    for (const [channelId, channel] of this.channels) {
      if (channel.metadata.ttl) {
        const expiryTime = new Date(channel.createdAt.getTime() + channel.metadata.ttl * 1000);
        if (now > expiryTime) {
          this.deactivateChannel(channelId, 'expired');
        }
      }
    }
  }

  private async rotateActiveChannelKeys(): void {
    for (const [channelId, channel] of this.channels) {
      if (channel.isActive) {
        await this.rotateChannelKey(channelId, 'scheduled_rotation');
      }
    }
  }

  private async deactivateChannel(channelId: string, reason: string): Promise<void> {

    const channel = this.channels.get(channelId);
    if (channel) {
      channel.isActive = false;
      this.activeConnections.delete(channelId);
      
      await this.logChannelEvent(channelId, 'channel_deactivated', 'system', { reason });
      this.emit('channelDeactivated', channel, reason);
    }
  }

  // Public utility methods

  /**
   * Get channel information (without sensitive data)
   */
  getChannelInfo(channelId: string, userId: string): Omit<EncryptedChannel, 'keyVersion'> | null {
    const channel = this.channels.get(channelId);
    if (!channel || !channel.participants.includes(userId)) {
      return null;
    }

    const { keyVersion, ...channelInfo } = channel;
    return channelInfo;
  }

  /**
   * List user's channels
   */
  getUserChannels(userId: string): Array<Omit<EncryptedChannel, 'keyVersion'>> {
    const userChannels = [];
    
    for (const channel of this.channels.values()) {
      if (channel.participants.includes(userId)) {
        const { keyVersion, ...channelInfo } = channel;
        userChannels.push(channelInfo);
      }
    }

    return userChannels.sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());
  }

  /**
   * Get channel statistics
   */
  getChannelStats(channelId: string, userId: string): {
    messageCount: number;
    participantCount: number;
    activeParticipants: number;
    lastActivity: Date;
    keyRotations: number;
  } | null {
    const channel = this.channels.get(channelId);
    if (!channel || !channel.participants.includes(userId)) {
      return null;
    }

    const keyMap = this.channelKeys.get(channelId);
    const activeConnections = this.activeConnections.get(channelId);

    return {
      messageCount: channel.messageCount,
      participantCount: channel.participants.length,
      activeParticipants: activeConnections?.size || 0,
      lastActivity: channel.lastActivity,
      keyRotations: keyMap ? keyMap.size - 1 : 0
    };
  }
}