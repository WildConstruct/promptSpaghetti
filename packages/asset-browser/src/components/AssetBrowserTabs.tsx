import React from 'react';
import { ServerTab } from './ServerTab';
import { AssetFragmentsTab } from './AssetFragmentsTab';

export type AssetBrowserTabsProps = {
  libraryView?: React.ReactNode;
};

export function AssetBrowserTabs({ libraryView }: AssetBrowserTabsProps): JSX.Element {
  const [tab, setTab] = React.useState<'library' | 'server' | 'fragments'>('library');

  return (
    <section aria-label="Asset Browser Tabs">
      <nav aria-label="Asset Views" style={{ display: 'flex', gap: 8, borderBottom: '1px solid #ddd', padding: 8 }}>
        <button
          type="button"
          aria-selected={tab === 'library'}
          onClick={() => setTab('library')}
        >
          Library
        </button>
        <button
          type="button"
          aria-selected={tab === 'server'}
          onClick={() => setTab('server')}
        >
          Server
        </button>
        <button
          type="button"
          aria-selected={tab === 'fragments'}
          onClick={() => setTab('fragments')}
        >
          Fragments
        </button>
      </nav>
      <div style={{ padding: 8 }}>
        {tab === 'library' && (
          <div aria-label="Library View">
            {libraryView ?? <em>No library view provided.</em>}
          </div>
        )}
        {tab === 'server' && <ServerTab />}
        {tab === 'fragments' && <AssetFragmentsTab />}
      </div>
    </section>
  );
}
