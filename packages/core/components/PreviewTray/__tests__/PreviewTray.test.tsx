import React from 'react';
import { render, screen } from '@testing-library/react';

import { PreviewTray } from '../PreviewTray';
import { usePreviewTrayStore } from '../../../stores/previewTrayStore';

describe('PreviewTray', () => {
  beforeEach(() => {
    usePreviewTrayStore.setState({
      isOpen: true,
      height: 250,
      minimized: false,
      selectedResults: new Set()
    });
  });

  it('keeps unchanged seed outputs visible while one rerolled seed is executing', () => {
    const results = [
      { seed: 101, result: 'left output stays visible' },
      { seed: 102, result: 'middle output is being replaced' },
      { seed: 103, result: 'right output stays visible' }
    ];

    const { rerender } = render(
      <PreviewTray
        seeds={[101, 102, 103]}
        results={results}
        isExecuting={false}
      />
    );

    expect(screen.getByText('left output stays visible')).toBeInTheDocument();
    expect(screen.getByText('right output stays visible')).toBeInTheDocument();

    rerender(
      <PreviewTray
        seeds={[101, 202, 103]}
        results={results}
        isExecuting={true}
      />
    );

    expect(screen.getByText('left output stays visible')).toBeInTheDocument();
    expect(screen.getByText('right output stays visible')).toBeInTheDocument();
    expect(
      screen.queryByText('middle output is being replaced')
    ).not.toBeInTheDocument();
    expect(screen.getByText('No result yet')).toBeInTheDocument();
  });
});
