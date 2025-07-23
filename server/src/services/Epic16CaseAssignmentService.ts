/**
 * Epic 16: Case Assignment Service
 * Task: E16-1753114247058-BACFBE - Create case assignment system
 * 
 * Intelligent case assignment system for moderation queue with
 * load balancing, skill-based routing, and assignment analytics.
 */

export interface ModerationCase {
  id: string;
  caseNumber: string;
  contentId: string;
  contentType: 'template' | 'review' | 'forum_post' | 'knowledge_article' | 'tutorial' | 'user_profile' | 'comment' | 'collection';
  
  // Status and priority
  status: 'unassigned' | 'assigned' | 'in_progress' | 'on_hold' | 'escalated' | 'completed' | 'closed' | 'cancelled' | 'expired';
  priority: 'low' | 'medium' | 'high' | 'urgent' | 'critical';
  
  // Categorization
  category: string;
  subcategory?: string;
  tags: string[];
  
  // Requirements
  complexityScore: number; // 1-10
  estimatedTime?: number; // minutes
  requiredSkills: string[];
  languageRequirements: string[];
  
  // Source and reporting
  reportedBy?: string;
  source: 'user_report' | 'automated_detection' | 'proactive_review' | 'escalation' | 'audit' | 'appeal_review';
  
  // Assignment
  assignedTo?: string;
  assignedAt?: Date;
  assignmentMethod?: 'manual' | 'round_robin' | 'load_based' | 'skill_based' | 'availability' | 'priority' | 'random' | 'hybrid';
  previousAssignee?: string;
  
  // Escalation
  escalatedFrom?: string;
  escalatedTo?: string;
  escalationLevel: number;
  
  // Deadlines
  dueDate?: Date;
  slaDeadline?: Date;
  overdue: boolean;
  
  // Content
  description?: string;
  evidence: Record<string, any>;
  initialAnalysis: Record<string, any>;
  
  // Progress
  progressPercentage: number;
  lastActivity: Date;
  timeSpent: number; // minutes
  
  // Resolution
  resolution?: 'approved' | 'rejected' | 'modified' | 'escalated' | 'no_action' | 'warning_issued' | 'content_removed' | 'account_suspended';
  resolutionNotes?: string;
  decisionId?: string;
  
  // Quality
  difficultyRating?: number; // 1-5
  qualityScore?: number; // 1-5
  feedback?: string;
  
  // Metadata
  metadata: Record<string, any>;
  flags: string[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  closedAt?: Date;
}

export interface ModeratorProfile {
  id: string;
  userId: string;
  displayName: string;
  role: 'moderator' | 'senior_moderator' | 'team_lead' | 'specialist' | 'admin';
  
  // Skills and expertise
  skills: string[];
  languages: string[];
  specializations: string[];
  
  // Capacity
  maxConcurrentCases: number;
  currentCaseload: number;
  availabilityStatus: 'available' | 'busy' | 'away' | 'offline' | 'on_break' | 'in_meeting';
  
  // Schedule
  timezone: string;
  workingHours: Record<string, { start: string; end: string }>;
  
  // Performance
  totalCasesHandled: number;
  averageResolutionTime?: number; // minutes
  qualityScore?: number; // 1-5
  accuracyScore?: number; // 0-1
  
  // Preferences
  preferredCategories: string[];
  assignmentWeight: number; // 0-2, default 1
  autoAssignEnabled: boolean;
  
  // Status
  isActive: boolean;
  lastActive: Date;
  vacationUntil?: Date;
  
  // Training
  certifications: string[];
  trainingCompleted: Record<string, any>;
  
