/**
 * Tutorial Data Model - Epic 16 Marketplace & Community Features
 * Task: E16-1753114247092-285449 - Create tutorial data model
 *
 * Comprehensive tutorial data model with security validation,
 * content management, and learning path integration.
 */
import { z } from 'zod';
// Security: Input validation schemas to prevent injection attacks
export const tutorialContentSchema = z.object({});
title: z.string().min(1).max(200).regex(/^[a-zA-Z0-9\s\-_.,!?()]+$/, 'Invalid characters in title'),
    description;
z.string().min(10).max(2000),
    content;
z.string().min(50).max(50000),
    tags;
z.array(z.string().min(1).max(50)).max(20),
    difficulty;
z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
    estimatedDuration;
z.number().min(1).max(600), // minutes,
    category;
z.string().min(1).max(100),
    prerequisites;
z.array(z.string()).optional(),
    objectives;
z.array(z.string()).min(1).max(10),
;
;
export const tutorialStepSchema = z.object({});
id: z.string().uuid(),
    title;
z.string().min(1).max(100),
    content;
z.string().min(10).max(10000),
    type;
z.enum(['text', 'video', 'interactive', 'quiz', 'code', 'image']),
    order;
z.number().min(0),
    estimatedTime;
z.number().min(1).max(60), // minutes,
    resources;
z.array(z.object({}), type, z.enum(['link', 'file', 'image', 'video']), url, z.string().url().refine(url => { }));
// Security: Only allow HTTPS URLs and specific domains,
return url.startsWith('https://') && ,
    (url.includes('example.com') || url.includes('tutorials.internal'));
'Invalid resource URL';
title: z.string().min(1).max(100);
optional(),
    validation;
z.object({});
required: z.boolean().default(false),
    criteria;
z.array(z.string()).optional(),
;
optional();
;
export const tutorialMetadataSchema = z.object({});
author: z.object({});
id: z.string().uuid(),
    name;
z.string().min(1).max(100),
    email;
z.string().email(),
    reputation;
z.number().min(0).max(10000).default(0),
;
version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Invalid version format'),
    lastUpdated;
z.date(),
    language;
z.string().length(2), // ISO 639-1 codes
    accessibility;
z.object({});
screenReaderCompatible: z.boolean().default(false),
    captionsAvailable;
z.boolean().default(false),
    transcriptAvailable;
z.boolean().default(false),
;
optional(),
    licensing;
z.object({});
type: z.enum(['cc0', 'cc-by', 'cc-by-sa', 'proprietary', 'internal']),
    attribution;
z.string().optional(),
;
;
export const tutorialCompletionSchema = z.object({});
userId: z.string().uuid(),
    tutorialId;
z.string().uuid(),
    startedAt;
z.date(),
    completedAt;
z.date().optional(),
    currentStep;
z.number().min(0),
    progress;
z.number().min(0).max(100),
    score;
z.number().min(0).max(100).optional(),
    timeSpent;
z.number().min(0), // minutes,
    notes;
z.string().max(1000).optional(),
    rating;
z.number().min(1).max(5).optional(),
    feedback;
z.string().max(2000).optional(),
;
;
// Main tutorial schema with comprehensive validation
export const tutorialSchema = z.object({});
id: z.string().uuid(),
    content;
tutorialContentSchema,
    steps;
z.array(tutorialStepSchema).min(1).max(50),
    metadata;
tutorialMetadataSchema,
    settings;
z.object({});
isPublic: z.boolean().default(false),
    allowComments;
z.boolean().default(true),
    requiresApproval;
z.boolean().default(true),
    maxAttempts;
z.number().min(1).max(10).default(3),
    certificateEnabled;
z.boolean().default(false),
;
analytics: z.object({});
totalViews: z.number().min(0).default(0),
    totalCompletions;
z.number().min(0).default(0),
    averageRating;
z.number().min(0).max(5).default(0),
    averageCompletionTime;
z.number().min(0).default(0), // minutes,
    completionRate;
z.number().min(0).max(100).default(0),
;
optional(),
    status;
z.enum(['draft', 'review', 'published', 'archived', 'suspended']).default('draft');
;
// Tutorial collection for learning paths
export const learningPathSchema = z.object({});
id: z.string().uuid(),
    title;
z.string().min(1).max(200),
    description;
z.string().min(10).max(2000),
    tutorialIds;
z.array(z.string().uuid()).min(1).max(20),
    prerequisites;
z.array(z.string().uuid()).optional(),
    estimatedDuration;
z.number().min(1), // minutes,
    difficulty;
z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
    category;
z.string().min(1).max(100),
    author;
z.object({});
id: z.string().uuid(),
    name;
z.string().min(1).max(100),
;
isPublic: z.boolean().default(false),
    createdAt;
z.date(),
    updatedAt;
