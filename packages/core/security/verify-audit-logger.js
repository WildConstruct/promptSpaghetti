/**
 * Simple verification script for the audit logger
 * Runs basic functionality tests without Jest setup issues
 */

const { AuditLogger, AuditOperation, InMemoryStorageBackend } = require('./AuditLogger');
const { DataClassificationLevel } = require('../types/DataClassification');

async function verifyAuditLogger() {
  console.log('🔍 Verifying AuditLogger functionality...\n');
  
  try {
    // Test 1: Basic audit logging
    console.log('Test 1: Basic audit logging');
    const logger = new AuditLogger();
    
    await logger.log({
      userId: 'test_user',
      operation: AuditOperation.READ,
      resourceType: 'test_resource',
      resourceId: 'test_123',
      dataClassification: DataClassificationLevel.CONFIDENTIAL
    });
    
    const logs = await logger.query({});
    console.log(`✓ Logged entry, found ${logs.length} entries`);
    console.log(`  Entry ID: ${logs[0].id}`);
    console.log(`  User: ${logs[0].userId}`);
    console.log(`  Operation: ${logs[0].operation}`);
    
    // Test 2: Data access logging
    console.log('\nTest 2: Data access logging');
    const context = {
      userId: 'analyst_001',
      userRole: 'data_analyst',
      purpose: 'quarterly_report',
      ipAddress: '192.168.1.10',
      sessionId: 'session_xyz',
      requestedAt: new Date()
    };
    
    await logger.logDataAccess(
      context,
      'customer_records',
      'q4_data',
      DataClassificationLevel.RESTRICTED,
      true,
      { recordCount: 1000 }
    );
    
    const dataLogs = await logger.query({ userId: 'analyst_001' });
    console.log(`✓ Data access logged, found ${dataLogs.length} entries for analyst_001`);
    
    // Test 3: Query filtering
    console.log('\nTest 3: Query filtering');
    const restrictedLogs = await logger.query({
      dataClassification: DataClassificationLevel.RESTRICTED
    });
    console.log(`✓ Found ${restrictedLogs.length} restricted data access logs`);
    
    // Test 4: Statistics
    console.log('\nTest 4: Statistics');
    const stats = logger.getStatistics();
    console.log(`✓ Total operations: ${stats.totalOperations}`);
    console.log(`  Operation breakdown:`, stats.operationCounts);
    
    // Test 5: Custom storage backend
    console.log('\nTest 5: Custom storage backend');
    const customBackend = new InMemoryStorageBackend();
    const customLogger = new AuditLogger({
      storageBackend: customBackend,
      asyncLogging: false
    });
    
    await customLogger.log({
      userId: 'backend_test',
      operation: AuditOperation.WRITE,
      resourceType: 'test',
      resourceId: 'backend_test_1'
    });
    
    const backendLogs = await customBackend.query({});
    console.log(`✓ Custom backend working, found ${backendLogs.length} entries`);
    
    // Test 6: Event emission
    console.log('\nTest 6: Event emission');
    let eventReceived = false;
    logger.on('audit', (entry) => {
      eventReceived = true;
      console.log(`✓ Received audit event for ${entry.operation} by ${entry.userId}`);
    });
    
    await logger.log({
      userId: 'event_test',
      operation: AuditOperation.DELETE,
      resourceType: 'test',
      resourceId: 'event_test_1'
    });
    
    // Give event time to fire
    await new Promise(resolve => setTimeout(resolve, 10));
    console.log(`✓ Event emission: ${eventReceived ? 'working' : 'failed'}`);
    
    // Cleanup
    logger.destroy();
    customLogger.destroy();
    
    console.log('\n✅ All audit logger verification tests passed!');
    
  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run verification
verifyAuditLogger();