import React from 'react';

interface SafeReactFlowWrapperProps {
  children: React.ReactNode;
}

/**
 * ReactFlow store hooks must stay inside ReactFlowProvider.
 */
export const SafeReactFlowWrapper: React.FC<SafeReactFlowWrapperProps> = ({
  children
}) => {
  return <>{children}</>;
};
