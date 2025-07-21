#!/usr/bin/env node

/**
 * Create Epic 13 Tasks Script
 * 
 * Converts Epic 13 (Analytics Dashboard) plan
 * into executable tasks in the task management system.
 * 
 * Based on: docs/epic13plan.md
 * Note: Only processes uncompleted tasks (marked with [ ])
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// Function to extract pending tasks from the Epic 13 plan file
async function extractTasksFromEpic13Plan() {
  const planPath = path.join(__dirname, '..', 'docs', 'epic13plan.md');
  const content = await fs.readFile(planPath, 'utf8');
  
  // Extract all pending checkbox tasks from the plan ([ ] not [x])
  const taskMatches = content.match(/^- \[ \] .+$/gm);
  
  if (!taskMatches) {
    console.log('ℹ️  All Epic 13 tasks appear to be completed - no pending tasks found');
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
      let story = '13';
      let storyName = 'Analytics Dashboard';
      
      if (currentStory) {
        story = currentStory[1];
        storyName = currentStory[2];
      }
      
      // Determine priority and estimate based on task content
      let priority = 'medium';
      let estimate = '4 hours';
      let wipClass = 'feature';
      
      // High priority for core analytics infrastructure
      if (taskTitle.toLowerCase().includes('architecture') || 
          taskTitle.toLowerCase().includes('framework') || 
          taskTitle.toLowerCase().includes('system') ||
          taskTitle.toLowerCase().includes('tracking') ||
          taskTitle.toLowerCase().includes('collection') ||
          taskTitle.toLowerCase().includes('storage')) {
        priority = 'high';
        estimate = '6 hours';
        wipClass = 'infrastructure';
      }
      
      // UI and visualization tasks
      else if (taskTitle.toLowerCase().includes('dashboard') || 
               taskTitle.toLowerCase().includes('visualization') ||
               taskTitle.toLowerCase().includes('ui') ||
               taskTitle.toLowerCase().includes('chart') ||
               taskTitle.toLowerCase().includes('heatmap') ||
               taskTitle.toLowerCase().includes('interface')) {
        priority = 'medium';
        estimate = '5 hours';
        wipClass = 'ui';
      }
      
      // Analytics and reporting features  
      else if (taskTitle.toLowerCase().includes('analytics') || 
               taskTitle.toLowerCase().includes('metrics') ||
               taskTitle.toLowerCase().includes('analysis') ||
               taskTitle.toLowerCase().includes('reporting') ||
               taskTitle.toLowerCase().includes('calculation') ||
               taskTitle.toLowerCase().includes('tracking')) {
        priority = 'high';
        estimate = '6 hours';
        wipClass = 'feature';
      }
      
      // Testing and optimization tasks
      else if (taskTitle.toLowerCase().includes('test') || 
               taskTitle.toLowerCase().includes('optimization') ||
               taskTitle.toLowerCase().includes('performance') ||
               taskTitle.toLowerCase().includes('validation')) {
        priority = 'medium';
        estimate = '3 hours';
        wipClass = 'testing';
      }
      
      // Documentation and compliance tasks
      else if (taskTitle.toLowerCase().includes('document') || 
               taskTitle.toLowerCase().includes('compliance') ||
               taskTitle.toLowerCase().includes('privacy') ||
               taskTitle.toLowerCase().includes('policy')) {
        priority = 'low';
        estimate = '2 hours';
        wipClass = 'documentation';
      }
      
      // Assign tags based on task content
      const tags = [];
      if (taskTitle.toLowerCase().includes('analytics') || taskTitle.toLowerCase().includes('tracking')) tags.push('analytics');
      if (taskTitle.toLowerCase().includes('dashboard') || taskTitle.toLowerCase().includes('visualization')) tags.push('dashboard');
      if (taskTitle.toLowerCase().includes('performance') || taskTitle.toLowerCase().includes('metrics')) tags.push('metrics');
      if (taskTitle.toLowerCase().includes('cost') || taskTitle.toLowerCase().includes('budget')) tags.push('cost-analysis');
      if (taskTitle.toLowerCase().includes('token') || taskTitle.toLowerCase().includes('usage')) tags.push('usage-tracking');
      if (taskTitle.toLowerCase().includes('user') || taskTitle.toLowerCase().includes('interaction')) tags.push('user-analytics');
      if (taskTitle.toLowerCase().includes('real-time') || taskTitle.toLowerCase().includes('live')) tags.push('real-time');
      if (taskTitle.toLowerCase().includes('export') || taskTitle.toLowerCase().includes('report')) tags.push('export');
      if (taskTitle.toLowerCase().includes('privacy') || taskTitle.toLowerCase().includes('gdpr')) tags.push('privacy');
      if (taskTitle.toLowerCase().includes('forecast') || taskTitle.toLowerCase().includes('prediction')) tags.push('forecasting');
      if (taskTitle.toLowerCase().includes('comparison') || taskTitle.toLowerCase().includes('trend')) tags.push('comparison');
      if (taskTitle.toLowerCase().includes('heatmap') || taskTitle.toLowerCase().includes('heat map')) tags.push('heatmap');
      if (taskTitle.toLowerCase().includes('journey') || taskTitle.toLowerCase().includes('funnel')) tags.push('user-journey');
      if (taskTitle.toLowerCase().includes('cohort') || taskTitle.toLowerCase().includes('segmentation')) tags.push('cohort-analysis');
      if (taskTitle.toLowerCase().includes('replay') || taskTitle.toLowerCase().includes('session')) tags.push('session-replay');
      if (taskTitle.toLowerCase().includes('recommendation') || taskTitle.toLowerCase().includes('insight')) tags.push('recommendations');
      if (taskTitle.toLowerCase().includes('pattern') || taskTitle.toLowerCase().includes('behavior')) tags.push('pattern-analysis');
      if (taskTitle.toLowerCase().includes('api') || taskTitle.toLowerCase().includes('backend')) tags.push('api');
      if (taskTitle.toLowerCase().includes('frontend') || taskTitle.toLowerCase().includes('react')) tags.push('frontend');
      if (taskTitle.toLowerCase().includes('websocket') || taskTitle.toLowerCase().includes('streaming')) tags.push('streaming');
      
      // Default tags if none assigned
      if (tags.length === 0) {
        tags.push('analytics');
      }
      
      // Generate detailed description
      let description = `Implement ${taskTitle.toLowerCase()} as part of Epic 13 - Analytics Dashboard.`;
      
      if (currentSubstory) {
        description += ` This task is part of substory ${currentSubstory[1]} (${currentSubstory[2]}) with estimated duration ${currentSubstory[3]}.`;
      }
      
      // Add specific technical details based on task type
      if (taskTitle.includes('tracking') || taskTitle.includes('collection')) {
        description += ' Includes event schema design, data pipeline implementation, performance optimization, and privacy compliance.';
      } else if (taskTitle.includes('dashboard') || taskTitle.includes('visualization')) {
        description += ' Includes React component implementation, chart library integration, real-time updates, and responsive design.';
      } else if (taskTitle.includes('analytics') || taskTitle.includes('analysis')) {
        description += ' Includes algorithm implementation, data processing pipelines, statistical analysis, and insight generation.';
      } else if (taskTitle.includes('cost') || taskTitle.includes('budget')) {
        description += ' Includes pricing model integration, cost calculation algorithms, budget management, and forecasting capabilities.';
      } else if (taskTitle.includes('export') || taskTitle.includes('report')) {
        description += ' Includes multi-format export, report generation, customizable templates, and sharing mechanisms.';
      } else if (taskTitle.includes('privacy') || taskTitle.includes('compliance')) {
        description += ' Includes GDPR compliance, data anonymization, consent management, and user privacy controls.';
      }
      
      // Generate acceptance criteria
      const acceptanceCriteria = [];
      
      if (taskTitle.includes('tracking') || taskTitle.includes('collection')) {
        acceptanceCriteria.push('Event tracking captures all required metrics accurately');
        acceptanceCriteria.push('Data collection performance meets system requirements');
        acceptanceCriteria.push('Privacy controls and anonymization work correctly');
        acceptanceCriteria.push('Storage and retrieval systems handle expected volume');
      }
      
      if (taskTitle.includes('dashboard') || taskTitle.includes('visualization')) {
        acceptanceCriteria.push('Dashboard components render correctly across devices');
        acceptanceCriteria.push('Visualizations update in real-time with data changes');
        acceptanceCriteria.push('Interactive features work seamlessly');
        acceptanceCriteria.push('Performance meets user experience requirements');
      }
      
      if (taskTitle.includes('analytics') || taskTitle.includes('analysis')) {
        acceptanceCriteria.push('Analysis algorithms produce accurate results');
        acceptanceCriteria.push('Data processing handles expected volume efficiently');
        acceptanceCriteria.push('Statistical calculations are mathematically correct');
        acceptanceCriteria.push('Insights and recommendations are actionable');
      }
      
      if (taskTitle.includes('cost') || taskTitle.includes('budget')) {
        acceptanceCriteria.push('Cost calculations are accurate for all providers');
        acceptanceCriteria.push('Budget management features work as expected');
        acceptanceCriteria.push('Forecasting provides reasonable projections');
        acceptanceCriteria.push('Alerts and notifications trigger correctly');
      }
      
      if (taskTitle.includes('export') || taskTitle.includes('report')) {
        acceptanceCriteria.push('Export functionality generates correct formats');
        acceptanceCriteria.push('Report templates are customizable and branded');
        acceptanceCriteria.push('Sharing mechanisms work across platforms');
        acceptanceCriteria.push('Export performance meets user expectations');
      }
      
      if (taskTitle.includes('privacy') || taskTitle.includes('compliance')) {
        acceptanceCriteria.push('GDPR compliance requirements are met');
        acceptanceCriteria.push('Data anonymization preserves privacy');
        acceptanceCriteria.push('User consent mechanisms work properly');
        acceptanceCriteria.push('Data retention policies are enforced');
      }
      
      if (taskTitle.includes('performance') || taskTitle.includes('optimization')) {
        acceptanceCriteria.push('Performance improvements meet target metrics');
        acceptanceCriteria.push('System maintains responsiveness under load');
        acceptanceCriteria.push('Resource usage is optimized');
        acceptanceCriteria.push('Caching and batching strategies work effectively');
      }
      
      // Default acceptance criteria
      if (acceptanceCriteria.length === 0) {
        acceptanceCriteria.push('Analytics feature implemented and functional');
        acceptanceCriteria.push('Integration with existing Epic 13 system verified');
        acceptanceCriteria.push('Performance and accuracy requirements met');
      }
      
      tasks.push({
        title: taskTitle,
        description,
        estimate,
        priority,
        wipClass,
        story,
        storyName,
        epic: 'Analytics Dashboard',
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
  return `E13-${timestamp}-${random}`;
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
      source: 'epic13-automation',
      category: 'analytics-dashboard',
      automated: true,
      epic: 'Analytics Dashboard',
      storyNumber: taskDef.story,
      storyName: taskDef.storyName,
      completionStatus: 'Epic 13 core analytics system complete - these are enhancement and integration tasks'
    }
  };
}

async function createEpic13Tasks() {
  console.log('📊 Creating Epic 13: Analytics Dashboard Tasks\n');
  console.log('📋 Based on: docs/epic13plan.md');
  console.log('ℹ️  Note: Epic 13 core analytics system is production-ready - processing remaining enhancement tasks\n');
  
  try {
    // Extract tasks from Epic 13 plan
    const epic13Tasks = await extractTasksFromEpic13Plan();
    
    if (epic13Tasks.length === 0) {
      console.log('🎉 All Epic 13 tasks are already complete!');
      console.log('📊 Epic 13 Status: 100% complete - Production-ready Analytics Dashboard System');
      return {
        created: 0,
        skipped: 0,
        total: 0,
        allComplete: true
      };
    }
    
    console.log(`📝 Extracted ${epic13Tasks.length} remaining tasks from Epic 13 plan\n`);
    
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
    const categoryBreakdown = {};
    
    // Process Epic 13 tasks
    for (const taskDef of epic13Tasks) {
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
      const categoryTypes = ['analytics', 'dashboard', 'cost-analysis', 'user-analytics', 'privacy'];
      categoryTypes.forEach(categoryType => {
        if (taskDef.tags.some(tag => tag.includes(categoryType))) {
          categoryBreakdown[categoryType] = (categoryBreakdown[categoryType] || 0) + 1;
        }
      });
    }
    
    // Update state metadata
    if (!state.metadata) {
      state.metadata = {};
    }
    state.metadata.lastUpdated = new Date().toISOString();
    state.metadata.totalTasks = Object.keys(state.tasks).length;
    state.metadata.epic13TasksCreated = tasksCreated;
    
    // Save updated state
    await saveState(state);
    
    // Generate comprehensive summary
    console.log('📊 EPIC 13 TASK CREATION SUMMARY');
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
      
      // Category breakdown
      if (Object.keys(categoryBreakdown).length > 0) {
        console.log('📊 ANALYTICS CATEGORIES:');
        Object.entries(categoryBreakdown).forEach(([categoryType, count]) => {
          const emoji = categoryType === 'analytics' ? '📈' : 
                       categoryType === 'dashboard' ? '📊' : 
                       categoryType === 'cost-analysis' ? '💰' : 
                       categoryType === 'user-analytics' ? '👥' : 
                       categoryType === 'privacy' ? '🔒' : '📋';
          console.log(`   ${emoji} ${categoryType.toUpperCase()}: ${count} tasks`);
        });
        console.log('');
      }
    }
    
    console.log('\n🤖 NEXT STEPS FOR AGENTS:\n');
    console.log('1. 🎯 Focus on high-priority analytics infrastructure and tracking');
    console.log('2. 🔄 Use: `node src/grab-tasks.js <agent-id>` to grab Epic 13 tasks');
    console.log('3. 🏷️  Filter by tags: "analytics", "dashboard", "metrics", "cost-analysis"');
    console.log('4. ⏱️  Epic 13 core system is production-ready - these enhance capabilities');
    console.log('5. 📋 Start with tracking enhancements, then dashboard features, then advanced analytics\n');
    
    console.log('✨ Epic 13 remaining tasks processed successfully!');
    console.log('📊 Analytics Dashboard system enhancement implementation ready!');
    console.log('📈 Epic 13 Status: Core system production-ready, advanced features available for implementation');
    
    return {
      created: tasksCreated,
      skipped: tasksSkipped,
      total: Object.keys(state.tasks).length,
      storyBreakdown,
      priorityBreakdown,
      wipClassBreakdown,
      categoryBreakdown
    };
    
  } catch (error) {
    console.error('❌ Failed to create Epic 13 tasks:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  createEpic13Tasks().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { 
  createEpic13Tasks,
  extractTasksFromEpic13Plan
};