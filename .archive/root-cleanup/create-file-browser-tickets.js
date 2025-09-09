#!/usr/bin/env node

/**
 * Script to create File Browser & Project Management Epic tickets
 * Creates all 90 implementation tasks (30 per story) as individual tickets
 */

const tickets = [
  // Story 1: Project File Format & Core Save/Load System - Phase 1: File Format Specification
  {
    title: 'Design .psg file format JSON schema structure',
    description: `Epic: File Browser & Project Management
Story 1: Project File Format & Core Save/Load System
Phase 1: File Format Specification - Step 1

**Task Description:**
Design the complete JSON schema structure for .psg (PromptGraph project) files that will store all graph state information including nodes, edges, variables, and metadata.

**Acceptance Criteria:**
- JSON schema structure defined for .psg file format
- Schema includes sections for: graph nodes, edges, variables, project metadata
- Schema structure documented with examples
- Consider backward compatibility and version management
- Schema supports large graphs efficiently

**Technical Notes:**
- Integrate with existing graphStore.ts state structure
- Follow patterns from server/src/exporter.ts
- Build on existing GeneratorBundle format knowledge
- Ensure compatibility with Zod validation patterns

**Files to create/modify:**
- Design schema specification document
- Define TypeScript interfaces

**Epic Context:** Story 1 of 3 in File Browser & Project Management Epic`,
    priority: 'high',
    epic: 'File Browser & Project Management',
    story: 'Project File Format & Core Save/Load System',
    phase: 'File Format Specification',
    step_number: 1
  },
  {
    title: 'Create TypeScript interfaces for project file format',
    description: `Epic: File Browser & Project Management
Story 1: Project File Format & Core Save/Load System
Phase 1: File Format Specification - Step 2

**Task Description:**
Create comprehensive TypeScript interfaces for the .psg project file format based on the JSON schema design from Step 1.

**Acceptance Criteria:**
- TypeScript interfaces defined for all .psg file components
- Interfaces include: ProjectFile, ProjectMetadata, GraphState, NodeData, EdgeData
- Interfaces are type-safe and support IntelliSense
- Interfaces integrate with existing graph types in packages/core
- Export interfaces for use across the application

**Technical Notes:**
- Create file: packages/core/types/ProjectTypes.ts
- Extend existing NodeTypes.ts and graph types
- Ensure compatibility with existing Zod schemas
- Follow TypeScript best practices

**Files to create/modify:**
- packages/core/types/ProjectTypes.ts (new)
- Update packages/core/types/index.ts

**Epic Context:** Story 1 of 3 in File Browser & Project Management Epic`,
    priority: 'high',
    epic: 'File Browser & Project Management',
    story: 'Project File Format & Core Save/Load System',
    phase: 'File Format Specification',
    step_number: 2
  },
  {
    title: 'Define project metadata structure (name, dates, version, etc.)',
    description: `Epic: File Browser & Project Management
Story 1: Project File Format & Core Save/Load System
Phase 1: File Format Specification - Step 3

**Task Description:**
Define the comprehensive project metadata structure that will be included in .psg files to track project information, version history, and management data.

**Acceptance Criteria:**
- ProjectMetadata interface includes: name, description, author, creation date, last modified date
- Version tracking fields: formatVersion, applicationVersion, compatibility info
- File information: file size estimation, node count, complexity metrics
- User-defined fields: tags, categories, custom metadata
- Validation rules for required vs optional metadata fields

**Technical Notes:**
- Extend ProjectTypes.ts from Step 2
- Consider future extensibility for additional metadata
- Include UUID for unique project identification
- Support for project thumbnails/previews (base64 or external references)

**Files to create/modify:**
- packages/core/types/ProjectTypes.ts (extend)
- Create validation schemas for metadata

**Epic Context:** Story 1 of 3 in File Browser & Project Management Epic`,
    priority: 'high',
    epic: 'File Browser & Project Management',
    story: 'Project File Format & Core Save/Load System',
    phase: 'File Format Specification',
    step_number: 3
  },
  {
    title: 'Create Zod schema for .psg file validation',
    description: `Epic: File Browser & Project Management
Story 1: Project File Format & Core Save/Load System
Phase 1: File Format Specification - Step 4

**Task Description:**
Create comprehensive Zod validation schemas for .psg project files to ensure data integrity and type safety during save/load operations.

**Acceptance Criteria:**
- Zod schemas for all .psg file components (ProjectFile, ProjectMetadata, GraphState)
- Validation rules for required fields, data types, and constraints
- Schema versioning support for backward compatibility
- Integration with existing graph validation patterns
- Error messages that help users understand validation failures

**Technical Notes:**
- Create file: packages/core/validation/projectSchemas.ts
- Extend existing graphSchema.ts patterns
- Use existing Zod validation infrastructure
- Support for partial validation (metadata-only, graph-only)

**Files to create/modify:**
- packages/core/validation/projectSchemas.ts (new)
- Update packages/core/validation/index.ts
- Integrate with existing validation.ts

**Epic Context:** Story 1 of 3 in File Browser & Project Management Epic`,
    priority: 'high',
    epic: 'File Browser & Project Management',
    story: 'Project File Format & Core Save/Load System',
    phase: 'File Format Specification',
    step_number: 4
  },
  {
    title: 'Document .psg file format specification',
    description: `Epic: File Browser & Project Management
Story 1: Project File Format & Core Save/Load System
Phase 1: File Format Specification - Step 5

**Task Description:**
Create comprehensive documentation for the .psg file format specification including examples, use cases, and integration guidelines.

**Acceptance Criteria:**
- Complete format specification document with JSON examples
- Version compatibility matrix and migration guidelines
- Developer integration guide for reading/writing .psg files
- File size optimization recommendations
- Error handling and recovery procedures documentation
- Example .psg files for testing and reference

**Technical Notes:**
- Create documentation file in docs/ directory
- Include format version history and changelog
- Provide examples for small, medium, and large projects
- Document integration with existing export system

**Files to create/modify:**
- docs/psg-file-format.md (new)
- examples/sample-projects/ (new directory with examples)
- Update main documentation index

**Epic Context:** Story 1 of 3 in File Browser & Project Management Epic`,
    priority: 'medium',
    epic: 'File Browser & Project Management',
    story: 'Project File Format & Core Save/Load System',
    phase: 'File Format Specification',
    step_number: 5
  },

  // Phase 2: Core Save Functionality
  {
    title: 'Create /packages/core/projectManager.ts module',
    description: `Epic: File Browser & Project Management
Story 1: Project File Format & Core Save/Load System
Phase 2: Core Save Functionality - Step 6

**Task Description:**
Create the core ProjectManager module that will handle all project file operations including save, load, validation, and metadata management.

**Acceptance Criteria:**
- ProjectManager class with methods for save, load, validate operations
- Integration with existing graphStore state management
- Support for async file operations with progress tracking
- Error handling and user feedback mechanisms
- Modular design for easy testing and extension

**Technical Notes:**
- Create packages/core/projectManager.ts
- Follow existing patterns from packages/core structure
- Integrate with Zustand graphStore
- Use TypeScript interfaces from previous steps
- Support both browser and potential Node.js environments

**Files to create/modify:**
- packages/core/projectManager.ts (new)
- packages/core/index.ts (export ProjectManager)

**Epic Context:** Story 1 of 3 in File Browser & Project Management Epic`,
    priority: 'high',
    epic: 'File Browser & Project Management',
    story: 'Project File Format & Core Save/Load System',
    phase: 'Core Save Functionality',
    step_number: 6
  },
  {
    title: 'Implement project serialization from graphStore state',
    description: `Epic: File Browser & Project Management
Story 1: Project File Format & Core Save/Load System
Phase 2: Core Save Functionality - Step 7

**Task Description:**
Implement the core serialization logic that converts the current graphStore state into the .psg file format for saving projects.

**Acceptance Criteria:**
- Serialize complete graph state (nodes, edges, variables) to .psg format
- Handle large graphs efficiently with memory optimization
- Preserve all node properties, connections, and custom data
- Include validation to ensure serialized data integrity
- Support for partial serialization (metadata-only saves)

**Technical Notes:**
- Extend ProjectManager from Step 6
- Read from graphStore using existing patterns
- Convert graphStore format to .psg ProjectFile format
- Handle circular references and complex data structures
- Optimize for performance with large node counts

**Files to create/modify:**
- packages/core/projectManager.ts (extend serialization methods)
- Add unit tests for serialization logic

**Epic Context:** Story 1 of 3 in File Browser & Project Management Epic`,
    priority: 'high',
    epic: 'File Browser & Project Management',
    story: 'Project File Format & Core Save/Load System',
    phase: 'Core Save Functionality',
    step_number: 7
  },
  {
    title: 'Add project metadata generation (timestamps, version)',
    description: `Epic: File Browser & Project Management
Story 1: Project File Format & Core Save/Load System
Phase 2: Core Save Functionality - Step 8

**Task Description:**
Implement automatic generation of project metadata including timestamps, version information, and file statistics during the save process.

**Acceptance Criteria:**
- Generate creation and modification timestamps automatically
- Set format version and application version information
- Calculate and include file statistics (node count, edge count, complexity)
- Generate unique project IDs (UUIDs) for new projects
- Preserve existing metadata when saving existing projects

**Technical Notes:**
- Extend ProjectManager serialization from Step 7
- Use date/time utilities for consistent timestamp formatting
- Implement file statistics calculation algorithms
- Generate UUIDs using standard libraries
- Handle timezone considerations for timestamps

**Files to create/modify:**
- packages/core/projectManager.ts (extend metadata generation)
- packages/core/utils/projectUtils.ts (new utility functions)

**Epic Context:** Story 1 of 3 in File Browser & Project Management Epic`,
    priority: 'medium',
    epic: 'File Browser & Project Management',
    story: 'Project File Format & Core Save/Load System',
    phase: 'Core Save Functionality',
    step_number: 8
  },
  {
    title: 'Create save project function with file validation',
    description: `Epic: File Browser & Project Management
Story 1: Project File Format & Core Save/Load System
Phase 2: Core Save Functionality - Step 9

**Task Description:**
Implement the main save project function that validates the serialized data and handles the complete save workflow with error handling.

**Acceptance Criteria:**
- Complete saveProject() method in ProjectManager
- Pre-save validation using Zod schemas from Step 4
- Post-serialization validation to ensure data integrity
- Comprehensive error handling with user-friendly messages
- Support for save options (include metadata, compression, etc.)

**Technical Notes:**
- Build on serialization and metadata from Steps 7-8
- Use Zod schemas from Step 4 for validation
- Implement proper error handling and recovery
- Support for save configuration options
- Progress tracking for large project saves

**Files to create/modify:**
- packages/core/projectManager.ts (saveProject method)
- Add comprehensive error types and handling

**Epic Context:** Story 1 of 3 in File Browser & Project Management Epic`,
    priority: 'high',
    epic: 'File Browser & Project Management',
    story: 'Project File Format & Core Save/Load System',
    phase: 'Core Save Functionality',
    step_number: 9
  },
  {
    title: 'Implement browser file download for .psg files',
    description: `Epic: File Browser & Project Management
Story 1: Project File Format & Core Save/Load System
Phase 2: Core Save Functionality - Step 10

**Task Description:**
Implement browser-based file download functionality to save .psg project files to the user's local file system using Web APIs.

**Acceptance Criteria:**
- Browser file download using File API and URL.createObjectURL
- Proper MIME type and file extension handling for .psg files
- Memory-efficient handling of large project files
- Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- Cleanup of object URLs to prevent memory leaks

**Technical Notes:**
- Use Blob API for file creation
- Implement downloadFile utility function
- Handle filename sanitization and validation
- Support for custom filenames and automatic naming
- Test with various file sizes and browser environments

**Files to create/modify:**
- packages/core/utils/fileUtils.ts (new utility functions)
- packages/core/projectManager.ts (integrate download functionality)

**Epic Context:** Story 1 of 3 in File Browser & Project Management Epic`,
    priority: 'high',
    epic: 'File Browser & Project Management',
    story: 'Project File Format & Core Save/Load System',
    phase: 'Core Save Functionality',
    step_number: 10
  },

  // Phase 3: Core Load Functionality
  {
    title: 'Implement .psg file parsing and validation',
    description: `Epic: File Browser & Project Management
Story 1: Project File Format & Core Save/Load System
Phase 3: Core Load Functionality - Step 11

**Task Description:**
Implement parsing and validation of .psg project files to safely load project data with comprehensive error handling and security checks.

**Acceptance Criteria:**
- Parse .psg JSON files with proper error handling
- Validate file format using Zod schemas from Step 4
- Detect and handle corrupted or malformed files
- Security validation to prevent XSS and injection attacks
- Support for different .psg format versions

**Technical Notes:**
- Extend ProjectManager with parsing methods
- Use Zod schemas for comprehensive validation
- Implement security sanitization for user data
- Handle large file parsing efficiently
- Provide detailed error messages for validation failures

**Files to create/modify:**
- packages/core/projectManager.ts (parsing methods)
- Add security validation utilities

**Epic Context:** Story 1 of 3 in File Browser & Project Management Epic`,
    priority: 'high',
    epic: 'File Browser & Project Management',
    story: 'Project File Format & Core Save/Load System',
    phase: 'Core Load Functionality',
    step_number: 11
  },
  {
    title: 'Create project deserialization to graphStore state',
    description: `Epic: File Browser & Project Management
Story 1: Project File Format & Core Save/Load System
Phase 3: Core Load Functionality - Step 12

**Task Description:**
Implement deserialization logic that converts validated .psg file data back into graphStore state format for restoration in the application.

**Acceptance Criteria:**
- Convert .psg ProjectFile format to graphStore state
- Restore all nodes, edges, variables, and settings
- Maintain node IDs and connection integrity
- Handle data type conversions and compatibility
- Preserve custom node properties and metadata

**Technical Notes:**
- Reverse the serialization process from Step 7
- Update graphStore state using existing patterns
- Validate node and edge relationships
- Handle potential data migration needs
- Ensure UI components refresh properly after load

**Files to create/modify:**
- packages/core/projectManager.ts (deserialization methods)
- Integration with graphStore state management

**Epic Context:** Story 1 of 3 in File Browser & Project Management Epic`,
    priority: 'high',
    epic: 'File Browser & Project Management',
    story: 'Project File Format & Core Save/Load System',
    phase: 'Core Load Functionality',
    step_number: 12
  },
  {
    title: 'Add version compatibility checking for .psg files',
    description: `Epic: File Browser & Project Management
Story 1: Project File Format & Core Save/Load System
Phase 3: Core Load Functionality - Step 13

**Task Description:**
Implement version compatibility checking to handle .psg files created with different application versions and provide appropriate migration or warning messages.

**Acceptance Criteria:**
- Check format version against current application capabilities
- Detect and handle older .psg file formats
- Provide version compatibility warnings to users
- Support for automatic migration of compatible older formats
- Clear error messages for incompatible versions

**Technical Notes:**
- Implement version comparison utilities
- Create migration strategies for older formats
- Provide user choice for handling version mismatches
- Document version compatibility matrix
- Future-proof design for format evolution

**Files to create/modify:**
- packages/core/projectManager.ts (version checking)
- packages/core/utils/versionUtils.ts (new)
- Version compatibility configuration

**Epic Context:** Story 1 of 3 in File Browser & Project Management Epic`,
    priority: 'medium',
    epic: 'File Browser & Project Management',
    story: 'Project File Format & Core Save/Load System',
    phase: 'Core Load Functionality',
    step_number: 13
  },
  {
    title: 'Implement state restoration with existing graph validation',
    description: `Epic: File Browser & Project Management
Story 1: Project File Format & Core Save/Load System
Phase 3: Core Load Functionality - Step 14

**Task Description:**
Integrate project loading with existing graph validation systems to ensure loaded projects meet all application requirements and constraints.

**Acceptance Criteria:**
- Run existing graph validation on loaded projects
- Check for node type compatibility and edge validity
- Validate variable references and dependencies
- Ensure no cycles or invalid connections
- Maintain existing validation error reporting

**Technical Notes:**
- Use existing validation.ts and graphSchema.ts
- Integrate with current graph validation pipeline
- Preserve validation error handling patterns
- Ensure UI updates properly reflect validation state
- Support for partial loads with validation warnings

**Files to create/modify:**
- packages/core/projectManager.ts (integrate validation)
- Ensure compatibility with existing validation systems

**Epic Context:** Story 1 of 3 in File Browser & Project Management Epic`,
    priority: 'high',
    epic: 'File Browser & Project Management',
    story: 'Project File Format & Core Save/Load System',
    phase: 'Core Load Functionality',
    step_number: 14
  },
  {
    title: 'Create load project function with error handling',
    description: `Epic: File Browser & Project Management
Story 1: Project File Format & Core Save/Load System
Phase 3: Core Load Functionality - Step 15

**Task Description:**
Implement the main loadProject() function that coordinates the complete project loading workflow with comprehensive error handling and user feedback.

**Acceptance Criteria:**
- Complete loadProject() method in ProjectManager
- File reading using browser File API
- Progress tracking for large project loads
- Comprehensive error handling with recovery options
- User feedback during loading process

**Technical Notes:**
- Coordinate parsing, validation, and deserialization steps
- Handle FileReader API for browser file access
- Implement progress callbacks for UI updates
- Provide detailed error reporting and recovery suggestions
- Support for load options and configurations

**Files to create/modify:**
- packages/core/projectManager.ts (loadProject method)
- Complete error handling and user feedback systems

**Epic Context:** Story 1 of 3 in File Browser & Project Management Epic`,
    priority: 'high',
    epic: 'File Browser & Project Management',
    story: 'Project File Format & Core Save/Load System',
    phase: 'Core Load Functionality',
    step_number: 15
  },

  // Phase 4: GraphStore Integration
  {
    title: 'Extend graphStore with project save/load actions',
    description: `Epic: File Browser & Project Management
Story 1: Project File Format & Core Save/Load System
Phase 4: GraphStore Integration - Step 16

**Task Description:**
Extend the existing Zustand graphStore with new actions for project save and load operations, integrating with the ProjectManager from previous phases.

**Acceptance Criteria:**
- Add saveProject and loadProject actions to graphStore
- Integrate with existing state management patterns
- Maintain state consistency during save/load operations
- Support for async operations with loading states
- Preserve existing graphStore functionality

**Technical Notes:**
- Extend packages/core/graphStore.ts
- Follow existing Zustand patterns and conventions
- Integrate ProjectManager from Steps 6-15
- Handle async state management properly
- Maintain backward compatibility

**Files to create/modify:**
- packages/core/graphStore.ts (extend with project actions)
- Update store type definitions

**Epic Context:** Story 1 of 3 in File Browser & Project Management Epic`,
    priority: 'high',
    epic: 'File Browser & Project Management',
    story: 'Project File Format & Core Save/Load System',
    phase: 'GraphStore Integration',
    step_number: 16
  },
  {
    title: 'Add project metadata to graphStore state',
    description: `Epic: File Browser & Project Management
Story 1: Project File Format & Core Save/Load System
Phase 4: GraphStore Integration - Step 17

**Task Description:**
Extend graphStore state to include project metadata information, allowing the application to track and display current project information.

**Acceptance Criteria:**
- Add projectMetadata field to graphStore state
- Include current project name, save status, modification state
- Track unsaved changes and dirty state
- Support for project metadata updates
- Maintain metadata consistency with file operations

**Technical Notes:**
- Extend graphStore state interface
- Add metadata update actions
- Implement dirty state tracking
- Integrate with save/load operations
- Preserve metadata across application sessions

**Files to create/modify:**
- packages/core/graphStore.ts (extend state and actions)
- Update TypeScript interfaces for store state

**Epic Context:** Story 1 of 3 in File Browser & Project Management Epic`,
    priority: 'medium',
    epic: 'File Browser & Project Management',
    story: 'Project File Format & Core Save/Load System',
    phase: 'GraphStore Integration',
    step_number: 17
  },
  {
    title: 'Implement state serialization helpers',
    description: `Epic: File Browser & Project Management
Story 1: Project File Format & Core Save/Load System
Phase 4: GraphStore Integration - Step 18

**Task Description:**
Create utility functions that help with serializing and deserializing specific parts of the graphStore state for efficient project operations.

**Acceptance Criteria:**
- Utility functions for serializing nodes, edges, variables separately
- Efficient deep cloning and state comparison utilities
- Support for partial serialization (metadata-only, graph-only)
- State diffing utilities for tracking changes
- Memory-efficient operations for large graphs

**Technical Notes:**
- Create packages/core/utils/stateSerializationUtils.ts
- Implement efficient serialization algorithms
- Support for incremental updates and diffs
- Handle complex object references and circular dependencies
- Optimize for performance with large datasets

**Files to create/modify:**
- packages/core/utils/stateSerializationUtils.ts (new)
- packages/core/utils/index.ts (export utilities)

**Epic Context:** Story 1 of 3 in File Browser & Project Management Epic`,
    priority: 'medium',
    epic: 'File Browser & Project Management',
    story: 'Project File Format & Core Save/Load System',
    phase: 'GraphStore Integration',
    step_number: 18
  },
  {
    title: 'Add state restoration validation',
    description: `Epic: File Browser & Project Management
Story 1: Project File Format & Core Save/Load System
Phase 4: GraphStore Integration - Step 19

**Task Description:**
Implement validation logic specifically for state restoration to ensure loaded project data is properly integrated into graphStore without conflicts.

**Acceptance Criteria:**
- Validate state consistency after project load
- Check for ID conflicts and reference integrity
- Ensure UI component compatibility with loaded state
- Validate variable references and dependencies
- Support for conflict resolution strategies

**Technical Notes:**
- Create state validation utilities
- Integrate with existing graph validation
- Handle ID remapping for conflict resolution
- Validate component state compatibility
- Provide detailed validation reports

**Files to create/modify:**
- packages/core/utils/stateValidationUtils.ts (new)
- Integrate with graphStore state restoration

**Epic Context:** Story 1 of 3 in File Browser & Project Management Epic`,
    priority: 'medium',
    epic: 'File Browser & Project Management',
    story: 'Project File Format & Core Save/Load System',
    phase: 'GraphStore Integration',
    step_number: 19
  },
  {
    title: 'Ensure existing graphStore operations work with loaded projects',
    description: `Epic: File Browser & Project Management
Story 1: Project File Format & Core Save/Load System
Phase 4: GraphStore Integration - Step 20

**Task Description:**
Test and ensure that all existing graphStore operations (node creation, editing, connections, etc.) work seamlessly with loaded projects.

**Acceptance Criteria:**
- All existing graph operations work after project load
- Node creation, editing, and deletion functions properly
- Edge creation and modification works correctly
- Variable operations maintain consistency
- Undo/redo functionality works with loaded projects

**Technical Notes:**
- Comprehensive testing of existing functionality
- Verify state consistency across operations
- Test edge cases and complex scenarios
- Ensure UI components update properly
- Validate autosave and state management

**Files to create/modify:**
- Add integration tests for project load + operations
- Test existing graphStore functionality with loaded state

**Epic Context:** Story 1 of 3 in File Browser & Project Management Epic`,
    priority: 'high',
    epic: 'File Browser & Project Management',
    story: 'Project File Format & Core Save/Load System',
    phase: 'GraphStore Integration',
    step_number: 20
  },

  // Phase 5: File Validation & Error Handling
  {
    title: 'Create comprehensive .psg file validation rules',
    description: `Epic: File Browser & Project Management
Story 1: Project File Format & Core Save/Load System
Phase 5: File Validation & Error Handling - Step 21

**Task Description:**
Implement comprehensive validation rules for .psg files covering all aspects of file integrity, security, and compatibility.

**Acceptance Criteria:**
- File format validation (JSON structure, required fields)
- Content validation (node types, edge connections, variable references)
- Security validation (sanitization, injection prevention)
- Size and complexity validation (node limits, memory usage)
- Version and compatibility validation

**Technical Notes:**
- Extend Zod schemas with additional validation rules
- Implement custom validators for complex business logic
- Create validation rule documentation
- Support for configurable validation strictness
- Performance optimization for large file validation

**Files to create/modify:**
- packages/core/validation/projectValidation.ts (new)
- Extend existing validation infrastructure

**Epic Context:** Story 1 of 3 in File Browser & Project Management Epic`,
    priority: 'medium',
    epic: 'File Browser & Project Management',
    story: 'Project File Format & Core Save/Load System',
    phase: 'File Validation & Error Handling',
    step_number: 21
  },
  {
    title: 'Implement error messages for corrupted files',
    description: `Epic: File Browser & Project Management
Story 1: Project File Format & Core Save/Load System
Phase 5: File Validation & Error Handling - Step 22

**Task Description:**
Create user-friendly error messages and recovery suggestions for various types of file corruption and validation failures.

**Acceptance Criteria:**
- Clear, actionable error messages for different failure types
- Specific guidance for file corruption scenarios
- Recovery suggestions where possible
- Error categorization (critical, warning, info)
- Internationalization support for error messages

**Technical Notes:**
- Create error message catalog with different severity levels
- Implement error recovery workflows
- Provide specific guidance for common issues
- Support for detailed technical error reporting
- User-friendly language while maintaining technical accuracy

**Files to create/modify:**
- packages/core/errors/projectErrors.ts (new)
- packages/core/utils/errorRecovery.ts (new)

**Epic Context:** Story 1 of 3 in File Browser & Project Management Epic`,
    priority: 'medium',
    epic: 'File Browser & Project Management',
    story: 'Project File Format & Core Save/Load System',
    phase: 'File Validation & Error Handling',
    step_number: 22
  },
  {
    title: 'Add version migration for older .psg file formats',
    description: `Epic: File Browser & Project Management
Story 1: Project File Format & Core Save/Load System
Phase 5: File Validation & Error Handling - Step 23

**Task Description:**
Implement automatic migration system for older .psg file formats to maintain backward compatibility as the format evolves.

**Acceptance Criteria:**
- Automatic detection of older format versions
- Migration pipeline for supported older formats
- User consent and confirmation for migrations
- Backup creation before migration
- Migration success and failure handling

**Technical Notes:**
- Create migration pipeline architecture
- Implement version-specific migration functions
- Support for data transformation and schema updates
- Preserve data integrity during migration
- Rollback capabilities for failed migrations

**Files to create/modify:**
- packages/core/migration/projectMigration.ts (new)
- Migration strategy documentation

**Epic Context:** Story 1 of 3 in File Browser & Project Management Epic`,
    priority: 'low',
    epic: 'File Browser & Project Management',
    story: 'Project File Format & Core Save/Load System',
    phase: 'File Validation & Error Handling',
    step_number: 23
  },
  {
    title: 'Create file size validation and warnings',
    description: `Epic: File Browser & Project Management
Story 1: Project File Format & Core Save/Load System
Phase 5: File Validation & Error Handling - Step 24

**Task Description:**
Implement file size validation to warn users about potentially problematic large files and provide guidance for optimization.

**Acceptance Criteria:**
- File size limits and warning thresholds
- Performance warnings for large projects
- Suggestions for project optimization
- Memory usage estimation and warnings
- Configurable size limits based on device capabilities

**Technical Notes:**
- Implement file size calculation utilities
- Create performance estimation algorithms
- Provide optimization recommendations
- Support for different device profiles (desktop, mobile)
- Progressive loading strategies for large files

**Files to create/modify:**
- packages/core/utils/fileSizeValidation.ts (new)
- Performance monitoring and optimization utilities

**Epic Context:** Story 1 of 3 in File Browser & Project Management Epic`,
    priority: 'low',
    epic: 'File Browser & Project Management',
    story: 'Project File Format & Core Save/Load System',
    phase: 'File Validation & Error Handling',
    step_number: 24
  },
  {
    title: 'Test save/load with various graph complexities',
    description: `Epic: File Browser & Project Management
Story 1: Project File Format & Core Save/Load System
Phase 5: File Validation & Error Handling - Step 25

**Task Description:**
Create comprehensive test suite covering save/load operations with projects of varying complexity to ensure robustness and performance.

**Acceptance Criteria:**
- Test cases for small, medium, and large projects
- Complex graph structures (deep nesting, many connections)
- Edge cases (empty projects, single nodes, maximum complexity)
- Performance benchmarks for different project sizes
- Memory usage testing and optimization validation

**Technical Notes:**
- Create test project generators for different complexities
- Implement automated performance testing
- Create golden file tests for format consistency
- Test cross-browser compatibility
- Validate memory usage and cleanup

**Files to create/modify:**
- packages/core/__tests__/projectManager.test.ts (comprehensive tests)
- Test utilities for project generation

**Epic Context:** Story 1 of 3 in File Browser & Project Management Epic`,
    priority: 'medium',
    epic: 'File Browser & Project Management',
    story: 'Project File Format & Core Save/Load System',
    phase: 'File Validation & Error Handling',
    step_number: 25
  },

  // Phase 6: Performance & Testing
  {
    title: 'Optimize serialization for large graphs (100+ nodes)',
    description: `Epic: File Browser & Project Management
Story 1: Project File Format & Core Save/Load System
Phase 6: Performance & Testing - Step 26

**Task Description:**
Optimize the serialization process to handle large graphs efficiently, targeting projects with 100+ nodes without performance degradation.

**Acceptance Criteria:**
- Serialization performance under 1 second for 100+ node graphs
- Memory usage optimization during serialization
- Streaming serialization for very large projects
- Progress tracking for long-running operations
- Benchmarking and performance monitoring

**Technical Notes:**
- Implement streaming serialization algorithms
- Optimize memory usage and garbage collection
- Use web workers for background processing
- Implement incremental progress reporting
- Performance profiling and optimization

**Files to create/modify:**
- packages/core/projectManager.ts (optimize serialization)
- packages/core/utils/performanceUtils.ts (new)

**Epic Context:** Story 1 of 3 in File Browser & Project Management Epic`,
    priority: 'medium',
    epic: 'File Browser & Project Management',
    story: 'Project File Format & Core Save/Load System',
    phase: 'Performance & Testing',
    step_number: 26
  },
  {
    title: 'Add progress indicators for large file operations',
    description: `Epic: File Browser & Project Management
Story 1: Project File Format & Core Save/Load System
Phase 6: Performance & Testing - Step 27

**Task Description:**
Implement progress indicators and user feedback for save/load operations, especially for large files that may take significant time to process.

**Acceptance Criteria:**
- Progress bars for save and load operations
- Estimated time remaining calculations
- Cancellation support for long-running operations
- Status messages describing current operation phase
- Responsive UI during background operations

**Technical Notes:**
- Implement progress callback systems
- Create progress estimation algorithms
- Support for operation cancellation
- Non-blocking UI updates during operations
- Progress state management in store

**Files to create/modify:**
- packages/core/components/ProgressIndicator.tsx (new)
- Progress tracking integration in ProjectManager

**Epic Context:** Story 1 of 3 in File Browser & Project Management Epic`,
    priority: 'medium',
    epic: 'File Browser & Project Management',
    story: 'Project File Format & Core Save/Load System',
    phase: 'Performance & Testing',
    step_number: 27
  },
  {
    title: 'Test memory usage during save/load operations',
    description: `Epic: File Browser & Project Management
Story 1: Project File Format & Core Save/Load System
Phase 6: Performance & Testing - Step 28

**Task Description:**
Implement comprehensive memory usage testing to ensure save/load operations don't cause memory leaks or excessive memory consumption.

**Acceptance Criteria:**
- Memory usage monitoring during operations
- Detection and prevention of memory leaks
- Memory optimization for large projects
- Browser memory limit handling
- Memory usage reporting and analytics

**Technical Notes:**
- Implement memory monitoring utilities
- Create automated memory leak detection
- Optimize object lifecycle and garbage collection
- Test memory usage across different browsers
- Provide memory usage recommendations

**Files to create/modify:**
- packages/core/__tests__/memoryUsage.test.ts (new)
- Memory monitoring utilities

**Epic Context:** Story 1 of 3 in File Browser & Project Management Epic`,
    priority: 'low',
    epic: 'File Browser & Project Management',
    story: 'Project File Format & Core Save/Load System',
    phase: 'Performance & Testing',
    step_number: 28
  },
  {
    title: 'Validate cross-browser file API compatibility',
    description: `Epic: File Browser & Project Management
Story 1: Project File Format & Core Save/Load System
Phase 6: Performance & Testing - Step 29

**Task Description:**
Ensure file save/load operations work consistently across all major browsers and provide fallbacks for limited environments.

**Acceptance Criteria:**
- Testing on Chrome, Firefox, Safari, Edge
- File API compatibility validation
- Graceful degradation for unsupported features
- Polyfills or fallbacks where necessary
- Consistent user experience across browsers

**Technical Notes:**
- Cross-browser testing automation
- Feature detection and progressive enhancement
- Polyfill implementation for missing APIs
- Browser-specific optimizations
- Compatibility documentation

**Files to create/modify:**
- Cross-browser compatibility tests
- Browser compatibility utilities

**Epic Context:** Story 1 of 3 in File Browser & Project Management Epic`,
    priority: 'medium',
    epic: 'File Browser & Project Management',
    story: 'Project File Format & Core Save/Load System',
    phase: 'Performance & Testing',
    step_number: 29
  },
  {
    title: 'Performance test with complex graphs and large files',
    description: `Epic: File Browser & Project Management
Story 1: Project File Format & Core Save/Load System
Phase 6: Performance & Testing - Step 30

**Task Description:**
Conduct comprehensive performance testing with complex graph structures and large files to validate production readiness and identify optimization opportunities.

**Acceptance Criteria:**
- Performance benchmarks for various project sizes
- Complex graph structure testing (deep nesting, high connectivity)
- Large file handling (multi-MB .psg files)
- Performance regression testing
- Optimization recommendations based on results

**Technical Notes:**
- Create performance test suite with automated benchmarking
- Generate complex test projects programmatically
- Measure save/load times, memory usage, and CPU utilization
- Performance regression detection in CI/CD
- Performance optimization documentation

**Files to create/modify:**
- packages/core/__tests__/performance.test.ts (comprehensive suite)
- Performance benchmarking utilities and reporting

**Epic Context:** Story 1 of 3 in File Browser & Project Management Epic`,
    priority: 'medium',
    epic: 'File Browser & Project Management',
    story: 'Project File Format & Core Save/Load System',
    phase: 'Performance & Testing',
    step_number: 30
  },

  // Story 2: File Browser Interface & Project Management UI - Phase 1: File Browser Component Structure
  {
    title: 'Create /packages/core/components/FileBrowser/ directory',
    description: `Epic: File Browser & Project Management
Story 2: File Browser Interface & Project Management UI
Phase 1: File Browser Component Structure - Step 1

**Task Description:**
Create the foundational directory structure for the file browser components, establishing the organization and architecture for the project management UI.

**Acceptance Criteria:**
- Create packages/core/components/FileBrowser/ directory
- Establish component organization and naming conventions
- Create index.ts for clean exports
- Set up component documentation structure
- Establish TypeScript configuration for the component directory

**Technical Notes:**
- Follow existing component organization patterns in packages/core/components/
- Create proper TypeScript exports and imports
- Establish consistent naming conventions
- Prepare for modular component architecture
- Integration with existing component patterns

**Files to create/modify:**
- packages/core/components/FileBrowser/ (new directory)
- packages/core/components/FileBrowser/index.ts (new)
- packages/core/components/index.ts (update exports)

**Epic Context:** Story 2 of 3 in File Browser & Project Management Epic`,
    priority: 'high',
    epic: 'File Browser & Project Management',
    story: 'File Browser Interface & Project Management UI',
    phase: 'File Browser Component Structure',
    step_number: 1
  },
  {
    title: 'Create FileBrowser.tsx main component',
    description: `Epic: File Browser & Project Management
Story 2: File Browser Interface & Project Management UI
Phase 1: File Browser Component Structure - Step 2

**Task Description:**
Create the main FileBrowser component that will serve as the container for all file browser functionality and project management operations.

**Acceptance Criteria:**
- Main FileBrowser component with clean interface
- Integration with existing React patterns and hooks
- Support for different view modes (list, grid)
- Responsive design foundation
- Integration with project loading from Story 1

**Technical Notes:**
- Follow existing React component patterns in the codebase
- Use TypeScript with proper prop interfaces
- Integrate with graphStore for state management
- Support for future feature expansion
- Accessibility considerations from the start

**Files to create/modify:**
- packages/core/components/FileBrowser/FileBrowser.tsx (new)
- Component props and state interfaces

**Epic Context:** Story 2 of 3 in File Browser & Project Management Epic`,
    priority: 'high',
    epic: 'File Browser & Project Management',
    story: 'File Browser Interface & Project Management UI',
    phase: 'File Browser Component Structure',
    step_number: 2
  },
  {
    title: 'Create ProjectCard.tsx component for project display',
    description: `Epic: File Browser & Project Management
Story 2: File Browser Interface & Project Management UI
Phase 1: File Browser Component Structure - Step 3

**Task Description:**
Create the ProjectCard component to display individual project information including thumbnails, metadata, and quick actions.

**Acceptance Criteria:**
- Project card with thumbnail, name, and metadata display
- Quick action buttons (open, delete, rename, duplicate)
- Hover states and visual feedback
- Support for different card sizes and layouts
- Loading and error states

**Technical Notes:**
- Reusable component for different project display contexts
- Integration with project metadata from Story 1
- Support for thumbnail generation and display
- Consistent with existing UI design patterns
- Event handling for project operations

**Files to create/modify:**
- packages/core/components/FileBrowser/ProjectCard.tsx (new)
- ProjectCard props and styling interfaces

**Epic Context:** Story 2 of 3 in File Browser & Project Management Epic`,
    priority: 'high',
    epic: 'File Browser & Project Management',
    story: 'File Browser Interface & Project Management UI',
    phase: 'File Browser Component Structure',
    step_number: 3
  },
  {
    title: 'Create ProjectList.tsx component for project listing',
    description: `Epic: File Browser & Project Management
Story 2: File Browser Interface & Project Management UI
Phase 1: File Browser Component Structure - Step 4

**Task Description:**
Create the ProjectList component to manage the display of multiple projects using the ProjectCard component with virtualization for performance.

**Acceptance Criteria:**
- Efficient rendering of project lists with virtualization
- Support for different view modes (grid, list, table)
- Sorting and filtering capabilities
- Selection states for bulk operations
- Empty states and loading indicators

**Technical Notes:**
- Use virtualization for large project collections
- Integration with ProjectCard component
- Support for different layout configurations
- Efficient re-rendering with React optimization patterns
- Keyboard navigation and accessibility

**Files to create/modify:**
- packages/core/components/FileBrowser/ProjectList.tsx (new)
- List virtualization and layout utilities

**Epic Context:** Story 2 of 3 in File Browser & Project Management Epic`,
    priority: 'medium',
    epic: 'File Browser & Project Management',
    story: 'File Browser Interface & Project Management UI',
    phase: 'File Browser Component Structure',
    step_number: 4
  },
  {
    title: 'Design file browser layout and responsive structure',
    description: `Epic: File Browser & Project Management
Story 2: File Browser Interface & Project Management UI
Phase 1: File Browser Component Structure - Step 5

**Task Description:**
Design the overall layout structure for the file browser interface ensuring responsive design and integration with the existing application layout.

**Acceptance Criteria:**
- Responsive layout working on desktop, tablet, and mobile
- Integration with existing application chrome
- Flexible layout supporting different screen sizes
- Consistent with existing UI design system
- Accessibility and keyboard navigation support

**Technical Notes:**
- Use CSS Grid/Flexbox for responsive layouts
- Follow existing design patterns and component styles
- Mobile-first responsive design approach
- Integration with existing theme and styling systems
- Support for future layout customization

**Files to create/modify:**
- packages/core/components/FileBrowser/FileBrowser.module.css (styling)
- Responsive layout utilities and breakpoints

**Epic Context:** Story 2 of 3 in File Browser & Project Management Epic`,
    priority: 'medium',
    epic: 'File Browser & Project Management',
    story: 'File Browser Interface & Project Management UI',
    phase: 'File Browser Component Structure',
    step_number: 5
  }
];

console.log(
  'File Browser & Project Management Epic - Development Tasks Created'
);
console.log(`Total tasks in this batch: ${tickets.length}`);
console.log('\nThis includes:');
console.log(
  '- Story 1: Project File Format & Core Save/Load System (Steps 1-30)'
);
console.log(
  '- Story 2: File Browser Interface & Project Management UI (Steps 1-5)'
);
console.log(
  '\nRemaining: Continue with Story 2 Steps 6-30 and Story 3 Steps 1-30 for complete epic'
);

// If we had a working ticket API, we would create the tickets here:
// tickets.forEach(async (ticket, index) => {
//   try {
//     const response = await fetch('http://localhost:8000/api/tickets', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         ...ticket,
//         created_by: 'claude-agent',
//         status: 'UNASSIGNED'
//       })
//     });
//     if (response.ok) {
//       console.log(`✅ Created ticket ${index + 1}: ${ticket.title}`);
//     } else {
//       console.log(`❌ Failed to create ticket ${index + 1}: ${response.statusText}`);
//     }
//   } catch (error) {
//     console.log(`❌ Error creating ticket ${index + 1}: ${error.message}`);
//   }
// });
