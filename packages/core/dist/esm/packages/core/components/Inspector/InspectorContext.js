import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState } from 'react';
import { ZodSchema } from 'zod';
selectedSchema: (ZodSchema) | null;
panelWidth: number;
panelCollapsed: boolean;
panelVisible: boolean;
updateNodeData: (nodeId, data) => void ;
const InspectorContext = createContext(null);
export const InspectorProvider = ({ children,
    onNodeUpdate,
    initialWidth = 320,
    initialCollapsed = false });
initialVisible = true;
{
    const [selectedNode, setSelectedNode] = useState(null);
    const [selectedSchema, setSelectedSchema] = useState(null);
    const [panelWidth, setPanelWidth] = useState(initialWidth);
    const [panelCollapsed, setPanelCollapsed] = useState(initialCollapsed);
    const [panelVisible, setPanelVisible] = useState(initialVisible);
    const updateNodeData = (nodeId, data) => { };
    if (onNodeUpdate) {
        onNodeUpdate(nodeId, data);
    }
}
;
const contextValue = {
    selectedNode,
    selectedSchema,
    panelWidth,
    panelCollapsed,
    panelVisible
    // Actions
    ,
    // Actions
    setSelectedNode,
    setSelectedSchema,
    setPanelWidth,
    setPanelCollapsed,
    setPanelVisible
};
updateNodeData;
;
return (_jsx(InspectorContext.Provider, { value: contextValue, children: children }));
;
export const useInspectorContext = () => {
    const context = useContext(InspectorContext);
    if (!context) {
        throw new Error('useInspectorContext must be used within an InspectorProvider');
    }
    return context;
};
