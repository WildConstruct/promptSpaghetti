/**
 * Refund Processing Service
 * 
 * Core business logic for processing marketplace refunds, including
 * Stripe integration, workflow management, creator impact handling,
 * and comprehensive audit trails.
 * 
 * Part of Epic 17 - Backstage Admin Controls
 * Task: E17-1753114397360-84B238 - Create refund processing
 */

import { DatabaseService } from '../auth/database/DatabaseService';
import { AuditService } from '../auth/services/AuditService';
import { FinancialDataLifecycleService } from '../financial/FinancialDataLifecycleService';



export interface RefundRequest {
  refundId: string;
  purchaseId: string;
  requesterId: string;
  requesterType: 'customer' | 'admin' | 'system';
  
  // Refund details
  reason: RefundReason;
  amount: number; // Amount in cents
  refundType: 'full' | 'partial';
  description?: string;
  
  // Status and workflow
  status: RefundStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  
  // Business context
  originalPurchase: {
    purchaseId: string;
    customerId: string;
    creatorId: string;
    templateId: string;
    originalAmount: number;
    purchaseDate: Date;
    stripePaymentIntentId?: string;



  };
  
  // Processing details
  approvalRequired: boolean;
  approvedBy?: string;
  approvedAt?: Date;
  processedAt?: Date;
  stripeRefundId?: string;
  
  // Creator impact
  creatorAdjustment: {
    required: boolean;
    amount?: number; // Amount to deduct from creator
    escrowImpacted: boolean;
    creatorNotified: boolean;
  };
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  escalatedAt?: Date;
  
  // Audit trail
  workflowHistory: RefundWorkflowStep[];
  notes: RefundNote[];


export enum RefundReason {
  NOT_AS_DESCRIBED = 'not_as_described',
  CLAUDE_INCOMPAT = 'claude_incompat',
  CLAUDE_HALLUCINATION = 'claude_hallucination',
  TECHNICAL_ISSUE = 'technical_issue',
  DUPLICATE_PURCHASE = 'duplicate_purchase',
  FRAUDULENT = 'fraudulent',
  POLICY_VIOLATION = 'policy_violation',
  QUALITY_ISSUE = 'quality_issue',
  OTHER = 'other'


export enum RefundStatus {
  PENDING = 'pending',
  REVIEWING = 'reviewing',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'




export interface RefundWorkflowStep {
  stepId: string;
  action: 'created' | 'assigned' | 'reviewed' | 'approved' | 'rejected' | 'processed' | 'completed';
  performedBy: string;
  performedAt: Date;
  notes?: string;
  previousStatus?: RefundStatus;
  newStatus: RefundStatus;







export interface RefundNote {
  noteId: string;
  authorId: string;
  content: string;
  type: 'internal' | 'customer_facing' | 'creator_notification';
  createdAt: Date;







export interface RefundPolicy {
  policyId: string;
  name: string;
  enabled: boolean;
  
  // Eligibility rules
  timeLimit: number; // Hours after purchase
  minAmount: number;
  maxAmount: number;
  
  // Auto-approval rules
  autoApproveThreshold: number;
  requireManagerApproval: boolean;
  
  // Restrictions
  maxRefundsPerCustomer: number;
  maxRefundsPerTemplate: number;
  blockedReasons: RefundReason[];
  
  // Creator impact rules
  creatorLiabilityPercent: number; // 0-100
  escrowHoldPeriod: number; // Hours







export interface RefundStats {
  totalRequests: number;
  pendingRequests: number;
  approvedToday: number;
  totalRefunded: number;
  averageProcessingTime: number;
  
  byReason: Record<RefundReason, number>;
  byStatus: Record<RefundStatus, number>;
  
  creatorImpact: {
    creatorsAffected: number;
    totalCreatorDeductions: number;
    avgDeductionAmount: number;



  };
  
  performance: {
    approvalRate: number;
    avgResolutionTime: number;
    escalationRate: number;
    customerSatisfaction: number;
  };


/**
 * Refund Processing Service
 * 
 * Manages the complete lifecycle of marketplace refunds
 */
export class RefundProcessingService {
  private databaseService: DatabaseService;
  private auditService: AuditService;
  private financialService: FinancialDataLifecycleService;
  private policies: Map<string, RefundPolicy> = new Map();

