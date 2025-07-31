/**
 * Audit Team Collaboration Service
 * 
 * Provides tools for security teams to collaborate on audit findings, investigations,
 * and remediation efforts. Enables team coordination, task assignment, evidence 
 * collection, and progress tracking for security incidents and compliance reviews.
 * 
 * Epic 19 Task T-1752989143998-618: Add audit team collaboration tools
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { AuditService } from '../auth/services/AuditService';
import { DatabaseService } from '../auth/database/DatabaseService';

/**
 * Investigation status states
 */
export enum InvestigationStatus {
  DRAFT = 'DRAFT',
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  AWAITING_REVIEW = 'AWAITING_REVIEW',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  ESCALATED = 'ESCALATED'
}

/**
 * Investigation priority levels
 */
export enum InvestigationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM', 
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

/**
 * Investigation categories
 */
export enum InvestigationCategory {
  SECURITY_INCIDENT = 'SECURITY_INCIDENT',
  COMPLIANCE_VIOLATION = 'COMPLIANCE_VIOLATION',
  DATA_BREACH = 'DATA_BREACH',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  POLICY_VIOLATION = 'POLICY_VIOLATION',
  ANOMALY_DETECTION = 'ANOMALY_DETECTION',
  FRAUD_DETECTION = 'FRAUD_DETECTION',
  INSIDER_THREAT = 'INSIDER_THREAT'
}

/**
 * Task status for investigation tasks
 */
export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  BLOCKED = 'BLOCKED',
  CANCELLED = 'CANCELLED'
}

/**
 * Evidence types for investigations
 */
export enum EvidenceType {
  LOG_FILE = 'LOG_FILE',
  SCREENSHOT = 'SCREENSHOT',
  DOCUMENT = 'DOCUMENT',
  EMAIL = 'EMAIL',
  DATABASE_QUERY = 'DATABASE_QUERY',
  NETWORK_CAPTURE = 'NETWORK_CAPTURE',
  USER_STATEMENT = 'USER_STATEMENT',
  SYSTEM_OUTPUT = 'SYSTEM_OUTPUT'
}

/**
 * Investigation record
 */
}
}
export interface Investigation {
  id: string;
  title: string;
  description?: string;
  category: InvestigationCategory;
  priority: InvestigationPriority;
  status: InvestigationStatus;
  
  // Assignment and ownership
  leadInvestigator: string;
  assignedTeam: string[];
  reportedBy: string;
  
  // Timing
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  resolvedAt?: Date;
  
  // Related data
  relatedAuditLogIds: string[];
  relatedIncidentIds: string[];
  affectedSystems: string[];
  affectedUsers: string[];
  
  // Classification
  confidentialityLevel: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';
  complianceFrameworks: string[];
  
  // Resolution
  findings?: string;
  rootCause?: string;
  remediationActions?: string[];
  lessonsLearned?: string;
  
  // Metadata
  tags: string[];
  metadata: Record<string, any>;
}
}
}

/**
 * Investigation task
 */
}
}
export interface InvestigationTask {
  id: string;
  investigationId: string;
  title: string;
  description?: string;
  assignedTo: string;
  status: TaskStatus;
  priority: InvestigationPriority;
  
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  completedAt?: Date;
  
  dependencies: string[]; // Task IDs this task depends on
  estimatedHours?: number;
  actualHours?: number;
  
  metadata: Record<string, any>;
}
}
}

/**
 * Evidence record
 */
}
}
export interface Evidence {
  id: string;
  investigationId: string;
  taskId?: string;
  
  title: string;
  description?: string;
  type: EvidenceType;
  
  // File information
  fileName?: string;
  fileSize?: number;
  filePath?: string;
  fileHash?: string;
  
  // Collection info
  collectedBy: string;
  collectedAt: Date;
  source: string;
  
  // Chain of custody
  custodyChain: CustodyRecord[];
  
  // Content
  content?: string; // For text-based evidence
  binaryData?: Buffer; // For binary evidence
  
  // Verification
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: Date;
  
  // Classification
  confidentialityLevel: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';
  
  metadata: Record<string, any>;
}
}
}

/**
 * Custody chain record
 */
}
}
export interface CustodyRecord {
  id: string;
  evidenceId: string;
  transferredFrom?: string;
  transferredTo: string;
  transferredAt: Date;
  reason: string;
  signature: string; // Digital signature/hash
}
}
}

