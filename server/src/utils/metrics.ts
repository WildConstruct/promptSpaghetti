type Bucket = { t: number; c: number };

export type MetricsSnapshot = {
  uptimeSec: number;
  startedAt: string;
  totals: Record<string, number>;
  errors: Record<string, number>;
  perMinute: { label: string; count: number }[];
};

class Metrics {
  private start = Date.now();
  private totals = new Map<string, number>();
  private errors = new Map<string, number>();
  private buckets: Bucket[] = [];
  private readonly windowMinutes = 60;

  private inc(map: Map<string, number>, key: string, by = 1) {
    map.set(key, (map.get(key) || 0) + by);
  }

  mark(event: string, by = 1) {
    this.inc(this.totals, event, by);
    const nowMin = Math.floor(Date.now() / 60000);
    const last = this.buckets[this.buckets.length - 1];
    if (!last || last.t !== nowMin) {
      this.buckets.push({ t: nowMin, c: by });
    } else {
      last.c += by;
    }
    // trim
    while (this.buckets.length > this.windowMinutes) this.buckets.shift();
  }

  markError(kind: string, by = 1) {
    this.inc(this.errors, kind, by);
  }

  snapshot(): MetricsSnapshot {
    const uptimeSec = Math.floor((Date.now() - this.start) / 1000);
    const totals = Object.fromEntries(this.totals.entries());
    const errors = Object.fromEntries(this.errors.entries());
    const nowMin = Math.floor(Date.now() / 60000);
    const series: { label: string; count: number }[] = [];
    for (let i = this.windowMinutes - 1; i >= 0; i--) {
      const t = nowMin - i;
      const b = this.buckets.find(x => x.t === t);
      series.push({
        label: new Date(t * 60000).toISOString().slice(11, 16),
        count: b?.c || 0
      });
    }
    return {
      uptimeSec,
      startedAt: new Date(this.start).toISOString(),
      totals,
      errors,
      perMinute: series
    };
  }
}

export const metrics = new Metrics();
