"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateConnection = validateConnection;
function validateConnection(edges, nodes) {
    const errors = [];
    const seenPairs = new Set();
    edges.forEach((e) => {
        if (e.source === e.target) {
            errors.push({ edgeId: e.id, message: 'Edge is a self-loop' });
        }
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
//# sourceMappingURL=validation.js.map