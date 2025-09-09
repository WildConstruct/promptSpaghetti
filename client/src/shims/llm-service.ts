// Browser build stub for LLMService to avoid pulling in OpenAI SDK.
type AnyObj = Record<string, any>;

const API_BASE =
  (typeof import.meta !== 'undefined' &&
    (import.meta as any).env?.VITE_API_URL) ||
  '';

function withBase(path: string): string {
  if (!path) return path;
  if (API_BASE) {
    if (path.startsWith('http')) return path;
    if (path.startsWith('/')) return API_BASE.replace(/\/$/, '') + path;
    return API_BASE.replace(/\/$/, '') + '/' + path;
  }
  return path;
}

async function postJson<T = any>(url: string, body: AnyObj): Promise<T> {
  // Get API key from localStorage or environment
  const apiKey =
    localStorage.getItem('openrouter-api-key') ||
    (typeof import.meta !== 'undefined' &&
      (import.meta as any).env?.VITE_OPENROUTER_API_KEY);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  // Add authorization header if API key is available
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const res = await fetch(withBase(url), {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    credentials: 'include'
  });

  if (!res.ok) {
    // Try to get error details from response
    let errorMessage = `LLM endpoint error: ${res.status}`;
    try {
      const errorData = await res.json();
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
    throw new Error(errorMessage);
  }

  return (await res.json()) as T;
}

export class LLMService {
  private config: AnyObj;
  constructor(config: AnyObj = {}) {
    this.config = config;
  }
  async parse(prompt: string, request: AnyObj = {}): Promise<AnyObj> {
    // Try the new endpoint first to bypass caching issues
    try {
      return await postJson('/api/ai/parse', { prompt, ...request });
    } catch (e) {
      // Fallback to original endpoint
      console.warn('Falling back to /api/llm/parse due to error:', e);
      return postJson('/api/llm/parse', { prompt, ...request });
    }
  }
  async complete(request: AnyObj): Promise<AnyObj> {
    return postJson('/api/llm/complete', { config: this.config, request });
  }
  async suggest(request: AnyObj): Promise<AnyObj> {
    return postJson('/api/llm/suggest', { config: this.config, request });
  }
  async metadata(request: AnyObj): Promise<AnyObj> {
    return postJson('/api/llm/metadata', { config: this.config, request });
  }
  async refine(request: AnyObj): Promise<AnyObj> {
    return postJson('/api/llm/refine', { config: this.config, request });
  }
}
export default LLMService;
