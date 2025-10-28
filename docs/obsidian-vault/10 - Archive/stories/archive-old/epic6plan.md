# Epic 6 - Project Management & UI Enhancements Implementation Plan

This document provides granular implementation plans for each story in Epic 6, breaking down tasks into specific, actionable items for development.

## Story 6.1 - Project File Structure & Management

### Implementation Tasks

#### 6.1.1 File Format Definition (2 days)

- [ ] Define .psg file structure schema in JSON
  - [ ] Create Zod validation schema for .psg files
  - [ ] Document the schema structure in the codebase
  - [ ] Implement versioning metadata to support future format changes
  - [ ] Create serialization/deserialization utilities

#### 6.1.2 Save Project Functionality (3 days)

- [ ] Implement Save menu options in the application toolbar
  - [ ] "Save" for existing projects
  - [ ] "Save As" for new file names
- [ ] Create ProjectManager class to handle file operations
  - [ ] Implement serializeProject method to convert graph to .psg format
  - [ ] Add file name sanitization to prevent invalid file names
  - [ ] Create undo/redo checkpoint before save operations
- [ ] Add keyboard shortcuts (Ctrl+S / Cmd+S)
- [ ] Implement success/failure notifications

#### 6.1.3 Open Project Functionality (3 days)

- [ ] Add Open menu option in toolbar
- [ ] Create file browser dialog with .psg filter
- [ ] Implement ProjectManager.loadProject method
  - [ ] Add schema version compatibility checking
  - [ ] Handle validation errors with user-friendly messages
  - [ ] Reset canvas and load new project state
- [ ] Add drag-and-drop support for .psg files onto canvas

#### 6.1.4 Recent Projects Feature (2 days)

- [ ] Create LocalStorage-based RecentProjectsManager
  - [ ] Store up to 5 most recently accessed projects
  - [ ] Store project metadata (name, last access date, thumbnail)
- [ ] Add "Recent Projects" submenu in File menu
  - [ ] Display project names with last accessed date
  - [ ] Add "Clear Recent Projects" option
- [ ] Implement click handlers to load recent projects

#### 6.1.5 Unsaved Changes Management (2 days)

- [ ] Add project "dirty" state tracking
  - [ ] Set dirty flag on graph modifications
  - [ ] Clear dirty flag after successful save
- [ ] Create confirmation dialog component
  - [ ] Add "Save", "Don't Save", and "Cancel" options
  - [ ] Show confirmation when closing browser with unsaved changes
  - [ ] Show confirmation when opening a new project with unsaved changes

#### 6.1.6 Testing & Quality Assurance (3 days)

- [ ] Unit tests for file format serialization/deserialization
- [ ] Integration tests for save/open workflow
- [ ] Edge case testing:
  - [ ] Very large graphs
  - [ ] Invalid file formats
  - [ ] Network/permission errors
- [ ] End-to-end testing of complete save/open cycle

## Story 6.2 - Import & Export System

### Implementation Tasks

#### 6.2.1 Export System Architecture (2 days)

- [ ] Create ExportManager class with plugin architecture
  - [ ] Define abstract Exporter interface
  - [ ] Implement export pipeline with pre-processing hooks
  - [ ] Add progress reporting mechanism
- [ ] Create "Export" menu in application toolbar with format options

#### 6.2.2 JSON Export Implementation (1 day)

- [ ] Implement JsonExporter class
  - [ ] Add options for formatting/indentation
  - [ ] Include complete graph metadata
  - [ ] Support selective export of graph sections
- [ ] Add JSON file download functionality
- [ ] Create unit tests for JSON export format

#### 6.2.3 PNG Export Implementation (2 days)

- [ ] Implement PngExporter class
  - [ ] Convert canvas to image using HTML5 Canvas API
  - [ ] Handle different zoom levels and viewport sizes
  - [ ] Add optional watermark/metadata
  - [ ] Support transparent/custom background options
- [ ] Create file download handler for PNG
- [ ] Test across browsers for rendering consistency

#### 6.2.4 Text Export Implementation (2 days)

- [ ] Implement TextExporter class
  - [ ] Run graph through the executor to generate prompts
  - [ ] Support batch export (multiple seeds)
  - [ ] Format text with optional headers/sections
  - [ ] Add line break options for different platforms
- [ ] Create file download handler for text
- [ ] Add options UI for text export configuration

#### 6.2.5 Import Validation System (3 days)

- [ ] Create ImportManager with validation pipeline
  - [ ] Implement progressive validation (quick → thorough)
  - [ ] Create detailed error reporting system
  - [ ] Add schema migration for older formats
- [ ] Build validation error summary component
  - [ ] List validation issues with line references
  - [ ] Offer automatic fixes where possible
  - [ ] Provide "import anyway" option for non-critical errors

#### 6.2.6 Import UI Implementation (2 days)

- [ ] Add "Import" option to File menu
- [ ] Create file picker with format filters
- [ ] Implement drag-and-drop import zone
- [ ] Design and implement progress indicator
  - [ ] Show percentage complete
  - [ ] Display current operation
  - [ ] Allow cancellation of long imports

#### 6.2.7 Testing & Documentation (3 days)

- [ ] Unit tests for each exporter/importer
- [ ] Integration tests for complete export/import cycle
  - [ ] Test round-trip preservation of data
  - [ ] Performance tests with large graphs
- [ ] Create user documentation for import/export features
- [ ] Update API docs for custom importers/exporters

## Story 6.3 - Ctrl-Click Node Palette Access

### Implementation Tasks

#### 6.3.1 Canvas Event Handling (2 days)

