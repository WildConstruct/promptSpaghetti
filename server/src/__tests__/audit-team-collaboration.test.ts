/**
 * Audit Team Collaboration Service Tests
 * 
 * Comprehensive tests for audit team collaboration functionality including
 * investigations, tasks, evidence collection, and team notifications.
 * 
 * Epic 19 Task T-1752989143998-618: Add audit team collaboration tools
 */

import { 
  AuditTeamCollaborationService,
  InvestigationStatus,
  InvestigationPriority,
  InvestigationCategory,
  TaskStatus,
  EvidenceType
} from '../services/AuditTeamCollaborationService';
import { AuditService } from '../auth/services/AuditService';
import { DatabaseService } from '../auth/database/DatabaseService';

// Mock database service
class MockDatabaseService {
  private tables: Record<string, any[]> = {
    investigations: [],
    investigation_tasks: [],
    evidence: [],
    custody_chain: [],
    investigation_comments: [],
    team_notifications: []
  };
  
  private queries: Array<{ query: string; params: any[] }> = [];

  async query(sql: string, params: any[] = []): Promise<{ rows: any[]; rowCount: number }> {
    this.queries.push({ query: sql, params });
    
    // Simple mock implementation for testing
    if (sql.includes('CREATE TABLE')) {
      return { rows: [], rowCount: 0 };
    }
    
    if (sql.includes('CREATE INDEX')) {
      return { rows: [], rowCount: 0 };
    }
    
    if (sql.includes('INSERT INTO investigations')) {
      const investigation = {
        id: params[0],
        title: params[1],
        description: params[2],
        category: params[3],
        priority: params[4],
        status: params[5],
        lead_investigator: params[6],
        assigned_team: params[7],
        reported_by: params[8],
        created_at: params[9],
        updated_at: params[10],
        due_date: params[11],
        related_audit_log_ids: params[12],
        related_incident_ids: params[13],
        affected_systems: params[14],
        affected_users: params[15],
        confidentiality_level: params[16],
        compliance_frameworks: params[17],
        tags: params[18],
        metadata: params[19]
      };
      this.tables.investigations.push(investigation);
      return { rows: [investigation], rowCount: 1 };
    }
    
    if (sql.includes('INSERT INTO investigation_tasks')) {
      const task = {
        id: params[0],
        investigation_id: params[1],
        title: params[2],
        description: params[3],
        assigned_to: params[4],
        status: params[5],
        priority: params[6],
        created_at: params[7],
        updated_at: params[8],
        due_date: params[9],
        dependencies: params[10],
        estimated_hours: params[11],
        metadata: params[12]
      };
      this.tables.investigation_tasks.push(task);
      return { rows: [task], rowCount: 1 };
    }
    
    if (sql.includes('INSERT INTO evidence')) {
      const evidence = {
        id: params[0],
        investigation_id: params[1],
        task_id: params[2],
        title: params[3],
        description: params[4],
        type: params[5],
        file_name: params[6],
        file_size: params[7],
        file_path: params[8],
        file_hash: params[9],
        collected_by: params[10],
        collected_at: params[11],
        source: params[12],
        content: params[13],
        confidentiality_level: params[14],
        metadata: params[15]
      };
      this.tables.evidence.push(evidence);
      return { rows: [evidence], rowCount: 1 };
    }
    
    if (sql.includes('INSERT INTO custody_chain')) {
      const custody = {
        id: params[0],
        evidence_id: params[1],
        transferred_to: params[2],
        transferred_at: params[3],
        reason: params[4],
        signature: params[5]
      };
      this.tables.custody_chain.push(custody);
      return { rows: [custody], rowCount: 1 };
    }
    
    if (sql.includes('INSERT INTO investigation_comments')) {
      const comment = {
        id: params[0],
        investigation_id: params[1],
        task_id: params[2],
        author: params[3],
        content: params[4],
        comment_type: params[5],
        created_at: params[6],
        mentions: params[7],
        attachments: params[8],
        metadata: params[9]
      };
      this.tables.investigation_comments.push(comment);
      return { rows: [comment], rowCount: 1 };
    }
    
    if (sql.includes('INSERT INTO team_notifications')) {
      const notification = {
        id: params[0],
        recipient_id: params[1],
        type: params[2],
        title: params[3],
        message: params[4],
        investigation_id: params[5],
        task_id: params[6],
        comment_id: params[7],
        created_at: params[8],
        metadata: params[9]
      };
      this.tables.team_notifications.push(notification);
      return { rows: [notification], rowCount: 1 };
    }
    
    if (sql.includes('SELECT * FROM investigations WHERE id =')) {
      const investigation = this.tables.investigations.find(i => i.id === params[0]);
      return { rows: investigation ? [investigation] : [], rowCount: investigation ? 1 : 0 };
    }
    
    if (sql.includes('SELECT * FROM investigations') && sql.includes('ORDER BY created_at DESC')) {
      const investigations = [...this.tables.investigations];
      const limit = params[params.length - 2];
      const offset = params[params.length - 1];
      return { 
        rows: investigations.slice(offset, offset + limit), 
        rowCount: investigations.slice(offset, offset + limit).length 
      };
    }
    
    if (sql.includes('SELECT COUNT(*) as total FROM investigations')) {
      return { rows: [{ total: this.tables.investigations.length }], rowCount: 1 };
    }
    
    // Mock metrics queries
    if (sql.includes('COUNT(*) as total') && sql.includes('open_count')) {
      return { 
        rows: [{ 
          total: this.tables.investigations.length,
          open_count: this.tables.investigations.filter(i => 
            ['OPEN', 'IN_PROGRESS', 'AWAITING_REVIEW'].includes(i.status)
          ).length
        }], 
        rowCount: 1 
      };
    }
    
    if (sql.includes('overdue_count')) {
      return { rows: [{ overdue_count: 0 }], rowCount: 1 };
    }
    
    if (sql.includes('assigned_to') && sql.includes('task_count')) {
      return { rows: [], rowCount: 0 };
    }
    
    if (sql.includes('evidence_count')) {
      return { rows: [{ evidence_count: this.tables.evidence.length }], rowCount: 1 };
    }
    
    if (sql.includes('avg_resolution_seconds')) {
      return { rows: [{ avg_resolution_seconds: 86400 }], rowCount: 1 }; // 1 day
    }
    
    if (sql.includes('UPDATE investigations')) {
      return { rows: [], rowCount: 1 };
    }
    
    return { rows: [], rowCount: 0 };
  }

