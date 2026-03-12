import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabase: SupabaseClient | null = null;
let supabasePublic: SupabaseClient | null = null;

export type SupabaseAuthContext = {
  userId: string;
  email: string | null;
  appMetadata: Record<string, unknown>;
  userMetadata: Record<string, unknown>;
  capabilities: string[];
  subscriptionActive: boolean;
  subscriptionState: 'active' | 'trialing' | 'inactive' | 'unknown';
  plan: string;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(entry => (typeof entry === 'string' ? entry.trim() : ''))
    .filter((entry): entry is string => entry.length > 0);
}

function pickPromptscapeMetadata(
  appMetadata: Record<string, unknown>,
  userMetadata: Record<string, unknown>
) {
  return {
    app: asRecord(appMetadata.prompt_spaghetti ?? appMetadata.promptscape),
    user: asRecord(userMetadata.prompt_spaghetti ?? userMetadata.promptscape)
  };
}

function resolveSubscriptionState(
  appMetadata: Record<string, unknown>,
  userMetadata: Record<string, unknown>
): SupabaseAuthContext['subscriptionState'] {
  const promptscape = pickPromptscapeMetadata(appMetadata, userMetadata);
  const raw =
    promptscape.app.subscription_state ??
    promptscape.user.subscription_state ??
    appMetadata.subscription_state ??
    userMetadata.subscription_state ??
    appMetadata.subscriptionStatus ??
    userMetadata.subscriptionStatus;

  if (typeof raw !== 'string') {
    return 'unknown';
  }

  switch (raw.trim().toLowerCase()) {
    case 'active':
    case 'paid':
    case 'pro':
      return 'active';
    case 'trial':
    case 'trialing':
      return 'trialing';
    case 'inactive':
    case 'canceled':
    case 'cancelled':
    case 'expired':
    case 'free':
      return 'inactive';
    default:
      return 'unknown';
  }
}

function resolveSubscriptionActive(
  appMetadata: Record<string, unknown>,
  userMetadata: Record<string, unknown>,
  subscriptionState: SupabaseAuthContext['subscriptionState']
): boolean {
  const promptscape = pickPromptscapeMetadata(appMetadata, userMetadata);
  const raw =
    promptscape.app.subscription_active ??
    promptscape.user.subscription_active ??
    appMetadata.subscription_active ??
    userMetadata.subscription_active;

  if (typeof raw === 'boolean') {
    return raw;
  }

  return subscriptionState === 'active' || subscriptionState === 'trialing';
}

function resolvePlan(
  appMetadata: Record<string, unknown>,
  userMetadata: Record<string, unknown>,
  subscriptionActive: boolean
): string {
  const promptscape = pickPromptscapeMetadata(appMetadata, userMetadata);
  const raw =
    promptscape.app.plan ??
    promptscape.user.plan ??
    appMetadata.plan ??
    userMetadata.plan ??
    appMetadata.subscription_tier ??
    userMetadata.subscription_tier;

  if (typeof raw === 'string' && raw.trim().length > 0) {
    return raw.trim().toLowerCase();
  }

  return subscriptionActive ? 'pro' : 'free';
}

function resolveCapabilities(
  appMetadata: Record<string, unknown>,
  userMetadata: Record<string, unknown>
): string[] {
  const promptscape = pickPromptscapeMetadata(appMetadata, userMetadata);
  const values = [
    ...asStringArray(promptscape.app.capabilities),
    ...asStringArray(promptscape.user.capabilities),
    ...asStringArray(appMetadata.capabilities),
    ...asStringArray(userMetadata.capabilities)
  ];

  return Array.from(new Set(values.map(value => value.toLowerCase())));
}

export function getSupabaseAdmin(): SupabaseClient | null {
  if (supabase) {return supabase;}
  const url = process.env.SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!url || !serviceKey) {return null;}
  supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
  return supabase;
}

export function getSupabasePublic(): SupabaseClient | null {
  if (supabasePublic) {return supabasePublic;}
  const url = process.env.SUPABASE_URL;
  const anonKey =
    process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {return null;}
  supabasePublic = createClient(url, anonKey, {
    auth: { persistSession: false }
  });
  return supabasePublic;
}

/**
 * Verify a Supabase JWT access token and return the user id if valid.
 */
export async function verifySupabaseToken(
  token?: string
): Promise<string | null> {
  const context = await getSupabaseAuthContext(token);
  return context?.userId ?? null;
}

export async function getSupabaseAuthContext(
  token?: string
): Promise<SupabaseAuthContext | null> {
  if (!token) {return null;}
  const pub = getSupabasePublic();
  if (!pub) {return null;}
  try {
    const { data, error } = await pub.auth.getUser(token);
    if (error || !data?.user?.id) {return null;}
    const appMetadata = asRecord(data.user.app_metadata);
    const userMetadata = asRecord(data.user.user_metadata);
    const subscriptionState = resolveSubscriptionState(
      appMetadata,
      userMetadata
    );
    const subscriptionActive = resolveSubscriptionActive(
      appMetadata,
      userMetadata,
      subscriptionState
    );

    return {
      userId: data.user.id,
      email: data.user.email ?? null,
      appMetadata,
      userMetadata,
      capabilities: resolveCapabilities(appMetadata, userMetadata),
      subscriptionActive,
      subscriptionState,
      plan: resolvePlan(appMetadata, userMetadata, subscriptionActive)
    };
  } catch {
    return null;
  }
}
