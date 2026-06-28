// @ts-nocheck
'use client';
import { useMemo } from 'react';

const WD = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const dkey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function buildGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startWd = (first.getDay() + 6) % 7; // Monday = 0
  const start = new Date(year, month, 1 - startWd);
  const days: Date[] = [];
  for (let i = 0; i < 42; i++) days.push(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
  return days;
}

// layers: [{ key, label, color, days: Record<'YYYY-MM-DD', number> }]
export default function Calendar({ monthDate, onPrev, onNext, layers = [], onDayClick, selected, compact = false }) {
  const year = monthDate.getFullYear(), month = monthDate.getMonth();
  const grid = useMemo(() => buildGrid(year, month), [year, month]);
  const todayKey = dkey(new Date());
  const monthLabel = monthDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  const cell = compact ? 38 : 56;

  return (
    <div className="card" style={{ padding: compact ? 12 : 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div className="display" style={{ fontSize: compact ? 15 : 18, fontWeight: 600, color: '#211b2e' }}>{monthLabel}</div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={onPrev} style={navBtn} aria-label="Previous month">‹</button>
          <button onClick={onNext} style={navBtn} aria-label="Next month">›</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {WD.map((w) => <div key={w} style={{ fontSize: 10.5, fontWeight: 700, textAlign: 'center', color: '#b8b0c2', textTransform: 'uppercase', letterSpacing: 0.3 }}>{w[0]}</div>)}
        {grid.map((d, i) => {
          const k = dkey(d);
          const inMonth = d.getMonth() === month;
          const isToday = k === todayKey;
          const isSel = k === selected;
          const present = layers.filter((L) => L.days && L.days[k] != null);
          return (
            <button key={i} onClick={() => onDayClick && onDayClick(k, d)} style={{
              minHeight: cell, border: 'none', borderRadius: 10, cursor: onDayClick ? 'pointer' : 'default',
              background: isSel ? '#f1ecff' : isToday ? '#fbfaff' : 'transparent',
              boxShadow: isSel ? 'inset 0 0 0 1.5px #7c5cff' : isToday ? 'inset 0 0 0 1px #e0d7ff' : 'none',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '5px 2px', gap: 3,
            }}>
              <span style={{ fontSize: compact ? 12 : 13, fontWeight: isToday ? 700 : 500, color: inMonth ? (isToday ? '#7c5cff' : '#3b3447') : '#cfc8d6' }}>{d.getDate()}</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center', maxWidth: cell - 6 }}>
                {present.slice(0, 5).map((L) => (
                  <span key={L.key} title={L.label} style={{ width: 6, height: 6, borderRadius: 6, background: L.color }} />
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
const navBtn: React.CSSProperties = { width: 30, height: 30, borderRadius: 8, border: '1px solid #ece6e1', background: '#fff', cursor: 'pointer', fontSize: 16, color: '#6b6573', lineHeight: 1 };
