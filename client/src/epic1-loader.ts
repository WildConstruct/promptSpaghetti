// Loader utility to safely import Epic1 components with better error handling

export async function loadEpic1Editor() {
  try {
    // Load components in the correct order to avoid circular dependencies
    
    // Step 1: Load base components first
    const baseModule = await import('@promptscape/core/components/epic1/nodes/BaseEditableNode');
    console.log('BaseEditableNode loaded:', baseModule);
    
    // Step 2: Load individual node types
    const textBlockModule = await import('@promptscape/core/components/epic1/nodes/TextBlockNode');
    console.log('TextBlockNode loaded:', textBlockModule);
    
    const weightedChoiceModule = await import('@promptscape/core/components/epic1/nodes/WeightedChoiceNode');
    console.log('WeightedChoiceNode loaded:', weightedChoiceModule);
    
    const outputModule = await import('@promptscape/core/components/epic1/nodes/OutputNode');
    console.log('OutputNode loaded:', outputModule);
    
    // Step 3: Create node types mapping
    const nodeTypes = {
      textBlock: textBlockModule.TextBlockNode,
      weightedChoice: weightedChoiceModule.WeightedChoiceNode,
      output: outputModule.OutputNode,
    };
    
    console.log('Created nodeTypes:', nodeTypes);
    
    // Step 4: Load the main editor
    const editorModule = await import('@promptscape/core/components/epic1/Epic1GraphEditor');
    console.log('Epic1GraphEditor module loaded:', editorModule);
    
    return {
      Epic1GraphEditorWithProvider: editorModule.Epic1GraphEditorWithProvider,
      nodeTypes,
      success: true
    };
    
  } catch (error) {
    console.error('Failed to load Epic1 components:', error);
    return {
      Epic1GraphEditorWithProvider: null,
      nodeTypes: null,
      success: false,
      error: error.message || 'Unknown error'
    };
  }
}