/**
 * Investigation comment/update
 */
}
}
export interface InvestigationComment {
  id: string;
  investigationId: string;
  taskId?: string;
  
  author: string;
  content: string;
  commentType?: 'COMMENT' | 'STATUS_UPDATE' | 'FINDING' | 'QUESTION' | 'DECISION';
  
  createdAt: Date;
  editedAt?: Date;
  
  // Mentions and notifications
  mentions: string[];
  notificationsSent: boolean;
  
  // Attachments
  attachments: string[]; // Evidence IDs
  
  metadata: Record<string, any>;
}
}
}

/**
 * Team notification
 */
}
}
export interface TeamNotification {
  id: string;
  recipientId: string;
  type: 'ASSIGNMENT' | 'STATUS_CHANGE' | 'DEADLINE_APPROACHING' | 'MENTION' | 'ESCALATION';
  title: string;
  message: string;
  
  // Source information
  investigationId?: string;
  taskId?: string;
  commentId?: string;
  
  createdAt: Date;
  readAt?: Date;
  actionTaken?: boolean;
  
  metadata: Record<string, any>;
}
}
}

/**
 * Collaboration metrics
 */
}
}
export interface CollaborationMetrics {
  investigationCount: number;
  openInvestigations: number;
  overdueTasks: number;
  averageResolutionTime: number;
  teamWorkload: Record<string, number>;
  evidenceCollected: number;
  complianceIssues: number;
}
}
}

/**
 * Audit Team Collaboration Service
 */
export class AuditTeamCollaborationService extends EventEmitter {
  private db: DatabaseService;
  private auditService: AuditService;
  
  constructor(
    db: DatabaseService,
    auditService: AuditService
  ) {
    super();
    this.db = db;
    this.auditService = auditService;
  }

