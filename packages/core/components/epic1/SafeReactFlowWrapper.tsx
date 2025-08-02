import React from 'react';
import { useStore } from 'reactflow';

interface SafeReactFlowWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Wrapper component that ensures ReactFlow is initialized before rendering children
 * Prevents "Cannot read properties of undefined" errors
 */
export const SafeReactFlowWrapper: React.FC<SafeReactFlowWrapperProps> = ({ 
  children, 
  fallback = null 
}) => {
  try {
    // Try to access the store to check if ReactFlow is initialized
    const isInitialized = useStore((state) => state?.viewport !== undefined);
    
    if (!isInitialized) {
      return <>{fallback}</>;
    }
    
    return <>{children}</>;
  } catch (error) {
    // If useStore throws, ReactFlow isn't ready yet
    return <>{fallback}</>;
  }
};