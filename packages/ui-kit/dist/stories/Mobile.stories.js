import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from 'react/jsx-runtime';
/**
 * Mobile design system stories
 */
import React from 'react';
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
  createMobileTheme,
} from '../mobile';
import { ThemeProvider } from '../components/ThemeProvider';
const meta = {
  title: 'Mobile/Overview',
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'iphone12',
    },
  },
  decorators: [
    Story => {
      const mobileTheme = createMobileTheme({});
      return _jsx(ThemeProvider, {
        theme: mobileTheme,
        children: _jsx('div', {
          style: {
            minHeight: '100vh',
            backgroundColor: 'var(--color-background)',
            color: 'var(--color-text)',
          },
          children: _jsx(Story, {}),
        }),
      });
    },
  ],
};
export default meta;
// Sample graph data
const sampleGraph = {
  id: 'sample-graph',
  name: 'Sample Graph',
  nodes: [
    {
      id: 'node-1',
      type: 'subject',
      position: { x: 100, y: 100 },
      data: { variations: ['A brave knight', 'A wise wizard', 'A cunning thief'] },
    },
    {
      id: 'node-2',
      type: 'action',
      position: { x: 300, y: 100 },
      data: { variations: ['battles', 'explores', 'discovers'] },
    },
    {
      id: 'node-3',
      type: 'output',
      position: { x: 500, y: 100 },
      data: { template: '{{subject}} {{action}} the ancient ruins.' },
    },
  ],
  edges: [
    { id: 'edge-1', source: 'node-1', target: 'node-3' },
    { id: 'edge-2', source: 'node-2', target: 'node-3' },
  ],
};
// Mobile Components Demo
export const ComponentsDemo = {
  render: () => {
    const [inputValue, setInputValue] = React.useState('');
    const [textAreaValue, setTextAreaValue] = React.useState('');
    return _jsxs('div', {
      style: { padding: 16 },
      children: [
        _jsx('h2', { style: { marginTop: 0 }, children: 'Mobile Components' }),
        _jsxs('section', {
          style: { marginBottom: 32 },
          children: [
            _jsx('h3', { children: 'Buttons' }),
            _jsxs('div', {
              style: { display: 'flex', flexDirection: 'column', gap: 12 },
              children: [
                _jsx(MobileButton, { variant: 'primary', children: 'Primary Button' }),
                _jsx(MobileButton, { variant: 'secondary', children: 'Secondary Button' }),
                _jsx(MobileButton, { variant: 'outline', children: 'Outline Button' }),
                _jsx(MobileButton, { variant: 'ghost', children: 'Ghost Button' }),
                _jsx(MobileButton, { variant: 'primary', mobileFullWidth: true, children: 'Full Width Button' }),
                _jsx(MobileButton, { variant: 'primary', loading: true, children: 'Loading...' }),
                _jsx(MobileButton, { variant: 'primary', disabled: true, children: 'Disabled' }),
              ],
            }),
          ],
        }),
        _jsxs('section', {
          style: { marginBottom: 32 },
          children: [
            _jsx('h3', { children: 'Inputs' }),
            _jsxs('div', {
              style: { display: 'flex', flexDirection: 'column', gap: 16 },
              children: [
                _jsx(MobileInput, {
                  placeholder: 'Enter text...',
                  value: inputValue,
                  onChange: e => setInputValue(e.target.value),
                  clearable: true,
                }),
                _jsx(MobileSearchInput, { placeholder: 'Search...', onSearch: value => console.log('Search:', value) }),
                _jsx(MobileInput, {
                  type: 'email',
                  placeholder: 'Email address',
                  mobileInputMode: 'email',
                  error: 'Invalid email format',
                }),
                _jsx(MobileTextArea, {
                  placeholder: 'Enter your message...',
                  value: textAreaValue,
                  onChange: e => setTextAreaValue(e.target.value),
                  maxLength: 200,
                  showCount: true,
                }),
              ],
            }),
          ],
        }),
        _jsx(MobileFAB, { position: 'bottom-right', children: '+' }),
      ],
    });
  },
};
// Navigation Demo
export const NavigationDemo = {
  render: () => {
    const [menuOpen, setMenuOpen] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState('home');
    const bottomNavItems = [
      { id: 'home', label: 'Home', icon: '🏠' },
      { id: 'search', label: 'Search', icon: '🔍' },
      { id: 'create', label: 'Create', icon: '➕', badge: '3' },
      { id: 'profile', label: 'Profile', icon: '👤' },
    ];
    return _jsxs(_Fragment, {
      children: [
        _jsx(MobileHeader, {
          title: 'Navigation Demo',
          leftAction: {
            icon: _jsx(HamburgerMenu, { isOpen: menuOpen, onToggle: () => setMenuOpen(!menuOpen) }),
            onClick: () => setMenuOpen(!menuOpen),
            label: 'Menu',
          },
          rightActions: [
            { icon: '🔔', onClick: () => console.log('Notifications'), label: 'Notifications' },
            { icon: '⚙️', onClick: () => console.log('Settings'), label: 'Settings' },
          ],
        }),
        _jsx('main', {
          style: {
            padding: 16,
            minHeight: 'calc(100vh - 120px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          },
          children: _jsxs('p', { children: ['Active tab: ', activeTab] }),
        }),
        _jsx(BottomNavigation, { items: bottomNavItems, activeId: activeTab, onItemClick: setActiveTab }),
        _jsx(SlideMenu, {
          isOpen: menuOpen,
          onClose: () => setMenuOpen(false),
          children: _jsxs('div', {
            style: { padding: 20 },
            children: [
              _jsx('h2', { children: 'Menu' }),
              _jsxs('nav', {
                style: { marginTop: 24 },
                children: [
                  _jsx('button', { style: menuItemStyle, children: 'Home' }),
                  _jsx('button', { style: menuItemStyle, children: 'About' }),
                  _jsx('button', { style: menuItemStyle, children: 'Services' }),
                  _jsx('button', { style: menuItemStyle, children: 'Contact' }),
                ],
              }),
            ],
          }),
        }),
      ],
    });
  },
};
// Node Editor Demo
export const NodeEditorDemo = {
  render: () => {
    const [node, setNode] = React.useState(sampleGraph.nodes[0]);
    return _jsx(MobileNodeEditor, {
      node: node,
      onUpdate: (id, updates) => {
        console.log('Update node:', id, updates);
        setNode({ ...node, ...updates });
      },
      onDelete: id => console.log('Delete node:', id),
      onClose: () => console.log('Close editor'),
    });
  },
};
// Graph Canvas Demo
export const GraphCanvasDemo = {
  render: () => {
    const [selectedNodeId, setSelectedNodeId] = React.useState(null);
    return _jsx('div', {
      style: { height: '100vh' },
      children: _jsx(MobileGraphCanvas, {
        graph: sampleGraph,
        selectedNodeId: selectedNodeId,
        onNodeSelect: setSelectedNodeId,
        onNodeEdit: id => console.log('Edit node:', id),
        onAddNode: () => console.log('Add node'),
      }),
    });
  },
};
// Complete App Demo
export const CompleteAppDemo = {
  render: () => {
    const [graph, setGraph] = React.useState(sampleGraph);
    return _jsx(MobileAppLayout, { graph: graph, onGraphUpdate: setGraph });
  },
};
// Touch Target Demo
export const TouchTargetDemo = {
  render: () =>
    _jsxs('div', {
      style: { padding: 16 },
      children: [
        _jsx('h2', { children: 'Touch Target Sizes' }),
        _jsx('p', {
          style: { marginBottom: 24, color: 'var(--color-text-secondary)' },
          children: 'All interactive elements meet minimum 44x44px touch target requirements',
        }),
        _jsxs('div', {
          style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
          children: [
            _jsxs('div', {
              style: { textAlign: 'center' },
              children: [
                _jsx('h4', { children: 'Standard (48px)' }),
                _jsx(MobileButton, { size: 'md', children: 'Tap Me' }),
              ],
            }),
            _jsxs('div', {
              style: { textAlign: 'center' },
              children: [
                _jsx('h4', { children: 'Large (56px)' }),
                _jsx(MobileButton, { size: 'lg', children: 'Tap Me' }),
              ],
            }),
            _jsxs('div', {
              style: { textAlign: 'center' },
              children: [
                _jsx('h4', { children: 'FAB (56px)' }),
                _jsx('button', {
                  style: {
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                    border: 'none',
                    fontSize: 24,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                  children: '+',
                }),
              ],
            }),
            _jsxs('div', {
              style: { textAlign: 'center' },
              children: [
                _jsx('h4', { children: 'Icon Button (48px)' }),
                _jsx('button', {
                  style: {
                    width: 48,
                    height: 48,
                    borderRadius: 8,
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                  children: '\u2699\uFE0F',
                }),
              ],
            }),
          ],
        }),
      ],
    }),
};
const menuItemStyle = {
  display: 'block',
  width: '100%',
  padding: '12px 16px',
  marginBottom: 8,
  background: 'none',
  border: 'none',
  textAlign: 'left',
  fontSize: 16,
  cursor: 'pointer',
  borderRadius: 8,
};
//# sourceMappingURL=Mobile.stories.js.map
