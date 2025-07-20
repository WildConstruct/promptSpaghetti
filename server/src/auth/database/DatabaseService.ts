// Epic 11 Database Service
// PostgreSQL database service for authentication

import { Pool, PoolClient, QueryResult } from 'pg';
import { AuthConfig } from '../types';

export class DatabaseService {
  private pool: Pool;
  private config: AuthConfig;

  constructor(config: AuthConfig) {
    this.config = config;
    this.pool = new Pool({
      host: config.database.host,
      port: config.database.port,
      database: config.database.database,
      user: config.database.username,
      password: config.database.password,
      ssl: config.database.ssl,
      max: config.database.poolSize || 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000
    });

    // Handle pool errors
    this.pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });
  }

  async query(text: string, params?: any[]): Promise<QueryResult<any>> {
    const start = Date.now();
    try {
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;
      
      if (duration > 1000) {
        console.warn(`Slow query (${duration}ms):`, text);
      }
      
      return result;
    } catch (error) {
      console.error('Database query error:', {
        query: text,
        params: params ? params.map(p => typeof p === 'string' && p.length > 100 ? `${p.substring(0, 100)}...` : p) : undefined,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.query('SELECT 1 as health');
      return result.rows.length > 0 && result.rows[0].health === 1;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }

  async initializeSchema(): Promise<void> {
    try {
      const fs = require('fs');
      const path = require('path');
      
      // Read schema file
      const schemaPath = path.join(__dirname, '../schema.sql');
      const schema = fs.readFileSync(schemaPath, 'utf8');
      
      // Execute schema in transaction
      await this.transaction(async (client) => {
        await client.query(schema);
      });
      
      console.log('Database schema initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database schema:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }

  // Get connection pool statistics
  getPoolStats() {
    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount
    };
  }

  // Get a client from the pool for manual transaction handling
  async getClient(): Promise<PoolClient> {
    return await this.pool.connect();
  }

  // User database operations for PasswordResetService
  async findUserByEmail(email: string): Promise<any | null> {
    const result = await this.query(
      'SELECT * FROM users WHERE email = $1 AND status = $2',
      [email.toLowerCase(), 'active']
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async findUserById(id: string): Promise<any | null> {
    const result = await this.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  }
}