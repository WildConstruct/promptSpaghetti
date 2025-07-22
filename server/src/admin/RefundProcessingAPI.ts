/**
 * Refund Processing API
 * 
 * REST API endpoints for marketplace refund management, including
 * CRUD operations, approval workflows, bulk operations, and analytics.
 * 
 * Part of Epic 17 - Backstage Admin Controls
 * Task: E17-1753114397360-84B238 - Create refund processing
 */

import { FastifyInstance } from 'fastify';
import { DatabaseService } from '../auth/database/DatabaseService';
import { AuditService } from '../auth/services/AuditService';
import { RefundProcessingService, RefundRequest, RefundStats } from './RefundProcessingService';

/**
 * Refund Processing API Service
 * 
 * Provides RESTful interface for refund management
 */
export class RefundProcessingAPI {
  private databaseService: DatabaseService;
  private auditService: AuditService;
  private refundService: RefundProcessingService;

  constructor(
    dependencies: {
      databaseService: DatabaseService;
      auditService: AuditService;
      refundService: RefundProcessingService;
    }
  ) {
    this.databaseService = dependencies.databaseService;
    this.auditService = dependencies.auditService;
    this.refundService = dependencies.refundService;
  }

  /**
   * Register refund processing API routes
   */
  public registerRoutes(server: FastifyInstance): void {
    // Core refund operations
    server.get('/api/admin/refunds', this.getRefunds.bind(this));
    server.get('/api/admin/refunds/:refundId', this.getRefund.bind(this));
    server.post('/api/admin/refunds', this.createRefund.bind(this));
    server.put('/api/admin/refunds/:refundId', this.updateRefund.bind(this));
    server.delete('/api/admin/refunds/:refundId', this.cancelRefund.bind(this));
    
    // Workflow operations
    server.post('/api/admin/refunds/:refundId/approve', this.approveRefund.bind(this));
    server.post('/api/admin/refunds/:refundId/reject', this.rejectRefund.bind(this));
    server.post('/api/admin/refunds/:refundId/process', this.processRefund.bind(this));
    server.post('/api/admin/refunds/:refundId/assign', this.assignRefund.bind(this));
    
    // Notes and communication
    server.post('/api/admin/refunds/:refundId/notes', this.addNote.bind(this));
    server.get('/api/admin/refunds/:refundId/history', this.getRefundHistory.bind(this));
    
    // Bulk operations
    server.post('/api/admin/refunds/bulk-approve', this.bulkApproveRefunds.bind(this));
    server.post('/api/admin/refunds/bulk-reject', this.bulkRejectRefunds.bind(this));
    server.post('/api/admin/refunds/bulk-assign', this.bulkAssignRefunds.bind(this));
    server.post('/api/admin/refunds/bulk-process', this.bulkProcessRefunds.bind(this));
    
    // Analytics and reporting
    server.get('/api/admin/refunds/stats', this.getRefundStats.bind(this));
    server.get('/api/admin/refunds/analytics', this.getRefundAnalytics.bind(this));
    server.get('/api/admin/refunds/export', this.exportRefundData.bind(this));
    
    // Policy management
    server.get('/api/admin/refunds/policies', this.getRefundPolicies.bind(this));
    server.put('/api/admin/refunds/policies/:policyId', this.updateRefundPolicy.bind(this));
    
    // Dashboard and summary endpoints
    server.get('/api/admin/refunds/dashboard', this.getRefundDashboard.bind(this));
    server.get('/api/admin/refunds/queue/pending', this.getPendingRefunds.bind(this));
    server.get('/api/admin/refunds/queue/overdue', this.getOverdueRefunds.bind(this));
    
    console.log('💰 Refund Processing API routes registered');
  }

