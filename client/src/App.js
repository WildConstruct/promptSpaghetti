import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback } from "react";
import { ReactFlowProvider } from "reactflow";
import { GraphEditor, RandomizerPanel } from "./core";
import "reactflow/dist/style.css";
import "./randomizer.css";
/**
 * Main client application component.
 * Includes both regular graph editor and LLM randomizer functionality.
 */
export default function App() {
    const [activeTab, setActiveTab] = useState('editor');
    const [generatedGraph, setGeneratedGraph] = useState(null);
    const handleGraphGenerated = useCallback((graph) => {
        setGeneratedGraph(graph);
        setActiveTab('editor');
    }, []);
    const handleRandomizerError = useCallback((error) => {
        console.error('Randomizer error:', error);
        alert(`Generation failed: ${error.message}`);
    }, []);
    return (_jsx(ReactFlowProvider, { children: _jsxs("div", { style: { width: "100vw", height: "100vh", display: "flex", flexDirection: "column" }, children: [_jsxs("div", { style: {
                        display: "flex",
                        borderBottom: "1px solid #ccc",
                        backgroundColor: "#f5f5f5",
                        padding: "0"
                    }, children: [_jsx("button", { onClick: () => setActiveTab('editor'), style: {
                                padding: "10px 20px",
                                border: "none",
                                backgroundColor: activeTab === 'editor' ? '#fff' : 'transparent',
                                borderBottom: activeTab === 'editor' ? '2px solid #007bff' : '2px solid transparent',
                                cursor: "pointer",
                                fontSize: "14px",
                                fontWeight: activeTab === 'editor' ? 'bold' : 'normal'
                            }, children: "Graph Editor" }), _jsx("button", { onClick: () => setActiveTab('randomizer'), style: {
                                padding: "10px 20px",
                                border: "none",
                                backgroundColor: activeTab === 'randomizer' ? '#fff' : 'transparent',
                                borderBottom: activeTab === 'randomizer' ? '2px solid #007bff' : '2px solid transparent',
                                cursor: "pointer",
                                fontSize: "14px",
                                fontWeight: activeTab === 'randomizer' ? 'bold' : 'normal'
                            }, children: "LLM Randomizer" })] }), _jsx("div", { style: { flex: 1, overflow: "hidden" }, children: activeTab === 'editor' ? (_jsx(GraphEditor, { initialNodes: generatedGraph?.nodes || [], initialEdges: generatedGraph?.edges || [] })) : (_jsx("div", { style: {
                            padding: "20px",
                            height: "100%",
                            overflow: "auto",
                            backgroundColor: "#f8f9fa"
                        }, children: _jsx(RandomizerPanel, { onGraphGenerated: handleGraphGenerated, onError: handleRandomizerError, className: "randomizer-main" }) })) })] }) }));
}
