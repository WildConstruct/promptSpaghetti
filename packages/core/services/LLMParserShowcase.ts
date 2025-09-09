// Showcase the difference between Standard and LLM-Enhanced parsing
import { SimpleLLMService } from './SimpleLLMService';

export async function demonstrateParsing(prompt: string) {
  const service = new SimpleLLMService({
    apiKey: 'demo',
    provider: 'openrouter',
    model: 'gpt-4'
  });

  console.log('━'.repeat(80));
  console.log('PROMPT:', prompt);
  console.log('━'.repeat(80));

  // Standard parsing
  console.log('\n📝 STANDARD PARSING:');
  console.log('─'.repeat(40));
  const standardResult = await service.parse(prompt, { mode: 'standard' });

  console.log(`Nodes created: ${standardResult.nodes.length}`);
  standardResult.nodes.forEach(node => {
    console.log(`  • [${node.type}] ${node.data.label?.substring(0, 50)}...`);
  });
  console.log(`Edges: ${standardResult.edges.length}`);
  console.log(`Metadata:`, standardResult.metadata);

  // LLM-Enhanced parsing
  console.log('\n🧠 LLM-ENHANCED PARSING:');
  console.log('─'.repeat(40));
  const llmResult = await service.parse(prompt, { mode: 'llm-enhanced' });

  console.log(`Nodes created: ${llmResult.nodes.length}`);
  llmResult.nodes.forEach(node => {
    console.log(`  • [${node.type}] ${node.data.label?.substring(0, 50)}...`);
    if (node.data.metadata) {
      console.log(
        `    → Chunks: ${node.data.metadata.chunks?.length || 0}, Role: ${node.data.metadata.semanticRole}`
      );
    }
    if (node.data.suggestions) {
      console.log(`    → Suggestions: ${node.data.suggestions.join(', ')}`);
    }
  });
  console.log(`Edges: ${llmResult.edges.length}`);
  llmResult.edges.forEach(edge => {
    if (edge.data?.label) {
      console.log(`  • ${edge.source} → ${edge.target}: "${edge.data.label}"`);
    }
  });
  console.log(`Metadata:`, llmResult.metadata);

  console.log('\n📊 COMPARISON:');
  console.log('─'.repeat(40));
  console.log(
    `Standard nodes: ${standardResult.nodes.length} vs Enhanced nodes: ${llmResult.nodes.length}`
  );
  console.log(
    `Standard detected variables: ${standardResult.metadata.intelligence?.detectedVariables?.length || 0}`
  );
  console.log(
    `Enhanced detected variables: ${llmResult.metadata.intelligence?.detectedVariables?.length || 0}`
  );
  console.log(
    `Enhanced structure type: ${llmResult.metadata.intelligence?.structureType}`
  );
  console.log(
    `Enhanced confidence: ${llmResult.metadata.intelligence?.confidence}`
  );

  return { standard: standardResult, enhanced: llmResult };
}

// Test with the cinematic fashion prompt
export async function testCinematicPrompt() {
  const cinematicPrompt = `hyper-real cinematic fashion editorial. A tall dark-skinned model in regal red couture gown embroidered with metallic ornaments walks forward with poise. Beside her, a gigantic red tiger shimmering with translucent lacquer and white filigree engravings, amber eyes glowing, intricate ornamental carvings across its body. Setting: golden baroque palace hall with vaulted ceilings and chandeliers reflecting warm light. Both move in perfect sync, runway energy. Floor polished like a mirror. Warm cinematic lighting, photoreal textures, micro-detail in engravings and fabrics, 8k render.`;

  return demonstrateParsing(cinematicPrompt);
}

// Test with a simpler variable-based prompt
export async function testVariablePrompt() {
  const variablePrompt = `Create a {mood} scene with {character_name} in a {location}. If it's day, show bright colors, otherwise use dark tones.`;

  return demonstrateParsing(variablePrompt);
}

// Test with choices
export async function testChoicePrompt() {
  const choicePrompt = `The hero can either fight the dragon or negotiate with it. Choose sword or diplomacy.`;

  return demonstrateParsing(choicePrompt);
}