  // Metadata
  metadata: Record<string, any>;
  notes?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface AssignmentRule {
  id: string;
  name: string;
  description?: string;
  ruleType: 'skill_matching' | 'load_balancing' | 'priority_routing' | 'time_based' | 'escalation' | 'category_routing';
  
  // Rule logic
  conditions: Record<string, any>;
  assignmentAlgorithm: 'round_robin' | 'least_loaded' | 'skill_score' | 'random' | 'priority_weighted' | 'availability_based' | 'custom';
  parameters: Record<string, any>;
  
  // Rule application
  priority: number; // 1-1000
  isActive: boolean;
  appliesToCategories: string[];
  
  // Performance
  successCriteria?: Record<string, any>;
  fallbackRuleId?: string;
  usageCount: number;
  successRate?: number;
  averageAssignmentTime?: number;
  
  // Metadata
  createdBy: string;
  metadata: Record<string, any>;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastUsed?: Date;
}

export interface AssignmentHistory {
  id: string;
  caseId: string;
  assignedFrom?: string;
  assignedTo?: string;
  assignmentType: 'initial' | 'reassignment' | 'escalation' | 'handover' | 'return';
  assignmentMethod: string;
  ruleUsed?: string;
  reason?: string;
  assignmentTime?: number; // milliseconds
  queueTime?: number; // minutes
  assignmentScore?: number; // 0-1
  wasSuccessful?: boolean;
  availableModerators?: Record<string, any>;
  assignmentCriteria?: Record<string, any>;
  assignedBy?: string;
  metadata: Record<string, any>;
  createdAt: Date;
}

export interface AssignmentAnalytics {
  date: string;
  moderatorId?: string;
  totalAssignments: number;
  initialAssignments: number;
  reassignments: number;
  averageAssignmentTime?: number; // milliseconds
  averageQueueTime?: number; // minutes
  assignmentSuccessRate?: number;
  peakConcurrentCases: number;
  utilizationRate?: number;
  casesCompleted: number;
  averageResolutionTime?: number; // minutes
  qualityScore?: number;
  assignmentMethods: Record<string, number>;
}

export interface CaseFilter {
  statuses?: string[];
  priorities?: string[];
  categories?: string[];
  assignees?: string[];
  requiredSkills?: string[];
  flags?: string[];
  overdue?: boolean;
  dateRange?: { start?: Date; end?: Date };
}

export interface AssignmentRequest {
  caseId: string;
  assignmentMethod?: string;
  preferredModerator?: string;
  forceAssign?: boolean;
  metadata?: Record<string, any>;
}

export interface AssignmentResult {
  success: boolean;
  assignedTo?: string;
  assignmentMethod: string;
  ruleUsed?: string;
  assignmentTime: number;
  queueTime: number;
  reason?: string;
  alternativeModerators?: string[];
  metadata: Record<string, any>;
}

/**
 * Case Assignment Service
 * 
 * Manages intelligent assignment of moderation cases to moderators using
 * configurable rules, load balancing, and skill-based routing.
 */
export class Epic16CaseAssignmentService {
  private static instance: Epic16CaseAssignmentService;
  private cases: Map<string, ModerationCase> = new Map();
  private moderators: Map<string, ModeratorProfile> = new Map();
  private rules: Map<string, AssignmentRule> = new Map();
  private history: AssignmentHistory[] = [];
  private analytics: Map<string, AssignmentAnalytics> = new Map();

  private constructor() {
    this.initializeDefaultRules();
  }

  static getInstance(): Epic16CaseAssignmentService {
    if (!Epic16CaseAssignmentService.instance) {
      Epic16CaseAssignmentService.instance = new Epic16CaseAssignmentService();
    }
    return Epic16CaseAssignmentService.instance;
  }

