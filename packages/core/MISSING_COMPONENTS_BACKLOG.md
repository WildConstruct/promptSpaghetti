# Missing Components Backlog

This document tracks components that are exported in `packages/core/index.ts` but do not exist in the codebase. These need investigation and implementation.

## Status: NEEDS INVESTIGATION

### Missing Component Directories

#### CommandPalette Components (Professional Interface Integration)
**Status**: Directory `components/CommandPalette/` does not exist  
**Affected Exports**:
- `ProfessionalIntegration` from `./components/CommandPalette/ProfessionalIntegration`
- `CommandPalette` from `./components/CommandPalette/CommandPalette`  
- `UndoRedoManager` from `./components/CommandPalette/UndoRedoManager`
- `MultiSelectionManager` from `./components/CommandPalette/MultiSelectionManager`
- `AutosaveManager` from `./components/CommandPalette/AutosaveManager`
- `KeyboardShortcutsManager` from `./components/CommandPalette/KeyboardShortcutsManager`

**Impact**: These are described in CLAUDE.md as "Professional Features (Phase 2 Complete)" but the components don't exist.

#### FileManagement Components (Epic 3)  
**Status**: Directory `components/FileManagement/` does not exist  
**Affected Exports**:
- `IntegratedFileBrowser` from `./components/FileManagement/IntegratedFileBrowser`
- `RecentFilesPanel` from `./components/FileManagement/RecentFilesPanel`
- `WorkspaceManager` from `./components/FileManagement/WorkspaceManager`
- Types: `IntegratedFileBrowserProps`, `RecentFilesPanelProps`, `WorkspaceManagerProps`, `WorkspaceSession`

#### InlineEditor Components (Epic 4)
**Status**: Directory `components/InlineEditor/` does not exist  
**Affected Exports**: 
- `InlineNodeEditor`, `InlineEditorManager`, `InlineEditorProvider`, `InlineEditableNode`
- `GraphEditorWithInlineEditing`, `useInlineEditor`, `useInlineEditorContext`
- `useGraphWithInlineEditing`, `createInlineEditingGraph`, `withInlineEditing`
- `RichTextEditor`, `NodeSpecificRichEditor`, `WeightedChoiceEditor`, `ConcatEditor`
- `VariableEditor`, `ConditionalEditor`, `OutputEditor`, `BatchNodeEditor`
- Types: `InlineNodeEditorProps`, `InlineEditorManagerProps`, `InlineEditableNodeProps`, `GraphEditorWithInlineEditingProps`

**Impact**: Epic 4 is marked as "Complete Implementation ✅" but components don't exist.

### Missing Root Components

#### Core Components
**Status**: Root-level files missing  
**Affected Exports**:
- `GraphEditor` from `./GraphEditor` (attempted to use Epic1GraphEditor but has import.meta issues)
- `Palette` from `./Palette` (attempted to use NodePalette)
- `PreviewModal` from `./PreviewModal` (attempted to use PreviewPanel)

### Existing Components That Work
- `FlippableNode` from `./components/nodes/FlippableNode` ✅
- `MetadataDisplay` from `./components/nodes/MetadataDisplay` ✅ (after creating missing metadata subcomponents)
- `nodeSchemas` from `./nodeSchemas` ✅
- `useGraphStore` from `./graphStore` ✅
- `ProfessionalMenuBar` from `./components/MenuBar/ProfessionalMenuBar` ✅ (exists)

## Immediate Actions Needed

1. **Audit CLAUDE.md Claims**: Several features claimed as "COMPLETE" don't have implementations
2. **Create Missing Components**: Either implement or remove from exports
3. **Fix Jest Compatibility**: Epic1GraphEditor uses import.meta which breaks Jest tests
4. **Update Documentation**: Align CLAUDE.md with actual codebase state

## Test Impact

The Epic2 integration test cannot run because importing from `index.ts` fails due to these missing components.

**Generated**: {new Date().toISOString()} during Epic2 QA process