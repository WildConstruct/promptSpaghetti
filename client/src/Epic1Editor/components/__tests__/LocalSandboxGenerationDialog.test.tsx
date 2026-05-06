import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { LocalSandboxGenerationDialog } from '../LocalSandboxGenerationDialog';
import type { DerivedSandboxRequest } from '../../localSandboxPromptDerivation';

describe('LocalSandboxGenerationDialog', () => {
  const originalFetch = global.fetch;
  const derivedRequest: DerivedSandboxRequest = {
    status: 'ready',
    sourceLabel: 'Supported v1 tree archetype flow',
    sourceDescription:
      'The active graph exposes family DNA and bounded variation.',
    prompt:
      'oak tree archetype, shared trunk DNA, documentary still, natural light, bounded silhouette: broad rounded canopy',
    negativePrompt:
      'blurry, duplicate canopy, collage, text, watermark, extra trunks',
    count: 20,
    startSeed: 1200,
    labelPrefix: 'tree-family-demo',
    basePrompt:
      'oak tree archetype, shared trunk DNA, documentary still, natural light',
    variationSummaries: ['silhouette: broad rounded canopy'],
    missingReasons: [],
    isCanonicalTreeFlow: true
  };

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it('shows honest local-only disabled state when the runtime is unavailable', () => {
    render(
      <LocalSandboxGenerationDialog
        isOpen
        onClose={jest.fn()}
        runtimeStatus={{
          ok: true,
          provider: 'comfy-local',
          available: false,
          reason: 'Local sandbox generation is disabled.',
          apiUrl: 'http://127.0.0.1:8188',
          outputDir: 'C:/tmp/local-image',
          defaultCount: 20,
          maxCount: 20
        }}
        derivedRequest={derivedRequest}
      />
    );

    expect(
      screen.getByText('Local sandbox generation unavailable')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Generate 20 Trees' })
    ).toBeDisabled();
    expect(
      screen.getByText('Local sandbox generation is disabled.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('flux1-schnell-fp8.safetensors')
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(/Supported v1 tree archetype flow/i)
    ).toHaveLength(2);
  });

  it('submits a deterministic tree batch request, renders results, and captures them into scene assets', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        provider: 'comfy-local',
        runId: 'local-image-tree-123',
        outputDir: 'C:/tmp/local-image/local-image-tree-123',
        manifestPath: 'C:/tmp/local-image/local-image-tree-123/manifest.json',
        prompt:
          'oak tree archetype, shared trunk DNA, documentary still, natural light',
        count: 20,
        items: [
          {
            index: 0,
            seed: 1200,
            prompt:
              'oak tree archetype, shared trunk DNA, documentary still, natural light',
            provider: 'comfy-local',
            filename: '01-seed-1200.png',
            outputPath:
              'C:/tmp/local-image/local-image-tree-123/01-seed-1200.png',
            downloadUrl:
              '/api/local-image/files/local-image-tree-123/01-seed-1200.png'
          },
          {
            index: 1,
            seed: 1201,
            prompt:
              'oak tree archetype, shared trunk DNA, documentary still, natural light',
            provider: 'comfy-local',
            filename: '02-seed-1201.png',
            outputPath:
              'C:/tmp/local-image/local-image-tree-123/02-seed-1201.png',
            downloadUrl:
              '/api/local-image/files/local-image-tree-123/02-seed-1201.png'
          }
        ]
      })
    }) as unknown as typeof fetch;

    const onCaptureBatch = jest.fn();

    render(
      <LocalSandboxGenerationDialog
        isOpen
        onClose={jest.fn()}
        runtimeStatus={{
          ok: true,
          provider: 'comfy-local',
          available: true,
          apiUrl: 'http://127.0.0.1:8188',
          outputDir: 'C:/tmp/local-image',
          defaultCount: 20,
          maxCount: 20
        }}
        derivedRequest={derivedRequest}
        onCaptureBatch={onCaptureBatch}
        onOpenSceneAssets={jest.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Generate 20 Trees' }));

    expect(
      screen.getByText(
        /Ready: the pinned Flux Schnell FP8 checkpoint and local Comfy runtime are available/i
      )
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/local-image/batch',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"count":20')
        })
      );
    });

    expect(
      await screen.findByText('20 local images generated')
    ).toBeInTheDocument();
    expect(screen.getByText('#1 seed 1200')).toBeInTheDocument();
    expect(screen.getByText(/manifest\.json/i)).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: 'Capture To Scene Assets' })
    );

    expect(onCaptureBatch).toHaveBeenCalledWith(
      expect.objectContaining({
        runId: 'local-image-tree-123',
        manifestPath: 'C:/tmp/local-image/local-image-tree-123/manifest.json'
      })
    );
    expect(
      screen.getByText(
        /Captured this run into the PSG Scene Assets sidecar draft/i
      )
    ).toBeInTheDocument();
  });
});
