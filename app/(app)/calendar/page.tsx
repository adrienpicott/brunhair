// @ts-nocheck
'use client';
import { useAuth } from '@/components/AuthProvider';
import MergedCalendar from '@/components/MergedCalendar';

export default function CalendarPage() {
  const { userId } = useAuth();
  return (
    <div>
      <div className="display" style={{ fontSize: 26, fontWeight: 600, color: '#211b2e' }}>Calendar</div>
      <div style={{ fontSize: 14, color: '#8a8390', marginTop: 5, maxWidth: 620 }}>Everything on one timeline. Toggle the layers you want to see, and tap any day for the details.</div>
      <div style={{ marginTop: 18 }}><MergedCalendar userId={userId} /></div>
    </div>
  );
}
