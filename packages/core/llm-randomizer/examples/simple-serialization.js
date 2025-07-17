"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const serializer_1 = require("../serialization/serializer");
const validator_1 = require("../serialization/validator");
const simpleGraph = {
    nodes: [
        {
            id: 'greeting_choice',
            type: 'WeightedChoice',
            choices: [
                { value: 'Hello', weight: 0.4 },
                { value: 'Hi', weight: 0.3 },
                { value: 'Greetings', weight: 0.3 }
            ]
        },
        {
            id: 'name_var',
            type: 'GetVariable',
            key: 'user_name'
        },
        {
            id: 'greeting_concat',
            type: 'Concat',
            inputs: ['greeting_choice', 'name_var']
        },
        {
            id: 'final_output',
            type: 'Output',
            inputs: ['greeting_concat']
        }
    ]
};
const serialized = serializer_1.GraphSerializer.serialize(simpleGraph, {
    name: 'Simple Greeting Generator',
    description: 'Generates personalized greetings',
    author: 'claude-agent',
    created: new Date().toISOString()
});
console.log('=== LLM-Friendly Serialized Format ===');
console.log(serialized);
const validation = (0, validator_1.validateFormat)(serialized);
console.log('\n=== Validation Results ===');
console.log('Valid:', validation.isValid);
console.log('Errors:', validation.errors.length);
console.log('Warnings:', validation.warnings.length);
if (validation.errors.length > 0) {
    console.log('\nErrors:');
    validation.errors.forEach(error => {
        console.log(`  - ${error.message}`);
    });
}
if (validation.warnings.length > 0) {
    console.log('\nWarnings:');
    validation.warnings.forEach(warning => {
        console.log(`  - ${warning.message}`);
    });
}
//# sourceMappingURL=simple-serialization.js.map