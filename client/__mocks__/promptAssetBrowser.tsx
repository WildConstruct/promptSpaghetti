import React from 'react';
import type { Preset } from '../../packages/asset-browser/src/types';

export interface AgentFragmentRecord {
  id: string;
  name: string;
  path: string;
  category: string;
  description?: string;
  tags?: string[];
  roles?: string[];
  domains?: string[];
  nodeTypes?: string[];
  placementHints?: string[];
  tone?: string[];
  nodeCount: number;
  preferredInsertion?: string;
  entryStrategy?: string;
  exitStrategy?: string;
  suggestionWeight?: number;
  requiresBranchLane?: boolean;
  priority?: number;
}

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => <>{children}</>;

export const TabbedAssetBrowser: React.FC<{
  onInsert?: (preset: Preset) => void;
}> = () => <div data-testid="mock-tabbed-asset-browser">Mock Asset Browser</div>;

export const ProAssetBrowser: React.FC<{
  onInsert?: (preset: Preset) => void;
}> = () => <div data-testid="mock-pro-asset-browser">Mock Pro Asset Browser</div>;

export const EnhancedAssetBrowser: React.FC<{
  onInsert?: (preset: Preset) => void;
}> = () => (
  <div data-testid="mock-enhanced-asset-browser">Mock Enhanced Asset Browser</div>
);

export class AgentFragmentRetrievalService {
  static async suggestFragmentsForSelection(): Promise<AgentFragmentRecord[]> {
    return [];
  }
}
