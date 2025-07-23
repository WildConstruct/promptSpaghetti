/**
 * Test Data Persistence Layer
 * Handles storage, retrieval, and lifecycle management of test data
 */

import fs from 'fs/promises';
import path from 'path';
import sqlite3 from 'sqlite3';
import { promisify } from 'util';

export interface PersistenceConfig {
  storage: 'file' | 'memory' | 'sqlite' | 'redis';
  directory: string;
  dbPath?: string;
  compression: boolean;
  encryption: boolean;
  maxFileSize: number;
  backupRetention: number;
}

export interface StoredTestData {
  id: string;
  key: string;
  data: any;
  metadata: {
    createdAt: string;
    updatedAt: string;
    accessCount: number;
    size: number;
    checksum: string;
    tags: string[];
  };
  expiry?: string;
}

export interface QueryOptions {
  tags?: string[];
  createdAfter?: Date;
  createdBefore?: Date;
  limit?: number;
  orderBy?: 'created' | 'updated' | 'accessed';
  includeExpired?: boolean;
}

export class TestDataPersistence {
  private config: PersistenceConfig;
  private sqliteDb?: sqlite3.Database;
  private memoryStore: Map<string, StoredTestData>;

  constructor(config: Partial<PersistenceConfig> = {}) {
    this.config = {
      storage: 'file',
      directory: path.join(process.cwd(), 'test-data'),
      compression: false,
      encryption: false,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      backupRetention: 7,
      ...config
    };

    this.memoryStore = new Map();
    
    if (this.config.storage === 'sqlite') {
      this.initializeSQLite();
    }
  }

  /**
   * Store test data
   */
  async store(key: string, data: any, options: { tags?: string[]; ttl?: number } = {}): Promise<string> {
    const id = this.generateId();
    const now = new Date().toISOString();
    const serializedData = this.serialize(data);
    
    const storedData: StoredTestData = {
      id,
      key,
      data: serializedData,
      metadata: {
        createdAt: now,
        updatedAt: now,
        accessCount: 0,
        size: this.calculateSize(serializedData),
        checksum: this.calculateChecksum(serializedData),
        tags: options.tags || []
      },
      expiry: options.ttl ? new Date(Date.now() + options.ttl * 1000).toISOString() : undefined
    };

    switch (this.config.storage) {
    case 'file':
      await this.storeToFile(storedData);
      break;
    case 'memory':
      this.memoryStore.set(key, storedData);
      break;
    case 'sqlite':
      await this.storeToSQLite(storedData);
      break;
    default:
      throw new Error(`Unsupported storage type: ${this.config.storage}`);
    }

    return id;
  }

  /**
   * Retrieve test data by key
   */
  async retrieve(key: string): Promise<any | null> {
    let storedData: StoredTestData | null = null;

    switch (this.config.storage) {
    case 'file':
      storedData = await this.retrieveFromFile(key);
      break;
    case 'memory':
      storedData = this.memoryStore.get(key) || null;
      break;
    case 'sqlite':
      storedData = await this.retrieveFromSQLite(key);
      break;
    default:
      throw new Error(`Unsupported storage type: ${this.config.storage}`);
    }

    if (!storedData) {
      return null;
    }

    // Check expiry
    if (storedData.expiry && new Date(storedData.expiry) < new Date()) {
      await this.delete(key);
      return null;
    }

    // Update access count
    storedData.metadata.accessCount++;
    storedData.metadata.updatedAt = new Date().toISOString();
    
    // Save updated metadata (fire and forget)
    this.updateMetadata(key, storedData.metadata).catch(() => {});

    return this.deserialize(storedData.data);
  }

  /**
   * Update existing test data
   */
  async update(key: string, data: any, options: { tags?: string[] } = {}): Promise<boolean> {
    const existing = await this.getStoredData(key);
    if (!existing) {
      return false;
    }

    const serializedData = this.serialize(data);
    const updated: StoredTestData = {
      ...existing,
      data: serializedData,
      metadata: {
        ...existing.metadata,
        updatedAt: new Date().toISOString(),
        size: this.calculateSize(serializedData),
        checksum: this.calculateChecksum(serializedData),
        tags: options.tags || existing.metadata.tags
      }
    };

    switch (this.config.storage) {
    case 'file':
      await this.storeToFile(updated);
      break;
    case 'memory':
      this.memoryStore.set(key, updated);
      break;
    case 'sqlite':
      await this.updateInSQLite(updated);
      break;
    }

    return true;
  }

