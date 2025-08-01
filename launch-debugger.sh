#!/bin/bash

echo "🚀 Launching TypeScript Error Debugger with Chrome DevTools"
echo "=========================================================="
echo ""
echo "1. Starting Node.js with inspector..."
echo "2. Open Chrome and go to: chrome://inspect"
echo "3. Click 'inspect' under the target to open DevTools"
echo "4. The debugger will pause at breakpoints marked with 'debugger;'"
echo ""
echo "Press Ctrl+C to stop the debugger"
echo ""

# Launch the debugger with inspect flag
node --inspect-brk debug-fix-typescript.js