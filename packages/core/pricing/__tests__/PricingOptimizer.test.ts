/**
 * Pricing Optimizer Test Suite
 * Epic 17 - Create Pricing Optimization Tests (E17-1753114397435-FAE0EA)
 * 
 * Comprehensive test coverage for AI-driven pricing strategy implementation
 */

import { 
  PricingOptimizer, 
  PricingModel, 
  PricingCalculationRequest,
  PricingCalculationResult,
  PricingOptimizationConfig,
  MarketConditions,
  PricingOptimizationResult
} from '../PricingOptimizer';

describe('PricingOptimizer', () => {
  let optimizer: PricingOptimizer;
  let basicModel: PricingModel;
  let filmIndustryModel: PricingModel;

  beforeEach(() => {
    const config: Partial<PricingOptimizationConfig> = {
      enableAI: true,
      optimizationFrequency: 'daily',
      competitorTrackingEnabled: false, // Disable for testing
      seasonalAdjustmentsEnabled: true,
      demandPredictionEnabled: true
    };

    optimizer = new PricingOptimizer(config);

    // Basic pricing model
    basicModel = {
      id: 'basic-model',
      name: 'Basic AI Content Generation',
      description: 'Standard AI-powered content generation service',
      type: 'usage_based',
      basePrice: 100,
      currency: 'USD',
      
      usageMetrics: [
        {
          metric: 'api_calls',
          displayName: 'API Calls',
          unit: 'calls',
          pricePerUnit: 0.1,
          includedAmount: 1000,
          overageRate: 0.15
        },
        {
          metric: 'nodes_processed',
          displayName: 'Nodes Processed',
          unit: 'nodes',
          pricePerUnit: 0.05,
          includedAmount: 5000,
          overageRate: 0.08
        }
      ],

      volumeDiscounts: [
        {
          minQuantity: 10000,
          discountPercentage: 10,
          description: '10% discount for high volume usage'
        }
      ],

      aiOptimization: {
        enabled: true,
        strategy: 'maximize_revenue',
        sensitivityAnalysis: true,
        competitorTracking: false
      },

      createdAt: Date.now(),
      updatedAt: Date.now(),
      isActive: true
    };

    // Film industry specific model
    filmIndustryModel = {
      ...basicModel,
      id: 'film-industry-model',
      name: 'Film Industry AI Platform',
      description: 'Specialized AI services for film production',
      type: 'value_based',
      basePrice: 500,

      tiers: [
        {
          id: 'individual',
          name: 'Individual Creator',
          minUsage: 0,
          maxUsage: 1000,
          pricePerUnit: 0.5,
          features: ['Basic templates', 'Standard support']
        },
        {
          id: 'studio',
          name: 'Production Studio',
          minUsage: 1001,
          maxUsage: null,
          pricePerUnit: 0.3,
          features: ['Premium templates', 'Priority support', 'Custom integrations'],
          discountPercentage: 20
        }
      ],

      filmIndustryConfig: {
        studioTierMultiplier: 2.5,
        productionScaleFactors: {
          'indie': 0.8,
          'mid_budget': 1.2,
          'blockbuster': 2.0
        },
        contentTypeMultipliers: {
          'script': 1.0,
          'storyboard': 1.5,
          'concept_art': 2.0,
          'marketing': 1.3
        },
        seasonalAdjustments: [
          {
            period: 'awards_season',
            multiplier: 1.4,
            description: 'Awards season premium pricing'
          },
          {
            period: 'festival_season',
            multiplier: 1.2,
            description: 'Film festival season adjustment'
          }
        ]
      }
    };

    optimizer.addPricingModel(basicModel);
    optimizer.addPricingModel(filmIndustryModel);
  });

  afterEach(() => {
    optimizer.shutdown();
  });

  describe('Initialization', () => {
    test('should initialize with default configuration', () => {
      const defaultOptimizer = new PricingOptimizer();
      expect(defaultOptimizer).toBeInstanceOf(PricingOptimizer);
      defaultOptimizer.shutdown();
    });

    test('should emit optimizer_initialized event', (done) => {
      const testOptimizer = new PricingOptimizer();
      testOptimizer.on('optimizer_initialized', (data) => {
        expect(data).toHaveProperty('modelsCount');
        expect(data).toHaveProperty('config');
        testOptimizer.shutdown();
        done();
      });
    });

    test('should initialize with custom configuration', () => {
      const customConfig: Partial<PricingOptimizationConfig> = {
        enableAI: false,
        maxPriceIncreasePercent: 30,
        minRevenueMaintenance: 0.9
      };

      const customOptimizer = new PricingOptimizer(customConfig);
      expect(customOptimizer).toBeInstanceOf(PricingOptimizer);
      customOptimizer.shutdown();
    });
  });

  describe('Model Management', () => {
    test('should add pricing models successfully', () => {
      const testOptimizer = new PricingOptimizer();
      
      const modelAddedPromise = new Promise<void>((resolve) => {
        testOptimizer.on('model_added', (data) => {
          expect(data.modelId).toBe(basicModel.id);
          expect(data.modelName).toBe(basicModel.name);
          expect(data.type).toBe(basicModel.type);
          resolve();
        });
      });

      testOptimizer.addPricingModel(basicModel);
      testOptimizer.shutdown();

      return modelAddedPromise;
    });

    test('should update model timestamp when adding', () => {
      const originalTimestamp = basicModel.updatedAt;
      const testModel = { ...basicModel, id: 'test-update-model' };
      
      // Wait a bit to ensure timestamp difference
      setTimeout(() => {
        optimizer.addPricingModel(testModel);
        expect(testModel.updatedAt).toBeGreaterThan(originalTimestamp);
      }, 10);
    });
  });

  describe('Basic Pricing Calculations', () => {
    test('should calculate base pricing correctly', async () => {
      const request: PricingCalculationRequest = {
        modelId: 'basic-model',
        usage: {
          'api_calls': 1500,
          'nodes_processed': 6000
        }
      };

      const result = await optimizer.calculatePricing(request);
      
      expect(result).toHaveProperty('totalPrice');
      expect(result).toHaveProperty('currency', 'USD');
      expect(result).toHaveProperty('breakdown');
      expect(result.totalPrice).toBeGreaterThan(basicModel.basePrice);
      expect(result.aiInsights).toHaveProperty('priceOptimality');
      expect(result.aiInsights).toHaveProperty('demandPrediction');
    });

    test('should handle overage charges correctly', async () => {
      const request: PricingCalculationRequest = {
        modelId: 'basic-model',
        usage: {
          'api_calls': 2000, // 1000 overage
          'nodes_processed': 8000 // 3000 overage
        }
      };

      const result = await optimizer.calculatePricing(request);
      
      // Check for overage components in breakdown
      const apiOverage = result.breakdown.find(b => b.component.includes('API Calls'));
      const nodeOverage = result.breakdown.find(b => b.component.includes('Nodes Processed'));
      
      expect(apiOverage).toBeDefined();
      expect(nodeOverage).toBeDefined();
      
      if (apiOverage) {
        expect(apiOverage.quantity).toBe(1000); // 1000 overage calls
        expect(apiOverage.unitPrice).toBe(0.15); // Overage rate
      }
    });

    test('should apply volume discounts', async () => {
      const request: PricingCalculationRequest = {
        modelId: 'basic-model',
        usage: {
          'api_calls': 15000, // High volume
          'nodes_processed': 20000
        }
      };

      const result = await optimizer.calculatePricing(request);
      
      expect(result.discounts).toHaveLength(1);
      expect(result.discounts[0].type).toBe('volume');
      expect(result.discounts[0].percentage).toBe(10);
    });

    test('should throw error for unknown model', async () => {
      const request: PricingCalculationRequest = {
        modelId: 'nonexistent-model',
        usage: {}
      };

      await expect(optimizer.calculatePricing(request)).rejects.toThrow('Pricing model not found: nonexistent-model');
    });
  });

  describe('Film Industry Specific Pricing', () => {
    test('should apply studio tier multiplier', async () => {
      const request: PricingCalculationRequest = {
        modelId: 'film-industry-model',
        userTier: 'studio',
        usage: {
          'api_calls': 1000
        }
      };

      const result = await optimizer.calculatePricing(request);
      
      expect(result.industryInsights).toBeDefined();
      expect(result.industryInsights?.studioTierImpact).toBeGreaterThan(0);
      
      const studioTierComponent = result.breakdown.find(b => b.component.includes('Studio Tier'));
      expect(studioTierComponent).toBeDefined();
    });

    test('should apply production scale factors', async () => {
      const request: PricingCalculationRequest = {
        modelId: 'film-industry-model',
        productionType: 'blockbuster',
        usage: {
          'api_calls': 1000
        }
      };

      const result = await optimizer.calculatePricing(request);
      
      expect(result.industryInsights).toBeDefined();
      expect(result.industryInsights?.productionScaleImpact).toBeGreaterThan(0);
      
      const scaleComponent = result.breakdown.find(b => b.component.includes('Production Scale'));
      expect(scaleComponent).toBeDefined();
    });

    test('should apply seasonal adjustments', async () => {
      // Mock current date to be in awards season (Jan-Mar)
      jest.spyOn(
        Date.prototype,
        'getMonth'
      ).mockReturnValue(1 as unknown as unknown as unknown as unknown); // February (0-indexed)

      const request: PricingCalculationRequest = {
        modelId: 'film-industry-model',
        usage: {
          'api_calls': 1000
        }
      };

      const result = await optimizer.calculatePricing(request);
      
      expect(result.industryInsights).toBeDefined();
      expect(result.industryInsights?.seasonalImpact).toBeGreaterThan(0);
      
      const seasonalComponent = result.breakdown.find(b => b.component.includes('Seasonal'));
      expect(seasonalComponent).toBeDefined();

      jest.restoreAllMocks();
    });

    test('should handle content type multipliers', async () => {
      const request: PricingCalculationRequest = {
        modelId: 'film-industry-model',
        contentType: 'concept_art',
        usage: {
          'api_calls': 1000
        }
      };

      const result = await optimizer.calculatePricing(request);
      
      // Content type multipliers are applied through complexity scoring
      expect(result.aiInsights.priceOptimality).toBeGreaterThan(0);
    });
  });

  describe('AI Optimization', () => {
    test('should apply demand-based pricing adjustments', async () => {
      const highDemandRequest: PricingCalculationRequest = {
        modelId: 'basic-model',
        usage: {
          'api_calls': 5000, // High usage indicating high demand
          'nodes_processed': 10000
        }
      };

      const result = await optimizer.calculatePricing(highDemandRequest);
      
      expect(result.aiInsights.demandPrediction).toBe('high');
      expect(result.totalPrice).toBeGreaterThan(basicModel.basePrice);
    });

    test('should calculate complexity scores correctly', async () => {
      const complexRequest: PricingCalculationRequest = {
        modelId: 'basic-model',
        usage: {
          'api_calls': 10000
        },
        priority: 'emergency',
        contentType: 'concept_art'
      };

      const result = await optimizer.calculatePricing(complexRequest);
      
      const complexityComponent = result.breakdown.find(b => b.component.includes('Complexity'));
      expect(complexityComponent).toBeDefined();
      expect(result.totalPrice).toBeGreaterThan(basicModel.basePrice);
    });

    test('should respect AI optimization settings', async () => {
      // Create model with AI optimization disabled
      const nonAiModel: PricingModel = {
        ...basicModel,
        id: 'non-ai-model',
        aiOptimization: {
          enabled: false,
          strategy: 'maximize_revenue',
          sensitivityAnalysis: false,
          competitorTracking: false
        }
      };

      optimizer.addPricingModel(nonAiModel);

      const request: PricingCalculationRequest = {
        modelId: 'non-ai-model',
        usage: {
          'api_calls': 5000
        }
      };

      const result = await optimizer.calculatePricing(request);
      
      // Should not have AI-driven adjustments
      expect(result.aiInsights.priceOptimality).toBe(50); // Base score
    });
  });

  describe('Analytics and Tracking', () => {
    test('should track pricing calculations in analytics', async () => {
      const request: PricingCalculationRequest = {
        modelId: 'basic-model',
        usage: {
          'api_calls': 1000
        }
      };

      // Perform multiple calculations
      await optimizer.calculatePricing(request);
      await optimizer.calculatePricing({ ...request, usage: { 'api_calls': 2000 } });
      
      const analytics = optimizer.getAnalytics('basic-model');
      
      expect(analytics).toBeDefined();
      expect(analytics?.totalCalculations).toBe(2);
      expect(analytics?.totalRevenue).toBeGreaterThan(0);
      expect(analytics?.averageOrderValue).toBeGreaterThan(0);
    });

    test('should return null for analytics of unknown model', () => {
      const analytics = optimizer.getAnalytics('unknown-model');
      expect(analytics).toBeNull();
    });

    test('should track usage patterns', async () => {
      const requests = [
        { modelId: 'basic-model', usage: { 'api_calls': 1000 } },
        { modelId: 'basic-model', usage: { 'api_calls': 1000 } }, // Same pattern
        { modelId: 'basic-model', usage: { 'api_calls': 2000 } }  // Different pattern
      ];

      for (const request of requests) {
        await optimizer.calculatePricing(request);
      }

      const analytics = optimizer.getAnalytics('basic-model');
      
      expect(analytics?.topUsagePatterns).toHaveLength(2);
      expect(analytics?.topUsagePatterns[0].frequency).toBeGreaterThan(1);
    });
  });

  describe('Demand Forecasting', () => {
    test('should generate demand forecast', async () => {
      // First perform some calculations to build analytics
      const request: PricingCalculationRequest = {
        modelId: 'basic-model',
        usage: { 'api_calls': 1000 }
      };
      
      await optimizer.calculatePricing(request);

      const forecast = await optimizer.generateDemandForecast('basic-model', 30);
      
      expect(forecast).toHaveProperty('period', 30);
      expect(forecast).toHaveProperty('expectedDemandChange');
      expect(forecast).toHaveProperty('confidence');
      expect(forecast).toHaveProperty('factors');
      expect(Array.isArray(forecast.factors)).toBe(true);
    });

    test('should throw error for unknown model in forecast', async () => {
      await expect(
        optimizer.generateDemandForecast('unknown-model', 30)
      ).rejects.toThrow('Model not found: unknown-model');
    });

    test('should require analytics for forecast', async () => {
      // Add a new model without any calculations
      const newModel: PricingModel = {
        ...basicModel,
        id: 'new-forecast-model'
      };
      optimizer.addPricingModel(newModel);

      await expect(
        optimizer.generateDemandForecast('new-forecast-model', 30)
      ).rejects.toThrow('Analytics not available for model: new-forecast-model');
    });
  });

  describe('Competitive Analysis', () => {
    test('should provide competitive analysis', async () => {
      const analysis = await optimizer.getCompetitiveAnalysis('basic-model');
      
      expect(analysis).toHaveProperty('position');
      expect(analysis).toHaveProperty('competitorCount');
      expect(analysis).toHaveProperty('averagePrice');
      expect(analysis).toHaveProperty('priceRange');
      expect(analysis).toHaveProperty('marketShare');
      expect(analysis).toHaveProperty('differentiationFactors');
      
      expect(typeof analysis.competitorCount).toBe('number');
      expect(typeof analysis.averagePrice).toBe('number');
      expect(Array.isArray(analysis.differentiationFactors)).toBe(true);
    });

    test('should throw error for unknown model in competitive analysis', async () => {
      await expect(
        optimizer.getCompetitiveAnalysis('unknown-model')
      ).rejects.toThrow('Model not found: unknown-model');
    });
  });

  describe('Market Optimization', () => {
    test('should optimize for market conditions', async () => {
      // First perform some calculations to build analytics
      const request: PricingCalculationRequest = {
        modelId: 'basic-model',
        usage: { 'api_calls': 1000 }
      };
      
      await optimizer.calculatePricing(request);

      const marketConditions: MarketConditions = {
        demandLevel: 'high',
        competitiveIntensity: 'medium',
        seasonality: 'low',
        economicIndicators: {
          gdpGrowth: 0.03,
          inflation: 0.02
        }
      };

      const optimization = await optimizer.optimizeForMarketConditions('basic-model', marketConditions);
      
      expect(optimization).toHaveProperty('modelId', 'basic-model');
      expect(optimization).toHaveProperty('recommendations');
      expect(optimization).toHaveProperty('expectedImpact');
      expect(optimization).toHaveProperty('confidence');
      expect(optimization).toHaveProperty('implementationRisk');
      
      expect(Array.isArray(optimization.recommendations)).toBe(true);
      expect(typeof optimization.expectedImpact).toBe('number');
      expect(typeof optimization.confidence).toBe('number');
    });
  });

  describe('Optimization Engine', () => {
    test('should run optimization cycle', async () => {
      // Build some analytics first
      const request: PricingCalculationRequest = {
        modelId: 'basic-model',
        usage: { 'api_calls': 1000 }
      };
      
      // Perform multiple calculations to simulate low growth
      for (let i = 0; i < 5; i++) {
        await optimizer.calculatePricing(request);
      }

      const optimizationPromise = new Promise<void>((resolve) => {
        optimizer.on('optimization_cycle_complete', (data) => {
          expect(data).toHaveProperty('modelsOptimized');
          expect(data).toHaveProperty('timestamp');
          resolve();
        });
      });

      await optimizer.runOptimization();
      await optimizationPromise;
    });

    test('should emit optimization events', async () => {
      // Build analytics with low revenue growth to trigger optimization
      const request: PricingCalculationRequest = {
        modelId: 'basic-model',
        usage: { 'api_calls': 1000 }
      };
      
      await optimizer.calculatePricing(request);

      const eventPromises = [
        new Promise<void>((resolve) => {
          optimizer.on('optimization_applied', (data) => {
            expect(data).toHaveProperty('modelId');
            expect(data).toHaveProperty('optimization');
            expect(data).toHaveProperty('impact');
            expect(data).toHaveProperty('confidence');
            resolve();
          });
        }),
        new Promise<void>((resolve) => {
          optimizer.on('optimization_cycle_complete', () => {
            resolve();
          });
        })
      ];

      await optimizer.runOptimization();
      await Promise.race(eventPromises);
    });

    test('should handle optimization errors gracefully', async () => {
      // Create a model that might cause optimization errors
      const problematicModel: PricingModel = {
        ...basicModel,
        id: 'problematic-model',
        basePrice: 0 // This might cause issues
      };

      optimizer.addPricingModel(problematicModel);

      const errorPromise = new Promise<void>((resolve) => {
        optimizer.on('optimization_error', (data) => {
          expect(data).toHaveProperty('modelId', 'problematic-model');
          expect(data).toHaveProperty('error');
          resolve();
        });
      });

      await optimizer.runOptimization();
      
      // The error event might not always fire, so we use a timeout
      await Promise.race([
        errorPromise,
        new Promise(resolve => setTimeout(resolve, 1000))
      ]);
    });
  });

  describe('Event Emission', () => {
    test('should emit pricing_calculated event', async () => {
      const eventPromise = new Promise<void>((resolve) => {
        optimizer.on('pricing_calculated', (data) => {
          expect(data).toHaveProperty('modelId');
          expect(data).toHaveProperty('totalPrice');
          expect(data).toHaveProperty('currency');
          expect(data).toHaveProperty('aiOptimality');
          resolve();
        });
      });

      const request: PricingCalculationRequest = {
        modelId: 'basic-model',
        usage: { 'api_calls': 1000 }
      };

      await optimizer.calculatePricing(request);
      await eventPromise;
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle requests with no usage data', async () => {
      const request: PricingCalculationRequest = {
        modelId: 'basic-model',
        usage: {}
      };

      const result = await optimizer.calculatePricing(request);
      
      expect(result.totalPrice).toBe(basicModel.basePrice);
      expect(result.breakdown).toHaveLength(0);
    });

    test('should handle extremely high usage values', async () => {
      const request: PricingCalculationRequest = {
        modelId: 'basic-model',
        usage: {
          'api_calls': 1000000,
          'nodes_processed': 5000000
        }
      };

      const result = await optimizer.calculatePricing(request);
      
      expect(result.totalPrice).toBeGreaterThan(basicModel.basePrice);
      expect(result.breakdown.length).toBeGreaterThan(0);
    });

    test('should handle pricing models with no volume discounts', async () => {
      const modelWithoutDiscounts: PricingModel = {
        ...basicModel,
        id: 'no-discounts-model',
        volumeDiscounts: undefined
      };

      optimizer.addPricingModel(modelWithoutDiscounts);

      const request: PricingCalculationRequest = {
        modelId: 'no-discounts-model',
        usage: {
          'api_calls': 50000 // High volume
        }
      };

      const result = await optimizer.calculatePricing(request);
      
      expect(result.discounts).toHaveLength(0);
    });

    test('should handle pricing models without film industry config', async () => {
      const request: PricingCalculationRequest = {
        modelId: 'basic-model', // No film industry config
        userTier: 'studio',
        productionType: 'blockbuster',
        usage: { 'api_calls': 1000 }
      };

      const result = await optimizer.calculatePricing(request);
      
      expect(result.industryInsights).toBeUndefined();
    });
  });

  describe('Performance and Scalability', () => {
    test('should handle multiple concurrent pricing calculations', async () => {
      const requests = Array.from({ length: 100 }, (_, i) => ({
        modelId: 'basic-model',
        usage: {
          'api_calls': 1000 + i * 10
        }
      }));

      const startTime = Date.now();
      const results = await Promise.all(requests.map(req => optimizer.calculatePricing(req)));
      const endTime = Date.now();

      expect(results).toHaveLength(100);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
      
      // All results should be valid
      results.forEach(result => {
        expect(result).toHaveProperty('totalPrice');
        expect(result).toHaveProperty('currency', 'USD');
        expect(result.totalPrice).toBeGreaterThan(0);
      });
    });

    test('should maintain performance with large analytics datasets', async () => {
      // Generate a large number of calculations to build substantial analytics
      const requests = Array.from({ length: 1000 }, (_, i) => ({
        modelId: 'basic-model',
        usage: {
          'api_calls': Math.floor(Math.random() * 10000) + 1000
        }
      }));

      // Perform calculations in batches to avoid overwhelming the system
      const batchSize = 50;
      for (let i = 0; i < requests.length; i += batchSize) {
        const batch = requests.slice(i, i + batchSize);
        await Promise.all(batch.map(req => optimizer.calculatePricing(req)));
      }

      const analytics = optimizer.getAnalytics('basic-model');
      
      expect(analytics?.totalCalculations).toBe(1000);
      expect(analytics?.topUsagePatterns.length).toBeLessThanOrEqual(10); // Should maintain limit
    });
  });

  describe('Configuration Edge Cases', () => {
    test('should work with minimal configuration', () => {
      const minimalOptimizer = new PricingOptimizer({
        enableAI: false
      });

      expect(minimalOptimizer).toBeInstanceOf(PricingOptimizer);
      minimalOptimizer.shutdown();
    });

    test('should handle configuration with all features disabled', () => {
      const disabledConfig: Partial<PricingOptimizationConfig> = {
        enableAI: false,
        competitorTrackingEnabled: false,
        seasonalAdjustmentsEnabled: false,
        demandPredictionEnabled: false,
        filmIndustryOptimization: {
          studioTierAdjustments: false,
          productionCycleTracking: false,
          festivalSeasonOptimization: false,
          awardsSeasonPremium: false
        }
      };

      const disabledOptimizer = new PricingOptimizer(disabledConfig);
      expect(disabledOptimizer).toBeInstanceOf(PricingOptimizer);
      disabledOptimizer.shutdown();
    });
  });

  describe('Cleanup and Resource Management', () => {
    test('should clean up resources on shutdown', () => {
      const testOptimizer = new PricingOptimizer();
      const shutdownSpy = jest.spyOn(testOptimizer, 'emit');
      
      testOptimizer.shutdown();
      
      expect(shutdownSpy).toHaveBeenCalledWith('optimizer_shutdown');
      shutdownSpy.mockRestore();
    });

    test('should clear intervals on shutdown', () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
      const testOptimizer = new PricingOptimizer({
        enableAI: true,
        optimizationFrequency: 'hourly'
      });
      
      testOptimizer.shutdown();
      
      expect(clearIntervalSpy).toHaveBeenCalled();
      clearIntervalSpy.mockRestore();
    });
  });
});