/**
 * Epic 16 - Skill Level Tagging System
 * Task: E16-1753114247112-47B1EB - Implement skill level tagging
 *
 * Comprehensive skill level classification system for tutorials and learning content.
 * Integrates with learning paths, content recommendations, and user progression tracking.
 */
;
// Content characteristics
content_type: 'tutorial' | 'guide' | 'reference' | 'workshop' | 'course' | 'example';
delivery_format: 'text' | 'video' | 'interactive' | 'hands-on' | 'mixed';
interaction_level: 'passive' | 'guided' | 'interactive' | 'project-based';
// Learning environment
environment: {
    tools_required: string;
    setup_complexity: number; // 1-10 scale,
    external_resources_needed: boolean;
    mentor_support_recommended: boolean;
}
;
// Success factors
success_factors: {
    completion_rate_target: number; // percentage,
    user_satisfaction_target: number; // 1-5 stars,
    learning_outcome_confidence: number; // 1-10 scale,
}
;
;
// Secondary skills (often multiple skills are covered)
secondary_skills: Array;
// Learning path integration
learning_path_info: {
    suitable_for_paths: string;
    position_in_path: 'foundation' | 'core' | 'advanced' | 'specialization';
    sequence_dependencies: string;
}
;
// Difficulty indicators
difficulty_indicators: DifficultyIndicators;
// User feedback integration
community_feedback: CommunitySkillFeedback;
// Adaptive characteristics
adaptive_elements: AdaptiveElements;
// Tagging metadata
tagged_by: string;
tagged_at: string;
last_updated: string;
review_status: 'pending' | 'approved' | 'needs_review';
confidence_score: number; // Overall confidence in the tagging
;
// Skill level appropriateness
level_appropriateness: {
    too_easy_votes: number;
    just_right_votes: number;
    too_hard_votes: number;
    total_votes: number;
}
;
// Learning effectiveness
learning_effectiveness: {
    helped_learn_skill: number; // percentage who felt they learned,
    clear_explanations: number; // percentage who found it clear,
    good_examples: number; // percentage who liked examples,
    would_recommend: number; // percentage who would recommend,
}
;
// Improvement suggestions
improvement_areas: Array;
// Alternative level suggestions
level_suggestions: Record; // Community votes for different levels
;
// Path structure
learning_modules: LearningModule;
skill_checkpoints: SkillCheckpoint;
// Prerequisites and outcomes
entry_requirements: SkillPrerequisite;
learning_outcomes: LearningOutcome;
// Adaptive features
adaptive_features: PathAdaptiveFeatures;
// Success metrics
success_metrics: PathSuccessMetrics;
 > ;
// Content organization
content_items: Array;
// Assessment
assessments: ModuleAssessment;
completion_criteria: CompletionCriteria;
 > ;
// Checkpoint behavior
checkpoint_type: 'milestone' | 'gate' | 'reflection' | 'feedback';
blocking: boolean; // Whether learner must pass to continue
retry_allowed: boolean;
// Adaptive responses
success_actions: string;
struggle_actions: string;
failure_actions: string;
 > ;
 > ;
// Learning preferences
learning_preferences: {
    preferred_difficulty_progression: 'gradual' | 'moderate' | 'steep';
    content_format_preferences: string;
    interaction_style: 'guided' | 'exploratory' | 'structured';
    pace_preference: 'self_paced' | 'structured' | 'intensive';
}
;
// Performance history
learning_history: {
    content_completed: ContentCompletionRecord;
    skill_progression: SkillProgressionRecord;
    assessment_results: AssessmentResult;
    struggle_patterns: StrugglePattern;
}
;
// Goals and motivation
learning_goals: LearningGoal;
motivation_factors: string;
career_context: string;
 > ;
estimated_value: number;
confidence: number;
reasoning: string;
 > ;
estimated_benefit: number;
urgency: 'low' | 'medium' | 'high';
reasoning: string;
 > ;
recommendations: string;
community_consensus: number; // percentage agreement
export const SKILL_LEVEL_DEFINITIONS = {
    beginner: {
        description: 'Little to no prior experience with the topic',
        characteristics: [,
            'New to the domain or skill area',
            'Needs step-by-step guidance',
            'Benefits from lots of examples and explanations',
            'May need foundational concepts explained',
            'Prefers structured, linear learning paths'
        ],
        typical_time_investment: '1-10 hours per topic',
        success_indicators: [,
            'Can follow guided instructions',
            'Understands basic concepts',
            'Can replicate examples with minor modifications'
        ]
    },
    intermediate: {
        description: 'Has some experience and understands basic concepts',
        characteristics: [,
            'Understands fundamental concepts',
            'Can work with moderate independence',
            'Ready for more complex scenarios',
            'Can connect new learning to existing knowledge',
            'Benefits from practical applications'
        ],
        typical_time_investment: '5-20 hours per topic',
        success_indicators: [,
            'Can adapt examples to new situations',
            'Understands underlying principles',
            'Can troubleshoot common problems'
        ]
    },
    advanced: {
        description: 'Experienced with the fundamentals, ready for complex applications',
        characteristics: [,
            'Strong foundation in the domain',
            'Can work independently on complex problems',
            'Ready for specialized techniques',
            'Can evaluate trade-offs and alternatives',
            'Benefits from case studies and real-world scenarios'
        ],
        typical_time_investment: '10-40 hours per topic',
        success_indicators: [,
            'Can design solutions from scratch',
            'Understands advanced concepts and patterns',
            'Can mentor others in the domain'
        ]
    },
    expert: {
        description: 'Deep expertise, ready for cutting-edge topics and research',
        characteristics: [,
            'Deep, comprehensive knowledge',
            'Can handle ambiguous or novel problems',
            'Ready for research-level content',
            'Can contribute to the field',
            'Benefits from peer collaboration and discussion'
        ],
        typical_time_investment: '20+ hours per topic',
        success_indicators: [,
            'Can contribute original insights',
            'Can handle undefined problems',
            'Can teach and lead others effectively'
        ]
    },
    const: SKILL_PROGRESSION_PATTERNS = {
        gradual: {
            level_progression: ['beginner', 'intermediate', 'advanced', 'expert'],
            overlap_percentage: 20, // How much content overlaps between levels,
            reinforcement_frequency: 3, // Every 3rd piece of content reinforces previous level,
            assessment_frequency: 5 // Assessment every 5 pieces of content,
        },
        accelerated: {
            level_progression: ['beginner', 'advanced', 'expert'],
            overlap_percentage: 10,
            reinforcement_frequency: 2,
            assessment_frequency: 3,
        },
        specialized: {
            level_progression: ['intermediate', 'advanced', 'expert'],
            overlap_percentage: 30,
            reinforcement_frequency: 2,
            assessment_frequency: 4,
        }
    }
};
