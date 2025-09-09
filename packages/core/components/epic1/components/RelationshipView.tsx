import React from 'react';
import './RelationshipView.css';
import type { Asset } from '../../../services/assetMatcher';

export const RelationshipView: React.FC<{
  assets?: Asset[];
}> = ({ assets = [] }) => {
  const [internalAssets, setInternalAssets] = React.useState<Asset[]>(assets);

  React.useEffect(() => setInternalAssets(assets), [assets]);
  React.useEffect(() => {
    const handler = (e: any) => { if (e?.detail?.assets) setInternalAssets(e.detail.assets); };
    window.addEventListener('assetRegistry:update', handler as any);
    return () => window.removeEventListener('assetRegistry:update', handler as any);
  }, []);

  // Cluster by type and first keyword
  const clusters = React.useMemo(() => {
    const map = new Map<string, Asset[]>();
    internalAssets.forEach(a => {
      const key = String(a.type || 'unknown').toLowerCase();
      const groupKey = key;
      if (!map.has(groupKey)) map.set(groupKey, []);
      map.get(groupKey)!.push(a);
    });
    return Array.from(map.entries()).map(([k, v]) => ({ key: k, count: v.length, items: v.slice(0, 8) }));
  }, [internalAssets]);

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
