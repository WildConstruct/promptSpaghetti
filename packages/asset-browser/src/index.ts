// Main exports
export { AssetBrowser } from './components/AssetBrowser';
export { EnhancedAssetBrowser } from './components/EnhancedAssetBrowser';
export { AssetBrowserTabs as TabbedAssetBrowser } from './components/AssetBrowserTabs';
export { UserProvider } from './providers/UserProvider';

// Enhanced component exports
export { EnhancedPresetGrid } from './components/EnhancedPresetGrid';
export { EnhancedPresetCard } from './components/EnhancedPresetCard';

// Service exports
export { FragmentManifestLoader } from './services/FragmentManifestLoader';
export type { FragmentManifest, FragmentCategory, FragmentEntry } from './services/FragmentManifestLoader';

// Store exports
export { useAssetBrowserStore } from './stores/assetBrowserStore';

// Type exports
export type { Preset } from './types';

export interface AssetBrowserProps {
  onInsert?: (preset: any) => void;
}

export interface EnhancedAssetBrowserProps extends AssetBrowserProps {
  onNodeReplace?: (nodeId: string, preset: any) => void;
  enableFragmentManifest?: boolean;
}