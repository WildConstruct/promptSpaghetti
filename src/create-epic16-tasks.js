#!/usr/bin/env node

/**
 * Create Epic 16 Tasks Script
 * 
 * Converts Epic 16 (Marketplace & Community Features) plan
 * into executable tasks in the task management system.
 * 
 * Based on: docs/epic16plan.md
 * Note: Only processes uncompleted tasks (marked with [ ])
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// Function to extract pending tasks from the Epic 16 plan file
async function extractTasksFromEpic16Plan() {
  const planPath = path.join(__dirname, '..', 'docs', 'epic16plan.md');
  const content = await fs.readFile(planPath, 'utf8');
  
  // Extract all pending checkbox tasks from the plan ([ ] not [x])
  const taskMatches = content.match(/^- \[ \] .+$/gm);
  
  if (!taskMatches) {
    console.log('ℹ️  All Epic 16 tasks appear to be completed - no pending tasks found');
    return [];
  }
  
  // Process tasks and organize by story context
  const tasks = [];
  let currentStory = null;
  let currentSubstory = null;
  
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Detect story headers
    if (line.match(/^## Story \d+\.\d+/)) {
      currentStory = line.match(/## Story (\d+\.\d+) - (.+?)(?:\s+✅\s+\*\*COMPLETE\*\*)?$/);
    }
    
    // Detect substory headers  
    if (line.match(/^#### \d+\.\d+\.\d+/)) {
      currentSubstory = line.match(/#### (\d+\.\d+\.\d+) (.+?) \((.+?)\)(?:\s+✅\s+\*\*COMPLETE\*\*)?$/);
    }
    
    // Process only pending task items (not completed ones)
    if (line.match(/^- \[ \] /) && !line.match(/^- \[x\] /)) {
      const taskTitle = line.replace(/^- \[ \] /, '');
      
      // Determine story context
      let story = '16';
      let storyName = 'Marketplace & Community Features';
      
      if (currentStory) {
        story = currentStory[1];
        storyName = currentStory[2];
      }
      
      // Determine priority and estimate based on task content
      let priority = 'medium';
      let estimate = '4 hours';
      let wipClass = 'feature';
      
      // High priority for core architecture, design, and transaction systems
      if (taskTitle.toLowerCase().includes('architecture') || 
          taskTitle.toLowerCase().includes('design') || 
          taskTitle.toLowerCase().includes('transaction') ||
          taskTitle.toLowerCase().includes('payment') ||
          taskTitle.toLowerCase().includes('security') ||
          taskTitle.toLowerCase().includes('system') ||
          taskTitle.toLowerCase().includes('framework')) {
        priority = 'high';
        estimate = '6 hours';
        wipClass = 'infrastructure';
      }
      
      // UI and interface tasks
      else if (taskTitle.toLowerCase().includes('ui') || 
               taskTitle.toLowerCase().includes('interface') ||
               taskTitle.toLowerCase().includes('component') ||
               taskTitle.toLowerCase().includes('layout') ||
               taskTitle.toLowerCase().includes('visualization') ||
               taskTitle.toLowerCase().includes('editor')) {
        priority = 'medium';
        estimate = '5 hours';
        wipClass = 'ui';
      }
      
      // Core implementation and development tasks  
      else if (taskTitle.toLowerCase().includes('implement') || 
               taskTitle.toLowerCase().includes('develop') ||
               taskTitle.toLowerCase().includes('build') ||
               taskTitle.toLowerCase().includes('create') ||
               taskTitle.toLowerCase().includes('marketplace') ||
               taskTitle.toLowerCase().includes('analytics')) {
        priority = 'high';
        estimate = '6 hours';
        wipClass = 'feature';
      }
      
      // Testing and validation tasks
      else if (taskTitle.toLowerCase().includes('test') || 
               taskTitle.toLowerCase().includes('validation') ||
               taskTitle.toLowerCase().includes('verification') ||
               taskTitle.toLowerCase().includes('conduct') ||
               taskTitle.toLowerCase().includes('analyze')) {
        priority = 'medium';
        estimate = '3 hours';
        wipClass = 'testing';
      }
      
      // Documentation and content tasks
      else if (taskTitle.toLowerCase().includes('document') || 
               taskTitle.toLowerCase().includes('guide') ||
               taskTitle.toLowerCase().includes('specification') ||
               taskTitle.toLowerCase().includes('plan') ||
               taskTitle.toLowerCase().includes('wireframe')) {
        priority = 'low';
        estimate = '2 hours';
        wipClass = 'documentation';
      }
      
      // Assign tags based on task content
      const tags = [];
      if (taskTitle.toLowerCase().includes('marketplace') || taskTitle.toLowerCase().includes('template')) tags.push('marketplace');
      if (taskTitle.toLowerCase().includes('search') || taskTitle.toLowerCase().includes('filter')) tags.push('search');
      if (taskTitle.toLowerCase().includes('rating') || taskTitle.toLowerCase().includes('review')) tags.push('rating-system');
      if (taskTitle.toLowerCase().includes('payment') || taskTitle.toLowerCase().includes('transaction')) tags.push('payments');
      if (taskTitle.toLowerCase().includes('license') || taskTitle.toLowerCase().includes('licensing')) tags.push('licensing');
      if (taskTitle.toLowerCase().includes('creator') || taskTitle.toLowerCase().includes('publisher')) tags.push('creator-tools');
      if (taskTitle.toLowerCase().includes('analytics') || taskTitle.toLowerCase().includes('dashboard')) tags.push('analytics');
      if (taskTitle.toLowerCase().includes('community') || taskTitle.toLowerCase().includes('social')) tags.push('community');
      if (taskTitle.toLowerCase().includes('profile') || taskTitle.toLowerCase().includes('user')) tags.push('user-profiles');
      if (taskTitle.toLowerCase().includes('forum') || taskTitle.toLowerCase().includes('discussion')) tags.push('forums');
      if (taskTitle.toLowerCase().includes('comment') || taskTitle.toLowerCase().includes('discussion')) tags.push('comments');
      if (taskTitle.toLowerCase().includes('moderation') || taskTitle.toLowerCase().includes('flagging')) tags.push('moderation');
      if (taskTitle.toLowerCase().includes('sharing') || taskTitle.toLowerCase().includes('embed')) tags.push('sharing');
      if (taskTitle.toLowerCase().includes('knowledge') || taskTitle.toLowerCase().includes('tutorial')) tags.push('knowledge-base');
      if (taskTitle.toLowerCase().includes('help') || taskTitle.toLowerCase().includes('support')) tags.push('help-system');
      if (taskTitle.toLowerCase().includes('monetization') || taskTitle.toLowerCase().includes('pricing')) tags.push('monetization');
      if (taskTitle.toLowerCase().includes('version') || taskTitle.toLowerCase().includes('versioning')) tags.push('version-control');
      if (taskTitle.toLowerCase().includes('submission') || taskTitle.toLowerCase().includes('upload')) tags.push('submission');
      if (taskTitle.toLowerCase().includes('ui') || taskTitle.toLowerCase().includes('component')) tags.push('ui');
      if (taskTitle.toLowerCase().includes('api') || taskTitle.toLowerCase().includes('backend')) tags.push('api');
      if (taskTitle.toLowerCase().includes('security') || taskTitle.toLowerCase().includes('validation')) tags.push('security');
      if (taskTitle.toLowerCase().includes('workflow') || taskTitle.toLowerCase().includes('process')) tags.push('workflow');
      if (taskTitle.toLowerCase().includes('recommendation') || taskTitle.toLowerCase().includes('algorithm')) tags.push('recommendation');
      
      // Default tags if none assigned
      if (tags.length === 0) {
        tags.push('marketplace-features');
      }
      
      // Generate detailed description
      let description = `Implement ${taskTitle.toLowerCase()} as part of Epic 16 - Marketplace & Community Features.`;
      
      if (currentSubstory) {
        description += ` This task is part of substory ${currentSubstory[1]} (${currentSubstory[2]}) with estimated duration ${currentSubstory[3]}.`;
      }
      
      // Add specific technical details based on task type
      if (taskTitle.includes('marketplace') || taskTitle.includes('template')) {
        description += ' Includes template discovery, categorization, search functionality, and user-friendly marketplace interface development.';
      } else if (taskTitle.includes('transaction') || taskTitle.includes('payment')) {
        description += ' Includes secure payment processing, transaction management, invoice generation, and financial compliance implementation.';
      } else if (taskTitle.includes('search') || taskTitle.includes('filter')) {
        description += ' Includes search algorithm implementation, filtering mechanisms, faceted search, and performance optimization for large datasets.';
      } else if (taskTitle.includes('rating') || taskTitle.includes('review')) {
        description += ' Includes rating aggregation, review submission and display, moderation tools, and sentiment analysis capabilities.';
      } else if (taskTitle.includes('license') || taskTitle.includes('licensing')) {
        description += ' Includes license generation, validation, enforcement, usage tracking, and flexible licensing model implementation.';
      } else if (taskTitle.includes('creator') || taskTitle.includes('analytics')) {
        description += ' Includes performance metrics, revenue tracking, user engagement analytics, and comprehensive reporting dashboard.';
      } else if (taskTitle.includes('community') || taskTitle.includes('social')) {
        description += ' Includes user interaction features, social functionality, community building tools, and engagement mechanisms.';
      } else if (taskTitle.includes('forum') || taskTitle.includes('discussion')) {
        description += ' Includes threaded discussions, forum management, moderation tools, and community interaction features.';
      } else if (taskTitle.includes('moderation') || taskTitle.includes('flagging')) {
        description += ' Includes automated content filtering, manual moderation tools, flagging systems, and abuse prevention mechanisms.';
      } else if (taskTitle.includes('knowledge') || taskTitle.includes('tutorial')) {
        description += ' Includes educational content management, tutorial creation tools, learning path development, and knowledge organization.';
      } else if (taskTitle.includes('UI') || taskTitle.includes('component')) {
        description += ' Includes responsive interface development, component library creation, user experience optimization, and cross-platform compatibility.';
      }
      
      // Generate acceptance criteria
      const acceptanceCriteria = [];
      
      if (taskTitle.includes('marketplace') || taskTitle.includes('template')) {
        acceptanceCriteria.push('Marketplace interface provides intuitive template discovery');
        acceptanceCriteria.push('Template categorization and organization works effectively');
        acceptanceCriteria.push('Search and browsing functionality meets user expectations');
        acceptanceCriteria.push('Performance scales with large template catalogs');
      }
      
      if (taskTitle.includes('transaction') || taskTitle.includes('payment')) {
        acceptanceCriteria.push('Payment processing handles all supported payment methods securely');
        acceptanceCriteria.push('Transaction flow provides clear confirmation and receipts');
        acceptanceCriteria.push('Financial compliance and security requirements are met');
        acceptanceCriteria.push('Error handling provides helpful user feedback');
      }
      
      if (taskTitle.includes('search') || taskTitle.includes('filter')) {
        acceptanceCriteria.push('Search results are relevant and well-ranked');
        acceptanceCriteria.push('Filtering options cover all important template attributes');
        acceptanceCriteria.push('Search performance meets response time requirements');
        acceptanceCriteria.push('Advanced search features work intuitively');
      }
      
      if (taskTitle.includes('rating') || taskTitle.includes('review')) {
        acceptanceCriteria.push('Rating system accurately represents user opinions');
        acceptanceCriteria.push('Review submission and display process is user-friendly');
        acceptanceCriteria.push('Moderation tools prevent abuse and maintain quality');
        acceptanceCriteria.push('Rating aggregation provides meaningful insights');
      }
      
      if (taskTitle.includes('license') || taskTitle.includes('licensing')) {
        acceptanceCriteria.push('License terms are clearly presented and enforceable');
        acceptanceCriteria.push('License validation prevents unauthorized usage');
        acceptanceCriteria.push('Usage tracking provides accurate reporting');
        acceptanceCriteria.push('License management is accessible to creators');
      }
      
      if (taskTitle.includes('creator') || taskTitle.includes('analytics')) {
        acceptanceCriteria.push('Analytics provide actionable insights for creators');
        acceptanceCriteria.push('Dashboard displays key metrics clearly and accurately');
        acceptanceCriteria.push('Reporting tools meet creator business needs');
        acceptanceCriteria.push('Performance metrics update in near real-time');
      }
      
      if (taskTitle.includes('community') || taskTitle.includes('social')) {
        acceptanceCriteria.push('Social features enhance user engagement');
        acceptanceCriteria.push('Community interaction tools are easy to use');
        acceptanceCriteria.push('User profiles provide meaningful information');
        acceptanceCriteria.push('Privacy controls protect user information appropriately');
      }
      
      if (taskTitle.includes('forum') || taskTitle.includes('discussion')) {
        acceptanceCriteria.push('Forum structure supports organized discussions');
        acceptanceCriteria.push('Threading and reply functionality works intuitively');
        acceptanceCriteria.push('Moderation tools maintain community standards');
        acceptanceCriteria.push('Search and navigation help users find relevant content');
      }
      
      if (taskTitle.includes('moderation') || taskTitle.toLowerCase().includes('flagging')) {
        acceptanceCriteria.push('Automated moderation catches obvious policy violations');
        acceptanceCriteria.push('Manual moderation tools are efficient for human reviewers');
        acceptanceCriteria.push('Flagging system enables community self-moderation');
        acceptanceCriteria.push('Appeals process provides fair conflict resolution');
      }
      
      if (taskTitle.includes('knowledge') || taskTitle.includes('tutorial')) {
        acceptanceCriteria.push('Knowledge base is well-organized and searchable');
        acceptanceCriteria.push('Tutorial system provides clear learning progression');
        acceptanceCriteria.push('Content quality meets educational standards');
        acceptanceCriteria.push('User contribution system maintains content quality');
      }
      
      if (taskTitle.includes('UI') || taskTitle.includes('component')) {
        acceptanceCriteria.push('UI components work consistently across devices');
        acceptanceCriteria.push('Interface design follows established design system');
        acceptanceCriteria.push('User interactions are intuitive and responsive');
        acceptanceCriteria.push('Accessibility standards are met');
      }
      
      if (taskTitle.includes('test') || taskTitle.includes('validation')) {
        acceptanceCriteria.push('Test coverage meets Epic 16 standards (85%+)');
        acceptanceCriteria.push('All marketplace functions tested thoroughly');
        acceptanceCriteria.push('Security testing confirms protection against threats');
        acceptanceCriteria.push('Performance testing validates scalability');
      }
      
      // Default acceptance criteria
      if (acceptanceCriteria.length === 0) {
        acceptanceCriteria.push('Marketplace/community feature implemented and functional');
        acceptanceCriteria.push('Integration with existing Epic 16 system verified');
        acceptanceCriteria.push('User experience meets design requirements');
      }
      
      tasks.push({
        title: taskTitle,
        description,
        estimate,
        priority,
        wipClass,
        story,
        storyName,
        epic: 'Marketplace & Community Features',
        tags,
        acceptanceCriteria
      });
    }
  }
  
  return tasks;
}

// Utility functions
function generateTaskId() {
  const timestamp = Date.now().toString();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `E16-${timestamp}-${random}`;
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
      source: 'epic16-automation',
      category: 'marketplace-community-features',
      automated: true,
      epic: 'Marketplace & Community Features',
      storyNumber: taskDef.story,
      storyName: taskDef.storyName,
      completionStatus: 'Epic 16 has foundation elements complete (transaction system, rating/review system) - processing marketplace and community features'
    }
  };
}

async function createEpic16Tasks() {
  console.log('🏪 Creating Epic 16: Marketplace & Community Features Tasks\n');
  console.log('📋 Based on: docs/epic16plan.md');
  console.log('ℹ️  Note: Epic 16 has foundation systems complete (transactions, ratings) - processing marketplace and community features\n');
  
  try {
    // Extract tasks from Epic 16 plan
    const epic16Tasks = await extractTasksFromEpic16Plan();
    
    if (epic16Tasks.length === 0) {
      console.log('🎉 All Epic 16 tasks are already complete!');
      console.log('🏪 Epic 16 Status: 100% complete - Production-ready Marketplace & Community Features');
      return {
        created: 0,
        skipped: 0,
        total: 0,
        allComplete: true
      };
    }
    
    console.log(`📝 Extracted ${epic16Tasks.length} remaining tasks from Epic 16 plan\n`);
    
    // Load current state
    let state = await loadCurrentState();
    
    if (!state.tasks) {
      state.tasks = {};
    }
    
    let tasksCreated = 0;
    let tasksSkipped = 0;
    const storyBreakdown = {};
    const priorityBreakdown = {};
    const wipClassBreakdown = {};
    const featureBreakdown = {};
    
    // Process Epic 16 tasks
    for (const taskDef of epic16Tasks) {
      if (taskExists(state, taskDef.title)) {
        console.log(`⏭️  Skipping "${taskDef.title}" - already exists`);
        tasksSkipped++;
        continue;
      }
      
      const taskId = generateTaskId();
      const task = createTaskObject(taskDef, taskId);
      
      state.tasks[taskId] = task;
      
      console.log(`✅ Created ${taskId}: "${taskDef.title}"`);
      console.log(`   📊 Story: ${taskDef.story} | Priority: ${taskDef.priority} | ⏱️  Estimate: ${taskDef.estimate}`);
      console.log(`   🏷️  Tags: ${taskDef.tags.join(', ')}`);
      console.log('');
      
      tasksCreated++;
      
      // Update breakdowns
      storyBreakdown[taskDef.story] = (storyBreakdown[taskDef.story] || 0) + 1;
      priorityBreakdown[taskDef.priority] = (priorityBreakdown[taskDef.priority] || 0) + 1;
      wipClassBreakdown[taskDef.wipClass] = (wipClassBreakdown[taskDef.wipClass] || 0) + 1;
      
      // Track feature types
      const featureTypes = ['marketplace', 'community', 'payments', 'rating-system', 'creator-tools', 'knowledge-base'];
      featureTypes.forEach(featureType => {
        if (taskDef.tags.some(tag => tag.includes(featureType))) {
          featureBreakdown[featureType] = (featureBreakdown[featureType] || 0) + 1;
        }
      });
    }
    
    // Update state metadata
    if (!state.metadata) {
      state.metadata = {};
    }
    state.metadata.lastUpdated = new Date().toISOString();
    state.metadata.totalTasks = Object.keys(state.tasks).length;
    state.metadata.epic16TasksCreated = tasksCreated;
    
    // Save updated state
    await saveState(state);
    
    // Generate comprehensive summary
    console.log('📊 EPIC 16 TASK CREATION SUMMARY');
    console.log('=================================\n');
    console.log(`✅ Tasks Created: ${tasksCreated}`);
    console.log(`⏭️  Tasks Skipped: ${tasksSkipped} (already exist)`);
    console.log(`📋 Total Tasks in System: ${Object.keys(state.tasks).length}\n`);
    
    if (tasksCreated > 0) {
      // Story breakdown
      console.log('📋 REMAINING TASKS BY STORY:\n');
      Object.entries(storyBreakdown).forEach(([story, count]) => {
        console.log(`📈 Story ${story}: ${count} tasks`);
      });
      console.log('');
      
      // Priority breakdown
      console.log('🎯 PRIORITY BREAKDOWN:');
      Object.entries(priorityBreakdown).forEach(([priority, count]) => {
        const emoji = priority === 'high' ? '🔥' : priority === 'medium' ? '⚡' : '📝';
        console.log(`   ${emoji} ${priority.toUpperCase()}: ${count} tasks`);
      });
      console.log('');
      
      // WIP Class breakdown
      console.log('🏗️ WIP CLASS BREAKDOWN:');
      Object.entries(wipClassBreakdown).forEach(([wipClass, count]) => {
        const emoji = wipClass === 'infrastructure' ? '🏗️' : 
                     wipClass === 'ui' ? '🎨' : 
                     wipClass === 'testing' ? '🧪' : 
                     wipClass === 'documentation' ? '📚' : '⚙️';
        console.log(`   ${emoji} ${wipClass.toUpperCase()}: ${count} tasks`);
      });
      console.log('');
      
      // Feature breakdown
      if (Object.keys(featureBreakdown).length > 0) {
        console.log('🏪 MARKETPLACE FEATURES:');
        Object.entries(featureBreakdown).forEach(([featureType, count]) => {
          const emoji = featureType === 'marketplace' ? '🏪' : 
                       featureType === 'community' ? '👥' : 
                       featureType === 'payments' ? '💳' : 
                       featureType === 'rating-system' ? '⭐' : 
                       featureType === 'creator-tools' ? '🛠️' : 
                       featureType === 'knowledge-base' ? '📚' : '🏪';
          console.log(`   ${emoji} ${featureType.toUpperCase().replace('-', ' ')}: ${count} tasks`);
        });
        console.log('');
      }
    }
    
    console.log('\n🤖 NEXT STEPS FOR AGENTS:\n');
    console.log('1. 🎯 Focus on high-priority marketplace UI and template discovery');
    console.log('2. 🔄 Use: `node src/grab-tasks.js <agent-id>` to grab Epic 16 tasks');
    console.log('3. 🏷️  Filter by tags: "marketplace", "community", "creator-tools", "rating-system"');
    console.log('4. ⏱️  Foundation systems (transactions, ratings) complete - build marketplace features');
    console.log('5. 📋 Start with marketplace UI, then community features, then knowledge base\n');
    
    console.log('✨ Epic 16 remaining tasks processed successfully!');
    console.log('🏪 Marketplace & Community Features implementation ready!');
    console.log('📈 Epic 16 Status: Foundation systems complete, marketplace and community features ready for implementation');
    
    return {
      created: tasksCreated,
      skipped: tasksSkipped,
      total: Object.keys(state.tasks).length,
      storyBreakdown,
      priorityBreakdown,
      wipClassBreakdown,
      featureBreakdown
    };
    
  } catch (error) {
    console.error('❌ Failed to create Epic 16 tasks:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  createEpic16Tasks().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { 
  createEpic16Tasks,
  extractTasksFromEpic16Plan
};