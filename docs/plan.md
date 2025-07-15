# Sprint Plan – PromptScape Randomizer Graph

_Date: 2025-07-14_

This plan captures Epic-2 delivery items plus the immediate **Must-Fix** actions identified in the Product-Owner validation report.  Use the check-boxes to track progress during the sprint.

---
## 1. Epic 2 – Editor MVP (Graph Authoring)
| # | Story | Owner | Status |
|---|-------|-------|--------|
| 2.1 | **Core Node Library UI** – palette shows 6 node types, drag-add to canvas | James | [x] Done |
| 2.2 | **Node Connections & Validation** – draw edges, highlight invalid wiring | James | [x] Done |
| 2.3 | **Node Inspector Forms** – schema-driven sidebar editing |  | [ ] Todo |
| 2.4 | **Preview-5 Modal** – executor runs 5 seeds, modal shows outputs |  | [ ] Todo |
| 2.5 | **Graph JSON Autosave** – draft saved to `localStorage`, restore prompt |  | [ ] Todo |

> **Note:** break each story into tasks in your issue tracker as needed (UI, backend, tests, docs).

## Epic 5 – Node Inspector Panel & Text Variation System

**Epic Goal**: Implement a comprehensive right panel inspector that allows users to edit node properties and add text variations for different node types, enabling the creation of dynamic, randomizable text templates with proper grammatical connections.

| # | Story | Owner | Status |
|---|-------|-------|--------|
| 5.1 | **Inspector Panel UI Implementation** – Right panel with node type-specific editors | James | [ ] Todo |
| 5.2 | **Node Data Model Enhancement** – Extend node data model for specialized types | James | [ ] Todo |
| 5.3 | **Variation Entry System** – UI for managing multiple text variations | James | [ ] Todo |
| 5.4 | **Node Preview & Text Generation** – Live preview of randomized outputs | James | [ ] Todo |
| 5.5 | **Node Palette Enhancement** – Add specialized text node types | James | [ ] Todo |
| 5.6 | **Integration & Testing** – Comprehensive tests for all components | James | [ ] Todo |

### Story 5.1 – Inspector Panel UI Implementation Subtasks
- [ ] Create `components/Inspector/InspectorPanel.tsx` container component
- [ ] Implement panel resize and collapse/expand functionality
- [ ] Create section components for common properties, node-specific properties, and preview
- [ ] Add selection tracking to ReactFlow in App.tsx
- [ ] Implement collapsible section headers with toggle controls
- [ ] Add CSS for inspector panel styling with responsive design
- [ ] Implement multi-node selection handling
- [ ] Add panel visibility toggle in main UI
- [ ] Write unit tests for Inspector components

### Story 5.2 – Node Data Model Enhancement Subtasks
- [ ] Create `types/NodeTypes.ts` with extended node data interfaces
- [ ] Define BaseNodeData interface with common properties
- [ ] Implement specialized interfaces for Subject, Connector, Attribute, and Action nodes
- [ ] Add node update functionality to App.tsx
- [ ] Create helper utilities for node data operations
- [ ] Add serialization/deserialization for extended node data
- [ ] Update existing node components to use new data model
- [ ] Write unit tests for data model operations

### Story 5.3 – Variation Entry System Subtasks
- [ ] Create reusable `VariationList.tsx` component
- [ ] Implement inline editing for list items
- [ ] Add quick entry via comma-separated text input
- [ ] Implement drag-and-drop reordering using react-dnd
- [ ] Add delete and add functionality for variations
- [ ] Create visual indicator for nodes with variations
- [ ] Implement validation for variation entries
- [ ] Write unit tests for variation components

### Story 5.4 – Node Preview & Text Generation Subtasks
- [ ] Create `Preview.tsx` component for displaying example outputs
- [ ] Implement text randomization engine for node preview
- [ ] Add live updates when node properties change
- [ ] Create preview settings controls (number of examples, seed)
- [ ] Implement preview refresh functionality
- [ ] Add visual highlighting for variations used in preview
- [ ] Write unit tests for preview component

### Story 5.5 – Node Palette Enhancement Subtasks
- [ ] Update NodePalette.tsx with specialized text node types
- [ ] Create custom renderers for each node type
- [ ] Add visual indicators to distinguish node types
- [ ] Update drag-and-drop functionality for new node types
- [ ] Add tooltips with node type descriptions
- [ ] Create node type icons/visuals
- [ ] Write unit tests for enhanced palette

### Story 5.6 – Integration & Testing Subtasks

#### Unit Tests
- [ ] **InspectorPanel Component Tests** (`__tests__/components/Inspector/InspectorPanel.test.tsx`)
  - [ ] Test rendering with no selected node
  - [ ] Test rendering with selected node
  - [ ] Test panel collapse/expand functionality
  - [ ] Test section collapse/expand functionality

