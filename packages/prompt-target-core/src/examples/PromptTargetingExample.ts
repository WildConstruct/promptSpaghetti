import {
  MappingEngine,
  ValidationEngine,
  OpenAIGPTAdaptor,
  MidjourneyAdaptor,
  PromptGraph,
  Platform,
  TranslationRequest,
  ConsoleLogger,
  MemoryCache,
  MemoryMetrics
} from '../index.js';

/**
 * Comprehensive example demonstrating the prompt targeting system
 */
export class PromptTargetingExample {
  private engine: MappingEngine;
  private validator: ValidationEngine;
  private logger: ConsoleLogger;
  private cache: MemoryCache;
  private metrics: MemoryMetrics;

  constructor() {
    // Initialize dependencies
    this.logger = new ConsoleLogger('Example');
    this.cache = new MemoryCache();
    this.metrics = new MemoryMetrics();

    // Create engines
    this.engine = new MappingEngine(this.logger, this.cache, this.metrics);
    this.validator = new ValidationEngine(this.logger, this.metrics);

    // Register adaptors
    this.setupAdaptors();
  }

  private setupAdaptors(): void {
    const context = {
      logger: this.logger,
      cache: this.cache,
      metrics: this.metrics,
      config: {}
    };

    // Register OpenAI GPT adaptor
    const gptAdaptor = new OpenAIGPTAdaptor(context);
    this.engine.registerAdaptor('openai-gpt', gptAdaptor);

    // Register Midjourney adaptor
    const midjourneyAdaptor = new MidjourneyAdaptor(context);
    this.engine.registerAdaptor('midjourney', midjourneyAdaptor);

    this.logger.info('Adaptors registered', {
      platforms: this.engine.getRegisteredPlatforms()
    });
  }

  /**
   * Example 1: Simple text-to-text translation
   */
  async simpleTextTranslation(): Promise<void> {
    console.log('\n=== Simple Text Translation ===');

    const graph: PromptGraph = {
      id: 'simple-text-graph',
      version: '1.0',
      nodes: [
        {
          id: 'prompt-node',
          type: 'text',
          data: {
            content: 'Write a short story about a robot discovering emotions',
            parameters: {
              temperature: 0.8,
              max_tokens: 500
            }
          },
          position: { x: 0, y: 0 }
        }
      ],
      edges: [],
      metadata: {
        name: 'Simple Story Prompt',
        created: new Date(),
        modified: new Date(),
        version: '1.0'
      }
    };

    const request: TranslationRequest = {
      graph,
      targetPlatform: 'openai-gpt' as Platform
    };

    const response = await this.engine.translate(request);
    
    if (response.success) {
      console.log('✅ Translation successful');
      console.log('Target Platform:', response.targetPrompt?.platform);
      console.log('Format:', response.targetPrompt?.format);
      console.log('Quality Score:', response.quality?.overall);
      console.log('Content:', JSON.stringify(response.targetPrompt?.content, null, 2));
    } else {
      console.log('❌ Translation failed:', response.error?.message);
    }
  }

  /**
   * Example 2: Complex graph with multiple nodes
   */
  async complexGraphTranslation(): Promise<void> {
    console.log('\n=== Complex Graph Translation ===');

    const graph: PromptGraph = {
      id: 'complex-graph',
      version: '1.0',
      nodes: [
        {
          id: 'subject-node',
          type: 'text',
          data: { content: 'A majestic dragon' },
          position: { x: 0, y: 0 }
        },
        {
          id: 'setting-node',
          type: 'text',
          data: { content: 'perched on a mountain peak at sunset' },
          position: { x: 200, y: 0 }
        },
        {
          id: 'style-node',
          type: 'style',
          data: {
            style: 'fantasy art, highly detailed, cinematic lighting',
            content: 'epic fantasy illustration'
          },
          position: { x: 100, y: 100 }
        },
        {
          id: 'concat-node',
          type: 'concat',
          data: { label: 'Combine elements' },
          position: { x: 100, y: 200 }
        },
        {
          id: 'output-node',
          type: 'output',
          data: {
            label: 'Final output',
            parameters: {
              aspect_ratio: '16:9',
              stylize: 250,
              quality: 2
            }
          },
          position: { x: 100, y: 300 }
        }
      ],
      edges: [
        { id: 'e1', source: 'subject-node', target: 'concat-node' },
        { id: 'e2', source: 'setting-node', target: 'concat-node' },
        { id: 'e3', source: 'style-node', target: 'concat-node' },
        { id: 'e4', source: 'concat-node', target: 'output-node' }
      ],
      metadata: {
        name: 'Fantasy Dragon Scene',
        created: new Date(),
        modified: new Date(),
        version: '1.0'
      }
    };

    // Translate to both platforms
    const platforms: Platform[] = ['openai-gpt', 'midjourney'];
    
    for (const platform of platforms) {
      console.log(`\n--- Translating to ${platform} ---`);
      
      const request: TranslationRequest = {
        graph,
        targetPlatform: platform
      };

      const response = await this.engine.translate(request);
      
      if (response.success) {
        console.log('✅ Translation successful');
        console.log('Quality Score:', response.quality?.overall);
        console.log('Warnings:', response.validationResults.filter(r => r.type === 'warning').length);
        
        if (platform === 'midjourney') {
          console.log('Midjourney Prompt:', response.targetPrompt?.content);
        } else {
          const content = response.targetPrompt?.content as any;
          console.log('User Message:', content?.messages?.find((m: any) => m.role === 'user')?.content);
        }
      } else {
        console.log('❌ Translation failed:', response.error?.message);
      }
    }
  }

