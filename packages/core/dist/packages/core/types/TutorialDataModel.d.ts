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
    description?: string;
    category?: string;
    tags?: string[];
    content?: string;
    title?: string;
    prerequisites?: string[];
    difficulty?: "advanced" | "expert" | "intermediate" | "beginner";
    estimatedDuration?: number;
    objectives?: string[];
}, {
    description?: string;
    category?: string;
    tags?: string[];
    content?: string;
    title?: string;
    prerequisites?: string[];
    difficulty?: "advanced" | "expert" | "intermediate" | "beginner";
    estimatedDuration?: number;
    objectives?: string[];
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
        type?: "link" | "file" | "video" | "image";
        title?: string;
        url?: string;
    }, {
        type?: "link" | "file" | "video" | "image";
        title?: string;
        url?: string;
    }>, "many">>;
    validation: z.ZodOptional<z.ZodObject<{
        required: z.ZodDefault<z.ZodBoolean>;
        criteria: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        required?: boolean;
        criteria?: string[];
    }, {
        required?: boolean;
        criteria?: string[];
    }>>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    validation?: {
        required?: boolean;
        criteria?: string[];
    };
    type?: "code" | "text" | "video" | "image" | "interactive" | "quiz";
    content?: string;
    title?: string;
    resources?: {
        type?: "link" | "file" | "video" | "image";
        title?: string;
        url?: string;
    }[];
    order?: number;
    estimatedTime?: number;
}, {
    id?: string;
    validation?: {
        required?: boolean;
        criteria?: string[];
    };
    type?: "code" | "text" | "video" | "image" | "interactive" | "quiz";
    content?: string;
    title?: string;
    resources?: {
        type?: "link" | "file" | "video" | "image";
        title?: string;
        url?: string;
    }[];
    order?: number;
    estimatedTime?: number;
}>;
export declare const tutorialMetadataSchema: z.ZodObject<{
    author: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        email: z.ZodString;
        reputation: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        name?: string;
        email?: string;
        reputation?: number;
    }, {
        id?: string;
        name?: string;
        email?: string;
        reputation?: number;
    }>;
    version: z.ZodString;
    lastUpdated: z.ZodDate;
    language: z.ZodString;
    accessibility: z.ZodOptional<z.ZodObject<{
        screenReaderCompatible: z.ZodDefault<z.ZodBoolean>;
        captionsAvailable: z.ZodDefault<z.ZodBoolean>;
        transcriptAvailable: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        screenReaderCompatible?: boolean;
        captionsAvailable?: boolean;
        transcriptAvailable?: boolean;
    }, {
        screenReaderCompatible?: boolean;
        captionsAvailable?: boolean;
        transcriptAvailable?: boolean;
    }>>;
    licensing: z.ZodObject<{
        type: z.ZodEnum<["cc0", "cc-by", "cc-by-sa", "proprietary", "internal"]>;
        attribution: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type?: "internal" | "cc0" | "cc-by" | "cc-by-sa" | "proprietary";
        attribution?: string;
    }, {
        type?: "internal" | "cc0" | "cc-by" | "cc-by-sa" | "proprietary";
        attribution?: string;
    }>;
}, "strip", z.ZodTypeAny, {
    version?: string;
    author?: {
        id?: string;
        name?: string;
        email?: string;
        reputation?: number;
    };
    lastUpdated?: Date;
    accessibility?: {
        screenReaderCompatible?: boolean;
        captionsAvailable?: boolean;
        transcriptAvailable?: boolean;
    };
    language?: string;
    licensing?: {
        type?: "internal" | "cc0" | "cc-by" | "cc-by-sa" | "proprietary";
        attribution?: string;
    };
}, {
    version?: string;
    author?: {
        id?: string;
        name?: string;
        email?: string;
        reputation?: number;
    };
    lastUpdated?: Date;
    accessibility?: {
        screenReaderCompatible?: boolean;
        captionsAvailable?: boolean;
        transcriptAvailable?: boolean;
    };
    language?: string;
    licensing?: {
        type?: "internal" | "cc0" | "cc-by" | "cc-by-sa" | "proprietary";
        attribution?: string;
    };
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
    progress?: number;
    userId?: string;
    rating?: number;
    score?: number;
    notes?: string;
    currentStep?: number;
    feedback?: string;
    timeSpent?: number;
    completedAt?: Date;
    tutorialId?: string;
    startedAt?: Date;
}, {
    progress?: number;
    userId?: string;
    rating?: number;
    score?: number;
    notes?: string;
    currentStep?: number;
    feedback?: string;
    timeSpent?: number;
    completedAt?: Date;
    tutorialId?: string;
    startedAt?: Date;
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
        description?: string;
        category?: string;
        tags?: string[];
        content?: string;
        title?: string;
        prerequisites?: string[];
        difficulty?: "advanced" | "expert" | "intermediate" | "beginner";
        estimatedDuration?: number;
        objectives?: string[];
    }, {
        description?: string;
        category?: string;
        tags?: string[];
        content?: string;
        title?: string;
        prerequisites?: string[];
        difficulty?: "advanced" | "expert" | "intermediate" | "beginner";
        estimatedDuration?: number;
        objectives?: string[];
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
            type?: "link" | "file" | "video" | "image";
            title?: string;
            url?: string;
        }, {
            type?: "link" | "file" | "video" | "image";
            title?: string;
            url?: string;
        }>, "many">>;
        validation: z.ZodOptional<z.ZodObject<{
            required: z.ZodDefault<z.ZodBoolean>;
            criteria: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            required?: boolean;
            criteria?: string[];
        }, {
            required?: boolean;
            criteria?: string[];
        }>>;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        validation?: {
            required?: boolean;
            criteria?: string[];
        };
        type?: "code" | "text" | "video" | "image" | "interactive" | "quiz";
        content?: string;
        title?: string;
        resources?: {
            type?: "link" | "file" | "video" | "image";
            title?: string;
            url?: string;
        }[];
        order?: number;
        estimatedTime?: number;
    }, {
        id?: string;
        validation?: {
            required?: boolean;
            criteria?: string[];
        };
        type?: "code" | "text" | "video" | "image" | "interactive" | "quiz";
        content?: string;
        title?: string;
        resources?: {
            type?: "link" | "file" | "video" | "image";
            title?: string;
            url?: string;
        }[];
        order?: number;
        estimatedTime?: number;
    }>, "many">;
    metadata: z.ZodObject<{
        author: z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            email: z.ZodString;
            reputation: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            id?: string;
            name?: string;
            email?: string;
            reputation?: number;
        }, {
            id?: string;
            name?: string;
            email?: string;
            reputation?: number;
        }>;
        version: z.ZodString;
        lastUpdated: z.ZodDate;
        language: z.ZodString;
        accessibility: z.ZodOptional<z.ZodObject<{
            screenReaderCompatible: z.ZodDefault<z.ZodBoolean>;
            captionsAvailable: z.ZodDefault<z.ZodBoolean>;
            transcriptAvailable: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            screenReaderCompatible?: boolean;
            captionsAvailable?: boolean;
            transcriptAvailable?: boolean;
        }, {
            screenReaderCompatible?: boolean;
            captionsAvailable?: boolean;
            transcriptAvailable?: boolean;
        }>>;
        licensing: z.ZodObject<{
            type: z.ZodEnum<["cc0", "cc-by", "cc-by-sa", "proprietary", "internal"]>;
            attribution: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            type?: "internal" | "cc0" | "cc-by" | "cc-by-sa" | "proprietary";
            attribution?: string;
        }, {
            type?: "internal" | "cc0" | "cc-by" | "cc-by-sa" | "proprietary";
            attribution?: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        version?: string;
        author?: {
            id?: string;
            name?: string;
            email?: string;
            reputation?: number;
        };
        lastUpdated?: Date;
        accessibility?: {
            screenReaderCompatible?: boolean;
            captionsAvailable?: boolean;
            transcriptAvailable?: boolean;
        };
        language?: string;
        licensing?: {
            type?: "internal" | "cc0" | "cc-by" | "cc-by-sa" | "proprietary";
            attribution?: string;
        };
    }, {
        version?: string;
        author?: {
            id?: string;
            name?: string;
            email?: string;
            reputation?: number;
        };
        lastUpdated?: Date;
        accessibility?: {
            screenReaderCompatible?: boolean;
            captionsAvailable?: boolean;
            transcriptAvailable?: boolean;
        };
        language?: string;
        licensing?: {
            type?: "internal" | "cc0" | "cc-by" | "cc-by-sa" | "proprietary";
            attribution?: string;
        };
    }>;
    settings: z.ZodObject<{
        isPublic: z.ZodDefault<z.ZodBoolean>;
        allowComments: z.ZodDefault<z.ZodBoolean>;
        requiresApproval: z.ZodDefault<z.ZodBoolean>;
        maxAttempts: z.ZodDefault<z.ZodNumber>;
        certificateEnabled: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        isPublic?: boolean;
        maxAttempts?: number;
        allowComments?: boolean;
        requiresApproval?: boolean;
        certificateEnabled?: boolean;
    }, {
        isPublic?: boolean;
        maxAttempts?: number;
        allowComments?: boolean;
        requiresApproval?: boolean;
        certificateEnabled?: boolean;
    }>;
    analytics: z.ZodOptional<z.ZodObject<{
        totalViews: z.ZodDefault<z.ZodNumber>;
        totalCompletions: z.ZodDefault<z.ZodNumber>;
        averageRating: z.ZodDefault<z.ZodNumber>;
        averageCompletionTime: z.ZodDefault<z.ZodNumber>;
        completionRate: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        totalViews?: number;
        completionRate?: number;
        averageRating?: number;
        totalCompletions?: number;
        averageCompletionTime?: number;
    }, {
        totalViews?: number;
        completionRate?: number;
        averageRating?: number;
        totalCompletions?: number;
        averageCompletionTime?: number;
    }>>;
    status: z.ZodDefault<z.ZodEnum<["draft", "review", "published", "archived", "suspended"]>>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    status?: "draft" | "published" | "review" | "archived" | "suspended";
    content?: {
        description?: string;
        category?: string;
        tags?: string[];
        content?: string;
        title?: string;
        prerequisites?: string[];
        difficulty?: "advanced" | "expert" | "intermediate" | "beginner";
        estimatedDuration?: number;
        objectives?: string[];
    };
    metadata?: {
        version?: string;
        author?: {
            id?: string;
            name?: string;
            email?: string;
            reputation?: number;
        };
        lastUpdated?: Date;
        accessibility?: {
            screenReaderCompatible?: boolean;
            captionsAvailable?: boolean;
            transcriptAvailable?: boolean;
        };
        language?: string;
        licensing?: {
            type?: "internal" | "cc0" | "cc-by" | "cc-by-sa" | "proprietary";
            attribution?: string;
        };
    };
    settings?: {
        isPublic?: boolean;
        maxAttempts?: number;
        allowComments?: boolean;
        requiresApproval?: boolean;
        certificateEnabled?: boolean;
    };
    steps?: {
        id?: string;
        validation?: {
            required?: boolean;
            criteria?: string[];
        };
        type?: "code" | "text" | "video" | "image" | "interactive" | "quiz";
        content?: string;
        title?: string;
        resources?: {
            type?: "link" | "file" | "video" | "image";
            title?: string;
            url?: string;
        }[];
        order?: number;
        estimatedTime?: number;
    }[];
    analytics?: {
        totalViews?: number;
        completionRate?: number;
        averageRating?: number;
        totalCompletions?: number;
        averageCompletionTime?: number;
    };
}, {
    id?: string;
    status?: "draft" | "published" | "review" | "archived" | "suspended";
    content?: {
        description?: string;
        category?: string;
        tags?: string[];
        content?: string;
        title?: string;
        prerequisites?: string[];
        difficulty?: "advanced" | "expert" | "intermediate" | "beginner";
        estimatedDuration?: number;
        objectives?: string[];
    };
    metadata?: {
        version?: string;
        author?: {
            id?: string;
            name?: string;
            email?: string;
            reputation?: number;
        };
        lastUpdated?: Date;
        accessibility?: {
            screenReaderCompatible?: boolean;
            captionsAvailable?: boolean;
            transcriptAvailable?: boolean;
        };
        language?: string;
        licensing?: {
            type?: "internal" | "cc0" | "cc-by" | "cc-by-sa" | "proprietary";
            attribution?: string;
        };
    };
    settings?: {
        isPublic?: boolean;
        maxAttempts?: number;
        allowComments?: boolean;
        requiresApproval?: boolean;
        certificateEnabled?: boolean;
    };
    steps?: {
        id?: string;
        validation?: {
            required?: boolean;
            criteria?: string[];
        };
        type?: "code" | "text" | "video" | "image" | "interactive" | "quiz";
        content?: string;
        title?: string;
        resources?: {
            type?: "link" | "file" | "video" | "image";
            title?: string;
            url?: string;
        }[];
        order?: number;
        estimatedTime?: number;
    }[];
    analytics?: {
        totalViews?: number;
        completionRate?: number;
        averageRating?: number;
        totalCompletions?: number;
        averageCompletionTime?: number;
    };
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
        id?: string;
        name?: string;
    }, {
        id?: string;
        name?: string;
    }>;
    isPublic: z.ZodDefault<z.ZodBoolean>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    description?: string;
    category?: string;
    author?: {
        id?: string;
        name?: string;
    };
    title?: string;
    isPublic?: boolean;
    prerequisites?: string[];
    difficulty?: "advanced" | "expert" | "intermediate" | "beginner";
    estimatedDuration?: number;
    tutorialIds?: string[];
}, {
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    description?: string;
    category?: string;
    author?: {
        id?: string;
        name?: string;
    };
    title?: string;
    isPublic?: boolean;
    prerequisites?: string[];
    difficulty?: "advanced" | "expert" | "intermediate" | "beginner";
    estimatedDuration?: number;
    tutorialIds?: string[];
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
            description?: string;
            category?: string;
            tags?: string[];
            content?: string;
            title?: string;
            prerequisites?: string[];
            difficulty?: "advanced" | "expert" | "intermediate" | "beginner";
            estimatedDuration?: number;
            objectives?: string[];
        }, {
            description?: string;
            category?: string;
            tags?: string[];
            content?: string;
            title?: string;
            prerequisites?: string[];
            difficulty?: "advanced" | "expert" | "intermediate" | "beginner";
            estimatedDuration?: number;
            objectives?: string[];
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
                type?: "link" | "file" | "video" | "image";
                title?: string;
                url?: string;
            }, {
                type?: "link" | "file" | "video" | "image";
                title?: string;
                url?: string;
            }>, "many">>;
            validation: z.ZodOptional<z.ZodObject<{
                required: z.ZodDefault<z.ZodBoolean>;
                criteria: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            }, "strip", z.ZodTypeAny, {
                required?: boolean;
                criteria?: string[];
            }, {
                required?: boolean;
                criteria?: string[];
            }>>;
        }, "strip", z.ZodTypeAny, {
            id?: string;
            validation?: {
                required?: boolean;
                criteria?: string[];
            };
            type?: "code" | "text" | "video" | "image" | "interactive" | "quiz";
            content?: string;
            title?: string;
            resources?: {
                type?: "link" | "file" | "video" | "image";
                title?: string;
                url?: string;
            }[];
            order?: number;
            estimatedTime?: number;
        }, {
            id?: string;
            validation?: {
                required?: boolean;
                criteria?: string[];
            };
            type?: "code" | "text" | "video" | "image" | "interactive" | "quiz";
            content?: string;
            title?: string;
            resources?: {
                type?: "link" | "file" | "video" | "image";
                title?: string;
                url?: string;
            }[];
            order?: number;
            estimatedTime?: number;
        }>, "many">;
        metadata: z.ZodObject<{
            author: z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                email: z.ZodString;
                reputation: z.ZodDefault<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                id?: string;
                name?: string;
                email?: string;
                reputation?: number;
            }, {
                id?: string;
                name?: string;
                email?: string;
                reputation?: number;
            }>;
            version: z.ZodString;
            lastUpdated: z.ZodDate;
            language: z.ZodString;
            accessibility: z.ZodOptional<z.ZodObject<{
                screenReaderCompatible: z.ZodDefault<z.ZodBoolean>;
                captionsAvailable: z.ZodDefault<z.ZodBoolean>;
                transcriptAvailable: z.ZodDefault<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                screenReaderCompatible?: boolean;
                captionsAvailable?: boolean;
                transcriptAvailable?: boolean;
            }, {
                screenReaderCompatible?: boolean;
                captionsAvailable?: boolean;
                transcriptAvailable?: boolean;
            }>>;
            licensing: z.ZodObject<{
                type: z.ZodEnum<["cc0", "cc-by", "cc-by-sa", "proprietary", "internal"]>;
                attribution: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                type?: "internal" | "cc0" | "cc-by" | "cc-by-sa" | "proprietary";
                attribution?: string;
            }, {
                type?: "internal" | "cc0" | "cc-by" | "cc-by-sa" | "proprietary";
                attribution?: string;
            }>;
        }, "strip", z.ZodTypeAny, {
            version?: string;
            author?: {
                id?: string;
                name?: string;
                email?: string;
                reputation?: number;
            };
            lastUpdated?: Date;
            accessibility?: {
                screenReaderCompatible?: boolean;
                captionsAvailable?: boolean;
                transcriptAvailable?: boolean;
            };
            language?: string;
            licensing?: {
                type?: "internal" | "cc0" | "cc-by" | "cc-by-sa" | "proprietary";
                attribution?: string;
            };
        }, {
            version?: string;
            author?: {
                id?: string;
                name?: string;
                email?: string;
                reputation?: number;
            };
            lastUpdated?: Date;
            accessibility?: {
                screenReaderCompatible?: boolean;
                captionsAvailable?: boolean;
                transcriptAvailable?: boolean;
            };
            language?: string;
            licensing?: {
                type?: "internal" | "cc0" | "cc-by" | "cc-by-sa" | "proprietary";
                attribution?: string;
            };
        }>;
        settings: z.ZodObject<{
            isPublic: z.ZodDefault<z.ZodBoolean>;
            allowComments: z.ZodDefault<z.ZodBoolean>;
            requiresApproval: z.ZodDefault<z.ZodBoolean>;
            maxAttempts: z.ZodDefault<z.ZodNumber>;
            certificateEnabled: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            isPublic?: boolean;
            maxAttempts?: number;
            allowComments?: boolean;
            requiresApproval?: boolean;
            certificateEnabled?: boolean;
        }, {
            isPublic?: boolean;
            maxAttempts?: number;
            allowComments?: boolean;
            requiresApproval?: boolean;
            certificateEnabled?: boolean;
        }>;
        analytics: z.ZodOptional<z.ZodObject<{
            totalViews: z.ZodDefault<z.ZodNumber>;
            totalCompletions: z.ZodDefault<z.ZodNumber>;
            averageRating: z.ZodDefault<z.ZodNumber>;
            averageCompletionTime: z.ZodDefault<z.ZodNumber>;
            completionRate: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            totalViews?: number;
            completionRate?: number;
            averageRating?: number;
            totalCompletions?: number;
            averageCompletionTime?: number;
        }, {
            totalViews?: number;
            completionRate?: number;
            averageRating?: number;
            totalCompletions?: number;
            averageCompletionTime?: number;
        }>>;
        status: z.ZodDefault<z.ZodEnum<["draft", "review", "published", "archived", "suspended"]>>;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        status?: "draft" | "published" | "review" | "archived" | "suspended";
        content?: {
            description?: string;
            category?: string;
            tags?: string[];
            content?: string;
            title?: string;
            prerequisites?: string[];
            difficulty?: "advanced" | "expert" | "intermediate" | "beginner";
            estimatedDuration?: number;
            objectives?: string[];
        };
        metadata?: {
            version?: string;
            author?: {
                id?: string;
                name?: string;
                email?: string;
                reputation?: number;
            };
            lastUpdated?: Date;
            accessibility?: {
                screenReaderCompatible?: boolean;
                captionsAvailable?: boolean;
                transcriptAvailable?: boolean;
            };
            language?: string;
            licensing?: {
                type?: "internal" | "cc0" | "cc-by" | "cc-by-sa" | "proprietary";
                attribution?: string;
            };
        };
        settings?: {
            isPublic?: boolean;
            maxAttempts?: number;
            allowComments?: boolean;
            requiresApproval?: boolean;
            certificateEnabled?: boolean;
        };
        steps?: {
            id?: string;
            validation?: {
                required?: boolean;
                criteria?: string[];
            };
            type?: "code" | "text" | "video" | "image" | "interactive" | "quiz";
            content?: string;
            title?: string;
            resources?: {
                type?: "link" | "file" | "video" | "image";
                title?: string;
                url?: string;
            }[];
            order?: number;
            estimatedTime?: number;
        }[];
        analytics?: {
            totalViews?: number;
            completionRate?: number;
            averageRating?: number;
            totalCompletions?: number;
            averageCompletionTime?: number;
        };
    }, {
        id?: string;
        status?: "draft" | "published" | "review" | "archived" | "suspended";
        content?: {
            description?: string;
            category?: string;
            tags?: string[];
            content?: string;
            title?: string;
            prerequisites?: string[];
            difficulty?: "advanced" | "expert" | "intermediate" | "beginner";
            estimatedDuration?: number;
            objectives?: string[];
        };
        metadata?: {
            version?: string;
            author?: {
                id?: string;
                name?: string;
                email?: string;
                reputation?: number;
            };
            lastUpdated?: Date;
            accessibility?: {
                screenReaderCompatible?: boolean;
                captionsAvailable?: boolean;
                transcriptAvailable?: boolean;
            };
            language?: string;
            licensing?: {
                type?: "internal" | "cc0" | "cc-by" | "cc-by-sa" | "proprietary";
                attribution?: string;
            };
        };
        settings?: {
            isPublic?: boolean;
            maxAttempts?: number;
            allowComments?: boolean;
            requiresApproval?: boolean;
            certificateEnabled?: boolean;
        };
        steps?: {
            id?: string;
            validation?: {
                required?: boolean;
                criteria?: string[];
            };
            type?: "code" | "text" | "video" | "image" | "interactive" | "quiz";
            content?: string;
            title?: string;
            resources?: {
                type?: "link" | "file" | "video" | "image";
                title?: string;
                url?: string;
            }[];
            order?: number;
            estimatedTime?: number;
        }[];
        analytics?: {
            totalViews?: number;
            completionRate?: number;
            averageRating?: number;
            totalCompletions?: number;
            averageCompletionTime?: number;
        };
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
        description?: string;
        category?: string;
        tags?: string[];
        content?: string;
        title?: string;
        prerequisites?: string[];
        difficulty?: "advanced" | "expert" | "intermediate" | "beginner";
        estimatedDuration?: number;
        objectives?: string[];
    }, {
        description?: string;
        category?: string;
        tags?: string[];
        content?: string;
        title?: string;
        prerequisites?: string[];
        difficulty?: "advanced" | "expert" | "intermediate" | "beginner";
        estimatedDuration?: number;
        objectives?: string[];
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
            type?: "link" | "file" | "video" | "image";
            title?: string;
            url?: string;
        }, {
            type?: "link" | "file" | "video" | "image";
            title?: string;
            url?: string;
        }>, "many">>;
        validation: z.ZodOptional<z.ZodObject<{
            required: z.ZodDefault<z.ZodBoolean>;
            criteria: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            required?: boolean;
            criteria?: string[];
        }, {
            required?: boolean;
            criteria?: string[];
        }>>;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        validation?: {
            required?: boolean;
            criteria?: string[];
        };
        type?: "code" | "text" | "video" | "image" | "interactive" | "quiz";
        content?: string;
        title?: string;
        resources?: {
            type?: "link" | "file" | "video" | "image";
            title?: string;
            url?: string;
        }[];
        order?: number;
        estimatedTime?: number;
    }, {
        id?: string;
        validation?: {
            required?: boolean;
            criteria?: string[];
        };
        type?: "code" | "text" | "video" | "image" | "interactive" | "quiz";
        content?: string;
        title?: string;
        resources?: {
            type?: "link" | "file" | "video" | "image";
            title?: string;
            url?: string;
        }[];
        order?: number;
        estimatedTime?: number;
    }>;
    tutorialMetadata: z.ZodObject<{
        author: z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            email: z.ZodString;
            reputation: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            id?: string;
            name?: string;
            email?: string;
            reputation?: number;
        }, {
            id?: string;
            name?: string;
            email?: string;
            reputation?: number;
        }>;
        version: z.ZodString;
        lastUpdated: z.ZodDate;
        language: z.ZodString;
        accessibility: z.ZodOptional<z.ZodObject<{
            screenReaderCompatible: z.ZodDefault<z.ZodBoolean>;
            captionsAvailable: z.ZodDefault<z.ZodBoolean>;
            transcriptAvailable: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            screenReaderCompatible?: boolean;
            captionsAvailable?: boolean;
            transcriptAvailable?: boolean;
        }, {
            screenReaderCompatible?: boolean;
            captionsAvailable?: boolean;
            transcriptAvailable?: boolean;
        }>>;
        licensing: z.ZodObject<{
            type: z.ZodEnum<["cc0", "cc-by", "cc-by-sa", "proprietary", "internal"]>;
            attribution: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            type?: "internal" | "cc0" | "cc-by" | "cc-by-sa" | "proprietary";
            attribution?: string;
        }, {
            type?: "internal" | "cc0" | "cc-by" | "cc-by-sa" | "proprietary";
            attribution?: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        version?: string;
        author?: {
            id?: string;
            name?: string;
            email?: string;
            reputation?: number;
        };
        lastUpdated?: Date;
        accessibility?: {
            screenReaderCompatible?: boolean;
            captionsAvailable?: boolean;
            transcriptAvailable?: boolean;
        };
        language?: string;
        licensing?: {
            type?: "internal" | "cc0" | "cc-by" | "cc-by-sa" | "proprietary";
            attribution?: string;
        };
    }, {
        version?: string;
        author?: {
            id?: string;
            name?: string;
            email?: string;
            reputation?: number;
        };
        lastUpdated?: Date;
        accessibility?: {
            screenReaderCompatible?: boolean;
            captionsAvailable?: boolean;
            transcriptAvailable?: boolean;
        };
        language?: string;
        licensing?: {
            type?: "internal" | "cc0" | "cc-by" | "cc-by-sa" | "proprietary";
            attribution?: string;
        };
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
        progress?: number;
        userId?: string;
        rating?: number;
        score?: number;
        notes?: string;
        currentStep?: number;
        feedback?: string;
        timeSpent?: number;
        completedAt?: Date;
        tutorialId?: string;
        startedAt?: Date;
    }, {
        progress?: number;
        userId?: string;
        rating?: number;
        score?: number;
        notes?: string;
        currentStep?: number;
        feedback?: string;
        timeSpent?: number;
        completedAt?: Date;
        tutorialId?: string;
        startedAt?: Date;
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
            id?: string;
            name?: string;
        }, {
            id?: string;
            name?: string;
        }>;
        isPublic: z.ZodDefault<z.ZodBoolean>;
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        createdAt?: Date;
        updatedAt?: Date;
        description?: string;
        category?: string;
        author?: {
            id?: string;
            name?: string;
        };
        title?: string;
        isPublic?: boolean;
        prerequisites?: string[];
        difficulty?: "advanced" | "expert" | "intermediate" | "beginner";
        estimatedDuration?: number;
        tutorialIds?: string[];
    }, {
        id?: string;
        createdAt?: Date;
        updatedAt?: Date;
        description?: string;
        category?: string;
        author?: {
            id?: string;
            name?: string;
        };
        title?: string;
        isPublic?: boolean;
        prerequisites?: string[];
        difficulty?: "advanced" | "expert" | "intermediate" | "beginner";
        estimatedDuration?: number;
        tutorialIds?: string[];
    }>;
};
export default TutorialDataAccess;
//# sourceMappingURL=TutorialDataModel.d.ts.map