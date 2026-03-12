// Showcase the shared API-backed browser LLM client
import { ApiLLMClient } from './llm';

export async function demonstrateParsing(prompt: string) {
  const service = new ApiLLMClient();

  console.log('━'.repeat(80));
  console.log('PROMPT:', prompt);
  console.log('━'.repeat(80));

  console.log('\nSERVER STATUS:');
  console.log('─'.repeat(40));
  const status = await service.getStatus();
  console.log(status);

  console.log('\n🧠 SHARED CLIENT DRAFT GRAPH:');
  console.log('─'.repeat(40));
  const llmResult = await service.draftGraphFromPrompt(prompt);

  console.log(`Success: ${llmResult.ok}`);
  console.log(`Nodes created: ${llmResult.graph?.nodes?.length ?? 0}`);
  console.log(`Edges: ${llmResult.graph?.edges?.length ?? 0}`);
  console.log(`Provider: ${llmResult.metadata?.provider ?? status.provider ?? 'unknown'}`);
  console.log(`Model: ${llmResult.metadata?.model ?? status.defaultModel ?? 'unknown'}`);

  console.log('\n📊 COMPARISON:');
  console.log('─'.repeat(40));
  console.log(`Status available: ${status.available}`);
  console.log(`Status mode: ${status.mode}`);
  console.log(`Capabilities: ${(status.capabilities ?? []).join(', ')}`);
  console.log(`Draft graph success: ${llmResult.ok}`);

  return { status, draft: llmResult };
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
