/**
 * Asset Browser Integration
 * Re-exports the asset browser components for bundling with core
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-require-imports */

// Try to export from asset browser if available
let TabbedAssetBrowser: any = undefined;
let AssetBrowser: any = undefined;
let AssetBrowserTabs: any = undefined;
let ServerTab: any = undefined;
let OpenGraphDialog: any = undefined;
let SaveGraphDialog: any = undefined;
let UserProvider: any = undefined;
let useUserId: any = undefined;

try {
  const assetBrowserModule = require('@prompt/asset-browser');
  TabbedAssetBrowser = assetBrowserModule.TabbedAssetBrowser;
  AssetBrowser = assetBrowserModule.AssetBrowser;
  AssetBrowserTabs = assetBrowserModule.AssetBrowserTabs;
  ServerTab = assetBrowserModule.ServerTab;
  OpenGraphDialog = assetBrowserModule.OpenGraphDialog;
  SaveGraphDialog = assetBrowserModule.SaveGraphDialog;
  UserProvider = assetBrowserModule.UserProvider;
  useUserId = assetBrowserModule.useUserId;
} catch {
  // Asset browser package not available
  console.log('[AssetBrowserIntegration] Asset browser package not available');
}

export {
  TabbedAssetBrowser,
  AssetBrowser,
  AssetBrowserTabs,
  ServerTab,
  OpenGraphDialog,
  SaveGraphDialog,
  UserProvider,
  useUserId
};
