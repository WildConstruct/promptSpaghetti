// Consent-Based Data Filter Service - Epic 19
// Filters data access and processing based on user consent preferences
// Task: T-1752989143998-885

import { DatabaseService } from '../database/DatabaseService';
import { AuditService } from '../auth/services/AuditService';
import { ConsentData, GranularConsent } from './PolicyAcceptanceTrackingService';
import { DataProtectionRule, RuleEvaluationContext } from '../types/DataProtectionRuleSchema';



export interface FilterRequest {
  userId: string;
  dataType: string;
  operation: DataOperation;
  purpose: string;
  context: FilterContext;







export interface FilterContext {
  requestId: string;
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  metadata?: Record<string, any>;





export enum DataOperation {
  READ = 'READ',
  WRITE = 'write',
  UPDATE = 'update',
  DELETE = 'delete',
  SHARE = 'share',
  PROCESS = 'process',
  ANALYZE = 'analyze'




export interface FilterResult {
  allowed: boolean;
  filteredFields?: string[];
  reason: string;
  consentRequired?: boolean;
  applicableConsents: string[];
  auditEventId: string;







export interface ConsentFilter {
  purpose: string;
  dataTypes: string[];
  operations: DataOperation[];
  required: boolean;
  granted: boolean;
  grantedAt?: Date;
  expiresAt?: Date;





export class ConsentBasedDataFilterService {
  private db: DatabaseService;
  private auditService: AuditService;

  constructor(db: DatabaseService, auditService: AuditService) {
    this.db = db;
    this.auditService = auditService;


  async filterDataAccess(request: FilterRequest): Promise<FilterResult> {

    const userConsents = await this.getUserConsents(request.userId);
    const applicableFilters = this.getApplicableFilters(userConsents, request);
    
    const filterResult = this.evaluateFilters(applicableFilters, request);
    
    // Log the filter decision
    const auditEventId = await this.logFilterDecision(request, filterResult);
    
    return {
      ...filterResult,
      auditEventId
    };


  async getUserConsents(userId: string): Promise<ConsentFilter[]> {

    const query = `
      SELECT consent_data 
      FROM user_policy_acceptances 
      WHERE user_id = $1 
        AND status = 'ACTIVE'
        AND (withdrawal_date IS NULL OR withdrawal_date > NOW())
      ORDER BY accepted_at DESC
    `;
    
    const result = await this.db.query(query, [userId]);
    const filters: ConsentFilter[] = [];
    
    for (const row of result.rows) {
      const consentData = row.consent_data as ConsentData;
      
      for (const granularConsent of consentData.granularConsents) {
        filters.push({
          purpose: granularConsent.purpose,
          dataTypes: granularConsent.dataTypes,
          operations: this.getOperationsForPurpose(granularConsent.purpose),
          required: granularConsent.required,
          granted: granularConsent.granted,
          grantedAt: granularConsent.grantedAt,
          expiresAt: granularConsent.expiresAt
        });


    
    return filters;


  private getApplicableFilters(consents: ConsentFilter[], request: FilterRequest): ConsentFilter[] {
    return consents.filter(consent => 
      consent.dataTypes.includes(request.dataType) &&
      consent.operations.includes(request.operation) &&
      (consent.purpose === request.purpose || consent.purpose === 'all')
    );


  private evaluateFilters(filters: ConsentFilter[], __request: FilterRequest): Omit<FilterResult, 'auditEventId'> {
    const applicableConsents = filters.map(f => f.purpose);
    
    // Check for required consents that are not granted
    const requiredButNotGranted = filters.filter(f => f.required && !f.granted);
    if (requiredButNotGranted.length > 0) {
      return {
        allowed: false,
        reason: `Required consent not granted for purposes: ${requiredButNotGranted.map(f => f.purpose).join(', ')}`,
        consentRequired: true,
        applicableConsents
      };

    
    // Check for expired consents
    const now = new Date();
    const expired = filters.filter(f => f.expiresAt && f.expiresAt < now);
    if (expired.length > 0) {
      return {
        allowed: false,
        reason: `Consent expired for purposes: ${expired.map(f => f.purpose).join(', ')}`,
        consentRequired: true,
        applicableConsents
      };

    
    // Check if any consent allows the operation
    const allowingConsents = filters.filter(f => f.granted);
    if (allowingConsents.length === 0) {
      return {
        allowed: false,
        reason: 'No valid consent found for requested operation',
        consentRequired: true,
        applicableConsents
      };

    
    return {
      allowed: true,
      reason: 'Access granted based on valid consent',
      applicableConsents
    };


  private getOperationsForPurpose(purpose: string): DataOperation[] {
    const purposeOperationMap: Record<string, DataOperation[]> = {
      'service_delivery': [DataOperation.READ, DataOperation.PROCESS],
      'analytics': [DataOperation.READ, DataOperation.ANALYZE],
      'marketing': [DataOperation.READ, DataOperation.SHARE],
      'personalization': [DataOperation.READ, DataOperation.PROCESS],
      'all': Object.values(DataOperation)
    };
    
    return purposeOperationMap[purpose] || [DataOperation.READ];


  private async logFilterDecision(request: FilterRequest, result: Omit<FilterResult, 'auditEventId'>): Promise<string> {

    const auditEvent = {
      eventType: 'CONSENT_FILTER_DECISION',
      userId: request.userId,
      details: {
        dataType: request.dataType,
        operation: request.operation,
        purpose: request.purpose,
        allowed: result.allowed,
        reason: result.reason,
        context: request.context

      timestamp: new Date(),
      ipAddress: request.context.ipAddress,
      userAgent: request.context.userAgent,
      sessionId: request.context.sessionId
    };
    
    return await this.auditService.logEvent(auditEvent);


  async getFilterableFields(userId: string, dataType: string): Promise<string[]> {

    const consents = await this.getUserConsents(userId);
    const grantedPurposes = consents
      .filter(c => c.granted && c.dataTypes.includes(dataType))
      .map(c => c.purpose);
    
    // Return fields based on granted purposes
    const fieldMappings: Record<string, string[]> = {
      'service_delivery': ['id', 'name', 'email'],
      'analytics': ['id', 'usage_data', 'performance_metrics'],
      'marketing': ['id', 'preferences', 'behavior_data'],
      'personalization': ['id', 'preferences', 'interaction_history']
    };
    
    const allowedFields = new Set<string>();
    grantedPurposes.forEach(purpose => {
      const fields = fieldMappings[purpose] || [];
      fields.forEach(field => allowedFields.add(field));
    });
    
    return Array.from(allowedFields);

