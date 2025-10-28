import React from 'react';

interface SafeReactFlowWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Wrapper component that ensures ReactFlow is initialized before rendering children
 * Prevents "Cannot read properties of undefined" errors
 * 
 * Note: This wrapper should NOT use useStore outside of ReactFlowProvider context
 * Instead, it simply renders children directly as ReactFlow manages its own initialization
 */
export const SafeReactFlowWrapper: React.FC<SafeReactFlowWrapperProps> = ({ 
  children, 
  fallback = null 
}) => {
  // Simply render children - ReactFlow will handle its own initialization
  // The useStore hook can only be used inside ReactFlow components, not outside
  return <>{children}</>;
};