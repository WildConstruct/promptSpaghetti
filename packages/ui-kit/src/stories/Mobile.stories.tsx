/**
 * Mobile design system stories
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  MobileButton,
  MobileFAB,
  MobileInput,
  MobileSearchInput,
  MobileTextArea,
  MobileHeader,
  BottomNavigation,
  HamburgerMenu,
  SlideMenu,
  MobileNodeEditor,
  MobileGraphCanvas,
  MobileAppLayout,
  createMobileTheme
} from '../mobile';
import { ThemeProvider } from '../components/ThemeProvider';
import { GraphDocument, GraphNode } from '@prompt-spaghetti/graph-core';

const meta: Meta = {
  title: 'Mobile/Overview',
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'iphone12',
    },
  },
  decorators: [
    (Story) => {
      const mobileTheme = createMobileTheme({} as any);
      return (
        <ThemeProvider theme={mobileTheme}>
          <div style={{ 
            minHeight: '100vh',
            backgroundColor: 'var(--color-background)',
            color: 'var(--color-text)'
          }}>
            <Story />
          </div>
        </ThemeProvider>
      );
    }
  ]
};

export default meta;

// Sample graph data
const sampleGraph: GraphDocument = {
  id: 'sample-graph',
  name: 'Sample Graph',
  nodes: [
    {
      id: 'node-1',
      type: 'subject',
      position: { x: 100, y: 100 },
      data: { variations: ['A brave knight', 'A wise wizard', 'A cunning thief'] }
    },
    {
      id: 'node-2',
      type: 'action',
      position: { x: 300, y: 100 },
      data: { variations: ['battles', 'explores', 'discovers'] }
    },
    {
      id: 'node-3',
      type: 'output',
      position: { x: 500, y: 100 },
      data: { template: '{{subject}} {{action}} the ancient ruins.' }
    }
  ],
  edges: [
    { id: 'edge-1', source: 'node-1', target: 'node-3' },
    { id: 'edge-2', source: 'node-2', target: 'node-3' }
  ]
};

// Mobile Components Demo
export const ComponentsDemo: StoryObj = {
  render: () => {
    const [inputValue, setInputValue] = React.useState('');
    const [textAreaValue, setTextAreaValue] = React.useState('');
    
    return (
      <div style={{ padding: 16 }}>
        <h2 style={{ marginTop: 0 }}>Mobile Components</h2>
        
        {/* Buttons */}
        <section style={{ marginBottom: 32 }}>
          <h3>Buttons</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <MobileButton variant="primary">Primary Button</MobileButton>
            <MobileButton variant="secondary">Secondary Button</MobileButton>
            <MobileButton variant="outline">Outline Button</MobileButton>
            <MobileButton variant="ghost">Ghost Button</MobileButton>
            <MobileButton variant="primary" mobileFullWidth>Full Width Button</MobileButton>
            <MobileButton variant="primary" loading>Loading...</MobileButton>
            <MobileButton variant="primary" disabled>Disabled</MobileButton>
          </div>
        </section>
        
        {/* Inputs */}
        <section style={{ marginBottom: 32 }}>
          <h3>Inputs</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <MobileInput
              placeholder="Enter text..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              clearable
            />
            
            <MobileSearchInput
              placeholder="Search..."
              onSearch={(value) => console.log('Search:', value)}
            />
            
            <MobileInput
              type="email"
              placeholder="Email address"
              mobileInputMode="email"
              error="Invalid email format"
            />
            
            <MobileTextArea
              placeholder="Enter your message..."
              value={textAreaValue}
              onChange={(e) => setTextAreaValue(e.target.value)}
              maxLength={200}
              showCount
            />
          </div>
        </section>
        
        {/* FAB */}
        <MobileFAB position="bottom-right">
          +
        </MobileFAB>
      </div>
    );
  }
};

