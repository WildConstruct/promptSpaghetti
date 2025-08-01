import Database from 'better-sqlite3';
import { GraphRepository, TransactionContext, GraphMetadata } from '../interfaces/GraphRepository';
import { Graph, GraphId, UserId } from '../../types';

/**
 * Database implementation of GraphRepository using SQLite with optimized queries
 */
export class DatabaseGraphRepository implements GraphRepository {
  constructor(private db: Database.Database) {}

  async save(graph: Graph): Promise<GraphId> {

    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO graphs (id, user_id, name, data, version, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const now = Date.now();
    stmt.run(
      graph.id,
      graph.userId,
      graph.name,
      JSON.stringify(graph.data),
      graph.version,
      graph.createdAt ? graph.createdAt.getTime() : now,
      now
    );

    return graph.id;
  }

  async findById(id: GraphId): Promise<Graph | null> {

    const stmt = this.db.prepare(`
      SELECT id, user_id, name, data, version, created_at, updated_at
      FROM graphs 
      WHERE id = ?
    `);

    const row = stmt.get(id) as any;
    if (!row) return null;

    return {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      data: JSON.parse(row.data),
      version: row.version,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  async findByUser(userId: UserId): Promise<Graph[]> {

    const stmt = this.db.prepare(`
      SELECT id, user_id, name, data, version, created_at, updated_at
      FROM graphs 
      WHERE user_id = ?
      ORDER BY updated_at DESC
    `);

    const rows = stmt.all(userId) as any[];
    return rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      name: row.name,
      data: JSON.parse(row.data),
      version: row.version,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
  }

  async delete(id: GraphId): Promise<boolean> {

    const stmt = this.db.prepare('DELETE FROM graphs WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  async exists(id: GraphId): Promise<boolean> {

    const stmt = this.db.prepare('SELECT 1 FROM graphs WHERE id = ? LIMIT 1');
    return stmt.get(id) !== undefined;
  }

  async saveWithTransaction(graph: Graph, tx: TransactionContext): Promise<GraphId> {

    // Transaction context will be handled by the transaction wrapper
    return this.save(graph);
  }

  async findByNamePattern(userId: UserId, pattern: string): Promise<Graph[]> {

    const stmt = this.db.prepare(`
      SELECT id, user_id, name, data, version, created_at, updated_at
      FROM graphs 
      WHERE user_id = ? AND name LIKE ?
      ORDER BY name ASC
    `);

    const rows = stmt.all(userId, `%${pattern}%`) as any[];
    return rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      name: row.name,
      data: JSON.parse(row.data),
      version: row.version,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
  }

  async getMetadata(id: GraphId): Promise<GraphMetadata | null> {

    const stmt = this.db.prepare(`
      SELECT id, user_id, name, version, created_at, updated_at
      FROM graphs 
      WHERE id = ?
    `);

    const row = stmt.get(id) as any;
    if (!row) return null;

    return {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      version: row.version,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
