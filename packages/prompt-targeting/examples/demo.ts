/**
 * Demo script for Prompt Targeting System
 * Epic 10.1.4 - Multi-Platform Validation
 */

import {
  createBasicPromptTargetingSystem,
  OpenAIAdaptor,
  MidjourneyAdaptor
} from '../index';

/**
 * Sample prompt graphs for demonstration
 */
const sampleGraphs = {
  // Creative writing prompt (good for OpenAI)
  creativeWriting: {
    nodes: [
      {
        id: '1',
        type: 'system',
        data: {
          text: 'You are a creative writing assistant.'
        }
      },
      {
        id: '2',
        type: 'output',
        data: {
          text: 'Write a short story about a time traveler who discovers they can only travel to moments of great historical significance.'
        }
      }
    ],
    edges: [
      {
        id: 'e1',
        source: '1',
        target: '2'
      }
    ]
  },

  // Visual art prompt (good for Midjourney)
  visualArt: {
    nodes: [
      {
        id: '1',
        type: 'subject',
        data: {
          text: 'A cyberpunk cityscape at night'
        }
      },
      {
        id: '2',
        type: 'style',
        data: {
          style: 'sci-fi'
        }
      },
      {
        id: '3',
        type: 'aspectRatio',
        data: {
          aspectRatio: 'landscape'
        }
      }
    ],
    edges: [
      {
        id: 'e1',
        source: '1',
        target: '2'
      },
      {
        id: 'e2',
        source: '2',
        target: '3'
      }
    ]
  },

  // Mixed content prompt (works for both)
  mixedContent: {
    nodes: [
      {
        id: '1',
        type: 'output',
        data: {
          text: 'Create something inspiring about the future of technology'
        }
      }
    ],
    edges: []
  }
};

/**
 * Main demo function
 */
async function runDemo() {
  console.log('🚀 Prompt Targeting System Demo\n');

  // Create the system
  console.log('1. Setting up Prompt Targeting System...');
  const system = createBasicPromptTargetingSystem();

  // Create and register adaptors
  console.log('2. Creating and registering adaptors...');
  
  const openaiAdaptor = new OpenAIAdaptor();
  const midjourneyAdaptor = new MidjourneyAdaptor();

  // Initialize adaptors with demo config
  await openaiAdaptor.initialize({
    openai: {
      apiKey: 'demo-key', // Not actually used in demo
      model: 'gpt-4'
    }
  });

  await midjourneyAdaptor.initialize({
    midjourney: {
      version: '6',
      defaultAspectRatio: '1:1',
      defaultQuality: 1
    }
  });

  // Register adaptors
  await system.registry.register(openaiAdaptor);
  await system.registry.register(midjourneyAdaptor);

  console.log(`✅ Registered ${system.registry.list().length} adaptors\n`);

  // Demo 1: Show adaptor capabilities
  console.log('3. Adaptor Capabilities:');
  await showAdaptorCapabilities(system);

  // Demo 2: Validate different types of content
  console.log('\n4. Content Validation:');
  await demoValidation(system);

  // Demo 3: Cross-platform translation
  console.log('\n5. Cross-Platform Translation:');
  await demoCrossPlatformTranslation(system);

  // Demo 4: Batch translation
  console.log('\n6. Batch Translation:');
  await demoBatchTranslation(system);

  // Demo 5: Configuration effects
  console.log('\n7. Configuration Effects:');
  await demoConfigurationEffects(system);

  // Cleanup
  await openaiAdaptor.cleanup();
  await midjourneyAdaptor.cleanup();

  console.log('\n🎉 Demo completed successfully!');
}

/**
 * Show capabilities of each adaptor
 */
async function showAdaptorCapabilities(system: any) {
  const adaptors = system.registry.list();

  for (const adaptor of adaptors) {
    console.log(`\n📋 ${adaptor.name} (${adaptor.id})`);
    console.log(`   Platforms: ${adaptor.platforms.join(', ')}`);
    
    const capabilities = await adaptor.capabilities();
    console.log(`   Max Tokens: ${capabilities.maxTokens}`);
    console.log(`   Style Support: ${capabilities.styleSupport ? '✅' : '❌'}`);
    console.log(`   Negative Prompts: ${capabilities.negativePromptSupport ? '✅' : '❌'}`);
    console.log(`   Features: ${capabilities.features.slice(0, 3).join(', ')}...`);
  }
}

/**
 * Demo validation for different content types
 */
