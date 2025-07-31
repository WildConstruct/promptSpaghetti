#!/usr/bin/env node

/**
 * Direct Database Task Creation (Backup for GitHub automation)
 *
 * Creates integration tasks directly in the database when GitHub automation fails
 */

const Database = require('better-sqlite3');
const path = require('path');

// Initialize database
const dbPath = path.join(__dirname, 'data/tasks.db');
const db = new Database(dbPath);

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'TODO',
    assignee TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    priority TEXT DEFAULT 'MEDIUM',
    tags TEXT,
    estimated_hours INTEGER DEFAULT 0,
    work_class TEXT DEFAULT 'feature',
    business_value TEXT,
    dependencies TEXT,
    metadata TEXT,
    story_id TEXT
  )
`);

// Generate task ID
function generateTaskId(prefix = 'EPIC-INT') {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000)
    .toString(16)
    .toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

// Quick integration tasks (since many are already complete based on GraphEditor analysis)
const integrationTasks = [
  {
    id: generateTaskId('PALETTE'),
    title: 'Update Palette Categories for Advanced Nodes',
    description: `**Quick Fix**: Add 'advanced' and 'transform' categories to Palette.tsx

**Current Issue**: Advanced nodes exist in GraphEditor but Palette.tsx doesn't show 'advanced' category

**Solution**:
1. Update categoryOrder in Palette.tsx: ['text', 'logic', 'output', 'variable', 'advanced', 'transform', 'other']
2. Update categoryLabels to include: advanced: 'Advanced Nodes', transform: 'Transformations'

**Files**: packages/core/Palette.tsx (lines 100-107)
**Time**: 15 minutes
**Impact**: Users can see advanced nodes in organized categories`,
    status: 'TODO',
    priority: 'HIGH',
    tags: 'palette,ui,advanced-nodes,quick-fix',
    estimated_hours: 1,
    work_class: 'integration',
    business_value: 'Advanced nodes visible in organized palette categories',
  },

  {
    id: generateTaskId('EXPORT'),
    title: 'Create Advanced Export Dialog Component',
    description: `**Export Integration**: Create UI component for advanced export formats

**Current**: GraphEditor has handleExportBundle but could be enhanced with dialog
**Server**: Complete exporter exists at server/src/exporter.ts with PNG, PDF, YAML, XML support

**Solution**:
1. Create packages/core/components/ExportDialog.tsx with format selection
2. Add export options (quality, author, version metadata)  
3. Connect to existing /export endpoint
4. Replace basic export with comprehensive dialog

**Files**: 
- packages/core/components/ExportDialog.tsx (new)
- Update GraphEditor.tsx handleExportBundle to use dialog

**Time**: 2-3 hours
**Impact**: Users get professional export capabilities`,
    status: 'TODO',
    priority: 'HIGH',
    tags: 'export,ui,dialog,formats',
    estimated_hours: 3,
    work_class: 'feature',
    business_value: 'Professional export formats for user presentations/documentation',
  },

  {
    id: generateTaskId('PROJECT-API'),
    title: 'Create Project Management API Endpoints',
    description: `**Backend Gap**: Project dialogs exist but no backend persistence

**Current**: SaveProjectDialog/LoadProjectDialog in GraphEditor, no backend
**Need**: API endpoints for project CRUD operations

**Solution**:
1. Create server/src/routes/projects.ts with endpoints:
   - POST /api/projects/save
   - GET /api/projects/load/:id  
   - GET /api/projects/list
   - DELETE /api/projects/:id
2. Define .psg file format in packages/core/fileFormats/psg.ts
3. Update GraphEditor handlers to call API

**Files**:
- server/src/routes/projects.ts (new)
- packages/core/fileFormats/psg.ts (new)
- Register routes in server/src/index.ts

**Time**: 3-4 hours  
**Impact**: Users can save/load named projects (critical for retention)`,
    status: 'TODO',
    priority: 'HIGH',
    tags: 'backend,api,projects,persistence',
    estimated_hours: 4,
    work_class: 'backend',
    business_value: 'Users can save/load projects without losing work',
  },
];

// Insert tasks
console.log('🎯 Creating Integration Tasks (Direct DB)...\n');

const insertStmt = db.prepare(`
  INSERT OR REPLACE INTO tasks (
    id, title, description, status, priority, tags, estimated_hours, 
    work_class, business_value, created_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
`);

let created = 0;
for (const task of integrationTasks) {
  try {
    insertStmt.run(
      task.id,
      task.title,
      task.description,
      task.status,
      task.priority,
      task.tags,
      task.estimated_hours,
      task.work_class,
      task.business_value
    );

    console.log(`✅ Created: ${task.id}`);
    console.log(`   Title: ${task.title}`);
    console.log(`   Priority: ${task.priority} | Est: ${task.estimated_hours}h`);
    console.log(`   Tags: ${task.tags}\n`);
    created++;
  } catch (error) {
    console.error(`❌ Failed to create ${task.id}: ${error.message}`);
  }
}

console.log('📊 Summary:');
console.log(`   Created: ${created} integration tasks`);
console.log(`   Total effort: ${integrationTasks.reduce((sum, t) => sum + t.estimated_hours, 0)} hours`);

console.log('\n🚀 Next steps:');
console.log('   1. node src/grab-tasks.js <your-dev-id> 2 --priority-only');
console.log('   2. Focus on quick wins: Palette categories (15 min)');
console.log('   3. Check progress: node src/monitor-available-tasks.js');

db.close();
