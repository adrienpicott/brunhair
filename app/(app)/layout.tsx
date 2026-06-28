// @ts-nocheck
'use client';
import AuthGate from '@/components/AuthGate';
import Header from '@/components/Header';
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <Header />
      <main style={{ maxWidth: 1040, margin: '0 auto', padding: '28px 20px 64px' }}>{children}</main>
    </AuthGate>
  );
}
