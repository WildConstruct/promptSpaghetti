#!/usr/bin/env node

/**
 * Create Epic 25 Tasks Script
 * 
 * Converts Epic 25 (Multi-model Orchestration & Chain Management) plan
 * into executable tasks in the task management system.
 * 
 * Based on: docs/epic25plan.md
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// Epic 25 Task Definitions from docs/epic25plan.md
const epic25Tasks = [
  // Story 25.1 – Model Orchestration Framework
  {
    title: 'Define workflow DSL/schema for multi-model chains (YAML/JSON)',
    description: 'Design and implement a workflow DSL (Domain Specific Language) that allows users to define multi-model chains using YAML or JSON format. Include schema validation, documentation, and examples for common patterns.',
    estimate: '8 hours',
    priority: 'high',
    wipClass: 'infrastructure',
    story: '25.1',
    epic: 'Multi-model Orchestration & Chain Management',
    tags: ['orchestration', 'dsl', 'schema', 'yaml', 'json'],
    acceptanceCriteria: [
      'YAML/JSON schema defined for workflow specification',
      'Schema validation implemented with error reporting',
      'Documentation and examples provided',
      'Integration with existing graph editor planned'
    ]
  },
  {
    title: 'Implement execution engine supporting conditional paths & parallel branches',
    description: 'Build the core execution engine that can process workflow DSL and execute multi-model chains with support for conditional logic and parallel execution branches.',
    estimate: '12 hours',
    priority: 'high',
    wipClass: 'feature',
    story: '25.1',
    epic: 'Multi-model Orchestration & Chain Management',
    tags: ['execution-engine', 'conditional', 'parallel', 'orchestration'],
    acceptanceCriteria: [
      'Execution engine processes workflow DSL correctly',
      'Conditional paths execute based on runtime conditions',
      'Parallel branches execute concurrently',
      'Proper error handling and state management'
    ]
  },
  {
    title: 'Build input/output transformation layer between heterogeneous models',
    description: 'Create a transformation layer that handles data conversion and mapping between different model types, ensuring seamless data flow in multi-model chains.',
    estimate: '10 hours',
    priority: 'high',
    wipClass: 'feature',
    story: '25.1',
    epic: 'Multi-model Orchestration & Chain Management',
    tags: ['transformation', 'data-mapping', 'models', 'integration'],
    acceptanceCriteria: [
      'Transformation layer handles different data formats',
      'Model input/output mapping configured',
      'Data validation and error handling implemented',
      'Performance optimized for large data sets'
    ]
  },
  {
    title: 'Integrate cost & latency tracking per chain step',
    description: 'Add comprehensive monitoring for cost and performance metrics at each step of multi-model chain execution.',
    estimate: '6 hours',
    priority: 'medium',
    wipClass: 'feature',
    story: '25.1',
    epic: 'Multi-model Orchestration & Chain Management',
    tags: ['monitoring', 'cost-tracking', 'latency', 'performance'],
    acceptanceCriteria: [
      'Cost tracking implemented for each model call',
      'Latency metrics collected per chain step',
      'Metrics stored and queryable',
      'Real-time monitoring dashboard integration'
    ]
  },
  {
    title: 'Develop visualization UI of chain structure within graph editor',
    description: 'Extend the existing graph editor to visualize multi-model chains, showing model connections, data flow, and execution status.',
    estimate: '8 hours',
    priority: 'medium',
    wipClass: 'ui',
    story: '25.1',
    epic: 'Multi-model Orchestration & Chain Management',
    tags: ['visualization', 'graph-editor', 'ui', 'chains'],
    acceptanceCriteria: [
      'Chain visualization integrated into graph editor',
      'Model nodes show connection and flow',
      'Execution status visible during runtime',
      'Interactive chain editing supported'
    ]
  },
  {
    title: 'Add unit & integration tests for orchestration engine',
    description: 'Comprehensive test suite for the orchestration engine covering unit tests, integration tests, and end-to-end scenarios.',
    estimate: '6 hours',
    priority: 'high',
    wipClass: 'testing',
    story: '25.1',
    epic: 'Multi-model Orchestration & Chain Management',
    tags: ['testing', 'orchestration', 'unit-tests', 'integration'],
    acceptanceCriteria: [
      'Unit tests cover all engine components',
      'Integration tests validate end-to-end flows',
      'Error scenarios properly tested',
      'Test coverage meets project standards (80%+)'
    ]
  },
  {
    title: 'Document DSL, engine API, and examples',
    description: 'Create comprehensive documentation for the workflow DSL, orchestration engine API, and provide practical examples.',
    estimate: '4 hours',
    priority: 'medium',
    wipClass: 'documentation',
    story: '25.1',
    epic: 'Multi-model Orchestration & Chain Management',
    tags: ['documentation', 'dsl', 'api', 'examples'],
    acceptanceCriteria: [
      'DSL specification documented with examples',
      'Engine API reference complete',
      'Tutorial and getting started guide',
      'Code examples and best practices'
    ]
  },

  // Story 25.2 – Model Performance Optimization
  {
    title: 'Collect benchmark data for supported models across prompt types',
    description: 'Systematically collect performance benchmark data for all supported models across different prompt types and use cases.',
    estimate: '8 hours',
    priority: 'medium',
    wipClass: 'research',
    story: '25.2',
    epic: 'Multi-model Orchestration & Chain Management',
    tags: ['benchmarking', 'performance', 'models', 'data-collection'],
    acceptanceCriteria: [
      'Benchmark suite covering all supported models',
      'Data collected across different prompt types',
      'Performance metrics standardized',
      'Baseline performance data established'
    ]
  },
  {
    title: 'Build parameter tuning service (temperature, top-p, tokens)',
    description: 'Create a service that can automatically tune model parameters like temperature, top-p, and token limits for optimal performance.',
    estimate: '10 hours',
    priority: 'medium',
    wipClass: 'feature',
    story: '25.2',
    epic: 'Multi-model Orchestration & Chain Management',
    tags: ['parameter-tuning', 'optimization', 'models', 'automation'],
    acceptanceCriteria: [
      'Parameter tuning service implemented',
      'Supports temperature, top-p, and token tuning',
      'Optimization algorithms validated',
      'API for tuning parameter requests'
    ]
  },
  {
    title: 'Implement automatic optimization suggestions based on response quality/cost',
    description: 'Build intelligent system that analyzes response quality and cost to suggest optimal model configurations and parameters.',
    estimate: '12 hours',
    priority: 'medium',
    wipClass: 'feature',
    story: '25.2',
    epic: 'Multi-model Orchestration & Chain Management',
    tags: ['optimization', 'suggestions', 'quality', 'cost-analysis'],
    acceptanceCriteria: [
      'Quality assessment algorithms implemented',
      'Cost analysis integrated with suggestions',
      'Recommendation engine functional',
      'User interface for reviewing suggestions'
    ]
  },
  {
    title: 'Provide A/B testing harness for comparing optimization variants',
    description: 'Create testing framework that allows users to compare different optimization approaches and parameter sets.',
    estimate: '8 hours',
    priority: 'low',
    wipClass: 'feature',
    story: '25.2',
    epic: 'Multi-model Orchestration & Chain Management',
    tags: ['ab-testing', 'optimization', 'comparison', 'variants'],
    acceptanceCriteria: [
      'A/B testing framework implemented',
      'Statistical significance testing',
      'Variant comparison reporting',
      'Integration with optimization pipeline'
    ]
  },
  {
    title: 'Create dashboard for model performance analytics',
    description: 'Build dashboard interface showing model performance metrics, trends, and optimization recommendations.',
    estimate: '6 hours',
    priority: 'medium',
    wipClass: 'ui',
    story: '25.2',
    epic: 'Multi-model Orchestration & Chain Management',
    tags: ['dashboard', 'analytics', 'performance', 'visualization'],
    acceptanceCriteria: [
      'Performance analytics dashboard created',
      'Real-time metrics and trends displayed',
      'Historical performance data visualization',
      'Optimization recommendations surfaced'
    ]
  },
  {
    title: 'Write tests for tuning algorithms and analytics accuracy',
    description: 'Comprehensive test suite for parameter tuning algorithms and analytics accuracy validation.',
    estimate: '4 hours',
    priority: 'medium',
    wipClass: 'testing',
    story: '25.2',
    epic: 'Multi-model Orchestration & Chain Management',
    tags: ['testing', 'algorithms', 'analytics', 'validation'],
    acceptanceCriteria: [
      'Tuning algorithm tests implemented',
      'Analytics accuracy validation tests',
      'Edge case testing coverage',
      'Performance regression tests'
    ]
  },
  {
    title: 'Document optimization workflow',
    description: 'Create documentation for the model optimization workflow, including how to use tuning services and interpret results.',
    estimate: '3 hours',
    priority: 'low',
    wipClass: 'documentation',
    story: '25.2',
    epic: 'Multi-model Orchestration & Chain Management',
    tags: ['documentation', 'optimization', 'workflow', 'guide'],
    acceptanceCriteria: [
      'Optimization workflow documented',
      'User guide for tuning services',
      'Best practices and recommendations',
      'Troubleshooting and FAQ section'
    ]
  },

  // Story 25.3 – Fallback & Redundancy Systems
  {
    title: 'Design fallback strategy rules (quality threshold, error types, rate limits)',
    description: 'Define comprehensive fallback rules based on quality thresholds, specific error types, and rate limiting scenarios.',
    estimate: '6 hours',
    priority: 'high',
    wipClass: 'design',
    story: '25.3',
    epic: 'Multi-model Orchestration & Chain Management',
    tags: ['fallback', 'strategy', 'rules', 'quality'],
    acceptanceCriteria: [
      'Fallback strategy rules documented',
      'Quality threshold definitions established',
      'Error type categorization complete',
      'Rate limiting scenarios identified'
    ]
  },
  {
    title: 'Implement automatic model switching & retry logic',
    description: 'Build system that automatically switches between models and implements intelligent retry logic based on fallback rules.',
    estimate: '10 hours',
    priority: 'high',
    wipClass: 'feature',
    story: '25.3',
    epic: 'Multi-model Orchestration & Chain Management',
    tags: ['model-switching', 'retry-logic', 'automation', 'fallback'],
    acceptanceCriteria: [
      'Automatic model switching implemented',
      'Intelligent retry logic functional',
      'Fallback chain execution working',
      'State management across switches'
    ]
  },
  {
    title: 'Support cost-based routing and redundant execution modes',
    description: 'Implement routing logic that considers cost constraints and supports redundant execution for critical operations.',
    estimate: '8 hours',
    priority: 'medium',
    wipClass: 'feature',
    story: '25.3',
    epic: 'Multi-model Orchestration & Chain Management',
    tags: ['cost-routing', 'redundant-execution', 'routing', 'optimization'],
    acceptanceCriteria: [
      'Cost-based routing algorithm implemented',
      'Redundant execution modes supported',
      'Cost tracking integrated with routing',
      'Configuration options for execution modes'
    ]
  },
  {
    title: 'Add circuit breaker pattern for persistent failures',
    description: 'Implement circuit breaker pattern to handle persistent model failures and prevent cascading issues.',
    estimate: '6 hours',
    priority: 'high',
    wipClass: 'feature',
    story: '25.3',
    epic: 'Multi-model Orchestration & Chain Management',
    tags: ['circuit-breaker', 'failure-handling', 'resilience', 'pattern'],
    acceptanceCriteria: [
      'Circuit breaker pattern implemented',
      'Failure detection and recovery logic',
      'Configurable failure thresholds',
      'Graceful degradation handling'
    ]
  },
  {
    title: 'Surface fallback events in monitoring dashboards',
    description: 'Integrate fallback events and circuit breaker status into monitoring and alerting dashboards.',
    estimate: '4 hours',
    priority: 'medium',
    wipClass: 'monitoring',
    story: '25.3',
    epic: 'Multi-model Orchestration & Chain Management',
    tags: ['monitoring', 'fallback-events', 'dashboards', 'alerts'],
    acceptanceCriteria: [
      'Fallback events visible in dashboards',
      'Circuit breaker status monitoring',
      'Alert configuration for critical failures',
      'Historical fallback data tracking'
    ]
  },
  {
    title: 'Add tests simulating failure scenarios',
    description: 'Comprehensive test suite covering various failure scenarios and validating fallback behavior.',
    estimate: '6 hours',
    priority: 'high',
    wipClass: 'testing',
    story: '25.3',
    epic: 'Multi-model Orchestration & Chain Management',
    tags: ['testing', 'failure-scenarios', 'simulation', 'validation'],
    acceptanceCriteria: [
      'Failure scenario test suite implemented',
      'Model failure simulation framework',
      'Fallback behavior validation tests',
      'Recovery scenario testing'
    ]
  },
  {
    title: 'Document configuration options',
    description: 'Create documentation for all fallback and redundancy configuration options and best practices.',
    estimate: '3 hours',
    priority: 'low',
    wipClass: 'documentation',
    story: '25.3',
    epic: 'Multi-model Orchestration & Chain Management',
    tags: ['documentation', 'configuration', 'fallback', 'best-practices'],
    acceptanceCriteria: [
      'Configuration options documented',
      'Best practices guide created',
      'Example configurations provided',
      'Troubleshooting documentation'
    ]
  },

  // Story 25.4 – Chain Visualization & Debugging
  {
    title: 'Extend visualization engine (Epic 22) for chain execution paths & status',
    description: 'Enhance the visualization engine to show chain execution paths, current status, and real-time progress.',
    estimate: '8 hours',
    priority: 'medium',
    wipClass: 'ui',
    story: '25.4',
    epic: 'Multi-model Orchestration & Chain Management',
    tags: ['visualization', 'execution-paths', 'status', 'real-time'],
    acceptanceCriteria: [
      'Chain execution paths visualized',
      'Real-time status updates displayed',
      'Progress indicators implemented',
      'Integration with Epic 22 visualization'
    ],
    dependencies: ['Epic 22 visualization components']
  },
  {
    title: 'Display real-time metrics (latency, cost) on nodes/edges during runs',
    description: 'Show live performance metrics directly on the visual representation of chains during execution.',
    estimate: '6 hours',
    priority: 'medium',
    wipClass: 'ui',
    story: '25.4',
    epic: 'Multi-model Orchestration & Chain Management',
    tags: ['real-time-metrics', 'visualization', 'performance', 'ui'],
    acceptanceCriteria: [
      'Real-time metrics displayed on nodes',
      'Edge latency and cost visualization',
      'Performance data updates during execution',
      'Configurable metric display options'
    ]
  },
  {
    title: 'Implement execution playback & step-through debugging UI',
    description: 'Create debugging interface that allows users to replay chain execution and step through each stage.',
    estimate: '10 hours',
    priority: 'high',
    wipClass: 'ui',
    story: '25.4',
    epic: 'Multi-model Orchestration & Chain Management',
    tags: ['debugging', 'playback', 'step-through', 'ui'],
    acceptanceCriteria: [
      'Execution playback interface implemented',
      'Step-through debugging functional',
      'State inspection at each step',
      'Timeline navigation controls'
    ]
  },
  {
    title: 'Provide bottleneck identification & recommendations panel',
    description: 'Implement analysis tools that identify performance bottlenecks and provide optimization recommendations.',
    estimate: '8 hours',
    priority: 'medium',
    wipClass: 'feature',
    story: '25.4',
    epic: 'Multi-model Orchestration & Chain Management',
    tags: ['bottleneck-analysis', 'recommendations', 'optimization', 'analysis'],
    acceptanceCriteria: [
      'Bottleneck identification algorithms',
      'Recommendations panel interface',
      'Performance analysis reporting',
      'Actionable optimization suggestions'
    ]
  },
  {
    title: 'Capture logs/traces for each chain step',
    description: 'Implement comprehensive logging and tracing for all chain execution steps to support debugging and analysis.',
    estimate: '6 hours',
    priority: 'high',
    wipClass: 'infrastructure',
    story: '25.4',
    epic: 'Multi-model Orchestration & Chain Management',
    tags: ['logging', 'tracing', 'debugging', 'monitoring'],
    acceptanceCriteria: [
      'Comprehensive logging implemented',
      'Distributed tracing support',
      'Log correlation across chain steps',
      'Searchable and filterable logs'
    ]
  },
  {
    title: 'Write usability tests for debugging workflow',
    description: 'Create user experience tests to validate the effectiveness of debugging tools and workflows.',
    estimate: '4 hours',
    priority: 'medium',
    wipClass: 'testing',
    story: '25.4',
    epic: 'Multi-model Orchestration & Chain Management',
    tags: ['usability-testing', 'debugging', 'ux', 'workflow'],
    acceptanceCriteria: [
      'Usability test scenarios defined',
      'User workflow validation tests',
      'Debugging tool effectiveness metrics',
      'User feedback integration process'
    ]
  },
  {
    title: 'Update docs & tutorials',
    description: 'Create comprehensive documentation and tutorials for chain visualization and debugging features.',
    estimate: '4 hours',
    priority: 'low',
    wipClass: 'documentation',
    story: '25.4',
    epic: 'Multi-model Orchestration & Chain Management',
    tags: ['documentation', 'tutorials', 'debugging', 'visualization'],
    acceptanceCriteria: [
      'Debugging workflow documentation',
      'Visualization feature tutorials',
      'Step-by-step user guides',
      'Video tutorials and examples'
    ]
  },

  // Story 25.5 – Chain Template Library
  {
    title: 'Curate common multi-model scenarios (summarization + classification, etc.)',
    description: 'Research and curate a library of common multi-model chain scenarios and patterns.',
    estimate: '8 hours',
    priority: 'medium',
    wipClass: 'research',
    story: '25.5',
    epic: 'Multi-model Orchestration & Chain Management',
    tags: ['curation', 'templates', 'scenarios', 'patterns'],
    acceptanceCriteria: [
      'Common scenarios identified and documented',
      'Template patterns standardized',
      'Use case analysis completed',
      'Template metadata structure defined'
    ]
  },
  {
    title: 'Build template metadata schema (tags, expected inputs/outputs, performance)',
    description: 'Design schema for template metadata including tags, input/output specifications, and performance characteristics.',
    estimate: '6 hours',
    priority: 'high',
    wipClass: 'infrastructure',
    story: '25.5',
    epic: 'Multi-model Orchestration & Chain Management',
    tags: ['metadata', 'schema', 'templates', 'specification'],
    acceptanceCriteria: [
      'Template metadata schema defined',
      'Input/output specifications standardized',
      'Performance metrics schema created',
      'Validation rules implemented'
    ]
  },
  {
    title: 'Implement template browsing & insertion UI in editor',
    description: 'Create user interface for browsing available templates and inserting them into the graph editor.',
    estimate: '8 hours',
    priority: 'high',
    wipClass: 'ui',
    story: '25.5',
    epic: 'Multi-model Orchestration & Chain Management',
    tags: ['template-browser', 'ui', 'editor-integration', 'insertion'],
    acceptanceCriteria: [
      'Template browsing interface implemented',
      'Search and filter functionality',
      'Template insertion into editor',
      'Preview and metadata display'
    ]
  },
  {
    title: 'Enable community contribution & rating of templates',
    description: 'Implement system for community members to contribute templates and rate existing ones.',
    estimate: '10 hours',
    priority: 'low',
    wipClass: 'feature',
    story: '25.5',
    epic: 'Multi-model Orchestration & Chain Management',
    tags: ['community', 'contribution', 'rating', 'templates'],
    acceptanceCriteria: [
      'Template contribution workflow',
      'Rating and review system',
      'Moderation and quality controls',
      'Community recognition features'
    ]
  },
  {
    title: 'Provide performance benchmarks for each template',
    description: 'Generate and maintain performance benchmarks for all templates in the library.',
    estimate: '6 hours',
    priority: 'medium',
    wipClass: 'feature',
    story: '25.5',
    epic: 'Multi-model Orchestration & Chain Management',
    tags: ['benchmarks', 'performance', 'templates', 'metrics'],
    acceptanceCriteria: [
      'Benchmark data for all templates',
      'Performance comparison tools',
      'Regular benchmark updates',
      'Benchmark data visualization'
    ]
  },
  {
    title: 'Add automated tests ensuring template validity',
    description: 'Create automated testing system to validate template functionality and maintain quality.',
    estimate: '6 hours',
    priority: 'high',
    wipClass: 'testing',
    story: '25.5',
    epic: 'Multi-model Orchestration & Chain Management',
    tags: ['automated-testing', 'template-validation', 'quality', 'testing'],
    acceptanceCriteria: [
      'Automated template validation tests',
      'Template quality metrics',
      'Continuous testing pipeline',
      'Broken template detection and alerts'
    ]
  },
  {
    title: 'Document template creation guidelines',
    description: 'Create comprehensive guidelines for template creators including best practices and standards.',
    estimate: '4 hours',
    priority: 'low',
    wipClass: 'documentation',
    story: '25.5',
    epic: 'Multi-model Orchestration & Chain Management',
    tags: ['documentation', 'guidelines', 'templates', 'best-practices'],
    acceptanceCriteria: [
      'Template creation guidelines documented',
      'Best practices and standards defined',
      'Quality criteria and requirements',
      'Examples and tutorials provided'
    ]
  }
];

// Utility functions
function generateTaskId(story = '25') {
  const timestamp = Date.now().toString();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `E25-${timestamp}-${random}`;
}

async function loadCurrentState() {
  const stateFile = path.join(__dirname, 'data/state.json');
  
  try {
    const stateData = await fs.readFile(stateFile, 'utf8');
    return JSON.parse(stateData);
  } catch (error) {
    throw new Error(`Failed to load state.json: ${error.message}`);
  }
}

async function saveState(state) {
  const stateFile = path.join(__dirname, 'data/state.json');
  await fs.writeFile(stateFile, JSON.stringify(state, null, 2));
}

function taskExists(state, title) {
  return Object.values(state.tasks).some(task => 
    task.title && task.title.toLowerCase().trim() === title.toLowerCase().trim()
  );
}

function createTaskObject(taskDef, taskId) {
  return {
    id: taskId,
    title: taskDef.title,
    description: taskDef.description,
    state: 'UNASSIGNED',
    priority: taskDef.priority,
    estimate: taskDef.estimate,
    wipClass: taskDef.wipClass,
    epic: taskDef.epic,
    story: taskDef.story,
    tags: taskDef.tags,
    acceptanceCriteria: taskDef.acceptanceCriteria,
    dependencies: taskDef.dependencies || [],
    assignee: null,
    created: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    metadata: {
      source: 'epic25-automation',
      category: 'multi-model-orchestration',
      automated: true,
      epic: 'Multi-model Orchestration & Chain Management',
      storyNumber: taskDef.story,
      estimatedSprints: 10
    }
  };
}

async function createEpic25Tasks() {
  console.log('🚀 Creating Epic 25: Multi-model Orchestration & Chain Management Tasks\n');
  console.log('📋 Based on: docs/epic25plan.md');
  console.log('📊 Expected: 35 tasks across 5 stories\n');
  
  try {
    // Load current state
    let state = await loadCurrentState();
    
    if (!state.tasks) {
      state.tasks = {};
    }
    
    let tasksCreated = 0;
    let tasksSkipped = 0;
    const storyBreakdown = {
      '25.1': { created: 0, skipped: 0, name: 'Model Orchestration Framework' },
      '25.2': { created: 0, skipped: 0, name: 'Model Performance Optimization' },
      '25.3': { created: 0, skipped: 0, name: 'Fallback & Redundancy Systems' },
      '25.4': { created: 0, skipped: 0, name: 'Chain Visualization & Debugging' },
      '25.5': { created: 0, skipped: 0, name: 'Chain Template Library' }
    };
    
    // Process Epic 25 tasks
    for (const taskDef of epic25Tasks) {
      if (taskExists(state, taskDef.title)) {
        console.log(`⏭️  Skipping "${taskDef.title}" - already exists`);
        tasksSkipped++;
        storyBreakdown[taskDef.story].skipped++;
        continue;
      }
      
      const taskId = generateTaskId(taskDef.story);
      const task = createTaskObject(taskDef, taskId);
      
      state.tasks[taskId] = task;
      
      console.log(`✅ Created ${taskId}: "${taskDef.title}"`);
      console.log(`   📊 Story: ${taskDef.story} | Priority: ${taskDef.priority} | ⏱️  Estimate: ${taskDef.estimate}`);
      console.log(`   🏷️  Tags: ${taskDef.tags.join(', ')}`);
      
      if (taskDef.dependencies && taskDef.dependencies.length > 0) {
        console.log(`   🔗 Dependencies: ${taskDef.dependencies.join(', ')}`);
      }
      
      console.log('');
      
      tasksCreated++;
      storyBreakdown[taskDef.story].created++;
    }
    
    // Update state metadata
    if (!state.metadata) {
      state.metadata = {};
    }
    state.metadata.lastUpdated = new Date().toISOString();
    state.metadata.totalTasks = Object.keys(state.tasks).length;
    state.metadata.epic25TasksCreated = tasksCreated;
    
    // Save updated state
    await saveState(state);
    
    // Generate comprehensive summary
    console.log('📊 EPIC 25 TASK CREATION SUMMARY');
    console.log('================================\n');
    console.log(`✅ Tasks Created: ${tasksCreated}`);
    console.log(`⏭️  Tasks Skipped: ${tasksSkipped} (already exist)`);
    console.log(`📋 Total Tasks in System: ${Object.keys(state.tasks).length}\n`);
    
    // Story breakdown
    console.log('📋 TASKS BY STORY:\n');
    Object.entries(storyBreakdown).forEach(([storyNum, info]) => {
      const total = info.created + info.skipped;
      console.log(`📈 Story ${storyNum}: ${info.name}`);
      console.log(`   ✅ Created: ${info.created} tasks`);
      console.log(`   ⏭️  Skipped: ${info.skipped} tasks`);
      console.log(`   📊 Total: ${total} tasks\n`);
    });
    
    // Priority breakdown
    const createdTasks = Object.values(state.tasks).filter(task => 
      task.metadata?.source === 'epic25-automation'
    );
    
    const priorityBreakdown = createdTasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {});
    
    console.log('🎯 PRIORITY BREAKDOWN:');
    Object.entries(priorityBreakdown).forEach(([priority, count]) => {
      const emoji = priority === 'high' ? '🔥' : priority === 'medium' ? '⚡' : '📝';
      console.log(`   ${emoji} ${priority.toUpperCase()}: ${count} tasks`);
    });
    
    console.log('\n🤖 NEXT STEPS FOR AGENTS:\n');
    console.log('1. 🎯 Start with Story 25.1 (Model Orchestration Framework) - highest priority');
    console.log('2. 🔄 Use: `node src/grab-tasks.js <agent-id>` to grab Epic 25 tasks');
    console.log('3. 🏷️  Filter by tags: "orchestration", "dsl", "execution-engine"');
    console.log('4. ⏱️  Total effort: ~217 hours across 10 sprints');
    console.log('5. 📋 Dependencies: Epic 22 (visualization) required for Story 25.4\n');
    
    console.log('✨ Epic 25 tasks created successfully!');
    console.log('🚀 Multi-model orchestration implementation ready to begin!');
    
    return {
      created: tasksCreated,
      skipped: tasksSkipped,
      total: Object.keys(state.tasks).length,
      storyBreakdown,
      priorityBreakdown
    };
    
  } catch (error) {
    console.error('❌ Failed to create Epic 25 tasks:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  createEpic25Tasks().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { 
  createEpic25Tasks, 
  epic25Tasks 
};