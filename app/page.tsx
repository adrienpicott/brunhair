// @ts-nocheck
'use client';
import { motion } from 'framer-motion';
import AuthGate from '@/components/AuthGate';
import NavBar from '@/components/NavBar';
const MODULES = [
  { key: 'products', icon: '🧴', title: 'Products & Actives', desc: 'Your shelf, by active ingredient', soon: true },
  { key: 'interventions', icon: '🗓️', title: 'Interventions', desc: 'What you applied, and when', soon: true },
  { key: 'routines', icon: '🔁', title: 'Routines', desc: 'Steps & adherence tracking', soon: true },
  { key: 'cycle', icon: '🌙', title: 'Cycle', desc: 'Period & hormonal markers', soon: true },
  { key: 'medical', icon: '🩸', title: 'Blood Panels', desc: 'Ferritin, thyroid, hormones…', soon: true },
  { key: 'photos', icon: '📸', title: 'Photos', desc: 'Constant-condition tracking', soon: true },
  { key: 'nutrition', icon: '🥗', title: 'Nutrition', desc: 'Key hair nutrients (from MFP)', soon: true },
  { key: 'biometrics', icon: '⌚', title: 'Biometrics', desc: 'Sleep, stress, HR', soon: true },
  { key: 'library', icon: '📚', title: 'Science Library', desc: 'Evidence & what actually works', soon: true },
  { key: 'lab', icon: '🔬', title: 'AL Analyst', desc: 'Your data analyst (later)', soon: true },
];
export default function Home() {
  return (
    <AuthGate>
      <NavBar />
      <div style={{ maxWidth: 1040, margin: '0 auto', padding: '32px 22px' }}>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#1a1625' }}>Welcome to your hair lab</div>
          <div style={{ fontSize: 14, color: '#8a8390', marginTop: 6, maxWidth: 560 }}>Log what you do, capture the conditions, and let the data reveal what actually moves the needle. This is a tracking tool — not a medical diagnosis.</div>
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 16, marginTop: 28 }}>
          {MODULES.map((m, i) => (
            <motion.div key={m.key} className="card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.04 }} style={{ padding: 18, position: 'relative' }}>
              <div style={{ fontSize: 26 }}>{m.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 650, color: '#1a1625', marginTop: 8 }}>{m.title}</div>
              <div style={{ fontSize: 12.5, color: '#8a8390', marginTop: 3, lineHeight: 1.45 }}>{m.desc}</div>
              {m.soon && (<span style={{ position: 'absolute', top: 14, right: 14, fontSize: 10.5, fontWeight: 600, color: '#7c5cff', background: '#f1ecff', padding: '3px 8px', borderRadius: 20 }}>SOON</span>)}
            </motion.div>
          ))}
        </div>
      </div>
    </AuthGate>
  );
}
