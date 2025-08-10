import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SaveGraphDialog } from '../src/components/SaveGraphDialog';
import { UserProvider } from '../src/user/UserProvider';

describe('SaveGraphDialog - Supabase save', () => {
  const baseProps: React.ComponentProps<typeof SaveGraphDialog> = {
    isOpen: true,
    onClose: () => {},
    graph: { id: 1, name: 'test' },
  } as any;

  function typeName(value: string) {
    const input = screen.getByLabelText('File name') as HTMLInputElement;
    fireEvent.change(input, { target: { value } });
    return input;
  }

  it('gates the Supabase button by enableSupabase + userId + supabasePut', () => {
    // Missing all
    render(<SaveGraphDialog {...baseProps} />);
    expect(screen.queryByRole('button', { name: 'Save to Supabase' })).toBeNull();

    // enable but missing userId/helper
    render(<SaveGraphDialog {...baseProps} enableSupabase />);
    expect(screen.queryByRole('button', { name: 'Save to Supabase' })).toBeNull();

    // enable + userId but missing helper
    render(<SaveGraphDialog {...baseProps} enableSupabase userId="u1" />);
    expect(screen.queryByRole('button', { name: 'Save to Supabase' })).toBeNull();

    // all present
    render(
      <SaveGraphDialog
        {...baseProps}
        enableSupabase
        userId="u1"
        supabasePut={async () => ({ ok: true as const, data: { path: 'users/u1/graphs/graph.psg' } })}
      />
    );
    expect(screen.getByRole('button', { name: 'Save to Supabase' })).toBeInTheDocument();
  });

  it('uses userId from UserProvider context when prop is not provided', async () => {
    const supabase = {
      auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: { user: { id: 'ctx-1' } } } }),
        onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
      },
    } as any;
    const supabasePut = jest.fn().mockResolvedValue({ ok: true, data: { path: 'users/ctx-1/graphs/X.psg' } });
    const onSupabaseSaved = jest.fn();

    render(
      <UserProvider supabase={supabase}>
        <SaveGraphDialog
          {...baseProps}
          enableSupabase
          supabasePut={supabasePut}
          onSupabaseSaved={onSupabaseSaved}
        />
      </UserProvider>
    );

    // Wait for context to resolve and button to appear
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save to Supabase' })).toBeInTheDocument());

    typeName('X');
    fireEvent.click(screen.getByRole('button', { name: 'Save to Supabase' }));

    await waitFor(() => {
      expect(supabasePut).toHaveBeenCalledTimes(1);
      const [uid, name] = supabasePut.mock.calls[0];
      expect(uid).toBe('ctx-1');
      expect(name).toBe('X.psg');
      expect(onSupabaseSaved).toHaveBeenCalledWith('X.psg', expect.any(String));
    });
  });

  it('saves successfully to Supabase and calls onSupabaseSaved + onClose', async () => {
    const supabasePut = jest.fn().mockResolvedValue({ ok: true, data: { path: 'users/u1/graphs/My-Graph.psg' } });
    const onSupabaseSaved = jest.fn();
    const onClose = jest.fn();

    render(
      <SaveGraphDialog
        {...baseProps}
        onClose={onClose}
        enableSupabase
        userId="u1"
        supabasePut={supabasePut}
        onSupabaseSaved={onSupabaseSaved}
      />
    );

    typeName('My Graph');

    fireEvent.click(screen.getByRole('button', { name: 'Save to Supabase' }));

    await waitFor(() => {
      expect(supabasePut).toHaveBeenCalledTimes(1);
      const [uid, name, content] = supabasePut.mock.calls[0];
      expect(uid).toBe('u1');
      expect(name).toBe('My-Graph.psg');
      expect(typeof content).toBe('string');
      expect(onSupabaseSaved).toHaveBeenCalledWith('My-Graph.psg', expect.any(String));
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('shows error and keeps dialog open when upload fails', async () => {
    const supabasePut = jest.fn().mockResolvedValue({ ok: false, error: { message: 'boom' } });

    render(
      <SaveGraphDialog
        {...baseProps}
        enableSupabase
        userId="u1"
        supabasePut={supabasePut}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Save to Supabase' }));

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(/boom|Failed to upload/i.test(alert.textContent || '')).toBe(true);
      // Dialog still present
      expect(screen.getByRole('dialog', { name: 'Save Graph' })).toBeInTheDocument();
    });
  });

  it('validates file name and prevents upload when invalid', async () => {
    const supabasePut = jest.fn().mockResolvedValue({ ok: true, data: { path: '' } });

    render(
      <SaveGraphDialog
        {...baseProps}
        enableSupabase
        userId="u1"
        supabasePut={supabasePut}
      />
    );

    typeName('..');
    fireEvent.click(screen.getByRole('button', { name: 'Save to Supabase' }));

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(/Please enter a valid name/i.test(alert.textContent || '')).toBe(true);
      expect(supabasePut).not.toHaveBeenCalled();
    });
  });
});
