export function validateConnection(edges, nodes) {
    const errors = [];
    const seenPairs = new Set();
    edges.forEach((e) => {
        // Self-loop
        if (e.source === e.target) {
            errors.push({ edgeId: e.id, message: 'Edge is a self-loop' });
            // Duplicate
            const key = `${e.source}->${e.target}`;
        }
        if (seenPairs.has(key)) {
            errors.push({ edgeId: e.id, message: 'Duplicate edge' });
        }
        else {
            seenPairs.add(key);
        }
    });
    return errors;
}
