#!/usr/bin/env node

/**
 * Create Epic 12 Tasks Script
 * 
 * Converts Epic 12 (LLM Agent Randomizer System) plan
 * into executable tasks in the task management system.
 * 
 * Based on: docs/epic12plan.md
 * Note: Only processes uncompleted tasks (marked with [ ])
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// Function to extract pending tasks from the Epic 12 plan file
async function extractTasksFromEpic12Plan() {
  const planPath = path.join(__dirname, '..', 'docs', 'epic12plan.md');
  const content = await fs.readFile(planPath, 'utf8');
  
  // Extract all pending checkbox tasks from the plan ([ ] not [x])
  const taskMatches = content.match(/^- \[ \] .+$/gm);
  
  if (!taskMatches) {
    console.log('ℹ️  All Epic 12 tasks appear to be completed - no pending tasks found');
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
      let story = '12';
      let storyName = 'LLM Agent Randomizer System';
      
      if (currentStory) {
        story = currentStory[1];
        storyName = currentStory[2];
      }
      
      // Determine priority and estimate based on task content
      let priority = 'medium';
      let estimate = '4 hours';
      let wipClass = 'feature';
      
      // High priority for core infrastructure and system design
      if (taskTitle.toLowerCase().includes('design') || 
          taskTitle.toLowerCase().includes('architecture') || 
          taskTitle.toLowerCase().includes('requirements') ||
          taskTitle.toLowerCase().includes('parser') ||
          taskTitle.toLowerCase().includes('format') ||
          taskTitle.toLowerCase().includes('system')) {
        priority = 'high';
        estimate = '6 hours';
        wipClass = 'infrastructure';
      }
      
      // UI and component tasks
      else if (taskTitle.toLowerCase().includes('ui') || 
               taskTitle.toLowerCase().includes('interface') ||
               taskTitle.toLowerCase().includes('visualization') ||
               taskTitle.toLowerCase().includes('component') ||
               taskTitle.toLowerCase().includes('panel') ||
               taskTitle.toLowerCase().includes('preview')) {
        priority = 'medium';
        estimate = '5 hours';
        wipClass = 'ui';
      }
      
      // LLM agent and script development tasks  
      else if (taskTitle.toLowerCase().includes('agent') || 
               taskTitle.toLowerCase().includes('script') ||
               taskTitle.toLowerCase().includes('template') ||
               taskTitle.toLowerCase().includes('openai') ||
               taskTitle.toLowerCase().includes('anthropic') ||
               taskTitle.toLowerCase().includes('gemini')) {
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
               taskTitle.toLowerCase().includes('specification') ||
               taskTitle.toLowerCase().includes('examples')) {
        priority = 'low';
        estimate = '2 hours';
        wipClass = 'documentation';
      }
      
      // Assign tags based on task content
      const tags = [];
      if (taskTitle.toLowerCase().includes('serialization') || taskTitle.toLowerCase().includes('format')) tags.push('serialization');
      if (taskTitle.toLowerCase().includes('parser') || taskTitle.toLowerCase().includes('parsing')) tags.push('parser');
      if (taskTitle.toLowerCase().includes('agent') || taskTitle.toLowerCase().includes('script')) tags.push('llm-agent');
      if (taskTitle.toLowerCase().includes('randomizer') || taskTitle.toLowerCase().includes('generator')) tags.push('randomizer');
      if (taskTitle.toLowerCase().includes('openai')) tags.push('openai');
      if (taskTitle.toLowerCase().includes('anthropic') || taskTitle.toLowerCase().includes('claude')) tags.push('anthropic');
      if (taskTitle.toLowerCase().includes('gemini') || taskTitle.toLowerCase().includes('google')) tags.push('gemini');
      if (taskTitle.toLowerCase().includes('ui') || taskTitle.toLowerCase().includes('interface')) tags.push('ui');
      if (taskTitle.toLowerCase().includes('validation') || taskTitle.toLowerCase().includes('error')) tags.push('validation');
      if (taskTitle.toLowerCase().includes('performance') || taskTitle.toLowerCase().includes('optimization')) tags.push('performance');
      if (taskTitle.toLowerCase().includes('test')) tags.push('testing');
      if (taskTitle.toLowerCase().includes('template') || taskTitle.toLowerCase().includes('instruction')) tags.push('templates');
      if (taskTitle.toLowerCase().includes('configuration') || taskTitle.toLowerCase().includes('parameter')) tags.push('configuration');
      if (taskTitle.toLowerCase().includes('preview') || taskTitle.toLowerCase().includes('visualization')) tags.push('preview');
      if (taskTitle.toLowerCase().includes('api') || taskTitle.toLowerCase().includes('endpoint')) tags.push('api');
      if (taskTitle.toLowerCase().includes('integration')) tags.push('integration');
      
      // Default tags if none assigned
      if (tags.length === 0) {
        tags.push('llm-randomizer');
      }
      
      // Generate detailed description
      let description = `Implement ${taskTitle.toLowerCase()} as part of Epic 12 - LLM Agent Randomizer System.`;
      
      if (currentSubstory) {
        description += ` This task is part of substory ${currentSubstory[1]} (${currentSubstory[2]}) with estimated duration ${currentSubstory[3]}.`;
      }
      
      // Add specific technical details based on task type
      if (taskTitle.includes('format') || taskTitle.includes('serialization')) {
        description += ' Includes format specification, validation rules, versioning mechanisms, and LLM optimization considerations.';
      } else if (taskTitle.includes('agent') || taskTitle.includes('script')) {
        description += ' Includes LLM instruction templates, model-specific optimizations, error handling, and configuration parameters.';
      } else if (taskTitle.includes('parser') || taskTitle.includes('parsing')) {
        description += ' Includes lexical analysis, syntactic parsing, semantic validation, and AST transformation capabilities.';
      } else if (taskTitle.includes('UI') || taskTitle.includes('interface')) {
        description += ' Includes React component implementation, user interaction patterns, real-time preview, and responsive design.';
      } else if (taskTitle.includes('randomizer') || taskTitle.includes('generator')) {
        description += ' Includes parameter management, constraint handling, template utilization, and quality evaluation systems.';
      } else if (taskTitle.includes('test')) {
        description += ' Includes unit tests, integration tests, cross-model validation, and comprehensive edge case coverage.';
      }
      
      // Generate acceptance criteria
      const acceptanceCriteria = [];
      
      if (taskTitle.includes('format') || taskTitle.includes('serialization')) {
        acceptanceCriteria.push('Serialization format handles all node types correctly');
        acceptanceCriteria.push('Format is optimized for LLM generation and parsing');
        acceptanceCriteria.push('Validation rules prevent invalid graph structures');
        acceptanceCriteria.push('Versioning mechanism supports format evolution');
      }
      
      if (taskTitle.includes('agent') || taskTitle.includes('script')) {
        acceptanceCriteria.push('LLM agent generates valid graph structures consistently');
        acceptanceCriteria.push('Model-specific optimizations improve success rates');
        acceptanceCriteria.push('Error handling and correction mechanisms work properly');
        acceptanceCriteria.push('Configuration parameters control generation behavior');
      }
      
      if (taskTitle.includes('parser') || taskTitle.includes('parsing')) {
        acceptanceCriteria.push('Parser handles all valid format structures correctly');
        acceptanceCriteria.push('Error messages are clear and actionable');
        acceptanceCriteria.push('Performance meets requirements for large graphs');
        acceptanceCriteria.push('AST transformation produces correct node graphs');
      }
      
      if (taskTitle.includes('UI') || taskTitle.includes('interface')) {
        acceptanceCriteria.push('UI components render correctly across devices');
        acceptanceCriteria.push('User interactions work seamlessly');
        acceptanceCriteria.push('Real-time preview updates as parameters change');
        acceptanceCriteria.push('Integration with randomizer system is reliable');
      }
      
      if (taskTitle.includes('randomizer') || taskTitle.includes('generator')) {
        acceptanceCriteria.push('Generated graphs meet quality and complexity requirements');
        acceptanceCriteria.push('Parameter controls work as expected');
        acceptanceCriteria.push('Constraint enforcement prevents invalid graphs');
        acceptanceCriteria.push('Template system produces consistent results');
      }
      
      if (taskTitle.includes('test')) {
        acceptanceCriteria.push('Test coverage meets Epic 12 standards (85%+)');
        acceptanceCriteria.push('All LLM models tested with consistent results');
        acceptanceCriteria.push('Edge cases and error conditions covered');
        acceptanceCriteria.push('Performance benchmarks established and met');
      }
      
      if (taskTitle.includes('OpenAI') || taskTitle.includes('Anthropic') || taskTitle.includes('Gemini')) {
        acceptanceCriteria.push('Model-specific script optimized for provider capabilities');
        acceptanceCriteria.push('Success rate meets or exceeds baseline requirements');
        acceptanceCriteria.push('Error handling appropriate for model characteristics');
        acceptanceCriteria.push('Integration with existing system seamless');
      }
      
      // Default acceptance criteria
      if (acceptanceCriteria.length === 0) {
        acceptanceCriteria.push('LLM randomizer feature implemented and functional');
        acceptanceCriteria.push('Integration with existing Epic 12 system verified');
        acceptanceCriteria.push('Quality standards met for generated outputs');
      }
      
      tasks.push({
        title: taskTitle,
        description,
        estimate,
        priority,
        wipClass,
        story,
        storyName,
        epic: 'LLM Agent Randomizer System',
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
  return `E12-${timestamp}-${random}`;
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
      source: 'epic12-automation',
      category: 'llm-agent-randomizer',
      automated: true,
      epic: 'LLM Agent Randomizer System',
      storyNumber: taskDef.story,
      storyName: taskDef.storyName,
      completionStatus: 'Epic 12 core implementation complete - these are enhancement and integration tasks'
    }
  };
}

async function createEpic12Tasks() {
  console.log('🤖 Creating Epic 12: LLM Agent Randomizer System Tasks\n');
  console.log('📋 Based on: docs/epic12plan.md');
  console.log('ℹ️  Note: Epic 12 core implementation is complete - processing remaining enhancement tasks\n');
  
  try {
    // Extract tasks from Epic 12 plan
    const epic12Tasks = await extractTasksFromEpic12Plan();
    
    if (epic12Tasks.length === 0) {
      console.log('🎉 All Epic 12 tasks are already complete!');
      console.log('📊 Epic 12 Status: 100% complete - Production ready LLM Agent Randomizer System');
      return {
        created: 0,
        skipped: 0,
        total: 0,
        allComplete: true
      };
    }
    
    console.log(`📝 Extracted ${epic12Tasks.length} remaining tasks from Epic 12 plan\n`);
    
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
    const providerBreakdown = {};
    
    // Process Epic 12 tasks
    for (const taskDef of epic12Tasks) {
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
      
      // Track LLM providers
      const providerTypes = ['openai', 'anthropic', 'gemini'];
      providerTypes.forEach(providerType => {
        if (taskDef.tags.some(tag => tag.includes(providerType))) {
          providerBreakdown[providerType] = (providerBreakdown[providerType] || 0) + 1;
        }
      });
    }
    
    // Update state metadata
    if (!state.metadata) {
      state.metadata = {};
    }
    state.metadata.lastUpdated = new Date().toISOString();
    state.metadata.totalTasks = Object.keys(state.tasks).length;
    state.metadata.epic12TasksCreated = tasksCreated;
    
    // Save updated state
    await saveState(state);
    
    // Generate comprehensive summary
    console.log('📊 EPIC 12 TASK CREATION SUMMARY');
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
      
      // LLM Provider breakdown
      if (Object.keys(providerBreakdown).length > 0) {
        console.log('🤖 LLM PROVIDER SUPPORT:');
        Object.entries(providerBreakdown).forEach(([providerType, count]) => {
          const emoji = providerType === 'openai' ? '🧠' : 
                       providerType === 'anthropic' ? '🎭' : 
                       providerType === 'gemini' ? '💎' : '🤖';
          console.log(`   ${emoji} ${providerType.toUpperCase()}: ${count} tasks`);
        });
        console.log('');
      }
    }
    
    console.log('\n🤖 NEXT STEPS FOR AGENTS:\n');
    console.log('1. 🎯 Focus on high-priority serialization format and parser tasks');
    console.log('2. 🔄 Use: `node src/grab-tasks.js <agent-id>` to grab Epic 12 tasks');
    console.log('3. 🏷️  Filter by tags: "serialization", "parser", "llm-agent", "randomizer"');
    console.log('4. ⏱️  Epic 12 core is production-ready - these enhance the system');
    console.log('5. 📋 Start with format design, then parser, then agent scripts\n');
    
    console.log('✨ Epic 12 remaining tasks processed successfully!');
    console.log('🤖 LLM Agent Randomizer System enhancement implementation ready!');
    console.log('📈 Epic 12 Status: Core system production-ready, enhancements available for implementation');
    
    return {
      created: tasksCreated,
      skipped: tasksSkipped,
      total: Object.keys(state.tasks).length,
      storyBreakdown,
      priorityBreakdown,
      wipClassBreakdown,
      providerBreakdown
    };
    
  } catch (error) {
    console.error('❌ Failed to create Epic 12 tasks:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  createEpic12Tasks().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { 
  createEpic12Tasks,
  extractTasksFromEpic12Plan
};