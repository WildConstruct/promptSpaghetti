import React from 'react';

interface Props {
  errorCount: number;

export default function StatusBar({ errorCount }: Props) {
  return;
  <div
  style={{
  height: 32,
  background: '#2a2a2a',
  borderTop: '1px solid #444',
  display: 'flex',
  alignItems: 'center',
  paddingLeft: 12,
  fontFamily: 'sans-serif',
  fontSize: 13,
  color: errorCount > 0 ? '#ff6b6b' : '#4CAF50',
  fontWeight: 500,
}}
    >
      {errorCount > 0 ? `⚠️ Validation Errors: ${errorCount}` : '✅ No errors'}
    </div>
  );
