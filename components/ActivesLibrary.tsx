// @ts-nocheck
'use client';
import { useState } from 'react';
const EV: Record<string,string> = { strong:'#3fb39a', moderate:'#5c8cff', limited:'#d59a3f', marketing:'#e8788a', unknown:'#9a8fae' };
const EV_LABEL: Record<string,string> = { strong:'Strong', moderate:'Moderate', limited:'Limited', marketing:'Marketing', unknown:'?' };
const RANK: Record<string,number> = { strong:0, moderate:1, limited:2, marketing:3, unknown:4 };
export default function ActivesLibrary({ actives }: { actives: any[] }) {
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');
  const list = actives
    .filter((a) => filter === 'all' || a.evidence_level === filter)
    .filter((a) => !q || (a.name + ' ' + (a.category || '') + ' ' + (a.notes || '')).toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (RANK[a.evidence_level] - RANK[b.evidence_level]) || a.name.localeCompare(b.name));
  return (
    <div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search actives…"
          style={{ padding: '9px 12px', borderRadius: 10, border: '1px solid #ece6e1', outline: 'none', fontSize: 14, background: '#fff', flex: '1 1 200px' }} />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['all', 'strong', 'moderate', 'limited', 'marketing'].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: '6px 12px', borderRadius: 20, border: '1px solid #ece6e1', fontSize: 12.5, cursor: 'pointer', textTransform: 'capitalize',
                background: filter === f ? '#1a1625' : '#fff', color: filter === f ? '#fff' : '#6b6573' }}>{f}</button>
          ))}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px,1fr))', gap: 12 }}>
        {list.map((a) => (
          <div key={a.id} className="card" style={{ padding: 15 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <div style={{ fontSize: 15, fontWeight: 650, color: '#1a1625' }}>{a.name}</div>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: '#fff', background: EV[a.evidence_level] || EV.unknown, padding: '3px 8px', borderRadius: 20, whiteSpace: 'nowrap' }}>{EV_LABEL[a.evidence_level] || '?'}</span>
            </div>
            <div style={{ fontSize: 11.5, color: '#a59fae', marginTop: 2 }}>{a.category}</div>
            {a.mechanism && <div style={{ fontSize: 12.5, color: '#6b6573', marginTop: 8, lineHeight: 1.45 }}>{a.mechanism}</div>}
            {a.notes && <div style={{ fontSize: 12, color: '#8a8390', marginTop: 6, lineHeight: 1.45, fontStyle: 'italic' }}>{a.notes}</div>}
          </div>
        ))}
        {list.length === 0 && <div style={{ color: '#a59fae', fontSize: 14 }}>No actives match.</div>}
      </div>
    </div>
  );
}
