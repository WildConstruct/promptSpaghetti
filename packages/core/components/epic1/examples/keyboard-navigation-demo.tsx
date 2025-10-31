/**
 * Demo of keyboard navigation for Epic 1 inline editing
 * Shows Tab/Shift+Tab navigation, auto-focus, and Escape key handling
 */

import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { KeyboardNavigableEditor } from '../KeyboardNavigableEditor';
import { promptParser } from '../../../runtime/nodes/epic1/PromptParser';
import { PromptAnalysis } from '../../../runtime/nodes/epic1/PromptParser';
import '../../../styles/global.css';

function KeyboardNavigationDemo() {
  const [prompt, setPrompt] = useState('A weary merchant in tattered robes, carrying scrolls or books or potions');
  const [analysis, setAnalysis] = useState<PromptAnalysis | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [status, setStatus] = useState('');

  const handleAnalyzePrompt = () => {
    try {
      const result = promptParser.parse(prompt);
      setAnalysis(result);
      setShowEditor(true);
      setStatus('Prompt analyzed! Nodes are in edit mode. Use Tab to navigate.');
    } catch (error) {
      setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleCanvasClick = () => {
    setStatus('All edits confirmed! Click “Analyze Prompt” to start over.');
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

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-md p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Epic 1: Keyboard Navigation Demo
        </h1>
        <p className="text-gray-600">
          Test Tab/Shift+Tab navigation, auto-focus, and Escape key handling
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white m-4 p-4 rounded-lg shadow">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter a prompt to analyze:
          </label>
          <textarea
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt here..."
          />
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={handleAnalyzePrompt}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Analyze Prompt
          </button>
          <button
            onClick={() => setShowEditor(false)}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Clear Editor
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Quick Examples:</p>
          <div className="flex flex-wrap gap-2">
            {examples.map((example, index) => (
              <button
                key={index}
                onClick={() => setPrompt(example)}
                className="text-xs px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
              >
                Example {index + 1}
              </button>
            ))}
          </div>
        </div>

        {status && (
          <div className={`p-3 rounded-lg ${
            status.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}>
            {status}
          </div>
        )}
      </div>

      {/* Editor */}
      {showEditor && analysis && (
        <div className="flex-1 m-4 bg-white rounded-lg shadow overflow-hidden">
          <KeyboardNavigableEditor
            promptAnalysis={analysis}
            onCanvasClick={handleCanvasClick}
            onEscapePress={handleEscapePress}
            showVisualIndicators={true}
            className="h-full"
          />
        </div>
      )}

      {/* Instructions */}
      {!showEditor && (
        <div className="m-4 p-6 bg-white rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">How to Use This Demo</h2>
          <ol className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="font-semibold mr-2">1.</span>
              <div>
                <strong>Enter a prompt</strong> or select an example
              </div>
            </li>
            <li className="flex items-start">
              <span className="font-semibold mr-2">2.</span>
              <div>
                <strong>Click &ldquo;Analyze Prompt&rdquo;</strong> to generate nodes
              </div>
            </li>
            <li className="flex items-start">
              <span className="font-semibold mr-2">3.</span>
              <div>
                <strong>Navigate with keyboard:</strong>
                <ul className="mt-1 ml-4 space-y-1 text-sm">
                  <li>• <kbd className="px-2 py-1 bg-gray-100 rounded">Tab</kbd> - Move to next node</li>
                  <li>• <kbd className="px-2 py-1 bg-gray-100 rounded">Shift+Tab</kbd> - Move to previous node</li>
                  <li>• <kbd className="px-2 py-1 bg-gray-100 rounded">Enter</kbd> - Confirm current & move next</li>
                  <li>• <kbd className="px-2 py-1 bg-gray-100 rounded">Escape</kbd> - Cancel all edits</li>
                </ul>
              </div>
            </li>
            <li className="flex items-start">
              <span className="font-semibold mr-2">4.</span>
              <div>
                <strong>Click on canvas</strong> to confirm all edits
              </div>
            </li>
          </ol>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Key Features Demonstrated:</h3>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>✓ Auto-focus on first generated node</li>
              <li>✓ Tab order follows visual layout (top-to-bottom, left-to-right)</li>
              <li>✓ Circular navigation (wraps at boundaries)</li>
              <li>✓ Visual indicators show which text maps to which node</li>
              <li>✓ Escape key cancels edits and restores original values</li>
              <li>✓ Canvas click confirms all edits at once</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

// Mount the demo
const mountNode = document.getElementById('root');

if (mountNode) {
  ReactDOM.createRoot(mountNode).render(<KeyboardNavigationDemo />);
} else {
  console.warn('KeyboardNavigationDemo: root element not found.');
}
