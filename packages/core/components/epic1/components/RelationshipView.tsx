import React, { useEffect, useMemo, useState } from 'react';
import './RelationshipView.css';
import type { Asset } from '../../../services/assetMatcher';

type AssetRegistryEvent = CustomEvent<{ assets: Asset[] }>;

interface RelationshipViewProps {
  assets?: Asset[];
}

const mapAssetsByType = (assets: Asset[]) => {
  const groups = new Map<string, Asset[]>();
  assets.forEach(asset => {
    const key = (asset.type ?? 'unknown').toLowerCase();
    const existing = groups.get(key);
    if (existing) {
      existing.push(asset);
    } else {
      groups.set(key, [asset]);
    }
  });
  return Array.from(groups.entries()).map(([key, items]) => ({
    key,
    count: items.length,
    items: items.slice(0, 8)
  }));
};

export const RelationshipView: React.FC<RelationshipViewProps> = ({ assets = [] }) => {
  const [internalAssets, setInternalAssets] = useState<Asset[]>(assets);

  useEffect(() => {
    setInternalAssets(assets);
  }, [assets]);

  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as AssetRegistryEvent;
      if (Array.isArray(customEvent.detail?.assets)) {
        setInternalAssets(customEvent.detail.assets);
      }
    };

    window.addEventListener('assetRegistry:update', handler);
    return () => window.removeEventListener('assetRegistry:update', handler);
  }, []);

  // Cluster by type and first keyword
  const clusters = useMemo(() => mapAssetsByType(internalAssets), [internalAssets]);

  return (
    <div className="relationship-panel">
      <div className="relationship-title">Asset Relationships</div>
      <div className="relationship-subtitle">Clusters by type (prototype)</div>
      <div className="relationship-grid">
        {clusters.map(c => (
          <div key={c.key} className="relationship-card">
            <div className="relationship-card-title">{c.key} • {c.count}</div>
            <ul className="relationship-list">
              {c.items.map(a => (<li key={a.id}>{a.name}</li>))}
              {c.count > c.items.length && (<li className="relationship-more">… and {c.count - c.items.length} more</li>)}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelationshipView;
