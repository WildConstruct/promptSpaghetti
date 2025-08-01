/**
 * Epic 16: Decision Recording Service
 * Task: E16-1753114247059-819734 - Implement decision recording
 * 
 * Comprehensive decision recording system for moderation actions with
 * audit trails, appeal support, and analytics for content governance.
 */



export interface ModerationDecision {
  id: string;
  caseId: string;
  contentId: string;
  contentType: 'template' | 'review' | 'forum_post' | 'knowledge_article' | 'tutorial' | 'user_profile' | 'comment' | 'collection';
  
  // Decision details
  decisionType: 'approve' | 'reject' | 'flag' | 'remove' | 'warning' | 'suspend' | 'escalate' | 'require_changes' | 'archive' | 'restrict';
  decisionStatus: 'draft' | 'final' | 'appealed' | 'overturned' | 'upheld';
  
  // Reasoning
  primaryReason: string;
  secondaryReasons: string[];
  detailedReasoning: string;
  confidenceLevel: number; // 1-5
  
  // Evidence and context
  evidence: Record<string, any>;
  policyReferences: string[];
  precedentCases: string[];
  
  // Decision maker
  moderatorId: string;
  moderatorType: 'human' | 'ai' | 'hybrid';
  reviewLevel: 'automated' | 'standard' | 'senior' | 'panel';
  
  // Timing and workflow
  decisionDuration?: number;
  escalatedFrom?: string;
  escalatedTo?: string;
  
  // Actions and notifications
  actionsTaken: DecisionAction[];
  automatedActions: DecisionAction[];
  notificationSent: boolean;
  
  // Appeal information
  isAppealable: boolean;
  appealDeadline?: Date;
  appealId?: string;
  
  // Quality and feedback
  accuracyRating?: number;
  feedbackReceived?: string;
  trainingCase: boolean;
  
  // Metadata
  metadata: Record<string, any>;
  internalNotes?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  effectiveAt: Date;
  expiresAt?: Date;







export interface DecisionAction {
  type: string;
  parameters: Record<string, any>;
  immediate: boolean;
  completed: boolean;
  completedAt?: Date;
  result?: Record<string, any>;







export interface DecisionTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  decisionType: string;
  reasonCode: string;
  reasonTemplate: string;
  
  // Usage settings
  isActive: boolean;
  requiresCustomization: boolean;
  minimumEvidenceRequired: number;
  
  // Policy context
  policySections: string[];
  severityLevel: 'low' | 'medium' | 'high' | 'critical';
  
  // Automation
  autoApplyConditions?: Record<string, any>;
  suggestedActions: DecisionAction[];
  
  // Statistics
  usageCount: number;
  effectivenessScore?: number;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastUsed?: Date;







export interface DecisionHistory {
  id: string;
  decisionId: string;
  changeType: 'created' | 'updated' | 'appealed' | 'overturned' | 'upheld' | 'escalated' | 'expired' | 'revoked';
  previousData?: Record<string, any>;
  newData?: Record<string, any>;
  changeReason?: string;
  changedBy: string;
  changeSource: 'manual' | 'automated' | 'appeal' | 'review';
  metadata: Record<string, any>;
  createdAt: Date;







export interface DecisionAnalytics {
  date: string;
  moderatorId?: string;
  
  // Volume metrics
  totalDecisions: number;
  decisionsByType: Record<string, number>;
  decisionsByReason: Record<string, number>;
  
  // Quality metrics
  averageConfidence?: number;
  averageDecisionTime?: number;
  appealRate?: number;
  overturnRate?: number;
  
  // Efficiency metrics
  automatedDecisions: number;
  escalatedDecisions: number;
  templateUsageRate?: number;
  
  // Accuracy metrics
  accuracyScore?: number;
  consistencyScore?: number;
  
  // Content breakdown
  contentTypeBreakdown: Record<string, number>;







export interface DecisionFilter {
  contentTypes?: string[];
  decisionTypes?: string[];
  decisionStatus?: string[];
  moderatorIds?: string[];



