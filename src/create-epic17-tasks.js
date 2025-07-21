#!/usr/bin/env node

/**
 * Create Epic 17 Tasks Script
 * 
 * Converts Epic 17 (Backstage Admin Controls) plan
 * into executable tasks in the task management system.
 * 
 * Based on: docs/epic17plan.md
 * Note: Only processes uncompleted tasks (marked with [ ])
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// Function to extract pending tasks from the Epic 17 plan file
async function extractTasksFromEpic17Plan() {
  const planPath = path.join(__dirname, '..', 'docs', 'epic17plan.md');
  const content = await fs.readFile(planPath, 'utf8');
  
  // Extract all pending checkbox tasks from the plan ([ ] not [x])
  const taskMatches = content.match(/^- \[ \] .+$/gm);
  
  if (!taskMatches) {
    console.log('ℹ️  All Epic 17 tasks appear to be completed - no pending tasks found');
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
      let story = '17';
      let storyName = 'Backstage Admin Controls';
      
      if (currentStory) {
        story = currentStory[1];
        storyName = currentStory[2];
      }
      
      // Determine priority and estimate based on task content
      let priority = 'medium';
      let estimate = '4 hours';
      let wipClass = 'feature';
      
      // High priority for core architecture, security, and system design
      if (taskTitle.toLowerCase().includes('architecture') || 
          taskTitle.toLowerCase().includes('design') || 
          taskTitle.toLowerCase().includes('security') ||
          taskTitle.toLowerCase().includes('authentication') ||
          taskTitle.toLowerCase().includes('system') ||
          taskTitle.toLowerCase().includes('framework') ||
          taskTitle.toLowerCase().includes('model')) {
        priority = 'high';
        estimate = '6 hours';
        wipClass = 'infrastructure';
      }
      
      // UI and interface tasks
      else if (taskTitle.toLowerCase().includes('ui') || 
               taskTitle.toLowerCase().includes('interface') ||
               taskTitle.toLowerCase().includes('dashboard') ||
               taskTitle.toLowerCase().includes('editor') ||
               taskTitle.toLowerCase().includes('visualization') ||
               taskTitle.toLowerCase().includes('component')) {
        priority = 'medium';
        estimate = '5 hours';
        wipClass = 'ui';
      }
      
      // Core implementation and development tasks  
      else if (taskTitle.toLowerCase().includes('implement') || 
               taskTitle.toLowerCase().includes('develop') ||
               taskTitle.toLowerCase().includes('build') ||
               taskTitle.toLowerCase().includes('create') ||
               taskTitle.toLowerCase().includes('admin') ||
               taskTitle.toLowerCase().includes('management')) {
        priority = 'high';
        estimate = '6 hours';
        wipClass = 'feature';
      }
      
      // Monitoring and analytics tasks
      else if (taskTitle.toLowerCase().includes('monitoring') || 
               taskTitle.toLowerCase().includes('analytics') ||
               taskTitle.toLowerCase().includes('tracking') ||
               taskTitle.toLowerCase().includes('metrics') ||
               taskTitle.toLowerCase().includes('alert')) {
        priority = 'medium';
        estimate = '4 hours';
        wipClass = 'feature';
      }
      
      // Documentation and planning tasks
      else if (taskTitle.toLowerCase().includes('document') || 
               taskTitle.toLowerCase().includes('plan') ||
               taskTitle.toLowerCase().includes('define') ||
               taskTitle.toLowerCase().includes('wireframe') ||
               taskTitle.toLowerCase().includes('requirements')) {
        priority = 'low';
        estimate = '2 hours';
        wipClass = 'documentation';
      }
      
      // Assign tags based on task content
      const tags = [];
      if (taskTitle.toLowerCase().includes('feature') && taskTitle.toLowerCase().includes('toggle')) tags.push('feature-toggles');
      if (taskTitle.toLowerCase().includes('content') && taskTitle.toLowerCase().includes('management')) tags.push('content-management');
      if (taskTitle.toLowerCase().includes('user') && taskTitle.toLowerCase().includes('management')) tags.push('user-management');
      if (taskTitle.toLowerCase().includes('permission') || taskTitle.toLowerCase().includes('rbac')) tags.push('permissions');
      if (taskTitle.toLowerCase().includes('role') || taskTitle.toLowerCase().includes('access')) tags.push('access-control');
      if (taskTitle.toLowerCase().includes('audit') || taskTitle.toLowerCase().includes('logging')) tags.push('audit-logging');
      if (taskTitle.toLowerCase().includes('monitoring') || taskTitle.toLowerCase().includes('dashboard')) tags.push('monitoring');
      if (taskTitle.toLowerCase().includes('configuration') || taskTitle.toLowerCase().includes('config')) tags.push('configuration');
      if (taskTitle.toLowerCase().includes('integration') || taskTitle.toLowerCase().includes('api')) tags.push('integrations');
      if (taskTitle.toLowerCase().includes('backup') || taskTitle.toLowerCase().includes('recovery')) tags.push('backup-recovery');
      if (taskTitle.toLowerCase().includes('health') || taskTitle.toLowerCase().includes('diagnostic')) tags.push('health-checks');
      if (taskTitle.toLowerCase().includes('marketplace') && taskTitle.toLowerCase().includes('admin')) tags.push('marketplace-admin');
      if (taskTitle.toLowerCase().includes('review') || taskTitle.toLowerCase().includes('moderation')) tags.push('content-review');
      if (taskTitle.toLowerCase().includes('transaction') || taskTitle.toLowerCase().includes('payment')) tags.push('transaction-management');
      if (taskTitle.toLowerCase().includes('policy') || taskTitle.toLowerCase().includes('enforcement')) tags.push('policy-enforcement');
      if (taskTitle.toLowerCase().includes('verification') || taskTitle.toLowerCase().includes('trust')) tags.push('verification-system');
      if (taskTitle.toLowerCase().includes('analytics') || taskTitle.toLowerCase().includes('metrics')) tags.push('analytics');
      if (taskTitle.toLowerCase().includes('scheduling') || taskTitle.toLowerCase().includes('schedule')) tags.push('scheduling');
      if (taskTitle.toLowerCase().includes('bulk') || taskTitle.toLowerCase().includes('batch')) tags.push('bulk-operations');
      if (taskTitle.toLowerCase().includes('version') || taskTitle.toLowerCase().includes('versioning')) tags.push('version-control');
      if (taskTitle.toLowerCase().includes('security') || taskTitle.toLowerCase().includes('validation')) tags.push('security');
      if (taskTitle.toLowerCase().includes('ui') || taskTitle.toLowerCase().includes('component')) tags.push('ui');
      if (taskTitle.toLowerCase().includes('api') || taskTitle.toLowerCase().includes('backend')) tags.push('api');
      if (taskTitle.toLowerCase().includes('workflow') || taskTitle.toLowerCase().includes('process')) tags.push('workflow');
      
      // Default tags if none assigned
      if (tags.length === 0) {
        tags.push('admin-controls');
      }
      
      // Generate detailed description
      let description = `Implement ${taskTitle.toLowerCase()} as part of Epic 17 - Backstage Admin Controls.`;
      
      if (currentSubstory) {
        description += ` This task is part of substory ${currentSubstory[1]} (${currentSubstory[2]}) with estimated duration ${currentSubstory[3]}.`;
      }
      
      // Add specific technical details based on task type
      if (taskTitle.includes('feature') && taskTitle.includes('toggle')) {
        description += ' Includes toggle architecture design, admin dashboard development, user targeting systems, and comprehensive audit logging.';
      } else if (taskTitle.includes('content') && taskTitle.includes('management')) {
        description += ' Includes content upload systems, categorization tools, moderation workflows, and bulk operation capabilities.';
      } else if (taskTitle.includes('user') || taskTitle.includes('permission')) {
        description += ' Includes user directory management, RBAC system implementation, activity monitoring, and compliance tools.';
      } else if (taskTitle.includes('monitoring') || taskTitle.includes('dashboard')) {
        description += ' Includes system metrics collection, real-time visualization, alert management, and performance analytics.';
      } else if (taskTitle.includes('configuration') || taskTitle.includes('integration')) {
        description += ' Includes system configuration management, service integration tools, API management, and deployment automation.';
      } else if (taskTitle.includes('marketplace') && taskTitle.includes('admin')) {
        description += ' Includes review workflow management, transaction monitoring, policy enforcement, and verification systems.';
      } else if (taskTitle.includes('backup') || taskTitle.includes('health')) {
        description += ' Includes automated backup systems, health check frameworks, diagnostic tools, and recovery automation.';
      } else if (taskTitle.includes('audit') || taskTitle.includes('logging')) {
        description += ' Includes comprehensive audit trail creation, compliance reporting, log analysis, and tamper detection.';
      } else if (taskTitle.includes('scheduling') || taskTitle.includes('automation')) {
        description += ' Includes task scheduling systems, automated workflows, recurring operations, and execution monitoring.';
      } else if (taskTitle.includes('UI') || taskTitle.includes('component')) {
        description += ' Includes admin interface development, responsive design implementation, component library creation, and user experience optimization.';
      }
      
      // Generate acceptance criteria
      const acceptanceCriteria = [];
      
      if (taskTitle.includes('feature') && taskTitle.includes('toggle')) {
        acceptanceCriteria.push('Feature toggle system supports all required toggle types');
        acceptanceCriteria.push('Admin interface provides intuitive toggle management');
        acceptanceCriteria.push('User targeting system works accurately and efficiently');
        acceptanceCriteria.push('Toggle changes are audited and reversible');
      }
      
      if (taskTitle.includes('content') && taskTitle.includes('management')) {
        acceptanceCriteria.push('Content upload system handles all supported file types');
        acceptanceCriteria.push('Moderation workflow streamlines review processes');
        acceptanceCriteria.push('Bulk operations complete efficiently without errors');
        acceptanceCriteria.push('Content categorization is accurate and maintainable');
      }
      
      if (taskTitle.includes('user') || taskTitle.includes('permission')) {
        acceptanceCriteria.push('User management system scales to expected user volumes');
        acceptanceCriteria.push('RBAC system enforces permissions correctly');
        acceptanceCriteria.push('Permission changes take effect immediately');
        acceptanceCriteria.push('Access control prevents unauthorized operations');
      }
      
      if (taskTitle.includes('monitoring') || taskTitle.includes('dashboard')) {
        acceptanceCriteria.push('Monitoring dashboard displays accurate real-time data');
        acceptanceCriteria.push('Alert system triggers notifications appropriately');
        acceptanceCriteria.push('Performance metrics help identify system issues');
        acceptanceCriteria.push('Dashboard remains responsive under high load');
      }
      
      if (taskTitle.includes('configuration') || taskTitle.includes('integration')) {
        acceptanceCriteria.push('Configuration changes deploy without service interruption');
        acceptanceCriteria.push('Integration management handles connection failures gracefully');
        acceptanceCriteria.push('API management provides secure and reliable access');
        acceptanceCriteria.push('Configuration validation prevents invalid states');
      }
      
      if (taskTitle.includes('marketplace') && taskTitle.includes('admin')) {
        acceptanceCriteria.push('Review workflow manages submission queue effectively');
        acceptanceCriteria.push('Transaction monitoring detects and prevents fraud');
        acceptanceCriteria.push('Policy enforcement maintains marketplace standards');
        acceptanceCriteria.push('Verification system establishes appropriate trust levels');
      }
      
      if (taskTitle.includes('backup') || taskTitle.includes('health')) {
        acceptanceCriteria.push('Backup system creates reliable, restorable backups');
        acceptanceCriteria.push('Health checks detect system degradation early');
        acceptanceCriteria.push('Recovery procedures restore service quickly');
        acceptanceCriteria.push('Diagnostic tools provide actionable troubleshooting information');
      }
      
      if (taskTitle.includes('audit') || taskTitle.includes('logging')) {
        acceptanceCriteria.push('Audit system captures all required administrative actions');
        acceptanceCriteria.push('Log data supports compliance and investigation needs');
        acceptanceCriteria.push('Audit trail is tamper-evident and secure');
        acceptanceCriteria.push('Log analysis tools help identify patterns and issues');
      }
      
      if (taskTitle.includes('scheduling') || taskTitle.includes('automation')) {
        acceptanceCriteria.push('Scheduling system executes tasks reliably at specified times');
        acceptanceCriteria.push('Automated workflows reduce manual administrative burden');
        acceptanceCriteria.push('Recurring operations handle timezone and DST correctly');
        acceptanceCriteria.push('Execution monitoring provides visibility into automated processes');
      }
      
      if (taskTitle.includes('UI') || taskTitle.includes('component')) {
        acceptanceCriteria.push('Admin interface is intuitive for administrative users');
        acceptanceCriteria.push('UI components work consistently across admin tools');
        acceptanceCriteria.push('Interface design follows established admin design patterns');
        acceptanceCriteria.push('Responsive design works on administrative devices');
      }
      
      if (taskTitle.includes('security') || taskTitle.includes('validation')) {
        acceptanceCriteria.push('Security measures protect against administrative abuse');
        acceptanceCriteria.push('Validation prevents dangerous administrative actions');
        acceptanceCriteria.push('Security controls meet enterprise requirements');
        acceptanceCriteria.push('Access logging supports security investigations');
      }
      
      // Default acceptance criteria
      if (acceptanceCriteria.length === 0) {
        acceptanceCriteria.push('Admin control feature implemented and functional');
        acceptanceCriteria.push('Integration with existing Epic 17 system verified');
        acceptanceCriteria.push('Administrative workflows meet operational requirements');
      }
      
      tasks.push({
        title: taskTitle,
        description,
        estimate,
        priority,
        wipClass,
        story,
        storyName,
        epic: 'Backstage Admin Controls',
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
  return `E17-${timestamp}-${random}`;
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
      source: 'epic17-automation',
      category: 'backstage-admin-controls',
      automated: true,
      epic: 'Backstage Admin Controls',
      storyNumber: taskDef.story,
      storyName: taskDef.storyName,
      completionStatus: 'Epic 17 provides comprehensive administrative control system - ready for implementation'
    }
  };
}

async function createEpic17Tasks() {
  console.log('🔧 Creating Epic 17: Backstage Admin Controls Tasks\n');
  console.log('📋 Based on: docs/epic17plan.md');
  console.log('ℹ️  Note: Epic 17 provides comprehensive administrative control capabilities for system management\n');
  
  try {
    // Extract tasks from Epic 17 plan
    const epic17Tasks = await extractTasksFromEpic17Plan();
    
    if (epic17Tasks.length === 0) {
      console.log('🎉 All Epic 17 tasks are already complete!');
      console.log('🔧 Epic 17 Status: 100% complete - Production-ready Backstage Admin Controls');
      return {
        created: 0,
        skipped: 0,
        total: 0,
        allComplete: true
      };
    }
    
    console.log(`📝 Extracted ${epic17Tasks.length} tasks from Epic 17 plan\n`);
    
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
    
    // Process Epic 17 tasks
    for (const taskDef of epic17Tasks) {
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
      const featureTypes = ['feature-toggles', 'content-management', 'user-management', 'monitoring', 'configuration', 'marketplace-admin'];
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
    state.metadata.epic17TasksCreated = tasksCreated;
    
    // Save updated state
    await saveState(state);
    
    // Generate comprehensive summary
    console.log('📊 EPIC 17 TASK CREATION SUMMARY');
    console.log('=================================\n');
    console.log(`✅ Tasks Created: ${tasksCreated}`);
    console.log(`⏭️  Tasks Skipped: ${tasksSkipped} (already exist)`);
    console.log(`📋 Total Tasks in System: ${Object.keys(state.tasks).length}\n`);
    
    if (tasksCreated > 0) {
      // Story breakdown
      console.log('📋 TASKS BY STORY:\n');
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
        console.log('🔧 ADMIN CONTROL FEATURES:');
        Object.entries(featureBreakdown).forEach(([featureType, count]) => {
          const emoji = featureType === 'feature-toggles' ? '🎚️' : 
                       featureType === 'content-management' ? '📄' : 
                       featureType === 'user-management' ? '👤' : 
                       featureType === 'monitoring' ? '📊' : 
                       featureType === 'configuration' ? '⚙️' : 
                       featureType === 'marketplace-admin' ? '🏪' : '🔧';
          console.log(`   ${emoji} ${featureType.toUpperCase().replace('-', ' ')}: ${count} tasks`);
        });
        console.log('');
      }
    }
    
    console.log('\n🤖 NEXT STEPS FOR AGENTS:\n');
    console.log('1. 🎯 Focus on high-priority feature toggle and user management systems');
    console.log('2. 🔄 Use: `node src/grab-tasks.js <agent-id>` to grab Epic 17 tasks');
    console.log('3. 🏷️  Filter by tags: "feature-toggles", "user-management", "monitoring", "content-management"');
    console.log('4. ⏱️  Start with core admin infrastructure, then build specific management tools');
    console.log('5. 📋 Security and audit logging are critical - implement with comprehensive testing\n');
    
    console.log('✨ Epic 17 tasks created successfully!');
    console.log('🔧 Backstage Admin Controls implementation ready!');
    console.log('📈 Epic 17 Status: Complete administrative control system ready for development');
    
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
    console.error('❌ Failed to create Epic 17 tasks:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  createEpic17Tasks().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { 
  createEpic17Tasks,
  extractTasksFromEpic17Plan
};