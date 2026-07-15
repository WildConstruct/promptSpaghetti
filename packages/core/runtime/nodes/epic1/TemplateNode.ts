/**
 * TemplateNode — fill a sentence skeleton with named {slots}.
 * Primary natural-language assembly mechanism (work-loop B2).
 */

import { ExecutionContext } from '../../types';
import { fillTemplate, templateSlots } from '../../assembly';
import {
  BaseInlineEditableNode,
  InlineEditableConfig
} from './BaseInlineEditableNode';
import { Epic1NodeType } from './nodeTypes';

export interface TemplateConfig {
  /** Sentence skeleton with {slotName} placeholders */
  template: string;
  /** Capitalize first letter after fill (default true) */
  capitalize?: boolean;
  /** Append terminal period if missing (default true for full-sentence defaults) */
  terminate?: boolean;
}

export class TemplateNode extends BaseInlineEditableNode<
  TemplateConfig,
  string
> {
  private slotValues: Record<string, string> = {};

  constructor(
    id: string,
    initial: TemplateConfig = {
      template: 'a {subject} in {setting}',
      capitalize: true,
      terminate: true
    },
    config: InlineEditableConfig = {}
  ) {
    super(id, initial, config);
  }

  getNodeType(): string {
    return Epic1NodeType.Template;
  }

  /** Slot values collected by the engine from slot-* target handles. */
  setSlotValues(slots: Record<string, string>): void {
    this.slotValues = { ...slots };
  }

  getSlotNames(): string[] {
    const cfg = this.getCurrentValue();
    return templateSlots(cfg.template || '');
  }

  async run(_ctx: ExecutionContext): Promise<string> {
    const cfg = this.getCurrentValue();
    const template = cfg.template || '';
    const capitalize = cfg.capitalize !== false;
    const terminate = cfg.terminate === true;

    // Ensure every declared slot key exists (empty string if unwired).
    const slots: Record<string, string> = {};
    for (const name of templateSlots(template)) {
      slots[name] = this.slotValues[name] ?? '';
    }
    // Also include any extra slot values that may have been wired under other names
    for (const [key, value] of Object.entries(this.slotValues)) {
      if (!(key in slots)) {
        slots[key] = value;
      }
    }

    return fillTemplate(template, slots, { capitalize, terminate });
  }

  protected cloneValue(value: TemplateConfig): TemplateConfig {
    return { ...value };
  }

  protected async validateValue(
    value: TemplateConfig
  ): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];
    if (!value || typeof value !== 'object') {
      errors.push('Configuration must be an object');
      return { valid: false, errors };
    }
    if (typeof value.template !== 'string') {
      errors.push('template must be a string');
    }
    return { valid: errors.length === 0, errors };
  }
}
