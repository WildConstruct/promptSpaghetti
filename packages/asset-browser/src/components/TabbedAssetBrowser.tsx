import React from 'react';
import { ProAssetBrowser } from './ProAssetBrowser';
import type { Preset } from '../types';

export type TabbedAssetBrowserProps = {
  onInsert?: (preset: Preset) => void;
};

export function TabbedAssetBrowser(
  props: TabbedAssetBrowserProps
): JSX.Element {
  // Use the new Pro Asset Browser with Logic-inspired UI
  return <ProAssetBrowser {...props} />;
}
