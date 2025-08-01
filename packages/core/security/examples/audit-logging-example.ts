/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

/**
 * Example demonstrating comprehensive audit logging for data access
 * 
 * Shows how to:
 * - Set up audit logging with different storage backends
 * - Log various types of data access operations
 * - Integrate with classification and enforcement
 * - Generate compliance reports
 * - Handle security events and anomalies
 * 
 * Epic 19 Task T-1752989143998-485: Implement audit logging for data access
 */
import { AuditLogger,
  AuditOperation,
  AuditLogLevel,
  createAuditLogger,
  type AuditStorageBackend }
  type AuditLogEntry
 from '../AuditLogger';
import { AuditIntegration }
  createAuditIntegration
 from '../AuditIntegration';
import { DataClassifier } from '../DataClassifier';
import { ClassificationEnforcer } from '../ClassificationEnforcer';
import { DataClassificationLevel }
  type OperationContext
 from '../../types/DataClassification';
/**
 * Example 1: Basic audit logging setup
 */
async function basicAuditLogging() { console.log('\n=== Basic Audit Logging ===\n');
  // Create audit logger with default in-memory storage
  const auditLogger = createAuditLogger({)
  logLevel: AuditLogLevel.DETAILED,
  bufferSize: 10,
  flushInterval: 1000 }
});
  // Log a simple data access
  const context: OperationContext = { ,
  userId: 'user123',
  userRole: 'analyst',
  purpose: 'quarterly report',
  ipAddress: '192.168.1.100',
  sessionId: 'session-abc-123',
  requestedAt: new Date() }
};
  await auditLogger.logDataAccess()
    context,
    'financial_records',
    'q4_2024_revenue',
    DataClassificationLevel.CONFIDENTIAL,
    true,
    { recordCount: 1500,
  dataSize: 2048000,
  exportFormat: 'CSV');
  console.log('✓ Logged financial data access');
  // Log different operation types
  await auditLogger.log({)
  userId: 'admin456',
  userRole: 'admin',
  operation: AuditOperation.GRANT_ACCESS,
  resourceType: 'customer_database',
  resourceId: 'prod_customers',
  dataClassification: DataClassificationLevel.RESTRICTED,
  metadata: {,
  grantedTo: 'user789',
  permissions: ['read', 'export'],
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days }
});
  console.log('✓ Logged access grant operation');
  // Query audit logs
  const logs = await auditLogger.query({ )
  userId: 'user123',
  dataClassification: DataClassificationLevel.CONFIDENTIAL }
});
  console.log(`\nFound ${logs.length} audit entries for user123 accessing confidential data`);}
  logs.forEach(log => {)
  console.log(`  - ${log.operation} on ${log.resourceType}/${log.resourceId} at ${log.timestamp}`);}
  });
  // Get statistics
  const stats = auditLogger.getStatistics();
  console.log('\nAudit Statistics:');
  console.log(`  Total operations: ${stats.totalOperations}`);}
  console.log('  Operation breakdown:', stats.operationCounts);
  auditLogger.destroy();
/**
 * Example 2: Custom storage backend (e.g., database)
 */
