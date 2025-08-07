#!/bin/bash

# This script fixes the syntax errors in server/src/exporter.ts
# Run from the project root

echo "Fixing syntax errors in server/src/exporter.ts..."

# Create a backup
cp server/src/exporter.ts server/src/exporter.ts.backup

# Fix the file using sed
sed -i '' '
# Fix missing closing braces for if statements and loops
s/};$/&/g

# Fix missing function closing braces
/^}$/ {
  N
  s/}\n\n\*\//}\n}\n\n\*\//g
}
' server/src/exporter.ts

echo "Syntax fixes applied. Please review the changes."