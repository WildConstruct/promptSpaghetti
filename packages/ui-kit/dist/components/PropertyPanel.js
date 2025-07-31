import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
/**
 * Cross-platform PropertyPanel component
 */
import { useState } from 'react';
const PropertyPanel = ({ platform = 'web', title = 'Properties', collapsible = true, children }) => {
  const [collapsed, setCollapsed] = useState(false);
  return _jsxs('div', {
    'data-platform': platform,
    style: { border: '1px solid #ddd', padding: '8px' },
    children: [
      _jsxs('div', {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: collapsible ? 'pointer' : 'default',
        },
        onClick: () => collapsible && setCollapsed(!collapsed),
        children: [_jsx('h4', { children: title }), collapsible && _jsx('span', { children: collapsed ? '▶' : '▼' })],
      }),
      !collapsed && _jsx('div', { style: { marginTop: '8px' }, children: children }),
    ],
  });
};
export default PropertyPanel;
//# sourceMappingURL=PropertyPanel.js.map