- [ ] Extend React-Flow canvas with custom event handlers
  - [ ] Add ctrl/cmd-click detection
  - [ ] Distinguish between clicks on empty canvas vs. nodes/edges
  - [ ] Store click coordinates for palette positioning
- [ ] Create toggle for feature in application settings
- [ ] Add event handler cleanup on component unmount

#### 6.3.2 Context-Aware Node Palette (3 days)

- [ ] Create floating NodePalette component
  - [ ] Design compact version of existing palette
  - [ ] Add animation for show/hide transitions
  - [ ] Implement auto-positioning logic to keep on screen
- [ ] Add context awareness to palette
  - [ ] Filter node types based on click location
  - [ ] Sort options by frequency of use
  - [ ] Show recently used nodes first

#### 6.3.3 Node Placement Logic (2 days)

- [ ] Implement precise node placement at click coordinates
  - [ ] Calculate offset based on node dimensions
  - [ ] Adjust for zoom level and canvas pan position
  - [ ] Handle grid snapping if enabled
- [ ] Add "ghost node" preview during selection
- [ ] Implement keyboard navigation for the floating palette

#### 6.3.4 User Education & Onboarding (1 day)

- [ ] Create tooltip system to introduce the feature
  - [ ] Show after 5 node drag operations from sidebar
  - [ ] Include dismiss option with "Don't show again"
- [ ] Add to keyboard shortcuts help dialog
- [ ] Create brief animated tutorial for first-time users

#### 6.3.5 Testing & Polish (2 days)

- [ ] Cross-browser compatibility testing
  - [ ] Verify ctrl/cmd key detection differences
  - [ ] Test on trackpad vs. mouse interactions
- [ ] Accessibility testing
  - [ ] Ensure keyboard alternatives exist
  - [ ] Check color contrast for palette
- [ ] Performance optimization for palette rendering

## Story 6.4 - Intelligent Wire-Node Interactions

### Implementation Tasks

#### 6.4.1 Wire Hover Detection System (3 days)

- [ ] Extend React-Flow edge components with hover detection
  - [ ] Implement efficient hit-testing algorithm
  - [ ] Create custom edge wrapper component
  - [ ] Add visual highlighting on hover
- [ ] Create drag-over-wire detection
  - [ ] Calculate proximity of dragged node to edges
  - [ ] Trigger highlight effect when within threshold
  - [ ] Track current target edge during drag

#### 6.4.2 Drop Zone Visual Feedback (2 days)

- [ ] Design and implement wire highlight effect
  - [ ] Create pulsing glow animation
  - [ ] Adjust highlight intensity based on proximity
  - [ ] Ensure visibility against all background colors
- [ ] Add drag target indicator
  - [ ] Show insertion point marker on the wire
  - [ ] Animate transition between different target wires
- [ ] Implement temporary edge previews during drag

#### 6.4.3 Contextual Menu System (3 days)

- [ ] Create generic ContextMenu component
  - [ ] Support custom rendering of menu items
  - [ ] Add keyboard navigation
  - [ ] Handle positioning and overflow
- [ ] Implement wire-node interaction menu
  - [ ] "Splice" option with descriptive text
  - [ ] "Replace" option with descriptive text
  - [ ] "Cancel" option to abort operation
- [ ] Add subtle animations for menu appearance

#### 6.4.4 Wire Operations Implementation (3 days)

- [ ] Implement "Splice" operation
  - [ ] Create two new edges connected to the dropped node
  - [ ] Copy properties from original edge
  - [ ] Delete the original edge
  - [ ] Update graph state atomically
- [ ] Implement "Replace" operation
  - [ ] Delete original edge
  - [ ] Position node for optimal manual connection
  - [ ] Show connection handles prominently
- [ ] Add operation preview on hover
  - [ ] Show ghosted preview of resulting connections
  - [ ] Use different colors for added/removed edges

#### 6.4.5 Undo/Redo Support (2 days)

- [ ] Extend undo/redo system for splice operations
  - [ ] Create atomic transaction for all edge changes
  - [ ] Store before/after state for edge configurations
  - [ ] Implement restore logic for cancelled operations
- [ ] Add user feedback for undo availability
- [ ] Test multi-level undo/redo sequences

#### 6.4.6 Testing & Refinement (3 days)

- [ ] Unit tests for wire operations
- [ ] Integration tests for complete drag-drop-splice workflow
- [ ] Usability testing
  - [ ] Test with different graph densities
  - [ ] Verify behavior with overlapping edges
  - [ ] Check performance with many edges
- [ ] Refine interaction based on user feedback
  - [ ] Adjust timing of menu appearance
  - [ ] Fine-tune hit detection thresholds
  - [ ] Optimize visual feedback

## Schedule and Resource Planning

### Timeline Overview

- Total estimated development time: 49 developer days
- Recommended team: 2 frontend developers, 1 QA engineer
- Estimated calendar duration: 6-8 weeks

### Sprint Breakdown

- Sprint 1 (2 weeks): Stories 6.1.1-6.1.3 and 6.3.1-6.3.2
- Sprint 2 (2 weeks): Stories 6.1.4-6.1.6, 6.3.3-6.3.5, and 6.2.1-6.2.2
- Sprint 3 (2 weeks): Stories 6.2.3-6.2.7 and 6.4.1-6.4.2
- Sprint 4 (2 weeks): Stories 6.4.3-6.4.6 and final integration testing

### Dependencies

- Story 6.1 (Project File Structure) should be completed before Story 6.2 (Import/Export)
- Stories 6.3 and 6.4 can be developed in parallel with 6.1 and 6.2

### Risk Mitigation

- Early prototyping of wire-node interactions to validate UX approach
- Progressive enhancement approach: implement basic functionality first, then add refinements
- Feature flags to selectively enable/disable features during development
