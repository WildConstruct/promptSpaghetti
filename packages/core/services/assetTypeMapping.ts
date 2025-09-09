// Asset type mapping utilities for replacement flows

export type CompatType =
  | 'WeightedChoice'
  | 'TextBlock'
  | 'Concat'
  | 'Output'
  | 'Variable'
  | 'Unknown';

export interface MappedType {
  reactFlowType: string;
  compatType: CompatType;
}

export function mapAssetToNodeType(asset: {
  id: string;
  name?: string;
  type?: string;
  metadata?: any;
}): MappedType {
  const name = (asset.name || '').toLowerCase();
  const keywords: string[] = ((asset as any).metadata?.keywords || []).map(
    (k: string) => String(k).toLowerCase()
  );
  const text = `${name} ${keywords.join(' ')}`;

  if (text.includes('choice') || text.includes('weightedchoice')) {
    return { reactFlowType: 'weightedChoice', compatType: 'WeightedChoice' };
  }
  if (
    text.includes('concat') ||
    text.includes('combine') ||
    text.includes('merge')
  ) {
    return { reactFlowType: 'concat', compatType: 'Concat' };
  }
  if (text.includes('output')) {
    return { reactFlowType: 'output', compatType: 'Output' };
  }
  if (
    text.includes('variable') ||
    text.includes('name') ||
    text.includes('role')
  ) {
    return { reactFlowType: 'variable', compatType: 'Variable' };
  }
  // Fallback
  return { reactFlowType: 'textBlock', compatType: 'TextBlock' };
}

export function mapReactFlowTypeToCompat(
  reactFlowType: string | undefined
): CompatType {
  if (!reactFlowType) return 'Unknown';
  const t = reactFlowType.toLowerCase();
  switch (t) {
    case 'weightedchoice':
      return 'WeightedChoice';
    case 'textblock':
      return 'TextBlock';
    case 'concat':
      return 'Concat';
    case 'output':
      return 'Output';
    case 'variable':
      return 'Variable';
    default:
      return 'Unknown';
  }
}

// Simple compatibility matrix following MVP
const COMPAT_OUT: Record<CompatType, CompatType[]> = {
  WeightedChoice: ['TextBlock', 'Output', 'Concat', 'WeightedChoice'],
  TextBlock: ['Output', 'Concat', 'WeightedChoice'],
  Concat: ['Output', 'Concat', 'WeightedChoice'],
  Variable: ['TextBlock', 'Output', 'Concat'],
  Output: [],
  Unknown: []
};

export function canConnect(
  sourceCompat: CompatType,
  targetCompat: CompatType
): boolean {
  return COMPAT_OUT[sourceCompat]?.includes(targetCompat) || false;
}
