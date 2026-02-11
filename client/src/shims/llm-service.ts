// Browser build stub for LLMService to avoid pulling in OpenAI SDK.
type JsonRecord = Record<string, unknown>;

const ENV_VARS: Record<string, string | undefined> =
  typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env
    : {
        VITE_API_URL: undefined,
        VITE_API_BASE_URL: undefined,
        VITE_VERCEL_PROTECTION_BYPASS: undefined
      };

const API_BASE = ENV_VARS.VITE_API_URL ?? ENV_VARS.VITE_API_BASE_URL ?? '';

function withBase(path: string): string {
  if (!path) {
    return path;
  }
  // If API_BASE is empty or just a slash, use relative paths
  if (!API_BASE || API_BASE === '/' || API_BASE === '') {
    return path;
  }
  if (path.startsWith('http')) {
    return path;
  }
  const base = API_BASE.replace(/\/$/, '');
  if (path.startsWith('/')) {
    return `${base}${path}`;
  }
  return `${base}/${path}`;
}

async function postJson<T = JsonRecord>(
  url: string,
  body: JsonRecord
): Promise<T> {
  // Client should NOT handle API keys - server should have them configured
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  // Add Vercel protection bypass if available
  // This is set as an environment variable when protection is enabled
  const protectionBypass =
    ENV_VARS.VITE_VERCEL_PROTECTION_BYPASS ||
    process.env.NEXT_PUBLIC_VERCEL_PROTECTION_BYPASS ||
    process.env.VERCEL_PROTECTION_BYPASS;

  if (protectionBypass) {
    headers['x-vercel-protection-bypass'] = protectionBypass;
  }

  // Debug logging
  console.log('[LLM Service] Making request to:', url);

  const res = await fetch(withBase(url), {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
    // Remove credentials: 'include' to avoid CORS issues
  });

  if (!res.ok) {
    // Try to get error details from response
    let errorMessage = `LLM endpoint error: ${res.status}`;
    let errorDetails = null;
    try {
      const errorData = await res.json();
      errorDetails = errorData;
      if (errorData.error) {
        errorMessage = errorData.error;
        if (errorData.details) {
          errorMessage += ` - ${errorData.details}`;
        }
      }
    } catch {
      // If response isn't JSON, use status text
      if (res.statusText) {
        errorMessage = `LLM endpoint error: ${res.status} ${res.statusText}`;
      }
    }

    // Log detailed error info
    console.error('[LLM Service] Request failed:', {
      status: res.status,
      statusText: res.statusText,
      url: url,
      errorDetails: errorDetails,
      headers: {
        hasAuth: !!headers['Authorization'],
        authPrefix: headers['Authorization']?.substring(0, 20)
      }
    });

    throw new Error(errorMessage);
  }

  return (await res.json()) as T;
}

export class LLMService {
  private config: JsonRecord;
  constructor(config: JsonRecord = {}) {
    this.config = config;
  }
  async parse(prompt: string, request: JsonRecord = {}): Promise<JsonRecord> {
    // CACHE BUST: 2025-01-10-20:10 - Using hyphenated paths for Vercel
    // Try the new endpoint first to bypass caching issues
    try {
      console.log('[LLM] Using hyphenated path: /api/ai-parse');
      return await postJson('/api/ai-parse', { prompt, ...request });
    } catch (error) {
      // Fallback to original endpoint
      console.warn('Falling back to /api/llm-parse due to error:', error);
      return postJson('/api/llm-parse', { prompt, ...request });
    }
  }
  async complete(request: JsonRecord): Promise<JsonRecord> {
    try {
      return await postJson('/api/llm/complete', {
        config: this.config,
        request
      });
    } catch (error) {
      console.warn('Falling back to /api/llm-complete due to error:', error);
      return postJson('/api/llm-complete', { config: this.config, request });
    }
  }
  async suggest(request: JsonRecord): Promise<JsonRecord> {
    try {
      return await postJson('/api/llm/suggest', {
        config: this.config,
        request
      });
    } catch {
      return postJson('/api/llm-suggest', { config: this.config, request });
    }
  }
  async metadata(request: JsonRecord): Promise<JsonRecord> {
    try {
      return await postJson('/api/llm/metadata', {
        config: this.config,
        request
      });
    } catch {
      return postJson('/api/llm-metadata', { config: this.config, request });
    }
  }
  async refine(request: JsonRecord): Promise<JsonRecord> {
    try {
      return await postJson('/api/llm/refine', {
        config: this.config,
        request
      });
    } catch {
      return postJson('/api/llm-refine', { config: this.config, request });
    }
  }
}
export default LLMService;
