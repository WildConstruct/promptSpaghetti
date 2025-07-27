import { BaseNodeEditorProps } from '../BaseNodeEditor';
export interface ConditionalEditorProps extends Omit<BaseNodeEditorProps, 'children'> {
    nodeId: string;
}
/**
 * Epic 8.4 - Conditional Editor with Progressive Disclosure
 *
 * Three-tier disclosure system:
 * - Basic: Node name, default output, and simple conditional branches
 * - Advanced: Branch management and conditional logic controls
 * - Debug: Technical settings, strict mode, variable access controls
 */
export declare const defaultOutput: string;
//# sourceMappingURL=ConditionalEditor.d.ts.map