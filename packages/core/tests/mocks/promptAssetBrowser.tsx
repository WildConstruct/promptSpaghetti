import React from 'react';

export type { Preset } from '../../../../packages/asset-browser/src/types';
export type {
  AgentFragmentRecord,
  FragmentQuery,
  SelectionContext,
  FragmentRole,
  FragmentDomain,
  FragmentNodeType,
  PlacementHint
} from '../../../../packages/asset-browser/src/services/AgentFragmentRetrieval';
export type {
  FragmentManifest,
  FragmentCategory,
  FragmentEntry
} from '../../../../packages/asset-browser/src/services/FragmentManifestLoader';

export {
  AgentFragmentRetrievalService
} from '../../../../packages/asset-browser/src/services/AgentFragmentRetrieval';
export {
  FragmentManifestLoader
} from '../../../../packages/asset-browser/src/services/FragmentManifestLoader';

const passthrough =
  <P extends object>(displayName: string): React.FC<React.PropsWithChildren<P>> =>
  ({ children }) => {
    const Component = 'div';
    return <Component data-testid={displayName}>{children}</Component>;
  };

export const UserProvider = passthrough('asset-browser-user-provider');
export const OriginalUserProvider = UserProvider;

export const useUserId = (): string => 'test-user';

const BrowserShell: React.FC<{ testId: string }> = ({ testId }) => (
  <div className="asset-library-v2 expanded" data-testid={testId}>
    <div className="library-header-v2">
      <span className="library-title">Asset Browser</span>
      <button className="library-toggle-btn">Toggle</button>
    </div>
    <input placeholder="Search presets..." />
    <div className="preset-list-item">★★★★★ Knight</div>
  </div>
);

export const EnhancedAssetBrowser: React.FC<Record<string, unknown>> = () => (
  <BrowserShell testId="enhanced-asset-browser" />
);

export const ProAssetBrowser: React.FC<Record<string, unknown>> = () => (
  <BrowserShell testId="pro-asset-browser" />
);

export const AssetBrowser: React.FC<Record<string, unknown>> = () => (
  <BrowserShell testId="asset-browser" />
);

export const AssetBrowserTabs: React.FC<Record<string, unknown>> = () => (
  <BrowserShell testId="asset-browser-tabs" />
);

export const ServerTab: React.FC<Record<string, unknown>> = () => (
  <div data-testid="asset-browser-server-tab" />
);

export const TabbedAssetBrowser: React.FC<Record<string, unknown>> = () => (
  <BrowserShell testId="tabbed-asset-browser" />
);

export const OpenGraphDialog: React.FC<Record<string, unknown>> = () => null;
export const SaveGraphDialog: React.FC<Record<string, unknown>> = () => null;
export const EnhancedPresetGrid: React.FC<Record<string, unknown>> = () => null;
export const EnhancedPresetCard: React.FC<Record<string, unknown>> = () => null;

export const useAssetBrowserStore = () => ({
  searchQuery: '',
  setSearchQuery: () => undefined
});

export default TabbedAssetBrowser;