class DatabaseStorageBackend implements AuditStorageBackend {
  private db: Map<string, AuditLogEntry> = new Map();
  async write(entry: AuditLogEntry): Promise<void> {

    // In production, this would write to a real database
    this.db.set(entry.id, entry);
    console.log(`  [DB] Written audit log ${entry.id}`);}
  async query(criteria: any): Promise<AuditLogEntry> { // In production, this would query a real database
    const results = Array.from(this.db.values()).filter(entry => {)
  if (criteria.userId && entry.userId !== criteria.userId) return false;
      if (criteria.startDate && entry.timestamp < criteria.startDate) return false;
      if (criteria.endDate && entry.timestamp > criteria.endDate) return false;
      return true });
    return results.slice(0, criteria.limit || 100);
  async delete(id: string): Promise<void> { this.db.delete(id);
  async rotate(): Promise<void> {
  // Archive old logs
  const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // 90 days;
  for (const [id, entry] of this.db) {
  if (entry.timestamp < cutoff) {
  this.db.delete(id);
  async function customStorageExample() {
  console.log('\n=== Custom Storage Backend ===\n');
  const dbBackend = new DatabaseStorageBackend();
  const auditLogger = createAuditLogger({)
  storageBackend: dbBackend,
  asyncLogging: false, // Synchronous for demo,
  encryptLogs: true,
  hashSensitiveData: true }
});
  // Log sensitive operations
  const sensitiveOps = [
    { resource: 'patient_records', id: 'patient_12345' },
    { resource: 'credit_scores', id: 'credit_67890' },
    { resource: 'employee_salaries', id: 'salary_2024' }
  ];
  for (const op of sensitiveOps) { await auditLogger.log({)
  userId: 'analyst789',
  operation: AuditOperation.READ,
  resourceType: op.resource,
  resourceId: op.id,
  dataClassification: DataClassificationLevel.RESTRICTED,
  ipAddress: '10.0.0.50',
  sessionId: 'secure-session-xyz' }
});
  console.log('✓ Logged sensitive operations to custom database backend');
  auditLogger.destroy();
/**
 * Example 3: Integrated audit logging with classification and enforcement
 */
async function integratedAuditExample() { console.log('\n=== Integrated Audit Logging ===\n');
  // Set up components
  const auditLogger = createAuditLogger({)
  logLevel: AuditLogLevel.VERBOSE,
  alertOnAnomaly: true }
});
  const classifier = new DataClassifier();
  const enforcer = new ClassificationEnforcer({ )
  strictMode: true,
  requireExplicitControls: true }
});
  // Create integrated audit system
  const auditIntegration = createAuditIntegration({ )
  auditLogger,
  classificationEnforcer: enforcer,
  dataClassifier: classifier,
  logAllOperations: true,
  enrichWithClassification: true }
});
  // Example 1: Accessing customer data
  const customerData = { name: 'John Doe',
  email: 'john.doe@example.com',
  ssn: '123-45-6789',
  creditCard: '4111-1111-1111-1111',
  address: '123 Main St' }
};
  const context: OperationContext = { ,
  userId: 'support_agent_001',
  userRole: 'support',
  purpose: 'customer verification',
  ipAddress: '192.168.10.25',
  sessionId: 'support-session-456',
  requestedAt: new Date() }
};
  // This will automatically classify the data and check enforcement
  await auditIntegration.logDataAccess()
    context,
    'customer_profile',
    'cust_98765',
    customerData,
    { reason: 'Customer called for account verification',
      ticketId: 'SUPPORT-2024-1234');
  console.log('✓ Logged customer data access with automatic classification');
  // Example 2: Batch operation
  await auditIntegration.logBatchOperation()
    context,
    AuditOperation.EXPORT }
    [
      { type: 'customer', id: 'cust_001', classification: DataClassificationLevel.CONFIDENTIAL },
      { type: 'customer', id: 'cust_002', classification: DataClassificationLevel.CONFIDENTIAL },
      { type: 'customer', id: 'cust_003', classification: DataClassificationLevel.RESTRICTED }
    ],
    true,
    { exportFormat: 'encrypted_zip', destination: 'secure_ftp' }
  );
  console.log('✓ Logged batch export operation');
  // Example 3: Administrative operation
  await auditIntegration.logAdminOperation()
    'GRANT_ACCESS',
    { userId: 'admin001',
  userRole: 'security_admin',
  ipAddress: '10.0.0.5',
  requestedAt: new Date() }

    { userId: 'analyst002',
  resourceType: 'financial_reports',
  resourceId: 'annual_2024',
  classification: DataClassificationLevel.CONFIDENTIAL }

    { approvedBy: 'ciso',
      expiresIn: '30 days',
      justification: 'Annual audit requirement');
  console.log('✓ Logged administrative access grant');
  // Example 4: Security event
  await auditIntegration.logSecurityEvent()
    'SUSPICIOUS_ACCESS_PATTERN',
    context,
    {
      pattern: 'rapid_sequential_access',
      accessCount: 50,
      timeWindow: '5 minutes',
      riskScore: 85);
  console.log('✓ Logged security anomaly event');
  // Generate compliance report
  const report = await auditIntegration.generateComplianceReport(;);
    new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
    new Date() }
    { includeDetails: false }
  );
  console.log('\n📊 Compliance Report (Last 24 Hours):');
  console.log(`  Total Access: ${report.totalAccess}`);}
  console.log(`  Sensitive Access: ${report.sensitiveAccess}`);}
  console.log(`  Denied Access: ${report.deniedAccess}`);}
  console.log(`  Unique Users: ${report.uniqueUsers}`);}
  console.log(`  Anomalies Detected: ${report.anomalies}`);}
  console.log(`  Average Risk Score: ${report.riskMetrics.averageRiskScore.toFixed(2)}`);}
  console.log(`  High Risk Operations: ${report.riskMetrics.highRiskOperations}`);}
  console.log('\n  Classification Breakdown:');
  Object.entries(report.classificationBreakdown).forEach(([level, count]) => {
    console.log(`    ${level}: ${count}`);}
  });
  auditLogger.destroy();
/**
 * Example 4: Handling audit events and alerts
 */
