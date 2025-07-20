# Epic: File Browser & Project Management System - Brownfield Enhancement

## Epic Goal

Implement a comprehensive project management system with file browser, save/load functionality, and project persistence to enable users to create, save, organize, and reload their prompt graph projects with auto-recovery and recent files support.

## Epic Description

**Existing System Context:**
- Current relevant functionality: React Flow graph editor with Zustand state management, existing GeneratorBundle export/import system, robust graph manipulation capabilities
- Technology stack: React 18, Vite, TypeScript, Zustand, existing export system in server/src/exporter.ts
- Integration points: graphStore.ts for state management, Graph Editor UI for toolbar integration, existing JSON export patterns

**Enhancement Details:**
- What's being added/changed: Complete project management system with .psg file format, file browser interface, save/load dialogs, auto-recovery, recent files list
- How it integrates: Extends existing graphStore with persistence layer, adds project management UI to Graph Editor, leverages existing export patterns for .psg format
- Success criteria: Users can save projects to .psg files, browse and load existing projects, recover from crashes, access recently opened projects

---

## Story 1: Project File Format & Core Save/Load System

### User Story
As a PromptGraph user working on complex prompt generation projects,
I want to save my graph projects to files and load them later,
So that I can preserve my work, share projects with others, and continue working across sessions.

### Story Context

**Existing System Integration:**
- Integrates with: Existing graphStore.ts state management, current export system in server/src/exporter.ts
- Technology: Zustand state management, TypeScript, existing JSON handling patterns
- Follows pattern: Current export/import architecture, Zod schema validation patterns
- Touch points: Graph state serialization, file system APIs, existing GeneratorBundle format

### Acceptance Criteria

**Functional Requirements:**
1. .psg file format specification defined with comprehensive graph state storage
2. Save project functionality creates .psg files with complete graph state (nodes, edges, variables, settings)
3. Load project functionality restores graph state from .psg files accurately
4. Project metadata included in .psg format (name, creation date, last modified, version)
5. File validation ensures .psg files are properly formatted before loading
6. Error handling for corrupted or incompatible project files

**Integration Requirements:**
7. Save/load operations integrate seamlessly with existing graphStore state management
8. Existing graph functionality (node creation, editing, connections) preserved after load operations
9. Current GeneratorBundle export functionality continues to work unchanged
10. Project operations maintain existing graph validation and error handling

**Quality Requirements:**
11. .psg files are human-readable JSON for version control compatibility
12. Large graph projects save and load efficiently (performance testing with 100+ nodes)
13. File operation progress indicators for large projects
14. Comprehensive error messages for file operation failures

### Implementation Steps for Scrum Master Task Breakdown:

**Phase 1: File Format Specification**
1. Design .psg file format JSON schema structure
2. Create TypeScript interfaces for project file format
3. Define project metadata structure (name, dates, version, etc.)
4. Create Zod schema for .psg file validation
5. Document .psg file format specification

**Phase 2: Core Save Functionality**
6. Create `/packages/core/projectManager.ts` module
7. Implement project serialization from graphStore state
8. Add project metadata generation (timestamps, version)
9. Create save project function with file validation
10. Implement browser file download for .psg files

**Phase 3: Core Load Functionality**
11. Implement .psg file parsing and validation
12. Create project deserialization to graphStore state
13. Add version compatibility checking for .psg files
14. Implement state restoration with existing graph validation
15. Create load project function with error handling

**Phase 4: GraphStore Integration**
16. Extend graphStore with project save/load actions
17. Add project metadata to graphStore state
18. Implement state serialization helpers
19. Add state restoration validation
20. Ensure existing graphStore operations work with loaded projects

**Phase 5: File Validation & Error Handling**
21. Create comprehensive .psg file validation rules
22. Implement error messages for corrupted files
23. Add version migration for older .psg file formats
24. Create file size validation and warnings
25. Test save/load with various graph complexities

**Phase 6: Performance & Testing**
26. Optimize serialization for large graphs (100+ nodes)
27. Add progress indicators for large file operations
28. Test memory usage during save/load operations
29. Validate cross-browser file API compatibility
30. Performance test with complex graphs and large files

### Technical Notes

- **Integration Approach:** Extend existing export patterns, leverage graphStore serialization, implement new .psg format alongside GeneratorBundle
- **Existing Pattern Reference:** Follow server/src/exporter.ts patterns, use existing Zod schema validation approach
- **Key Constraints:** File size efficiency, backward compatibility, cross-browser file API support

### Definition of Done

