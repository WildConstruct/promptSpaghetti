#!/usr/bin/env node
// Enhanced task creation system with QA traceability

const Database = require('better-sqlite3');
const path = require('path');

console.log(
  '🔍 Scrum Master: Creating enhanced task system with QA traceability...\n'
);

const db = new Database(path.join(__dirname, 'data', 'events.db'));

// Enhanced Epic 23 tasks with specific file locations and QA guidance
const epic23Enhanced = [
  {
    id: 'S-MOBILE-FIX-001',
    title: 'Fix Mobile Web Functionality (CRITICAL)',
    priority: 0,
    acceptance: [
      'Graph editor loads properly on mobile (iOS Safari, Android Chrome)',
      'Touch interactions work for node selection, dragging, connection',
      'Zoom/pan gestures function (pinch-to-zoom, two-finger pan)',
      'Mobile-responsive inspector panel (bottom sheet)',
      'Performance acceptable on mobile (no lag/stuttering)'
    ],
    tasks: [
      {
        title: 'Audit current mobile functionality and document issues',
        type: 'CHORE',
        est: 2,
        files: [
          'client/src/core/GraphEditor.tsx',
          'packages/core/GraphEditor.tsx'
        ],
        qaGuidance:
          'Check for mobile-specific CSS media queries and touch event handlers',
        description:
          'Review GraphEditor components for mobile compatibility issues. Document specific problems with touch events, viewport scaling, and responsive layout.'
      },
      {
        title: 'Fix React Flow touch event handling for mobile',
        type: 'FEAT',
        est: 3,
        files: [
          'packages/core/GraphEditor.tsx',
          'client/src/core/GraphEditor.tsx'
        ],
        qaGuidance:
          'Test touch interactions: node drag, pan, zoom on actual mobile devices',
        description:
          'Modify React Flow configuration to properly handle touch events. Update onNodeDrag, onPaneClick, and gesture handling for mobile browsers.'
      },
      {
        title: 'Implement responsive breakpoints for mobile layout',
        type: 'FEAT',
        est: 2,
        files: ['client/src/index.css', 'packages/core/components/*/index.ts'],
        qaGuidance: 'Verify layout adapts at 768px, 480px breakpoints',
        description:
          'Add CSS media queries and responsive design utilities. Update container layouts to work on mobile screen sizes.'
      },
      {
        title: 'Create mobile-responsive inspector panel (bottom sheet)',
        type: 'FEAT',
        est: 4,
        files: [
          'packages/core/InspectorSidebar.tsx',
          'packages/core/components/Inspector/'
        ],
        qaGuidance:
          'Test inspector accessibility on mobile - should slide up from bottom',
        description:
          'Redesign InspectorSidebar as bottom sheet on mobile. Add touch-friendly close gestures and proper z-index layering.'
      },
      {
        title: 'Test mobile functionality on real devices',
        type: 'TEST',
        est: 2,
        files: ['**/__tests__/**/*mobile*.test.*', 'tests/**/*'],
        qaGuidance:
          'Test on physical iOS/Android devices, not just browser dev tools',
        description:
          'Create mobile-specific test suite. Test on actual iPhone, Android devices to verify touch interactions, performance, and layout.'
      }
    ]
  }
];

// Enhanced Epic 19-22 tasks with specific implementation guidance
const epic1922Enhanced = [
  {
    id: 'S-MARKET-UI-001',
    title: 'Marketplace UI Implementation',
    priority: 2,
    acceptance: [
      'Connect to existing marketplace API endpoints (/api/marketplace/*)',
      'Template gallery with search and filtering UI',
      'Template detail pages with preview functionality',
      'Mobile-responsive marketplace interface'
    ],
    tasks: [
      {
        title: 'Connect React components to existing marketplace API',
        type: 'FEAT',
        est: 3,
        files: [
          'client/src/components/marketplace/',
          'server/src/marketplace/routes.ts'
        ],
        qaGuidance:
          'Verify API calls to /api/marketplace/* endpoints work correctly',
        description:
          'Create MarketplaceHome component that connects to existing marketplace APIs. Use existing marketplace service endpoints in server/src/marketplace/.'
      },
      {
        title: 'Build template gallery with search and filtering',
        type: 'FEAT',
        est: 4,
        files: [
          'client/src/components/marketplace/TemplateCard.tsx',
          'client/src/components/marketplace/SearchBar.tsx'
        ],
        qaGuidance:
          'Test search functionality with various filters and verify results',
        description:
          'Implement template gallery UI using existing TemplateCard and SearchBar components. Connect to Elasticsearch backend for advanced search.'
      },
      {
        title: 'Create template detail pages with preview',
        type: 'FEAT',
        est: 3,
        files: [
          'client/src/components/marketplace/TemplateDetail.tsx',
          'client/src/components/marketplace/PreviewModal.tsx'
        ],
        qaGuidance: 'Verify template preview shows actual generated content',
        description:
          'Build detailed template view with preview functionality. Use existing PreviewModal component for template demonstrations.'
      },
      {
        title: 'Implement mobile-responsive marketplace design',
        type: 'FEAT',
        est: 3,
        files: [
          'client/src/components/marketplace/*.css',
          'client/src/components/marketplace/MarketplaceHome.css'
        ],
        qaGuidance:
          'Test marketplace interface on mobile devices - check card layouts',
        description:
          'Add responsive CSS to marketplace components. Ensure template cards stack properly on mobile and search filters are touch-friendly.'
      }
    ]
  }
];

