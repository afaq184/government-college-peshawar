import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

export type ImgBBUploadResult = {
  url: string;
  displayUrl: string;
  deleteUrl?: string;
};

const IMGBB_API_KEY =
  import.meta.env.VITE_IMGBB_API_KEY || '0bacc9c8168f64f79577d06336f14714';

function fileExt(file: File): string {
  const fromName = file.name.split('.').pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]{2,5}$/.test(fromName)) return fromName;
  if (file.type === 'image/jpeg') return 'jpg';
  if (file.type === 'image/png') return 'png';
  if (file.type === 'image/webp') return 'webp';
  return 'jpg';
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      reject(new Error(`${label} timed out after ${Math.round(ms / 1000)}s`));
    }, ms);
    promise.then(
      (value) => {
        window.clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        window.clearTimeout(timer);
        reject(err);
      },
    );
  });
}

/** Shrink large photos before upload (faster + under serverless body limits). */
async function prepareImageFile(file: File): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/gif') return file;
  if (file.size < 900_000) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const maxEdge = 1400;
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.85),
    );
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' });
  } catch {
    return file;
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      if (!base64) reject(new Error('Could not read image'));
      else resolve(base64);
    };
    reader.onerror = () => reject(new Error('Could not read image'));
    reader.readAsDataURL(file);
  });
}

/** Direct ImgBB upload from the browser (fast path). */
async function uploadDirectToImgBB(file: File): Promise<ImgBBUploadResult> {
  const image = await fileToBase64(file);
  const form = new FormData();
  form.append('key', IMGBB_API_KEY);
  form.append('image', image);
  form.append('name', file.name.replace(/\.[^.]+$/, '') || 'upload');

  const res = await fetch('https://api.imgbb.com/1/upload', {
    method: 'POST',
    body: form,
  });
  const json = await res.json();
  if (!res.ok || !json?.success || !json?.data?.url) {
    throw new Error(json?.error?.message || `ImgBB ${res.status}`);
  }
  return {
    url: json.data.url as string,
    displayUrl: (json.data.display_url as string) || (json.data.url as string),
    deleteUrl: json.data.delete_url as string | undefined,
  };
}

async function uploadToFirebaseStorage(file: File): Promise<ImgBBUploadResult> {
  const path = `student-photos/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${fileExt(file)}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file, {
    contentType: file.type || 'image/jpeg',
    cacheControl: 'public,max-age=31536000',
  });
  const url = await getDownloadURL(storageRef);
  return { url, displayUrl: url };
}

/** Server-side proxy → ImgBB / Catbox. */
async function uploadViaApiProxy(file: File): Promise<ImgBBUploadResult> {
  const image = await fileToBase64(file);
  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image,
      filename: file.name || `photo.${fileExt(file)}`,
      contentType: file.type || 'image/jpeg',
    }),
  });
  const json = await res.json();
  if (!res.ok || !json?.url) {
    throw new Error(json?.error || json?.details?.join?.(' | ') || 'Proxy upload failed');
  }
  return {
    url: json.url as string,
    displayUrl: (json.displayUrl as string) || (json.url as string),
  };
}

/**
 * Upload an image with automatic fallbacks:
 * 1) Direct ImgBB (new API key)
 * 2) Server proxy → ImgBB / Catbox
 * 3) Firebase Storage
 * Each step has a timeout so the UI never spins forever.
 */
export async function uploadToImgBB(file: File): Promise<ImgBBUploadResult> {
  const prepared = await prepareImageFile(file);
  const errors: string[] = [];

  try {
    return await withTimeout(uploadDirectToImgBB(prepared), 25_000, 'ImgBB');
  } catch (e) {
    errors.push(`ImgBB: ${e instanceof Error ? e.message : String(e)}`);
  }

  try {
    return await withTimeout(uploadViaApiProxy(prepared), 30_000, 'Proxy');
  } catch (e) {
    errors.push(`Proxy: ${e instanceof Error ? e.message : String(e)}`);
  }

  try {
    return await withTimeout(uploadToFirebaseStorage(prepared), 20_000, 'Firebase');
  } catch (e) {
    errors.push(`Firebase: ${e instanceof Error ? e.message : String(e)}`);
  }

  throw new Error(
    'Photo upload failed. Please try again in a moment.\n' + errors.join(' | '),
  );
}
