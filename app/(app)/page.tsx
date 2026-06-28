// @ts-nocheck
'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/AuthProvider';
import HomeStats from '@/components/HomeStats';
import TodayPanel from '@/components/TodayPanel';
import MergedCalendar from '@/components/MergedCalendar';

const MODULES = [
  { href: '/calendar', icon: '📅', title: 'Calendar', desc: 'Everything on one timeline', ready: true },
  { href: '/products', icon: '🧴', title: 'Products & Actives', desc: 'Your shelf, by active ingredient', ready: true },
  { href: '/interventions', icon: '🗓️', title: 'Interventions', desc: 'What you applied, and when', ready: true },
  { href: '/routines', icon: '🔁', title: 'Routines', desc: 'Steps & adherence tracking', ready: true },
  { href: '/cycle', icon: '🌙', title: 'Cycle', desc: 'Period & hormonal markers', ready: true },
  { href: '/blood', icon: '🩸', title: 'Blood Panels', desc: 'Ferritin, thyroid, hormones…', ready: true },
  { href: '/photos', icon: '📸', title: 'Photos', desc: 'Constant-condition tracking', ready: true },
  { href: '/nutrition', icon: '🥗', title: 'Nutrition', desc: 'Key hair nutrients (from MFP)', ready: true },
  { href: '/biometrics', icon: '⌚', title: 'Biometrics', desc: 'Sleep, stress, HR', ready: true },
  { href: '/events', icon: '⚡', title: 'Events', desc: 'Triggers (illness, stress, diet…)', ready: true },
  { href: '/shedding', icon: '🧮', title: 'Shedding count', desc: 'Quantified daily shedding', ready: true },
  { href: '/lab', icon: '🔬', title: 'AL Analyst', desc: 'Compile your data dossier', ready: true },
  { href: '/library', icon: '📚', title: 'Science Library', desc: 'Evidence & what actually works', ready: false },
];

export default function Home() {
  const { userId } = useAuth();
  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#b6a7d6' }}>Personal hair lab</div>
        <div className="display" style={{ fontSize: 34, fontWeight: 600, color: '#211b2e', marginTop: 6, letterSpacing: '-0.02em', lineHeight: 1.1 }}>Welcome back.</div>
        <div style={{ fontSize: 14.5, color: '#8a8390', marginTop: 8, maxWidth: 540, lineHeight: 1.5 }}>A few taps a day is all it takes. Log on the go, dig deeper on the weekend, and watch the patterns appear.</div>
      </motion.div>

      <HomeStats userId={userId} />
      <TodayPanel userId={userId} />

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 30 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#211b2e' }}>This month at a glance</div>
        <Link href="/calendar" style={{ fontSize: 13, fontWeight: 600, color: '#7c5cff' }}>Open calendar →</Link>
      </div>
      <div style={{ marginTop: 12 }}><MergedCalendar userId={userId} compact /></div>

      <div style={{ fontSize: 15, fontWeight: 700, color: '#211b2e', marginTop: 32 }}>Explore</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14, marginTop: 12 }}>
        {MODULES.map((m, i) => {
          const card = (
            <motion.div className="card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.03 }}
              style={{ padding: 18, position: 'relative', height: '100%', cursor: m.ready ? 'pointer' : 'default' }}>
              <div style={{ fontSize: 26 }}>{m.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 650, color: '#211b2e', marginTop: 8 }}>{m.title}</div>
              <div style={{ fontSize: 12.5, color: '#8a8390', marginTop: 3, lineHeight: 1.45 }}>{m.desc}</div>
              {!m.ready && (<span style={{ position: 'absolute', top: 14, right: 14, fontSize: 10.5, fontWeight: 600, color: '#7c5cff', background: '#f1ecff', padding: '3px 8px', borderRadius: 20 }}>SOON</span>)}
              {m.ready && (<span style={{ position: 'absolute', bottom: 13, right: 16, fontSize: 16, color: '#7c5cff' }}>→</span>)}
            </motion.div>
          );
          return m.ready ? <Link key={m.href} href={m.href} style={{ display: 'block' }}>{card}</Link> : <div key={m.href}>{card}</div>;
        })}
      </div>
    </div>
  );
}
