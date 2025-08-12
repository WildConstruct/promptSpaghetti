// Re-export components
import { AssetBrowser } from './components/AssetBrowser';
import { AssetBrowserTabs } from './components/AssetBrowserTabs';
import { ServerTab } from './components/ServerTab';
import { TabbedAssetBrowser } from './components/TabbedAssetBrowser';
import { OpenGraphDialog } from './components/OpenGraphDialog';
import { SaveGraphDialog } from './components/SaveGraphDialog';
import { UserProvider, useUserId } from './user/UserProvider';
import type { Preset } from './types';
export type { Preset } from './types';

export type AssetBrowserProps = {
  onInsert?: (preset: Preset) => void;
};

export {
  AssetBrowser,
  AssetBrowserTabs,
  ServerTab,
  TabbedAssetBrowser,
  OpenGraphDialog,
  SaveGraphDialog,
  UserProvider,
  useUserId
};

// Export TabbedAssetBrowser as the default
const DefaultExport = TabbedAssetBrowser;
export default DefaultExport;
