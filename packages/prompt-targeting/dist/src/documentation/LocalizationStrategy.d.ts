/**
 * Localization Strategy for Prompt Targeting Documentation
 * Epic 10.2.6 - Documentation System
 *
 * Provides comprehensive internationalization (i18n) strategy for prompt targeting
 * system documentation, including multi-language support, cultural adaptations,
 * and region-specific prompt optimization guidelines.
 */
export interface LocalizationConfig {
    /** Primary language code (ISO 639-1) */
    primaryLanguage: string;
    /** Supported language codes */
    supportedLanguages: string[];
    /** Regional variants (e.g., en-US, en-GB, fr-CA) */
    regionalVariants: Record<string, string[]>;
    /** Default fallback language when translation missing */
    fallbackLanguage: string;
    /** Translation file format preference */
    translationFormat: 'json' | 'yaml' | 'po' | 'xliff';
    /** Right-to-left language support */
    rtlLanguages: string[];
}
export interface DocumentationTranslation {
    /** Language code */
    language: string;
    /** Translation metadata */
    metadata: {
        translatedBy: string;
        reviewedBy?: string;
        lastUpdated: string;
        completionPercentage: number;
        version: string;
    };
    /** Translated content sections */
    content: {
        /** API documentation strings */
        api: Record<string, string>;
        /** Tutorial content */
        tutorials: Record<string, string>;
        /** Error messages and warnings */
        messages: Record<string, string>;
        /** UI labels and buttons */
        ui: Record<string, string>;
        /** Example prompts and descriptions */
        examples: Record<string, string>;
    };
}
export interface CulturalAdaptation {
    /** Language/region code */
    locale: string;
    /** Platform preferences by region */
    platformPreferences: {
        /** Preferred AI platforms in this region */
        preferred: string[];
        /** Restricted or unavailable platforms */
        restricted: string[];
        /** Cultural considerations for each platform */
        considerations: Record<string, string[]>;
    };
    /** Prompt style guidelines for the culture */
    promptGuidelines: {
        /** Preferred communication style (formal/informal) */
        communicationStyle: 'formal' | 'informal' | 'mixed';
        /** Cultural sensitivity guidelines */
        culturalSensitivity: string[];
        /** Common prompt patterns and structures */
        commonPatterns: string[];
        /** Taboo topics and restrictions */
        restrictions: string[];
    };
    /** Date, number, and currency formatting */
    formatting: {
        dateFormat: string;
        numberFormat: string;
        currencyFormat: string;
        timeFormat: '12h' | '24h';
    };
}
export interface LocalizationMetrics {
    /** Translation coverage statistics */
    coverage: {
        /** Overall completion percentage */
        overall: number;
        /** Per-language completion percentages */
        byLanguage: Record<string, number>;
        /** Per-section completion percentages */
        bySection: Record<string, number>;
    };
    /** Quality metrics */
    quality: {
        /** Number of pending review items */
        pendingReviews: number;
        /** Number of reported translation issues */
        reportedIssues: number;
        /** Average user rating per language */
        userRatings: Record<string, number>;
    };
    /** Usage statistics */
    usage: {
        /** Most requested languages */
        popularLanguages: Array<{
            language: string;
            requests: number;
        }>;
        /** Regional distribution of users */
        regionDistribution: Record<string, number>;
    };
}
/**
 * Comprehensive localization strategy implementation for prompt targeting documentation
 */
export declare class DocumentationLocalizationStrategy {
    private config;
    private translations;
    private culturalAdaptations;
    private metrics;
    constructor(config: LocalizationConfig);
    /**
     * Initialize default localization configuration
     */
    static createDefaultConfig(): LocalizationConfig;
}
//# sourceMappingURL=LocalizationStrategy.d.ts.map