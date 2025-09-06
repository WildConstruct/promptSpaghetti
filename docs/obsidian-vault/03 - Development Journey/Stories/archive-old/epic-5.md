# Epic 5 — Node Inspector Panel & Text Variation System

This document outlines the high-level scope and goals for Epic 5. A more granular task list will be maintained in **plan.md**.

## Epic Goal

Implement a comprehensive right panel inspector that allows users to edit node properties and add text variations for different node types, enabling the creation of dynamic, randomizable text templates with proper grammatical connections.

## Stories & Acceptance Criteria

| ID  | Story                             | Key Acceptance Criteria                                                                                                                                                                                                               |
| --- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 5.1 | Inspector Panel UI Implementation | 1. Right panel appears when node is selected.<br>2. Panel displays appropriate properties based on node type.<br>3. Panel can be resized and collapsed/expanded.<br>4. Inspector updates when different node is selected.             |
| 5.2 | Node Data Model Enhancement       | 1. Extended data models for specialized node types (Subject, Connector, Attribute, Action).<br>2. Storage for multiple text variations per node.<br>3. Properties for node-specific configuration (e.g., target noun for attributes). |
| 5.3 | Variation Entry System            | 1. UI for adding/editing/deleting variations.<br>2. Support for both structured entry and quick entry (comma-separated).<br>3. Visual indication of nodes with multiple variations.<br>4. Drag and drop reordering of variations.     |
| 5.4 | Node Preview & Text Generation    | 1. Preview shows example outputs using current node.<br>2. Updates in real-time when properties change.<br>3. Randomized examples represent possible outputs.                                                                         |
| 5.5 | Node Palette Enhancement          | 1. Updated NodePalette with specialized text node types.<br>2. Visual distinction between different node types.<br>3. Custom node renderers for each type.                                                                            |
| 5.6 | Integration & Testing             | 1. Comprehensive unit tests for all components.<br>2. Integration tests for the full system.<br>3. Performance testing with large variation lists.                                                                                    |

---

## Next Steps

1. Open a draft pull request for this branch (**epic-5**).
2. Break down each story into granular development tasks and update **plan.md** accordingly.
