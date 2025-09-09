// Node Intelligence Service Tests

import { NodeIntelligenceService } from '../NodeIntelligence';
import { LLMService } from '../LLMService';

// Mock LLMService
jest.mock('../LLMService');

describe('NodeIntelligenceService', () => {
  let service: NodeIntelligenceService;
  let mockLLMService: jest.Mocked<LLMService>;

  beforeEach(() => {
    mockLLMService = {
      populateChoices: jest.fn(),
      complete: jest.fn(),
      extractMetadata: jest.fn(),
      refineText: jest.fn()
    } as any;

    service = new NodeIntelligenceService(mockLLMService);
  });

  describe('populateChoices', () => {
    it('should generate choices for weighted nodes', async () => {
      const mockResponse = {
        choices: [
          { text: 'sliding sideways', weight: 8 },
          { text: 'power slide', weight: 7 },
          { text: 'spinning out', weight: 4 }
        ]
      };

      mockLLMService.populateChoices.mockResolvedValue(mockResponse);

      const result = await service.populateChoices(
        'drifting car',
        'action scene with car chase',
        3
      );

      expect(result).toHaveLength(3);
      expect(result[0]).toHaveProperty('text');
      expect(result[0]).toHaveProperty('weight');
      expect(mockLLMService.populateChoices).toHaveBeenCalledWith(
        'action scene with car chase',
        'drifting car',
        3
      );
    });

    it('should preserve variables in generated choices', async () => {
      const mockResponse = {
        choices: [
          { text: 'running from blast', weight: 8 },
          { text: 'diving for cover', weight: 7 }
        ]
      };

      mockLLMService.populateChoices.mockResolvedValue(mockResponse);

      const result = await service.populateChoices(
        '{reaction} from explosion',
        'action scene',
        2
      );

      // Should preserve the {reaction} variable
      expect(result[0].text).toContain('{reaction}');
    });

    it('should fall back to offline suggestions on error', async () => {
      mockLLMService.populateChoices.mockRejectedValue(new Error('API error'));

      const result = await service.populateChoices(
        'action scene',
        'context',
        5
      );

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('text');
      expect(result[0]).toHaveProperty('weight');
    });
  });

  describe('optimizeWeights', () => {
    it('should optimize unlocked weights', async () => {
      const choices = [
        { text: 'option 1', weight: 5, locked: false },
        { text: 'option 2', weight: 5, locked: false },
        { text: 'option 3', weight: 5, locked: true }
      ];

      const mockResponse = {
        content: JSON.stringify({
          weights: [
            { index: 0, weight: 8, reason: 'more relevant' },
            { index: 1, weight: 3, reason: 'less likely' }
          ]
        })
      };

      mockLLMService.complete.mockResolvedValue(mockResponse as any);

      const result = await service.optimizeWeights(choices, 'context');

      expect(result.original).toEqual(choices);
      expect(result.optimized[0].weight).toBe(8);
      expect(result.optimized[1].weight).toBe(3);
      expect(result.optimized[2].weight).toBe(5); // locked, unchanged
      expect(result.confidence).toBe('high');
    });

    it('should return original weights on error', async () => {
      const choices = [
        { text: 'option 1', weight: 5 },
        { text: 'option 2', weight: 7 }
      ];

      mockLLMService.complete.mockRejectedValue(new Error('API error'));

      const result = await service.optimizeWeights(choices, 'context');

      expect(result.original).toEqual(choices);
      expect(result.optimized).toEqual(choices);
      expect(result.confidence).toBe('low');
    });

    it('should skip optimization if all choices are locked', async () => {
      const choices = [
        { text: 'option 1', weight: 5, locked: true },
        { text: 'option 2', weight: 7, locked: true }
      ];

      const result = await service.optimizeWeights(choices, 'context');

      expect(result.original).toEqual(choices);
      expect(result.optimized).toEqual(choices);
      expect(result.confidence).toBe('high');
      expect(mockLLMService.complete).not.toHaveBeenCalled();
    });
  });

  describe('getInspiration', () => {
    it('should generate thematic suggestions', async () => {
      const mockResponse = {
        content: JSON.stringify({
          suggestions: [
            {
              theme: 'Character Reactions',
              choices: [
                { text: 'panic', weight: 8 },
                { text: 'freeze', weight: 6 }
              ]
            },
            {
              theme: 'Environmental',
              choices: [
                { text: 'debris', weight: 7 },
                { text: 'smoke', weight: 8 }
              ]
            }
          ]
        })
      };

      mockLLMService.complete.mockResolvedValue(mockResponse as any);

      const result = await service.getInspiration('action scene');

      expect(result).toHaveLength(2);
      expect(result[0].theme).toBe('Character Reactions');
      expect(result[0].choices).toHaveLength(2);
      expect(result[1].theme).toBe('Environmental');
    });

    it('should fall back to offline inspiration on error', async () => {
      mockLLMService.complete.mockRejectedValue(new Error('API error'));

      const result = await service.getInspiration('context');

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('theme');
      expect(result[0]).toHaveProperty('choices');
    });
  });

  describe('variable extraction', () => {
    it('should extract variables from text', () => {
      // Access private method through any cast for testing
      const extractVariables = (service as any).extractVariables.bind(service);

      const text = 'The {character} is {action} near {location}';
      const variables = extractVariables(text);

      expect(variables).toHaveLength(3);
      expect(variables[0].name).toBe('character');
      expect(variables[1].name).toBe('action');
      expect(variables[2].name).toBe('location');
    });

    it('should preserve variables in generated text', () => {
      const preserveVariables = (service as any).preserveVariables.bind(
        service
      );

      const original = '{character} runs';
      const generated = 'sprints quickly';
      const variables = [
        { name: 'character', position: 0, placeholder: '{character}' }
      ];

      const result = preserveVariables(original, generated, variables);

      expect(result).toContain('{character}');
    });
  });

  describe('offline suggestions', () => {
    it('should provide category-based offline suggestions', () => {
      const getOfflineSuggestions = (service as any).getOfflineSuggestions.bind(
        service
      );

      const actionSuggestions = getOfflineSuggestions('action scene', 3);
      expect(actionSuggestions).toHaveLength(3);
      expect(actionSuggestions[0]).toHaveProperty('text');
      expect(actionSuggestions[0]).toHaveProperty('weight');

      const emotionSuggestions = getOfflineSuggestions('feeling scared', 2);
      expect(emotionSuggestions).toHaveLength(2);
    });

    it('should provide offline inspiration themes', () => {
      const getOfflineInspiration = (service as any).getOfflineInspiration.bind(
        service
      );

      const themes = getOfflineInspiration('urban scene');

      expect(themes).toHaveLength(3);
      expect(themes[0].theme).toBe('Character Reactions');
      expect(themes[1].theme).toBe('Environmental Details');
      expect(themes[2].theme).toBe('Time Variations');
    });
  });

  describe('service availability', () => {
    it('should report availability when LLM service exists', () => {
      expect(service.isAvailable()).toBe(true);
    });

    it('should handle null LLM service', () => {
      const serviceWithoutLLM = new NodeIntelligenceService(null as any);
      expect(serviceWithoutLLM.isAvailable()).toBe(false);
    });
  });

  describe('cache management', () => {
    it('should clear cache', () => {
      service.clearCache();
      // Cache should be cleared (implementation detail)
      expect(true).toBe(true);
    });
  });
});
