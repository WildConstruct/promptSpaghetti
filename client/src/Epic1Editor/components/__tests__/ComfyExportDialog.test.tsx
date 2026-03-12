import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ComfyExportDialog } from '../ComfyExportDialog';

describe('ComfyExportDialog', () => {
  it('renders a generated workflow preview and downloads it on confirmation', async () => {
    const buildComfyBridge = jest.fn().mockResolvedValue({
      workflow: {
        version: 'promptscape-comfy/1',
        metadata: {
          name: 'Prompt Spaghetti Graph',
          sourceKind: 'fragment',
          sourceVersion: 'psg/1'
        },
        nodes: {
          '1': {
            id: '1',
            class_type: 'PromptScapeOutput',
            inputs: { input_1: ['0', 0] },
            _meta: {
              title: 'Output',
              promptscapeType: 'Output'
            }
          }
        },
        outputNodeIds: ['1']
      }
    });
    const onDownload = jest.fn();

    render(
      <ComfyExportDialog
        isOpen={true}
        onClose={jest.fn()}
        onDownload={onDownload}
        buildComfyBridge={buildComfyBridge}
        currentNodes={[]}
        currentEdges={[]}
        runtimeMode="cloud"
        psgAccessMode="cloud"
        subscriptionState="active"
        psgCloudAvailable={true}
        psgLocalAvailable={true}
        localOperations={['validate', 'normalize', 'export-comfy']}
        hostedUpgradeOperations={['expand-crowd']}
        sceneAssetSummary={{
          totalAssets: 3,
          derivedAssets: 1,
          placements: 2,
          crowdMembers: 12
        }}
      />
    );

    await waitFor(() => {
      expect(
        screen.getByText('Review the generated bridge payload before downloading it.')
      ).toBeInTheDocument();
    });

    expect(screen.getByText('Comfy bridge JSON')).toBeInTheDocument();
    expect(screen.getByText('Hosted PSG available')).toBeInTheDocument();
    expect(screen.getByText('Local export available')).toBeInTheDocument();
    expect(screen.getByText('Included Locally')).toBeInTheDocument();
    expect(screen.getByText('Hosted Upgrade Path')).toBeInTheDocument();
    expect(screen.getByText(/expand-crowd/)).toBeInTheDocument();
    expect(screen.getByText('3 assets')).toBeInTheDocument();
    expect(screen.getByText('1 derived, 2 placements')).toBeInTheDocument();
    expect(screen.getByText('12 members')).toBeInTheDocument();
    expect(screen.getByText(/promptscape-comfy\/1/)).toBeInTheDocument();

    fireEvent.click(screen.getByText('Download JSON'));

    expect(onDownload).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          name: 'Prompt Spaghetti Graph'
        })
      }),
      'Prompt Spaghetti Graph'
    );
  });
});
