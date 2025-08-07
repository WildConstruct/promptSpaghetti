/**
* Validate current graph connections.
* Returns an array of errors – empty means valid.
*/
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
            {
                seenPairs.add(key);
            }
        }
    });
    return errors;
}
