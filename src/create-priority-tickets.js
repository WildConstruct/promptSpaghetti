#!/usr/bin/env node

/**
 * Create Priority Tickets Script
 * 
 * Creates actionable tickets for Priority 1 (Authentication) and Priority 2 (File Browser)
 * stories based on IMMEDIATE-PRIORITIES.md requirements and business priorities.
 * 
 * This script follows the established ticketing system patterns and ensures proper
 * categorization, estimation, and alignment with immediate business needs.
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// Priority 1: Authentication Frontend Integration (Story 20.1)
const authenticationTasks = [
  {
    title: 'Setup React Router Foundation for Authentication',
    description: 'Install React Router v6 and configure BrowserRouter in App.tsx. Create route structure for authentication pages (/login, /register, /reset-password, /profile). Update existing tab-based navigation to work with router.',
    estimate: '4 hours',
    priority: 'high',
    wipClass: 'infrastructure', 
    epic: 'Authentication Frontend Integration',
    story: '20.1 User Authentication Routing Integration',
    tags: ['router', 'auth', 'infrastructure', 'routing'],
    acceptanceCriteria: [
      'React Router v6 dependency installed and configured',
      'BrowserRouter configured in App.tsx root component',
      'Route structure created for /login, /register, /reset-password, /profile',
      'Existing tab navigation updated to work with router',
      'Navigation between routes works correctly'
    ],
    dependencies: [],
    businessValue: 'Users can navigate to authentication pages with proper URLs'
  },
  {
    title: 'Create Authentication Store with Zustand',
    description: 'Implement Zustand authentication store following existing graphStore patterns. Add JWT token storage, automatic refresh mechanism, and session persistence using localStorage.',
    estimate: '5 hours',
    priority: 'high',
    wipClass: 'feature',
    epic: 'Authentication Frontend Integration', 
    story: '20.1 User Authentication Routing Integration',
    tags: ['zustand', 'auth', 'state-management', 'jwt'],
    acceptanceCriteria: [
      'Authentication store implemented using Zustand patterns',
      'JWT token storage and retrieval functions working',
      'Automatic token refresh mechanism implemented',
      'Session persistence using localStorage functional',
      'Store integrates with existing patterns from graphStore'
    ],
    dependencies: ['T-AUTH-ROUTER-FOUNDATION'],
    businessValue: 'Authentication state is properly managed across browser sessions'
  },
  {
    title: 'Implement Protected Routes System',
    description: 'Create PrivateRoute wrapper component with redirect logic for unauthenticated users. Add return URL preservation for post-login redirect and test route protection.',
    estimate: '3 hours',
    priority: 'high',
    wipClass: 'security',
    epic: 'Authentication Frontend Integration',
    story: '20.1 User Authentication Routing Integration', 
    tags: ['security', 'routes', 'auth', 'protection'],
    acceptanceCriteria: [
      'PrivateRoute wrapper component created and functional',
      'Unauthenticated users redirected to login page',
      'Return URL preservation works for post-login redirect',
      'Route protection tested across all protected pages',
      'Authentication state properly checked on route changes'
    ],
    dependencies: ['T-AUTH-STORE-ZUSTAND'],
    businessValue: 'Protected features are secure and only accessible to authenticated users'
  },
  {
    title: 'Convert Auth Components to Routed Pages',
    description: 'Create LoginPage, RegistrationPage, PasswordResetPage, and EmailVerificationPage components wrapping existing auth forms. Add proper page layouts and navigation elements.',
    estimate: '4 hours',
    priority: 'high',
    wipClass: 'feature',
    epic: 'Authentication Frontend Integration',
    story: '20.1 User Authentication Routing Integration',
    tags: ['components', 'pages', 'auth', 'ui'],
    acceptanceCriteria: [
      'LoginPage component created wrapping existing LoginForm',
      'RegistrationPage component created wrapping existing RegistrationForm', 
      'PasswordResetPage component created wrapping PasswordResetForm',
      'EmailVerificationPage created for new user confirmation',
      'Page layouts consistent with existing application design'
    ],
    dependencies: ['T-AUTH-PROTECTED-ROUTES'],
    businessValue: 'Users have dedicated pages for all authentication operations'
  },
  {
    title: 'Integrate Authentication API with Store',
    description: 'Connect authentication store to existing backend endpoints. Implement automatic token refresh, logout functionality, and handle authentication errors and expired tokens.',
    estimate: '5 hours',
    priority: 'high',
    wipClass: 'integration',
    epic: 'Authentication Frontend Integration',
    story: '20.1 User Authentication Routing Integration',
    tags: ['api', 'integration', 'auth', 'backend'],
    acceptanceCriteria: [
      'Authentication store connected to existing backend endpoints',
      'Automatic token refresh implemented on API calls',
      'Logout functionality clears all local authentication state',
      'Authentication errors and expired tokens handled properly',
      'API integration works with existing server/src/auth/ endpoints'
    ],
    dependencies: ['T-AUTH-PAGES-COMPONENTS'],
    businessValue: 'Users can successfully authenticate with the backend system'
  },
  {
    title: 'Update Navigation System for Authentication',
    description: 'Modify header to show authentication status, add login/logout buttons with proper routing, implement user profile access menu, and ensure navigation updates reflect authentication state changes.',
    estimate: '3 hours',
    priority: 'medium',
    wipClass: 'feature',
    epic: 'Authentication Frontend Integration',
    story: '20.1 User Authentication Routing Integration',
    tags: ['navigation', 'ui', 'auth', 'header'],
    acceptanceCriteria: [
      'Header modified to show current authentication status',
      'Login/logout buttons added with proper routing',
      'User profile access menu implemented',
      'Navigation updates automatically when authentication state changes',
      'UI consistent with existing application design patterns'
    ],
    dependencies: ['T-AUTH-API-INTEGRATION'],
    businessValue: 'Users can easily navigate between authenticated and unauthenticated features'
  }
];

// Priority 2: File Browser & Project Management (Story 20.2) 
const fileBrowserTasks = [
  {
    title: 'Setup File Browser Foundation Components',
    description: 'Create FileBrowser main component with tree structure, FolderTree component with expand/collapse, FileItem component, drag-and-drop functionality, and context menu system.',
    estimate: '6 hours',
    priority: 'high',
    wipClass: 'feature',
    epic: 'File Browser & Project Management System',
    story: '20.2 Internal File Browser & Project Management',
    tags: ['file-browser', 'components', 'ui', 'drag-drop'],
    acceptanceCriteria: [
      'FileBrowser main component created with tree structure',
      'FolderTree component with expand/collapse functionality',
      'FileItem component for individual file display',
      'Drag-and-drop functionality for file organization',
      'Context menu system for file operations implemented'
    ],
    dependencies: ['T-AUTH-API-INTEGRATION'], // Depends on auth being ready
    businessValue: 'Users have a structured interface to browse their project files'
  },
  {
    title: 'Create File Management API Endpoints',
    description: 'Implement secure file management API endpoints (/api/files/*) for upload, delete, rename, move, and duplicate operations. Add proper validation and error handling.',
    estimate: '5 hours',
    priority: 'high',
    wipClass: 'backend',
    epic: 'File Browser & Project Management System',
    story: '20.2 Internal File Browser & Project Management', 
    tags: ['api', 'backend', 'files', 'security'],
    acceptanceCriteria: [
      'File management API endpoints created (/api/files/*)',
      'Secure file upload with validation implemented',
      'File deletion with proper cleanup working',
      'Rename and move operations functional',
      'File duplication functionality implemented',
      'Comprehensive error handling for all file operations'
    ],
    dependencies: [],
    businessValue: 'Backend supports all necessary file operations securely'
  },
  {
    title: 'Implement Project File Format (.psg) System',
    description: 'Design .psg file format JSON schema, create TypeScript interfaces, implement project serialization/deserialization, and add validation with error handling.',
    estimate: '4 hours',
    priority: 'high',
    wipClass: 'infrastructure',
    epic: 'File Browser & Project Management System',
    story: '20.2 Internal File Browser & Project Management',
    tags: ['file-format', 'serialization', 'validation', 'psg'],
    acceptanceCriteria: [
      '.psg file format JSON schema structure designed',
      'TypeScript interfaces for project file format created',
      'Project serialization from graphStore state implemented',
      'Project deserialization to graphStore state working',
      'Zod schema for .psg file validation created',
      'Comprehensive error handling for corrupted files'
    ],
    dependencies: ['T-FILE-API-ENDPOINTS'],
    businessValue: 'Projects can be saved and loaded reliably with consistent format'
  },
  {
    title: 'Integrate Graph Editor with File Browser',
    description: 'Modify GraphEditor to accept file path parameter, implement auto-save to file system, add file loading from browser selection, and handle unsaved changes when switching files.',
    estimate: '5 hours',
    priority: 'high',
    wipClass: 'integration',
    epic: 'File Browser & Project Management System',
    story: '20.2 Internal File Browser & Project Management',
    tags: ['integration', 'graph-editor', 'auto-save', 'file-loading'],
    acceptanceCriteria: [
      'GraphEditor modified to accept file path parameter',
      'Auto-save functionality to file system implemented',
      'File loading from browser selection working',
      'Seamless navigation between browser and editor',
      'Unsaved changes properly handled when switching files',
      'Existing graph editor functionality preserved'
    ],
    dependencies: ['T-FILE-BROWSER-FOUNDATION', 'T-PSG-FILE-FORMAT'],
    businessValue: 'Users can seamlessly work with files directly from the graph editor'
  },
  {
    title: 'Build Search and Filter System',
    description: 'Create SearchBar component with advanced filtering, implement file content indexing, add metadata and tag-based filtering, sorting options, and real-time search with debouncing.',
    estimate: '4 hours',
    priority: 'medium',
    wipClass: 'feature',
    epic: 'File Browser & Project Management System',
    story: '20.2 Internal File Browser & Project Management',
    tags: ['search', 'filtering', 'indexing', 'performance'],
    acceptanceCriteria: [
      'SearchBar component with advanced filtering created',
      'File content indexing for search implemented',
      'Metadata and tag-based filtering working',
      'Sorting options (name, date, size, type) functional',
      'Real-time search with debouncing implemented',
      'Search performance optimized for large file collections'
    ],
    dependencies: ['T-GRAPH-EDITOR-INTEGRATION'],
    businessValue: 'Users can quickly find specific projects in large collections'
  },
  {
    title: 'Create File Preview and Recent Files Features',
    description: 'Build FilePreview component with graph thumbnails, implement favorites/bookmarks system, create RecentFiles component, and add quick navigation sidebar.',
    estimate: '4 hours',
    priority: 'medium',
    wipClass: 'feature',
    epic: 'File Browser & Project Management System',
    story: '20.2 Internal File Browser & Project Management',
    tags: ['preview', 'thumbnails', 'recent-files', 'favorites'],
    acceptanceCriteria: [
      'FilePreview component with graph thumbnails created',
      'File metadata display (size, modified date, node count)',
      'Favorites/bookmarks system implemented',
      'RecentFiles component with chronological list working',
      'Quick navigation sidebar functional',
      'Preview generation and caching optimized'
    ],
    dependencies: ['T-SEARCH-FILTER-SYSTEM'],
    businessValue: 'Users can quickly access recently used projects and preview files'
  }
];

// Utility functions
function generateTaskId(prefix = 'T') {
  const timestamp = Date.now().toString().slice(-6);
  const random = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

async function loadCurrentState() {
  const stateFile = path.join(__dirname, 'data/state.json');
  
  try {
    const stateData = await fs.readFile(stateFile, 'utf8');
    return JSON.parse(stateData);
  } catch (error) {
    // Create new state if file doesn't exist
    return {
      tasks: {},
      metadata: {
        created: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      }
    };
  }
}

async function saveState(state) {
  const stateFile = path.join(__dirname, 'data/state.json');
  await fs.writeFile(stateFile, JSON.stringify(state, null, 2));
}

function taskExists(state, title) {
  return Object.values(state.tasks).some(task => 
    task.title && task.title.toLowerCase() === title.toLowerCase()
  );
}

function createTaskObject(taskDef, taskId) {
  // Determine epic story code based on task type
  let storyCode = 'Other';
  if (taskDef.story && taskDef.story.includes('20.1')) {
    storyCode = '20.1';
  } else if (taskDef.story && taskDef.story.includes('20.2')) {
    storyCode = '20.2';
  }
  
  return {
    id: taskId,
    title: taskDef.title,
    description: taskDef.description,
    state: 'UNASSIGNED', // Changed from TODO to match system conventions
    priority: taskDef.priority,
    estimate: taskDef.estimate,
    wipClass: taskDef.wipClass,
    epic: taskDef.epic,
    story: storyCode, // Simplified to just the code for dashboard compatibility
    tags: taskDef.tags,
    acceptanceCriteria: taskDef.acceptanceCriteria,
    dependencies: taskDef.dependencies || [],
    businessValue: taskDef.businessValue,
    assignee: 'Unassigned',
    created: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    metadata: {
      source: 'priority-automation',
      category: 'immediate-priority',
      automated: true,
      priority_level: taskDef.priority === 'high' ? 1 : 2,
      epic: storyCode === '20.1' ? 'Authentication System' : 
            storyCode === '20.2' ? 'File Browser System' : 'Other'
    }
  };
}

async function createPriorityTasks() {
  console.log('🎯 Creating Priority Tickets based on IMMEDIATE-PRIORITIES.md...\n');
  console.log('📋 This aligns with:');
  console.log('   PRIORITY 1: Authentication Frontend Integration (Story 20.1)');
  console.log('   PRIORITY 2: File Browser & Project Management (Story 20.2)\n');
  
  try {
    // Load current state
    let state = await loadCurrentState();
    
    if (!state.tasks) {
      state.tasks = {};
    }
    
    let tasksCreated = 0;
    let tasksSkipped = 0;
    
    // Process authentication tasks (Priority 1)
    console.log('🔐 PRIORITY 1: Creating Authentication Tasks...\n');
    
    for (const taskDef of authenticationTasks) {
      if (taskExists(state, taskDef.title)) {
        console.log(`⏭️  Skipping "${taskDef.title}" - already exists`);
        tasksSkipped++;
        continue;
      }
      
      const taskId = generateTaskId('AUTH');
      const task = createTaskObject(taskDef, taskId);
      
      state.tasks[taskId] = task;
      
      console.log(`✅ Created ${taskId}: "${taskDef.title}"`);
      console.log(`   📊 Priority: ${taskDef.priority} | ⏱️  Estimate: ${taskDef.estimate}`);
      console.log(`   🎯 Business Value: ${taskDef.businessValue}`);
      console.log('');
      
      tasksCreated++;
    }
    
    // Process file browser tasks (Priority 2)
    console.log('📁 PRIORITY 2: Creating File Browser Tasks...\n');
    
    for (const taskDef of fileBrowserTasks) {
      if (taskExists(state, taskDef.title)) {
        console.log(`⏭️  Skipping "${taskDef.title}" - already exists`);
        tasksSkipped++;
        continue;
      }
      
      const taskId = generateTaskId('FILE');
      const task = createTaskObject(taskDef, taskId);
      
      state.tasks[taskId] = task;
      
      console.log(`✅ Created ${taskId}: "${taskDef.title}"`);
      console.log(`   📊 Priority: ${taskDef.priority} | ⏱️  Estimate: ${taskDef.estimate}`);
      console.log(`   🎯 Business Value: ${taskDef.businessValue}`);
      console.log('');
      
      tasksCreated++;
    }
    
    // Update state metadata
    if (!state.metadata) {
      state.metadata = {};
    }
    state.metadata.lastUpdated = new Date().toISOString();
    state.metadata.totalTasks = Object.keys(state.tasks).length;
    state.metadata.priorityTasksCreated = tasksCreated;
    
    // Save updated state
    await saveState(state);
    
    // Generate summary
    console.log('📊 PRIORITY TICKET CREATION SUMMARY\n');
    console.log('='.repeat(50));
    console.log(`✅ Tasks Created: ${tasksCreated}`);
    console.log(`⏭️  Tasks Skipped: ${tasksSkipped} (already exist)`);
    console.log(`📋 Total Tasks: ${Object.keys(state.tasks).length}\n`);
    
    // Show created tasks by priority and story
    const createdTasks = Object.values(state.tasks).filter(task => 
      task.metadata?.source === 'priority-automation'
    );
    
    console.log('📋 CREATED TASKS BY PRIORITY:\n');
    
    // Priority 1: Authentication
    const authTasks = createdTasks.filter(task => 
      task.story && task.story.includes('20.1')
    );
    
    if (authTasks.length > 0) {
      console.log('🔐 PRIORITY 1 - Authentication (Story 20.1):');
      authTasks.forEach(task => {
        console.log(`   ${task.id}: ${task.title}`);
        console.log(`      ⏱️  ${task.estimate} | 📊 ${task.priority} priority`);
      });
      console.log('');
    }
    
    // Priority 2: File Browser
    const fileTasks = createdTasks.filter(task => 
      task.story && task.story.includes('20.2')
    );
    
    if (fileTasks.length > 0) {
      console.log('📁 PRIORITY 2 - File Browser (Story 20.2):');
      fileTasks.forEach(task => {
        console.log(`   ${task.id}: ${task.title}`);
        console.log(`      ⏱️  ${task.estimate} | 📊 ${task.priority} priority`);
      });
      console.log('');
    }
    
    // Agent instructions
    console.log('🤖 NEXT STEPS FOR AGENTS:\n');
    console.log('1. 🔐 Development Agents should prioritize AUTH-* tasks first');
    console.log('2. 📁 After auth completion, focus on FILE-* tasks');  
    console.log('3. 📝 Use: `node src/grab-tasks.js <agent-id> 2` to grab tasks');
    console.log('4. 🔍 Look for tasks tagged: "auth", "router", "file-browser"');
    console.log('5. 🚫 Avoid Epic 19 privacy/compliance tasks per IMMEDIATE-PRIORITIES.md\n');
    
    console.log('✨ Priority tickets created successfully!');
    console.log('📈 These tickets align with business priorities for user login and file management.');
    
    return {
      created: tasksCreated,
      skipped: tasksSkipped,
      total: Object.keys(state.tasks).length,
      authTasks: authTasks.length,
      fileTasks: fileTasks.length
    };
    
  } catch (error) {
    console.error('❌ Failed to create priority tickets:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  createPriorityTasks().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { 
  createPriorityTasks, 
  authenticationTasks, 
  fileBrowserTasks 
};