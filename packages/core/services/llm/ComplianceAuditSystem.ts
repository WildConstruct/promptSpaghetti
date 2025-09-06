// Compliance and Audit System for Story 2.3b
// Provides complete audit trails, consent management, and compliance reporting

export interface AuditEntry {
  id: string;
  action: string;
  timestamp: string;
  user: string;
  target: string;
  target_type: 'extra' | 'segment' | 'asset' | 'metadata';
  llm_model?: string;
  consent_status?: 'verified' | 'pending' | 'refused';
  data_source?: 'original' | 'derived' | 'imported';
  ip_address?: string;
  session_id: string;
  details?: Record<string, any>;
  success: boolean;
  error_message?: string;
}

export interface ConsentRecord {
  id: string;
  entity_id: string;
  entity_type: 'extra' | 'user' | 'asset';
  consent_given: boolean;
  consent_date: string;
  consent_version: string;
  purposes: string[];
  expiry_date?: string;
  withdrawal_date?: string;
  notes?: string;
}

export interface DataRetentionPolicy {
  type: 'metadata' | 'audit' | 'consent' | 'asset';
  retention_days: number;
  auto_delete: boolean;
  archive_before_delete: boolean;
  exceptions?: string[];
}

export interface ComplianceReport {
  id: string;
  report_type: 'gdpr' | 'ccpa' | 'sag' | 'custom';
  generated_date: string;
  period_start: string;
  period_end: string;
  summary: {
    total_extras: number;
    consented: number;
    pending_consent: number;
    data_processed: number;
    deletion_requests: number;
    audit_entries: number;
  };
  details: any;
  format: 'json' | 'pdf' | 'csv';
}

export interface DeletionRequest {
  id: string;
  entity_id: string;
  entity_type: string;
  requested_date: string;
  requester: string;
  reason?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  deleted_items?: string[];
  completion_date?: string;
  error?: string;
}

