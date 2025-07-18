/**
 * Extension List View - Minimal implementation for build
 */

import React from 'react';

export const ExtensionListView = ({ extensions = [], onSelectExtension, selectedId }) => {
  return React.createElement('div', { className: 'extension-list-view' },
    React.createElement('h3', null, 'Extensions'),
    React.createElement('div', { className: 'extension-list' },
      extensions.length === 0 
        ? React.createElement('p', null, 'No extensions found')
        : extensions.map(extension =>
            React.createElement('div', {
              key: extension.id,
              className: `extension-item ${selectedId === extension.id ? 'selected' : ''}`,
              onClick: () => onSelectExtension(extension.id)
            },
              React.createElement('h4', null, extension.name),
              React.createElement('p', null, extension.description),
              React.createElement('span', { className: 'version' }, `v${extension.version}`)
            )
          )
    )
  );
};