  /**
   * Case Management
   */
  async createCase(caseData: Omit<ModerationCase, 'id' | 'caseNumber' | 'createdAt' | 'updatedAt'>): Promise<ModerationCase> {
    const moderationCase: ModerationCase = {
      ...caseData,
      id: this.generateCaseId(),
      caseNumber: this.generateCaseNumber(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.cases.set(moderationCase.id, moderationCase);
    return moderationCase;
  }

  async updateCase(caseId: string, updates: Partial<ModerationCase>): Promise<ModerationCase | null> {
    const moderationCase = this.cases.get(caseId);
    if (!moderationCase) return null;

    const updatedCase: ModerationCase = {
      ...moderationCase,
      ...updates,
      updatedAt: new Date()
    };

    this.cases.set(caseId, updatedCase);
    return updatedCase;
  }

  async getCase(caseId: string): Promise<ModerationCase | null> {
    return this.cases.get(caseId) || null;
  }

  async getCases(filter?: CaseFilter): Promise<ModerationCase[]> {
    let cases = Array.from(this.cases.values());

    if (!filter) return cases.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    if (filter.statuses?.length) {
      cases = cases.filter(c => filter.statuses!.includes(c.status));
    }

    if (filter.priorities?.length) {
      cases = cases.filter(c => filter.priorities!.includes(c.priority));
    }

    if (filter.categories?.length) {
      cases = cases.filter(c => filter.categories!.includes(c.category));
    }

    if (filter.assignees?.length) {
      cases = cases.filter(c => c.assignedTo && filter.assignees!.includes(c.assignedTo));
    }

    if (filter.requiredSkills?.length) {
      cases = cases.filter(c => 
        filter.requiredSkills!.some(skill => c.requiredSkills.includes(skill))
      );
    }

    if (filter.flags?.length) {
      cases = cases.filter(c => 
        filter.flags!.some(flag => c.flags.includes(flag))
      );
    }

    if (filter.overdue !== undefined) {
      cases = cases.filter(c => c.overdue === filter.overdue);
    }

    if (filter.dateRange) {
      cases = cases.filter(c => {
        const date = c.createdAt;
        return (!filter.dateRange!.start || date >= filter.dateRange!.start) &&
               (!filter.dateRange!.end || date <= filter.dateRange!.end);
      });
    }

    return cases.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getUnassignedCases(): Promise<ModerationCase[]> {
    return this.getCases({ statuses: ['unassigned'] });
  }

  async getCasesByModerator(moderatorId: string): Promise<ModerationCase[]> {
    return this.getCases({ assignees: [moderatorId] });
  }

  /**
   * Moderator Management
   */
  async createModeratorProfile(profileData: Omit<ModeratorProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<ModeratorProfile> {
    const profile: ModeratorProfile = {
      ...profileData,
      id: this.generateModeratorId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.moderators.set(profile.id, profile);
    return profile;
  }

  async updateModeratorProfile(moderatorId: string, updates: Partial<ModeratorProfile>): Promise<ModeratorProfile | null> {
    const profile = this.moderators.get(moderatorId);
    if (!profile) return null;

    const updatedProfile: ModeratorProfile = {
      ...profile,
      ...updates,
      updatedAt: new Date()
    };

    this.moderators.set(moderatorId, updatedProfile);
    return updatedProfile;
  }

  async getModeratorProfile(moderatorId: string): Promise<ModeratorProfile | null> {
    return this.moderators.get(moderatorId) || null;
  }

  async getAvailableModerators(): Promise<ModeratorProfile[]> {
    return Array.from(this.moderators.values())
      .filter(m => 
        m.isActive &&
        m.autoAssignEnabled &&
        m.availabilityStatus === 'available' &&
        m.currentCaseload < m.maxConcurrentCases &&
        (!m.vacationUntil || m.vacationUntil <= new Date())
      )
      .sort((a, b) => {
        // Sort by availability, then by capacity, then by quality
        const aCapacity = a.maxConcurrentCases - a.currentCaseload;
        const bCapacity = b.maxConcurrentCases - b.currentCaseload;
        if (aCapacity !== bCapacity) return bCapacity - aCapacity;
        
        const aQuality = a.qualityScore || 0;
        const bQuality = b.qualityScore || 0;
        return bQuality - aQuality;
      });
  }

  async updateModeratorAvailability(moderatorId: string, status: ModeratorProfile['availabilityStatus']): Promise<boolean> {
    const profile = this.moderators.get(moderatorId);
    if (!profile) return false;

    profile.availabilityStatus = status;
    profile.lastActive = new Date();
    profile.updatedAt = new Date();

    this.moderators.set(moderatorId, profile);
    return true;
  }

  /**
   * Assignment Algorithm
   */
  async assignCase(request: AssignmentRequest, assignedBy?: string): Promise<AssignmentResult> {
    const startTime = Date.now();
    const moderationCase = this.cases.get(request.caseId);
    if (!moderationCase) {
      return {
        success: false,
        assignmentMethod: 'none',
        assignmentTime: Date.now() - startTime,
        queueTime: 0,
        reason: 'Case not found',
        metadata: {}
      };
    }

    const queueTime = (Date.now() - moderationCase.createdAt.getTime()) / (1000 * 60); // minutes

    // Check if case is already assigned
    if (moderationCase.assignedTo && !request.forceAssign) {
      return {
        success: false,
        assignmentMethod: 'none',
        assignmentTime: Date.now() - startTime,
        queueTime,
        reason: 'Case already assigned',
        metadata: {}
      };
    }

    // Get available moderators
    const availableModerators = await this.getAvailableModerators();
    if (availableModerators.length === 0) {
      return {
        success: false,
        assignmentMethod: request.assignmentMethod || 'auto',
        assignmentTime: Date.now() - startTime,
        queueTime,
        reason: 'No available moderators',
        metadata: {}
      };
    }

    // Handle preferred moderator
    if (request.preferredModerator) {
      const preferredModerator = availableModerators.find(m => m.id === request.preferredModerator);
      if (preferredModerator) {
        return await this.performAssignment(
          moderationCase,
          preferredModerator,
          'manual',
          undefined,
          startTime,
          queueTime,
          assignedBy,
          request.metadata || {}
        );
      }
    }

    // Find applicable assignment rules
    const applicableRules = this.getApplicableRules(moderationCase);
    
    // Try each rule in priority order
    for (const rule of applicableRules) {
      const result = await this.applyAssignmentRule(
        moderationCase,
        rule,
        availableModerators,
        startTime,
        queueTime,
        assignedBy,
        request.metadata || {}
      );
      
      if (result.success) {
        return result;
      }
    }

    // Fallback to round robin if no rules worked
    const selectedModerator = this.selectModeratorRoundRobin(availableModerators);
    if (selectedModerator) {
      return await this.performAssignment(
        moderationCase,
        selectedModerator,
        'round_robin',
        undefined,
        startTime,
        queueTime,
        assignedBy,
        request.metadata || {}
      );
    }

    return {
      success: false,
      assignmentMethod: 'auto',
      assignmentTime: Date.now() - startTime,
      queueTime,
      reason: 'No suitable moderator found',
      metadata: {}
    };
  }

  private async performAssignment(
    moderationCase: ModerationCase,
    moderator: ModeratorProfile,
    method: string,
    ruleUsed?: AssignmentRule,
    startTime: number = Date.now(),
    queueTime: number = 0,
    assignedBy?: string,
    metadata: Record<string, any> = {}
  ): Promise<AssignmentResult> {
    const previousAssignee = moderationCase.assignedTo;
    
    // Update case
    moderationCase.assignedTo = moderator.userId;
    moderationCase.assignedAt = new Date();
    moderationCase.assignmentMethod = method as any;
    moderationCase.status = 'assigned';
    moderationCase.previousAssignee = previousAssignee;
    moderationCase.updatedAt = new Date();
    this.cases.set(moderationCase.id, moderationCase);

    // Update moderator caseload
    moderator.currentCaseload++;
    this.moderators.set(moderator.id, moderator);

    // Decrease previous assignee's caseload if reassignment
    if (previousAssignee) {
      const previousModerator = Array.from(this.moderators.values())
        .find(m => m.userId === previousAssignee);
      if (previousModerator) {
        previousModerator.currentCaseload = Math.max(0, previousModerator.currentCaseload - 1);
        this.moderators.set(previousModerator.id, previousModerator);
      }
    }

    // Record assignment history
    const assignmentHistory: AssignmentHistory = {
      id: this.generateHistoryId(),
      caseId: moderationCase.id,
      assignedFrom: previousAssignee,
      assignedTo: moderator.userId,
      assignmentType: previousAssignee ? 'reassignment' : 'initial',
      assignmentMethod: method,
      ruleUsed: ruleUsed?.id,
      assignmentTime: Date.now() - startTime,
      queueTime,
      assignmentScore: this.calculateAssignmentScore(moderationCase, moderator),
      wasSuccessful: true,
      assignedBy,
      metadata,
      createdAt: new Date()
    };
    this.history.push(assignmentHistory);

    // Update rule usage statistics
    if (ruleUsed) {
      ruleUsed.usageCount++;
      ruleUsed.lastUsed = new Date();
      this.rules.set(ruleUsed.id, ruleUsed);
    }

    return {
      success: true,
      assignedTo: moderator.userId,
      assignmentMethod: method,
      ruleUsed: ruleUsed?.id,
      assignmentTime: Date.now() - startTime,
      queueTime,
      metadata
    };
  }

  private getApplicableRules(moderationCase: ModerationCase): AssignmentRule[] {
    return Array.from(this.rules.values())
      .filter(rule => {
        if (!rule.isActive) return false;
        
        // Check category applicability
        if (rule.appliesToCategories.length > 0 && 
            !rule.appliesToCategories.includes(moderationCase.category)) {
          return false;
        }

        // Check rule conditions
        return this.evaluateRuleConditions(rule.conditions, moderationCase);
      })
      .sort((a, b) => b.priority - a.priority);
  }

  private evaluateRuleConditions(conditions: Record<string, any>, moderationCase: ModerationCase): boolean {
    // Simple condition evaluation - in a real implementation, this would be more sophisticated
    for (const [key, value] of Object.entries(conditions)) {
      if (key === 'category' && moderationCase.category !== value) return false;
      if (key === 'priority' && Array.isArray(value) && !value.includes(moderationCase.priority)) return false;
      if (key === 'escalation_level' && moderationCase.escalationLevel <= (value.$gt || 0)) return false;
      if (key === 'required_skills' && Array.isArray(value) && 
          !value.some(skill => moderationCase.requiredSkills.includes(skill))) return false;
      if (key === 'language_requirements' && Array.isArray(value) &&
          !value.some(lang => moderationCase.languageRequirements.includes(lang))) return false;
    }
    return true;
  }

  private async applyAssignmentRule(
    moderationCase: ModerationCase,
    rule: AssignmentRule,
    availableModerators: ModeratorProfile[],
    startTime: number,
    queueTime: number,
    assignedBy?: string,
    metadata: Record<string, any> = {}
  ): Promise<AssignmentResult> {
    let selectedModerator: ModeratorProfile | null = null;

    switch (rule.assignmentAlgorithm) {
    case 'skill_score':
      selectedModerator = this.selectModeratorBySkillScore(moderationCase, availableModerators);
      break;
    case 'least_loaded':
      selectedModerator = this.selectModeratorByLoad(availableModerators);
      break;
    case 'round_robin':
      selectedModerator = this.selectModeratorRoundRobin(availableModerators);
      break;
    case 'priority_weighted':
      selectedModerator = this.selectModeratorByPriority(moderationCase, availableModerators);
      break;
    case 'availability_based':
      selectedModerator = this.selectModeratorByAvailability(availableModerators);
      break;
    case 'random':
      selectedModerator = this.selectModeratorRandom(availableModerators);
      break;
    default:
      selectedModerator = this.selectModeratorRoundRobin(availableModerators);
    }

    if (selectedModerator) {
      return await this.performAssignment(
        moderationCase,
        selectedModerator,
        rule.assignmentAlgorithm,
        rule,
        startTime,
        queueTime,
        assignedBy,
        metadata
      );
    }

    return {
      success: false,
      assignmentMethod: rule.assignmentAlgorithm,
      ruleUsed: rule.id,
      assignmentTime: Date.now() - startTime,
      queueTime,
      reason: 'No suitable moderator found using rule',
      metadata
    };
  }

  /**
   * Assignment Algorithms
   */
  private selectModeratorBySkillScore(moderationCase: ModerationCase, moderators: ModeratorProfile[]): ModeratorProfile | null {
    if (moderators.length === 0) return null;

    const scoredModerators = moderators.map(moderator => {
      let score = 0;
      
      // Skill matching
      const skillMatches = moderationCase.requiredSkills.filter(skill => 
        moderator.skills.includes(skill)
      ).length;
      score += skillMatches * 10;
      
      // Language matching
      const languageMatches = moderationCase.languageRequirements.filter(lang =>
        moderator.languages.includes(lang)
      ).length;
      score += languageMatches * 5;
      
      // Specialization matching
      const specializationMatches = moderator.specializations.filter(spec =>
        moderationCase.category.includes(spec) || moderationCase.subcategory?.includes(spec)
      ).length;
      score += specializationMatches * 8;
      
      // Preferred categories
      if (moderator.preferredCategories.includes(moderationCase.category)) {
        score += 15;
      }
      
      // Quality score
      score += (moderator.qualityScore || 3) * 3;
      
      // Availability (lower caseload is better)
      const capacityRatio = (moderator.maxConcurrentCases - moderator.currentCaseload) / moderator.maxConcurrentCases;
      score += capacityRatio * 20;
      
      // Assignment weight
      score *= moderator.assignmentWeight;
      
      return { moderator, score };
    });

    scoredModerators.sort((a, b) => b.score - a.score);
    return scoredModerators[0]?.moderator || null;
  }

  private selectModeratorByLoad(moderators: ModeratorProfile[]): ModeratorProfile | null {
    if (moderators.length === 0) return null;
    
    return moderators.reduce((least, current) => 
      current.currentCaseload < least.currentCaseload ? current : least
    );
  }

  private selectModeratorRoundRobin(moderators: ModeratorProfile[]): ModeratorProfile | null {
    if (moderators.length === 0) return null;
    
    // Simple round robin based on last assignment time
    return moderators.sort((a, b) => {
      const aLastAssigned = this.getLastAssignmentTime(a.userId);
      const bLastAssigned = this.getLastAssignmentTime(b.userId);
      return aLastAssigned - bLastAssigned;
    })[0];
  }

  private selectModeratorByPriority(moderationCase: ModerationCase, moderators: ModeratorProfile[]): ModeratorProfile | null {
    if (moderators.length === 0) return null;
    
    // Prioritize senior moderators for high priority cases
    if (['high', 'urgent', 'critical'].includes(moderationCase.priority)) {
      const seniorModerators = moderators.filter(m => 
        ['senior_moderator', 'team_lead', 'specialist', 'admin'].includes(m.role)
      );
      if (seniorModerators.length > 0) {
        return this.selectModeratorByLoad(seniorModerators);
      }
    }
    
    return this.selectModeratorByLoad(moderators);
  }

  private selectModeratorByAvailability(moderators: ModeratorProfile[]): ModeratorProfile | null {
    if (moderators.length === 0) return null;
    
    // Filter to only available moderators and select by capacity
    const availableModerators = moderators.filter(m => m.availabilityStatus === 'available');
    return this.selectModeratorByLoad(availableModerators);
  }

  private selectModeratorRandom(moderators: ModeratorProfile[]): ModeratorProfile | null {
    if (moderators.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * moderators.length);
    return moderators[randomIndex];
  }

  private calculateAssignmentScore(moderationCase: ModerationCase, moderator: ModeratorProfile): number {
    // Score from 0-1 based on how well the moderator matches the case
    let score = 0.5; // Base score
    
    // Skill matching bonus
    const skillMatch = moderationCase.requiredSkills.filter(skill => 
      moderator.skills.includes(skill)
    ).length / Math.max(1, moderationCase.requiredSkills.length);
    score += skillMatch * 0.3;
    
    // Language matching bonus
    const languageMatch = moderationCase.languageRequirements.filter(lang =>
      moderator.languages.includes(lang)  
    ).length / Math.max(1, moderationCase.languageRequirements.length);
    score += languageMatch * 0.2;
    
    return Math.min(1, score);
  }

  private getLastAssignmentTime(moderatorUserId: string): number {
    const lastAssignment = this.history
      .filter(h => h.assignedTo === moderatorUserId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
    
    return lastAssignment ? lastAssignment.createdAt.getTime() : 0;
  }

  /**
   * Bulk Assignment
   */
  async assignMultipleCases(caseIds: string[], assignmentMethod?: string): Promise<AssignmentResult[]> {
    const results: AssignmentResult[] = [];
    
    for (const caseId of caseIds) {
      const result = await this.assignCase({ caseId, assignmentMethod });
      results.push(result);
    }
    
    return results;
  }

  async reassignCase(caseId: string, newModerator: string, reason?: string): Promise<AssignmentResult> {
    return await this.assignCase({
      caseId,
      preferredModerator: newModerator,
      forceAssign: true,
      metadata: { reassignmentReason: reason }
    });
  }

  /**
   * Analytics and Reporting
   */
  async getAssignmentAnalytics(
    startDate: Date,
    endDate: Date,
    moderatorId?: string
  ): Promise<AssignmentAnalytics[]> {
    const relevantHistory = this.history.filter(h => {
      const inDateRange = h.createdAt >= startDate && h.createdAt <= endDate;
      const matchesModerator = !moderatorId || h.assignedTo === moderatorId;
      return inDateRange && matchesModerator;
    });

    const analyticsMap = new Map<string, AssignmentAnalytics>();

    relevantHistory.forEach(entry => {
      const dateKey = entry.createdAt.toISOString().split('T')[0];
      const key = moderatorId ? `${dateKey}-${moderatorId}` : dateKey;
      
      let analytics = analyticsMap.get(key);
      if (!analytics) {
        analytics = {
          date: dateKey,
          moderatorId,
          totalAssignments: 0,
          initialAssignments: 0,
          reassignments: 0,
          casesCompleted: 0,
          assignmentMethods: {}
        };
        analyticsMap.set(key, analytics);
      }

      analytics.totalAssignments++;
      if (entry.assignmentType === 'initial') {
        analytics.initialAssignments++;
      } else {
        analytics.reassignments++;
      }

      analytics.assignmentMethods[entry.assignmentMethod] = 
        (analytics.assignmentMethods[entry.assignmentMethod] || 0) + 1;
    });

    return Array.from(analyticsMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }

  async getWorkloadDistribution(): Promise<Array<{ moderatorId: string; currentCaseload: number; maxCapacity: number; utilization: number }>> {
    return Array.from(this.moderators.values())
      .filter(m => m.isActive)
      .map(m => ({
        moderatorId: m.userId,
        currentCaseload: m.currentCaseload,
        maxCapacity: m.maxConcurrentCases,
        utilization: (m.currentCaseload / m.maxConcurrentCases) * 100
      }))
      .sort((a, b) => b.utilization - a.utilization);
  }

  /**
   * Assignment Rules Management
   */
  async createAssignmentRule(ruleData: Omit<AssignmentRule, 'id' | 'usageCount' | 'createdAt' | 'updatedAt'>): Promise<AssignmentRule> {
    const rule: AssignmentRule = {
      ...ruleData,
      id: this.generateRuleId(),
      usageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.rules.set(rule.id, rule);
    return rule;
  }

  async getAssignmentRules(): Promise<AssignmentRule[]> {
    return Array.from(this.rules.values())
      .sort((a, b) => b.priority - a.priority);
  }

  async updateAssignmentRule(ruleId: string, updates: Partial<AssignmentRule>): Promise<AssignmentRule | null> {
    const rule = this.rules.get(ruleId);
    if (!rule) return null;

    const updatedRule: AssignmentRule = {
      ...rule,
      ...updates,
      updatedAt: new Date()
    };

    this.rules.set(ruleId, updatedRule);
    return updatedRule;
  }

  /**
   * Utility Methods
   */
  private initializeDefaultRules(): void {
    // Default rules would be loaded from database in real implementation
  }

  private generateCaseId(): string {
    return `case_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateCaseNumber(): string {
    const year = new Date().getFullYear();
    const sequence = Math.floor(Math.random() * 999999) + 1;
    return `MOD-${year}-${sequence.toString().padStart(6, '0')}`;
  }

  private generateModeratorId(): string {
    return `moderator_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateRuleId(): string {
    return `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateHistoryId(): string {
    return `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const epic16CaseAssignmentService = Epic16CaseAssignmentService.getInstance();

// Convenience functions
export const createCase = (caseData: Omit<ModerationCase, 'id' | 'caseNumber' | 'createdAt' | 'updatedAt'>) =>
  epic16CaseAssignmentService.createCase(caseData);

export const assignCase = (request: AssignmentRequest, assignedBy?: string) =>
  epic16CaseAssignmentService.assignCase(request, assignedBy);

export const getUnassignedCases = () =>
  epic16CaseAssignmentService.getUnassignedCases();

export const getAvailableModerators = () =>
  epic16CaseAssignmentService.getAvailableModerators();

export const getWorkloadDistribution = () =>
  epic16CaseAssignmentService.getWorkloadDistribution();