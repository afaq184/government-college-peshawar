import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  getDoc,
  query,
  orderBy,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { GalleryItem, NewsItem, SiteSettings } from '../types/cms';

const GALLERY = 'gallery';
const NEWS = 'news';
const SETTINGS = 'settings';
const SITE_DOC = 'site';

function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as T;
}

/* ─── Gallery ─── */

export async function fetchGallery(): Promise<GalleryItem[]> {
  const q = query(collection(db, GALLERY), orderBy('order', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<GalleryItem, 'id'>) }));
}

export async function addGalleryItem(item: Omit<GalleryItem, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, GALLERY), stripUndefined({ ...item, createdAt: Date.now() }));
  return ref.id;
}

export async function updateGalleryItem(id: string, data: Partial<Omit<GalleryItem, 'id'>>): Promise<void> {
  await updateDoc(doc(db, GALLERY, id), stripUndefined(data as Record<string, unknown>));
}

export async function deleteGalleryItem(id: string): Promise<void> {
  await deleteDoc(doc(db, GALLERY, id));
}

export async function seedGallery(items: Omit<GalleryItem, 'id'>[]): Promise<number> {
  const existing = await getDocs(collection(db, GALLERY));
  if (!existing.empty) return 0;

  const batch = writeBatch(db);
  items.forEach((item) => {
    const ref = doc(collection(db, GALLERY));
    batch.set(ref, { ...item, createdAt: Date.now() });
  });
  await batch.commit();
  return items.length;
}

/* ─── News ─── */

export async function fetchNews(): Promise<NewsItem[]> {
  const q = query(collection(db, NEWS), orderBy('order', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<NewsItem, 'id'>) }));
}

export async function addNewsItem(item: Omit<NewsItem, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, NEWS), stripUndefined({ ...item, createdAt: Date.now() }));
  return ref.id;
}

export async function updateNewsItem(id: string, data: Partial<Omit<NewsItem, 'id'>>): Promise<void> {
  await updateDoc(doc(db, NEWS, id), stripUndefined(data as Record<string, unknown>));
}

export async function deleteNewsItem(id: string): Promise<void> {
  await deleteDoc(doc(db, NEWS, id));
}

export async function seedNews(items: Omit<NewsItem, 'id'>[]): Promise<number> {
  const existing = await getDocs(collection(db, NEWS));
  if (!existing.empty) return 0;

  const batch = writeBatch(db);
  items.forEach((item) => {
    const ref = doc(collection(db, NEWS));
    batch.set(ref, { ...item, createdAt: Date.now() });
  });
  await batch.commit();
  return items.length;
}

/* ─── Site settings ─── */

export async function fetchSiteSettings(): Promise<SiteSettings | null> {
  const snap = await getDoc(doc(db, SETTINGS, SITE_DOC));
  if (!snap.exists()) return null;
  return snap.data() as SiteSettings;
}

export async function saveSiteSettings(data: SiteSettings): Promise<void> {
  await setDoc(doc(db, SETTINGS, SITE_DOC), stripUndefined(data as unknown as Record<string, unknown>), {
    merge: true,
  });
}
