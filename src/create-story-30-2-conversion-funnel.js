#!/usr/bin/env node

/**
 * Create Story 30.2 Conversion Funnel Analytics
 *
 * Creates a comprehensive formal user story for Story 30.2 based on the existing
 * Epic 30 breakdown. This story implements conversion tracking, funnel visualization
 * dashboard, and user behavior analytics for the marketplace, building on Story 30.1.
 *
 * Builds upon Epic 1 (Analytics Foundation) and Epic 16 (Marketplace System)
 * which are both complete.
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// Story 30.2 Definition
const story302Definition = {
  title: 'Story 30.2 - Conversion Funnel Analytics Implementation',
  description: `Implement comprehensive conversion funnel tracking and analytics system by building upon Epic 1's analytics foundation to track user journeys, analyze conversion rates, and provide actionable insights for marketplace optimization.

**Business Context:**
- Builds on completed Epic 1 (Analytics Foundation) and Epic 16 (Marketplace System)
- Depends on Story 30.1 (Revenue Analytics Foundation) for revenue context
- Critical for marketplace optimization and user conversion improvement

**Key Components:**
- Conversion tracking framework with 99.9% event capture accuracy
- Interactive funnel visualization dashboard with real-time updates
- User behavior analytics with pattern recognition and segmentation
- Conversion optimization recommendations based on data insights

**Technical Foundation:**
- Extends Epic 1's event tracking capabilities for conversion analytics
- Implements privacy-compliant user tracking with proper consent management
- Uses Epic 16's existing user and template data for conversion context
- Ensures cross-device tracking while respecting user privacy preferences`,

  estimate: '13 developer days',
  priority: 'high',
  wipClass: 'feature',
  epic: 'Epic 30 - Marketplace Analytics Integration',
  story: 'STORY-30-2-CONVERSION-FUNNEL',
  tags: [
    'marketplace',
    'analytics',
    'conversion',
    'funnel',
    'user-behavior',
    'dashboard'
  ],

  acceptanceCriteria: [
    'Conversion tracking with 99.9% event capture accuracy implemented',
    'Interactive funnel visualization dashboard with real-time updates functional',
    'User behavior analytics with pattern recognition and segmentation active',
    'Conversion optimization recommendations based on data insights available',
    'Integration with Epic 1 analytics infrastructure maintained',
    'Privacy-compliant user tracking with proper consent management',
    'Cross-device tracking functionality while respecting user privacy',
    'Real-time conversion event streaming and processing',
    'Funnel anomaly detection and alerting system operational',
    'Behavior-driven template recommendations integrated'
  ],

  businessValue:
    'Optimize user conversion rates and reduce drop-off through comprehensive funnel analytics, providing actionable insights for marketplace growth',

  // Implementation broken down by the three main substories
  implementationTasks: [
    {
      title: '30.2.1 - Design Conversion Tracking Architecture',
      description:
        'Define conversion events across marketplace user journey and create session tracking integration with Epic 1 analytics',
      estimate: '1 day',
      priority: 'high',
      tags: ['architecture', 'conversion-tracking', 'epic1-integration'],
      acceptance: [
        'Conversion events defined across complete marketplace user journey',
        'Session tracking integration with Epic 1 analytics designed',
        'Cross-device user identification and tracking architecture planned',
        'Attribution models for multi-touch conversions specified'
      ]
    },
    {
      title: '30.2.1 - Implement Conversion Event Tracking',
      description:
        'Build client-side tracking SDK extending Epic 1 analytics and create server-side conversion event API endpoints',
      estimate: '1.5 days',
      priority: 'high',
      tags: ['tracking-sdk', 'api-endpoints', 'real-time-streaming'],
      acceptance: [
        'Client-side tracking SDK extending Epic 1 analytics built',
        'Server-side conversion event API endpoints created',
        'Real-time conversion event streaming implemented',
        'Conversion event validation and deduplication active'
      ]
    },
    {
      title: '30.2.1 - Create Conversion Data Model',
      description:
        'Design conversion funnel step definitions and implement conversion event schema with flexible properties',
      estimate: '1 day',
      priority: 'high',
      tags: ['data-model', 'schema-design', 'funnel-steps'],
      acceptance: [
        'Conversion funnel step definitions and metadata designed',
        'Conversion event schema with flexible properties implemented',
        'Conversion cohort and segment tracking structures created',
        'Conversion data relationships with user and template entities established'
      ]
    },
    {
      title: '30.2.1 - Develop Conversion Analytics Infrastructure',
      description:
        'Build conversion data processing pipeline using Epic 1 infrastructure and implement metric calculation',
      estimate: '0.5 days',
      priority: 'medium',
      tags: ['analytics-pipeline', 'metrics', 'data-warehouse'],
      acceptance: [
        'Conversion data processing pipeline using Epic 1 infrastructure built',
        'Conversion metric calculation and aggregation implemented',
        'Conversion data warehouse integration created',
        'Conversion analytics data export and API capabilities added'
      ]
    },
    {
      title: '30.2.2 - Design Funnel Analysis Interface',
      description:
        'Create interactive funnel visualization components and design multi-step funnel configuration',
      estimate: '1.5 days',
      priority: 'high',
      tags: ['ui-design', 'funnel-visualization', 'configuration'],
      acceptance: [
        'Interactive funnel visualization components created',
        'Multi-step funnel configuration and customization designed',
        'Funnel comparison and A/B testing integration planned',
        'Funnel segmentation and filtering capabilities created'
      ]
    },
    {
      title: '30.2.2 - Implement Core Funnel Visualizations',
      description:
        'Build step-by-step conversion rate visualization and create conversion drop-off analysis',
      estimate: '2 days',
      priority: 'high',
      tags: ['visualization', 'conversion-rates', 'drop-off-analysis'],
      acceptance: [
        'Step-by-step conversion rate visualization built',
        'Conversion drop-off analysis and heatmaps created',
        'Time-based funnel performance tracking implemented',
        'Cohort-based funnel analysis capabilities added'
      ]
    },
    {
      title: '30.2.2 - Create Advanced Funnel Analytics',
      description:
        'Build funnel optimization recommendation engine and implement anomaly detection',
      estimate: '1 day',
      priority: 'medium',
      tags: ['optimization', 'recommendations', 'anomaly-detection'],
      acceptance: [
        'Funnel optimization recommendation engine built',
        'Funnel anomaly detection and alerting implemented',
        'Funnel attribution analysis for marketing channels created',
        'Predictive funnel performance modeling added'
      ]
    },
    {
      title: '30.2.2 - Integrate with Marketplace User Experience',
      description:
        'Embed funnel insights into marketplace optimization tools and create creator-facing recommendations',
      estimate: '0.5 days',
      priority: 'medium',
      tags: ['marketplace-integration', 'creator-tools', 'optimization'],
      acceptance: [
        'Funnel insights embedded into marketplace optimization tools',
        'Creator-facing conversion optimization recommendations created',
        'Funnel performance indicators added to template analytics',
        'Automated funnel optimization suggestions implemented'
      ]
    },
    {
      title: '30.2.3 - Implement User Journey Tracking',
      description:
        'Build comprehensive user session recording and create behavior pattern recognition algorithms',
      estimate: '2 days',
      priority: 'high',
      tags: ['user-journey', 'session-recording', 'behavior-patterns'],
      acceptance: [
        'Comprehensive user session recording and analysis built',
        'User behavior pattern recognition algorithms created',
        'User engagement scoring and segmentation implemented',
        'User lifecycle stage tracking and progression analysis added'
      ]
    },
    {
      title: '30.2.3 - Create Behavior Analytics Dashboard',
      description:
        'Build user behavior flow visualization and create engagement metrics and trend analysis',
      estimate: '1.5 days',
      priority: 'high',
      tags: ['behavior-dashboard', 'flow-visualization', 'engagement-metrics'],
      acceptance: [
        'User behavior flow visualization and analysis tools built',
        'User engagement metrics and trend analysis created',
        'User retention analysis and churn prediction implemented',
        'User preference and recommendation analytics added'
      ]
    },
    {
      title: '30.2.3 - Develop Personalization Analytics',
      description:
        'Create user preference learning systems and implement recommendation effectiveness tracking',
      estimate: '0.5 days',
      priority: 'medium',
      tags: ['personalization', 'preference-learning', 'recommendations'],
      acceptance: [
        'User preference learning and modeling systems created',
        'Recommendation system effectiveness tracking implemented',
        'Personalization A/B testing and optimization framework built',
        'User experience optimization based on behavior analytics added'
      ]
    },
    {
      title: '30.2.3 - Integrate Behavior Insights with Marketplace',
      description:
        'Create behavior-driven template recommendations and implement user experience optimization automation',
      estimate: '0.5 days',
      priority: 'medium',
      tags: [
        'marketplace-integration',
        'template-recommendations',
        'automation'
      ],
      acceptance: [
        'Behavior-driven template recommendations created',
        'User experience optimization automation implemented',
        'Behavior-based marketing campaign targeting added',
        'User lifecycle marketing automation triggers created'
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
  } catch (error) {
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
        'Story 30.1 (Revenue Analytics Foundation) - Required for revenue context'
      ],
      technicalNotes: [
        'Extend Epic 1 event tracking capabilities for conversion analytics',
        'Implement privacy-compliant user tracking with proper consent management',
        'Use Epic 16 existing user and template data for conversion context',
        'Ensure cross-device tracking while respecting user privacy preferences'
      ]
    },
    created: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    metadata: {
      source: 'epic30-story-breakdown',
      category: 'marketplace-analytics',
      automated: true,
      priority_level: storyDef.priority === 'high' ? 1 : 2,
      business_impact: 'high',
      epic_number: 30,
      story_number: '30.2',
      effort_days: 13,
      dependencies_complete: true,
      ready_for_development: true
    }
  };
}

function createImplementationTasks(storyId, implementationTasks, state) {
  let createdTasks = [];

  implementationTasks.forEach((taskDef, index) => {
    const taskId = generateTaskId('T-30-2');

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
      storyNumber: '30.2',
      substory: taskDef.title.match(/30\.2\.(\d+)/)?.[0] || null,
      tags: taskDef.tags,
      acceptanceCriteria: taskDef.acceptance,
      dependencies: index > 0 ? [createdTasks[index - 1].id] : [],
      businessValue:
        'Enables conversion funnel optimization and user behavior insights for marketplace growth',
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
        source: 'story-30-2-breakdown',
        category: 'conversion-funnel-analytics',
        automated: true,
        priority_level: taskDef.priority === 'high' ? 1 : 2,
        parent_story: storyId,
        sequence_order: index + 1,
        substory_group: taskDef.title.match(/30\.2\.(\d+)/)?.[1] || 'general',
        epic_number: 30,
        story_number: '30.2'
      }
    };

    state.tasks[taskId] = task;
    createdTasks.push(task);
  });

  return createdTasks;
}

async function createStory302() {
  console.log('📊 Creating Story 30.2 - Conversion Funnel Analytics...\n');
  console.log('🎯 Epic 30: Marketplace Analytics Integration');
  console.log(
    '📈 Building conversion tracking, funnel visualization, and user behavior analytics'
  );
  console.log(
    '🔗 Dependencies: Epic 1 (Complete), Epic 16 (Complete), Story 30.1 (Revenue context)\n'
  );

  try {
    // Load current state
    let state = await loadCurrentState();

    if (!state.stories) {
      state.stories = {};
    }
    if (!state.tasks) {
      state.tasks = {};
    }

    let storiesCreated = 0;
    let tasksCreated = 0;

    // Check if story already exists
    if (storyExists(state, story302Definition.title)) {
      console.log(
        '⏭️  Story already exists - updating with latest requirements...'
      );
    }

    const storyId = generateTaskId('STORY-30-2');
    const story = createStoryObject(story302Definition, storyId);

    state.stories[storyId] = story;
    storiesCreated++;

    // Create implementation tasks
    console.log('📝 Creating Implementation Tasks...\n');

    const implementationTasks = createImplementationTasks(
      storyId,
      story302Definition.implementationTasks,
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
      1: 'Funnel Data Collection Framework',
      2: 'Funnel Visualization Dashboard',
      3: 'User Behavior Analytics'
    };

    Object.entries(substoryGroups).forEach(([group, name]) => {
      console.log(`📊 Substory 30.2.${group}: ${name}`);
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
    console.log('📊 STORY 30.2 CREATION SUMMARY\n');
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
      '   • Comprehensive conversion funnel tracking with 99.9% accuracy'
    );
    console.log(
      '   • Interactive funnel visualization dashboard with real-time updates'
    );
    console.log(
      '   • User behavior analytics with pattern recognition and segmentation'
    );
    console.log(
      '   • Conversion optimization recommendations based on data insights'
    );
    console.log(
      '   • Privacy-compliant user tracking with proper consent management\n'
    );

    console.log('📈 EXPECTED OUTCOMES:');
    console.log(
      '   • Improved user conversion rates through funnel optimization'
    );
    console.log('   • Reduced drop-off rates with behavior-driven insights');
    console.log(
      '   • Enhanced marketplace user experience through personalization'
    );
    console.log('   • Data-driven template recommendations for users');
    console.log('   • Automated conversion optimization suggestions\n');

    // Show technical foundation
    console.log('🔧 TECHNICAL FOUNDATION:\n');
    console.log('✅ Dependencies Complete:');
    console.log(
      '   • Epic 1 (Analytics Foundation) - Provides event tracking infrastructure'
    );
    console.log(
      '   • Epic 16 (Marketplace System) - Provides user and template data'
    );
    console.log('📋 Required for Development:');
    console.log(
      '   • Story 30.1 (Revenue Analytics Foundation) - Revenue context for conversions\n'
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
          `   ${index + 1}. ${task.title.replace(/30\.2\.\d+ - /, '')} (${task.estimate})`
        );
      });
      console.log('');
    });

    // Agent instructions
    console.log('🤖 NEXT STEPS FOR DEVELOPMENT AGENTS:\n');
    console.log('1. 🔧 Grab Story 30.2 tasks for development:');
    console.log(`   node src/grab-tasks.js <agent-id> 4 --story=${storyId}`);
    console.log(
      '2. 📋 Ensure Story 30.1 (Revenue Analytics) is complete first'
    );
    console.log('3. 🏗️  Start with 30.2.1 Funnel Data Collection Framework');
    console.log(
      '4. 📊 Implement conversion tracking architecture and event tracking'
    );
    console.log('5. 🎨 Build funnel visualization dashboard components');
    console.log(
      '6. 👥 Implement user behavior analytics and personalization\n'
    );

    console.log(
      '📊 Story 30.2 provides comprehensive conversion funnel analytics!'
    );
    console.log('⏰ Timeline: 13 developer days (approximately 2.5 weeks)');
    console.log(
      '💡 Success Metrics: 99.9% conversion tracking accuracy, real-time funnel insights'
    );

    return {
      story: story,
      tasks: implementationTasks,
      created: storiesCreated,
      tasksCreated: tasksCreated,
      total: Object.keys(state.tasks).length
    };
  } catch (error) {
    console.error('❌ Failed to create Story 30.2:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  createStory302().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = {
  createStory302,
  story302Definition
};
