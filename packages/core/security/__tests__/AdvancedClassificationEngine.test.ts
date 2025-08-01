/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

/**
 * Test Suite for Advanced Classification Engine
 * 
 * Tests comprehensive classification features including ML integration,
 * workflow automation, contextual analysis, and analytics.
 */
import { AdvancedClassificationEngine,
  MLClassificationModel,
  ClassificationWorkflow,
  ClassificationContext }
  EnhancedClassificationResult
 from '../AdvancedClassificationEngine';
import { DataElement,
  ClassificationLevel,
  DataCategory }
  ComplianceFramework
 from '../DataClassifier';
describe('AdvancedClassificationEngine', () => { let engine: AdvancedClassificationEngine;
  const testDataElement: DataElement = {,
  id: 'data-123',
  fieldName: 'email_address',
  value: 'john.doe@example.com',
  dataType: 'string',
  context: {,
  formField: 'user_registration',
  source: 'web_form' }
},
  source: 'user_input',
    timestamp: new Date();
  };
  const testContext: ClassificationContext = { ,
  source: 'user_registration_form',
  purpose: 'user_account_creation',
  userContext: {,
  userId: 'user-456',
  role: 'standard_user',
  department: 'marketing',
  clearanceLevel: 'low' }
},
  environmentContext: { ,
  system: 'web_app',
  network: 'corporate',
  location: 'domestic',
  timezone: 'America/New_York' }
};
  beforeEach(() => { jest.useFakeTimers();
    engine = new AdvancedClassificationEngine() });
  afterEach(() => { jest.useRealTimers();
    engine.removeAllListeners();
    engine.destroy() });
  describe('Enhanced Classification', () => { test('should perform enhanced classification with context', async () => {
      const result = await engine.classifyWithContext(testDataElement, testContext);
      expect(result).toBeDefined();
      expect(result.level).toBe(ClassificationLevel.RESTRICTED);
      expect(result.category).toBe(DataCategory.PII);
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.mlPredictions).toBeDefined();
      expect(result.contextualFactors).toBeDefined();
      expect(result.riskScore).toBeGreaterThan(0);
      expect(result.remediation).toBeDefined();
      expect(result.workflowsTriggered).toBeDefined();
      expect(result.reviewRequired).toBeDefined() });
    test('should apply ML model predictions', async () => { const result = await engine.classifyWithContext(testDataElement, testContext);
      expect(result.mlPredictions).toHaveLength(3); // Default models
      const piiDetector = result.mlPredictions.find(p => p.model === 'pii-detector');
      expect(piiDetector).toBeDefined();
      expect(piiDetector?.confidence).toBeGreaterThan(0.8);
      expect(piiDetector?.prediction).toBe(ClassificationLevel.RESTRICTED) });
    test('should analyze contextual factors', async () => { const highRiskContext: ClassificationContext = {,
  ...testContext,
  environmentContext: {,
  ...testContext.environmentContext,
  network: 'public',
  location: 'international' }
};
      const result = await engine.classifyWithContext(testDataElement, highRiskContext);
      expect(result.contextualFactors.length).toBeGreaterThan(0);
      expect(result.contextualFactors).toContainEqual()
        expect.objectContaining({ )
  factor: 'network_exposure_risk',
  impact: expect.any(Number),
  description: expect.stringContaining('public network') }

      );
    });
    test('should calculate risk scores appropriately', async () => { const lowRiskData: DataElement = {,
  ...testDataElement,
  value: 'public information',
  fieldName: 'description' }
};
      const highRiskData: DataElement = { ...testDataElement,
  value: 'SSN: 123-45-6789, Credit Card: 4111-1111-1111-1111',
  fieldName: 'sensitive_data' }
};
      const lowRiskResult = await engine.classifyWithContext(lowRiskData, testContext);
      const highRiskResult = await engine.classifyWithContext(highRiskData, testContext);
      expect(highRiskResult.riskScore).toBeGreaterThan(lowRiskResult.riskScore);
      expect(highRiskResult.riskScore).toBeGreaterThan(70);
    });
    test('should determine review requirements', async () => { const sensitiveData: DataElement = {,
  ...testDataElement,
  value: 'Patient ID: 12345, SSN: 987-65-4321',
  fieldName: 'patient_info' }
};
      const result = await engine.classifyWithContext(sensitiveData, testContext);
      expect(result.reviewRequired).toBe(true);
      expect(result.reviewReason).toBeDefined();
    });
    test('should generate appropriate remediation actions', async () => { const result = await engine.classifyWithContext(testDataElement, testContext);
      expect(result.remediation.length).toBeGreaterThan(0);
      const encryptionAction = result.remediation.find(r => r.action === 'enable_encryption');
      expect(encryptionAction).toBeDefined();
      expect(encryptionAction?.priority).toBe('high') });
  });
  describe('ML Model Management', () => { test('should add ML models', () => {
  const eventHandler = jest.fn<unknown, unknown>();
  engine.on('mlModelAdded', eventHandler);
  const testModel: MLClassificationModel = {
  id: 'test-model'
  name: 'Test Classification Model'
  type: 'text_classifier'
  version: '1.0'
  accuracy: 0.85
  trainingData: 1000
  lastTrained: new Date()
  enabled: true
  threshold: 0.7
  categories: [DataCategory.BUSINESS]
  features: ['textLength', 'hasKeywords'] }
};
      engine.addMLModel(testModel);
      expect(eventHandler).toHaveBeenCalledWith({ )
  modelId: 'test-model'
  name: 'Test Classification Model'
  type: 'text_classifier'
  accuracy: 0.85 }
});
    });
    test('should train ML models', async () => { const eventHandler = jest.fn<unknown, unknown>();
  engine.on('mlModelTrained', eventHandler);
  const trainingData = [
  {
  data: testDataElement
  expectedClassification: ClassificationLevel.RESTRICTED
  context: testContext }

        { data: {
  ...testDataElement
  id: 'data-456'
  value: 'public information' }

  expectedClassification: ClassificationLevel.PUBLIC];
      const result = await engine.trainMLModel('pii-detector', trainingData);
      expect(result.accuracy).toBeGreaterThan(0.8);
      expect(result.metrics).toBeDefined();
      expect(result.metrics.precision).toBeDefined();
      expect(result.metrics.recall).toBeDefined();
      expect(result.metrics.f1Score).toBeDefined();
      expect(eventHandler).toHaveBeenCalledWith()
        expect.objectContaining({ )
  modelId: 'pii-detector'
  accuracy: expect.any(Number)
  trainingDataSize: 2
  trainingTime: expect.any(Number) }

      );
    });
    test('should handle training non-existent models', async () => {
      const trainingData = [
        { data: testDataElement, expectedClassification: ClassificationLevel.RESTRICTED }
      ];
      await expect()
        engine.trainMLModel('non-existent-model', trainingData)
      ).rejects.toThrow('ML model not found: non-existent-model');
    });
  });
  describe('Workflow Management', () => { test('should add classification workflows', () => {
      const eventHandler = jest.fn<unknown, unknown>();
      engine.on('workflowAdded', eventHandler);
      const testWorkflow: ClassificationWorkflow = {
  id: 'test-workflow'
        name: 'Test Workflow'
        description: 'Test classification workflow' }
        triggers: [{ type: 'classification_complete', conditions: {} }]
        actions: [{ type: 'notify', parameters: { recipient: 'admin' }, timeout: 5000 }]
        conditions: []
        enabled: true
        priority: 1;
  };
      engine.addWorkflow(testWorkflow);
      expect(eventHandler).toHaveBeenCalledWith({ )
  workflowId: 'test-workflow'
  name: 'Test Workflow'
  triggers: 1
  actions: 1 }
});
    });
    test('should execute workflows based on triggers', async () => { const notificationHandler = jest.fn<unknown, unknown>();
      engine.on('workflowNotification', notificationHandler);
      const highRiskWorkflow: ClassificationWorkflow = {
  id: 'high-risk-test'
        name: 'High Risk Test Workflow'
        description: 'Test workflow for high risk data' }
        triggers: [{ type: 'threshold_exceeded', conditions: { riskScore: 50 } }]
        actions: [{ type: 'notify', parameters: { recipient: 'security-team' }, timeout: 5000 }]
        conditions: []
        enabled: true
        priority: 1;
  };
      engine.addWorkflow(highRiskWorkflow);
      // Classify data that should trigger the workflow
      await engine.classifyWithContext(testDataElement, testContext);
      expect(notificationHandler).toHaveBeenCalledWith()
        expect.objectContaining({ )
  recipient: 'security-team'
  subject: expect.stringContaining('Classification Alert')
  priority: 'medium' }

      );
    });
    test('should execute workflows manually', async () => { const workflowHandler = jest.fn<unknown, unknown>();
  engine.on('workflowExecuted', workflowHandler);
  const result = await engine.classifyWithContext(testDataElement, testContext);
  await engine.executeWorkflow('high-risk-alert', result, testContext);
  expect(workflowHandler).toHaveBeenCalledWith()
  expect.objectContaining({)
  workflowId: 'high-risk-alert'
  result: 'success'
  actionsExecuted: expect.any(Number) }

      );
    });
    test('should handle workflow execution errors', async () => { const errorHandler = jest.fn<unknown, unknown>();
      engine.on('workflowExecutionError', errorHandler);
      const invalidWorkflow: ClassificationWorkflow = {
  id: 'invalid-workflow'
        name: 'Invalid Workflow'
        description: 'Workflow with invalid action'
        triggers: [] }
        actions: [{ type: 'invalid_action' as any, parameters: {}, timeout: 5000 }]
        conditions: []
        enabled: true
        priority: 1;
  };
      engine.addWorkflow(invalidWorkflow);
      const result = await engine.classifyWithContext(testDataElement, testContext);
      await engine.executeWorkflow('invalid-workflow', result, testContext);
      expect(errorHandler).toHaveBeenCalled();
    });
  });
  describe('Stream Classification', () => {
    test('should classify data streams', async () => {
      const streamData = [
        { ...testDataElement, id: 'stream-1', value: 'user1@example.com' }
        { ...testDataElement, id: 'stream-2', value: 'user2@example.com' }
        { ...testDataElement, id: 'stream-3', value: 'public information' }
      ];
      async function* dataGenerator() { for (const data of streamData) {
  yield data;
  const results: EnhancedClassificationResult = [];
  const resultStream = await engine.classifyStream(dataGenerator(), testContext);
  for await (const result of resultStream) {
  results.push(result);
  expect(results).toHaveLength(3);
  expect(results[0].level).toBe(ClassificationLevel.RESTRICTED);
  expect(results[1].level).toBe(ClassificationLevel.RESTRICTED);
  expect(results[2].level).toBe(ClassificationLevel.INTERNAL) });
    test('should emit stream events', async () => {
      const startHandler = jest.fn<unknown, unknown>();
      const progressHandler = jest.fn<unknown, unknown>();
      const completeHandler = jest.fn<unknown, unknown>();
      engine.on('streamClassificationStarted', startHandler);
      engine.on('streamProgress', progressHandler);
      engine.on('streamClassificationComplete', completeHandler);
      const streamData = Array.from({ length: 150 }, (_, i) => ({ )
  ...testDataElement }
        id: `stream-${i}`}

  value: `data-${i}@example.com`}
      }));
      async function* dataGenerator() { for (const data of streamData) {
  yield data;
  const resultStream = await engine.classifyStream(dataGenerator(), testContext);
  // Consume the stream
  const results = [];
  for await (const result of resultStream) {
  results.push(result);
  expect(startHandler).toHaveBeenCalledWith({)
  source: testContext.source
  timestamp: expect.any(Date) }
});
      expect(progressHandler).toHaveBeenCalledWith({ )
  processed: 100
  timestamp: expect.any(Date) }
});
      expect(completeHandler).toHaveBeenCalledWith({ )
  totalProcessed: 150
  results: expect.any(Array)
  timestamp: expect.any(Date) }
});
    });
  });
  describe('Analytics and Reporting', () => { test('should track classification analytics', async () => {
  // Perform several classifications
  await engine.classifyWithContext(testDataElement, testContext);
  await engine.classifyWithContext({)
  ...testDataElement
  id: 'data-456'
  value: 'public information' }
}, testContext);
      const analytics = engine.getAnalytics();
      expect(analytics.totalClassifications).toBe(2);
      expect(analytics.classificationsByLevel[ClassificationLevel.RESTRICTED]).toBe(1);
      expect(analytics.classificationsByLevel[ClassificationLevel.INTERNAL]).toBe(1);
      expect(analytics.classificationsByCategory[DataCategory.PII]).toBe(1);
      expect(analytics.averageConfidence).toBeGreaterThan(0);
      expect(analytics.temporalTrends.length).toBeGreaterThan(0);
      expect(analytics.lastUpdated).toBeInstanceOf(Date);
    });
    test('should generate compliance reports', async () => { await engine.classifyWithContext(testDataElement, testContext);
  const report = engine.generateComplianceReport(;);
  ComplianceFramework.GDPR
  {
  start: new Date(Date.now() - 86400000), // 24 hours ago }
  end: new Date());
  expect(report.framework).toBe(ComplianceFramework.GDPR);
  expect(report.period).toBeDefined();
  expect(report.totalClassifications).toBeGreaterThan(0);
  expect(report.compliantClassifications).toBeGreaterThan(0);
  expect(report.violations).toBeDefined();
  expect(report.recommendations).toBeDefined();
  expect(report.recommendations.length).toBeGreaterThan(0);
});
    test('should track data flows', async () => { const contextWithDataFlow: ClassificationContext = {
  ...testContext
  dataFlow: {
  id: 'flow-123'
  source: 'user_input'
  destination: 'database'
  dataTypes: []
  classificationLevels: []
  encryptionInTransit: false
  lastClassified: new Date()
  riskScore: 0
  complianceStatus: 'unknown' }
};
      await engine.classifyWithContext(testDataElement, contextWithDataFlow);
      const dataFlows = engine.getDataFlows();
      expect(dataFlows.length).toBe(1);
      const flow = dataFlows[0];
      expect(flow.id).toBe('flow-123');
      expect(flow.dataTypes).toContain(DataCategory.PII);
      expect(flow.classificationLevels).toContain(ClassificationLevel.RESTRICTED);
      expect(flow.riskScore).toBeGreaterThan(0);
      expect(flow.complianceStatus).toBe('violation'); // Due to unencrypted sensitive data
    });
  });
  describe('Error Handling', () => { test('should handle classification errors gracefully', async () => {
      const errorHandler = jest.fn<unknown, unknown>();
      engine.on('classificationError', errorHandler);
      const invalidData: DataElement = {
  id: 'invalid-data'
        fieldName: ''
        value: null
        dataType: 'unknown' }
        context: {}
        source: 'test'
        timestamp: new Date();
  };
      try { await engine.classifyWithContext(invalidData, testContext) } catch (error) { // Expected to throw
  expect(errorHandler).toHaveBeenCalledWith()
  expect.objectContaining({)
  dataId: 'invalid-data'
  error: expect.any(String)
  context: testContext }

      );
    });
    test('should handle stream element errors', async () => { const errorHandler = jest.fn<unknown, unknown>();
      engine.on('streamElementError', errorHandler);
      async function* dataGeneratorWithError() {
        yield testDataElement;
        yield {
          id: 'invalid-data'
          fieldName: ''
          value: null
          dataType: 'unknown' }
          context: {}
          source: 'test'
          timestamp: new Date();
 as DataElement;
        yield { ...testDataElement, id: 'valid-data-after-error' };
      const resultStream = await engine.classifyStream(dataGeneratorWithError(), testContext);
      const results = [];
      for await (const result of resultStream) { results.push(result);
  // Should process valid elements and skip invalid ones
  expect(results.length).toBe(2);
  expect(errorHandler).toHaveBeenCalledWith()
  expect.objectContaining({)
  dataId: 'invalid-data'
  error: expect.any(String) }

      );
    });
  });
  describe('Event Emission', () => { test('should emit enhanced classification complete events', async () => {
  const eventHandler = jest.fn<unknown, unknown>();
  engine.on('enhancedClassificationComplete', eventHandler);
  const result = await engine.classifyWithContext(testDataElement, testContext);
  expect(eventHandler).toHaveBeenCalledWith({)
  dataId: testDataElement.id
  result
  context: testContext
  processingTime: expect.any(Number) }
});
    });
    test('should emit workflow-related events', async () => { const notificationHandler = jest.fn<unknown, unknown>();
  const auditHandler = jest.fn<unknown, unknown>();
  engine.on('workflowNotification', notificationHandler);
  engine.on('workflowAuditLog', auditHandler);
  // This should trigger default workflows
  await engine.classifyWithContext(testDataElement, testContext);
  // PII protection workflow should be triggered
  expect(auditHandler).toHaveBeenCalledWith()
  expect.objectContaining({)
  event: 'pii_data_protected'
  timestamp: expect.any(Date) }

      );
    });
    test('should emit analytics update events', async () => { const analyticsHandler = jest.fn<unknown, unknown>();
  engine.on('analyticsUpdate', analyticsHandler);
  // Fast forward to trigger analytics update
  jest.advanceTimersByTime(300000); // 5 minutes
  expect(analyticsHandler).toHaveBeenCalledWith()
  expect.objectContaining({)
  totalClassifications: expect.any(Number)
  lastUpdated: expect.any(Date) }

      );
    });
  });
  describe('Resource Management', () => { test('should destroy properly', () => {
      const analytics = engine.getAnalytics();
      expect(analytics.totalClassifications).toBe(0);
      engine.destroy();
      // Should not throw errors after destruction
      expect(() => engine.getAnalytics()).not.toThrow() });
  });
});