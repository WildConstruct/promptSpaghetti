import React from 'react';
import { useThumbnailCache } from './useThumbnailCache';

export function ThumbnailLoader({ contentHash }: { contentHash?: string }) {
  const url = useThumbnailCache(contentHash);
  if (!url)
    return (
      <div
        style={{ width: 160, height: 90, background: '#f5f5f5' }}
        aria-busy
      />
    );
  return <img src={url} alt="thumbnail" width={160} height={90} />;
}
