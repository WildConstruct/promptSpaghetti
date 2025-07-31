/**
 * Localization Strategy for Prompt Targeting Documentation
 * Epic 10.2.6 - Documentation System
 *
 * Provides comprehensive internationalization (i18n) strategy for prompt targeting
 * system documentation, including multi-language support, cultural adaptations,
 * and region-specific prompt optimization guidelines.
 */
/**
 * Comprehensive localization strategy implementation for prompt targeting documentation
 */
export class DocumentationLocalizationStrategy {
  config;
  translations = new Map();
  culturalAdaptations = new Map();
  metrics;
  constructor(config) {
    this.config = config;
    this.metrics = this.initializeMetrics();
  }
  /**
   * Initialize default localization configuration
   */
  static createDefaultConfig() {
    return {
      primaryLanguage: 'en',
      supportedLanguages: ['en', 'es', 'fr', 'de', 'ja', 'ko', 'zh', 'pt', 'ru', 'ar'],
      regionalVariants: {
        en: ['en-US', 'en-GB', 'en-AU', 'en-CA'],
        es: ['es-ES', 'es-MX', 'es-AR'],
        fr: ['fr-FR', 'fr-CA', 'fr-BE'],
        zh: ['zh-CN', 'zh-TW', 'zh-HK'],
        pt: ['pt-BR', 'pt-PT'],
        ar: ['ar-SA', 'ar-EG', 'ar-AE'],
      },
      fallbackLanguage: 'en',
      translationFormat: 'json',
      rtlLanguages: ['ar', 'he', 'fa', 'ur'],
    };
  }
  /**
   * Load translation for specific language
   */
  async loadTranslation(language) {
    if (this.translations.has(language)) {
      return this.translations.get(language);
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
  async getLocalizedString(key, language, section = 'api', interpolations) {
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
  async loadCulturalAdaptation(locale) {
    if (this.culturalAdaptations.has(locale)) {
      return this.culturalAdaptations.get(locale);
    }
    const adaptation = await this.fetchCulturalAdaptationFromSource(locale);
    this.culturalAdaptations.set(locale, adaptation);
    return adaptation;
  }
  /**
   * Get platform-specific prompt guidelines for a locale
   */
  async getPlatformGuidelines(locale, platform) {
    const adaptation = await this.loadCulturalAdaptation(locale);
    return adaptation.platformPreferences.considerations[platform] || [];
  }
  /**
   * Validate prompt content for cultural sensitivity
   */
  async validatePromptContent(content, locale) {
    const adaptation = await this.loadCulturalAdaptation(locale);
    const warnings = [];
    const suggestions = [];
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
      suggestions,
    };
  }
  /**
   * Generate localized documentation bundle
   */
  async generateLocalizedDocumentation(language) {
    const translation = await this.loadTranslation(language);
    const adaptation = await this.loadCulturalAdaptation(language);
    return {
      language,
      documentation: {
        apiReference: await this.generateLocalizedApiReference(language),
        tutorials: await this.generateLocalizedTutorials(language),
        examples: await this.generateLocalizedExamples(language, adaptation),
        troubleshooting: await this.generateLocalizedTroubleshooting(language),
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        version: translation.metadata.version,
        completionPercentage: translation.metadata.completionPercentage,
      },
    };
  }
  /**
   * Update localization metrics
   */
  updateMetrics(language, section, action, value) {
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
      this.metrics.quality.userRatings[language] = currentRating === 0 ? value : (currentRating + value) / 2;
    }
    // Sort popular languages
    this.metrics.usage.popularLanguages.sort((a, b) => b.requests - a.requests);
  }
  /**
   * Get comprehensive localization report
   */
  generateLocalizationReport() {
    const totalLanguages = this.config.supportedLanguages.length;
    const averageCompletion =
      Object.values(this.metrics.coverage.byLanguage).reduce((sum, completion) => sum + completion, 0) / totalLanguages;
    const topLanguages = this.metrics.usage.popularLanguages.slice(0, 5).map(l => l.language);
    const criticalIssues = this.metrics.quality.reportedIssues + this.metrics.quality.pendingReviews;
    const recommendations = [];
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
        criticalIssues,
      },
      coverage: this.metrics.coverage,
      quality: this.metrics.quality,
      recommendations,
    };
  }
  // Private helper methods
  initializeMetrics() {
    return {
      coverage: {
        overall: 0,
        byLanguage: {},
        bySection: {},
      },
      quality: {
        pendingReviews: 0,
        reportedIssues: 0,
        userRatings: {},
      },
      usage: {
        popularLanguages: [],
        regionDistribution: {},
      },
    };
  }
  async fetchTranslationFromSource(language) {
    // Mock implementation - in reality would fetch from translation management system
    return {
      language,
      metadata: {
        translatedBy: 'system',
        lastUpdated: new Date().toISOString(),
        completionPercentage: language === 'en' ? 100 : Math.random() * 100,
        version: '1.0.0',
      },
      content: {
        api: {},
        tutorials: {},
        messages: {},
        ui: {},
        examples: {},
      },
    };
  }
  async fetchCulturalAdaptationFromSource(locale) {
    // Mock implementation with some default cultural adaptations
    const defaultAdaptations = {
      ja: {
        platformPreferences: {
          preferred: ['openai', 'claude'],
          restricted: [],
          considerations: {
            openai: ['Use polite, formal language', 'Avoid direct criticism'],
            midjourney: ['Respect traditional art styles', 'Be mindful of cultural symbols'],
          },
        },
        promptGuidelines: {
          communicationStyle: 'formal',
          culturalSensitivity: ['Avoid direct confrontation', 'Use honorific language'],
          commonPatterns: ['はじめに', 'について', 'お願いします'],
          restrictions: ['controversial political topics'],
        },
      },
      ar: {
        platformPreferences: {
          preferred: ['openai', 'claude'],
          restricted: ['midjourney'], // Due to image generation restrictions
          considerations: {
            openai: ['Use respectful language', 'Be mindful of religious content'],
          },
        },
        promptGuidelines: {
          communicationStyle: 'formal',
          culturalSensitivity: ['Respect religious practices', 'Use appropriate greetings'],
          commonPatterns: ['بسم الله', 'إن شاء الله', 'جزاك الله خيرا'],
          restrictions: ['explicit content', 'alcohol references'],
        },
      },
    };
    const base = {
      locale,
      platformPreferences: {
        preferred: ['openai', 'claude', 'midjourney'],
        restricted: [],
        considerations: {},
      },
      promptGuidelines: {
        communicationStyle: 'mixed',
        culturalSensitivity: [],
        commonPatterns: [],
        restrictions: [],
      },
      formatting: {
        dateFormat: 'YYYY-MM-DD',
        numberFormat: '1,234.56',
        currencyFormat: '$1,234.56',
        timeFormat: '24h',
      },
    };
    return { ...base, ...defaultAdaptations[locale] };
  }
  detectFormalLanguage(content) {
    const formalIndicators = ['please', 'kindly', 'would you', 'could you', 'thank you'];
    const informalIndicators = ['hey', 'yo', 'gonna', 'wanna', 'cool'];
    const formalCount = formalIndicators.filter(indicator => content.toLowerCase().includes(indicator)).length;
    const informalCount = informalIndicators.filter(indicator => content.toLowerCase().includes(indicator)).length;
    return formalCount > informalCount;
  }
  async generateLocalizedApiReference(language) {
    // Mock implementation
    return `API Reference (${language})`;
  }
  async generateLocalizedTutorials(language) {
    // Mock implementation
    return [`Tutorial 1 (${language})`, `Tutorial 2 (${language})`];
  }
  async generateLocalizedExamples(language, adaptation) {
    // Mock implementation with culturally adapted examples
    return [
      {
        title: `Example 1 (${language})`,
        content: `Culturally adapted example for ${adaptation.locale}`,
        code: `// Example code (${language})`,
      },
    ];
  }
  async generateLocalizedTroubleshooting(language) {
    // Mock implementation
    return [`Troubleshooting item 1 (${language})`];
  }
}
/**
 * Default localization strategy instance
 */
