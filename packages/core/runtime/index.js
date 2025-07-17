"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetVariableNode = exports.SetVariableNode = exports.IncludeNode = exports.OutputNode = exports.ConcatNode = exports.WeightedChoiceNode = exports.RuntimeNode = void 0;
class RuntimeNode {
    constructor(id) {
        this.id = id;
    }
}
exports.RuntimeNode = RuntimeNode;
class WeightedChoiceNode extends RuntimeNode {
    constructor(id, choices) {
        super(id);
        this.choices = choices;
    }
    run(ctx) {
        const total = this.choices.reduce((sum, c) => sum + c.weight, 0);
        let r = seededRandom(ctx.seed) * total;
        for (const c of this.choices) {
            if (r < c.weight)
                return c.value;
            r -= c.weight;
        }
        return this.choices[this.choices.length - 1].value;
    }
}
exports.WeightedChoiceNode = WeightedChoiceNode;
class ConcatNode extends RuntimeNode {
    constructor(id, inputs) {
        super(id);
        this.inputs = inputs;
    }
    run() {
        return this.inputs.join('');
    }
}
exports.ConcatNode = ConcatNode;
class OutputNode extends RuntimeNode {
    constructor(id, input) {
        super(id);
        this.input = input;
    }
    run() {
        return this.input;
    }
}
exports.OutputNode = OutputNode;
class IncludeNode extends RuntimeNode {
    constructor(id, name, lookup) {
        super(id);
        this.name = name;
        this.lookup = lookup;
    }
    run() {
        return this.lookup[this.name];
    }
}
exports.IncludeNode = IncludeNode;
class SetVariableNode extends RuntimeNode {
    constructor(id, key, value) {
        super(id);
        this.key = key;
        this.value = value;
    }
    run(ctx) {
        ctx.variables[this.key] = this.value;
    }
}
exports.SetVariableNode = SetVariableNode;
class GetVariableNode extends RuntimeNode {
    constructor(id, key) {
        super(id);
        this.key = key;
    }
    run(ctx) {
        return ctx.variables[this.key];
    }
}
exports.GetVariableNode = GetVariableNode;
const seedrandom_1 = __importDefault(require("seedrandom"));
function seededRandom(seed) {
    return (0, seedrandom_1.default)(String(seed))();
}
__exportStar(require("./advanced"), exports);
__exportStar(require("./nodes/PythonTransform"), exports);
//# sourceMappingURL=index.js.map