  /**
   * Initialize database schema for collaboration
   */
  async initializeSchema(): Promise<void> {

    try {
      // Investigations table
      await this.db.query(`
        CREATE TABLE IF NOT EXISTS investigations (
          id VARCHAR(36) PRIMARY KEY,
          title VARCHAR(500) NOT NULL,
          description TEXT,
          category VARCHAR(50) NOT NULL,
          priority VARCHAR(20) NOT NULL,
          status VARCHAR(30) NOT NULL,
          lead_investigator VARCHAR(100) NOT NULL,
          assigned_team TEXT[], -- Array of user IDs
          reported_by VARCHAR(100) NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          due_date TIMESTAMP,
          resolved_at TIMESTAMP,
          related_audit_log_ids TEXT[],
          related_incident_ids TEXT[],
          affected_systems TEXT[],
          affected_users TEXT[],
          confidentiality_level VARCHAR(20) DEFAULT 'INTERNAL',
          compliance_frameworks TEXT[],
          findings TEXT,
          root_cause TEXT,
          remediation_actions TEXT[],
          lessons_learned TEXT,
          tags TEXT[],
          metadata JSONB DEFAULT '{}'::jsonb

      `);

      // Investigation tasks table
      await this.db.query(`
        CREATE TABLE IF NOT EXISTS investigation_tasks (
          id VARCHAR(36) PRIMARY KEY,
          investigation_id VARCHAR(36) NOT NULL REFERENCES investigations(id) ON DELETE CASCADE,
          title VARCHAR(500) NOT NULL,
          description TEXT,
          assigned_to VARCHAR(100) NOT NULL,
          status VARCHAR(20) NOT NULL,
          priority VARCHAR(20) NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          due_date TIMESTAMP,
          completed_at TIMESTAMP,
          dependencies TEXT[],
          estimated_hours INTEGER,
          actual_hours INTEGER,
          metadata JSONB DEFAULT '{}'::jsonb

      `);

      // Evidence table
      await this.db.query(`
        CREATE TABLE IF NOT EXISTS evidence (
          id VARCHAR(36) PRIMARY KEY,
          investigation_id VARCHAR(36) NOT NULL REFERENCES investigations(id) ON DELETE CASCADE,
          task_id VARCHAR(36) REFERENCES investigation_tasks(id),
          title VARCHAR(500) NOT NULL,
          description TEXT,
          type VARCHAR(50) NOT NULL,
          file_name VARCHAR(255),
          file_size BIGINT,
          file_path VARCHAR(1000),
          file_hash VARCHAR(64),
          collected_by VARCHAR(100) NOT NULL,
          collected_at TIMESTAMP DEFAULT NOW(),
          source VARCHAR(500),
          content TEXT,
          verified BOOLEAN DEFAULT FALSE,
          verified_by VARCHAR(100),
          verified_at TIMESTAMP,
          confidentiality_level VARCHAR(20) DEFAULT 'INTERNAL',
          metadata JSONB DEFAULT '{}'::jsonb

      `);

      // Custody chain table
      await this.db.query(`
        CREATE TABLE IF NOT EXISTS custody_chain (
          id VARCHAR(36) PRIMARY KEY,
          evidence_id VARCHAR(36) NOT NULL REFERENCES evidence(id) ON DELETE CASCADE,
          transferred_from VARCHAR(100),
          transferred_to VARCHAR(100) NOT NULL,
          transferred_at TIMESTAMP DEFAULT NOW(),
          reason VARCHAR(500),
          signature VARCHAR(128) NOT NULL

      `);

      // Comments table
      await this.db.query(`
        CREATE TABLE IF NOT EXISTS investigation_comments (
          id VARCHAR(36) PRIMARY KEY,
          investigation_id VARCHAR(36) NOT NULL REFERENCES investigations(id) ON DELETE CASCADE,
          task_id VARCHAR(36) REFERENCES investigation_tasks(id),
          author VARCHAR(100) NOT NULL,
          content TEXT NOT NULL,
          comment_type VARCHAR(30) DEFAULT 'COMMENT',
          created_at TIMESTAMP DEFAULT NOW(),
          edited_at TIMESTAMP,
          mentions TEXT[],
          notifications_sent BOOLEAN DEFAULT FALSE,
          attachments TEXT[],
          metadata JSONB DEFAULT '{}'::jsonb

      `);

      // Notifications table
      await this.db.query(`
        CREATE TABLE IF NOT EXISTS team_notifications (
          id VARCHAR(36) PRIMARY KEY,
          recipient_id VARCHAR(100) NOT NULL,
          type VARCHAR(30) NOT NULL,
          title VARCHAR(500) NOT NULL,
          message TEXT NOT NULL,
          investigation_id VARCHAR(36) REFERENCES investigations(id),
          task_id VARCHAR(36) REFERENCES investigation_tasks(id),
          comment_id VARCHAR(36) REFERENCES investigation_comments(id),
          created_at TIMESTAMP DEFAULT NOW(),
          read_at TIMESTAMP,
          action_taken BOOLEAN DEFAULT FALSE,
          metadata JSONB DEFAULT '{}'::jsonb

      `);

      // Create indexes for performance
      await this.db.query(`
        CREATE INDEX IF NOT EXISTS idx_investigations_status ON investigations(status);
        CREATE INDEX IF NOT EXISTS idx_investigations_assignee ON investigations USING GIN(assigned_team);
        CREATE INDEX IF NOT EXISTS idx_investigation_tasks_assigned ON investigation_tasks(assigned_to);
        CREATE INDEX IF NOT EXISTS idx_investigation_tasks_status ON investigation_tasks(status);
        CREATE INDEX IF NOT EXISTS idx_evidence_investigation ON evidence(investigation_id);
        CREATE INDEX IF NOT EXISTS idx_comments_investigation ON investigation_comments(investigation_id);
        CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON team_notifications(recipient_id);
        CREATE INDEX IF NOT EXISTS idx_notifications_unread ON team_notifications(
          recipient_id,
          read_at
        ) WHERE read_at IS NULL;
      `);

      console.log('Audit team collaboration schema initialized successfully');
    } catch (error) {
      console.error('Failed to initialize collaboration schema:', error);
      throw error;
    }
  }

