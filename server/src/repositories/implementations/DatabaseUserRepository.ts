import Database from 'better-sqlite3';
import * as argon2 from 'argon2';
import { UserRepository, UserStats } from '../interfaces/UserRepository';
import { User, UserId, CreateUserRequest } from '../../types';

/**
 * Database implementation of UserRepository with connection pooling and prepared statements
 */
export class DatabaseUserRepository implements UserRepository {
  constructor(private db: Database.Database) {}

  async create(request: CreateUserRequest): Promise<User> {

    const passwordHash = await argon2.hash(request.password);
    const now = Date.now();
    const userId = this.generateUserId();
    
    const stmt = this.db.prepare(`
      INSERT INTO users (id, email, name, password_hash, organization_id, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      userId,
      request.email,
      request.name,
      passwordHash,
      request.organizationId || null,
      true,
      now,
      now
    );
    
    return {
      id: userId,
      email: request.email,
      name: request.name,
      organizationId: request.organizationId,
      isActive: true,
      createdAt: new Date(now),
      updatedAt: new Date(now)
    };
  }

  async findById(id: UserId): Promise<User | null> {

    const stmt = this.db.prepare(`
      SELECT id, email, name, organization_id, is_active, created_at, updated_at, last_login_at
      FROM users 
      WHERE id = ?
    `);
    
    const row = stmt.get(id) as any;
    if (!row) return null;
    
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      organizationId: row.organization_id,
      isActive: Boolean(row.is_active),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      lastLoginAt: row.last_login_at ? new Date(row.last_login_at) : undefined
    };
  }

  async findByEmail(email: string): Promise<User | null> {

    const stmt = this.db.prepare(`
      SELECT id, email, name, organization_id, is_active, created_at, updated_at, last_login_at
      FROM users 
      WHERE email = ? AND is_active = 1
    `);
    
    const row = stmt.get(email) as any;
    if (!row) return null;
    
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      organizationId: row.organization_id,
      isActive: Boolean(row.is_active),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      lastLoginAt: row.last_login_at ? new Date(row.last_login_at) : undefined
    };
  }

  async update(id: UserId, updates: Partial<User>): Promise<User> {

    const setClause: string[] = [];
    const values: any[] = [];
    
    if (updates.email !== undefined) {
      setClause.push('email = ?');
      values.push(updates.email);
    }
    if (updates.name !== undefined) {
      setClause.push('name = ?');
      values.push(updates.name);
    }
    if (updates.organizationId !== undefined) {
      setClause.push('organization_id = ?');
      values.push(updates.organizationId);
    }
    if (updates.isActive !== undefined) {
      setClause.push('is_active = ?');
      values.push(updates.isActive);
    }
    
    setClause.push('updated_at = ?');
    values.push(Date.now());
    values.push(id);
    
    const stmt = this.db.prepare(`
      UPDATE users 
      SET ${setClause.join(', ')}
      WHERE id = ?
    `);
    
    stmt.run(...values);
    
    const updatedUser = await this.findById(id);
    if (!updatedUser) {
      throw new Error(`User ${id} not found after update`);
    }
    
    return updatedUser;
  }

  async delete(id: UserId): Promise<boolean> {

    // Soft delete - mark as inactive
    const stmt = this.db.prepare(`
      UPDATE users 
      SET is_active = 0, updated_at = ?
      WHERE id = ?
    `);
    
    const result = stmt.run(Date.now(), id);
    return result.changes > 0;
  }

  async exists(id: UserId): Promise<boolean> {

    const stmt = this.db.prepare('SELECT 1 FROM users WHERE id = ? AND is_active = 1 LIMIT 1');
    return stmt.get(id) !== undefined;
  }

  async authenticate(email: string, password: string): Promise<User | null> {

    const stmt = this.db.prepare(`
      SELECT id, email, name, password_hash, organization_id, is_active, created_at, updated_at, last_login_at
      FROM users 
      WHERE email = ? AND is_active = 1
    `);
    
    const row = stmt.get(email) as any;
    if (!row) return null;
    
    const isValid = await argon2.verify(row.password_hash, password);
    if (!isValid) return null;
    
    // Update last login time
    const updateStmt = this.db.prepare(`
      UPDATE users 
      SET last_login_at = ?
      WHERE id = ?
    `);
    updateStmt.run(Date.now(), row.id);
    
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      organizationId: row.organization_id,
      isActive: Boolean(row.is_active),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      lastLoginAt: new Date(};
  }

  async updatePassword(id: UserId, newPassword: string): Promise<boolean> {

    const passwordHash = await argon2.hash(newPassword);
    
    const stmt = this.db.prepare(`
      UPDATE users 
      SET password_hash = ?, updated_at = ?
      WHERE id = ? AND is_active = 1
    `);
    
    const result = stmt.run(passwordHash, Date.now(), id);
    return result.changes > 0;
  }

  async findByOrganization(organizationId: string): Promise<User[]> {

    const stmt = this.db.prepare(`
      SELECT id, email, name, organization_id, is_active, created_at, updated_at, last_login_at
      FROM users 
      WHERE organization_id = ? AND is_active = 1
      ORDER BY name ASC
    `);
    
    const rows = stmt.all(organizationId) as any[];
    return rows.map(row => ({
      id: row.id,
      email: row.email,
      name: row.name,
      organizationId: row.organization_id,
      isActive: Boolean(row.is_active),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      lastLoginAt: row.last_login_at ? new Date(row.last_login_at) : undefined
    }));
  }

  async getUserStats(id: UserId): Promise<UserStats> {

    const graphsStmt = this.db.prepare('SELECT COUNT(*) as count FROM graphs WHERE user_id = ?');
    const graphsResult = graphsStmt.get(id) as any;
    
    const executionsStmt = this.db.prepare(`
      SELECT COUNT(*) as count 
      FROM analytics_events 
      WHERE user_id = ? AND event_type = 'graph_execution'
    `);
    const executionsResult = executionsStmt.get(id) as any;
    
    const user = await this.findById(id);
    
    return {
      totalGraphs: graphsResult?.count || 0,
      totalExecutions: executionsResult?.count || 0,
      lastLoginAt: user?.lastLoginAt || null,
      accountCreatedAt: user?.createdAt || new Date(};
  }

  private generateUserId(): string {
    // Generate a simple UUID-like identifier
    return 'user_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}