import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { PsgCrowdExpansionDialog } from '../PsgCrowdExpansionDialog';

jest.mock('@promptscape/core/services/psg', () => ({
  ApiPsgClient: jest.fn().mockImplementation(() => ({
    expandCrowd: jest.fn().mockResolvedValue({
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
      ]
    })
  }))
}));

describe('PsgCrowdExpansionDialog', () => {
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
