/**
 * Base class for all Epic 1 nodes with inline editing support
 * Provides common functionality for edit state management, validation, and serialization
 */
import { RuntimeNode } from '../../types';
/**
 * Abstract base class for all Epic 1 nodes with inline editing support
 */
export class BaseInlineEditableNode extends RuntimeNode {
    data;
    editBuffer = null;
    constructor(id, initialValue, config = {}) {
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
    createDefaultEditState() {
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
    startEdit() {
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
    cancelEdit() {
        this.data.editState.isEditing = false;
        this.data.editState.editBuffer = undefined;
        this.data.editState.isDirty = false;
        this.data.editState.validationErrors = [];
        this.editBuffer = null;
    }
    /**
     * Commit edit changes
     */
    async commitEdit() {
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
    updateEditBuffer(newValue) {
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
    getCurrentValue() {
        if (this.data.editState.isEditing && this.editBuffer !== null) {
            return this.editBuffer;
        }
        return this.data.value;
    }
    /**
     * Check if node is currently being edited
     */
    isEditing() {
        return this.data.editState.isEditing;
    }
    /**
     * Check if node has unsaved changes
     */
    isDirty() {
        return this.data.editState.isDirty;
    }
    /**
     * Get validation errors
     */
    getValidationErrors() {
        return this.data.editState.validationErrors;
    }
    /**
     * Lock the node to prevent editing
     */
    lock(reason) {
        if (this.data.editState.isEditing) {
            this.cancelEdit();
        }
        this.data.isLocked = true;
        this.data.lockReason = reason;
    }
    /**
     * Unlock the node to allow editing
     */
    unlock() {
        this.data.isLocked = false;
        this.data.lockReason = undefined;
    }
    /**
     * Set preview mode
     */
    setPreviewMode(mode) {
        this.data.previewMode = mode;
    }
    /**
     * Get the complete node data including edit state
     */
    getData() {
        return this.cloneData(this.data);
    }
    /**
     * Set node data (used for deserialization)
     */
    setData(data) {
        this.data = this.cloneData(data);
        this.editBuffer = null;
    }
    /**
     * Clone the complete data structure
     */
    cloneData(data) {
        return {
            ...data,
            value: this.cloneValue(data.value),
            editState: { ...data.editState },
        };
    }
    /**
     * Serialize node for persistence
     */
    serialize() {
        return {
            id: this.id,
            type: this.getNodeType(),
            data: this.getData(),
        };
    }
}
