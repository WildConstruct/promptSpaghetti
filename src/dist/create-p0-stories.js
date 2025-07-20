#!/usr/bin/env ts-node
"use strict";
// create-p0-stories.ts
// Creates STORY_CREATED events for P0 critical security issues from the epic catch-up plan
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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const events = __importStar(require("./core/events"));
// Read current state
const statePath = path.join(__dirname, 'data', 'state.json');
const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
// Check we're in PLAN phase
if (state.meta.phase !== 'PLAN') {
    console.error('Error: Can only create stories in PLAN phase. Current phase:', state.meta.phase);
    process.exit(1);
}
// Define P0 stories based on the detailed implementation guide
const p0Stories = [
    {
        id: `S-${Date.now()}-1`,
        goal_id: 'G-1', // Launch MVP
        title: 'Fix SetVariable Schema Vulnerability (Epic 18)',
        acceptance: [
            'SetVariable node validates variable names against alphanumeric pattern with max 64 chars',
            'Variable names cannot use reserved keywords (__proto__, constructor, prototype, eval, Function)',
            'Values are validated to not contain dangerous patterns (eval, Function constructor, etc)',
            'Runtime validation layer prevents prototype pollution attacks',
            'Variables stored in Object.create(null) to prevent prototype access',
            'Security tests cover all attack vectors with OWASP payloads',
            'Manual penetration testing completed and passed',
            'Code reviewed by security engineer'
        ],
        priority: 1, // Highest priority
        status: 'READY',
        tasks: []
    },
    {
        id: `S-${Date.now()}-2`,
        goal_id: 'G-1', // Launch MVP
        title: 'Fix Conditional Node Security (Epic 18)',
        acceptance: [
            'Expression evaluation uses AST parsing with acorn, no eval() or Function constructor',
            'Only safe node types allowed in expressions (no CallExpression, NewExpression, etc)',
            'Sandboxed evaluation context with only primitive values and safe objects',
            'Limited Math functions exposed (min, max, floor, ceil, round, abs only)',
            'Safe utility functions provided (startsWith, endsWith, includes, length, getType)',
            'Security error logging for all blocked attempts',
            'Comprehensive security test suite blocks all known attack vectors',
            'Expression complexity limits enforced to prevent DoS'
        ],
        priority: 1, // Highest priority
        status: 'READY',
        tasks: []
    },
    {
        id: `S-${Date.now()}-3`,
        goal_id: 'G-1', // Launch MVP
        title: 'Test Coverage Critical Path (Epic 1)',
        acceptance: [
            'Global test coverage reaches 80% minimum threshold',
            'Core runtime modules achieve 90% coverage (currently 55%)',
            'Validation module achieves 95% coverage (currently 45%)',
            'Server engine achieves 85% coverage (currently 60%)',
            'Inspector components achieve 80% coverage (currently 40%)',
            'Security-specific test suites cover all P0 fixes',
            'Coverage thresholds enforced in CI pipeline',
            'Coverage reports integrated with Codecov',
            'All new code requires tests before merge'
        ],
        priority: 1, // Highest priority
        status: 'READY',
        tasks: []
    }
];
// Create events
console.log('Creating P0 story events...\n');
async function createStories() {
    for (let i = 0; i < p0Stories.length; i++) {
        const story = p0Stories[i];
        // Add small delay to ensure unique timestamps
        await new Promise(resolve => setTimeout(resolve, 100));
        const event = {
            type: 'STORY_CREATED',
            actor: 'po_agent',
            payload: {
                story: story
            },
            version: 1
        };
        try {
            const createdEvent = events.append(event);
            console.log(`✅ Created story: ${story.title}`);
            console.log(`   ID: ${story.id}`);
            console.log(`   Priority: P${story.priority}`);
            console.log(`   Acceptance Criteria: ${story.acceptance.length} items`);
            console.log(`   Event ID: ${createdEvent.id}\n`);
        }
        catch (error) {
            console.error(`❌ Failed to create story "${story.title}":`, error.message);
        }
    }
    // Summary after all events created
    console.log('\n📊 Summary:');
    console.log('===========');
    console.log(`Total P0 stories created: ${p0Stories.length}`);
    console.log('All stories assigned to Goal G-1 (Launch MVP)');
    console.log('All stories have Priority 1 (highest)');
    console.log('\nNext steps:');
    console.log('1. Wait for phase transition to ASSIGN');
    console.log('2. Scrum Master agent will create tasks from these stories');
    console.log('3. Tasks will be assigned to developers respecting WIP limits');
    console.log('\nEstimated timeline:');
    console.log('- SetVariable fix: 2 days');
    console.log('- Conditional Node fix: 3 days');
    console.log('- Test Coverage: 3 days (can be parallelized)');
    console.log('Total: 5-8 days depending on parallelization');
}
createStories().catch(console.error);
//# sourceMappingURL=create-p0-stories.js.map