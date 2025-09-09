#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Fresh database structure for Epic 1
const freshDatabase = {
  version: '1.0.0',
  lastUpdated: new Date().toISOString(),
  epic: 'Epic 1 - Prompt Spaghetti MVP',
  description: 'Demo-Ready Rebuild with Inline Editing',
  tasks: [],
  metadata: {
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    blockedTasks: 0,
    todoTasks: 0
  }
};

// Epic 1 story definitions with tasks
const epic1Stories = [
  {
    storyId: '1.0',
    storyFile: '1.0.risk-mitigation-brownfield.md',
    title: 'Risk Mitigation & Brownfield Safety Framework',
    priority: 'CRITICAL',
    estimatedHours: 16,
    tasks: [
      { name: 'Analyze existing codebase and identify risks', hours: 4 },
      { name: 'Create safety framework and migration plan', hours: 4 },
      { name: 'Implement rollback procedures', hours: 4 },
      { name: 'Set up monitoring and analytics', hours: 4 }
    ]
  },
  {
    storyId: '1.1',
    storyFile: '1.1.core-node-engine.md',
    title: 'Core Node Engine & File Format',
    priority: 'HIGH',
    estimatedHours: 24,
    tasks: [
      { name: 'Define .psg file format schema', hours: 4 },
      { name: 'Implement base node classes with inline editing', hours: 8 },
      { name: 'Create deterministic execution engine', hours: 6 },
      { name: 'Add unit tests and validation', hours: 6 }
    ]
  },
  {
    storyId: '1.2',
    storyFile: '1.2.prompt-analysis-node-generation.md',
    title: 'Prompt Analysis & Node Generation',
    priority: 'HIGH',
    estimatedHours: 20,
    tasks: [
      { name: 'Implement prompt parser for semantic units', hours: 8 },
      { name: 'Create visual range indicators', hours: 4 },
      { name: 'Add auto-focus and keyboard navigation', hours: 4 },
      { name: 'Implement smart node positioning', hours: 4 }
    ]
  },
  {
    storyId: '1.3',
    storyFile: '1.3.visual-node-editor.md',
    title: 'Visual Node Editor with React Flow',
    priority: 'HIGH',
    estimatedHours: 32,
    tasks: [
      { name: 'Create custom React Flow nodes with inline editing', hours: 12 },
      { name: 'Implement visual feedback during editing', hours: 6 },
      { name: 'Add weighted choice sliders', hours: 6 },
      { name: 'Implement connection validation', hours: 4 },
      { name: 'Add keyboard shortcuts and pan/zoom', hours: 4 }
    ]
  },
  {
    storyId: '1.4',
    storyFile: '1.4.execution-preview-system.md',
    title: 'Execution & Preview System',
    priority: 'HIGH',
    estimatedHours: 24,
    tasks: [
      { name: 'Implement debounced preview updates', hours: 6 },
      { name: 'Add diff algorithm for change highlighting', hours: 6 },
      { name: 'Create preview caching system', hours: 6 },
      { name: 'Implement WebWorker for non-blocking execution', hours: 6 }
    ]
  },
  {
    storyId: '1.5',
    storyFile: '1.5.asset-library-preset-system.md',
    title: 'Asset Library & Preset System',
    priority: 'MEDIUM',
    estimatedHours: 20,
    tasks: [
      { name: 'Create drag-and-drop preset system', hours: 8 },
      { name: 'Implement auto-edit mode on drop', hours: 4 },
      { name: 'Add preset preview on hover', hours: 4 },
      { name: 'Create save-as-preset functionality', hours: 4 }
    ]
  },
  {
    storyId: '1.6',
    storyFile: '1.6.polish-demo-optimization.md',
    title: 'Polish & Demo Optimization',
    priority: 'MEDIUM',
    estimatedHours: 16,
    tasks: [
      { name: 'Add smooth animations for edit transitions', hours: 4 },
      { name: 'Implement micro-interactions and haptic feedback', hours: 4 },
      { name: 'Create medieval demo showcase', hours: 4 },
      { name: 'Add Easter eggs and delightful details', hours: 4 }
    ]
  },
  {
    storyId: '1.7',
    storyFile: '1.7.onboarding-help-system.md',
    title: 'Onboarding & Help System',
    priority: 'MEDIUM',
    estimatedHours: 16,
    tasks: [
      { name: 'Create interactive tutorial for inline editing', hours: 6 },
      { name: 'Implement contextual help tooltips', hours: 4 },
      { name: 'Add keyboard shortcut reference', hours: 3 },
      { name: 'Create getting-started documentation', hours: 3 }
    ]
  }
];

