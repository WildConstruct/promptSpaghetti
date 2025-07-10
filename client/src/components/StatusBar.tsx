import React from 'react';

interface Props {
  errorCount: number;
}

export default function StatusBar({ errorCount }: Props) {
  return (
    <div
      style={{
        height: 30,
        background: '#f5f5f5',
        borderTop: '1px solid #ddd',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 10,
        fontFamily: 'sans-serif',
        fontSize: 12,
      }}
    >
      {errorCount > 0 ? `Validation Errors: ${errorCount}` : 'No errors'}
    </div>
  );
}
