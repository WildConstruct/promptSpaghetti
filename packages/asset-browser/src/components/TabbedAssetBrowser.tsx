import React from 'react';
import { ProAssetBrowser } from './ProAssetBrowser';
import type { Preset } from '../types';

export type TabbedAssetBrowserProps = {
  onInsert?: (preset: Preset) => void;
};

export const TabbedAssetBrowser: React.FC<TabbedAssetBrowserProps> = props => {
  // Use the full Pro Asset Browser with Logic-inspired UI
  return <ProAssetBrowser {...props} />;
};
