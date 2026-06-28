// @ts-nocheck
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const today = () => new Date().toISOString().slice(0, 10);
const timeOfDay = () => { const h = new Date().getHours(); return h < 12 ? 'morning' : h < 18 ? 'midday' : 'evening'; };

export default function TodayPanel({ userId }: { userId: string }) {
  const [routines, setRoutines] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [shed, setShed] = useState('');
  const [prodId, setProdId] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [periodDone, setPeriodDone] = useState(false);

  async function load() {
    if (!userId) return;
    const [rt, rl, pr, ce] = await Promise.all([
      supabase.from('routines').select('id,name,in_use'),
      supabase.from('routine_logs').select('*').eq('log_date', today()),
      supabase.from('products').select('id,name,in_use').order('name'),
      supabase.from('cycle_events').select('id,type,log_date').eq('log_date', today()).eq('type', 'period_start'),
    ]);
    setRoutines((rt.data || []).filter((r) => r.in_use));
    setLogs(rl.data || []);
    setProducts((pr.data || []).filter((p) => p.in_use));
    setPeriodDone((ce.data || []).length > 0);
  }
  useEffect(() => { load(); }, [userId]);
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(null), 1800); };

  const doneFor = (rid: string) => logs.find((l) => l.routine_id === rid && l.completed);
  async function toggleRoutine(r: any) {
    const ex = doneFor(r.id);
    if (ex) { await supabase.from('routine_logs').delete().eq('id', ex.id); setLogs((a) => a.filter((x) => x.id !== ex.id)); }
    else { const { data } = await supabase.from('routine_logs').insert({ user_id: userId, routine_id: r.id, log_date: today(), completed: true }).select(); if (data) setLogs((a) => [...a, data[0]]); }
  }
  async function logShed() {
    if (shed === '') return;
    await supabase.from('shedding_counts').insert({ user_id: userId, log_date: today(), method: '60s_count', count: Math.round(Number(shed)) });
    setShed(''); flash('Shedding logged ✓');
  }
  async function logApplied() {
    if (!prodId) return;
    await supabase.from('interventions').insert({ user_id: userId, product_id: prodId, log_date: today(), time_of_day: timeOfDay() });
    setProdId(''); flash('Applied logged ✓');
  }
  async function logPeriod() {
    await supabase.from('cycle_events').insert({ user_id: userId, log_date: today(), type: 'period_start', flow: 'medium' });
    setPeriodDone(true); flash('Period start logged ✓');
  }

  return (
    <div className="card" style={{ padding: 18, marginTop: 20, background: 'linear-gradient(180deg, #fbfaff, #ffffff)' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#211b2e' }}>Today</div>
        {msg && <span style={{ fontSize: 12.5, color: '#3fb39a', fontWeight: 600 }}>{msg}</span>}
      </div>

      {routines.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 12, color: '#8a8390', marginBottom: 6 }}>Routines</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {routines.map((r) => { const done = !!doneFor(r.id); return (
              <button key={r.id} onClick={() => toggleRoutine(r)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 13px', borderRadius: 22, cursor: 'pointer', fontSize: 13, fontWeight: 600,
                border: done ? '1px solid #3fb39a' : '1px solid #ece6e1', background: done ? '#e6f5f1' : '#fff', color: done ? '#2f8a76' : '#6b6573' }}>
                <span style={{ width: 16, height: 16, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#fff', background: done ? '#3fb39a' : '#d8d2dd' }}>{done ? '✓' : ''}</span>{r.name}
              </button>); })}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 14, alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontSize: 12, color: '#8a8390', marginBottom: 6 }}>Shedding count</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <input value={shed} onChange={(e) => setShed(e.target.value)} inputMode="numeric" placeholder="e.g. 70" style={{ ...inp, width: 90 }} />
            <button onClick={logShed} style={mini}>Log</button>
          </div>
        </div>
        {products.length > 0 && (
          <div>
            <div style={{ fontSize: 12, color: '#8a8390', marginBottom: 6 }}>Applied a product</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <select value={prodId} onChange={(e) => setProdId(e.target.value)} style={{ ...inp, maxWidth: 180 }}>
                <option value="">choose…</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <button onClick={logApplied} style={mini}>Log</button>
            </div>
          </div>
        )}
        <div>
          <div style={{ fontSize: 12, color: '#8a8390', marginBottom: 6 }}>Cycle</div>
          <button onClick={logPeriod} disabled={periodDone} style={{ ...mini, background: periodDone ? '#f3eef4' : '#fff', color: periodDone ? '#b8b0c2' : '#c3556a', borderColor: periodDone ? '#ece6e1' : '#f3c3cd', cursor: periodDone ? 'default' : 'pointer' }}>
            {periodDone ? 'Period logged' : 'Period started'}
          </button>
        </div>
      </div>
    </div>
  );
}
const inp: React.CSSProperties = { padding: '8px 11px', borderRadius: 10, border: '1px solid #ece6e1', outline: 'none', fontSize: 14, background: '#fff', color: '#1a1625' };
const mini: React.CSSProperties = { padding: '8px 14px', borderRadius: 10, border: '1px solid #ece6e1', background: '#7c5cff', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' };
