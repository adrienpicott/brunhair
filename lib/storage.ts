'use client';
import { supabase } from './supabase';
const BUCKET = 'media';
export async function uploadMedia(uid: string, folder: 'photos' | 'nutrition' | 'biometrics' | 'medical', file: File): Promise<string | null> {
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${uid}/${folder}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false });
  if (error) { console.error('upload error', error.message); return null; }
  return path;
}
export async function signedUrl(path: string, expiresInSec = 3600): Promise<string | null> {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, expiresInSec);
  if (error) { console.error('signed url error', error.message); return null; }
  return data.signedUrl;
}
export async function deleteMedia(path: string): Promise<boolean> {
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) { console.error('delete error', error.message); return false; }
  return true;
}
