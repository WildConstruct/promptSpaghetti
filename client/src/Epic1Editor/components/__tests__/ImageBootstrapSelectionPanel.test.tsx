import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { ImageBootstrapSelectionPanel } from '../ImageBootstrapSelectionPanel';

describe('ImageBootstrapSelectionPanel', () => {
  it('renders bootstrap provenance and triggers refinement', () => {
    const onRefine = jest.fn();
    const onPreview = jest.fn();
    const onChangePreviewBackend = jest.fn();
    const onChangePreviewModel = jest.fn();
    const onChangeScenePreviewMode = jest.fn();
    const onClearSavedScenePreview = jest.fn();
    const onOpenScenePreview = jest.fn();
    const onPopulateSceneSurface = jest.fn();

    render(
      <ImageBootstrapSelectionPanel
        summary={{
          bootstrapGroupId: 'bootstrap-group-1',
          bootstrapMode: 'prop-variation',
          assetIds: ['prop-1'],
          analysisSources: [
            {
              assetId: 'prop-1',
              fixtureId: 'hero-prop-venue',
              selectionMode: 'heuristic'
            }
          ],
          preferredComparableRefs: [
            {
              id: 'comp-1',
              label: 'similar prop',
              reasonCodes: ['fixture-comparable']
            }
          ],
          forceSynthesisKeys: ['damage_pattern'],
          lockedTraitKeys: ['world_style'],
          variableTraitKeys: ['damage_pattern'],
          notes: 'Prefer the rusted venue prop family'
        }}
        previewBackends={[
          {
            id: 'mock-image-preview',
            mode: 'mock',
            label: 'Mock Image Preview',
            profile: 'bootstrap',
            model: 'bootstrap-deterministic-v1',
            supportedModels: ['bootstrap-deterministic-v1', 'bootstrap-fast-v1']
          }
        ]}
        selectedPreviewBackendId="mock-image-preview"
        selectedPreviewModel="bootstrap-fast-v1"
        onChangePreviewBackend={onChangePreviewBackend}
        onChangePreviewModel={onChangePreviewModel}
        scenePreviewPlacementCount={3}
        scenePreviewMode="isolated"
        onChangeScenePreviewMode={onChangeScenePreviewMode}
        highlightSceneBiasSurface="wall"
        onClearSavedScenePreview={onClearSavedScenePreview}
        onOpenScenePreview={onOpenScenePreview}
        onPopulateSceneSurface={onPopulateSceneSurface}
        onPreview={onPreview}
        canPreview={true}
        onRefine={onRefine}
      />
    );

    expect(
      screen.getByText(/prop-variation grounded in selected refs/i)
    ).toBeTruthy();
    expect(screen.getByText(/hero-prop-venue \(heuristic\)/i)).toBeTruthy();
    expect(screen.getByText('similar prop')).toBeTruthy();
    expect(screen.getByText(/similar prop · fixture-comparable/i)).toBeTruthy();
    expect(screen.getByText('damage_pattern')).toBeTruthy();
    expect(screen.getByText(/Prefer the rusted venue prop family/i)).toBeTruthy();
    expect(
      screen.getByText(/3 placements saved for this bootstrap · isolated/i)
    ).toBeTruthy();
    expect(screen.getByText(/Active scene bias/i)).toBeTruthy();
    expect(screen.getByText(/wall: similar prop/i)).toHaveStyle(
      'background: rgba(250, 204, 21, 0.16)'
    );
    expect(screen.getByText(/why: fixture-comparable/i)).toBeTruthy();
    expect(screen.getByText(/floor: similar prop/i)).toBeTruthy();
    expect(
      screen.getByRole('button', { name: /Populate wall: similar prop/i })
    ).toBeTruthy();
    expect(
      screen.getByRole('button', { name: /Populate floor: similar prop/i })
    ).toBeTruthy();
    expect(
      screen.getByText(
        /Active bootstrap preview target: Mock Image Preview · bootstrap-fast-v1 · bootstrap-oriented/i
      )
    ).toBeTruthy();
    expect(screen.getByLabelText(/bootstrap preview backend/i)).toBeTruthy();
    expect(screen.getByLabelText(/bootstrap preview model/i)).toBeTruthy();

    fireEvent.change(screen.getByLabelText(/bootstrap preview backend/i), {
      target: { value: 'mock-image-preview' }
    });
    fireEvent.change(screen.getByLabelText(/bootstrap preview model/i), {
      target: { value: 'bootstrap-deterministic-v1' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Preview Bootstrap...' }));
    fireEvent.click(screen.getByRole('button', { name: 'Use grouped' }));
    fireEvent.click(screen.getByRole('button', { name: /Populate wall: similar prop/i }));
    fireEvent.click(screen.getByRole('button', { name: /Populate floor: similar prop/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Open scene preview' }));
    fireEvent.click(
      screen.getByRole('button', { name: 'Clear saved scene preview' })
    );
    fireEvent.click(screen.getByRole('button', { name: 'Refine Bootstrap...' }));

    expect(onPreview).toHaveBeenCalledTimes(1);
    expect(onChangeScenePreviewMode).toHaveBeenCalledWith('grouped');
    expect(onChangePreviewBackend).toHaveBeenCalledWith('mock-image-preview');
    expect(onChangePreviewModel).toHaveBeenCalledWith(
      'bootstrap-deterministic-v1'
    );
    expect(onPopulateSceneSurface).toHaveBeenNthCalledWith(1, 'wall');
    expect(onPopulateSceneSurface).toHaveBeenNthCalledWith(2, 'floor');
    expect(onOpenScenePreview).toHaveBeenCalledTimes(1);
    expect(onClearSavedScenePreview).toHaveBeenCalledTimes(1);
    expect(onRefine).toHaveBeenCalledTimes(1);
  });

  it('shows queued refinement state from a scene-picked family', () => {
    const onClearQueuedRefinement = jest.fn();

    render(
      <ImageBootstrapSelectionPanel
        summary={{
          bootstrapGroupId: 'bootstrap-group-1',
          bootstrapMode: 'prop-variation',
          assetIds: ['prop-1'],
          analysisSources: [
            {
              assetId: 'prop-1',
              fixtureId: 'hero-prop-venue',
              selectionMode: 'heuristic'
            }
          ],
          preferredComparableRefs: [
            {
              id: 'comp-2',
              label: 'neon wall sign'
            },
            {
              id: 'comp-1',
              label: 'similar prop'
            }
          ],
          forceSynthesisKeys: ['damage_pattern'],
          lockedTraitKeys: ['world_style'],
          variableTraitKeys: ['damage_pattern'],
          notes: 'Scene preview promoted wall family: neon wall sign'
        }}
        onClearQueuedRefinement={onClearQueuedRefinement}
      />
    );

    expect(screen.getByText(/Queued refinement: neon wall sign/i)).toBeTruthy();
    expect(screen.getByText(/lock: world_style/i)).toBeTruthy();
    expect(screen.getByText(/force synth: damage_pattern/i)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Clear queued refinement' }));
    expect(onClearQueuedRefinement).toHaveBeenCalledTimes(1);
  });

  it('renders inline preview results after insertion', () => {
    const onRerollPreviewResult = jest.fn();
    const onPromotePreviewResult = jest.fn();
    const onRefreshPreview = jest.fn();

    render(
      <ImageBootstrapSelectionPanel
        summary={{
          bootstrapGroupId: 'bootstrap-group-1',
          bootstrapMode: 'prop-variation',
          assetIds: ['prop-1'],
          analysisSources: [],
          preferredComparableRefs: [],
          forceSynthesisKeys: [],
          lockedTraitKeys: ['world_style'],
          variableTraitKeys: ['damage_pattern'],
          notes: 'Prefer the rusted venue prop family'
        }}
        onPreview={() => undefined}
        onRefreshPreview={onRefreshPreview}
        onRerollPreviewResult={onRerollPreviewResult}
        onPromotePreviewResult={onPromotePreviewResult}
        canPreview={true}
        promotedPreviewResultId="preview-1"
        previewMeta={{
          updatedAt: new Date('2026-03-16T12:34:00Z').getTime(),
          state: 'cached'
        }}
        previewResponse={{
          ok: true,
          document: {
            version: 'psg/1',
            kind: 'fragment',
            metadata: {},
            fragment: {
              version: '0.2',
              rootNodeId: 'output-1',
              nodes: [
                {
                  id: 'output-1',
                  type: 'output',
                  title: 'Output',
                  text: 'preview'
                }
              ]
            },
            assets: []
          },
          checkpoint: {
            requestId: 'req-1',
            bootstrapMode: 'prop-variation',
            analyses: [],
            exactMatches: [],
            comparableMatches: [],
            uncertainTraitKeys: [],
            guidance: {}
          },
          preview: {
            backend: {
              id: 'mock-preview',
              mode: 'mock',
              label: 'Mock Preview',
              profile: 'scene',
              model: 'preview-v1'
            },
            count: 1,
            seed: 1234,
            promptBlueprint: 'world_style + damage_pattern',
            results: [
              {
                id: 'preview-1',
                seed: 1234,
                prompt: 'preview prompt',
                imageUrl: 'https://example.com/preview.png',
                width: 512,
                height: 512,
                metadata: {
                  assetIds: ['prop-1'],
                  preferredComparableLabels: [
                    'neon wall sign',
                    'rusted venue chair'
                  ],
                  lockedTraitKeys: ['world_style'],
                  variableTraitKeys: ['damage_pattern']
                }
              }
            ]
          },
          issues: []
        }}
      />
    );

    expect(screen.getByText(/Mock Preview · preview-v1/i)).toBeTruthy();
    expect(screen.getByText(/world_style \+ damage_pattern/i)).toBeTruthy();
    expect(screen.getByText(/seed: 1234/i)).toBeTruthy();
    expect(
      screen.getByText(/Scene-oriented preview set · grouped by nearby comparable families/i)
    ).toBeTruthy();
    expect(
      screen.getByText(/families: neon wall sign, rusted venue chair/i)
    ).toBeTruthy();
    expect(screen.getByText(/Promoted to queued refinement/i)).toBeTruthy();
    expect(screen.getByText(/Cached preview/i)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Refresh all' }));
    fireEvent.click(screen.getByRole('button', { name: 'Reroll' }));
    fireEvent.click(screen.getByRole('button', { name: 'Promote' }));

    expect(onRefreshPreview).toHaveBeenCalledTimes(1);
    expect(onRerollPreviewResult).toHaveBeenCalledWith('preview-1');
    expect(onPromotePreviewResult).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'preview-1'
      })
    );
  });
});
