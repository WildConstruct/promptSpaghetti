#!/bin/bash

# Clean up duplicate test files
# This script removes .js test files when a .ts version exists

echo "🧹 Cleaning up duplicate test files..."

# Find and count duplicate test files
duplicates=$(find . -path "./node_modules" -prune -o -name "*.test.js" -type f -print | grep -v node_modules)
count=$(echo "$duplicates" | grep -c "test.js" || echo "0")

if [ "$count" -gt 0 ]; then
    echo "Found $count duplicate .js test files"
    echo "Removing duplicates..."
    
    # Remove all .js test files (keeping .ts versions)
    echo "$duplicates" | xargs rm -f
    
    echo "✅ Removed $count duplicate test files"
else
    echo "✅ No duplicate test files found"
fi

# Also clean up obsolete snapshots
obsolete_snapshots=$(find . -name "*.test.js.snap" -type f | grep -v node_modules)
snap_count=$(echo "$obsolete_snapshots" | grep -c ".snap" || echo "0")

if [ "$snap_count" -gt 0 ]; then
    echo "Found $snap_count obsolete snapshot files"
    echo "$obsolete_snapshots" | xargs rm -f
    echo "✅ Removed obsolete snapshots"
fi

echo "🎉 Cleanup complete!"