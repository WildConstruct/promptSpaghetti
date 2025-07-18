/**
 * Extension Detail View - Minimal implementation for build
 */

import React from 'react';

export const ExtensionDetailView = ({ extension, onEnable, onDisable, onUninstall, isEnabled }) => {
  if (!extension) {
    return React.createElement('div', { className: 'extension-detail-empty' },
      React.createElement('p', null, 'Select an extension to view details')
    );
  }

  return React.createElement('div', { className: 'extension-detail-view' },
    React.createElement('h2', null, extension.name),
    React.createElement('p', { className: 'version' }, `Version: ${extension.version}`),
    React.createElement('p', { className: 'author' }, `Author: ${extension.author || 'Unknown'}`),
    React.createElement('p', { className: 'description' }, extension.description),
    React.createElement('div', { className: 'extension-actions' },
      isEnabled
        ? React.createElement('button', { onClick: () => onDisable(extension.id) }, 'Disable')
        : React.createElement('button', { onClick: () => onEnable(extension.id) }, 'Enable'),
      React.createElement('button', { 
        onClick: () => onUninstall(extension.id),
        className: 'danger'
      }, 'Uninstall')
    )
  );
};