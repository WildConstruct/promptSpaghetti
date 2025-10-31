declare module 'openai' {
  interface OpenAIConfig {
    apiKey?: string;
    baseURL?: string;
    defaultHeaders?: Record<string, string>;
    dangerouslyAllowBrowser?: boolean;
  }

  export interface ChatInterface {
    completions: {
      create(
        params: import('openai/resources/chat/completions').ChatCompletionCreateParamsNonStreaming
      ): Promise<import('openai/resources/chat/completions').ChatCompletion>;
    };
  }

  export default class OpenAI {
    constructor(config?: OpenAIConfig);
    chat: ChatInterface;
  }
}

declare module 'openai/resources/chat/completions' {
  export interface ChatCompletionMessage {
    content?: string;
  }

  export interface ChatCompletionChoice {
    message?: ChatCompletionMessage;
  }

  export interface ChatCompletion {
    id: string;
    model: string;
    created: number;
    choices: ChatCompletionChoice[];
  }

  export interface ChatCompletionCreateParamsNonStreaming {
    messages: ChatCompletionMessageParam[];
    model: string;
    temperature?: number;
    max_tokens?: number;
    response_format?: { type: string };
  }

  export type ChatCompletionMessageParam = Record<string, unknown>;
}
