#!/usr/bin/env node

/**
 * Epic Integration Tickets Creator
 *
 * Creates high-priority tickets for integrating completed Epic features
 * that are currently hidden from users. These represent 6+ months of
 * completed development work that needs to be made visible.
 *
 * Based on analysis in docs/EPIC-INTEGRATION-GAPS.md
 */

const { execSync } = require('child_process');

// Create a ticket using the github automation script
function createTicketViaScript(title, description, priority = 'high') {
  try {
    // Escape quotes in the description
    const escapedTitle = title.replace(/"/g, '\\"');
    const escapedDescription = description.replace(/"/g, '\\"');

    console.log(`Creating: ${title.substring(0, 60)}...`);

    const result = execSync(
      `./scripts/github-automation.sh create-ticket "${escapedTitle}" "${escapedDescription}" "${priority}" "epic-integration"`,
      {
        encoding: 'utf8',
        cwd: '/Users/brianbehm/CascadeProjects/prompt-spaghetti',
      }
    );

    // Extract ticket ID from output
    const match = result.match(/✓ Ticket created: (TICKET-\d+)/);
    if (match) {
      return match[1];
    }

    return null;
  } catch (error) {
    console.error(`❌ Failed to create ticket: ${error.message}`);
    return null;
  }
}

// Integration tickets for Epic features
const integrationTickets = [
  // PRIORITY 1: Advanced Nodes (Epic 7) - Highest Impact
  {
    title: 'Expose Advanced Nodes in GraphEditor Palette',
    description: `**CRITICAL INTEGRATION GAP**: Epic 7 advanced nodes are fully implemented but invisible to users.

**Problem**: 
- All 4 advanced nodes exist with 90%+ test coverage: WeightedAdvanced, Conditional, Sequential, Markov
- Located in packages/core/runtime/nodes/ with comprehensive implementations
- NOT visible in GraphEditor.tsx NODE_TYPES array
- Users unaware these powerful features exist

**Solution**:
1. Add 4 advanced nodes to GraphEditor.tsx NODE_TYPES array (lines ~43)
2. Add 'advanced' category to Palette.tsx categoryOrder
3. Create icons for new nodes in packages/core/icons.tsx
4. Test node creation and basic functionality

**Files to modify**:
- packages/core/GraphEditor.tsx (NODE_TYPES array)
- packages/core/Palette.tsx (category system)  
- packages/core/icons.tsx (node icons)

**Business Value**: Makes 3+ months of Epic 7 development work visible to users
**Impact**: HIGH - Users get access to advanced workflow capabilities
**Effort**: 2-3 hours`,
    priority: 'high',
  },

  {
    title: 'Create Advanced Node Editors for Epic 7 Nodes',
    description: `**Missing UI Integration**: Advanced nodes need specialized editors for configuration.

**Problem**:
- Advanced nodes are complex with specialized parameters
- Need dedicated editors: WeightedAdvancedEditor, ConditionalEditor, SequentialEditor, MarkovEditor
- NodeEditorRouter needs to handle advanced node types

**Solution**:
1. Create WeightedAdvancedEditor for distribution algorithms
2. Create ConditionalEditor for expression-based logic
3. Create SequentialEditor for pattern configurations
4. Create MarkovEditor for state transition matrices
5. Update NodeEditorRouter to include advanced editors

**Files to create/modify**:
- packages/core/components/Inspector/editors/WeightedAdvancedEditor.tsx (new)
- packages/core/components/Inspector/editors/ConditionalEditor.tsx (new)
- packages/core/components/Inspector/editors/SequentialEditor.tsx (new)
- packages/core/components/Inspector/editors/MarkovEditor.tsx (new)
- Find and update NodeEditorRouter component

**Dependencies**: Expose Advanced Nodes in Palette first
**Business Value**: Users can configure advanced nodes with specialized settings
**Impact**: MEDIUM - Completes Epic 7 UI integration
**Effort**: 4-5 hours`,
    priority: 'high',
  },

  {
    title: 'Integrate Advanced Export System with UI',
    description: `**Hidden Export Capabilities**: Complete GeneratorBundle exporter exists but not accessible to users.

**Problem**:
- server/src/exporter.ts has full export system (PNG, PDF, YAML, XML, GeneratorBundle)
- GraphEditor.tsx only shows basic JSON save
- Users limited to basic export when professional formats available

**Solution**:
1. Create ExportDialog component with format selection
2. Connect to existing server/src/exporter.ts endpoints
3. Replace basic JSON save with comprehensive export system
4. Add export options (quality, size, metadata)

**Files to create/modify**:
- packages/core/components/ExportDialog.tsx (new)
- packages/core/GraphEditor.tsx (replace basic save)
- Update toolbar export button functionality

**Existing Assets**:
- ✅ Complete exporter in server/src/exporter.ts
- ✅ Multiple format support already implemented
- ✅ Server routes exist for export operations

**Business Value**: Users get professional export capabilities for presentations/documentation
**Impact**: MEDIUM-HIGH - Exposes Epic 3 export system
**Effort**: 2-3 hours`,
    priority: 'high',
  },

  {
    title: 'Create Project Management API Endpoints',
    description: `**Missing Backend for Project System**: GraphEditor has project dialogs but no backend support.

**Problem**:
- SaveProjectDialog and LoadProjectDialog integrated in GraphEditor.tsx (lines 647-657)
- Project management handlers exist (lines 366-415)
- NO backend API endpoints for project persistence
- Users see save/load UI but can't actually save projects

**Solution**:
1. Create /api/projects/* endpoints in server
2. Define .psg file format specification 
3. Implement project CRUD operations
4. Connect existing dialog handlers to API

**API Endpoints Needed**:
- POST /api/projects/save - Save project with metadata
- GET /api/projects/load/:id - Load project by ID
- GET /api/projects/list - List user projects
- DELETE /api/projects/:id - Delete project
- PUT /api/projects/:id - Update project

**Files to create**:
- server/src/routes/projects.ts (new API routes)
- packages/core/fileFormats/psg.ts (file format spec)
- server/src/services/ProjectService.ts (business logic)

**Business Value**: Users can save and load named projects (critical for user retention)
**Impact**: HIGH - Prevents work loss, improves user experience  
**Effort**: 3-4 hours`,
    priority: 'high',
  },

  {
    title: 'Enable Python Transform Node in UI',
    description: `**Hidden Python Capabilities**: PythonTransform node implemented but not visible.

**Problem**:
- PythonTransform implementation exists in packages/core/runtime/nodes/PythonTransform.ts
- Complete Python executor framework exists
- NOT in GraphEditor.tsx NODE_TYPES array
- Server integration commented out in engine

**Solution**:
1. Add PythonTransform to GraphEditor NODE_TYPES
2. Enable server integration (uncomment in engine)
3. Create PythonTransformEditor UI component  
4. Test Python code execution functionality

**Files to modify**:
- packages/core/GraphEditor.tsx (add to NODE_TYPES)
- server/src/engine.ts (enable Python imports)
- packages/core/components/Inspector/editors/PythonTransformEditor.tsx (exists?)

**Business Value**: Users can execute Python code within graph workflows
**Impact**: MEDIUM - Completes Epic 8 integration
**Effort**: 1-2 hours`,
    priority: 'medium',
  },
];

// Create tickets
console.log('🎯 Creating Epic Integration Tickets...\n');

let created = 0;
for (const ticket of integrationTickets) {
  const ticketId = createTicketViaScript(ticket.title, ticket.description, ticket.priority);

  if (ticketId) {
    console.log(`✅ Created: ${ticketId}`);
    console.log(`   Priority: ${ticket.priority.toUpperCase()}`);
    console.log(`   Title: ${ticket.title}\n`);
    created++;
  } else {
    console.log(`❌ Failed to create: ${ticket.title}\n`);
  }
}

console.log('📊 Summary:');
console.log(`   Created: ${created} integration tickets`);
console.log('   Expected impact: 6+ months of hidden work made visible to users');

console.log('\n🚀 Next steps:');
console.log('   1. node src/grab-tasks.js <your-dev-id> 2 --priority-only');
console.log('   2. Start with highest priority: Advanced Nodes integration');
console.log('   3. Check progress: node src/monitor-available-tasks.js');
console.log('\n📋 Priority order:');
console.log('   1. Expose Advanced Nodes - Makes Epic 7 visible (2-3h)');
console.log('   2. Advanced Node Editors - Complete Epic 7 UI (4-5h)');
console.log('   3. Export Integration - Professional export formats (2-3h)');
console.log('   4. Project API - Enable save/load functionality (3-4h)');
console.log('   5. Python Integration - Complete Epic 8 (1-2h)');
