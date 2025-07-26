/**
 * Validate current graph connections.
 * Returns an array of errors – empty means valid.
 */
export function validateConnection(edges: any[], nodes: any[]): any[] {
    const errors = [];
    const seenPairs = new Set();
    edges.forEach((e: any) => {
        // Self-loop
        if (e.source === e.target) {
            errors.push({ edgeId: e.id, message: 'Edge is a self-loop' });
        }
        // Duplicate
        const key = `${e.source}->${e.target}`;
        if (seenPairs.has(key)) {
            errors.push({ edgeId: e.id, message: 'Duplicate edge' });
        }
        else {
            seenPairs.add(key);
        }
    });
    return errors;
}
