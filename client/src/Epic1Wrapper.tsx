import React from 'react';

// Lazy load the Epic1GraphEditor to isolate any import issues
const Epic1GraphEditor = React.lazy(() => 
  import('@promptscape/core/components/epic1').then(module => ({
    default: module.Epic1GraphEditorWithProvider
  }))
);

export const Epic1GraphEditorWrapper: React.FC<any> = (props) => {
  return (
    <React.Suspense fallback={
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
        color: '#718096'
      }}>
        Loading Epic 1 Editor...
      </div>
    }>
      <Epic1GraphEditor {...props} />
    </React.Suspense>
  );
};