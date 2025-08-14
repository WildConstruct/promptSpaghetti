import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { PreviewEngine } from '../preview/PreviewEngine';
const PreviewContext = createContext(undefined);
export const PreviewProvider = ({ children, nodes, edges, isDragging, previewDebounceDelay = 300, previewSeeds: initialSeeds = ['seed1', 'seed2', 'seed3'], }) => {
    const [previewEngine] = useState(() => new PreviewEngine());
    const [isPreviewVisible, setPreviewVisible] = useState(false);
    const [previewResults, setPreviewResults] = useState([]);
    const [isExecuting, setIsExecuting] = useState(false);
    const [previewSeeds, setPreviewSeeds] = useState(initialSeeds);
    const executionTimeoutRef = useRef(null);
    const abortControllerRef = useRef(null);
    // Auto-execute preview when nodes/edges change and preview is visible
    useEffect(() => {
        if (!isPreviewVisible || isDragging) {
            return;
        }
        // Clear existing timeout
        if (executionTimeoutRef.current) {
            clearTimeout(executionTimeoutRef.current);
        }
        // Debounce execution
        executionTimeoutRef.current = setTimeout(() => {
            executePreview(nodes, edges);
        }, previewDebounceDelay);
        return () => {
            if (executionTimeoutRef.current) {
                clearTimeout(executionTimeoutRef.current);
            }
        };
    }, [nodes, edges, isPreviewVisible, isDragging, previewDebounceDelay]);
    const executePreview = useCallback(async (previewNodes, previewEdges) => {
        // Cancel any existing execution
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        // Create new abort controller
        const abortController = new AbortController();
        abortControllerRef.current = abortController;
        setIsExecuting(true);
        setPreviewResults([]);
        try {
            const results = [];
            for (const seed of previewSeeds) {
                // Check if aborted
                if (abortController.signal.aborted) {
                    break;
                }
                try {
                    const result = await previewEngine.execute(previewNodes, previewEdges, seed);
                    // Check if aborted after execution
                    if (!abortController.signal.aborted) {
                        results.push({
                            seed,
                            result: result || 'No output',
                        });
                    }
                }
                catch (error) {
                    if (!abortController.signal.aborted) {
                        results.push({
                            seed,
                            result: '',
                            error: error instanceof Error ? error.message : 'Unknown error',
                        });
                    }
                }
            }
            // Only update results if not aborted
            if (!abortController.signal.aborted) {
                setPreviewResults(results);
            }
        }
        catch (error) {
            console.error('Preview execution error:', error);
        }
        finally {
            if (abortControllerRef.current === abortController) {
                setIsExecuting(false);
                abortControllerRef.current = null;
            }
        }
    }, [previewEngine, previewSeeds]);
    const clearResults = useCallback(() => {
        setPreviewResults([]);
    }, []);
    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (executionTimeoutRef.current) {
                clearTimeout(executionTimeoutRef.current);
            }
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);
    const value = {
        previewEngine,
        isPreviewVisible,
        setPreviewVisible,
        executePreview,
        previewResults,
        isExecuting,
        previewSeeds,
        setPreviewSeeds,
        clearResults,
    };
    return (_jsx(PreviewContext.Provider, { value: value, children: children }));
};
export const usePreview = () => {
    const context = useContext(PreviewContext);
    if (!context) {
        throw new Error('usePreview must be used within a PreviewProvider');
    }
    return context;
};
