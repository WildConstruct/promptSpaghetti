#!/usr/bin/env node

/**
 * Create Epic 21 Tasks Script
 * 
 * Converts Epic 21 (AI-Powered Design Assistant) plan
 * into executable tasks in the task management system.
 * 
 * Based on: docs/epic21plan.md
 * Note: Only processes uncompleted tasks (marked with [ ])
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// Function to extract pending tasks from the Epic 21 plan file
async function extractTasksFromEpic21Plan() {
  const planPath = path.join(__dirname, '..', 'docs', 'epic21plan.md');
  const content = await fs.readFile(planPath, 'utf8');
  
  // Extract all pending checkbox tasks from the plan ([ ] not [x])
  const taskMatches = content.match(/^- \[ \] .+$/gm);
  
  if (!taskMatches) {
    console.log('ℹ️  All Epic 21 tasks appear to be completed - no pending tasks found');
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
      currentStory = line.match(/## Story (\d+\.\d+) – (.+?)(?:\s+✅\s+\*\*COMPLETE\*\*)?$/);
    }
    
    // Process only pending task items (not completed ones)
    if (line.match(/^- \[ \] /) && !line.match(/^- \[x\] /)) {
      const taskTitle = line.replace(/^- \[ \] /, '');
      
      // Determine story context
      let story = '21';
      let storyName = 'AI-Powered Design Assistant';
      
      if (currentStory) {
        story = currentStory[1];
        storyName = currentStory[2];
      }
      
      // Determine priority and estimate based on task content
      let priority = 'medium';
      let estimate = '4 hours';
      let wipClass = 'feature';
      
      // High priority for core AI, pattern recognition, and machine learning
      if (taskTitle.toLowerCase().includes('ai') || 
          taskTitle.toLowerCase().includes('pattern') || 
          taskTitle.toLowerCase().includes('algorithm') ||
          taskTitle.toLowerCase().includes('ml') ||
          taskTitle.toLowerCase().includes('machine learning') ||
          taskTitle.toLowerCase().includes('llm') ||
          taskTitle.toLowerCase().includes('engine') ||
          taskTitle.toLowerCase().includes('detection') ||
          taskTitle.toLowerCase().includes('recommendation')) {
        priority = 'high';
        estimate = '6 hours';
        wipClass = 'infrastructure';
      }
      
      // UI and interface tasks
      else if (taskTitle.toLowerCase().includes('ui') || 
               taskTitle.toLowerCase().includes('interface') ||
               taskTitle.toLowerCase().includes('sidebar') ||
               taskTitle.toLowerCase().includes('workflow') ||
               taskTitle.toLowerCase().includes('dashboard') ||
               taskTitle.toLowerCase().includes('editor') ||
               taskTitle.toLowerCase().includes('palette')) {
        priority = 'medium';
        estimate = '5 hours';
        wipClass = 'ui';
      }
      
      // Core implementation and development tasks  
      else if (taskTitle.toLowerCase().includes('implement') || 
               taskTitle.toLowerCase().includes('develop') ||
               taskTitle.toLowerCase().includes('build') ||
               taskTitle.toLowerCase().includes('create') ||
               taskTitle.toLowerCase().includes('design') ||
               taskTitle.toLowerCase().includes('integrate')) {
        priority = 'high';
        estimate = '6 hours';
        wipClass = 'feature';
      }
      
      // Testing and validation tasks
      else if (taskTitle.toLowerCase().includes('test') || 
               taskTitle.toLowerCase().includes('testing') ||
               taskTitle.toLowerCase().includes('accuracy') ||
               taskTitle.toLowerCase().includes('validation') ||
               taskTitle.toLowerCase().includes('benchmark')) {
        priority = 'medium';
        estimate = '4 hours';
        wipClass = 'testing';
      }
      
      // Documentation and research tasks
      else if (taskTitle.toLowerCase().includes('document') || 
               taskTitle.toLowerCase().includes('research') ||
               taskTitle.toLowerCase().includes('guide') ||
               taskTitle.toLowerCase().includes('tutorial')) {
        priority = 'low';
        estimate = '3 hours';
        wipClass = 'documentation';
      }
      
      // Assign tags based on task content
      const tags = [];
      if (taskTitle.toLowerCase().includes('pattern') || taskTitle.toLowerCase().includes('recognition')) tags.push('pattern-recognition');
      if (taskTitle.toLowerCase().includes('ai') || taskTitle.toLowerCase().includes('artificial intelligence')) tags.push('artificial-intelligence');
      if (taskTitle.toLowerCase().includes('ml') || taskTitle.toLowerCase().includes('machine learning')) tags.push('machine-learning');
      if (taskTitle.toLowerCase().includes('llm') || taskTitle.toLowerCase().includes('language model')) tags.push('llm-integration');
      if (taskTitle.toLowerCase().includes('graph') || taskTitle.toLowerCase().includes('node')) tags.push('graph-analysis');
      if (taskTitle.toLowerCase().includes('suggestion') || taskTitle.toLowerCase().includes('recommendation')) tags.push('recommendation-engine');
      if (taskTitle.toLowerCase().includes('automation') || taskTitle.toLowerCase().includes('automated')) tags.push('automation');
      if (taskTitle.toLowerCase().includes('template') || taskTitle.toLowerCase().includes('templating')) tags.push('template-system');
      if (taskTitle.toLowerCase().includes('debug') || taskTitle.toLowerCase().includes('debugging')) tags.push('debugging-assistant');
      if (taskTitle.toLowerCase().includes('natural language') || taskTitle.toLowerCase().includes('generation')) tags.push('natural-language');
      if (taskTitle.toLowerCase().includes('configuration') || taskTitle.toLowerCase().includes('parameter')) tags.push('node-configuration');
      if (taskTitle.toLowerCase().includes('analytics') || taskTitle.toLowerCase().includes('telemetry')) tags.push('analytics');
      if (taskTitle.toLowerCase().includes('learning') || taskTitle.toLowerCase().includes('feedback')) tags.push('adaptive-learning');
      if (taskTitle.toLowerCase().includes('ui') || taskTitle.toLowerCase().includes('interface')) tags.push('ui');
      if (taskTitle.toLowerCase().includes('api') || taskTitle.toLowerCase().includes('service')) tags.push('api');
      if (taskTitle.toLowerCase().includes('algorithm') || taskTitle.toLowerCase().includes('heuristic')) tags.push('algorithms');
      if (taskTitle.toLowerCase().includes('optimization') || taskTitle.toLowerCase().includes('performance')) tags.push('optimization');
      
      // Default tags if none assigned
      if (tags.length === 0) {
        tags.push('ai-design-assistant');
      }
      
      // Generate detailed description
      let description = `Implement ${taskTitle.toLowerCase()} as part of Epic 21 - AI-Powered Design Assistant.`;
      
      // Add specific technical details based on task type
      if (taskTitle.includes('pattern') || taskTitle.includes('recognition')) {
        description += ' Includes graph pattern analysis, best-practice detection, anti-pattern identification, and intelligent optimization recommendations.';
      } else if (taskTitle.includes('configuration') || taskTitle.includes('parameter')) {
        description += ' Includes automated parameter suggestion, context-aware recommendations, machine learning optimization, and user feedback integration.';
      } else if (taskTitle.includes('natural language') || taskTitle.includes('generation')) {
        description += ' Includes LLM integration, intent parsing, graph DSL generation, and natural language to graph structure conversion.';
      } else if (taskTitle.includes('debug') || taskTitle.includes('assistant')) {
        description += ' Includes intelligent error detection, root cause analysis, automated fix suggestions, and interactive debugging workflows.';
      } else if (taskTitle.includes('template') || taskTitle.includes('smart')) {
        description += ' Includes adaptive template recommendations, usage analytics, template versioning, and intelligent template matching.';
      } else if (taskTitle.includes('algorithm') || taskTitle.includes('engine')) {
        description += ' Includes algorithm research, pattern detection engines, scoring mechanisms, and optimization rule implementations.';
      } else if (taskTitle.includes('analytics') || taskTitle.includes('telemetry')) {
        description += ' Includes usage tracking, performance metrics, user behavior analysis, and AI model improvement feedback loops.';
      } else if (taskTitle.includes('UI') || taskTitle.includes('interface')) {
        description += ' Includes intelligent UI components, suggestion interfaces, interactive assistance panels, and seamless editor integration.';
      }
      
      // Generate acceptance criteria
      const acceptanceCriteria = [];
      
      if (taskTitle.includes('pattern') || taskTitle.includes('recognition')) {
        acceptanceCriteria.push('Pattern recognition achieves ≥90% accuracy in detection benchmark');
        acceptanceCriteria.push('Pattern library covers common best practices and anti-patterns');
        acceptanceCriteria.push('Scoring mechanism provides meaningful pattern relevance assessment');
        acceptanceCriteria.push('Pattern detection integrates seamlessly with graph editor');
      }
      
      if (taskTitle.includes('configuration') || taskTitle.includes('parameter')) {
        acceptanceCriteria.push('Parameter suggestions achieve ≥70% user acceptance rate');
        acceptanceCriteria.push('Context extraction accurately analyzes surrounding graph structure');
        acceptanceCriteria.push('Recommendation service returns relevant, ranked parameter sets');
        acceptanceCriteria.push('Learning loop improves suggestions based on user feedback');
      }
      
      if (taskTitle.includes('natural language') || taskTitle.includes('generation')) {
        description += ' Includes LLM integration, intent parsing, graph DSL generation, and natural language to graph structure conversion.';
        acceptanceCriteria.push('NL graph generation reduces manual node creation time by ≥40%');
        acceptanceCriteria.push('LLM output parsing handles schema validation reliably');
        acceptanceCriteria.push('Clarification workflow handles ambiguous user intents effectively');
        acceptanceCriteria.push('Generation accuracy meets quality benchmarks consistently');
      }
      
      if (taskTitle.includes('debug') || taskTitle.includes('assistant')) {
        acceptanceCriteria.push('Debugging assistant detects common graph issues accurately');
        acceptanceCriteria.push('Automated quick-fix actions resolve issues correctly');
        acceptanceCriteria.push('Explanation generator provides clear root cause analysis');
        acceptanceCriteria.push('Issue detection achieves high precision and recall rates');
      }
      
      if (taskTitle.includes('template') || taskTitle.includes('smart')) {
        acceptanceCriteria.push('Template recommendation system maps user intent accurately');
        acceptanceCriteria.push('Learning mechanism adapts to user template preferences');
        acceptanceCriteria.push('Template management UI provides intuitive browsing and rating');
        acceptanceCriteria.push('Template analytics track effectiveness and usage patterns');
      }
      
      if (taskTitle.includes('algorithm') || taskTitle.includes('engine')) {
        acceptanceCriteria.push('Algorithm implementation handles PromptScape data model efficiently');
        acceptanceCriteria.push('Graph traversal utilities scale with large graph structures');
        acceptanceCriteria.push('Rules engine processes pattern matching reliably');
        acceptanceCriteria.push('Engine performance meets real-time suggestion requirements');
      }
      
      if (taskTitle.includes('analytics') || taskTitle.includes('telemetry')) {
        acceptanceCriteria.push('Analytics pipeline captures user interaction data accurately');
        acceptanceCriteria.push('Telemetry system tracks AI model performance effectively');
        acceptanceCriteria.push('Feedback loops enable continuous model improvement');
        acceptanceCriteria.push('Analytics dashboard provides actionable insights for optimization');
      }
      
      if (taskTitle.includes('UI') || taskTitle.includes('interface')) {
        acceptanceCriteria.push('AI assistant UI integrates seamlessly with existing editor');
        acceptanceCriteria.push('Suggestion interfaces provide clear, actionable recommendations');
        acceptanceCriteria.push('Interactive workflows guide users through AI-assisted tasks');
        acceptanceCriteria.push('UI performance maintains responsiveness with AI features active');
      }
      
      if (taskTitle.includes('test') || taskTitle.includes('testing')) {
        acceptanceCriteria.push('Test coverage achieves >80% for AI assistant components');
        acceptanceCriteria.push('Accuracy benchmarks validate AI model performance');
        acceptanceCriteria.push('Integration tests verify end-to-end AI workflows');
        acceptanceCriteria.push('Performance tests ensure <5% CPU/memory overhead');
      }
      
      // Default acceptance criteria
      if (acceptanceCriteria.length === 0) {
        acceptanceCriteria.push('AI-powered design assistant feature implemented and functional');
        acceptanceCriteria.push('Integration with existing Epic 21 system verified');
        acceptanceCriteria.push('AI assistance improves user productivity and experience');
      }
      
      tasks.push({
        title: taskTitle,
        description,
        estimate,
        priority,
        wipClass,
        story,
        storyName,
        epic: 'AI-Powered Design Assistant',
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
  return `E21-${timestamp}-${random}`;
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
      source: 'epic21-automation',
      category: 'ai-powered-design-assistant',
      automated: true,
      epic: 'AI-Powered Design Assistant',
      storyNumber: taskDef.story,
      storyName: taskDef.storyName,
      completionStatus: 'Epic 21 provides comprehensive AI-powered design assistance - ready for implementation'
    }
  };
}

async function createEpic21Tasks() {
  console.log('🤖 Creating Epic 21: AI-Powered Design Assistant Tasks\n');
  console.log('📋 Based on: docs/epic21plan.md');
  console.log('ℹ️  Note: Epic 21 provides comprehensive AI-powered design assistance capabilities\n');
  
  try {
    // Extract tasks from Epic 21 plan
    const epic21Tasks = await extractTasksFromEpic21Plan();
    
    if (epic21Tasks.length === 0) {
      console.log('🎉 All Epic 21 tasks are already complete!');
      console.log('🤖 Epic 21 Status: 100% complete - Production-ready AI-Powered Design Assistant');
      return {
        created: 0,
        skipped: 0,
        total: 0,
        allComplete: true
      };
    }
    
    console.log(`📝 Extracted ${epic21Tasks.length} tasks from Epic 21 plan\n`);
    
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
    const aiFeatureBreakdown = {};
    
    // Process Epic 21 tasks
    for (const taskDef of epic21Tasks) {
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
      
      // Track AI feature types
      const aiFeatureTypes = ['pattern-recognition', 'artificial-intelligence', 'machine-learning', 'llm-integration', 'recommendation-engine', 'debugging-assistant'];
      aiFeatureTypes.forEach(aiFeatureType => {
        if (taskDef.tags.some(tag => tag.includes(aiFeatureType))) {
          aiFeatureBreakdown[aiFeatureType] = (aiFeatureBreakdown[aiFeatureType] || 0) + 1;
        }
      });
    }
    
    // Update state metadata
    if (!state.metadata) {
      state.metadata = {};
    }
    state.metadata.lastUpdated = new Date().toISOString();
    state.metadata.totalTasks = Object.keys(state.tasks).length;
    state.metadata.epic21TasksCreated = tasksCreated;
    
    // Save updated state
    await saveState(state);
    
    // Generate comprehensive summary
    console.log('📊 EPIC 21 TASK CREATION SUMMARY');
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
      
      // AI feature breakdown
      if (Object.keys(aiFeatureBreakdown).length > 0) {
        console.log('🤖 AI FEATURES:');
        Object.entries(aiFeatureBreakdown).forEach(([aiFeatureType, count]) => {
          const emoji = aiFeatureType === 'pattern-recognition' ? '🔍' : 
                       aiFeatureType === 'artificial-intelligence' ? '🧠' : 
                       aiFeatureType === 'machine-learning' ? '📈' : 
                       aiFeatureType === 'llm-integration' ? '🗣️' : 
                       aiFeatureType === 'recommendation-engine' ? '💡' : 
                       aiFeatureType === 'debugging-assistant' ? '🐛' : '🤖';
          console.log(`   ${emoji} ${aiFeatureType.toUpperCase().replace('-', ' ')}: ${count} tasks`);
        });
        console.log('');
      }
    }
    
    console.log('\n🤖 NEXT STEPS FOR AGENTS:\n');
    console.log('1. 🎯 Focus on high-priority pattern recognition and AI engine development');
    console.log('2. 🔄 Use: `node src/grab-tasks.js <agent-id>` to grab Epic 21 tasks');
    console.log('3. 🏷️  Filter by tags: "pattern-recognition", "artificial-intelligence", "llm-integration", "recommendation-engine"');
    console.log('4. ⏱️  Start with pattern detection engine, then node configuration, then natural language generation');
    console.log('5. 📋 AI accuracy and user acceptance metrics are critical - implement with comprehensive testing\n');
    
    console.log('✨ Epic 21 tasks created successfully!');
    console.log('🤖 AI-Powered Design Assistant implementation ready!');
    console.log('📈 Epic 21 Status: Complete AI-powered design assistance system ready for development');
    
    return {
      created: tasksCreated,
      skipped: tasksSkipped,
      total: Object.keys(state.tasks).length,
      storyBreakdown,
      priorityBreakdown,
      wipClassBreakdown,
      aiFeatureBreakdown
    };
    
  } catch (error) {
    console.error('❌ Failed to create Epic 21 tasks:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  createEpic21Tasks().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { 
  createEpic21Tasks,
  extractTasksFromEpic21Plan
};