  /**
   * Create a new investigation
   */
  async createInvestigation(
    investigation: Omit<Investigation,
    'id' | 'createdAt' | 'updatedAt' | 'status'>
  ): Promise<Investigation> {

    // Input validation
    if (!investigation.title || investigation.title.trim().length === 0) {
      throw new Error('Investigation title is required and cannot be empty');
    }
    if (investigation.title.length > 500) {
      throw new Error('Investigation title cannot exceed 500 characters');
    }
    if (!investigation.leadInvestigator || investigation.leadInvestigator.trim().length === 0) {
      throw new Error('Lead investigator is required');
    }
    if (!investigation.reportedBy || investigation.reportedBy.trim().length === 0) {
      throw new Error('Reporter is required');
    }
    if (!investigation.assignedTeam || investigation.assignedTeam.length === 0) {
      throw new Error('At least one team member must be assigned');
    }
    if (investigation.assignedTeam.some(member => !member || member.trim().length === 0)) {
      throw new Error('All assigned team members must have valid identifiers');
    }
    if (investigation.dueDate && investigation.dueDate <= new Date()) {
      throw new Error('Due date must be in the future');
    }

    const id = uuidv4();
    const now = new Date();

    try {
      await this.db.query(`
        INSERT INTO investigations (
          id, title, description, category, priority, status,
          lead_investigator, assigned_team, reported_by,
          created_at, updated_at, due_date,
          related_audit_log_ids, related_incident_ids,
          affected_systems, affected_users,
          confidentiality_level, compliance_frameworks,
          tags, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
      `, [
        id, investigation.title, investigation.description,
        investigation.category, investigation.priority, InvestigationStatus.OPEN,
        investigation.leadInvestigator, investigation.assignedTeam, investigation.reportedBy,
        now, now, investigation.dueDate,
        investigation.relatedAuditLogIds, investigation.relatedIncidentIds,
        investigation.affectedSystems, investigation.affectedUsers,
        investigation.confidentialityLevel, investigation.complianceFrameworks,
        investigation.tags, JSON.stringify(investigation.metadata)
      ]);

      const createdInvestigation: Investigation = {
        ...investigation,
        id,
        status: InvestigationStatus.OPEN,
        createdAt: now,
        updatedAt: now
      };

      // Send notifications to assigned team
      await this.notifyTeamMembers(investigation.assignedTeam, {
        type: 'ASSIGNMENT',
        title: 'New Investigation Assignment',
        message: `You have been assigned to investigation: ${investigation.title}`,
        investigationId: id
      });

      // Log audit event
      await this.auditService.logEvent({
        action: 'investigation_created',
        resourceType: 'investigation',
        resourceId: id,
        details: {
          title: investigation.title,
          category: investigation.category,
          priority: investigation.priority,
          assignedTeam: investigation.assignedTeam
  }
        severity: 'info'
      });

      this.emit('investigationCreated', createdInvestigation);
      return createdInvestigation;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to create investigation:', {
        error: errorMessage,
        investigationTitle: investigation.title,
        leadInvestigator: investigation.leadInvestigator,
        timestamp: new Date().toISOString()
      });
      
      // Provide specific error messages for common database issues
      if (errorMessage.includes('duplicate key')) {
        throw new Error('An investigation with similar details already exists');
      }
      if (errorMessage.includes('foreign key')) {
        throw new Error('Invalid reference to external resource');
      }
      if (errorMessage.includes('connection')) {
        throw new Error('Database connection failed. Please try again.');
      }
      
