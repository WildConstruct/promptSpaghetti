import React from 'react';
import { ServerTab } from './ServerTab';

export type AssetBrowserTabsProps = {
  libraryView?: React.ReactNode;
};

export function AssetBrowserTabs({ libraryView }: AssetBrowserTabsProps): JSX.Element {
  const [tab, setTab] = React.useState<'library' | 'server'>('library');

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
      </nav>
      <div style={{ padding: 8 }}>
        {tab === 'library' && (
          <div aria-label="Library View">
            {libraryView ?? <em>No library view provided.</em>}
          </div>
        )}
        {tab === 'server' && <ServerTab />}
      </div>
    </section>
  );
}
