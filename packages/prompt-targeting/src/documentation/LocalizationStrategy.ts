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
    popularLanguages: Array<{ language: string; requests: number }>;
    /** Regional distribution of users */
    regionDistribution: Record<string, number>;
  };
}

/**
 * Comprehensive localization strategy implementation for prompt targeting documentation
 */
export class DocumentationLocalizationStrategy {
  private config: LocalizationConfig;
  private translations: Map<string, DocumentationTranslation> = new Map();
  private culturalAdaptations: Map<string, CulturalAdaptation> = new Map();
  private metrics: LocalizationMetrics;

  constructor(config: LocalizationConfig) {
    this.config = config;
    this.metrics = this.initializeMetrics();
  }

  /**
   * Initialize default localization configuration
   */
  static createDefaultConfig(): LocalizationConfig {
    return {
      primaryLanguage: 'en',
      supportedLanguages: ['en', 'es', 'fr', 'de', 'ja', 'ko', 'zh', 'pt', 'ru', 'ar'],
      regionalVariants: {
        'en': ['en-US', 'en-GB', 'en-AU', 'en-CA'],
        'es': ['es-ES', 'es-MX', 'es-AR'],
        'fr': ['fr-FR', 'fr-CA', 'fr-BE'],
        'zh': ['zh-CN', 'zh-TW', 'zh-HK'],
        'pt': ['pt-BR', 'pt-PT'],
        'ar': ['ar-SA', 'ar-EG', 'ar-AE']
      },
      fallbackLanguage: 'en',
      translationFormat: 'json',
      rtlLanguages: ['ar', 'he', 'fa', 'ur']
    };
  }

  /**
   * Load translation for specific language
   */
  async loadTranslation(language: string): Promise<DocumentationTranslation> {
    if (this.translations.has(language)) {
      return this.translations.get(language)!;
    }

    try {
      // In a real implementation, this would load from translation files
      const translation = await this.fetchTranslationFromSource(language);
      this.translations.set(language, translation);
      return translation;
    } catch (error) {
      console.warn(`Failed to load translation for ${language}, falling back to ${this.config.fallbackLanguage}`);
      return this.loadTranslation(this.config.fallbackLanguage);
    }
  }

  /**
   * Get localized string with fallback support
   */
  async getLocalizedString(
    key: string, 
    language: string, 
    section: keyof DocumentationTranslation['content'] = 'api',
    interpolations?: Record<string, string>
  ): Promise<string> {
    try {
      const translation = await this.loadTranslation(language);
      let localizedString = translation.content[section][key];

      if (!localizedString && language !== this.config.fallbackLanguage) {
        // Fallback to primary language
        const fallbackTranslation = await this.loadTranslation(this.config.fallbackLanguage);
        localizedString = fallbackTranslation.content[section][key];
      }

      if (!localizedString) {
        console.warn(`Missing translation for key: ${key} in section: ${section}`);
        return key; // Return key as fallback
      }

      // Apply interpolations
      if (interpolations) {
        Object.entries(interpolations).forEach(([placeholder, value]) => {
          localizedString = localizedString.replace(new RegExp(`{{${placeholder}}}`, 'g'), value);
        });
      }

      return localizedString;
    } catch (error) {
      console.error(`Localization error for key ${key}:`, error);
      return key;
    }
  }

  /**
   * Load cultural adaptation for specific locale
   */
  async loadCulturalAdaptation(locale: string): Promise<CulturalAdaptation> {
    if (this.culturalAdaptations.has(locale)) {
      return this.culturalAdaptations.get(locale)!;
    }

    const adaptation = await this.fetchCulturalAdaptationFromSource(locale);
    this.culturalAdaptations.set(locale, adaptation);
    return adaptation;
  }

  /**
   * Get platform-specific prompt guidelines for a locale
   */
  async getPlatformGuidelines(locale: string, platform: string): Promise<string[]> {
    const adaptation = await this.loadCulturalAdaptation(locale);
    return adaptation.platformPreferences.considerations[platform] || [];
  }

  /**
   * Validate prompt content for cultural sensitivity
   */
  async validatePromptContent(content: string, locale: string): Promise<{
    isValid: boolean;
    warnings: string[];
    suggestions: string[];
  }> {
    const adaptation = await this.loadCulturalAdaptation(locale);
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Check for cultural restrictions
    for (const restriction of adaptation.promptGuidelines.restrictions) {
      if (content.toLowerCase().includes(restriction.toLowerCase())) {
        warnings.push(`Content may be culturally inappropriate: "${restriction}"`);
      }
    }

    // Check communication style
    const isFormal = this.detectFormalLanguage(content);
    if (adaptation.promptGuidelines.communicationStyle === 'formal' && !isFormal) {
      suggestions.push('Consider using more formal language for this locale');
    } else if (adaptation.promptGuidelines.communicationStyle === 'informal' && isFormal) {
      suggestions.push('Consider using more casual language for this locale');
    }

    return {
      isValid: warnings.length === 0,
      warnings,
      suggestions
    };
  }

