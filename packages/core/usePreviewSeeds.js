import { useState, useCallback, useRef } from "react";
export const usePreviewSeeds = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [results, setResults] = useState([]);
    const [aggregateError, setAggregateError] = useState(null);
    const abortRef = useRef(null);
    const runPreview = useCallback(async (graph) => {
        // Cancel any existing run
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        setLoading(true);
        setError(null);
        setAggregateError(null);
        try {
            // TODO: replace with real executor call; honor controller.signal
            const seeds = Array.from({ length: 5 }, () => Math.floor(Math.random() * 100000));
            const settled = await Promise.allSettled(seeds.map((seed, i) => new Promise((resolve, reject) => {
                // Simulate async executor — 20% chance to fail
                const delay = 200 + Math.random() * 400;
                const id = setTimeout(() => {
                    if (Math.random() < 0.2) {
                        reject(new Error(`Executor failed on seed ${seed}`));
                    }
                    else {
                        resolve({ seed, output: `Mock output #${i + 1}` });
                    }
                }, delay);
                controller.signal.addEventListener("abort", () => {
                    clearTimeout(id);
                    reject(new DOMException("aborted", "AbortError"));
                });
            })));
            if (controller.signal.aborted) {
                return; // Skip state updates if cancelled
            }
            const perSeedResults = settled.map((r, idx) => r.status === "fulfilled"
                ? { seed: seeds[idx], output: r.value.output, usedNodeIds: [`node${idx}`], usedEdgeIds: [`edge${idx}`] }
                : { seed: seeds[idx], error: r.reason.message });
            setResults(perSeedResults);
            const failed = perSeedResults.filter((r) => r.error).length;
            if (failed > 0) {
                setAggregateError(`${failed} of ${perSeedResults.length} previews failed`);
            }
        }
        catch (err) {
            if (err?.name !== "AbortError") {
                setError(err?.message ?? "Unknown error");
            }
        }
        finally {
            setLoading(false);
        }
    }, []);
    const cancelPreview = useCallback(() => {
        abortRef.current?.abort();
        setLoading(false);
        setResults([]);
    }, []);
    return { loading, error, results, runPreview, cancelPreview };
};
