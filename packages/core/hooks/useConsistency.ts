import { useEffect, useMemo, useState } from 'react';

export type Severity = 'yellow' | 'orange' | 'red';
export type ConflictType = 'style' | 'temporal' | 'semantic';

export interface Conflict {
  id: string;
  nodeId: string;
  type: ConflictType;
  severity: Severity;
  message: string;
}

interface NodeLike {
  id: string;
  data?: { metadata?: any; [k: string]: any };
}

export function useConsistency(nodes: NodeLike[], edges: any[]) {
  const [conflicts, setConflicts] = useState<Conflict[]>([]);

  const meta = useMemo(() => {
    const styles: Record<string, number> = {};
    const times: Record<string, number> = {};
    const cats: Record<string, number> = {};
    nodes.forEach(n => {
      const m = n.data?.metadata || {};
      if (m.style) styles[String(m.style).toLowerCase()] = (styles[String(m.style).toLowerCase()] || 0) + 1;
      if (m.timePeriod) times[String(m.timePeriod).toLowerCase()] = (times[String(m.timePeriod).toLowerCase()] || 0) + 1;
      if (m.category) cats[String(m.category).toLowerCase()] = (cats[String(m.category).toLowerCase()] || 0) + 1;
    });
    const dominant = (rec: Record<string, number>) => Object.entries(rec).sort((a,b)=>b[1]-a[1])[0]?.[0] || undefined;
    return {
      styles,
      times,
      cats,
      dominantStyle: dominant(styles),
      dominantTime: dominant(times),
      dominantCategory: dominant(cats)
    };
  }, [nodes]);

  useEffect(() => {
    const list: Conflict[] = [];
    const hasMedieval = !!meta.times['medieval'];
    const hasFuturistic = !!meta.times['futuristic'];
    const hasCartoon = !!meta.styles['cartoon'];
    const hasRealistic = !!meta.styles['realistic'];
    const hasUnderwater = !!meta.cats['underwater'];
    const hasDesert = !!meta.cats['desert'];
    const hasSpace = !!meta.cats['space'];

    nodes.forEach(n => {
      const m = n.data?.metadata || {};
      const style = String(m.style || '').toLowerCase();
      const time = String(m.timePeriod || '').toLowerCase();
      const cat = String(m.category || '').toLowerCase();

      // Temporal conflicts
      if (hasMedieval && hasFuturistic) {
        if (time === 'medieval' || time === 'futuristic') {
          list.push({ id: `temp-${n.id}`, nodeId: n.id, type: 'temporal', severity: 'red', message: 'Temporal conflict: medieval and futuristic present' });
        }
      }

      // Style conflicts
      if (hasCartoon && hasRealistic) {
        if (style === 'cartoon' || style === 'realistic') {
          list.push({ id: `style-${n.id}`, nodeId: n.id, type: 'style', severity: 'red', message: 'Style clash: cartoon vs realistic' });
        } else if (style) {
          list.push({ id: `style-minor-${n.id}`, nodeId: n.id, type: 'style', severity: 'yellow', message: 'Minor style inconsistency' });
        }
      } else if (style && meta.dominantStyle && style !== meta.dominantStyle) {
        list.push({ id: `style-minor-${n.id}`, nodeId: n.id, type: 'style', severity: 'yellow', message: `Style differs from dominant (${meta.dominantStyle})` });
      }

      // Semantic conflicts
      if ((hasUnderwater && hasDesert) || (hasSpace && meta.times['medieval'])) {
        if (cat === 'underwater' || cat === 'desert' || cat === 'space' || time === 'medieval') {
          list.push({ id: `sem-${n.id}`, nodeId: n.id, type: 'semantic', severity: 'orange', message: 'Semantic mismatch in categories/environment' });
        }
      }
    });

    setConflicts(list);
  }, [nodes, edges, meta]);

  return {
    conflicts,
    dominantStyle: meta.dominantStyle,
    dominantTime: meta.dominantTime,
    dominantCategory: meta.dominantCategory
  };
}

