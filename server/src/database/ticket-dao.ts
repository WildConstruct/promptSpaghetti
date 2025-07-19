/**
 * Ticket Data Access Object
 * Handles all database operations for tickets with GitHub automation triggers
 */

import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import { 
  Ticket, 
  TicketStatus, 
  TicketStatusType,
  TICKET_TRANSITIONS,
  GitHubAutomationConfig,
  CommitTracking
} from './ticket-models';
import { logger } from '../utils/logger';
import { NotificationService } from '../services/notification-service';
import { executeGitHubAutomation } from '../services/github-automation-service';

export class TicketDAO {
  private db: Database.Database;
  private notificationService: NotificationService;

  constructor(db: Database.Database) {
    this.db = db;
    this.notificationService = NotificationService.getInstance();
    this.initializeTables();
  }

  private initializeTables(): void {
    // Create tickets table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS tickets (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        status TEXT NOT NULL,
        priority TEXT NOT NULL,
        epic_id TEXT,
        story_id TEXT,
        assigned_to TEXT,
        created_by TEXT NOT NULL,
        pr_number INTEGER,
        pr_url TEXT,
        branch_name TEXT,
        commit_count INTEGER DEFAULT 0,
        last_commit_sha TEXT,
        files_changed TEXT DEFAULT '[]',
        labels TEXT DEFAULT '[]',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        approved_at TEXT,
        approved_by TEXT,
        merged_at TEXT,
        closed_at TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
      CREATE INDEX IF NOT EXISTS idx_tickets_epic ON tickets(epic_id);
      CREATE INDEX IF NOT EXISTS idx_tickets_assigned ON tickets(assigned_to);
    `);

    // Create GitHub automation config table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS github_automation_config (
        id TEXT PRIMARY KEY,
        enabled INTEGER DEFAULT 1,
        auto_create_pr INTEGER DEFAULT 1,
        auto_push_interval INTEGER DEFAULT 10,
        base_branch TEXT DEFAULT 'main',
        pr_template TEXT,
        pr_title_template TEXT DEFAULT '[{{ticket.id}}] {{ticket.title}}',
        pr_body_template TEXT,
        commit_message_template TEXT DEFAULT 'feat({{ticket.id}}): {{description}}',
        labels_to_add TEXT DEFAULT '["automated-pr"]',
        reviewers TEXT DEFAULT '[]',
        draft_pr INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    // Create commit tracking table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS commit_tracking (
        id TEXT PRIMARY KEY,
        ticket_id TEXT NOT NULL,
        commit_sha TEXT NOT NULL,
        commit_message TEXT NOT NULL,
        files_changed TEXT NOT NULL,
        lines_added INTEGER NOT NULL,
        lines_deleted INTEGER NOT NULL,
        author TEXT NOT NULL,
        committed_at TEXT NOT NULL,
        pushed INTEGER DEFAULT 0,
        pushed_at TEXT,
        pr_number INTEGER,
        FOREIGN KEY (ticket_id) REFERENCES tickets(id)
      );

      CREATE INDEX IF NOT EXISTS idx_commits_ticket ON commit_tracking(ticket_id);
      CREATE INDEX IF NOT EXISTS idx_commits_pushed ON commit_tracking(pushed);
    `);

    // Create ticket history table for audit trail
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS ticket_history (
        id TEXT PRIMARY KEY,
        ticket_id TEXT NOT NULL,
        field_name TEXT NOT NULL,
        old_value TEXT,
        new_value TEXT,
        changed_by TEXT NOT NULL,
        changed_at TEXT NOT NULL,
        FOREIGN KEY (ticket_id) REFERENCES tickets(id)
      );

