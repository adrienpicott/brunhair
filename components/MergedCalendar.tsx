// @ts-nocheck
'use client';
import { useEffect, useMemo, useState } from 'react';
import Calendar from './Calendar';
import { buildCalendarData, LAYER_META } from '@/lib/calendarData';

const fmtFull = (k: string) => new Date(k + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

export default function MergedCalendar({ userId, compact = false }: { userId: string; compact?: boolean }) {
  const [monthDate, setMonthDate] = useState(() => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), 1); });
  const [data, setData] = useState<any>({ layers: {}, byDay: {} });
  const [active, setActive] = useState<string[]>(LAYER_META.map((m) => m.key));
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => { if (userId) { setData(await buildCalendarData(userId)); setLoading(false); } })(); }, [userId]);

  const toggle = (k: string) => setActive((a) => (a.includes(k) ? a.filter((x) => x !== k) : [...a, k]));
  const move = (d: number) => setMonthDate((m) => new Date(m.getFullYear(), m.getMonth() + d, 1));
  const layers = useMemo(() => LAYER_META.filter((m) => active.includes(m.key)).map((m) => ({ key: m.key, label: m.label, color: m.color, days: data.layers[m.key] || {} })), [active, data]);
  const day = selected ? data.byDay[selected] : null;

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
        {LAYER_META.map((m) => {
          const on = active.includes(m.key);
          return (
            <button key={m.key} onClick={() => toggle(m.key)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: compact ? '5px 10px' : '7px 12px', borderRadius: 22, cursor: 'pointer', fontSize: compact ? 12 : 13, fontWeight: 600,
              border: on ? `1px solid ${m.color}` : '1px solid #ece6e1', background: on ? '#fff' : '#faf7f5', color: on ? '#3b3447' : '#b8b0c2' }}>
              <span style={{ width: 9, height: 9, borderRadius: 9, background: on ? m.color : '#d8d2dd' }} />
              {m.label}
            </button>
          );
        })}
      </div>

      {loading ? <div className="card" style={{ padding: 36, textAlign: 'center', color: '#a59fae' }}>Loading…</div>
        : <Calendar monthDate={monthDate} onPrev={() => move(-1)} onNext={() => move(1)} layers={layers} selected={selected} onDayClick={(k) => setSelected(k)} compact={compact} />}

      {day && (
        <div className="card" style={{ padding: 14, marginTop: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#211b2e', marginBottom: 9 }}>{fmtFull(selected)}</div>
          {day.period && <Row color="#e8788a" label="Period day" />}
          {day.routines.length > 0 && <Row color="#3fb39a" label={`Routines done: ${day.routines.join(', ')}`} />}
          {day.interventions.length > 0 && <Row color="#7c5cff" label={`Interventions: ${day.interventions.map((i) => `${i.name}${i.time ? ` (${i.time})` : ''}`).join(', ')}`} />}
          {day.shedding != null && <Row color="#d59a3f" label={`Shedding count: ${day.shedding}`} />}
          {day.events.length > 0 && <Row color="#d4564f" label={`Events: ${day.events.map((e) => e.description || e.category).join('; ')}`} />}
          {day.photos.length > 0 && <Row color="#5c8cff" label={`Photos: ${day.photos.length} (${[...new Set(day.photos.map((p) => p.zone))].join(', ')})`} />}
          {!day.period && !day.routines.length && !day.interventions.length && day.shedding == null && !day.events.length && !day.photos.length && <div style={{ color: '#a59fae', fontSize: 13 }}>Nothing logged this day.</div>}
        </div>
      )}
    </div>
  );
}
function Row({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 7 }}>
      <span style={{ width: 8, height: 8, borderRadius: 8, background: color, marginTop: 5, flexShrink: 0 }} />
      <span style={{ fontSize: 13, color: '#4a4453', lineHeight: 1.4 }}>{label}</span>
    </div>
  );
}
