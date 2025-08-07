import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import { useStore } from 'reactflow';
/**
 * Wrapper component that ensures ReactFlow is initialized before rendering children
 * Prevents "Cannot read properties of undefined" errors
 */
export const SafeReactFlowWrapper = ({ children, fallback = null }) => {
    try {
        // Try to access the store to check if ReactFlow is initialized
        const isInitialized = useStore((state) => state?.viewport !== undefined);
        if (!isInitialized) {
            return _jsx(_Fragment, { children: fallback });
        }
        return _jsx(_Fragment, { children: children });
    }
    catch (error) {
        // If useStore throws, ReactFlow isn't ready yet
        return _jsx(_Fragment, { children: fallback });
    }
};
