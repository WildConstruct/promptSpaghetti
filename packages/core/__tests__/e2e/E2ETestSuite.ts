// E2E Test Suite for Story 2.4 Epic Integration & QA
// Comprehensive testing of all LLM intelligence features

import { LLMService } from '../../services/llm/LLMService';
import { MetadataExtractor } from '../../services/llm/MetadataExtractor';
import { NodeIntelligenceService } from '../../services/llm/NodeIntelligence';
import { ContinuityTracker } from '../../services/llm/ContinuityTracker';
import { SimilarityEngine } from '../../services/llm/SimilarityEngine';
import { BulkOperationsManager } from '../../services/llm/BulkOperationsManager';
import { ComplianceAuditSystem } from '../../services/llm/ComplianceAuditSystem';
import { PerformanceMonitor } from './PerformanceMonitor';

export interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  errors?: string[];
  metrics?: Record<string, any>;
}

export interface TestSuiteResults {
  totalTests: number;
  passed: number;
  failed: number;
  duration: number;
  testResults: TestResult[];
  performanceReport?: any;
  costReport?: any;
}

export class E2ETestSuite {
  private llmService: LLMService;
  private metadataExtractor: MetadataExtractor;
  private nodeIntelligence: NodeIntelligenceService;
  private continuityTracker: ContinuityTracker;
  private similarityEngine: SimilarityEngine;
  private bulkOpsManager: BulkOperationsManager;
  private complianceSystem: ComplianceAuditSystem;
  private performanceMonitor: PerformanceMonitor;
  
  constructor() {
    // Initialize all services
    this.llmService = new LLMService({
      apiKey: process.env.OPENROUTER_API_KEY || 'test-key',
      defaultModel: 'deepseek/deepseek-r1:free',
      maxRetries: 3,
      timeout: 5000
    });
    
    this.metadataExtractor = new MetadataExtractor(this.llmService);
    this.nodeIntelligence = new NodeIntelligenceService(this.llmService);
    this.continuityTracker = new ContinuityTracker();
    this.similarityEngine = new SimilarityEngine(this.llmService);
    this.bulkOpsManager = new BulkOperationsManager(
      this.metadataExtractor,
      this.similarityEngine,
      this.continuityTracker
    );
    this.complianceSystem = new ComplianceAuditSystem();
    this.performanceMonitor = new PerformanceMonitor();
  }
  
  // Run complete integration test suite
  async runFullIntegration(): Promise<TestSuiteResults> {
    const results: TestSuiteResults = {
      totalTests: 0,
      passed: 0,
      failed: 0,
      duration: 0,
      testResults: []
    };
    
    const startTime = Date.now();
    
    try {
      // Setup
      await this.resetEnvironment();
      await this.seedTestData();
      
      // Run test scenarios
      const tests = [
        this.testInfrastructure(),
        this.testNodeIntelligence(),
        this.testMetadataExtraction(),
        this.testContinuityTracking(),
        this.testSimilarityEngine(),
        this.testBulkOperations(),
        this.testIntegration(),
        this.testStressScenario(),
        this.testOfflineMode(),
        this.testVariablePreservation(),
        this.testComplianceAudit()
      ];
      
      const testResults = await Promise.all(tests);
      
      // Collect results
      for (const result of testResults) {
        results.testResults.push(result);
        results.totalTests++;
        if (result.passed) {
          results.passed++;
        } else {
          results.failed++;
        }
      }
      
      // Generate reports
      results.performanceReport = this.performanceMonitor.generateReport();
      results.costReport = await this.generateCostReport();
      
    } catch (error) {
      console.error('Test suite error:', error);
    } finally {
      results.duration = Date.now() - startTime;
    }
    
    return results;
  }
  
  // Test infrastructure components
  async testInfrastructure(): Promise<TestResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let passed = true;
    
