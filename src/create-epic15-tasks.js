#!/usr/bin/env node

/**
 * Create Epic 15 Tasks Script
 * 
 * Converts Epic 15 (Mobile & Cross-Platform Support) plan
 * into executable tasks in the task management system.
 * 
 * Based on: docs/epic15plan.md
 * Note: Only processes uncompleted tasks (marked with [ ])
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// Function to extract pending tasks from the Epic 15 plan file
async function extractTasksFromEpic15Plan() {
  const planPath = path.join(__dirname, '..', 'docs', 'epic15plan.md');
  const content = await fs.readFile(planPath, 'utf8');
  
  // Extract all pending checkbox tasks from the plan ([ ] not [x])
  const taskMatches = content.match(/^- \[ \] .+$/gm);
  
  if (!taskMatches) {
    console.log('ℹ️  All Epic 15 tasks appear to be completed - no pending tasks found');
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
      let story = '15';
      let storyName = 'Mobile & Cross-Platform Support';
      
      if (currentStory) {
        story = currentStory[1];
        storyName = currentStory[2];
      }
      
      // Determine priority and estimate based on task content
      let priority = 'medium';
      let estimate = '4 hours';
      let wipClass = 'feature';
      
      // High priority for core architecture and framework selection
      if (taskTitle.toLowerCase().includes('architecture') || 
          taskTitle.toLowerCase().includes('framework') || 
          taskTitle.toLowerCase().includes('requirements') ||
          taskTitle.toLowerCase().includes('design sync protocol') ||
          taskTitle.toLowerCase().includes('select technology') ||
          taskTitle.toLowerCase().includes('evaluate') ||
          taskTitle.toLowerCase().includes('research')) {
        priority = 'high';
        estimate = '6 hours';
        wipClass = 'infrastructure';
      }
      
      // UI and mobile interface tasks
      else if (taskTitle.toLowerCase().includes('ui') || 
               taskTitle.toLowerCase().includes('interface') ||
               taskTitle.toLowerCase().includes('design') ||
               taskTitle.toLowerCase().includes('mobile layout') ||
               taskTitle.toLowerCase().includes('responsive') ||
               taskTitle.toLowerCase().includes('component')) {
        priority = 'medium';
        estimate = '5 hours';
        wipClass = 'ui';
      }
      
      // Core implementation and development tasks  
      else if (taskTitle.toLowerCase().includes('implement') || 
               taskTitle.toLowerCase().includes('develop') ||
               taskTitle.toLowerCase().includes('build') ||
               taskTitle.toLowerCase().includes('create') ||
               taskTitle.toLowerCase().includes('application') ||
               taskTitle.toLowerCase().includes('sync')) {
        priority = 'high';
        estimate = '6 hours';
        wipClass = 'feature';
      }
      
      // Testing and optimization tasks
      else if (taskTitle.toLowerCase().includes('test') || 
               taskTitle.toLowerCase().includes('optimization') ||
               taskTitle.toLowerCase().includes('performance') ||
               taskTitle.toLowerCase().includes('profile') ||
               taskTitle.toLowerCase().includes('validate')) {
        priority = 'medium';
        estimate = '3 hours';
        wipClass = 'testing';
      }
      
      // Deployment and store tasks
      else if (taskTitle.toLowerCase().includes('deployment') || 
               taskTitle.toLowerCase().includes('store') ||
               taskTitle.toLowerCase().includes('submit') ||
               taskTitle.toLowerCase().includes('distribution') ||
               taskTitle.toLowerCase().includes('prepare')) {
        priority = 'low';
        estimate = '2 hours';
        wipClass = 'documentation';
      }
      
      // Assign tags based on task content
      const tags = [];
      if (taskTitle.toLowerCase().includes('responsive') || taskTitle.toLowerCase().includes('mobile layout')) tags.push('responsive');
      if (taskTitle.toLowerCase().includes('touch') || taskTitle.toLowerCase().includes('gesture')) tags.push('touch-interaction');
      if (taskTitle.toLowerCase().includes('ios') || taskTitle.toLowerCase().includes('ipad')) tags.push('ios');
      if (taskTitle.toLowerCase().includes('android') || taskTitle.toLowerCase().includes('material')) tags.push('android');
      if (taskTitle.toLowerCase().includes('desktop') || taskTitle.toLowerCase().includes('electron')) tags.push('desktop');
      if (taskTitle.toLowerCase().includes('sync') || taskTitle.toLowerCase().includes('synchronization')) tags.push('synchronization');
      if (taskTitle.toLowerCase().includes('offline') || taskTitle.toLowerCase().includes('storage')) tags.push('offline');
      if (taskTitle.toLowerCase().includes('canvas') || taskTitle.toLowerCase().includes('node')) tags.push('canvas');
      if (taskTitle.toLowerCase().includes('navigation') || taskTitle.toLowerCase().includes('menu')) tags.push('navigation');
      if (taskTitle.toLowerCase().includes('performance') || taskTitle.toLowerCase().includes('optimization')) tags.push('performance');
      if (taskTitle.toLowerCase().includes('security') || taskTitle.toLowerCase().includes('encryption')) tags.push('security');
      if (taskTitle.toLowerCase().includes('conflict') || taskTitle.toLowerCase().includes('resolution')) tags.push('conflict-resolution');
      if (taskTitle.toLowerCase().includes('store') || taskTitle.toLowerCase().includes('deployment')) tags.push('deployment');
      if (taskTitle.toLowerCase().includes('test') || taskTitle.toLowerCase().includes('validation')) tags.push('testing');
      if (taskTitle.toLowerCase().includes('ui') || taskTitle.toLowerCase().includes('component')) tags.push('ui');
      if (taskTitle.toLowerCase().includes('api') || taskTitle.toLowerCase().includes('backend')) tags.push('api');
      if (taskTitle.toLowerCase().includes('platform') || taskTitle.toLowerCase().includes('cross-platform')) tags.push('cross-platform');
      if (taskTitle.toLowerCase().includes('integration') || taskTitle.toLowerCase().includes('sharing')) tags.push('integration');
      if (taskTitle.toLowerCase().includes('file') || taskTitle.toLowerCase().includes('document')) tags.push('file-system');
      if (taskTitle.toLowerCase().includes('notification') || taskTitle.toLowerCase().includes('widget')) tags.push('native-features');
      
      // Default tags if none assigned
      if (tags.length === 0) {
        tags.push('mobile-support');
      }
      
      // Generate detailed description
      let description = `Implement ${taskTitle.toLowerCase()} as part of Epic 15 - Mobile & Cross-Platform Support.`;
      
      if (currentSubstory) {
        description += ` This task is part of substory ${currentSubstory[1]} (${currentSubstory[2]}) with estimated duration ${currentSubstory[3]}.`;
      }
      
      // Add specific technical details based on task type
      if (taskTitle.includes('responsive') || taskTitle.includes('framework')) {
        description += ' Includes breakpoint system implementation, responsive component development, device detection, and adaptive layout strategies.';
      } else if (taskTitle.includes('mobile') && (taskTitle.includes('design') || taskTitle.includes('layout'))) {
        description += ' Includes touch-friendly design specifications, mobile navigation patterns, optimized screen layouts, and platform-specific adaptations.';
      } else if (taskTitle.includes('touch') || taskTitle.includes('gesture')) {
        description += ' Includes gesture recognition, haptic feedback, multi-touch support, and accessibility-compliant touch target implementation.';
      } else if (taskTitle.includes('iOS') || taskTitle.includes('Android')) {
        description += ' Includes platform-specific UI components, native API integration, platform design patterns, and device-specific optimizations.';
      } else if (taskTitle.includes('canvas') || taskTitle.includes('node')) {
        description += ' Includes touch-optimized canvas controls, mobile-friendly node manipulation, gesture-based interactions, and performance optimization.';
      } else if (taskTitle.includes('sync') || taskTitle.includes('synchronization')) {
        description += ' Includes real-time data synchronization, conflict resolution, offline support, and multi-device consistency management.';
      } else if (taskTitle.includes('offline') || taskTitle.includes('storage')) {
        description += ' Includes local data persistence, change tracking, sync preparation, and offline-first user experience design.';
      } else if (taskTitle.includes('desktop')) {
        description += ' Includes cross-platform desktop framework, native OS integrations, performance optimizations, and distribution pipeline.';
      } else if (taskTitle.includes('performance') || taskTitle.includes('optimization')) {
        description += ' Includes rendering optimization, memory management, startup time improvements, and resource consumption reduction.';
      } else if (taskTitle.includes('security') || taskTitle.includes('encryption')) {
        description += ' Includes transport security, end-to-end encryption, access control, and security monitoring implementation.';
      }
      
      // Generate acceptance criteria
      const acceptanceCriteria = [];
      
      if (taskTitle.includes('responsive') || taskTitle.includes('framework')) {
        acceptanceCriteria.push('Responsive framework handles all target device sizes correctly');
        acceptanceCriteria.push('Component library provides consistent behavior across platforms');
        acceptanceCriteria.push('Breakpoint system adapts smoothly to different screen sizes');
        acceptanceCriteria.push('Performance meets mobile device requirements');
      }
      
      if (taskTitle.includes('touch') || taskTitle.includes('gesture')) {
        acceptanceCriteria.push('Touch gestures work reliably across different devices');
        acceptanceCriteria.push('Haptic feedback enhances user experience appropriately');
        acceptanceCriteria.push('Accessibility requirements for touch targets are met');
        acceptanceCriteria.push('Multi-touch interactions handle edge cases correctly');
      }
      
      if (taskTitle.includes('mobile') && (taskTitle.includes('design') || taskTitle.includes('layout'))) {
        acceptanceCriteria.push('Mobile layouts are intuitive and easy to navigate');
        acceptanceCriteria.push('Touch-friendly spacing and sizing guidelines followed');
        acceptanceCriteria.push('Navigation patterns work effectively on small screens');
        acceptanceCriteria.push('Platform-specific design patterns implemented correctly');
      }
      
      if (taskTitle.includes('iOS') || taskTitle.includes('Android')) {
        acceptanceCriteria.push('Platform-specific features integrate seamlessly');
        acceptanceCriteria.push('Native UI components follow platform design guidelines');
        acceptanceCriteria.push('Device-specific optimizations improve performance');
        acceptanceCriteria.push('App store requirements and guidelines are met');
      }
      
      if (taskTitle.includes('canvas') || taskTitle.includes('node')) {
        acceptanceCriteria.push('Canvas interactions work smoothly on mobile devices');
        acceptanceCriteria.push('Node manipulation is intuitive with touch input');
        acceptanceCriteria.push('Performance remains acceptable with complex graphs');
        acceptanceCriteria.push('Mobile-specific controls enhance usability');
      }
      
      if (taskTitle.includes('sync') || taskTitle.includes('synchronization')) {
        acceptanceCriteria.push('Data synchronization maintains consistency across devices');
        acceptanceCriteria.push('Conflict resolution handles edge cases gracefully');
        acceptanceCriteria.push('Sync performance meets user expectations');
        acceptanceCriteria.push('Security measures protect data integrity');
      }
      
      if (taskTitle.includes('offline') || taskTitle.includes('storage')) {
        acceptanceCriteria.push('Offline functionality maintains core feature availability');
        acceptanceCriteria.push('Data persistence handles storage limitations gracefully');
        acceptanceCriteria.push('Sync preparation enables smooth online transitions');
        acceptanceCriteria.push('User experience remains consistent offline vs online');
      }
      
      if (taskTitle.includes('desktop')) {
        acceptanceCriteria.push('Desktop application provides full feature parity');
        acceptanceCriteria.push('Platform integrations enhance native user experience');
        acceptanceCriteria.push('Performance meets desktop application standards');
        acceptanceCriteria.push('Distribution and updates work across all platforms');
      }
      
      if (taskTitle.includes('performance') || taskTitle.includes('optimization')) {
        acceptanceCriteria.push('Performance improvements meet target benchmarks');
        acceptanceCriteria.push('Resource consumption stays within acceptable limits');
        acceptanceCriteria.push('User experience remains smooth under load');
        acceptanceCriteria.push('Memory and storage usage are optimized');
      }
      
      if (taskTitle.includes('security') || taskTitle.includes('encryption')) {
        acceptanceCriteria.push('Security measures protect against identified threats');
        acceptanceCriteria.push('Encryption implementation follows best practices');
        acceptanceCriteria.push('Access control enforces proper authorization');
        acceptanceCriteria.push('Security monitoring detects and responds to anomalies');
      }
      
      if (taskTitle.includes('test') || taskTitle.includes('validation')) {
        acceptanceCriteria.push('Test coverage meets Epic 15 standards (85%+)');
        acceptanceCriteria.push('Cross-platform testing validates functionality');
        acceptanceCriteria.push('Performance testing ensures acceptable metrics');
        acceptanceCriteria.push('User acceptance testing confirms usability goals');
      }
      
      // Default acceptance criteria
      if (acceptanceCriteria.length === 0) {
        acceptanceCriteria.push('Mobile/cross-platform feature implemented and functional');
        acceptanceCriteria.push('Integration with existing Epic 15 system verified');
        acceptanceCriteria.push('Platform-specific requirements and guidelines met');
      }
      
      tasks.push({
        title: taskTitle,
        description,
        estimate,
        priority,
        wipClass,
        story,
        storyName,
        epic: 'Mobile & Cross-Platform Support',
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
  return `E15-${timestamp}-${random}`;
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
      source: 'epic15-automation',
      category: 'mobile-cross-platform-support',
      automated: true,
      epic: 'Mobile & Cross-Platform Support',
      storyNumber: taskDef.story,
      storyName: taskDef.storyName,
      completionStatus: 'Epic 15 has Story 15.1 complete (responsive web interface) - processing remaining mobile and desktop tasks'
    }
  };
}

async function createEpic15Tasks() {
  console.log('📱 Creating Epic 15: Mobile & Cross-Platform Support Tasks\n');
  console.log('📋 Based on: docs/epic15plan.md');
  console.log('ℹ️  Note: Epic 15 Story 15.1 (Responsive Web Interface) is complete - processing remaining mobile and desktop tasks\n');
  
  try {
    // Extract tasks from Epic 15 plan
    const epic15Tasks = await extractTasksFromEpic15Plan();
    
    if (epic15Tasks.length === 0) {
      console.log('🎉 All Epic 15 tasks are already complete!');
      console.log('📱 Epic 15 Status: 100% complete - Production-ready Mobile & Cross-Platform Support System');
      return {
        created: 0,
        skipped: 0,
        total: 0,
        allComplete: true
      };
    }
    
    console.log(`📝 Extracted ${epic15Tasks.length} remaining tasks from Epic 15 plan\n`);
    
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
    const platformBreakdown = {};
    
    // Process Epic 15 tasks
    for (const taskDef of epic15Tasks) {
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
      
      // Track platform types
      const platformTypes = ['ios', 'android', 'desktop', 'responsive', 'synchronization'];
      platformTypes.forEach(platformType => {
        if (taskDef.tags.some(tag => tag.includes(platformType))) {
          platformBreakdown[platformType] = (platformBreakdown[platformType] || 0) + 1;
        }
      });
    }
    
    // Update state metadata
    if (!state.metadata) {
      state.metadata = {};
    }
    state.metadata.lastUpdated = new Date().toISOString();
    state.metadata.totalTasks = Object.keys(state.tasks).length;
    state.metadata.epic15TasksCreated = tasksCreated;
    
    // Save updated state
    await saveState(state);
    
    // Generate comprehensive summary
    console.log('📊 EPIC 15 TASK CREATION SUMMARY');
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
      
      // Platform breakdown
      if (Object.keys(platformBreakdown).length > 0) {
        console.log('📱 PLATFORM SUPPORT:');
        Object.entries(platformBreakdown).forEach(([platformType, count]) => {
          const emoji = platformType === 'ios' ? '🍎' : 
                       platformType === 'android' ? '🤖' : 
                       platformType === 'desktop' ? '🖥️' : 
                       platformType === 'responsive' ? '📱' : 
                       platformType === 'synchronization' ? '🔄' : '📱';
          console.log(`   ${emoji} ${platformType.toUpperCase()}: ${count} tasks`);
        });
        console.log('');
      }
    }
    
    console.log('\n🤖 NEXT STEPS FOR AGENTS:\n');
    console.log('1. 🎯 Focus on high-priority mobile architecture and native app development');
    console.log('2. 🔄 Use: `node src/grab-tasks.js <agent-id>` to grab Epic 15 tasks');
    console.log('3. 🏷️  Filter by tags: "responsive", "ios", "android", "desktop", "synchronization"');
    console.log('4. ⏱️  Story 15.1 (responsive web) is complete - focus on mobile and desktop apps');
    console.log('5. 📋 Start with native app architecture, then platform-specific features, then sync\n');
    
    console.log('✨ Epic 15 remaining tasks processed successfully!');
    console.log('📱 Mobile & Cross-Platform Support implementation ready!');
    console.log('📈 Epic 15 Status: Story 15.1 complete (responsive web), remaining mobile/desktop features ready for implementation');
    
    return {
      created: tasksCreated,
      skipped: tasksSkipped,
      total: Object.keys(state.tasks).length,
      storyBreakdown,
      priorityBreakdown,
      wipClassBreakdown,
      platformBreakdown
    };
    
  } catch (error) {
    console.error('❌ Failed to create Epic 15 tasks:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  createEpic15Tasks().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { 
  createEpic15Tasks,
  extractTasksFromEpic15Plan
};