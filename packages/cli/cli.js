#!/usr/bin/env node
const { Command } = require('commander');
const fs = require('fs');

const program = new Command();
program
  .name('promptgraph')
  .description('PromptScape Graph CLI')
  .option('-b, --bundle <path>', 'Path to bundle file')
  .option('-s, --seed <number>', 'Seed value', parseInt)
  .action((opts) => {
    if (!opts.bundle) {
      console.error('Bundle file required.');
      process.exit(1);
    }
    const bundle = fs.readFileSync(opts.bundle, 'utf-8');
    const seed = opts.seed || Date.now();
    console.log(`Loaded bundle: ${opts.bundle}`);
    console.log(`Seed: ${seed}`);
    console.log('Prompt preview: <placeholder>');
  });

program.parse(process.argv);
