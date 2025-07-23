/**
 * Epic 16 - Skill Level Tagging System
 * Task: E16-1753114247112-47B1EB - Implement skill level tagging
 *
 * Comprehensive skill level classification system for tutorials and learning content.
 * Integrates with learning paths, content recommendations, and user progression tracking.
 */
// ====================================
// Configuration and Constants
// ====================================
export const SKILL_LEVEL_DEFINITIONS = {
    beginner: {
        description: 'Little to no prior experience with the topic',
        characteristics: [
            'New to the domain or skill area',
            'Needs step-by-step guidance',
            'Benefits from lots of examples and explanations',
            'May need foundational concepts explained',
            'Prefers structured, linear learning paths'
        ],
        typical_time_investment: '1-10 hours per topic',
        success_indicators: [
            'Can follow guided instructions',
            'Understands basic concepts',
            'Can replicate examples with minor modifications'
        ]
    },
    intermediate: {
        description: 'Has some experience and understands basic concepts',
        characteristics: [
            'Understands fundamental concepts',
            'Can work with moderate independence',
            'Ready for more complex scenarios',
            'Can connect new learning to existing knowledge',
            'Benefits from practical applications'
        ],
        typical_time_investment: '5-20 hours per topic',
        success_indicators: [
            'Can adapt examples to new situations',
            'Understands underlying principles',
            'Can troubleshoot common problems'
        ]
    },
    advanced: {
        description: 'Experienced with the fundamentals, ready for complex applications',
        characteristics: [
            'Strong foundation in the domain',
            'Can work independently on complex problems',
            'Ready for specialized techniques',
            'Can evaluate trade-offs and alternatives',
            'Benefits from case studies and real-world scenarios'
        ],
        typical_time_investment: '10-40 hours per topic',
        success_indicators: [
            'Can design solutions from scratch',
            'Understands advanced concepts and patterns',
            'Can mentor others in the domain'
        ]
    },
    expert: {
        description: 'Deep expertise, ready for cutting-edge topics and research',
        characteristics: [
            'Deep, comprehensive knowledge',
            'Can handle ambiguous or novel problems',
            'Ready for research-level content',
            'Can contribute to the field',
            'Benefits from peer collaboration and discussion'
        ],
        typical_time_investment: '20+ hours per topic',
        success_indicators: [
            'Can contribute original insights',
            'Can handle undefined problems',
            'Can teach and lead others effectively'
        ]
    }
};
export const SKILL_PROGRESSION_PATTERNS = {
    gradual: {
        level_progression: ['beginner', 'intermediate', 'advanced', 'expert'],
        overlap_percentage: 20, // How much content overlaps between levels
        reinforcement_frequency: 3, // Every 3rd piece of content reinforces previous level
        assessment_frequency: 5 // Assessment every 5 pieces of content
    },
    accelerated: {
        level_progression: ['beginner', 'advanced', 'expert'],
        overlap_percentage: 10,
        reinforcement_frequency: 2,
        assessment_frequency: 3
    },
    specialized: {
        level_progression: ['intermediate', 'advanced', 'expert'],
        overlap_percentage: 30,
        reinforcement_frequency: 2,
        assessment_frequency: 4
    }
};
