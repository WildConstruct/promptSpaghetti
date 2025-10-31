#!/usr/bin/env node

/**
 * Create Story 30.3 Template Performance Analytics
 *
 * Creates a comprehensive formal user story for Story 30.3 based on the existing
 * Epic 30 breakdown. This story implements template metrics collection, performance
 * dashboards, and content quality analytics for marketplace creators.
 *
 * Builds upon Epic 1 (Analytics Foundation), Epic 16 (Marketplace System)
 * which are both complete, and requires Story 30.1 & 30.2 for context.
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// Story 30.3 Definition
const story303Definition = {
  title: 'Story 30.3 - Template Performance Analytics Implementation',
  description: `Implement comprehensive template performance tracking and analytics system by building upon Epic 1's analytics foundation to measure template usage, quality, and marketplace performance, providing creators with actionable insights for optimization.

**Business Context:**
- Builds on completed Epic 1 (Analytics Foundation) and Epic 16 (Marketplace System)
- Depends on Story 30.1 (Revenue Analytics Foundation) and Story 30.2 (Conversion Funnel Analytics) for context
- Critical for template quality improvement and marketplace creator success

**Key Components:**
- Template performance data model with real-time metrics collection
- Creator dashboard with actionable template optimization insights
- Content quality scoring system with automated recommendations
- Template analytics API with comprehensive data access and reporting
- Integration with Epic 16 marketplace ranking and discovery systems

**Technical Foundation:**
- Extends Epic 1's analytics capabilities for template-specific metrics
- Integrates with Epic 16's existing template and creator data models
- Implements quality scoring algorithms with configurable weighting
- Ensures template analytics support A/B testing and experimentation`,

  estimate: '10 developer days',
  priority: 'high',
  wipClass: 'feature',
  epic: 'Epic 30 - Marketplace Analytics Integration',
  story: 'STORY-30-3-TEMPLATE-PERFORMANCE',
  tags: [
    'marketplace',
    'analytics',
    'template-performance',
    'quality-scoring',
    'creator-dashboard',
    'content-quality'
  ],

  acceptanceCriteria: [
    'Template performance tracking with real-time metrics updates implemented',
    'Creator dashboard with actionable template optimization insights functional',
    'Quality scoring system with automated recommendations active',
    'Template analytics API with comprehensive data access available',
    'Integration with Epic 16 marketplace ranking and discovery systems complete',
    'Template usage event tracking extending Epic 1 analytics operational',
    'Template quality assessment algorithms with configurable weighting functional',
    'Template A/B testing and optimization framework integrated',
    'Quality-based template recommendation algorithms implemented',
    'Creator performance alerts and notifications system active'
  ],

  businessValue:
    'Improve template quality and marketplace performance by providing creators with comprehensive analytics and optimization insights, enhancing overall marketplace value',

  // Implementation broken down by the three main substories
  implementationTasks: [
    {
      title: '30.3.1 - Design Template Performance Data Model',
      description:
        'Create comprehensive template usage tracking schema and define template performance metrics with lifecycle tracking',
      estimate: '0.5 days',
      priority: 'high',
      tags: ['data-model', 'template-metrics', 'epic1-integration'],
      acceptance: [
        'Comprehensive template usage tracking schema created',
        'Template performance metrics and KPIs defined',
        'Template quality scoring algorithms implemented',
        'Template lifecycle tracking and analytics established'
      ]
    },
    {
      title: '30.3.1 - Implement Template Analytics Collection',
      description:
        'Build template usage event tracking extending Epic 1 analytics and create performance data aggregation pipelines',
      estimate: '1 day',
      priority: 'high',
      tags: ['analytics-collection', 'event-tracking', 'real-time-metrics'],
      acceptance: [
        'Template usage event tracking extending Epic 1 analytics built',
        'Template performance data aggregation pipelines created',
        'Real-time template metrics calculation implemented',
        'Template analytics data validation and quality assurance added'
      ]
    },
    {
      title: '30.3.1 - Create Template Analytics API',
      description:
        'Build RESTful endpoints for template performance queries and implement GraphQL schema for analytics data',
      estimate: '1 day',
      priority: 'high',
      tags: ['api-development', 'restful-endpoints', 'graphql-schema'],
      acceptance: [
        'RESTful endpoints for template performance queries built',
        'GraphQL schema for template analytics data implemented',
        'Template analytics data export and reporting capabilities added',
        'Template performance comparison and benchmarking APIs created'
      ]
    },
    {
      title: '30.3.1 - Develop Template Recommendation Analytics',
      description:
        'Build template popularity and trending algorithms with similarity clustering and performance prediction',
      estimate: '0.5 days',
      priority: 'medium',
      tags: [
        'recommendation-algorithms',
        'popularity-tracking',
        'prediction-models'
      ],
      acceptance: [
        'Template popularity and trending algorithms built',
        'Template similarity and clustering analytics created',
        'Template performance prediction models implemented',
        'Template optimization recommendation system added'
      ]
    },
    {
      title: '30.3.2 - Design Template Analytics Interface',
      description:
        'Create template performance dashboard wireframes and define creator analytics views with optimization recommendations',
      estimate: '1 day',
      priority: 'high',
      tags: ['ui-design', 'dashboard-wireframes', 'creator-analytics'],
      acceptance: [
        'Template performance dashboard wireframes and layouts created',
        'Template creator analytics and insights views defined',
        'Template marketplace optimization recommendations planned',
        'Template performance comparison and benchmarking tools designed'
      ]
    },
    {
      title: '30.3.2 - Implement Template Performance Visualizations',
      description:
        'Build template usage trends and analytics charts with popularity ranking and quality score dashboards',
      estimate: '1.5 days',
      priority: 'high',
      tags: ['data-visualization', 'usage-trends', 'quality-dashboards'],
      acceptance: [
        'Template usage trends and analytics charts built',
        'Template popularity and ranking visualizations created',
        'Template quality score dashboards implemented',
        'Template revenue and monetization analytics added'
      ]
    },
    {
      title: '30.3.2 - Create Advanced Template Analytics',
      description:
        'Build template A/B testing framework and implement performance anomaly detection with lifecycle optimization',
      estimate: '1 day',
      priority: 'medium',
      tags: ['ab-testing', 'anomaly-detection', 'lifecycle-analytics'],
      acceptance: [
        'Template A/B testing and optimization framework built',
        'Template performance anomaly detection implemented',
        'Template lifecycle analytics and optimization created',
        'Template market opportunity and gap analysis added'
      ]
    },
    {
      title: '30.3.2 - Integrate with Epic 16 Marketplace Creator Tools',
      description:
        'Embed template analytics into creator dashboard and create optimization recommendations with performance alerts',
      estimate: '0.5 days',
      priority: 'medium',
      tags: [
        'marketplace-integration',
        'creator-dashboard',
        'alerts-notifications'
      ],
      acceptance: [
        'Template analytics embedded into creator dashboard',
        'Template optimization recommendations and insights created',
        'Template performance alerts and notifications added',
        'Template marketplace positioning recommendations implemented'
      ]
    },
    {
      title: '30.3.3 - Implement Content Quality Scoring',
      description:
        'Create automated content quality assessment algorithms with completeness scoring and user feedback integration',
      estimate: '1.5 days',
      priority: 'high',
      tags: ['quality-scoring', 'content-assessment', 'user-feedback'],
      acceptance: [
        'Automated content quality assessment algorithms created',
        'Template completeness and usability scoring built',
        'User feedback and rating analytics integration implemented',
        'Content quality trend analysis and optimization added'
      ]
    },
    {
      title: '30.3.3 - Create Quality Analytics Dashboard',
      description:
        'Build content quality metrics visualization and create improvement recommendation system with benchmarking tools',
      estimate: '1 day',
      priority: 'high',
      tags: ['quality-dashboard', 'metrics-visualization', 'benchmarking'],
      acceptance: [
        'Content quality metrics visualization built',
        'Quality improvement recommendation system created',
        'Quality benchmarking and comparison tools implemented',
        'Quality-based template promotion and featuring analytics added'
      ]
    },
    {
      title: '30.3.3 - Develop Quality Optimization Tools',
      description:
        'Create automated content quality improvement suggestions and build quality-based ranking with alert systems',
      estimate: '0.5 days',
      priority: 'medium',
      tags: [
        'quality-optimization',
        'automated-suggestions',
        'ranking-algorithms'
      ],
      acceptance: [
        'Automated content quality improvement suggestions created',
        'Quality-based template ranking and discovery built',
        'Quality alert and notification system implemented',
        'Quality analytics integration with creator tools added'
      ]
    },
    {
      title: '30.3.3 - Integrate Quality Metrics with Marketplace Algorithms',
      description:
        'Create quality-weighted template recommendation algorithms and implement quality-based search optimization',
      estimate: '0.5 days',
      priority: 'medium',
      tags: [
        'marketplace-algorithms',
        'quality-weighted',
        'search-optimization'
      ],
      acceptance: [
        'Quality-weighted template recommendation algorithms created',
        'Quality-based search and discovery optimization implemented',
        'Quality metrics added to marketplace ranking algorithms',
        'Quality-driven marketplace curation automation created'
      ]
    }
  ]
};

// Utility functions
function generateTaskId(prefix = 'STORY') {
  const timestamp = Date.now().toString().slice(-6);
  const random = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

async function loadCurrentState() {
  const stateFile = path.join(__dirname, 'data/state.json');

  try {
    const stateData = await fs.readFile(stateFile, 'utf8');
    return JSON.parse(stateData);
  } catch {
    // Create new state if file doesn't exist
    return {
      tasks: {},
      stories: {},
      metadata: {
        created: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      }
    };
  }
}

async function saveState(state) {
  const stateFile = path.join(__dirname, 'data/state.json');
  await fs.writeFile(stateFile, JSON.stringify(state, null, 2));
}

function storyExists(state, title) {
  return Object.values(state.stories || {}).some(
    story => story.title && story.title.toLowerCase() === title.toLowerCase()
  );
}

function createStoryObject(storyDef, storyId) {
  return {
    id: storyId,
    title: storyDef.title,
    description: storyDef.description,
    status: 'READY_FOR_DEVELOPMENT',
    priority: storyDef.priority,
    estimate: storyDef.estimate,
    wipClass: storyDef.wipClass,
    epic: storyDef.epic,
    story: storyDef.story,
    tags: storyDef.tags,
    acceptanceCriteria: storyDef.acceptanceCriteria,
    businessValue: storyDef.businessValue,
    implementationTasks: storyDef.implementationTasks,
    assignee: 'Unassigned',
    devAgentRecord: {
      assignedAgent: null,
      workStarted: null,
      estimatedCompletion: null,
      actualCompletion: null,
      blockers: [],
      progress: {
        phase: 'Planning',
        completedTasks: 0,
        totalTasks: storyDef.implementationTasks.length,
        percentage: 0
      },
      dependencies: [
        'Epic 1 (Analytics Foundation) - COMPLETE',
        'Epic 16 (Marketplace System) - COMPLETE',
        'Story 30.1 (Revenue Analytics Foundation) - Required for revenue context',
        'Story 30.2 (Conversion Funnel Analytics) - Required for user behavior context'
      ],
      technicalNotes: [
        'Extend Epic 1 analytics capabilities for template-specific metrics',
        'Integrate with Epic 16 existing template and creator data models',
        'Implement quality scoring algorithms with configurable weighting',
        'Ensure template analytics support A/B testing and experimentation'
      ]
    },
    created: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    metadata: {
      source: 'epic30-story-breakdown',
      category: 'template-performance-analytics',
      automated: true,
      priority_level: storyDef.priority === 'high' ? 1 : 2,
      business_impact: 'high',
      epic_number: 30,
      story_number: '30.3',
      effort_days: 10,
      dependencies_complete: false, // Requires 30.1 and 30.2
      ready_for_development: false // Blocked by dependencies
    }
  };
}

function createImplementationTasks(storyId, implementationTasks, state) {
  const createdTasks = [];

  implementationTasks.forEach((taskDef, index) => {
    const taskId = generateTaskId('T-30-3');

    const task = {
      id: taskId,
      title: taskDef.title,
      description: taskDef.description,
      state: 'UNASSIGNED',
      priority: taskDef.priority,
      estimate: taskDef.estimate,
      wipClass: 'feature',
      epic: 'Epic 30 - Marketplace Analytics Integration',
      story: storyId,
      storyNumber: '30.3',
      substory: taskDef.title.match(/30\.3\.(\d+)/)?.[0] || null,
      tags: taskDef.tags,
      acceptanceCriteria: taskDef.acceptance,
      dependencies: index > 0 ? [createdTasks[index - 1].id] : [],
      businessValue:
        'Enables template performance optimization and quality improvement for marketplace creators',
      assignee: 'Unassigned',
      devAgentRecord: {
        assignedAgent: null,
        workStarted: null,
        estimatedCompletion: null,
        actualCompletion: null,
        blockers: [],
        timeTracking: {
          estimated: taskDef.estimate,
          actual: null,
          started: null,
          completed: null
        }
      },
      created: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      metadata: {
        source: 'story-30-3-breakdown',
        category: 'template-performance-analytics',
        automated: true,
        priority_level: taskDef.priority === 'high' ? 1 : 2,
        parent_story: storyId,
        sequence_order: index + 1,
        substory_group: taskDef.title.match(/30\.3\.(\d+)/)?.[1] || 'general',
        epic_number: 30,
        story_number: '30.3'
      }
    };

    state.tasks[taskId] = task;
    createdTasks.push(task);
  });

  return createdTasks;
}

async function createStory303() {
  console.log('📊 Creating Story 30.3 - Template Performance Analytics...\n');
  console.log('🎯 Epic 30: Marketplace Analytics Integration');
  console.log(
    '📈 Building template metrics, performance dashboards, and content quality analytics'
  );
  console.log(
    '🔗 Dependencies: Epic 1 (Complete), Epic 16 (Complete), Story 30.1 & 30.2 (Required)\n'
  );

  try {
    // Load current state
    const state = await loadCurrentState();

    if (!state.stories) {
      state.stories = {};
    }
    if (!state.tasks) {
      state.tasks = {};
    }

    let storiesCreated = 0;
    let tasksCreated = 0;

    // Check if story already exists
    if (storyExists(state, story303Definition.title)) {
      console.log(
        '⏭️  Story already exists - updating with latest requirements...'
      );
    }

    const storyId = generateTaskId('STORY-30-3');
    const story = createStoryObject(story303Definition, storyId);

    state.stories[storyId] = story;
    storiesCreated++;

    // Create implementation tasks
    console.log('📝 Creating Implementation Tasks...\n');

    const implementationTasks = createImplementationTasks(
      storyId,
      story303Definition.implementationTasks,
      state
    );

    tasksCreated = implementationTasks.length;

    // Update state metadata
    if (!state.metadata) {
      state.metadata = {};
    }
    state.metadata.lastUpdated = new Date().toISOString();
    state.metadata.totalStories = Object.keys(state.stories).length;
    state.metadata.totalTasks = Object.keys(state.tasks).length;
    state.metadata.epic30StoriesCreated =
      (state.metadata.epic30StoriesCreated || 0) + storiesCreated;

    // Save updated state
    await saveState(state);

    console.log(`✅ Created Story: ${story.title}`);
    console.log(
      `   📊 Priority: ${story.priority} | ⏱️  Estimate: ${story.estimate}`
    );
    console.log(`   🎯 Business Value: ${story.businessValue}`);
    console.log(`   📋 Status: ${story.status}`);
    console.log('');

    // Show substory groupings
    const substoryGroups = {
      1: 'Template Metrics Collection Framework',
      2: 'Template Performance Dashboard',
      3: 'Content Quality Analytics'
    };

    Object.entries(substoryGroups).forEach(([group, name]) => {
      console.log(`📊 Substory 30.3.${group}: ${name}`);
      const groupTasks = implementationTasks.filter(
        task => task.metadata.substory_group === group
      );
      groupTasks.forEach(task => {
        console.log(`   ✅ ${task.title}`);
        console.log(
          `      ID: ${task.id} | ⏱️  ${task.estimate} | 📊 ${task.priority} priority`
        );
      });
      console.log('');
    });

    // Generate comprehensive summary
    console.log('📊 STORY 30.3 CREATION SUMMARY\n');
    console.log('='.repeat(60));
    console.log(`✅ Stories Created: ${storiesCreated}`);
    console.log(`✅ Implementation Tasks Created: ${tasksCreated}`);
    console.log(
      `📋 Total Stories in System: ${Object.keys(state.stories).length}`
    );
    console.log(
      `📋 Total Tasks in System: ${Object.keys(state.tasks).length}\n`
    );

    // Show business impact
    console.log('💰 BUSINESS IMPACT:\n');
    console.log('🎯 VALUE DELIVERED:');
    console.log(
      '   • Template performance tracking with real-time metrics updates'
    );
    console.log(
      '   • Creator dashboard with actionable template optimization insights'
    );
    console.log('   • Quality scoring system with automated recommendations');
    console.log('   • Template analytics API with comprehensive data access');
    console.log(
      '   • Integration with Epic 16 marketplace ranking and discovery systems\n'
    );

    console.log('📈 EXPECTED OUTCOMES:');
    console.log('   • Improved template quality through data-driven insights');
    console.log(
      '   • Enhanced creator success with optimization recommendations'
    );
    console.log('   • Better marketplace performance through quality scoring');
    console.log('   • Increased template discoverability and usage');
    console.log('   • Automated quality-based curation and promotion\n');

    // Show technical foundation
    console.log('🔧 TECHNICAL FOUNDATION:\n');
    console.log('✅ Dependencies Complete:');
    console.log(
      '   • Epic 1 (Analytics Foundation) - Provides analytics infrastructure'
    );
    console.log(
      '   • Epic 16 (Marketplace System) - Provides template and creator data'
    );
    console.log('📋 Required for Development:');
    console.log(
      '   • Story 30.1 (Revenue Analytics Foundation) - Revenue context for templates'
    );
    console.log(
      '   • Story 30.2 (Conversion Funnel Analytics) - User behavior context\n'
    );

    // Show implementation sequence
    console.log('🔄 IMPLEMENTATION SEQUENCE:\n');
    Object.entries(substoryGroups).forEach(([group, name]) => {
      console.log(`📊 Phase ${group}: ${name}`);
      const groupTasks = implementationTasks.filter(
        task => task.metadata.substory_group === group
      );
      groupTasks.forEach((task, index) => {
        console.log(
          `   ${index + 1}. ${task.title.replace(/30\.3\.\d+ - /, '')} (${task.estimate})`
        );
      });
      console.log('');
    });

    // Agent instructions
    console.log('🤖 NEXT STEPS FOR DEVELOPMENT AGENTS:\n');
    console.log('1. 🔧 Ensure Story 30.1 and 30.2 are complete first');
    console.log('2. 📋 Grab Story 30.3 tasks for development:');
    console.log(`   node src/grab-tasks.js <agent-id> 4 --story=${storyId}`);
    console.log(
      '3. 🏗️  Start with 30.3.1 Template Metrics Collection Framework'
    );
    console.log(
      '4. 📊 Implement template analytics collection and API endpoints'
    );
    console.log(
      '5. 🎨 Build template performance dashboard and visualizations'
    );
    console.log(
      '6. 🏆 Implement content quality analytics and optimization tools\n'
    );

    console.log(
      '📊 Story 30.3 provides comprehensive template performance analytics!'
    );
    console.log('⏰ Timeline: 10 developer days (approximately 2 weeks)');
    console.log(
      '💡 Success Metrics: Real-time template metrics, quality scoring, creator insights'
    );

    return {
      story: story,
      tasks: implementationTasks,
      created: storiesCreated,
      tasksCreated: tasksCreated,
      total: Object.keys(state.tasks).length
    };
  } catch (error) {
    console.error('❌ Failed to create Story 30.3:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  createStory303().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = {
  createStory303,
  story303Definition
};
