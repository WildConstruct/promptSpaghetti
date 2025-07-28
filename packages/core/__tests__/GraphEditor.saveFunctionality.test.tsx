/**
 * Tests for GraphEditor Save Functionality - Story 6.1
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { GraphEditor } from '../GraphEditor';
import { useGraphStore } from '../graphStore';

// Mock the graph store
jest.mock('../graphStore', () => ({)
  useGraphStore: jest.fn<unknown[], unknown>()
}));

// Mock external dependencies
jest.mock('reactflow', () => ({)
  ReactFlowProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  ReactFlow: () => <div data-testid="react-flow">ReactFlow</div>,
  Background: () => <div>Background</div>,
  Controls: () => <div>Controls</div>,
  MiniMap: () => <div>MiniMap</div>,
  useReactFlow: () => ({),
    fitView: jest.fn<unknown[], unknown>(),
    setNodes: jest.fn<unknown[], unknown>(),
    setEdges: jest.fn<unknown[], unknown>()
  }),
  useViewport: () => ({ x: 0, y: 0, zoom: 1 }),
  addEdge: jest.fn<unknown[], unknown>()
}));

// Mock other components
jest.mock('../components/Inspector', () => ({)
  InspectorPanel: () => <div data-testid="inspector-panel">Inspector</div>,
  SmoothInspectorPanel: () => <div data-testid="smooth-inspector-panel">Smooth Inspector</div>,
}));
jest.mock('../Palette', () => ({)
  Palette: () => <div data-testid="palette">Palette</div>,
}));

// Mock all heavy components to avoid dependency issues
jest.mock('../components/ExtensionManager/ExtensionManagerPanel', () => ({)
  ExtensionManagerPanel: () => <div>ExtensionManager</div>,
}));
jest.mock('../ResponsiveCorrectionsPanel', () => ({)
  ResponsiveCorrectionsPanel: () => <div>ResponsiveCorrectionsPanel</div>,
}));
jest.mock('../components/CorrectionsStatsDashboard', () => ({)
  CorrectionsStatsDashboard: () => <div>CorrectionsStatsDashboard</div>,
}));
jest.mock('../correctionsStore', () => ({)
  useCorrectionsEnabled: () => true,
}));
jest.mock('../palette/TabbedPalette', () => ({)
  TabbedPalette: () => <div>TabbedPalette</div>,
}));
jest.mock('../components/NodeRenderer', () => ({)
  NodeRenderer: () => <div>NodeRenderer</div>,
}));
jest.mock('../components/VariablePortNodeRenderer', () => ({)
  VariablePortNodeRenderer: () => <div>VariablePortNodeRenderer</div>,
}));
jest.mock('../components/RestorePrompt', () => ({)
  RestorePrompt: () => <div>RestorePrompt</div>,
}));
jest.mock('../components/EncryptionStatus', () => ({)
  EncryptionState: {},
  EncryptionAlgorithm: {}
}));
jest.mock('../nodeSchemas', () => ({)
  nodeSchemas: {}
}));
jest.mock('../utils/canvasOptimization', () => ({)
  useCanvasOptimization: () => ({),
    optimizer: {},
    metrics: { fps: 60, visibleNodes: 10 },
    isPerformanceGood: true,
  }),
  CanvasOptimizer: {}
}));
jest.mock('../utils/smoothAnimations', () => ({)
  globalAnimationManager: {}
}));
jest.mock('../components/LoadingStates/ProfessionalSpinner', () => ({)
  ProfessionalSpinner: () => <div>ProfessionalSpinner</div>,
}));
jest.mock('../components/Nodes/SmoothNodeWrapper', () => ({)
  SmoothNodeWrapper: () => <div>SmoothNodeWrapper</div>,
}));
jest.mock('../components/Demo/DemoModeManager', () => ({)
  DemoModeManager: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));
jest.mock('../components/Demo/DemoPerformanceTester', () => ({)
  DemoPerformanceTester: () => <div>DemoPerformanceTester</div>,
}));

// Mock all the Epic 8 components
jest.mock('../components/GraphOptimization', () => ({)
  GraphAnalysisPanel: () => <div>GraphAnalysisPanel</div>,
  PerformanceMonitor: () => <div>PerformanceMonitor</div>,
  OptimizationControls: () => <div>OptimizationControls</div>,
}));
jest.mock('../components/StickyNotes/StickyNotesManager', () => ({)
  StickyNotesManager: () => <div>StickyNotesManager</div>,
}));
jest.mock('../components/NodeLabels/NodeLabelsManager', () => ({)
  NodeLabelsManager: () => <div>NodeLabelsManager</div>,
}));
jest.mock('../components/RegionGroups/RegionGroupsManager', () => ({)
  RegionGroupsManager: () => <div>RegionGroupsManager</div>,
}));
jest.mock('../components/Annotations/ConnectionAnnotationsLayer', () => ({)
  ConnectionAnnotationsLayer: () => <div>ConnectionAnnotationsLayer</div>,
}));
jest.mock('../components/Preview/RealTimePreviewPanel', () => ({)
  RealTimePreviewPanel: () => <div>RealTimePreviewPanel</div>,
}));
jest.mock('../components/Preview/IndividualResultManager', () => ({)
  IndividualResultManager: () => <div>IndividualResultManager</div>,
}));
jest.mock('../components/DirectorToolbar/DirectorPreviewToolbar', () => ({)
  DirectorPreviewToolbar: () => <div>DirectorPreviewToolbar</div>,
}));
jest.mock('../components/Modal/SettingsModal', () => ({)
  SettingsModal: () => <div>SettingsModal</div>,
}));
jest.mock('../components/ContextualHelp', () => ({)
  ContextualHelpSystem: () => <div>ContextualHelpSystem</div>,
  helpContentManager: {,
    updateProgress: jest.fn<unknown[], unknown>(),
    markContentViewed: jest.fn<unknown[], unknown>()
  }
}));
jest.mock('../components/TemplateDialogs/SaveTemplateDialog', () => ({)
  SaveTemplateDialog: () => <div>SaveTemplateDialog</div>,
}));
jest.mock('../components/TemplateDialogs/TemplateBrowser', () => ({)
  TemplateBrowser: () => <div>TemplateBrowser</div>,
}));
jest.mock('../components/ProjectDialogs/ExportBundleDialog', () => ({)
  ExportBundleDialog: () => <div>ExportBundleDialog</div>,
  default: () => <div>ExportBundleDialog</div>,
}));
jest.mock('../validation', () => ({)
  ValidationError: {}
}));
jest.mock('../components/StatusBar', () => ({)
  StatusBar: ({ onSaveProject, onLoadProject, onNewProject }: unknown) => ()
    <div data-testid="status-bar">
      <button data-testid="save-button" onClick={onSaveProject}>Save</button>
      <button data-testid="load-button" onClick={onLoadProject}>Load</button>
      <button data-testid="new-button" onClick={onNewProject}>New</button>
    </div>
}));
jest.mock('../components/ProjectDialogs/SaveProjectDialog', () => ({)
  SaveProjectDialog: ({ isOpen, onClose, onSave }: unknown) => 
    isOpen ? ()
      <div data-testid="save-dialog">
        <button data-testid="save-dialog-close" onClick={onClose}>Close</button>
        <button 
          data-testid="save-dialog-submit" 
          onClick={() => onSave?.({ success: true })}
        >
          Save
        </button>
      </div>
    ) : null,
  default: ({ isOpen, onClose, onSave }: unknown) => 
    isOpen ? ()
      <div data-testid="save-dialog">
        <button data-testid="save-dialog-close" onClick={onClose}>Close</button>
        <button 
          data-testid="save-dialog-submit" 
          onClick={() => onSave?.({ success: true })}
        >
          Save
        </button>
      </div>
    ) : null
}));
jest.mock('../components/ProjectDialogs/LoadProjectDialog', () => ({)
  LoadProjectDialog: ({ isOpen, onClose, onLoad }: unknown) => 
    isOpen ? ()
      <div data-testid="load-dialog">
        <button data-testid="load-dialog-close" onClick={onClose}>Close</button>
        <button 
          data-testid="load-dialog-submit" 
          onClick={() => onLoad?.({ success: true })}
        >
          Load
        </button>
      </div>
    ) : null,
  default: ({ isOpen, onClose, onLoad }: unknown) => 
    isOpen ? ()
      <div data-testid="load-dialog">
        <button data-testid="load-dialog-close" onClick={onClose}>Close</button>
        <button 
          data-testid="load-dialog-submit" 
          onClick={() => onLoad?.({ success: true })}
        >
          Load
        </button>
      </div>
    ) : null
}));

// Mock all the other heavy dependencies
jest.mock('../PreviewModal', () => ({)
  PreviewModal: () => <div>PreviewModal</div>,
}));
jest.mock('../usePreviewSeeds', () => ({)
  usePreviewSeeds: () => ({),
    runPreview: jest.fn<unknown[], unknown>(),
    previewResults: [],
    previewLoading: false,
    previewError: null,
    cancelPreview: jest.fn<unknown[], unknown>()
  })
}));
jest.mock('../hooks/useValidation', () => ({)
  useValidation: () => ({),
    errors: [],
    validateGraph: jest.fn<unknown[], unknown>()
  })
}));
jest.mock('../hooks/useAutosave', () => ({)
  useAutosave: () => ({),
    showRestorePrompt: false,
    restoreDraft: jest.fn<unknown[], unknown>(),
    setShowRestorePrompt: jest.fn<unknown[], unknown>()
  })
}));
jest.mock('../hooks/useNodeUtils', () => ({)
  useNodeUtils: () => ({),
    addNode: jest.fn<unknown[], unknown>(),
    updateNode: jest.fn<unknown[], unknown>(),
    removeNode: jest.fn<unknown[], unknown>()
  })
}));
const mockUseGraphStore = useGraphStore as jest.MockedFunction<typeof useGraphStore>;
describe('GraphEditor Save Functionality', () => {
  const mockGraphStoreState = {
    nodes: [],
    edges: [],
    currentProject: null,
    hasUnsavedChanges: false,
    newProject: jest.fn<unknown[], unknown>(),
    markProjectModified: jest.fn<unknown[], unknown>(),
    saveAsTemplate: jest.fn<unknown[], unknown>(),
    applyTemplate: jest.fn<unknown[], unknown>(),
    // Add other required store properties
    stickyNotes: [],
    annotations: {,
      stickyNotes: [],
      nodeLabels: {},
      nodeLabelConfigs: {},
      regionGroups: [],
      connectionLabels: [],
      connectionAnnotations: [],
      labelPreferences: {},
      regionGroupPreferences: {},
      connectionAnnotationPreferences: {},
      metadata: {,
        author: 'Test',
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        version: '1.0.0',
      }
    },
    projectSettings: {,
      autoSave: true,
      backupInterval: 5,
      maxBackups: 10,
    },
    isAutoSaveEnabled: true,
    setNodes: jest.fn<unknown[], unknown>(),
    setEdges: jest.fn<unknown[], unknown>(),
    addNode: jest.fn<unknown[], unknown>(),
    addEdge: jest.fn<unknown[], unknown>(),
    updateNode: jest.fn<unknown[], unknown>(),
    addVariation: jest.fn<unknown[], unknown>(),
    removeVariation: jest.fn<unknown[], unknown>(),
    updateVariation: jest.fn<unknown[], unknown>(),
    reorderVariations: jest.fn<unknown[], unknown>(),
    duplicateNode: jest.fn<unknown[], unknown>(),
    deleteNode: jest.fn<unknown[], unknown>(),
    setStickyNotes: jest.fn<unknown[], unknown>(),
    addStickyNote: jest.fn<unknown[], unknown>(),
    updateStickyNote: jest.fn<unknown[], unknown>(),
    deleteStickyNote: jest.fn<unknown[], unknown>(),
    setNodeLabelConfigs: jest.fn<unknown[], unknown>(),
    addNodeLabelConfig: jest.fn<unknown[], unknown>(),
    updateNodeLabelConfig: jest.fn<unknown[], unknown>(),
    deleteNodeLabelConfig: jest.fn<unknown[], unknown>(),
    setLabelPreferences: jest.fn<unknown[], unknown>(),
    setRegionGroups: jest.fn<unknown[], unknown>(),
    addRegionGroup: jest.fn<unknown[], unknown>(),
    updateRegionGroup: jest.fn<unknown[], unknown>(),
    deleteRegionGroup: jest.fn<unknown[], unknown>(),
    setRegionGroupPreferences: jest.fn<unknown[], unknown>(),
    setConnectionLabels: jest.fn<unknown[], unknown>(),
    addConnectionLabel: jest.fn<unknown[], unknown>(),
    updateConnectionLabel: jest.fn<unknown[], unknown>(),
    removeConnectionLabel: jest.fn<unknown[], unknown>(),
    setConnectionAnnotations: jest.fn<unknown[], unknown>(),
    addConnectionAnnotation: jest.fn<unknown[], unknown>(),
    updateConnectionAnnotation: jest.fn<unknown[], unknown>(),
    removeConnectionAnnotation: jest.fn<unknown[], unknown>(),
    setConnectionAnnotationPreferences: jest.fn<unknown[], unknown>(),
    saveProject: jest.fn<unknown[], unknown>(),
    loadProject: jest.fn<unknown[], unknown>(),
    saveProjectToServer: jest.fn<unknown[], unknown>(),
    loadProjectFromServer: jest.fn<unknown[], unknown>(),
    updateProjectOnServer: jest.fn<unknown[], unknown>(),
    deleteProjectFromServer: jest.fn<unknown[], unknown>(),
    listUserProjects: jest.fn<unknown[], unknown>(),
    setCurrentProject: jest.fn<unknown[], unknown>(),
    updateProjectSettings: jest.fn<unknown[], unknown>(),
    markProjectSaved: jest.fn<unknown[], unknown>(),
    getGraphData: jest.fn<unknown[], unknown>(),
    loadGraphData: jest.fn<unknown[], unknown>(),
    getTemplateCompatibleData: jest.fn<unknown[], unknown>()
  };
  beforeEach(() => {
    mockUseGraphStore.mockReturnValue(mockGraphStoreState as unknown);
    jest.clearAllMocks();
  });
  test('renders save button in status bar', () => {
    render(<GraphEditor initialNodes={[]} initialEdges={[]} />);
    expect(screen.getByTestId('save-button')).toBeInTheDocument();
  });
  test('opens save dialog when save button is clicked', async () => {
    render(<GraphEditor initialNodes={[]} initialEdges={[]} />);
    const saveButton = screen.getByTestId('save-button');
    fireEvent.click(saveButton);
    await waitFor(() => {
      expect(screen.getByTestId('save-dialog')).toBeInTheDocument();
    });
  });
  test('opens load dialog when load button is clicked', async () => {
    render(<GraphEditor initialNodes={[]} initialEdges={[]} />);
    const loadButton = screen.getByTestId('load-button');
    fireEvent.click(loadButton);
    await waitFor(() => {
      expect(screen.getByTestId('load-dialog')).toBeInTheDocument();
    });
  });
  test('handles keyboard shortcut Ctrl+S to save', async () => {
    render(<GraphEditor initialNodes={[]} initialEdges={[]} />);
    // Simulate Ctrl+S
    fireEvent.keyDown(document, {)
      key: 's',
      ctrlKey: true,
      preventDefault: jest.fn<unknown[], unknown>()
    });
    await waitFor(() => {
      expect(screen.getByTestId('save-dialog')).toBeInTheDocument();
    });
  });
  test('handles keyboard shortcut Cmd+S to save on Mac', async () => {
    render(<GraphEditor initialNodes={[]} initialEdges={[]} />);
    // Simulate Cmd+S (metaKey)
    fireEvent.keyDown(document, {)
      key: 's',
      metaKey: true,
      preventDefault: jest.fn<unknown[], unknown>()
    });
    await waitFor(() => {
      expect(screen.getByTestId('save-dialog')).toBeInTheDocument();
    });
  });
  test('handles keyboard shortcut Ctrl+O to load', async () => {
    render(<GraphEditor initialNodes={[]} initialEdges={[]} />);
    // Simulate Ctrl+O
    fireEvent.keyDown(document, {)
      key: 'o',
      ctrlKey: true,
      preventDefault: jest.fn<unknown[], unknown>()
    });
    await waitFor(() => {
      expect(screen.getByTestId('load-dialog')).toBeInTheDocument();
    });
  });
  test('prevents default browser behavior for save shortcuts', async () => {
    const preventDefault = jest.fn<unknown[], unknown>();
    render(<GraphEditor initialNodes={[]} initialEdges={[]} />);
    fireEvent.keyDown(document, {)
      key: 's',
      ctrlKey: true,
      preventDefault
    });
    expect(preventDefault).toHaveBeenCalled();
  });
  test('closes save dialog when close button is clicked', async () => {
    render(<GraphEditor initialNodes={[]} initialEdges={[]} />);
    // Open save dialog
    const saveButton = screen.getByTestId('save-button');
    fireEvent.click(saveButton);
    await waitFor(() => {
      expect(screen.getByTestId('save-dialog')).toBeInTheDocument();
    });
    // Close dialog
    const closeButton = screen.getByTestId('save-dialog-close');
    fireEvent.click(closeButton);
    await waitFor(() => {
      expect(screen.queryByTestId('save-dialog')).not.toBeInTheDocument();
    });
  });
  test('handles successful save operation', async () => {
    render(<GraphEditor initialNodes={[]} initialEdges={[]} />);
    // Open save dialog
    const saveButton = screen.getByTestId('save-button');
    fireEvent.click(saveButton);
    await waitFor(() => {
      expect(screen.getByTestId('save-dialog')).toBeInTheDocument();
    });
    // Submit save
    const submitButton = screen.getByTestId('save-dialog-submit');
    fireEvent.click(submitButton);
    // Dialog should close on successful save
    await waitFor(() => {
      expect(screen.queryByTestId('save-dialog')).not.toBeInTheDocument();
    });
  });
  test('ignores Alt+S shortcut for settings modal', async () => {
    render(<GraphEditor initialNodes={[]} initialEdges={[]} />);
    // Simulate Alt+S (should not open save dialog)
    fireEvent.keyDown(document, {)
      key: 's',
      altKey: true,
      preventDefault: jest.fn<unknown[], unknown>()
    });
    // Save dialog should not open
    expect(screen.queryByTestId('save-dialog')).not.toBeInTheDocument();
  });
});