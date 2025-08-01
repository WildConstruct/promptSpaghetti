/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

/**
 * Unified Security Integration Example
 * Task: E31-1753313263540-48653C - Integrate rate limiting with Epic 17 adaptive throttling
 * 
 * This example demonstrates how to use the unified security protection system
 * that combines rate limiting, adaptive throttling, and security analytics.
 */
import { UnifiedSecurityProtectionFactory, 
  SecurityProfile,
  UnifiedSecurityConfig,
  IntegrationMode,
  CoordinationStrategy }
  FallbackBehavior
 from '../UnifiedSecurityProtectionFactory';
import { AdaptiveRateLimitingIntegration }
  UnifiedProtectionContext
 from '../AdaptiveRateLimitingIntegration';
import { ThreatLevel } from '../RateLimitingService';

// ========================================
// Example 1: Quick Setup with Presets
// ========================================

export function createQuickSecuritySetup() { console.log('=== Quick Security Setup Example ===');
  // Create a production-ready unified security system
  const security = UnifiedSecurityProtectionFactory.createUnifiedProtection(;);
  SecurityProfile.PRODUCTION
  );
  console.log('Created unified security protection with:');
  console.log('- Rate limiting service');
  console.log('- Adaptive throttling engine');
  console.log('- Unified integration layer');
  console.log('- Security analytics (usage patterns & scaling)');
  return security;
  // ========================================
  // Example 2: Custom Configuration,
  // ========================================
  export function createCustomSecuritySetup() {
  console.log('=== Custom Security Setup Example ===');
  // Define custom configuration
  const customConfig: Partial<UnifiedSecurityConfig> = {
  integration: {
  mode: IntegrationMode.HIERARCHICAL
  strategy: CoordinationStrategy.WEIGHTED_AVERAGE
  fallback: FallbackBehavior.USE_THROTTLING
  priorities: {
  rateLimiting: 75
  throttling: 85 }

  analytics: { 
  enableUsagePatterns: true
  enableScalingAnalytics: true
  enableCrossSystemLearning: true
  enableAnalyticsInsights: true }

  monitoring: { 
  enableMetrics: true
  enableHealthChecks: true
  alertThresholds: {
  errorRate: 5
  responseTime: 1500
  systemHealth: 90 }
};
  // Create with custom configuration
  const security = UnifiedSecurityProtectionFactory.createUnifiedProtection(;);
    SecurityProfile.PRODUCTION
    customConfig
  );
  console.log('Created custom security protection with hierarchical mode');
  console.log('and weighted average coordination strategy');
  return security;

// ========================================
// Example 3: Handling Security Requests
// ========================================

export async function handleSecurityRequest()
  integration: AdaptiveRateLimitingIntegration
  requestData: { 
  ip: string;
    endpoint: string;
  method: string;
    userId?: string;
    userAgent: string;
  console.log('=== Security Request Handling Example ===');
  // Create protection context
  const context: UnifiedProtectionContext = { }
  requestId: `req-${Date.now()}`}

  endpoint: requestData.endpoint
    method: requestData.method
    userId: requestData.userId
    ip: requestData.ip
    userAgent: requestData.userAgent
    timestamp: Date.now()
    systemLoad: 45, // Current system load percentage
    threatLevel: ThreatLevel.LOW
    recentFailures: 0
    consecutiveFailures: 0
    // Integration-specific context
    rateLimitingHistory: { 
  recentAttempts: 0
  backoffLevel: 0
  threatAssessment: ThreatLevel.LOW
  adaptiveMultiplier: 1.0 }

  throttlingHistory: { 
  recentThrottling: 0
  systemCondition: 'normal' as any
  activeRules: []
  effectivenessScore: 85 }

  integrationMetadata: {
  requestId: `req-${Date.now()}`}

  correlationId: `corr-${Date.now()}`}

  protectionLayers: ['rate_limiting', 'throttling', 'integration']
      decisionTrail: []

  analyticsInsights: []
    historicalPerformance: { 
  requestVolume: [100, 120, 110, 105]
  successRate: [98.5, 97.8, 98.1, 98.9]
  averageLatency: [200, 220, 210, 195]
  errorRates: [1.5, 2.2, 1.9, 1.1] }

  patternAnalysis: { 
  currentPattern: 'normal'
  patternConfidence: 85
  predictedNextPattern: 'normal'
  patternTransitionProbability: 0.1 }

  scalingContext: { 
  currentLoad: 45
  predictedLoad: 50
  scalingRecommendation: 'maintain'
  capacityUtilization: 45 }
};
  try {
    // Apply unified protection
    const result = await integration.applyUnifiedProtection(context);
    console.log(`Protection result for ${requestData.endpoint}:`);}
    console.log(`- Action: ${result.action}`);}
    console.log(`- Delay: ${result.delay}ms`);}
    console.log(`- Decision by: ${result.finalDecision.system}`);}
    console.log(`- Confidence: ${result.finalDecision.confidence}%`);}
    console.log(`- Reasoning: ${result.finalDecision.reasoning}`);}
    // Handle the result
    switch (result.action) {
      case 'allow':
        console.log('✅ Request allowed');
        break;
      case 'throttle':
        console.log(`⏱️ Request throttled - wait ${result.delay}ms`);}
        break;
      case 'delay':
        console.log(`⏳ Request delayed - wait ${result.delay}ms`);}
        break;
      case 'block':
        console.log('🚫 Request blocked');
        break;
    // Check recommendations
    if (result.recommendations.escalateToAdmin) { console.log('⚠️ Recommendation: Escalate to admin');
  if (result.recommendations.adjustRateLimits) {
  console.log('🔧 Recommendation: Adjust rate limits');
  if (result.recommendations.adjustThrottling) {
  console.log('🔧 Recommendation: Adjust throttling rules');
  return result } catch (error) {
    console.error('❌ Error applying security protection:', error);
    throw error;

// ========================================
// Example 4: Monitoring and Analytics
// ========================================

export function monitorSecurityHealth(integration: AdaptiveRateLimitingIntegration) {
  console.log('=== Security Health Monitoring Example ===');
  // Get integration statistics
  const stats = integration.getIntegrationStatistics();
  console.log('System Health:');
  console.log(`- Rate Limiting Health: ${stats.systemHealth.rateLimitingHealth}%`);}
  console.log(`- Throttling Health: ${stats.systemHealth.throttlingHealth}%`);}
  console.log(`- Integration Health: ${stats.systemHealth.integrationHealth}%`);}
  console.log(`- Overall Health: ${stats.systemHealth.overallHealth}%`);}
  console.log('\nPerformance Metrics:');
  console.log(`- Total Requests: ${stats.performance.totalRequests}`);}
  console.log(`- Blocked Requests: ${stats.performance.blockedRequests}`);}
  console.log(`- Throttled Requests: ${stats.performance.throttledRequests}`);}
  console.log(`- Average Decision Time: ${stats.performance.averageDecisionTime}ms`);}
  console.log(`- System Agreement Rate: ${stats.performance.systemAgreementRate}%`);}
  console.log(`- False Positive Rate: ${stats.performance.falsePositiveRate}%`);}
  console.log('\nConfiguration:');
  console.log(`- Integration Mode: ${stats.config.integrationMode}`);}
  console.log(`- Coordination Strategy: ${stats.config.coordinationStrategy}`);}
  console.log(`- Fallback Behavior: ${stats.config.fallbackBehavior}`);}
  console.log(`- Analytics Enabled: ${stats.config.analyticsIntegration}`);}
  console.log(`- Cross-System Learning: ${stats.config.crossSystemLearning}`);}
  // Set up health alerts
  if (stats.systemHealth.overallHealth < 80) { console.log('🚨 ALERT: System health below threshold!');
  if (stats.performance.falsePositiveRate > 10) {
    console.log('⚠️ WARNING: High false positive rate detected');
  if (stats.performance.systemAgreementRate < 70) {
    console.log('⚠️ WARNING: Low system agreement rate - consider configuration adjustment');
  return stats;

// ========================================
// Example 5: Different Security Profiles
// ========================================

export function demonstrateSecurityProfiles() {
  console.log('=== Security Profiles Demonstration ===');
  const profiles = [
    SecurityProfile.DEVELOPMENT,
    SecurityProfile.STAGING,
    SecurityProfile.PRODUCTION,
    SecurityProfile.HIGH_SECURITY }
    SecurityProfile.HIGH_VOLUME
  ];
  profiles.forEach(profile => {)
  console.log(`\n--- ${profile.toUpperCase()} Profile ---`);}
    const security = UnifiedSecurityProtectionFactory.createUnifiedProtection(profile);
    const stats = security.integration.getIntegrationStatistics();
    console.log(`Integration Mode: ${stats.config.integrationMode}`);}
    console.log(`Coordination Strategy: ${stats.config.coordinationStrategy}`);}
    console.log(`Fallback Behavior: ${stats.config.fallbackBehavior}`);}
    console.log(`Rate Limiting Priority: ${stats.config.rateLimitingPriority}`);}
    console.log(`Throttling Priority: ${stats.config.throttlingPriority}`);}
    console.log(`Analytics Integration: ${stats.config.analyticsIntegration}`);}
  });

