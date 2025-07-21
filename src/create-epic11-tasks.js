#!/usr/bin/env node

/**
 * Create Epic 11 Tasks Script
 * 
 * Converts Epic 11 (Authentication & User Management) plan
 * into executable tasks in the task management system.
 * 
 * Based on: docs/epic11plan.md
 * Note: Only processes uncompleted tasks (marked with [ ])
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// Function to extract pending tasks from the Epic 11 plan file
async function extractTasksFromEpic11Plan() {
  const planPath = path.join(__dirname, '..', 'docs', 'epic11plan.md');
  const content = await fs.readFile(planPath, 'utf8');
  
  // Extract all pending checkbox tasks from the plan ([ ] not [x])
  const taskMatches = content.match(/^- \[ \] .+$/gm);
  
  if (!taskMatches) {
    console.log('ℹ️  All Epic 11 tasks appear to be completed - no pending tasks found');
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
      let story = '11';
      let storyName = 'Authentication & User Management';
      
      if (currentStory) {
        story = currentStory[1];
        storyName = currentStory[2];
      }
      
      // Determine priority and estimate based on task content
      let priority = 'medium';
      let estimate = '4 hours';
      let wipClass = 'feature';
      
      // High priority for core authentication infrastructure
      if (taskTitle.toLowerCase().includes('oauth') || 
          taskTitle.toLowerCase().includes('session') || 
          taskTitle.toLowerCase().includes('api authentication') ||
          taskTitle.toLowerCase().includes('rbac') ||
          taskTitle.toLowerCase().includes('security') ||
          taskTitle.toLowerCase().includes('audit')) {
        priority = 'high';
        estimate = '6 hours';
        wipClass = 'infrastructure';
      }
      
      // UI and component tasks
      else if (taskTitle.toLowerCase().includes('ui') || 
               taskTitle.toLowerCase().includes('interface') ||
               taskTitle.toLowerCase().includes('dashboard') ||
               taskTitle.toLowerCase().includes('management') ||
               taskTitle.toLowerCase().includes('editor') ||
               taskTitle.toLowerCase().includes('form')) {
        priority = 'medium';
        estimate = '5 hours';
        wipClass = 'ui';
      }
      
      // Backend service tasks  
      else if (taskTitle.toLowerCase().includes('backend') || 
               taskTitle.toLowerCase().includes('service') ||
               taskTitle.toLowerCase().includes('endpoint') ||
               taskTitle.toLowerCase().includes('storage') ||
               taskTitle.toLowerCase().includes('database') ||
               taskTitle.toLowerCase().includes('implement')) {
        priority = 'high';
        estimate = '6 hours';
        wipClass = 'feature';
      }
      
      // Testing tasks
      else if (taskTitle.toLowerCase().includes('test') || 
               taskTitle.toLowerCase().includes('validation') ||
               taskTitle.toLowerCase().includes('verify')) {
        priority = 'medium';
        estimate = '3 hours';
        wipClass = 'testing';
      }
      
      // Documentation and design tasks
      else if (taskTitle.toLowerCase().includes('document') || 
               taskTitle.toLowerCase().includes('design') ||
               taskTitle.toLowerCase().includes('research') ||
               taskTitle.toLowerCase().includes('plan')) {
        priority = 'low';
        estimate = '2 hours';
        wipClass = 'documentation';
      }
      
      // Assign tags based on task content
      const tags = [];
      if (taskTitle.toLowerCase().includes('oauth')) tags.push('oauth');
      if (taskTitle.toLowerCase().includes('session')) tags.push('session');
      if (taskTitle.toLowerCase().includes('password')) tags.push('password');
      if (taskTitle.toLowerCase().includes('rbac') || taskTitle.toLowerCase().includes('role')) tags.push('rbac');
      if (taskTitle.toLowerCase().includes('ui') || taskTitle.toLowerCase().includes('interface')) tags.push('ui');
      if (taskTitle.toLowerCase().includes('profile')) tags.push('profile');
      if (taskTitle.toLowerCase().includes('team') || taskTitle.toLowerCase().includes('organization')) tags.push('teams');
      if (taskTitle.toLowerCase().includes('permission') || taskTitle.toLowerCase().includes('access')) tags.push('permissions');
      if (taskTitle.toLowerCase().includes('invitation') || taskTitle.toLowerCase().includes('invite')) tags.push('invitations');
      if (taskTitle.toLowerCase().includes('admin')) tags.push('admin');
      if (taskTitle.toLowerCase().includes('audit') || taskTitle.toLowerCase().includes('logging')) tags.push('audit');
      if (taskTitle.toLowerCase().includes('branding') || taskTitle.toLowerCase().includes('theme')) tags.push('branding');
      if (taskTitle.toLowerCase().includes('dashboard')) tags.push('dashboard');
      if (taskTitle.toLowerCase().includes('notification')) tags.push('notifications');
      if (taskTitle.toLowerCase().includes('api')) tags.push('api');
      if (taskTitle.toLowerCase().includes('security')) tags.push('security');
      if (taskTitle.toLowerCase().includes('test')) tags.push('testing');
      if (taskTitle.toLowerCase().includes('integration')) tags.push('integration');
      if (taskTitle.toLowerCase().includes('backend')) tags.push('backend');
      
      // Default tags if none assigned
      if (tags.length === 0) {
        tags.push('authentication');
      }
      
      // Generate detailed description
      let description = `Implement ${taskTitle.toLowerCase()} as part of Epic 11 - Authentication & User Management.`;
      
      if (currentSubstory) {
        description += ` This task is part of substory ${currentSubstory[1]} (${currentSubstory[2]}) with estimated duration ${currentSubstory[3]}.`;
      }
      
      // Add specific technical details based on task type
      if (taskTitle.includes('OAuth') || taskTitle.includes('oauth')) {
        description += ' Includes provider integration, callback handling, token management, and account linking functionality.';
      } else if (taskTitle.includes('session') || taskTitle.includes('Session')) {
        description += ' Includes session storage, validation, renewal, and multi-device session handling.';
      } else if (taskTitle.includes('UI') || taskTitle.includes('interface')) {
        description += ' Includes React component implementation, user interaction patterns, form validation, and accessibility considerations.';
      } else if (taskTitle.includes('RBAC') || taskTitle.includes('permission')) {
        description += ' Includes role definition, permission assignment, hierarchy management, and access control implementation.';
      } else if (taskTitle.includes('backend') || taskTitle.includes('service')) {
        description += ' Includes API endpoints, business logic, data persistence, and integration with existing services.';
      } else if (taskTitle.includes('test')) {
        description += ' Includes unit tests, integration tests, security testing, and comprehensive edge case coverage.';
      }
      
      // Generate acceptance criteria
      const acceptanceCriteria = [];
      
      if (taskTitle.includes('OAuth') || taskTitle.includes('oauth')) {
        acceptanceCriteria.push('OAuth provider integration works correctly');
        acceptanceCriteria.push('Callback handling and token management functional');
        acceptanceCriteria.push('Account linking for existing users implemented');
        acceptanceCriteria.push('Security measures and error handling in place');
      }
      
      if (taskTitle.includes('UI') || taskTitle.includes('interface')) {
        acceptanceCriteria.push('UI component renders correctly across devices');
        acceptanceCriteria.push('User interactions work seamlessly');
        acceptanceCriteria.push('Form validation and error messaging implemented');
        acceptanceCriteria.push('Accessibility requirements met');
      }
      
      if (taskTitle.includes('session') || taskTitle.includes('Session')) {
        acceptanceCriteria.push('Session creation and validation works correctly');
        acceptanceCriteria.push('Session expiration and renewal implemented');
        acceptanceCriteria.push('Multi-device session handling functional');
        acceptanceCriteria.push('Security measures and cleanup processes in place');
      }
      
      if (taskTitle.includes('RBAC') || taskTitle.includes('permission')) {
        acceptanceCriteria.push('Role and permission system implemented');
        acceptanceCriteria.push('Permission evaluation works correctly');
        acceptanceCriteria.push('Role hierarchy and inheritance functional');
        acceptanceCriteria.push('Performance optimization for permission checks');
      }
      
      if (taskTitle.includes('backend') || taskTitle.includes('service')) {
        acceptanceCriteria.push('API endpoints implemented according to spec');
        acceptanceCriteria.push('Data persistence and validation working');
        acceptanceCriteria.push('Integration with existing services verified');
        acceptanceCriteria.push('Error handling and logging implemented');
      }
      
      if (taskTitle.includes('test')) {
        acceptanceCriteria.push('Test coverage meets Epic 11 standards (85%+)');
        acceptanceCriteria.push('All authentication scenarios tested');
        acceptanceCriteria.push('Security testing completed successfully');
        acceptanceCriteria.push('Edge cases and error conditions covered');
      }
      
      if (taskTitle.includes('admin') || taskTitle.includes('Admin')) {
        acceptanceCriteria.push('Admin interface functional and responsive');
        acceptanceCriteria.push('User management operations work correctly');
        acceptanceCriteria.push('Security controls and audit logging in place');
        acceptanceCriteria.push('Bulk operations and filtering implemented');
      }
      
      // Default acceptance criteria
      if (acceptanceCriteria.length === 0) {
        acceptanceCriteria.push('Authentication feature implemented and functional');
        acceptanceCriteria.push('Integration with existing Epic 11 foundation verified');
        acceptanceCriteria.push('Security requirements and best practices followed');
      }
      
      tasks.push({
        title: taskTitle,
        description,
        estimate,
        priority,
        wipClass,
        story,
        storyName,
        epic: 'Authentication & User Management',
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
  return `E11-${timestamp}-${random}`;
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
      source: 'epic11-automation',
      category: 'authentication-user-management',
      automated: true,
      epic: 'Authentication & User Management',
      storyNumber: taskDef.story,
      storyName: taskDef.storyName,
      completionStatus: 'Epic 11 authentication foundation 80% complete - these are remaining implementation tasks'
    }
  };
}

async function createEpic11Tasks() {
  console.log('🔐 Creating Epic 11: Authentication & User Management Tasks\n');
  console.log('📋 Based on: docs/epic11plan.md');
  console.log('ℹ️  Note: Epic 11 authentication foundation is 80% complete - processing remaining tasks\n');
  
  try {
    // Extract tasks from Epic 11 plan
    const epic11Tasks = await extractTasksFromEpic11Plan();
    
    if (epic11Tasks.length === 0) {
      console.log('🎉 All Epic 11 tasks are already complete!');
      console.log('📊 Epic 11 Status: 100% complete');
      return {
        created: 0,
        skipped: 0,
        total: 0,
        allComplete: true
      };
    }
    
    console.log(`📝 Extracted ${epic11Tasks.length} remaining tasks from Epic 11 plan\n`);
    
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
    
    // Process Epic 11 tasks
    for (const taskDef of epic11Tasks) {
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
      const featureTypes = ['oauth', 'session', 'rbac', 'profile', 'teams', 'admin'];
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
    state.metadata.epic11TasksCreated = tasksCreated;
    
    // Save updated state
    await saveState(state);
    
    // Generate comprehensive summary
    console.log('📊 EPIC 11 TASK CREATION SUMMARY');
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
      
      // Feature Type breakdown
      if (Object.keys(featureBreakdown).length > 0) {
        console.log('🔧 AUTHENTICATION FEATURES:');
        Object.entries(featureBreakdown).forEach(([featureType, count]) => {
          const emoji = featureType === 'oauth' ? '🔗' : 
                       featureType === 'session' ? '⏰' : 
                       featureType === 'rbac' ? '🛡️' : 
                       featureType === 'profile' ? '👤' : 
                       featureType === 'teams' ? '👥' : 
                       featureType === 'admin' ? '⚙️' : '🔐';
          console.log(`   ${emoji} ${featureType.toUpperCase()}: ${count} tasks`);
        });
        console.log('');
      }
    }
    
    console.log('\n🤖 NEXT STEPS FOR AGENTS:\n');
    console.log('1. 🎯 Focus on high-priority OAuth and session management first');
    console.log('2. 🔄 Use: `node src/grab-tasks.js <agent-id>` to grab Epic 11 tasks');
    console.log('3. 🏷️  Filter by tags: "oauth", "session", "rbac", "profile", "teams"');
    console.log('4. ⏱️  Epic 11 authentication foundation is solid - these complete the system');
    console.log('5. 📋 Start with OAuth integration, then RBAC, then team features\n');
    
    console.log('✨ Epic 11 remaining tasks processed successfully!');
    console.log('🔐 Authentication and user management implementation ready!');
    console.log('📈 Epic 11 Status: Foundation 80% complete, remaining features ready for implementation');
    
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
    console.error('❌ Failed to create Epic 11 tasks:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  createEpic11Tasks().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { 
  createEpic11Tasks,
  extractTasksFromEpic11Plan
};