// Epic 17.5.5 - Marketplace Verification System Service
import { DatabaseService } from '../auth/database/DatabaseService';
import { AuditService } from '../auth/services/AuditService';
import AWS from 'aws-sdk';
import crypto from 'crypto';
import {
  VerificationRequest,
  VerificationDocument,
  UserVerificationStatus,
  VerificationInformation,
  VerificationLevel,
  VerificationStatus,
  VerificationRequestStatus,
  DocumentType,
  TrustBadge,
  VerificationMetrics,
  VerificationQueue
 from './verification.types';



export interface VerificationServiceConfig {
  s3: {
    bucket: string;
    region: string;
    accessKeyId?: string;
    secretAccessKey?: string;



  };
  documentUpload: {
    maxFileSize: number; // bytes
    allowedMimeTypes: string[];
    virusScanEnabled: boolean;
  };
  verification: {
    autoApprovalEnabled: boolean;
    trustScoreThresholds: Record<VerificationLevel, number>;
    reviewSlaHours: number;
  };


export class VerificationService {
  private db: DatabaseService;
  private auditService: AuditService;
  private s3: AWS.S3;
  private config: VerificationServiceConfig;

  constructor(
    db: DatabaseService,
    auditService: AuditService,
    config: VerificationServiceConfig
  ) {
    this.db = db;
    this.auditService = auditService;
    this.config = config;
    
    this.s3 = new AWS.S3({
      region: config.s3.region,
      accessKeyId: config.s3.accessKeyId,
      secretAccessKey: config.s3.secretAccessKey
    });


  // Task E17-1753114397399-977226: Implement information collection
  async createVerificationRequest(
    userId: string,
    requestData: {
      requested_level: VerificationLevel;
      information: VerificationInformation;

    clientIp?: string,
    userAgent?: string
  ): Promise<VerificationRequest> {

    const client = await this.db.getClient();
    
    try {
      await client.query('BEGIN');
      
      // Create verification request
      const requestResult = await client.query(`
        INSERT INTO verification_requests 
        (user_id, requested_level, information, status)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `, [userId, requestData.requested_level, JSON.stringify(requestData.information), 'draft']);

      const request = requestResult.rows[0];

      // Initialize user verification status if doesn't exist
      await client.query(`
        INSERT INTO user_verification_status (user_id) 
        VALUES ($1) 
        ON CONFLICT (user_id) DO NOTHING
      `, [userId]);

      // Log audit event
      await this.auditService.logEvent({
        userId,
        action: 'verification_request_created',
        details: {
          request_id: request.id,
          requested_level: requestData.requested_level,
          has_personal_info: !!requestData.information.personal_info,
          has_professional_info: !!requestData.information.professional_info,
          has_business_info: !!requestData.information.business_info

        ipAddress: clientIp,
        userAgent,
        severity: 'info'
      });

      await client.query('COMMIT');
      
      return this.formatVerificationRequest(request);
 catch (error) {
      await client.query('ROLLBACK');
      throw error;
 finally {
      client.release();



  async updateVerificationInformation(
    requestId: string,
    userId: string,
    information: VerificationInformation,
    clientIp?: string,
    userAgent?: string
  ): Promise<VerificationRequest> {

    const client = await this.db.getClient();
    
    try {
      await client.query('BEGIN');

      // Get existing request for audit comparison
      const existingResult = await client.query(
        'SELECT * FROM verification_requests WHERE id = $1 AND user_id = $2',
        [requestId, userId]
      );

      if (existingResult.rows.length === 0) {
        throw new Error('Verification request not found or access denied');


      const existing = existingResult.rows[0];
      
      // Check if request can be modified
      if (!['draft', 'requires_additional_info'].includes(existing.status)) {
        throw new Error('Cannot modify request in current status');


      // Update the information
      const updateResult = await client.query(`
        UPDATE verification_requests 
        SET information = $1, updated_at = NOW()
        WHERE id = $2 AND user_id = $3
        RETURNING *
      `, [JSON.stringify(information), requestId, userId]);

      const updated = updateResult.rows[0];

      // Log the change
      await this.logAuditEvent(client, requestId, 'information_updated', userId, {
        old_values: existing.information,
        new_values: information
      }, clientIp, userAgent);

      await client.query('COMMIT');
      
      return this.formatVerificationRequest(updated);
 catch (error) {
      await client.query('ROLLBACK');
      throw error;
 finally {
      client.release();



  async submitVerificationRequest(
    requestId: string,
    userId: string,
    clientIp?: string,
    userAgent?: string
  ): Promise<VerificationRequest> {

    const client = await this.db.getClient();
    
    try {
      await client.query('BEGIN');

      // Get request and validate
      const requestResult = await client.query(
        'SELECT * FROM verification_requests WHERE id = $1 AND user_id = $2',
        [requestId, userId]
      );

      if (requestResult.rows.length === 0) {
        throw new Error('Verification request not found');


      const request = requestResult.rows[0];
      
      if (request.status !== 'draft') {
        throw new Error('Can only submit draft requests');


      // Validate that request has minimum required information
      const information = request.information;
      if (!information.personal_info?.full_name || !information.personal_info?.email) {
        throw new Error('Missing required personal information');


      // Check if any documents are required and uploaded
      const documentsResult = await client.query(
        'SELECT COUNT(*) as count FROM verification_documents WHERE verification_request_id = $1 AND status = $2',
        [requestId, 'uploaded']
      );

      const uploadedDocs = parseInt(documentsResult.rows[0].count);
      if (request.requested_level !== 'basic' && uploadedDocs === 0) {
        throw new Error('Document upload required for this verification level');


      // Update status to submitted
      const updateResult = await client.query(`
        UPDATE verification_requests 
        SET status = $1, submitted_at = NOW(), updated_at = NOW()
        WHERE id = $2 AND user_id = $3
        RETURNING *
      `, ['submitted', requestId, userId]);

      // Update user verification status to pending
      await client.query(`
        UPDATE user_verification_status 
        SET status = $1, updated_at = NOW()
        WHERE user_id = $2
      `, ['pending', userId]);

      // Log submission
      await this.logAuditEvent(client, requestId, 'request_submitted', userId, {
        requested_level: request.requested_level,
        documents_count: uploadedDocs
      }, clientIp, userAgent);

      await this.auditService.logEvent({
        userId,
        action: 'verification_request_submitted',
        details: {
          request_id: requestId,
          requested_level: request.requested_level,
          documents_uploaded: uploadedDocs

        ipAddress: clientIp,
        userAgent,
        severity: 'info'
      });

      await client.query('COMMIT');
      
      return this.formatVerificationRequest(updateResult.rows[0]);
 catch (error) {
      await client.query('ROLLBACK');
      throw error;
 finally {
      client.release();



  // Task E17-1753114397398-D7FE2D: Create document upload
  async createDocumentUpload(
    requestId: string,
    userId: string,
    documentData: {
      document_type: DocumentType;
      file_name: string;
      file_size: number;
      file_type: string;

    clientIp?: string,
    userAgent?: string
  ): Promise<{ document: VerificationDocument; upload_url: string }> {

    const client = await this.db.getClient();
    
    try {
      await client.query('BEGIN');

      // Verify request ownership and status
      const requestResult = await client.query(
        'SELECT * FROM verification_requests WHERE id = $1 AND user_id = $2',
        [requestId, userId]
      );

      if (requestResult.rows.length === 0) {
        throw new Error('Verification request not found or access denied');


      const request = requestResult.rows[0];
      if (!['draft', 'requires_additional_info'].includes(request.status)) {
        throw new Error('Cannot upload documents for request in current status');


      // Validate file constraints
      if (documentData.file_size > this.config.documentUpload.maxFileSize) {
        throw new Error(`File size exceeds maximum allowed size of ${this.config.documentUpload.maxFileSize} bytes`);


      if (!this.config.documentUpload.allowedMimeTypes.includes(documentData.file_type)) {
        throw new Error(`File type ${documentData.file_type} is not allowed`);


      // Generate S3 key and presigned URL
      const timestamp = Date.now();
      const randomId = crypto.randomBytes(8).toString('hex');
      const fileExtension = documentData.file_name.split('.').pop();
      const s3Key = `verification/${userId}/${requestId}/${timestamp}-${randomId}.${fileExtension}`;

      // Create document record
      const documentResult = await client.query(`
        INSERT INTO verification_documents 
        (verification_request_id, document_type, file_name, file_size, file_type, s3_key, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [requestId, documentData.document_type, documentData.file_name, 
        documentData.file_size, documentData.file_type, s3Key, 'pending_upload']);

      const document = documentResult.rows[0];

      // Generate presigned URL for upload (expires in 1 hour)
      const uploadUrl = await this.s3.getSignedUrlPromise('putObject', {
        Bucket: this.config.s3.bucket,
        Key: s3Key,
        ContentType: documentData.file_type,
        ContentLength: documentData.file_size,
        Expires: 3600, // 1 hour
        Metadata: {
          'user-id': userId,
          'request-id': requestId,
          'document-type': documentData.document_type,
          'original-name': documentData.file_name

      });

      // Log document creation
      await this.logAuditEvent(client, requestId, 'document_created', userId, {
        document_id: document.id,
        document_type: documentData.document_type,
        file_name: documentData.file_name,
        file_size: documentData.file_size
      }, clientIp, userAgent);

      await client.query('COMMIT');

      const formattedDocument = this.formatVerificationDocument(document);
      
      return {
        document: formattedDocument,
        upload_url: uploadUrl
      };
 catch (error) {
      await client.query('ROLLBACK');
      throw error;
 finally {
      client.release();



  async confirmDocumentUpload(
    documentId: string,
    userId: string,
    clientIp?: string,
    userAgent?: string
  ): Promise<VerificationDocument> {

    const client = await this.db.getClient();
    
    try {
      await client.query('BEGIN');

      // Verify document ownership
      const documentResult = await client.query(`
        SELECT vd.*, vr.user_id 
        FROM verification_documents vd
        JOIN verification_requests vr ON vd.verification_request_id = vr.id
        WHERE vd.id = $1 AND vr.user_id = $2
      `, [documentId, userId]);

      if (documentResult.rows.length === 0) {
        throw new Error('Document not found or access denied');


      const document = documentResult.rows[0];
      
      if (document.status !== 'pending_upload') {
        throw new Error('Document is not in pending upload status');


      // Verify file exists in S3
      try {
        await this.s3.headObject({
          Bucket: this.config.s3.bucket,
          Key: document.s3_key
        }).promise();
 catch (error) {
        throw new Error('File not found in storage - upload may have failed');


      // Update document status
      const updateResult = await client.query(`
        UPDATE verification_documents 
        SET status = $1, uploaded_at = NOW(), updated_at = NOW()
        WHERE id = $2
        RETURNING *
      `, ['uploaded', documentId]);

      // Schedule virus scan if enabled
      if (this.config.documentUpload.virusScanEnabled) {
        await this.scheduleVirusScan(document.s3_key, documentId);


      // Log confirmation
      await this.logAuditEvent(client, document.verification_request_id, 'document_uploaded', userId, {
        document_id: documentId,
        s3_key: document.s3_key
      }, clientIp, userAgent);

      await client.query('COMMIT');
      
      return this.formatVerificationDocument(updateResult.rows[0]);
 catch (error) {
      await client.query('ROLLBACK');
      throw error;
 finally {
      client.release();



  // Get user verification requests
  async getUserVerificationRequests(
    userId: string,
    options: { limit?: number; offset?: number } = {}
  ): Promise<{ requests: VerificationRequest[]; total: number }> {

    const { limit = 10, offset = 0 } = options;
    
    // Get requests
    const requestsResult = await this.db.query(`
      SELECT vr.*, 
             json_agg(
               json_build_object(
                 'id', vd.id,
                 'document_type', vd.document_type,
                 'file_name', vd.file_name,
                 'status', vd.status,
                 'uploaded_at', vd.uploaded_at,
                 'verified_at', vd.verified_at
               ) ORDER BY vd.created_at
             ) FILTER (WHERE vd.id IS NOT NULL) as documents
      FROM verification_requests vr
      LEFT JOIN verification_documents vd ON vr.id = vd.verification_request_id
      WHERE vr.user_id = $1
      GROUP BY vr.id
      ORDER BY vr.created_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);

    // Get total count
    const countResult = await this.db.query(
      'SELECT COUNT(*) as total FROM verification_requests WHERE user_id = $1',
      [userId]
    );

    const requests = requestsResult.rows.map(row => {
      const request = this.formatVerificationRequest(row);
      request.documents = row.documents || [];
      return request;
    });

    return {
      requests,
      total: parseInt(countResult.rows[0].total)
    };


  // Get user verification status
  async getUserVerificationStatus(userId: string): Promise<UserVerificationStatus | null> {

    const result = await this.db.query(`
      SELECT uvs.*, 
             json_agg(
               json_build_object(
                 'id', vr.id,
                 'requested_level', vr.requested_level,
                 'status', vr.status,
                 'submitted_at', vr.submitted_at,
                 'reviewed_at', vr.reviewed_at
               ) ORDER BY vr.created_at DESC
             ) FILTER (WHERE vr.id IS NOT NULL) as verification_history
      FROM user_verification_status uvs
      LEFT JOIN verification_requests vr ON uvs.user_id = vr.user_id
      WHERE uvs.user_id = $1
      GROUP BY uvs.user_id, uvs.current_level, uvs.status, uvs.verified_at, 
               uvs.expires_at, uvs.trust_score, uvs.badges, uvs.created_at, uvs.updated_at
    `, [userId]);

    if (result.rows.length === 0) {
      return null;


    const row = result.rows[0];
    return {
      user_id: row.user_id,
      current_level: row.current_level,
      status: row.status,
      verified_at: row.verified_at,
      expires_at: row.expires_at,
      trust_score: row.trust_score,
      badges: row.badges || [],
      verification_history: row.verification_history || []
    };


  // Admin/reviewer methods

  async getVerificationQueue(
    reviewerId?: string,
    options: { limit?: number; offset?: number; status?: VerificationRequestStatus } = {}
  ): Promise<VerificationQueue> {

    const { limit = 20, offset = 0, status = 'submitted' } = options;

    const queueResult = await this.db.query(`
      SELECT vr.*, 
             u.email as user_email,
             json_agg(
               json_build_object(
                 'id', vd.id,
                 'document_type', vd.document_type,
                 'file_name', vd.file_name,
                 'status', vd.status,
                 'uploaded_at', vd.uploaded_at
               ) ORDER BY vd.created_at
             ) FILTER (WHERE vd.id IS NOT NULL) as documents,
             EXTRACT(EPOCH FROM (NOW() - vr.submitted_at)) / 3600 as hours_waiting
      FROM verification_requests vr
      JOIN users u ON vr.user_id = u.id
      LEFT JOIN verification_documents vd ON vr.id = vd.verification_request_id
      WHERE vr.status = $1 
        AND ($2::uuid IS NULL OR vr.reviewer_id = $2)
      GROUP BY vr.id, u.email
      ORDER BY vr.submitted_at ASC
      LIMIT $3 OFFSET $4
    `, [status, reviewerId, limit, offset]);

    // Get queue statistics
    const statsResult = await this.db.query(`
      SELECT 
        COUNT(*) as queue_depth,
        AVG(EXTRACT(EPOCH FROM (NOW() - submitted_at)) / 3600) as avg_wait_time_hours,
        COUNT(*) FILTER (WHERE EXTRACT(EPOCH FROM (NOW() - submitted_at)) / 3600 > $1) as sla_breaches
      FROM verification_requests 
      WHERE status = $2
    `, [this.config.verification.reviewSlaHours, status]);

    const stats = statsResult.rows[0];
    const pendingReviews = queueResult.rows.map(row => {
      const request = this.formatVerificationRequest(row);
      request.documents = row.documents || [];
      return request;
    });

    return {
      pending_reviews: pendingReviews,
      avg_wait_time_hours: parseFloat(stats.avg_wait_time_hours) || 0,
      queue_depth: parseInt(stats.queue_depth),
      sla_breaches: parseInt(stats.sla_breaches),
      reviewer_workload: [] // TODO: Implement reviewer workload calculation
    };


  // Utility methods
  private formatVerificationRequest(row: any): VerificationRequest {
    return {
      id: row.id,
      user_id: row.user_id,
      requested_level: row.requested_level,
      status: row.status,
      submitted_at: row.submitted_at,
      reviewed_at: row.reviewed_at,
      reviewer_id: row.reviewer_id,
      review_notes: row.review_notes,
      rejection_reason: row.rejection_reason,
      information: typeof row.information === 'string' ? 
        JSON.parse(row.information) : row.information,
      documents: [],
      created_at: row.created_at,
      updated_at: row.updated_at
    };


  private formatVerificationDocument(row: any): VerificationDocument {
    return {
      id: row.id,
      verification_request_id: row.verification_request_id,
      document_type: row.document_type,
      file_name: row.file_name,
      file_size: row.file_size,
      file_type: row.file_type,
      s3_key: row.s3_key,
      status: row.status,
      verification_notes: row.verification_notes,
      uploaded_at: row.uploaded_at,
      verified_at: row.verified_at,
      created_at: row.created_at,
      updated_at: row.updated_at
    };


  private async logAuditEvent(
    client: any,
    requestId: string,
    action: string,
    actorId: string,
    details: any,
    ipAddress?: string,
    userAgent?: string,
    notes?: string
  ): Promise<void> {

    await client.query(`
      INSERT INTO verification_audit_log 
      (verification_request_id, action, actor_id, new_values, notes, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [requestId, action, actorId, JSON.stringify(details), notes, ipAddress, userAgent]);


  private async scheduleVirusScan(s3Key: string, documentId: string): Promise<void> {

    // TODO: Implement virus scanning integration
    // This could integrate with AWS ClamAV, or other virus scanning services
    console.log(`Scheduling virus scan for document ${documentId} at ${s3Key}`);

