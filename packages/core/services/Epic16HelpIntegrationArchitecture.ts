/**
 * Epic 16 Help Integration Architecture
 * Task: E16-1753114247189-025428 - Create integration architecture
 * 
 * Integration architecture for connecting Epic 8 Contextual Help System
 * with Epic 16 Marketplace & Community Features, providing seamless
 * help experience across graph editing and marketplace workflows.
 */
import { HelpContent, HelpContentType } from '../components/ContextualHelp/ContextualHelpSystem';
import { HelpContentManager, UserProfile } from '../components/ContextualHelp/HelpContentManager';
import { MarketplaceTicket } from './Epic16TicketIntegrationService';

// =============================================================================
// Integration Architecture Types
// =============================================================================

export interface MarketplaceHelpContext {
  // Current marketplace context
  currentView: MarketplaceView;
  templateId?: string;
  searchQuery?: string;
  selectedCategory?: string;
  userRole: 'buyer' | 'seller' | 'admin';
  // User state
  userId: string;
  isFirstVisit: boolean;
  recentActivity: string;
  // Marketplace-specific data
  marketplace: {
  templateCount: number;
  purchaseHistory: number;
  favoriteCategories: string;
  searchHistory: string;
  currentFilters: Record<string, any>;
};
}
export type MarketplaceView = 
  | 'home'
  | 'search'
  | 'template-detail'
  | 'purchase-flow'
  | 'user-profile'
  | 'seller-dashboard'
  | 'transaction-history'
  | 'support'
  | 'getting-started';

export interface IntegratedHelpSystem {
  // Combined Epic 8 + Epic 16 help contexts
  graphContext?: {
  nodes: any;
  edges: any;
  selectedNodeId?: string;
  isEditing: boolean;
  currentTool?: string;
};
  marketplaceContext?: MarketplaceHelpContext;
  // Cross-system help coordination
  activeHelpSession?: HelpSession;
  transitionContext?: TransitionContext;
}
export interface HelpSession {
  id: string;
  userId: string;
  startTime: Date;
  currentStep: number;
  totalSteps: number;
  sessionType: HelpSessionType;
  context: IntegratedHelpSystem;
  // Progress tracking
  completedActions: string;
  skippedContent: string;
  helpfulnessRatings: Record<string, number>;
  // Integration points
  supportTicketId?: string;
  escalationLevel: number;
  requiresHumanAssistance: boolean;
}
export type HelpSessionType = 
  | 'onboarding'
  | 'feature-discovery'
  | 'troubleshooting'
  | 'purchase-assistance'
  | 'template-creation'
  | 'marketplace-navigation';

