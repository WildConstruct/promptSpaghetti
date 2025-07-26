import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState } from 'react';
const InspectorContext = createContext(null);
export const InspectorProvider = ({ children, onNodeUpdate, initialWidth = 320, initialCollapsed = false, initialVisible = true }: { children: any, onNodeUpdate?: (nodeId: string, data: any) => void, initialWidth?: number, initialCollapsed?: boolean, initialVisible?: boolean }) => {
    const [selectedNode, setSelectedNode] = useState(null);
    const [selectedSchema, setSelectedSchema] = useState(null);
    const [panelWidth, setPanelWidth] = useState(initialWidth);
    const [panelCollapsed, setPanelCollapsed] = useState(initialCollapsed);
    const [panelVisible, setPanelVisible] = useState(initialVisible);
    const updateNodeData = (nodeId: string, data: any) => {
        if (onNodeUpdate) {
            onNodeUpdate(nodeId, data);
        }
    };
    const contextValue = {
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
    return (_jsx(InspectorContext.Provider, { value: contextValue, children: children }));
};
export const useInspectorContext = () => {
    const context = useContext(InspectorContext);
    if (!context) {
        throw new Error('useInspectorContext must be used within an InspectorProvider');
    }
    return context;
};
