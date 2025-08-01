/**
 * Example: How to use the Medieval Demo Showcase
 * 
 * This example shows how to integrate the medieval demo
 * into your application for investor presentations.
 */

import React from 'react';
import { MedievalDemoShowcase } from '../demos/MedievalDemoShowcase';

export const MedievalDemoExample: React.FC = () => {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      {/* The demo showcase is self-contained */}
      <MedievalDemoShowcase />
      
      {/* 
        The demo includes:
        - Automated demo script with timing
        - Pre-built medieval graph examples
        - Keyboard shortcuts (1-4 to load graphs)
        - Interactive step-by-step playback
        - Haptic feedback on mobile devices
        - Live preview generation
        
        Perfect for:
        - Investor demos (<30 seconds)
        - Trade show presentations
        - Sales pitches
        - Product showcases
        
        Keyboard shortcuts:
        - 1: Load Simple Character graph
        - 2: Load Quest Hook graph
        - 3: Load Tavern Scene graph
        - 4: Load Combat Encounter graph
        - C: Clear canvas
        - G: Generate preview
        - L: Toggle asset library
        - ⌘D: Start automated demo
        - ?: Show help
      */}
    </div>
  );
};

// Example: Custom Demo Integration
export const CustomDemoIntegration: React.FC = () => {
  // You can also build your own demo using the components
  
  return (
    <div>
      <h1>Custom Demo Integration</h1>
      
      {/* Import and use individual demo components */}
      <div style={{ padding: 20 }}>
        <h2>Available Demo Components:</h2>
        
        <h3>1. DemoRunner</h3>
        <p>Automated demo execution with timing control</p>
        <pre>{`
import { DemoRunner } from '../demos/DemoRunner';

const script = {
  title: 'My Demo',
  description: 'Custom demo script',
  totalDuration: 30000, // 30 seconds
  steps: [
    {
      id: 'step1',
      name: 'Introduction',
      description: 'Show empty canvas',
      duration: 3000,
      action: () => console.log('Step 1')
    }
  ]
};

<DemoRunner 
  script={script}
  onComplete={() => console.log('Demo complete!')}
/>
        `}</pre>

        <h3>2. Medieval Demo Graphs</h3>
        <p>Pre-built graph configurations</p>
        <pre>{`
import { getDemoGraphById, medievalDemoGraphs } from '../demos/medievalDemoGraphs';

// Get a specific demo graph
const questGraph = getDemoGraphById('quest-hook');

// Load into your editor
<Epic1GraphEditor
  initialNodes={questGraph.nodes}
  initialEdges={questGraph.edges}
/>
        `}</pre>

        <h3>3. Demo Shortcuts</h3>
        <p>Quick keyboard actions for demos</p>
        <pre>{`
import { DemoShortcuts } from '../demos/DemoShortcuts';

<DemoShortcuts
  onLoadGraph={(graph) => loadGraph(graph)}
  onClearGraph={() => clearCanvas()}
  onGeneratePreview={() => generatePreview()}
  onToggleAssetLibrary={() => toggleLibrary()}
  onStartDemo={() => startAutomatedDemo()}
/>
        `}</pre>
      </div>

      <div style={{ padding: 20, background: '#f0f0f0', borderRadius: 8, margin: 20 }}>
        <h3>💡 Demo Best Practices</h3>
        <ul>
          <li><strong>Keep it under 30 seconds</strong> - Investors have short attention spans</li>
          <li><strong>Start simple</strong> - Begin with an empty canvas to show the journey</li>
          <li><strong>Show the magic</strong> - Highlight inline editing and instant preview</li>
          <li><strong>Use presets</strong> - Demonstrate the asset library drag-and-drop</li>
          <li><strong>Generate variations</strong> - Show 5-10 outputs quickly</li>
          <li><strong>End with possibilities</strong> - Leave them wanting more</li>
        </ul>
      </div>

      <div style={{ padding: 20, background: '#e3f2fd', borderRadius: 8, margin: 20 }}>
        <h3>🎯 Demo Script Template</h3>
        <ol>
          <li><strong>Hook (5s)</strong>: "What if creating content was as easy as editing text?"</li>
          <li><strong>Empty Canvas (3s)</strong>: Show the blank starting point</li>
          <li><strong>Quick Creation (5s)</strong>: Paste text, instant node appears</li>
          <li><strong>Inline Edit (5s)</strong>: Click to edit, show immediate changes</li>
          <li><strong>Expand (7s)</strong>: Add variety with weighted choices</li>
          <li><strong>Preview (8s)</strong>: Generate 20 unique variations instantly</li>
          <li><strong>Close (2s)</strong>: "From idea to content in 30 seconds"</li>
        </ol>
      </div>
    </div>
  );
};