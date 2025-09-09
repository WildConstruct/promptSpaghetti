// Asset Match Indicator
// Story 2.5a: Asset Browser Integration MVP

import React from 'react';

export const AssetMatchIndicator: React.FC<{ score: number; relevance: 'high' | 'medium' | 'low'; offline?: boolean }>
  = ({ score, relevance, offline = false }) => {
  const label = offline ? 'Basic matching (offline)' : (relevance === 'high' ? 'High match' : (relevance === 'medium' ? '~ Medium match' : ''));
  const color = relevance === 'high' ? '#4CAF50' : relevance === 'medium' ? '#FFC107' : '#9E9E9E';
  if (!label) return null;
  return (
    <span className="asset-match-indicator" title={`${Math.round(score)}% match`} style={{ color }}>
      {label}
    </span>
  );
};

