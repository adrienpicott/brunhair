// @ts-nocheck
'use client';
import { useMemo, useState } from 'react';
import Calendar from './Calendar';

const fmtFull = (k: string) => new Date(k + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

export function ViewToggle({ view, setView }: { view: string; setView: (v: string) => void }) {
  return (
    <div style={{ display: 'inline-flex', background: '#f3eef4', borderRadius: 10, padding: 3 }}>
      {['list', 'calendar'].map((v) => (
        <button key={v} onClick={() => setView(v)} style={{ padding: '5px 13px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: 600, textTransform: 'capitalize',
          background: view === v ? '#fff' : 'transparent', color: view === v ? '#7c5cff' : '#8a8390', boxShadow: view === v ? '0 1px 2px rgba(33,27,46,0.08)' : 'none' }}>{v}</button>
      ))}
    </div>
  );
}

export default function DataCalendar({ rows, dateField, color, label, renderDay }: any) {
  const [monthDate, setMonthDate] = useState(() => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), 1); });
  const [selected, setSelected] = useState<string | null>(null);
  const { days, byDay } = useMemo(() => {
    const days: Record<string, number> = {}; const byDay: Record<string, any[]> = {};
    (rows || []).forEach((r: any) => { const k = r[dateField]; if (!k) return; days[k] = (days[k] || 0) + 1; (byDay[k] ||= []).push(r); });
    return { days, byDay };
  }, [rows, dateField]);
  const move = (d: number) => setMonthDate((m) => new Date(m.getFullYear(), m.getMonth() + d, 1));

  return (
    <div style={{ marginTop: 14 }}>
      <Calendar monthDate={monthDate} onPrev={() => move(-1)} onNext={() => move(1)} layers={[{ key: 'x', label, color, days }]} selected={selected} onDayClick={(k) => setSelected(k)} />
      {selected && (
        <div className="card" style={{ padding: 14, marginTop: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#211b2e', marginBottom: 8 }}>{fmtFull(selected)}</div>
          {byDay[selected] ? <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>{renderDay(byDay[selected])}</div> : <div style={{ color: '#a59fae', fontSize: 13 }}>Nothing this day.</div>}
        </div>
      )}
    </div>
  );
}
