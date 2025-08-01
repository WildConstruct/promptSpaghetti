/**
 * Base class for all Epic 1 nodes with inline editing support
 * Provides common functionality for edit state management, validation, and serialization
 */

import { RuntimeNode, ExecutionContext } from '../../types';
import { z } from 'zod';
import { EditStateSchema, EditState } from '../../../schemas/psgSchemaV2';

/**
 * Configuration for inline editable nodes
 */
export interface InlineEditableConfig {
  /** Whether the node is currently locked for editing */
  isLocked?: boolean;
  /** Reason for locking (if locked) */
  lockReason?: string;
  /** Preview mode for this node */
  previewMode?: 'auto' | 'manual' | 'live';
  /** Whether the node is valid */
  isValid?: boolean;
  /** Validation error message */
  validationMessage?: string;
}

/**
 * Base data structure for all inline editable nodes
 */
export interface InlineEditableData<T = any> {
  /** The actual value of the node */
  value: T;
  /** Edit state for inline editing */
  editState: EditState;
  /** Whether the node is locked */
  isLocked: boolean;
  /** Reason for locking */
  lockReason?: string;
  /** Preview mode */
  previewMode: 'auto' | 'manual' | 'live';
  /** Whether the node data is valid */
  isValid: boolean;
  /** Validation error message */
  validationMessage?: string;
  /** Last preview update timestamp */
  lastPreviewUpdate?: string;
}

/**
 * Abstract base class for all Epic 1 nodes with inline editing support
 */
export abstract class BaseInlineEditableNode<TValue = any, TOutput = unknown> extends RuntimeNode<TOutput> {
  protected data: InlineEditableData<TValue>;
  protected editBuffer: TValue | null = null;

  constructor(
    id: string,
    initialValue: TValue,
    config: InlineEditableConfig = {}
  ) {
    super(id);
    this.data = {
      value: initialValue,
      editState: this.createDefaultEditState(),
      isLocked: config.isLocked || false,
      lockReason: config.lockReason,
      previewMode: config.previewMode || 'auto',
      isValid: config.isValid !== false,
      validationMessage: config.validationMessage,
    };
  }

  /**
   * Create default edit state
   */
  protected createDefaultEditState(): EditState {
    return {
      isEditing: false,
      editBuffer: undefined,
      lastEditTimestamp: undefined,
      validationErrors: [],
      isDirty: false,
    };
  }

  /**
   * Start editing this node
   */
  startEdit(): void {
    if (this.data.isLocked) {
      throw new Error(`Node is locked: ${this.data.lockReason || 'No reason provided'}`);
    }

    this.data.editState.isEditing = true;
    this.editBuffer = this.cloneValue(this.data.value);
    this.data.editState.editBuffer = this.editBuffer;
    this.data.editState.lastEditTimestamp = new Date().toISOString();
  }

  /**
   * Cancel editing and discard changes
   */
  cancelEdit(): void {
    this.data.editState.isEditing = false;
    this.data.editState.editBuffer = undefined;
    this.data.editState.isDirty = false;
    this.data.editState.validationErrors = [];
    this.editBuffer = null;
  }

  /**
   * Commit edit changes
   */
  async commitEdit(): Promise<void> {
    if (!this.data.editState.isEditing || this.editBuffer === null) {
      throw new Error('No active edit session');
    }

    // Validate the edit buffer
    const validation = await this.validateValue(this.editBuffer);
    if (!validation.valid) {
      this.data.editState.validationErrors = validation.errors;
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    // Apply the changes
    this.data.value = this.cloneValue(this.editBuffer);
    this.data.editState.isEditing = false;
    this.data.editState.editBuffer = undefined;
    this.data.editState.isDirty = false;
    this.data.editState.validationErrors = [];
    this.data.isValid = true;
    this.data.validationMessage = undefined;
    this.editBuffer = null;
    this.data.lastPreviewUpdate = new Date().toISOString();
  }

  /**
   * Update the edit buffer
   */
  updateEditBuffer(newValue: TValue): void {
    if (!this.data.editState.isEditing) {
      throw new Error('Not in edit mode');
    }

    this.editBuffer = this.cloneValue(newValue);
    this.data.editState.editBuffer = this.editBuffer;
    this.data.editState.isDirty = true;

    // Perform immediate validation if in auto preview mode
    if (this.data.previewMode === 'auto') {
      this.validateValue(newValue).then(result => {
        this.data.editState.validationErrors = result.valid ? [] : result.errors;
      });
    }
  }

  /**
   * Get current value (either committed value or edit buffer if editing)
   */
  getCurrentValue(): TValue {
    if (this.data.editState.isEditing && this.editBuffer !== null) {
      return this.editBuffer;
    }
    return this.data.value;
  }

  /**
   * Check if node is currently being edited
   */
  isEditing(): boolean {
    return this.data.editState.isEditing;
  }

  /**
   * Check if node has unsaved changes
   */
  isDirty(): boolean {
    return this.data.editState.isDirty;
  }

  /**
   * Get validation errors
   */
  getValidationErrors(): string[] {
    return this.data.editState.validationErrors;
  }

  /**
   * Lock the node to prevent editing
   */
  lock(reason?: string): void {
    if (this.data.editState.isEditing) {
      this.cancelEdit();
    }
    this.data.isLocked = true;
    this.data.lockReason = reason;
  }

  /**
   * Unlock the node to allow editing
   */
  unlock(): void {
    this.data.isLocked = false;
    this.data.lockReason = undefined;
  }

  /**
   * Set preview mode
   */
  setPreviewMode(mode: 'auto' | 'manual' | 'live'): void {
    this.data.previewMode = mode;
  }

  /**
   * Get the complete node data including edit state
   */
  getData(): InlineEditableData<TValue> {
    return this.cloneData(this.data);
  }

  /**
   * Set node data (used for deserialization)
   */
  setData(data: InlineEditableData<TValue>): void {
    this.data = this.cloneData(data);
    this.editBuffer = null;
  }

  /**
   * Clone a value (must be implemented by subclasses for their specific value types)
   */
  protected abstract cloneValue(value: TValue): TValue;

  /**
   * Validate a value (must be implemented by subclasses)
   */
  protected abstract validateValue(value: TValue): Promise<{ valid: boolean; errors: string[] }>;

  /**
   * Clone the complete data structure
   */
  protected cloneData(data: InlineEditableData<TValue>): InlineEditableData<TValue> {
    return {
      ...data,
      value: this.cloneValue(data.value),
      editState: { ...data.editState },
    };
  }

  /**
   * Serialize node for persistence
   */
  serialize(): any {
    return {
      id: this.id,
      type: this.getNodeType(),
      data: this.getData(),
    };
  }

  /**
   * Get the node type (must be implemented by subclasses)
   */
  abstract getNodeType(): string;
}