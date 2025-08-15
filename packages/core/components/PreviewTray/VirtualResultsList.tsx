import React from 'react';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';

interface ResultItem {
  seed: string | number;
  result: string;
}

interface VirtualResultsListProps {
  results: ResultItem[];
  height: number;
}

const ResultRow: React.FC<ListChildComponentProps<ResultItem[]>> = ({ index, style, data }) => {
  const result = data[index];
  return (
    <div style={style} className="virtual-result-row">
      <div className="seed-label">Seed {result.seed}</div>
      <div className="seed-result">{result.result}</div>
    </div>
  );
};

export const VirtualResultsList: React.FC<VirtualResultsListProps> = ({ results, height }) => {
  if (results.length <= 100) {
    return (
      <div className="seed-tabs">
        {results.map((result, index) => (
          <div key={index} className="seed-tab">
            <div className="seed-label">Seed {result.seed}</div>
            <div className="seed-result">{result.result}</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <List
      height={height}
      itemCount={results.length}
      itemSize={80}
      width="100%"
      itemData={results}
    >
      {ResultRow}
    </List>
  );
};