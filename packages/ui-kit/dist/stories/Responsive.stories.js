import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from 'react/jsx-runtime';
/**
 * Responsive framework stories
 */
import React from 'react';
import { Row, Col, Container, CollapsiblePanel, AdaptiveLayout, ResponsiveTabs } from '../responsive';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useEnhancedResponsive, useBreakpointValue } from '../responsive/utilities';
const meta = {
  title: 'Responsive/Overview',
  parameters: {
    layout: 'fullscreen',
  },
};
export default meta;
// Helper component to show current breakpoint
const BreakpointIndicator = () => {
  const { breakpoint, width, height, device } = useEnhancedResponsive();
  return _jsxs('div', {
    style: {
      position: 'fixed',
      top: 10,
      right: 10,
      padding: '8px 16px',
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      borderRadius: 4,
      fontSize: 12,
      zIndex: 9999,
    },
    children: [
      _jsxs('div', { children: ['Breakpoint: ', _jsx('strong', { children: breakpoint })] }),
      _jsxs('div', { children: ['Viewport: ', width, ' \u00D7 ', height] }),
      _jsxs('div', { children: ['Device: ', device?.type] }),
    ],
  });
};
// Grid System Demo
export const GridSystemDemo = {
  render: () =>
    _jsxs(_Fragment, {
      children: [
        _jsx(BreakpointIndicator, {}),
        _jsxs(Container, {
          maxWidth: 'xl',
          children: [
            _jsx('h2', { children: 'Responsive Grid System' }),
            _jsx('p', { children: 'Resize your viewport to see the grid adapt' }),
            _jsxs(Row, {
              spacing: 2,
              children: [
                _jsx(Col, {
                  xs: 12,
                  md: 6,
                  lg: 4,
                  children: _jsxs(Card, {
                    children: [
                      _jsx('h3', { children: 'Column 1' }),
                      _jsx('p', { children: '12 cols on mobile, 6 on tablet, 4 on desktop' }),
                    ],
                  }),
                }),
                _jsx(Col, {
                  xs: 12,
                  md: 6,
                  lg: 4,
                  children: _jsxs(Card, {
                    children: [
                      _jsx('h3', { children: 'Column 2' }),
                      _jsx('p', { children: '12 cols on mobile, 6 on tablet, 4 on desktop' }),
                    ],
                  }),
                }),
                _jsx(Col, {
                  xs: 12,
                  md: 12,
                  lg: 4,
                  children: _jsxs(Card, {
                    children: [
                      _jsx('h3', { children: 'Column 3' }),
                      _jsx('p', { children: '12 cols on mobile/tablet, 4 on desktop' }),
                    ],
                  }),
                }),
              ],
            }),
            _jsx('h3', { style: { marginTop: 32 }, children: 'Nested Grid' }),
            _jsxs(Row, {
              spacing: 3,
              children: [
                _jsx(Col, {
                  xs: 12,
                  lg: 8,
                  children: _jsxs(Card, {
                    children: [
                      _jsx('h4', { children: 'Main Content' }),
                      _jsxs(Row, {
                        spacing: 2,
                        children: [
                          _jsx(Col, {
                            xs: 6,
                            children: _jsx('div', {
                              style: { background: '#f0f0f0', padding: 16 },
                              children: 'Nested Col 1',
                            }),
                          }),
                          _jsx(Col, {
                            xs: 6,
                            children: _jsx('div', {
                              style: { background: '#f0f0f0', padding: 16 },
                              children: 'Nested Col 2',
                            }),
                          }),
                        ],
                      }),
                    ],
                  }),
                }),
                _jsx(Col, {
                  xs: 12,
                  lg: 4,
                  children: _jsxs(Card, {
                    children: [
                      _jsx('h4', { children: 'Sidebar' }),
                      _jsx('p', { children: 'Stacks on mobile, side-by-side on desktop' }),
                    ],
                  }),
                }),
              ],
            }),
          ],
        }),
      ],
    }),
};
// Adaptive Layout Demo
export const AdaptiveLayoutDemo = {
  render: () => {
    const [sidebarOpen, setSidebarOpen] = React.useState(false);
    return _jsxs(_Fragment, {
      children: [
        _jsx(BreakpointIndicator, {}),
        _jsx(AdaptiveLayout, {
          header: _jsx('div', {
            style: { padding: 16, background: '#f0f0f0' },
            children: _jsx('h2', { children: 'Adaptive Layout Header' }),
          }),
          sidebar: _jsxs('div', {
            style: { padding: 16 },
            children: [
              _jsx('h3', { children: 'Sidebar' }),
              _jsx('p', { children: 'Auto-collapses on mobile' }),
              _jsx(Button, { onClick: () => setSidebarOpen(false), children: 'Close Sidebar' }),
            ],
          }),
          sidebarCollapseOn: ['xs', 'sm'],
          main: _jsxs(Container, {
            children: [
              _jsx('h2', { children: 'Main Content Area' }),
              _jsx('p', { children: 'The sidebar automatically collapses on small screens.' }),
              _jsx(Button, { onClick: () => setSidebarOpen(true), children: 'Open Sidebar' }),
              _jsxs(Row, {
                spacing: 2,
                style: { marginTop: 24 },
                children: [
                  _jsx(Col, {
                    xs: 12,
                    md: 6,
                    children: _jsxs(Card, {
                      children: [
                        _jsx('h3', { children: 'Feature 1' }),
                        _jsx('p', { children: 'Responsive card content' }),
                      ],
                    }),
                  }),
                  _jsx(Col, {
                    xs: 12,
                    md: 6,
                    children: _jsxs(Card, {
                      children: [
                        _jsx('h3', { children: 'Feature 2' }),
                        _jsx('p', { children: 'Responsive card content' }),
                      ],
                    }),
                  }),
                ],
              }),
            ],
          }),
          footer: _jsx('div', {
            style: { padding: 16, background: '#f0f0f0', textAlign: 'center' },
            children: 'Footer Content',
          }),
        }),
      ],
    });
  },
};
// Collapsible Panels Demo
export const CollapsiblePanelsDemo = {
  render: () =>
    _jsxs(_Fragment, {
      children: [
        _jsx(BreakpointIndicator, {}),
        _jsxs(Container, {
          maxWidth: 'lg',
          children: [
            _jsx('h2', { children: 'Collapsible Panels' }),
            _jsx('p', { children: 'Panels can auto-collapse based on breakpoints' }),
            _jsxs('div', {
              style: { marginTop: 24 },
              children: [
                _jsx(CollapsiblePanel, {
                  title: 'Always Collapsible',
                  icon: '\uD83D\uDCC1',
                  actions: _jsx(Button, { size: 'sm', children: 'Action' }),
                  children: _jsx('p', { children: 'This panel is always collapsible. Click the header to toggle.' }),
                }),
                _jsxs(CollapsiblePanel, {
                  title: 'Collapses on Mobile',
                  icon: '\uD83D\uDCF1',
                  collapseOn: ['xs', 'sm'],
                  defaultOpen: true,
                  children: [
                    _jsx('p', { children: 'This panel automatically collapses on mobile devices.' }),
                    _jsx('p', { children: 'Resize your viewport to see it in action.' }),
                  ],
                }),
                _jsx(CollapsiblePanel, {
                  title: 'Not Collapsible',
                  icon: '\uD83D\uDD12',
                  collapsible: false,
                  children: _jsx('p', { children: 'This panel cannot be collapsed by the user.' }),
                }),
              ],
            }),
          ],
        }),
      ],
    }),
};
// Responsive Tabs Demo
export const ResponsiveTabsDemo = {
  render: () => {
    const tabs = [
      {
        id: 'overview',
        label: 'Overview',
        icon: '📊',
        content: _jsxs('div', {
          children: [
            _jsx('h3', { children: 'Overview Content' }),
            _jsx('p', { children: 'This is the overview tab content.' }),
          ],
        }),
      },
      {
        id: 'details',
        label: 'Details',
        icon: '📋',
        content: _jsxs('div', {
          children: [
            _jsx('h3', { children: 'Details Content' }),
            _jsx('p', { children: 'This is the details tab content.' }),
          ],
        }),
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: '⚙️',
        content: _jsxs('div', {
          children: [
            _jsx('h3', { children: 'Settings Content' }),
            _jsx('p', { children: 'This is the settings tab content.' }),
          ],
        }),
      },
      {
        id: 'help',
        label: 'Help',
        icon: '❓',
        content: _jsxs('div', {
          children: [
            _jsx('h3', { children: 'Help Content' }),
            _jsx('p', { children: 'This is the help tab content.' }),
          ],
        }),
        disabled: true,
      },
    ];
    return _jsxs(_Fragment, {
      children: [
        _jsx(BreakpointIndicator, {}),
        _jsxs(Container, {
          maxWidth: 'lg',
          children: [
            _jsx('h2', { children: 'Responsive Tabs' }),
            _jsx('p', { children: 'Tabs stack vertically on mobile devices' }),
            _jsxs('div', {
              style: { marginTop: 24 },
              children: [
                _jsx('h3', { children: 'Default Variant' }),
                _jsx(ResponsiveTabs, { tabs: tabs, variant: 'default' }),
              ],
            }),
            _jsxs('div', {
              style: { marginTop: 48 },
              children: [
                _jsx('h3', { children: 'Pills Variant' }),
                _jsx(ResponsiveTabs, { tabs: tabs, variant: 'pills' }),
              ],
            }),
            _jsxs('div', {
              style: { marginTop: 48 },
              children: [
                _jsx('h3', { children: 'Underline Variant' }),
                _jsx(ResponsiveTabs, { tabs: tabs, variant: 'underline' }),
              ],
            }),
            _jsxs('div', {
              style: { marginTop: 48 },
              children: [
                _jsx('h3', { children: 'Vertical Orientation' }),
                _jsx(ResponsiveTabs, { tabs: tabs, orientation: 'vertical', stackOn: [] }),
              ],
            }),
          ],
        }),
      ],
    });
  },
};
// Responsive Values Demo
export const ResponsiveValuesDemo = {
  render: () => {
    const padding = useBreakpointValue(
      {
        xs: 8,
        sm: 12,
        md: 16,
        lg: 24,
        xl: 32,
      },
      16
    );
    const columns = useBreakpointValue(
      {
        xs: 1,
        sm: 2,
        md: 3,
        lg: 4,
      },
      1
    );
    return _jsxs(_Fragment, {
      children: [
        _jsx(BreakpointIndicator, {}),
        _jsxs(Container, {
          children: [
            _jsx('h2', { children: 'Responsive Values' }),
            _jsx('p', { children: 'Values change based on breakpoint' }),
            _jsxs('div', {
              style: {
                padding: padding,
                background: '#f0f0f0',
                borderRadius: 8,
                marginTop: 24,
              },
              children: [
                _jsxs('p', { children: ['Current padding: ', padding, 'px'] }),
                _jsxs('p', { children: ['Current columns: ', columns] }),
              ],
            }),
            _jsx('div', {
              style: {
                display: 'grid',
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                gap: 16,
                marginTop: 24,
              },
              children: Array.from({ length: 8 }).map((_, i) =>
                _jsxs(
                  Card,
                  { children: [_jsxs('h4', { children: ['Item ', i + 1] }), _jsx('p', { children: 'Grid item' })] },
                  i
                )
              ),
            }),
          ],
        }),
      ],
    });
  },
};
//# sourceMappingURL=Responsive.stories.js.map
