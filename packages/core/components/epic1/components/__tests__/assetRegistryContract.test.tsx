/**
 * @jest-environment jsdom
 */

describe('Asset Registry Event Contract', () => {
  it("dispatches 'assetRegistry:update' with { assets } detail and listeners receive it", () => {
    const received: any[] = [];
    const handler = (e: Event) => {
      const ce = e as CustomEvent;
      received.push(ce.detail?.assets);
    };
    window.addEventListener('assetRegistry:update', handler as any);

    try {
      const assets = [
        { id: 'a1', name: 'Test A', type: 'psg', metadata: {} },
        { id: 'b2', name: 'Test B', type: 'psglib', metadata: {} },
      ];
      const evt = new CustomEvent('assetRegistry:update', { detail: { assets } });
      window.dispatchEvent(evt);

      expect(received.length).toBe(1);
      expect(received[0]).toEqual(assets);
    } finally {
      window.removeEventListener('assetRegistry:update', handler as any);
    }
  });
});

