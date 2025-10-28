import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AssetBrowserTabs } from '../src/components/AssetBrowserTabs';

function LibraryStub() {
  return <div>Library Stub Content</div>;
}

describe('AssetBrowserTabs', () => {
  afterEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).fetch = undefined as any;
  });

  it('defaults to Library tab and switches to Server', async () => {
    // Mock server manifest
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).fetch = jest.fn(async () => ({
      ok: true,
      json: async () => [
        {
          filename: 'a.psg',
          title: 'Alpha',
          updatedAt: new Date().toISOString()
        }
      ]
    })) as any;

    render(<AssetBrowserTabs libraryView={<LibraryStub />} />);

    // Library is visible by default
    expect(() => screen.getByText('Library Stub Content')).not.toThrow();

    // Switch to Server
    fireEvent.click(screen.getByRole('button', { name: 'Server' }));

    await waitFor(() => {
      expect(() => screen.getByLabelText('Server Graph List')).not.toThrow();
      expect(() => screen.getByText('Alpha')).not.toThrow();
    });
  });
});