async function auditEventsExample() { console.log('\n=== Audit Events and Alerts ===\n');
  const auditLogger = createAuditLogger({)
  alertOnAnomaly: true,
  alertThresholds: {,
  failedAccessAttempts: 3,
  sensitiveDataAccess: 5,
  highRiskOperations: 2,
  timeWindow: 5 }
});
  // Set up event handlers
  auditLogger.on('audit', (entry) => {
    if (entry.sensitiveAccess && !entry.authorized) {
      console.log(`🚨 ALERT: Unauthorized access attempt to ${entry.dataClassification} data!`);}
      console.log(`   User: ${entry.userId}, Resource: ${entry.resourceType}/${entry.resourceId}`);}
  });
  auditLogger.on('anomaly', (event) => {
    console.log(`⚠️  ANOMALY DETECTED: ${event.type}`);}
    console.log('   Details:', event.entry);
  });
  auditLogger.on('error', (error) => { console.error('❌ Audit Error:', error.message) });
  // Simulate suspicious activity
  const suspiciousContext: OperationContext = { ,
  userId: 'suspicious_user',
  userRole: 'temp_contractor',
  purpose: 'data_export',
  ipAddress: '203.0.113.0', // External IP,
  requestedAt: new Date() }
};
  // Multiple failed access attempts
  for (let i = 0; i < 4; i++) { await auditLogger.log({)
  userId: suspiciousContext.userId,
      operation: AuditOperation.READ,
      resourceType: 'confidential_docs' }
      resourceId: `doc_${i}`}
},
  dataClassification: DataClassificationLevel.CONFIDENTIAL,
      authorized: false,
      success: false,
      denialReason: 'Insufficient privileges',
      anomalyDetected: true,
      riskScore: 75 + i * 5;
  });
  console.log('\n✓ Simulated suspicious activity logged');
  auditLogger.destroy();
/**
 * Example 5: Audit trail for workflows
 */
async function workflowAuditExample() {
  console.log('\n=== Workflow Audit Trail ===\n');
  const auditLogger = createAuditLogger();
  const auditIntegration = createAuditIntegration({ auditLogger });
  // Start a workflow audit trail
  const workflowContext: OperationContext = { ,
  userId: 'workflow_user',
  userRole: 'data_scientist',
  purpose: 'model_training',
  systemId: 'ml_pipeline',
  requestedAt: new Date() }
};
  const correlationId = await auditIntegration.startAuditTrail(;);
    'ml_training_workflow_001',
    workflowContext,
    { modelType: 'customer_churn_prediction' }
      datasetSize: 1000000);
  console.log(`✓ Started workflow audit trail: ${correlationId}`);}
  // Log workflow steps
  const workflowSteps = [
    { step: 'data_loading', resource: 'customer_dataset', classification: DataClassificationLevel.INTERNAL },
    { step: 'data_preprocessing', resource: 'cleaned_dataset', classification: DataClassificationLevel.INTERNAL },
    { step: 'feature_extraction', resource: 'feature_set', classification: DataClassificationLevel.CONFIDENTIAL },
    { step: 'model_training', resource: 'ml_model_v1', classification: DataClassificationLevel.CONFIDENTIAL },
    { step: 'model_evaluation', resource: 'evaluation_metrics', classification: DataClassificationLevel.INTERNAL }
  ];
  for (const step of workflowSteps) { await auditLogger.log({)
  correlationId,
  userId: workflowContext.userId,
  operation: AuditOperation.API_CALL,
  resourceType: 'workflow_step',
  resourceId: step.step,
  dataClassification: step.classification,
  success: true,
  metadata: {,
  workflowId: 'ml_training_workflow_001',
  stepName: step.step,
  outputResource: step.resource }
});
    console.log(`  ✓ Logged workflow step: ${step.step}`);}
  // Query all logs for this workflow
  const workflowLogs = await auditLogger.query({});
  const correlatedLogs = workflowLogs.filter(log => log.correlationId === correlationId);
  console.log('\n📋 Workflow Audit Trail Summary:');
  console.log(`  Correlation ID: ${correlationId}`);}
  console.log(`  Total Steps: ${correlatedLogs.length}`);}
  console.log(`  Duration: ${;)}

    correlatedLogs.length > 0 
      ? new Date(correlatedLogs[correlatedLogs.length - 1].timestamp).getTime() - 
        new Date(correlatedLogs[0].timestamp).getTime() 
      : 0
ms`);
  auditLogger.destroy();
/**
 * Run all examples
 */
async function runExamples() { console.log('🔐 Audit Logging Examples\n');
  console.log('This demonstrates comprehensive audit logging for data access');
  console.log('including integration with classification and enforcement.\n');
  try {
    await basicAuditLogging();
    await customStorageExample();
    await integratedAuditExample();
    await auditEventsExample();
    await workflowAuditExample();
    console.log('\n✅ All audit logging examples completed successfully!') } catch (error) { console.error('\n❌ Error running examples:', error);
  // Run examples if this file is executed directly
  if (require.main === module) {
  runExamples();
  export {
  basicAuditLogging,
  customStorageExample,
  integratedAuditExample,
  auditEventsExample }
  workflowAuditExample
};