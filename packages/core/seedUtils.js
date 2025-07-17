"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRNG = createRNG;
const seedrandom_1 = __importDefault(require("seedrandom"));
function createRNG(seed) {
    return (0, seedrandom_1.default)(String(seed));
}
//# sourceMappingURL=seedUtils.js.map