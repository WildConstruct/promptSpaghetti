import { ValidationResult } from './advanced';
export type IODataType = 'string' | 'number' | 'boolean' | 'array' | 'object' | 'any' | 'stringArray' | 'numberArray' | 'choice' | 'conditional';
export interface IOPortDefinition {
    id: string;
    label: string;
    dataType: IODataType;
    required: boolean;
    defaultValue?: any;
    constraints?: IOConstraints;
    description?: string;
    multiple?: boolean;
}
export interface IOConstraints {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    allowedValues?: any[];
    customValidator?: (value: any) => ValidationResult;
}
export interface IOSpec {
    inputs: IOPortDefinition[];
    outputs: IOPortDefinition[];
}
export interface ResolvedInputs {
    values: Map<string, any>;
    metadata: Map<string, IOResolutionMetadata>;
}
export interface IOResolutionMetadata {
    source: 'connection' | 'default' | 'computed';
    sourceNodeId?: string;
    typeCoercion?: {
        from: IODataType;
        to: IODataType;
    };
    warnings: string[];
}
export declare class AdvancedIOHandler {
    private spec;
    constructor(spec: IOSpec);
    validateInputs(inputs: Map<string, any>): ValidationResult;
    resolveInputs(connectedInputs: Map<string, any>, nodeId: string): ResolvedInputs;
    validateOutputs(outputs: Map<string, any>): ValidationResult;
    getInputSpec(): IOPortDefinition[];
    getOutputSpec(): IOPortDefinition[];
    private validateValue;
    private isValidType;
    private validateConstraints;
    private coerceValue;
    private getValueType;
    private performCoercion;
}
export declare class IOSpecBuilder {
    private inputs;
    private outputs;
    addInput(definition: Omit<IOPortDefinition, 'id'> & {
        id: string;
    }): IOSpecBuilder;
    addOutput(definition: Omit<IOPortDefinition, 'id'> & {
        id: string;
    }): IOSpecBuilder;
    addTextInput(id: string, label: string, required?: boolean, defaultValue?: string): IOSpecBuilder;
    addNumberInput(id: string, label: string, required?: boolean, min?: number, max?: number, defaultValue?: number): IOSpecBuilder;
    addChoiceInput(id: string, label: string, allowedValues: any[], required?: boolean, defaultValue?: any): IOSpecBuilder;
    addTextOutput(id: string, label: string): IOSpecBuilder;
    build(): IOSpec;
    static createSimple(inputLabel?: string, outputLabel?: string): IOSpec;
    static createMultiInput(inputLabels: string[], outputLabel?: string): IOSpec;
}
export declare class TypedInputs {
    private inputs;
    constructor(inputs: ResolvedInputs);
    getString(portId: string, defaultValue?: string): string;
    getNumber(portId: string, defaultValue?: number): number;
    getBoolean(portId: string, defaultValue?: boolean): boolean;
    getArray<T = any>(portId: string, defaultValue?: T[]): T[];
    getStringArray(portId: string, defaultValue?: string[]): string[];
    getMetadata(portId: string): IOResolutionMetadata | undefined;
    hasWarnings(portId: string): boolean;
    getWarnings(portId: string): string[];
}
//# sourceMappingURL=io-system.d.ts.map