## LLM Service Testing Guide

This document captures the patterns introduced while raising coverage for the LLM stack (`packages/core/services/llm`). The goal is to keep future contributors aligned on how to exercise the service end-to-end without touching real network APIs.

### 1. Test Harness

- **OpenAI shim** – use `jest.mock('openai')` to substitute the client with a simple factory that exposes the `chat.completions.create` method. Each test can then access `create` and force success/failure without hitting the network.
- **Quota timers** – `TokenTracker` schedules a midnight reset. Stub `scheduleDailyReset` (via `jest.spyOn(TokenTracker.prototype as any, 'scheduleDailyReset')`) in the suite `beforeAll` to avoid background timers.
- **Privacy warnings** – the service logs warnings when the `PrivacyFilter` spots PII. Capture them with `jest.spyOn(console, 'warn')` to keep the console clear while still asserting if needed.

### 2. Typical Scenarios

| Scenario | Inputs | Assertions |
| --- | --- | --- |
| Cache hit | Call `complete` twice with identical `LLMRequest` | First response `cached === false`, second `cached === true` |
| Quota exceeded | Set `tokenTracker` quota to zero | Service returns `{ error: 'Daily quota exceeded' }` without hitting the client |
| Fallback | Force `create` to reject | Service returns `null` and marks model as failed via `ModelSelector` |
| JSON mode | `responseFormat: 'json'`, supply valid JSON string | `response_format` equals `{ type: 'json_object' }` and metadata validation passes |

### 3. Helper Snippets

```ts
const openAIExports = jest.requireMock('openai') as {
  default: jest.Mock;
  create: jest.Mock;
};

beforeEach(() => {
  openAIExports.create.mockReset();
  openAIExports.default.mockClear();
});
```

```ts
const baseRequest: LLMRequest = {
  prompt: 'Describe a dragon',
  context: 'Fantasy setting',
  maxTokens: 64,
  temperature: 0.2,
  responseFormat: 'text',
  taskType: 'general'
};
```

### 4. Coverage Targets

- `LLMService.ts`: capture the retry branch (`callWithRetry`), JSON validation failures, and privacy filter warnings.
- `MetadataExtractor.ts`: ensure tests cover cache hits, offline cache, LLM success, LLM failure, and background extraction.
- Utilities (`ModelSelector`, `CacheManager`, `TokenTracker`, `PrivacyFilter`): assert both happy paths and edge branches (TTL expiry, blocklist hits, cost projections).

Run a focused suite:

```bash
pnpm test -- --runTestsByPath \
  packages/core/tests/services/llm/LLMService.test.ts \
  packages/core/tests/services/llm/MetadataExtractor.test.ts \
  packages/core/tests/services/llm/TokenTracker.test.ts
```

For a quick list of remaining weak spots:

```bash
pnpm test -- --coverage --coverageReporters=json-summary --coverageDirectory=.temp-coverage
pnpm coverage:report
```

The above workflow keeps the LLM surface thoroughly exercised without ever contacting a live API.

