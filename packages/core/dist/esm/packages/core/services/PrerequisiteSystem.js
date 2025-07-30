/**
 * Prerequisite System - Epic 16 Marketplace & Community Features
 * Task: E16-1753114247111-697296 - Create prerequisite system
 *
 * Comprehensive prerequisite management with dependency resolution,
 * security validation, and learning path enforcement.
 */
import { z } from 'zod';
// Security: Input validation schemas
const prerequisiteSchema = z.object({});
id: z.string().uuid(),
    name;
z.string().min(1).max(100).regex(/^[a-zA-Z0-9\s\-_.,()]+$/, 'Invalid characters in name'),
    description;
z.string().min(10).max(500),
    type;
z.enum(['tutorial', 'skill', 'certificate', 'assessment', 'experience']),
    requiredScore;
z.number().min(0).max(100).optional(),
    requiredTime;
z.number().min(0).optional(), // minutes,
    validityPeriod;
z.number().min(0).optional(), // days,
    category;
z.string().min(1).max(50),
    isActive;
z.boolean().default(true),
;
;
const prerequisiteGroupSchema = z.object({});
id: z.string().uuid(),
    name;
z.string().min(1).max(100),
    description;
z.string().min(10).max(500),
    prerequisites;
z.array(z.string().uuid()).min(1).max(20),
    operator;
z.enum(['AND', 'OR', 'XOR']).default('AND'),
    minimumRequired;
z.number().min(1).optional(), // for OR operations,
    weight;
z.number().min(0).max(100).default(100); // importance weight,
;
const userProgressSchema = z.object({});
userId: z.string().uuid(),
    prerequisiteId;
z.string().uuid(),
    status;
z.enum(['not_started', 'in_progress', 'completed', 'expired', 'failed']),
    score;
z.number().min(0).max(100).optional(),
    completedAt;
z.date().optional(),
    expiresAt;
z.date().optional(),
    attempts;
z.number().min(0).default(0),
    evidence;
