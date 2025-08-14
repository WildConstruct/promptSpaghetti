/**
 * Node type enum for Epic 1 nodes
 * Separated to avoid circular dependencies
 */
export var Epic1NodeType;
(function (Epic1NodeType) {
    Epic1NodeType["TextBlock"] = "TextBlock";
    Epic1NodeType["WeightedChoice"] = "WeightedChoice";
    Epic1NodeType["Concat"] = "Concat";
    Epic1NodeType["Variable"] = "Variable";
    Epic1NodeType["Output"] = "Output";
})(Epic1NodeType || (Epic1NodeType = {}));