    try {
      // Test LLM service connection
      const response = await this.llmService.complete({
        prompt: 'Test prompt',
        maxTokens: 10,
        taskType: 'general'
      });
      
      if (!response) {
        errors.push('LLM service did not return response');
        passed = false;
      }
      
      // Test model fallback
      const models = this.llmService.getAvailableModels();
      if (models.length < 2) {
        errors.push('Insufficient fallback models');
        passed = false;
      }
      
      // Test token tracking
      const usage = this.llmService.getTokenUsage();
      if (!usage) {
        errors.push('Token tracking not working');
        passed = false;
      }
      
      // Test cost tracking
      const cost = this.llmService.getTotalCost();
      if (cost === undefined) {
        errors.push('Cost tracking not working');
        passed = false;
      }
      
      this.performanceMonitor.track('infrastructure_test', Date.now() - startTime);
      
    } catch (error) {
      errors.push(`Infrastructure test failed: ${error}`);
      passed = false;
    }
    
    return {
      name: 'Infrastructure Test',
      passed,
      duration: Date.now() - startTime,
      errors: errors.length > 0 ? errors : undefined
    };
  }
  
  // Test node intelligence features
  async testNodeIntelligence(): Promise<TestResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let passed = true;
    
    try {
      // Test populate choices
      const choices = await this.nodeIntelligence.populateChoices(
        'Extra sees explosion and',
        3
      );
      
      if (!choices || choices.length === 0) {
        errors.push('Populate choices returned no results');
        passed = false;
      }
      
      // Test weight optimization
      const weights = await this.nodeIntelligence.optimizeWeights([
        { text: 'runs away', weight: 50 },
        { text: 'freezes', weight: 30 },
        { text: 'takes cover', weight: 20 }
      ], 'panic');
      
      if (!weights) {
        errors.push('Weight optimization failed');
        passed = false;
      }
      
      // Test variable preservation
      const withVars = await this.nodeIntelligence.populateChoices(
        'Extra {id} sees {event} and',
        3
      );
      
      const hasVars = withVars.some(c => c.text.includes('{id}') && c.text.includes('{event}'));
      if (!hasVars) {
        errors.push('Variables not preserved in choices');
        passed = false;
      }
      
      this.performanceMonitor.track('node_intelligence_test', Date.now() - startTime);
      
    } catch (error) {
      errors.push(`Node intelligence test failed: ${error}`);
      passed = false;
    }
    
    return {
      name: 'Node Intelligence Test',
      passed,
      duration: Date.now() - startTime,
      errors: errors.length > 0 ? errors : undefined
    };
  }
  
  // Test metadata extraction
  async testMetadataExtraction(): Promise<TestResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let passed = true;
    
    try {
      // Test single extraction
      const result = await this.metadataExtractor.extract(
        'Panicked crowd running through urban streets at night'
      );
      
      if (!result.metadata || !result.metadata.tags) {
        errors.push('Metadata extraction returned incomplete data');
        passed = false;
      }
      
      // Test extraction time
      if (result.extractionTime > 500) {
        errors.push(`Extraction too slow: ${result.extractionTime}ms`);
        passed = false;
      }
      
      // Test batch extraction
      const texts = [
        'Car drifting in desert',
        'Explosion in city',
        'Calm forest scene'
      ];
      
      const batchResults = await this.metadataExtractor.extractBatch(texts);
      
      if (batchResults.length !== texts.length) {
        errors.push('Batch extraction incomplete');
        passed = false;
      }
      
      // Test cache hit
      const cachedResult = await this.metadataExtractor.extract(texts[0]);
      if (!cachedResult.fromCache) {
        errors.push('Cache not working');
        passed = false;
      }
      
      this.performanceMonitor.track('metadata_extraction_test', Date.now() - startTime);
      
    } catch (error) {
      errors.push(`Metadata extraction test failed: ${error}`);
      passed = false;
    }
    
    return {
      name: 'Metadata Extraction Test',
      passed,
      duration: Date.now() - startTime,
      errors: errors.length > 0 ? errors : undefined
    };
  }
  
  // Test continuity tracking
  async testContinuityTracking(): Promise<TestResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let passed = true;
    
    try {
      // Create extra profile
      const profile = await this.continuityTracker.createOrUpdateProfile({
        extra_id: 'test_001',
        name: 'Test Extra',
        appearance_traits: ['tall', 'suit'],
        wardrobe_history: [{
          scene: '1',
          timestamp: new Date().toISOString(),
          items: ['blue_suit', 'tie']
        }]
      });
      
      if (!profile || profile.extra_id !== 'test_001') {
        errors.push('Profile creation failed');
        passed = false;
      }
      
      // Test continuity validation
      const validation = await this.continuityTracker.validateContinuity(
        'test_001',
        {
          scene_id: '2',
          time_of_day: 'afternoon',
          location: 'office',
          indoor: true
        }
      );
      
      if (validation.score < 0) {
        errors.push('Continuity validation failed');
        passed = false;
      }
      
      this.performanceMonitor.track('continuity_tracking_test', Date.now() - startTime);
      
    } catch (error) {
      errors.push(`Continuity tracking test failed: ${error}`);
      passed = false;
    }
    
    return {
      name: 'Continuity Tracking Test',
      passed,
      duration: Date.now() - startTime,
      errors: errors.length > 0 ? errors : undefined
    };
  }
  
  // Test similarity engine
  async testSimilarityEngine(): Promise<TestResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let passed = true;
    
    try {
      // Index test assets
      const assets = [
        { id: 'asset1', text: 'Urban chaos scene', metadata: { tags: ['urban', 'chaos'] } },
        { id: 'asset2', text: 'Desert landscape', metadata: { tags: ['desert', 'landscape'] } },
        { id: 'asset3', text: 'City street panic', metadata: { tags: ['urban', 'panic'] } }
      ];
      
      await this.similarityEngine.bulkIndex(assets);
      
      // Test similarity search
      const similar = await this.similarityEngine.findSimilar(
        'chaotic city scene',
        { tags: ['urban'] },
        { limit: 2 }
      );
      
      if (!similar || similar.length === 0) {
        errors.push('Similarity search returned no results');
        passed = false;
      }
      
      // Test clustering
      const clusters = await this.similarityEngine.findClusters(2);
      
      if (!clusters || clusters.length === 0) {
        errors.push('Clustering failed');
        passed = false;
      }
      
      this.performanceMonitor.track('similarity_engine_test', Date.now() - startTime);
      
    } catch (error) {
      errors.push(`Similarity engine test failed: ${error}`);
      passed = false;
    }
    
    return {
      name: 'Similarity Engine Test',
      passed,
      duration: Date.now() - startTime,
      errors: errors.length > 0 ? errors : undefined
    };
  }
  
  // Test bulk operations
  async testBulkOperations(): Promise<TestResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let passed = true;
    
    try {
      // Test bulk metadata extraction
      const items = Array.from({ length: 20 }, (_, i) => ({
        id: `item_${i}`,
        text: `Test text ${i} with content`
      }));
      
      const operation = await this.bulkOpsManager.bulkExtractMetadata(items, {
        concurrency: 5,
        progressCallback: (op) => {
          this.performanceMonitor.track('bulk_progress', op.progress);
        }
      });
      
      if (operation.status !== 'completed') {
        errors.push(`Bulk operation failed: ${operation.status}`);
        passed = false;
      }
      
      if (operation.failed > items.length * 0.1) {
        errors.push(`Too many failures: ${operation.failed}/${items.length}`);
        passed = false;
      }
      
      // Test natural language search
      const nlQuery = 'Find all panicked extras in urban scenes without umbrellas';
      const parsed = this.bulkOpsManager.parseNaturalLanguageQuery(nlQuery);
      
      if (!parsed.parsed || parsed.parsed.conditions.length === 0) {
        errors.push('Natural language parsing failed');
        passed = false;
      }
      
      this.performanceMonitor.track('bulk_operations_test', Date.now() - startTime);
      
    } catch (error) {
      errors.push(`Bulk operations test failed: ${error}`);
      passed = false;
    }
    
    return {
      name: 'Bulk Operations Test',
      passed,
      duration: Date.now() - startTime,
      errors: errors.length > 0 ? errors : undefined
    };
  }
  
  // Test complete integration workflow
  async testIntegration(): Promise<TestResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let passed = true;
    
    try {
      // Create graph → Populate → Extract → Search workflow
      
      // Step 1: Populate choices for a node
      const choices = await this.nodeIntelligence.populateChoices(
        'Extra sees danger and',
        5
      );
      
      if (!choices || choices.length < 3) {
        errors.push('Integration: Populate choices failed');
        passed = false;
      }
      
      // Step 2: Extract metadata from the choices
      const metadataPromises = choices.map(choice => 
        this.metadataExtractor.extract(choice.text)
      );
      const metadataResults = await Promise.all(metadataPromises);
      
      if (metadataResults.some(r => !r.metadata)) {
        errors.push('Integration: Metadata extraction failed');
        passed = false;
      }
      
      // Step 3: Index for similarity search
      const indexPromises = choices.map((choice, i) => 
        this.similarityEngine.indexAsset(
          `choice_${i}`,
          choice.text,
          metadataResults[i].metadata
        )
      );
      await Promise.all(indexPromises);
      
      // Step 4: Search for similar content
      const searchResults = await this.similarityEngine.findSimilar(
        'panic reaction',
        { tags: ['action'] },
        { limit: 3 }
      );
      
      if (!searchResults || searchResults.length === 0) {
        errors.push('Integration: Similarity search failed');
        passed = false;
      }
      
      // Step 5: Track in compliance system
      await this.complianceSystem.logAudit({
        action: 'integration_test',
        user: 'test_user',
        target: 'test_workflow',
        target_type: 'metadata',
        success: true
      });
      
      this.performanceMonitor.track('integration_test', Date.now() - startTime);
      
    } catch (error) {
      errors.push(`Integration test failed: ${error}`);
      passed = false;
    }
    
    return {
      name: 'Integration Workflow Test',
      passed,
      duration: Date.now() - startTime,
      errors: errors.length > 0 ? errors : undefined
    };
  }
  
  // Test 100-extra stress scenario
  async testStressScenario(): Promise<TestResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let passed = true;
    
    try {
      // Create 100 extras
      const extras = Array.from({ length: 100 }, (_, i) => ({
        id: `extra_${i.toString().padStart(4, '0')}`,
        text: `Extra ${i} in urban evacuation scene`,
        metadata: {
          tags: ['urban', 'evacuation', i % 2 === 0 ? 'panicked' : 'calm']
        }
      }));
      
      // Bulk extract metadata
      const extractStart = Date.now();
      const extractOp = await this.bulkOpsManager.bulkExtractMetadata(
        extras.map(e => ({ id: e.id, text: e.text })),
        { concurrency: 10 }
      );
      const extractTime = Date.now() - extractStart;
      
      if (extractTime > 30000) {
        errors.push(`Extraction too slow: ${extractTime}ms (target: 30000ms)`);
        passed = false;
      }
      
      // Search across all extras
      const searchStart = Date.now();
      const searchResults = await this.bulkOpsManager.executeNaturalLanguageSearch(
        'panicked extras in urban scenes',
        extras
      );
      const searchTime = Date.now() - searchStart;
      
      if (searchTime > 500) {
        errors.push(`Search too slow: ${searchTime}ms (target: 500ms)`);
        passed = false;
      }
      
      // Check cost
      const totalCost = this.llmService.getTotalCost();
      if (totalCost > 0.50) {
        errors.push(`Cost too high: $${totalCost.toFixed(2)} (target: $0.50)`);
        passed = false;
      }
      
      this.performanceMonitor.track('stress_test', Date.now() - startTime, {
        extras: 100,
        extractTime,
        searchTime,
        cost: totalCost
      });
      
    } catch (error) {
      errors.push(`Stress test failed: ${error}`);
      passed = false;
    }
    
    return {
      name: '100-Extra Stress Test',
      passed,
      duration: Date.now() - startTime,
      errors: errors.length > 0 ? errors : undefined,
      metrics: {
        totalExtras: 100,
        totalCost: this.llmService.getTotalCost()
      }
    };
  }
  
  // Test offline mode
  async testOfflineMode(): Promise<TestResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let passed = true;
    
    try {
      // Simulate offline by using services without LLM
      const offlineExtractor = new MetadataExtractor();
      const offlineIntelligence = new NodeIntelligenceService();
      
      // Test offline metadata extraction
      const offlineMetadata = await offlineExtractor.extract('urban chaos scene');
      if (!offlineMetadata.metadata || offlineMetadata.metadata.tags.length === 0) {
        errors.push('Offline metadata extraction failed');
        passed = false;
      }
      
      // Test offline populate choices
      const offlineChoices = await offlineIntelligence.populateChoices(
        'Extra sees danger and',
        3
      );
      if (!offlineChoices || offlineChoices.length === 0) {
        errors.push('Offline populate choices failed');
        passed = false;
      }
      
      // Test offline weight optimization
      const offlineWeights = await offlineIntelligence.optimizeWeights(
        [{ text: 'runs', weight: 50 }, { text: 'hides', weight: 50 }],
        'panic'
      );
      if (!offlineWeights) {
        errors.push('Offline weight optimization failed');
        passed = false;
      }
      
      this.performanceMonitor.track('offline_test', Date.now() - startTime);
      
    } catch (error) {
      errors.push(`Offline test failed: ${error}`);
      passed = false;
    }
    
    return {
      name: 'Offline Mode Test',
      passed,
      duration: Date.now() - startTime,
      errors: errors.length > 0 ? errors : undefined
    };
  }
  
  // Test variable preservation
  async testVariablePreservation(): Promise<TestResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let passed = true;
    
    try {
      // Test variables in populate choices
      const textWithVars = 'Extra {id} sees {event} and {reaction}';
      const choices = await this.nodeIntelligence.populateChoices(textWithVars, 3);
      
      for (const choice of choices) {
        if (!choice.text.includes('{id}') || 
            !choice.text.includes('{event}') || 
            !choice.text.includes('{reaction}')) {
          errors.push(`Variables lost in choice: ${choice.text}`);
          passed = false;
        }
      }
      
      // Test variables in weight optimization
      const weightsWithVars = [
        { text: '{reaction} quickly', weight: 50 },
        { text: '{reaction} slowly', weight: 50 }
      ];
      
      const optimized = await this.nodeIntelligence.optimizeWeights(weightsWithVars, 'urgent');
      
      for (const item of optimized) {
        if (!item.text.includes('{reaction}')) {
          errors.push(`Variable lost in optimization: ${item.text}`);
          passed = false;
        }
      }
      
      // Test nested variables
      const nestedVars = 'Extra sees {world.event.type} at {world.location}';
      const nestedChoices = await this.nodeIntelligence.populateChoices(nestedVars, 2);
      
      for (const choice of nestedChoices) {
        if (!choice.text.includes('{world.event.type}') || 
            !choice.text.includes('{world.location}')) {
          errors.push(`Nested variables lost: ${choice.text}`);
          passed = false;
        }
      }
      
      this.performanceMonitor.track('variable_preservation_test', Date.now() - startTime);
      
    } catch (error) {
      errors.push(`Variable preservation test failed: ${error}`);
      passed = false;
    }
    
    return {
      name: 'Variable Preservation Test',
      passed,
      duration: Date.now() - startTime,
      errors: errors.length > 0 ? errors : undefined
    };
  }
  
  // Test compliance and audit
  async testComplianceAudit(): Promise<TestResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let passed = true;
    
    try {
      // Record consent
      const consent = await this.complianceSystem.recordConsent(
        'test_extra_001',
        'extra',
        true,
        ['metadata_extraction', 'continuity_tracking']
      );
      
      if (!consent || !consent.consent_given) {
        errors.push('Consent recording failed');
        passed = false;
      }
      
      // Check consent
      const consentCheck = await this.complianceSystem.checkConsent('test_extra_001');
      if (!consentCheck) {
        errors.push('Consent check failed');
        passed = false;
      }
      
      // Log audit entries
      for (let i = 0; i < 10; i++) {
        await this.complianceSystem.logAudit({
          action: `test_action_${i}`,
          user: 'test_user',
          target: `test_target_${i}`,
          target_type: 'metadata',
          success: true
        });
      }
      
      // Generate compliance report
      const report = await this.complianceSystem.generateComplianceReport(
        'gdpr',
        new Date(Date.now() - 86400000).toISOString(),
        new Date().toISOString()
      );
      
      if (!report || report.summary.audit_entries < 10) {
        errors.push('Compliance report incomplete');
        passed = false;
      }
      
      // Test deletion request
      const deletion = await this.complianceSystem.processDeletionRequest(
        'test_extra_001',
        'extra',
        'test_user',
        'test deletion'
      );
      
      if (!deletion || deletion.status === 'failed') {
        errors.push('Deletion request failed');
        passed = false;
      }
      
      this.performanceMonitor.track('compliance_audit_test', Date.now() - startTime);
      
    } catch (error) {
      errors.push(`Compliance audit test failed: ${error}`);
      passed = false;
    }
    
    return {
      name: 'Compliance & Audit Test',
      passed,
      duration: Date.now() - startTime,
      errors: errors.length > 0 ? errors : undefined
    };
  }
  
  // Helper methods
  
  private async resetEnvironment(): Promise<void> {
    // Clear all caches and reset state
    this.metadataExtractor.clearCache();
    this.llmService.clearCache();
  }
  
  private async seedTestData(): Promise<void> {
    // Seed initial test data
    // This would populate test assets, extras, etc.
  }
  
  private async generateCostReport(): Promise<any> {
    const usage = this.llmService.getTokenUsage();
    const cost = this.llmService.getTotalCost();
    
    return {
      totalTokens: usage?.total || 0,
      totalCost: cost,
      costPerExtra: cost / 100, // Assuming 100 extras in stress test
      cacheHitRate: this.llmService.getCacheStats().hitRate,
      modelUsage: this.llmService.getModelUsageStats()
    };
  }
  
  // Generate HTML report
  generateHTMLReport(results: TestSuiteResults): string {
    const passRate = (results.passed / results.totalTests * 100).toFixed(1);
    
    return `
<!DOCTYPE html>
<html>
<head>
  <title>E2E Test Report - Story 2.4</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #333; }
    .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .passed { color: green; }
    .failed { color: red; }
    .test-result { margin: 10px 0; padding: 10px; border-left: 3px solid #ddd; }
    .test-result.pass { border-color: green; }
    .test-result.fail { border-color: red; }
    .metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    .metric { background: white; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
  </style>
</head>
<body>
  <h1>Epic 2 Integration Test Report</h1>
  
  <div class="summary">
    <h2>Summary</h2>
    <p>Total Tests: ${results.totalTests}</p>
    <p class="passed">Passed: ${results.passed}</p>
    <p class="failed">Failed: ${results.failed}</p>
    <p>Pass Rate: ${passRate}%</p>
    <p>Duration: ${(results.duration / 1000).toFixed(2)}s</p>
  </div>
  
  <h2>Test Results</h2>
  ${results.testResults.map(test => `
    <div class="test-result ${test.passed ? 'pass' : 'fail'}">
      <h3>${test.name}</h3>
      <p>Status: ${test.passed ? '✅ PASSED' : '❌ FAILED'}</p>
      <p>Duration: ${test.duration}ms</p>
      ${test.errors ? `<p>Errors: ${test.errors.join(', ')}</p>` : ''}
    </div>
  `).join('')}
  
  <h2>Performance Metrics</h2>
  <div class="metrics">
    <div class="metric">
      <h3>P95 Latency</h3>
      <p>${results.performanceReport?.p95Latency || 'N/A'}ms</p>
    </div>
    <div class="metric">
      <h3>Cache Hit Rate</h3>
      <p>${(results.performanceReport?.cacheHitRate * 100 || 0).toFixed(1)}%</p>
    </div>
    <div class="metric">
      <h3>Total Cost</h3>
      <p>$${results.costReport?.totalCost?.toFixed(4) || '0.0000'}</p>
    </div>
  </div>
  
  <h2>Cost Analysis</h2>
  <div class="metrics">
    <div class="metric">
      <h3>Cost per Extra</h3>
      <p>$${results.costReport?.costPerExtra?.toFixed(4) || '0.0000'}</p>
      <p>Target: <$0.005</p>
    </div>
    <div class="metric">
      <h3>Total Tokens</h3>
      <p>${results.costReport?.totalTokens || 0}</p>
    </div>
    <div class="metric">
      <h3>Cache Efficiency</h3>
      <p>${(results.costReport?.cacheHitRate * 100 || 0).toFixed(1)}%</p>
      <p>Target: >40%</p>
    </div>
  </div>
  
  <p style="margin-top: 40px; color: #666;">Generated: ${new Date().toISOString()}</p>
</body>
</html>
    `;
  }
}