  /**
   * Generate localized documentation bundle
   */
  async generateLocalizedDocumentation(language: string): Promise<{
    language: string;
    documentation: {
      apiReference: string;
      tutorials: string[];
      examples: Array<{ title: string; content: string; code: string }>;
      troubleshooting: string[];
    };
    metadata: {
      generatedAt: string;
      version: string;
      completionPercentage: number;
    };
  }> {
    const translation = await this.loadTranslation(language);
    const adaptation = await this.loadCulturalAdaptation(language);

    return {
      language,
      documentation: {
        apiReference: await this.generateLocalizedApiReference(language),
        tutorials: await this.generateLocalizedTutorials(language),
        examples: await this.generateLocalizedExamples(language, adaptation),
        troubleshooting: await this.generateLocalizedTroubleshooting(language)
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        version: translation.metadata.version,
        completionPercentage: translation.metadata.completionPercentage
      }
    };
  }

  /**
   * Update localization metrics
   */
  updateMetrics(language: string, section: string, action: 'view' | 'issue' | 'rating', value?: number): void {
    // Update usage statistics
    if (action === 'view') {
      const existingLang = this.metrics.usage.popularLanguages.find(l => l.language === language);
      if (existingLang) {
        existingLang.requests++;
      } else {
        this.metrics.usage.popularLanguages.push({ language, requests: 1 });
      }
    }

    // Update quality metrics
    if (action === 'issue') {
      this.metrics.quality.reportedIssues++;
    }

    if (action === 'rating' && value !== undefined) {
      const currentRating = this.metrics.quality.userRatings[language] || 0;
      this.metrics.quality.userRatings[language] = 
        currentRating === 0 ? value : (currentRating + value) / 2;
    }

    // Sort popular languages
    this.metrics.usage.popularLanguages.sort((a, b) => b.requests - a.requests);
  }

  /**
   * Get comprehensive localization report
   */
  generateLocalizationReport(): {
    summary: {
      totalLanguages: number;
      averageCompletion: number;
      topLanguages: string[];
      criticalIssues: number;
    };
    coverage: LocalizationMetrics['coverage'];
    quality: LocalizationMetrics['quality'];
    recommendations: string[];
  } {
    const totalLanguages = this.config.supportedLanguages.length;
    const averageCompletion = Object.values(this.metrics.coverage.byLanguage)
      .reduce((sum, completion) => sum + completion, 0) / totalLanguages;
    
    const topLanguages = this.metrics.usage.popularLanguages
      .slice(0, 5)
      .map(l => l.language);

    const criticalIssues = this.metrics.quality.reportedIssues + this.metrics.quality.pendingReviews;

    const recommendations: string[] = [];
    
    // Generate recommendations based on metrics
    if (averageCompletion < 80) {
      recommendations.push('Focus on completing translations for core languages (>80% completion target)');
    }
    
    if (criticalIssues > 10) {
      recommendations.push('Address pending translation reviews and reported issues');
    }

    const lowRatedLanguages = Object.entries(this.metrics.quality.userRatings)
      .filter(([_, rating]) => rating < 3.0)
      .map(([language]) => language);
    
    if (lowRatedLanguages.length > 0) {
      recommendations.push(`Improve translation quality for: ${lowRatedLanguages.join(', ')}`);
    }

    return {
      summary: {
        totalLanguages,
        averageCompletion: Math.round(averageCompletion * 100) / 100,
        topLanguages,
        criticalIssues
      },
      coverage: this.metrics.coverage,
      quality: this.metrics.quality,
      recommendations
    };
  }

  // Private helper methods

  private initializeMetrics(): LocalizationMetrics {
    return {
      coverage: {
        overall: 0,
        byLanguage: {},
        bySection: {}
      },
      quality: {
        pendingReviews: 0,
        reportedIssues: 0,
        userRatings: {}
      },
      usage: {
        popularLanguages: [],
        regionDistribution: {}
      }
    };
  }

  private async fetchTranslationFromSource(language: string): Promise<DocumentationTranslation> {
    // Mock implementation - in reality would fetch from translation management system
    return {
      language,
      metadata: {
        translatedBy: 'system',
        lastUpdated: new Date().toISOString(),
        completionPercentage: language === 'en' ? 100 : Math.random() * 100,
        version: '1.0.0'
      },
      content: {
        api: {},
        tutorials: {},
        messages: {},
        ui: {},
        examples: {}
      }
    };
  }

