import { Pool, PoolClient } from 'pg';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';

// Verification status enum
export enum VerificationStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled'


// Verification request types
export enum VerificationType {
  IDENTITY = 'identity',
  BUSINESS = 'business',
  DEVELOPER = 'developer',
  PREMIUM = 'premium'


// Document types for verification
export enum DocumentType {
  GOVERNMENT_ID = 'government_id',
  PASSPORT = 'passport',
  DRIVERS_LICENSE = 'drivers_license',
  BUSINESS_LICENSE = 'business_license',
  TAX_DOCUMENT = 'tax_document',
  UTILITY_BILL = 'utility_bill',
  BANK_STATEMENT = 'bank_statement',
  ARTICLES_OF_INCORPORATION = 'articles_of_incorporation',
  OTHER = 'other'


// Interfaces



export interface VerificationRequest {
  id?: string;
  user_id: string;
  verification_type: VerificationType;
  status: VerificationStatus;
  submitted_at: Date;
  reviewed_at?: Date;
  reviewed_by?: string;
  expiry_date: Date;
  metadata: {
    user_info?: unknown;
    business_info?: unknown;
    documents?: VerificationDocument[];
    notes?: string;



  };
  admin_notes?: string;
  rejection_reason?: string;
  created_at?: Date;
  updated_at?: Date;




export interface VerificationDocument {
  id?: string;
  request_id: string;
  document_type: DocumentType;
  file_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  hash: string;
  uploaded_at: Date;
  verified: boolean;
  verification_notes?: string;







export interface VerificationQueueItem {
  id: string;
  user_id: string;
  verification_type: VerificationType;
  status: VerificationStatus;
  submitted_at: Date;
  priority_score: number;
  user_email: string;
  document_count: number;
  days_pending: number;







export interface VerificationDecision {
  request_id: string;
  decision: 'approve' | 'reject';
  admin_notes?: string;
  rejection_reason?: string;
  follow_up_required?: boolean;







export interface VerificationStats {
  total_pending: number;
  total_under_review: number;
  avg_processing_time: number;
  approval_rate: number;
  by_type: Record<VerificationType, {
    pending: number;
    approved: number;
    rejected: number;



>;


export class VerificationProcessService {
  private readonly UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'verification');
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly ALLOWED_MIME_TYPES = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'text/plain'
  ];

