"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usePreviewSeeds = void 0;
const react_1 = require("react");
const usePreviewSeeds = () => {
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const [results, setResults] = (0, react_1.useState)([]);
    const [aggregateError, setAggregateError] = (0, react_1.useState)(null);
    const abortRef = (0, react_1.useRef)(null);
    const runPreview = (0, react_1.useCallback)(async (graph) => {
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        setLoading(true);
        setError(null);
        setAggregateError(null);
        try {
            const seeds = Array.from({ length: 5 }, () => Math.floor(Math.random() * 100000));
            const settled = await Promise.allSettled(seeds.map((seed, i) => new Promise((resolve, reject) => {
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
                return;
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
    const cancelPreview = (0, react_1.useCallback)(() => {
        abortRef.current?.abort();
        setLoading(false);
        setResults([]);
    }, []);
    return { loading, error, results, runPreview, cancelPreview };
};
exports.usePreviewSeeds = usePreviewSeeds;

// ES6 export for build compatibility
export { usePreviewSeeds };

//# sourceMappingURL=usePreviewSeeds.js.map