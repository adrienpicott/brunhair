// @ts-nocheck
'use client';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import { getLibrarySignals, recommend } from '@/lib/library';

const EV: Record<string, string> = { strong: '#3fb39a', moderate: '#5c8cff', limited: '#d59a3f', marketing: '#e8788a', unknown: '#9a8fae' };
const EV_LABEL: Record<string, string> = { strong: 'Strong evidence', moderate: 'Moderate', limited: 'Limited', marketing: 'Marketing', unknown: '—' };
const RANK: Record<string, number> = { strong: 0, moderate: 1, limited: 2, marketing: 3, unknown: 4 };

function ArticleCard({ a, expanded, onToggle }: any) {
  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
        <div style={{ fontSize: 14.5, fontWeight: 650, color: '#211b2e', lineHeight: 1.3 }}>{a.title}</div>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', background: EV[a.evidence_level] || EV.unknown, padding: '3px 8px', borderRadius: 20, whiteSpace: 'nowrap' }}>{EV_LABEL[a.evidence_level] || '—'}</span>
      </div>
      <div style={{ fontSize: 11.5, color: '#a59fae', marginTop: 3 }}>{a.category}</div>
      <div style={{ fontSize: 13, color: '#5a5364', marginTop: 9, lineHeight: 1.5 }}>{expanded ? a.body : (a.body || '').slice(0, 150) + ((a.body || '').length > 150 ? '…' : '')}</div>
      {a.source_url && expanded && <a href={a.source_url} target="_blank" rel="noreferrer" style={{ fontSize: 12.5, color: '#7c5cff', display: 'inline-block', marginTop: 8 }}>Source ↗</a>}
      {(a.body || '').length > 150 && <button onClick={onToggle} style={{ marginTop: 9, fontSize: 12.5, fontWeight: 600, color: '#7c5cff', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>{expanded ? 'Show less' : 'Read more'}</button>}
    </div>
  );
}

export default function LibraryPage() {
  const { userId } = useAuth();
  const [articles, setArticles] = useState<any[]>([]);
  const [sig, setSig] = useState<any>({ tags: [], actions: [] });
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [open, setOpen] = useState<Record<string, boolean>>({});

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('knowledge_articles').select('*');
      const list = (data || []).sort((a, b) => (RANK[a.evidence_level] - RANK[b.evidence_level]) || a.title.localeCompare(b.title));
      setArticles(list);
      if (userId) setSig(await getLibrarySignals(userId));
      setLoading(false);
    })();
  }, [userId]);

  const toggle = (id: string) => setOpen((o) => ({ ...o, [id]: !o[id] }));
  const cats = useMemo(() => ['all', ...Array.from(new Set(articles.map((a) => a.category).filter(Boolean)))], [articles]);
  const reco = useMemo(() => recommend(articles, sig.tags).slice(0, 4), [articles, sig]);
  const browse = useMemo(() => articles
    .filter((a) => cat === 'all' || a.category === cat)
    .filter((a) => !q || (a.title + ' ' + (a.body || '') + ' ' + (a.category || '')).toLowerCase().includes(q.toLowerCase())), [articles, cat, q]);

  return (
    <div>
      <div className="display" style={{ fontSize: 26, fontWeight: 600, color: '#211b2e' }}>Science Library</div>
      <div style={{ fontSize: 14, color: '#8a8390', marginTop: 5, maxWidth: 640 }}>What actually moves the needle on hair — with honest evidence levels. The top section is tailored to your own data; below is the full reference shelf.</div>

      {/* FOR YOU */}
      <div style={{ fontSize: 15, fontWeight: 700, color: '#211b2e', marginTop: 26 }}>For you</div>
      {loading ? <div style={{ color: '#a59fae', fontSize: 14, marginTop: 12 }}>Loading…</div> : (
        <div style={{ marginTop: 12 }}>
          {sig.actions.length === 0 && reco.length === 0 ? (
            <div className="card" style={{ padding: 18, color: '#8a8390', fontSize: 13.5, lineHeight: 1.5 }}>Once you log a blood panel or a few shedding counts, personalized guidance and the most relevant articles will appear here.</div>
          ) : (
            <>
              {sig.actions.map((ac: any, i: number) => (
                <div key={i} className="card" style={{ padding: 15, marginBottom: 10, borderLeft: `3px solid ${ac.tone === 'high' ? '#d4564f' : '#d59a3f'}` }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: '#211b2e' }}>{ac.title}</div>
                  <div style={{ fontSize: 13, color: '#5a5364', marginTop: 5, lineHeight: 1.5 }}>{ac.text}</div>
                </div>
              ))}
              {reco.length > 0 && (
                <>
                  <div style={{ fontSize: 12.5, color: '#a59fae', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3, margin: '16px 0 10px' }}>Relevant to your data</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                    {reco.map((a) => <ArticleCard key={a.id} a={a} expanded={!!open[a.id]} onToggle={() => toggle(a.id)} />)}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* BROWSE */}
      <div style={{ fontSize: 15, fontWeight: 700, color: '#211b2e', marginTop: 30 }}>Browse the science</div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', margin: '12px 0 14px' }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search articles…" style={{ padding: '9px 12px', borderRadius: 10, border: '1px solid #ece6e1', outline: 'none', fontSize: 14, background: '#fff', flex: '1 1 200px' }} />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {cats.map((c) => (
            <button key={c} onClick={() => setCat(c)} style={{ padding: '6px 12px', borderRadius: 20, border: '1px solid #ece6e1', fontSize: 12.5, cursor: 'pointer', textTransform: 'capitalize',
              background: cat === c ? '#1a1625' : '#fff', color: cat === c ? '#fff' : '#6b6573' }}>{c}</button>
          ))}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
        {browse.map((a) => <ArticleCard key={a.id} a={a} expanded={!!open[a.id]} onToggle={() => toggle(a.id)} />)}
        {!loading && browse.length === 0 && <div style={{ color: '#a59fae', fontSize: 14 }}>No articles match.</div>}
      </div>

      <div style={{ fontSize: 11.5, color: '#b8b0c2', marginTop: 22, maxWidth: 640, lineHeight: 1.5 }}>This library is general education, not medical advice. Anything flagged in your data is a prompt to talk with a qualified clinician — not a diagnosis.</div>
    </div>
  );
}
