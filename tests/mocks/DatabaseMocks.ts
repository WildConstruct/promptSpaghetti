/**
 * Database Mocks - Comprehensive Database Layer Mocking System
 * 
 * Provides specialized mock implementations for database operations including
 * SQLite, PostgreSQL, Redis, and various data access patterns.
 * 
 * Task: E18-1753114562158-DAD671
 */

import MockFactory, { MockConfig } from './MockFactory';
import seedrandom from 'seedrandom';

export interface DatabaseConnection {
  type: 'sqlite' | 'postgres' | 'mysql' | 'redis';
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  options?: Record<string, unknown>;
}

export interface QueryResult {
  rows: unknown[];
  rowCount: number;
  fields?: string[];
  executionTime: number;
  affectedRows?: number;
  insertId?: string | number;
}

export interface TransactionContext {
  id: string;
  startTime: Date;
  isolation: 'READ_UNCOMMITTED' | 'READ_COMMITTED' | 'REPEATABLE_READ' | 'SERIALIZABLE';
  savepoints: string[];
  status: 'active' | 'committed' | 'rolled_back';
}

export interface MockTable {
  name: string;
  schema: Record<string, {
    type: string;
    nullable: boolean;
    default?: unknown;
    primaryKey?: boolean;
    unique?: boolean;
    references?: { table: string; column: string };
  }>;
  data: Map<string | number, unknown>;
  indexes: Map<string, Set<string | number>>;
}

export class DatabaseMockService {
  private factory: MockFactory;
  private rng: seedrandom.PRNG;
  private tables: Map<string, MockTable> = new Map();
  private connections: Map<string, DatabaseConnection> = new Map();
  private transactions: Map<string, TransactionContext> = new Map();
  private queryLog: Array<{ _sql: string; params?: unknown[]; timestamp: Date; duration: number }> = [];

  constructor(config: MockConfig = {}) {
    this.factory = new MockFactory(config);
    this.rng = seedrandom(config.seed?.toString() || '12345');
    this.initializeDefaultTables();
  }

  /**
   * Create a mock database connection
   */
  createConnection(_connectionId: string, config: DatabaseConnection): unknown {
    this.connections.set(_connectionId, config);
    
    const connection = {
      id: _connectionId,
      type: config.type,
      connected: true,
      
      // Query methods
      query: async (_sql: string, params?: unknown[]) => this.executeQuery(_connectionId, _sql, params),
      
      // Transaction methods
      beginTransaction: async (isolation?: string) => this.beginTransaction(_connectionId, isolation),
      commit: async (transactionId: string) => this.commitTransaction(transactionId),
      rollback: async (transactionId: string) => this.rollbackTransaction(transactionId),
      savepoint: async (transactionId: string, name: string) => this.createSavepoint(transactionId, name),
      rollbackToSavepoint: async (transactionId: string, name: string) => this.rollbackToSavepoint(transactionId, name),
      
      // Utility methods
      ping: async () => ({ success: true, latency: Math.floor(this.rng() * 10) + 1 }),
      close: async () => this.closeConnection(_connectionId),
      getStats: () => this.getConnectionStats(_connectionId),
      
      // Table operations
      createTable: async (name: string, schema: unknown) => this.createTable(name, schema),
      dropTable: async (name: string) => this.dropTable(name),
      truncateTable: async (name: string) => this.truncateTable(name),
      
      // Specialized query methods
      select: async (table: string, conditions?: unknown, options?: unknown) => 
        this.selectRecords(table, conditions, options),
      insert: async (table: string, data: unknown) => this.insertRecord(table, data),
      update: async (table: string, data: unknown, conditions?: unknown) => 
        this.updateRecords(table, data, conditions),
      delete: async (table: string, conditions?: unknown) => this.deleteRecords(table, conditions),
      
      // Batch operations
      bulkInsert: async (table: string, records: unknown[]) => this.bulkInsert(table, records),
      bulkUpdate: async (table: string, updates: Array<{ data: unknown; conditions: unknown }>) => 
        this.bulkUpdate(table, updates),
      
      // Schema operations
      describeTable: async (name: string) => this.describeTable(name),
      listTables: async () => Array.from(this.tables.keys()),
      createIndex: async (table: string, columns: string[], name?: string) => 
        this.createIndex(table, columns, name),
      
      // Redis-specific operations (if type is redis)
      ...(config.type === 'redis' ? this.createRedisOperations(_connectionId) : {}),
      
      // PostgreSQL-specific operations
      ...(config.type === 'postgres' ? this.createPostgresOperations(_connectionId) : {})
    };

    console.log(`🔌 Created ${config.type} database connection: ${_connectionId}`);
    return connection;
  }

