import React from 'react';
import { jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  TabbedSidePanel,
  type SidePanelTabDefinition
} from '../TabbedSidePanel';

jest.mock('../AssetBrowserLoader', () => ({
  AssetBrowserLoader: () => <div>Asset Browser Loader</div>
}));

jest.mock('../SuggestedFragmentsPanel', () => ({
  SuggestedFragmentsPanel: () => <div>Suggested Fragments</div>
}));

jest.mock('../preview/PreviewPanel', () => ({
  PreviewPanel: () => <div>Preview Panel</div>
}));

jest.mock('../../AssetBrowser/AssetSearchPanel', () => ({
  __esModule: true,
  default: () => <div>Asset Search Panel</div>
}));

jest.mock('../components/RelationshipView', () => ({
  __esModule: true,
  default: () => <div>Relationship View</div>
}));

jest.mock('../ComponentLibraryPanel', () => ({
  ComponentLibraryPanel: () => <div>Component Library Panel</div>
}));

const tabDefinitions: SidePanelTabDefinition[] = [
  {
    id: 'assets',
    label: 'Library',
    title: 'Fragment library',
    ariaLabel: 'Fragment library',
    tier: 'core',
    availability: 'available',
    helperText: 'Core library surface'
  },
  {
    id: 'preview',
    label: 'Preview',
    title: 'Preview',
    ariaLabel: 'Preview',
    tier: 'core',
    availability: 'available',
    helperText: 'Core preview surface'
  },
  {
    id: 'components',
    label: 'Linked',
    title: 'Advanced linked components',
    ariaLabel: 'Advanced linked components',
    tier: 'advanced',
    availability: 'available',
    helperText: 'Advanced linked components'
  },
  {
    id: 'search',
    label: 'Explore',
    title: 'Advanced search and exploration',
    ariaLabel: 'Advanced search and exploration',
    tier: 'advanced',
    availability: 'available',
    helperText: 'Advanced search surface'
  },
  {
    id: 'relationships',
    label: 'Graph',
    title: 'Advanced graph relationships',
    ariaLabel: 'Advanced graph relationships',
    tier: 'advanced',
    availability: 'available',
    helperText: 'Advanced graph relationships'
  }
];

describe('TabbedSidePanel', () => {
  it('renders core and advanced tab notes from explicit tab definitions', () => {
    render(
      <TabbedSidePanel
        previewEngine={{} as never}
        showAssets
        showPreview
        tabDefinitions={tabDefinitions}
      />
    );

    expect(screen.getByText('Library')).toBeInTheDocument();
    expect(screen.getByText('Preview')).toBeInTheDocument();
    expect(screen.getByText('Linked')).toBeInTheDocument();
    expect(screen.getByText('Suggested Fragments')).toBeInTheDocument();
    expect(screen.getByText('Asset Browser Loader')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Advanced linked components' }));

    expect(screen.getByText('Component Library Panel')).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: 'Advanced graph relationships' })
    );

    expect(screen.getByText('Relationship View')).toBeInTheDocument();
  });

  it('omits preview when the explicit tab definitions do not include it', () => {
    render(
      <TabbedSidePanel
        previewEngine={{} as never}
        showAssets
        showPreview={false}
        tabDefinitions={tabDefinitions.filter(tab => tab.id !== 'preview')}
      />
    );

    expect(screen.queryByText('Preview')).not.toBeInTheDocument();
    expect(screen.getByText('Library')).toBeInTheDocument();
  });
});
