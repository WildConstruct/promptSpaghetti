import OpenAI from 'openai';

export interface LLMServiceOptions {
  apiKey?: string;
  baseURL?: string;
  defaultModel?: string;
  requestTimeoutMs?: number;
}

export interface CompleteParams {
  prompt: string;
  model?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'text' | 'json_object';
}

export interface CompleteResult {
  success: boolean;
  content: string;
  model: string;
  tokensIn: number;
  tokensOut: number;
}

export class LLMService {
  private client: OpenAI | null;
  private opts: Required<LLMServiceOptions>;

  constructor(opts: LLMServiceOptions = {}) {
    this.opts = {
      apiKey:
        opts.apiKey ||
        process.env.OPENROUTER_API_KEY ||
        process.env.OPENAI_API_KEY ||
        '',
      baseURL:
        opts.baseURL ||
        process.env.OPENAI_BASE_URL ||
        'https://openrouter.ai/api/v1',
      defaultModel:
        opts.defaultModel ||
        process.env.OPENAI_DEFAULT_MODEL ||
        'openai/gpt-4o-mini',
      requestTimeoutMs:
        opts.requestTimeoutMs ||
        Number(
          process.env.LLM_TIMEOUT_MS ||
            process.env.OPENAI_REQUEST_TIMEOUT_MS ||
            12_000
        )
    };

    this.client = this.opts.apiKey
      ? new OpenAI({
          apiKey: this.opts.apiKey,
          baseURL: this.opts.baseURL,
          defaultHeaders: {
            'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
            'X-Title': 'Prompt Spaghetti'
          }
        })
      : null;
  }

  available(): boolean {
    return !!this.client;
  }

  async complete(params: CompleteParams): Promise<CompleteResult> {
    if (!this.client) {
      throw new Error('LLMService unavailable: missing API key');
    }

    const model = params.model || this.opts.defaultModel;
    const temperature = params.temperature ?? 0.4;
    const maxTokens = Math.min(params.maxTokens ?? 256, 1024);
    const systemPrompt = params.systemPrompt || 'You are a helpful assistant.';

    const prompt = params.prompt?.toString() ?? '';
    const tokensIn = Math.ceil(prompt.length / 4); // rough estimate

    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      this.opts.requestTimeoutMs
    );
    try {
      const completion = await this.client.chat.completions.create(
        {
          model,
          temperature,
          max_tokens: maxTokens,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          ...(params.responseFormat === 'json_object'
            ? {
                response_format: {
                  type: 'json_object' as const
                }
              }
            : {})
        } as any,
        { signal: controller.signal as AbortSignal }
      );

      const content = completion.choices?.[0]?.message?.content || '';
      const tokensOut = Math.ceil(content.length / 4);

      return {
        success: true,
        content,
        model,
        tokensIn,
        tokensOut
      };
    } finally {
      clearTimeout(timeout);
    }
  }
}