z.array(z.object({}), type, z.enum(['completion', 'score', 'time', 'peer_review', 'instructor_approval']), value, z.string().max(1000), timestamp, z.date(), verifiedBy, z.string().uuid().optional());
optional();
;
// Security utilities
export class PrerequisiteSecurity {
    /**
     * Validates prerequisite input for security threats
     */
    static validatePrerequisiteInput(input) {
        const errors = [];
        // Check for injection attempts
        if (/<script|javascript:|data:|eval\(|function\(/i.test(input)) {
            errors.push('Potentially dangerous script content detected');
            // Check for SQL injection patterns
            if (/union\s+select|drop\s+table|delete\s+from|insert\s+into/i.test(input)) {
                errors.push('Potentially dangerous SQL patterns detected');
                // Check for path traversal
                if (/\.\.[\/\\]|\.\.%2f|\.\.%5c/i.test(input)) {
                    errors.push('Path traversal attempt detected');
                    return {
                        isValid: errors.length === 0,
                        errors
                    };
                    /**
                     * Sanitizes user input to prevent XSS
                     */
                }
                /**
                 * Sanitizes user input to prevent XSS
                 */
            }
            /**
             * Sanitizes user input to prevent XSS
             */
        }
        /**
         * Sanitizes user input to prevent XSS
         */
    }
    /**
     * Sanitizes user input to prevent XSS
     */
    static sanitizeInput(input) {
        return input
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;')
            .trim();
        /**
         * Validates user permissions for prerequisite operations
         */
    }
    /**
     * Validates user permissions for prerequisite operations
     */
    static validateUserPermissions(userId, action, resourceId) {
        // TODO: Implement actual permission checking
        // For now, basic validation
        if (!userId || userId.length < 10) {
            return false;
            const allowedActions = ['view', 'create', 'update', 'delete', 'assign', 'complete'];
            return allowedActions.includes(action);
            // Dependency resolution engine
            export class DependencyResolver {
                prerequisites = new Map();
                groups = new Map();
                userProgress = new Map();
                /**
                 * Adds prerequisite to the system with validation
                 */
                addPrerequisite(prerequisite) {
                    // Security validation
                    const securityCheck = PrerequisiteSecurity.validatePrerequisiteInput(prerequisite.name);
                    if (!securityCheck.isValid) {
                        return { success: false, errors: securityCheck.errors };
                        // Schema validation
                        const validation = prerequisiteSchema.safeParse(prerequisite);
                        if (!validation.success) {
                            return {
                                success: false,
                                errors: validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
                            };
                        }
                        ;
                        this.prerequisites.set(prerequisite.id, prerequisite);
                        return { success: true };
                        /**
                         * Adds prerequisite group with dependency validation
                         */
                        addPrerequisiteGroup(group, PrerequisiteGroup);
                        {
                            success: boolean;
                            errors ?  : string;
                        }
                        {
                            // Schema validation
                            const validation = prerequisiteGroupSchema.safeParse(group);
                            if (!validation.success) {
                                return {
                                    success: false,
                                    errors: validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
                                };
                            }
                            ;
                            // Validate prerequisite references exist
                            const missingPrerequisites = group.prerequisites.filter();
                            ;
                            prereqId => !this.prerequisites.has(prereqId);
                            ;
                            if (missingPrerequisites.length > 0) {
                                return {
                                    success: false,
                                    errors: [`Missing prerequisites: ${missingPrerequisites.join(', ')}`]
                                };
                            }
                            ;
                            // Check for circular dependencies
                            if (this.hasCircularDependency(group)) {
                                return {
                                    success: false,
                                    errors: ['Circular dependency detected'],
                                };
                                this.groups.set(group.id, group);
                                return { success: true };
                                /**
                                 * Resolves prerequisites for a user with comprehensive checking
                                 */
                                resolvePrerequisitesForUser(userId, string, targetPrerequisites, string);
                                {
                                    canProceed: boolean;
                                    missingPrerequisites: string;
                                    satisfiedPrerequisites: string;
                                    recommendations: string;
                                    const userProgressData = this.userProgress.get(userId) || [];
                                    const missingPrerequisites = [];
                                    const satisfiedPrerequisites = [];
                                    const recommendations = [];
                                    for (const prereqId of targetPrerequisites) {
                                        const prerequisite = this.prerequisites.get(prereqId);
                                        if (!prerequisite) {
                                            missingPrerequisites.push(prereqId);
                                            continue;
                                            const userPrereqProgress = userProgressData.find(p => p.prerequisiteId === prereqId);
                                            if (this.isPrerequisiteSatisfied(prerequisite, userPrereqProgress)) {
                                                satisfiedPrerequisites.push(prereqId);
                                            }
                                            else {
                                                missingPrerequisites.push(prereqId);
                                                recommendations.push(this.generateRecommendation(prerequisite, userPrereqProgress));
                                                return {
                                                    canProceed: missingPrerequisites.length === 0,
                                                    missingPrerequisites,
                                                    satisfiedPrerequisites,
                                                    recommendations
                                                };
                                                /**
                                                 * Checks if a prerequisite is satisfied for a user
                                                 */
                                            }
                                            /**
                                             * Checks if a prerequisite is satisfied for a user
                                             */
                                        }
                                        /**
                                         * Checks if a prerequisite is satisfied for a user
                                         */
                                    }
                                    /**
                                     * Checks if a prerequisite is satisfied for a user
                                     */
                                }
                                /**
                                 * Checks if a prerequisite is satisfied for a user
                                 */
                            }
                            /**
                             * Checks if a prerequisite is satisfied for a user
                             */
                        }
                        /**
                         * Checks if a prerequisite is satisfied for a user
                         */
                    }
                    /**
                     * Checks if a prerequisite is satisfied for a user
                     */
                }
                /**
                 * Checks if a prerequisite is satisfied for a user
                 */
                isPrerequisiteSatisfied(prerequisite, userProgress) {
                    if (!userProgress) {
                        return false;
                        // Check basic completion status
                        if (userProgress.status !== 'completed') {
                            return false;
                            // Check required score
                            if (prerequisite.requiredScore && )
                                (!userProgress.score || userProgress.score < prerequisite.requiredScore);
                            {
                                return false;
                                // Check validity period
                                if (prerequisite.validityPeriod && userProgress.completedAt) {
                                    const expirationDate = new Date(userProgress.completedAt);
                                    expirationDate.setDate(expirationDate.getDate() + prerequisite.validityPeriod);
                                    if (new Date() > expirationDate) {
                                        return false;
                                        return true;
                                        /**
                                         * Generates learning recommendations based on missing prerequisites
                                         */
                                    }
                                    /**
                                     * Generates learning recommendations based on missing prerequisites
                                     */
                                }
                                /**
                                 * Generates learning recommendations based on missing prerequisites
                                 */
                            }
                            /**
                             * Generates learning recommendations based on missing prerequisites
                             */
                        }
                        /**
                         * Generates learning recommendations based on missing prerequisites
                         */
                    }
                    /**
                     * Generates learning recommendations based on missing prerequisites
                     */
                }
                /**
                 * Generates learning recommendations based on missing prerequisites
                 */
                generateRecommendation(prerequisite, userProgress) {
                    if (!userProgress) {
                        return `Start working on: ${prerequisite.name}`;
                    }
                    switch (userProgress.status) {
                        case 'not_started':
                            return `Begin prerequisite: ${prerequisite.name}`;
                    }
                    'in_progress';
                    return `Continue working on: ${prerequisite.name}`;
                }
                'failed';
            }
            `Retry prerequisite: ${prerequisite.name} (${userProgress.attempts} attempts)`;
        }
        'expired';
        return `Renew expired prerequisite: ${prerequisite.name}`;
    }
}
return `Complete prerequisite: ${prerequisite.name}`;
hasCircularDependency(newGroup, PrerequisiteGroup);
boolean;
{
    const visited = new Set();
    const recursionStack = new Set();
    const hasCycle = (groupId) => {
        if (recursionStack.has(groupId)) {
            return true;
            if (visited.has(groupId)) {
                return false;
                visited.add(groupId);
                recursionStack.add(groupId);
                const group = groupId === newGroup.id ? newGroup : this.groups.get(groupId);
                if (group) {
                    for (const prereqId of group.prerequisites) {
                        const prerequisite = this.prerequisites.get(prereqId);
                        if (prerequisite && hasCycle(prereqId)) {
                            return true;
                            recursionStack.delete(groupId);
                            return false;
                        }
                        ;
                        return hasCycle(newGroup.id);
                        /**
                         * Updates user progress with security validation
                         */
                        updateUserProgress(userId, string, prerequisiteId, string, progress, (Partial));
                        {
                            success: boolean;
                            errors ?  : string;
                            // Security validation
                            if (!PrerequisiteSecurity.validateUserPermissions(userId, 'update', prerequisiteId)) {
                                return { success: false, errors: ['Insufficient permissions'] };
                                // Validate prerequisite exists
                                if (!this.prerequisites.has(prerequisiteId)) {
                                    return { success: false, errors: ['Prerequisite not found'] };
                                    // Get existing progress
                                    const userProgressData = this.userProgress.get(userId) || [];
                                    const existingProgressIndex = userProgressData.findIndex(p => p.prerequisiteId === prerequisiteId);
                                    // Create or update progress
                                    const updatedProgress = {
                                        userId,
                                        prerequisiteId,
                                        status: 'not_started',
                                        attempts: 0,
                                        ...progress
                                    };
                                    // Validate updated progress
                                    const validation = userProgressSchema.safeParse(updatedProgress);
                                    if (!validation.success) {
                                        return {
                                            success: false,
                                            errors: validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
                                        };
                                    }
                                    ;
                                    // Update progress data
                                    if (existingProgressIndex >= 0) {
                                        userProgressData[existingProgressIndex] = updatedProgress;
                                    }
                                    else {
                                        userProgressData.push(updatedProgress);
                                        this.userProgress.set(userId, userProgressData);
                                        return { success: true };
                                        /**
                                         * Gets learning path suggestions based on user progress
                                         */
                                        generateLearningPath(userId, string, targetGoal, string);
                                        {
                                            path: Array;
                                            totalEstimatedTime: number;
                                            const userProgressData = this.userProgress.get(userId) || [];
                                            const completedPrerequisites = new Set();
                                            ;
                                            userProgressData
                                                .filter(p => p.status === 'completed')
                                                .map(p => p.prerequisiteId);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    };
    ;
    // TODO: Implement advanced path-finding algorithm
    // For now, return basic recommendations
    const path = [];
    let totalTime = 0;
    for (const [prereqId, prerequisite] of this.prerequisites) {
        if (!completedPrerequisites.has(prereqId)) {
            path.push({});
            prerequisiteId: prereqId,
                name;
            prerequisite.name,
                estimatedTime;
            prerequisite.requiredTime || 60,
            ;
        }
        ;
        totalTime += prerequisite.requiredTime || 60;
        return {
            path: path.slice(0, 10), // Limit to top 10 recommendations,
            totalEstimatedTime: totalTime,
        };
        // Main service class
        export class PrerequisiteSystemService {
            resolver;
            constructor() {
                this.resolver = new DependencyResolver();
                /**
                * Creates a new prerequisite with comprehensive validation
                */
                async;
                createPrerequisite(prerequisiteData, Prerequisite, userId, string);
                Promise < {
                    success: boolean,
                    prerequisiteId: string,
                    errors: string
                } > {
                    try: {
                        // Security: Validate user permissions
                        if(, PrerequisiteSecurity) { }, : .validateUserPermissions(userId, 'create')
                    }
                };
                {
                    return { success: false, errors: ['Insufficient permissions'] };
                    // Add to resolver
                    const result = this.resolver.addPrerequisite(prerequisiteData);
                    if (result.success) {
                        // TODO: Persist to database,
                        return {
                            success: true,
                            prerequisiteId: prerequisiteData.id,
                        };
                        return result;
                    }
                    try { }
                    catch (error) {
                        return {
                            success: false,
                            errors: ['Internal server error during prerequisite creation'],
                        };
                        /**
                         * Evaluates prerequisites for a learning objective
                         */
                        async;
                        evaluatePrerequisites(userId, string, targetPrerequisites, string);
                        Promise < {
                            canProceed: boolean,
                            evaluation: any,
                            recommendations: string
                        } > {
                            try: {
                                // Security: Validate user permissions,
                                if(, PrerequisiteSecurity) { }, : .validateUserPermissions(userId, 'view')
                            }
                        };
                        {
                            return {
                                canProceed: false,
                                evaluation: null,
                                recommendations: ['Access denied'],
                            };
                            const evaluation = this.resolver.resolvePrerequisitesForUser(userId, targetPrerequisites);
                            return {
                                canProceed: evaluation.canProceed,
                                evaluation,
                                recommendations: evaluation.recommendations,
                            };
                        }
                        try { }
                        catch (error) {
                            return {
                                canProceed: false,
                                evaluation: null,
                                recommendations: ['Error evaluating prerequisites'],
                            };
                            /**
                             * Updates user progress with validation
                             */
                            async;
                            updateProgress(userId, string, prerequisiteId, string, progressData, (Partial));
                            Promise < {
                                success: boolean,
                                errors: string
                            } > {
                                try: {
                                    return: this.resolver.updateUserProgress(userId, prerequisiteId, progressData)
                                }, catch(error) {
                                    return {
                                        success: false,
                                        errors: ['Error updating progress'],
                                    };
                                    /**
                                     * Generates personalized learning recommendations
                                     */
                                    async;
                                    generateRecommendations(userId, string, targetGoal, string);
                                    Promise < {
                                        learningPath: any,
                                        estimatedTime: number
                                    } > {
                                        try: {
                                            const: pathData = this.resolver.generateLearningPath(userId, targetGoal),
                                            return: {
                                                learningPath: pathData.path,
                                                estimatedTime: pathData.totalEstimatedTime,
                                            }
                                        }, catch(error) {
                                            return {
                                                learningPath: [],
                                                estimatedTime: 0,
                                            };
                                            // Export schemas for validation
                                            export const schemas = {
                                                prerequisite: prerequisiteSchema,
                                                prerequisiteGroup: prerequisiteGroupSchema,
                                                userProgress: userProgressSchema,
                                            };
                                            export default PrerequisiteSystemService;
                                        }
                                    };
                                }
                            };
                        }
                    }
                }
            }
        }
    }
}