- [ ] **VariationList Component Tests** (`__tests__/components/Inspector/VariationList.test.tsx`)
  - [ ] Test rendering empty variation list
  - [ ] Test adding new variations
  - [ ] Test removing variations
  - [ ] Test editing variations
  - [ ] Test comma-separated quick entry
  - [ ] Test validation of entries

- [ ] **Node Type Editors Tests**
  - [ ] Test Subject node editor (`__tests__/components/Inspector/SubjectEditor.test.tsx`)
  - [ ] Test Action node editor (`__tests__/components/Inspector/ActionEditor.test.tsx`)
  - [ ] Test Attribute node editor (`__tests__/components/Inspector/AttributeEditor.test.tsx`)
  - [ ] Test Connector node editor (`__tests__/components/Inspector/ConnectorEditor.test.tsx`)

- [ ] **Preview Component Tests** (`__tests__/components/Inspector/Preview.test.tsx`)
  - [ ] Test rendering with no preview data
  - [ ] Test rendering with valid preview data
  - [ ] Test refresh functionality
  - [ ] Test seed change functionality

- [ ] **Node Data Model Tests** (`__tests__/types/NodeTypes.test.ts`)
  - [ ] Test base node data operations
  - [ ] Test specialized node data operations
  - [ ] Test serialization/deserialization

#### Integration Tests

- [ ] **ReactFlow with Inspector Integration** (`__tests__/integration/FlowInspectorIntegration.test.tsx`)
  - [ ] Test node selection updates inspector
  - [ ] Test inspector changes update node data
  - [ ] Test multiple node selection handling

- [ ] **Node Type and Palette Integration** (`__tests__/integration/NodePaletteIntegration.test.tsx`)
  - [ ] Test drag-and-drop of specialized nodes
  - [ ] Test node creation with proper default data

- [ ] **Variation System Integration** (`__tests__/integration/VariationSystemIntegration.test.tsx`)
  - [ ] Test variation changes reflect in preview
  - [ ] Test variation indicators on nodes

#### End-to-End Tests

- [ ] **Core User Flows** (`__tests__/e2e/NodeInspectorFlows.test.tsx`)
  - [ ] Test complete flow: create node → select → edit in inspector → preview
  - [ ] Test multiple node editing workflow
  - [ ] Test variation system with preview generation

#### Performance Tests

- [ ] **Large Graph Performance** (`__tests__/performance/LargeGraphPerformance.test.ts`)
  - [ ] Test rendering performance with 50+ nodes
  - [ ] Test inspector performance with large variation lists (100+ variations)
  - [ ] Test preview generation with complex graphs

#### Visual Regression Tests

- [ ] **Inspector Panel Visual Tests** (`__tests__/visual/InspectorVisuals.test.tsx`)
  - [ ] Test responsive design at different viewport sizes
  - [ ] Test theme consistency across components
  - [ ] Test animations and transitions

#### Bug Fix Verification Tests

- [ ] **Node Selection Issue Tests** (`__tests__/bugfix/NodeSelectionFixes.test.tsx`)
  - [ ] Test node selection highlights correctly
  - [ ] Test cursor style changes appropriately for different interactions
  - [ ] Test node position when dropped from palette

#### Test Infrastructure

- [ ] Set up Jest configuration for component testing
- [ ] Configure React Testing Library helpers
- [ ] Set up test coverage reporting with threshold goals
- [ ] Create test data fixtures for various node types and variations
- [ ] Document mocking strategy for ReactFlow components

---

_This file is maintained by **Sarah – Product Owner**.  Please update statuses daily._

---

## 🔄 Current Sprint Progress – 2025-07-15

| Area | Update |
|------|--------|
| **ReactFlow Mocking** | All inline mocks removed; single manual mock (`client/src/__tests__/__mocks__/reactFlowMock.tsx`) in use. |
| **TypeScript Errors** | Majority resolved. Remaining errors isolated to early lines of the shared mock (obsolete snippet) and `NodeTypes` proxy typing. |
| **Test Runs** | 39 / 43 tests green. 12 suites fail at compile-time, not runtime. Coverage ~29%. |
| **Work in Progress** | ① Delete obsolete snippet in mock (*lines 80-100*) and tighten jest.fn signatures.<br>② Fix `NodeTypes` proxy return type in `App.tsx`.<br>③ Re-run `npm test` and raise coverage. |
| **Next QA Tasks** | • Validate bug-fix tests (`NodeSelectionFixes`) once mock compiles.<br>• Expand integration tests for inspector panel once compile is clean. |

> *Logged by Quinn – QA/Dev on 2025-07-15*
