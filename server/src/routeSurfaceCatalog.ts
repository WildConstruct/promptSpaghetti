import type { RouteCapability } from './utils/routeAccess';

export type ServerRouteAccessTier =
  | 'public-readonly'
  | 'authenticated'
  | 'local-only'
  | 'internal';

export type ServerRouteVisibility =
  | 'public'
  | 'private'
  | 'local-only'
  | 'internal';

export type ServerRouteQuotaBucket =
  | 'cloud-llm'
  | 'cloud-agent'
  | 'cloud-psg'
  | 'files';

export type ServerRouteStoryRole =
  | 'status'
  | 'sandbox-generation'
  | 'primary-ai-path'
  | 'secondary-authoring-helper'
  | 'psg-protocol'
  | 'storage'
  | 'admin';

export interface ServerRouteSurface {
  id: string;
  paths: string[];
  methods: Array<'GET' | 'POST' | 'PUT' | 'DELETE'>;
  purpose: string;
  storyRole: ServerRouteStoryRole;
  accessTier: ServerRouteAccessTier;
  visibility: ServerRouteVisibility;
  authRequired: boolean;
  capability?: RouteCapability;
  rateLimit:
    | 'none'
    | 'llm:route'
    | 'agent:draft-graph'
    | 'psg:route'
    | 'route-specific'
    | 'admin:metrics'
    | 'admin:theme'
    | 'admin:theme:update'
    | 'admin:fonts:upload'
    | 'admin:fonts:delete'
    | 'admin:logo:upload'
    | 'admin:logo:delete';
  quotaBucket?: ServerRouteQuotaBucket;
  notes?: string;
}

/**
 * Canonical server-owned route surface contract for the active Fastify runtime.
 *
 * This file is the implementation source of truth for route exposure policy.
 * `server/src/index.ts` remains the canonical mounted runtime, and docs should
 * describe the same families and access levels listed here.
 */