  dateRange?: { start?: Date; end?: Date };
  caseIds?: string[];
  appealable?: boolean;
  confidenceRange?: { min?: number; max?: number };




export interface CreateDecisionRequest {
  caseId: string;
  contentId: string;
  contentType: string;
  decisionType: string;
  primaryReason: string;
  secondaryReasons?: string[];
  detailedReasoning: string;
  confidenceLevel: number;
  evidence?: Record<string, any>;
  policyReferences?: string[];
  precedentCases?: string[];
  actionsTaken?: DecisionAction[];
  isAppealable?: boolean;
  appealDeadline?: Date;
  metadata?: Record<string, any>;
  internalNotes?: string;
  effectiveAt?: Date;
  expiresAt?: Date;







export interface UpdateDecisionRequest {
  decisionStatus?: string;
  detailedReasoning?: string;
  confidenceLevel?: number;
  evidence?: Record<string, any>;
  policyReferences?: string[];
  actionsTaken?: DecisionAction[];
  accuracyRating?: number;
  feedbackReceived?: string;
  metadata?: Record<string, any>;
  internalNotes?: string;





/**
 * Decision Recording Service
 * 
 * Manages comprehensive recording of moderation decisions with audit trails,
 * template management, and analytics for quality improvement.
 */
export class Epic16DecisionRecordingService {
  private static instance: Epic16DecisionRecordingService;
  private decisions: Map<string, ModerationDecision> = new Map();
  private templates: Map<string, DecisionTemplate> = new Map();
  private history: Map<string, DecisionHistory[]> = new Map();
  private analytics: Map<string, DecisionAnalytics> = new Map();