// Navigation Demo
export const NavigationDemo: StoryObj = {
  render: () => {
    const [menuOpen, setMenuOpen] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState('home');
    
    const bottomNavItems = [
      { id: 'home', label: 'Home', icon: '🏠' },
      { id: 'search', label: 'Search', icon: '🔍' },
      { id: 'create', label: 'Create', icon: '➕', badge: '3' },
      { id: 'profile', label: 'Profile', icon: '👤' }
    ];
    
    return (
      <>
        <MobileHeader
          title="Navigation Demo"
          leftAction={{
            icon: <HamburgerMenu isOpen={menuOpen} onToggle={() => setMenuOpen(!menuOpen)} />,
            onClick: () => setMenuOpen(!menuOpen),
            label: 'Menu'
          }}
          rightActions={[
            { icon: '🔔', onClick: () => console.log('Notifications'), label: 'Notifications' },
            { icon: '⚙️', onClick: () => console.log('Settings'), label: 'Settings' }
          ]}
        />
        
        <main style={{ 
          padding: 16, 
          minHeight: 'calc(100vh - 120px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <p>Active tab: {activeTab}</p>
        </main>
        
        <BottomNavigation
          items={bottomNavItems}
          activeId={activeTab}
          onItemClick={setActiveTab}
        />
        
        <SlideMenu
          isOpen={menuOpen}
          onClose={() => setMenuOpen(false)}
        >
          <div style={{ padding: 20 }}>
            <h2>Menu</h2>
            <nav style={{ marginTop: 24 }}>
              <button style={menuItemStyle}>Home</button>
              <button style={menuItemStyle}>About</button>
              <button style={menuItemStyle}>Services</button>
              <button style={menuItemStyle}>Contact</button>
            </nav>
          </div>
        </SlideMenu>
      </>
    );
  }
};

// Node Editor Demo
export const NodeEditorDemo: StoryObj = {
  render: () => {
    const [node, setNode] = React.useState<GraphNode>(sampleGraph.nodes[0]);
    
    return (
      <MobileNodeEditor
        node={node}
        onUpdate={(id, updates) => {
          console.log('Update node:', id, updates);
          setNode({ ...node, ...updates });
        }}
        onDelete={(id) => console.log('Delete node:', id)}
        onClose={() => console.log('Close editor')}
      />
    );
  }
};

// Graph Canvas Demo
export const GraphCanvasDemo: StoryObj = {
  render: () => {
    const [selectedNodeId, setSelectedNodeId] = React.useState<string | null>(null);
    
    return (
      <div style={{ height: '100vh' }}>
        <MobileGraphCanvas
          graph={sampleGraph}
          selectedNodeId={selectedNodeId}
          onNodeSelect={setSelectedNodeId}
          onNodeEdit={(id) => console.log('Edit node:', id)}
          onAddNode={() => console.log('Add node')}
        />
      </div>
    );
  }
};

// Complete App Demo
export const CompleteAppDemo: StoryObj = {
  render: () => {
    const [graph, setGraph] = React.useState(sampleGraph);
    
    return (
      <MobileAppLayout
        graph={graph}
        onGraphUpdate={setGraph}
      />
    );
  }
};

// Touch Target Demo
export const TouchTargetDemo: StoryObj = {
  render: () => (
    <div style={{ padding: 16 }}>
      <h2>Touch Target Sizes</h2>
      <p style={{ marginBottom: 24, color: 'var(--color-text-secondary)' }}>
        All interactive elements meet minimum 44x44px touch target requirements
      </p>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ textAlign: 'center' }}>
          <h4>Standard (48px)</h4>
          <MobileButton size="md">Tap Me</MobileButton>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <h4>Large (56px)</h4>
          <MobileButton size="lg">Tap Me</MobileButton>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <h4>FAB (56px)</h4>
          <button style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            fontSize: 24,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            +
          </button>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <h4>Icon Button (48px)</h4>
          <button style={{
            width: 48,
            height: 48,
            borderRadius: 8,
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            ⚙️
          </button>
        </div>
      </div>
    </div>
  )
};

const menuItemStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '12px 16px',
  marginBottom: 8,
  background: 'none',
  border: 'none',
  textAlign: 'left',
  fontSize: 16,
  cursor: 'pointer',
  borderRadius: 8
};