  /**
   * Execute a raw SQL query
   */
  private async executeQuery(_connectionId: string, _sql: string, _params: unknown[] = []): Promise<QueryResult> {
    const startTime = Date.now();
    
    // Simulate query execution time
    await new Promise(resolve => setTimeout(resolve, Math.floor(this.rng() * 50) + 5));
    
    const executionTime = Date.now() - startTime;
    
    // Log the query
    this.queryLog.push({
      _sql: _sql,
      params: _params,
      timestamp: new Date(),
      duration: executionTime
    });

    // Parse and execute the SQL (simplified mock implementation)
    const result = this.parseSQLAndExecute(_sql, _params);
    
    return {
      ...result,
      executionTime
    };
  }

  /**
   * Begin a database transaction
   */
  private async beginTransaction(_connectionId: string, isolation?: string): Promise<string> {
    const transactionId = this.generateId();
    const transaction: TransactionContext = {
      id: transactionId,
      startTime: new Date(),
      isolation: (isolation as string) || 'READ_COMMITTED',
      savepoints: [],
      status: 'active'
    };

    this.transactions.set(transactionId, transaction);
    console.log(`🔄 Started transaction: ${transactionId}`);
    
    return transactionId;
  }

  /**
   * Commit a transaction
   */
  private async commitTransaction(transactionId: string): Promise<void> {
    const transaction = this.transactions.get(transactionId);
    if (transaction && transaction.status === 'active') {
      transaction.status = 'committed';
      console.log(`✅ Committed transaction: ${transactionId}`);
    } else {
      throw new Error(`Transaction ${transactionId} not found or not active`);
    }
  }

  /**
   * Rollback a transaction
   */
  private async rollbackTransaction(transactionId: string): Promise<void> {
    const transaction = this.transactions.get(transactionId);
    if (transaction && transaction.status === 'active') {
      transaction.status = 'rolled_back';
      console.log(`↩️ Rolled back transaction: ${transactionId}`);
    } else {
      throw new Error(`Transaction ${transactionId} not found or not active`);
    }
  }

  /**
   * Create a savepoint within a transaction
   */
  private async createSavepoint(transactionId: string, name: string): Promise<void> {
    const transaction = this.transactions.get(transactionId);
    if (transaction && transaction.status === 'active') {
      transaction.savepoints.push(name);
      console.log(`📍 Created savepoint '${name}' in transaction: ${transactionId}`);
    } else {
      throw new Error(`Transaction ${transactionId} not found or not active`);
    }
  }

  /**
   * Rollback to a specific savepoint
   */
  private async rollbackToSavepoint(transactionId: string, name: string): Promise<void> {
    const transaction = this.transactions.get(transactionId);
    if (transaction && transaction.status === 'active') {
      const savepointIndex = transaction.savepoints.indexOf(name);
      if (savepointIndex >= 0) {
        transaction.savepoints = transaction.savepoints.slice(0, savepointIndex);
        console.log(`↪️ Rolled back to savepoint '${name}' in transaction: ${transactionId}`);
      } else {
        throw new Error(`Savepoint '${name}' not found in transaction: ${transactionId}`);
      }
    } else {
      throw new Error(`Transaction ${transactionId} not found or not active`);
    }
  }

