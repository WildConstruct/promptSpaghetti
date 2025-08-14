import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Demo of the Visual Range Indicator component
 * Shows how text-to-node mapping works with hover interactions
 */
import { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { VisualRangeIndicator } from '../VisualRangeIndicator';
import { promptParser } from '../../../runtime/nodes/epic1/PromptParser';
// Example prompts for demonstration
const DEMO_PROMPTS = {
    medieval: {
        title: 'Medieval Character',
        text: 'A weary merchant in tattered robes, carrying scrolls or books or potions',
    },
    fantasy: {
        title: 'Fantasy Wizard',
        text: 'The ancient wizard with a long grey beard, wearing robes of midnight blue or deep purple or forest green, holds a staff topped with a glowing crystal or orb or rune stone.',
    },
    scifi: {
        title: 'Sci-Fi Scene',
        text: 'A cybernetic bounty hunter equipped with plasma rifle, neural implants, and tactical armor scans the neon-lit streets of Neo Tokyo or Hong Kong or Singapore.',
    },
    simple: {
        title: 'Simple Greeting',
        text: 'Hello {{userName}}, welcome to the magical realm!',
    },
    complex: {
        title: 'Dungeon Encounter',
        text: 'In the depths of the dungeon, you encounter a massive door made of iron, stone, or enchanted wood. The door is guarded by a skeleton warrior, zombie knight, or spectral guardian wielding a rusty sword or ancient spear.',
    },
};
function VisualRangeDemo() {
    const [selectedPrompt, setSelectedPrompt] = useState('medieval');
    const [promptAnalysis, setPromptAnalysis] = useState(() => promptParser.parse(DEMO_PROMPTS.medieval.text));
    const [hoveredNodeId, setHoveredNodeId] = useState(null);
    const [hoveredTextRange, setHoveredTextRange] = useState(null);
    const [showConnectionLines, setShowConnectionLines] = useState(true);
    // Handle prompt selection
    const handlePromptSelect = (key) => {
        setSelectedPrompt(key);
        const analysis = promptParser.parse(DEMO_PROMPTS[key].text);
        setPromptAnalysis(analysis);
        setHoveredNodeId(null);
        setHoveredTextRange(null);
    };
    // Mock node elements for demonstration
    const renderMockNodes = () => {
        return (_jsxs("div", { style: {
                marginTop: '20px',
                padding: '16px',
                backgroundColor: '#fff',
                borderRadius: '8px',
                border: '1px solid #ddd',
            }, children: [_jsx("h3", { style: { marginTop: 0, marginBottom: '16px' }, children: "Generated Nodes" }), _jsx("div", { style: { display: 'flex', flexWrap: 'wrap', gap: '12px' }, children: promptAnalysis.nodes.map((genNode, index) => {
                        const nodeId = genNode.node.serialize().id;
                        const isHovered = hoveredNodeId === nodeId;
                        const nodeType = genNode.node.getNodeType();
                        return (_jsxs("div", { "data-node-id": nodeId, onMouseEnter: () => setHoveredNodeId(nodeId), onMouseLeave: () => setHoveredNodeId(null), style: {
                                padding: '12px 16px',
                                backgroundColor: isHovered ? '#e3f2fd' : '#f5f5f5',
                                border: `2px solid ${isHovered ? '#2196f3' : '#ddd'}`,
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                                boxShadow: isHovered ? '0 4px 8px rgba(0,0,0,0.1)' : 'none',
                                minWidth: '150px',
                            }, children: [_jsx("div", { style: {
                                        fontSize: '12px',
                                        color: '#666',
                                        marginBottom: '4px',
                                        fontWeight: 'bold',
                                    }, children: nodeType }), _jsxs("div", { style: { fontSize: '14px' }, children: [nodeType === 'TextBlock' && genNode.node.getCurrentValue(), nodeType === 'WeightedChoice' && (_jsx("div", { children: genNode.node.getCurrentValue().map((opt, i) => (_jsxs("div", { style: { fontSize: '12px', marginTop: '2px' }, children: ["\u2022 ", opt.text, " (", opt.weight, "%)"] }, i))) })), nodeType === 'Output' && _jsx("em", { children: "Output Node (locked)" })] })] }, nodeId));
                    }) })] }));
    };
    return (_jsxs("div", { style: {
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '20px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }, children: [_jsx("h1", { children: "Visual Range Indicator Demo" }), _jsxs("div", { style: { marginBottom: '20px' }, children: [_jsx("h2", { children: "Select a Prompt:" }), _jsx("div", { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' }, children: Object.entries(DEMO_PROMPTS).map(([key, prompt]) => (_jsx("button", { onClick: () => handlePromptSelect(key), style: {
                                padding: '8px 16px',
                                backgroundColor: selectedPrompt === key ? '#2196f3' : '#f0f0f0',
                                color: selectedPrompt === key ? 'white' : '#333',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                            }, children: prompt.title }, key))) })] }), _jsx("div", { style: { marginBottom: '20px' }, children: _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: '8px' }, children: [_jsx("input", { type: "checkbox", checked: showConnectionLines, onChange: (e) => setShowConnectionLines(e.target.checked) }), "Show connection lines on hover"] }) }), _jsxs("div", { style: { marginBottom: '20px' }, children: [_jsx("h2", { children: "Text with Visual Mapping:" }), _jsx(VisualRangeIndicator, { promptAnalysis: promptAnalysis, onNodeHover: setHoveredNodeId, onTextHover: setHoveredTextRange, hoveredNodeId: hoveredNodeId, showConnectionLines: showConnectionLines })] }), renderMockNodes(), _jsxs("div", { style: {
                    marginTop: '20px',
                    padding: '16px',
                    backgroundColor: '#f0f0f0',
                    borderRadius: '8px',
                    fontSize: '14px',
                }, children: [_jsx("h3", { style: { marginTop: 0 }, children: "Hover Information:" }), hoveredNodeId ? (_jsxs("div", { children: [_jsxs("p", { children: [_jsx("strong", { children: "Hovered Node ID:" }), " ", hoveredNodeId] }), hoveredTextRange && (_jsxs("p", { children: [_jsx("strong", { children: "Text Range:" }), " [", hoveredTextRange.start, "-", hoveredTextRange.end, "]"] })), _jsxs("p", { children: [_jsx("strong", { children: "Text:" }), " \"", promptAnalysis.originalText.slice(hoveredTextRange?.start || 0, hoveredTextRange?.end || 0), "\""] })] })) : (_jsx("p", { style: { color: '#666' }, children: "Hover over highlighted text or nodes to see details" }))] }), _jsxs("div", { style: {
                    marginTop: '20px',
                    padding: '16px',
                    backgroundColor: '#fff3cd',
                    borderRadius: '8px',
                    border: '1px solid #ffeaa7',
                }, children: [_jsx("h3", { style: { marginTop: 0, color: '#856404' }, children: "Instructions:" }), _jsxs("ul", { style: { margin: 0, paddingLeft: '20px', color: '#856404' }, children: [_jsx("li", { children: "Select different prompts to see how they're parsed" }), _jsx("li", { children: "Hover over highlighted text to see which node it maps to" }), _jsx("li", { children: "Hover over nodes to highlight the source text" }), _jsx("li", { children: "Enable connection lines to see visual links between text and nodes" }), _jsx("li", { children: "Each color represents a different parsed segment" })] })] })] }));
}
// Initialize the demo
function initializeDemo() {
    const rootElement = document.getElementById('root');
    if (!rootElement) {
        const root = document.createElement('div');
        root.id = 'root';
        document.body.appendChild(root);
    }
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(_jsx(VisualRangeDemo, {}));
}
// Check if running in browser
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeDemo);
    }
    else {
        initializeDemo();
    }
}
export default VisualRangeDemo;
