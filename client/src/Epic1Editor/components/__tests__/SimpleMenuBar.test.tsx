import React from 'react';
import { jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react';
import { buildEditorSurfacePolicy } from '../../editorSurfacePolicy';
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

    expect(screen.getByText('Export PSG...')).toBeInTheDocument();
    const comfyButton = screen.getByText('Export For Comfy...');
    fireEvent.click(comfyButton);
    fireEvent.click(screen.getByText('Advanced PSG Scene Assets...'));
    fireEvent.click(screen.getByText('Hosted Crowd Expansion (Cloud)...'));

    expect(handlers.onExportComfy).toHaveBeenCalledTimes(1);
    expect(handlers.onPsgSceneAssets).toHaveBeenCalledTimes(1);
    expect(handlers.onExpandCrowd).toHaveBeenCalledTimes(1);
  });

  it('hides the Comfy export action when no handler is provided', () => {
    render(<SimpleMenuBar onOpen={jest.fn()} onSave={jest.fn()} />);

    expect(screen.queryByText('Export For Comfy...')).not.toBeInTheDocument();
  });

  it('renders advanced and hosted-only actions from the explicit menu model', () => {
    const handlers = {
      onNew: jest.fn(),
      onOpen: jest.fn(),
      onSave: jest.fn(),
      onSaveAs: jest.fn(),
      onImport: jest.fn(),
      onExport: jest.fn(),
      onExportComfy: jest.fn(),
      onPsgSceneAssets: jest.fn(),
      onLocalSandboxGeneration: jest.fn(),
      onExpandCrowd: jest.fn(),
      onToggleAssetLibrary: jest.fn()
    };

    const policy = buildEditorSurfacePolicy({
      canExportComfy: true,
      canUseLocalSandboxGeneration: false,
      canExpandCrowdHosted: false,
      showPreview: true,
      showAssetLibrary: true,
      actions: handlers
    });

    render(<SimpleMenuBar menuModel={policy.menuModel} />);

    expect(screen.getByText('Primary handoff')).toBeInTheDocument();
    expect(screen.getByText('Advanced / hosted')).toBeInTheDocument();
    expect(screen.getByText('Export For Comfy...')).toBeEnabled();
    expect(
      screen.getByRole('button', {
        name: 'Local Sandbox Generation (Local Only)...'
      })
    ).toBeDisabled();
    expect(
      screen.getByRole('button', {
        name: 'Hosted Crowd Expansion (Cloud Only)...'
      })
    ).toBeDisabled();
  });
});