  getQueries() {
    return this.queries;
  }

  clearQueries() {
    this.queries = [];
  }

  getTables() {
    return this.tables;
  }

  clearTables() {
    Object.keys(this.tables).forEach(key => {
      this.tables[key] = [];
    });
  }
}

// Mock audit service
class MockAuditService {
  private events: any[] = [];

  async logEvent(event: unknown): Promise<void> {
    this.events.push(event);
  }

  getEvents() {
    return this.events;
  }

  clearEvents() {
    this.events = [];
  }
}

describe('AuditTeamCollaborationService', () => {
  let service: AuditTeamCollaborationService;
  let mockDb: MockDatabaseService;
  let mockAudit: MockAuditService;

  beforeEach(() => {
    mockDb = new MockDatabaseService();
    mockAudit = new MockAuditService();
    service = new AuditTeamCollaborationService(
      mockDb as any,
      mockAudit as any
    );
  });

  afterEach(() => {
    mockDb.clearQueries();
    mockDb.clearTables();
    mockAudit.clearEvents();
  });

  describe('Schema Initialization', () => {
    it('should initialize database schema without errors', async () => {
      await expect(service.initializeSchema()).resolves.not.toThrow();
      
      const queries = mockDb.getQueries();
      expect(queries).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            query: expect.stringContaining('CREATE TABLE IF NOT EXISTS investigations')
          }),
          expect.objectContaining({
            query: expect.stringContaining('CREATE TABLE IF NOT EXISTS investigation_tasks')
          }),
          expect.objectContaining({
            query: expect.stringContaining('CREATE TABLE IF NOT EXISTS evidence')
          })
        ])
      );
    });
  });

  describe('Investigation Management', () => {
    beforeEach(async () => {
      await service.initializeSchema();
      mockDb.clearQueries();
    });

    it('should create a new investigation successfully', async () => {
      const investigationData = {
        title: 'Security Incident Investigation',
        description: 'Investigating unauthorized access attempt',
        category: InvestigationCategory.SECURITY_INCIDENT,
        priority: InvestigationPriority.HIGH,
        leadInvestigator: 'lead@example.com',
        assignedTeam: ['analyst1@example.com', 'analyst2@example.com'],
        reportedBy: 'reporter@example.com',
        relatedAuditLogIds: ['log1', 'log2'],
        relatedIncidentIds: [],
        affectedSystems: ['web-server-1', 'database-1'],
        affectedUsers: ['user1', 'user2'],
        confidentialityLevel: 'CONFIDENTIAL' as const,
        complianceFrameworks: ['SOC2', 'ISO27001'],
        tags: ['security', 'urgent'],
        metadata: { source: 'monitoring_system' }
      };

      const investigation = await service.createInvestigation(investigationData);

      expect(investigation).toMatchObject({
        title: investigationData.title,
        category: investigationData.category,
        priority: investigationData.priority,
        status: InvestigationStatus.OPEN
      });
      expect(investigation.id).toBeDefined();
      expect(investigation.createdAt).toBeInstanceOf(Date);

      // Verify audit log
      const auditEvents = mockAudit.getEvents();
      expect(auditEvents).toHaveLength(1);
      expect(auditEvents[0]).toMatchObject({
        action: 'investigation_created',
        resourceType: 'investigation',
        resourceId: investigation.id
      });
    });

    it('should update investigation status and details', async () => {
      // Create investigation first
      const investigationData = {
        title: 'Test Investigation',
        category: InvestigationCategory.COMPLIANCE_VIOLATION,
        priority: InvestigationPriority.MEDIUM,
        leadInvestigator: 'lead@example.com',
        assignedTeam: ['analyst@example.com'],
        reportedBy: 'reporter@example.com',
        relatedAuditLogIds: [],
        relatedIncidentIds: [],
        affectedSystems: [],
        affectedUsers: [],
        confidentialityLevel: 'INTERNAL' as const,
        complianceFrameworks: [],
        tags: [],
        metadata: {}
      };

      const investigation = await service.createInvestigation(investigationData);
      mockAudit.clearEvents();

      // Update investigation
      const updates = {
        status: InvestigationStatus.IN_PROGRESS,
        findings: 'Initial findings suggest policy violation',
        rootCause: 'Insufficient access controls'
      };

      await service.updateInvestigation(investigation.id, updates, 'updater@example.com');

      // Verify audit log for update
      const auditEvents = mockAudit.getEvents();
      expect(auditEvents).toHaveLength(1);
      expect(auditEvents[0]).toMatchObject({
        action: 'investigation_updated',
        resourceType: 'investigation',
        resourceId: investigation.id
      });
    });

    it('should retrieve investigation by ID', async () => {
      const investigationData = {
        title: 'Test Investigation',
        category: InvestigationCategory.DATA_BREACH,
        priority: InvestigationPriority.CRITICAL,
        leadInvestigator: 'lead@example.com',
        assignedTeam: [],
        reportedBy: 'reporter@example.com',
        relatedAuditLogIds: [],
        relatedIncidentIds: [],
        affectedSystems: [],
        affectedUsers: [],
        confidentialityLevel: 'RESTRICTED' as const,
        complianceFrameworks: [],
        tags: [],
        metadata: {}
      };

      const created = await service.createInvestigation(investigationData);
      const retrieved = await service.getInvestigation(created.id);

      expect(retrieved).toMatchObject({
        id: created.id,
        title: investigationData.title,
        category: investigationData.category,
        priority: investigationData.priority
      });
    });

    it('should return null for non-existent investigation', async () => {
      const result = await service.getInvestigation('non-existent-id');
      expect(result).toBeNull();
    });

    it('should get investigations with filtering', async () => {
      // Create multiple investigations
      const investigations = [
        {
          title: 'Security Investigation 1',
          category: InvestigationCategory.SECURITY_INCIDENT,
          priority: InvestigationPriority.HIGH,
          leadInvestigator: 'lead@example.com',
          assignedTeam: ['analyst1@example.com'],
          reportedBy: 'reporter@example.com',
          relatedAuditLogIds: [],
          relatedIncidentIds: [],
          affectedSystems: [],
          affectedUsers: [],
          confidentialityLevel: 'INTERNAL' as const,
          complianceFrameworks: [],
          tags: [],
          metadata: {}
        },
        {
          title: 'Compliance Investigation 1',
          category: InvestigationCategory.COMPLIANCE_VIOLATION,
          priority: InvestigationPriority.MEDIUM,
          leadInvestigator: 'lead@example.com',
          assignedTeam: ['analyst2@example.com'],
          reportedBy: 'reporter@example.com',
          relatedAuditLogIds: [],
          relatedIncidentIds: [],
          affectedSystems: [],
          affectedUsers: [],
          confidentialityLevel: 'INTERNAL' as const,
          complianceFrameworks: [],
          tags: [],
          metadata: {}
        }
      ];

      for (const inv of investigations) {
        await service.createInvestigation(inv);
      }

      const result = await service.getInvestigations({
        category: InvestigationCategory.SECURITY_INCIDENT,
        limit: 10,
        offset: 0
      });

      expect(result.investigations).toHaveLength(1);
      expect(result.total).toBe(2);
    });
  });

  describe('Task Management', () => {
    let investigationId: string;

    beforeEach(async () => {
      await service.initializeSchema();
      
      // Create investigation for tasks
      const investigation = await service.createInvestigation({
        title: 'Test Investigation',
        category: InvestigationCategory.SECURITY_INCIDENT,
        priority: InvestigationPriority.MEDIUM,
        leadInvestigator: 'lead@example.com',
        assignedTeam: [],
        reportedBy: 'reporter@example.com',
        relatedAuditLogIds: [],
        relatedIncidentIds: [],
        affectedSystems: [],
        affectedUsers: [],
        confidentialityLevel: 'INTERNAL' as const,
        complianceFrameworks: [],
        tags: [],
        metadata: {}
      });
      
      investigationId = investigation.id;
      mockDb.clearQueries();
    });

    it('should create a task successfully', async () => {
      const taskData = {
        investigationId,
        title: 'Analyze log files',
        description: 'Review security logs for suspicious activity',
        assignedTo: 'analyst@example.com',
        priority: InvestigationPriority.HIGH,
        estimatedHours: 8,
        dependencies: [],
        metadata: { skillsRequired: ['log_analysis'] }
      };

      const task = await service.createTask(taskData);

      expect(task).toMatchObject({
        title: taskData.title,
        investigationId: taskData.investigationId,
        assignedTo: taskData.assignedTo,
        status: TaskStatus.PENDING
      });
      expect(task.id).toBeDefined();
      expect(task.createdAt).toBeInstanceOf(Date);
    });

    it('should handle task with dependencies', async () => {
      // Create first task
      const task1 = await service.createTask({
        investigationId,
        title: 'Collect evidence',
        assignedTo: 'analyst1@example.com',
        priority: InvestigationPriority.HIGH,
        dependencies: [],
        metadata: {}
      });

      // Create dependent task
      const task2 = await service.createTask({
        investigationId,
        title: 'Analyze evidence',
        assignedTo: 'analyst2@example.com',
        priority: InvestigationPriority.MEDIUM,
        dependencies: [task1.id],
        metadata: {}
      });

      expect(task2.dependencies).toContain(task1.id);
    });
  });

  describe('Evidence Management', () => {
    let investigationId: string;

    beforeEach(async () => {
      await service.initializeSchema();
      
      const investigation = await service.createInvestigation({
        title: 'Evidence Investigation',
        category: InvestigationCategory.DATA_BREACH,
        priority: InvestigationPriority.CRITICAL,
        leadInvestigator: 'lead@example.com',
        assignedTeam: [],
        reportedBy: 'reporter@example.com',
        relatedAuditLogIds: [],
        relatedIncidentIds: [],
        affectedSystems: [],
        affectedUsers: [],
        confidentialityLevel: 'RESTRICTED' as const,
        complianceFrameworks: [],
        tags: [],
        metadata: {}
      });
      
      investigationId = investigation.id;
      mockDb.clearQueries();
    });

    it('should add evidence with custody chain', async () => {
      const evidenceData = {
        investigationId,
        title: 'Server Access Logs',
        description: 'Access logs from compromised server',
        type: EvidenceType.LOG_FILE,
        fileName: 'access.log',
        fileSize: 1024000,
        filePath: '/evidence/access.log',
        fileHash: 'sha256:abc123...',
        source: 'web-server-1',
        content: 'log file content...',
        confidentialityLevel: 'CONFIDENTIAL' as const,
        metadata: { server: 'web-server-1', timeRange: '2024-01-01 to 2024-01-02' }
      };

      const evidence = await service.addEvidence(evidenceData);

      expect(evidence).toMatchObject({
        title: evidenceData.title,
        type: evidenceData.type,
        investigationId: evidenceData.investigationId
      });
      expect(evidence.id).toBeDefined();
      expect(evidence.custodyChain).toHaveLength(1);
      expect(evidence.custodyChain[0]).toMatchObject({
        evidenceId: evidence.id,
        reason: 'Initial collection'
      });
    });

    it('should handle different evidence types', async () => {
      const evidenceTypes = [
        {
          type: EvidenceType.SCREENSHOT,
          title: 'Error Screenshot',
          fileName: 'error.png'
        },
        {
          type: EvidenceType.DATABASE_QUERY,
          title: 'User Query Results',
          content: 'SELECT * FROM users WHERE...'
        },
        {
          type: EvidenceType.EMAIL,
          title: 'Incident Report Email',
          content: 'Email content...'
        }
      ];

      for (const evidenceType of evidenceTypes) {
        const evidence = await service.addEvidence({
          investigationId,
          ...evidenceType,
          source: 'test-source',
          confidentialityLevel: 'INTERNAL' as const,
          metadata: {}
        });

        expect(evidence.type).toBe(evidenceType.type);
        expect(evidence.custodyChain).toHaveLength(1);
      }
    });
  });

  describe('Comments and Communication', () => {
    let investigationId: string;

    beforeEach(async () => {
      await service.initializeSchema();
      
      const investigation = await service.createInvestigation({
        title: 'Comment Investigation',
        category: InvestigationCategory.POLICY_VIOLATION,
        priority: InvestigationPriority.LOW,
        leadInvestigator: 'lead@example.com',
        assignedTeam: ['analyst@example.com'],
        reportedBy: 'reporter@example.com',
        relatedAuditLogIds: [],
        relatedIncidentIds: [],
        affectedSystems: [],
        affectedUsers: [],
        confidentialityLevel: 'INTERNAL' as const,
        complianceFrameworks: [],
        tags: [],
        metadata: {}
      });
      
      investigationId = investigation.id;
      mockDb.clearQueries();
    });

    it('should add comment to investigation', async () => {
      const commentData = {
        investigationId,
        author: 'analyst@example.com',
        content: 'Initial analysis complete. Found several policy violations.',
        commentType: 'FINDING' as const,
        mentions: ['lead@example.com'],
        attachments: [],
        metadata: { analysisType: 'initial' }
      };

      await service.addComment(commentData);

      const queries = mockDb.getQueries();
      const insertQuery = queries.find(q => q.query.includes('INSERT INTO investigation_comments'));
      expect(insertQuery).toBeDefined();
      expect(insertQuery?.params).toEqual(expect.arrayContaining([
        expect.any(String), // id
        investigationId,
        commentData.taskId || null,
        commentData.author,
        commentData.content,
        commentData.commentType
      ]));
    });

    it('should handle mentions in comments', async () => {
      const commentData = {
        investigationId,
        author: 'analyst@example.com',
        content: 'Need input from @lead@example.com and @expert@example.com',
        mentions: ['lead@example.com', 'expert@example.com'],
        attachments: [],
        metadata: {}
      };

      await service.addComment(commentData);

      // Check that notifications were created for mentions
      const tables = mockDb.getTables();
      expect(tables.team_notifications).toHaveLength(2);
      expect(tables.team_notifications[0]).toMatchObject({
        recipient_id: 'lead@example.com',
        type: 'MENTION'
      });
      expect(tables.team_notifications[1]).toMatchObject({
        recipient_id: 'expert@example.com',
        type: 'MENTION'
      });
    });
  });

  describe('Collaboration Metrics', () => {
    beforeEach(async () => {
      await service.initializeSchema();
      mockDb.clearQueries();
    });

    it('should calculate collaboration metrics', async () => {
      const metrics = await service.getCollaborationMetrics('week');

      expect(metrics).toMatchObject({
        investigationCount: expect.any(Number),
        openInvestigations: expect.any(Number),
        overdueTasks: expect.any(Number),
        averageResolutionTime: expect.any(Number),
        teamWorkload: expect.any(Object),
        evidenceCollected: expect.any(Number),
        complianceIssues: expect.any(Number)
      });
    });

    it('should handle different timeframes', async () => {
      const timeframes: Array<'day' | 'week' | 'month'> = ['day', 'week', 'month'];
      
      for (const timeframe of timeframes) {
        const metrics = await service.getCollaborationMetrics(timeframe);
        expect(metrics).toBeDefined();
        expect(typeof metrics.investigationCount).toBe('number');
      }
    });
  });

  describe('Event Emission', () => {
    beforeEach(async () => {
      await service.initializeSchema();
    });

    it('should emit events for investigation lifecycle', (done) => {
      const events: string[] = [];
      
      service.on('investigationCreated', () => events.push('created'));
      service.on('investigationUpdated', () => events.push('updated'));
      service.on('taskCreated', () => events.push('taskCreated'));
      service.on('evidenceAdded', () => events.push('evidenceAdded'));
      service.on('commentAdded', () => events.push('commentAdded'));

      // Test investigation creation
      service.createInvestigation({
        title: 'Event Test Investigation',
        category: InvestigationCategory.SECURITY_INCIDENT,
        priority: InvestigationPriority.MEDIUM,
        leadInvestigator: 'lead@example.com',
        assignedTeam: [],
        reportedBy: 'reporter@example.com',
        relatedAuditLogIds: [],
        relatedIncidentIds: [],
        affectedSystems: [],
        affectedUsers: [],
        confidentialityLevel: 'INTERNAL' as const,
        complianceFrameworks: [],
        tags: [],
        metadata: {}
      }).then(() => {
        expect(events).toContain('created');
        done();
      }).catch(done);
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // Create a service with a failing database
      const failingDb = {
        query: jest.fn<unknown[], unknown>().mockRejectedValue(new Error('Database connection failed'))
      };
      
      const errorService = new AuditTeamCollaborationService(
        failingDb as any,
        mockAudit as any
      );

      await expect(errorService.createInvestigation({
        title: 'Test',
        category: InvestigationCategory.SECURITY_INCIDENT,
        priority: InvestigationPriority.MEDIUM,
        leadInvestigator: 'lead@example.com',
        assignedTeam: [],
        reportedBy: 'reporter@example.com',
        relatedAuditLogIds: [],
        relatedIncidentIds: [],
        affectedSystems: [],
        affectedUsers: [],
        confidentialityLevel: 'INTERNAL' as const,
        complianceFrameworks: [],
        tags: [],
        metadata: {}
      })).rejects.toThrow('Database connection failed');
    });
  });

  describe('Data Validation', () => {
    beforeEach(async () => {
      await service.initializeSchema();
    });

    it('should handle valid investigation data', async () => {
      const validData = {
        title: 'Valid Investigation',
        category: InvestigationCategory.SECURITY_INCIDENT,
        priority: InvestigationPriority.HIGH,
        leadInvestigator: 'lead@example.com',
        assignedTeam: ['analyst1@example.com', 'analyst2@example.com'],
        reportedBy: 'reporter@example.com',
        dueDate: new Date(Date.now() + 86400000), // Tomorrow
        relatedAuditLogIds: ['log1', 'log2'],
        relatedIncidentIds: ['incident1'],
        affectedSystems: ['system1', 'system2'],
        affectedUsers: ['user1', 'user2'],
        confidentialityLevel: 'CONFIDENTIAL' as const,
        complianceFrameworks: ['SOC2', 'GDPR'],
        tags: ['urgent', 'security'],
        metadata: { priority_reason: 'customer_impact' }
      };

      const investigation = await service.createInvestigation(validData);
      expect(investigation.title).toBe(validData.title);
      expect(investigation.assignedTeam).toEqual(validData.assignedTeam);
    });
  });
});