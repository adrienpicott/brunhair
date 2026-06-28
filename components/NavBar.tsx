// @ts-nocheck
'use client';
import { useAuth } from './AuthProvider';
export default function NavBar() {
  const { email, signOut } = useAuth();
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 22px', background: '#fff', borderBottom: '1px solid #ece6e1' }}>
      <div style={{ fontWeight: 700, fontSize: 18, color: '#1a1625' }}>Brunair <span style={{ color: '#7c5cff' }}>·</span> <span style={{ fontWeight: 500, fontSize: 13, color: '#a59fae' }}>hair lab</span></div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ fontSize: 13, color: '#8a8390' }}>{email}</span>
        <button onClick={signOut} style={{ padding: '7px 14px', borderRadius: 9, border: '1px solid #ece6e1', background: '#faf7f5', fontSize: 13, cursor: 'pointer', color: '#6b6573' }}>Sign out</button>
      </div>
    </div>
  );
}
