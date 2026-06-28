// @ts-nocheck
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const dkey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const dayAgo = (n: number) => dkey(new Date(Date.now() - n * 86400000));

export default function HomeStats({ userId }: { userId: string }) {
  const [s, setS] = useState<any>(null);

  useEffect(() => {
    (async () => {
      if (!userId) return;
      const [sh, rl, rt, iv] = await Promise.all([
        supabase.from('shedding_counts').select('log_date,count').gte('log_date', dayAgo(30)).order('log_date', { ascending: false }),
        supabase.from('routine_logs').select('log_date,completed,routine_id').gte('log_date', dayAgo(7)),
        supabase.from('routines').select('id,in_use'),
        supabase.from('interventions').select('log_date').gte('log_date', dayAgo(30)),
      ]);
      const shed = sh.data || [], logs = rl.data || [], routines = (rt.data || []).filter((r) => r.in_use), interv = iv.data || [];
      const latest = shed.length ? shed[0].count : null;
      const last7 = shed.slice(0, 7).map((x) => x.count).filter((n) => n != null);
      const avg7 = last7.length ? Math.round(last7.reduce((a, b) => a + b, 0) / last7.length) : null;
      const adherence = routines.length ? Math.min(100, Math.round((logs.filter((l) => l.completed).length / (routines.length * 7)) * 100)) : null;
      // streak : jours consécutifs avec activité jusqu'à aujourd'hui
      const active = new Set([...shed.map((x) => x.log_date), ...logs.map((x) => x.log_date), ...interv.map((x) => x.log_date)]);
      let streak = 0; const d = new Date();
      while (active.has(dkey(d)) && streak < 365) { streak++; d.setDate(d.getDate() - 1); }
      setS({ latest, avg7, adherence, streak });
    })();
  }, [userId]);

  if (!s) return null;
  const improving = s.latest != null && s.avg7 != null && s.latest <= s.avg7;
  const tiles = [
    s.latest != null && { label: 'Shedding (latest)', value: s.latest, sub: s.avg7 != null ? `${improving ? '↓' : '↑'} vs 7-day avg ${s.avg7}` : '', color: improving ? '#3fb39a' : '#d59a3f' },
    s.adherence != null && { label: 'Routine adherence', value: `${s.adherence}%`, sub: 'last 7 days', color: '#7c5cff' },
    { label: 'Tracking streak', value: `${s.streak}d`, sub: s.streak > 0 ? 'keep it going' : 'log something today', color: '#e8788a' },
  ].filter(Boolean);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginTop: 22 }}>
      {tiles.map((t, i) => (
        <div key={i} className="card" style={{ padding: 15 }}>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: '#a59fae', textTransform: 'uppercase', letterSpacing: 0.3 }}>{t.label}</div>
          <div className="display" style={{ fontSize: 28, fontWeight: 600, color: t.color, marginTop: 4, lineHeight: 1 }}>{t.value}</div>
          {t.sub && <div style={{ fontSize: 12, color: '#8a8390', marginTop: 4 }}>{t.sub}</div>}
        </div>
      ))}
    </div>
  );
}