      throw new Error(`Failed to create investigation: ${errorMessage}`);
    }
  }

  /**
   * Update investigation status and details
   */
  async updateInvestigation(id: string, updates: Partial<Investigation>, updatedBy: string): Promise<void> {

    const updateFields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    // Build dynamic update query
    const allowedFields = {
      title: 'title',
      description: 'description',
      status: 'status',
      priority: 'priority',
      assignedTeam: 'assigned_team',
      dueDate: 'due_date',
      findings: 'findings',
      rootCause: 'root_cause',
      remediationActions: 'remediation_actions',
      lessonsLearned: 'lessons_learned',
      tags: 'tags'
    };

    for (const [key, dbField] of Object.entries(allowedFields)) {
      if (key in updates) {
        updateFields.push(`${dbField} = $${paramIndex}`);
        values.push((updates as any)[key]);
        paramIndex++;
      }
    }

    if (updateFields.length === 0) {
      return; // Nothing to update
    }

    // Always update the updated_at timestamp
    updateFields.push(`updated_at = $${paramIndex}`);
    values.push(new Date());
    paramIndex++;

    // Add ID for WHERE clause
    values.push(id);

    try {
      await this.db.query(`
        UPDATE investigations 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex}
      `, values);

      // Log the update
      await this.auditService.logEvent({
        action: 'investigation_updated',
        resourceType: 'investigation',
        resourceId: id,
        details: {
          updatedBy,
          changes: Object.keys(updates),
          newStatus: updates.status
  }
        severity: 'info'
      });

      // Send notifications for status changes
      if (updates.status) {
        const investigation = await this.getInvestigation(id);
        if (investigation) {
          await this.notifyTeamMembers(investigation.assignedTeam, {
            type: 'STATUS_CHANGE',
            title: 'Investigation Status Updated',
            message: `Investigation "${investigation.title}" status changed to ${updates.status}`,
            investigationId: id
          });
        }
      }

      this.emit('investigationUpdated', { id, updates, updatedBy });
    } catch (error) {
      console.error('Failed to update investigation:', error);
      throw error;
    }
  }

  /**
   * Create a task within an investigation
   */
  async createTask(
    task: Omit<InvestigationTask,
    'id' | 'createdAt' | 'updatedAt' | 'status'>
  ): Promise<InvestigationTask> {

    // Input validation
    if (!task.title || task.title.trim().length === 0) {
      throw new Error('Task title is required and cannot be empty');
    }
    if (task.title.length > 500) {
      throw new Error('Task title cannot exceed 500 characters');
    }
    if (!task.investigationId || task.investigationId.trim().length === 0) {
      throw new Error('Investigation ID is required');
    }
    if (!task.assignedTo || task.assignedTo.trim().length === 0) {
      throw new Error('Task must be assigned to someone');
    }
    if (task.estimatedHours && (task.estimatedHours < 0 || task.estimatedHours > 1000)) {
      throw new Error('Estimated hours must be between 0 and 1000');
    }
    if (task.dueDate && task.dueDate <= new Date()) {
      throw new Error('Task due date must be in the future');
    }
    
    // Verify investigation exists
    const investigation = await this.getInvestigation(task.investigationId);
    if (!investigation) {
      throw new Error(`Investigation with ID ${task.investigationId} does not exist`);
    }

    const id = uuidv4();
    const now = new Date();

    try {
      await this.db.query(`
        INSERT INTO investigation_tasks (
          id, investigation_id, title, description, assigned_to,
          status, priority, created_at, updated_at, due_date,
          dependencies, estimated_hours, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `, [
        id, task.investigationId, task.title, task.description, task.assignedTo,
        TaskStatus.PENDING, task.priority, now, now, task.dueDate,
        task.dependencies, task.estimatedHours, JSON.stringify(task.metadata)
      ]);

      const createdTask: InvestigationTask = {
        ...task,
        id,
        status: TaskStatus.PENDING,
        createdAt: now,
        updatedAt: now
      };

      // Notify assigned user
      await this.notifyTeamMembers([task.assignedTo], {
        type: 'ASSIGNMENT',
        title: 'New Task Assignment',
        message: `You have been assigned task: ${task.title}`,
        investigationId: task.investigationId,
        taskId: id
      });

      this.emit('taskCreated', createdTask);
      return createdTask;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to create task:', {
        error: errorMessage,
        taskTitle: task.title,
        investigationId: task.investigationId,
        assignedTo: task.assignedTo,
        timestamp: new Date().toISOString()
      });
      
      if (errorMessage.includes('foreign key')) {
        throw new Error('Invalid investigation ID or task dependency reference');
      }
      if (errorMessage.includes('connection')) {
        throw new Error('Database connection failed. Please try again.');
      }
      
      throw new Error(`Failed to create task: ${errorMessage}`);
    }
  }

  /**
   * Add evidence to an investigation
   */
  async addEvidence(
    evidence: Omit<Evidence,
    'id' | 'custodyChain' | 'collectedBy' | 'collectedAt' | 'verified'>,
    collectedBy: string = 'system'
  ): Promise<Evidence> {

    // Input validation
    if (!evidence.title || evidence.title.trim().length === 0) {
      throw new Error('Evidence title is required and cannot be empty');
    }
    if (evidence.title.length > 500) {
      throw new Error('Evidence title cannot exceed 500 characters');
    }
    if (!evidence.investigationId || evidence.investigationId.trim().length === 0) {
      throw new Error('Investigation ID is required');
    }
    if (!evidence.type) {
      throw new Error('Evidence type is required');
    }
    if (!evidence.source || evidence.source.trim().length === 0) {
      throw new Error('Evidence source is required');
    }
    if (!collectedBy || collectedBy.trim().length === 0) {
      throw new Error('Evidence collector identifier is required');
    }
    if (evidence.fileSize && evidence.fileSize < 0) {
      throw new Error('File size cannot be negative');
    }
    if (evidence.fileSize && evidence.fileSize > 10 * 1024 * 1024 * 1024) { // 10GB limit
      throw new Error('File size cannot exceed 10GB');
    }
    
    // Verify investigation exists
    const investigation = await this.getInvestigation(evidence.investigationId);
    if (!investigation) {
      throw new Error(`Investigation with ID ${evidence.investigationId} does not exist`);
    }

    const id = uuidv4();
    const collectedAt = new Date();

    try {
      await this.db.query(`
        INSERT INTO evidence (
          id, investigation_id, task_id, title, description, type,
          file_name, file_size, file_path, file_hash,
          collected_by, collected_at, source, content,
          confidentiality_level, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      `, [
        id, evidence.investigationId, evidence.taskId, evidence.title,
        evidence.description, evidence.type, evidence.fileName, evidence.fileSize,
        evidence.filePath, evidence.fileHash, collectedBy, collectedAt,
        evidence.source, evidence.content, evidence.confidentialityLevel,
        JSON.stringify(evidence.metadata)
      ]);

      // Create initial custody record
      const custodyId = uuidv4();
      const signature = this.generateCustodySignature(id, collectedBy, collectedAt);
      
      await this.db.query(`
        INSERT INTO custody_chain (
          id, evidence_id, transferred_to, transferred_at, reason, signature
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        custodyId, id, collectedBy, collectedAt,
        'Initial collection', signature
      ]);

      const createdEvidence: Evidence = {
        ...evidence,
        id,
        collectedBy,
        collectedAt,
        verified: false,
        custodyChain: [{
          id: custodyId,
          evidenceId: id,
          transferredTo: collectedBy,
          transferredAt: collectedAt,
          reason: 'Initial collection',
          signature
        }]
      };

      this.emit('evidenceAdded', createdEvidence);
      return createdEvidence;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to add evidence:', {
        error: errorMessage,
        evidenceTitle: evidence.title,
        investigationId: evidence.investigationId,
        evidenceType: evidence.type,
        collectedBy,
        timestamp: new Date().toISOString()
      });
      
      if (errorMessage.includes('foreign key')) {
        throw new Error('Invalid investigation ID or task reference');
      }
      if (errorMessage.includes('connection')) {
        throw new Error('Database connection failed. Please try again.');
      }
      
      throw new Error(`Failed to add evidence: ${errorMessage}`);
    }
  }

  /**
   * Add comment to investigation
   */
  async addComment(comment: Omit<InvestigationComment, 'id' | 'createdAt' | 'notificationsSent'>): Promise<void> {

    // Input validation
    if (!comment.investigationId || comment.investigationId.trim().length === 0) {
      throw new Error('Investigation ID is required');
    }
    if (!comment.author || comment.author.trim().length === 0) {
      throw new Error('Comment author is required');
    }
    if (!comment.content || comment.content.trim().length === 0) {
      throw new Error('Comment content cannot be empty');
    }
    if (comment.content.length > 10000) {
      throw new Error('Comment content cannot exceed 10,000 characters');
    }
    if (comment.mentions && comment.mentions.some(mention => !mention || mention.trim().length === 0)) {
      throw new Error('All mentioned users must have valid identifiers');
    }
    
    // Verify investigation exists
    const investigation = await this.getInvestigation(comment.investigationId);
    if (!investigation) {
      throw new Error(`Investigation with ID ${comment.investigationId} does not exist`);
    }

    const id = uuidv4();
    const now = new Date();

    try {
      await this.db.query(`
        INSERT INTO investigation_comments (
          id, investigation_id, task_id, author, content, comment_type,
          created_at, mentions, attachments, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        id, comment.investigationId, comment.taskId, comment.author,
        comment.content, comment.commentType || 'COMMENT', now, comment.mentions,
        comment.attachments, JSON.stringify(comment.metadata)
      ]);

      // Send notifications for mentions
      if (comment.mentions.length > 0) {
        await this.notifyTeamMembers(comment.mentions, {
          type: 'MENTION',
          title: 'You were mentioned',
          message: `${comment.author} mentioned you in a comment`,
          investigationId: comment.investigationId,
          taskId: comment.taskId,
          commentId: id
        });
      }

      this.emit('commentAdded', { ...comment, id, createdAt: now });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to add comment:', {
        error: errorMessage,
        investigationId: comment.investigationId,
        author: comment.author,
        contentLength: comment.content?.length || 0,
        timestamp: new Date().toISOString()
      });
      
      if (errorMessage.includes('foreign key')) {
        throw new Error('Invalid investigation ID or task reference');
      }
      if (errorMessage.includes('connection')) {
        throw new Error('Database connection failed. Please try again.');
      }
      
      throw new Error(`Failed to add comment: ${errorMessage}`);
    }
  }

  /**
   * Get investigation details
   */
  async getInvestigation(id: string): Promise<Investigation | null> {

    try {
      const result = await this.db.query(`
        SELECT * FROM investigations WHERE id = $1
      `, [id]);

      if (result.rows.length === 0) {
        return null;
      }

      return this.mapDatabaseInvestigation(result.rows[0]);
    } catch (error) {
      console.error('Failed to get investigation:', error);
      throw error;
    }
  }

  /**
   * Get investigations with filtering
   */
  async getInvestigations(filters: {
    status?: InvestigationStatus;
    assignedTo?: string;
    category?: InvestigationCategory;
    priority?: InvestigationPriority;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ investigations: Investigation[]; total: number }> {

    const conditions: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (filters.status) {
      conditions.push(`status = $${paramIndex}`);
      params.push(filters.status);
      paramIndex++;
    }

    if (filters.assignedTo) {
      conditions.push(`$${paramIndex} = ANY(assigned_team)`);
      params.push(filters.assignedTo);
      paramIndex++;
    }

    if (filters.category) {
      conditions.push(`category = $${paramIndex}`);
      params.push(filters.category);
      paramIndex++;
    }

    if (filters.priority) {
      conditions.push(`priority = $${paramIndex}`);
      params.push(filters.priority);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = filters.limit || 50;
    const offset = filters.offset || 0;

    try {
      // Get total count
      const countResult = await this.db.query(`
        SELECT COUNT(*) as total FROM investigations ${whereClause}
      `, params);

      // Get investigations
      const dataQuery = `
        SELECT * FROM investigations 
        ${whereClause}
        ORDER BY created_at DESC 
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;
      
      const dataResult = await this.db.query(dataQuery, [...params, limit, offset]);

      return {
        investigations: dataResult.rows.map(this.mapDatabaseInvestigation),
        total: parseInt(countResult.rows[0].total)
      };
    } catch (error) {
      console.error('Failed to get investigations:', error);
      throw error;
    }
  }

  /**
   * Get collaboration metrics
   */
  async getCollaborationMetrics(timeframe: 'day' | 'week' | 'month' = 'week'): Promise<CollaborationMetrics> {

    const timeframes = {
      day: '1 day',
      week: '1 week',
      month: '1 month'
    };

    try {
      // Get investigation counts
      const investigationResult = await this.db.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status IN ('OPEN', 'IN_PROGRESS', 'AWAITING_REVIEW')) as open_count
        FROM investigations 
        WHERE created_at >= NOW() - INTERVAL '${timeframes[timeframe]}'
      `);

      // Get overdue tasks
      const overdueTasksResult = await this.db.query(`
        SELECT COUNT(*) as overdue_count
        FROM investigation_tasks 
        WHERE due_date < NOW() AND status NOT IN ('COMPLETED', 'CANCELLED')
      `);

      // Get team workload
      const workloadResult = await this.db.query(`
        SELECT 
          assigned_to,
          COUNT(*) as task_count
        FROM investigation_tasks 
        WHERE status IN ('PENDING', 'IN_PROGRESS')
        GROUP BY assigned_to
      `);

      // Get evidence count
      const evidenceResult = await this.db.query(`
        SELECT COUNT(*) as evidence_count
        FROM evidence 
        WHERE collected_at >= NOW() - INTERVAL '${timeframes[timeframe]}'
      `);

      // Calculate average resolution time
      const resolutionResult = await this.db.query(`
        SELECT AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))) as avg_resolution_seconds
        FROM investigations 
        WHERE resolved_at IS NOT NULL 
          AND created_at >= NOW() - INTERVAL '${timeframes[timeframe]}'
      `);

      const teamWorkload: Record<string, number> = {};
      workloadResult.rows.forEach(row => {
        teamWorkload[row.assigned_to] = parseInt(row.task_count);
      });

      const avgResolutionSeconds = parseFloat(resolutionResult.rows[0]?.avg_resolution_seconds || '0');
      const avgResolutionHours = avgResolutionSeconds / 3600;

      return {
        investigationCount: parseInt(investigationResult.rows[0]?.total || '0'),
        openInvestigations: parseInt(investigationResult.rows[0]?.open_count || '0'),
        overdueTasks: parseInt(overdueTasksResult.rows[0]?.overdue_count || '0'),
        averageResolutionTime: Math.round(avgResolutionHours * 100) / 100,
        teamWorkload,
        evidenceCollected: parseInt(evidenceResult.rows[0]?.evidence_count || '0'),
        complianceIssues: 0 // TODO: Implement compliance issue tracking
      };
    } catch (error) {
      console.error('Failed to get collaboration metrics:', error);
      throw error;
    }
  }

  /**
   * Send notifications to team members
   */
  private async notifyTeamMembers(
    recipients: string[],
    notification: Omit<TeamNotification, 'id' | 'recipientId' | 'createdAt'>
  ): Promise<void> {

    // Input validation
    if (!recipients || recipients.length === 0) {
      console.warn('No recipients provided for notification');
      return;
    }
    if (recipients.some(recipient => !recipient || recipient.trim().length === 0)) {
      throw new Error('All recipients must have valid identifiers');
    }
    if (!notification.title || notification.title.trim().length === 0) {
      throw new Error('Notification title is required');
    }
    if (!notification.message || notification.message.trim().length === 0) {
      throw new Error('Notification message is required');
    }
    if (notification.title.length > 500) {
      throw new Error('Notification title cannot exceed 500 characters');
    }
    if (notification.message.length > 10000) {
      throw new Error('Notification message cannot exceed 10,000 characters');
    }

    const notificationPromises = recipients.map(async (recipientId) => {
      try {
        const id = uuidv4();
        
        await this.db.query(`
          INSERT INTO team_notifications (
            id, recipient_id, type, title, message,
            investigation_id, task_id, comment_id,
            created_at, metadata
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
          id, recipientId, notification.type, notification.title, notification.message,
          notification.investigationId, notification.taskId, notification.commentId,
          new Date(), JSON.stringify(notification.metadata || {})
        ]);

        this.emit('notificationSent', {
          ...notification,
          id,
          recipientId,
          createdAt: new Date()
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Failed to send notification to ${recipientId}:`, {
          error: errorMessage,
          recipientId,
          notificationType: notification.type,
          timestamp: new Date().toISOString()
        });
        // Don't throw here to avoid failing the entire batch for one recipient
      }
    });

    try {
      await Promise.allSettled(notificationPromises);
    } catch (error) {
      console.error('Some notifications failed to send:', error);
      // Don't throw to avoid breaking the main operation
    }
  }

  /**
   * Generate custody chain signature
   */
  private generateCustodySignature(evidenceId: string, transferredTo: string, timestamp: Date): string {
    const crypto = require('crypto');
    const data = `${evidenceId}:${transferredTo}:${timestamp.getTime()}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Map database row to Investigation object
   */
  private mapDatabaseInvestigation(row: unknown): Investigation {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      category: row.category as InvestigationCategory,
      priority: row.priority as InvestigationPriority,
      status: row.status as InvestigationStatus,
      leadInvestigator: row.lead_investigator,
      assignedTeam: row.assigned_team || [],
      reportedBy: row.reported_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      dueDate: row.due_date,
      resolvedAt: row.resolved_at,
      relatedAuditLogIds: row.related_audit_log_ids || [],
      relatedIncidentIds: row.related_incident_ids || [],
      affectedSystems: row.affected_systems || [],
      affectedUsers: row.affected_users || [],
      confidentialityLevel: row.confidentiality_level,
      complianceFrameworks: row.compliance_frameworks || [],
      findings: row.findings,
      rootCause: row.root_cause,
      remediationActions: row.remediation_actions || [],
      lessonsLearned: row.lessons_learned,
      tags: row.tags || [],
      metadata: row.metadata || {}
    };
  }
}

export {
  InvestigationStatus,
  InvestigationPriority, 
  InvestigationCategory,
  TaskStatus,
  EvidenceType
};