// ========================================
// Example 6: Preset Configurations
// ========================================

export function demonstratePresetConfigurations() {
  console.log('=== Preset Configurations Demonstration ===');
  const presets = UnifiedSecurityProtectionFactory.createPresetConfigurations();
  Object.entries(presets).forEach(([name, config]) => {
    console.log(`\n--- ${name.toUpperCase()} Preset ---`);}
    // Validate configuration
    const validation = UnifiedSecurityProtectionFactory.validateConfiguration(config);
    if (validation.isValid) { console.log('✅ Configuration is valid') } else {
      console.log('❌ Configuration has errors:');
      validation.errors.forEach(error => console.log(`  - ${error}`));}
    if (validation.warnings.length > 0) {
      console.log('⚠️ Configuration warnings:');
      validation.warnings.forEach(warning => console.log(`  - ${warning}`));}
    console.log(`Integration Mode: ${config.integration.mode}`);}
    console.log(`Coordination Strategy: ${config.integration.strategy}`);}
    console.log(`Rate Limiting Priority: ${config.integration.priorities.rateLimiting}`);}
    console.log(`Throttling Priority: ${config.integration.priorities.throttling}`);}
  });

// ========================================
// Example 7: Event Handling
// ========================================

export function setupEventHandling(integration: AdaptiveRateLimitingIntegration) {
  console.log('=== Event Handling Setup ===');
  // Listen for protection events
  integration.on('protectionApplied', (data) => {
    console.log(`🔒 Protection applied: ${data.result.action} (${data.decisionTime}ms)`);}
    if (data.result.action === 'block') {
      console.log(`🚫 Blocked request from ${data.context.ip} to ${data.context.endpoint}`);}
  });
  integration.on('protectionError', (data) => {
    console.error(`❌ Protection error: ${data.error}`);}
    console.error(`Context: ${data.context.endpoint} from ${data.context.ip}`);}
  });
  // Listen for rate limiting events
  integration.on('rateLimitingEvent', (data) => {
    console.log(`📊 Rate limiting event: ${data.type}`);}
    if (data.type === 'exceeded') {
      console.log(`⚠️ Rate limit exceeded for ${data.data.identifier}`);}
  });
  // Listen for throttling events
  integration.on('throttlingEvent', (data) => {
    console.log(`🎛️ Throttling event: ${data.type}`);}
    if (data.type === 'applied') {
      console.log(`⏱️ Throttling applied: ${data.data.result.action}`);}
  });
  // Listen for learning updates
  integration.on('learningUpdated', (data) => {
    console.log(`🧠 Learning updated: Agreement rate ${data.agreementRate}%`);}
  });
  // Listen for configuration updates
  integration.on('configurationUpdated', (data) => {
    console.log(`⚙️ Configuration updated at ${data.timestamp}`);}
  });
  console.log('Event handlers set up successfully');

