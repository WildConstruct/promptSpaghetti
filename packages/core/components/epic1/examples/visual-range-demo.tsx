/**
 * Demo of the Visual Range Indicator component
 * Shows how text-to-node mapping works with hover interactions
 */

import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { VisualRangeIndicator } from '../VisualRangeIndicator';
import { promptParser } from '../../../runtime/nodes/epic1/PromptParser';
import type { PromptAnalysis } from '../../../runtime/nodes/epic1/PromptParser';

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
  const [selectedPrompt, setSelectedPrompt] = useState<keyof typeof DEMO_PROMPTS>('medieval');
  const [promptAnalysis, setPromptAnalysis] = useState<PromptAnalysis>(() => 
    promptParser.parse(DEMO_PROMPTS.medieval.text)
  );
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [hoveredTextRange, setHoveredTextRange] = useState<{ start: number; end: number } | null>(null);
  const [showConnectionLines, setShowConnectionLines] = useState(true);

  // Handle prompt selection
  const handlePromptSelect = (key: keyof typeof DEMO_PROMPTS) => {
    setSelectedPrompt(key);
    const analysis = promptParser.parse(DEMO_PROMPTS[key].text);
    setPromptAnalysis(analysis);
    setHoveredNodeId(null);
    setHoveredTextRange(null);
  };

  // Mock node elements for demonstration
  const renderMockNodes = () => {
    return (
      <div style={{ 
        marginTop: '20px', 
        padding: '16px', 
        backgroundColor: '#fff',
        borderRadius: '8px',
        border: '1px solid #ddd',
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Generated Nodes</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {promptAnalysis.nodes.map((genNode, index) => {
            const nodeId = genNode.node.serialize().id;
            const isHovered = hoveredNodeId === nodeId;
            const nodeType = genNode.node.getNodeType();
            
            return (
              <div
                key={nodeId}
                data-node-id={nodeId}
                onMouseEnter={() => setHoveredNodeId(nodeId)}
                onMouseLeave={() => setHoveredNodeId(null)}
                style={{
                  padding: '12px 16px',
                  backgroundColor: isHovered ? '#e3f2fd' : '#f5f5f5',
                  border: `2px solid ${isHovered ? '#2196f3' : '#ddd'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                  boxShadow: isHovered ? '0 4px 8px rgba(0,0,0,0.1)' : 'none',
                  minWidth: '150px',
                }}
              >
                <div style={{ 
                  fontSize: '12px', 
                  color: '#666', 
                  marginBottom: '4px',
                  fontWeight: 'bold',
                }}>
                  {nodeType}
                </div>
                <div style={{ fontSize: '14px' }}>
                  {nodeType === 'TextBlock' && genNode.node.getCurrentValue()}
                  {nodeType === 'WeightedChoice' && (
                    <div>
                      {genNode.node.getCurrentValue().map((opt: any, i: number) => (
                        <div key={i} style={{ fontSize: '12px', marginTop: '2px' }}>
                          • {opt.text} ({opt.weight}%)
                        </div>
                      ))}
                    </div>
                  )}
                  {nodeType === 'Output' && <em>Output Node (locked)</em>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <h1>Visual Range Indicator Demo</h1>
      
      {/* Prompt Selection */}
      <div style={{ marginBottom: '20px' }}>
        <h2>Select a Prompt:</h2>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {Object.entries(DEMO_PROMPTS).map(([key, prompt]) => (
            <button
              key={key}
              onClick={() => handlePromptSelect(key as keyof typeof DEMO_PROMPTS)}
              style={{
                padding: '8px 16px',
                backgroundColor: selectedPrompt === key ? '#2196f3' : '#f0f0f0',
                color: selectedPrompt === key ? 'white' : '#333',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {prompt.title}
            </button>
          ))}
        </div>
      </div>

      {/* Options */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            checked={showConnectionLines}
            onChange={(e) => setShowConnectionLines(e.target.checked)}
          />
          Show connection lines on hover
        </label>
      </div>

      {/* Visual Range Indicator */}
      <div style={{ marginBottom: '20px' }}>
        <h2>Text with Visual Mapping:</h2>
        <VisualRangeIndicator
          promptAnalysis={promptAnalysis}
          onNodeHover={setHoveredNodeId}
          onTextHover={setHoveredTextRange}
          hoveredNodeId={hoveredNodeId}
          showConnectionLines={showConnectionLines}
        />
      </div>

      {/* Mock Nodes */}
      {renderMockNodes()}

      {/* Hover Information */}
      <div style={{ 
        marginTop: '20px', 
        padding: '16px', 
        backgroundColor: '#f0f0f0',
        borderRadius: '8px',
        fontSize: '14px',
      }}>
        <h3 style={{ marginTop: 0 }}>Hover Information:</h3>
        {hoveredNodeId ? (
          <div>
            <p><strong>Hovered Node ID:</strong> {hoveredNodeId}</p>
            {hoveredTextRange && (
              <p><strong>Text Range:</strong> [{hoveredTextRange.start}-{hoveredTextRange.end}]</p>
            )}
            <p><strong>Text:</strong> "{promptAnalysis.originalText.slice(
              hoveredTextRange?.start || 0,
              hoveredTextRange?.end || 0
            )}"</p>
          </div>
        ) : (
          <p style={{ color: '#666' }}>Hover over highlighted text or nodes to see details</p>
        )}
      </div>

      {/* Instructions */}
      <div style={{ 
        marginTop: '20px', 
        padding: '16px', 
        backgroundColor: '#fff3cd',
        borderRadius: '8px',
        border: '1px solid #ffeaa7',
      }}>
        <h3 style={{ marginTop: 0, color: '#856404' }}>Instructions:</h3>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#856404' }}>
          <li>Select different prompts to see how they're parsed</li>
          <li>Hover over highlighted text to see which node it maps to</li>
          <li>Hover over nodes to highlight the source text</li>
          <li>Enable connection lines to see visual links between text and nodes</li>
          <li>Each color represents a different parsed segment</li>
        </ul>
      </div>
    </div>
  );
}

// Initialize the demo
function initializeDemo() {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    const root = document.createElement('div');
    root.id = 'root';
    document.body.appendChild(root);
  }
  
  const root = ReactDOM.createRoot(document.getElementById('root')!);
  root.render(<VisualRangeDemo />);
}

// Check if running in browser
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDemo);
  } else {
    initializeDemo();
  }
}

export default VisualRangeDemo;