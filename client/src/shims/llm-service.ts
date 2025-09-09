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
  const res = await fetch(withBase(url), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'include'
  });
  if (!res.ok) throw new Error(`LLM endpoint error: ${res.status}`);
  return (await res.json()) as T;
}

export class LLMService {
  private config: AnyObj;
  constructor(config: AnyObj = {}) {
    this.config = config;
  }
  async parse(prompt: string, request: AnyObj = {}): Promise<AnyObj> {
    return postJson('/api/llm/parse', { prompt, ...request });
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
