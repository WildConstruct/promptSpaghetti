// Lightweight browser-safe stub for 'openai' to avoid Node shims during web builds.
// Only provide minimal surface used by @promptscape/core UI components.

export interface ChatCompletionCreateParams {
  model?: string;
  messages?: Array<{ role: string; content: string }>;
  stream?: boolean;
}

class ChatCompletionsAPI {
  async create(): Promise<never> {
    throw new Error('OpenAI API is not available in the browser build');
  }
}

export default class OpenAI {
  chat = { completions: new ChatCompletionsAPI() } as const;
}

export { OpenAI };