      CREATE INDEX IF NOT EXISTS idx_history_ticket ON ticket_history(ticket_id);
    `);
  }

  // Create a new ticket
  createTicket(ticket: Omit<Ticket, 'id' | 'created_at' | 'updated_at'>): Ticket {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const newTicket: Ticket = {
      ...ticket,
      id,
      created_at: now,
      updated_at: now,
      files_changed: ticket.files_changed || [],
      labels: ticket.labels || [],
      commit_count: 0
    };

    const stmt = this.db.prepare(`
      INSERT INTO tickets (
        id, title, description, status, priority, epic_id, story_id,
        assigned_to, created_by, pr_number, pr_url, branch_name,
        commit_count, last_commit_sha, files_changed, labels,
        created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?
      )
    `);

    stmt.run(
      newTicket.id,
      newTicket.title,
      newTicket.description,
      newTicket.status,
      newTicket.priority,
      newTicket.epic_id || null,
      newTicket.story_id || null,
      newTicket.assigned_to || null,
      newTicket.created_by,
      newTicket.pr_number || null,
      newTicket.pr_url || null,
      newTicket.branch_name || null,
      newTicket.commit_count,
      newTicket.last_commit_sha || null,
      JSON.stringify(newTicket.files_changed),
      JSON.stringify(newTicket.labels),
      newTicket.created_at,
      newTicket.updated_at
    );

    logger.info(`Created ticket ${id}: ${newTicket.title}`);
    return newTicket;
  }

  // Update ticket status with transition validation and automation triggers
  async updateTicketStatus(
    ticketId: string, 
    newStatus: TicketStatusType, 
    changedBy: string
  ): Promise<Ticket | null> {
    const ticket = this.getTicket(ticketId);
    if (!ticket) {
      logger.error(`Ticket ${ticketId} not found`);
      return null;
    }

    // Validate status transition
    const allowedTransitions = TICKET_TRANSITIONS[ticket.status as TicketStatusType];
    if (!allowedTransitions.includes(newStatus)) {
      logger.error(`Invalid status transition from ${ticket.status} to ${newStatus}`);
      throw new Error(`Cannot transition from ${ticket.status} to ${newStatus}`);
    }

    const oldStatus = ticket.status;
    const now = new Date().toISOString();

    // Update the ticket
    const updateFields: Record<string, string | null> = {
      status: newStatus,
      updated_at: now
    };

    // Set timestamp fields based on status
    if (newStatus === TicketStatus.APPROVED) {
      updateFields.approved_at = now;
      updateFields.approved_by = changedBy;
    } else if (newStatus === TicketStatus.MERGED) {
      updateFields.merged_at = now;
    } else if (newStatus === TicketStatus.CLOSED) {
      updateFields.closed_at = now;
    }

    const setClause = Object.keys(updateFields).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updateFields), ticketId];

    const stmt = this.db.prepare(`UPDATE tickets SET ${setClause} WHERE id = ?`);
    stmt.run(values);

    // Record history
    this.recordHistory(ticketId, 'status', oldStatus, newStatus, changedBy);

    // Get updated ticket
    const updatedTicket = this.getTicket(ticketId)!;

    // Trigger automations based on status change
    if (newStatus === TicketStatus.APPROVED) {
      await this.handleTicketApproval(updatedTicket, changedBy);
    }

    // Send webhook notification
    await this.notificationService.sendNotification({
      id: uuidv4(),
      type: 'webhook',
      subject: 'Ticket Status Changed',
      body: JSON.stringify({
        event_type: 'ticket_status_changed',
        ticket_id: ticketId,
        old_status: oldStatus,
        new_status: newStatus,
        changed_by: changedBy,
        timestamp: now
      }),
      recipients: ['webhook_default'],
      created_at: now,
      sent: false
    });

    logger.info(`Updated ticket ${ticketId} status from ${oldStatus} to ${newStatus}`);
    return updatedTicket;
  }

  // Handle ticket approval - trigger GitHub automation
  private async handleTicketApproval(ticket: Ticket, _approvedBy: string): Promise<void> {
    const config = this.getGitHubAutomationConfig();
    
    if (!config?.enabled || !config.auto_create_pr) {
      logger.info('GitHub automation is disabled');
      return;
    }

    try {
      // Execute GitHub automation (PR creation/update)
      await executeGitHubAutomation(ticket, config, 'create_pr');
      
      logger.info(`GitHub automation triggered for approved ticket ${ticket.id}`);
    } catch (error) {
      logger.error(`Failed to execute GitHub automation for ticket ${ticket.id}:`, error);
      // Don't throw - we don't want to block the approval
    }
  }

  // Track a commit for a ticket
  async trackCommit(ticketId: string, commitData: Omit<CommitTracking, 'id'>): Promise<void> {
    const id = uuidv4();
    
    const stmt = this.db.prepare(`
      INSERT INTO commit_tracking (
        id, ticket_id, commit_sha, commit_message, files_changed,
        lines_added, lines_deleted, author, committed_at, pushed, pr_number
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      commitData.ticket_id,
      commitData.commit_sha,
      commitData.commit_message,
      JSON.stringify(commitData.files_changed),
      commitData.lines_added,
      commitData.lines_deleted,
      commitData.author,
      commitData.committed_at,
      0, // pushed = false
      commitData.pr_number || null
    );

