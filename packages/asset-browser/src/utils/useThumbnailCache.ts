import { useEffect, useState } from 'react';

const memoryCache = new Map<string, string>();

export function useThumbnailCache(contentHash: string | undefined) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!contentHash) {
      setUrl(null);
      return;
    }
    if (memoryCache.has(contentHash)) {
      setUrl(memoryCache.get(contentHash) || null);
      return;
    }
    memoryCache.set(contentHash, '');
    setUrl(null);
  }, [contentHash]);
  return url;
}
