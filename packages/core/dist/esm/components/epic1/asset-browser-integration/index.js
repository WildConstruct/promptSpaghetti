/**
 * Asset Browser Integration
 * Re-exports the asset browser components for bundling with core
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-require-imports */
// Try to export from asset browser if available
let TabbedAssetBrowser = undefined;
let AssetBrowser = undefined;
let AssetBrowserTabs = undefined;
let ServerTab = undefined;
let OpenGraphDialog = undefined;
let SaveGraphDialog = undefined;
let UserProvider = undefined;
let useUserId = undefined;
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
}
catch {
    // Asset browser package not available
    console.log('[AssetBrowserIntegration] Asset browser package not available');
}
export { TabbedAssetBrowser, AssetBrowser, AssetBrowserTabs, ServerTab, OpenGraphDialog, SaveGraphDialog, UserProvider, useUserId };