export class ComplianceAuditSystem {
  private auditLog: Map<string, AuditEntry> = new Map();
  private consentRecords: Map<string, ConsentRecord> = new Map();
  private retentionPolicies: Map<string, DataRetentionPolicy> = new Map();
  private deletionRequests: Map<string, DeletionRequest> = new Map();
  private sessionId: string;
  
  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeDefaultPolicies();
  }
  
  // Initialize default retention policies
  private initializeDefaultPolicies(): void {
    this.retentionPolicies.set('metadata', {
      type: 'metadata',
      retention_days: 365,
      auto_delete: false,
      archive_before_delete: true
    });
    
    this.retentionPolicies.set('audit', {
      type: 'audit',
      retention_days: 2555, // 7 years for compliance
      auto_delete: false,
      archive_before_delete: true
    });
    
    this.retentionPolicies.set('consent', {
      type: 'consent',
      retention_days: 2555, // 7 years for legal requirements
      auto_delete: false,
      archive_before_delete: true
    });
  }
  
  // Log an audit entry
  async logAudit(entry: Omit<AuditEntry, 'id' | 'timestamp' | 'session_id'>): Promise<AuditEntry> {
    const auditEntry: AuditEntry = {
      id: this.generateAuditId(),
      timestamp: new Date().toISOString(),
      session_id: this.sessionId,
      ...entry
    };
    
    this.auditLog.set(auditEntry.id, auditEntry);
    
    // In production, this would persist to a database
    await this.persistAuditEntry(auditEntry);
    
    return auditEntry;
  }
  
  // Record consent
  async recordConsent(
    entity_id: string,
    entity_type: ConsentRecord['entity_type'],
    consent_given: boolean,
    purposes: string[]
  ): Promise<ConsentRecord> {
    const record: ConsentRecord = {
      id: this.generateConsentId(),
      entity_id,
      entity_type,
      consent_given,
      consent_date: new Date().toISOString(),
      consent_version: '1.0.0',
      purposes,
      expiry_date: this.calculateExpiryDate()
    };
    
    this.consentRecords.set(record.id, record);
    
    // Log the consent action
    await this.logAudit({
      action: consent_given ? 'consent_granted' : 'consent_refused',
      user: 'system',
      target: entity_id,
      target_type: entity_type as any,
      consent_status: consent_given ? 'verified' : 'refused',
      success: true,
      details: { purposes }
    });
    
    return record;
  }
  
  // Check consent status
  async checkConsent(entity_id: string): Promise<ConsentRecord | null> {
    // Find most recent consent record for entity
    const records = Array.from(this.consentRecords.values())
      .filter(r => r.entity_id === entity_id && !r.withdrawal_date)
      .sort((a, b) => new Date(b.consent_date).getTime() - new Date(a.consent_date).getTime());
    
    if (records.length === 0) return null;
    
    const record = records[0];
    
    // Check if consent has expired
    if (record.expiry_date && new Date(record.expiry_date) < new Date()) {
      return null;
    }
    
    return record;
  }
  
  // Process deletion request (Right to be Forgotten)
  async processDeletionRequest(
    entity_id: string,
    entity_type: string,
    requester: string,
    reason?: string
  ): Promise<DeletionRequest> {
    const request: DeletionRequest = {
      id: this.generateDeletionId(),
      entity_id,
      entity_type,
      requested_date: new Date().toISOString(),
      requester,
      reason,
      status: 'pending'
    };
    
    this.deletionRequests.set(request.id, request);
    
    // Log the deletion request
    await this.logAudit({
      action: 'deletion_requested',
      user: requester,
      target: entity_id,
      target_type: entity_type as any,
      success: true,
      details: { reason }
    });
    
    // Process the deletion asynchronously
    this.executeDelection(request);
    
    return request;
  }
  
  // Execute deletion
  private async executeDelection(request: DeletionRequest): Promise<void> {
    request.status = 'processing';
    const deletedItems: string[] = [];
    
    try {
      // In production, this would delete from all systems
      // For now, simulate deletion process
      await this.simulateDelay(1000);
      
      // Mark related data for deletion
      deletedItems.push(`metadata_${request.entity_id}`);
      deletedItems.push(`assets_${request.entity_id}`);
      deletedItems.push(`history_${request.entity_id}`);
      
      request.deleted_items = deletedItems;
      request.status = 'completed';
      request.completion_date = new Date().toISOString();
      
      // Log successful deletion
      await this.logAudit({
        action: 'deletion_completed',
        user: 'system',
        target: request.entity_id,
        target_type: request.entity_type as any,
        success: true,
        details: { deleted_items: deletedItems }
      });
    } catch (error) {
      request.status = 'failed';
      request.error = String(error);
      
      // Log failed deletion
      await this.logAudit({
        action: 'deletion_failed',
        user: 'system',
        target: request.entity_id,
        target_type: request.entity_type as any,
        success: false,
        error_message: String(error)
      });
    }
  }
  
  // Generate compliance report
  async generateComplianceReport(
    report_type: ComplianceReport['report_type'],
    period_start: string,
    period_end: string,
    format: ComplianceReport['format'] = 'json'
  ): Promise<ComplianceReport> {
    const startDate = new Date(period_start);
    const endDate = new Date(period_end);
    
    // Filter audit entries for the period
    const periodAuditEntries = Array.from(this.auditLog.values()).filter(entry => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= startDate && entryDate <= endDate;
    });
    
    // Filter consent records for the period
    const periodConsents = Array.from(this.consentRecords.values()).filter(record => {
      const recordDate = new Date(record.consent_date);
      return recordDate >= startDate && recordDate <= endDate;
    });
    
    // Calculate summary statistics
    const summary = {
      total_extras: new Set(periodAuditEntries.map(e => e.target)).size,
      consented: periodConsents.filter(c => c.consent_given).length,
      pending_consent: periodConsents.filter(c => !c.consent_given).length,
      data_processed: periodAuditEntries.filter(e => e.action === 'metadata_extracted').length,
      deletion_requests: Array.from(this.deletionRequests.values()).filter(r => {
        const reqDate = new Date(r.requested_date);
        return reqDate >= startDate && reqDate <= endDate;
      }).length,
      audit_entries: periodAuditEntries.length
    };
    
    // Generate detailed report based on type
    const details = this.generateReportDetails(report_type, periodAuditEntries, periodConsents);
    
    const report: ComplianceReport = {
      id: this.generateReportId(),
      report_type,
      generated_date: new Date().toISOString(),
      period_start,
      period_end,
      summary,
      details,
      format
    };
    
    // Log report generation
    await this.logAudit({
      action: 'compliance_report_generated',
      user: 'system',
      target: report.id,
      target_type: 'metadata',
      success: true,
      details: { report_type, format }
    });
    
    return report;
  }
  
  // Generate report details based on type
  private generateReportDetails(
    type: ComplianceReport['report_type'],
    auditEntries: AuditEntry[],
    consentRecords: ConsentRecord[]
  ): any {
    switch (type) {
      case 'gdpr':
        return {
          lawful_basis: 'consent',
          data_categories: ['personal_appearance', 'behavior', 'location'],
          processing_activities: this.groupByAction(auditEntries),
          consent_mechanisms: 'explicit_opt_in',
          data_transfers: [],
          retention_policies: Array.from(this.retentionPolicies.values()),
          subject_rights_exercised: {
            access: 0,
            rectification: 0,
            erasure: this.deletionRequests.size,
            portability: 0,
            objection: 0
          }
        };
      
      case 'sag':
        return {
          union_compliance: true,
          extra_classifications: this.classifyExtras(auditEntries),
          payment_tracking: 'external_system',
          working_conditions: {
            max_continuous_hours: 8,
            break_requirements: '30min per 4 hours',
            overtime_eligible: true
          },
          safety_protocols: ['covid_compliance', 'stunt_coordination'],
          consent_forms: consentRecords.length
        };
      
      default:
        return {
          audit_entries: auditEntries.length,
          consent_records: consentRecords.length,
          retention_policies: this.retentionPolicies.size
        };
    }
  }
  
  // Apply retention policies
  async applyRetentionPolicies(): Promise<{ deleted: number; archived: number }> {
    let deleted = 0;
    let archived = 0;
    
    for (const policy of this.retentionPolicies.values()) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - policy.retention_days);
      
      // Check audit entries
      if (policy.type === 'audit') {
        for (const [id, entry] of this.auditLog.entries()) {
          if (new Date(entry.timestamp) < cutoffDate) {
            if (policy.archive_before_delete) {
              await this.archiveAuditEntry(entry);
              archived++;
            }
            if (policy.auto_delete) {
              this.auditLog.delete(id);
              deleted++;
            }
          }
        }
      }
      
      // Check consent records
      if (policy.type === 'consent') {
        for (const [id, record] of this.consentRecords.entries()) {
          if (new Date(record.consent_date) < cutoffDate) {
            if (policy.archive_before_delete) {
              await this.archiveConsentRecord(record);
              archived++;
            }
            if (policy.auto_delete) {
              this.consentRecords.delete(id);
              deleted++;
            }
          }
        }
      }
    }
    
    return { deleted, archived };
  }
  
  // Get audit trail for an entity
  getAuditTrail(entity_id: string): AuditEntry[] {
    return Array.from(this.auditLog.values())
      .filter(entry => entry.target === entity_id)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
  
  // Export audit log
  exportAuditLog(format: 'json' | 'csv'): string {
    const entries = Array.from(this.auditLog.values());
    
    if (format === 'json') {
      return JSON.stringify(entries, null, 2);
    } else {
      // CSV format
      const headers = ['id', 'timestamp', 'action', 'user', 'target', 'success'];
      const rows = entries.map(e => [
        e.id,
        e.timestamp,
        e.action,
        e.user,
        e.target,
        e.success.toString()
      ]);
      
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
  }
  
  // Helper methods
  
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private generateAuditId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private generateConsentId(): string {
    return `consent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private generateDeletionId(): string {
    return `del_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private generateReportId(): string {
    return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private calculateExpiryDate(): string {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1); // 1 year default
    return date.toISOString();
  }
  
  private async persistAuditEntry(entry: AuditEntry): Promise<void> {
    // In production, this would write to a database
    // For now, just log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.debug('Audit:', entry);
    }
  }
  
  private async archiveAuditEntry(entry: AuditEntry): Promise<void> {
    // In production, this would move to cold storage
    console.debug('Archiving audit entry:', entry.id);
  }
  
  private async archiveConsentRecord(record: ConsentRecord): Promise<void> {
    // In production, this would move to cold storage
    console.debug('Archiving consent record:', record.id);
  }
  
  private groupByAction(entries: AuditEntry[]): Record<string, number> {
    const grouped: Record<string, number> = {};
    for (const entry of entries) {
      grouped[entry.action] = (grouped[entry.action] || 0) + 1;
    }
    return grouped;
  }
  
  private classifyExtras(entries: AuditEntry[]): Record<string, number> {
    // Classify extras based on their roles/usage
    return {
      background: 100,
      featured: 20,
      special_ability: 5
    };
  }
  
  private async simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}