  /**
   * Select records from a table
   */
  private async selectRecords(
    tableName: string, 
    conditions: unknown = {}, 
    options: unknown = {}
  ): Promise<QueryResult> {
    const table = this.tables.get(tableName);
    if (!table) {
      throw new Error(`Table '${tableName}' not found`);
    }

    const { limit, offset = 0, orderBy, fields } = options;
    let records = Array.from(table.data.values());

    // Apply conditions
    if (Object.keys(conditions).length > 0) {
      records = records.filter(record => {
        return Object.entries(conditions).every(([key, value]) => {
          if (Array.isArray(value)) {
            return value.includes(record[key]);
          }
          if (typeof value === 'object' && value !== null) {
            // Handle operators like { $gt: 10, $lt: 20 }
            return Object.entries(value).every(([op, val]) => {
              switch (op) {
              case '$gt': return record[key] > val;
              case '$gte': return record[key] >= val;
              case '$lt': return record[key] < val;
              case '$lte': return record[key] <= val;
              case '$ne': return record[key] !== val;
              case '$like': return String(record[key]).includes(String(val));
              default: return record[key] === val;
              }
            });
          }
          return record[key] === value;
        });
      });
    }

    // Apply ordering
    if (orderBy) {
      const [field, direction = 'ASC'] = orderBy.split(' ');
      records.sort((a, b) => {
        const aVal = a[field];
        const bVal = b[field];
        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return direction.toUpperCase() === 'DESC' ? -comparison : comparison;
      });
    }

    // Apply pagination
    // const totalCount = records.length; // Could be used for pagination metadata
    if (limit) {
      records = records.slice(offset, offset + limit);
    } else if (offset > 0) {
      records = records.slice(offset);
    }

    // Apply field selection
    if (fields && Array.isArray(fields)) {
      records = records.map(record => {
        const selectedFields: unknown = {};
        fields.forEach(field => {
          if (Object.prototype.hasOwnProperty.call(record, field)) {
            selectedFields[field] = record[field];
          }
        });
        return selectedFields;
      });
    }

    return {
      rows: records,
      rowCount: records.length,
      fields: fields || Object.keys(table.schema),
      executionTime: Math.floor(this.rng() * 50) + 5
    };
  }

  /**
   * Insert a record into a table
   */
  private async insertRecord(tableName: string, data: unknown): Promise<QueryResult> {
    const table = this.tables.get(tableName);
    if (!table) {
      throw new Error(`Table '${tableName}' not found`);
    }

    // Generate ID if not provided and table has a primary key
    const pkField = Object.entries(table.schema).find(([, spec]) => spec.primaryKey)?.[0];
    if (pkField && !data[pkField]) {
      data[pkField] = this.generateId();
    }

    // Add default values and timestamps
    const record = { ...data };
    Object.entries(table.schema).forEach(([field, spec]) => {
      if (!(field in record)) {
        if (spec.default !== undefined) {
          record[field] = spec.default;
        } else if (field.includes('created_at') || field.includes('updated_at')) {
          record[field] = new Date().toISOString();
        }
      }
    });

    // Store the record
    const id = record[pkField || 'id'] || this.generateId();
    table.data.set(id, record);

    // Update indexes
    this.updateIndexes(tableName, record, 'insert');

    return {
      rows: [record],
      rowCount: 1,
      executionTime: Math.floor(this.rng() * 20) + 5,
      insertId: id
    };
  }

