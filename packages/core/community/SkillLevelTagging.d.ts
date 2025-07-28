/**
 * Epic 16 - Skill Level Tagging System
 * Task: E16-1753114247112-47B1EB - Implement skill level tagging
 *
 * Comprehensive skill level classification system for tutorials and learning content.
 * Integrates with learning paths, content recommendations, and user progression tracking.
 */
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type SkillDomain = 'programming' | 'web-development' | 'mobile-development' | 'data-science' | 'devops' | 'design' | 'business' | 'marketing' | 'writing' | 'tools' | 'soft-skills' | 'project-management' | 'security' | 'database' | 'ai-ml' | 'cloud' | 'general';

export type SkillSubcategory = {
    programming: 'algorithms' | 'data-structures' | 'oop' | 'functional' | 'debugging' | 'testing' | 'architecture';
    'web-development': 'frontend' | 'backend' | 'fullstack' | 'frameworks' | 'apis' | 'databases' | 'deployment';
    'mobile-development': 'ios' | 'android' | 'cross-platform' | 'native' | 'hybrid';
    'data-science': 'analysis' | 'visualization' | 'machine-learning' | 'statistics' | 'big-data' | 'modeling';
    'devops': 'ci-cd' | 'containers' | 'monitoring' | 'infrastructure' | 'automation' | 'configuration';
    'design': 'ui-design' | 'ux-research' | 'prototyping' | 'visual-design' | 'interaction-design';
    'business': 'strategy' | 'operations' | 'finance' | 'sales' | 'customer-service' | 'analytics';
    'marketing': 'digital-marketing' | 'content-marketing' | 'seo' | 'social-media' | 'analytics' | 'branding';
    'writing': 'technical-writing' | 'copywriting' | 'documentation' | 'blogging' | 'editing';
    'tools': 'editors' | 'version-control' | 'project-management' | 'communication' | 'productivity';
    'soft-skills': 'communication' | 'leadership' | 'teamwork' | 'time-management' | 'problem-solving';
    'project-management': 'agile' | 'scrum' | 'kanban' | 'planning' | 'risk-management' | 'stakeholder-management';
    'security': 'application-security' | 'network-security' | 'cryptography' | 'compliance' | 'incident-response';
    'database': 'sql' | 'nosql' | 'design' | 'optimization' | 'administration' | 'modeling';
    'ai-ml': 'supervised-learning' | 'unsupervised-learning' | 'deep-learning' | 'nlp' | 'computer-vision' | 'deployment';
    'cloud': 'aws' | 'azure' | 'gcp' | 'serverless' | 'containers' | 'migration';
    'general': 'fundamentals' | 'concepts' | 'trends' | 'career' | 'industry' | 'best-practices';
};