// Generate tasks for each story
let taskIdCounter = 1;
epic1Stories.forEach(story => {
  story.tasks.forEach((task, index) => {
    const taskId = `EPIC1-${story.storyId}-TASK-${taskIdCounter}`;

    freshDatabase.tasks.push({
      id: taskId,
      storyId: story.storyId,
      storyTitle: story.title,
      storyFile: story.storyFile,
      taskNumber: index + 1,
      title: task.name,
      description: `${task.name} for ${story.title}`,
      status: 'TODO',
      priority: story.priority,
      estimatedHours: task.hours,
      actualHours: null,
      assignedTo: null,
      epic: 'Epic 1',
      tags: ['epic1', 'mvp', 'inline-editing'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      blockedBy: [],
      blocks: [],
      metadata: {
        storyFile: `docs/stories/${story.storyFile}`,
        taskIndex: index,
        totalTasksInStory: story.tasks.length,
        storyProgress: 0
      }
    });

    taskIdCounter++;
    freshDatabase.metadata.totalTasks++;
    freshDatabase.metadata.todoTasks++;
  });
});

// Write the fresh database
const dbPath = path.join(__dirname, 'src', 'data', 'epic1-state.json');
fs.writeFileSync(dbPath, JSON.stringify(freshDatabase, null, 2));

console.log('✅ Created fresh Epic 1 database:', dbPath);
console.log(`📊 Summary:`);
console.log(`   - Total Stories: ${epic1Stories.length}`);
console.log(`   - Total Tasks: ${freshDatabase.metadata.totalTasks}`);
console.log(
  `   - Critical Priority: ${freshDatabase.tasks.filter(t => t.priority === 'CRITICAL').length}`
);
console.log(
  `   - High Priority: ${freshDatabase.tasks.filter(t => t.priority === 'HIGH').length}`
);
console.log(
  `   - Medium Priority: ${freshDatabase.tasks.filter(t => t.priority === 'MEDIUM').length}`
);
console.log(
  `   - Total Estimated Hours: ${freshDatabase.tasks.reduce((sum, t) => sum + t.estimatedHours, 0)}`
);

// Create a simple Epic 1 task monitor script
const monitorScript = `#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'src', 'data', 'epic1-state.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

console.log('\\n🚀 EPIC 1 TASK DASHBOARD\\n');
console.log('📊 Task Summary:');
console.log(\`   Total Tasks: \${db.metadata.totalTasks}\`);
console.log(\`   TODO: \${db.tasks.filter(t => t.status === 'TODO').length}\`);
console.log(\`   IN_PROGRESS: \${db.tasks.filter(t => t.status === 'IN_PROGRESS').length}\`);
console.log(\`   COMPLETED: \${db.tasks.filter(t => t.status === 'COMPLETED').length}\`);
console.log(\`   BLOCKED: \${db.tasks.filter(t => t.status === 'BLOCKED').length}\`);

console.log('\\n📋 Story Progress:');
const stories = [...new Set(db.tasks.map(t => t.storyId))];
stories.forEach(storyId => {
  const storyTasks = db.tasks.filter(t => t.storyId === storyId);
  const completed = storyTasks.filter(t => t.status === 'COMPLETED').length;
  const total = storyTasks.length;
  const progress = Math.round((completed / total) * 100);
  const story = storyTasks[0];
  console.log(\`   Story \${storyId}: \${story.storyTitle}\`);
  console.log(\`     Progress: [\${'█'.repeat(progress/10).padEnd(10, '░')}] \${progress}% (\${completed}/\${total})\`);
});

console.log('\\n🎯 Available Tasks (TODO):');
db.tasks.filter(t => t.status === 'TODO' && !t.assignedTo)
  .slice(0, 5)
  .forEach(task => {
    console.log(\`   \${task.priority === 'CRITICAL' ? '🔥' : task.priority === 'HIGH' ? '⚡' : '📝'} \${task.id}: \${task.title}\`);
    console.log(\`      Story: \${task.storyId}, Est: \${task.estimatedHours}h\`);
  });
`;

fs.writeFileSync(path.join(__dirname, 'monitor-epic1.js'), monitorScript);
fs.chmodSync(path.join(__dirname, 'monitor-epic1.js'), '755');

console.log('\n✅ Created Epic 1 monitor script: monitor-epic1.js');
console.log('   Run: node monitor-epic1.js');
