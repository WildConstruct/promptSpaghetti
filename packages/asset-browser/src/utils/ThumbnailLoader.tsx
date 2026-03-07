import React from 'react';
import { useThumbnailCache } from './useThumbnailCache';

export function ThumbnailLoader({ contentHash }: { contentHash?: string }) {
  const url = useThumbnailCache(contentHash);
  if (!url)
    return (
      <div
        style={{
          width: 160,
          height: 90,
          background: '#f5f5f5',
          color: '#6b7280',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12
        }}
        role="img"
        aria-label="Thumbnail not available"
      >
        No thumbnail
      </div>
    );
  return <img src={url} alt="thumbnail" width={160} height={90} />;
}
