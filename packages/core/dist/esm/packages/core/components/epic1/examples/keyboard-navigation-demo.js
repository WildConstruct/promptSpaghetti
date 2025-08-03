import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Demo of keyboard navigation for Epic 1 inline editing
 * Shows Tab/Shift+Tab navigation, auto-focus, and Escape key handling
 */
import { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { KeyboardNavigableEditor } from '../KeyboardNavigableEditor';
import { promptParser } from '../../../runtime/nodes/epic1/PromptParser';
import '../../../styles/global.css';
function KeyboardNavigationDemo() {
    const [prompt, setPrompt] = useState('A weary merchant in tattered robes, carrying scrolls or books or potions');
    const [analysis, setAnalysis] = useState(null);
    const [showEditor, setShowEditor] = useState(false);
    const [status, setStatus] = useState('');
    const handleAnalyzePrompt = () => {
        try {
            const result = promptParser.parse(prompt);
            setAnalysis(result);
            setShowEditor(true);
            setStatus('Prompt analyzed! Nodes are in edit mode. Use Tab to navigate.');
        }
        catch (error) {
            setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };
    const handleCanvasClick = () => {
        setStatus('All edits confirmed! Click "Analyze Prompt" to start over.');
    };
    const handleEscapePress = () => {
        setStatus('Edit cancelled! All changes reverted.');
    };
    const examples = [
        'A weary merchant in tattered robes, carrying scrolls or books or potions',
        'The ancient wizard with a long grey beard, wearing robes of midnight blue or deep purple or forest green',
        'In the depths of the dungeon, you encounter a massive door made of iron, stone, or enchanted wood',
        'A fierce warrior wielding sword, axe, or mace, protected by leather, chainmail, or plate armor'
    ];
    return (_jsxs("div", { className: "h-screen flex flex-col bg-gray-100", children: [_jsxs("div", { className: "bg-white shadow-md p-4", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-800 mb-2", children: "Epic 1: Keyboard Navigation Demo" }), _jsx("p", { className: "text-gray-600", children: "Test Tab/Shift+Tab navigation, auto-focus, and Escape key handling" })] }), _jsxs("div", { className: "bg-white m-4 p-4 rounded-lg shadow", children: [_jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Enter a prompt to analyze:" }), _jsx("textarea", { className: "w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500", rows: 3, value: prompt, onChange: (e) => setPrompt(e.target.value), placeholder: "Enter your prompt here..." })] }), _jsxs("div", { className: "flex gap-2 mb-4", children: [_jsx("button", { onClick: handleAnalyzePrompt, className: "px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors", children: "Analyze Prompt" }), _jsx("button", { onClick: () => setShowEditor(false), className: "px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors", children: "Clear Editor" })] }), _jsxs("div", { className: "mb-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-700 mb-2", children: "Quick Examples:" }), _jsx("div", { className: "flex flex-wrap gap-2", children: examples.map((example, index) => (_jsxs("button", { onClick: () => setPrompt(example), className: "text-xs px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors", children: ["Example ", index + 1] }, index))) })] }), status && (_jsx("div", { className: `p-3 rounded-lg ${status.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`, children: status }))] }), showEditor && analysis && (_jsx("div", { className: "flex-1 m-4 bg-white rounded-lg shadow overflow-hidden", children: _jsx(KeyboardNavigableEditor, { promptAnalysis: analysis, onCanvasClick: handleCanvasClick, onEscapePress: handleEscapePress, showVisualIndicators: true, className: "h-full" }) })), !showEditor && (_jsxs("div", { className: "m-4 p-6 bg-white rounded-lg shadow", children: [_jsx("h2", { className: "text-lg font-semibold mb-4", children: "How to Use This Demo" }), _jsxs("ol", { className: "space-y-2 text-gray-700", children: [_jsxs("li", { className: "flex items-start", children: [_jsx("span", { className: "font-semibold mr-2", children: "1." }), _jsxs("div", { children: [_jsx("strong", { children: "Enter a prompt" }), " or select an example"] })] }), _jsxs("li", { className: "flex items-start", children: [_jsx("span", { className: "font-semibold mr-2", children: "2." }), _jsxs("div", { children: [_jsx("strong", { children: "Click \"Analyze Prompt\"" }), " to generate nodes"] })] }), _jsxs("li", { className: "flex items-start", children: [_jsx("span", { className: "font-semibold mr-2", children: "3." }), _jsxs("div", { children: [_jsx("strong", { children: "Navigate with keyboard:" }), _jsxs("ul", { className: "mt-1 ml-4 space-y-1 text-sm", children: [_jsxs("li", { children: ["\u2022 ", _jsx("kbd", { className: "px-2 py-1 bg-gray-100 rounded", children: "Tab" }), " - Move to next node"] }), _jsxs("li", { children: ["\u2022 ", _jsx("kbd", { className: "px-2 py-1 bg-gray-100 rounded", children: "Shift+Tab" }), " - Move to previous node"] }), _jsxs("li", { children: ["\u2022 ", _jsx("kbd", { className: "px-2 py-1 bg-gray-100 rounded", children: "Enter" }), " - Confirm current & move next"] }), _jsxs("li", { children: ["\u2022 ", _jsx("kbd", { className: "px-2 py-1 bg-gray-100 rounded", children: "Escape" }), " - Cancel all edits"] })] })] })] }), _jsxs("li", { className: "flex items-start", children: [_jsx("span", { className: "font-semibold mr-2", children: "4." }), _jsxs("div", { children: [_jsx("strong", { children: "Click on canvas" }), " to confirm all edits"] })] })] }), _jsxs("div", { className: "mt-6 p-4 bg-blue-50 rounded-lg", children: [_jsx("h3", { className: "font-semibold text-blue-900 mb-2", children: "Key Features Demonstrated:" }), _jsxs("ul", { className: "space-y-1 text-sm text-blue-800", children: [_jsx("li", { children: "\u2713 Auto-focus on first generated node" }), _jsx("li", { children: "\u2713 Tab order follows visual layout (top-to-bottom, left-to-right)" }), _jsx("li", { children: "\u2713 Circular navigation (wraps at boundaries)" }), _jsx("li", { children: "\u2713 Visual indicators show which text maps to which node" }), _jsx("li", { children: "\u2713 Escape key cancels edits and restores original values" }), _jsx("li", { children: "\u2713 Canvas click confirms all edits at once" })] })] })] }))] }));
}
// Mount the demo
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(_jsx(KeyboardNavigationDemo, {}));
