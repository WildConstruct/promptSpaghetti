import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { PsgImageBootstrapDialog } from '../PsgImageBootstrapDialog';

const analyzeImages = jest.fn();
const reviewImages = jest.fn();
const draftImageGraph = jest.fn();
const previewImages = jest.fn();

jest.mock('@promptscape/core/services/psg', () => ({
  ApiPsgClient: jest.fn().mockImplementation(() => ({
    analyzeImages,
    reviewImages,
    draftImageGraph,
    previewImages
  }))
}));

jest.mock('../../utils/psgDocument', () => ({
  loadReactFlowFromPsgContent: jest.fn(() => ({
    nodes: [
      {
        id: 'draft-node-1',
        type: 'textBlock',
        position: { x: 100, y: 100 },
        data: { label: 'Draft Node' }
      }
    ],
    edges: []
  }))
}));

describe('PsgImageBootstrapDialog', () => {
  beforeEach(() => {
    analyzeImages.mockReset();
    reviewImages.mockReset();
    draftImageGraph.mockReset();
    previewImages.mockReset();
  });

  it('analyzes image assets and applies a reviewed graph draft', async () => {
    const onApplyDraft = jest.fn();

    analyzeImages.mockResolvedValue({
      checkpoint: {
        reviewId: 'review-1',
        bootstrapMode: 'prop-variation',
        analyses: [
          {
            assetId: 'prop-1',
            subjectKind: 'prop',
            bootstrapMode: 'prop-variation',
            analysisSource: {
              fixtureId: 'hero-prop-venue',
              selectionMode: 'heuristic'
            },
            subjects: [
              {
                id: 'prop-1-subject-1',
                subjectKind: 'prop',
                label: 'hero-prop',
                primary: true,
                regionIds: ['prop-1-region-1'],
                tags: []
              }
            ],
            regions: [
              {
                id: 'prop-1-region-1',
                label: 'hero-prop',
                kind: 'subject',
                tags: []
              }
            ],
            lockedTraits: [
              {
                key: 'world_style',
                value: 'weathered stage prop',
                classification: 'locked',
                confidence: 0.62,
                provenance: ['multimodal-model'],
                evidence: [],
                conflicts: []
              }
            ],
            variableTraits: [
              {
                key: 'damage_pattern',
                value: 'surface wear',
                classification: 'variable',
                confidence: 0.58,
                provenance: ['segmentation', 'multimodal-model'],
                evidence: [],
                conflicts: []
              }
            ],
            variationAxes: [],
            segmentationFindings: [],
            modelFindings: [],
            comparableSearchTerms: [],
            confidence: 0.6
          }
        ],
        exactMatches: [],
        comparableMatches: [
          {
            id: 'comp-1',
            origin: 'comparable',
            kind: 'asset',
            label: 'saved venue prop family',
            score: 0.89,
            reasonCodes: ['saved-reuse-signal', 'asset-bootstrap-preference'],
            sourceRef: 'fixture://saved-venue-prop-family'
          }
        ],
        uncertainTraits: [
          {
            key: 'damage_pattern',
            value: 'surface wear',
            classification: 'variable',
            confidence: 0.58,
            provenance: ['segmentation', 'multimodal-model'],
            evidence: [],
            conflicts: []
          }
        ]
      }
    });

    reviewImages.mockResolvedValue({
      checkpoint: {
        reviewId: 'review-1',
        bootstrapMode: 'prop-variation',
        analyses: [
          {
            assetId: 'prop-1',
            subjectKind: 'prop',
            bootstrapMode: 'prop-variation',
            analysisSource: {
              fixtureId: 'hero-prop-venue',
              selectionMode: 'explicit'
            },
            subjects: [
              {
                id: 'prop-1-subject-1',
                subjectKind: 'prop',
                label: 'hero-prop',
                primary: true,
                regionIds: [],
                tags: []
              }
            ],
            regions: [],
            lockedTraits: [
              {
                key: 'world_style',
                value: 'weathered stage prop',
                classification: 'locked',
                confidence: 0.87,
                provenance: ['multimodal-model', 'human'],
                evidence: [],
                conflicts: []
              }
            ],
            variableTraits: [
              {
                key: 'damage_pattern',
                value: 'surface wear',
                classification: 'variable',
                confidence: 0.83,
                provenance: ['segmentation', 'multimodal-model', 'human'],
                evidence: [],
                conflicts: []
              }
            ],
            variationAxes: [],
            segmentationFindings: [],
            modelFindings: [],
            comparableSearchTerms: [],
            confidence: 0.85
          }
        ],
        exactMatches: [],
        comparableMatches: [
          {
            id: 'comp-1',
            origin: 'comparable',
            kind: 'asset',
            label: 'saved venue prop family',
            score: 0.89,
            reasonCodes: ['saved-reuse-signal', 'asset-bootstrap-preference'],
            sourceRef: 'fixture://saved-venue-prop-family'
          }
        ],
        uncertainTraits: [],
        guidance: {
          bootstrapMode: 'prop-variation',
          primarySubjectId: 'prop-1-subject-1',
          excludedRegionIds: ['prop-1-region-1'],
          lockedTraitKeys: ['world_style'],
          variableTraitKeys: ['damage_pattern'],
          rejectedTraitKeys: [],
          addedLockedTraits: [],
          addedVariableTraits: [],
          explicitFixtureSelections: [
            {
              assetId: 'prop-1',
              fixtureId: 'hero-prop-venue'
            }
          ],
          preferredComparableMatchIds: ['comp-1'],
          forceSynthesisKeys: ['damage_pattern']
        }
      }
    });

    draftImageGraph.mockResolvedValue({
      draftFragment: {
        version: '1.0.0',
        name: 'Draft',
        nodes: [],
        edges: []
      }
    });
    previewImages.mockResolvedValue({
      checkpoint: {
        reviewId: 'review-1',
        bootstrapMode: 'prop-variation',
        analyses: [],
        exactMatches: [],
        comparableMatches: [],
        uncertainTraits: []
      },
      preview: {
        backend: {
          id: 'mock-image-preview',
          mode: 'mock',
          label: 'Mock Image Preview',
          model: 'bootstrap-deterministic-v1'
        },
        count: 2,
        seed: 7001,
        promptBlueprint: 'locked:world_style | vary:damage_pattern',
        results: [
          {
            id: 'preview-1',
            seed: 7001,
            prompt: 'locked:world_style | vary:damage_pattern | sample:1',
            imageUrl: 'mock://image-preview/mock-image-preview/7001',
            width: 768,
            height: 768,
            metadata: {
              assetIds: ['prop-1'],
              preferredComparableLabels: ['similar prop'],
              lockedTraitKeys: ['world_style'],
              variableTraitKeys: ['damage_pattern']
            }
          }
        ]
      }
    });

    render(
      <PsgImageBootstrapDialog
        isOpen={true}
        onClose={jest.fn()}
        document={{
          version: 'psg/1',
          kind: 'fragment',
          metadata: { name: 'Working Graph' },
          fragment: {
            version: '1.0.0',
            name: 'Working Graph',
            nodes: [],
            edges: []
          },
          assets: [],
          scene: undefined
        }}
        assets={[
          {
            id: 'prop-1',
            kind: 'reference-still',
            role: 'hero-prop',
            storage: {
              provider: 'local',
              uri: 'file://prop.png',
              contentType: 'image/png'
            },
            provenance: {
              source: 'upload'
            }
          }
        ]}
        psgAccessMode="cloud"
        hostedUpgradeOperations={[
          'images-analyze',
          'images-review',
          'images-draft-graph',
          'images-preview'
        ]}
        previewBackends={[
          {
            id: 'mock-image-preview',
            mode: 'mock',
            label: 'Mock Image Preview',
            profile: 'bootstrap',
            model: 'bootstrap-deterministic-v1',
            supportedModels: ['bootstrap-deterministic-v1', 'bootstrap-fast-v1']
          },
          {
            id: 'mock-scene-preview',
            mode: 'mock',
            label: 'Mock Scene Preview',
            profile: 'scene',
            model: 'scene-comprehension-v1',
            supportedModels: ['scene-comprehension-v1']
          }
        ]}
        selectedPreviewBackendId="mock-scene-preview"
        selectedPreviewModel="scene-comprehension-v1"
        onChangePreviewBackend={() => undefined}
        onChangePreviewModel={() => undefined}
        initialSelectionSummary={{
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
              label: 'saved venue prop family'
            }
          ],
          forceSynthesisKeys: ['damage_pattern'],
          lockedTraitKeys: ['world_style'],
          variableTraitKeys: ['damage_pattern'],
          notes: 'Scene preview promoted wall family: similar prop'
        }}
        onApplyDraft={onApplyDraft}
      />
    );

    expect(screen.getByText('Refine Image Bootstrap')).toBeTruthy();
    expect(screen.getByText(/Scene-promoted refinement queued/i)).toBeTruthy();
    expect(
      screen.getByText(/preferred family: saved venue prop family/i)
    ).toBeTruthy();
    expect(screen.getByText(/locked traits: world_style/i)).toBeTruthy();
    expect(screen.getByText(/force synthesis: damage_pattern/i)).toBeTruthy();
    expect(
      screen.getByText(/replace bootstrap group bootstrap-group-1 in place/i)
    ).toBeTruthy();
    expect(
      screen.getByText(
        /Active bootstrap preview target: Mock Scene Preview · scene-comprehension-v1 · scene-oriented/i
      )
    ).toBeTruthy();
    expect(screen.getByLabelText(/bootstrap preview backend/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/bootstrap preview model/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText('Analyze Images'));

    await waitFor(() => {
      expect(screen.getByText('Review Checkpoint')).toBeInTheDocument();
    });
    expect(screen.getByText(/hero-prop-venue \(heuristic\)/i)).toBeInTheDocument();
    expect(screen.getByText('Saved reuse signal')).toBeInTheDocument();
    expect(screen.getByText(/source fixture:\/\/saved-venue-prop-family/i)).toBeTruthy();
    fireEvent.click(screen.getByLabelText(/lock explicitly/i));

    fireEvent.change(screen.getByLabelText(/preview count/i), {
      target: { value: '2' }
    });
    fireEvent.change(screen.getByLabelText(/^seed$/i), {
      target: { value: '7001' }
    });
    fireEvent.click(screen.getByText('Generate Preview'));

    await waitFor(() => {
      expect(previewImages).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          reviewId: 'review-1'
        }),
        expect.objectContaining({
          count: 2,
          seed: 7001,
          backendId: 'mock-scene-preview',
          model: 'scene-comprehension-v1',
          includePromptBlueprint: true
        })
      );
    });
    expect(screen.getByText(/Mock Image Preview/i)).toBeInTheDocument();
    expect(
      screen.getByText('locked:world_style | vary:damage_pattern')
    ).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(/force synthesis/i));
    fireEvent.click(screen.getByLabelText(/saved venue prop family/i));
    fireEvent.click(screen.getByText('Refine And Replace'));

    await waitFor(() => {
      expect(onApplyDraft).toHaveBeenCalledWith({
        nodes: [expect.objectContaining({ id: 'draft-node-1' })],
        edges: [],
        checkpoint: expect.objectContaining({
          guidance: expect.objectContaining({
            explicitFixtureSelections: [
              {
                assetId: 'prop-1',
                fixtureId: 'hero-prop-venue'
              }
            ],
            preferredComparableMatchIds: ['comp-1'],
            forceSynthesisKeys: ['damage_pattern'],
            notes: 'Prefer the rusted venue prop family'
          })
        })
      });
    });
  });
});
