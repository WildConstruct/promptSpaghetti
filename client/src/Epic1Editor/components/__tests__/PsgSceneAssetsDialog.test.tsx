import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { PsgSceneAssetsDialog } from '../PsgSceneAssetsDialog';

describe('PsgSceneAssetsDialog', () => {
  beforeEach(() => {
    global.URL.createObjectURL = jest.fn(() => 'blob:preview-url');
    global.URL.revokeObjectURL = jest.fn();
  });

  it('lets the user add a reference asset and save a derived scene manifest', () => {
    const onSave = jest.fn();
    const onExportManifest = jest.fn();

    render(
      <PsgSceneAssetsDialog
        isOpen={true}
        onClose={jest.fn()}
        assets={[]}
        scene={null}
        cloudAssetReady={false}
        onSave={onSave}
        onExportManifest={onExportManifest}
        onAssembleScene={jest.fn().mockResolvedValue({
          document: { metadata: { name: 'Prompt Spaghetti Graph' } },
          assembly: {
            stillAssetIds: [],
            motionAssetIds: [],
            placements: [],
            crowdMembers: [],
            renderTargets: []
          }
        })}
        onDownloadAssembly={jest.fn()}
      />
    );

    const initialAssetIdInputs = screen.getAllByPlaceholderText('asset id');
    fireEvent.change(initialAssetIdInputs[0], {
      target: { value: 'market-style-01' }
    });
    fireEvent.change(screen.getByPlaceholderText('role'), {
      target: { value: 'market crowd style' }
    });
    fireEvent.change(screen.getByPlaceholderText('storage uri'), {
      target: { value: 'supabase://assets/market-style-01.png' }
    });
    fireEvent.click(screen.getByText('Add or Update Asset'));

    expect(screen.getByText('market-style-01')).toBeInTheDocument();

    const assetIdInputs = screen.getAllByPlaceholderText('asset id');
    fireEvent.change(assetIdInputs[1], {
      target: { value: 'market-style-01' }
    });
    fireEvent.change(screen.getByPlaceholderText('zone'), {
      target: { value: 'midground' }
    });
    fireEvent.change(screen.getByPlaceholderText('x'), {
      target: { value: '120' }
    });
    fireEvent.change(screen.getByPlaceholderText('y'), {
      target: { value: '64' }
    });
    fireEvent.click(screen.getByText('Add Placement'));
    fireEvent.click(screen.getByText('Save Scene Assets'));

    expect(onSave).toHaveBeenCalledWith({
      assets: [
        expect.objectContaining({
          id: 'market-style-01',
          kind: 'reference-still',
          storage: expect.objectContaining({
            uri: 'supabase://assets/market-style-01.png'
          })
        })
      ],
      scene: expect.objectContaining({
        stillAssetIds: ['market-style-01'],
        motionAssetIds: [],
        placements: [
          expect.objectContaining({
            assetId: 'market-style-01',
            zone: 'midground'
          })
        ]
      })
    });
  });

  it('shows saved crowd members and lets the user remove them before saving', () => {
    const onSave = jest.fn();

    render(
      <PsgSceneAssetsDialog
        isOpen={true}
        onClose={jest.fn()}
        assets={[]}
        scene={{
          stillAssetIds: [],
          motionAssetIds: [],
          placements: [],
          crowdMembers: [
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
          renderTargets: []
        }}
        cloudAssetReady={false}
        onSave={onSave}
        onExportManifest={jest.fn()}
        onAssembleScene={jest.fn()}
        onDownloadAssembly={jest.fn()}
      />
    );

    expect(screen.getByText('Merchant 1')).toBeInTheDocument();
    fireEvent.click(screen.getAllByText('Remove')[0]);
    fireEvent.click(screen.getByText('Save Scene Assets'));

    expect(onSave).toHaveBeenCalledWith({
      assets: [],
      scene: expect.objectContaining({
        crowdMembers: []
      })
    });
  });

  it('creates a reference asset stub from a crowd member and saves its placement lineage', () => {
    const onSave = jest.fn();

    render(
      <PsgSceneAssetsDialog
        isOpen={true}
        onClose={jest.fn()}
        assets={[]}
        scene={{
          stillAssetIds: [],
          motionAssetIds: [],
          placements: [],
          crowdMembers: [
            {
              id: 'guard-1',
              archetypeId: 'guard',
              label: 'Guard 1',
              zone: 'background',
              density: 'dense',
              variation: { motion: 'motion-2' },
              promptHints: ['Guard', 'background', 'motion:motion-2']
            }
          ],
          renderTargets: []
        }}
        cloudAssetReady={false}
        onSave={onSave}
        onExportManifest={jest.fn()}
        onAssembleScene={jest.fn()}
        onDownloadAssembly={jest.fn()}
      />
    );

    fireEvent.click(screen.getByText('Create Reference Asset'));
    expect(screen.getByText('guard-1-reference')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Save Scene Assets'));

    expect(onSave).toHaveBeenCalledWith({
      assets: [
        expect.objectContaining({
          id: 'guard-1-reference',
          kind: 'reference-still',
          metadata: expect.objectContaining({
            memberId: 'guard-1',
            archetypeId: 'guard'
          })
        })
      ],
      scene: expect.objectContaining({
        stillAssetIds: ['guard-1-reference'],
        placements: [
          expect.objectContaining({
            assetId: 'guard-1-reference',
            memberId: 'guard-1',
            zone: 'background'
          })
        ]
      })
    });
  });

  it('loads an existing asset into the form and saves updated URI and notes', () => {
    const onSave = jest.fn();

    render(
      <PsgSceneAssetsDialog
        isOpen={true}
        onClose={jest.fn()}
        assets={[
          {
            id: 'guard-1-reference',
            kind: 'reference-still',
            role: 'Guard 1 reference',
            storage: {
              provider: 'supabase',
              uri: 'supabase://scene-assets/guard-1-reference.png'
            },
            provenance: {
              source: 'derived'
            },
            metadata: {
              notes: 'initial stub'
            }
          }
        ]}
        scene={{
          stillAssetIds: ['guard-1-reference'],
          motionAssetIds: [],
          placements: [],
          crowdMembers: [],
          renderTargets: []
        }}
        cloudAssetReady={false}
        onSave={onSave}
        onExportManifest={jest.fn()}
        onAssembleScene={jest.fn()}
        onDownloadAssembly={jest.fn()}
      />
    );

    fireEvent.click(screen.getByText('Edit'));
    fireEvent.change(screen.getByPlaceholderText('storage uri'), {
      target: { value: 'supabase://scene-assets/guard-1-reference-v2.png' }
    });
    fireEvent.change(screen.getByPlaceholderText('notes'), {
      target: { value: 'approved pose reference' }
    });
    fireEvent.click(screen.getByText('Add or Update Asset'));
    fireEvent.click(screen.getByText('Save Scene Assets'));

    expect(onSave).toHaveBeenCalledWith({
      assets: [
        expect.objectContaining({
          id: 'guard-1-reference',
          storage: expect.objectContaining({
            uri: 'supabase://scene-assets/guard-1-reference-v2.png'
          }),
          metadata: expect.objectContaining({
            notes: 'approved pose reference'
          })
        })
      ],
      scene: expect.objectContaining({
        stillAssetIds: ['guard-1-reference']
      })
    });
  });

  it('attaches a local reference file to an existing asset stub', () => {
    const onSave = jest.fn();

    const { container } = render(
      <PsgSceneAssetsDialog
        isOpen={true}
        onClose={jest.fn()}
        assets={[
          {
            id: 'guard-1-reference',
            kind: 'reference-still',
            role: 'Guard 1 reference',
            storage: {
              provider: 'supabase',
              uri: 'supabase://scene-assets/guard-1-reference.png'
            },
            provenance: {
              source: 'derived'
            }
          }
        ]}
        scene={{
          stillAssetIds: ['guard-1-reference'],
          motionAssetIds: [],
          placements: [],
          crowdMembers: [],
          renderTargets: []
        }}
        cloudAssetReady={false}
        onSave={onSave}
        onExportManifest={jest.fn()}
        onAssembleScene={jest.fn()}
        onDownloadAssembly={jest.fn()}
      />
    );

    fireEvent.click(screen.getByText('Attach File'));
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['fake-image'], 'guard-reference.png', {
      type: 'image/png'
    });
    fireEvent.change(fileInput, {
      target: {
        files: [file]
      }
    });

    expect(screen.getByText('attached file: guard-reference.png')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Save Scene Assets'));

    expect(onSave).toHaveBeenCalledWith({
      assets: [
        expect.objectContaining({
          id: 'guard-1-reference',
          storage: expect.objectContaining({
            provider: 'local',
            uri: 'local://guard-reference.png',
            contentType: 'image/png'
          }),
          metadata: expect.objectContaining({
            localFileName: 'guard-reference.png',
            localPreviewAvailable: true
          })
        })
      ],
      scene: expect.objectContaining({
        stillAssetIds: ['guard-1-reference']
      })
    });
  });

  it('promotes a locally attached asset into a cloud-ready storage reference when cloud mode is available', () => {
    const onSave = jest.fn();

    render(
      <PsgSceneAssetsDialog
        isOpen={true}
        onClose={jest.fn()}
        assets={[
          {
            id: 'guard-1-reference',
            kind: 'reference-still',
            role: 'Guard 1 reference',
            storage: {
              provider: 'local',
              uri: 'local://guard-reference.png',
              contentType: 'image/png'
            },
            provenance: {
              source: 'derived'
            },
            metadata: {
              localFileName: 'guard-reference.png',
              localPreviewAvailable: true
            }
          }
        ]}
        scene={{
          stillAssetIds: ['guard-1-reference'],
          motionAssetIds: [],
          placements: [],
          crowdMembers: [],
          renderTargets: []
        }}
        cloudAssetReady={true}
        onSave={onSave}
        onExportManifest={jest.fn()}
        onAssembleScene={jest.fn()}
        onDownloadAssembly={jest.fn()}
      />
    );

    fireEvent.click(screen.getByText('Promote to Cloud'));
    expect(screen.getByText('cloud-ready reference')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Save Scene Assets'));

    expect(onSave).toHaveBeenCalledWith({
      assets: [
        expect.objectContaining({
          id: 'guard-1-reference',
          storage: expect.objectContaining({
            provider: 'supabase',
            uri: 'supabase://scene-assets/guard-reference.png'
          }),
          metadata: expect.objectContaining({
            cloudReady: true,
            promotedFromLocal: true
          })
        })
      ],
      scene: expect.objectContaining({
        stillAssetIds: ['guard-1-reference']
      })
    });
  });

  it('assembles the current scene through the API preview path', async () => {
    const onAssembleScene = jest.fn().mockResolvedValue({
      document: {
        metadata: {
          name: 'Prompt Spaghetti Graph'
        }
      },
      assembly: {
        stillAssetIds: ['guard-1-reference'],
        motionAssetIds: [],
        placements: [],
        crowdMembers: [],
        renderTargets: ['comfy']
      }
    });

    render(
      <PsgSceneAssetsDialog
        isOpen={true}
        onClose={jest.fn()}
        assets={[]}
        scene={{
          stillAssetIds: [],
          motionAssetIds: [],
          placements: [],
          crowdMembers: [],
          renderTargets: []
        }}
        cloudAssetReady={false}
        onSave={jest.fn()}
        onExportManifest={jest.fn()}
        onAssembleScene={onAssembleScene}
        onDownloadAssembly={jest.fn()}
      />
    );

    fireEvent.click(screen.getByText('Assemble Scene JSON'));

    await waitFor(() => {
      expect(screen.getByText(/guard-1-reference/)).toBeInTheDocument();
    });

    expect(onAssembleScene).toHaveBeenCalledTimes(1);
  });
});