export const defaultLocalizationStrategy = new DocumentationLocalizationStrategy(
  DocumentationLocalizationStrategy.createDefaultConfig()
);
/**
 * Utility functions for localization
 */
export const LocalizationUtils = {
  /**
   * Detect user's preferred language from browser/environment
   */
  detectUserLanguage() {
    if (typeof navigator !== 'undefined') {
      return navigator.language.split('-')[0];
    }
    return 'en';
  },
  /**
   * Format text for RTL languages
   */
  formatTextForRTL(text, language, config) {
    if (config.rtlLanguages.includes(language)) {
      return `\u202E${text}\u202C`; // Right-to-left override
    }
    return text;
  },
  /**
   * Validate language code format
   */
  isValidLanguageCode(code) {
    const iso639Pattern = /^[a-z]{2}(-[A-Z]{2})?$/;
    return iso639Pattern.test(code);
  },
  /**
   * Get language display name
   */
  getLanguageDisplayName(code) {
    const names = {
      en: 'English',
      es: 'Español',
      fr: 'Français',
      de: 'Deutsch',
      ja: '日本語',
      ko: '한국어',
      zh: '中文',
      pt: 'Português',
      ru: 'Русский',
      ar: 'العربية',
    };
    return names[code] || code;
  },
};
export default DocumentationLocalizationStrategy;
//# sourceMappingURL=LocalizationStrategy.js.map
