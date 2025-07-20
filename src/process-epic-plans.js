#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

console.log('🔄 Processing Epic Plans into Tasks...\n');

// Connect to events database
const dbPath = path.join(__dirname, 'data', 'events.db');
const db = new Database(dbPath);

// Epic plan files to process
const epicFiles = [
  'epic19plan.md',
  'epic20plan.md', 
  'epic21plan.md',
  'epic22plan.md',
  'epic24plan.md',
  'epic25plan.md',
  'epic26plan.md',
  'epic27plan.md',
  'epic28plan.md',
  'epic29plan.md'
];

function parseEpicPlan(filePath) {
  console.log(`📖 Reading ${path.basename(filePath)}...`);
  
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  let currentStory = null;
  let tasks = [];
  let stories = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Story headers (## Story X.Y - Title)
    if (line.match(/^## Story \d+\.\d+/)) {
      // Save previous story if exists
      if (currentStory && tasks.length > 0) {
        currentStory.tasks = [...tasks];
        stories.push(currentStory);
        tasks = [];
      }
      
      const storyMatch = line.match(/^## Story (\d+\.\d+)\s*[–-]\s*(.+)/);
      if (storyMatch) {
        currentStory = {
          id: `S-${Date.now()}-${storyMatch[1].replace('.', '-')}`,
          epic: storyMatch[1].split('.')[0],
          title: storyMatch[2].trim(),
          status: 'READY',
          tasks: []
        };
      }
    }
    
    // Task items (- [ ] Task description)
    if (line.match(/^\s*-\s*\[\s*\]/)) {
      const taskTitle = line.replace(/^\s*-\s*\[\s*\]\s*/, '').trim();
      if (taskTitle && currentStory) {
        const task = {
          id: `T-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          story_id: currentStory.id,
          title: taskTitle,
          state: 'UNASSIGNED',
          assignee: null,
          wip_class: taskTitle.toLowerCase().includes('test') ? 'CHORE' : 'FEAT',
          est: estimateTaskHours(taskTitle),
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
          dependencies: [],
          notes: []
        };
        tasks.push(task);
      }
    }
  }
  
  // Save final story
  if (currentStory && tasks.length > 0) {
    currentStory.tasks = [...tasks];
    stories.push(currentStory);
  }
  
  return { stories, tasks: stories.flatMap(s => s.tasks) };
}

function estimateTaskHours(taskTitle) {
  const title = taskTitle.toLowerCase();
  
  // Complex tasks
  if (title.includes('implement') || title.includes('build') || title.includes('create') || title.includes('design')) {
    return 4;
  }
  
  // Medium tasks  
  if (title.includes('integrate') || title.includes('configure') || title.includes('setup')) {
    return 3;
  }
  
  // Testing and documentation
  if (title.includes('test') || title.includes('document') || title.includes('research')) {
    return 2;
  }
  
  // Small tasks
  return 1;
}

function createStoryEvent(story) {
  const event = {
    type: 'STORY_CREATED',
    actor: 'epic_processor_script',
    payload: {
      story: {
        id: story.id,
        goal_id: 'G-1', // Default to main goal
        title: story.title,
        acceptance: [`Complete Epic ${story.epic} story: ${story.title}`],
        priority: parseInt(story.epic) <= 22 ? 1 : 2, // Higher priority for 19-22
        status: 'READY',
        tasks: story.tasks.map(t => t.id)
      }
    },
    version: 1,
    ts: Date.now() / 1000
  };
  
  return event;
}

function createTaskEvent(task) {
  const event = {
    type: 'TASK_CREATED', 
    actor: 'epic_processor_script',
    payload: { task },
    version: 1,
    ts: Date.now() / 1000
  };
  
  return event;
}

function insertEvent(event) {
  const stmt = db.prepare(`
    INSERT INTO events (type, actor, payload, version, ts)
    VALUES (?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    event.type,
    event.actor,
    JSON.stringify(event.payload),
    event.version,
    event.ts
  );
}

// Main processing
let totalStories = 0;
let totalTasks = 0;

epicFiles.forEach(filename => {
  const filePath = path.join(__dirname, '..', 'docs', filename);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filename}`);
    return;
  }
  
  try {
    const { stories, tasks } = parseEpicPlan(filePath);
    
    console.log(`   Found ${stories.length} stories with ${tasks.length} tasks`);
    
    // Create events for stories and tasks
    stories.forEach(story => {
      const storyEvent = createStoryEvent(story);
      insertEvent(storyEvent);
      
      story.tasks.forEach(task => {
        const taskEvent = createTaskEvent(task);
        insertEvent(taskEvent);
      });
    });
    
    totalStories += stories.length;
    totalTasks += tasks.length;
    
  } catch (error) {
    console.error(`❌ Error processing ${filename}:`, error.message);
  }
});

db.close();

console.log('\n✅ Epic Processing Complete!');
console.log(`   📋 Created ${totalStories} stories`);  
console.log(`   ⚡ Created ${totalTasks} tasks`);
console.log('   💾 Events saved to database');
console.log('\n🔄 Next step: Run migrateSnapshot.js to sync to state.json');
console.log('   node dist/scripts/migrateSnapshot.js');