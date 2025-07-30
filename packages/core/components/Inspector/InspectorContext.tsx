import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Node } from 'reactflow';
import { ZodSchema } from 'zod';
interface InspectorState {
  selectedNode: Node | null;
  selectedSchema: ZodSchema<unknown> | null;
  panelWidth: number;
  panelCollapsed: boolean;
  panelVisible: boolean;
}

interface InspectorActions {
  setSelectedNode: (node: Node | null) => void;
  setSelectedSchema: (schema: ZodSchema<unknown> | null) => void;
  setPanelWidth: (width: number) => void;
  setPanelCollapsed: (collapsed: boolean) => void;
  setPanelVisible: (visible: boolean) => void;
  updateNodeData: (nodeId: string, data: Record<string, unknown>) => void;
}

interface InspectorContextValue extends InspectorState, InspectorActions {}
const InspectorContext = createContext<InspectorContextValue | null>(null);
interface InspectorProviderProps {
  children: ReactNode;
  onNodeUpdate?: (nodeId: string, data: Record<string, unknown>) => void;
  initialWidth?: number;
  initialCollapsed?: boolean;
  initialVisible?: boolean;
}

export const InspectorProvider: React.FC<InspectorProviderProps> = ({
  children,
  onNodeUpdate,
  initialWidth = 320,
  initialCollapsed = false,
  initialVisible = true
}) => {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedSchema, setSelectedSchema] = useState<ZodSchema<unknown> | null>(null);
  const [panelWidth, setPanelWidth] = useState(initialWidth);
  const [panelCollapsed, setPanelCollapsed] = useState(initialCollapsed);
  const [panelVisible, setPanelVisible] = useState(initialVisible);
  const updateNodeData = (nodeId: string, data: Record<string, unknown>) => {
    if (onNodeUpdate) {
      onNodeUpdate(nodeId, data);
    }
  };
  const contextValue: InspectorContextValue = {
    // State
    selectedNode,
    selectedSchema,
    panelWidth,
    panelCollapsed,
    panelVisible,
    // Actions
    setSelectedNode,
    setSelectedSchema,
    setPanelWidth,
    setPanelCollapsed,
    setPanelVisible,
    updateNodeData
  };
  return (
    <InspectorContext.Provider value={contextValue}>
      {children}
    </InspectorContext.Provider>
  );
};

export const useInspectorContext = (): InspectorContextValue => {
  const context = useContext(InspectorContext);
  if (!context) {
    throw new Error('useInspectorContext must be used within an InspectorProvider');
  return context;
};