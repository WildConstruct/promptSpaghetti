import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { PsgCrowdExpansionDialog } from '../PsgCrowdExpansionDialog';

describe('PsgCrowdExpansionDialog', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        kind: 'crowd-plan',
        document: {
          version: 'psg/1',
          kind: 'crowd-plan',
          metadata: { name: 'Hosted Crowd Expansion' },
          crowd: {
            count: 1,
            archetypes: [{ id: 'merchant', label: 'Merchant', weight: 2 }],
            variationAxes: ['emotion'],
            placement: {
              zones: ['foreground'],
              density: 'medium'
            }
          }
        },
        members: [
          {
            id: 'merchant-1',
            archetypeId: 'merchant',
            label: 'Merchant 1',
            zone: 'foreground',
            density: 'medium',
            variation: { emotion: 'emotion-1' },
            promptHints: ['Merchant', 'foreground']
          }
        ],
        issues: []
      })
    } as Response);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('generates hosted crowd members and applies them to the scene sidecar', async () => {
    const onApply = jest.fn();

    render(
      <PsgCrowdExpansionDialog
        isOpen={true}
        onClose={jest.fn()}
        psgAccessMode="cloud"
        hostedUpgradeOperations={['expand-crowd']}
        existingScene={{
          stillAssetIds: [],
          motionAssetIds: [],
          placements: [],
          crowdMembers: [],
          renderTargets: []
        }}
        onApply={onApply}
      />
    );

    expect(
      screen.getByText(
        'This is a hosted PSG upgrade helper. It previews structured crowd members before you save them into the scene manifest.'
      )
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText('Generate Preview'));

    await waitFor(() => {
      expect(screen.getByText('Merchant 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Save Crowd to Scene'));

    expect(onApply).toHaveBeenCalledWith({
      crowdMembers: [
        expect.objectContaining({
          id: 'merchant-1',
          archetypeId: 'merchant'
        })
      ]
    });
  });
});
