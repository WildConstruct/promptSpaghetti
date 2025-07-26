/**
 * Tutorial Data Model - Epic 16 Marketplace & Community Features
 * Task: E16-1753114247092-285449 - Create tutorial data model
 *
 * Comprehensive tutorial data model with security validation,
 * content management, and learning path integration.
 */
import { z } from 'zod';
export declare const tutorialContentSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodString;
    content: z.ZodString;
    tags: z.ZodArray<z.ZodString, "many">;
    difficulty: z.ZodEnum<["beginner", "intermediate", "advanced", "expert"]>;
    estimatedDuration: z.ZodNumber;
    category: z.ZodString;
    prerequisites: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    objectives: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    description: string;
    category: string;
    tags: string[];
    content: string;
    title: string;
    difficulty: "expert" | "advanced" | "intermediate" | "beginner";
    estimatedDuration: number;
    objectives: string[];
    prerequisites?: string[] | undefined;
}, {
    description: string;
    category: string;
    tags: string[];
    content: string;
    title: string;
    difficulty: "expert" | "advanced" | "intermediate" | "beginner";
    estimatedDuration: number;
    objectives: string[];
    prerequisites?: string[] | undefined;
}>;
export declare const tutorialStepSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    content: z.ZodString;
    type: z.ZodEnum<["text", "video", "interactive", "quiz", "code", "image"]>;
    order: z.ZodNumber;
    estimatedTime: z.ZodNumber;
    resources: z.ZodOptional<z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["link", "file", "image", "video"]>;
        url: z.ZodEffects<z.ZodString, string, string>;
        title: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: "link" | "file" | "video" | "image";
        title: string;
        url: string;
    }, {
        type: "link" | "file" | "video" | "image";
        title: string;
        url: string;
    }>, "many">>;
    validation: z.ZodOptional<z.ZodObject<{
        required: z.ZodDefault<z.ZodBoolean>;
        criteria: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        required: boolean;
        criteria?: string[] | undefined;
    }, {
        required?: boolean | undefined;
        criteria?: string[] | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    type: "code" | "text" | "video" | "image" | "interactive" | "quiz";
    content: string;
    title: string;
    order: number;
    estimatedTime: number;
    validation?: {
        required: boolean;
        criteria?: string[] | undefined;
    } | undefined;
    resources?: {
        type: "link" | "file" | "video" | "image";
        title: string;
        url: string;
    }[] | undefined;
}, {
    id: string;
    type: "code" | "text" | "video" | "image" | "interactive" | "quiz";
    content: string;
    title: string;
    order: number;
    estimatedTime: number;
    validation?: {
        required?: boolean | undefined;
        criteria?: string[] | undefined;
    } | undefined;
    resources?: {
        type: "link" | "file" | "video" | "image";
        title: string;
        url: string;
    }[] | undefined;
}>;
export declare const tutorialMetadataSchema: z.ZodObject<{
    author: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        email: z.ZodString;
        reputation: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        email: string;
        reputation: number;
    }, {
        id: string;
        name: string;
        email: string;
        reputation?: number | undefined;
    }>;
    version: z.ZodString;
    lastUpdated: z.ZodDate;
    language: z.ZodString;
    accessibility: z.ZodOptional<z.ZodObject<{
        screenReaderCompatible: z.ZodDefault<z.ZodBoolean>;
        captionsAvailable: z.ZodDefault<z.ZodBoolean>;
        transcriptAvailable: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        screenReaderCompatible: boolean;
        captionsAvailable: boolean;
        transcriptAvailable: boolean;
    }, {
        screenReaderCompatible?: boolean | undefined;
        captionsAvailable?: boolean | undefined;
        transcriptAvailable?: boolean | undefined;
    }>>;
    licensing: z.ZodObject<{
        type: z.ZodEnum<["cc0", "cc-by", "cc-by-sa", "proprietary", "internal"]>;
        attribution: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "internal" | "cc0" | "cc-by" | "cc-by-sa" | "proprietary";
        attribution?: string | undefined;
    }, {
        type: "internal" | "cc0" | "cc-by" | "cc-by-sa" | "proprietary";
        attribution?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    version: string;
    author: {
        id: string;
        name: string;
        email: string;
        reputation: number;
    };
    lastUpdated: Date;
    language: string;
    licensing: {
        type: "internal" | "cc0" | "cc-by" | "cc-by-sa" | "proprietary";
        attribution?: string | undefined;
    };
    accessibility?: {
        screenReaderCompatible: boolean;
        captionsAvailable: boolean;
        transcriptAvailable: boolean;
    } | undefined;
}, {
    version: string;
    author: {
        id: string;
        name: string;
        email: string;
        reputation?: number | undefined;
    };
    lastUpdated: Date;
    language: string;
    licensing: {
        type: "internal" | "cc0" | "cc-by" | "cc-by-sa" | "proprietary";
        attribution?: string | undefined;
    };
    accessibility?: {
        screenReaderCompatible?: boolean | undefined;
        captionsAvailable?: boolean | undefined;
        transcriptAvailable?: boolean | undefined;
    } | undefined;
}>;
export declare const tutorialCompletionSchema: z.ZodObject<{
    userId: z.ZodString;
    tutorialId: z.ZodString;
    startedAt: z.ZodDate;
    completedAt: z.ZodOptional<z.ZodDate>;
    currentStep: z.ZodNumber;
    progress: z.ZodNumber;
    score: z.ZodOptional<z.ZodNumber>;
    timeSpent: z.ZodNumber;
    notes: z.ZodOptional<z.ZodString>;
    rating: z.ZodOptional<z.ZodNumber>;
    feedback: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    progress: number;
    userId: string;
    currentStep: number;
    timeSpent: number;
    tutorialId: string;
    startedAt: Date;
    rating?: number | undefined;
    score?: number | undefined;
    notes?: string | undefined;
    feedback?: string | undefined;
    completedAt?: Date | undefined;
}, {
    progress: number;
    userId: string;
    currentStep: number;
    timeSpent: number;
    tutorialId: string;
    startedAt: Date;
    rating?: number | undefined;
    score?: number | undefined;
    notes?: string | undefined;
    feedback?: string | undefined;
    completedAt?: Date | undefined;
}>;
export declare const tutorialSchema: z.ZodObject<{
    id: z.ZodString;
    content: z.ZodObject<{
        title: z.ZodString;
        description: z.ZodString;
        content: z.ZodString;
        tags: z.ZodArray<z.ZodString, "many">;
        difficulty: z.ZodEnum<["beginner", "intermediate", "advanced", "expert"]>;
        estimatedDuration: z.ZodNumber;
        category: z.ZodString;
        prerequisites: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        objectives: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        description: string;
        category: string;
        tags: string[];
        content: string;
        title: string;
        difficulty: "expert" | "advanced" | "intermediate" | "beginner";
        estimatedDuration: number;
        objectives: string[];
        prerequisites?: string[] | undefined;
    }, {
        description: string;
        category: string;
        tags: string[];
        content: string;
        title: string;
        difficulty: "expert" | "advanced" | "intermediate" | "beginner";
        estimatedDuration: number;
        objectives: string[];
        prerequisites?: string[] | undefined;
    }>;
    steps: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        content: z.ZodString;
        type: z.ZodEnum<["text", "video", "interactive", "quiz", "code", "image"]>;
        order: z.ZodNumber;
        estimatedTime: z.ZodNumber;
        resources: z.ZodOptional<z.ZodArray<z.ZodObject<{
            type: z.ZodEnum<["link", "file", "image", "video"]>;
            url: z.ZodEffects<z.ZodString, string, string>;
            title: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            type: "link" | "file" | "video" | "image";
            title: string;
            url: string;
        }, {
            type: "link" | "file" | "video" | "image";
            title: string;
            url: string;
        }>, "many">>;
        validation: z.ZodOptional<z.ZodObject<{
            required: z.ZodDefault<z.ZodBoolean>;
            criteria: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            required: boolean;
            criteria?: string[] | undefined;
        }, {
            required?: boolean | undefined;
            criteria?: string[] | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        type: "code" | "text" | "video" | "image" | "interactive" | "quiz";
        content: string;
        title: string;
        order: number;
        estimatedTime: number;
        validation?: {
            required: boolean;
            criteria?: string[] | undefined;
        } | undefined;
        resources?: {
            type: "link" | "file" | "video" | "image";
            title: string;
            url: string;
        }[] | undefined;
    }, {
        id: string;
        type: "code" | "text" | "video" | "image" | "interactive" | "quiz";
        content: string;
        title: string;
        order: number;
        estimatedTime: number;
        validation?: {
            required?: boolean | undefined;
            criteria?: string[] | undefined;
        } | undefined;
        resources?: {
            type: "link" | "file" | "video" | "image";
            title: string;
            url: string;
        }[] | undefined;
    }>, "many">;
    metadata: z.ZodObject<{
        author: z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            email: z.ZodString;
            reputation: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
            email: string;
            reputation: number;
        }, {
            id: string;
            name: string;
            email: string;
            reputation?: number | undefined;
        }>;
        version: z.ZodString;
        lastUpdated: z.ZodDate;
        language: z.ZodString;
        accessibility: z.ZodOptional<z.ZodObject<{
            screenReaderCompatible: z.ZodDefault<z.ZodBoolean>;
            captionsAvailable: z.ZodDefault<z.ZodBoolean>;
            transcriptAvailable: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            screenReaderCompatible: boolean;
            captionsAvailable: boolean;
            transcriptAvailable: boolean;
        }, {
            screenReaderCompatible?: boolean | undefined;
            captionsAvailable?: boolean | undefined;
            transcriptAvailable?: boolean | undefined;
        }>>;
        licensing: z.ZodObject<{
            type: z.ZodEnum<["cc0", "cc-by", "cc-by-sa", "proprietary", "internal"]>;
            attribution: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            type: "internal" | "cc0" | "cc-by" | "cc-by-sa" | "proprietary";
            attribution?: string | undefined;
        }, {
            type: "internal" | "cc0" | "cc-by" | "cc-by-sa" | "proprietary";
            attribution?: string | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        version: string;
        author: {
            id: string;
            name: string;
            email: string;
            reputation: number;
        };
        lastUpdated: Date;
        language: string;
        licensing: {
            type: "internal" | "cc0" | "cc-by" | "cc-by-sa" | "proprietary";
            attribution?: string | undefined;
        };
        accessibility?: {
            screenReaderCompatible: boolean;
            captionsAvailable: boolean;
            transcriptAvailable: boolean;
        } | undefined;
    }, {
        version: string;
        author: {
            id: string;
            name: string;
            email: string;
            reputation?: number | undefined;
        };
        lastUpdated: Date;
        language: string;
        licensing: {
            type: "internal" | "cc0" | "cc-by" | "cc-by-sa" | "proprietary";
            attribution?: string | undefined;
        };
        accessibility?: {
            screenReaderCompatible?: boolean | undefined;
            captionsAvailable?: boolean | undefined;
            transcriptAvailable?: boolean | undefined;
        } | undefined;
    }>;
    settings: z.ZodObject<{
        isPublic: z.ZodDefault<z.ZodBoolean>;
        allowComments: z.ZodDefault<z.ZodBoolean>;
        requiresApproval: z.ZodDefault<z.ZodBoolean>;
        maxAttempts: z.ZodDefault<z.ZodNumber>;
        certificateEnabled: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        isPublic: boolean;
        maxAttempts: number;
        requiresApproval: boolean;
        allowComments: boolean;
        certificateEnabled: boolean;
    }, {
        isPublic?: boolean | undefined;
        maxAttempts?: number | undefined;
        requiresApproval?: boolean | undefined;
        allowComments?: boolean | undefined;
        certificateEnabled?: boolean | undefined;
    }>;
    analytics: z.ZodOptional<z.ZodObject<{
        totalViews: z.ZodDefault<z.ZodNumber>;
        totalCompletions: z.ZodDefault<z.ZodNumber>;
        averageRating: z.ZodDefault<z.ZodNumber>;
        averageCompletionTime: z.ZodDefault<z.ZodNumber>;
        completionRate: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        averageRating: number;
        totalViews: number;
        completionRate: number;
        totalCompletions: number;
        averageCompletionTime: number;
    }, {
        averageRating?: number | undefined;
        totalViews?: number | undefined;
        completionRate?: number | undefined;
        totalCompletions?: number | undefined;
        averageCompletionTime?: number | undefined;
    }>>;
    status: z.ZodDefault<z.ZodEnum<["draft", "review", "published", "archived", "suspended"]>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    status: "draft" | "published" | "review" | "archived" | "suspended";
    content: {
        description: string;
        category: string;
        tags: string[];
        content: string;
        title: string;
        difficulty: "expert" | "advanced" | "intermediate" | "beginner";
        estimatedDuration: number;
        objectives: string[];
        prerequisites?: string[] | undefined;
    };
    metadata: {
        version: string;
        author: {
            id: string;
            name: string;
            email: string;
            reputation: number;
        };
        lastUpdated: Date;
        language: string;
        licensing: {
            type: "internal" | "cc0" | "cc-by" | "cc-by-sa" | "proprietary";
            attribution?: string | undefined;
        };
        accessibility?: {
            screenReaderCompatible: boolean;
            captionsAvailable: boolean;
            transcriptAvailable: boolean;
        } | undefined;
    };
    settings: {
        isPublic: boolean;
        maxAttempts: number;
        requiresApproval: boolean;
        allowComments: boolean;
        certificateEnabled: boolean;
    };
    steps: {
        id: string;
        type: "code" | "text" | "video" | "image" | "interactive" | "quiz";
        content: string;
        title: string;
        order: number;
        estimatedTime: number;
        validation?: {
            required: boolean;
            criteria?: string[] | undefined;
        } | undefined;
        resources?: {
            type: "link" | "file" | "video" | "image";
            title: string;
            url: string;
        }[] | undefined;
    }[];
    analytics?: {
        averageRating: number;
        totalViews: number;
        completionRate: number;
        totalCompletions: number;
        averageCompletionTime: number;
    } | undefined;
}, {
    id: string;
    content: {
        description: string;
        category: string;
        tags: string[];
        content: string;
        title: string;
        difficulty: "expert" | "advanced" | "intermediate" | "beginner";
        estimatedDuration: number;
        objectives: string[];
        prerequisites?: string[] | undefined;
    };
    metadata: {
        version: string;
        author: {
            id: string;
            name: string;
            email: string;
            reputation?: number | undefined;
        };
        lastUpdated: Date;
        language: string;
        licensing: {
            type: "internal" | "cc0" | "cc-by" | "cc-by-sa" | "proprietary";
            attribution?: string | undefined;
        };
        accessibility?: {
            screenReaderCompatible?: boolean | undefined;
            captionsAvailable?: boolean | undefined;
            transcriptAvailable?: boolean | undefined;
        } | undefined;
    };
    settings: {
        isPublic?: boolean | undefined;
        maxAttempts?: number | undefined;
        requiresApproval?: boolean | undefined;
        allowComments?: boolean | undefined;
        certificateEnabled?: boolean | undefined;
    };
    steps: {
        id: string;
        type: "code" | "text" | "video" | "image" | "interactive" | "quiz";
        content: string;
        title: string;
        order: number;
        estimatedTime: number;
        validation?: {
            required?: boolean | undefined;
            criteria?: string[] | undefined;
        } | undefined;
        resources?: {
            type: "link" | "file" | "video" | "image";
            title: string;
            url: string;
        }[] | undefined;
    }[];
    status?: "draft" | "published" | "review" | "archived" | "suspended" | undefined;
    analytics?: {
        averageRating?: number | undefined;
        totalViews?: number | undefined;
        completionRate?: number | undefined;
        totalCompletions?: number | undefined;
        averageCompletionTime?: number | undefined;
    } | undefined;
}>;
export type TutorialContent = z.infer<typeof tutorialContentSchema>;
export type TutorialStep = z.infer<typeof tutorialStepSchema>;
export type TutorialMetadata = z.infer<typeof tutorialMetadataSchema>;
export type TutorialCompletion = z.infer<typeof tutorialCompletionSchema>;
export type Tutorial = z.infer<typeof tutorialSchema>;
export declare const learningPathSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
    tutorialIds: z.ZodArray<z.ZodString, "many">;
    prerequisites: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    estimatedDuration: z.ZodNumber;
    difficulty: z.ZodEnum<["beginner", "intermediate", "advanced", "expert"]>;
    category: z.ZodString;
    author: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
    }, {
        id: string;
        name: string;
    }>;
    isPublic: z.ZodDefault<z.ZodBoolean>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    description: string;
    category: string;
    author: {
        id: string;
        name: string;
    };
    title: string;
    difficulty: "expert" | "advanced" | "intermediate" | "beginner";
    isPublic: boolean;
    estimatedDuration: number;
    tutorialIds: string[];
    prerequisites?: string[] | undefined;
}, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    description: string;
    category: string;
    author: {
        id: string;
        name: string;
    };
    title: string;
    difficulty: "expert" | "advanced" | "intermediate" | "beginner";
    estimatedDuration: number;
    tutorialIds: string[];
    isPublic?: boolean | undefined;
    prerequisites?: string[] | undefined;
}>;
export type LearningPath = z.infer<typeof learningPathSchema>;
export declare class TutorialSecurity {
    /**
     * Validates tutorial content for security threats
     * Prevents XSS, injection attacks, and malicious content
     */
    static validateContent(content: string): {
        isValid: boolean;
        errors: string[];
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
export declare class TutorialDataAccess {
    /**
     * Creates a new tutorial with security validation
     */
    static createTutorial(tutorialData: Tutorial, userId: string): Promise<{
        success: boolean;
        tutorialId?: string;
        errors?: string[];
    }>;
    /**
     * Gets user tutorial count for rate limiting
     */
    private static getUserTutorialCount;
    /**
     * Searches tutorials with security filtering
     */
    static searchTutorials(query: string, userId?: string): Promise<Tutorial[]>;
}
export declare const schemas: {
    tutorial: z.ZodObject<{
        id: z.ZodString;
        content: z.ZodObject<{
            title: z.ZodString;
            description: z.ZodString;
            content: z.ZodString;
            tags: z.ZodArray<z.ZodString, "many">;
            difficulty: z.ZodEnum<["beginner", "intermediate", "advanced", "expert"]>;
            estimatedDuration: z.ZodNumber;
            category: z.ZodString;
            prerequisites: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            objectives: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            description: string;
            category: string;
            tags: string[];
            content: string;
            title: string;
            difficulty: "expert" | "advanced" | "intermediate" | "beginner";
            estimatedDuration: number;
            objectives: string[];
            prerequisites?: string[] | undefined;
        }, {
            description: string;
            category: string;
            tags: string[];
            content: string;
            title: string;
            difficulty: "expert" | "advanced" | "intermediate" | "beginner";
            estimatedDuration: number;
            objectives: string[];
            prerequisites?: string[] | undefined;
        }>;
        steps: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            title: z.ZodString;
            content: z.ZodString;
            type: z.ZodEnum<["text", "video", "interactive", "quiz", "code", "image"]>;
            order: z.ZodNumber;
            estimatedTime: z.ZodNumber;
            resources: z.ZodOptional<z.ZodArray<z.ZodObject<{
                type: z.ZodEnum<["link", "file", "image", "video"]>;
                url: z.ZodEffects<z.ZodString, string, string>;
                title: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: "link" | "file" | "video" | "image";
                title: string;
                url: string;
            }, {
                type: "link" | "file" | "video" | "image";
                title: string;
                url: string;
            }>, "many">>;
            validation: z.ZodOptional<z.ZodObject<{
                required: z.ZodDefault<z.ZodBoolean>;
                criteria: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            }, "strip", z.ZodTypeAny, {
                required: boolean;
                criteria?: string[] | undefined;
            }, {
                required?: boolean | undefined;
                criteria?: string[] | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            type: "code" | "text" | "video" | "image" | "interactive" | "quiz";
            content: string;
            title: string;
            order: number;
            estimatedTime: number;
            validation?: {
                required: boolean;
                criteria?: string[] | undefined;
            } | undefined;
            resources?: {
                type: "link" | "file" | "video" | "image";
                title: string;
                url: string;
            }[] | undefined;
        }, {
            id: string;
            type: "code" | "text" | "video" | "image" | "interactive" | "quiz";
            content: string;
            title: string;
            order: number;
            estimatedTime: number;
            validation?: {
                required?: boolean | undefined;
                criteria?: string[] | undefined;
            } | undefined;
            resources?: {
                type: "link" | "file" | "video" | "image";
                title: string;
                url: string;
            }[] | undefined;
        }>, "many">;
        metadata: z.ZodObject<{
            author: z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                email: z.ZodString;
                reputation: z.ZodDefault<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                name: string;
                email: string;
                reputation: number;
            }, {
                id: string;
                name: string;
                email: string;
                reputation?: number | undefined;
            }>;
            version: z.ZodString;
            lastUpdated: z.ZodDate;
            language: z.ZodString;
            accessibility: z.ZodOptional<z.ZodObject<{
                screenReaderCompatible: z.ZodDefault<z.ZodBoolean>;
                captionsAvailable: z.ZodDefault<z.ZodBoolean>;
                transcriptAvailable: z.ZodDefault<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                screenReaderCompatible: boolean;
                captionsAvailable: boolean;
                transcriptAvailable: boolean;
            }, {
                screenReaderCompatible?: boolean | undefined;
                captionsAvailable?: boolean | undefined;
                transcriptAvailable?: boolean | undefined;
            }>>;
            licensing: z.ZodObject<{
                type: z.ZodEnum<["cc0", "cc-by", "cc-by-sa", "proprietary", "internal"]>;
                attribution: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                type: "internal" | "cc0" | "cc-by" | "cc-by-sa" | "proprietary";
                attribution?: string | undefined;
            }, {
                type: "internal" | "cc0" | "cc-by" | "cc-by-sa" | "proprietary";
                attribution?: string | undefined;
            }>;
        }, "strip", z.ZodTypeAny, {
            version: string;
            author: {
                id: string;
                name: string;
                email: string;
                reputation: number;
            };
            lastUpdated: Date;
            language: string;
            licensing: {
                type: "internal" | "cc0" | "cc-by" | "cc-by-sa" | "proprietary";
                attribution?: string | undefined;
            };
            accessibility?: {
                screenReaderCompatible: boolean;
                captionsAvailable: boolean;
                transcriptAvailable: boolean;
            } | undefined;
        }, {
            version: string;
            author: {
                id: string;
                name: string;
                email: string;
                reputation?: number | undefined;
            };
            lastUpdated: Date;
            language: string;
            licensing: {
                type: "internal" | "cc0" | "cc-by" | "cc-by-sa" | "proprietary";
                attribution?: string | undefined;
            };
            accessibility?: {
                screenReaderCompatible?: boolean | undefined;
                captionsAvailable?: boolean | undefined;
                transcriptAvailable?: boolean | undefined;
            } | undefined;
        }>;
        settings: z.ZodObject<{
            isPublic: z.ZodDefault<z.ZodBoolean>;
            allowComments: z.ZodDefault<z.ZodBoolean>;
            requiresApproval: z.ZodDefault<z.ZodBoolean>;
            maxAttempts: z.ZodDefault<z.ZodNumber>;
            certificateEnabled: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            isPublic: boolean;
            maxAttempts: number;
            requiresApproval: boolean;
            allowComments: boolean;
            certificateEnabled: boolean;
        }, {
            isPublic?: boolean | undefined;
            maxAttempts?: number | undefined;
            requiresApproval?: boolean | undefined;
            allowComments?: boolean | undefined;
            certificateEnabled?: boolean | undefined;
        }>;
        analytics: z.ZodOptional<z.ZodObject<{
            totalViews: z.ZodDefault<z.ZodNumber>;
            totalCompletions: z.ZodDefault<z.ZodNumber>;
            averageRating: z.ZodDefault<z.ZodNumber>;
            averageCompletionTime: z.ZodDefault<z.ZodNumber>;
            completionRate: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            averageRating: number;
            totalViews: number;
            completionRate: number;
            totalCompletions: number;
            averageCompletionTime: number;
        }, {
            averageRating?: number | undefined;
            totalViews?: number | undefined;
            completionRate?: number | undefined;
            totalCompletions?: number | undefined;
            averageCompletionTime?: number | undefined;
        }>>;
        status: z.ZodDefault<z.ZodEnum<["draft", "review", "published", "archived", "suspended"]>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        status: "draft" | "published" | "review" | "archived" | "suspended";
        content: {
            description: string;
            category: string;
            tags: string[];
            content: string;
            title: string;
            difficulty: "expert" | "advanced" | "intermediate" | "beginner";
            estimatedDuration: number;
            objectives: string[];
            prerequisites?: string[] | undefined;
        };
        metadata: {
            version: string;
            author: {
                id: string;
                name: string;
                email: string;
                reputation: number;
            };
            lastUpdated: Date;
            language: string;
            licensing: {
                type: "internal" | "cc0" | "cc-by" | "cc-by-sa" | "proprietary";
                attribution?: string | undefined;
            };
            accessibility?: {
                screenReaderCompatible: boolean;
                captionsAvailable: boolean;
                transcriptAvailable: boolean;
            } | undefined;
        };
        settings: {
            isPublic: boolean;
            maxAttempts: number;
            requiresApproval: boolean;
            allowComments: boolean;
            certificateEnabled: boolean;
        };
        steps: {
            id: string;
            type: "code" | "text" | "video" | "image" | "interactive" | "quiz";
            content: string;
            title: string;
            order: number;
            estimatedTime: number;
            validation?: {
                required: boolean;
                criteria?: string[] | undefined;
            } | undefined;
            resources?: {
                type: "link" | "file" | "video" | "image";
                title: string;
                url: string;
            }[] | undefined;
        }[];
        analytics?: {
            averageRating: number;
            totalViews: number;
            completionRate: number;
            totalCompletions: number;
            averageCompletionTime: number;
        } | undefined;
    }, {
        id: string;
        content: {
            description: string;
            category: string;
            tags: string[];
            content: string;
            title: string;
            difficulty: "expert" | "advanced" | "intermediate" | "beginner";
            estimatedDuration: number;
            objectives: string[];
            prerequisites?: string[] | undefined;
        };
        metadata: {
            version: string;
            author: {
                id: string;
                name: string;
                email: string;
                reputation?: number | undefined;
            };
            lastUpdated: Date;
            language: string;
            licensing: {
                type: "internal" | "cc0" | "cc-by" | "cc-by-sa" | "proprietary";
                attribution?: string | undefined;
            };
            accessibility?: {
                screenReaderCompatible?: boolean | undefined;
                captionsAvailable?: boolean | undefined;
                transcriptAvailable?: boolean | undefined;
            } | undefined;
        };
        settings: {
            isPublic?: boolean | undefined;
            maxAttempts?: number | undefined;
            requiresApproval?: boolean | undefined;
            allowComments?: boolean | undefined;
            certificateEnabled?: boolean | undefined;
        };
        steps: {
            id: string;
            type: "code" | "text" | "video" | "image" | "interactive" | "quiz";
            content: string;
            title: string;
            order: number;
            estimatedTime: number;
            validation?: {
                required?: boolean | undefined;
                criteria?: string[] | undefined;
            } | undefined;
            resources?: {
                type: "link" | "file" | "video" | "image";
                title: string;
                url: string;
            }[] | undefined;
        }[];
        status?: "draft" | "published" | "review" | "archived" | "suspended" | undefined;
        analytics?: {
            averageRating?: number | undefined;
            totalViews?: number | undefined;
            completionRate?: number | undefined;
            totalCompletions?: number | undefined;
            averageCompletionTime?: number | undefined;
        } | undefined;
    }>;
    tutorialContent: z.ZodObject<{
        title: z.ZodString;
        description: z.ZodString;
        content: z.ZodString;
        tags: z.ZodArray<z.ZodString, "many">;
        difficulty: z.ZodEnum<["beginner", "intermediate", "advanced", "expert"]>;
        estimatedDuration: z.ZodNumber;
        category: z.ZodString;
        prerequisites: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        objectives: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        description: string;
        category: string;
        tags: string[];
        content: string;
        title: string;
        difficulty: "expert" | "advanced" | "intermediate" | "beginner";
        estimatedDuration: number;
        objectives: string[];
        prerequisites?: string[] | undefined;
    }, {
        description: string;
        category: string;
        tags: string[];
        content: string;
        title: string;
        difficulty: "expert" | "advanced" | "intermediate" | "beginner";
        estimatedDuration: number;
        objectives: string[];
        prerequisites?: string[] | undefined;
    }>;
    tutorialStep: z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        content: z.ZodString;
        type: z.ZodEnum<["text", "video", "interactive", "quiz", "code", "image"]>;
        order: z.ZodNumber;
        estimatedTime: z.ZodNumber;
        resources: z.ZodOptional<z.ZodArray<z.ZodObject<{
            type: z.ZodEnum<["link", "file", "image", "video"]>;
            url: z.ZodEffects<z.ZodString, string, string>;
            title: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            type: "link" | "file" | "video" | "image";
            title: string;
            url: string;
        }, {
            type: "link" | "file" | "video" | "image";
            title: string;
            url: string;
        }>, "many">>;
        validation: z.ZodOptional<z.ZodObject<{
            required: z.ZodDefault<z.ZodBoolean>;
            criteria: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            required: boolean;
            criteria?: string[] | undefined;
        }, {
            required?: boolean | undefined;
            criteria?: string[] | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        type: "code" | "text" | "video" | "image" | "interactive" | "quiz";
        content: string;
        title: string;
        order: number;
        estimatedTime: number;
        validation?: {
            required: boolean;
            criteria?: string[] | undefined;
        } | undefined;
        resources?: {
            type: "link" | "file" | "video" | "image";
            title: string;
            url: string;
        }[] | undefined;
    }, {
        id: string;
        type: "code" | "text" | "video" | "image" | "interactive" | "quiz";
        content: string;
        title: string;
        order: number;
        estimatedTime: number;
        validation?: {
            required?: boolean | undefined;
            criteria?: string[] | undefined;
        } | undefined;
        resources?: {
            type: "link" | "file" | "video" | "image";
            title: string;
            url: string;
        }[] | undefined;
    }>;
    tutorialMetadata: z.ZodObject<{
        author: z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            email: z.ZodString;
            reputation: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
            email: string;
            reputation: number;
        }, {
            id: string;
            name: string;
            email: string;
            reputation?: number | undefined;
        }>;
        version: z.ZodString;
        lastUpdated: z.ZodDate;
        language: z.ZodString;
        accessibility: z.ZodOptional<z.ZodObject<{
            screenReaderCompatible: z.ZodDefault<z.ZodBoolean>;
            captionsAvailable: z.ZodDefault<z.ZodBoolean>;
            transcriptAvailable: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            screenReaderCompatible: boolean;
            captionsAvailable: boolean;
            transcriptAvailable: boolean;
        }, {
            screenReaderCompatible?: boolean | undefined;
            captionsAvailable?: boolean | undefined;
            transcriptAvailable?: boolean | undefined;
        }>>;
        licensing: z.ZodObject<{
            type: z.ZodEnum<["cc0", "cc-by", "cc-by-sa", "proprietary", "internal"]>;
            attribution: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            type: "internal" | "cc0" | "cc-by" | "cc-by-sa" | "proprietary";
            attribution?: string | undefined;
        }, {
            type: "internal" | "cc0" | "cc-by" | "cc-by-sa" | "proprietary";
            attribution?: string | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        version: string;
        author: {
            id: string;
            name: string;
            email: string;
            reputation: number;
        };
        lastUpdated: Date;
        language: string;
        licensing: {
            type: "internal" | "cc0" | "cc-by" | "cc-by-sa" | "proprietary";
            attribution?: string | undefined;
        };
        accessibility?: {
            screenReaderCompatible: boolean;
            captionsAvailable: boolean;
            transcriptAvailable: boolean;
        } | undefined;
    }, {
        version: string;
        author: {
            id: string;
            name: string;
            email: string;
            reputation?: number | undefined;
        };
        lastUpdated: Date;
        language: string;
        licensing: {
            type: "internal" | "cc0" | "cc-by" | "cc-by-sa" | "proprietary";
            attribution?: string | undefined;
        };
        accessibility?: {
            screenReaderCompatible?: boolean | undefined;
            captionsAvailable?: boolean | undefined;
            transcriptAvailable?: boolean | undefined;
        } | undefined;
    }>;
    tutorialCompletion: z.ZodObject<{
        userId: z.ZodString;
        tutorialId: z.ZodString;
        startedAt: z.ZodDate;
        completedAt: z.ZodOptional<z.ZodDate>;
        currentStep: z.ZodNumber;
        progress: z.ZodNumber;
        score: z.ZodOptional<z.ZodNumber>;
        timeSpent: z.ZodNumber;
        notes: z.ZodOptional<z.ZodString>;
        rating: z.ZodOptional<z.ZodNumber>;
        feedback: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        progress: number;
        userId: string;
        currentStep: number;
        timeSpent: number;
        tutorialId: string;
        startedAt: Date;
        rating?: number | undefined;
        score?: number | undefined;
        notes?: string | undefined;
        feedback?: string | undefined;
        completedAt?: Date | undefined;
    }, {
        progress: number;
        userId: string;
        currentStep: number;
        timeSpent: number;
        tutorialId: string;
        startedAt: Date;
        rating?: number | undefined;
        score?: number | undefined;
        notes?: string | undefined;
        feedback?: string | undefined;
        completedAt?: Date | undefined;
    }>;
    learningPath: z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        description: z.ZodString;
        tutorialIds: z.ZodArray<z.ZodString, "many">;
        prerequisites: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        estimatedDuration: z.ZodNumber;
        difficulty: z.ZodEnum<["beginner", "intermediate", "advanced", "expert"]>;
        category: z.ZodString;
        author: z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
        }, {
            id: string;
            name: string;
        }>;
        isPublic: z.ZodDefault<z.ZodBoolean>;
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        category: string;
        author: {
            id: string;
            name: string;
        };
        title: string;
        difficulty: "expert" | "advanced" | "intermediate" | "beginner";
        isPublic: boolean;
        estimatedDuration: number;
        tutorialIds: string[];
        prerequisites?: string[] | undefined;
    }, {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        category: string;
        author: {
            id: string;
            name: string;
        };
        title: string;
        difficulty: "expert" | "advanced" | "intermediate" | "beginner";
        estimatedDuration: number;
        tutorialIds: string[];
        isPublic?: boolean | undefined;
        prerequisites?: string[] | undefined;
    }>;
};
export default TutorialDataAccess;
//# sourceMappingURL=TutorialDataModel.d.ts.map