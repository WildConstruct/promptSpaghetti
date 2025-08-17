// Re-export components
import { AssetBrowser } from './components/AssetBrowser';
import { AssetBrowserTabs } from './components/AssetBrowserTabs';
import { ServerTab } from './components/ServerTab';
import { TabbedAssetBrowser } from './components/TabbedAssetBrowser';
import { OpenGraphDialog } from './components/OpenGraphDialog';
import { SaveGraphDialog } from './components/SaveGraphDialog';
import { UserProvider as OriginalUserProvider, useUserId } from './user/UserProvider';

// Enhanced components
import { EnhancedAssetBrowser } from './components/EnhancedAssetBrowser';
import { EnhancedPresetGrid } from './components/EnhancedPresetGrid';
import { EnhancedPresetCard } from './components/EnhancedPresetCard';
import { ProAssetBrowser } from './components/ProAssetBrowser';

// Services
import { FragmentManifestLoader } from './services/FragmentManifestLoader';
export type { FragmentManifest, FragmentCategory, FragmentEntry } from './services/FragmentManifestLoader';

// Our new UserProvider wrapper for compatibility
import { UserProvider } from './providers/UserProvider';

// Store
import { useAssetBrowserStore } from './stores/assetBrowserStore';

import type { Preset } from './types';
export type { Preset } from './types';

export type AssetBrowserProps = {
  onInsert?: (preset: Preset) => void;
};

export interface EnhancedAssetBrowserProps extends AssetBrowserProps {
  onNodeReplace?: (nodeId: string, preset: any) => void;
  enableFragmentManifest?: boolean;
}

export {
  AssetBrowser,
  AssetBrowserTabs,
  ServerTab,
  TabbedAssetBrowser,
  OpenGraphDialog,
  SaveGraphDialog,
  UserProvider,
  OriginalUserProvider,
  useUserId,
  EnhancedAssetBrowser,
  EnhancedPresetGrid,
  EnhancedPresetCard,
  ProAssetBrowser,
  FragmentManifestLoader,
  useAssetBrowserStore
};

// Export TabbedAssetBrowser as the default
const DefaultExport = TabbedAssetBrowser;
export default DefaultExport;