// Function to add event with enhanced metadata
function addEnhancedEvent(type, actor, payload) {
  const timestamp = new Date().toISOString();
  const version = 1;

  const stmt = db.prepare(
    'INSERT INTO events (ts, type, actor, payload, version) VALUES (?, ?, ?, ?, ?)'
  );
  const result = stmt.run(
    timestamp,
    type,
    actor,
    JSON.stringify(payload),
    version
  );
  return result.lastInsertRowid;
}

// Enhanced story creation with QA metadata
function createEnhancedStory(storyData) {
  console.log(`📋 Creating enhanced story: ${storyData.title}`);

  const story = {
    id: storyData.id,
    goal_id: 'G-1',
    title: storyData.title,
    acceptance: storyData.acceptance,
    priority: storyData.priority,
    status: 'READY',
    tasks: []
  };

  addEnhancedEvent('STORY_CREATED', 'scrum_master', { story });

  storyData.tasks.forEach(taskData => {
    const taskId = `T-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const enhancedTask = {
      id: taskId,
      story_id: storyData.id,
      title: taskData.title,
      description: taskData.description, // ✅ ADDED: Detailed description
      state: 'UNASSIGNED',
      assignee: null,
      wip_class: taskData.type,
      est: taskData.est,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      dependencies: [],
      notes: [],
      // ✅ ADDED: QA Traceability metadata
      qa_metadata: {
        target_files: taskData.files,
        qa_guidance: taskData.qaGuidance,
        testing_requirements: [
          'Verify functionality works as described',
          'Check target files were modified',
          'Test on specified platforms/browsers'
        ]
      }
    };

    addEnhancedEvent('TASK_CREATED', 'scrum_master', { task: enhancedTask });

    console.log(`  ✅ Enhanced task: ${enhancedTask.title}`);
    console.log(
      `     📁 Target files: ${taskData.files.slice(0, 2).join(', ')}${taskData.files.length > 2 ? '...' : ''}`
    );
    console.log(`     🔍 QA guidance: ${taskData.qaGuidance}`);
    console.log('');
  });

  console.log(
    `  📊 Story ${storyData.id} complete with ${storyData.tasks.length} enhanced tasks\n`
  );
}

// Main execution
function main() {
  try {
    console.log('🎯 Creating Enhanced Epic 23 Tasks (QA-Friendly)...\n');

    epic23Enhanced.forEach(story => {
      createEnhancedStory(story);
    });

    console.log('🚀 Creating Enhanced Epic 19-22 Tasks...\n');

    epic1922Enhanced.forEach(story => {
      createEnhancedStory(story);
    });

    console.log('✅ Enhanced task creation complete!');
    console.log('\n📊 QA Improvements Added:');
    console.log('   📁 Target files specified for each task');
    console.log('   🔍 QA guidance for testing approach');
    console.log('   📝 Detailed task descriptions');
    console.log('   🧪 Testing requirements embedded');

    console.log('\n💡 For QA Agent:');
    console.log('   1. Each task now includes target_files array');
    console.log('   2. qa_guidance explains what to look for');
    console.log('   3. Task descriptions specify exact changes');
    console.log('   4. Testing requirements help validate work');

    console.log('\n📋 Next Steps:');
    console.log('   1. Rebuild state: node rebuild-state.js');
    console.log('   2. Agents use task.qa_metadata.target_files');
    console.log('   3. QA can search specific files mentioned');
    console.log('   4. Commit messages should include task IDs');
  } catch (error) {
    console.error('❌ Error creating enhanced tasks:', error);
  } finally {
    db.close();
  }
}

main();
