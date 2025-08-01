/**
 * Epic 8.4 - Help Content Management System
 * 
 * Manages contextual help content with intelligent content delivery,
 * user proficiency tracking, and director-friendly guidance.
 * 
 * Features:
 * - Dynamic help content management
 * - User proficiency level tracking
 * - Context-aware content delivery
 * - Film industry terminology integration
 * - Progressive learning path management
 */
import { HelpContent } from './ContextualHelpSystem';


export interface UserProfile { id: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'professional';
  viewedContent: Set<string>;
  completedTours: Set<string>;
  preferences: {;
  showFilmTerminology: boolean;
  autoTriggerHelp: boolean;
  preferredComplexity: 'simple' | 'detailed' | 'comprehensive';
  filmIndustryRole?: 'director' | 'producer' | 'writer' | 'vfx-artist' | 'editor' }


  };
  progress: { ,
  nodesCreated: number;
  connectionsBuilt: number;
  previewsGenerated: number;
  projectsCompleted: number;
  advancedFeaturesUsed: string };
  lastActivity: Date;


export interface LearningPath { id: string;
  name: string;
  description: string;
  targetRole: string;
  steps: { }
  contentId: string;
  requiredProgress?: Record<string, number>;
  unlockConditions?: string;


[];

export class HelpContentManager {
  private userProfile: UserProfile;
  private helpContent: Map<string, HelpContent>;
  private learningPaths: Map<string, LearningPath>;
  constructor(userId: string = 'default-user') {
    this.userProfile = this.initializeUserProfile(userId);
    this.helpContent = new Map();
    this.learningPaths = new Map();
    this.loadDefaultContent();
    this.loadLearningPaths();
  private initializeUserProfile(userId: string): UserProfile {
    // Try to load from localStorage or create new profile
    const saved = localStorage.getItem(`helpProfile_${userId}`);}
    if (saved) { const parsed = JSON.parse(saved);
  return {
  ...parsed
  viewedContent: new Set(parsed.viewedContent)
  completedTours: new Set(parsed.completedTours)
  lastActivity: new Date(parsed.lastActivity) }
};
    return { id: userId
  level: 'beginner'
  viewedContent: new Set()
  completedTours: new Set()
  preferences: {
  showFilmTerminology: true
  autoTriggerHelp: true
  preferredComplexity: 'simple'
  filmIndustryRole: 'director' }

  progress: { 
  nodesCreated: 0
  connectionsBuilt: 0
  previewsGenerated: 0
  projectsCompleted: 0
  advancedFeaturesUsed: [] }

  lastActivity: new Date();
  };
  private saveUserProfile(): void { const toSave = {
  ...this.userProfile
  viewedContent: Array.from(this.userProfile.viewedContent)
  completedTours: Array.from(this.userProfile.completedTours)
  lastActivity: this.userProfile.lastActivity.toISOString() }
};
    localStorage.setItem(`helpProfile_${this.userProfile.id}`, JSON.stringify(toSave));}
  private loadDefaultContent(): void { const defaultContent: HelpContent = [
      {
        id: 'director-welcome'
        type: 'getting-started'
        title: 'Welcome to Wild Construct'
        content: 'You\'re about to explore a powerful tool for creative storytelling. This canvas lets you build narrative flows that can generate unlimited variations of your creative vision.'
        filmTerminology: 'Think of this as your digital script supervisor - it helps you maintain creative consistency while exploring new possibilities.'
        actionItems: [
          'Start with a simple story element using the Output node'
          'Add creative variations with WeightedChoice nodes'
          'Connect nodes to build your narrative flow'
          'Use the preview system to see your story come alive'
        ]
        relatedFeatures: ['Canvas', 'Node Palette', 'Preview System']
        level: 'beginner'
        context: { }
  conditions: { nodeCount: 0 }

      { id: 'output-node-scene'
  type: 'node-creation'
  title: 'Creating Your First Scene'
  content: 'Output nodes are the foundation of your creative work. They represent final content that will appear in your generated results.'
  filmTerminology: 'Like the master shot that establishes your scene - everything else builds around this core element.'
  actionItems: [
  'Drag an Output node from the palette'
  'Write your core narrative text'
  'Connect it to other nodes to build complexity'
  ]
  level: 'beginner'
  context: {
  nodeTypes: ['Output']
  actions: ['node-creation'] }

      { id: 'weighted-choice-takes'
  type: 'professional-workflow'
  title: 'Managing Multiple Takes'
  content: 'WeightedChoice nodes let you manage multiple creative options with different probabilities. Perfect for exploring variations while maintaining creative control.'
  filmTerminology: 'Like having multiple takes of the same scene - you can favor the best performance while keeping alternatives available for different contexts.'
  actionItems: [
  'Add multiple variations in the text areas'
  'Adjust weights to favor preferred options'
  'Use the preview to see how different weights affect results'
  'Save configurations that work well for your creative style'
  ]
  relatedFeatures: ['Weight Controls', 'Preview System', 'Variance Analysis']
  level: 'intermediate'
  context: {
  nodeTypes: ['WeightedChoice']
  actions: ['weight-adjustment'] }

      { id: 'connection-editing-decisions'
  type: 'connection-flow'
  title: 'Making Creative Connections'
  content: 'Connections determine how your creative elements flow together. Each connection is a decision about how your narrative unfolds.'
  filmTerminology: 'Like editing decisions in post-production - you\'re choosing which shots follow each other to create the desired emotional impact.'
  actionItems: [
  'Drag from an output port to an input port'
  'Create branching paths for multiple story directions'
  'Test different connection patterns in preview mode'
  'Use conditional connections for smart narrative flow'
  ]
  level: 'beginner'
  context: {
  actions: ['connection-creation', 'edge-editing'] }

      { id: 'preview-dailies-review'
  type: 'preview-generation'
  title: 'Reviewing Your Creative Dailies'
  content: 'The preview system is your digital dailies room. Generate multiple versions to see how your creative decisions play out.'
  filmTerminology: 'Just like reviewing dailies with the director and DP - you can see different takes and choose the best creative direction.'
  actionItems: [
  'Use the Director Preview Toolbar for real-time feedback'
  'Generate multiple variants to compare creative options'
  'Rate and tag versions you like'
  'Export selected versions for your production pipeline'
  ]
  relatedFeatures: ['Real-time Preview', 'Enhanced Preview Modal', 'Creative Analysis']
  level: 'intermediate'
  context: {
  actions: ['preview-generation']
  triggerElements: ['preview-button', 'director-toolbar'] }

      { id: 'conditional-smart-direction'
        type: 'advanced-features'
        title: 'Smart Creative Direction'
        content: 'Conditional nodes enable intelligent creative decisions based on story context. Build adaptive narratives that respond to creative conditions.'
        filmTerminology: 'Like having different coverage plans for different scenarios - your story adapts intelligently based on the creative context.'
        actionItems: [
          'Define conditions that trigger different creative paths'
          'Use variables to carry story information between scenes'
          'Test edge cases to ensure robust storytelling'
          'Combine with WeightedChoice for sophisticated narrative control'
        ]
        level: 'advanced'
        context: {
  nodeTypes: ['Conditional', 'GetVariable', 'SetVariable'] }
          conditions: { hasConditionals: true }

      { id: 'professional-pipeline-export'
        type: 'professional-workflow'
        title: 'Production Pipeline Integration'
        content: 'Export your creative work in professional formats that integrate seamlessly with VFX and post-production workflows.'
        filmTerminology: 'Like creating the final deliverables for post - structured exports with metadata that fit your production pipeline requirements.'
        actionItems: [
          'Use project export for complete creative packages'
          'Generate bundle exports for VFX pipeline integration'
          'Include metadata and version information'
          'Set up automated exports for collaborative workflows'
        ]
        relatedFeatures: ['Project Export', 'Bundle Generation', 'Version Control']
        level: 'professional'
        context: {
  actions: ['project-export', 'bundle-export'] }
          conditions: { projectsCompleted: 1 }
    ];
    defaultContent.forEach(content => { )
  this.helpContent.set(content.id, content) });
  private loadLearningPaths(): void { const defaultPaths: LearningPath = [
      {
        id: 'director-fundamentals'
        name: 'Director Fundamentals'
        description: 'Essential skills for creative directors using Wild Construct'
        targetRole: 'director' }
        steps: [
          { contentId: 'director-welcome' }
          { contentId: 'output-node-scene', requiredProgress: { nodesCreated: 1 } }
          { contentId: 'weighted-choice-takes', requiredProgress: { nodesCreated: 3 } }
          { contentId: 'connection-editing-decisions', requiredProgress: { connectionsBuilt: 2 } }
          { contentId: 'preview-dailies-review', requiredProgress: { previewsGenerated: 1 } }
        ]

      { id: 'advanced-storytelling'
        name: 'Advanced Creative Storytelling'
        description: 'Professional techniques for complex narrative structures'
        targetRole: 'director' }
        steps: [
          { contentId: 'conditional-smart-direction', unlockConditions: ['director-fundamentals'] }
          { contentId: 'professional-pipeline-export', requiredProgress: { projectsCompleted: 1 } }
        ]
    ];
    defaultPaths.forEach(path => { )
  this.learningPaths.set(path.id, path) });
  // Public API Methods
  public getContextualHelp(context: { ) }
  nodeCount: number;
  edgeCount: number;
  selectedNodeType?: string;
  currentAction?: string;
  triggerElement?: string;
}): HelpContent { const relevantContent = Array.from(this.helpContent.values()).filter(content => {)
  // Check level appropriateness
      const levelOrder = ['beginner', 'intermediate', 'advanced', 'professional'];
      const userLevelIndex = levelOrder.indexOf(this.userProfile.level);
      const contentLevelIndex = levelOrder.indexOf(content.level);
      if (contentLevelIndex > userLevelIndex + 1) return false;
      // Check if already viewed (unless it's important)
      if (this.userProfile.viewedContent.has(content.id) && content.level === 'beginner') {
        return false;
      // Context matching
      if (content.context.conditions) {
        for (const [key, value] of Object.entries(content.context.conditions)) {
          if (context[key as keyof typeof context] !== undefined && )
              context[key as keyof typeof context] !== value) {
            return false;
      // Node type matching
      if (content.context.nodeTypes && context.selectedNodeType) {
        if (!content.context.nodeTypes.includes(context.selectedNodeType)) {
          return false;
      // Action matching
      if (content.context.actions && context.currentAction) {
        if (!content.context.actions.includes(context.currentAction)) {
          return false;
      // Trigger element matching
      if (content.context.triggerElements && context.triggerElement) {
        if (!content.context.triggerElements.includes(context.triggerElement)) {
          return false;
      return true });
    // Sort by relevance and user level
    return relevantContent.sort((a, b) => { const levelOrder = ['beginner', 'intermediate', 'advanced', 'professional'];
      const aIndex = levelOrder.indexOf(a.level);
      const bIndex = levelOrder.indexOf(b.level);
      // Prioritize content closer to user level
      const userLevelIndex = levelOrder.indexOf(this.userProfile.level);
      const aDiff = Math.abs(aIndex - userLevelIndex);
      const bDiff = Math.abs(bIndex - userLevelIndex);
      return aDiff - bDiff });
  public markContentViewed(contentId: string): void { this.userProfile.viewedContent.add(contentId);
  this.userProfile.lastActivity = new Date();
  this.saveUserProfile();
  // Check for level progression
  this.checkLevelProgression();
  public updateProgress(progressType: keyof UserProfile['progress'], value: number | string): void { }
  if (typeof value === 'number') { (this.userProfile.progress as any)[progressType] += value } else if (progressType === 'advancedFeaturesUsed') { const features = this.userProfile.progress.advancedFeaturesUsed;
  if (!features.includes(value)) {
  features.push(value);
  this.userProfile.lastActivity = new Date();
  this.saveUserProfile();
  this.checkLevelProgression();
  private checkLevelProgression(): void { }
  const progress = this.userProfile.progress;
  const viewedCount = this.userProfile.viewedContent.size;
  let newLevel = this.userProfile.level;
  if (this.userProfile.level === 'beginner') {
  if (progress.nodesCreated >= 5 && )
  progress.connectionsBuilt >= 3 &&
  progress.previewsGenerated >= 2 &&
  viewedCount >= 3) {
  newLevel = 'intermediate'
 else if (this.userProfile.level === 'intermediate') {
      if (progress.nodesCreated >= 15 && )
          progress.connectionsBuilt >= 10 && 
          progress.previewsGenerated >= 10 &&
          progress.advancedFeaturesUsed.length >= 2 &&
          viewedCount >= 5) {
        newLevel = 'advanced'
 else if (this.userProfile.level === 'advanced') {
      if (progress.projectsCompleted >= 2 && )
          progress.advancedFeaturesUsed.length >= 4 &&
          viewedCount >= 8) {
        newLevel = 'professional';
    if (newLevel !== this.userProfile.level) {
      this.userProfile.level = newLevel;
      this.saveUserProfile();
      // Trigger level up notification
      this.onLevelUp?.(newLevel);
  public getCurrentLearningPath(): LearningPath | null {
    const role = this.userProfile.preferences.filmIndustryRole || 'director';
    const pathId = role === 'director' ? 'director-fundamentals' : 'director-fundamentals';
    return this.learningPaths.get(pathId) || null;
  public getNextLearningStep(): HelpContent | null {
    const path = this.getCurrentLearningPath();
    if (!path) return null;
    // Find the next unviewed step
    for (const step of path.steps) {
      if (!this.userProfile.viewedContent.has(step.contentId)) {
        // Check if requirements are met
        if (step.requiredProgress) {
          const progressMet = Object.entries(step.requiredProgress).every(;);
            ([key, value]) => (this.userProfile.progress as any)[key] >= value
          );
          if (!progressMet) continue;
        if (step.unlockConditions) {
          const conditionsMet = step.unlockConditions.every(;);
            condition => this.userProfile.completedTours.has(condition)
          );
          if (!conditionsMet) continue;
        return this.helpContent.get(step.contentId) || null;
    return null;
  public getUserProfile(): UserProfile {
    return { ...this.userProfile };
  public updateUserPreferences(preferences: Partial<UserProfile['preferences']>): void {
    this.userProfile.preferences = { ...this.userProfile.preferences, ...preferences };
    this.saveUserProfile();
  // Event handlers (can be overridden)
  public onLevelUp?: (newLevel: string) => void;
  public onProgressMilestone?: (milestone: string) => void;

export const helpContentManager = new HelpContentManager();
export default helpContentManager;