- ✅ .psg file format specification documented and implemented
- ✅ Save project functionality working (creates valid .psg files)
- ✅ Load project functionality working (restores graph state accurately)
- ✅ Project metadata (name, dates, version) included in .psg format
- ✅ File validation and error handling implemented
- ✅ Integration with graphStore preserves existing functionality
- ✅ Performance tested with large graphs (100+ nodes)
- ✅ Progress indicators implemented for file operations
- ✅ Comprehensive error handling and user feedback

---

## Story 2: File Browser Interface & Project Management UI

### User Story
As a PromptGraph user managing multiple projects,
I want an intuitive file browser and project management interface,
So that I can easily organize, find, and access my prompt generation projects.

### Story Context

**Existing System Integration:**
- Integrates with: Graph Editor UI, save/load system from Story 1, existing React component patterns
- Technology: React 18, TypeScript, existing UI component library, file browser APIs
- Follows pattern: Existing Graph Editor UI patterns, modal dialog patterns, toolbar integration
- Touch points: Graph Editor toolbar, file dialogs, project selection interface

### Acceptance Criteria

**Functional Requirements:**
1. File browser component displays available .psg projects with thumbnails/previews
2. "Save Project" and "Open Project" buttons added to Graph Editor toolbar
3. Save dialog allows users to name projects and select save location
4. Open dialog displays projects with metadata (name, date modified, file size)
5. Project management operations: rename, delete, duplicate projects
6. Search and filter functionality for large project collections

**Integration Requirements:**
7. File browser integrates seamlessly with Graph Editor without disrupting existing UI
8. Save/Open dialogs follow existing application design patterns and styling
9. Project operations work with save/load system from Story 1
10. File browser state management doesn't conflict with existing graphStore

**Quality Requirements:**
11. File browser responsive design works on desktop and tablet devices
12. Loading states shown during file operations and project browsing
13. Confirmation dialogs for destructive operations (delete, overwrite)
14. Drag-and-drop support for project files (.psg files)

### Implementation Steps for Scrum Master Task Breakdown:

**Phase 1: File Browser Component Structure**
1. Create `/packages/core/components/FileBrowser/` directory
2. Create `FileBrowser.tsx` main component
3. Create `ProjectCard.tsx` component for project display
4. Create `ProjectList.tsx` component for project listing
5. Design file browser layout and responsive structure

**Phase 2: Save/Open Dialog Components**
6. Create `/packages/core/components/ProjectDialogs/` directory
7. Create `SaveProjectDialog.tsx` with form validation
8. Create `OpenProjectDialog.tsx` with project selection
9. Create `ProjectNameInput.tsx` reusable component
10. Implement modal dialog base component if needed

**Phase 3: Graph Editor Integration**
11. Add Save/Open buttons to GraphEditor toolbar
12. Integrate save dialog with existing toolbar design
13. Connect open dialog to file browser functionality
14. Add keyboard shortcuts for save/open operations
15. Ensure dialog modals don't interfere with graph editing

**Phase 4: Project Management Operations**
16. Implement project rename functionality
17. Create project deletion with confirmation dialog
18. Add project duplication feature
19. Implement project export to different formats
20. Create bulk operations for multiple project selection

**Phase 5: Search & Filter Functionality**
21. Add search input to file browser header
22. Implement project name and metadata filtering
23. Add date range filtering for project modified dates
24. Create project sorting options (name, date, size)
25. Implement project categorization/tagging system

**Phase 6: Advanced UI Features**
26. Add drag-and-drop support for .psg file import
27. Create project thumbnail/preview generation
28. Implement grid/list view toggle for file browser
29. Add project file size and metadata display
30. Test responsive design across desktop and tablet devices

### Technical Notes

- **Integration Approach:** Create modular file browser components, integrate with Graph Editor toolbar, use existing modal patterns
- **Existing Pattern Reference:** Follow GraphEditor.tsx component patterns, existing modal and dialog patterns
- **Key Constraints:** File system API limitations, browser security restrictions, UI consistency

### Definition of Done

- ✅ File browser component implemented and working
- ✅ Save/Open buttons integrated into Graph Editor toolbar
- ✅ Save dialog with project naming and location selection
- ✅ Open dialog with project metadata display
- ✅ Project management operations (rename, delete, duplicate) working
- ✅ Search and filter functionality implemented
- ✅ Responsive design across desktop and tablet
- ✅ Loading states and confirmation dialogs implemented
- ✅ Drag-and-drop support for .psg files
- ✅ UI consistent with existing Graph Editor design

---

## Story 3: Auto-Recovery & Recent Files Features

### User Story
As a PromptGraph user working on important projects,
I want automatic backup and recovery features,
So that I never lose my work due to browser crashes or accidental closure.

### Story Context