  /**
   * Update records in a table
   */
  private async updateRecords(tableName: string, data: unknown, conditions: unknown = {}): Promise<QueryResult> {
    const table = this.tables.get(tableName);
    if (!table) {
      throw new Error(`Table '${tableName}' not found`);
    }

    let affectedRows = 0;
    const updatedRecords = [];

    for (const [id, record] of table.data.entries()) {
      const matches = Object.entries(conditions).every(([key, value]) => record[key] === value);
      
      if (matches) {
        const updatedRecord = { 
          ...record, 
          ...data,
          updated_at: new Date().toISOString()
        };
        
        table.data.set(id, updatedRecord);
        this.updateIndexes(tableName, updatedRecord, 'update');
        updatedRecords.push(updatedRecord);
        affectedRows++;
      }
    }

    return {
      rows: updatedRecords,
      rowCount: updatedRecords.length,
      affectedRows,
      executionTime: Math.floor(this.rng() * 30) + 5
    };
  }

  /**
   * Delete records from a table
   */
  private async deleteRecords(tableName: string, conditions: unknown = {}): Promise<QueryResult> {
    const table = this.tables.get(tableName);
    if (!table) {
      throw new Error(`Table '${tableName}' not found`);
    }

    let affectedRows = 0;
    const deletedRecords = [];
    const toDelete = [];

    for (const [id, record] of table.data.entries()) {
      const matches = Object.entries(conditions).every(([key, value]) => record[key] === value);
      
      if (matches) {
        deletedRecords.push(record);
        toDelete.push(id);
        affectedRows++;
      }
    }

    // Remove records
    toDelete.forEach(id => {
      table.data.delete(id);
      this.updateIndexes(tableName, { id }, 'delete');
    });

    return {
      rows: deletedRecords,
      rowCount: deletedRecords.length,
      affectedRows,
      executionTime: Math.floor(this.rng() * 25) + 5
    };
  }

  /**
   * Create a new table
   */
  private async createTable(name: string, schema: unknown): Promise<void> {
    if (this.tables.has(name)) {
      throw new Error(`Table '${name}' already exists`);
    }

    const table: MockTable = {
      name,
      schema,
      data: new Map(),
      indexes: new Map()
    };

    this.tables.set(name, table);
    console.log(`📊 Created table: ${name}`);
  }

  /**
   * Drop a table
   */
  private async dropTable(name: string): Promise<void> {
    if (this.tables.delete(name)) {
      console.log(`🗑️ Dropped table: ${name}`);
    } else {
      throw new Error(`Table '${name}' not found`);
    }
  }

  /**
   * Truncate a table
   */
  private async truncateTable(name: string): Promise<void> {
    const table = this.tables.get(name);
    if (table) {
      table.data.clear();
      table.indexes.clear();
      console.log(`✂️ Truncated table: ${name}`);
    } else {
      throw new Error(`Table '${name}' not found`);
    }
  }

  /**
   * Bulk insert records
   */
  private async bulkInsert(tableName: string, records: unknown[]): Promise<QueryResult> {
    const results = [];
    let totalAffected = 0;

    for (const record of records) {
      const result = await this.insertRecord(tableName, record);
      results.push(...result.rows);
      totalAffected += result.rowCount;
    }

    return {
      rows: results,
      rowCount: results.length,
      affectedRows: totalAffected,
      executionTime: Math.floor(this.rng() * 100) + records.length * 2
    };
  }

  /**
   * Bulk update records
   */
  private async bulkUpdate(
    tableName: string, 
    updates: Array<{ data: unknown; conditions: unknown }>
  ): Promise<QueryResult> {
    const results = [];
    let totalAffected = 0;

    for (const { data, conditions } of updates) {
      const result = await this.updateRecords(tableName, data, conditions);
      results.push(...result.rows);
      totalAffected += result.affectedRows || 0;
    }

    return {
      rows: results,
      rowCount: results.length,
      affectedRows: totalAffected,
      executionTime: Math.floor(this.rng() * 150) + updates.length * 3
    };
  }