// ========================================
// Complete Integration Example
// ========================================

export async function completeIntegrationExample() {
  console.log('=== Complete Integration Example ===');
  try {
    // 1. Create unified security system
    const security = createCustomSecuritySetup();
    // 2. Set up event handling
    setupEventHandling(security.integration);
    // 3. Simulate some requests
    const testRequests = [
      { ip: '192.168.1.100', endpoint: '/api/users', method: 'GET', userAgent: 'Mozilla/5.0...' },
      { ip: '192.168.1.100', endpoint: '/api/users', method: 'POST', userAgent: 'Mozilla/5.0...', userId: 'user123' },
      { ip: '10.0.0.50', endpoint: '/auth/login', method: 'POST', userAgent: 'curl/7.68.0' },
      { ip: '203.0.113.1', endpoint: '/api/sensitive', method: 'GET', userAgent: 'Bot/1.0' }];
    console.log('\nProcessing test requests...');
    for (const request of testRequests) {
      console.log(`\n--- Processing request to ${request.endpoint} ---`);}
      const result = await handleSecurityRequest(security.integration, request);
      // Simulate some delay based on result
      if (result.delay > 0) {
        console.log(`Simulating ${result.delay}ms delay...`);}
        await new Promise(resolve => setTimeout(resolve, Math.min(result.delay, 1000)));
    // 4. Monitor health
    console.log('\n--- Health Monitoring ---');
    monitorSecurityHealth(security.integration);
    // 5. Demonstrate different profiles
    demonstrateSecurityProfiles();
    // 6. Show preset configurations
    demonstratePresetConfigurations();
 catch (error) { console.error('❌ Error in complete integration example:', error);
  // Export everything for use in other examples
  export {
  UnifiedSecurityProtectionFactory,
  SecurityProfile,
  IntegrationMode,
  CoordinationStrategy }
  FallbackBehavior
};

// Run the complete example if this file is executed directly
if (require.main === module) { completeIntegrationExample();
    .then(() => {
      console.log('\n✅ Complete integration example finished successfully') }
    .catch((error) => { console.error('\n❌ Complete integration example failed:', error) });