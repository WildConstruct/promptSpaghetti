#!/usr/bin/env node

/**
 * Create Task Assignment System Fix Story
 *
 * Creates a comprehensive user story for fixing the highest priority QA blocker:
 * Task Assignment System Mismatch where --priority-only flag assigns Epic 19
 * tasks despite explicit business deprioritization in IMMEDIATE-PRIORITIES.md.
 *
 * This critical issue wastes developer resources on non-business-critical work
 * instead of focusing on $2.3B Epic 8 film industry opportunity and authentication
 * system completion.
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// Priority Story: Task Assignment System Fix
const taskAssignmentSystemStory = {
  title: 'Fix Task Assignment Priority Filtering System (Critical QA Blocker)',
  description: `Fix critical task assignment system mismatch where --priority-only flag continues to assign Epic 19 privacy/compliance tasks despite explicit business deprioritization in IMMEDIATE-PRIORITIES.md. This wastes developer resources on non-business-critical work instead of focusing on $2.3B Epic 8 film industry opportunity and 80% complete authentication system.

**Current Problem:**
- Epic 19 explicitly marked as "STOP WORKING ON" in IMMEDIATE-PRIORITIES.md
- System keeps assigning Epic 19 tasks even with priority filtering
- Development effort wasted on non-revenue-generating privacy framework
- Developer time not aligned with business priorities ($2.3B Epic 8 opportunity blocked)

**Business Impact:**
- Lost development velocity on authentication system (80% complete)
- Blocked progress on Epic 8 demo readiness (film industry opportunity)
- Waste of development resources on deprioritized work
- Team coordination breakdown between business strategy and task execution`,

  estimate: '6 hours',
  priority: 'critical',
  wipClass: 'infrastructure',
  epic: 'Task Management & Coordination System',
  story: 'TASK-ASSIGNMENT-FIX',
  tags: [
    'task-management',
    'priority-system',
    'automation',
    'business-alignment',
    'qa-blocker'
  ],

  acceptanceCriteria: [
    'Epic 19 tasks are completely excluded from --priority-only flag results',
    'Task assignment system respects IMMEDIATE-PRIORITIES.md business deprioritization',
    'Priority filtering correctly identifies Epic 8, authentication, and file browser tasks as high priority',
    'grab-tasks.js --priority-only only returns business-critical work (Epic 8, auth, file browser)',
    'Epic 19 tasks remain in database but are not assigned to developers through automation',
    'Business priority alignment is validated through automated tests',
    'Task assignment audit log shows alignment with business priorities',
    'QA validation confirms Epic 19 work stops being auto-assigned'
  ],

  businessValue:
    'Aligns development resources with $2.3B Epic 8 opportunity instead of wasting effort on deprioritized privacy features',

  // Break down into specific implementable tasks
  implementationTasks: [
    {
      title: 'Analyze Current Priority Filtering Logic',
      description:
        'Review grab-tasks.js --priority-only implementation to identify why Epic 19 tasks are being included despite business deprioritization',
      estimate: '1 hour',
      priority: 'critical',
      tags: ['analysis', 'debugging', 'priority-system'],
      acceptance: [
        'Current priority filtering logic documented',
        'Epic 19 task inclusion root cause identified',
        'Business priority mapping gaps found',
        'Scope of required fixes determined'
      ]
    },
    {
      title: 'Implement Epic 19 Exclusion in Priority Filtering',
      description:
        'Add explicit Epic 19 exclusion logic to --priority-only flag to respect IMMEDIATE-PRIORITIES.md business deprioritization',
      estimate: '2 hours',
      priority: 'critical',
      tags: ['implementation', 'priority-filtering', 'business-alignment'],
      acceptance: [
        'Epic 19 tasks excluded from --priority-only results',
        'Exclusion logic handles all Epic 19 task variations',
        'Business deprioritization rules implemented in code',
        'Priority filtering respects IMMEDIATE-PRIORITIES.md'
      ]
    },
    {
      title: 'Add Business Priority Mapping System',
      description:
        'Create explicit business priority mapping that connects IMMEDIATE-PRIORITIES.md requirements to task assignment logic',
      estimate: '2 hours',
      priority: 'high',
      tags: ['mapping', 'business-logic', 'documentation-integration'],
      acceptance: [
        'Business priority mapping system created',
        'IMMEDIATE-PRIORITIES.md requirements integrated into code',
        'Epic 8, authentication, and file browser tasks marked as business-critical',
        'Dynamic priority adjustment based on business document changes'
      ]
    },
    {
      title: 'Create Task Assignment Audit System',
      description:
        'Build audit logging to track which tasks are assigned and validate alignment with business priorities',
      estimate: '1 hour',
      priority: 'medium',
      tags: ['audit', 'logging', 'validation', 'monitoring'],
      acceptance: [
        'Task assignment audit log implemented',
        'Business priority alignment tracking functional',
        'Epic 19 assignment attempts logged and blocked',
        'Audit report shows task distribution aligns with business priorities'
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
    status: 'READY_FOR_TASKS',
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
    created: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    metadata: {
      source: 'qa-analysis',
      category: 'critical-blocker',
      automated: true,
      priority_level: storyDef.priority === 'critical' ? 0 : 1,
      business_impact: 'high',
      qa_blocker: true,
      epic_category: 'Task Management System'
    }
  };
}

function createImplementationTasks(storyId, implementationTasks, state) {
  let createdTasks = [];

  implementationTasks.forEach((taskDef, index) => {
    const taskId = generateTaskId('TASK');

    const task = {
      id: taskId,
      title: taskDef.title,
      description: taskDef.description,
      state: 'UNASSIGNED',
      priority: taskDef.priority,
      estimate: taskDef.estimate,
      wipClass: 'infrastructure',
      epic: 'Task Management & Coordination System',
      story: storyId,
      tags: taskDef.tags,
      acceptanceCriteria: taskDef.acceptance,
      dependencies: index > 0 ? [createdTasks[index - 1].id] : [],
      businessValue:
        'Ensures developer resources focus on business-critical work',
      assignee: 'Unassigned',
      created: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      metadata: {
        source: 'story-breakdown',
        category: 'task-assignment-fix',
        automated: true,
        priority_level: taskDef.priority === 'critical' ? 0 : 1,
        parent_story: storyId,
        sequence_order: index + 1
      }
    };

    state.tasks[taskId] = task;
    createdTasks.push(task);
  });

  return createdTasks;
}

async function createTaskAssignmentStory() {
  console.log(
    '🚨 Creating Critical QA Blocker Story: Task Assignment System Fix...\n'
  );
  console.log('📋 This addresses the highest priority QA blocker:');
  console.log(
    '   ISSUE: --priority-only flag assigns Epic 19 tasks despite business deprioritization'
  );
  console.log(
    '   IMPACT: Wasted developer effort on non-business-critical privacy features'
  );
  console.log(
    '   SOLUTION: Fix priority filtering to align with IMMEDIATE-PRIORITIES.md\n'
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
    if (storyExists(state, taskAssignmentSystemStory.title)) {
      console.log(
        '⏭️  Story already exists - updating with latest requirements...'
      );
    }

    const storyId = generateTaskId('STORY-TASK-ASSIGNMENT');
    const story = createStoryObject(taskAssignmentSystemStory, storyId);

    state.stories[storyId] = story;
    storiesCreated++;

    // Create implementation tasks
    console.log('📝 Creating Implementation Tasks...\n');

    const implementationTasks = createImplementationTasks(
      storyId,
      taskAssignmentSystemStory.implementationTasks,
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
    state.metadata.qaBlockerStoriesCreated = storiesCreated;

    // Save updated state
    await saveState(state);

    console.log(`✅ Created Story: ${story.title}`);
    console.log(
      `   📊 Priority: ${story.priority} | ⏱️  Estimate: ${story.estimate}`
    );
    console.log(`   🎯 Business Value: ${story.businessValue}`);
    console.log('');

    // Show created implementation tasks
    implementationTasks.forEach((task, index) => {
      console.log(`✅ Created Task ${index + 1}: ${task.title}`);
      console.log(
        `   ID: ${task.id} | ⏱️  ${task.estimate} | 📊 ${task.priority} priority`
      );
      if (task.dependencies.length > 0) {
        console.log(`   🔗 Depends on: ${task.dependencies.join(', ')}`);
      }
      console.log('');
    });

    // Generate comprehensive summary
    console.log('📊 TASK ASSIGNMENT STORY CREATION SUMMARY\n');
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
    console.log('🎯 PROBLEM SOLVED:');
    console.log(
      '   • Stops wasting developer time on deprioritized Epic 19 privacy features'
    );
    console.log(
      '   • Redirects effort to $2.3B Epic 8 film industry opportunity'
    );
    console.log('   • Completes 80% finished authentication system faster');
    console.log('   • Aligns technical execution with business strategy\n');

    console.log('📈 EXPECTED OUTCOMES:');
    console.log('   • 100% developer focus on business-critical work');
    console.log('   • Faster completion of Epic 8 demo-ready proof of concept');
    console.log('   • Authentication system deployment unblocked');
    console.log('   • Improved team coordination and business alignment\n');

    // Show implementation sequence
    console.log('🔄 IMPLEMENTATION SEQUENCE:\n');
    implementationTasks.forEach((task, index) => {
      console.log(`${index + 1}. ${task.title} (${task.estimate})`);
      console.log(`   🎯 ${task.acceptanceCriteria[0]}`);
    });
    console.log('');

    // Agent instructions
    console.log('🤖 NEXT STEPS FOR AGENTS:\n');
    console.log(
      '1. 🔧 Development Agents should grab these tasks immediately:'
    );
    console.log(`   node src/grab-tasks.js <agent-id> 4 --story=${storyId}`);
    console.log(
      '2. 📝 Start with analysis task to understand current priority filtering logic'
    );
    console.log(
      '3. 🚫 Implement Epic 19 exclusion in grab-tasks.js --priority-only flag'
    );
    console.log(
      '4. ✅ Test that Epic 19 tasks are no longer auto-assigned to developers'
    );
    console.log(
      '5. 📊 Validate business priority alignment through audit system\n'
    );

    console.log(
      '🚨 CRITICAL: This fixes the highest priority QA blocker preventing proper task assignment!'
    );
    console.log(
      '⏰ Timeline: 6 hours total - should be completed within 1 business day'
    );
    console.log(
      '💡 Success Metric: Zero Epic 19 tasks assigned via --priority-only automation'
    );

    return {
      story: story,
      tasks: implementationTasks,
      created: storiesCreated,
      tasksCreated: tasksCreated,
      total: Object.keys(state.tasks).length
    };
  } catch (error) {
    console.error('❌ Failed to create task assignment story:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  createTaskAssignmentStory().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = {
  createTaskAssignmentStory,
  taskAssignmentSystemStory
};