  /**
   * Create Redis-specific operations
   */
  private createRedisOperations(_connectionId: string) {
    const redisData = new Map();

    return {
      // String operations
      set: async (key: string, value: unknown, ttl?: number) => {
        redisData.set(key, { value, expires: ttl ? Date.now() + ttl * 1000 : null });
        return 'OK';
      },
      get: async (key: string) => {
        const data = redisData.get(key);
        if (!data) return null;
        if (data.expires && Date.now() > data.expires) {
          redisData.delete(key);
          return null;
        }
        return data.value;
      },
      del: async (...keys: string[]) => {
        let deleted = 0;
        keys.forEach(key => {
          if (redisData.delete(key)) deleted++;
        });
        return deleted;
      },
      exists: async (...keys: string[]) => {
        return keys.filter(key => redisData.has(key)).length;
      },

      // Hash operations
      hset: async (key: string, field: string, value: unknown) => {
        if (!redisData.has(key)) {
          redisData.set(key, { type: 'hash', data: new Map() });
        }
        const hash = redisData.get(key);
        if (hash.type !== 'hash') throw new Error('WRONGTYPE Operation against a key holding the wrong kind of value');
        return hash.data.set(field, value) ? 1 : 0;
      },
      hget: async (key: string, field: string) => {
        const hash = redisData.get(key);
        return hash?.type === 'hash' ? hash.data.get(field) : null;
      },
      hgetall: async (key: string) => {
        const hash = redisData.get(key);
        if (!hash || hash.type !== 'hash') return {};
        return Object.fromEntries(hash.data.entries());
      },

      // List operations
      lpush: async (key: string, ...values: unknown[]) => {
        if (!redisData.has(key)) {
          redisData.set(key, { type: 'list', data: [] });
        }
        const list = redisData.get(key);
        if (list.type !== 'list') throw new Error('WRONGTYPE');
        list.data.unshift(...values.reverse());
        return list.data.length;
      },
      rpush: async (key: string, ...values: unknown[]) => {
        if (!redisData.has(key)) {
          redisData.set(key, { type: 'list', data: [] });
        }
        const list = redisData.get(key);
        if (list.type !== 'list') throw new Error('WRONGTYPE');
        list.data.push(...values);
        return list.data.length;
      },

      // Set operations
      sadd: async (key: string, ...members: unknown[]) => {
        if (!redisData.has(key)) {
          redisData.set(key, { type: 'set', data: new Set() });
        }
        const set = redisData.get(key);
        if (set.type !== 'set') throw new Error('WRONGTYPE');
        let added = 0;
        members.forEach(member => {
          if (!set.data.has(member)) {
            set.data.add(member);
            added++;
          }
        });
        return added;
      },

      // Utility operations
      keys: async (pattern: string) => {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return Array.from(redisData.keys()).filter(key => regex.test(key));
      },
      flushall: async () => {
        redisData.clear();
        return 'OK';
      },
      info: async (_section?: string) => {
        return `# Redis Mock\nredis_version:6.0.0\nuptime_in_seconds:${Math.floor(this.rng() * 86400)}`;
      }
    };
  }

  /**
   * Create PostgreSQL-specific operations
   */
  private createPostgresOperations(_connectionId: string) {
    return {
      // Array operations
      arrayAppend: async (table: string, field: string, value: unknown, conditions: unknown) => {
        const updateData = {};
        updateData[field] = { $push: value };
        return this.updateRecords(table, updateData, conditions);
      },

      // JSON operations
      jsonExtract: async (table: string, field: string, path: string, conditions: unknown) => {
        const records = await this.selectRecords(table, conditions);
        return {
          ...records,
          rows: records.rows.map(row => {
            try {
              const json = typeof row[field] === 'string' ? JSON.parse(row[field]) : row[field];
              const pathParts = path.split('.');
              let result = json;
              for (const part of pathParts) {
                result = result?.[part];
              }
              return { ...row, [field]: result };
            } catch {
              return { ...row, [field]: null };
            }
          })
        };
      },

      // Full-text search
      fullTextSearch: async (table: string, field: string, query: string) => {
        const conditions = {};
        conditions[field] = { $like: query };
        return this.selectRecords(table, conditions);
      }
    };
  }

