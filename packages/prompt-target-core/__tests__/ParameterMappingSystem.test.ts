import { ParameterMappingSystem } from '../src/mapping/ParameterMappingSystem.js';

describe('ParameterMappingSystem', () => {
  let mappingSystem: ParameterMappingSystem;

  beforeEach(() => {
    mappingSystem = new ParameterMappingSystem();
  });

  describe('Midjourney to DALL-E mapping', () => {
    it('should map aspect ratio to size', () => {
      const sourceParams = {
        aspect_ratio: '16:9',
        stylize: 200,
        quality: 1.5,
        version: 'v6'
      };

      const result = mappingSystem.mapParameters(sourceParams, 'midjourney', 'openai-dalle');

      expect(result.mappedParameters.size).toBe('1792x1024'); // 16:9 -> landscape
      expect(result.mappedParameters.style).toBe('vivid'); // stylize > 500 -> vivid
      expect(result.mappedParameters.quality).toBe('hd'); // quality >= 1 -> hd
      expect(result.mappedParameters.model).toBe('dall-e-3'); // v6 -> dall-e-3
    });

    it('should handle portrait aspect ratios', () => {
      const sourceParams = { aspect_ratio: '9:16' };

      const result = mappingSystem.mapParameters(sourceParams, 'midjourney', 'openai-dalle');

      expect(result.mappedParameters.size).toBe('1024x1792'); // 9:16 -> portrait
    });

    it('should map stylization levels correctly', () => {
      const lowStylize = mappingSystem.mapParameters(
        { stylize: 50 }, 
        'midjourney', 
        'openai-dalle'
      );
      const highStylize = mappingSystem.mapParameters(
        { stylize: 800 }, 
        'midjourney', 
        'openai-dalle'
      );

      expect(lowStylize.mappedParameters.style).toBe('natural');
      expect(highStylize.mappedParameters.style).toBe('vivid');
    });

    it('should identify incompatible parameters', () => {
      const sourceParams = {
        chaos: 50,
        weird: 100,
        tile: true,
        aspect_ratio: '1:1'
      };

      const result = mappingSystem.mapParameters(sourceParams, 'midjourney', 'openai-dalle');

      expect(result.incompatible).toContain('chaos');
      expect(result.incompatible).toContain('weird');
      expect(result.incompatible).toContain('tile');
      expect(result.incompatible).not.toContain('aspect_ratio');
    });

    it('should provide transformation details', () => {
      const sourceParams = { aspect_ratio: '4:5', stylize: 300 };

      const result = mappingSystem.mapParameters(sourceParams, 'midjourney', 'openai-dalle');

      expect(result.transformations).toHaveLength(2);
      
      const aspectTransform = result.transformations.find(t => t.sourceParam === 'aspect_ratio');
      expect(aspectTransform).toBeDefined();
      expect(aspectTransform?.targetParam).toBe('size');
      expect(aspectTransform?.sourceValue).toBe('4:5');
      expect(aspectTransform?.targetValue).toBe('1024x1792');

      const stylizeTransform = result.transformations.find(t => t.sourceParam === 'stylize');
      expect(stylizeTransform).toBeDefined();
      expect(stylizeTransform?.targetParam).toBe('style');
      expect(stylizeTransform?.sourceValue).toBe(300);
      expect(stylizeTransform?.targetValue).toBe('natural');
    });
  });

  describe('DALL-E to Midjourney mapping', () => {
    it('should map size to aspect ratio', () => {
      const sourceParams = {
        size: '1792x1024',
        style: 'vivid',
        quality: 'hd',
        model: 'dall-e-3'
      };

      const result = mappingSystem.mapParameters(sourceParams, 'openai-dalle', 'midjourney');

      expect(result.mappedParameters.aspect_ratio).toBe('16:9');
      expect(result.mappedParameters.stylize).toBe(200); // vivid -> 200
      expect(result.mappedParameters.quality).toBe(2); // hd -> 2
      expect(result.mappedParameters.version).toBe('v6'); // dall-e-3 -> v6
    });

    it('should handle different DALL-E sizes', () => {
      const square = mappingSystem.mapParameters(
        { size: '1024x1024' }, 
        'openai-dalle', 
        'midjourney'
      );
      const portrait = mappingSystem.mapParameters(
        { size: '1024x1792' }, 
        'openai-dalle', 
        'midjourney'
      );

      expect(square.mappedParameters.aspect_ratio).toBe('1:1');
      expect(portrait.mappedParameters.aspect_ratio).toBe('9:16');
    });

    it('should identify DALL-E specific incompatible parameters', () => {
      const sourceParams = {
        n: 3,
        response_format: 'b64_json',
        size: '1024x1024'
      };

      const result = mappingSystem.mapParameters(sourceParams, 'openai-dalle', 'midjourney');

      expect(result.incompatible).toContain('n');
      expect(result.incompatible).toContain('response_format');
      expect(result.incompatible).not.toContain('size');
    });
  });

  describe('Universal custom mappings', () => {
    it('should map width/height to aspect ratio', () => {
      const sourceParams = {
        width: 1920,
        height: 1080,
        style_strength: 0.8,
        detail_level: 0.9
      };

      const result = mappingSystem.mapParameters(sourceParams, 'custom', 'midjourney');

      expect(result.mappedParameters.aspect_ratio).toBe('16:9');
      expect(result.mappedParameters.stylize).toBe(800); // 0.8 * 1000
      expect(result.mappedParameters.quality).toBe(0.9);
    });

    it('should map width/height to DALL-E size', () => {
      const sourceParams = {
        width: 1024,
        height: 1024,
        style_strength: 0.7,
        detail_level: 0.8
      };

      const result = mappingSystem.mapParameters(sourceParams, 'custom', 'openai-dalle');

      expect(result.mappedParameters.size).toBe('1024x1024');
      expect(result.mappedParameters.style).toBe('vivid'); // > 0.5
      expect(result.mappedParameters.quality).toBe('hd'); // > 0.5
    });

    it('should handle missing height parameter', () => {
      const sourceParams = {
        width: 1024,
        style_strength: 0.3
      };

      const result = mappingSystem.mapParameters(sourceParams, 'custom', 'midjourney');

      // Should not map width without height due to condition
      expect(result.warnings).toContain('No mapping found for parameter: width');
      expect(result.mappedParameters.stylize).toBe(300); // 0.3 * 1000
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle unknown platform mappings', () => {
      const sourceParams = { test: 'value' };

      const result = mappingSystem.mapParameters(sourceParams, 'midjourney', 'custom' as any);

      expect(result.warnings).toContain('No mapping rules defined for midjourney -> custom');
      expect(result.mappedParameters).toEqual(sourceParams);
    });

    it('should handle transformation errors gracefully', () => {
      // Create a mapping system with a faulty transformation
      const customSystem = new ParameterMappingSystem();
      customSystem.registerMappingRuleSet({
        fromPlatform: 'custom',
        toPlatform: 'midjourney',
        mappings: [{
          sourceParam: 'test',
          targetParam: 'result',
          transform: () => { throw new Error('Transform error'); },
          description: 'Faulty transform'
        }]
      });

      const result = customSystem.mapParameters({ test: 'value' }, 'custom', 'midjourney');

      expect(result.warnings).toContain('Failed to transform test: Error: Transform error');
    });

    it('should skip mappings when conditions are not met', () => {
      const customSystem = new ParameterMappingSystem();
      customSystem.registerMappingRuleSet({
        fromPlatform: 'custom',
        toPlatform: 'midjourney',
        mappings: [{
          sourceParam: 'conditional_param',
          targetParam: 'result',
          condition: (params) => params.enable_feature === true,
          description: 'Conditional mapping'
        }]
      });

      const resultWithoutCondition = customSystem.mapParameters(
        { conditional_param: 'value' }, 
        'custom', 
        'midjourney'
      );
      
      const resultWithCondition = customSystem.mapParameters(
        { conditional_param: 'value', enable_feature: true }, 
        'custom', 
        'midjourney'
      );

      expect(resultWithoutCondition.warnings).toContain('Parameter conditional_param mapping skipped due to condition');
      expect(resultWithCondition.mappedParameters.result).toBe('value');
    });

    it('should handle default parameters correctly', () => {
      const customSystem = new ParameterMappingSystem();
      customSystem.registerMappingRuleSet({
        fromPlatform: 'custom',
        toPlatform: 'midjourney',
        mappings: [],
        defaultParameters: {
          aspect_ratio: '1:1',
          version: 'v6',
          stylize: 100
        }
      });

      const result = customSystem.mapParameters({}, 'custom', 'midjourney');

      expect(result.mappedParameters.aspect_ratio).toBe('1:1');
      expect(result.mappedParameters.version).toBe('v6');
      expect(result.mappedParameters.stylize).toBe(100);
    });
  });

  describe('Aspect ratio and size utilities', () => {
    it('should handle common aspect ratios correctly', () => {
      const testCases = [
        { ratio: '1:1', expectedSize: '1024x1024' },
        { ratio: '16:9', expectedSize: '1792x1024' },
        { ratio: '9:16', expectedSize: '1024x1792' },
        { ratio: '4:3', expectedSize: '1792x1024' }, // Approximated to landscape
        { ratio: '3:2', expectedSize: '1792x1024' }
      ];

      testCases.forEach(({ ratio, expectedSize }) => {
        const result = mappingSystem.mapParameters(
          { aspect_ratio: ratio }, 
          'midjourney', 
          'openai-dalle'
        );
        expect(result.mappedParameters.size).toBe(expectedSize);
      });
    });

    it('should handle dimensions to aspect ratio conversion', () => {
      const testCases = [
        { width: 1920, height: 1080, expectedRatio: '16:9' },
        { width: 1080, height: 1920, expectedRatio: '9:16' },
        { width: 1024, height: 1024, expectedRatio: '1:1' },
        { width: 1600, height: 1200, expectedRatio: '4:3' },
        { width: 800, height: 600, expectedRatio: '4:3' }
      ];

      testCases.forEach(({ width, height, expectedRatio }) => {
        const result = mappingSystem.mapParameters(
          { width, height }, 
          'custom', 
          'midjourney'
        );
        expect(result.mappedParameters.aspect_ratio).toBe(expectedRatio);
      });
    });

    it('should handle unusual dimensions gracefully', () => {
      const result = mappingSystem.mapParameters(
        { width: 1337, height: 741 }, // Unusual ratio
        'custom', 
        'midjourney'
      );

      // Should produce some valid aspect ratio
      expect(result.mappedParameters.aspect_ratio).toMatch(/^\d+:\d+$/);
    });
  });

  describe('Available mappings', () => {
    it('should return all available mapping combinations', () => {
      const mappings = mappingSystem.getAvailableMappings();

      expect(mappings).toContainEqual({ from: 'midjourney', to: 'openai-dalle' });
      expect(mappings).toContainEqual({ from: 'openai-dalle', to: 'midjourney' });
      expect(mappings).toContainEqual({ from: 'custom', to: 'midjourney' });
      expect(mappings).toContainEqual({ from: 'custom', to: 'openai-dalle' });
    });
  });

  describe('Registration system', () => {
    it('should allow registering custom mapping rule sets', () => {
      const customRuleSet = {
        fromPlatform: 'stable-diffusion' as const,
        toPlatform: 'midjourney' as const,
        mappings: [{
          sourceParam: 'steps',
          targetParam: 'quality',
          transform: (steps: number) => Math.min(2, steps / 25),
          description: 'Map diffusion steps to quality'
        }],
        defaultParameters: {
          version: 'v6'
        }
      };

      mappingSystem.registerMappingRuleSet(customRuleSet);

      const result = mappingSystem.mapParameters(
        { steps: 50 }, 
        'stable-diffusion', 
        'midjourney'
      );

      expect(result.mappedParameters.quality).toBe(2);
      expect(result.mappedParameters.version).toBe('v6');
    });
  });
});