    // Update ticket commit count
    this.db.prepare(`
      UPDATE tickets 
      SET commit_count = commit_count + 1,
          last_commit_sha = ?,
          updated_at = ?
      WHERE id = ?
    `).run(commitData.commit_sha, new Date().toISOString(), ticketId);

    // Check if we need to auto-push
    await this.checkAutoPush(ticketId);
  }

  // Check if we should auto-push based on commit count
  private async checkAutoPush(ticketId: string): Promise<void> {
    const config = this.getGitHubAutomationConfig();
    if (!config?.enabled) return;

    const unpushedCount = this.db.prepare(`
      SELECT COUNT(*) as count 
      FROM commit_tracking 
      WHERE ticket_id = ? AND pushed = 0
    `).get(ticketId) as { count: number };

    if (unpushedCount.count >= config.auto_push_interval) {
      logger.info(`Auto-push threshold reached for ticket ${ticketId} (${unpushedCount.count} commits)`);
      
      try {
        // Execute GitHub automation (push commits)
        const ticket = this.getTicket(ticketId)!;
        await executeGitHubAutomation(ticket, config, 'push_commits');
        
        // Mark commits as pushed
        const now = new Date().toISOString();
        this.db.prepare(`
          UPDATE commit_tracking 
          SET pushed = 1, pushed_at = ?
          WHERE ticket_id = ? AND pushed = 0
        `).run(now, ticketId);
        
      } catch (error) {
        logger.error(`Failed to auto-push commits for ticket ${ticketId}:`, error);
      }
    }
  }

  // Get a single ticket
  getTicket(id: string): Ticket | null {
    const row = this.db.prepare('SELECT * FROM tickets WHERE id = ?').get(id) as Record<string, unknown>;
    if (!row) return null;

    return {
      ...row,
      files_changed: JSON.parse(row.files_changed || '[]'),
      labels: JSON.parse(row.labels || '[]')
    };
  }

  // Get all tickets with optional filters
  getTickets(filters?: {
    status?: TicketStatusType;
    assigned_to?: string;
    epic_id?: string;
  }): Ticket[] {
    let query = 'SELECT * FROM tickets WHERE 1=1';
    const params: unknown[] = [];

    if (filters?.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }
    if (filters?.assigned_to) {
      query += ' AND assigned_to = ?';
      params.push(filters.assigned_to);
    }
    if (filters?.epic_id) {
      query += ' AND epic_id = ?';
      params.push(filters.epic_id);
    }

    query += ' ORDER BY created_at DESC';

    const rows = this.db.prepare(query).all(params) as Record<string, unknown>[];
    
    return rows.map(row => ({
      ...row,
      files_changed: JSON.parse(row.files_changed || '[]'),
      labels: JSON.parse(row.labels || '[]')
    }));
  }

  // Get GitHub automation configuration
  getGitHubAutomationConfig(): GitHubAutomationConfig | null {
    const row = this.db.prepare('SELECT * FROM github_automation_config LIMIT 1').get() as Record<string, unknown>;
    if (!row) {
      // Create default config if none exists
      return this.createDefaultGitHubConfig();
    }

    return {
      ...row,
      enabled: row.enabled === 1,
      auto_create_pr: row.auto_create_pr === 1,
      draft_pr: row.draft_pr === 1,
      labels_to_add: JSON.parse(row.labels_to_add || '[]'),
      reviewers: JSON.parse(row.reviewers || '[]')
    };
  }

  // Create default GitHub automation config
  private createDefaultGitHubConfig(): GitHubAutomationConfig {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const config: GitHubAutomationConfig = {
      id,
      enabled: true,
      auto_create_pr: true,
      auto_push_interval: 10,
      base_branch: 'main',
      pr_title_template: '[{{ticket.id}}] {{ticket.title}}',
      commit_message_template: 'feat({{ticket.id}}): {{description}}',
      labels_to_add: ['automated-pr'],
      reviewers: [],
      draft_pr: false,
      created_at: now,
      updated_at: now
    };

    this.db.prepare(`
      INSERT INTO github_automation_config (
        id, enabled, auto_create_pr, auto_push_interval, base_branch,
        pr_title_template, commit_message_template, labels_to_add, reviewers,
        draft_pr, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      config.id,
      1, // enabled
      1, // auto_create_pr
      config.auto_push_interval,
      config.base_branch,
      config.pr_title_template,
      config.commit_message_template,
      JSON.stringify(config.labels_to_add),
      JSON.stringify(config.reviewers),
      0, // draft_pr
      config.created_at,
      config.updated_at
    );

    return config;
  }

  // Update GitHub automation config
  updateGitHubConfig(updates: Partial<GitHubAutomationConfig>): void {
    const current = this.getGitHubAutomationConfig();
    if (!current) return;

    const updatedConfig = { ...current, ...updates, updated_at: new Date().toISOString() };
    
    this.db.prepare(`
      UPDATE github_automation_config SET
        enabled = ?, auto_create_pr = ?, auto_push_interval = ?, base_branch = ?,
        pr_template = ?, pr_title_template = ?, pr_body_template = ?,
        commit_message_template = ?, labels_to_add = ?, reviewers = ?,
        draft_pr = ?, updated_at = ?
      WHERE id = ?
    `).run(
      updatedConfig.enabled ? 1 : 0,
      updatedConfig.auto_create_pr ? 1 : 0,
      updatedConfig.auto_push_interval,
      updatedConfig.base_branch,
      updatedConfig.pr_template || null,
      updatedConfig.pr_title_template,
      updatedConfig.pr_body_template || null,
      updatedConfig.commit_message_template,
      JSON.stringify(updatedConfig.labels_to_add),
      JSON.stringify(updatedConfig.reviewers),
      updatedConfig.draft_pr ? 1 : 0,
      updatedConfig.updated_at,
      current.id
    );
  }

  // Record field changes for audit trail
  private recordHistory(
    ticketId: string, 
    fieldName: string, 
    oldValue: unknown, 
    newValue: unknown, 
    changedBy: string
  ): void {
    const id = uuidv4();
    const now = new Date().toISOString();

    this.db.prepare(`
      INSERT INTO ticket_history (id, ticket_id, field_name, old_value, new_value, changed_by, changed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      ticketId,
      fieldName,
      typeof oldValue === 'object' ? JSON.stringify(oldValue) : String(oldValue),
      typeof newValue === 'object' ? JSON.stringify(newValue) : String(newValue),
      changedBy,
      now
    );
  }

  // Get ticket history
  getTicketHistory(ticketId: string): Array<Record<string, unknown>> {
    return this.db.prepare(`
      SELECT * FROM ticket_history 
      WHERE ticket_id = ? 
      ORDER BY changed_at DESC
    `).all(ticketId);
  }

  // Get unpushed commits for a ticket
  getUnpushedCommits(ticketId: string): CommitTracking[] {
    const rows = this.db.prepare(`
      SELECT * FROM commit_tracking 
      WHERE ticket_id = ? AND pushed = 0
      ORDER BY committed_at ASC
    `).all(ticketId) as Record<string, unknown>[];

    return rows.map(row => ({
      ...row,
      files_changed: JSON.parse(row.files_changed),
      pushed: row.pushed === 1
    }));
  }
}