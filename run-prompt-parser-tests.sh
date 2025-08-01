#!/bin/bash

# Run just the prompt parser tests
cd packages/core/runtime/nodes/epic1/__tests__

# Run with Node directly using ts-node
npx ts-node -e "
const { describe, it, expect, beforeEach } = require('@jest/globals');
global.describe = describe;
global.it = it;
global.expect = expect;
global.beforeEach = beforeEach;

require('./PromptParser.test.ts');
"