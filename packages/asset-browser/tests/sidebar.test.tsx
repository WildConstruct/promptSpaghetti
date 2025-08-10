import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { AssetBrowser } from '../src/components/AssetBrowser';

describe('Sidebar tag filtering', () => {
  test('clicking a tag filters grid results', async () => {
    render(<AssetBrowser />);

    // Tag list renders; click on 'demo' should filter to demo-tagged items
    const demoBtn = await screen.findByRole('button', { name: /demo/i });
    fireEvent.click(demoBtn);

    // Should see Medieval Castle, and not see Forest Path or Ocean Waves if they don't share tag
    expect(await screen.findByText(/Medieval Castle/i)).toBeInTheDocument();
    // Forest Path is not tagged 'demo', so it should be filtered out
    expect(screen.queryByText(/Forest Path/i)).toBeNull();
  });
});
