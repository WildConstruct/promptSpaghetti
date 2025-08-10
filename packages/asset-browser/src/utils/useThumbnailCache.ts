import { useEffect, useState } from 'react';

const memoryCache = new Map<string, string>();

export function useThumbnailCache(contentHash: string | undefined) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!contentHash) return;
    if (memoryCache.has(contentHash)) {
      setUrl(memoryCache.get(contentHash) || null);
      return;
    }
    // stub: simulate async load
    const timeout = setTimeout(() => {
      const fakeUrl = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='90'><rect width='100%' height='100%' fill='%23eee'/><text x='10' y='50' font-size='12' fill='%23666'>${contentHash.slice(0, 6)}</text></svg>`;
      memoryCache.set(contentHash, fakeUrl);
      setUrl(fakeUrl);
    }, 50);
    return () => clearTimeout(timeout);
  }, [contentHash]);
  return url;
}
