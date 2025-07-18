/**
 * Cross-platform PropertyPanel component
 */

import React, { useState } from 'react';
import { PropertyPanelProps } from '../types';

const PropertyPanel: React.FC<PropertyPanelProps> = ({ 
  platform = 'web',
  title = 'Properties',
  collapsible = true,
  children 
}) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div data-platform={platform} style={{ border: '1px solid #ddd', padding: '8px' }}>
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          cursor: collapsible ? 'pointer' : 'default'
        }}
        onClick={() => collapsible && setCollapsed(!collapsed)}
      >
        <h4>{title}</h4>
        {collapsible && <span>{collapsed ? '▶' : '▼'}</span>}
      </div>
      {!collapsed && (
        <div style={{ marginTop: '8px' }}>
          {children}
        </div>
      )}
    </div>
  );
};

export default PropertyPanel;