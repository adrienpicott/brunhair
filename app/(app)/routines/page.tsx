// @ts-nocheck
'use client';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import TodayAdherence from '@/components/TodayAdherence';

const FREQS = ['daily', 'every 2 days', '2x / week', 'weekly', 'as needed'];

export default function RoutinesPage() {
  const { userId } = useAuth();
  const [routines, setRoutines] = useState<any[]>([]);
  const [steps, setSteps] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [notes, setNotes] = useState('');

  // per-routine add-step inputs
  const [stepProduct, setStepProduct] = useState<Record<string, string>>({});
  const [stepText, setStepText] = useState<Record<string, string>>({});

  async function load() {
    if (!userId) return;
    setLoading(true);
    const [rt, st, pr] = await Promise.all([
      supabase.from('routines').select('*').order('created_at', { ascending: false }),
      supabase.from('routine_steps').select('*').order('ordre'),
      supabase.from('products').select('id,name').order('name'),
    ]);
    setRoutines(rt.data || []); setSteps(st.data || []); setProducts(pr.data || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, [userId]);

  const productMap = useMemo(() => Object.fromEntries(products.map((p) => [p.id, p])), [products]);
  const stepsOf = (rid: string) => steps.filter((s) => s.routine_id === rid).sort((a, b) => a.ordre - b.ordre);

  async function addRoutine() {
    if (!name.trim()) { setErr('Name is required.'); return; }
    setBusy(true); setErr(null);
    const { error } = await supabase.from('routines').insert({ user_id: userId, name: name.trim(), frequency, notes: notes.trim() || null, in_use: true });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    setName(''); setNotes(''); setFrequency('daily'); load();
  }
  async function deleteRoutine(id: string) {
    if (!confirm('Delete this routine and its steps?')) return;
    const { error } = await supabase.from('routines').delete().eq('id', id);
    if (!error) { setRoutines((r) => r.filter((x) => x.id !== id)); setSteps((s) => s.filter((x) => x.routine_id !== id)); }
  }
  async function toggleInUse(r: any) {
    const { error } = await supabase.from('routines').update({ in_use: !r.in_use }).eq('id', r.id);
    if (!error) setRoutines((arr) => arr.map((x) => (x.id === r.id ? { ...x, in_use: !x.in_use } : x)));
  }
  async function addStep(rid: string) {
    const pid = stepProduct[rid] || '';
    const txt = (stepText[rid] || '').trim();
    if (!pid && !txt) { setErr('Add a product or a step instruction.'); return; }
    const ordre = (stepsOf(rid).slice(-1)[0]?.ordre || 0) + 1;
    const { error } = await supabase.from('routine_steps').insert({ routine_id: rid, ordre, product_id: pid || null, instruction: txt || null });
    if (error) { setErr(error.message); return; }
    setStepProduct((m) => ({ ...m, [rid]: '' })); setStepText((m) => ({ ...m, [rid]: '' }));
    const { data } = await supabase.from('routine_steps').select('*').order('ordre');
    setSteps(data || []);
  }
  async function removeStep(id: string) {
    const { error } = await supabase.from('routine_steps').delete().eq('id', id);
    if (!error) setSteps((s) => s.filter((x) => x.id !== id));
  }

  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 700, color: '#1a1625' }}>Routines</div>
      <div style={{ fontSize: 14, color: '#8a8390', marginTop: 5, maxWidth: 620 }}>Build a named routine, then add ordered steps — each step can point to a product from your shelf or just be a written instruction.</div>

      <div className="card" style={{ padding: 18, marginTop: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 650, color: '#1a1625', marginBottom: 12 }}>New routine</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name (e.g. Morning routine) *" style={{ ...inp, flex: '2 1 220px' }} />
          <select value={frequency} onChange={(e) => setFrequency(e.target.value)} style={{ ...inp, flex: '1 1 150px' }}>
            {FREQS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
          <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes (optional)" style={{ ...inp, flex: '2 1 200px' }} />
          <button onClick={addRoutine} disabled={busy} style={{ ...btn, opacity: busy ? 0.6 : 1 }}>{busy ? 'Creating…' : 'Create'}</button>
        </div>
        {err && <div style={{ color: '#e8788a', fontSize: 13, marginTop: 10 }}>{err}</div>}
      </div>

      <TodayAdherence routines={routines.filter((r) => r.in_use)} userId={userId} />

      <div style={{ fontSize: 15, fontWeight: 650, color: '#1a1625', marginTop: 26 }}>My routines</div>
      {loading ? (<div style={{ color: '#a59fae', fontSize: 14, marginTop: 16 }}>Loading…</div>)
      : routines.length === 0 ? (<div className="card" style={{ padding: 24, marginTop: 12, textAlign: 'center', color: '#a59fae', fontSize: 14 }}>No routines yet. Create your first one above.</div>)
      : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14, marginTop: 14 }}>
          {routines.map((r, i) => {
            const ss = stepsOf(r.id);
            return (
              <motion.div key={r.id} className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: i * 0.03 }}
                style={{ padding: 16, opacity: r.in_use ? 1 : 0.6 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ fontSize: 15.5, fontWeight: 650, color: '#1a1625' }}>{r.name}</div>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: '#3fb39a', background: '#e6f5f1', padding: '3px 8px', borderRadius: 20 }}>{r.frequency}</span>
                </div>
                {r.notes && <div style={{ fontSize: 12.5, color: '#8a8390', marginTop: 4 }}>{r.notes}</div>}

                <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {ss.map((s) => (
                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#4a4453' }}>
                      <span style={{ width: 18, height: 18, borderRadius: 18, background: '#f1ecff', color: '#7c5cff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{s.ordre}</span>
                      <span style={{ flex: 1, minWidth: 0 }}>{s.product_id ? (productMap[s.product_id]?.name || 'Product') : ''}{s.product_id && s.instruction ? ' — ' : ''}{s.instruction || ''}</span>
                      <span onClick={() => removeStep(s.id)} style={{ cursor: 'pointer', color: '#c3779a', fontWeight: 700 }}>×</span>
                    </div>
                  ))}
                  {ss.length === 0 && <div style={{ fontSize: 12.5, color: '#c3bdca' }}>No steps yet.</div>}
                </div>

                <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap', background: '#faf7f5', padding: 8, borderRadius: 10 }}>
                  <select value={stepProduct[r.id] || ''} onChange={(e) => setStepProduct((m) => ({ ...m, [r.id]: e.target.value }))} style={{ ...inp, flex: '1 1 110px', padding: '7px 9px' }}>
                    <option value="">product…</option>
                    {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <input value={stepText[r.id] || ''} onChange={(e) => setStepText((m) => ({ ...m, [r.id]: e.target.value }))} placeholder="or instruction" style={{ ...inp, flex: '2 1 120px', padding: '7px 9px' }} />
                  <button onClick={() => addStep(r.id)} style={{ ...miniBtn, background: '#7c5cff', color: '#fff', border: 'none' }}>+ Step</button>
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button onClick={() => toggleInUse(r)} style={miniBtn}>{r.in_use ? 'Pause' : 'Resume'}</button>
                  <button onClick={() => deleteRoutine(r.id)} style={{ ...miniBtn, color: '#e8788a', borderColor: '#f6d6db' }}>Delete</button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
const inp: React.CSSProperties = { padding: '10px 12px', borderRadius: 10, border: '1px solid #ece6e1', outline: 'none', fontSize: 14, background: '#fff', color: '#1a1625' };
const btn: React.CSSProperties = { padding: '10px 18px', borderRadius: 10, border: 'none', background: '#7c5cff', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' };
const miniBtn: React.CSSProperties = { padding: '6px 12px', borderRadius: 8, border: '1px solid #ece6e1', background: '#faf7f5', fontSize: 12.5, cursor: 'pointer', color: '#6b6573' };
