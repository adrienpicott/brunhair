// @ts-nocheck
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/AuthProvider';
export default function LoginPage() {
  const { signIn, userId, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (!loading && userId) router.replace('/'); }, [loading, userId, router]);
  async function handleSubmit() {
    setErr(null); setBusy(true);
    const msg = await signIn(email.trim(), password);
    setBusy(false);
    if (msg) setErr(msg); else router.replace('/');
  }
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: '#faf7f5' }}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="card" style={{ width: '100%', maxWidth: 380, padding: 32 }}>
        <div className="display" style={{ fontSize: 30, fontWeight: 600, color: '#211b2e', letterSpacing: '-0.01em' }}>BrunHair<span style={{ color: '#7c5cff' }}>.</span></div>
        <div style={{ fontSize: 14, color: '#8a8390', marginTop: 4, marginBottom: 24 }}>Your personal hair lab. Sign in to continue.</div>
        <label style={{ fontSize: 13, color: '#6b6573' }}>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} style={inp} placeholder="you@email.com" />
        <label style={{ fontSize: 13, color: '#6b6573', marginTop: 14, display: 'block' }}>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} style={inp} placeholder="********" />
        {err && <div style={{ color: '#e8788a', fontSize: 13, marginTop: 12 }}>{err}</div>}
        <button onClick={handleSubmit} disabled={busy} style={{ ...btn, opacity: busy ? 0.6 : 1 }}>{busy ? 'Signing in…' : 'Sign in'}</button>
        <div style={{ fontSize: 12, color: '#a59fae', marginTop: 18, lineHeight: 1.5 }}>Accounts are created by the administrator in Supabase. No public sign-up.</div>
      </motion.div>
    </div>
  );
}
const inp: React.CSSProperties = { width: '100%', marginTop: 6, padding: '11px 13px', borderRadius: 10, border: '1px solid #ece6e1', outline: 'none', fontSize: 15, background: '#fff' };
const btn: React.CSSProperties = { width: '100%', marginTop: 22, padding: '12px 16px', borderRadius: 10, border: 'none', background: '#7c5cff', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer' };