  /**
   * Example 3: Validation and quality assessment
   */
  async validationExample(): Promise<void> {
    console.log('\n=== Validation Example ===');

    // Create a problematic graph
    const problematicGraph: PromptGraph = {
      id: 'problematic-graph',
      version: '1.0',
      nodes: [
        {
          id: 'disconnected-node',
          type: 'text',
          data: { content: 'This node is disconnected' },
          position: { x: 0, y: 0 }
        },
        {
          id: 'main-node',
          type: 'text',
          data: { 
            content: 'Main prompt content',
            parameters: {
              temperature: 5.0, // Invalid value
              invalid_param: 'should not exist'
            }
          },
          position: { x: 200, y: 0 }
        },
        {
          id: 'image-node',
          type: 'image',
          data: { url: 'https://example.com/image.jpg' },
          position: { x: 100, y: 100 }
        }
      ],
      edges: [
        { id: 'e1', source: 'main-node', target: 'image-node' }
      ],
      metadata: {
        name: 'Problematic Graph',
        created: new Date(),
        modified: new Date(),
        version: '1.0'
      }
    };

    // Get all adaptors for validation
    const gptAdaptor = new OpenAIGPTAdaptor({
      logger: this.logger,
      cache: this.cache,
      metrics: this.metrics,
      config: {}
    });

    const midjourneyAdaptor = new MidjourneyAdaptor({
      logger: this.logger,
      cache: this.cache,
      metrics: this.metrics,
      config: {}
    });

    const report = await this.validator.validateGraph(
      problematicGraph,
      [gptAdaptor, midjourneyAdaptor]
    );

    console.log('Validation Report:');
    console.log('Overall Valid:', report.overallValid);
    console.log('Total Issues:', report.totalIssues);
    console.log('Critical Errors:', report.summary.criticalErrors);
    console.log('High Errors:', report.summary.highErrors);
    console.log('Medium Warnings:', report.summary.mediumWarnings);
    console.log('Low Infos:', report.summary.lowInfos);

    console.log('\nPlatform Compatibility:');
    report.platformResults.forEach((result, platform) => {
      console.log(`${platform}: ${result.compatible ? '✅' : '❌'} (Quality: ${result.quality.overall}%)`);
    });

    console.log('\nAuto-fix Suggestions:');
    report.autoFixSuggestions.forEach((suggestion, index) => {
      console.log(`${index + 1}. ${suggestion.description} (Confidence: ${suggestion.confidence}%)`);
    });

    if (report.crossPlatformIssues.length > 0) {
      console.log('\nCross-platform Issues:');
      report.crossPlatformIssues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.description}`);
        console.log(`   Supporting: ${issue.supportingPlatforms.join(', ')}`);
        console.log(`   Unsupported: ${issue.unsupportedPlatforms.join(', ')}`);
      });
    }
  }

  /**
   * Example 4: Performance and caching demonstration
   */
  async performanceExample(): Promise<void> {
    console.log('\n=== Performance & Caching Example ===');

    const graph: PromptGraph = {
      id: 'performance-test-graph',
      version: '1.0',
      nodes: [
        {
          id: 'test-node',
          type: 'text',
          data: { content: 'Performance test prompt' },
          position: { x: 0, y: 0 }
        }
      ],
      edges: [],
      metadata: {
        name: 'Performance Test',
        created: new Date(),
        modified: new Date(),
        version: '1.0'
      }
    };

    const request: TranslationRequest = {
      graph,
      targetPlatform: 'openai-gpt' as Platform
    };

    // First translation (cache miss)
    console.log('First translation (cache miss):');
    const start1 = Date.now();
    const response1 = await this.engine.translate(request);
    const duration1 = Date.now() - start1;
    console.log(`Duration: ${duration1}ms`);
    console.log(`Success: ${response1.success}`);

    // Second translation (cache hit)
    console.log('\nSecond translation (cache hit):');
    const start2 = Date.now();
    const response2 = await this.engine.translate(request);
    const duration2 = Date.now() - start2;
    console.log(`Duration: ${duration2}ms`);
    console.log(`Success: ${response2.success}`);
    console.log(`Speedup: ${Math.round(duration1 / duration2)}x faster`);

    // Show metrics
    console.log('\nMetrics:');
    const metrics = this.metrics.getMetrics();
    console.log('Counters:', metrics.counters);
    console.log('Translation Duration Stats:', metrics.histograms['mapping_engine.translation.duration']);
  }

  /**
   * Run all examples
   */
  async runAllExamples(): Promise<void> {
    console.log('🚀 Starting Prompt Targeting System Examples\n');

    try {
      await this.simpleTextTranslation();
      await this.complexGraphTranslation();
      await this.validationExample();
      await this.performanceExample();

      console.log('\n✅ All examples completed successfully!');
      
      // Show final stats
      console.log('\nEngine Statistics:');
      const stats = this.engine.getStats();
      console.log(`Registered Adaptors: ${stats.registeredAdaptors}`);
      console.log(`Supported Platforms: ${stats.supportedPlatforms.join(', ')}`);
      
      console.log('\nCache Statistics:');
      const cacheStats = this.cache.getStats();
      console.log(`Cache Size: ${cacheStats.size} entries`);

    } catch (error) {
      console.error('❌ Example failed:', error);
    }
  }
}

// Export factory function for easy usage
export function createPromptTargetingExample(): PromptTargetingExample {
  return new PromptTargetingExample();
}

// CLI runner if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const example = createPromptTargetingExample();
  example.runAllExamples().catch(console.error);
}