  constructor(private pool: Pool) {
    this.ensureUploadDirectory();


  // Initialize verification tables
  async initializeSchema(): Promise<void> {

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Create verification_requests table
      await client.query(`
        CREATE TABLE IF NOT EXISTS verification_requests (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL,
          verification_type VARCHAR(20) NOT NULL,
          status VARCHAR(20) NOT NULL DEFAULT 'pending',
          submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          reviewed_at TIMESTAMP,
          reviewed_by UUID,
          expiry_date TIMESTAMP NOT NULL,
          metadata JSONB NOT NULL DEFAULT '{}',
          admin_notes TEXT,
          rejection_reason TEXT,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Create verification_documents table
      await client.query(`
        CREATE TABLE IF NOT EXISTS verification_documents (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          request_id UUID NOT NULL REFERENCES verification_requests(id) ON DELETE CASCADE,
          document_type VARCHAR(30) NOT NULL,
          file_path TEXT NOT NULL,
          file_name TEXT NOT NULL,
          file_size INTEGER NOT NULL,
          mime_type VARCHAR(100) NOT NULL,
          hash VARCHAR(64) NOT NULL,
          uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          verified BOOLEAN NOT NULL DEFAULT false,
          verification_notes TEXT
        );
      `);

      // Create indexes
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_verification_requests_user_id ON verification_requests(user_id);
        CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON verification_requests(status);
        CREATE INDEX IF NOT EXISTS idx_verification_requests_type ON verification_requests(verification_type);
        CREATE INDEX IF NOT EXISTS idx_verification_requests_submitted ON verification_requests(submitted_at);
        CREATE INDEX IF NOT EXISTS idx_verification_documents_request_id ON verification_documents(request_id);
      `);

      await client.query('COMMIT');
 catch (error) {
      await client.query('ROLLBACK');
      throw error;
 finally {
      client.release();



  // Submit verification request
  async submitVerificationRequest(
    userId: string,
    verificationType: VerificationType,
    metadata: Record<string, unknown> = {}
  ): Promise<VerificationRequest> {

    // Check for existing pending request
    const existingRequest = await this.getUserActiveRequest(userId, verificationType);
    if (existingRequest) {
      throw new BadRequestException('You already have an active verification request of this type');


    // Set expiry date (30 days from submission)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    const client = await this.pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO verification_requests 
         (user_id, verification_type, status, expiry_date, metadata)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [userId, verificationType, VerificationStatus.PENDING, expiryDate, JSON.stringify(metadata)]
      );

      // Audit log
      await this.auditLog(client, {
        action: 'verification_request_submitted',
        user_id: userId,
        details: { verification_type: verificationType, request_id: result.rows[0].id }
      });

      return result.rows[0];
 finally {
      client.release();



  // Upload verification document
  async uploadDocument(
    requestId: string,
    userId: string,
    file: {
      originalname: string;
      buffer: Buffer;
      mimetype: string;
      size: number;

    documentType: DocumentType
  ): Promise<VerificationDocument> {

    // Validate file
    if (file.size > this.MAX_FILE_SIZE) {
      throw new BadRequestException('File size exceeds 10MB limit');


    if (!this.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('File type not allowed');


    // Verify request ownership
    const request = await this.getVerificationRequest(requestId);
    if (!request || request.user_id !== userId) {
      throw new ForbiddenException('Not authorized to upload to this request');


    if (request.status !== VerificationStatus.PENDING) {
      throw new BadRequestException('Cannot upload documents to requests that are not pending');


    // Generate file hash and path
    const hash = crypto.createHash('sha256').update(file.buffer).digest('hex');
    const fileExtension = path.extname(file.originalname) || '.bin';
    const fileName = `${hash}${fileExtension}`;
    const filePath = path.join(this.UPLOAD_DIR, fileName);

    // Save file
    await fs.promises.writeFile(filePath, file.buffer);

    // Save to database
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO verification_documents 
         (request_id, document_type, file_path, file_name, file_size, mime_type, hash)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [requestId, documentType, filePath, file.originalname, file.size, file.mimetype, hash]
      );

      // Audit log
      await this.auditLog(client, {
        action: 'verification_document_uploaded',
        user_id: userId,
        details: { 
          request_id: requestId, 
          document_type: documentType, 
          file_name: file.originalname,
          file_size: file.size

      });

      return result.rows[0];
 finally {
      client.release();



  // Get verification queue (admin)
  async getVerificationQueue(
    adminUserId: string,
    filters: {
      status?: VerificationStatus;
      type?: VerificationType;
      limit?: number;
      offset?: number;
      sort_by?: 'submitted_at' | 'priority' | 'type';
      sort_order?: 'asc' | 'desc';
 = {}
  ): Promise<{ items: VerificationQueueItem[]; total: number }> {

    const {
      status,
      type,
      limit = 50,
      offset = 0,
      sort_by = 'submitted_at',
      sort_order = 'asc'
 = filters;

    let whereClause = '1=1';
    const queryParams: unknown[] = [];
    let paramCount = 0;

    if (status) {
      whereClause += ` AND vr.status = $${++paramCount}`;
      queryParams.push(status);


    if (type) {
      whereClause += ` AND vr.verification_type = $${++paramCount}`;
      queryParams.push(type);


    // Calculate priority score (higher = more urgent)
    const priorityScore = `
      CASE 
        WHEN vr.verification_type = 'premium' THEN 100
        WHEN vr.verification_type = 'business' THEN 75
        WHEN vr.verification_type = 'developer' THEN 50
        ELSE 25
      END + 
      CASE 
        WHEN EXTRACT(DAYS FROM (CURRENT_TIMESTAMP - vr.submitted_at)) > 7 THEN 50
        WHEN EXTRACT(DAYS FROM (CURRENT_TIMESTAMP - vr.submitted_at)) > 3 THEN 25
        ELSE 0
      END
    `;

    const orderBy = sort_by === 'priority' 
      ? `${priorityScore} ${sort_order}`
      : `vr.${sort_by} ${sort_order}`;

    const client = await this.pool.connect();
    try {
      // Get queue items
      const result = await client.query(
        `SELECT 
           vr.id,
           vr.user_id,
           vr.verification_type,
           vr.status,
           vr.submitted_at,
           ${priorityScore} as priority_score,
           COALESCE(u.email, 'Unknown') as user_email,
           COUNT(vd.id) as document_count,
           EXTRACT(DAYS FROM (CURRENT_TIMESTAMP - vr.submitted_at))::INTEGER as days_pending
         FROM verification_requests vr
         LEFT JOIN users u ON vr.user_id = u.id
         LEFT JOIN verification_documents vd ON vr.id = vd.request_id
         WHERE ${whereClause}
         GROUP BY vr.id, u.email
         ORDER BY ${orderBy}
         LIMIT $${++paramCount} OFFSET $${++paramCount}`,
        [...queryParams, limit, offset]
      );

      // Get total count
      const countResult = await client.query(
        `SELECT COUNT(*) as total
         FROM verification_requests vr
         WHERE ${whereClause}`,
        queryParams.slice(0, paramCount - 2)
      );

      return {
        items: result.rows,
        total: parseInt(countResult.rows[0].total)
      };
 finally {
      client.release();



  // Process verification decision (admin)
  async processVerificationDecision(
    adminUserId: string,
    decision: VerificationDecision
  ): Promise<VerificationRequest> {

    const request = await this.getVerificationRequest(decision.request_id);
    if (!request) {
      throw new NotFoundException('Verification request not found');


    if (![VerificationStatus.PENDING, VerificationStatus.UNDER_REVIEW].includes(request.status)) {
      throw new BadRequestException('Request cannot be processed in its current state');


    const newStatus = decision.decision === 'approve' 
      ? VerificationStatus.APPROVED 
      : VerificationStatus.REJECTED;

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Update request
      const result = await client.query(
        `UPDATE verification_requests 
         SET status = $1, reviewed_at = CURRENT_TIMESTAMP, reviewed_by = $2,
             admin_notes = $3, rejection_reason = $4, updated_at = CURRENT_TIMESTAMP
         WHERE id = $5
         RETURNING *`,
        [
          newStatus,
          adminUserId,
          decision.admin_notes,
          decision.rejection_reason,
          decision.request_id
        ]
      );

      // Update user verification status in marketplace (if approved)
      if (decision.decision === 'approve') {
        await this.updateUserVerificationBadges(client, request.user_id, request.verification_type);


      // Audit log
      await this.auditLog(client, {
        action: 'verification_decision_processed',
        user_id: adminUserId,
        details: {
          request_id: decision.request_id,
          decision: decision.decision,
          verification_type: request.verification_type,
          target_user_id: request.user_id

      });

      await client.query('COMMIT');
      return result.rows[0];
 catch (error) {
      await client.query('ROLLBACK');
      throw error;
 finally {
      client.release();



  // Get verification statistics (admin)
  async getVerificationStatistics(timeframe: 'week' | 'month' | 'quarter' = 'month'): Promise<VerificationStats> {

    const days = timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : 90;
    
    const client = await this.pool.connect();
    try {
      // Get overall stats
      const overallResult = await client.query(
        `SELECT 
           COUNT(*) FILTER (WHERE status = 'pending') as total_pending,
           COUNT(*) FILTER (WHERE status = 'under_review') as total_under_review,
           AVG(EXTRACT(DAYS FROM (reviewed_at - submitted_at))) FILTER (WHERE reviewed_at IS NOT NULL) as avg_processing_time,
           COUNT(*) FILTER (WHERE status = 'approved') * 100.0 / 
             NULLIF(COUNT(*) FILTER (WHERE status IN ('approved', 'rejected')), 0) as approval_rate
         FROM verification_requests
         WHERE submitted_at >= CURRENT_TIMESTAMP - INTERVAL '${days} days'`
      );

      // Get stats by type
      const byTypeResult = await client.query(
        `SELECT 
           verification_type,
           COUNT(*) FILTER (WHERE status = 'pending') as pending,
           COUNT(*) FILTER (WHERE status = 'approved') as approved,
           COUNT(*) FILTER (WHERE status = 'rejected') as rejected
         FROM verification_requests
         WHERE submitted_at >= CURRENT_TIMESTAMP - INTERVAL '${days} days'
         GROUP BY verification_type`
      );

      const overall = overallResult.rows[0];
      const byType: Record<VerificationType, any> = {};
      
      byTypeResult.rows.forEach(row => {
        byType[row.verification_type as VerificationType] = {
          pending: parseInt(row.pending) || 0,
          approved: parseInt(row.approved) || 0,
          rejected: parseInt(row.rejected) || 0
        };
      });

      return {
        total_pending: parseInt(overall.total_pending) || 0,
        total_under_review: parseInt(overall.total_under_review) || 0,
        avg_processing_time: parseFloat(overall.avg_processing_time) || 0,
        approval_rate: parseFloat(overall.approval_rate) || 0,
        by_type: byType
      };
 finally {
      client.release();



  // Get user's verification requests
  async getUserVerificationRequests(userId: string): Promise<VerificationRequest[]> {

    const client = await this.pool.connect();
    try {
      const result = await client.query(
        `SELECT vr.*, array_agg(
           json_build_object(
             'id', vd.id,
             'document_type', vd.document_type,
             'file_name', vd.file_name,
             'file_size', vd.file_size,
             'uploaded_at', vd.uploaded_at,
             'verified', vd.verified

         ) FILTER (WHERE vd.id IS NOT NULL) as documents
         FROM verification_requests vr
         LEFT JOIN verification_documents vd ON vr.id = vd.request_id
         WHERE vr.user_id = $1
         GROUP BY vr.id
         ORDER BY vr.submitted_at DESC`,
        [userId]
      );

      return result.rows.map(row => ({
        ...row,
        metadata: {
          ...row.metadata,
          documents: row.documents || []

      }));
 finally {
      client.release();



  // Private helper methods
  private async getVerificationRequest(requestId: string): Promise<VerificationRequest | null> {

    const client = await this.pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM verification_requests WHERE id = $1',
        [requestId]
      );
      return result.rows[0] || null;
 finally {
      client.release();



  private async getUserActiveRequest(userId: string, type: VerificationType): Promise<VerificationRequest | null> {

    const client = await this.pool.connect();
    try {
      const result = await client.query(
        `SELECT * FROM verification_requests 
         WHERE user_id = $1 AND verification_type = $2 
         AND status IN ('pending', 'under_review')
         ORDER BY submitted_at DESC
         LIMIT 1`,
        [userId, type]
      );
      return result.rows[0] || null;
 finally {
      client.release();



  private async updateUserVerificationBadges(
    client: PoolClient,
    userId: string,
    verificationType: VerificationType
  ): Promise<void> {

    // Update user's verification badges in marketplace
    await client.query(
      `INSERT INTO user_verification_badges (user_id, badge_type, verified_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id, badge_type) DO UPDATE SET
         verified_at = CURRENT_TIMESTAMP,
         active = true`,
      [userId, verificationType]
    );


  private async auditLog(client: PoolClient, entry: { action: string; user_id: string; details: unknown }): Promise<void> {

    await client.query(
      `INSERT INTO audit_logs (action, user_id, details, ip_address, user_agent, created_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
      [entry.action, entry.user_id, JSON.stringify(entry.details), 'system', 'VerificationProcessService']
    );


  private ensureUploadDirectory(): void {
    if (!fs.existsSync(this.UPLOAD_DIR)) {
      fs.mkdirSync(this.UPLOAD_DIR, { recursive: true });


