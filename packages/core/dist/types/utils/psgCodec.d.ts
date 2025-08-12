import type { Graph, PSGFile } from '../types/graph';
export declare enum PSGErrorType {
    INVALID_JSON = "INVALID_JSON",
    INVALID_SCHEMA = "INVALID_SCHEMA",
    CORRUPTED_DATA = "CORRUPTED_DATA",
    VERSION_INCOMPATIBLE = "VERSION_INCOMPATIBLE",
    FILE_TOO_LARGE = "FILE_TOO_LARGE",
    MISSING_REQUIRED_FIELDS = "MISSING_REQUIRED_FIELDS",
    INVALID_NODE_DATA = "INVALID_NODE_DATA",
    INVALID_EDGE_DATA = "INVALID_EDGE_DATA",
    SECURITY_VIOLATION = "SECURITY_VIOLATION"
}
export interface PSGError {
    type: PSGErrorType;
    message: string;
    details?: any;
    suggestions?: string[];
}
export declare class PSGValidationError extends Error {
    readonly error: PSGError;
    constructor(error: PSGError);
}
export interface ReadPsgOptions {
    maxFileSize?: number;
    strictValidation?: boolean;
    allowLegacyFormat?: boolean;
}
export declare function readPsg(text: string, options?: ReadPsgOptions): PSGFile;
export declare function writePsg(psg: PSGFile): string;
export declare function fromLegacyGraph(name: string, graph: Graph): PSGFile;
export declare function roundTripTest(psg: PSGFile): boolean;
//# sourceMappingURL=psgCodec.d.ts.map