  /**
   * Delete test data
   */
  async delete(key: string): Promise<boolean> {
    switch (this.config.storage) {
    case 'file':
      return await this.deleteFromFile(key);
    case 'memory':
      return this.memoryStore.delete(key);
    case 'sqlite':
      return await this.deleteFromSQLite(key);
    default:
      return false;
    }
  }

  /**
   * Query test data
   */
  async query(options: QueryOptions = {}): Promise<StoredTestData[]> {
    let results: StoredTestData[] = [];

    switch (this.config.storage) {
    case 'file':
      results = await this.queryFiles(options);
      break;
    case 'memory':
      results = this.queryMemory(options);
      break;
    case 'sqlite':
      results = await this.querySQLite(options);
      break;
    }

    // Apply filters
    results = this.applyFilters(results, options);

    // Apply sorting
    results = this.applySorting(results, options.orderBy || 'created');

    // Apply limit
    if (options.limit) {
      results = results.slice(0, options.limit);
    }

    return results;
  }

  /**
   * Cleanup expired data
   */
  async cleanup(): Promise<number> {
    const now = new Date();
    let cleanedCount = 0;

    const allData = await this.query({ includeExpired: true });
    
    for (const stored of allData) {
      if (stored.expiry && new Date(stored.expiry) < now) {
        await this.delete(stored.key);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }

  /**
   * Create backup of all test data
   */
  async backup(): Promise<string> {
    const backupId = `backup_${Date.now()}`;
    const backupPath = path.join(this.config.directory, 'backups', `${backupId}.json`);
    
    const allData = await this.query();
    const backup = {
      id: backupId,
      createdAt: new Date().toISOString(),
      count: allData.length,
      data: allData
    };

    await fs.mkdir(path.dirname(backupPath), { recursive: true });
    await fs.writeFile(backupPath, JSON.stringify(backup, null, 2));

    // Cleanup old backups
    await this.cleanupOldBackups();

    return backupPath;
  }

  /**
   * Restore from backup
   */
  async restore(backupPath: string): Promise<number> {
    const backupData = JSON.parse(await fs.readFile(backupPath, 'utf8'));
    let restoredCount = 0;

    for (const stored of backupData.data) {
      try {
        await this.store(stored.key, this.deserialize(stored.data), {
          tags: stored.metadata.tags
        });
        restoredCount++;
      } catch (error) {
        console.warn(`Failed to restore ${stored.key}:`, error);
      }
    }

    return restoredCount;
  }

  /**
   * Get storage statistics
   */
  async getStatistics(): Promise<{
    totalItems: number;
    totalSize: number;
    storageType: string;
    oldestItem: string;
    newestItem: string;
    averageSize: number;
  }> {
    const allData = await this.query();
    const totalSize = allData.reduce((sum, item) => sum + item.metadata.size, 0);
    
    const sortedByDate = allData.sort((a, b) => 
      new Date(a.metadata.createdAt).getTime() - new Date(b.metadata.createdAt).getTime()
    );

    return {
      totalItems: allData.length,
      totalSize,
      storageType: this.config.storage,
      oldestItem: sortedByDate[0]?.metadata.createdAt || '',
      newestItem: sortedByDate[sortedByDate.length - 1]?.metadata.createdAt || '',
      averageSize: allData.length > 0 ? Math.round(totalSize / allData.length) : 0
    };
  }

  /**
   * Clear all test data
   */
  async clear(): Promise<void> {
    switch (this.config.storage) {
    case 'file':
      await this.clearFiles();
      break;
    case 'memory':
      this.memoryStore.clear();
      break;
    case 'sqlite':
      await this.clearSQLite();
      break;
    }
  }

  // Private methods

  private generateId(): string {
    return `td_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private serialize(data: any): string {
    const serialized = JSON.stringify(data);
    if (this.config.compression) {
      // In a real implementation, you'd use a compression library like zlib
      return serialized;
    }
    return serialized;
  }

  private deserialize(data: string): any {
    if (this.config.compression) {
      // In a real implementation, you'd decompress first
    }
    return JSON.parse(data);
  }

  private calculateSize(data: string): number {
    return Buffer.byteLength(data, 'utf8');
  }

  private calculateChecksum(data: string): string {
    // Simple hash implementation - in production, use crypto module
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  // File storage methods

  private async storeToFile(storedData: StoredTestData): Promise<void> {
    const filePath = path.join(this.config.directory, 'files', `${storedData.key}.json`);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(storedData, null, 2));
  }

  private async retrieveFromFile(key: string): Promise<StoredTestData | null> {
    try {
      const filePath = path.join(this.config.directory, 'files', `${key}.json`);
      const content = await fs.readFile(filePath, 'utf8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  private async deleteFromFile(key: string): Promise<boolean> {
    try {
      const filePath = path.join(this.config.directory, 'files', `${key}.json`);
      await fs.unlink(filePath);
      return true;
    } catch {
      return false;
    }
  }

  private async queryFiles(options: QueryOptions): Promise<StoredTestData[]> {
    const results: StoredTestData[] = [];
    const filesDir = path.join(this.config.directory, 'files');

    try {
      const files = await fs.readdir(filesDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(filesDir, file);
          const content = await fs.readFile(filePath, 'utf8');
          const stored = JSON.parse(content);
          results.push(stored);
        }
      }
    } catch {
      // Directory doesn't exist or other error
    }

    return results;
  }

  private async clearFiles(): Promise<void> {
    const filesDir = path.join(this.config.directory, 'files');
    try {
      const files = await fs.readdir(filesDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          await fs.unlink(path.join(filesDir, file));
        }
      }
    } catch {
      // Directory doesn't exist
    }
  }

  // Memory storage methods

  private queryMemory(options: QueryOptions): StoredTestData[] {
    return Array.from(this.memoryStore.values());
  }

  // SQLite storage methods

  private async initializeSQLite(): Promise<void> {
    const dbPath = this.config.dbPath || path.join(this.config.directory, 'testdata.db');
    await fs.mkdir(path.dirname(dbPath), { recursive: true });

    this.sqliteDb = new sqlite3.Database(dbPath);
    const run = promisify(this.sqliteDb.run.bind(this.sqliteDb));

    await run(`
      CREATE TABLE IF NOT EXISTS test_data (
        id TEXT PRIMARY KEY,
        key TEXT UNIQUE NOT NULL,
        data TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        access_count INTEGER DEFAULT 0,
        size INTEGER NOT NULL,
        checksum TEXT NOT NULL,
        tags TEXT,
        expiry TEXT
      )
    `);

    await run('CREATE INDEX IF NOT EXISTS idx_key ON test_data(key)');
    await run('CREATE INDEX IF NOT EXISTS idx_created ON test_data(created_at)');
    await run('CREATE INDEX IF NOT EXISTS idx_tags ON test_data(tags)');
  }

  private async storeToSQLite(storedData: StoredTestData): Promise<void> {
    if (!this.sqliteDb) return;

    const run = promisify(this.sqliteDb.run.bind(this.sqliteDb));
    await run(`
      INSERT OR REPLACE INTO test_data 
      (id, key, data, created_at, updated_at, access_count, size, checksum, tags, expiry)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      storedData.id,
      storedData.key,
      storedData.data,
      storedData.metadata.createdAt,
      storedData.metadata.updatedAt,
      storedData.metadata.accessCount,
      storedData.metadata.size,
      storedData.metadata.checksum,
      JSON.stringify(storedData.metadata.tags),
      storedData.expiry || null
    ]);
  }