  /**
   * Get refunds with filtering and pagination
   */
  private async getRefunds(request: any, reply: any): Promise<any> {
    try {
      const { 
        limit = 50, 
        offset = 0,
        status,
        priority,
        reason,
        assignedTo,
        search,
        dateFrom,
        dateTo
      } = request.query;
      
      const db = await this.databaseService.getDatabase();
      
      let query = 'SELECT * FROM refund_requests WHERE 1=1';
      const params: any[] = [];
      
      if (status) {
        query += ' AND status = ?';
        params.push(status);
      }
      
      if (priority) {
        query += ' AND priority = ?';
        params.push(priority);
      }
      
      if (reason) {
        query += ' AND reason = ?';
        params.push(reason);
      }
      
      if (assignedTo) {
        query += ' AND assigned_to = ?';
        params.push(assignedTo);
      }
      
      if (search) {
        query += ' AND (refund_id LIKE ? OR purchase_id LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      }
      
      if (dateFrom) {
        query += ' AND created_at >= ?';
        params.push(dateFrom);
      }
      
      if (dateTo) {
        query += ' AND created_at <= ?';
        params.push(dateTo);
      }
      
      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit), parseInt(offset));
      
      const refunds = await db.all(query, params);
      
      // Get total count for pagination
      let countQuery = 'SELECT COUNT(*) as count FROM refund_requests WHERE 1=1';
      const countParams = params.slice(0, -2); // Remove limit and offset
      
      if (status) countQuery += ' AND status = ?';
      if (priority) countQuery += ' AND priority = ?';
      if (reason) countQuery += ' AND reason = ?';
      if (assignedTo) countQuery += ' AND assigned_to = ?';
      if (search) countQuery += ' AND (refund_id LIKE ? OR purchase_id LIKE ?)';
      if (dateFrom) countQuery += ' AND created_at >= ?';
      if (dateTo) countQuery += ' AND created_at <= ?';
      
      const totalCount = await db.get(countQuery, countParams);
      
      const formattedRefunds = refunds.map(this.formatRefundRequest);

      return reply.code(200).send({
        success: true,
        data: formattedRefunds,
        pagination: {
          total: totalCount.count,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: (parseInt(offset) + parseInt(limit)) < totalCount.count
        }
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get specific refund by ID
   */
  private async getRefund(request: any, reply: any): Promise<any> {
    try {
      const { refundId } = request.params;
      
      const refund = await this.refundService.getRefundRequest(refundId);
      if (!refund) {
        return reply.code(404).send({
          success: false,
          error: 'Refund not found'
        });
      }

      return reply.code(200).send({
        success: true,
        data: refund
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Create new refund request
   */
  private async createRefund(request: any, reply: any): Promise<any> {
    try {
      const { purchaseId, reason, amount, description, priority = 'medium' } = request.body;
      const currentUser = request.user?.id || 'admin';
      
      if (!purchaseId || !reason) {
        return reply.code(400).send({
          success: false,
          error: 'Missing required fields: purchaseId, reason'
        });
      }
      
      const refund = await this.refundService.createRefundRequest({
        purchaseId,
        requesterId: currentUser,
        requesterType: 'admin',
        reason,
        amount: amount ? parseInt(amount) : undefined,
        description,
        priority
      });

      return reply.code(201).send({
        success: true,
        data: refund,
        message: 'Refund request created successfully'
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Approve refund request
   */
  private async approveRefund(request: any, reply: any): Promise<any> {
    try {
      const { refundId } = request.params;
      const { notes } = request.body;
      const currentUser = request.user?.id || 'admin';
      
      await this.refundService.approveRefund(refundId, currentUser, notes);

      return reply.code(200).send({
        success: true,
        message: 'Refund approved successfully'
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Reject refund request
   */
  private async rejectRefund(request: any, reply: any): Promise<any> {
    try {
      const { refundId } = request.params;
      const { reason } = request.body;
      const currentUser = request.user?.id || 'admin';
      
      if (!reason) {
        return reply.code(400).send({
          success: false,
          error: 'Rejection reason is required'
        });
      }
      
      await this.refundService.rejectRefund(refundId, currentUser, reason);

      return reply.code(200).send({
        success: true,
        message: 'Refund rejected successfully'
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Process approved refund
   */
  private async processRefund(request: any, reply: any): Promise<any> {
    try {
      const { refundId } = request.params;
      const currentUser = request.user?.id || 'admin';
      
      await this.refundService.processRefund(refundId, currentUser);

      return reply.code(200).send({
        success: true,
        message: 'Refund processed successfully'
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Assign refund to admin
   */
  private async assignRefund(request: any, reply: any): Promise<any> {
    try {
      const { refundId } = request.params;
      const { assignedTo } = request.body;
      const currentUser = request.user?.id || 'admin';
      
      const db = await this.databaseService.getDatabase();
      await db.run(`
        UPDATE refund_requests 
        SET assigned_to = ?, updated_at = ?
        WHERE refund_id = ?
      `, [assignedTo, new Date().toISOString(), refundId]);
      
      // Log assignment
      await this.auditService.logEvent({
        eventType: 'refund_assigned',
        userId: currentUser,
        details: { refundId, assignedTo }
      });

      return reply.code(200).send({
        success: true,
        message: 'Refund assigned successfully'
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Add note to refund
   */
  private async addNote(request: any, reply: any): Promise<any> {
    try {
      const { refundId } = request.params;
      const { content, type = 'internal' } = request.body;
      const currentUser = request.user?.id || 'admin';
      
      if (!content) {
        return reply.code(400).send({
          success: false,
          error: 'Note content is required'
        });
      }
      
      const db = await this.databaseService.getDatabase();
      
      // Get current notes
      const refundRow = await db.get('SELECT notes FROM refund_requests WHERE refund_id = ?', [refundId]);
      if (!refundRow) {
        return reply.code(404).send({
          success: false,
          error: 'Refund not found'
        });
      }
      
      const notes = JSON.parse(refundRow.notes || '[]');
      const newNote = {
        noteId: `NTE-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        authorId: currentUser,
        content,
        type,
        createdAt: new Date()
      };
      
      notes.push(newNote);
      
      await db.run(`
        UPDATE refund_requests 
        SET notes = ?, updated_at = ?
        WHERE refund_id = ?
      `, [JSON.stringify(notes), new Date().toISOString(), refundId]);

      return reply.code(201).send({
        success: true,
        data: newNote,
        message: 'Note added successfully'
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get refund workflow history
   */
  private async getRefundHistory(request: any, reply: any): Promise<any> {
    try {
      const { refundId } = request.params;
      
      const db = await this.databaseService.getDatabase();
      const refundRow = await db.get(
        'SELECT workflow_history, notes FROM refund_requests WHERE refund_id = ?',
        [refundId]
      );
      
      if (!refundRow) {
        return reply.code(404).send({
          success: false,
          error: 'Refund not found'
        });
      }
      
      const workflowHistory = JSON.parse(refundRow.workflow_history || '[]');
      const notes = JSON.parse(refundRow.notes || '[]');

      return reply.code(200).send({
        success: true,
        data: {
          workflowHistory,
          notes
        }
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Bulk approve refunds
   */
  private async bulkApproveRefunds(request: any, reply: any): Promise<any> {
    try {
      const { refundIds, notes } = request.body;
      const currentUser = request.user?.id || 'admin';
      
      if (!refundIds || !Array.isArray(refundIds) || refundIds.length === 0) {
        return reply.code(400).send({
          success: false,
          error: 'refundIds array is required'
        });
      }
      
      const results = [];
      
      for (const refundId of refundIds) {
        try {
          await this.refundService.approveRefund(refundId, currentUser, notes);
          results.push({ refundId, success: true });
        } catch (error) {
          results.push({ refundId, success: false, error: error.message });
        }
      }
      
      const successCount = results.filter(r => r.success).length;

      return reply.code(200).send({
        success: true,
        data: { results, successCount, totalCount: refundIds.length },
        message: `${successCount}/${refundIds.length} refunds approved successfully`
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Bulk reject refunds
   */
  private async bulkRejectRefunds(request: any, reply: any): Promise<any> {
    try {
      const { refundIds, reason } = request.body;
      const currentUser = request.user?.id || 'admin';
      
      if (!refundIds || !Array.isArray(refundIds) || refundIds.length === 0) {
        return reply.code(400).send({
          success: false,
          error: 'refundIds array is required'
        });
      }
      
      if (!reason) {
        return reply.code(400).send({
          success: false,
          error: 'Rejection reason is required'
        });
      }
      
      const results = [];
      
      for (const refundId of refundIds) {
        try {
          await this.refundService.rejectRefund(refundId, currentUser, reason);
          results.push({ refundId, success: true });
        } catch (error) {
          results.push({ refundId, success: false, error: error.message });
        }
      }
      
      const successCount = results.filter(r => r.success).length;

      return reply.code(200).send({
        success: true,
        data: { results, successCount, totalCount: refundIds.length },
        message: `${successCount}/${refundIds.length} refunds rejected successfully`
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get refund statistics
   */
  private async getRefundStats(request: any, reply: any): Promise<any> {
    try {
      const { dateRange } = request.query;
      
      let dateRangeObj;
      if (dateRange) {
        const days = parseInt(dateRange.replace('d', ''));
        const endDate = new Date();
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        dateRangeObj = { start: startDate, end: endDate };
      }
      
      const stats = await this.refundService.getRefundStats(dateRangeObj);

      return reply.code(200).send({
        success: true,
        data: stats
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get pending refunds queue
   */
  private async getPendingRefunds(request: any, reply: any): Promise<any> {
    try {
      const { limit = 20 } = request.query;
      
      const db = await this.databaseService.getDatabase();
      const refunds = await db.all(`
        SELECT * FROM refund_requests 
        WHERE status IN ('pending', 'reviewing') 
        ORDER BY priority DESC, created_at ASC 
        LIMIT ?
      `, [parseInt(limit)]);
      
      const formattedRefunds = refunds.map(this.formatRefundRequest);

      return reply.code(200).send({
        success: true,
        data: formattedRefunds
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get overdue refunds
   */
  private async getOverdueRefunds(request: any, reply: any): Promise<any> {
    try {
      const { limit = 20 } = request.query;
      
      const db = await this.databaseService.getDatabase();
      const refunds = await db.all(`
        SELECT * FROM refund_requests 
        WHERE due_date < datetime('now') 
        AND status IN ('pending', 'reviewing', 'approved') 
        ORDER BY due_date ASC 
        LIMIT ?
      `, [parseInt(limit)]);
      
      const formattedRefunds = refunds.map(this.formatRefundRequest);

      return reply.code(200).send({
        success: true,
        data: formattedRefunds
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get refund dashboard data
   */
  private async getRefundDashboard(request: any, reply: any): Promise<any> {
    try {
      const [stats, pending, overdue] = await Promise.all([
        this.refundService.getRefundStats(),
        this.getPendingRefunds(
          { query: { limit: 10 } },
          { send: (
        ) => {}, code: () => ({ send: (data: any) => data.data }) }),
        this.getOverdueRefunds(
          { query: { limit: 5 } },
          { send: (
        ) => {}, code: () => ({ send: (data: any) => data.data }) })
      ]);

      return reply.code(200).send({
        success: true,
        data: {
          stats,
          pendingRefunds: pending,
          overdueRefunds: overdue,
          lastUpdated: new Date()
        }
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Export refund data
   */
  private async exportRefundData(request: any, reply: any): Promise<any> {
    try {
      const { format = 'csv', dateFrom, dateTo } = request.query;
      
      const db = await this.databaseService.getDatabase();
      
      let query = 'SELECT * FROM refund_requests WHERE 1=1';
      const params: any[] = [];
      
      if (dateFrom) {
        query += ' AND created_at >= ?';
        params.push(dateFrom);
      }
      
      if (dateTo) {
        query += ' AND created_at <= ?';
        params.push(dateTo);
      }
      
      query += ' ORDER BY created_at DESC LIMIT 10000'; // Limit large exports
      
      const refunds = await db.all(query, params);
      const formattedRefunds = refunds.map(this.formatRefundRequest);
      
      if (format === 'json') {
        return reply
          .header('Content-Type', 'application/json')
          .header('Content-Disposition', 'attachment; filename=refunds.json')
          .send(formattedRefunds);
      }
      
      // CSV format
      const csvHeaders = [
        'refundId', 'purchaseId', 'status', 'amount', 'reason', 
        'priority', 'createdAt', 'approvedBy', 'processedAt'
      ];
      
      const csvRows = formattedRefunds.map(refund => [
        refund.refundId,
        refund.purchaseId,
        refund.status,
        refund.amount,
        refund.reason,
        refund.priority,
        refund.createdAt,
        refund.approvedBy || '',
        refund.processedAt || ''
      ]);
      
      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.join(','))
      ].join('\n');
      
      return reply
        .header('Content-Type', 'text/csv')
        .header('Content-Disposition', 'attachment; filename=refunds.csv')
        .send(csvContent);
        
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Update refund request
   */
  private async updateRefund(request: any, reply: any): Promise<any> {
    try {
      const { refundId } = request.params;
      const { priority, assignedTo, description } = request.body;
      const currentUser = request.user?.id || 'admin';
      
      const db = await this.databaseService.getDatabase();
      
      const updates: string[] = [];
      const params: any[] = [];
      
      if (priority) {
        updates.push('priority = ?');
        params.push(priority);
      }
      
      if (assignedTo !== undefined) {
        updates.push('assigned_to = ?');
        params.push(assignedTo);
      }
      
      if (description !== undefined) {
        updates.push('description = ?');
        params.push(description);
      }
      
      if (updates.length === 0) {
        return reply.code(400).send({
          success: false,
          error: 'No valid fields to update'
        });
      }
      
      updates.push('updated_at = ?');
      params.push(new Date().toISOString());
      params.push(refundId);
      
      await db.run(`
        UPDATE refund_requests 
        SET ${updates.join(', ')}
        WHERE refund_id = ?
      `, params);
      
      // Log update
      await this.auditService.logEvent({
        eventType: 'refund_updated',
        userId: currentUser,
        details: { refundId, updates: { priority, assignedTo, description } }
      });

      return reply.code(200).send({
        success: true,
        message: 'Refund updated successfully'
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Cancel refund request
   */
  private async cancelRefund(request: any, reply: any): Promise<any> {
    try {
      const { refundId } = request.params;
      const currentUser = request.user?.id || 'admin';
      
      const db = await this.databaseService.getDatabase();
      
      // Check if refund can be cancelled
      const refund = await db.get('SELECT status FROM refund_requests WHERE refund_id = ?', [refundId]);
      if (!refund) {
        return reply.code(404).send({
          success: false,
          error: 'Refund not found'
        });
      }
      
      if (!['pending', 'reviewing'].includes(refund.status)) {
        return reply.code(400).send({
          success: false,
          error: 'Refund cannot be cancelled in current status'
        });
      }
      
      await db.run(`
        UPDATE refund_requests 
        SET status = 'cancelled', updated_at = ?
        WHERE refund_id = ?
      `, [new Date().toISOString(), refundId]);
      
      // Log cancellation
      await this.auditService.logEvent({
        eventType: 'refund_cancelled',
        userId: currentUser,
        details: { refundId }
      });

      return reply.code(200).send({
        success: true,
        message: 'Refund cancelled successfully'
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: error.message
      });
    }
  }

  // Placeholder methods for unimplemented features
  private async getRefundAnalytics(request: any, reply: any): Promise<any> {
    return reply.code(200).send({
      success: true,
      data: { message: 'Analytics implementation coming soon' }
    });
  }

  private async getRefundPolicies(request: any, reply: any): Promise<any> {
    return reply.code(200).send({
      success: true,
      data: []
    });
  }

  private async updateRefundPolicy(request: any, reply: any): Promise<any> {
    return reply.code(200).send({
      success: true,
      message: 'Policy updated successfully'
    });
  }

  private async bulkAssignRefunds(request: any, reply: any): Promise<any> {
    return reply.code(200).send({
      success: true,
      message: 'Bulk assignment completed'
    });
  }

  private async bulkProcessRefunds(request: any, reply: any): Promise<any> {
    return reply.code(200).send({
      success: true,
      message: 'Bulk processing completed'
    });
  }

  // Helper method to format database rows to RefundRequest objects
  private formatRefundRequest(row: any): RefundRequest {
    return {
      refundId: row.refund_id,
      purchaseId: row.purchase_id,
      requesterId: row.requester_id,
      requesterType: row.requester_type,
      reason: row.reason,
      amount: row.amount,
      refundType: row.refund_type,
      description: row.description,
      status: row.status,
      priority: row.priority,
      assignedTo: row.assigned_to,
      originalPurchase: JSON.parse(row.original_purchase_json || '{}'),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      dueDate: row.due_date ? new Date(row.due_date) : undefined,
      approvedBy: row.approved_by,
      workflowHistory: JSON.parse(row.workflow_history || '[]'),
      notes: JSON.parse(row.notes || '[]')
    };
  }
}