**Existing System Integration:**
- Integrates with: Project save/load system from Story 1, file browser from Story 2, existing graphStore patterns
- Technology: localStorage/sessionStorage APIs, debounced operations, existing state management
- Follows pattern: Existing autosave patterns (mentioned in PRD), Zustand state persistence
- Touch points: Graph state changes, browser session management, project file operations

### Acceptance Criteria

**Functional Requirements:**
1. Auto-save to localStorage every 5 seconds with debouncing when graph state changes
2. Crash recovery system detects unsaved changes on application startup
3. Recovery dialog offers to restore unsaved work or start fresh
4. Recently opened projects list (last 5) displayed in file browser
5. Quick access to recent projects from Graph Editor toolbar
6. Auto-save state indicator shows when changes are pending/saved

**Integration Requirements:**
7. Auto-save integrates with existing graphStore state without performance impact
8. Recovery system works with file browser and project management from Story 2
9. Recent files integrate with save/load operations from Story 1
10. Auto-save respects user preferences and can be disabled if needed

**Quality Requirements:**
11. Auto-save operations don't block UI or impact graph editing performance
12. Recovery data automatically cleaned up after successful project saves
13. Recent files list updates appropriately when projects are opened/saved
14. Storage quota management prevents localStorage overflow

### Implementation Steps for Scrum Master Task Breakdown:

**Phase 1: Auto-Save Infrastructure**
1. Create `/packages/core/autoSave.ts` module
2. Implement debounced auto-save with 5-second delay
3. Add graphStore state change detection
4. Create localStorage key management for auto-save data
5. Implement auto-save state serialization

**Phase 2: Auto-Save Integration**
6. Integrate auto-save with existing graphStore
7. Add auto-save triggers for node/edge changes
8. Implement auto-save pause during file operations
9. Create auto-save status indicator component
10. Add user preferences for auto-save settings

**Phase 3: Crash Recovery System**
11. Create recovery detection logic on app startup
12. Implement recovery data validation and cleanup
13. Create `RecoveryDialog.tsx` component
14. Add recovery options (restore, discard, save as new)
15. Implement recovery data timestamp tracking

**Phase 4: Recent Files System**
16. Create recent files tracking in localStorage
17. Implement recent files list management (last 5 projects)
18. Add recent files to file browser display
19. Create quick access menu for recent projects
20. Implement recent files cleanup and maintenance

**Phase 5: Storage Management**
21. Implement localStorage quota monitoring
22. Create storage cleanup strategies for old auto-save data
23. Add storage usage indicators and warnings
24. Implement data compression for stored project data
25. Create fallback strategies for localStorage unavailability

**Phase 6: User Experience & Performance**
26. Add visual indicators for auto-save status (saved/saving/error)
27. Implement non-blocking auto-save operations
28. Create user notifications for recovery opportunities
29. Test auto-save performance impact with large graphs
30. Validate recovery system works after browser crashes

### Technical Notes

- **Integration Approach:** Implement debounced auto-save using existing state patterns, integrate with localStorage, connect to existing save/load system
- **Existing Pattern Reference:** Follow graphStore.ts patterns for state monitoring, use existing performance optimization approaches
- **Key Constraints:** localStorage size limits, performance impact, browser compatibility

### Definition of Done

- ✅ Auto-save to localStorage working with 5-second debouncing
- ✅ Crash recovery system detects and offers to restore unsaved changes
- ✅ Recovery dialog implemented with restore/start fresh options
- ✅ Recently opened projects list (last 5) working in file browser
- ✅ Quick access to recent projects from toolbar
- ✅ Auto-save indicator showing save status
- ✅ Performance impact minimized (tested with large graphs)
- ✅ Storage quota management implemented
- ✅ User preferences for auto-save settings
- ✅ Recovery data cleanup after successful saves

---

## Epic Compatibility Requirements

- ✅ Existing APIs remain unchanged (extends current export/import patterns)
- ✅ Database schema changes are backward compatible (client-side only, no database changes)
- ✅ UI changes follow existing patterns (React components matching Graph Editor design)
- ✅ Performance impact is minimal (debounced saves, efficient serialization)

## Epic Risk Mitigation

- **Primary Risk:** Breaking existing graph editor functionality or state management
- **Mitigation:** Build as additive layer over existing graphStore, maintain current export functionality, thorough testing of state management
- **Rollback Plan:** Disable file management features while preserving existing graph editor functionality, revert to current state-only operation

## Epic Definition of Done

- ✅ All 3 stories completed with acceptance criteria met
- ✅ Existing functionality verified through testing (current graph editor operations work unchanged)
- ✅ Integration points working correctly (.psg format saves/loads graph state accurately)
- ✅ Documentation updated appropriately (file format specification, user guide for project management)
- ✅ No regression in existing features (all current graph operations preserved)