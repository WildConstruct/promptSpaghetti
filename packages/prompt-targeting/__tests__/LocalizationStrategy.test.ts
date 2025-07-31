/**
 * Unit tests for DocumentationLocalizationStrategy
 * Epic 10.2.6 - Documentation System - Localization Strategy
 */

import {
  DocumentationLocalizationStrategy,
  LocalizationConfig,
  DocumentationTranslation,
  CulturalAdaptation,
  LocalizationUtils,
  defaultLocalizationStrategy,
} from '../src/documentation/LocalizationStrategy';

describe('DocumentationLocalizationStrategy', () => {
  let strategy: DocumentationLocalizationStrategy;
  let config: LocalizationConfig;

  beforeEach(() => {
    config = DocumentationLocalizationStrategy.createDefaultConfig();
    strategy = new DocumentationLocalizationStrategy(config);
  });

  describe('Configuration Management', () => {
    it('creates default configuration correctly', () => {
      const defaultConfig = DocumentationLocalizationStrategy.createDefaultConfig();

      expect(defaultConfig.primaryLanguage).toBe('en');
      expect(defaultConfig.supportedLanguages).toContain('en');
      expect(defaultConfig.supportedLanguages).toContain('es');
      expect(defaultConfig.supportedLanguages).toContain('ja');
      expect(defaultConfig.fallbackLanguage).toBe('en');
      expect(defaultConfig.translationFormat).toBe('json');
      expect(defaultConfig.rtlLanguages).toContain('ar');
    });

    it('handles regional variants correctly', () => {
      expect(config.regionalVariants['en']).toContain('en-US');
      expect(config.regionalVariants['en']).toContain('en-GB');
      expect(config.regionalVariants['zh']).toContain('zh-CN');
      expect(config.regionalVariants['zh']).toContain('zh-TW');
    });

    it('identifies RTL languages correctly', () => {
      expect(config.rtlLanguages).toContain('ar');
      expect(config.rtlLanguages).toContain('he');
      expect(config.rtlLanguages).not.toContain('en');
      expect(config.rtlLanguages).not.toContain('es');
    });
  });

  describe('Translation Loading', () => {
    it('loads translation for supported language', async () => {
      const translation = await strategy.loadTranslation('es');

      expect(translation).toBeDefined();
      expect(translation.language).toBe('es');
      expect(translation.metadata).toBeDefined();
      expect(translation.content).toBeDefined();
      expect(translation.content.api).toBeDefined();
      expect(translation.content.tutorials).toBeDefined();
    });

    it('falls back to primary language for unsupported language', async () => {
      // Mock console.warn to avoid test output noise
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Mock the fetchTranslationFromSource to simulate failure for 'xyz' but success for fallback
      const originalFetch = (strategy as any).fetchTranslationFromSource;
      (strategy as any).fetchTranslationFromSource = jest
        .fn<unknown[], unknown>()
        .mockImplementation((language: string) => {
          if (language === 'xyz') {
            throw new Error('Translation not found');
          }
          return originalFetch.call(strategy, language);
        });

      const translation = await strategy.loadTranslation('xyz');

      expect(translation.language).toBe('en'); // Should fallback to English
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Failed to load translation for xyz'));

      consoleSpy.mockRestore();
    });

    it('caches loaded translations', async () => {
      const translation1 = await strategy.loadTranslation('fr');
      const translation2 = await strategy.loadTranslation('fr');

      expect(translation1).toBe(translation2); // Should be same instance from cache
    });
  });

  describe('String Localization', () => {
    it('gets localized string successfully', async () => {
      const result = await strategy.getLocalizedString('test.key', 'en', 'api');

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('applies interpolations correctly', async () => {
      // Mock a translation with interpolation
      const mockTranslation: DocumentationTranslation = {
        language: 'en',
        metadata: {
          translatedBy: 'test',
          lastUpdated: new Date().toISOString(),
          completionPercentage: 100,
          version: '1.0.0',
        },
        content: {
          api: { greeting: 'Hello {{name}}, welcome to {{platform}}!' },
          tutorials: {},
          messages: {},
          ui: {},
          examples: {},
        },
      };

      // Temporarily override the private method for testing
      (strategy as any).fetchTranslationFromSource = jest
        .fn<unknown[], unknown>()
        .mockResolvedValue(mockTranslation as unknown);

      const result = await strategy.getLocalizedString('greeting', 'en', 'api', { name: 'John', platform: 'OpenAI' });

      expect(result).toBe('Hello John, welcome to OpenAI!');
    });

    it('falls back to key when translation missing', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const result = await strategy.getLocalizedString('missing.key', 'en', 'api');

      expect(result).toBe('missing.key');
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Missing translation for key: missing.key'));

      consoleSpy.mockRestore();
    });

    it('handles localization errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Force an error by overriding the method
      (strategy as any).loadTranslation = jest.fn<unknown[], unknown>().mockRejectedValue(new Error('Test error'));

      const result = await strategy.getLocalizedString('test.key', 'en', 'api');

      expect(result).toBe('test.key'); // Should return key as fallback
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('Cultural Adaptation', () => {
    it('loads cultural adaptation for locale', async () => {
      const adaptation = await strategy.loadCulturalAdaptation('ja');

      expect(adaptation).toBeDefined();
      expect(adaptation.locale).toBe('ja');
      expect(adaptation.platformPreferences).toBeDefined();
      expect(adaptation.promptGuidelines).toBeDefined();
      expect(adaptation.formatting).toBeDefined();
    });

    it('provides Japanese cultural adaptation correctly', async () => {
      const adaptation = await strategy.loadCulturalAdaptation('ja');

      expect(adaptation.promptGuidelines.communicationStyle).toBe('formal');
      expect(adaptation.promptGuidelines.culturalSensitivity).toContain('Avoid direct confrontation');
      expect(adaptation.platformPreferences.preferred).toContain('openai');
    });

    it('provides Arabic cultural adaptation correctly', async () => {
      const adaptation = await strategy.loadCulturalAdaptation('ar');

      expect(adaptation.promptGuidelines.communicationStyle).toBe('formal');
      expect(adaptation.promptGuidelines.restrictions).toContain('explicit content');
      expect(adaptation.platformPreferences.considerations.openai).toContain('Use respectful language');
    });

    it('gets platform-specific guidelines', async () => {
      const guidelines = await strategy.getPlatformGuidelines('ja', 'openai');

      expect(Array.isArray(guidelines)).toBe(true);
      expect(guidelines).toContain('Use polite, formal language');
    });

    it('returns empty array for unknown platform', async () => {
      const guidelines = await strategy.getPlatformGuidelines('en', 'unknown-platform');

      expect(Array.isArray(guidelines)).toBe(true);
      expect(guidelines.length).toBe(0);
    });
  });

  describe('Content Validation', () => {
    it('validates appropriate content successfully', async () => {
      const result = await strategy.validatePromptContent('Please generate a polite response about technology', 'ja');

      expect(result.isValid).toBe(true);
      expect(Array.isArray(result.warnings)).toBe(true);
      expect(Array.isArray(result.suggestions)).toBe(true);
    });

    it('detects culturally inappropriate content', async () => {
      const result = await strategy.validatePromptContent('This content contains controversial political topics', 'ja');

      expect(result.isValid).toBe(false);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('culturally inappropriate');
    });

    it('provides communication style suggestions', async () => {
      const result = await strategy.validatePromptContent('Hey, can you do this thing for me?', 'ja');

      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(result.suggestions[0]).toContain('formal language');
    });
  });

  describe('Documentation Generation', () => {
    it('generates localized documentation bundle', async () => {
      const bundle = await strategy.generateLocalizedDocumentation('es');

      expect(bundle).toBeDefined();
      expect(bundle.language).toBe('es');
      expect(bundle.documentation).toBeDefined();
      expect(bundle.documentation.apiReference).toBeDefined();
      expect(Array.isArray(bundle.documentation.tutorials)).toBe(true);
      expect(Array.isArray(bundle.documentation.examples)).toBe(true);
      expect(Array.isArray(bundle.documentation.troubleshooting)).toBe(true);
      expect(bundle.metadata).toBeDefined();
      expect(bundle.metadata.generatedAt).toBeDefined();
    });

    it('includes version and completion information', async () => {
      const bundle = await strategy.generateLocalizedDocumentation('fr');

      expect(bundle.metadata.version).toBeDefined();
      expect(typeof bundle.metadata.completionPercentage).toBe('number');
      expect(bundle.metadata.completionPercentage).toBeGreaterThanOrEqual(0);
      expect(bundle.metadata.completionPercentage).toBeLessThanOrEqual(100);
    });
  });

  describe('Metrics Management', () => {
    it('updates view metrics correctly', () => {
      strategy.updateMetrics('es', 'api', 'view');
      strategy.updateMetrics('es', 'api', 'view');
      strategy.updateMetrics('fr', 'api', 'view');

      const report = strategy.generateLocalizationReport();

      expect(report.summary.topLanguages).toContain('es');
      expect(report.summary.topLanguages).toContain('fr');
    });

    it('updates issue metrics correctly', () => {
      strategy.updateMetrics('en', 'api', 'issue');
      strategy.updateMetrics('es', 'tutorials', 'issue');

      const report = strategy.generateLocalizationReport();

      expect(report.quality.reportedIssues).toBe(2);
    });

    it('updates rating metrics correctly', () => {
      strategy.updateMetrics('en', 'api', 'rating', 4.5);
      strategy.updateMetrics('en', 'api', 'rating', 3.5);

      const report = strategy.generateLocalizationReport();

      // First rating: 4.5 (since currentRating === 0)
      // Second rating: (4.5 + 3.5) / 2 = 4.0
      expect(report.quality.userRatings['en']).toBeCloseTo(4.0, 1);
    });

    it('generates comprehensive localization report', () => {
      // Add some metrics
      strategy.updateMetrics('en', 'api', 'view');
      strategy.updateMetrics('es', 'api', 'view');
      strategy.updateMetrics('en', 'api', 'rating', 4.0);
      strategy.updateMetrics('es', 'api', 'issue');

      const report = strategy.generateLocalizationReport();

      expect(report.summary).toBeDefined();
      expect(report.summary.totalLanguages).toBe(config.supportedLanguages.length);
      expect(report.summary.topLanguages).toBeDefined();
      expect(report.coverage).toBeDefined();
      expect(report.quality).toBeDefined();
      expect(Array.isArray(report.recommendations)).toBe(true);
    });

    it('provides relevant recommendations', () => {
      // Simulate low completion rate by adding issue
      for (let i = 0; i < 15; i++) {
        strategy.updateMetrics('en', 'api', 'issue');
      }

      const report = strategy.generateLocalizationReport();

      expect(report.recommendations.length).toBeGreaterThan(0);
      expect(report.recommendations.some(r => r.includes('pending translation reviews'))).toBe(true);
    });
  });

  describe('Default Instance', () => {
    it('provides working default localization strategy', async () => {
      expect(defaultLocalizationStrategy).toBeDefined();

      const translation = await defaultLocalizationStrategy.loadTranslation('en');
      expect(translation).toBeDefined();

      const adaptation = await defaultLocalizationStrategy.loadCulturalAdaptation('en');
      expect(adaptation).toBeDefined();
    });
  });
});

describe('LocalizationUtils', () => {
  describe('Language Detection', () => {
    it('detects user language from navigator', () => {
      // Mock navigator
      Object.defineProperty(global, 'navigator', {
        value: { language: 'es-ES' },
        writable: true,
      });

      const language = LocalizationUtils.detectUserLanguage();
      expect(language).toBe('es');
    });

    it('falls back to English when navigator unavailable', () => {
      // Remove navigator
      Object.defineProperty(global, 'navigator', {
        value: undefined,
        writable: true,
      });

      const language = LocalizationUtils.detectUserLanguage();
      expect(language).toBe('en');
    });
  });

  describe('RTL Text Formatting', () => {
    it('formats text for RTL languages', () => {
      const config = DocumentationLocalizationStrategy.createDefaultConfig();
      const text = 'Hello World';

      const rtlText = LocalizationUtils.formatTextForRTL(text, 'ar', config);
      expect(rtlText).toContain('\u202E'); // RTL override character
      expect(rtlText).toContain(text);
    });

    it('does not format text for LTR languages', () => {
      const config = DocumentationLocalizationStrategy.createDefaultConfig();
      const text = 'Hello World';

      const ltrText = LocalizationUtils.formatTextForRTL(text, 'en', config);
      expect(ltrText).toBe(text); // Should be unchanged
    });
  });

  describe('Language Code Validation', () => {
    it('validates correct language codes', () => {
      expect(LocalizationUtils.isValidLanguageCode('en')).toBe(true);
      expect(LocalizationUtils.isValidLanguageCode('es')).toBe(true);
      expect(LocalizationUtils.isValidLanguageCode('en-US')).toBe(true);
      expect(LocalizationUtils.isValidLanguageCode('zh-CN')).toBe(true);
    });

    it('rejects invalid language codes', () => {
      expect(LocalizationUtils.isValidLanguageCode('eng')).toBe(false);
      expect(LocalizationUtils.isValidLanguageCode('en-us')).toBe(false); // lowercase region
      expect(LocalizationUtils.isValidLanguageCode('EN')).toBe(false); // uppercase language
      expect(LocalizationUtils.isValidLanguageCode('123')).toBe(false);
      expect(LocalizationUtils.isValidLanguageCode('')).toBe(false);
    });
  });

  describe('Language Display Names', () => {
    it('returns correct display names for supported languages', () => {
      expect(LocalizationUtils.getLanguageDisplayName('en')).toBe('English');
      expect(LocalizationUtils.getLanguageDisplayName('es')).toBe('Español');
      expect(LocalizationUtils.getLanguageDisplayName('fr')).toBe('Français');
      expect(LocalizationUtils.getLanguageDisplayName('ja')).toBe('日本語');
      expect(LocalizationUtils.getLanguageDisplayName('ar')).toBe('العربية');
    });

    it('returns code for unknown languages', () => {
      expect(LocalizationUtils.getLanguageDisplayName('xyz')).toBe('xyz');
      expect(LocalizationUtils.getLanguageDisplayName('unknown')).toBe('unknown');
    });
  });
});

describe('Integration Tests', () => {
  it('completes full localization workflow', async () => {
    const strategy = new DocumentationLocalizationStrategy(DocumentationLocalizationStrategy.createDefaultConfig());

    // Load translation
    const translation = await strategy.loadTranslation('es');
    expect(translation.language).toBe('es');

    // Load cultural adaptation
    const adaptation = await strategy.loadCulturalAdaptation('es');
    expect(adaptation.locale).toBe('es');

    // Validate content
    const validation = await strategy.validatePromptContent('Por favor, genere una respuesta educada', 'es');
    expect(validation).toBeDefined();

    // Generate documentation
    const documentation = await strategy.generateLocalizedDocumentation('es');
    expect(documentation.language).toBe('es');

    // Update and check metrics
    strategy.updateMetrics('es', 'api', 'view');
    const report = strategy.generateLocalizationReport();
    expect(report.summary.topLanguages).toContain('es');
  });

  it('handles multiple languages simultaneously', async () => {
    const strategy = new DocumentationLocalizationStrategy(DocumentationLocalizationStrategy.createDefaultConfig());

    const languages = ['en', 'es', 'fr', 'ja'];
    const translations = await Promise.all(languages.map(lang => strategy.loadTranslation(lang)));

    expect(translations).toHaveLength(4);
    translations.forEach((translation, index) => {
      expect(translation.language).toBe(languages[index]);
    });

    const adaptations = await Promise.all(languages.map(lang => strategy.loadCulturalAdaptation(lang)));

    expect(adaptations).toHaveLength(4);
    adaptations.forEach((adaptation, index) => {
      expect(adaptation.locale).toBe(languages[index]);
    });
  });
});
