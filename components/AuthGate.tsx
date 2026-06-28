// @ts-nocheck
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';
export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { userId, loading } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!loading && !userId) router.replace('/login'); }, [loading, userId, router]);
  if (loading) { return (<div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: '#7c5cff' }}>Loading…</div>); }
  if (!userId) return null;
  return <>{children}</>;
}
