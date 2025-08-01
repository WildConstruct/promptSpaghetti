/**
 * MLFlaggingService - Machine Learning-based content and security flagging system
 * 
 * Provides comprehensive AI-powered flagging for:
 * - Content moderation and safety
 * - Security threat detection
 * - Compliance violation detection
 * - Anomaly detection in user behavior
 * - Prompt injection and adversarial input detection
 */

import { DatabaseConnection } from '../database/connection';
import { AuditService } from '../auth/services/AuditService';



export interface MLFlaggingConfig {
  enableContentModeration: boolean;
  enableSecurityThreatDetection: boolean;
  enableComplianceChecking: boolean;
  enableAnomalyDetection: boolean;
  enablePromptInjectionDetection: boolean;
  confidenceThreshold: number; // 0-1
  autoActionThreshold: number; // 0-1
  modelEndpoints: {
    contentModeration?: string;
    securityThreat?: string;
    compliance?: string;
    anomaly?: string;
    promptInjection?: string;



  };
  fallbackToRuleBased: boolean;




export interface FlaggingRequest {
  content: string;
  contentType: 'text' | 'json' | 'graph' | 'prompt' | 'code';
  userId?: string;
  organizationId?: string;
  context?: {
    userAgent?: string;
    ipAddress?: string;
    timestamp?: Date;
    sessionId?: string;
    requestId?: string;
    metadata?: Record<string, unknown>;



  };
  categories: FlaggingCategory[];


export type FlaggingCategory = 
  | 'content_moderation'
  | 'security_threat' 
  | 'compliance_violation'
  | 'anomaly_detection'
  | 'prompt_injection'
  | 'data_leak'
  | 'malware'
  | 'phishing';



export interface FlaggingResult {
  flagged: boolean;
  confidence: number;
  categories: FlaggedCategory[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendedAction: 'allow' | 'warn' | 'block' | 'review' | 'quarantine';
  explanation: string;
  modelVersion?: string;
  processingTime: number;
  fallbackUsed: boolean;







export interface FlaggedCategory {
  category: FlaggingCategory;
  confidence: number;
  details: string;
  evidence?: string[];
  severity: 'low' | 'medium' | 'high';
  subcategories?: string[];







export interface MLModel {
  id: string;
  name: string;
  version: string;
  category: FlaggingCategory;
  endpoint?: string;
  isActive: boolean;
  accuracy?: number;
  lastUpdated: Date;
  configuration?: Record<string, unknown>;







export interface FlaggingEvent {
  id: string;
  requestId: string;
  content: string;
  contentType: string;
  userId?: string;
  organizationId?: string;
  result: FlaggingResult;
  timestamp: Date;
  processed: boolean;
  reviewStatus?: 'pending' | 'approved' | 'rejected' | 'escalated';
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewNotes?: string;







export interface FlaggingStats {
  totalRequests: number;
  flaggedRequests: number;
  flaggedRate: number;
  categoryCounts: Record<FlaggingCategory, number>;
  riskLevelCounts: Record<string, number>;
  actionCounts: Record<string, number>;
  averageConfidence: number;
  averageProcessingTime: number;
  modelAccuracy: Record<string, number>;





// Rule-based fallback patterns
const SECURITY_PATTERNS = {
  sqlInjection: [
    /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b.*\b(from|where|into|values|table)\b)/i,
    /(\'|\").*(\bor\b|\band\b).*(\=|\<|\>).*(\1)/i,
    /(\%27|\%22).*(\%6f\%72|\%61\%6e\%64).*(\%3d|\%3c|\%3e)/i
  ],
  xssAttack: [
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
    /javascript\s*:/gi,
    /on\w+\s*=\s*["'][^"']*["']/gi,
    /<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi
  ],
  promptInjection: [
    /ignore\s+(previous|all|above|prior)\s+(instructions?|commands?|prompts?)/i,
    /system\s*:\s*(you\s+are|act\s+as|behave\s+like)/i,
    /\/\*.*\*\/.*(\bselect\b|\bunion\b|\bwhere\b)/i,
    /(jailbreak|dan\s+mode|developer\s+mode)/i
  ],
  dataLeak: [
    /\b([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2
})\b/g, // Email
    /\b(\d{3}-\d{2}-\d{4})\b/g, // SSN
    /\b(\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4})\b/g, // Credit card
    /\b(api[_-]?key|secret[_-]?key|access[_-]?token)\s*[:=]\s*["\']?([a-zA-Z0-9]{20
})["\']?/i
  ]
};

const CONTENT_MODERATION_PATTERNS = {
  hate: [
    /\b(hate|despise|loathe)\b.*\b(race|religion|gender|sexual|orientation)\b/i,
    /\b(kill|murder|destroy)\b.*\b(all|every)\b.*\b(jews|muslims|christians|blacks|whites|gays|women|men)\b/i
  ],
  violence: [
    /\b(bomb|explosive|weapon|gun|knife|attack|kill|murder|assault)\b/i,
    /\b(how\s+to\s+(make|build|create))\b.*\b(bomb|explosive|weapon)\b/i
  ],
  selfHarm: [
    /\b(suicide|self[-\s]?harm|cut\s+myself|kill\s+myself)\b/i,
    /\b(how\s+to\s+(die|kill\s+yourself|commit\s+suicide))\b/i
  ]
};

export class MLFlaggingService {
  private static instance: MLFlaggingService;
  private config: MLFlaggingConfig;
  private models: Map<FlaggingCategory, MLModel> = new Map();

  constructor(
    private db: DatabaseConnection,
    private auditService: AuditService,
    config?: Partial<MLFlaggingConfig>
  ) {
    this.config = {
      enableContentModeration: true,
      enableSecurityThreatDetection: true,
      enableComplianceChecking: true,
      enableAnomalyDetection: false, // Requires specialized setup
      enablePromptInjectionDetection: true,
      confidenceThreshold: 0.7,
      autoActionThreshold: 0.9,
      modelEndpoints: {},
      fallbackToRuleBased: true,
      ...config
    };


  static getInstance(
    db: DatabaseConnection,
    auditService: AuditService,
    config?: Partial<MLFlaggingConfig>
  ): MLFlaggingService {
    if (!MLFlaggingService.instance) {
      MLFlaggingService.instance = new MLFlaggingService(db, auditService, config);

    return MLFlaggingService.instance;


  /**
   * Initialize the ML flagging system
   */
  async initialize(): Promise<void> {

    try {
      await this.loadModels();
      console.log('MLFlaggingService initialized successfully');
 catch (error) {
      console.error('Failed to initialize MLFlaggingService:', error);
      throw error;



  /**
   * Flag content using ML models and rule-based fallbacks
   */
  async flagContent(request: FlaggingRequest): Promise<FlaggingResult> {

    const startTime = Date.now();
    const requestId = `flag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      const results: FlaggedCategory[] = [];
      let fallbackUsed = false;
      let confidence = 0;

      // Process each requested category
      for (const category of request.categories) {
        try {
          const categoryResult = await this.flagCategory(request.content, category, request.context);
          if (categoryResult) {
            results.push(categoryResult);
            confidence = Math.max(confidence, categoryResult.confidence);

 catch (error) {
          console.error(`Failed to process category ${category}:`, error);
          
          // Fallback to rule-based detection
          if (this.config.fallbackToRuleBased) {
            const fallbackResult = await this.ruleBasedFlagging(request.content, category);
            if (fallbackResult) {
              results.push(fallbackResult);
              fallbackUsed = true;





      const flagged = results.length > 0 && confidence >= this.config.confidenceThreshold;
      const riskLevel = this.calculateRiskLevel(results, confidence);
      const recommendedAction = this.determineAction(riskLevel, confidence);
      
      const result: FlaggingResult = {
        flagged,
        confidence,
        categories: results,
        riskLevel,
        recommendedAction,
        explanation: this.generateExplanation(results, confidence, riskLevel),
        processingTime: Date.now() - startTime,
        fallbackUsed
      };

      // Store flagging event
      await this.storeFlaggingEvent({
        id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        requestId,
        content: request.content,
        contentType: request.contentType,
        userId: request.userId,
        organizationId: request.organizationId,
        result,
        timestamp: new Date(),
        processed: false
      });

      // Log audit event
      await this.auditService.logMLFlagging({
        requestId,
        userId: request.userId,
        organizationId: request.organizationId,
        flagged,
        confidence,
        riskLevel,
        action: recommendedAction,
        categories: results.map(r => r.category),
        processingTime: result.processingTime
      });

      return result;
 catch (error) {
      const errorResult: FlaggingResult = {
        flagged: false,
        confidence: 0,
        categories: [],
        riskLevel: 'low',
        recommendedAction: 'allow',
        explanation: 'Error occurred during flagging process',
        processingTime: Date.now() - startTime,
        fallbackUsed: true
      };

      console.error('Error in flagContent:', error);
      return errorResult;



  /**
   * Flag content for a specific category
   */
  private async flagCategory(
    content: string, 
    category: FlaggingCategory,
    context?: FlaggingRequest['context']
  ): Promise<FlaggedCategory | null> {

    const model = this.models.get(category);
    
    if (!model || !model.isActive) {
      // Fallback to rule-based if no model available
      if (this.config.fallbackToRuleBased) {
        return this.ruleBasedFlagging(content, category);

      return null;


    try {
      // Call ML model API (if available)
      if (model.endpoint) {
        return await this.callMLModel(model, content, context);
 else {
        // Use built-in ML logic or fallback to rules
        return this.ruleBasedFlagging(content, category);

 catch (error) {
      console.error(`Error calling ML model for ${category}:`, error);
      
      if (this.config.fallbackToRuleBased) {
        return this.ruleBasedFlagging(content, category);

      return null;



  /**
   * Call external ML model API
   */
  private async callMLModel(
    model: MLModel, 
    content: string,
    context?: FlaggingRequest['context']
  ): Promise<FlaggedCategory | null> {

    if (!model.endpoint) {
      throw new Error('Model endpoint not configured');


    try {
      const response = await fetch(model.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': process.env.ML_API_KEY ? `Bearer ${process.env.ML_API_KEY}` : ''

        body: JSON.stringify({
          content,
          model_version: model.version,
          context: context || {}

      });

      if (!response.ok) {
        throw new Error(`ML API returned ${response.status}: ${response.statusText}`);


      const result = await response.json();
      
      if (result.flagged && result.confidence >= this.config.confidenceThreshold) {
        return {
          category: model.category,
          confidence: result.confidence,
          details: result.explanation || 'Flagged by ML model',
          evidence: result.evidence || [],
          severity: result.severity || 'medium',
          subcategories: result.subcategories || []
        };


      return null;
 catch (error) {
      console.error(`ML model API call failed for ${model.category}:`, error);
      throw error;



  /**
   * Rule-based flagging fallback
   */
  private async ruleBasedFlagging(content: string, category: FlaggingCategory): Promise<FlaggedCategory | null> {

    const patterns = this.getRulePatternsForCategory(category);
    const matches: string[] = [];
    let maxConfidence = 0;

    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) {
        matches.push(match[0]);
        // Simple confidence based on pattern specificity and match length
        const confidence = Math.min(0.9, 0.6 + (match[0].length / content.length) * 0.3);
        maxConfidence = Math.max(maxConfidence, confidence);



    if (matches.length > 0 && maxConfidence >= this.config.confidenceThreshold) {
      return {
        category,
        confidence: maxConfidence,
        details: `Rule-based detection found ${matches.length} potential issues`,
        evidence: matches.slice(0, 5), // Limit evidence to prevent large payloads
        severity: maxConfidence > 0.8 ? 'high' : maxConfidence > 0.6 ? 'medium' : 'low',
        subcategories: []
      };


    return null;


  /**
   * Get rule patterns for a category
   */
  private getRulePatternsForCategory(category: FlaggingCategory): RegExp[] {
    switch (category) {
    case 'security_threat':
      return [
        ...SECURITY_PATTERNS.sqlInjection,
        ...SECURITY_PATTERNS.xssAttack
      ];
    case 'prompt_injection':
      return SECURITY_PATTERNS.promptInjection;
    case 'data_leak':
      return SECURITY_PATTERNS.dataLeak;
    case 'content_moderation':
      return [
        ...CONTENT_MODERATION_PATTERNS.hate,
        ...CONTENT_MODERATION_PATTERNS.violence,
        ...CONTENT_MODERATION_PATTERNS.selfHarm
      ];
    default:
      return [];



  /**
   * Calculate overall risk level
   */
  private calculateRiskLevel(categories: FlaggedCategory[], confidence: number): 'low' | 'medium' | 'high' | 'critical' {
    if (categories.length === 0) return 'low';

    const highSeverityCount = categories.filter(c => c.severity === 'high').length;
    const criticalCategories = ['security_threat', 'data_leak', 'malware'];
    const hasCriticalCategory = categories.some(c => criticalCategories.includes(c.category));

    if (confidence > 0.9 && (highSeverityCount > 1 || hasCriticalCategory)) {
      return 'critical';

    if (confidence > 0.8 && (highSeverityCount > 0 || categories.length > 2)) {
      return 'high';

    if (confidence > 0.6 && categories.length > 0) {
      return 'medium';

    
    return 'low';


  /**
   * Determine recommended action
   */
  private determineAction(
    riskLevel: string, 
    confidence: number
  ): 'allow' | 'warn' | 'block' | 'review' | 'quarantine' {
    if (confidence >= this.config.autoActionThreshold) {
      switch (riskLevel) {
      case 'critical': return 'quarantine';
      case 'high': return 'block';
      case 'medium': return 'warn';
      default: return 'allow';



    // Below auto-action threshold, recommend review for risky content
    if (riskLevel === 'critical' || riskLevel === 'high') {
      return 'review';

    if (riskLevel === 'medium') {
      return 'warn';

    
    return 'allow';


  /**
   * Generate human-readable explanation
   */
  private generateExplanation(categories: FlaggedCategory[], confidence: number, riskLevel: string): string {
    if (categories.length === 0) {
      return 'Content appears safe based on analysis.';


    const categoryDescriptions = categories.map(c => {
      const severityText = c.severity === 'high' ? 'potentially dangerous' : 
        c.severity === 'medium' ? 'concerning' : 'questionable';
      return `${severityText} ${c.category.replace('_', ' ')} content`;
    }).join(', ');

    const confidenceText = confidence > 0.9 ? 'very high' :
      confidence > 0.8 ? 'high' :
        confidence > 0.6 ? 'moderate' : 'low';

    return `Content flagged with ${confidenceText} confidence (${Math.round(confidence * 100)}%) for: ${categoryDescriptions}. Risk level: ${riskLevel}.`;


  /**
   * Store flagging event in database
   */
  private async storeFlaggingEvent(event: FlaggingEvent): Promise<void> {

    try {
      await this.db.query(`
        INSERT INTO ml_flagging_events (
          id, request_id, content, content_type, user_id, organization_id,
          flagged, confidence, risk_level, recommended_action, explanation,
          categories, processing_time, fallback_used, timestamp, processed
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        event.id,
        event.requestId,
        event.content.substring(0, 10000), // Limit content length
        event.contentType,
        event.userId,
        event.organizationId,
        event.result.flagged,
        event.result.confidence,
        event.result.riskLevel,
        event.result.recommendedAction,
        event.result.explanation,
        JSON.stringify(event.result.categories),
        event.result.processingTime,
        event.result.fallbackUsed,
        event.timestamp,
        event.processed
      ]);
 catch (error) {
      console.error('Failed to store flagging event:', error);
      // Don't throw - flagging should continue even if storage fails



  /**
   * Get flagging statistics
   */
  async getFlaggingStats(
    organizationId?: string, 
    startDate?: Date, 
    endDate?: Date
  ): Promise<FlaggingStats> {

    const whereClause = this.buildWhereClause(organizationId, startDate, endDate);
    const params = this.buildQueryParams(organizationId, startDate, endDate);

    try {
      const [stats] = await this.db.query(`
        SELECT 
          COUNT(*) as total_requests,
          SUM(CASE WHEN flagged = 1 THEN 1 ELSE 0 END) as flagged_requests,
          AVG(confidence) as avg_confidence,
          AVG(processing_time) as avg_processing_time
        FROM ml_flagging_events 
        ${whereClause}
      `, params);

      const categoryStats = await this.db.query(`
        SELECT 
          JSON_UNQUOTE(JSON_EXTRACT(categories, '$[*].category')) as category,
          COUNT(*) as count
        FROM ml_flagging_events 
        ${whereClause}
        AND flagged = 1
        GROUP BY JSON_UNQUOTE(JSON_EXTRACT(categories, '$[*].category'))
      `, params);

      const riskLevelStats = await this.db.query(`
        SELECT risk_level, COUNT(*) as count
        FROM ml_flagging_events 
        ${whereClause}
        GROUP BY risk_level
      `, params);

      const actionStats = await this.db.query(`
        SELECT recommended_action, COUNT(*) as count
        FROM ml_flagging_events 
        ${whereClause}
        GROUP BY recommended_action
      `, params);

      // Build category counts
      const categoryCounts: Record<FlaggingCategory, number> = {
        content_moderation: 0,
        security_threat: 0,
        compliance_violation: 0,
        anomaly_detection: 0,
        prompt_injection: 0,
        data_leak: 0,
        malware: 0,
        phishing: 0
      };

      categoryStats.forEach((stat: any) => {
        if (stat.category && categoryCounts.hasOwnProperty(stat.category)) {
          categoryCounts[stat.category as FlaggingCategory] = stat.count;

      });

      const riskLevelCounts: Record<string, number> = {};
      riskLevelStats.forEach((stat: any) => {
        riskLevelCounts[stat.risk_level] = stat.count;
      });

      const actionCounts: Record<string, number> = {};
      actionStats.forEach((stat: any) => {
        actionCounts[stat.recommended_action] = stat.count;
      });

      const totalRequests = stats.total_requests || 0;
      const flaggedRequests = stats.flagged_requests || 0;

      return {
        totalRequests,
        flaggedRequests,
        flaggedRate: totalRequests > 0 ? flaggedRequests / totalRequests : 0,
        categoryCounts,
        riskLevelCounts,
        actionCounts,
        averageConfidence: stats.avg_confidence || 0,
        averageProcessingTime: stats.avg_processing_time || 0,
        modelAccuracy: {} // Would be populated from model evaluation data
      };
 catch (error) {
      console.error('Failed to get flagging statistics:', error);
      throw error;



  /**
   * Get recent flagging events
   */
  async getRecentEvents(
    limit: number = 100,
    organizationId?: string,
    flaggedOnly: boolean = false
  ): Promise<FlaggingEvent[]> {

    try {
      const whereConditions = ['1 = 1'];
      const params: any[] = [];

      if (organizationId) {
        whereConditions.push('organization_id = ?');
        params.push(organizationId);


      if (flaggedOnly) {
        whereConditions.push('flagged = 1');


      params.push(limit);

      const events = await this.db.query(`
        SELECT 
          id, request_id, content, content_type, user_id, organization_id,
          flagged, confidence, risk_level, recommended_action, explanation,
          categories, processing_time, fallback_used, timestamp, processed,
          review_status, reviewed_by, reviewed_at, review_notes
        FROM ml_flagging_events 
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY timestamp DESC 
        LIMIT ?
      `, params);

      return events.map((event: any) => ({
        id: event.id,
        requestId: event.request_id,
        content: event.content,
        contentType: event.content_type,
        userId: event.user_id,
        organizationId: event.organization_id,
        result: {
          flagged: Boolean(event.flagged),
          confidence: event.confidence,
          categories: JSON.parse(event.categories || '[]'),
          riskLevel: event.risk_level,
          recommendedAction: event.recommended_action,
          explanation: event.explanation,
          processingTime: event.processing_time,
          fallbackUsed: Boolean(event.fallback_used)

        timestamp: event.timestamp,
        processed: Boolean(event.processed),
        reviewStatus: event.review_status,
        reviewedBy: event.reviewed_by,
        reviewedAt: event.reviewed_at,
        reviewNotes: event.review_notes
      }));
 catch (error) {
      console.error('Failed to get recent flagging events:', error);
      throw error;



  /**
   * Update review status of flagging event
   */
  async updateReviewStatus(
    eventId: string,
    status: 'approved' | 'rejected' | 'escalated',
    reviewedBy: string,
    notes?: string
  ): Promise<boolean> {

    try {
      const result = await this.db.query(`
        UPDATE ml_flagging_events 
        SET review_status = ?, reviewed_by = ?, reviewed_at = ?, review_notes = ?
        WHERE id = ?
      `, [status, reviewedBy, new Date(), notes, eventId]);

      await this.auditService.logReviewUpdate({
        eventId,
        status,
        reviewedBy,
        notes
      });

      return result.affectedRows > 0;
 catch (error) {
      console.error('Failed to update review status:', error);
      throw error;



  /**
   * Load ML models from database
   */
  private async loadModels(): Promise<void> {

    try {
      const models = await this.db.query(
        'SELECT * FROM ml_models WHERE is_active = 1 ORDER BY category, version DESC'
      );

      this.models.clear();
      models.forEach((model: any) => {
        this.models.set(model.category as FlaggingCategory, {
          id: model.id,
          name: model.name,
          version: model.version,
          category: model.category as FlaggingCategory,
          endpoint: model.endpoint,
          isActive: Boolean(model.is_active),
          accuracy: model.accuracy,
          lastUpdated: model.last_updated,
          configuration: model.configuration ? JSON.parse(model.configuration) : undefined
        });
      });

      console.log(`Loaded ${this.models.size} ML models`);
 catch (error) {
      console.error('Failed to load ML models:', error);
      // Continue without models - will use rule-based fallbacks



  /**
   * Helper methods for query building
   */
  private buildWhereClause(organizationId?: string, startDate?: Date, endDate?: Date): string {
    const conditions = ['1 = 1'];
    
    if (organizationId) {
      conditions.push('organization_id = ?');

    if (startDate) {
      conditions.push('timestamp >= ?');

    if (endDate) {
      conditions.push('timestamp <= ?');


    return conditions.length > 1 ? `WHERE ${conditions.join(' AND ')}` : '';


  private buildQueryParams(organizationId?: string, startDate?: Date, endDate?: Date): any[] {
    const params: any[] = [];
    
    if (organizationId) params.push(organizationId);
    if (startDate) params.push(startDate);
    if (endDate) params.push(endDate);
    
    return params;



export default MLFlaggingService;