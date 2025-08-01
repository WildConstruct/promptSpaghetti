// Data Retention Framework Service - Epic 19
// Comprehensive data retention management framework
// Task: T-1752989143998-894

import { DatabaseService } from '../database/DatabaseService';
import { AuditService } from '../auth/services/AuditService';
import { 
  DataRetentionPeriod, 
  DataCategory, 
  Jurisdiction,
  getRetentionPeriod,
  calculateDeletionDate,
  STANDARD_RETENTION_PERIODS
 from '../types/DataRetentionPeriods';



export interface RetentionRecord {
  recordId: string;
  dataId: string;
  dataType: string;
  category: DataCategory;
  subcategory?: string;
  userId?: string;
  createdAt: Date;
  retentionPeriod: DataRetentionPeriod;
  scheduledDeletion: Date;
  actualDeletion?: Date;
  status: RetentionStatus;
  exceptions: string[];
  lastReviewed?: Date;
  reviewedBy?: string;





export enum RetentionStatus {
  ACTIVE = 'ACTIVE',
  PENDING_DELETION = 'PENDING_DELETION',
  ARCHIVED = 'ARCHIVED',
  DELETED = 'DELETED',
  ON_HOLD = 'ON_HOLD',
  UNDER_REVIEW = 'UNDER_REVIEW'




export interface RetentionPolicy {
  policyId: string;
  name: string;
  description: string;
  categories: DataCategory[];
  jurisdiction: Jurisdiction[];
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  rules: RetentionRule[];







export interface RetentionRule {
  ruleId: string;
  condition: string;
  action: RetentionAction;
  priority: number;





export enum RetentionAction {
  DELETE = 'DELETE',
  ARCHIVE = 'ARCHIVE',
  EXTEND = 'EXTEND',
  REVIEW = 'REVIEW',
  HOLD = 'HOLD'




export interface RetentionJob {
  jobId: string;
  jobType: RetentionJobType;
  status: JobStatus;
  scheduledAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  recordsProcessed: number;
  recordsDeleted: number;
  recordsArchived: number;
  errors: string[];





export enum RetentionJobType {
  SCHEDULED_CLEANUP = 'SCHEDULED_CLEANUP',
  MANUAL_CLEANUP = 'MANUAL_CLEANUP',
  ARCHIVE_OLD_DATA = 'ARCHIVE_OLD_DATA',
  COMPLIANCE_REVIEW = 'COMPLIANCE_REVIEW'


export enum JobStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'


export class DataRetentionFrameworkService {
  private db: DatabaseService;
  private auditService: AuditService;

  constructor(db: DatabaseService, auditService: AuditService) {
    this.db = db;
    this.auditService = auditService;


  async registerDataForRetention(
    dataId: string,
    dataType: string,
    category: DataCategory,
    subcategory?: string,
    userId?: string,
    jurisdiction?: Jurisdiction[]
  ): Promise<RetentionRecord> {

    const retentionPeriod = this.determineRetentionPeriod(category, subcategory, jurisdiction);
    if (!retentionPeriod) {
      throw new Error(`No retention period found for category: ${category}`);


    const recordId = `retention_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const createdAt = new Date();
    const scheduledDeletion = calculateDeletionDate(retentionPeriod, createdAt);

    const record: RetentionRecord = {
      recordId,
      dataId,
      dataType,
      category,
      subcategory,
      userId,
      createdAt,
      retentionPeriod,
      scheduledDeletion,
      status: RetentionStatus.ACTIVE,
      exceptions: []
    };

    await this.saveRetentionRecord(record);
    await this.logRetentionEvent('DATA_REGISTERED', record);

    return record;


  async scheduleRetentionJob(jobType: RetentionJobType, scheduledAt?: Date): Promise<RetentionJob> {

    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const job: RetentionJob = {
      jobId,
      jobType,
      status: JobStatus.PENDING,
      scheduledAt: scheduledAt || new Date(),
      recordsProcessed: 0,
      recordsDeleted: 0,
      recordsArchived: 0,
      errors: []
    };

    await this.saveRetentionJob(job);
    return job;


  async executeRetentionJob(jobId: string): Promise<RetentionJob> {

    const job = await this.getRetentionJob(jobId);
    if (!job) {
      throw new Error(`Retention job not found: ${jobId}`);


    job.status = JobStatus.RUNNING;
    job.startedAt = new Date();
    await this.updateRetentionJob(job);

    try {
      switch (job.jobType) {
      case RetentionJobType.SCHEDULED_CLEANUP:
        await this.executeScheduledCleanup(job);
        break;
      case RetentionJobType.ARCHIVE_OLD_DATA:
        await this.executeArchiving(job);
        break;
      case RetentionJobType.COMPLIANCE_REVIEW:
        await this.executeComplianceReview(job);
        break;


      job.status = JobStatus.COMPLETED;
      job.completedAt = new Date();
 catch (error) {
      job.status = JobStatus.FAILED;
      job.errors.push(error.message);


    await this.updateRetentionJob(job);
    return job;


  private async executeScheduledCleanup(job: RetentionJob): Promise<void> {

    const expiredRecords = await this.getExpiredRecords();
    
    for (const record of expiredRecords) {
      try {
        if (record.retentionPeriod.archiveBeforeDeletion) {
          await this.archiveData(record);
          record.status = RetentionStatus.ARCHIVED;
          job.recordsArchived++;

        
        await this.deleteData(record);
        record.status = RetentionStatus.DELETED;
        record.actualDeletion = new Date();
        
        await this.updateRetentionRecord(record);
        job.recordsDeleted++;
        job.recordsProcessed++;
        
        await this.logRetentionEvent('DATA_DELETED', record);
 catch (error) {
        job.errors.push(`Failed to process record ${record.recordId}: ${error.message}`);




  private async executeArchiving(job: RetentionJob): Promise<void> {

    const recordsToArchive = await this.getRecordsForArchiving();
    
    for (const record of recordsToArchive) {
      try {
        await this.archiveData(record);
        record.status = RetentionStatus.ARCHIVED;
        
        await this.updateRetentionRecord(record);
        job.recordsArchived++;
        job.recordsProcessed++;
        
        await this.logRetentionEvent('DATA_ARCHIVED', record);
 catch (error) {
        job.errors.push(`Failed to archive record ${record.recordId}: ${error.message}`);




  private async executeComplianceReview(job: RetentionJob): Promise<void> {

    const recordsForReview = await this.getRecordsForReview();
    
    for (const record of recordsForReview) {
      record.status = RetentionStatus.UNDER_REVIEW;
      record.lastReviewed = new Date();
      
      await this.updateRetentionRecord(record);
      job.recordsProcessed++;
      
      await this.logRetentionEvent('COMPLIANCE_REVIEW', record);



  async addRetentionException(recordId: string, exception: string, approvedBy: string): Promise<void> {

    const record = await this.getRetentionRecord(recordId);
    if (!record) {
      throw new Error(`Retention record not found: ${recordId}`);


    record.exceptions.push(exception);
    
    // Recalculate deletion date with exception
    record.scheduledDeletion = calculateDeletionDate(
      record.retentionPeriod,
      record.createdAt,
      record.exceptions
    );

    await this.updateRetentionRecord(record);
    await this.logRetentionEvent('EXCEPTION_ADDED', record, { exception, approvedBy });


  async getRetentionStatus(dataId: string): Promise<RetentionRecord | null> {

    const query = `
      SELECT * FROM data_retention_records 
      WHERE data_id = $1 
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    
    const result = await this.db.query(query, [dataId]);
    return result.rows[0] || null;


  async getUpcomingDeletions(days: number = 30): Promise<RetentionRecord[]> {

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    const query = `
      SELECT * FROM data_retention_records 
      WHERE scheduled_deletion <= $1 
        AND status = 'ACTIVE'
      ORDER BY scheduled_deletion ASC
    `;
    
    const result = await this.db.query(query, [futureDate]);
    return result.rows;


  private determineRetentionPeriod(
    category: DataCategory,
    subcategory?: string,
    jurisdictions?: Jurisdiction[]
  ): DataRetentionPeriod | undefined {
    // Try to find exact match first
    let period = getRetentionPeriod(category, subcategory, jurisdictions?.[0]);
    
    // Fallback to category match without subcategory
    if (!period) {
      period = getRetentionPeriod(category, undefined, jurisdictions?.[0]);

    
    // Fallback to global jurisdiction
    if (!period) {
      period = getRetentionPeriod(category, subcategory, Jurisdiction.GLOBAL);

    
    return period;


  private async getExpiredRecords(): Promise<RetentionRecord[]> {

    const query = `
      SELECT * FROM data_retention_records 
      WHERE scheduled_deletion <= NOW() 
        AND status = 'ACTIVE'
    `;
    
    const result = await this.db.query(query);
    return result.rows;


  private async getRecordsForArchiving(): Promise<RetentionRecord[]> {

    const archiveDate = new Date();
    archiveDate.setDate(archiveDate.getDate() + 30); // Archive 30 days before deletion
    
    const query = `
      SELECT * FROM data_retention_records 
      WHERE scheduled_deletion <= $1 
        AND status = 'ACTIVE'
        AND retention_period->>'archiveBeforeDeletion' = 'true'
    `;
    
    const result = await this.db.query(query, [archiveDate]);
    return result.rows;


  private async getRecordsForReview(): Promise<RetentionRecord[]> {

    const query = `
      SELECT * FROM data_retention_records 
      WHERE retention_period->>'reviewRequired' = 'true'
        AND (last_reviewed IS NULL OR last_reviewed < NOW() - INTERVAL '1 year')
        AND status = 'ACTIVE'
    `;
    
    const result = await this.db.query(query);
    return result.rows;


  private async archiveData(record: RetentionRecord): Promise<void> {

    // Implementation would move data to archive storage
    // This is a placeholder for the actual archiving logic
    console.log(`Archiving data for record: ${record.recordId}`);


  private async deleteData(record: RetentionRecord): Promise<void> {

    // Implementation would perform actual data deletion
    // This is a placeholder for the actual deletion logic
    console.log(`Deleting data for record: ${record.recordId}`);


  private async saveRetentionRecord(record: RetentionRecord): Promise<void> {

    const query = `
      INSERT INTO data_retention_records (
        record_id, data_id, data_type, category, subcategory, user_id,
        created_at, retention_period, scheduled_deletion, status, exceptions
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `;
    
    await this.db.query(query, [
      record.recordId,
      record.dataId,
      record.dataType,
      record.category,
      record.subcategory,
      record.userId,
      record.createdAt,
      JSON.stringify(record.retentionPeriod),
      record.scheduledDeletion,
      record.status,
      JSON.stringify(record.exceptions)
    ]);


  private async updateRetentionRecord(record: RetentionRecord): Promise<void> {

    const query = `
      UPDATE data_retention_records 
      SET status = $1, scheduled_deletion = $2, exceptions = $3, 
          actual_deletion = $4, last_reviewed = $5, reviewed_by = $6
      WHERE record_id = $7
    `;
    
    await this.db.query(query, [
      record.status,
      record.scheduledDeletion,
      JSON.stringify(record.exceptions),
      record.actualDeletion,
      record.lastReviewed,
      record.reviewedBy,
      record.recordId
    ]);


  private async getRetentionRecord(recordId: string): Promise<RetentionRecord | null> {

    const query = 'SELECT * FROM data_retention_records WHERE record_id = $1';
    const result = await this.db.query(query, [recordId]);
    return result.rows[0] || null;


  private async saveRetentionJob(job: RetentionJob): Promise<void> {

    const query = `
      INSERT INTO retention_jobs (
        job_id, job_type, status, scheduled_at, records_processed,
        records_deleted, records_archived, errors
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;
    
    await this.db.query(query, [
      job.jobId,
      job.jobType,
      job.status,
      job.scheduledAt,
      job.recordsProcessed,
      job.recordsDeleted,
      job.recordsArchived,
      JSON.stringify(job.errors)
    ]);


  private async updateRetentionJob(job: RetentionJob): Promise<void> {

    const query = `
      UPDATE retention_jobs 
      SET status = $1, started_at = $2, completed_at = $3, 
          records_processed = $4, records_deleted = $5, 
          records_archived = $6, errors = $7
      WHERE job_id = $8
    `;
    
    await this.db.query(query, [
      job.status,
      job.startedAt,
      job.completedAt,
      job.recordsProcessed,
      job.recordsDeleted,
      job.recordsArchived,
      JSON.stringify(job.errors),
      job.jobId
    ]);


  private async getRetentionJob(jobId: string): Promise<RetentionJob | null> {

    const query = 'SELECT * FROM retention_jobs WHERE job_id = $1';
    const result = await this.db.query(query, [jobId]);
    return result.rows[0] || null;


  private async logRetentionEvent(
    eventType: string,
    record: RetentionRecord,
    additionalData?: any
  ): Promise<void> {

    await this.auditService.logEvent({
      eventType: `RETENTION_${eventType}`,
      userId: record.userId || 'system',
      details: {
        recordId: record.recordId,
        dataId: record.dataId,
        category: record.category,
        status: record.status,
        ...additionalData

      timestamp: new Date()
    });

