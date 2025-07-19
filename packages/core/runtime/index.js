"use strict";
// packages/core/runtime/index.ts
// Runtime node classes for deterministic graph execution.
// Each class exposes an async `run` method that takes input/context
// and returns output plus possibly mutated context.
// These are thin stubs for now; they will be fully implemented in later tasks.
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var RuntimeNode = /** @class */ (function () {
    function RuntimeNode(id) {
        this.id = id;
    }
    return RuntimeNode;
}());
exports.RuntimeNode = RuntimeNode;
/* ------------------------- Core node runtimes ------------------------- */
var WeightedChoiceNode = /** @class */ (function (_super) {
    __extends(WeightedChoiceNode, _super);
    function WeightedChoiceNode(id, choices) {
        var _this = _super.call(this, id) || this;
        _this.choices = choices;
        return _this;
    }
    WeightedChoiceNode.prototype.run = function (ctx) {
        var total = this.choices.reduce(function (sum, c) { return sum + c.weight; }, 0);
        var r = seededRandom(ctx.seed) * total;
        for (var _i = 0, _a = this.choices; _i < _a.length; _i++) {
            var c = _a[_i];
            if (r < c.weight)
                return c.value;
            r -= c.weight;
        }
        return this.choices[this.choices.length - 1].value;
    };
    return WeightedChoiceNode;
}(RuntimeNode));
exports.WeightedChoiceNode = WeightedChoiceNode;
var ConcatNode = /** @class */ (function (_super) {
    __extends(ConcatNode, _super);
    function ConcatNode(id, inputs) {
        var _this = _super.call(this, id) || this;
        _this.inputs = inputs;
        return _this;
    }
    ConcatNode.prototype.run = function () {
        return this.inputs.join('');
    };
    return ConcatNode;
}(RuntimeNode));
exports.ConcatNode = ConcatNode;
var OutputNode = /** @class */ (function (_super) {
    __extends(OutputNode, _super);
    function OutputNode(id, input) {
        var _this = _super.call(this, id) || this;
        _this.input = input;
        return _this;
    }
    OutputNode.prototype.run = function () {
        return this.input;
    };
    return OutputNode;
}(RuntimeNode));
exports.OutputNode = OutputNode;
var IncludeNode = /** @class */ (function (_super) {
    __extends(IncludeNode, _super);
    function IncludeNode(id, name, lookup) {
        var _this = _super.call(this, id) || this;
        _this.name = name;
        _this.lookup = lookup;
        return _this;
    }
    IncludeNode.prototype.run = function (ctx) {
        // Security: Validate lookup object and key
        if (!this.lookup || typeof this.lookup !== 'object') {
            return ctx.variables['defaultText'] || '';
        }
        // Security: Prevent prototype pollution and dangerous property access
        if (this.name.includes('__proto__') ||
            this.name.includes('constructor') ||
            this.name.includes('prototype') ||
            !Object.prototype.hasOwnProperty.call(this.lookup, this.name)) {
            return ctx.variables['defaultText'] || '';
        }
        var result = this.lookup[this.name];
        // Security: Ensure result is a safe string
        if (typeof result !== 'string') {
            return ctx.variables['defaultText'] || '';
        }
        return result;
    };
    return IncludeNode;
}(RuntimeNode));
exports.IncludeNode = IncludeNode;
var SetVariableNode = /** @class */ (function (_super) {
    __extends(SetVariableNode, _super);
    function SetVariableNode(id, key, value) {
        var _this = _super.call(this, id) || this;
        _this.key = key;
        _this.value = value;
        return _this;
    }
    SetVariableNode.prototype.run = function (ctx) {
        // Security: Validate key for dangerous patterns
        if (this.key.includes('__proto__') ||
            this.key.includes('constructor') ||
            this.key.includes('prototype') ||
            typeof this.key !== 'string' ||
            this.key.length === 0) {
            return; // Silently ignore dangerous keys
        }
        // Security: Validate value is safe
        if (this.value === null || this.value === undefined) {
            ctx.variables[this.key] = this.value;
            return;
        }
        // Only allow safe primitive types and simple objects/arrays
        var valueType = typeof this.value;
        if (valueType === 'string' || valueType === 'number' || valueType === 'boolean') {
            ctx.variables[this.key] = this.value;
        }
        else if (Array.isArray(this.value)) {
            // Deep clone to prevent reference pollution
            ctx.variables[this.key] = JSON.parse(JSON.stringify(this.value));
        }
        else if (valueType === 'object') {
            // Deep clone to prevent reference pollution
            ctx.variables[this.key] = JSON.parse(JSON.stringify(this.value));
        }
        else {
            // Reject functions and other dangerous types
            return;
        }
    };
    return SetVariableNode;
}(RuntimeNode));
exports.SetVariableNode = SetVariableNode;
var GetVariableNode = /** @class */ (function (_super) {
    __extends(GetVariableNode, _super);
    function GetVariableNode(id, key) {
        var _this = _super.call(this, id) || this;
        _this.key = key;
        return _this;
    }
    GetVariableNode.prototype.run = function (ctx) {
        // Security: Validate key for dangerous patterns
        if (this.key.includes('__proto__') ||
            this.key.includes('constructor') ||
            this.key.includes('prototype') ||
            typeof this.key !== 'string' ||
            this.key.length === 0) {
            return undefined; // Return undefined for dangerous keys
        }
        // Security: Only return value if it exists as own property
        if (!Object.prototype.hasOwnProperty.call(ctx.variables, this.key)) {
            return undefined;
        }
        return ctx.variables[this.key];
    };
    return GetVariableNode;
}(RuntimeNode));
exports.GetVariableNode = GetVariableNode;
/* ----------------------------- Utilities ------------------------------ */
var seedrandom_1 = __importDefault(require("seedrandom"));
function seededRandom(seed) {
    return (0, seedrandom_1.default)(String(seed))();
}
/* ----------------------------- Advanced Nodes (Epic 7) ------------------------------ */
// Re-export all advanced node capabilities
__exportStar(require("./advanced"), exports);
/* ----------------------------- Python Integration (Epic 8) ------------------------------ */
// Re-export Python integration capabilities
__exportStar(require("./nodes/PythonTransform"), exports);
