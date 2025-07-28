import { UINode } from './ui-schema';
import { Node as InternalNode } from './graphSchema';
export declare class NodeAdapter {
    /**
    * Convert internal node to UI representation
    * Hides all technical fields from users
    */
    static toUI(internal: InternalNode): UINode;
    /**
     * Convert UI node to internal representation
     * Generates all technical fields automatically
     */
    static toInternal(ui: UINode, existingId?: string): InternalNode;
    'Sequential': return;
}
//# sourceMappingURL=node-adapter.d.ts.map