export interface SkillLevelClassification {
    level: SkillLevel;
    confidence: number;
    dimensions: SkillLevelDimensions;
    context: SkillLevelContext;
    prerequisites: SkillPrerequisite[];
    next_level_requirements: SkillProgression[];
    assessed_by: 'automated' | 'manual' | 'community' | 'expert';
    assessed_at: string;
    assessment_method: string;

export interface SkillLevelDimensions {
    technical_complexity: number;
    concept_difficulty: number;
    implementation_complexity: number;
    prior_knowledge_required: number;
    domain_expertise_needed: number;
    tool_familiarity_needed: number;
    time_to_complete: number;
    practice_time_needed: number;
    mastery_time_estimate: number;
    abstract_thinking_required: number;
    hands_on_component: number;
    problem_solving_complexity: number;

export interface SkillLevelContext {
    target_audience: {,
        experience_level: SkillLevel;
        role: string[];
        industry: string[];
        learning_style: 'visual' | 'auditory' | 'kinesthetic' | 'reading' | 'mixed';
    };
    content_type: 'tutorial' | 'guide' | 'reference' | 'workshop' | 'course' | 'example';
    delivery_format: 'text' | 'video' | 'interactive' | 'hands-on' | 'mixed';
    interaction_level: 'passive' | 'guided' | 'interactive' | 'project-based';
    environment: {,
        tools_required: string[];
        setup_complexity: number;
        external_resources_needed: boolean;
        mentor_support_recommended: boolean;
    };
    success_factors: {,
        completion_rate_target: number;
        user_satisfaction_target: number;
        learning_outcome_confidence: number;
    };

export interface SkillPrerequisite {
    skill_domain: SkillDomain;
    subcategory?: string;
    required_level: SkillLevel;
    description: string;
    critical: boolean;
    alternative_paths: string[];
    assessment_method?: string;

export interface SkillProgression {
    skill_domain: SkillDomain;
    subcategory?: string;
    next_level: SkillLevel;
    learning_objectives: string[];
    recommended_content: string[];
    estimated_time: number;
    milestones: ProgressionMilestone[];

export interface ProgressionMilestone {
    name: string;
    description: string;
    measurable_outcome: string;
    assessment_criteria: string[];
    estimated_effort: number;

export interface ContentSkillTag {
    id: string;
    content_id: string;
    content_type: 'article' | 'tutorial' | 'guide' | 'course' | 'example' | 'reference';
    primary_skill: {,
        domain: SkillDomain;
        subcategory?: string;
        level: SkillLevel;
        classification: SkillLevelClassification;
    };
    secondary_skills: Array<{,
        domain: SkillDomain;
        subcategory?: string;
        level: SkillLevel;
        weight: number;
    }>;
    learning_path_info: {,
        suitable_for_paths: string[];
        position_in_path: 'foundation' | 'core' | 'advanced' | 'specialization';
        sequence_dependencies: string[];
    };
    difficulty_indicators: DifficultyIndicators;
    community_feedback: CommunitySkillFeedback;
    adaptive_elements: AdaptiveElements;
    tagged_by: string;
    tagged_at: string;
    last_updated: string;
    review_status: 'pending' | 'approved' | 'needs_review';
    confidence_score: number;

export interface DifficultyIndicators {
    reading_level: number;
    concept_density: number;
    code_complexity?: number;
    step_complexity: number;
    requires_creativity: boolean;
    requires_critical_thinking: boolean;
    requires_experimentation: boolean;
    has_multiple_solutions: boolean;
    has_examples: boolean;
    has_exercises: boolean;
    has_troubleshooting: boolean;
    has_additional_resources: boolean;
    common_pitfalls: string[];
    success_barriers: string[];
    support_needs: string[];

export interface CommunitySkillFeedback {
    perceived_difficulty: {,
        average_rating: number;
        rating_distribution: Record<string, number>;
        total_ratings: number;
    };
    level_appropriateness: {,
        too_easy_votes: number;
        just_right_votes: number;
        too_hard_votes: number;
        total_votes: number;
    };
    learning_effectiveness: {,
        helped_learn_skill: number;
        clear_explanations: number;
        good_examples: number;
        would_recommend: number;
    };
    improvement_areas: Array<{,
        area: string;
        suggestion_count: number;
        examples: string[];
    }>;
    level_suggestions: Record<SkillLevel, number>;

export interface AdaptiveElements {
    has_difficulty_options: boolean;
    can_skip_basics: boolean;
    can_add_detail: boolean;
    supports_multiple_formats: boolean;
    has_visual_explanations: boolean;
    has_audio_narration: boolean;
    has_interactive_elements: boolean;
    self_paced: boolean;
    has_checkpoints: boolean;
    allows_review: boolean;
    supports_practice: boolean;
    role_specific_content: string[];
    industry_specific_examples: string[];
    tool_alternatives: string[];

export interface SkillBasedLearningPath {
    id: string;
    name: string;
    description: string;
    skill_progression: {,
        domain: SkillDomain;
        subcategories: string[];
        start_level: SkillLevel;
        target_level: SkillLevel;
        estimated_duration: number;
    };
    learning_modules: LearningModule[];
    skill_checkpoints: SkillCheckpoint[];
    entry_requirements: SkillPrerequisite[];
    learning_outcomes: LearningOutcome[];
    adaptive_features: PathAdaptiveFeatures;
    success_metrics: PathSuccessMetrics;

export interface LearningModule {
    id: string;
    name: string;
    description: string;
    position: number;
    skills_developed: Array<{,
        domain: SkillDomain;
        subcategory?: string;
        from_level: SkillLevel;
        to_level: SkillLevel;
        confidence: number;
    }>;
    content_items: Array<{,
        content_id: string;
        content_type: string;
        required: boolean;
        estimated_time: number;
        skill_contribution: number;
    }>;
    assessments: ModuleAssessment[];
    completion_criteria: CompletionCriteria;

export interface SkillCheckpoint {
    id: string;
    position: number;
    name: string;
    description: string;
    skills_assessed: Array<{,
        domain: SkillDomain;
        subcategory?: string;
        required_level: SkillLevel;
        assessment_method: 'quiz' | 'project' | 'peer-review' | 'self-assessment' | 'portfolio';
    }>;
    checkpoint_type: 'milestone' | 'gate' | 'reflection' | 'feedback';
    blocking: boolean;
    retry_allowed: boolean;
    success_actions: string[];
    struggle_actions: string[];
    failure_actions: string[];

export interface LearningOutcome {
    skill_domain: SkillDomain;
    subcategory?: string;
    target_level: SkillLevel;
    description: string;
    measurable_criteria: string[];
    assessment_methods: string[];
    success_indicators: string[];
    practical_applications: string[];
    portfolio_examples: string[];
    career_relevance: string;

export interface PathAdaptiveFeatures {
    skill_gap_detection: boolean;
    prerequisite_enforcement: boolean;
    alternative_content_paths: boolean;
    auto_pacing: boolean;
    struggling_learner_support: boolean;
    advanced_learner_acceleration: boolean;
    role_based_examples: boolean;
    industry_customization: boolean;
    tool_preference_adaptation: boolean;

export interface PathSuccessMetrics {
    target_completion_rate: number;
    target_time_to_complete: number;
    target_skill_improvement: number;
    target_satisfaction_score: number;
    target_real_world_application: number;
    career_advancement_tracking: boolean;
    skill_retention_assessment: boolean;
    continued_learning_engagement: boolean;

export interface ModuleAssessment {
    type: 'knowledge_check' | 'skill_demonstration' | 'project' | 'peer_review' | 'reflection';
    required: boolean;
    passing_criteria: AssessmentCriteria;
    feedback_type: 'immediate' | 'delayed' | 'peer' | 'instructor';
    retry_policy: RetryPolicy;

export interface CompletionCriteria {
    content_completion_required: number;
    assessment_passing_required: boolean;
    time_investment_minimum: number;
    skill_demonstration_required: boolean;

export interface AssessmentCriteria {
    minimum_score: number;
    rubric_criteria: RubricCriterion[];
    peer_consensus_required?: number;
    instructor_approval_required?: boolean;

export interface RubricCriterion {
    dimension: string;
    weight: number;
    levels: Array<{,
        level: number;
        description: string;
        points: number;
    }>;

export interface RetryPolicy {
    max_attempts: number;
    cooldown_period: number;
    progressive_hints: boolean;
    alternative_assessments: boolean;

export interface SkillAssessmentEngine {
    analyzeContent(content: any): Promise<SkillLevelClassification>;
    classifyDifficulty(content: any, domain: SkillDomain): Promise<SkillLevel>;
    assessUserSkillLevel(userId: string, domain: SkillDomain): Promise<UserSkillProfile>;
    recommendContent(userProfile: UserSkillProfile, learningGoals: LearningGoal[]): Promise<ContentRecommendation[]>;
    optimizeLearningPath(userId: string, pathId: string): Promise<OptimizedLearningPath>;
    suggestNextContent(userId: string, currentContent: string): Promise<ContentSuggestion[]>;
    incorporateCommunityFeedback(contentId: string, feedback: CommunitySkillFeedback): Promise<void>;
    validateSkillTagging(contentId: string): Promise<ValidationResult>;

export interface UserSkillProfile {
    user_id: string;
    skill_levels: Record<SkillDomain, {
        current_level: SkillLevel;
        confidence: number;
        last_assessed: string;
        assessment_method: string;
        subcategory_levels: Record<string, SkillLevel>;
    }>;
    learning_preferences: {,
        preferred_difficulty_progression: 'gradual' | 'moderate' | 'steep';
        content_format_preferences: string[];
        interaction_style: 'guided' | 'exploratory' | 'structured';
        pace_preference: 'self_paced' | 'structured' | 'intensive';
    };
    learning_history: {,
        content_completed: ContentCompletionRecord[];
        skill_progression: SkillProgressionRecord[];
        assessment_results: AssessmentResult[];
        struggle_patterns: StrugglePattern[];
    };
    learning_goals: LearningGoal[];
    motivation_factors: string[];
    career_context: string;

export interface ContentCompletionRecord {
    content_id: string;
    completed_at: string;
    time_spent: number;
    completion_quality: number;
    skill_improvement: Record<SkillDomain, number>;
    user_rating: number;
    struggled_areas: string[];

export interface SkillProgressionRecord {
    skill_domain: SkillDomain;
    subcategory?: string;
    from_level: SkillLevel;
    to_level: SkillLevel;
    progression_date: string;
    evidence: string[];
    confidence: number;

export interface AssessmentResult {
    assessment_id: string;
    content_id: string;
    skill_domain: SkillDomain;
    target_level: SkillLevel;
    achieved_level: SkillLevel;
    score: number;
    completed_at: string;
    feedback_received: string;

export interface StrugglePattern {
    skill_domain: SkillDomain;
    difficulty_type: string;
    frequency: number;
    context: string;
    resolution_strategies: string[];

export interface LearningGoal {
    id: string;
    skill_domain: SkillDomain;
    subcategory?: string;
    target_level: SkillLevel;
    target_date?: string;
    motivation: string;
    priority: 'low' | 'medium' | 'high';
    progress: number;

export interface ContentRecommendation {
    content_id: string;
    relevance_score: number;
    skill_alignment: Array<{,
        domain: SkillDomain;
        level: SkillLevel;
        contribution: number;
    }>;
    estimated_value: number;
    confidence: number;
    reasoning: string[];

export interface OptimizedLearningPath {
    original_path_id: string;
    optimized_sequence: string[];
    skill_gaps_addressed: SkillGap[];
    estimated_time_savings: number;
    personalization_factors: string[];
    confidence: number;

export interface SkillGap {
    skill_domain: SkillDomain;
    subcategory?: string;
    current_level: SkillLevel;
    required_level: SkillLevel;
    gap_size: number;
    recommended_content: string[];

export interface ContentSuggestion {
    content_id: string;
    suggestion_type: 'next_step' | 'reinforcement' | 'remediation' | 'enrichment';
    skill_focus: Array<{,
        domain: SkillDomain;
        level: SkillLevel;
    }>;
    estimated_benefit: number;
    urgency: 'low' | 'medium' | 'high';
    reasoning: string;

export interface ValidationResult {
    is_valid: boolean;
    confidence: number;
    discrepancies: Array<{,
        aspect: string;
        expected: any;
        actual: any;
        severity: 'low' | 'medium' | 'high';
    }>;
    recommendations: string[];
    community_consensus: number;

export declare const SKILL_LEVEL_DEFINITIONS: {
    readonly beginner: {
        readonly description: "Little to no prior experience with the topic";
        readonly characteristics: readonly ["New to the domain or skill area", "Needs step-by-step guidance", "Benefits from lots of examples and explanations", "May need foundational concepts explained", "Prefers structured, linear learning paths"];
        readonly typical_time_investment: "1-10 hours per topic";
        readonly success_indicators: readonly ["Can follow guided instructions", "Understands basic concepts", "Can replicate examples with minor modifications"];
    };
    readonly intermediate: {
        readonly description: "Has some experience and understands basic concepts";
        readonly characteristics: readonly ["Understands fundamental concepts", "Can work with moderate independence", "Ready for more complex scenarios", "Can connect new learning to existing knowledge", "Benefits from practical applications"];
        readonly typical_time_investment: "5-20 hours per topic";
        readonly success_indicators: readonly ["Can adapt examples to new situations", "Understands underlying principles", "Can troubleshoot common problems"];
    };
    readonly advanced: {
        readonly description: "Experienced with the fundamentals, ready for complex applications";
        readonly characteristics: readonly ["Strong foundation in the domain", "Can work independently on complex problems", "Ready for specialized techniques", "Can evaluate trade-offs and alternatives", "Benefits from case studies and real-world scenarios"];
        readonly typical_time_investment: "10-40 hours per topic";
        readonly success_indicators: readonly ["Can design solutions from scratch", "Understands advanced concepts and patterns", "Can mentor others in the domain"];
    };
    readonly expert: {
        readonly description: "Deep expertise, ready for cutting-edge topics and research";
        readonly characteristics: readonly ["Deep, comprehensive knowledge", "Can handle ambiguous or novel problems", "Ready for research-level content", "Can contribute to the field", "Benefits from peer collaboration and discussion"];
        readonly typical_time_investment: "20+ hours per topic";
        readonly success_indicators: readonly ["Can contribute original insights", "Can handle undefined problems", "Can teach and lead others effectively"];
    };
};
export declare const SKILL_PROGRESSION_PATTERNS: {
    readonly gradual: {
        readonly level_progression: readonly ["beginner", "intermediate", "advanced", "expert"];
        readonly overlap_percentage: 20;
        readonly reinforcement_frequency: 3;
        readonly assessment_frequency: 5;
    };
    readonly accelerated: {
        readonly level_progression: readonly ["beginner", "advanced", "expert"];
        readonly overlap_percentage: 10;
        readonly reinforcement_frequency: 2;
        readonly assessment_frequency: 3;
    };
    readonly specialized: {
        readonly level_progression: readonly ["intermediate", "advanced", "expert"];
        readonly overlap_percentage: 30;
        readonly reinforcement_frequency: 2;
        readonly assessment_frequency: 4;
    };
};
//# sourceMappingURL=SkillLevelTagging.d.ts.map