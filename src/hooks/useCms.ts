import { useEffect, useState } from 'react';
import { fetchGallery, fetchNews, fetchSiteSettings } from '../services/cmsService';
import { getDefaultGallery, getDefaultNews, getDefaultSiteSettings } from '../data/cmsDefaults';
import type { GalleryItem, NewsItem, SiteSettings } from '../types/cms';

function withLocalIds<T extends { id?: string }>(items: Omit<T, 'id'>[], prefix: string): (T & { id: string })[] {
  return items.map((item, i) => ({ ...item, id: `${prefix}-${i}` })) as (T & { id: string })[];
}

/** Built-in images live under /gallery or /news — keep them local; only ImgBB (or other remote) extras come from Firebase. */
function isBuiltInAsset(url: string): boolean {
  const path = url.replace(/\\/g, '/');
  if (/\/gallery\/p\d+\.jpe?g(\?|$)/i.test(path) || /\/news\/gn\d+\.jpe?g(\?|$)/i.test(path)) {
    return true;
  }
  if (path.startsWith('http')) return false;
  return path.includes('gallery/p') || path.includes('news/gn');
}

function mergeGallery(remote: GalleryItem[]): GalleryItem[] {
  const defaults = withLocalIds<GalleryItem>(getDefaultGallery(), 'local-gallery');
  const extras = remote
    .filter((item) => !isBuiltInAsset(item.image))
    .sort((a, b) => {
      const byOrder = (a.order ?? 0) - (b.order ?? 0);
      if (byOrder !== 0) return byOrder;
      return (b.createdAt ?? 0) - (a.createdAt ?? 0);
    });
  // Admin-added photos first (Order 1 = top), then original campus photos
  return [...extras, ...defaults];
}

function mergeNews(remote: NewsItem[]): NewsItem[] {
  const defaults = withLocalIds<NewsItem>(getDefaultNews(), 'local-news');
  // New Firebase items first (lower order), then existing notices — or append after defaults
  const extras = remote
    .filter((item) => !isBuiltInAsset(item.image))
    .sort((a, b) => a.order - b.order);
  // Newest admin-added news on top, original notices keep their relative order below
  return [...extras, ...defaults];
}

export function useGallery() {
  const [items, setItems] = useState<GalleryItem[]>(() => mergeGallery([]));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchGallery();
        if (cancelled) return;
        setItems(mergeGallery(data));
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'Failed to load gallery');
        setItems(mergeGallery([]));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { items, loading, error };
}

export function useNews() {
  const [items, setItems] = useState<NewsItem[]>(() => mergeNews([]));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchNews();
        if (cancelled) return;
        setItems(mergeNews(data));
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'Failed to load news');
        setItems(mergeNews([]));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { items, loading, error };
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(getDefaultSiteSettings());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchSiteSettings();
        if (cancelled) return;
        if (data) setSettings({ ...getDefaultSiteSettings(), ...data });
      } catch {
        /* keep defaults */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { settings, loading };
}
