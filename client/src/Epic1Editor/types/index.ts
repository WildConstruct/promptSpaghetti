import { Node, Edge } from 'reactflow';

/**
 * Props for the Epic1 Graph Editor component
 */
export interface Epic1GraphEditorProps {
  key?: string | number;
  initialNodes: Node[];
  initialEdges: Edge[];
  showPreview?: boolean;
  showAssetLibrary?: boolean;
  assetLibraryPosition?: 'left' | 'right';
  onNodesChange: (nodes: Node[]) => void;
  onEdgesChange: (edges: Edge[]) => void;
}

/**
 * Props for the Professional Menu Bar component
 */
export interface ProfessionalMenuBarProps {
  onNew: () => void;
  onOpen: () => void;
  onSave: () => void;
  onSaveAs: () => void;
  onQuit: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onAbout: () => void;
  onValidateGraph: () => void;
  onConsoleToggle: () => void;
  canUndo: boolean;
  canRedo: boolean;
  hasSelection: boolean;
  nodes: Node[];
  edges: Edge[];
}

/**
 * Superset of props actually passed by Epic1EditorContainer to the Menu Bar.
 * This avoids type mismatch with the external component while keeping type safety here.
 */
export interface Epic1MenuBarProps {
  // File
  onNew: () => void;
  onOpen: () => void;
  onSave: () => void;
  onSaveAs: () => void;
  onImport: () => void;
  onExport: (format: 'json' | 'png' | 'svg' | 'pdf') => void;
  onQuit: () => void;
  // Edit
  onUndo: () => void;
  onRedo: () => void;
  onCut: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onSelectAll: () => void;
  onFind: () => void;
  onPreferences: () => void;
  // View
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onToggleGrid: () => void;
  onToggleMinimap: () => void;
  onToggleInspector: () => void;
  onToggleAssetLibrary: () => void;
  onToggleFullscreen: () => void;
  onToggleTheme: () => void;
  // Debug
  onDevTools: () => void;
  onValidateGraph: () => void;
  onPerformanceMonitor: () => void;
  onConsoleToggle: () => void;
  // Help
  onDocumentation: () => void;
  onKeyboardShortcuts: () => void;
  onAbout: () => void;
  onSupport: () => void;
  onReportBug: () => void;
  // State
  canUndo: boolean;
  canRedo: boolean;
  hasSelection: boolean;
  nodes: Node[];
  edges: Edge[];
  gridVisible: boolean;
  minimapVisible: boolean;
  inspectorVisible: boolean;
  assetLibraryVisible: boolean;
  theme: 'light' | 'dark' | 'cinema';
}

/**
 * Toast notification types
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

/**
 * File data structure for graph import/export
 */
export interface GraphFileData {
  nodes: Node[];
  edges: Edge[];
  version: string;
  timestamp: string;
  name?: string;
}

/**
 * Node data types for different node types
 */
export interface BaseNodeData {
  nodeType: string;
  label?: string;
  frameEdge?: 'top' | 'right' | 'bottom' | 'left';
}

export interface TextBlockNodeData extends BaseNodeData {
  nodeType: 'textBlock';
  content: string;
  text: string;
}

export interface WeightedChoiceOption {
  id?: string;
  text: string;
  weight: number;
  hasBranch?: boolean;
}

export interface WeightedChoiceNodeData extends BaseNodeData {
  nodeType: 'weightedChoice';
  options: WeightedChoiceOption[];
}

export interface OutputNodeData extends BaseNodeData {
  nodeType: 'output';
  outputName: string;
}

export type NodeData = TextBlockNodeData | WeightedChoiceNodeData | OutputNodeData;

/**
 * Type guard functions
 */
export const isTextBlockNode = (data: BaseNodeData): data is TextBlockNodeData => {
  return data.nodeType === 'textBlock';
};

export const isWeightedChoiceNode = (data: BaseNodeData): data is WeightedChoiceNodeData => {
  return data.nodeType === 'weightedChoice';
};

export const isOutputNode = (data: BaseNodeData): data is OutputNodeData => {
  return data.nodeType === 'output';
};