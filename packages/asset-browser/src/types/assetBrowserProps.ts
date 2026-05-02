import type { Preset } from '../types';

export type AssetBrowserProps = {
  onInsert?: (preset: Preset) => void;
};

export interface EnhancedAssetBrowserProps extends AssetBrowserProps {
  onNodeReplace?: (nodeId: string, preset: Preset) => void;
  enableFragmentManifest?: boolean;
}
