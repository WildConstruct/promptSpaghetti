#!/usr/bin/env node
"use strict";
// src/index.ts
// Main entry point for the coordination system
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Ensure data directory exists
const dataDir = path_1.default.join(__dirname, '..', 'data');
if (!fs_1.default.existsSync(dataDir)) {
    fs_1.default.mkdirSync(dataDir, { recursive: true });
}
console.log(`
╔════════════════════════════════════════════╗
║  PromptScape Event-Sourced Coordination   ║
╚════════════════════════════════════════════╝
`);
// Load environment variables
require('dotenv').config();
// Check required environment variables
if (!process.env.DISCORD_BOT_TOKEN) {
    console.error("❌ DISCORD_BOT_TOKEN environment variable is required");
    console.error("   Please set it in your .env file");
    process.exit(1);
}
// Define processes to start
const processes = [
    { name: 'Gateway', script: 'gateway/index.ts', color: 'cyan' },
    { name: 'PO Agent', script: 'agents/productOwnerAgent.ts', args: ['run'], color: 'green' },
    { name: 'SM Agent', script: 'agents/scrumMasterAgent.ts', args: ['run'], color: 'yellow' },
    { name: 'Dev A', script: 'agents/devAgentTemplate.ts', args: ['dev_A'], color: 'blue' },
    { name: 'Dev B', script: 'agents/devAgentTemplate.ts', args: ['dev_B'], color: 'magenta' },
    { name: 'Dev C', script: 'agents/devAgentTemplate.ts', args: ['dev_C'], color: 'white' },
    { name: 'Stuck Watch', script: 'watchers/stuckWatcher.ts', color: 'red' },
    { name: 'Metrics', script: 'watchers/metricsCollector.ts', color: 'gray' }
];
// Color codes for console output
const colors = {
    cyan: '\x1b[36m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    white: '\x1b[37m',
    red: '\x1b[31m',
    gray: '\x1b[90m',
    reset: '\x1b[0m'
};
// Start each process
processes.forEach(({ name, script, args = [], color }) => {
    const scriptPath = path_1.default.join(__dirname, script);
    const child = (0, child_process_1.spawn)('ts-node', [scriptPath, ...args], {
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env }
    });
    const colorCode = colors[color] || colors.white;
    // Handle stdout
    child.stdout?.on('data', (data) => {
        const lines = data.toString().split('\n').filter(Boolean);
        lines.forEach(line => {
            console.log(`${colorCode}[${name.padEnd(10)}]${colors.reset} ${line}`);
        });
    });
    // Handle stderr
    child.stderr?.on('data', (data) => {
        const lines = data.toString().split('\n').filter(Boolean);
        lines.forEach(line => {
            console.error(`${colors.red}[${name.padEnd(10)}]${colors.reset} ${line}`);
        });
    });
    // Handle exit
    child.on('exit', (code) => {
        console.log(`${colors.red}[${name.padEnd(10)}]${colors.reset} Process exited with code ${code}`);
        // If gateway exits, kill all processes
        if (name === 'Gateway') {
            console.log("Gateway exited, shutting down all processes...");
            process.exit(code || 0);
        }
    });
});
// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n📛 Shutting down coordination system...');
    process.exit(0);
});
console.log("✅ All processes started. Press Ctrl+C to stop.");
console.log("");
//# sourceMappingURL=index.js.map