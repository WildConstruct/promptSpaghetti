import React from 'react';
import { render, screen } from '@testing-library/react';
import { AssetBrowser } from '../src/components/AssetBrowser';

test('renders asset browser skeleton', () => {
  render(<AssetBrowser />);
  expect(screen.getByLabelText('Asset Libraries')).toBeInTheDocument();
  expect(screen.getByLabelText('Preset Grid')).toBeInTheDocument();
});
