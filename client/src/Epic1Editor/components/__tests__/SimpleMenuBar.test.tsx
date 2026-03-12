import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { SimpleMenuBar } from '../SimpleMenuBar';

describe('SimpleMenuBar', () => {
  it('renders and triggers the Comfy export action when available', () => {
    const handlers = {
      onNew: jest.fn(),
      onOpen: jest.fn(),
      onSave: jest.fn(),
      onSaveAs: jest.fn(),
      onImport: jest.fn(),
      onExport: jest.fn(),
      onExportComfy: jest.fn(),
      onPsgSceneAssets: jest.fn(),
      onExpandCrowd: jest.fn()
    };

    render(<SimpleMenuBar {...handlers} />);

    expect(screen.getByText('Export PSG')).toBeInTheDocument();
    const comfyButton = screen.getByText('Export Comfy Bridge...');
    fireEvent.click(comfyButton);
    fireEvent.click(screen.getByText('PSG Scene Assets...'));
    fireEvent.click(screen.getByText('Hosted Crowd Expansion...'));

    expect(handlers.onExportComfy).toHaveBeenCalledTimes(1);
    expect(handlers.onPsgSceneAssets).toHaveBeenCalledTimes(1);
    expect(handlers.onExpandCrowd).toHaveBeenCalledTimes(1);
  });

  it('hides the Comfy export action when no handler is provided', () => {
    render(<SimpleMenuBar onOpen={jest.fn()} onSave={jest.fn()} />);

    expect(screen.queryByText('Export Comfy Bridge...')).not.toBeInTheDocument();
  });
});
