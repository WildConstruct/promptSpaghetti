#!/usr/bin/env node

/**
 * Create Epic 10 Tasks Script
 * 
 * Converts Epic 10 (Prompt Targeting System) plan
 * into executable tasks in the task management system.
 * 
 * Based on: docs/epic10plan.md
 * Note: Only processes uncompleted tasks (marked with [ ])
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// Function to extract pending tasks from the Epic 10 plan file
async function extractTasksFromEpic10Plan() {
  const planPath = path.join(__dirname, '..', 'docs', 'epic10plan.md');
  const content = await fs.readFile(planPath, 'utf8');
  
  // Extract all pending checkbox tasks from the plan ([ ] not [x])
  const taskMatches = content.match(/^- \[ \] .+$/gm);
  
  if (!taskMatches) {
    console.log('ℹ️  All Epic 10 tasks appear to be completed - no pending tasks found');
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
      let story = '10';
      let storyName = 'Prompt Targeting System';
      
      if (currentStory) {
        story = currentStory[1];
        storyName = currentStory[2];
      }
      
      // Determine priority and estimate based on task content
      let priority = 'medium';
      let estimate = '4 hours';
      let wipClass = 'feature';
      
      // High priority for core targeting system infrastructure
      if (taskTitle.toLowerCase().includes('implement') || 
          taskTitle.toLowerCase().includes('create') || 
          taskTitle.toLowerCase().includes('design') ||
          taskTitle.toLowerCase().includes('architecture') ||
          taskTitle.toLowerCase().includes('system') ||
          taskTitle.toLowerCase().includes('engine') ||
          taskTitle.toLowerCase().includes('api')) {
        priority = 'high';
        estimate = '6 hours';
        wipClass = 'infrastructure';
      }
      
      // UI and component tasks
      else if (taskTitle.toLowerCase().includes('ui') || 
               taskTitle.toLowerCase().includes('component') ||
               taskTitle.toLowerCase().includes('interface') ||
               taskTitle.toLowerCase().includes('selector') ||
               taskTitle.toLowerCase().includes('display') ||
               taskTitle.toLowerCase().includes('preview')) {
        priority = 'medium';
        estimate = '5 hours';
        wipClass = 'ui';
      }
      
      // Integration and export tasks  
      else if (taskTitle.toLowerCase().includes('integration') || 
               taskTitle.toLowerCase().includes('export') ||
               taskTitle.toLowerCase().includes('adaptor') ||
               taskTitle.toLowerCase().includes('mapping') ||
               taskTitle.toLowerCase().includes('transform')) {
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
      
      // Documentation tasks
      else if (taskTitle.toLowerCase().includes('document') || 
               taskTitle.toLowerCase().includes('guide') ||
               taskTitle.toLowerCase().includes('tutorial')) {
        priority = 'low';
        estimate = '2 hours';
        wipClass = 'documentation';
      }
      
      // Assign tags based on task content
      const tags = [];
      if (taskTitle.toLowerCase().includes('adaptor')) tags.push('adaptors');
      if (taskTitle.toLowerCase().includes('openai')) tags.push('openai');
      if (taskTitle.toLowerCase().includes('midjourney')) tags.push('midjourney');
      if (taskTitle.toLowerCase().includes('claude')) tags.push('claude');
      if (taskTitle.toLowerCase().includes('ui') || taskTitle.toLowerCase().includes('component')) tags.push('ui');
      if (taskTitle.toLowerCase().includes('mapping') || taskTitle.toLowerCase().includes('transform')) tags.push('transformation');
      if (taskTitle.toLowerCase().includes('targeting')) tags.push('targeting');
      if (taskTitle.toLowerCase().includes('export')) tags.push('export');
      if (taskTitle.toLowerCase().includes('validation') || taskTitle.toLowerCase().includes('verify')) tags.push('validation');
      if (taskTitle.toLowerCase().includes('test')) tags.push('testing');
      if (taskTitle.toLowerCase().includes('integration')) tags.push('integration');
      if (taskTitle.toLowerCase().includes('api')) tags.push('api');
      if (taskTitle.toLowerCase().includes('template')) tags.push('templates');
      if (taskTitle.toLowerCase().includes('quality')) tags.push('quality');
      if (taskTitle.toLowerCase().includes('performance')) tags.push('performance');
      
      // Default tags if none assigned
      if (tags.length === 0) {
        tags.push('targeting');
      }
      
      // Generate detailed description
      let description = `Implement ${taskTitle.toLowerCase()} as part of Epic 10 - Prompt Targeting System.`;
      
      if (currentSubstory) {
        description += ` This task is part of substory ${currentSubstory[1]} (${currentSubstory[2]}) with estimated duration ${currentSubstory[3]}.`;
      }
      
      // Add specific technical details based on task type
      if (taskTitle.includes('adaptor') || taskTitle.includes('Adaptor')) {
        description += ' Includes adaptor implementation, validation logic, transformation algorithms, and integration with the targeting engine.';
      } else if (taskTitle.includes('UI') || taskTitle.includes('component')) {
        description += ' Includes React component implementation, user interaction patterns, real-time preview, and integration with targeting system.';
      } else if (taskTitle.includes('engine') || taskTitle.includes('system')) {
        description += ' Includes core algorithm implementation, configuration management, performance optimization, and extensibility framework.';
      } else if (taskTitle.includes('test')) {
        description += ' Includes unit tests, integration tests, adaptor compatibility testing, and transformation accuracy validation.';
      }
      
      // Generate acceptance criteria
      const acceptanceCriteria = [];
      
      if (taskTitle.includes('adaptor') || taskTitle.includes('Adaptor')) {
        acceptanceCriteria.push('Adaptor implements required interface methods');
        acceptanceCriteria.push('Transformation logic produces accurate output for target platform');
        acceptanceCriteria.push('Validation catches unsupported features correctly');
        acceptanceCriteria.push('Performance meets targeting system requirements');
      }
      
      if (taskTitle.includes('UI') || taskTitle.includes('component')) {
        acceptanceCriteria.push('UI component renders correctly with all targeting options');
        acceptanceCriteria.push('User interactions work seamlessly');
        acceptanceCriteria.push('Real-time preview shows accurate transformation results');
        acceptanceCriteria.push('Integration with targeting engine is reliable');
      }
      
      if (taskTitle.includes('system') || taskTitle.includes('engine')) {
        acceptanceCriteria.push('Core functionality works correctly');
        acceptanceCriteria.push('Configuration and extensibility framework functional');
        acceptanceCriteria.push('Performance meets Epic 10 requirements');
        acceptanceCriteria.push('Integration with existing graph system verified');
      }
      
      if (taskTitle.includes('test')) {
        acceptanceCriteria.push('Test coverage meets Epic 10 standards (85%+)');
        acceptanceCriteria.push('All targeting scenarios tested');
        acceptanceCriteria.push('Cross-adaptor compatibility verified');
        acceptanceCriteria.push('Edge cases and error conditions covered');
      }
      
      if (taskTitle.includes('template') || taskTitle.includes('Template')) {
        acceptanceCriteria.push('Template system handles various prompt types');
        acceptanceCriteria.push('Template validation works correctly');
        acceptanceCriteria.push('User can create and modify templates');
        acceptanceCriteria.push('Template library integration functional');
      }
      
      // Default acceptance criteria
      if (acceptanceCriteria.length === 0) {
        acceptanceCriteria.push('Targeting system feature implemented and functional');
        acceptanceCriteria.push('Integration with existing Epic 10 foundation verified');
        acceptanceCriteria.push('Cross-platform transformation working correctly');
      }
      
      tasks.push({
        title: taskTitle,
        description,
        estimate,
        priority,
        wipClass,
        story,
        storyName,
        epic: 'Prompt Targeting System',
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
  return `E10-${timestamp}-${random}`;
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
      source: 'epic10-automation',
      category: 'prompt-targeting',
      automated: true,
      epic: 'Prompt Targeting System',
      storyNumber: taskDef.story,
      storyName: taskDef.storyName,
      completionStatus: 'Epic 10 foundation complete - these are remaining implementation tasks'
    }
  };
}

async function createEpic10Tasks() {
  console.log('🎯 Creating Epic 10: Prompt Targeting System Tasks\n');
  console.log('📋 Based on: docs/epic10plan.md');
  console.log('ℹ️  Note: Epic 10 foundation is complete - processing remaining implementation tasks\n');
  
  try {
    // Extract tasks from Epic 10 plan
    const epic10Tasks = await extractTasksFromEpic10Plan();
    
    if (epic10Tasks.length === 0) {
      console.log('🎉 All Epic 10 tasks are already complete!');
      console.log('📊 Epic 10 Status: 100% complete');
      return {
        created: 0,
        skipped: 0,
        total: 0,
        allComplete: true
      };
    }
    
    console.log(`📝 Extracted ${epic10Tasks.length} remaining tasks from Epic 10 plan\n`);
    
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
    const adaptorBreakdown = {};
    
    // Process Epic 10 tasks
    for (const taskDef of epic10Tasks) {
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
      
      // Track adaptor types
      const adaptorTypes = ['openai', 'midjourney', 'claude'];
      adaptorTypes.forEach(adaptorType => {
        if (taskDef.tags.some(tag => tag.includes(adaptorType))) {
          adaptorBreakdown[adaptorType] = (adaptorBreakdown[adaptorType] || 0) + 1;
        }
      });
    }
    
    // Update state metadata
    if (!state.metadata) {
      state.metadata = {};
    }
    state.metadata.lastUpdated = new Date().toISOString();
    state.metadata.totalTasks = Object.keys(state.tasks).length;
    state.metadata.epic10TasksCreated = tasksCreated;
    
    // Save updated state
    await saveState(state);
    
    // Generate comprehensive summary
    console.log('📊 EPIC 10 TASK CREATION SUMMARY');
    console.log('================================\n');
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
      
      // Adaptor Type breakdown
      if (Object.keys(adaptorBreakdown).length > 0) {
        console.log('🔧 ADAPTOR TYPES:');
        Object.entries(adaptorBreakdown).forEach(([adaptorType, count]) => {
          const emoji = adaptorType === 'openai' ? '🤖' : 
                       adaptorType === 'midjourney' ? '🎨' : 
                       adaptorType === 'claude' ? '🧠' : '🔧';
          console.log(`   ${emoji} ${adaptorType.toUpperCase()}: ${count} tasks`);
        });
        console.log('');
      }
    }
    
    console.log('\n🤖 NEXT STEPS FOR AGENTS:\n');
    console.log('1. 🎯 Focus on high-priority adaptor implementations first');
    console.log('2. 🔄 Use: `node src/grab-tasks.js <agent-id>` to grab Epic 10 tasks');
    console.log('3. 🏷️  Filter by tags: "adaptors", "targeting", "transformation", "export"');
    console.log('4. ⏱️  Epic 10 architecture is solid - these are implementation tasks');
    console.log('5. 📋 Start with OpenAI adaptor, then Midjourney, then Claude\n');
    
    console.log('✨ Epic 10 remaining tasks processed successfully!');
    console.log('🎯 Prompt targeting system implementation ready!');
    console.log('📈 Epic 10 Status: Architecture complete, adaptors and UI ready for implementation');
    
    return {
      created: tasksCreated,
      skipped: tasksSkipped,
      total: Object.keys(state.tasks).length,
      storyBreakdown,
      priorityBreakdown,
      wipClassBreakdown,
      adaptorBreakdown
    };
    
  } catch (error) {
    console.error('❌ Failed to create Epic 10 tasks:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  createEpic10Tasks().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { 
  createEpic10Tasks,
  extractTasksFromEpic10Plan
};