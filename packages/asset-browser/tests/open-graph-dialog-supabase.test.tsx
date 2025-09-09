import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act
} from '@testing-library/react';
import { OpenGraphDialog } from '../src/components/OpenGraphDialog';
import { UserProvider } from '../src/user/UserProvider';

// Avoid ServerPane network/effect noise by mocking manifest loader
jest.mock('../src/services/GraphManifestLoader', () => ({
  loadServerGraphs: jest.fn(async () => [])
}));

describe('OpenGraphDialog - Supabase tab', () => {
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

  async function renderDlg(
    props: Partial<React.ComponentProps<typeof OpenGraphDialog>> = {}
  ) {
    const onOpenGraph = jest.fn();
    await act(async () => {
      render(
        <OpenGraphDialog
          isOpen
          onClose={() => {}}
          onOpenGraph={onOpenGraph}
          {...props}
        />
      );
    });
    return { onOpenGraph };
  }

  it('does not show Supabase tab when gating conditions are not met', async () => {
    // enable flag but missing userId and helpers
    await renderDlg({ enableSupabase: true });
    expect(screen.queryByRole('button', { name: 'Supabase' })).toBeNull();

    // userId but missing helpers
    await renderDlg({ enableSupabase: true, userId: 'u1' });
    expect(screen.queryByRole('button', { name: 'Supabase' })).toBeNull();

    // helpers but enable flag is false
    await renderDlg({
      userId: 'u1',
      supabaseList: async () => ({ ok: true, data: [] }),
      supabaseGet: async () => ({ ok: true, data: '{}' })
    });
    expect(screen.queryByRole('button', { name: 'Supabase' })).toBeNull();
  });

  it('uses userId from UserProvider context when prop is not provided', async () => {
    const list = jest
      .fn()
      .mockResolvedValue({ ok: true, data: [{ name: 'c.psg' }] });
    const get = jest
      .fn()
      .mockResolvedValue({ ok: true, data: JSON.stringify({ ok: true }) });

    const supabase = {
      auth: {
        getSession: jest
          .fn()
          .mockResolvedValue({ data: { session: { user: { id: 'ctx-2' } } } }),
        onAuthStateChange: jest
          .fn()
          .mockReturnValue({
            data: { subscription: { unsubscribe: jest.fn() } }
          })
      }
    } as any;

    const onOpenGraph = jest.fn();
    await act(async () => {
      render(
        <UserProvider supabase={supabase}>
          <OpenGraphDialog
            isOpen
            onClose={() => {}}
            onOpenGraph={onOpenGraph}
            enableSupabase
            supabaseList={list}
            supabaseGet={get}
          />
        </UserProvider>
      );
    });

    // Wait for Supabase tab to be available via context gating
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Supabase' })
      ).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Supabase' }));
    });

    await waitFor(() => {
      expect(
        screen.getByRole('listbox', { name: 'Supabase Graphs' })
      ).toBeInTheDocument();
      expect(screen.getByText('c.psg')).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    });

    await waitFor(() => {
      expect(onOpenGraph).toHaveBeenCalledTimes(1);
    });
  });

  it('shows empty state when list returns no items', async () => {
    await renderDlg({
      userId: 'user-123',
      enableSupabase: true,
      supabaseList: async () => ({ ok: true, data: [] }),
      supabaseGet: async () => ({ ok: true, data: '{}' })
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Supabase' }));
    });

    await waitFor(() => {
      expect(
        screen.getByText(/No Supabase graphs available/i)
      ).toBeInTheDocument();
    });
  });

  it('lists items and opens one successfully', async () => {
    const list = jest
      .fn()
      .mockResolvedValue({
        ok: true,
        data: [{ name: 'a.psg' }, { name: 'b.psg' }]
      });
    const get = jest
      .fn()
      .mockResolvedValue({
        ok: true,
        data: JSON.stringify({ openedFrom: 'supabase', id: 1 })
      });
    const { onOpenGraph } = await renderDlg({
      userId: 'user-123',
      enableSupabase: true,
      supabaseList: list,
      supabaseGet: get
    });

    fireEvent.click(screen.getByRole('button', { name: 'Supabase' }));

    await waitFor(() => {
      expect(
        screen.getByRole('listbox', { name: 'Supabase Graphs' })
      ).toBeInTheDocument();
      expect(screen.getByText('a.psg')).toBeInTheDocument();
      expect(screen.getByText('b.psg')).toBeInTheDocument();
    });

    const openButtons = screen.getAllByRole('button', { name: 'Open' });
    await act(async () => {
      fireEvent.click(openButtons[0]);
    });

    await waitFor(() => {
      expect(onOpenGraph).toHaveBeenCalledTimes(1);
      const arg = onOpenGraph.mock.calls[0][0] as any;
      expect(arg.openedFrom).toBe('supabase');
    });
  });

  it('shows error when list fails', async () => {
    await renderDlg({
      userId: 'user-123',
      enableSupabase: true,
      supabaseList: async () => ({
        ok: false as const,
        error: { message: 'boom' }
      }),
      supabaseGet: async () => ({ ok: true as const, data: '{}' })
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Supabase' }));
    });

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(/boom|Failed to list/i.test(alert.textContent || '')).toBe(true);
    });
  });

  it('shows error when open fails', async () => {
    const list = jest
      .fn()
      .mockResolvedValue({ ok: true, data: [{ name: 'x.psg' }] });
    const get = jest
      .fn()
      .mockResolvedValue({ ok: false, error: { message: 'nope' } });
    await renderDlg({
      userId: 'u1',
      enableSupabase: true,
      supabaseList: list,
      supabaseGet: get
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Supabase' }));
    });

    await waitFor(() => {
      expect(screen.getByText('x.psg')).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    });

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(/nope|Failed to open/i.test(alert.textContent || '')).toBe(true);
    });
  });

  it('shows error when JSON is invalid', async () => {
    const list = jest
      .fn()
      .mockResolvedValue({ ok: true, data: [{ name: 'bad.psg' }] });
    const get = jest.fn().mockResolvedValue({ ok: true, data: '{ not json' });
    await renderDlg({
      userId: 'u1',
      enableSupabase: true,
      supabaseList: list,
      supabaseGet: get
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Supabase' }));
    });

    await waitFor(() => {
      expect(screen.getByText('bad.psg')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Open' }));

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(/Invalid graph JSON/i.test(alert.textContent || '')).toBe(true);
    });
  });
});
