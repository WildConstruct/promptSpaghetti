/**
 * Prerequisite System - Epic 16 Marketplace & Community Features
 * Task: E16-1753114247111-697296 - Create prerequisite system
 *
 * Comprehensive prerequisite management with dependency resolution,
 * security validation, and learning path enforcement.
 */
import { z } from 'zod';
declare const prerequisiteSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
declare const prerequisiteGroupSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
declare const userProgressSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type Prerequisite = z.infer<typeof prerequisiteSchema>;
export type PrerequisiteGroup = z.infer<typeof prerequisiteGroupSchema>;
export type UserProgress = z.infer<typeof userProgressSchema>;
export declare class PrerequisiteSecurity {
    /**
     * Validates prerequisite input for security threats
     */
    static validatePrerequisiteInput(input: string): {
        isValid: boolean;
        errors: string;
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
export {};
//# sourceMappingURL=PrerequisiteSystem.d.ts.map