  private constructor() {
    this.initializeDefaultTemplates();


  static getInstance(): Epic16DecisionRecordingService {
    if (!Epic16DecisionRecordingService.instance) {
      Epic16DecisionRecordingService.instance = new Epic16DecisionRecordingService();

    return Epic16DecisionRecordingService.instance;


  /**
   * Decision Management
   */
  async createDecision(
    request: CreateDecisionRequest,
    moderatorId: string
  ): Promise<ModerationDecision> {

    const startTime = Date.now();
    
    const decision: ModerationDecision = {
      id: this.generateDecisionId(),
      caseId: request.caseId,
      contentId: request.contentId,
      contentType: request.contentType as any,
      decisionType: request.decisionType as any,
      decisionStatus: 'final',
      primaryReason: request.primaryReason,
      secondaryReasons: request.secondaryReasons || [],
      detailedReasoning: request.detailedReasoning,
      confidenceLevel: request.confidenceLevel,
      evidence: request.evidence || {},
      policyReferences: request.policyReferences || [],
      precedentCases: request.precedentCases || [],
      moderatorId,
      moderatorType: 'human',
      reviewLevel: 'standard',
      decisionDuration: Date.now() - startTime,
      actionsTaken: request.actionsTaken || [],
      automatedActions: [],
      notificationSent: false,
      isAppealable: request.isAppealable ?? true,
      appealDeadline: request.appealDeadline,
      trainingCase: false,
      metadata: request.metadata || {},
      internalNotes: request.internalNotes,
      createdAt: new Date(),
      updatedAt: new Date(),
      effectiveAt: request.effectiveAt || new Date(),
      expiresAt: request.expiresAt
    };

    this.decisions.set(decision.id, decision);
    await this.recordHistory(decision.id, 'created', undefined, decision, moderatorId, 'manual');
    await this.updateAnalytics(decision);
    
    return decision;


  async updateDecision(
    decisionId: string,
    updates: UpdateDecisionRequest,
    updatedBy: string
  ): Promise<ModerationDecision | null> {

    const decision = this.decisions.get(decisionId);
    if (!decision) return null;

    const previousData = { ...decision };
    const updatedDecision: ModerationDecision = {
      ...decision,
      ...updates,
      updatedAt: new Date()
    };

    this.decisions.set(decisionId, updatedDecision);
    await this.recordHistory(decisionId, 'updated', previousData, updatedDecision, updatedBy, 'manual');
    
    return updatedDecision;


  async getDecision(decisionId: string): Promise<ModerationDecision | null> {

    return this.decisions.get(decisionId) || null;


  async getDecisions(filter?: DecisionFilter): Promise<ModerationDecision[]> {

    let decisions = Array.from(this.decisions.values());

    if (!filter) return decisions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    if (filter.contentTypes?.length) {
      decisions = decisions.filter(d => filter.contentTypes!.includes(d.contentType));


    if (filter.decisionTypes?.length) {
      decisions = decisions.filter(d => filter.decisionTypes!.includes(d.decisionType));


    if (filter.decisionStatus?.length) {
      decisions = decisions.filter(d => filter.decisionStatus!.includes(d.decisionStatus));


    if (filter.moderatorIds?.length) {
      decisions = decisions.filter(d => filter.moderatorIds!.includes(d.moderatorId));


    if (filter.caseIds?.length) {
      decisions = decisions.filter(d => filter.caseIds!.includes(d.caseId));


    if (filter.appealable !== undefined) {
      decisions = decisions.filter(d => d.isAppealable === filter.appealable);


    if (filter.confidenceRange) {
      decisions = decisions.filter(d => {
        const min = filter.confidenceRange!.min ?? 1;
        const max = filter.confidenceRange!.max ?? 5;
        return d.confidenceLevel >= min && d.confidenceLevel <= max;
      });


    if (filter.dateRange) {
      decisions = decisions.filter(d => {
        const date = d.createdAt;
        return (!filter.dateRange!.start || date >= filter.dateRange!.start) &&
               (!filter.dateRange!.end || date <= filter.dateRange!.end);
      });


    return decisions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());


  async getDecisionsByCase(caseId: string): Promise<ModerationDecision[]> {

    return this.getDecisions({ caseIds: [caseId] });


  async getDecisionsByContent(contentId: string, contentType: string): Promise<ModerationDecision[]> {

    return Array.from(this.decisions.values())
      .filter(d => d.contentId === contentId && d.contentType === contentType)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());


  /**
   * Decision Templates
   */
  async createDecisionTemplate(
    templateData: Omit<DecisionTemplate, 'id' | 'usageCount' | 'createdAt' | 'updatedAt'>,
    _____createdBy: string
  ): Promise<DecisionTemplate> {

    const template: DecisionTemplate = {
      ...templateData,
      id: this.generateTemplateId(),
      usageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.templates.set(template.id, template);
    return template;


  async getDecisionTemplates(category?: string): Promise<DecisionTemplate[]> {

    let templates = Array.from(this.templates.values());
    
    if (category) {
      templates = templates.filter(t => t.category === category);


    return templates
      .filter(t => t.isActive)
      .sort((a, b) => a.name.localeCompare(b.name));


  async applyDecisionTemplate(
    templateId: string,
    placeholders: Record<string, string>
  ): Promise<Partial<CreateDecisionRequest> | null> {
    const template = this.templates.get(templateId);
    if (!template || !template.isActive) return null;

    // Update usage statistics
    template.usageCount++;
    template.lastUsed = new Date();
    this.templates.set(templateId, template);

    // Apply placeholders to template
    let reasonText = template.reasonTemplate;
    Object.entries(placeholders).forEach(([key, value]) => {
      reasonText = reasonText.replace(new RegExp(`{${key}}`, 'g'), value);
    });

    return {
      decisionType: template.decisionType as any,
      primaryReason: template.reasonCode,
      detailedReasoning: reasonText,
      policyReferences: template.policySections,
      actionsTaken: template.suggestedActions,
      metadata: { templateId, placeholders }
    };


  /**
   * Decision History
   */
  async getDecisionHistory(decisionId: string): Promise<DecisionHistory[]> {

    return this.history.get(decisionId) || [];


  async recordHistory(
    decisionId: string,
    changeType: DecisionHistory['changeType'],
    previousData: unknown,
    newData: unknown,
    changedBy: string,
    changeSource: DecisionHistory['changeSource'],
    changeReason?: string
  ): Promise<void> {

    const historyEntry: DecisionHistory = {
      id: this.generateHistoryId(),
      decisionId,
      changeType,
      previousData,
      newData,
      changeReason,
      changedBy,
      changeSource,
      metadata: {},
      createdAt: new Date()
    };

    const existingHistory = this.history.get(decisionId) || [];
    existingHistory.push(historyEntry);
    this.history.set(decisionId, existingHistory);


  /**
   * Appeals Management
   */
  async markDecisionAsAppealed(
    decisionId: string,
    appealId: string,
    appealedBy: string
  ): Promise<boolean> {

    const decision = this.decisions.get(decisionId);
    if (!decision || !decision.isAppealable) return false;

    if (decision.appealDeadline && new Date() > decision.appealDeadline) {
      return false; // Appeal deadline has passed


    const previousData = { ...decision };
    decision.decisionStatus = 'appealed';
    decision.appealId = appealId;
    decision.updatedAt = new Date();

    this.decisions.set(decisionId, decision);
    await this.recordHistory(decisionId, 'appealed', previousData, decision, appealedBy, 'appeal');
    
    return true;


  async resolveAppeal(
    decisionId: string,
    resolution: 'upheld' | 'overturned',
    resolvedBy: string,
    reason?: string
  ): Promise<boolean> {

    const decision = this.decisions.get(decisionId);
    if (!decision || decision.decisionStatus !== 'appealed') return false;

    const previousData = { ...decision };
    decision.decisionStatus = resolution;
    decision.updatedAt = new Date();

    this.decisions.set(decisionId, decision);
    await this.recordHistory(decisionId, resolution, previousData, decision, resolvedBy, 'review', reason);
    
    return true;


  /**
   * Analytics and Reporting
   */
  async getDecisionAnalytics(
    startDate: Date,
    endDate: Date,
    moderatorId?: string
  ): Promise<DecisionAnalytics[]> {

    const decisions = await this.getDecisions({
      dateRange: { start: startDate, end: endDate },
      moderatorIds: moderatorId ? [moderatorId] : undefined
    });

    const analyticsMap = new Map<string, DecisionAnalytics>();

    // Group by date and moderator
    decisions.forEach(decision => {
      const dateKey = decision.createdAt.toISOString().split('T')[0];
      const key = moderatorId ? `${dateKey}-${moderatorId}` : dateKey;
      
      let analytics = analyticsMap.get(key);
      if (!analytics) {
        analytics = {
          date: dateKey,
          moderatorId,
          totalDecisions: 0,
          decisionsByType: {},
          decisionsByReason: {},
          automatedDecisions: 0,
          escalatedDecisions: 0,
          contentTypeBreakdown: {}
        };
        analyticsMap.set(key, analytics);


      // Update metrics
      analytics.totalDecisions++;
      analytics.decisionsByType[decision.decisionType] = 
        (analytics.decisionsByType[decision.decisionType] || 0) + 1;
      analytics.decisionsByReason[decision.primaryReason] = 
        (analytics.decisionsByReason[decision.primaryReason] || 0) + 1;
      analytics.contentTypeBreakdown[decision.contentType] =
        (analytics.contentTypeBreakdown[decision.contentType] || 0) + 1;

      if (decision.moderatorType === 'ai') {
        analytics.automatedDecisions++;

      if (decision.escalatedFrom) {
        analytics.escalatedDecisions++;

    });

    // Calculate quality metrics
    analyticsMap.forEach(analytics => {
      const relevantDecisions = decisions.filter(d => {
        const dateMatches = d.createdAt.toISOString().split('T')[0] === analytics.date;
        const moderatorMatches = !moderatorId || d.moderatorId === moderatorId;
        return dateMatches && moderatorMatches;
      });

      if (relevantDecisions.length > 0) {
        analytics.averageConfidence = relevantDecisions
          .reduce((sum, d) => sum + d.confidenceLevel, 0) / relevantDecisions.length;
        
        const decisionsWithDuration = relevantDecisions.filter(d => d.decisionDuration);
        if (decisionsWithDuration.length > 0) {
          analytics.averageDecisionTime = decisionsWithDuration
            .reduce((sum, d) => sum + (d.decisionDuration || 0), 0) / decisionsWithDuration.length;


        const appealedDecisions = relevantDecisions.filter(d => d.decisionStatus === 'appealed');
        analytics.appealRate = (appealedDecisions.length / relevantDecisions.length) * 100;

        const overturnedDecisions = relevantDecisions.filter(d => d.decisionStatus === 'overturned');
        analytics.overturnRate = appealedDecisions.length > 0 ? 
          (overturnedDecisions.length / appealedDecisions.length) * 100 : 0;

        const decisionsWithTemplates = relevantDecisions.filter(d => d.metadata.templateId);
        analytics.templateUsageRate = (decisionsWithTemplates.length / relevantDecisions.length) * 100;

        const decisionsWithAccuracy = relevantDecisions.filter(d => d.accuracyRating);
        if (decisionsWithAccuracy.length > 0) {
          analytics.accuracyScore = decisionsWithAccuracy
            .reduce((sum, d) => sum + (d.accuracyRating || 0), 0) / decisionsWithAccuracy.length / 5;


    });

    return Array.from(analyticsMap.values()).sort((a, b) => a.date.localeCompare(b.date));


  async updateAnalytics(decision: ModerationDecision): Promise<void> {

    const dateKey = decision.createdAt.toISOString().split('T')[0];
    
    // Update aggregate analytics
    let aggregateAnalytics = this.analytics.get(dateKey);
    if (!aggregateAnalytics) {
      aggregateAnalytics = {
        date: dateKey,
        totalDecisions: 0,
        decisionsByType: {},
        decisionsByReason: {},
        automatedDecisions: 0,
        escalatedDecisions: 0,
        contentTypeBreakdown: {}
      };
      this.analytics.set(dateKey, aggregateAnalytics);


    aggregateAnalytics.totalDecisions++;
    aggregateAnalytics.decisionsByType[decision.decisionType] = 
      (aggregateAnalytics.decisionsByType[decision.decisionType] || 0) + 1;
    // ... update other metrics


  /**
   * Utility Methods
   */
  private initializeDefaultTemplates(): void {
    // Default templates are created in the database migration
    // This method would load them from the database in a real implementation


  private generateDecisionId(): string {
    return `decision_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;


  private generateTemplateId(): string {
    return `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;


  private generateHistoryId(): string {
    return `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;


  /**
   * Search and Discovery
   */
  async searchDecisions(
    query: string,
    filter?: DecisionFilter
  ): Promise<ModerationDecision[]> {

    const decisions = await this.getDecisions(filter);
    const queryLower = query.toLowerCase();

    return decisions.filter(decision => 
      decision.caseId.toLowerCase().includes(queryLower) ||
      decision.detailedReasoning.toLowerCase().includes(queryLower) ||
      decision.primaryReason.toLowerCase().includes(queryLower) ||
      decision.secondaryReasons.some(reason => reason.toLowerCase().includes(queryLower)) ||
      (decision.feedbackReceived && decision.feedbackReceived.toLowerCase().includes(queryLower))
    );


  async findPrecedentCases(
    contentType: string,
    decisionType: string,
    reason: string,
    limit: number = 10
  ): Promise<ModerationDecision[]> {

    const decisions = await this.getDecisions({
      contentTypes: [contentType],
      decisionTypes: [decisionType]
    });

    return decisions
      .filter(d => 
        d.primaryReason === reason || 
        d.secondaryReasons.includes(reason)

      .filter(d => d.decisionStatus === 'final' || d.decisionStatus === 'upheld')
      .sort((a, b) => (b.confidenceLevel - a.confidenceLevel) || (b.createdAt.getTime() - a.createdAt.getTime()))
      .slice(0, limit);


  /**
   * Quality Assurance
   */
  async flagForQualityReview(
    decisionId: string,
    reason: string,
    flaggedBy: string
  ): Promise<boolean> {

    const decision = this.decisions.get(decisionId);
    if (!decision) return false;

    decision.metadata.qualityReviewFlag = {
      reason,
      flaggedBy,
      flaggedAt: new Date()
    };
    decision.updatedAt = new Date();

    this.decisions.set(decisionId, decision);
    return true;


  async getDecisionsForQualityReview(): Promise<ModerationDecision[]> {

    return Array.from(this.decisions.values())
      .filter(d => d.metadata.qualityReviewFlag)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());



// Export singleton instance
export const epic16DecisionRecordingService = Epic16DecisionRecordingService.getInstance();

// Convenience functions
export const createDecision = (request: CreateDecisionRequest, moderatorId: string) =>
  epic16DecisionRecordingService.createDecision(request, moderatorId);

export const getDecision = (decisionId: string) =>
  epic16DecisionRecordingService.getDecision(decisionId);

export const getDecisionsByCase = (caseId: string) =>
  epic16DecisionRecordingService.getDecisionsByCase(caseId);

export const getDecisionAnalytics = (startDate: Date, endDate: Date, moderatorId?: string) =>
  epic16DecisionRecordingService.getDecisionAnalytics(startDate, endDate, moderatorId);