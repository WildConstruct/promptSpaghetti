#!/usr/bin/env node

/**
 * Create Epic 6 Tasks Script
 * 
 * Converts Epic 6 (Project Management & UI Enhancements) plan
 * into executable tasks in the task management system.
 * 
 * Based on: docs/epic6plan.md
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// Function to extract tasks from the Epic 6 plan file
async function extractTasksFromEpic6Plan() {
  const planPath = path.join(__dirname, '..', 'docs', 'epic6plan.md');
  const content = await fs.readFile(planPath, 'utf8');
  
  // Extract all checkbox tasks from the plan
  const taskMatches = content.match(/^- \[ \] .+$/gm);
  
  if (!taskMatches) {
    throw new Error('No tasks found in Epic 6 plan file');
  }
  
  // Process tasks and organize by story
  const tasks = [];
  let currentStory = null;
  let currentSubstory = null;
  let storyCounter = 1;
  
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Detect story headers
    if (line.match(/^## Story \d+\.\d+/)) {
      currentStory = line.match(/## Story (\d+\.\d+) - (.+)/);
      storyCounter++;
    }
    
    // Detect substory headers  
    if (line.match(/^#### \d+\.\d+\.\d+/)) {
      currentSubstory = line.match(/#### (\d+\.\d+\.\d+) (.+) \((.+)\)/);
    }
    
    // Process task items
    if (line.match(/^- \[ \] /)) {
      const taskTitle = line.replace(/^- \[ \] /, '');
      
      // Determine story context
      let story = '6';
      let storyName = 'Project Management & UI Enhancements';
      
      if (currentStory) {
        story = currentStory[1];
        storyName = currentStory[2];
      }
      
      // Determine priority and estimate based on story context
      let priority = 'medium';
      let estimate = '4 hours';
      let wipClass = 'feature';
      
      // Assign priority based on task content
      if (taskTitle.toLowerCase().includes('file format') || 
          taskTitle.toLowerCase().includes('save') || 
          taskTitle.toLowerCase().includes('load') ||
          taskTitle.toLowerCase().includes('schema')) {
        priority = 'high';
        estimate = '6 hours';
        wipClass = 'infrastructure';
      } else if (taskTitle.toLowerCase().includes('ui') || 
                 taskTitle.toLowerCase().includes('interface') ||
                 taskTitle.toLowerCase().includes('toolbar')) {
        priority = 'medium';
        estimate = '4 hours';
        wipClass = 'ui';
      } else if (taskTitle.toLowerCase().includes('test') || 
                 taskTitle.toLowerCase().includes('validation')) {
        priority = 'medium';
        estimate = '3 hours';
        wipClass = 'testing';
      }
      
      // Assign tags based on task content
      const tags = [];
      if (taskTitle.toLowerCase().includes('file')) tags.push('file-management');
      if (taskTitle.toLowerCase().includes('project')) tags.push('project-management');
      if (taskTitle.toLowerCase().includes('ui')) tags.push('ui');
      if (taskTitle.toLowerCase().includes('save')) tags.push('persistence');
      if (taskTitle.toLowerCase().includes('load')) tags.push('loading');
      if (taskTitle.toLowerCase().includes('test')) tags.push('testing');
      if (taskTitle.toLowerCase().includes('schema')) tags.push('validation');
      if (taskTitle.toLowerCase().includes('metadata')) tags.push('metadata');
      if (taskTitle.toLowerCase().includes('version')) tags.push('versioning');
      
      // Default tags if none assigned
      if (tags.length === 0) {
        tags.push('enhancement');
      }
      
      // Generate detailed description based on task title and context
      let description = `Implement ${taskTitle.toLowerCase()} as part of Epic 6 - Project Management & UI Enhancements.`;
      
      if (currentSubstory) {
        description += ` This task is part of substory ${currentSubstory[1]} (${currentSubstory[2]}) with estimated duration ${currentSubstory[3]}.`;
      }
      
      // Add specific technical details based on task type
      if (taskTitle.includes('schema')) {
        description += ' Includes Zod validation, JSON structure definition, and comprehensive error handling.';
      } else if (taskTitle.includes('UI') || taskTitle.includes('interface')) {
        description += ' Includes responsive design, accessibility considerations, and integration with existing UI patterns.';
      } else if (taskTitle.includes('test')) {
        description += ' Includes unit tests, integration tests, and comprehensive error scenario coverage.';
      }
      
      // Generate acceptance criteria based on task content
      const acceptanceCriteria = [];
      
      if (taskTitle.includes('Define') || taskTitle.includes('Create')) {
        acceptanceCriteria.push('Implementation completed according to specifications');
        acceptanceCriteria.push('Code follows existing project patterns and standards');
      }
      
      if (taskTitle.includes('UI') || taskTitle.includes('interface')) {
        acceptanceCriteria.push('User interface is responsive and accessible');
        acceptanceCriteria.push('Integration with existing components works seamlessly');
      }
      
      if (taskTitle.includes('test')) {
        acceptanceCriteria.push('Test coverage meets project standards');
        acceptanceCriteria.push('All test scenarios pass consistently');
      }
      
      if (taskTitle.includes('schema') || taskTitle.includes('validation')) {
        acceptanceCriteria.push('Schema validation works correctly');
        acceptanceCriteria.push('Error handling and reporting implemented');
      }
      
      // Default acceptance criteria
      if (acceptanceCriteria.length === 0) {
        acceptanceCriteria.push('Feature implemented and functional');
        acceptanceCriteria.push('Integration with existing system verified');
        acceptanceCriteria.push('Documentation updated as needed');
      }
      
      tasks.push({
        title: taskTitle,
        description,
        estimate,
        priority,
        wipClass,
        story,
        storyName,
        epic: 'Project Management & UI Enhancements',
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
  return `E6-${timestamp}-${random}`;
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
      source: 'epic6-automation',
      category: 'project-management-ui',
      automated: true,
      epic: 'Project Management & UI Enhancements',
      storyNumber: taskDef.story,
      storyName: taskDef.storyName
    }
  };
}

async function createEpic6Tasks() {
  console.log('🎨 Creating Epic 6: Project Management & UI Enhancements Tasks\n');
  console.log('📋 Based on: docs/epic6plan.md');
  console.log('📊 Expected: 71 tasks for project management and UI improvements\n');
  
  try {
    // Extract tasks from Epic 6 plan
    const epic6Tasks = await extractTasksFromEpic6Plan();
    console.log(`📝 Extracted ${epic6Tasks.length} tasks from Epic 6 plan\n`);
    
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
    
    // Process Epic 6 tasks
    for (const taskDef of epic6Tasks) {
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
    state.metadata.epic6TasksCreated = tasksCreated;
    
    // Save updated state
    await saveState(state);
    
    // Generate comprehensive summary
    console.log('📊 EPIC 6 TASK CREATION SUMMARY');
    console.log('===============================\n');
    console.log(`✅ Tasks Created: ${tasksCreated}`);
    console.log(`⏭️  Tasks Skipped: ${tasksSkipped} (already exist)`);
    console.log(`📋 Total Tasks in System: ${Object.keys(state.tasks).length}\n`);
    
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
      const emoji = wipClass === 'infrastructure' ? '🏗️' : wipClass === 'ui' ? '🎨' : wipClass === 'testing' ? '🧪' : '⚙️';
      console.log(`   ${emoji} ${wipClass.toUpperCase()}: ${count} tasks`);
    });
    
    console.log('\n🤖 NEXT STEPS FOR AGENTS:\n');
    console.log('1. 🎯 Start with high-priority infrastructure tasks (file format, schema)');
    console.log('2. 🔄 Use: `node src/grab-tasks.js <agent-id>` to grab Epic 6 tasks');
    console.log('3. 🏷️  Filter by tags: "file-management", "project-management", "ui"');
    console.log('4. ⏱️  Focus on .psg file format and save/load functionality first');
    console.log('5. 📋 UI enhancements should follow core functionality\n');
    
    console.log('✨ Epic 6 tasks created successfully!');
    console.log('🎨 Project management and UI enhancement implementation ready!');
    
    return {
      created: tasksCreated,
      skipped: tasksSkipped,
      total: Object.keys(state.tasks).length,
      storyBreakdown,
      priorityBreakdown,
      wipClassBreakdown
    };
    
  } catch (error) {
    console.error('❌ Failed to create Epic 6 tasks:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  createEpic6Tasks().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { 
  createEpic6Tasks,
  extractTasksFromEpic6Plan
};