export const SERVER_ROUTE_CATALOG: ServerRouteSurface[] = [
  {
    id: 'health',
    paths: ['/health'],
    methods: ['GET'],
    purpose: 'Basic process health for local checks and uptime probes.',
    storyRole: 'status',
    accessTier: 'public-readonly',
    visibility: 'public',
    authRequired: false,
    rateLimit: 'none'
  },
  {
    id: 'api-healthz',
    paths: ['/api/healthz'],
    methods: ['GET'],
    purpose: 'API-style health endpoint for platform probes.',
    storyRole: 'status',
    accessTier: 'public-readonly',
    visibility: 'public',
    authRequired: false,
    rateLimit: 'none'
  },
  // NOTE: POST /preview and the server graph engine were removed. Graph
  // preview/export runs client-side via Epic1ExecutionEngine. Do not re-add a
  // public execution endpoint here without an explicit product decision.
  {
    id: 'llm-status',
    paths: ['/api/llm/status'],
    methods: ['GET'],
    purpose: 'Report current server-side LLM availability and capabilities.',
    storyRole: 'status',
    accessTier: 'public-readonly',
    visibility: 'public',
    authRequired: false,
    rateLimit: 'none'
  },
  {
    id: 'psg-capabilities',
    paths: ['/api/psg/capabilities'],
    methods: ['GET'],
    purpose: 'Report the hosted PSG protocol capabilities supported by the server.',
    storyRole: 'psg-protocol',
    accessTier: 'public-readonly',
    visibility: 'public',
    authRequired: false,
    rateLimit: 'none'
  },
  {
    id: 'local-image-status',
    paths: ['/api/local-image/status'],
    methods: ['GET'],
    purpose: 'Report whether local sandbox image generation is available on this machine.',
    storyRole: 'sandbox-generation',
    accessTier: 'local-only',
    visibility: 'local-only',
    authRequired: false,
    rateLimit: 'none',
    notes:
      'Loopback-only by default (requireLocalSandboxAccess). Not part of the hosted public API. Set LOCAL_SANDBOX_ALLOW_REMOTE=true only if intentional.'
  },
  {
    id: 'local-image-batch',
    paths: ['/api/local-image/batch'],
    methods: ['POST'],
    purpose: 'Generate a bounded local-only batch of sandbox images through a Comfy-compatible runtime.',
    storyRole: 'sandbox-generation',
    accessTier: 'local-only',
    visibility: 'local-only',
    authRequired: false,
    rateLimit: 'route-specific',
    notes:
      'Optional local demo lane. Loopback-gated; drives local Comfy when configured. Not a hosted generation product.'
  },
  {
    id: 'local-image-files',
    paths: ['/api/local-image/files/:runId/:filename'],
    methods: ['GET'],
    purpose: 'Serve generated local sandbox batch outputs back to the browser.',
    storyRole: 'sandbox-generation',
    accessTier: 'local-only',
    visibility: 'local-only',
    authRequired: false,
    rateLimit: 'route-specific',
    notes:
      'Loopback-gated file read for local sandbox outputs. Files stay on the local machine.'
  },
  {
    id: 'local-fragments-save',
    paths: ['/api/local-fragments/save', '/api/local-fragments/list'],
    methods: ['GET', 'POST'],
    purpose: 'List and save user-authored PSG fragments in a local documents folder.',
    storyRole: 'storage',
    accessTier: 'local-only',
    visibility: 'local-only',
    authRequired: false,
    rateLimit: 'none',
    notes:
      'Loopback-gated. Optional LOCAL_FRAGMENT_ROOTS path.delimiter allowlist restricts folderPath. Default HOST is 127.0.0.1.'
  },
  {
    id: 'agent-draft-graph',
    paths: ['/api/agent/draft-graph'],
    methods: ['POST'],
    purpose: 'Primary AI path for turning a prompt into a graph draft.',
    storyRole: 'primary-ai-path',
    accessTier: 'authenticated',
    visibility: 'private',
    authRequired: true,
    capability: 'cloud-agent',
    rateLimit: 'agent:draft-graph',
    quotaBucket: 'cloud-agent'
  },
  {
    id: 'llm-complete',
    paths: ['/api/llm/complete', '/api/llm-complete'],
    methods: ['POST'],
    purpose: 'Secondary authenticated text-completion helper for authoring flows.',
    storyRole: 'secondary-authoring-helper',
    accessTier: 'authenticated',
    visibility: 'private',
    authRequired: true,
    capability: 'cloud-llm',
    rateLimit: 'llm:route',
    quotaBucket: 'cloud-llm'
  },
  {
    id: 'llm-parse',
    paths: ['/api/ai/parse', '/api/llm/parse', '/api/ai-parse', '/api/llm-parse'],
    methods: ['POST'],
    purpose: 'Secondary authenticated prompt parsing helper and compatibility aliases.',
    storyRole: 'secondary-authoring-helper',
    accessTier: 'authenticated',
    visibility: 'private',
    authRequired: true,
    capability: 'cloud-llm',
    rateLimit: 'llm:route',
    quotaBucket: 'cloud-llm'
  },
  {
    id: 'llm-suggest',
    paths: ['/api/llm/suggest', '/api/llm-suggest'],
    methods: ['POST'],
    purpose: 'Secondary authenticated inspiration and suggestion helper.',
    storyRole: 'secondary-authoring-helper',
    accessTier: 'authenticated',
    visibility: 'private',
    authRequired: true,
    capability: 'cloud-llm',
    rateLimit: 'llm:route',
    quotaBucket: 'cloud-llm'
  },
  {
    id: 'llm-metadata',
    paths: ['/api/llm/metadata', '/api/llm-metadata'],
    methods: ['POST'],
    purpose: 'Secondary authenticated metadata extraction helper.',
    storyRole: 'secondary-authoring-helper',
    accessTier: 'authenticated',
    visibility: 'private',
    authRequired: true,
    capability: 'cloud-llm',
    rateLimit: 'llm:route',
    quotaBucket: 'cloud-llm'
  },
  {
    id: 'llm-refine',
    paths: ['/api/llm/refine', '/api/llm-refine'],
    methods: ['POST'],
    purpose: 'Secondary authenticated text refinement helper.',
    storyRole: 'secondary-authoring-helper',
    accessTier: 'authenticated',
    visibility: 'private',
    authRequired: true,
    capability: 'cloud-llm',
    rateLimit: 'llm:route',
    quotaBucket: 'cloud-llm'
  },
  {
    id: 'llm-analyze',
    paths: ['/api/llm/analyze', '/api/llm-analyze'],
    methods: ['POST'],
    purpose: 'Secondary authenticated graph analysis helper.',
    storyRole: 'secondary-authoring-helper',
    accessTier: 'authenticated',
    visibility: 'private',
    authRequired: true,
    capability: 'cloud-llm',
    rateLimit: 'llm:route',
    quotaBucket: 'cloud-llm'
  },
  {
    id: 'llm-optimize',
    paths: ['/api/llm/optimize', '/api/llm-optimize'],
    methods: ['POST'],
    purpose: 'Secondary authenticated weighted-choice optimization helper.',
    storyRole: 'secondary-authoring-helper',
    accessTier: 'authenticated',
    visibility: 'private',
    authRequired: true,
    capability: 'cloud-llm',
    rateLimit: 'llm:route',
    quotaBucket: 'cloud-llm'
  },
  {
    id: 'llm-populate',
    paths: ['/api/llm/populate', '/api/llm-populate'],
    methods: ['POST'],
    purpose: 'Secondary authenticated choice-population helper.',
    storyRole: 'secondary-authoring-helper',
    accessTier: 'authenticated',
    visibility: 'private',
    authRequired: true,
    capability: 'cloud-llm',
    rateLimit: 'llm:route',
    quotaBucket: 'cloud-llm'
  },
  {
    id: 'psg-validate',
    paths: ['/api/psg/validate'],
    methods: ['POST'],
    purpose: 'Validate PSG documents against the durable protocol contract.',
    storyRole: 'psg-protocol',
    accessTier: 'authenticated',
    visibility: 'private',
    authRequired: true,
    capability: 'cloud-psg',
    rateLimit: 'psg:route',
    quotaBucket: 'cloud-psg'
  },
  {
    id: 'psg-normalize',
    paths: ['/api/psg/normalize'],
    methods: ['POST'],
    purpose: 'Normalize PSG documents into the canonical envelope.',
    storyRole: 'psg-protocol',
    accessTier: 'authenticated',
    visibility: 'private',
    authRequired: true,
    capability: 'cloud-psg',
    rateLimit: 'psg:route',
    quotaBucket: 'cloud-psg'
  },
  {
    id: 'psg-assets-register',
    paths: ['/api/psg/assets/register'],
    methods: ['POST'],
    purpose: 'Register PSG asset references and attachment metadata.',
    storyRole: 'psg-protocol',
    accessTier: 'authenticated',
    visibility: 'private',
    authRequired: true,
    capability: 'cloud-psg',
    rateLimit: 'psg:route',
    quotaBucket: 'cloud-psg'
  },
  {
    id: 'psg-assets-derive',
    paths: ['/api/psg/assets/derive'],
    methods: ['POST'],
    purpose: 'Record derived PSG asset lineage.',
    storyRole: 'psg-protocol',
    accessTier: 'authenticated',
    visibility: 'private',
    authRequired: true,
    capability: 'cloud-psg',
    rateLimit: 'psg:route',
    quotaBucket: 'cloud-psg'
  },
  {
    id: 'psg-expand-crowd',
    paths: ['/api/psg/expand-crowd'],
    methods: ['POST'],
    purpose: 'Hosted PSG crowd-expansion helper.',
    storyRole: 'psg-protocol',
    accessTier: 'authenticated',
    visibility: 'private',
    authRequired: true,
    capability: 'cloud-psg',
    rateLimit: 'psg:route',
    quotaBucket: 'cloud-psg'
  },
  {
    id: 'psg-scene-assemble',
    paths: ['/api/psg/scene/assemble'],
    methods: ['POST'],
    purpose: 'Assemble scene payloads from PSG scene-sidecar data.',
    storyRole: 'psg-protocol',
    accessTier: 'authenticated',
    visibility: 'private',
    authRequired: true,
    capability: 'cloud-psg',
    rateLimit: 'psg:route',
    quotaBucket: 'cloud-psg'
  },
  {
    id: 'psg-export-comfy',
    paths: ['/api/psg/export/comfy'],
    methods: ['POST'],
    purpose: 'Export PSG documents to the downstream Comfy bridge shape.',
    storyRole: 'psg-protocol',
    accessTier: 'authenticated',
    visibility: 'private',
    authRequired: true,
    capability: 'cloud-psg',
    rateLimit: 'psg:route',
    quotaBucket: 'cloud-psg'
  },
  {
    id: 'files',
    paths: ['/api/files/*'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    purpose: 'Authenticated graph file storage and related metadata operations.',
    storyRole: 'storage',
    accessTier: 'authenticated',
    visibility: 'private',
    authRequired: true,
    rateLimit: 'route-specific',
    quotaBucket: 'files'
  },
  {
    id: 'admin-panel',
    paths: ['/admin'],
    methods: ['GET'],
    purpose: 'Internal admin/debug panel surface.',
    storyRole: 'admin',
    accessTier: 'internal',
    visibility: 'internal',
    authRequired: true,
    capability: 'admin',
    rateLimit: 'route-specific'
  },
  {
    id: 'admin-metrics',
    paths: ['/api/admin/metrics'],
    methods: ['GET'],
    purpose: 'Internal metrics snapshot endpoint.',
    storyRole: 'admin',
    accessTier: 'internal',
    visibility: 'internal',
    authRequired: true,
    capability: 'admin',
    rateLimit: 'admin:metrics'
  },
  {
    id: 'admin-theme',
    paths: ['/api/admin/theme'],
    methods: ['GET', 'PUT'],
    purpose: 'Internal theme configuration surface.',
    storyRole: 'admin',
    accessTier: 'internal',
    visibility: 'internal',
    authRequired: true,
    capability: 'admin',
    rateLimit: 'route-specific',
    notes: 'Mounted only when the admin surface is enabled.'
  },
  {
    id: 'admin-fonts',
    paths: ['/api/admin/fonts', '/api/admin/fonts/:id'],
    methods: ['POST', 'DELETE'],
    purpose: 'Internal admin font upload and deletion surfaces.',
    storyRole: 'admin',
    accessTier: 'internal',
    visibility: 'internal',
    authRequired: true,
    capability: 'admin',
    rateLimit: 'route-specific',
    notes: 'Mounted only when the admin surface and Supabase admin storage are enabled.'
  },
  {
    id: 'admin-logo',
    paths: ['/api/admin/logo'],
    methods: ['POST', 'DELETE'],
    purpose: 'Internal admin logo upload and deletion surfaces.',
    storyRole: 'admin',
    accessTier: 'internal',
    visibility: 'internal',
    authRequired: true,
    capability: 'admin',
    rateLimit: 'route-specific',
    notes: 'Mounted only when the admin surface is enabled.'
  }
];
