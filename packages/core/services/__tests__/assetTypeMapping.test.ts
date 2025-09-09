import { mapAssetToNodeType, mapReactFlowTypeToCompat, canConnect } from '../assetTypeMapping';

describe('assetTypeMapping', () => {
  test('mapAssetToNodeType maps by name/keywords', () => {
    expect(mapAssetToNodeType({ id: '1', name: 'Character Choice' }).reactFlowType).toBe('weightedChoice');
    expect(mapAssetToNodeType({ id: '2', name: 'Combine Traits' }).reactFlowType).toBe('concat');
    expect(mapAssetToNodeType({ id: '3', name: 'Final Output' }).reactFlowType).toBe('output');
    expect(mapAssetToNodeType({ id: '4', name: 'Role Variable' }).reactFlowType).toBe('variable');
    expect(mapAssetToNodeType({ id: '5', name: 'Some Text' }).reactFlowType).toBe('textBlock');
  });

  test('compatibility matrix behaves as expected', () => {
    const WC = mapReactFlowTypeToCompat('weightedChoice');
    const TB = mapReactFlowTypeToCompat('textBlock');
    const CC = mapReactFlowTypeToCompat('concat');
    const OUT = mapReactFlowTypeToCompat('output');
    const VAR = mapReactFlowTypeToCompat('variable');

    expect(canConnect(WC, TB)).toBe(true);
    expect(canConnect(WC, OUT)).toBe(true);
    expect(canConnect(TB, OUT)).toBe(true);
    expect(canConnect(CC, OUT)).toBe(true);
    expect(canConnect(VAR, TB)).toBe(true);
    expect(canConnect(OUT, TB)).toBe(false);
  });
});

