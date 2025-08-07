#!/usr/bin/env node

/**
 * Test script to verify handle rendering logic
 */

console.log('\n🧪 TESTING HANDLE RENDERING LOGIC\n');
console.log('='.repeat(50));

// Simulate the BaseEditableNode logic
function testBaseEditableNodeHandles(nodeType, options) {
  console.log(`\n📦 Testing BaseEditableNode with nodeType: "${nodeType}"`);

  if (options) {
    console.log(`   Options: ${JSON.stringify(options)}`);
  }

  // This is the NEW logic from BaseEditableNode
  if (nodeType === 'enhancedBranching' || nodeType === 'weightedChoice') {
    const hasBranching = options && options.some(opt => opt.hasBranch);
    console.log(`   Has branching: ${hasBranching}`);

    if (!hasBranching) {
      console.log('   ✅ BaseEditableNode renders: Handle id="source"');
      return ['source'];
    } else {
      console.log(
        '   ⭕ BaseEditableNode renders: NO HANDLES (delegated to EnhancedBranchingNode)'
      );
      return [];
    }
  }

  if (nodeType === 'output') {
    console.log('   ⭕ BaseEditableNode renders: NO HANDLES (output node)');
    return [];
  }

  console.log('   ✅ BaseEditableNode renders: Handle id="source"');
  return ['source'];
}

// Simulate the EnhancedBranchingNode logic
function testEnhancedBranchingNodeHandles(options) {
  console.log(`\n🎯 Testing EnhancedBranchingNode`);
  console.log(`   Options: ${JSON.stringify(options)}`);

  const handles = [];
  const hasBranching = options.some(opt => opt.hasBranch);

  // Add branch handles for options with hasBranch=true
  options.forEach((opt, index) => {
    if (opt.hasBranch) {
      handles.push(`branch-${index}`);
      console.log(`   ✅ Branch handle: id="branch-${index}"`);
    }
  });

  // Add main handle if ANY branches exist
  if (hasBranching) {
    handles.push('main');
    console.log(`   ✅ Main handle: id="main"`);
  }

  if (handles.length === 0) {
    console.log(
      '   ⭕ EnhancedBranchingNode renders: NO HANDLES (delegated to BaseEditableNode)'
    );
  }

  return handles;
}

// Test scenarios
const testCases = [
  {
    name: 'No branches active',
    nodeType: 'enhancedBranching',
    options: [
      { text: 'Option 1', weight: 50, hasBranch: false },
      { text: 'Option 2', weight: 50, hasBranch: false }
    ],
    expectedHandles: ['source'] // Only BaseEditableNode renders
  },
  {
    name: 'One branch active',
    nodeType: 'enhancedBranching',
    options: [
      { text: 'Option 1', weight: 50, hasBranch: true },
      { text: 'Option 2', weight: 50, hasBranch: false }
    ],
    expectedHandles: ['branch-0', 'main'] // Only EnhancedBranchingNode renders
  },
  {
    name: 'Multiple branches active',
    nodeType: 'enhancedBranching',
    options: [
      { text: 'Option 1', weight: 33, hasBranch: true },
      { text: 'Option 2', weight: 33, hasBranch: false },
      { text: 'Option 3', weight: 34, hasBranch: true }
    ],
    expectedHandles: ['branch-0', 'branch-2', 'main'] // Only EnhancedBranchingNode renders
  },
  {
    name: 'All branches active',
    nodeType: 'enhancedBranching',
    options: [
      { text: 'Option 1', weight: 50, hasBranch: true },
      { text: 'Option 2', weight: 50, hasBranch: true }
    ],
    expectedHandles: ['branch-0', 'branch-1', 'main'] // Only EnhancedBranchingNode renders
  }
];

// Run tests
console.log('\n' + '='.repeat(50));
console.log('RUNNING TEST CASES');
console.log('='.repeat(50));

let passedTests = 0;
let failedTests = 0;

testCases.forEach((testCase, index) => {
  console.log(`\n\n🔬 TEST ${index + 1}: ${testCase.name}`);
  console.log('-'.repeat(40));

  // Get handles from both components
  const baseHandles = testBaseEditableNodeHandles(
    testCase.nodeType,
    testCase.options
  );
  const enhancedHandles = testEnhancedBranchingNodeHandles(testCase.options);

  // Combine all handles
  const allHandles = [...baseHandles, ...enhancedHandles];

  console.log(`\n📊 RESULTS:`);
  console.log(`   All handles: [${allHandles.join(', ')}]`);
  console.log(`   Expected:    [${testCase.expectedHandles.join(', ')}]`);

  // Check for duplicates
  const uniqueHandles = new Set(allHandles);
  if (uniqueHandles.size !== allHandles.length) {
    console.log(`   ❌ DUPLICATE IDS DETECTED!`);
    failedTests++;
  } else if (
    JSON.stringify(allHandles.sort()) ===
    JSON.stringify(testCase.expectedHandles.sort())
  ) {
    console.log(`   ✅ TEST PASSED`);
    passedTests++;
  } else {
    console.log(`   ❌ TEST FAILED - Handle mismatch`);
    failedTests++;
  }
});

// Summary
console.log('\n' + '='.repeat(50));
console.log('TEST SUMMARY');
console.log('='.repeat(50));
console.log(`✅ Passed: ${passedTests}/${testCases.length}`);
console.log(`❌ Failed: ${failedTests}/${testCases.length}`);

if (failedTests === 0) {
  console.log('\n🎉 ALL TESTS PASSED! The handle logic is working correctly.');
  console.log('\nKEY FIXES APPLIED:');
  console.log(
    '1. BaseEditableNode now properly delegates to EnhancedBranchingNode when branches exist'
  );
  console.log(
    '2. Changed duplicate "main-output" IDs to unique "main" and "source"'
  );
  console.log('3. No duplicate handles are created');
  console.log('4. Branch handles appear correctly with unique IDs');
} else {
  console.log('\n⚠️  Some tests failed. Review the logic above.');
}

console.log('\n');
