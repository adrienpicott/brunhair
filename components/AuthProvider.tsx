// @ts-nocheck
'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
type AuthCtx = { userId: string | null; email: string | null; loading: boolean; signIn: (email: string, password: string) => Promise<string | null>; signOut: () => Promise<void>; };
const Ctx = createContext<AuthCtx>({ userId: null, email: null, loading: true, signIn: async () => 'not ready', signOut: async () => {} });
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setUserId(data.session?.user?.id ?? null);
      setEmail(data.session?.user?.email ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id ?? null);
      setEmail(session?.user?.email ?? null);
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, []);
  async function signIn(em: string, pw: string) {
    const { error } = await supabase.auth.signInWithPassword({ email: em, password: pw });
    return error ? error.message : null;
  }
  async function signOut() { await supabase.auth.signOut(); }
  return <Ctx.Provider value={{ userId, email, loading, signIn, signOut }}>{children}</Ctx.Provider>;
}
export const useAuth = () => useContext(Ctx);
