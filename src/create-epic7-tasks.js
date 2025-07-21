#!/usr/bin/env node

/**
 * Create Epic 7 Tasks Script
 * 
 * Converts Epic 7 (Advanced Node Capabilities & User Experience) plan
 * into executable tasks in the task management system.
 * 
 * Based on: docs/epic7plan.md
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// Function to extract tasks from the Epic 7 plan file
async function extractTasksFromEpic7Plan() {
  const planPath = path.join(__dirname, '..', 'docs', 'epic7plan.md');
  const content = await fs.readFile(planPath, 'utf8');
  
  // Extract all checkbox tasks from the plan
  const taskMatches = content.match(/^- \[ \] .+$/gm);
  
  if (!taskMatches) {
    throw new Error('No tasks found in Epic 7 plan file');
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
    
    // Process task items
    if (line.match(/^- \[ \] /)) {
      const taskTitle = line.replace(/^- \[ \] /, '');
      
      // Determine story context
      let story = '7';
      let storyName = 'Advanced Node Capabilities & User Experience';
      
      if (currentStory) {
        story = currentStory[1];
        storyName = currentStory[2];
      }
      
      // Determine priority and estimate based on task content
      let priority = 'medium';
      let estimate = '4 hours';
      let wipClass = 'feature';
      
      // High priority for core architecture and node implementations
      if (taskTitle.toLowerCase().includes('define') || 
          taskTitle.toLowerCase().includes('architect') || 
          taskTitle.toLowerCase().includes('interface') ||
          taskTitle.toLowerCase().includes('base class') ||
          taskTitle.toLowerCase().includes('data model')) {
        priority = 'high';
        estimate = '6 hours';
        wipClass = 'infrastructure';
      }
      
      // UI and inspector tasks
      else if (taskTitle.toLowerCase().includes('ui') || 
               taskTitle.toLowerCase().includes('renderer') ||
               taskTitle.toLowerCase().includes('inspector') ||
               taskTitle.toLowerCase().includes('appearance') ||
               taskTitle.toLowerCase().includes('visualization')) {
        priority = 'medium';
        estimate = '5 hours';
        wipClass = 'ui';
      }
      
      // Runtime and execution tasks  
      else if (taskTitle.toLowerCase().includes('runtime') || 
               taskTitle.toLowerCase().includes('execution') ||
               taskTitle.toLowerCase().includes('algorithm') ||
               taskTitle.toLowerCase().includes('engine')) {
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
      if (taskTitle.toLowerCase().includes('weighted')) tags.push('weighted-node');
      if (taskTitle.toLowerCase().includes('conditional')) tags.push('conditional-node');
      if (taskTitle.toLowerCase().includes('sequential')) tags.push('sequential-node');
      if (taskTitle.toLowerCase().includes('markov')) tags.push('markov-node');
      if (taskTitle.toLowerCase().includes('ui') || taskTitle.toLowerCase().includes('renderer')) tags.push('ui');
      if (taskTitle.toLowerCase().includes('runtime') || taskTitle.toLowerCase().includes('execution')) tags.push('runtime');
      if (taskTitle.toLowerCase().includes('test')) tags.push('testing');
      if (taskTitle.toLowerCase().includes('architecture') || taskTitle.toLowerCase().includes('interface')) tags.push('architecture');
      if (taskTitle.toLowerCase().includes('validation') || taskTitle.toLowerCase().includes('schema')) tags.push('validation');
      if (taskTitle.toLowerCase().includes('performance')) tags.push('performance');
      if (taskTitle.toLowerCase().includes('inspector')) tags.push('inspector');
      if (taskTitle.toLowerCase().includes('serialization')) tags.push('serialization');
      
      // Default tags if none assigned
      if (tags.length === 0) {
        tags.push('advanced-nodes');
      }
      
      // Generate detailed description
      let description = `Implement ${taskTitle.toLowerCase()} as part of Epic 7 - Advanced Node Capabilities & User Experience.`;
      
      if (currentSubstory) {
        description += ` This task is part of substory ${currentSubstory[1]} (${currentSubstory[2]}) with estimated duration ${currentSubstory[3]}.`;
      }
      
      // Add specific technical details based on task type
      if (taskTitle.includes('data model')) {
        description += ' Includes schema definition, validation rules, and serialization support.';
      } else if (taskTitle.includes('UI') || taskTitle.includes('renderer')) {
        description += ' Includes React component implementation, styling, and integration with existing graph editor.';
      } else if (taskTitle.includes('runtime') || taskTitle.includes('execution')) {
        description += ' Includes algorithm implementation, performance optimization, and deterministic execution support.';
      } else if (taskTitle.includes('test')) {
        description += ' Includes unit tests, integration tests, and comprehensive edge case coverage.';
      }
      
      // Generate acceptance criteria
      const acceptanceCriteria = [];
      
      if (taskTitle.includes('Define') || taskTitle.includes('Implement')) {
        acceptanceCriteria.push('Implementation completed according to Epic 7 specifications');
        acceptanceCriteria.push('Code follows existing advanced node patterns');
      }
      
      if (taskTitle.includes('UI') || taskTitle.includes('renderer')) {
        acceptanceCriteria.push('UI component renders correctly in graph editor');
        acceptanceCriteria.push('Inspector panel integration works seamlessly');
      }
      
      if (taskTitle.includes('runtime') || taskTitle.includes('execution')) {
        acceptanceCriteria.push('Execution engine handles node type correctly');
        acceptanceCriteria.push('Deterministic results with same seed values');
      }
      
      if (taskTitle.includes('test')) {
        acceptanceCriteria.push('Test coverage meets Epic 7 standards (90%+)');
        acceptanceCriteria.push('All test scenarios pass consistently');
      }
      
      if (taskTitle.includes('schema') || taskTitle.includes('validation')) {
        acceptanceCriteria.push('Schema validation works correctly');
        acceptanceCriteria.push('Error handling and reporting implemented');
      }
      
      // Default acceptance criteria
      if (acceptanceCriteria.length === 0) {
        acceptanceCriteria.push('Advanced node capability implemented and functional');
        acceptanceCriteria.push('Integration with existing Epic 7 foundation verified');
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
        epic: 'Advanced Node Capabilities & User Experience',
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
  return `E7-${timestamp}-${random}`;
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
      source: 'epic7-automation',
      category: 'advanced-node-capabilities',
      automated: true,
      epic: 'Advanced Node Capabilities & User Experience',
      storyNumber: taskDef.story,
      storyName: taskDef.storyName
    }
  };
}

async function createEpic7Tasks() {
  console.log('🚀 Creating Epic 7: Advanced Node Capabilities & User Experience Tasks\n');
  console.log('📋 Based on: docs/epic7plan.md');
  console.log('📊 Expected: 62 tasks for advanced node implementation\n');
  
  try {
    // Extract tasks from Epic 7 plan
    const epic7Tasks = await extractTasksFromEpic7Plan();
    console.log(`📝 Extracted ${epic7Tasks.length} tasks from Epic 7 plan\n`);
    
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
    const nodeTypeBreakdown = {};
    
    // Process Epic 7 tasks
    for (const taskDef of epic7Tasks) {
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
      
      // Track node types
      const nodeTypes = ['weighted', 'conditional', 'sequential', 'markov'];
      nodeTypes.forEach(nodeType => {
        if (taskDef.tags.some(tag => tag.includes(nodeType))) {
          nodeTypeBreakdown[nodeType] = (nodeTypeBreakdown[nodeType] || 0) + 1;
        }
      });
    }
    
    // Update state metadata
    if (!state.metadata) {
      state.metadata = {};
    }
    state.metadata.lastUpdated = new Date().toISOString();
    state.metadata.totalTasks = Object.keys(state.tasks).length;
    state.metadata.epic7TasksCreated = tasksCreated;
    
    // Save updated state
    await saveState(state);
    
    // Generate comprehensive summary
    console.log('📊 EPIC 7 TASK CREATION SUMMARY');
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
      const emoji = wipClass === 'infrastructure' ? '🏗️' : 
                   wipClass === 'ui' ? '🎨' : 
                   wipClass === 'testing' ? '🧪' : 
                   wipClass === 'documentation' ? '📚' : '⚙️';
      console.log(`   ${emoji} ${wipClass.toUpperCase()}: ${count} tasks`);
    });
    console.log('');
    
    // Node Type breakdown
    if (Object.keys(nodeTypeBreakdown).length > 0) {
      console.log('🔧 ADVANCED NODE TYPES:');
      Object.entries(nodeTypeBreakdown).forEach(([nodeType, count]) => {
        const emoji = nodeType === 'weighted' ? '⚖️' : 
                     nodeType === 'conditional' ? '🔀' : 
                     nodeType === 'sequential' ? '📊' : 
                     nodeType === 'markov' ? '🔗' : '🔧';
        console.log(`   ${emoji} ${nodeType.toUpperCase()}: ${count} tasks`);
      });
      console.log('');
    }
    
    console.log('\n🤖 NEXT STEPS FOR AGENTS:\n');
    console.log('1. 🎯 Start with high-priority infrastructure tasks (base classes, interfaces)');
    console.log('2. 🔄 Use: `node src/grab-tasks.js <agent-id>` to grab Epic 7 tasks');
    console.log('3. 🏷️  Filter by tags: "weighted-node", "conditional-node", "sequential-node", "markov-node"');
    console.log('4. ⏱️  Focus on core architecture before individual node implementations');
    console.log('5. 📋 UI components should follow runtime implementation completion\n');
    
    console.log('✨ Epic 7 tasks created successfully!');
    console.log('🚀 Advanced node capabilities implementation ready!');
    console.log('🎯 Note: Epic 7 foundation already exists - these tasks enhance the existing system');
    
    return {
      created: tasksCreated,
      skipped: tasksSkipped,
      total: Object.keys(state.tasks).length,
      storyBreakdown,
      priorityBreakdown,
      wipClassBreakdown,
      nodeTypeBreakdown
    };
    
  } catch (error) {
    console.error('❌ Failed to create Epic 7 tasks:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  createEpic7Tasks().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { 
  createEpic7Tasks,
  extractTasksFromEpic7Plan
};