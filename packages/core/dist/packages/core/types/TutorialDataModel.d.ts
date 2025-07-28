/**
 * Tutorial Data Model - Epic 16 Marketplace & Community Features
 * Task: E16-1753114247092-285449 - Create tutorial data model
 *
 * Comprehensive tutorial data model with security validation,
 * content management, and learning path integration.
 */
import { z } from 'zod';
export declare const tutorialContentSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const tutorialStepSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const tutorialMetadataSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const tutorialCompletionSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const tutorialSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type TutorialContent = z.infer<typeof tutorialContentSchema>;
export type TutorialStep = z.infer<typeof tutorialStepSchema>;
export type TutorialMetadata = z.infer<typeof tutorialMetadataSchema>;
export type TutorialCompletion = z.infer<typeof tutorialCompletionSchema>;
export type Tutorial = z.infer<typeof tutorialSchema>;
export declare const learningPathSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type LearningPath = z.infer<typeof learningPathSchema>;
export declare class TutorialSecurity {
    /**
     * Validates tutorial content for security threats
     * Prevents XSS, injection attacks, and malicious content
     */
    static validateContent(content: string): {
        isValid: boolean;
        errors: string;
    };
    /**
     * Sanitizes user input to prevent XSS attacks
     */
    static sanitizeInput(input: string): string;
    /**
     * Validates file uploads for tutorials
     */
    static validateFileUpload(file: {
        name: string;
        size: number;
        type: string;
    }): {
        isValid: boolean;
        error?: string;
    };
}
//# sourceMappingURL=TutorialDataModel.d.ts.map