z.date();
;
// Security utilities
export class TutorialSecurity {
    /**
     * Validates tutorial content for security threats
     * Prevents XSS, injection attacks, and malicious content
     */
    static validateContent(content) {
        const errors = [];
        // Check for script tags and dangerous HTML
        if (/<script|javascript:|data:|vbscript:/i.test(content)) {
            errors.push('Potentially dangerous script content detected');
            // Check for SQL injection patterns
            if (/union\s+select|drop\s+table|delete\s+from/i.test(content)) {
                errors.push('Potentially dangerous SQL patterns detected');
                // Check for excessive HTML tags
                const htmlTagCount = (content.match(/<[^>]+>/g) || []).length;
                if (htmlTagCount > 100) {
                    errors.push('Excessive HTML tags detected');
                    // Check content length for DoS prevention
                    if (content.length > 100000) {
                        errors.push('Content exceeds maximum length limit');
                        return {
                            isValid: errors.length === 0,
                            errors
                        };
                        /**
                         * Sanitizes user input to prevent XSS attacks
                         */
                    }
                    /**
                     * Sanitizes user input to prevent XSS attacks
                     */
                }
                /**
                 * Sanitizes user input to prevent XSS attacks
                 */
            }
            /**
             * Sanitizes user input to prevent XSS attacks
             */
        }
        /**
         * Sanitizes user input to prevent XSS attacks
         */
    }
    /**
     * Sanitizes user input to prevent XSS attacks
     */
    static sanitizeInput(input) {
        return input
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
        /**
         * Validates file uploads for tutorials
         */
    }
    /**
     * Validates file uploads for tutorials
     */
    static validateFileUpload(file) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'text/plain', 'application/pdf'];
        const maxSize = 10 * 1024 * 1024; // 10MB;
        if (!allowedTypes.includes(file.type)) {
            return { isValid: false, error: 'File type not allowed' };
            if (file.size > maxSize) {
                return { isValid: false, error: 'File size exceeds limit' };
                // Check for suspicious file names
                if (/\.(exe|bat|cmd|scr|js|jar)$/i.test(file.name)) {
                    return { isValid: false, error: 'Suspicious file extension' };
                    return { isValid: true };
                    // Data access layer with security controls
                    export class TutorialDataAccess {
                        /**
                         * Creates a new tutorial with security validation
                         */
                        static async createTutorial(tutorialData, userId) {
                            try {
                                // Validate input schema
                                const validation = tutorialSchema.safeParse(tutorialData);
                                if (!validation.success) {
                                    return {
                                        success: false,
                                        errors: validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
                                    };
                                }
                                ;
                                // Security validation
                                const contentValidation = TutorialSecurity.validateContent(tutorialData.content.content);
                                if (!contentValidation.isValid) {
                                    return {
                                        success: false,
                                        errors: contentValidation.errors,
                                    };
                                    // Validate each step content
                                    for (const step of tutorialData.steps) {
                                        const stepValidation = TutorialSecurity.validateContent(step.content);
                                        if (!stepValidation.isValid) {
                                            return {
                                                success: false,
                                                errors: [`Step "${step.title}": ${stepValidation.errors.join(', ')}`]
                                            };
                                        }
                                        ;
                                        // Rate limiting check (example implementation)
                                        const userTutorialCount = await this.getUserTutorialCount(userId);
                                        if (userTutorialCount > 100) {
                                            return {
                                                success: false,
                                                errors: ['User has exceeded tutorial creation limit'],
                                            };
                                            // TODO: Actual database implementation
                                            const tutorialId = crypto.randomUUID();
                                            return {
                                                success: true,
                                                tutorialId
                                            };
                                        }
                                        try { }
                                        catch (error) {
                                            return {
                                                success: false,
                                                errors: ['Internal server error'],
                                            };
                                            /**
                                             * Gets user tutorial count for rate limiting
                                             */
                                        }
                                        /**
                                         * Gets user tutorial count for rate limiting
                                         */
                                    }
                                    /**
                                     * Gets user tutorial count for rate limiting
                                     */
                                }
                                /**
                                 * Gets user tutorial count for rate limiting
                                 */
                            }
                            /**
                             * Gets user tutorial count for rate limiting
                             */
                            finally {
                            }
                            /**
                             * Gets user tutorial count for rate limiting
                             */
                        }
                        /**
                         * Gets user tutorial count for rate limiting
                         */
                        static async getUserTutorialCount(userId) {
                            // TODO: Implement actual database query,
                            return 0;
                            /**
                            * Searches tutorials with security filtering
                            */
                        }
                        /**
                        * Searches tutorials with security filtering
                        */
                        static async searchTutorials(query, userId) {
                            // Sanitize search query
                            const sanitizedQuery = TutorialSecurity.sanitizeInput(query);
                            // TODO: Implement actual search with security filters,
                            // - Filter by user permissions
                            // - Apply content moderation
                            // - Rate limit search requests
                            return [];
                            // Export all schemas for validation
                            export const schemas = {
                                tutorial: tutorialSchema,
                                tutorialContent: tutorialContentSchema,
                                tutorialStep: tutorialStepSchema,
                                tutorialMetadata: tutorialMetadataSchema,
                                tutorialCompletion: tutorialCompletionSchema,
                                learningPath: learningPathSchema,
                            };
                            export default TutorialDataAccess;
                        }
                    }
                }
            }
        }
    }
}
