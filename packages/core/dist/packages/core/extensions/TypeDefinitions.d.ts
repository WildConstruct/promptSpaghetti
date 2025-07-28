/**
 * Extension Type Definitions - Epic 8.4 Story 8.4.2
 * Comprehensive TypeScript type definitions for extension development
 */
import { z } from 'zod';
export * from './interfaces/ExtensionInterfaces';
export * from './interfaces/NodeExtension';
export * from './interfaces/UIExtension';
export * from './interfaces/TransformExtension';
export * from './interfaces/StorageExtension';
export declare const ExtensionTypeSchemas: {
    BaseExtension: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
    id: z.ZodString;
    name: z.ZodString;
    version: z.ZodString;
    description: z.ZodString;
    author: z.ZodString;
    dependencies: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    permissions: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    initialize: z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodUnknown>;
    activate: z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodUnknown>;
    deactivate: z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodUnknown>;
    dispose: z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodUnknown>;
    getConfiguration: z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodUnknown>;
    setConfiguration: z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodUnknown>;
    isHealthy: z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodUnknown>;
    getHealthStatus: z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodUnknown>;
}, NodeExtension: z.object;
export declare const ExtensionTypeGuards: {
    isBaseExtension(obj: any): obj is import("./interfaces/ExtensionInterfaces").BaseExtension;
    "": any;
}, errors: any, push: any;
//# sourceMappingURL=TypeDefinitions.d.ts.map