  private async fetchCulturalAdaptationFromSource(locale: string): Promise<CulturalAdaptation> {
    // Mock implementation with some default cultural adaptations
    const defaultAdaptations: Record<string, Partial<CulturalAdaptation>> = {
      'ja': {
        platformPreferences: {
          preferred: ['openai', 'claude'],
          restricted: [],
          considerations: {
            'openai': ['Use polite, formal language', 'Avoid direct criticism'],
            'midjourney': ['Respect traditional art styles', 'Be mindful of cultural symbols']
          }
        },
        promptGuidelines: {
          communicationStyle: 'formal',
          culturalSensitivity: ['Avoid direct confrontation', 'Use honorific language'],
          commonPatterns: ['はじめに', 'について', 'お願いします'],
          restrictions: ['controversial political topics']
        }
      },
      'ar': {
        platformPreferences: {
          preferred: ['openai', 'claude'],
          restricted: ['midjourney'], // Due to image generation restrictions
          considerations: {
            'openai': ['Use respectful language', 'Be mindful of religious content']
          }
        },
        promptGuidelines: {
          communicationStyle: 'formal',
          culturalSensitivity: ['Respect religious practices', 'Use appropriate greetings'],
          commonPatterns: ['بسم الله', 'إن شاء الله', 'جزاك الله خيرا'],
          restrictions: ['explicit content', 'alcohol references']
        }
      }
    };

    const base: CulturalAdaptation = {
      locale,
      platformPreferences: {
        preferred: ['openai', 'claude', 'midjourney'],
        restricted: [],
        considerations: {}
      },
      promptGuidelines: {
        communicationStyle: 'mixed',
        culturalSensitivity: [],
        commonPatterns: [],
        restrictions: []
      },
      formatting: {
        dateFormat: 'YYYY-MM-DD',
        numberFormat: '1,234.56',
        currencyFormat: '$1,234.56',
        timeFormat: '24h'
      }
    };

    return { ...base, ...defaultAdaptations[locale] } as CulturalAdaptation;
  }

  private detectFormalLanguage(content: string): boolean {
    const formalIndicators = ['please', 'kindly', 'would you', 'could you', 'thank you'];
    const informalIndicators = ['hey', 'yo', 'gonna', 'wanna', 'cool'];
    
    const formalCount = formalIndicators.filter(indicator => 
      content.toLowerCase().includes(indicator)
    ).length;
    
    const informalCount = informalIndicators.filter(indicator =>
      content.toLowerCase().includes(indicator) 
    ).length;

    return formalCount > informalCount;
  }

  private async generateLocalizedApiReference(language: string): Promise<string> {
    // Mock implementation
    return `API Reference (${language})`;
  }

  private async generateLocalizedTutorials(language: string): Promise<string[]> {
    // Mock implementation
    return [`Tutorial 1 (${language})`, `Tutorial 2 (${language})`];
  }

  private async generateLocalizedExamples(
    language: string, 
    adaptation: CulturalAdaptation
  ): Promise<Array<{ title: string; content: string; code: string }>> {
    // Mock implementation with culturally adapted examples
    return [
      {
        title: `Example 1 (${language})`,
        content: `Culturally adapted example for ${adaptation.locale}`,
        code: `// Example code (${language})`
      }
    ];
  }

  private async generateLocalizedTroubleshooting(language: string): Promise<string[]> {
    // Mock implementation
    return [`Troubleshooting item 1 (${language})`];
  }
}

/**
 * Default localization strategy instance
 */
export 
/**
 * Utility functions for localization
 */
export     }
    return 'en';
  },

  /**
   * Format text for RTL languages
   */
  formatTextForRTL(text: string, language: string, config: LocalizationConfig): string {
    if (config.rtlLanguages.includes(language)) {
      return `\u202E${text}\u202C`; // Right-to-left override
    }
    return text;
  },

  /**
   * Validate language code format
   */
  isValidLanguageCode(code: string): boolean {
    const iso639Pattern = /^[a-z]{2}(-[A-Z]{2})?$/;
    return iso639Pattern.test(code);
  },

  /**
   * Get language display name
   */
  getLanguageDisplayName(code: string): string {
    const names: Record<string, string> = {
      'en': 'English',
      'es': 'Español',
      'fr': 'Français',
      'de': 'Deutsch',
      'ja': '日本語',
      'ko': '한국어',
      'zh': '中文',
      'pt': 'Português',
      'ru': 'Русский',
      'ar': 'العربية'
    };
    return names[code] || code;
  }
};

export default DocumentationLocalizationStrategy;