async function demoValidation(system: any) {
  const testCases = [
    { name: 'Creative Writing', graph: sampleGraphs.creativeWriting, platform: 'openai' },
    { name: 'Visual Art', graph: sampleGraphs.visualArt, platform: 'midjourney' },
    { name: 'Creative Writing → Midjourney', graph: sampleGraphs.creativeWriting, platform: 'midjourney' },
    { name: 'Visual Art → OpenAI', graph: sampleGraphs.visualArt, platform: 'openai' }
  ];

  for (const testCase of testCases) {
    console.log(`\n🔍 ${testCase.name}:`);
    
    const validation = await system.engine.validateTranslation(
      testCase.graph,
      testCase.platform
    );

    console.log(`   Valid: ${validation.valid ? '✅' : '❌'}`);
    console.log(`   Compatibility Score: ${(validation.compatibilityScore * 100).toFixed(1)}%`);
    
    if (validation.errors.length > 0) {
      console.log(`   Errors: ${validation.errors.length}`);
      validation.errors.slice(0, 2).forEach((error: any) => {
        console.log(`     • ${error.message}`);
      });
    }
    
    if (validation.warnings.length > 0) {
      console.log(`   Warnings: ${validation.warnings.length}`);
      validation.warnings.slice(0, 2).forEach((warning: any) => {
        console.log(`     • ${warning.message}`);
      });
    }
  }
}

/**
 * Demo cross-platform translation
 */
async function demoCrossPlatformTranslation(system: any) {
  const graph = sampleGraphs.mixedContent;

  console.log('\n📝 Original Graph:');
  console.log(`   Nodes: ${graph.nodes.length}`);
  console.log(`   Content: "${graph.nodes[0].data.text}"`);

  // Translate to OpenAI
  console.log('\n🤖 OpenAI Translation:');
  try {
    const openaiResult = await system.engine.translate(graph, 'openai', {
      qualityPreference: 0.8,
      stylePreference: 'default'
    });

    console.log(`   Platform: ${openaiResult.platform}`);
    console.log(`   Model: ${openaiResult.parameters.model}`);
    console.log(`   Temperature: ${openaiResult.parameters.temperature?.toFixed(2)}`);
    console.log(`   Prompt: "${openaiResult.prompt.substring(0, 100)}..."`);
    console.log(`   Quality Score: ${(openaiResult.metadata.qualityScore * 100).toFixed(1)}%`);
  } catch (error) {
    console.log(`   ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Translate to Midjourney
  console.log('\n🎨 Midjourney Translation:');
  try {
    const mjResult = await system.engine.translate(graph, 'midjourney', {
      qualityPreference: 0.9,
      stylePreference: 'artistic'
    });

    console.log(`   Platform: ${mjResult.platform}`);
    console.log(`   Quality: ${mjResult.parameters.quality}`);
    console.log(`   Stylize: ${mjResult.parameters.stylize}`);
    console.log(`   Prompt: "${mjResult.prompt.substring(0, 100)}..."`);
    console.log(`   Quality Score: ${(mjResult.metadata.qualityScore * 100).toFixed(1)}%`);
  } catch (error) {
    console.log(`   ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Demo batch translation to multiple platforms
 */
async function demoBatchTranslation(system: any) {
  const graph = sampleGraphs.visualArt;

  console.log('\n📦 Batch Translation:');
  console.log('   Source: Visual Art Graph');
  console.log('   Targets: OpenAI, Midjourney');

  const results = await system.engine.translateBatch(
    graph,
    ['openai', 'midjourney'],
    {
      qualityPreference: 0.7,
      enableOptimizations: true
    }
  );

  console.log(`\n   Results: ${Object.keys(results).length} successful translations`);

  for (const [platform, result] of Object.entries(results)) {
    console.log(`\n   ${platform.toUpperCase()}:`);
    console.log(`     Quality Score: ${((result as any).metadata.qualityScore * 100).toFixed(1)}%`);
    console.log(`     Optimizations: ${(result as any).metadata.optimizations.join(', ')}`);
    console.log(`     Preview: "${(result as any).prompt.substring(0, 80)}..."`);
  }
}

/**
 * Demo how configuration affects translation
 */
async function demoConfigurationEffects(system: any) {
  const graph = sampleGraphs.visualArt;

  const configs = [
    { name: 'High Quality', config: { qualityPreference: 0.9, stylePreference: 'photorealistic' } },
    { name: 'Creative', config: { qualityPreference: 0.5, stylePreference: 'artistic' } },
    { name: 'Minimal', config: { qualityPreference: 0.7, stylePreference: 'minimal' } }
  ];

  console.log('\n⚙️ Configuration Effects (Midjourney):');

  for (const { name, config } of configs) {
    console.log(`\n   ${name} Configuration:`);
    
    try {
      const result = await system.engine.translate(graph, 'midjourney', config);
      
      console.log(`     Quality: ${result.parameters.quality}`);
      console.log(`     Stylize: ${result.parameters.stylize}`);
      console.log(`     Optimizations: ${result.metadata.optimizations.join(', ')}`);
      
      // Show how the prompt changes
      const parameterPart = result.prompt.split('--').slice(1).join(' --');
      if (parameterPart) {
        console.log(`     Parameters: --${parameterPart}`);
      }
    } catch (error) {
      console.log(`     ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

/**
 * Run the demo if this file is executed directly
 */
if (require.main === module) {
  runDemo()
    .then(() => {
      console.log('\n✨ Demo finished successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Demo failed:', error);
      process.exit(1);
    });
}

export { runDemo };