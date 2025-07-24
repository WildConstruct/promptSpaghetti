/**
 * Configuration system tests
 * Epic 10.2.2 - Configuration System Testing
 */

import { ConfigurationManager, GlobalConfigSchema } from '../src/config/ConfigurationManager';

describe('Configuration System', () => {
  let configManager: ConfigurationManager;

  beforeEach(() => {
    configManager = new ConfigurationManager();
  });

  describe('ConfigurationManager', () => {
    test('should initialize with default configuration', () => {
      const config = configManager.getConfig();
      
      expect(config.qualityPreference).toBe(0.7);
      expect(config.stylePreference).toBe('default');
      expect(config.enableOptimizations).toBe(true);
      expect(config.platformOverrides).toEqual({});
    });

    test('should initialize with custom configuration', () => {
      const customConfig = {
        qualityPreference: 0.9,
        stylePreference: 'photorealistic' as const,
        platformOverrides: {
          openai: {
            model: 'gpt-4' as const,
            temperature: 0.2
          }
        }
      };

      const manager = new ConfigurationManager(customConfig);
      const config = manager.getConfig();

      expect(config.qualityPreference).toBe(0.9);
      expect(config.stylePreference).toBe('photorealistic');
      expect(config.platformOverrides.openai?.model).toBe('gpt-4');
      expect(config.platformOverrides.openai?.temperature).toBe(0.2);
    });

    test('should validate configuration updates', () => {
      const result = configManager.updateConfig({
        qualityPreference: 0.8,
        stylePreference: 'artistic'
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      
      const config = configManager.getConfig();
      expect(config.qualityPreference).toBe(0.8);
      expect(config.stylePreference).toBe('artistic');
    });

    test('should reject invalid configuration updates', () => {
      const result = configManager.updateConfig({
        qualityPreference: 2.5 // Invalid: must be 0-1
      } as any);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      
      // Original config should remain unchanged
      const config = configManager.getConfig();
      expect(config.qualityPreference).toBe(0.7);
    });

    test('should set and get specific configuration values', () => {
      const result = configManager.setConfigValue('platformOverrides.openai.temperature', 0.3);
      
      expect(result.valid).toBe(true);
      expect(configManager.getConfigValue('platformOverrides.openai.temperature')).toBe(0.3);
    });

    test('should provide business logic warnings', () => {
      const result = configManager.updateConfig({
        qualityPreference: 0.9,
        stylePreference: 'minimal' // Conflicting: high quality + minimal style
      });

      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0].message).toContain('High quality preference with minimal style');
    });

    test('should track configuration history', () => {
      configManager.updateConfig({ qualityPreference: 0.8 }, 'Test update 1');
      configManager.updateConfig({ qualityPreference: 0.9 }, 'Test update 2');
      
      const history = configManager.getConfigHistory(5);
      
      expect(history).toHaveLength(2);
      expect(history[0].reason).toBe('Test update 1');
      expect(history[1].reason).toBe('Test update 2');
    });

    test('should reset to default configuration', () => {
      // Modify config
      configManager.updateConfig({
        qualityPreference: 0.9,
        stylePreference: 'artistic'
      });

      // Reset to defaults
      const result = configManager.resetToDefaults();
      
      expect(result.valid).toBe(true);
      
      const config = configManager.getConfig();
      expect(config.qualityPreference).toBe(0.7);
      expect(config.stylePreference).toBe('default');
    });
  });

  describe('Configuration Presets', () => {
    test('should have built-in presets', () => {
      const presets = configManager.listPresets();
      
      expect(presets.length).toBeGreaterThan(0);
      
      const builtInPresets = presets.filter(p => p.isBuiltIn);
      expect(builtInPresets.length).toBeGreaterThan(0);
      
      // Check for expected built-in presets
      const presetNames = presets.map(p => p.name);
      expect(presetNames).toContain('High Quality');
      expect(presetNames).toContain('Creative');
      expect(presetNames).toContain('Fast Processing');
    });

    test('should create custom presets', () => {
      configManager.createPreset(
        'test-preset',
        'Test preset description',
        { qualityPreference: 0.8 },
        ['test', 'custom']
      );

      const presets = configManager.listPresets();
      const testPreset = presets.find(p => p.name === 'test-preset');
      
      expect(testPreset).toBeDefined();
      expect(testPreset?.description).toBe('Test preset description');
      expect(testPreset?.isBuiltIn).toBe(false);
      expect(testPreset?.tags).toContain('test');
      expect(testPreset?.tags).toContain('custom');
    });

    test('should apply presets', () => {
      const result = configManager.applyPreset('high-quality');
      
      expect(result.valid).toBe(true);
      
      const config = configManager.getConfig();
      expect(config.qualityPreference).toBe(0.9);
      expect(config.stylePreference).toBe('photorealistic');
    });

    test('should filter presets by tags', () => {
      configManager.createPreset('preset1', 'Desc1', {}, ['tag1', 'tag2']);
      configManager.createPreset('preset2', 'Desc2', {}, ['tag2', 'tag3']);
      configManager.createPreset('preset3', 'Desc3', {}, ['tag3']);

      const tag2Presets = configManager.listPresets(['tag2']);
      
      expect(tag2Presets).toHaveLength(2);
      expect(tag2Presets.map(p => p.name)).toContain('preset1');
      expect(tag2Presets.map(p => p.name)).toContain('preset2');
    });

    test('should delete custom presets', () => {
      configManager.createPreset('deletable', 'Will be deleted', {});
      
      const success = configManager.deletePreset('deletable');
      expect(success).toBe(true);
      
      const presets = configManager.listPresets();
      expect(presets.find(p => p.name === 'deletable')).toBeUndefined();
    });

    test('should not delete built-in presets', () => {
      expect(() => {
        configManager.deletePreset('high-quality');
      }).toThrow('Cannot delete built-in presets');
    });

    test('should handle non-existent preset application', () => {
      const result = configManager.applyPreset('non-existent');
      
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('PRESET_NOT_FOUND');
    });
  });

  describe('Import/Export', () => {
    test('should export configuration as JSON', () => {
      configManager.updateConfig({
        qualityPreference: 0.8,
        stylePreference: 'artistic'
      });

      const exported = configManager.exportConfig('json');
      const parsed = JSON.parse(exported);
      
      expect(parsed.qualityPreference).toBe(0.8);
      expect(parsed.stylePreference).toBe('artistic');
    });

    test('should export configuration as YAML', () => {
      configManager.updateConfig({
        qualityPreference: 0.8,
        stylePreference: 'artistic'
      });

      const exported = configManager.exportConfig('yaml');
      
      expect(typeof exported).toBe('string');
      expect(exported).toContain('qualityPreference: 0.8');
      expect(exported).toContain('stylePreference: artistic');
    });

    test('should import JSON configuration', () => {
      const configData = JSON.stringify({
        qualityPreference: 0.6,
        stylePreference: 'minimal',
        enableOptimizations: false
      });

      const result = configManager.importConfig(configData, 'json');
      
      expect(result.valid).toBe(true);
      
      const config = configManager.getConfig();
      expect(config.qualityPreference).toBe(0.6);
      expect(config.stylePreference).toBe('minimal');
      expect(config.enableOptimizations).toBe(false);
    });

    test('should handle invalid JSON import', () => {
      const result = configManager.importConfig('invalid json', 'json');
      
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('IMPORT_ERROR');
    });

    test('should import YAML configuration', () => {
      const yamlData = `
qualityPreference: 0.6
stylePreference: minimal
enableOptimizations: false
      `.trim();

      const result = configManager.importConfig(yamlData, 'yaml');
      
      expect(result.valid).toBe(true);
      
      const config = configManager.getConfig();
      expect(config.qualityPreference).toBe(0.6);
      expect(config.stylePreference).toBe('minimal');
      expect(config.enableOptimizations).toBe(false);
    });
  });

  describe('Configuration Summary', () => {
    test('should provide configuration summary', () => {
      configManager.updateConfig({
        qualityPreference: 0.9,
        platformOverrides: {
          openai: { model: 'gpt-4' },
          midjourney: { version: '6' }
        }
      });

      const summary = configManager.getConfigSummary();
      
      expect(summary.platforms).toContain('openai');
      expect(summary.platforms).toContain('midjourney');
      expect(summary.qualityLevel).toBe('High');
      expect(summary.optimizationsEnabled).toBe(true);
      expect(summary.presetCount).toBeGreaterThan(0);
    });

    test('should categorize quality levels correctly', () => {
      // Low quality
      configManager.updateConfig({ qualityPreference: 0.3 });
      expect(configManager.getConfigSummary().qualityLevel).toBe('Low');

      // Medium quality
      configManager.updateConfig({ qualityPreference: 0.6 });
      expect(configManager.getConfigSummary().qualityLevel).toBe('Medium');

      // High quality
      configManager.updateConfig({ qualityPreference: 0.9 });
      expect(configManager.getConfigSummary().qualityLevel).toBe('High');
    });
  });

  describe('Schema Validation', () => {
    test('should validate global configuration schema', () => {
      const validConfig = {
        qualityPreference: 0.8,
        stylePreference: 'artistic',
        enableOptimizations: true,
        platformOverrides: {
          openai: {
            model: 'gpt-4',
            temperature: 0.7
          }
        }
      };

      expect(() => GlobalConfigSchema.parse(validConfig)).not.toThrow();
    });

    test('should reject invalid schema values', () => {
      const invalidConfig = {
        qualityPreference: 2.0, // Invalid: > 1
        stylePreference: 'invalid-style' // Invalid enum value
      };

      expect(() => GlobalConfigSchema.parse(invalidConfig)).toThrow();
    });

    test('should apply default values for missing fields', () => {
      const partialConfig = {
        qualityPreference: 0.8
      };

      const parsed = GlobalConfigSchema.parse(partialConfig);
      
      expect(parsed.stylePreference).toBe('default');
      expect(parsed.enableOptimizations).toBe(true);
      expect(parsed.platformOverrides).toEqual({});
    });
  });

  describe('Event System', () => {
    test('should emit config change events', (done) => {
      configManager.on('config:changed', (path, newValue, oldValue) => {
        expect(path).toBe('qualityPreference');
        expect(newValue).toBe(0.8);
        expect(oldValue).toBe(0.7);
        done();
      });

      configManager.setConfigValue('qualityPreference', 0.8);
    });

    test('should emit validation events', (done) => {
      configManager.on('config:validated', (result) => {
        expect(result.valid).toBe(true);
        done();
      });

      configManager.updateConfig({ qualityPreference: 0.8 });
    });

    test('should emit preset application events', (done) => {
      configManager.on('config:preset:applied', (presetName, config) => {
        expect(presetName).toBe('creative');
        expect(config.stylePreference).toBe('artistic');
        done();
      });

      configManager.applyPreset('creative');
    });

    test('should emit export events', (done) => {
      configManager.on('config:exported', (format, config) => {
        expect(format).toBe('json');
        expect(config.qualityPreference).toBe(0.7);
        done();
      });

      configManager.exportConfig('json');
    });

    test('should emit import events', (done) => {
      configManager.on('config:imported', (source, config) => {
        expect(source).toBe('json');
        expect(config.qualityPreference).toBe(0.6);
        done();
      });

      const configData = JSON.stringify({ qualityPreference: 0.6 });
      configManager.importConfig(configData, 'json');
    });
  });

  describe('Error Handling', () => {
    test('should handle malformed configuration gracefully', () => {
      const result = configManager.updateConfig({
        qualityPreference: 'invalid' as any
      });

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      
      // Original config should remain unchanged
      const config = configManager.getConfig();
      expect(config.qualityPreference).toBe(0.7);
    });

    test('should handle missing nested properties', () => {
      const result = configManager.setConfigValue('nonexistent.deeply.nested.path', 'value');
      
      expect(result.valid).toBe(true);
      expect(configManager.getConfigValue('nonexistent.deeply.nested.path')).toBe('value');
    });

    test('should handle concurrent updates safely', async () => {
      const promises = Array.from({ length: 10 }, (_, i) =>
        configManager.updateConfig({ qualityPreference: i / 10 })
      );

      const results = await Promise.all(promises);
      
      // All updates should succeed individually
      results.forEach(result => {
        expect(result.valid).toBe(true);
      });

      // Final config should have a valid value
      const finalConfig = configManager.getConfig();
      expect(finalConfig.qualityPreference).toBeGreaterThanOrEqual(0);
      expect(finalConfig.qualityPreference).toBeLessThanOrEqual(1);
    });
  });
});