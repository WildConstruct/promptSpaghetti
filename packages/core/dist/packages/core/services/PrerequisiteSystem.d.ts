/**
 * Prerequisite System - Epic 16 Marketplace & Community Features
 * Task: E16-1753114247111-697296 - Create prerequisite system
 *
 * Comprehensive prerequisite management with dependency resolution,
 * security validation, and learning path enforcement.
 */
import { z } from 'zod';
declare const prerequisiteSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    type: z.ZodEnum<["tutorial", "skill", "certificate", "assessment", "experience"]>;
    requiredScore: z.ZodOptional<z.ZodNumber>;
    requiredTime: z.ZodOptional<z.ZodNumber>;
    validityPeriod: z.ZodOptional<z.ZodNumber>;
    category: z.ZodString;
    isActive: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    name?: string;
    description?: string;
    isActive?: boolean;
    type?: "tutorial" | "assessment" | "experience" | "certificate" | "skill";
    category?: string;
    requiredScore?: number;
    requiredTime?: number;
    validityPeriod?: number;
}, {
    id?: string;
    name?: string;
    description?: string;
    isActive?: boolean;
    type?: "tutorial" | "assessment" | "experience" | "certificate" | "skill";
    category?: string;
    requiredScore?: number;
    requiredTime?: number;
    validityPeriod?: number;
}>;
declare const prerequisiteGroupSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    prerequisites: z.ZodArray<z.ZodString, "many">;
    operator: z.ZodDefault<z.ZodEnum<["AND", "OR", "XOR"]>>;
    minimumRequired: z.ZodOptional<z.ZodNumber>;
    weight: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    name?: string;
    description?: string;
    weight?: number;
    operator?: "AND" | "OR" | "XOR";
    prerequisites?: string[];
    minimumRequired?: number;
}, {
    id?: string;
    name?: string;
    description?: string;
    weight?: number;
    operator?: "AND" | "OR" | "XOR";
    prerequisites?: string[];
    minimumRequired?: number;
}>;
declare const userProgressSchema: z.ZodObject<{
    userId: z.ZodString;
    prerequisiteId: z.ZodString;
    status: z.ZodEnum<["not_started", "in_progress", "completed", "expired", "failed"]>;
    score: z.ZodOptional<z.ZodNumber>;
    completedAt: z.ZodOptional<z.ZodDate>;
    expiresAt: z.ZodOptional<z.ZodDate>;
    attempts: z.ZodDefault<z.ZodNumber>;
    evidence: z.ZodOptional<z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["completion", "score", "time", "peer_review", "instructor_approval"]>;
        value: z.ZodString;
        timestamp: z.ZodDate;
        verifiedBy: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        value?: string;
        type?: "time" | "score" | "completion" | "peer_review" | "instructor_approval";
        timestamp?: Date;
        verifiedBy?: string;
    }, {
        value?: string;
        type?: "time" | "score" | "completion" | "peer_review" | "instructor_approval";
        timestamp?: Date;
        verifiedBy?: string;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    status?: "expired" | "completed" | "failed" | "in_progress" | "not_started";
    userId?: string;
    score?: number;
    attempts?: number;
    expiresAt?: Date;
    evidence?: {
        value?: string;
        type?: "time" | "score" | "completion" | "peer_review" | "instructor_approval";
        timestamp?: Date;
        verifiedBy?: string;
    }[];
    completedAt?: Date;
    prerequisiteId?: string;
}, {
    status?: "expired" | "completed" | "failed" | "in_progress" | "not_started";
    userId?: string;
    score?: number;
    attempts?: number;
    expiresAt?: Date;
    evidence?: {
        value?: string;
        type?: "time" | "score" | "completion" | "peer_review" | "instructor_approval";
        timestamp?: Date;
        verifiedBy?: string;
    }[];
    completedAt?: Date;
    prerequisiteId?: string;
}>;
export type Prerequisite = z.infer<typeof prerequisiteSchema>;
export type PrerequisiteGroup = z.infer<typeof prerequisiteGroupSchema>;
export type UserProgress = z.infer<typeof userProgressSchema>;
export declare class PrerequisiteSecurity {
    /**
     * Validates prerequisite input for security threats
     */
    static validatePrerequisiteInput(input: string): {
        isValid: boolean;
        errors: string[];
    };
    /**
     * Sanitizes user input to prevent XSS
     */
    static sanitizeInput(input: string): string;
    /**
     * Validates user permissions for prerequisite operations
     */
    static validateUserPermissions(userId: string, action: string, resourceId?: string): boolean;
}
export declare class DependencyResolver {
    private prerequisites;
    private groups;
    private userProgress;
    /**
     * Adds prerequisite to the system with validation
     */
    addPrerequisite(prerequisite: Prerequisite): {
        success: boolean;
        errors?: string[];
    };
    /**
     * Adds prerequisite group with dependency validation
     */
    addPrerequisiteGroup(group: PrerequisiteGroup): {
        success: boolean;
        errors?: string[];
    };
    /**
     * Resolves prerequisites for a user with comprehensive checking
     */
    resolvePrerequisitesForUser(userId: string, targetPrerequisites: string[]): {
        canProceed: boolean;
        missingPrerequisites: string[];
        satisfiedPrerequisites: string[];
        recommendations: string[];
    };
    /**
     * Checks if a prerequisite is satisfied for a user
     */
    private isPrerequisiteSatisfied;
    /**
     * Generates learning recommendations based on missing prerequisites
     */
    private generateRecommendation;
    /**
     * Detects circular dependencies in prerequisite groups
     */
    private hasCircularDependency;
    /**
     * Updates user progress with security validation
     */
    updateUserProgress(userId: string, prerequisiteId: string, progress: Partial<UserProgress>): {
        success: boolean;
        errors?: string[];
    };
    /**
     * Gets learning path suggestions based on user progress
     */
    generateLearningPath(userId: string, targetGoal: string): {
        path: Array<{
            prerequisiteId: string;
            name: string;
            estimatedTime: number;
        }>;
        totalEstimatedTime: number;
    };
}
export declare class PrerequisiteSystemService {
    private resolver;
    constructor();
    /**
     * Creates a new prerequisite with comprehensive validation
     */
    createPrerequisite(prerequisiteData: Prerequisite, userId: string): Promise<{
        success: boolean;
        prerequisiteId?: string;
        errors?: string[];
    }>;
    /**
     * Evaluates prerequisites for a learning objective
     */
    evaluatePrerequisites(userId: string, targetPrerequisites: string[]): Promise<{
        canProceed: boolean;
        evaluation: any;
        recommendations: string[];
    }>;
    /**
     * Updates user progress with validation
     */
    updateProgress(userId: string, prerequisiteId: string, progressData: Partial<UserProgress>): Promise<{
        success: boolean;
        errors?: string[];
    }>;
    /**
     * Generates personalized learning recommendations
     */
    generateRecommendations(userId: string, targetGoal: string): Promise<{
        learningPath: any;
        estimatedTime: number;
    }>;
}
export declare const schemas: {
    prerequisite: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodString;
        type: z.ZodEnum<["tutorial", "skill", "certificate", "assessment", "experience"]>;
        requiredScore: z.ZodOptional<z.ZodNumber>;
        requiredTime: z.ZodOptional<z.ZodNumber>;
        validityPeriod: z.ZodOptional<z.ZodNumber>;
        category: z.ZodString;
        isActive: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        name?: string;
        description?: string;
        isActive?: boolean;
        type?: "tutorial" | "assessment" | "experience" | "certificate" | "skill";
        category?: string;
        requiredScore?: number;
        requiredTime?: number;
        validityPeriod?: number;
    }, {
        id?: string;
        name?: string;
        description?: string;
        isActive?: boolean;
        type?: "tutorial" | "assessment" | "experience" | "certificate" | "skill";
        category?: string;
        requiredScore?: number;
        requiredTime?: number;
        validityPeriod?: number;
    }>;
    prerequisiteGroup: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodString;
        prerequisites: z.ZodArray<z.ZodString, "many">;
        operator: z.ZodDefault<z.ZodEnum<["AND", "OR", "XOR"]>>;
        minimumRequired: z.ZodOptional<z.ZodNumber>;
        weight: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        name?: string;
        description?: string;
        weight?: number;
        operator?: "AND" | "OR" | "XOR";
        prerequisites?: string[];
        minimumRequired?: number;
    }, {
        id?: string;
        name?: string;
        description?: string;
        weight?: number;
        operator?: "AND" | "OR" | "XOR";
        prerequisites?: string[];
        minimumRequired?: number;
    }>;
    userProgress: z.ZodObject<{
        userId: z.ZodString;
        prerequisiteId: z.ZodString;
        status: z.ZodEnum<["not_started", "in_progress", "completed", "expired", "failed"]>;
        score: z.ZodOptional<z.ZodNumber>;
        completedAt: z.ZodOptional<z.ZodDate>;
        expiresAt: z.ZodOptional<z.ZodDate>;
        attempts: z.ZodDefault<z.ZodNumber>;
        evidence: z.ZodOptional<z.ZodArray<z.ZodObject<{
            type: z.ZodEnum<["completion", "score", "time", "peer_review", "instructor_approval"]>;
            value: z.ZodString;
            timestamp: z.ZodDate;
            verifiedBy: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            value?: string;
            type?: "time" | "score" | "completion" | "peer_review" | "instructor_approval";
            timestamp?: Date;
            verifiedBy?: string;
        }, {
            value?: string;
            type?: "time" | "score" | "completion" | "peer_review" | "instructor_approval";
            timestamp?: Date;
            verifiedBy?: string;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        status?: "expired" | "completed" | "failed" | "in_progress" | "not_started";
        userId?: string;
        score?: number;
        attempts?: number;
        expiresAt?: Date;
        evidence?: {
            value?: string;
            type?: "time" | "score" | "completion" | "peer_review" | "instructor_approval";
            timestamp?: Date;
            verifiedBy?: string;
        }[];
        completedAt?: Date;
        prerequisiteId?: string;
    }, {
        status?: "expired" | "completed" | "failed" | "in_progress" | "not_started";
        userId?: string;
        score?: number;
        attempts?: number;
        expiresAt?: Date;
        evidence?: {
            value?: string;
            type?: "time" | "score" | "completion" | "peer_review" | "instructor_approval";
            timestamp?: Date;
            verifiedBy?: string;
        }[];
        completedAt?: Date;
        prerequisiteId?: string;
    }>;
};
export default PrerequisiteSystemService;
//# sourceMappingURL=PrerequisiteSystem.d.ts.map