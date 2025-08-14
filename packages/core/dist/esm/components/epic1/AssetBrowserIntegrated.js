import { jsx as _jsx } from "react/jsx-runtime";
import { TabbedAssetBrowser, UserProvider } from '@prompt/asset-browser';
export const AssetBrowserIntegrated = ({ onInsert }) => {
    return (_jsx(UserProvider, { children: _jsx(TabbedAssetBrowser, { onInsert: onInsert }) }));
};
