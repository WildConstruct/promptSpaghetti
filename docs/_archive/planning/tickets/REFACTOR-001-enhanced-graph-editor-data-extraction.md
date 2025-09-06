# REFACTOR-001: EnhancedGraphEditor Data Extraction and Modularization

## 🎯 Objective

Refactor the massive EnhancedGraphEditor.tsx file (1,400+ lines) into a maintainable, testable, and modular architecture by extracting inline data structures and splitting concerns.

## 📊 Current State Analysis

- **File Size**: 1,400+ lines
- **Primary Issues**:
  - Massive inline node configuration data (lines 1060-1400+)
  - Mixed concerns: UI logic + data definitions + styling
  - Difficult to test individual node configurations
  - Hard to maintain and extend with new node types
  - Poor separation of concerns

## 🎯 Target Architecture

### New File Structure

```
client/src/
├── data/
│   ├── nodeTemplates/
│   │   ├── index.ts                 # Exports all templates
│   │   ├── panelArchetypes.ts       # Panel type configurations
│   │   ├── aestheticInfluences.ts   # Style configurations
│   │   ├── wearLevels.ts            # Wear condition configs
│   │   ├── colorPalettes.ts         # Color scheme configs
│   │   └── types.ts                 # TypeScript interfaces
│   └── graphTemplates/
│       ├── retrogamingDemo.ts       # Complete graph templates
│       └── index.ts
├── components/
│   ├── EnhancedGraphEditor.tsx      # Reduced to ~300 lines
│   └── GraphTemplates/
│       ├── NodeFactory.tsx          # Dynamic node creation
│       ├── TemplateSelector.tsx     # Template selection UI
│       └── GraphPresets.tsx         # Preset graph configs
└── utils/
    ├── nodeUtils.ts                 # Node manipulation utilities
    └── graphValidation.ts           # Graph validation logic
```

### Data Architecture

```typescript
// data/nodeTemplates/types.ts
export interface NodeTemplate {
  id: string;
  type: 'logic' | 'transform' | 'output';
  position: { x: number; y: number };
  data: {
    label: string;
    description: string;
    category: string;
    options: OptionConfig[];
  };
}

export interface OptionConfig {
  label: string;
  value: string;
  weight: number;
  description?: string;
}
```

## 🚀 Implementation Plan

### Phase 1: Data Extraction (Day 1)

1. **Create data structure files**:
   - Extract panel archetypes configuration
   - Extract aesthetic influences data
   - Extract wear levels and color palettes
   - Create TypeScript interfaces

2. **Implement NodeFactory pattern**:
   - Create factory for dynamic node creation
   - Implement template validation
   - Add template registry system

### Phase 2: Component Refactoring (Day 2)

1. **Refactor EnhancedGraphEditor.tsx**:
   - Remove inline data structures
   - Import from new data modules
   - Simplify component logic
   - Extract sub-components

2. **Create supporting components**:
   - TemplateSelector for choosing presets
   - GraphPresets for common configurations
   - NodeConfigPanel for editing templates

### Phase 3: Testing & Validation (Day 3)

1. **Create comprehensive tests**:
   - Unit tests for data structures
   - Component tests for refactored pieces
   - Integration tests for complete workflows

2. **Performance validation**:
   - Ensure no performance regression
   - Validate bundle size impact
   - Test loading times

## 📋 Detailed Tasks

### Task 1: Extract Panel Archetypes Data

- [ ] Create `data/nodeTemplates/panelArchetypes.ts`
- [ ] Move panel configuration data from EnhancedGraphEditor.tsx
- [ ] Add TypeScript interfaces
- [ ] Export structured data

### Task 2: Extract Aesthetic Influences Data

- [ ] Create `data/nodeTemplates/aestheticInfluences.ts`
- [ ] Move aesthetic style configurations
- [ ] Add descriptions and metadata
- [ ] Ensure type safety

### Task 3: Extract Wear Levels Configuration

- [ ] Create `data/nodeTemplates/wearLevels.ts`
- [ ] Move wear condition data
- [ ] Add weight validation
- [ ] Document weight meanings

### Task 4: Extract Color Palettes Data

- [ ] Create `data/nodeTemplates/colorPalettes.ts`
- [ ] Move color scheme definitions
- [ ] Add color validation utilities
- [ ] Support hex/rgb formats

### Task 5: Create NodeFactory System

- [ ] Implement `components/GraphTemplates/NodeFactory.tsx`
- [ ] Add template registration system
- [ ] Create node validation logic
- [ ] Support dynamic node creation

### Task 6: Refactor Main Component

- [ ] Remove inline data from EnhancedGraphEditor.tsx
- [ ] Import from new data modules
- [ ] Extract sub-components
- [ ] Simplify component logic

### Task 7: Create Template Management

- [ ] Implement TemplateSelector component
- [ ] Add GraphPresets component
- [ ] Create template export/import
- [ ] Add preset validation

### Task 8: Testing & Documentation

- [ ] Write unit tests for data modules
- [ ] Create component tests
- [ ] Add integration tests
- [ ] Update documentation

## 🎯 Success Criteria

### Code Quality Metrics

- [ ] EnhancedGraphEditor.tsx reduced to <400 lines
- [ ] All data externalized to dedicated modules
- [ ] 90%+ test coverage on new modules
- [ ] No performance regression (build time, runtime)
- [ ] TypeScript strict mode compliance

### Maintainability Improvements

- [ ] New node types can be added by editing data files only
- [ ] Template configurations are reusable across components
- [ ] Clear separation between data, logic, and presentation
- [ ] Consistent naming and structure patterns

### Developer Experience

- [ ] IntelliSense support for all configurations
- [ ] Clear error messages for invalid data
- [ ] Easy to add new graph templates
- [ ] Comprehensive documentation and examples

## 🔧 Implementation Notes

### Breaking Changes

- **None expected** - All changes should be internal refactoring
- Existing component API should remain unchanged
- Graph data format should be backward compatible

### Performance Considerations

- Use lazy loading for large template sets
- Implement template caching for repeated access
- Consider memoization for expensive template computations
- Monitor bundle size impact

### Migration Strategy

1. Create new data structure alongside existing code
2. Gradually migrate sections while maintaining functionality
3. Add comprehensive tests before removing old code
4. Validate no functional changes through integration tests

## 📚 References

- Current file: `client/src/components/EnhancedGraphEditor.tsx`
- Related components: GraphEditor.tsx, PreviewModal.tsx
- Data patterns: Follow existing node schema patterns
- Testing: Use established testing patterns from `packages/core/__tests__/`

## 🏷️ Labels

- `refactoring`
- `technical-debt`
- `maintainability`
- `architecture`
- `high-priority`

## ⏱️ Estimated Effort

**3 days** (1 senior developer)

- Day 1: Data extraction and structure creation
- Day 2: Component refactoring and new utilities
- Day 3: Testing, validation, and documentation

---

**Created**: 2025-01-26
**Priority**: High
**Component**: EnhancedGraphEditor
**Type**: Technical Debt / Refactoring