  constructor(
    dependencies: {
      databaseService: DatabaseService;
      auditService: AuditService;
      financialService: FinancialDataLifecycleService;
    }
  ) {
    this.databaseService = dependencies.databaseService;
    this.auditService = dependencies.auditService;
    this.financialService = dependencies.financialService;


  /**
   * Initialize refund processing service
   */
  public async initialize(): Promise<void> {

    console.log('💰 Initializing Refund Processing Service...');
    
    // Load refund policies
    await this.loadRefundPolicies();
    
    // Set up periodic tasks
    this.setupPeriodicTasks();
    
    console.log('✅ Refund Processing Service initialized');


  /**
   * Create a new refund request
   */
  public async createRefundRequest(request: {
    purchaseId: string;
    requesterId: string;
    requesterType: 'customer' | 'admin' | 'system';
    reason: RefundReason;
    amount?: number;
    description?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
  }): Promise<RefundRequest> {

    console.log(`💸 Creating refund request for purchase: ${request.purchaseId}`);
    
    // Get original purchase details
    const purchase = await this.getPurchaseDetails(request.purchaseId);
    if (!purchase) {
      throw new Error(`Purchase not found: ${request.purchaseId}`);

    
    // Validate refund eligibility
    await this.validateRefundEligibility(purchase, request);
    
    // Determine refund amount
    const refundAmount = request.amount || purchase.originalAmount;
    const refundType = refundAmount === purchase.originalAmount ? 'full' : 'partial';
    
    // Check if auto-approval applies
    const policy = await this.getApplicablePolicy(purchase, request);
    const approvalRequired = this.requiresApproval(refundAmount, policy, request);
    
    // Create refund request
    const refundRequest: RefundRequest = {
      refundId: this.generateRefundId(),
      purchaseId: request.purchaseId,
      requesterId: request.requesterId,
      requesterType: request.requesterType,
      reason: request.reason,
      amount: refundAmount,
      refundType,
      description: request.description,
      status: approvalRequired ? RefundStatus.PENDING : RefundStatus.APPROVED,
      priority: request.priority || 'medium',
      originalPurchase: {
        purchaseId: purchase.purchaseId,
        customerId: purchase.customerId,
        creatorId: purchase.creatorId,
        templateId: purchase.templateId,
        originalAmount: purchase.originalAmount,
        purchaseDate: purchase.purchaseDate,
        stripePaymentIntentId: purchase.stripePaymentIntentId

      approvalRequired,
      creatorAdjustment: this.calculateCreatorImpact(purchase, refundAmount, policy),
      createdAt: new Date(),
      updatedAt: new Date(),
      dueDate: this.calculateDueDate(request.priority || 'medium'),
      workflowHistory: [{
        stepId: this.generateStepId(),
        action: 'created',
        performedBy: request.requesterId,
        performedAt: new Date(),
        newStatus: approvalRequired ? RefundStatus.PENDING : RefundStatus.APPROVED,
        notes: request.description
],
      notes: []
    };
    
    // Store refund request
    await this.storeRefundRequest(refundRequest);
    
    // If auto-approved, process immediately
    if (!approvalRequired) {
      await this.processRefund(refundRequest.refundId, 'system');

    
    // Log audit event
    await this.auditService.logEvent({
      eventType: 'refund_request_created',
      userId: request.requesterId,
      details: {
        refundId: refundRequest.refundId,
        purchaseId: request.purchaseId,
        amount: refundAmount,
        reason: request.reason,
        autoApproved: !approvalRequired

    });
    
    console.log(`✅ Refund request created: ${refundRequest.refundId} (${approvalRequired ? 'pending approval' : 'auto-approved'})`);
    
    return refundRequest;


  /**
   * Approve a refund request
   */
  public async approveRefund(refundId: string, approverId: string, notes?: string): Promise<void> {

    console.log(`✅ Approving refund: ${refundId}`);
    
    const refundRequest = await this.getRefundRequest(refundId);
    if (!refundRequest) {
      throw new Error(`Refund request not found: ${refundId}`);

    
    if (refundRequest.status !== RefundStatus.PENDING && refundRequest.status !== RefundStatus.REVIEWING) {
      throw new Error(`Refund cannot be approved in current status: ${refundRequest.status}`);

    
    // Update refund request
    refundRequest.status = RefundStatus.APPROVED;
    refundRequest.approvedBy = approverId;
    refundRequest.approvedAt = new Date();
    refundRequest.updatedAt = new Date();
    
    // Add workflow step
    refundRequest.workflowHistory.push({
      stepId: this.generateStepId(),
      action: 'approved',
      performedBy: approverId,
      performedAt: new Date(),
      previousStatus: RefundStatus.PENDING,
      newStatus: RefundStatus.APPROVED,
      notes
    });
    
    if (notes) {
      refundRequest.notes.push({
        noteId: this.generateNoteId(),
        authorId: approverId,
        content: notes,
        type: 'internal',
        createdAt: new Date()
      });

    
    // Update in database
    await this.updateRefundRequest(refundRequest);
    
    // Process the refund
    await this.processRefund(refundId, approverId);
    
    // Log audit event
    await this.auditService.logEvent({
      eventType: 'refund_approved',
      userId: approverId,
      details: { refundId, notes }
    });


  /**
   * Reject a refund request
   */
  public async rejectRefund(refundId: string, rejectedBy: string, reason: string): Promise<void> {

    console.log(`❌ Rejecting refund: ${refundId}`);
    
    const refundRequest = await this.getRefundRequest(refundId);
    if (!refundRequest) {
      throw new Error(`Refund request not found: ${refundId}`);

    
    if (refundRequest.status !== RefundStatus.PENDING && refundRequest.status !== RefundStatus.REVIEWING) {
      throw new Error(`Refund cannot be rejected in current status: ${refundRequest.status}`);

    
    // Update refund request
    refundRequest.status = RefundStatus.REJECTED;
    refundRequest.updatedAt = new Date();
    
    // Add workflow step
    refundRequest.workflowHistory.push({
      stepId: this.generateStepId(),
      action: 'rejected',
      performedBy: rejectedBy,
      performedAt: new Date(),
      previousStatus: RefundStatus.PENDING,
      newStatus: RefundStatus.REJECTED,
      notes: reason
    });
    
    // Add rejection note
    refundRequest.notes.push({
      noteId: this.generateNoteId(),
      authorId: rejectedBy,
      content: reason,
      type: 'internal',
      createdAt: new Date()
    });
    
    // Update in database
    await this.updateRefundRequest(refundRequest);
    
    // Notify customer
    await this.notifyCustomerRefundRejected(refundRequest, reason);
    
    // Log audit event
    await this.auditService.logEvent({
      eventType: 'refund_rejected',
      userId: rejectedBy,
      details: { refundId, reason }
    });


  /**
   * Process approved refund (execute via Stripe)
   */
  public async processRefund(refundId: string, processedBy: string): Promise<void> {

    console.log(`🔄 Processing refund: ${refundId}`);
    
    const refundRequest = await this.getRefundRequest(refundId);
    if (!refundRequest) {
      throw new Error(`Refund request not found: ${refundId}`);

    
    if (refundRequest.status !== RefundStatus.APPROVED) {
      throw new Error(`Refund must be approved before processing: ${refundRequest.status}`);

    
    try {
      // Update status to processing
      refundRequest.status = RefundStatus.PROCESSING;
      refundRequest.updatedAt = new Date();
      await this.updateRefundRequest(refundRequest);
      
      // Execute Stripe refund
      const stripeRefund = await this.executeStripeRefund(
        refundRequest.originalPurchase.stripePaymentIntentId!,
        refundRequest.amount,
        {
          reason: refundRequest.reason,
          refundId: refundRequest.refundId,
          metadata: {
            refund_id: refundRequest.refundId,
            purchase_id: refundRequest.purchaseId,
            processed_by: processedBy

        }
      );
      
      // Process creator adjustment if needed
      if (refundRequest.creatorAdjustment.required) {
        await this.processCreatorAdjustment(refundRequest);

      
      // Update refund request with completion
      refundRequest.status = RefundStatus.COMPLETED;
      refundRequest.processedAt = new Date();
      refundRequest.stripeRefundId = stripeRefund.id;
      refundRequest.updatedAt = new Date();
      
      // Add workflow step
      refundRequest.workflowHistory.push({
        stepId: this.generateStepId(),
        action: 'processed',
        performedBy: processedBy,
        performedAt: new Date(),
        previousStatus: RefundStatus.PROCESSING,
        newStatus: RefundStatus.COMPLETED,
        notes: `Stripe refund: ${stripeRefund.id}`
      });
      
      await this.updateRefundRequest(refundRequest);
      
      // Update original purchase record
      await this.updatePurchaseRefundStatus(refundRequest);
      
      // Register with financial data lifecycle
      await this.registerRefundWithFinancialSystem(refundRequest, stripeRefund);
      
      // Notify customer and creator
      await this.notifyRefundCompleted(refundRequest);
      
      // Log audit event
      await this.auditService.logEvent({
        eventType: 'refund_processed',
        userId: processedBy,
        details: {
          refundId: refundRequest.refundId,
          stripeRefundId: stripeRefund.id,
          amount: refundRequest.amount

      });
      
      console.log(`✅ Refund processed successfully: ${refundId}`);
 catch (error) {
      console.error(`❌ Failed to process refund ${refundId}:`, error);
      
      // Mark as failed
      refundRequest.status = RefundStatus.FAILED;
      refundRequest.updatedAt = new Date();
      
      refundRequest.workflowHistory.push({
        stepId: this.generateStepId(),
        action: 'processed',
        performedBy: processedBy,
        performedAt: new Date(),
        previousStatus: RefundStatus.PROCESSING,
        newStatus: RefundStatus.FAILED,
        notes: `Processing failed: ${error.message}`
      });
      
      await this.updateRefundRequest(refundRequest);
      
      // Log error event
      await this.auditService.logEvent({
        eventType: 'refund_processing_failed',
        userId: processedBy,
        details: { refundId, error: error.message },
        severity: 'error'
      });
      
      throw error;



  /**
   * Get refund statistics
   */
  public async getRefundStats(dateRange?: { start: Date; end: Date }): Promise<RefundStats> {

    const db = await this.databaseService.getDatabase();
    
    let dateFilter = '';
    const params: any[] = [];
    
    if (dateRange) {
      dateFilter = ' WHERE created_at >= ? AND created_at <= ?';
      params.push(dateRange.start.toISOString(), dateRange.end.toISOString());

    
    // Get basic counts
    const totalRequests = await db.get(`SELECT COUNT(*) as count FROM refund_requests${dateFilter}`, params);
    const pendingRequests = await db.get(`
      SELECT COUNT(*) as count FROM refund_requests 
      WHERE status IN ('pending', 'reviewing')${dateRange ? ' AND created_at >= ? AND created_at <= ?' : ''}
    `, dateRange ? params : []);
    
    const approvedToday = await db.get(`
      SELECT COUNT(*) as count FROM refund_requests 
      WHERE status = 'approved' AND DATE(approved_at) = DATE('now')
    `);
    
    const totalRefunded = await db.get(`
      SELECT SUM(amount) as total FROM refund_requests 
      WHERE status = 'completed'${dateRange ? ' AND processed_at >= ? AND processed_at <= ?' : ''}
    `, dateRange ? params : []);
    
    // Get breakdowns
    const byReason = await db.all(`
      SELECT reason, COUNT(*) as count FROM refund_requests${dateFilter}
      GROUP BY reason
    `, params);
    
    const byStatus = await db.all(`
      SELECT status, COUNT(*) as count FROM refund_requests${dateFilter}
      GROUP BY status
    `, params);
    
    // Calculate performance metrics
    const performanceMetrics = await this.calculatePerformanceMetrics(dateRange);
    
    return {
      totalRequests: totalRequests.count,
      pendingRequests: pendingRequests.count,
      approvedToday: approvedToday.count,
      totalRefunded: totalRefunded.total || 0,
      averageProcessingTime: performanceMetrics.avgProcessingTime,
      
      byReason: byReason.reduce((acc: any, row: any) => {
        acc[row.reason] = row.count;
        return acc;
      }, {}),
      
      byStatus: byStatus.reduce((acc: any, row: any) => {
        acc[row.status] = row.count;
        return acc;
      }, {}),
      
      creatorImpact: performanceMetrics.creatorImpact,
      performance: performanceMetrics.performance
    };


  // Private helper methods

  private async getPurchaseDetails(purchaseId: string): Promise<any> {

    const db = await this.databaseService.getDatabase();
    return await db.get(`
      SELECT 
        id as purchaseId,
        buyer_id as customerId, 
        creator_id as creatorId,
        template_id as templateId,
        amount_cents as originalAmount,
        created_at as purchaseDate,
        stripe_payment_intent_id as stripePaymentIntentId
      FROM marketplace_purchases 
      WHERE id = ?
    `, [purchaseId]);


  private async validateRefundEligibility(purchase: any, request: any): Promise<void> {

    const policy = await this.getApplicablePolicy(purchase, request);
    
    // Check time limit
    const hoursSincePurchase = (Date.now() - new Date(purchase.purchaseDate).getTime()) / (1000 * 60 * 60);
    if (hoursSincePurchase > policy.timeLimit) {
      throw new Error(`Refund request exceeds time limit of ${policy.timeLimit} hours`);

    
    // Check if reason is blocked
    if (policy.blockedReasons.includes(request.reason)) {
      throw new Error(`Refund reason '${request.reason}' is not eligible for refunds`);

    
    // Additional eligibility checks would go here


  private requiresApproval(amount: number, policy: RefundPolicy, request: any): boolean {
    if (amount > policy.autoApproveThreshold) return true;
    if (policy.requireManagerApproval) return true;
    if (request.requesterType === 'customer' && request.reason === RefundReason.FRAUDULENT) return true;
    return false;


  private calculateCreatorImpact(purchase: any, refundAmount: number, policy: RefundPolicy): any {
    const creatorLiability = (refundAmount * policy.creatorLiabilityPercent) / 100;
    
    return {
      required: creatorLiability > 0,
      amount: creatorLiability,
      escrowImpacted: true,
      creatorNotified: false
    };


  private calculateDueDate(priority: string): Date {
    const hours = priority === 'urgent' ? 4 : priority === 'high' ? 24 : priority === 'medium' ? 72 : 168;
    return new Date(Date.now() + hours * 60 * 60 * 1000);


  private async executeStripeRefund(paymentIntentId: string, amount: number, metadata: any): Promise<any> {

    // This would integrate with Stripe API
    console.log(`🔄 Executing Stripe refund: ${paymentIntentId} for ${amount} cents`);
    
    // Mock Stripe refund response
    return {
      id: `re_${Date.now()}`,
      amount,
      status: 'succeeded',
      payment_intent: paymentIntentId,
      metadata
    };


  private async processCreatorAdjustment(refundRequest: RefundRequest): Promise<void> {

    console.log(`⚖️ Processing creator adjustment for refund: ${refundRequest.refundId}`);
    // Implementation would adjust creator account balance


  private async updatePurchaseRefundStatus(refundRequest: RefundRequest): Promise<void> {

    const db = await this.databaseService.getDatabase();
    await db.run(`
      UPDATE marketplace_purchases 
      SET status = 'refunded', 
          refund_amount_cents = ?,
          refund_reason = ?,
          refunded_at = ?
      WHERE id = ?
    `, [
      refundRequest.amount,
      refundRequest.reason,
      new Date().toISOString(),
      refundRequest.purchaseId
    ]);


  private async registerRefundWithFinancialSystem(refundRequest: RefundRequest, stripeRefund: any): Promise<void> {

    await this.financialService.recordTransaction({
      transactionId: stripeRefund.id,
      transactionType: 'refund',
      amount: -refundRequest.amount, // Negative for refund
      currency: 'USD',
      relatedEntityId: refundRequest.purchaseId,
      metadata: {
        refundId: refundRequest.refundId,
        originalPurchaseId: refundRequest.purchaseId,
        refundReason: refundRequest.reason

    });


  private async loadRefundPolicies(): Promise<void> {

    // Load policies from database
    console.log('📋 Loading refund policies...');
    
    // Default policy
    const defaultPolicy: RefundPolicy = {
      policyId: 'default-refund-policy',
      name: 'Default Refund Policy',
      enabled: true,
      timeLimit: 168, // 7 days
      minAmount: 100, // $1.00
      maxAmount: 10000000, // $100,000
      autoApproveThreshold: 5000, // $50.00
      requireManagerApproval: false,
      maxRefundsPerCustomer: 10,
      maxRefundsPerTemplate: 50,
      blockedReasons: [],
      creatorLiabilityPercent: 80,
      escrowHoldPeriod: 24
    };
    
    this.policies.set(defaultPolicy.policyId, defaultPolicy);


  private async getApplicablePolicy(purchase: any, request: any): Promise<RefundPolicy> {

    // Return default policy - in real implementation, would choose based on purchase context
    return this.policies.get('default-refund-policy')!;


  private setupPeriodicTasks(): void {
    // Set up periodic tasks like escalation handling, metrics calculation, etc.
    console.log('⏰ Setting up periodic refund processing tasks...');


  private async notifyCustomerRefundRejected(refundRequest: RefundRequest, reason: string): Promise<void> {

    console.log(`📧 Notifying customer of refund rejection: ${refundRequest.refundId}`);
    // Implementation would send email/notification to customer


  private async notifyRefundCompleted(refundRequest: RefundRequest): Promise<void> {

    console.log(`📧 Notifying parties of refund completion: ${refundRequest.refundId}`);
    // Implementation would notify customer and creator


  private async calculatePerformanceMetrics(dateRange?: { start: Date; end: Date }): Promise<any> {

    // Calculate performance metrics - mock implementation
    return {
      avgProcessingTime: 4.5, // hours
      creatorImpact: {
        creatorsAffected: 25,
        totalCreatorDeductions: 150000, // cents
        avgDeductionAmount: 6000 // cents

      performance: {
        approvalRate: 0.85,
        avgResolutionTime: 6.2, // hours
        escalationRate: 0.12,
        customerSatisfaction: 4.2

    };


  // Database operations
  private async storeRefundRequest(refund: RefundRequest): Promise<void> {

    const db = await this.databaseService.getDatabase();
    await db.run(`
      INSERT INTO refund_requests 
      (refund_id, purchase_id, requester_id, requester_type, reason, amount, 
       refund_type, description, status, priority, approval_required, 
       original_purchase_json, creator_adjustment_json, created_at, updated_at, due_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      refund.refundId, refund.purchaseId, refund.requesterId, refund.requesterType,
      refund.reason, refund.amount, refund.refundType, refund.description,
      refund.status, refund.priority, refund.approvalRequired ? 1 : 0,
      JSON.stringify(refund.originalPurchase), JSON.stringify(refund.creatorAdjustment),
      refund.createdAt.toISOString(), refund.updatedAt.toISOString(),
      refund.dueDate?.toISOString()
    ]);


  private async getRefundRequest(refundId: string): Promise<RefundRequest | null> {

    const db = await this.databaseService.getDatabase();
    const row = await db.get('SELECT * FROM refund_requests WHERE refund_id = ?', [refundId]);
    
    if (!row) return null;
    
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
      approvalRequired: row.approval_required === 1,
      approvedBy: row.approved_by,
      approvedAt: row.approved_at ? new Date(row.approved_at) : undefined,
      processedAt: row.processed_at ? new Date(row.processed_at) : undefined,
      stripeRefundId: row.stripe_refund_id,
      creatorAdjustment: JSON.parse(row.creator_adjustment_json || '{}'),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      dueDate: row.due_date ? new Date(row.due_date) : undefined,
      escalatedAt: row.escalated_at ? new Date(row.escalated_at) : undefined,
      workflowHistory: JSON.parse(row.workflow_history || '[]'),
      notes: JSON.parse(row.notes || '[]')
    };


  private async updateRefundRequest(refund: RefundRequest): Promise<void> {

    const db = await this.databaseService.getDatabase();
    await db.run(`
      UPDATE refund_requests 
      SET status = ?, approved_by = ?, approved_at = ?, processed_at = ?,
          stripe_refund_id = ?, workflow_history = ?, notes = ?, updated_at = ?
      WHERE refund_id = ?
    `, [
      refund.status, refund.approvedBy, 
      refund.approvedAt?.toISOString(), refund.processedAt?.toISOString(),
      refund.stripeRefundId, JSON.stringify(refund.workflowHistory),
      JSON.stringify(refund.notes), refund.updatedAt.toISOString(),
      refund.refundId
    ]);


  // Utility methods
  private generateRefundId(): string {
    return `RFD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;


  private generateStepId(): string {
    return `STP-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;


  private generateNoteId(): string {
    return `NTE-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