  private async retrieveFromSQLite(key: string): Promise<StoredTestData | null> {
    if (!this.sqliteDb) return null;

    const get = promisify(this.sqliteDb.get.bind(this.sqliteDb));
    const row = await get('SELECT * FROM test_data WHERE key = ?', [key]) as any;

    if (!row) return null;

    return {
      id: row.id,
      key: row.key,
      data: row.data,
      metadata: {
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        accessCount: row.access_count,
        size: row.size,
        checksum: row.checksum,
        tags: JSON.parse(row.tags || '[]')
      },
      expiry: row.expiry
    };
  }

  private async updateInSQLite(storedData: StoredTestData): Promise<void> {
    await this.storeToSQLite(storedData);
  }

  private async deleteFromSQLite(key: string): Promise<boolean> {
    if (!this.sqliteDb) return false;

    const run = promisify(this.sqliteDb.run.bind(this.sqliteDb));
    const result = await run('DELETE FROM test_data WHERE key = ?', [key]) as any;
    return result.changes > 0;
  }

  private async querySQLite(options: QueryOptions): Promise<StoredTestData[]> {
    if (!this.sqliteDb) return [];

    const all = promisify(this.sqliteDb.all.bind(this.sqliteDb));
    const rows = await all('SELECT * FROM test_data') as any[];

    return rows.map(row => ({
      id: row.id,
      key: row.key,
      data: row.data,
      metadata: {
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        accessCount: row.access_count,
        size: row.size,
        checksum: row.checksum,
        tags: JSON.parse(row.tags || '[]')
      },
      expiry: row.expiry
    }));
  }

