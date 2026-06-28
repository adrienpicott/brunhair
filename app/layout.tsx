// @ts-nocheck
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
export const metadata = { title: 'Brunair — Hair Lab', description: 'Your personal hair lab.' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body><AuthProvider>{children}</AuthProvider></body></html>);
}
