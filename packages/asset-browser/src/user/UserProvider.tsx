import React from 'react';

export type SupabaseAuthLike = {
  getSession: () => Promise<{
    data: { session: { user: { id: string } } | null };
  }>;
  onAuthStateChange?: (
    cb: (event: string, session: { user: { id: string } } | null) => void
  ) => { data: { subscription: { unsubscribe: () => void } } };
};

export type SupabaseLike = { auth: SupabaseAuthLike } | null | undefined;

const STORAGE_KEY = 'psg.devUserId';

function isDevEnabled(): boolean {
  const flag = (
    process.env.NEXT_PUBLIC_FEATURE_DEV_USER ||
    process.env.VITE_FEATURE_DEV_USER ||
    ''
  ).toLowerCase();
  return flag === '1' || flag === 'true';
}

export type UserContextValue = { userId: string | null };

const UserContext = React.createContext<UserContextValue>({ userId: null });

export type UserProviderProps = {
  children: React.ReactNode;
  supabase?: SupabaseLike;
};

export function UserProvider({ children, supabase }: UserProviderProps) {
  const [userId, setUserId] = React.useState<string | null>(null);

  React.useEffect(() => {
    let unsub: (() => void) | undefined;

    async function init() {
      // Dev flag path
      if (isDevEnabled() && typeof window !== 'undefined') {
        try {
          let id = window.localStorage.getItem(STORAGE_KEY);
          if (!id) {
            id = `dev-${Math.random().toString(36).slice(2, 10)}`;
            window.localStorage.setItem(STORAGE_KEY, id);
          }
          setUserId(id);
          return;
        } catch {
          // fall through to supabase path
        }
      }

      // Supabase path
      if (supabase && supabase.auth) {
        try {
          const { data } = await supabase.auth.getSession();
          const sid = data.session?.user?.id ?? null;
          setUserId(sid);
          if (typeof supabase.auth.onAuthStateChange === 'function') {
            const res = supabase.auth.onAuthStateChange((_event, session) => {
              setUserId(session?.user?.id ?? null);
            });
            if (
              res &&
              res.data &&
              res.data.subscription &&
              typeof res.data.subscription.unsubscribe === 'function'
            ) {
              unsub = () => res.data.subscription.unsubscribe();
            }
          }
          return;
        } catch {
          setUserId(null);
          return;
        }
      }

      // Default: no user
      setUserId(null);
    }

    init();
    return () => {
      if (unsub) unsub();
    };
  }, [supabase]);

  const value = React.useMemo(() => ({ userId }), [userId]);
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUserId(): UserContextValue {
  return React.useContext(UserContext);
}
