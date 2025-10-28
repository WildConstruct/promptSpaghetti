import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { UserProvider, useUserId } from '../src/user/UserProvider';

describe('UserProvider / useUserId', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    // Clean localStorage per test
    if (typeof window !== 'undefined') {
      window.localStorage.clear();
    }
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it('returns deterministic dev userId when dev flag enabled', async () => {
    process.env.VITE_FEATURE_DEV_USER = '1';
    function ShowId() {
      const { userId } = useUserId();
      return <div data-testid="uid">{userId}</div>;
    }

    const r1 = render(
      <UserProvider>
        <ShowId />
      </UserProvider>
    );

    const el = await screen.findByTestId('uid');
    expect(el.textContent).toMatch(/^dev-/);

    // Should persist across reloads
    const first = el.textContent;
    // Unmount and render a new provider (reads from localStorage)
    r1.unmount();
    render(
      <UserProvider>
        <ShowId />
      </UserProvider>
    );
    const el2 = await screen.findByTestId('uid');
    expect(el2.textContent).toBe(first);
  });

  it('reads userId from Supabase session and reacts to auth state changes', async () => {
    const callbacks: Array<(event: string, session: any) => void> = [];
    const supabase = {
      auth: {
        getSession: jest
          .fn()
          .mockResolvedValue({ data: { session: { user: { id: 'u1' } } } }),
        onAuthStateChange: (cb: (event: string, session: any) => void) => {
          callbacks.push(cb);
          return { data: { subscription: { unsubscribe: jest.fn() } } };
        }
      }
    } as any;

    function ShowId() {
      const { userId } = useUserId();
      return <div data-testid="uid">{userId ?? ''}</div>;
    }

    render(
      <UserProvider supabase={supabase}>
        <ShowId />
      </UserProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId('uid').textContent).toBe('u1')
    );

    // Simulate auth change to u2
    await act(async () => {
      callbacks.forEach(cb => cb('SIGNED_IN', { user: { id: 'u2' } }));
    });

    await waitFor(() =>
      expect(screen.getByTestId('uid').textContent).toBe('u2')
    );
  });
});