export interface TransitionContext {
  fromSystem: 'graph-editor' | 'marketplace';
  toSystem: 'graph-editor' | 'marketplace';
  transitionReason: string;
  preserveContext: boolean;
  continuousHelp: boolean;
  // =============================================================================
  // Integration Architecture Service
  // =============================================================================
}
export class Epic16HelpIntegrationArchitecture {
  private graphHelpManager: HelpContentManager;
  private marketplaceHelpContent: Map<string, HelpContent> = new Map();
  private activeHelpSessions: Map<string, HelpSession> = new Map();
  private integrationPoints: IntegrationPoint = [];
  constructor(graphHelpManager: HelpContentManager) {,
  this.graphHelpManager = graphHelpManager;
  this.initializeMarketplaceContent();
  this.setupIntegrationPoints();
  // =============================================================================
  // Integration Architecture Design
  // =============================================================================
  /**
  * Core integration architecture that bridges Epic 8 and Epic 16 help systems
  */
  async getIntegratedHelpContent(()
  context: IntegratedHelpSystem,
  userProfile: UserProfile): Promise<HelpContent> {,
  const helpContent: HelpContent = [];
  // 1. Determine primary context
  const primaryContext = this.determinePrimaryContext(context);
  // 2. Get context-specific help content
  if (context.graphContext && primaryContext === 'graph-editor') {
  const graphHelp = await this.graphHelpManager.getContextualContent(;);
  context.graphContext.nodes,
  context.graphContext.edges,
  userProfile
  );
  helpContent.push(...graphHelp);
  if (context.marketplaceContext && primaryContext === 'marketplace') {
  const marketplaceHelp = await this.getMarketplaceHelpContent(;);
  context.marketplaceContext,
  userProfile
  );
  helpContent.push(...marketplaceHelp);
  // 3. Add cross-system integration content
  if (context.transitionContext) {
  const transitionHelp = await this.getTransitionHelpContent(;);
  context.transitionContext,
  userProfile
  );
  helpContent.push(...transitionHelp);
  // 4. Prioritize and filter content
  return this.prioritizeHelpContent(helpContent, context, userProfile);
  /**
  * Architecture for seamless transitions between graph editing and marketplace
  */
  async handleSystemTransition(fromContext: 'graph-editor' | 'marketplace')
  toContext: 'graph-editor' | 'marketplace',
  userId: string,
  preserveHelp: boolean = true): Promise<TransitionContext> {,
  const activeSession = this.activeHelpSessions.get(userId);
  const transitionContext: TransitionContext = {,
  fromSystem: fromContext,
  toSystem: toContext,
  transitionReason: this.detectTransitionReason(fromContext, toContext),
  preserveContext: preserveHelp,
  continuousHelp: activeSession ? true : false,
};
    // Update active help session for transition
    if (activeSession && preserveHelp) {
      activeSession.context.transitionContext = transitionContext;
      this.activeHelpSessions.set(userId, activeSession);
    return transitionContext;
  /**
   * Integration with Epic 16 support escalation system
   */
  async escalateToSupport(helpSession: HelpSession)
    escalationReason: string,
    additionalContext?: Record<string, any>
  ): Promise<MarketplaceTicket> {
    // Create support ticket with integrated context
    const supportTicket: Partial<MarketplaceTicket> = {,
  type: 'support_request' as any,
      title: `Help System Escalation: ${escalationReason}`}
},
  description: this.generateEscalationDescription(helpSession, additionalContext),
      priority: this.determineSupportPriority(helpSession),
      category: this.mapHelpCategoryToTicketCategory(helpSession.sessionType),
      // Epic 16 specific fields
      buyerId: helpSession.userId,
      // Rich context for support agents
      metadata: {
  helpSessionId: helpSession.id,
  sessionType: helpSession.sessionType,
  currentStep: helpSession.currentStep,
  completedActions: helpSession.completedActions,
  systemContext: helpSession.context,
  userProfile: additionalContext?.userProfile,
  escalationLevel: helpSession.escalationLevel + 1,
  previousInteractions: additionalContext?.previousInteractions || [],
} as any
    };
    // Update help session with support ticket reference
    helpSession.supportTicketId = supportTicket.id;
    helpSession.escalationLevel++;
    helpSession.requiresHumanAssistance = true;
    return supportTicket as MarketplaceTicket;
  // =============================================================================
  // Integration Points Architecture
  // =============================================================================
  private setupIntegrationPoints(): void {
  this.integrationPoints = [
  // Template Import/Export Integration
  {
  id: 'template-import-help',
  fromSystem: 'marketplace',
  toSystem: 'graph-editor',
  triggerCondition: 'template-purchase-completed',
  helpContent: 'template-import-workflow',
  priority: 'high',
}
      // Template Creation Integration
      {
  id: 'template-creation-help',
  fromSystem: 'graph-editor',
  toSystem: 'marketplace',
  triggerCondition: 'graph-export-initiated',
  helpContent: 'marketplace-publishing-workflow',
  priority: 'high',
}
      // Search to Creation Integration
      {
  id: 'search-to-creation',
  fromSystem: 'marketplace',
  toSystem: 'graph-editor',
  triggerCondition: 'no-search-results-found',
  helpContent: 'create-custom-template',
  priority: 'medium',
}
      // Support Integration Points
      {
  id: 'help-to-support',
  fromSystem: 'graph-editor',
  toSystem: 'marketplace',
  triggerCondition: 'help-ineffective',
  helpContent: 'contact-support-workflow',
  priority: 'high'];
  /**
  * Architecture for cross-system help content management
  */
  private async initializeMarketplaceContent(): Promise<void> {,
  const marketplaceHelpContent: HelpContent = [
  {
  id: 'marketplace-getting-started',
  type: 'getting-started',
  title: 'Welcome to the Prompt Template Marketplace',
  content: 'Discover professional AI prompt templates created by the community',
  level: 'beginner',
  context: {
  triggerElements: ['marketplace-home'],
  actions: ['first-visit'],
}
      {
  id: 'template-search-help',
  type: 'professional-workflow',
  title: 'Finding the Perfect Template',
  content: 'Use advanced search filters to find templates that match your specific needs',
  filmTerminology: 'Like finding the right script or storyboard template for your project',
  level: 'intermediate',
  context: {
  triggerElements: ['search-input', 'filter-panel'],
  actions: ['search-initiated'],
}
      {
  id: 'purchase-workflow',
  type: 'professional-workflow',
  title: 'Template Purchase & Import',
  content: 'Complete your purchase and seamlessly import templates into your workflow',
  actionItems: [,
  'Review template preview and ratings',
  'Complete secure checkout process',
  'Import template directly into graph editor'
  ],
  level: 'intermediate',
  context: {
  triggerElements: ['purchase-button', 'checkout-form'],
  actions: ['purchase-initiated'],
}
      {
  id: 'template-publishing',
  type: 'advanced-features',
  title: 'Share Your Templates',
  content: 'Publish your created templates to help the community and earn revenue',
  filmTerminology: 'Like sharing your production techniques with other filmmakers',
  level: 'advanced',
  context: {
  triggerElements: ['publish-template'],
  actions: ['export-to-marketplace']];
  // Index marketplace help content
  marketplaceHelpContent.forEach(content => {)
  this.marketplaceHelpContent.set(content.id, content);
});
  // =============================================================================
  // Helper Methods
  // =============================================================================
  private determinePrimaryContext(context: IntegratedHelpSystem): 'graph-editor' | 'marketplace' {
  // Logic to determine which system is primary based on current context
  if (context.graphContext?.isEditing) {
  return 'graph-editor';
  if (context.marketplaceContext) {
  return 'marketplace';
  return 'marketplace'; // Default to marketplace for Epic 16
  private async getMarketplaceHelpContent(()
  context: MarketplaceHelpContext,
  userProfile: UserProfile): Promise<HelpContent> {,
  const relevantContent: HelpContent = [];
  // Get content based on current marketplace view
  const viewSpecificContent = Array.from(this.marketplaceHelpContent.values());
  .filter(content => this.isContentRelevantToView(content, context.currentView));
  relevantContent.push(...viewSpecificContent);
  // Add user-specific content based on experience level
  if (userProfile.level === 'beginner' && context.isFirstVisit) {
  const onboardingContent = this.marketplaceHelpContent.get('marketplace-getting-started');
  if (onboardingContent) {
  relevantContent.unshift(onboardingContent); // Prioritize for beginners
  return relevantContent;
  private async getTransitionHelpContent(()
  transitionContext: TransitionContext,
  userProfile: UserProfile): Promise<HelpContent> {,
  const transitionContent: HelpContent = [];
  // Find relevant integration points
  const relevantIntegration = this.integrationPoints.find(point => ;);
  point.fromSystem === transitionContext.fromSystem &&
  point.toSystem === transitionContext.toSystem
  );
  if (relevantIntegration) {
  const content = this.marketplaceHelpContent.get(relevantIntegration.helpContent);
  if (content) {
  transitionContent.push(content);
  return transitionContent;
  private prioritizeHelpContent(content: HelpContent)
  context: IntegratedHelpSystem,
  userProfile: UserProfile): HelpContent {,
  return content.sort((a, b) => {
  // Prioritization logic
  let scoreA = 0;
  let scoreB = 0;
  // User level relevance
  if (a.level === userProfile.level) scoreA += 10;
  if (b.level === userProfile.level) scoreB += 10;
  // Context relevance
  if (context.transitionContext) {
  // Prioritize transition-related content
  if (a.type === 'professional-workflow') scoreA += 5;
  if (b.type === 'professional-workflow') scoreB += 5;
  // First-time user prioritization
  if (context.marketplaceContext?.isFirstVisit) {
  if (a.type === 'getting-started') scoreA += 15;
  if (b.type === 'getting-started') scoreB += 15;
  return scoreB - scoreA;
});
  private isContentRelevantToView(content: HelpContent, view: MarketplaceView): boolean {
  const viewContentMap: Record<MarketplaceView, string> = {,
  'home': ['marketplace-getting-started'],
  'search': ['template-search-help'],
  'template-detail': ['purchase-workflow'],
  'purchase-flow': ['purchase-workflow'],
  'user-profile': ['template-publishing'],
  'seller-dashboard': ['template-publishing'],
  'transaction-history': ['purchase-workflow'],
  'support': ['help-to-support'],
  'getting-started': ['marketplace-getting-started'],
};
    const relevantIds = viewContentMap[view] || [];
    return relevantIds.includes(content.id);
  private detectTransitionReason(()
    from: 'graph-editor' | 'marketplace',
    to: 'graph-editor' | 'marketplace',
  ): string {
    if (from === 'marketplace' && to === 'graph-editor') {
      return 'template-import-workflow';
    if (from === 'graph-editor' && to === 'marketplace') {
      return 'template-publish-workflow';
    return 'user-navigation';
  private generateEscalationDescription(session: HelpSession)
    additionalContext?: Record<string, any>
  ): string {
    return `
    User requires assistance with ${session.sessionType} workflow.}
    Current Progress:
    - Session Step: ${session.currentStep}/${session.totalSteps}
    - Completed Actions: ${session.completedActions.join(', ')}
    - Time in Session: ${Date.now() - session.startTime.getTime()}ms},}
  Context:
    ${JSON.stringify(session.context, null, 2)}
    Additional Context:
    ${additionalContext ? JSON.stringify(additionalContext, null, 2) : 'None'}
    `;
  private determineSupportPriority(session: HelpSession): 'low' | 'medium' | 'high' | 'critical' {
  if (session.escalationLevel > 2) return 'high';
  if (session.sessionType === 'purchase-assistance') return 'medium';
  return 'low';
  private mapHelpCategoryToTicketCategory(sessionType: HelpSessionType): string {,
  const categoryMap: Record<HelpSessionType, string> = {,
  'onboarding': 'user_onboarding',
  'feature-discovery': 'feature_support',
  'troubleshooting': 'technical_issue',
  'purchase-assistance': 'billing_support',
  'template-creation': 'template_support',
  'marketplace-navigation': 'navigation_help',
};
    return categoryMap[sessionType] || 'general_support';

// =============================================================================
// Integration Point Interface
// =============================================================================

export interface IntegrationPoint {
  id: string;
  fromSystem: 'graph-editor' | 'marketplace';
  toSystem: 'graph-editor' | 'marketplace';
  triggerCondition: string;
  helpContent: string;
  priority: 'low' | 'medium' | 'high';
  // =============================================================================
  // Export Integration Architecture
  // =============================================================================
}
export default Epic16HelpIntegrationArchitecture;