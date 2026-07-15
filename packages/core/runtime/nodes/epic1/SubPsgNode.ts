/**
 * SubPsgNode — reference to an embedded nested PSG document (precomp).
 * Runtime execution is performed by Epic1ExecutionEngine, which resolves
 * the child graph by documentId and returns its Output result.
 *
 * See docs/nested-psg-precomp-plan.md
 */

import { ExecutionContext } from '../../types';
import {
  BaseInlineEditableNode,
  InlineEditableConfig
} from './BaseInlineEditableNode';
import { Epic1NodeType } from './nodeTypes';

export interface SubPsgConfig {
  /** Id of an embedded document in the parent PSG `documents[]` list. */
  documentId: string;
  /** Display name of the nested document (UI). */
  documentName?: string;
  /** How to pick a result from the child graph (currently first Output only). */
  outputMode?: 'first-output';
}

export class SubPsgNode extends BaseInlineEditableNode<SubPsgConfig, string> {
  constructor(
    id: string,
    initial: SubPsgConfig = {
      documentId: '',
      documentName: 'Nested PSG',
      outputMode: 'first-output'
    },
    config: InlineEditableConfig = {}
  ) {
    super(id, initial, config);
  }

  getNodeType(): string {
    return Epic1NodeType.SubPSG;
  }

  getDocumentId(): string {
    return this.getCurrentValue().documentId || '';
  }

  getDocumentName(): string {
    const cfg = this.getCurrentValue();
    return cfg.documentName || cfg.documentId || 'Nested PSG';
  }

  /**
   * Direct run is a fallback only — the engine intercepts SubPSG and executes
   * the nested document graph. Without engine support, surface a clear message.
   */
  async run(_ctx: ExecutionContext): Promise<string> {
    const id = this.getDocumentId();
    if (!id) {
      return '[SubPSG: no documentId]';
    }
    return `[SubPSG: unresolved document ${id}]`;
  }

  protected cloneValue(value: SubPsgConfig): SubPsgConfig {
    return { ...value };
  }

  protected async validateValue(
    value: SubPsgConfig
  ): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];
    if (!value || typeof value !== 'object') {
      errors.push('Configuration must be an object');
      return { valid: false, errors };
    }
    if (typeof value.documentId !== 'string') {
      errors.push('documentId must be a string');
    }
    return { valid: errors.length === 0, errors };
  }
}
