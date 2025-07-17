"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nodeSchemas = void 0;
const zod_1 = require("zod");
const baseNodeSchema = zod_1.z.object({
    label: zod_1.z.string().default("Node"),
    id: zod_1.z.string().default(""),
    variations: zod_1.z.array(zod_1.z.string()).default([]),
    description: zod_1.z.string().default(""),
    tags: zod_1.z.array(zod_1.z.string()).default([]),
    category: zod_1.z.string().default("general"),
});
exports.nodeSchemas = {
    Subject: baseNodeSchema.extend({
        type: zod_1.z.literal("Subject").default("Subject"),
        subjects: zod_1.z.array(zod_1.z.string()).default(["subject"]),
        singularForm: zod_1.z.string().default("subject"),
        pluralForm: zod_1.z.string().default("subjects"),
        defaultWeight: zod_1.z.number().default(1),
    }),
    Connector: baseNodeSchema.extend({
        type: zod_1.z.literal("Connector").default("Connector"),
        connectors: zod_1.z.array(zod_1.z.string()).default(["and"]),
        grammarType: zod_1.z.enum(["coordinating", "subordinating", "correlative"]).default("coordinating"),
        position: zod_1.z.enum(["before", "after", "between"]).default("between"),
    }),
    Attribute: baseNodeSchema.extend({
        type: zod_1.z.literal("Attribute").default("Attribute"),
        attributes: zod_1.z.array(zod_1.z.string()).default(["attribute"]),
        targetNoun: zod_1.z.string().default(""),
        adjectiveType: zod_1.z.enum(["descriptive", "quantitative", "demonstrative"]).default("descriptive"),
        position: zod_1.z.enum(["before", "after"]).default("before"),
    }),
    Action: baseNodeSchema.extend({
        type: zod_1.z.literal("Action").default("Action"),
        actions: zod_1.z.array(zod_1.z.string()).default(["action"]),
        tense: zod_1.z.enum(["present", "past", "future"]).default("present"),
        voice: zod_1.z.enum(["active", "passive"]).default("active"),
        intensity: zod_1.z.enum(["low", "medium", "high"]).default("medium"),
    }),
    WeightedChoice: baseNodeSchema.extend({
        type: zod_1.z.literal("WeightedChoice").default("WeightedChoice"),
        weights: zod_1.z.array(zod_1.z.number()).default([1]),
        options: zod_1.z.array(zod_1.z.string()).default(["option"]),
    }),
    Concat: baseNodeSchema.extend({
        type: zod_1.z.literal("Concat").default("Concat"),
        delimiter: zod_1.z.string().default(", "),
        formatType: zod_1.z.enum(["sentence", "list", "paragraph"]).default("sentence"),
    }),
    Output: baseNodeSchema.extend({
        type: zod_1.z.literal("Output").default("Output"),
        prompt: zod_1.z.string().default(""),
        outputFormat: zod_1.z.enum(["text", "markdown", "json"]).default("text"),
    }),
    Include: baseNodeSchema.extend({
        type: zod_1.z.literal("Include").default("Include"),
        ref: zod_1.z.string().default(""),
        includeType: zod_1.z.enum(["bundle", "template", "component"]).default("bundle"),
    }),
    SetVariable: baseNodeSchema.extend({
        type: zod_1.z.literal("SetVariable").default("SetVariable"),
        name: zod_1.z.string().default(""),
        value: zod_1.z.string().default(""),
        variableType: zod_1.z.enum(["string", "number", "boolean", "object"]).default("string"),
    }),
    GetVariable: baseNodeSchema.extend({
        type: zod_1.z.literal("GetVariable").default("GetVariable"),
        name: zod_1.z.string().default(""),
        defaultValue: zod_1.z.string().default(""),
    }),
};
//# sourceMappingURL=nodeSchemas.js.map