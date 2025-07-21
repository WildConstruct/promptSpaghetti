#!/usr/bin/env node

/**
 * Create Epic 9 Tasks Script
 * 
 * Converts Epic 9 (Collaborative Editing & Workflow) plan
 * into executable tasks in the task management system.
 * 
 * Based on: docs/epic9plan.md
 * Note: Only processes uncompleted tasks (marked with [ ])
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// Function to extract pending tasks from the Epic 9 plan file
async function extractTasksFromEpic9Plan() {
  const planPath = path.join(__dirname, '..', 'docs', 'epic9plan.md');
  const content = await fs.readFile(planPath, 'utf8');
  
  // Extract all pending checkbox tasks from the plan ([ ] not [x])
  const taskMatches = content.match(/^- \[ \] .+$/gm);
  
  if (!taskMatches) {
    console.log('ℹ️  All Epic 9 tasks appear to be completed - no pending tasks found');
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
      currentStory = line.match(/## Story (\d+\.\d+) - (.+)/);
    }
    
    // Detect substory headers  
    if (line.match(/^#### \d+\.\d+\.\d+/)) {
      currentSubstory = line.match(/#### (\d+\.\d+\.\d+) (.+) \((.+)\)/);
    }
    
    // Process only pending task items (not completed ones)
    if (line.match(/^- \[ \] /) && !line.match(/^- \[x\] /)) {
      const taskTitle = line.replace(/^- \[ \] /, '');
      
      // Determine story context
      let story = '9';
      let storyName = 'Collaborative Editing & Workflow';
      
      if (currentStory) {
        story = currentStory[1];
        storyName = currentStory[2];
      }
      
      // Determine priority and estimate based on task content
      let priority = 'medium';
      let estimate = '4 hours';
      let wipClass = 'feature';
      
      // High priority for core collaboration infrastructure
      if (taskTitle.toLowerCase().includes('implement') || 
          taskTitle.toLowerCase().includes('create') || 
          taskTitle.toLowerCase().includes('design') ||
          taskTitle.toLowerCase().includes('system') ||
          taskTitle.toLowerCase().includes('api')) {
        priority = 'high';
        estimate = '6 hours';
        wipClass = 'infrastructure';
      }
      
      // UI and component tasks
      else if (taskTitle.toLowerCase().includes('ui') || 
               taskTitle.toLowerCase().includes('component') ||
               taskTitle.toLowerCase().includes('interface') ||
               taskTitle.toLowerCase().includes('notification') ||
               taskTitle.toLowerCase().includes('display')) {
        priority = 'medium';
        estimate = '5 hours';
        wipClass = 'ui';
      }
      
      // Integration and workflow tasks  
      else if (taskTitle.toLowerCase().includes('integration') || 
               taskTitle.toLowerCase().includes('workflow') ||
               taskTitle.toLowerCase().includes('connect') ||
               taskTitle.toLowerCase().includes('sync')) {
        priority = 'high';
        estimate = '6 hours';
        wipClass = 'feature';
      }
      
      // Testing tasks
      else if (taskTitle.toLowerCase().includes('test') || 
               taskTitle.toLowerCase().includes('validation')) {
        priority = 'medium';
        estimate = '3 hours';
        wipClass = 'testing';
      }
      
      // Documentation tasks
      else if (taskTitle.toLowerCase().includes('document') || 
               taskTitle.toLowerCase().includes('guide')) {
        priority = 'low';
        estimate = '2 hours';
        wipClass = 'documentation';
      }
      
      // Assign tags based on task content
      const tags = [];
      if (taskTitle.toLowerCase().includes('crdt')) tags.push('crdt');
      if (taskTitle.toLowerCase().includes('websocket')) tags.push('websocket');
      if (taskTitle.toLowerCase().includes('notification')) tags.push('notifications');
      if (taskTitle.toLowerCase().includes('ui') || taskTitle.toLowerCase().includes('component')) tags.push('ui');
      if (taskTitle.toLowerCase().includes('workflow')) tags.push('workflow');
      if (taskTitle.toLowerCase().includes('collaboration')) tags.push('collaboration');
      if (taskTitle.toLowerCase().includes('workspace')) tags.push('workspace');
      if (taskTitle.toLowerCase().includes('version')) tags.push('versioning');
      if (taskTitle.toLowerCase().includes('test')) tags.push('testing');
      if (taskTitle.toLowerCase().includes('integration')) tags.push('integration');
      if (taskTitle.toLowerCase().includes('api')) tags.push('api');
      if (taskTitle.toLowerCase().includes('real-time')) tags.push('real-time');
      
      // Default tags if none assigned
      if (tags.length === 0) {
        tags.push('collaboration');
      }
      
      // Generate detailed description
      let description = `Implement ${taskTitle.toLowerCase()} as part of Epic 9 - Collaborative Editing & Workflow.`;
      
      if (currentSubstory) {
        description += ` This task is part of substory ${currentSubstory[1]} (${currentSubstory[2]}) with estimated duration ${currentSubstory[3]}.`;
      }
      
      // Add specific technical details based on task type
      if (taskTitle.includes('notification') || taskTitle.includes('UI')) {
        description += ' Includes React component implementation, real-time updates, and user interaction patterns.';
      } else if (taskTitle.includes('integration') || taskTitle.includes('system')) {
        description += ' Includes API integration, data synchronization, and state management.';
      } else if (taskTitle.includes('test')) {
        description += ' Includes unit tests, integration tests, and collaboration scenario testing.';
      } else if (taskTitle.includes('workflow')) {
        description += ' Includes process design, state management, and user flow optimization.';
      }
      
      // Generate acceptance criteria
      const acceptanceCriteria = [];
      
      if (taskTitle.includes('UI') || taskTitle.includes('component') || taskTitle.includes('notification')) {
        acceptanceCriteria.push('UI component renders correctly and updates in real-time');
        acceptanceCriteria.push('User interactions work seamlessly');
        acceptanceCriteria.push('Integration with collaboration system verified');
      }
      
      if (taskTitle.includes('system') || taskTitle.includes('integration')) {
        acceptanceCriteria.push('System integration works correctly');
        acceptanceCriteria.push('Data synchronization operates reliably');
        acceptanceCriteria.push('Performance meets collaboration requirements');
      }
      
      if (taskTitle.includes('workflow')) {
        acceptanceCriteria.push('Workflow process implemented end-to-end');
        acceptanceCriteria.push('State transitions work correctly');
        acceptanceCriteria.push('User experience is intuitive');
      }
      
      if (taskTitle.includes('test')) {
        acceptanceCriteria.push('Test coverage meets Epic 9 standards (85%+)');
        acceptanceCriteria.push('All collaboration scenarios tested');
        acceptanceCriteria.push('Edge cases and error conditions covered');
      }
      
      // Default acceptance criteria
      if (acceptanceCriteria.length === 0) {
        acceptanceCriteria.push('Collaboration feature implemented and functional');
        acceptanceCriteria.push('Integration with existing Epic 9 foundation verified');
        acceptanceCriteria.push('Real-time synchronization working correctly');
      }
      
      tasks.push({
        title: taskTitle,
        description,
        estimate,
        priority,
        wipClass,
        story,
        storyName,
        epic: 'Collaborative Editing & Workflow',
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
  return `E9-${timestamp}-${random}`;
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
      source: 'epic9-automation',
      category: 'collaborative-editing',
      automated: true,
      epic: 'Collaborative Editing & Workflow',
      storyNumber: taskDef.story,
      storyName: taskDef.storyName,
      completionStatus: 'Most Epic 9 foundation complete - these are remaining tasks'
    }
  };
}

async function createEpic9Tasks() {
  console.log('🤝 Creating Epic 9: Collaborative Editing & Workflow Tasks\n');
  console.log('📋 Based on: docs/epic9plan.md');
  console.log('ℹ️  Note: Epic 9 is mostly complete - processing remaining tasks only\n');
  
  try {
    // Extract tasks from Epic 9 plan
    const epic9Tasks = await extractTasksFromEpic9Plan();
    
    if (epic9Tasks.length === 0) {
      console.log('🎉 All Epic 9 tasks are already complete!');
      console.log('📊 Epic 9 Status: 100% complete');
      return {
        created: 0,
        skipped: 0,
        total: 0,
        allComplete: true
      };
    }
    
    console.log(`📝 Extracted ${epic9Tasks.length} remaining tasks from Epic 9 plan\n`);
    
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
    
    // Process Epic 9 tasks
    for (const taskDef of epic9Tasks) {
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
    }
    
    // Update state metadata
    if (!state.metadata) {
      state.metadata = {};
    }
    state.metadata.lastUpdated = new Date().toISOString();
    state.metadata.totalTasks = Object.keys(state.tasks).length;
    state.metadata.epic9TasksCreated = tasksCreated;
    
    // Save updated state
    await saveState(state);
    
    // Generate comprehensive summary
    console.log('📊 EPIC 9 TASK CREATION SUMMARY');
    console.log('===============================\n');
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
    }
    
    console.log('\n🤖 NEXT STEPS FOR AGENTS:\n');
    console.log('1. 🎯 Focus on high-priority remaining collaboration features');
    console.log('2. 🔄 Use: `node src/grab-tasks.js <agent-id>` to grab Epic 9 tasks');
    console.log('3. 🏷️  Filter by tags: "notifications", "ui", "workflow", "collaboration"');
    console.log('4. ⏱️  Epic 9 foundation is solid - these are enhancement tasks');
    console.log('5. 📋 Most collaboration infrastructure already complete\n');
    
    console.log('✨ Epic 9 remaining tasks processed successfully!');
    console.log('🤝 Collaborative editing workflow completion ready!');
    console.log('📈 Epic 9 Status: Foundation complete, enhancements added');
    
    return {
      created: tasksCreated,
      skipped: tasksSkipped,
      total: Object.keys(state.tasks).length,
      storyBreakdown,
      priorityBreakdown,
      wipClassBreakdown
    };
    
  } catch (error) {
    console.error('❌ Failed to create Epic 9 tasks:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  createEpic9Tasks().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { 
  createEpic9Tasks,
  extractTasksFromEpic9Plan
};