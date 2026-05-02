import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { ServerTab } from '../src/components/ServerTab';

describe('ServerTab', () => {
  afterEach(() => {
    // Cast to any to allow clearing fetch in jsdom env
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).fetch = undefined as any;
  });

  it('renders empty state when manifest is empty', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).fetch = jest.fn(async () => ({
      ok: true,
      json: async () => []
    })) as any;

    render(<ServerTab />);

    await waitFor(() => {
      const statuses = screen.getAllByRole('status');
      expect(
        statuses.some(s =>
          /No server \.psg assets/i.test(s.textContent || '')
        )
      ).toBe(true);
    });
  });

  it('renders list when manifest has entries', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).fetch = jest.fn(async () => ({
      ok: true,
      json: async () => [
        {
          filename: 'a.psg',
          title: 'Alpha'
        },
        {
          filename: 'b.psg',
          title: 'Beta',
          updatedAt: '2024-01-02T03:04:05.000Z'
        }
      ]
    })) as any;

    render(<ServerTab />);

    await waitFor(() => {
      expect(() => screen.getByText('Alpha')).not.toThrow();
      expect(() => screen.getByText('Beta')).not.toThrow();
      expect(() => screen.getByLabelText('Server PSG Asset List')).not.toThrow();
      expect(() => screen.getByText('a.psg')).not.toThrow();
    });
  });

  it('shows error and allows retry', async () => {
    const success = [
      { filename: 'a.psg', title: 'Alpha' }
    ];
    const fetchMock = jest
      .fn()
      // first call fails
      .mockResolvedValueOnce({ ok: false, status: 500 } as any)
      // second call succeeds
      .mockResolvedValueOnce({ ok: true, json: async () => success } as any);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).fetch = fetchMock as any;

    render(<ServerTab />);

    // error visible
    await waitFor(() => {
      const alerts = screen.getAllByRole('alert');
      expect(
        alerts.some(a => /Failed to load/i.test(a.textContent || ''))
      ).toBe(true);
    });

    // click Retry
    const retryButtons = screen.getAllByRole('button', {
      name: /retry|loading/i
    });
    fireEvent.click(retryButtons[0]);

    await waitFor(() => {
      expect(() => screen.getByText('Alpha')).not.toThrow();
    });
  });

  it('treats 404 manifest as empty state with guidance', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).fetch = jest.fn(async () => ({
      ok: false,
      status: 404
    })) as any;

    render(<ServerTab />);

    await waitFor(() => {
      // Should NOT render an alert with failure text
      const alerts = screen.queryAllByRole('alert');
      expect(
        alerts.some(a => /Failed to load/i.test(a.textContent || ''))
      ).toBe(false);

      // Should render an EmptyState (status) with guidance text
      const statuses = screen.getAllByRole('status');
      expect(
        statuses.some(s =>
          /No server manifest found/i.test(s.textContent || '')
        )
      ).toBe(true);

      // Optional: at least one Retry button is available
      const buttons = screen.getAllByRole('button', { name: /retry|loading/i });
      expect(buttons.length).toBeGreaterThan(0);
    });
  });
});
