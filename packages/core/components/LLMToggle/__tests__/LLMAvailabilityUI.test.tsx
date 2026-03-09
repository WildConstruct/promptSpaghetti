import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { LLMToggle } from '../LLMToggle';
import { LLMConfigDialog } from '../../LLMConfigDialog/LLMConfigDialog';

describe('LLM availability UI', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('disables the toggle and shows server-unavailable copy when AI is offline', async () => {
    global.fetch = jest
      .fn()
      .mockImplementation((input: RequestInfo | URL) => {
        const url = String(input);

        if (url.endsWith('/api/llm/status')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              available: false,
              mode: 'heuristic',
              capabilities: []
            })
          });
        }

        if (url.endsWith('/api/psg/capabilities')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              ok: true,
              version: 'psg/1',
              supportedKinds: ['fragment'],
              operations: ['validate'],
              exportTargets: []
            })
          });
        }

        return Promise.reject(new Error(`Unexpected fetch: ${url}`));
      }) as unknown as typeof fetch;

    render(<LLMToggle onConfigClick={jest.fn()} />);

    await waitFor(() => {
      expect(
        screen.getByText('AI parser unavailable on the server')
      ).toBeInTheDocument();
    });

    expect(
      screen.getByRole('button', { name: 'Parser mode: standard' })
    ).toBeDisabled();
    expect(screen.getByText('Details')).toBeInTheDocument();
  });

  it('shows server-owned status details instead of browser api key inputs', async () => {
    global.fetch = jest
      .fn()
      .mockImplementation((input: RequestInfo | URL) => {
        const url = String(input);

        if (url.endsWith('/api/llm/status')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              available: true,
              mode: 'live',
              provider: 'openrouter',
              defaultModel: 'openai/gpt-4o-mini',
              capabilities: ['getStatus', 'draftGraphFromPrompt', 'complete']
            })
          });
        }

        if (url.endsWith('/api/psg/capabilities')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              ok: true,
              version: 'psg/1',
              supportedKinds: ['fragment', 'crowd-plan'],
              operations: [
                'validate',
                'normalize',
                'expand-crowd',
                'export-comfy'
              ],
              exportTargets: ['comfy']
            })
          });
        }

        return Promise.reject(new Error(`Unexpected fetch: ${url}`));
      }) as unknown as typeof fetch;

    render(<LLMConfigDialog isOpen={true} onClose={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('openrouter')).toBeInTheDocument();
    });

    expect(
      screen.getByText(
        'AI provider keys and routing are configured on the server, not in your browser.'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('Local mode')).toBeInTheDocument();
    expect(screen.getByText('comfy')).toBeInTheDocument();
    expect(screen.getAllByText(/export-comfy/).length).toBeGreaterThan(0);
    expect(screen.getByText('Included locally')).toBeInTheDocument();
    expect(screen.getAllByText(/expand-crowd/).length).toBeGreaterThan(0);
    expect(screen.getByText('openrouter')).toBeInTheDocument();
    expect(screen.getByText('openai/gpt-4o-mini')).toBeInTheDocument();
    expect(screen.getByText('draftGraphFromPrompt')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('sk-...')).not.toBeInTheDocument();
  });
});
