import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { MedievalDemoShowcase } from '../demos/MedievalDemoShowcase';
export const MedievalDemoExample = () => {
    return (_jsx("div", { style: { width: '100vw', height: '100vh' }, children: _jsx(MedievalDemoShowcase, {}) }));
};
// Example: Custom Demo Integration
export const CustomDemoIntegration = () => {
    // You can also build your own demo using the components
    return (_jsxs("div", { children: [_jsx("h1", { children: "Custom Demo Integration" }), _jsxs("div", { style: { padding: 20 }, children: [_jsx("h2", { children: "Available Demo Components:" }), _jsx("h3", { children: "1. DemoRunner" }), _jsx("p", { children: "Automated demo execution with timing control" }), _jsx("pre", { children: `
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
        ` }), _jsx("h3", { children: "2. Medieval Demo Graphs" }), _jsx("p", { children: "Pre-built graph configurations" }), _jsx("pre", { children: `
import { getDemoGraphById, medievalDemoGraphs } from '../demos/medievalDemoGraphs';

// Get a specific demo graph
const questGraph = getDemoGraphById('quest-hook');

// Load into your editor
<Epic1GraphEditor
  initialNodes={questGraph.nodes}
  initialEdges={questGraph.edges}
/>
        ` }), _jsx("h3", { children: "3. Demo Shortcuts" }), _jsx("p", { children: "Quick keyboard actions for demos" }), _jsx("pre", { children: `
import { DemoShortcuts } from '../demos/DemoShortcuts';

<DemoShortcuts
  onLoadGraph={(graph) => loadGraph(graph)}
  onClearGraph={() => clearCanvas()}
  onGeneratePreview={() => generatePreview()}
  onToggleAssetLibrary={() => toggleLibrary()}
  onStartDemo={() => startAutomatedDemo()}
/>
        ` })] }), _jsxs("div", { style: { padding: 20, background: '#f0f0f0', borderRadius: 8, margin: 20 }, children: [_jsx("h3", { children: "\uD83D\uDCA1 Demo Best Practices" }), _jsxs("ul", { children: [_jsxs("li", { children: [_jsx("strong", { children: "Keep it under 30 seconds" }), " - Investors have short attention spans"] }), _jsxs("li", { children: [_jsx("strong", { children: "Start simple" }), " - Begin with an empty canvas to show the journey"] }), _jsxs("li", { children: [_jsx("strong", { children: "Show the magic" }), " - Highlight inline editing and instant preview"] }), _jsxs("li", { children: [_jsx("strong", { children: "Use presets" }), " - Demonstrate the asset library drag-and-drop"] }), _jsxs("li", { children: [_jsx("strong", { children: "Generate variations" }), " - Show 5-10 outputs quickly"] }), _jsxs("li", { children: [_jsx("strong", { children: "End with possibilities" }), " - Leave them wanting more"] })] })] }), _jsxs("div", { style: { padding: 20, background: '#e3f2fd', borderRadius: 8, margin: 20 }, children: [_jsx("h3", { children: "\uD83C\uDFAF Demo Script Template" }), _jsxs("ol", { children: [_jsxs("li", { children: [_jsx("strong", { children: "Hook (5s)" }), ": \"What if creating content was as easy as editing text?\""] }), _jsxs("li", { children: [_jsx("strong", { children: "Empty Canvas (3s)" }), ": Show the blank starting point"] }), _jsxs("li", { children: [_jsx("strong", { children: "Quick Creation (5s)" }), ": Paste text, instant node appears"] }), _jsxs("li", { children: [_jsx("strong", { children: "Inline Edit (5s)" }), ": Click to edit, show immediate changes"] }), _jsxs("li", { children: [_jsx("strong", { children: "Expand (7s)" }), ": Add variety with weighted choices"] }), _jsxs("li", { children: [_jsx("strong", { children: "Preview (8s)" }), ": Generate 20 unique variations instantly"] }), _jsxs("li", { children: [_jsx("strong", { children: "Close (2s)" }), ": \"From idea to content in 30 seconds\""] })] })] })] }));
};