  private async clearSQLite(): Promise<void> {
    if (!this.sqliteDb) return;

    const run = promisify(this.sqliteDb.run.bind(this.sqliteDb));
    await run('DELETE FROM test_data');
  }

  // Utility methods

  private async getStoredData(key: string): Promise<StoredTestData | null> {
    switch (this.config.storage) {
    case 'file':
      return await this.retrieveFromFile(key);
    case 'memory':
      return this.memoryStore.get(key) || null;
    case 'sqlite':
      return await this.retrieveFromSQLite(key);
    default:
      return null;
    }
  }

  private async updateMetadata(key: string, metadata: StoredTestData['metadata']): Promise<void> {
    const existing = await this.getStoredData(key);
    if (existing) {
      existing.metadata = metadata;
      switch (this.config.storage) {
      case 'file':
        await this.storeToFile(existing);
        break;
      case 'memory':
        this.memoryStore.set(key, existing);
        break;
      case 'sqlite':
        await this.updateInSQLite(existing);
        break;
      }
    }
  }

  private applyFilters(results: StoredTestData[], options: QueryOptions): StoredTestData[] {
    return results.filter(item => {
      // Filter by tags
      if (options.tags && options.tags.length > 0) {
        const hasMatchingTag = options.tags.some(tag => 
          item.metadata.tags.includes(tag)
        );
        if (!hasMatchingTag) return false;
      }

      // Filter by date range
      const createdAt = new Date(item.metadata.createdAt);
      if (options.createdAfter && createdAt < options.createdAfter) {
        return false;
      }
      if (options.createdBefore && createdAt > options.createdBefore) {
        return false;
      }

      // Filter expired items
      if (!options.includeExpired && item.expiry) {
        if (new Date(item.expiry) < new Date()) {
          return false;
        }
      }

      return true;
    });
  }

  private applySorting(results: StoredTestData[], orderBy: string): StoredTestData[] {
    return results.sort((a, b) => {
      let dateA: Date;
      let dateB: Date;

      switch (orderBy) {
      case 'updated':
        dateA = new Date(a.metadata.updatedAt);
        dateB = new Date(b.metadata.updatedAt);
        break;
      case 'accessed':
        // Sort by access count (descending) then by updated date
        if (a.metadata.accessCount !== b.metadata.accessCount) {
          return b.metadata.accessCount - a.metadata.accessCount;
        }
        dateA = new Date(a.metadata.updatedAt);
        dateB = new Date(b.metadata.updatedAt);
        break;
      case 'created':
      default:
        dateA = new Date(a.metadata.createdAt);
        dateB = new Date(b.metadata.createdAt);
        break;
      }

      return dateB.getTime() - dateA.getTime(); // Most recent first
    });
  }

  private async cleanupOldBackups(): Promise<void> {
    const backupsDir = path.join(this.config.directory, 'backups');
    try {
      const files = await fs.readdir(backupsDir);
      const backupFiles = files.filter(f => f.startsWith('backup_') && f.endsWith('.json'));
      
      if (backupFiles.length > this.config.backupRetention) {
        // Sort by creation time (extracted from filename)
        const sorted = backupFiles.sort((a, b) => {
          const timeA = parseInt(a.replace('backup_', '').replace('.json', ''));
          const timeB = parseInt(b.replace('backup_', '').replace('.json', ''));
          return timeA - timeB;
        });

        // Remove oldest files
        const toRemove = sorted.slice(0, sorted.length - this.config.backupRetention);
        for (const file of toRemove) {
          await fs.unlink(path.join(backupsDir, file));
        }
      }
    } catch {
      // Directory doesn't exist or other error
    }
  }

  /**
   * Close database connections and cleanup resources
   */
  async close(): Promise<void> {
    if (this.sqliteDb) {
      const close = promisify(this.sqliteDb.close.bind(this.sqliteDb));
      await close();
      this.sqliteDb = undefined;
    }
  }
}