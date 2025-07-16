import { jsx as _jsx } from "react/jsx-runtime";
import { ReactFlowProvider } from "reactflow";
import { GraphEditor } from "./core";
import "reactflow/dist/style.css";
/**
 * Main client application component.
 * Uses the refactored GraphEditor from the core package with integrated Inspector system.
 */
export default function App() {
    return (_jsx(ReactFlowProvider, { children: _jsx("div", { style: { width: "100vw", height: "100vh" }, children: _jsx(GraphEditor, { initialNodes: [], initialEdges: [] }) }) }));
}
