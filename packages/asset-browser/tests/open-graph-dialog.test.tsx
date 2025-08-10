import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { OpenGraphDialog } from '../src/components/OpenGraphDialog';

async function openWith(onOpenGraph: (g: unknown) => void) {
  await act(async () => {
    render(<OpenGraphDialog isOpen onClose={() => {}} onOpenGraph={onOpenGraph} />);
  });
}

describe('OpenGraphDialog', () => {
  const originalError = console.error;
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
      const first = args[0];
      if (typeof first === 'string' && first.includes('not wrapped in act(')) {
        return;
      }
      (originalError as unknown as (...a: unknown[]) => void)(...args);
    });
  });
  afterAll(() => {
    (console.error as jest.Mock).mockRestore();
  });
  afterEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).fetch = undefined as any;
  });

  it('loads server list and opens an item', async () => {
    const manifest = [
      { filename: 'a.psg', title: 'Alpha', updatedAt: new Date().toISOString() },
      { filename: 'b.psg', title: 'Beta', updatedAt: new Date().toISOString() },
    ];

    const opened: any[] = [];

    const fetchMock = jest
      .fn()
      // manifest
      .mockResolvedValueOnce({ ok: true, json: async () => manifest } as any)
      // file download
      .mockResolvedValueOnce({ ok: true, json: async () => ({ nodes: [], edges: [], opened: true }) } as any);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).fetch = fetchMock as any;

    await openWith((g) => opened.push(g));

    await waitFor(() => {
      expect(() => screen.getByRole('listbox', { name: 'Server Graphs' })).not.toThrow();
      expect(() => screen.getByText('Alpha')).not.toThrow();
      expect(() => screen.getByText('Beta')).not.toThrow();
    });

    const openButtons = screen.getAllByRole('button', { name: 'Open' });
    await act(async () => { fireEvent.click(openButtons[0]); });

    await waitFor(() => {
      expect(opened.length).toBe(1);
      expect((opened[0] as any).opened).toBe(true);
    });
  });

  it('shows error and allows retry on server error', async () => {
    const fetchMock = jest
      .fn()
      // manifest fails
      .mockResolvedValueOnce({ ok: false, status: 500 } as any)
      // manifest succeeds on retry
      .mockResolvedValueOnce({ ok: true, json: async () => ([{ filename: 'x.psg', title: 'X', updatedAt: new Date().toISOString() }]) } as any);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).fetch = fetchMock as any;

    await openWith(() => {});

    await waitFor(() => {
      const alerts = screen.getAllByRole('alert');
      expect(alerts.some(a => /Failed to load/i.test(a.textContent || ''))).toBe(true);
    });

    const retryButtons = screen.getAllByRole('button', { name: /retry|loading/i });
    await act(async () => { fireEvent.click(retryButtons[0]); });

    await waitFor(() => {
      expect(() => screen.getByText('X')).not.toThrow();
    });
  });

  it('opens local .psg file and handles invalid JSON', async () => {
    const opened: any[] = [];
    await openWith((g) => opened.push(g));

    // Switch to Local tab
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Local' })); });
    const input = screen.getByLabelText('Local Graph File') as HTMLInputElement;

    // Valid .psg
    const valid = new File([JSON.stringify({ nodes: [], edges: [] })], 'foo.psg', { type: 'application/json' });
    await act(async () => { fireEvent.change(input, { target: { files: [valid] } }); });

    await waitFor(() => {
      expect(opened.length).toBe(1);
    });

    // Invalid
    const invalid = new File(['{ invalid'], 'bar.psg', { type: 'application/json' });
    await act(async () => { fireEvent.change(input, { target: { files: [invalid] } }); });

    await waitFor(() => {
      const alerts = screen.getAllByRole('alert');
      expect(alerts.some(a => /Invalid file|Failed to read/i.test(a.textContent || ''))).toBe(true);
    });
  });
});
