#!/usr/bin/env node

/**
 * Create Epic 18 Tasks Script
 * 
 * Converts Epic 18 (Technical Debt & Refactoring) plan
 * into executable tasks in the task management system.
 * 
 * Based on: docs/epic18plan.md
 * Note: Only processes uncompleted tasks (marked with [ ])
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// Function to extract pending tasks from the Epic 18 plan file
async function extractTasksFromEpic18Plan() {
  const planPath = path.join(__dirname, '..', 'docs', 'epic18plan.md');
  const content = await fs.readFile(planPath, 'utf8');
  
  // Extract all pending checkbox tasks from the plan ([ ] not [x])
  const taskMatches = content.match(/^- \[ \] .+$/gm);
  
  if (!taskMatches) {
    console.log('ℹ️  All Epic 18 tasks appear to be completed - no pending tasks found');
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
      let story = '18';
      let storyName = 'Technical Debt & Refactoring';
      
      if (currentStory) {
        story = currentStory[1];
        storyName = currentStory[2];
      }
      
      // Determine priority and estimate based on task content
      let priority = 'medium';
      let estimate = '4 hours';
      let wipClass = 'feature';
      
      // High priority for core architecture, refactoring, and performance
      if (taskTitle.toLowerCase().includes('architecture') || 
          taskTitle.toLowerCase().includes('refactor') || 
          taskTitle.toLowerCase().includes('performance') ||
          taskTitle.toLowerCase().includes('security') ||
          taskTitle.toLowerCase().includes('critical') ||
          taskTitle.toLowerCase().includes('framework') ||
          taskTitle.toLowerCase().includes('system')) {
        priority = 'high';
        estimate = '6 hours';
        wipClass = 'infrastructure';
      }
      
      // UI and component tasks
      else if (taskTitle.toLowerCase().includes('ui') || 
               taskTitle.toLowerCase().includes('component') ||
               taskTitle.toLowerCase().includes('frontend') ||
               taskTitle.toLowerCase().includes('interface') ||
               taskTitle.toLowerCase().includes('accessibility') ||
               taskTitle.toLowerCase().includes('modernization')) {
        priority = 'medium';
        estimate = '5 hours';
        wipClass = 'ui';
      }
      
      // Testing and quality tasks  
      else if (taskTitle.toLowerCase().includes('test') || 
               taskTitle.toLowerCase().includes('testing') ||
               taskTitle.toLowerCase().includes('coverage') ||
               taskTitle.toLowerCase().includes('quality') ||
               taskTitle.toLowerCase().includes('analysis') ||
               taskTitle.toLowerCase().includes('validation')) {
        priority = 'high';
        estimate = '4 hours';
        wipClass = 'testing';
      }
      
      // Documentation tasks
      else if (taskTitle.toLowerCase().includes('document') || 
               taskTitle.toLowerCase().includes('documentation') ||
               taskTitle.toLowerCase().includes('guide') ||
               taskTitle.toLowerCase().includes('standards') ||
               taskTitle.toLowerCase().includes('onboarding')) {
        priority = 'low';
        estimate = '3 hours';
        wipClass = 'documentation';
      }
      
      // Development and implementation tasks
      else if (taskTitle.toLowerCase().includes('implement') || 
               taskTitle.toLowerCase().includes('develop') ||
               taskTitle.toLowerCase().includes('build') ||
               taskTitle.toLowerCase().includes('create') ||
               taskTitle.toLowerCase().includes('enhance') ||
               taskTitle.toLowerCase().includes('improve')) {
        priority = 'medium';
        estimate = '5 hours';
        wipClass = 'feature';
      }
      
      // Assign tags based on task content
      const tags = [];
      if (taskTitle.toLowerCase().includes('technical debt') || taskTitle.toLowerCase().includes('debt')) tags.push('technical-debt');
      if (taskTitle.toLowerCase().includes('refactor') || taskTitle.toLowerCase().includes('refactoring')) tags.push('refactoring');
      if (taskTitle.toLowerCase().includes('performance') || taskTitle.toLowerCase().includes('optimization')) tags.push('performance');
      if (taskTitle.toLowerCase().includes('test') || taskTitle.toLowerCase().includes('testing')) tags.push('testing');
      if (taskTitle.toLowerCase().includes('coverage') || taskTitle.toLowerCase().includes('quality')) tags.push('quality-assurance');
      if (taskTitle.toLowerCase().includes('architecture') || taskTitle.toLowerCase().includes('design')) tags.push('architecture');
      if (taskTitle.toLowerCase().includes('component') || taskTitle.toLowerCase().includes('frontend')) tags.push('frontend');
      if (taskTitle.toLowerCase().includes('engine') || taskTitle.toLowerCase().includes('core')) tags.push('core-engine');
      if (taskTitle.toLowerCase().includes('type') || taskTitle.toLowerCase().includes('typing')) tags.push('type-system');
      if (taskTitle.toLowerCase().includes('error') || taskTitle.toLowerCase().includes('handling')) tags.push('error-handling');
      if (taskTitle.toLowerCase().includes('state') || taskTitle.toLowerCase().includes('management')) tags.push('state-management');
      if (taskTitle.toLowerCase().includes('accessibility') || taskTitle.toLowerCase().includes('a11y')) tags.push('accessibility');
      if (taskTitle.toLowerCase().includes('integration') || taskTitle.toLowerCase().includes('e2e')) tags.push('integration-testing');
      if (taskTitle.toLowerCase().includes('static') || taskTitle.toLowerCase().includes('analysis')) tags.push('static-analysis');
      if (taskTitle.toLowerCase().includes('ci') || taskTitle.toLowerCase().includes('pipeline')) tags.push('ci-cd');
      if (taskTitle.toLowerCase().includes('api') || taskTitle.toLowerCase().includes('backend')) tags.push('api');
      if (taskTitle.toLowerCase().includes('documentation') || taskTitle.toLowerCase().includes('docs')) tags.push('documentation');
      if (taskTitle.toLowerCase().includes('automation') || taskTitle.toLowerCase().includes('tooling')) tags.push('automation');
      if (taskTitle.toLowerCase().includes('security') || taskTitle.toLowerCase().includes('vulnerability')) tags.push('security');
      if (taskTitle.toLowerCase().includes('monitoring') || taskTitle.toLowerCase().includes('metrics')) tags.push('monitoring');
      
      // Default tags if none assigned
      if (tags.length === 0) {
        tags.push('technical-improvement');
      }
      
      // Generate detailed description
      let description = `Implement ${taskTitle.toLowerCase()} as part of Epic 18 - Technical Debt & Refactoring.`;
      
      if (currentSubstory) {
        description += ` This task is part of substory ${currentSubstory[1]} (${currentSubstory[2]}) with estimated duration ${currentSubstory[3]}.`;
      }
      
      // Add specific technical details based on task type
      if (taskTitle.includes('architecture') || taskTitle.includes('design')) {
        description += ' Includes architectural analysis, design pattern implementation, component restructuring, and system integration planning.';
      } else if (taskTitle.includes('refactor') || taskTitle.includes('refactoring')) {
        description += ' Includes code structure improvements, pattern standardization, dependency reduction, and maintainability enhancements.';
      } else if (taskTitle.includes('performance') || taskTitle.includes('optimization')) {
        description += ' Includes performance profiling, bottleneck identification, optimization implementation, and performance monitoring setup.';
      } else if (taskTitle.includes('test') || taskTitle.includes('testing')) {
        description += ' Includes test case development, coverage analysis, test automation, and quality assurance process implementation.';
      } else if (taskTitle.includes('component') || taskTitle.includes('frontend')) {
        description += ' Includes component modernization, React pattern implementation, state management improvements, and UI/UX enhancements.';
      } else if (taskTitle.includes('engine') || taskTitle.includes('core')) {
        description += ' Includes core system refactoring, execution context improvements, runtime optimization, and API enhancement.';
      } else if (taskTitle.includes('documentation') || taskTitle.includes('guide')) {
        description += ' Includes technical writing, API documentation, developer guides, and knowledge base development.';
      } else if (taskTitle.includes('static') && taskTitle.includes('analysis')) {
        description += ' Includes linting configuration, code quality tools, automated analysis setup, and continuous integration enhancement.';
      } else if (taskTitle.includes('type') || taskTitle.includes('typing')) {
        description += ' Includes TypeScript enhancement, type safety improvements, interface design, and type validation implementation.';
      } else if (taskTitle.includes('error') && taskTitle.includes('handling')) {
        description += ' Includes error management strategy, exception handling patterns, user-friendly error messages, and error recovery mechanisms.';
      }
      
      // Generate acceptance criteria
      const acceptanceCriteria = [];
      
      if (taskTitle.includes('architecture') || taskTitle.includes('design')) {
        acceptanceCriteria.push('Architecture improvements enhance system maintainability');
        acceptanceCriteria.push('Design patterns are consistently applied across codebase');
        acceptanceCriteria.push('Component dependencies are clearly defined and minimal');
        acceptanceCriteria.push('System extensibility is improved without breaking existing functionality');
      }
      
      if (taskTitle.includes('refactor') || taskTitle.includes('refactoring')) {
        acceptanceCriteria.push('Code structure is cleaner and more maintainable');
        acceptanceCriteria.push('Duplicate code is eliminated or consolidated');
        acceptanceCriteria.push('Code complexity metrics show measurable improvement');
        acceptanceCriteria.push('Existing functionality is preserved through comprehensive testing');
      }
      
      if (taskTitle.includes('performance') || taskTitle.includes('optimization')) {
        acceptanceCriteria.push('Performance benchmarks show measurable improvements');
        acceptanceCriteria.push('Memory usage is optimized and monitored');
        acceptanceCriteria.push('Load times meet or exceed performance targets');
        acceptanceCriteria.push('Performance monitoring provides actionable insights');
      }
      
      if (taskTitle.includes('test') || taskTitle.includes('testing')) {
        acceptanceCriteria.push('Test coverage meets or exceeds established targets');
        acceptanceCriteria.push('Test suite runs reliably and provides clear feedback');
        acceptanceCriteria.push('Tests cover edge cases and error conditions');
        acceptanceCriteria.push('Test automation reduces manual testing burden');
      }
      
      if (taskTitle.includes('component') || taskTitle.includes('frontend')) {
        acceptanceCriteria.push('Components follow established React patterns and best practices');
        acceptanceCriteria.push('UI components are reusable and well-documented');
        acceptanceCriteria.push('Frontend performance meets user experience standards');
        acceptanceCriteria.push('Components are accessible and responsive');
      }
      
      if (taskTitle.includes('engine') || taskTitle.includes('core')) {
        acceptanceCriteria.push('Core engine functionality is more robust and performant');
        acceptanceCriteria.push('API interfaces are consistent and well-designed');
        acceptanceCriteria.push('Runtime execution is optimized and reliable');
        acceptanceCriteria.push('Core system changes maintain backward compatibility');
      }
      
      if (taskTitle.includes('documentation') || taskTitle.includes('guide')) {
        acceptanceCriteria.push('Documentation is comprehensive and up-to-date');
        acceptanceCriteria.push('Developer guides enable efficient onboarding');
        acceptanceCriteria.push('API documentation is accurate and includes examples');
        acceptanceCriteria.push('Documentation is easily searchable and navigable');
      }
      
      if (taskTitle.includes('static') && taskTitle.includes('analysis')) {
        acceptanceCriteria.push('Static analysis tools catch common issues automatically');
        acceptanceCriteria.push('Code quality standards are enforced consistently');
        acceptanceCriteria.push('Analysis results provide actionable improvement suggestions');
        acceptanceCriteria.push('Tool integration works seamlessly with developer workflow');
      }
      
      if (taskTitle.includes('type') || taskTitle.includes('typing')) {
        acceptanceCriteria.push('Type system provides better development experience');
        acceptanceCriteria.push('Type safety prevents common runtime errors');
        acceptanceCriteria.push('Type definitions are accurate and complete');
        acceptanceCriteria.push('TypeScript configuration optimizes development productivity');
      }
      
      if (taskTitle.includes('error') && taskTitle.includes('handling')) {
        acceptanceCriteria.push('Error handling is consistent across the application');
        acceptanceCriteria.push('Error messages are helpful and user-friendly');
        acceptanceCriteria.push('Error recovery mechanisms work reliably');
        acceptanceCriteria.push('Error logging provides sufficient debugging information');
      }
      
      if (taskTitle.includes('accessibility') || taskTitle.includes('a11y')) {
        acceptanceCriteria.push('Application meets WCAG accessibility standards');
        acceptanceCriteria.push('Keyboard navigation works for all interactive elements');
        acceptanceCriteria.push('Screen readers can effectively use the application');
        acceptanceCriteria.push('Color contrast and visual accessibility requirements are met');
      }
      
      if (taskTitle.includes('integration') || taskTitle.includes('e2e')) {
        acceptanceCriteria.push('Integration tests cover critical user workflows');
        acceptanceCriteria.push('Test suite catches integration issues before deployment');
        acceptanceCriteria.push('E2E tests validate complete user journeys');
        acceptanceCriteria.push('Test execution is reliable and maintainable');
      }
      
      // Default acceptance criteria
      if (acceptanceCriteria.length === 0) {
        acceptanceCriteria.push('Technical improvement is implemented and functional');
        acceptanceCriteria.push('Code quality metrics show measurable improvement');
        acceptanceCriteria.push('Changes do not break existing functionality');
      }
      
      tasks.push({
        title: taskTitle,
        description,
        estimate,
        priority,
        wipClass,
        story,
        storyName,
        epic: 'Technical Debt & Refactoring',
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
  return `E18-${timestamp}-${random}`;
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
      source: 'epic18-automation',
      category: 'technical-debt-refactoring',
      automated: true,
      epic: 'Technical Debt & Refactoring',
      storyNumber: taskDef.story,
      storyName: taskDef.storyName,
      completionStatus: 'Epic 18 Stories 18.1 & 18.2 complete - processing remaining refactoring and quality improvements'
    }
  };
}

async function createEpic18Tasks() {
  console.log('🔧 Creating Epic 18: Technical Debt & Refactoring Tasks\n');
  console.log('📋 Based on: docs/epic18plan.md');
  console.log('ℹ️  Note: Epic 18 Stories 18.1 & 18.2 complete - processing remaining refactoring and quality improvements\n');
  
  try {
    // Extract tasks from Epic 18 plan
    const epic18Tasks = await extractTasksFromEpic18Plan();
    
    if (epic18Tasks.length === 0) {
      console.log('🎉 All Epic 18 tasks are already complete!');
      console.log('🔧 Epic 18 Status: 100% complete - Technical Debt & Refactoring System Complete');
      return {
        created: 0,
        skipped: 0,
        total: 0,
        allComplete: true
      };
    }
    
    console.log(`📝 Extracted ${epic18Tasks.length} remaining tasks from Epic 18 plan\n`);
    
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
    
    // Process Epic 18 tasks
    for (const taskDef of epic18Tasks) {
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
      
      // Track improvement categories
      const improvementTypes = ['refactoring', 'testing', 'performance', 'architecture', 'documentation'];
      improvementTypes.forEach(improvementType => {
        if (taskDef.tags.some(tag => tag.includes(improvementType))) {
          categoryBreakdown[improvementType] = (categoryBreakdown[improvementType] || 0) + 1;
        }
      });
    }
    
    // Update state metadata
    if (!state.metadata) {
      state.metadata = {};
    }
    state.metadata.lastUpdated = new Date().toISOString();
    state.metadata.totalTasks = Object.keys(state.tasks).length;
    state.metadata.epic18TasksCreated = tasksCreated;
    
    // Save updated state
    await saveState(state);
    
    // Generate comprehensive summary
    console.log('📊 EPIC 18 TASK CREATION SUMMARY');
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
        console.log('🔧 IMPROVEMENT CATEGORIES:');
        Object.entries(categoryBreakdown).forEach(([categoryType, count]) => {
          const emoji = categoryType === 'refactoring' ? '♻️' : 
                       categoryType === 'testing' ? '🧪' : 
                       categoryType === 'performance' ? '⚡' : 
                       categoryType === 'architecture' ? '🏗️' : 
                       categoryType === 'documentation' ? '📚' : '🔧';
          console.log(`   ${emoji} ${categoryType.toUpperCase()}: ${count} tasks`);
        });
        console.log('');
      }
    }
    
    console.log('\n🤖 NEXT STEPS FOR AGENTS:\n');
    console.log('1. 🎯 Focus on high-priority refactoring and performance improvements');
    console.log('2. 🔄 Use: `node src/grab-tasks.js <agent-id>` to grab Epic 18 tasks');
    console.log('3. 🏷️  Filter by tags: "refactoring", "testing", "performance", "architecture"');
    console.log('4. ⏱️  Stories 18.1 & 18.2 complete - focus on frontend modernization and quality');
    console.log('5. 📋 Maintain backward compatibility throughout refactoring process\n');
    
    console.log('✨ Epic 18 remaining tasks processed successfully!');
    console.log('🔧 Technical Debt & Refactoring implementation ready!');
    console.log('📈 Epic 18 Status: Foundation complete, remaining quality improvements ready for implementation');
    
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
    console.error('❌ Failed to create Epic 18 tasks:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  createEpic18Tasks().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { 
  createEpic18Tasks,
  extractTasksFromEpic18Plan
};