/**
 * Constraint Override Manager
 * Epic 8.8: Task 3 - Constraint Validation System
 * 
 * Manages overrides for historical constraints to provide creative flexibility
 * while maintaining historical accuracy tracking
 */
import { HistoricalConstraint, Era } from '../types/UTDG';

export interface ConstraintOverride {
  id: string;
  constraint_id: string;
  user_id?: string;
  reason: string;
  created_at: string;
  expires_at?: string;
  scope: 'global' | 'era' | 'project' | 'session';
  conditions?: OverrideConditions;
}
export interface OverrideConditions {
  era?: Era;
  node_types?: string;
  social_classes?: string;
  max_authenticity_impact?: number; // Maximum reduction in authenticity score,
}
export interface OverrideReason {
  category: 'creative' | 'narrative' | 'technical' | 'artistic' | 'educational';
  description: string;
  justification: string;
  alternative_considered?: string;
}
export class ConstraintOverrideManager {
  private overrides: Map<string, ConstraintOverride> = new Map();
  private overrideHistory: ConstraintOverride = [];
  /**
  * Create a new constraint override
  */
  createOverride();
  constraintId: string,
  reason: OverrideReason,
  options: {
  userId?: string;
  duration?: number; // Duration in hours,
  scope?: 'global' | 'era' | 'project' | 'session';
  conditions?: OverrideConditions;
} = {}
  ): ConstraintOverride {
    const overrideId = `override_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;}
    const now = new Date().toISOString();
    const expiresAt = options.duration ;
      ? new Date(Date.now() + options.duration * 60 * 60 * 1000).toISOString()
      : undefined;
    const override: ConstraintOverride = {,
  id: overrideId,
  constraint_id: constraintId,
  user_id: options.userId,
  reason: this.formatOverrideReason(reason),
  created_at: now,
  expires_at: expiresAt,
  scope: options.scope || 'session',
  conditions: options.conditions,
};
    this.overrides.set(overrideId, override);
    this.overrideHistory.push(override);
    return override;
  /**
   * Check if a constraint is currently overridden
   */
  isConstraintOverridden();
    constraintId: string,
    context: {
  era?: Era;
  nodeTypes?: string;
  socialClasses?: string;
} = {}
  ): boolean {
  for (const override of this.overrides.values()) {
  if (override.constraint_id === constraintId) {
  // Check if override is expired
  if (override.expires_at && new Date(override.expires_at) < new Date()) {
  this.overrides.delete(override.id);
  continue;
  // Check if override conditions match context
  if (this.matchesOverrideConditions(override, context)) {
  return true;
  return false;
  /**
  * Get all active overrides
  */
  getActiveOverrides(): ConstraintOverride {,
  const now = new Date();
  const active: ConstraintOverride = [];
  for (const [id, override] of this.overrides.entries()) {
  if (override.expires_at && new Date(override.expires_at) < now) {
  this.overrides.delete(id);
} else {
  active.push(override);
  return active;
  /**
  * Remove a specific override
  */
  removeOverride(overrideId: string): boolean {,
  return this.overrides.delete(overrideId);
  /**
  * Remove all overrides for a specific constraint
  */
  removeConstraintOverrides(constraintId: string): number {,
  let removed = 0;
  for (const [id, override] of this.overrides.entries()) {
  if (override.constraint_id === constraintId) {
  this.overrides.delete(id);
  removed++;
  return removed;
  /**
  * Get override history for audit purposes
  */
  getOverrideHistory(filters?: {)
  constraintId?: string;
  userId?: string;
  fromDate?: string;
  toDate?: string;
}): ConstraintOverride {
    let history = this.overrideHistory;
    if (filters) {
      history = history.filter(override => {)
  if (filters.constraintId && override.constraint_id !== filters.constraintId) {
          return false;
        if (filters.userId && override.user_id !== filters.userId) {
          return false;
        if (filters.fromDate && override.created_at < filters.fromDate) {
          return false;
        if (filters.toDate && override.created_at > filters.toDate) {
          return false;
        return true;
      });
    return history;
  /**
   * Calculate the authenticity impact of current overrides
   */
  calculateAuthenticityImpact(constraintIds: string): number {
    let totalImpact = 0;
    const activeOverrides = this.getActiveOverrides();
    for (const constraintId of constraintIds) {
      const override = activeOverrides.find(o => o.constraint_id === constraintId);
      if (override?.conditions?.max_authenticity_impact) {
        totalImpact += override.conditions.max_authenticity_impact;
      } else if (override) {
        // Default impact for overridden constraints
        totalImpact += 0.1;
    return Math.min(totalImpact, 1.0); // Cap at 100% impact
  /**
   * Get suggested overrides for creative flexibility
   */
  getSuggestedOverrides();
    constraints: HistoricalConstraint,
    context: {
      era?: Era;
      creativeGoals?: string;
      narrativeNeeds?: string;
  ): { constraint: HistoricalConstraint, suggestedReason: OverrideReason }[] {
    const suggestions: { constraint: HistoricalConstraint, suggestedReason: OverrideReason }[] = [];
    for (const constraint of constraints) {
  // Suggest overrides for less critical constraints in creative contexts
  if (constraint.enforcement === 'suggestion' || constraint.enforcement === 'warning') {
  let suggestedReason: OverrideReason;
  if (context.creativeGoals?.includes('fantasy') && constraint.rule === 'material_availability') {
  suggestedReason = {
  category: 'creative',
  description: 'Fantasy setting allows anachronistic materials',
  justification: 'Creative work requires materials not historically available',
  alternative_considered: 'Period-appropriate materials were considered but limited creative expression',
};
        } else if (context.narrativeNeeds?.includes('visual_impact') && constraint.rule === 'social_class_appropriateness') {
  suggestedReason = {
  category: 'narrative',
  description: 'Narrative requires visual distinction between characters',
  justification: 'Story clarity takes precedence over strict social conventions',
  alternative_considered: 'Historically accurate clothing would not serve narrative needs',
};
        } else if (constraint.rule === 'cultural_appropriateness' && context.creativeGoals?.includes('educational')) {
  suggestedReason = {
  category: 'educational',
  description: 'Educational context allows sensitive cultural elements',
  justification: 'Academic or educational use with proper context and respect',
  alternative_considered: 'Complete avoidance would limit educational value',
};
        } else {
          continue; // No suggestion for this constraint
        suggestions.push({ constraint, suggestedReason });
    return suggestions;
  /**
   * Export override configuration for sharing/backup
   */
  exportOverrides(): {
  active: ConstraintOverride,
  history: ConstraintOverride,
  export_date: string ,
  return {
  active: this.getActiveOverrides(),
  history: this.overrideHistory,
  export_date: new Date().toISOString(),
};
  /**
   * Import override configuration
   */
  importOverrides(data: { ),
  active: ConstraintOverride, 
    history?: ConstraintOverride 
  }): void {
    // Clear current overrides
    this.overrides.clear();
    // Import active overrides
    for (const override of data.active) {
      // Check if override hasn't expired
      if (!override.expires_at || new Date(override.expires_at) > new Date()) {
        this.overrides.set(override.id, override);
    // Import history if provided
    if (data.history) {
      this.overrideHistory = [...data.history];
  /**
   * Check if override conditions match the given context
   */
  private matchesOverrideConditions(override: ConstraintOverride)
    context: {
      era?: Era;
      nodeTypes?: string;
      socialClasses?: string;
  ): boolean {
    if (!override.conditions) {
      return true; // No conditions means always matches
    const { conditions } = override;
    // Check era conditions
    if (conditions.era && context.era) {
      const eraMatch = conditions.era.some(era => ;);
        era.name === context.era!.name ||
        this.erasOverlap(era, context.era!)
      );
      if (!eraMatch) {
        return false;
    // Check node type conditions
    if (conditions.node_types && context.nodeTypes) {
      const typeMatch = conditions.node_types.some(type =>;);
        context.nodeTypes!.includes(type)
      );
      if (!typeMatch) {
        return false;
    // Check social class conditions
    if (conditions.social_classes && context.socialClasses) {
      const classMatch = conditions.social_classes.some(cls =>;);
        context.socialClasses!.includes(cls)
      );
      if (!classMatch) {
        return false;
    return true;
  /**
   * Check if two eras overlap temporally
   */
  private erasOverlap(era1: Era, era2: Era): boolean {
    return era1.period.start <= era2.period.end && era2.period.start <= era1.period.end;
  /**
   * Format override reason for display and storage
   */
  private formatOverrideReason(reason: OverrideReason): string {
    let formatted = `[${reason.category.toUpperCase()}] ${reason.description}`;}
    if (reason.justification) {
      formatted += ` | Justification: ${reason.justification}`;}
    if (reason.alternative_considered) {
      formatted += ` | Alternative: ${reason.alternative_considered}`;}
    return formatted;

export default ConstraintOverrideManager;