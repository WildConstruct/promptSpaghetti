import React from 'react';
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
    <div style={{ background: '#0b0b0b', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: 10 }}>
      <div style={{ marginBottom: 8, fontWeight: 600 }}>Asset Relationships</div>
      <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 6 }}>Clusters by type (prototype)</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, maxHeight: 280, overflow: 'auto' }}>
        {clusters.map(c => (
          <div key={c.key} style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: 8 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{c.key} • {c.count}</div>
            <ul style={{ margin: 0, paddingLeft: 16 }}>
              {c.items.map(a => (<li key={a.id}>{a.name}</li>))}
              {c.count > c.items.length && (<li>… and {c.count - c.items.length} more</li>)}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelationshipView;