  // Helper methods
  private initializeDefaultTables(): void {
    // Users table
    this.createTable('users', {
      id: { type: 'integer', primaryKey: true, nullable: false },
      email: { type: 'varchar', nullable: false, unique: true },
      username: { type: 'varchar', nullable: false },
      password_hash: { type: 'varchar', nullable: false },
      role: { type: 'varchar', default: 'user' },
      created_at: { type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
      updated_at: { type: 'timestamp', default: 'CURRENT_TIMESTAMP' }
    });

    // Projects table
    this.createTable('projects', {
      id: { type: 'integer', primaryKey: true, nullable: false },
      name: { type: 'varchar', nullable: false },
      description: { type: 'text', nullable: true },
      owner_id: { type: 'integer', nullable: false, references: { table: 'users', column: 'id' } },
      created_at: { type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
      updated_at: { type: 'timestamp', default: 'CURRENT_TIMESTAMP' }
    });

    // Graphs table
    this.createTable('graphs', {
      id: { type: 'varchar', primaryKey: true, nullable: false },
      name: { type: 'varchar', nullable: false },
      data: { type: 'json', nullable: false },
      project_id: { type: 'integer', nullable: true, references: { table: 'projects', column: 'id' } },
      created_at: { type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
      updated_at: { type: 'timestamp', default: 'CURRENT_TIMESTAMP' }
    });

    console.log('📊 Initialized default database tables');
  }

  private parseSQLAndExecute(_sql: string, _params: unknown[] = []): QueryResult {
    // Simplified SQL parser for common operations
    const sql = _sql.trim().toLowerCase();
    
    if (sql.startsWith('select')) {
      return this.mockSelectQuery(sql, _params);
    } else if (sql.startsWith('insert')) {
      return this.mockInsertQuery(sql, _params);
    } else if (sql.startsWith('update')) {
      return this.mockUpdateQuery(sql, _params);
    } else if (sql.startsWith('delete')) {
      return this.mockDeleteQuery(sql, _params);
    } else {
      // Return a generic successful result for other queries
      return {
        rows: [],
        rowCount: 0,
        executionTime: Math.floor(this.rng() * 20) + 5
      };
    }
  }

  private mockSelectQuery(_sql: string, _params: unknown[]): QueryResult {
    // Extract table name (very simplified)
    const tableMatch = _sql.match(/from\s+(\w+)/);
    const tableName = tableMatch ? tableMatch[1] : 'users';
    
    const table = this.tables.get(tableName);
    if (!table) {
      return { rows: [], rowCount: 0, executionTime: 5 };
    }

    const rows = Array.from(table.data.values()).slice(0, 10); // Limit for mock
    return {
      rows,
      rowCount: rows.length,
      executionTime: Math.floor(this.rng() * 50) + 5
    };
  }

  private mockInsertQuery(_sql: string, _params: unknown[]): QueryResult {
    const tableMatch = _sql.match(/into\s+(\w+)/);
    const tableName = tableMatch ? tableMatch[1] : 'users';
    
    const id = this.generateId();
    const record = { id, ...this.generateMockRecord(tableName) };
    
    return {
      rows: [record],
      rowCount: 1,
      executionTime: Math.floor(this.rng() * 20) + 5,
      insertId: id
    };
  }

  private mockUpdateQuery(_sql: string, _params: unknown[]): QueryResult {
    const affectedRows = Math.floor(this.rng() * 5) + 1;
    return {
      rows: [],
      rowCount: 0,
      affectedRows,
      executionTime: Math.floor(this.rng() * 30) + 5
    };
  }

  private mockDeleteQuery(_sql: string, _params: unknown[]): QueryResult {
    const affectedRows = Math.floor(this.rng() * 3) + 1;
    return {
      rows: [],
      rowCount: 0,
      affectedRows,
      executionTime: Math.floor(this.rng() * 25) + 5
    };
  }

  private generateMockRecord(tableName: string): unknown {
    switch (tableName) {
    case 'users':
      return {
        email: `user${Math.floor(this.rng() * 1000)}@example.com`,
        username: `user${Math.floor(this.rng() * 1000)}`,
        role: 'user',
        created_at: new Date().toISOString()
      };
    case 'projects':
      return {
        name: `Project ${Math.floor(this.rng() * 100)}`,
        description: 'Mock project description',
        owner_id: Math.floor(this.rng() * 10) + 1,
        created_at: new Date().toISOString()
      };
    default:
      return {
        name: `Mock ${tableName} record`,
        created_at: new Date().toISOString()
      };
    }
  }

  private updateIndexes(tableName: string, record: unknown, operation: 'insert' | 'update' | 'delete'): void {
    const table = this.tables.get(tableName);
    if (!table) return;

    // Update indexes for unique and indexed fields
    Object.entries(table.schema).forEach(([field, spec]) => {
      if (spec.unique || spec.primaryKey) {
        if (!table.indexes.has(field)) {
          table.indexes.set(field, new Set());
        }
        
        const index = table.indexes.get(field)!;
        const id = record.id || record[field];
        
        switch (operation) {
        case 'insert':
        case 'update':
          index.add(id);
          break;
        case 'delete':
          index.delete(id);
          break;
        }
      }
    });
  }

  private createIndex(tableName: string, columns: string[], name?: string): void {
    const table = this.tables.get(tableName);
    if (!table) {
      throw new Error(`Table '${tableName}' not found`);
    }

    const indexName = name || `idx_${tableName}_${columns.join('_')}`;
    const index = new Set();
    
    // Build index from existing data
    for (const record of table.data.values()) {
      const key = columns.map(col => record[col]).join('|');
      index.add(key);
    }
    
    table.indexes.set(indexName, index);
    console.log(`📇 Created index ${indexName} on ${tableName}(${columns.join(', ')})`);
  }

  private describeTable(name: string): unknown {
    const table = this.tables.get(name);
    if (!table) {
      throw new Error(`Table '${name}' not found`);
    }

    return {
      name,
      schema: table.schema,
      recordCount: table.data.size,
      indexes: Array.from(table.indexes.keys())
    };
  }

  private closeConnection(_connectionId: string): boolean {
    return this.connections.delete(_connectionId);
  }

  private getConnectionStats(_connectionId: string): unknown {
    const connection = this.connections.get(_connectionId);
    if (!connection) return null;

    return {
      connectionId: _connectionId,
      type: connection.type,
      connected: true,
      queryCount: this.queryLog.length,
      averageQueryTime: this.queryLog.length > 0 
        ? this.queryLog.reduce((sum, log) => sum + log.duration, 0) / this.queryLog.length 
        : 0,
      activeTransactions: Array.from(this.transactions.values()).filter(t => t.status === 'active').length
    };
  }

  private generateId(): string {
    return `mock_${Date.now()}_${Math.floor(this.rng() * 10000)}`;
  }

  /**
   * Get query execution log
   */
  getQueryLog(): typeof this.queryLog {
    return this.queryLog;
  }

  /**
   * Clear query log
   */
  clearQueryLog(): void {
    this.queryLog = [];
  }

  /**
   * Get all tables
   */
  getTables(): Map<string, MockTable> {
    return this.tables;
  }

  /**
   * Get active transactions
   */
  getActiveTransactions(): TransactionContext[] {
    return Array.from(this.transactions.values()).filter(t => t.status === 'active');
  }

  /**
   * Clean up all resources
   */
  cleanup(): void {
    this.tables.clear();
    this.connections.clear();
    this.transactions.clear();
    this.queryLog = [];
    this.factory.cleanup();
    console.log('🧹 Database mock service cleanup completed');
  }
}

export default DatabaseMockService;