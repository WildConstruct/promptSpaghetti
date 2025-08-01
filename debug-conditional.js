// Quick debug script for conditional logic
console.log('Testing basic function creation...');

try {
  const context = { score: 85 };
  const expression = 'score > 70';
  
  const paramNames = Object.keys(context);
  const paramValues = paramNames.map((name: string) => context[name]);
  
  console.log('Param names:', paramNames);
  console.log('Param values:', paramValues);
  console.log('Expression:', expression);
  
  const func = new Function(...paramNames, `return (${expression});`);
  console.log('Function created:', func.toString());
  
  const result = func(...paramValues);
  console.log('Result:', result);
 catch (error) {
  console.error('Error:', error);
