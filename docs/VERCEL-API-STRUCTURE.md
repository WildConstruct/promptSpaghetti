# Vercel API Structure Documentation

## Important: Vercel Serverless Function Limitations

**DATE:** 2025-09-10
**ISSUE:** Vercel does not recognize nested directories for serverless functions in the `api/` folder.

### Problem

When creating API endpoints like `/api/llm/complete` by placing files in `api/llm/complete.js`, Vercel will NOT recognize these as valid serverless functions and will return 404 errors.

### Solution

All API endpoints must be at the ROOT level of the `api/` directory. For organization purposes, we use a wrapper pattern:

1. **Actual implementation** stays in subdirectories for organization:
   - `api/llm/complete.js` - The actual implementation
   - `api/ai/parse.js` - The actual implementation

2. **Wrapper files** at root level for Vercel to recognize:
   - `api/llm-complete.js` - Wrapper that exports `require('./llm/complete.js')`
   - `api/ai-parse.js` - Wrapper that exports `require('./ai/parse.js')`

### Client-Side Path Mapping

The client must use hyphenated paths that match the wrapper files:

```typescript
// CORRECT - Uses hyphenated paths that map to root-level wrappers
await postJson('/api/llm-complete', data);
await postJson('/api/ai-parse', data);

// INCORRECT - These will 404 because Vercel doesn't recognize nested paths
await postJson('/api/llm/complete', data);
await postJson('/api/ai/parse', data);
```

### Current LLM Endpoints

| Client Path         | Wrapper File          | Implementation        |
| ------------------- | --------------------- | --------------------- |
| `/api/llm-complete` | `api/llm-complete.js` | `api/llm/complete.js` |
| `/api/llm-suggest`  | `api/llm-suggest.js`  | `api/llm/suggest.js`  |
| `/api/llm-metadata` | `api/llm-metadata.js` | `api/llm/metadata.js` |
| `/api/llm-refine`   | `api/llm-refine.js`   | `api/llm/refine.js`   |
| `/api/llm-parse`    | `api/llm-parse.js`    | `api/llm/parse.js`    |
| `/api/ai-parse`     | `api/ai-parse.js`     | `api/ai/parse.js`     |

### Adding New API Endpoints

When adding new API endpoints:

1. Create your implementation in a logical subdirectory (e.g., `api/feature/endpoint.js`)
2. Create a wrapper at root level with hyphenated name (e.g., `api/feature-endpoint.js`)
3. The wrapper should simply export the subdirectory file:
   ```javascript
   module.exports = require('./feature/endpoint.js');
   ```
4. Update the client to use the hyphenated path (e.g., `/api/feature-endpoint`)

### Architecture Context

- **Frontend**: Deployed on Netlify at ps.wildconstruct.com
- **Backend API**: Deployed on Vercel at promptspaghettiserver.vercel.app
- **Proxy**: Netlify redirects `/api/*` requests to Vercel backend

### Troubleshooting 404 Errors

If you get 404 errors for API endpoints:

1. Check that the wrapper file exists at root level of `api/`
2. Verify the client is using hyphenated paths
3. Ensure the wrapper correctly exports the implementation
4. Deploy to Vercel with `vercel --prod --yes`
5. Wait for Netlify to deploy if frontend changes were made

### Related Files

- `netlify.toml` - Contains redirect configuration from Netlify to Vercel
- `client/src/shims/llm-service.ts` - Client-side API service using hyphenated paths
- `api/` - Root directory for all Vercel serverless functions
