#!/usr/bin/env node

/**
 * Create Epic 14 Tasks Script
 * 
 * Converts Epic 14 (A/B Testing Framework) plan
 * into executable tasks in the task management system.
 * 
 * Based on: docs/epic14plan.md
 * Note: Only processes uncompleted tasks (marked with [ ])
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// Function to extract pending tasks from the Epic 14 plan file
async function extractTasksFromEpic14Plan() {
  const planPath = path.join(__dirname, '..', 'docs', 'epic14plan.md');
  const content = await fs.readFile(planPath, 'utf8');
  
  // Extract all pending checkbox tasks from the plan ([ ] not [x])
  const taskMatches = content.match(/^- \[ \] .+$/gm);
  
  if (!taskMatches) {
    console.log('ℹ️  All Epic 14 tasks appear to be completed - no pending tasks found');
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
      let story = '14';
      let storyName = 'A/B Testing Framework';
      
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
          taskTitle.toLowerCase().includes('framework') ||
          taskTitle.toLowerCase().includes('system') ||
          taskTitle.toLowerCase().includes('engine') ||
          taskTitle.toLowerCase().includes('algorithm')) {
        priority = 'high';
        estimate = '6 hours';
        wipClass = 'infrastructure';
      }
      
      // UI and interface tasks
      else if (taskTitle.toLowerCase().includes('ui') || 
               taskTitle.toLowerCase().includes('interface') ||
               taskTitle.toLowerCase().includes('builder') ||
               taskTitle.toLowerCase().includes('dashboard') ||
               taskTitle.toLowerCase().includes('visualization') ||
               taskTitle.toLowerCase().includes('components')) {
        priority = 'medium';
        estimate = '5 hours';
        wipClass = 'ui';
      }
      
      // Statistical analysis and calculation tasks  
      else if (taskTitle.toLowerCase().includes('statistical') || 
               taskTitle.toLowerCase().includes('calculation') ||
               taskTitle.toLowerCase().includes('analysis') ||
               taskTitle.toLowerCase().includes('metrics') ||
               taskTitle.toLowerCase().includes('detection') ||
               taskTitle.toLowerCase().includes('testing')) {
        priority = 'high';
        estimate = '6 hours';
        wipClass = 'feature';
      }
      
      // Testing and validation tasks
      else if (taskTitle.toLowerCase().includes('test') || 
               taskTitle.toLowerCase().includes('validation') ||
               taskTitle.toLowerCase().includes('verification') ||
               taskTitle.toLowerCase().includes('simulation')) {
        priority = 'medium';
        estimate = '3 hours';
        wipClass = 'testing';
      }
      
      // Documentation and research tasks
      else if (taskTitle.toLowerCase().includes('document') || 
               taskTitle.toLowerCase().includes('research') ||
               taskTitle.toLowerCase().includes('evaluate') ||
               taskTitle.toLowerCase().includes('plan')) {
        priority = 'low';
        estimate = '2 hours';
        wipClass = 'documentation';
      }
      
      // Assign tags based on task content
      const tags = [];
      if (taskTitle.toLowerCase().includes('experiment') || taskTitle.toLowerCase().includes('testing')) tags.push('ab-testing');
      if (taskTitle.toLowerCase().includes('traffic') || taskTitle.toLowerCase().includes('allocation')) tags.push('traffic-allocation');
      if (taskTitle.toLowerCase().includes('variant') || taskTitle.toLowerCase().includes('variation')) tags.push('variants');
      if (taskTitle.toLowerCase().includes('randomization') || taskTitle.toLowerCase().includes('assignment')) tags.push('randomization');
      if (taskTitle.toLowerCase().includes('statistical') || taskTitle.toLowerCase().includes('significance')) tags.push('statistics');
      if (taskTitle.toLowerCase().includes('results') || taskTitle.toLowerCase().includes('analysis')) tags.push('analysis');
      if (taskTitle.toLowerCase().includes('dashboard') || taskTitle.toLowerCase().includes('visualization')) tags.push('dashboard');
      if (taskTitle.toLowerCase().includes('metrics') || taskTitle.toLowerCase().includes('measurement')) tags.push('metrics');
      if (taskTitle.toLowerCase().includes('winner') || taskTitle.toLowerCase().includes('detection')) tags.push('winner-detection');
      if (taskTitle.toLowerCase().includes('segment') || taskTitle.toLowerCase().includes('cohort')) tags.push('segmentation');
      if (taskTitle.toLowerCase().includes('rollout') || taskTitle.toLowerCase().includes('deployment')) tags.push('rollout');
      if (taskTitle.toLowerCase().includes('override') || taskTitle.toLowerCase().includes('debug')) tags.push('debugging');
      if (taskTitle.toLowerCase().includes('template') || taskTitle.toLowerCase().includes('library')) tags.push('templates');
      if (taskTitle.toLowerCase().includes('version') || taskTitle.toLowerCase().includes('history')) tags.push('versioning');
      if (taskTitle.toLowerCase().includes('notification') || taskTitle.toLowerCase().includes('alert')) tags.push('notifications');
      if (taskTitle.toLowerCase().includes('ui') || taskTitle.toLowerCase().includes('interface')) tags.push('ui');
      if (taskTitle.toLowerCase().includes('api') || taskTitle.toLowerCase().includes('backend')) tags.push('api');
      if (taskTitle.toLowerCase().includes('storage') || taskTitle.toLowerCase().includes('persistence')) tags.push('storage');
      if (taskTitle.toLowerCase().includes('scheduling') || taskTitle.toLowerCase().includes('automation')) tags.push('scheduling');
      if (taskTitle.toLowerCase().includes('comparison') || taskTitle.toLowerCase().includes('benchmarking')) tags.push('comparison');
      
      // Default tags if none assigned
      if (tags.length === 0) {
        tags.push('ab-testing');
      }
      
      // Generate detailed description
      let description = `Implement ${taskTitle.toLowerCase()} as part of Epic 14 - A/B Testing Framework.`;
      
      if (currentSubstory) {
        description += ` This task is part of substory ${currentSubstory[1]} (${currentSubstory[2]}) with estimated duration ${currentSubstory[3]}.`;
      }
      
      // Add specific technical details based on task type
      if (taskTitle.includes('design') || taskTitle.includes('architecture')) {
        description += ' Includes system architecture planning, data model definition, API design, and integration strategy.';
      } else if (taskTitle.includes('statistical') || taskTitle.includes('calculation')) {
        description += ' Includes algorithm implementation, statistical validation, significance testing, and confidence interval calculation.';
      } else if (taskTitle.includes('UI') || taskTitle.includes('interface')) {
        description += ' Includes React component implementation, user interaction design, form validation, and responsive layout.';
      } else if (taskTitle.includes('allocation') || taskTitle.includes('randomization')) {
        description += ' Includes traffic distribution algorithms, user assignment logic, consistency guarantees, and performance optimization.';
      } else if (taskTitle.includes('visualization') || taskTitle.includes('dashboard')) {
        description += ' Includes chart component development, real-time data updates, interactive controls, and export functionality.';
      } else if (taskTitle.includes('analysis') || taskTitle.includes('results')) {
        description += ' Includes data processing pipelines, metric calculations, trend analysis, and insight generation.';
      }
      
      // Generate acceptance criteria
      const acceptanceCriteria = [];
      
      if (taskTitle.includes('design') || taskTitle.includes('architecture')) {
        acceptanceCriteria.push('System architecture handles expected scale and complexity');
        acceptanceCriteria.push('Data models support all required functionality');
        acceptanceCriteria.push('API design follows REST principles and versioning');
        acceptanceCriteria.push('Integration points are well-defined and documented');
      }
      
      if (taskTitle.includes('statistical') || taskTitle.includes('calculation')) {
        acceptanceCriteria.push('Statistical calculations are mathematically accurate');
        acceptanceCriteria.push('Significance testing produces reliable results');
        acceptanceCriteria.push('Confidence intervals are correctly calculated');
        acceptanceCriteria.push('Multiple comparison corrections are applied appropriately');
      }
      
      if (taskTitle.includes('UI') || taskTitle.includes('interface')) {
        acceptanceCriteria.push('User interface is intuitive and accessible');
        acceptanceCriteria.push('Form validation provides clear feedback');
        acceptanceCriteria.push('Responsive design works across devices');
        acceptanceCriteria.push('Integration with backend APIs is seamless');
      }
      
      if (taskTitle.includes('allocation') || taskTitle.includes('randomization')) {
        acceptanceCriteria.push('Traffic allocation is accurate and consistent');
        acceptanceCriteria.push('User assignment is deterministic and sticky');
        acceptanceCriteria.push('Performance meets system requirements');
        acceptanceCriteria.push('Edge cases and error conditions are handled');
      }
      
      if (taskTitle.includes('visualization') || taskTitle.includes('dashboard')) {
        acceptanceCriteria.push('Charts accurately represent experiment data');
        acceptanceCriteria.push('Real-time updates work without performance issues');
        acceptanceCriteria.push('Interactive features enhance user understanding');
        acceptanceCriteria.push('Export functionality produces quality outputs');
      }
      
      if (taskTitle.includes('analysis') || taskTitle.includes('results')) {
        acceptanceCriteria.push('Analysis provides actionable insights');
        acceptanceCriteria.push('Data processing handles large datasets efficiently');
        acceptanceCriteria.push('Metric calculations are accurate and timely');
        acceptanceCriteria.push('Trend analysis identifies meaningful patterns');
      }
      
      if (taskTitle.includes('experiment') || taskTitle.includes('testing')) {
        acceptanceCriteria.push('Experiment creation workflow is user-friendly');
        acceptanceCriteria.push('Test execution is reliable and reproducible');
        acceptanceCriteria.push('Results collection is comprehensive and accurate');
        acceptanceCriteria.push('Experiment lifecycle management is complete');
      }
      
      // Default acceptance criteria
      if (acceptanceCriteria.length === 0) {
        acceptanceCriteria.push('A/B testing feature implemented and functional');
        acceptanceCriteria.push('Integration with existing Epic 14 system verified');
        acceptanceCriteria.push('Statistical accuracy and reliability ensured');
      }
      
      tasks.push({
        title: taskTitle,
        description,
        estimate,
        priority,
        wipClass,
        story,
        storyName,
        epic: 'A/B Testing Framework',
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
  return `E14-${timestamp}-${random}`;
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
      source: 'epic14-automation',
      category: 'ab-testing-framework',
      automated: true,
      epic: 'A/B Testing Framework',
      storyNumber: taskDef.story,
      storyName: taskDef.storyName,
      completionStatus: 'Epic 14 A/B Testing Framework ready for implementation'
    }
  };
}

async function createEpic14Tasks() {
  console.log('🧪 Creating Epic 14: A/B Testing Framework Tasks\n');
  console.log('📋 Based on: docs/epic14plan.md');
  console.log('ℹ️  Note: Epic 14 A/B Testing Framework ready for complete implementation\n');
  
  try {
    // Extract tasks from Epic 14 plan
    const epic14Tasks = await extractTasksFromEpic14Plan();
    
    if (epic14Tasks.length === 0) {
      console.log('🎉 All Epic 14 tasks are already complete!');
      console.log('🧪 Epic 14 Status: 100% complete - Production-ready A/B Testing Framework');
      return {
        created: 0,
        skipped: 0,
        total: 0,
        allComplete: true
      };
    }
    
    console.log(`📝 Extracted ${epic14Tasks.length} tasks from Epic 14 plan\n`);
    
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
    
    // Process Epic 14 tasks
    for (const taskDef of epic14Tasks) {
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
      
      // Track feature categories
      const featureTypes = ['ab-testing', 'statistics', 'dashboard', 'traffic-allocation', 'analysis'];
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
    state.metadata.epic14TasksCreated = tasksCreated;
    
    // Save updated state
    await saveState(state);
    
    // Generate comprehensive summary
    console.log('📊 EPIC 14 TASK CREATION SUMMARY');
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
      
      // Feature Type breakdown
      if (Object.keys(featureBreakdown).length > 0) {
        console.log('🧪 A/B TESTING FEATURES:');
        Object.entries(featureBreakdown).forEach(([featureType, count]) => {
          const emoji = featureType === 'ab-testing' ? '🧪' : 
                       featureType === 'statistics' ? '📊' : 
                       featureType === 'dashboard' ? '📈' : 
                       featureType === 'traffic-allocation' ? '🚦' : 
                       featureType === 'analysis' ? '🔍' : '⚙️';
          console.log(`   ${emoji} ${featureType.toUpperCase().replace('-', ' ')}: ${count} tasks`);
        });
        console.log('');
      }
    }
    
    console.log('\n🤖 NEXT STEPS FOR AGENTS:\n');
    console.log('1. 🎯 Focus on high-priority experiment design and traffic allocation infrastructure');
    console.log('2. 🔄 Use: `node src/grab-tasks.js <agent-id>` to grab Epic 14 tasks');
    console.log('3. 🏷️  Filter by tags: "ab-testing", "statistics", "traffic-allocation", "analysis"');
    console.log('4. ⏱️  Start with experiment design system, then traffic allocation, then results analysis');
    console.log('5. 📋 Statistical accuracy is critical - comprehensive testing required\n');
    
    console.log('✨ Epic 14 tasks created successfully!');
    console.log('🧪 A/B Testing Framework implementation ready!');
    console.log('📈 Epic 14 Status: Complete framework ready for development with 66 developer days estimated');
    
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
    console.error('❌ Failed to create Epic 14 tasks:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  createEpic14Tasks().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { 
  createEpic14Tasks,
  extractTasksFromEpic14Plan
};