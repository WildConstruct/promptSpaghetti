"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeCategory = exports.ExtensionManifestSchema = exports.ExtensionError = exports.ExtensionErrorType = exports.ExtensionLifecycleState = void 0;
const zod_1 = require("zod");
var ExtensionLifecycleState;
(function (ExtensionLifecycleState) {
    ExtensionLifecycleState["UNINITIALIZED"] = "uninitialized";
    ExtensionLifecycleState["INITIALIZING"] = "initializing";
    ExtensionLifecycleState["INITIALIZED"] = "initialized";
    ExtensionLifecycleState["ACTIVATING"] = "activating";
    ExtensionLifecycleState["ACTIVE"] = "active";
    ExtensionLifecycleState["DEACTIVATING"] = "deactivating";
    ExtensionLifecycleState["DEACTIVATED"] = "deactivated";
    ExtensionLifecycleState["ERROR"] = "error";
    ExtensionLifecycleState["DISPOSED"] = "disposed";
})(ExtensionLifecycleState || (exports.ExtensionLifecycleState = ExtensionLifecycleState = {}));
var ExtensionErrorType;
(function (ExtensionErrorType) {
    ExtensionErrorType["INITIALIZATION_ERROR"] = "initialization_error";
    ExtensionErrorType["ACTIVATION_ERROR"] = "activation_error";
    ExtensionErrorType["RUNTIME_ERROR"] = "runtime_error";
    ExtensionErrorType["CONFIGURATION_ERROR"] = "configuration_error";
    ExtensionErrorType["DEPENDENCY_ERROR"] = "dependency_error";
    ExtensionErrorType["PERMISSION_ERROR"] = "permission_error";
    ExtensionErrorType["VALIDATION_ERROR"] = "validation_error";
})(ExtensionErrorType || (exports.ExtensionErrorType = ExtensionErrorType = {}));
class ExtensionError extends Error {
    constructor(type, extensionId, message, cause) {
        super(message);
        this.type = type;
        this.extensionId = extensionId;
        this.cause = cause;
        this.name = 'ExtensionError';
    }
}
exports.ExtensionError = ExtensionError;
exports.ExtensionManifestSchema = zod_1.z.object({
    id: zod_1.z.string().regex(/^[a-zA-Z0-9-_.]+$/),
    name: zod_1.z.string().min(1),
    version: zod_1.z.string().regex(/^\d+\.\d+\.\d+$/),
    description: zod_1.z.string().min(1),
    author: zod_1.z.string().min(1),
    license: zod_1.z.string().min(1),
    engines: zod_1.z.object({
        promptSpaghetti: zod_1.z.string(),
        node: zod_1.z.string().optional()
    }),
    dependencies: zod_1.z.array(zod_1.z.string()).optional(),
    optionalDependencies: zod_1.z.array(zod_1.z.string()).optional(),
    permissions: zod_1.z.array(zod_1.z.string()).optional(),
    main: zod_1.z.string().optional(),
    browser: zod_1.z.string().optional(),
    contributes: zod_1.z.object({
        nodes: zod_1.z.array(zod_1.z.string()).optional(),
        commands: zod_1.z.array(zod_1.z.string()).optional(),
        menus: zod_1.z.array(zod_1.z.string()).optional(),
        themes: zod_1.z.array(zod_1.z.string()).optional(),
        languages: zod_1.z.array(zod_1.z.string()).optional()
    }).optional(),
    repository: zod_1.z.string().optional(),
    homepage: zod_1.z.string().optional(),
    bugs: zod_1.z.string().optional(),
    keywords: zod_1.z.array(zod_1.z.string()).optional(),
    configuration: zod_1.z.object({
        type: zod_1.z.literal('object'),
        properties: zod_1.z.record(zod_1.z.any())
    }).optional()
});
var NodeExtension_1 = require("./NodeExtension");
Object.defineProperty(exports, "NodeCategory", { enumerable: true, get: function () { return NodeExtension_1.NodeCategory; } });
//# sourceMappingURL=ExtensionInterfaces.js.map