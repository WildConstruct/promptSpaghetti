#!/usr/bin/env node

/**
 * Create Epic 20 Tasks Script
 * 
 * Converts Epic 20 (Enterprise Scaling & Performance Optimization) plan
 * into executable tasks in the task management system.
 * 
 * Based on: docs/epic20plan.md
 * Note: Only processes uncompleted tasks (marked with [ ])
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// Function to extract pending tasks from the Epic 20 plan file
async function extractTasksFromEpic20Plan() {
  const planPath = path.join(__dirname, '..', 'docs', 'epic20plan.md');
  const content = await fs.readFile(planPath, 'utf8');
  
  // Extract all pending checkbox tasks from the plan ([ ] not [x])
  const taskMatches = content.match(/^- \[ \] .+$/gm);
  
  if (!taskMatches) {
    console.log('ℹ️  All Epic 20 tasks appear to be completed - no pending tasks found');
    return [];
  }
  
  // Process tasks and organize by story context
  const tasks = [];
  let currentStory = null;
  
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Detect story headers
    if (line.match(/^## Story \d+\.\d+/)) {
      currentStory = line.match(/## Story (\d+\.\d+) - (.+?)(?:\s+✅\s+\*\*COMPLETE\*\*)?$/);
    }
    
    // Process only pending task items (not completed ones)
    if (line.match(/^- \[ \] /) && !line.match(/^- \[x\] /)) {
      const taskTitle = line.replace(/^- \[ \] /, '');
      
      // Determine story context
      let story = '20';
      let storyName = 'Enterprise Scaling & Performance Optimization';
      
      if (currentStory) {
        story = currentStory[1];
        storyName = currentStory[2];
      }
      
      // Determine priority and estimate based on task content
      let priority = 'medium';
      let estimate = '4 hours';
      let wipClass = 'feature';
      
      // High priority for core performance, scaling, and monitoring
      if (taskTitle.toLowerCase().includes('performance') || 
          taskTitle.toLowerCase().includes('scaling') || 
          taskTitle.toLowerCase().includes('optimization') ||
          taskTitle.toLowerCase().includes('distributed') ||
          taskTitle.toLowerCase().includes('architecture') ||
          taskTitle.toLowerCase().includes('monitoring') ||
          taskTitle.toLowerCase().includes('database') ||
          taskTitle.toLowerCase().includes('framework')) {
        priority = 'high';
        estimate = '6 hours';
        wipClass = 'infrastructure';
      }
      
      // UI and dashboard tasks
      else if (taskTitle.toLowerCase().includes('dashboard') || 
               taskTitle.toLowerCase().includes('ui') ||
               taskTitle.toLowerCase().includes('visualization') ||
               taskTitle.toLowerCase().includes('interface') ||
               taskTitle.toLowerCase().includes('profiling')) {
        priority = 'medium';
        estimate = '5 hours';
        wipClass = 'ui';
      }
      
      // Core implementation and development tasks  
      else if (taskTitle.toLowerCase().includes('implement') || 
               taskTitle.toLowerCase().includes('develop') ||
               taskTitle.toLowerCase().includes('build') ||
               taskTitle.toLowerCase().includes('create') ||
               taskTitle.toLowerCase().includes('set up') ||
               taskTitle.toLowerCase().includes('integrate')) {
        priority = 'high';
        estimate = '6 hours';
        wipClass = 'feature';
      }
      
      // Testing and validation tasks
      else if (taskTitle.toLowerCase().includes('test') || 
               taskTitle.toLowerCase().includes('testing') ||
               taskTitle.toLowerCase().includes('profile') ||
               taskTitle.toLowerCase().includes('analyze') ||
               taskTitle.toLowerCase().includes('monitor')) {
        priority = 'medium';
        estimate = '4 hours';
        wipClass = 'testing';
      }
      
      // Documentation tasks
      else if (taskTitle.toLowerCase().includes('document') || 
               taskTitle.toLowerCase().includes('documentation')) {
        priority = 'low';
        estimate = '2 hours';
        wipClass = 'documentation';
      }
      
      // Assign tags based on task content
      const tags = [];
      if (taskTitle.toLowerCase().includes('load testing') || taskTitle.toLowerCase().includes('load test')) tags.push('load-testing');
      if (taskTitle.toLowerCase().includes('performance') || taskTitle.toLowerCase().includes('profiling')) tags.push('performance');
      if (taskTitle.toLowerCase().includes('database') || taskTitle.toLowerCase().includes('storage')) tags.push('database');
      if (taskTitle.toLowerCase().includes('caching') || taskTitle.toLowerCase().includes('cache')) tags.push('caching');
      if (taskTitle.toLowerCase().includes('sharding') || taskTitle.toLowerCase().includes('scaling')) tags.push('scaling');
      if (taskTitle.toLowerCase().includes('distributed') || taskTitle.toLowerCase().includes('distribution')) tags.push('distributed-processing');
      if (taskTitle.toLowerCase().includes('worker') || taskTitle.toLowerCase().includes('queue')) tags.push('job-processing');
      if (taskTitle.toLowerCase().includes('memory') || taskTitle.toLowerCase().includes('cpu')) tags.push('resource-optimization');
      if (taskTitle.toLowerCase().includes('monitoring') || taskTitle.toLowerCase().includes('alerting')) tags.push('monitoring');
      if (taskTitle.toLowerCase().includes('dashboard') || taskTitle.toLowerCase().includes('visualization')) tags.push('dashboard');
      if (taskTitle.toLowerCase().includes('ci/cd') || taskTitle.toLowerCase().includes('pipeline')) tags.push('ci-cd');
      if (taskTitle.toLowerCase().includes('optimization') || taskTitle.toLowerCase().includes('optimize')) tags.push('optimization');
      if (taskTitle.toLowerCase().includes('enterprise') || taskTitle.toLowerCase().includes('production')) tags.push('enterprise');
      if (taskTitle.toLowerCase().includes('regression') || taskTitle.toLowerCase().includes('baseline')) tags.push('regression-testing');
      if (taskTitle.toLowerCase().includes('api') || taskTitle.toLowerCase().includes('backend')) tags.push('api');
      if (taskTitle.toLowerCase().includes('client') || taskTitle.toLowerCase().includes('frontend')) tags.push('frontend');
      if (taskTitle.toLowerCase().includes('automation') || taskTitle.toLowerCase().includes('automated')) tags.push('automation');
      
      // Default tags if none assigned
      if (tags.length === 0) {
        tags.push('enterprise-scaling');
      }
      
      // Generate detailed description
      let description = `Implement ${taskTitle.toLowerCase()} as part of Epic 20 - Enterprise Scaling & Performance Optimization.`;
      
      // Add specific technical details based on task type
      if (taskTitle.includes('load test') || taskTitle.includes('performance')) {
        description += ' Includes load testing framework setup, performance profiling, baseline metrics establishment, and regression testing capabilities.';
      } else if (taskTitle.includes('database') || taskTitle.includes('storage')) {
        description += ' Includes database optimization, query performance tuning, caching strategies, and storage architecture improvements.';
      } else if (taskTitle.includes('distributed') || taskTitle.includes('worker')) {
        description += ' Includes distributed processing architecture, task distribution systems, worker pool management, and fault tolerance mechanisms.';
      } else if (taskTitle.includes('memory') || taskTitle.includes('CPU')) {
        description += ' Includes memory usage optimization, CPU performance tuning, resource monitoring, and efficiency improvements.';
      } else if (taskTitle.includes('monitoring') || taskTitle.includes('alerting')) {
        description += ' Includes monitoring system integration, alert configuration, performance dashboards, and anomaly detection capabilities.';
      } else if (taskTitle.includes('scaling') || taskTitle.includes('sharding')) {
        description += ' Includes horizontal scaling strategies, sharding implementation, load distribution, and capacity planning.';
      } else if (taskTitle.includes('caching') || taskTitle.includes('cache')) {
        description += ' Includes intelligent caching strategies, cache invalidation policies, distributed caching, and performance optimization.';
      } else if (taskTitle.includes('optimization') || taskTitle.includes('optimize')) {
        description += ' Includes performance analysis, bottleneck identification, optimization implementation, and performance validation.';
      } else if (taskTitle.includes('dashboard') || taskTitle.includes('visualization')) {
        description += ' Includes performance visualization, executive dashboards, metrics display, and real-time monitoring interfaces.';
      }
      
      // Generate acceptance criteria
      const acceptanceCriteria = [];
      
      if (taskTitle.includes('load test') || taskTitle.includes('performance')) {
        acceptanceCriteria.push('Load testing framework handles thousands of concurrent users');
        acceptanceCriteria.push('Performance profiling identifies bottlenecks accurately');
        acceptanceCriteria.push('Baseline metrics provide measurable performance targets');
        acceptanceCriteria.push('Regression testing prevents performance degradation');
      }
      
      if (taskTitle.includes('database') || taskTitle.includes('storage')) {
        acceptanceCriteria.push('Database queries perform efficiently under high load');
        acceptanceCriteria.push('Storage optimization handles large graph data structures');
        acceptanceCriteria.push('Read/write splitting improves database performance');
        acceptanceCriteria.push('Database monitoring provides actionable insights');
      }
      
      if (taskTitle.includes('distributed') || taskTitle.includes('worker')) {
        acceptanceCriteria.push('Distributed processing handles computation-heavy operations efficiently');
        acceptanceCriteria.push('Worker pool management scales automatically with demand');
        acceptanceCriteria.push('Job queuing and prioritization work reliably');
        acceptanceCriteria.push('Failure handling and retry mechanisms ensure reliability');
      }
      
      if (taskTitle.includes('memory') || taskTitle.includes('CPU')) {
        acceptanceCriteria.push('Memory usage is optimized for large graph handling');
        acceptanceCriteria.push('CPU performance is tuned for efficiency');
        acceptanceCriteria.push('Resource monitoring provides real-time insights');
        acceptanceCriteria.push('Background processing improves user experience');
      }
      
      if (taskTitle.includes('monitoring') || taskTitle.includes('alerting')) {
        acceptanceCriteria.push('Monitoring system provides comprehensive system health metrics');
        acceptanceCriteria.push('Alert thresholds are properly tuned to minimize false positives');
        acceptanceCriteria.push('Performance anomaly detection catches issues early');
        acceptanceCriteria.push('Dashboards provide actionable insights for operations');
      }
      
      if (taskTitle.includes('scaling') || taskTitle.includes('sharding')) {
        acceptanceCriteria.push('Horizontal scaling handles increased user load effectively');
        acceptanceCriteria.push('Sharding implementation distributes data efficiently');
        acceptanceCriteria.push('Load distribution maintains system performance');
        acceptanceCriteria.push('Scaling strategies support enterprise requirements');
      }
      
      if (taskTitle.includes('caching') || taskTitle.includes('cache')) {
        acceptanceCriteria.push('Intelligent caching improves response times significantly');
        acceptanceCriteria.push('Cache invalidation strategy maintains data consistency');
        acceptanceCriteria.push('Distributed caching scales with system growth');
        acceptanceCriteria.push('Cache performance meets optimization targets');
      }
      
      if (taskTitle.includes('test') || taskTitle.includes('testing')) {
        acceptanceCriteria.push('Testing framework validates performance improvements');
        acceptanceCriteria.push('Test coverage includes critical performance scenarios');
        acceptanceCriteria.push('Automated testing integrates with CI/CD pipeline');
        acceptanceCriteria.push('Test results provide measurable performance data');
      }
      
      // Default acceptance criteria
      if (acceptanceCriteria.length === 0) {
        acceptanceCriteria.push('Enterprise scaling/performance feature implemented and functional');
        acceptanceCriteria.push('Integration with existing Epic 20 system verified');
        acceptanceCriteria.push('Performance improvements meet enterprise requirements');
      }
      
      tasks.push({
        title: taskTitle,
        description,
        estimate,
        priority,
        wipClass,
        story,
        storyName,
        epic: 'Enterprise Scaling & Performance Optimization',
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
  return `E20-${timestamp}-${random}`;
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
      source: 'epic20-automation',
      category: 'enterprise-scaling-performance',
      automated: true,
      epic: 'Enterprise Scaling & Performance Optimization',
      storyNumber: taskDef.story,
      storyName: taskDef.storyName,
      completionStatus: 'Epic 20 provides comprehensive enterprise scaling and performance optimization - ready for implementation'
    }
  };
}

async function createEpic20Tasks() {
  console.log('⚡ Creating Epic 20: Enterprise Scaling & Performance Optimization Tasks\n');
  console.log('📋 Based on: docs/epic20plan.md');
  console.log('ℹ️  Note: Epic 20 provides comprehensive enterprise scaling and performance optimization capabilities\n');
  
  try {
    // Extract tasks from Epic 20 plan
    const epic20Tasks = await extractTasksFromEpic20Plan();
    
    if (epic20Tasks.length === 0) {
      console.log('🎉 All Epic 20 tasks are already complete!');
      console.log('⚡ Epic 20 Status: 100% complete - Production-ready Enterprise Scaling & Performance Optimization');
      return {
        created: 0,
        skipped: 0,
        total: 0,
        allComplete: true
      };
    }
    
    console.log(`📝 Extracted ${epic20Tasks.length} tasks from Epic 20 plan\n`);
    
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
    const performanceBreakdown = {};
    
    // Process Epic 20 tasks
    for (const taskDef of epic20Tasks) {
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
      
      // Track performance optimization types
      const performanceTypes = ['load-testing', 'performance', 'database', 'distributed-processing', 'monitoring', 'scaling'];
      performanceTypes.forEach(performanceType => {
        if (taskDef.tags.some(tag => tag.includes(performanceType))) {
          performanceBreakdown[performanceType] = (performanceBreakdown[performanceType] || 0) + 1;
        }
      });
    }
    
    // Update state metadata
    if (!state.metadata) {
      state.metadata = {};
    }
    state.metadata.lastUpdated = new Date().toISOString();
    state.metadata.totalTasks = Object.keys(state.tasks).length;
    state.metadata.epic20TasksCreated = tasksCreated;
    
    // Save updated state
    await saveState(state);
    
    // Generate comprehensive summary
    console.log('📊 EPIC 20 TASK CREATION SUMMARY');
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
      
      // Performance optimization breakdown
      if (Object.keys(performanceBreakdown).length > 0) {
        console.log('⚡ PERFORMANCE OPTIMIZATION AREAS:');
        Object.entries(performanceBreakdown).forEach(([performanceType, count]) => {
          const emoji = performanceType === 'load-testing' ? '🚀' : 
                       performanceType === 'performance' ? '⚡' : 
                       performanceType === 'database' ? '🗄️' : 
                       performanceType === 'distributed-processing' ? '🔄' : 
                       performanceType === 'monitoring' ? '📊' : 
                       performanceType === 'scaling' ? '📈' : '⚡';
          console.log(`   ${emoji} ${performanceType.toUpperCase().replace('-', ' ')}: ${count} tasks`);
        });
        console.log('');
      }
    }
    
    console.log('\n🤖 NEXT STEPS FOR AGENTS:\n');
    console.log('1. 🎯 Focus on high-priority load testing and database optimization');
    console.log('2. 🔄 Use: `node src/grab-tasks.js <agent-id>` to grab Epic 20 tasks');
    console.log('3. 🏷️  Filter by tags: "load-testing", "performance", "database", "distributed-processing"');
    console.log('4. ⏱️  Start with performance profiling, then database optimization, then distributed processing');
    console.log('5. 📋 Enterprise monitoring and scaling are critical - implement with comprehensive testing\n');
    
    console.log('✨ Epic 20 tasks created successfully!');
    console.log('⚡ Enterprise Scaling & Performance Optimization implementation ready!');
    console.log('📈 Epic 20 Status: Complete enterprise performance optimization system ready for development');
    
    return {
      created: tasksCreated,
      skipped: tasksSkipped,
      total: Object.keys(state.tasks).length,
      storyBreakdown,
      priorityBreakdown,
      wipClassBreakdown,
      performanceBreakdown
    };
    
  } catch (error) {
    console.error('❌ Failed to create Epic 20 tasks:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  createEpic20Tasks().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { 
  createEpic20Tasks,
  extractTasksFromEpic20Plan
};