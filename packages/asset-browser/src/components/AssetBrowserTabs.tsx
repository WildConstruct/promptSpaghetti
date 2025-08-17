import React from 'react';
import { ServerTab } from './ServerTab';
import { AssetFragmentsTab } from './AssetFragmentsTab';

export type AssetBrowserTabsProps = {
  libraryView?: React.ReactNode;
};

export function AssetBrowserTabs({ libraryView }: AssetBrowserTabsProps): JSX.Element {
  const [tab, setTab] = React.useState<'library' | 'server' | 'fragments'>('library');

  return (
    <section aria-label="Asset Browser Tabs" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%'
    }}>
      <nav aria-label="Asset Views" style={{ 
        display: 'flex', 
        gap: 8, 
        borderBottom: '1px solid #333', 
        padding: 8,
        flexShrink: 0 
      }}>
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
      <div style={{ 
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {tab === 'library' && (
          <div aria-label="Library View" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {libraryView ?? <em>No library view provided.</em>}
          </div>
        )}
        {tab === 'server' && <ServerTab />}
        {tab === 'fragments' && <AssetFragmentsTab />}
      </div>
    </section>
  );
}
