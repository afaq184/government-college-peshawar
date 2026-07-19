import CryptoJS from 'crypto-js';

/**
 * AES-256-CBC encryption for student profile URL tokens.
 *
 * - Algorithm: AES (Advanced Encryption Standard), 256-bit key, CBC mode
 * - Key/IV: derived from a secret passphrase via SHA-256 (deterministic,
 *   so the same student always gets the same URL)
 * - Encoding: URL-safe Base64 (no +, /, or = in the path)
 *
 * Plain name/roll URLs no longer work. Only the encrypted token opens a profile.
 *
 * Note: The secret ships in the frontend bundle, so this blocks casual
 * guessing—not a substitute for server-side access control.
 */
const STUDENT_URL_SECRET =
  import.meta.env.VITE_STUDENT_URL_SECRET || 'GCP-STUDENT-PORTAL-AES-2026-KP';

function deriveKeyAndIv() {
  const key = CryptoJS.SHA256(STUDENT_URL_SECRET);
  const ivHash = CryptoJS.SHA256(`${STUDENT_URL_SECRET}:iv`);
  const iv = CryptoJS.lib.WordArray.create(ivHash.words.slice(0, 4), 16);
  return { key, iv };
}

function toUrlSafe(base64: string): string {
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromUrlSafe(urlSafe: string): string {
  let base64 = urlSafe.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4;
  if (pad) base64 += '='.repeat(4 - pad);
  return base64;
}

/** Encrypt a student slug into a stable opaque URL token. */
export function encryptStudentSlug(slug: string): string {
  const { key, iv } = deriveKeyAndIv();
  const encrypted = CryptoJS.AES.encrypt(slug, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return toUrlSafe(encrypted.ciphertext.toString(CryptoJS.enc.Base64));
}

/** Decrypt a URL token back to the student slug, or null if invalid. */
export function decryptStudentToken(token: string | undefined): string | null {
  if (!token) return null;
  try {
    const { key, iv } = deriveKeyAndIv();
    const cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: CryptoJS.enc.Base64.parse(fromUrlSafe(token)),
    });
    const bytes = CryptoJS.AES.decrypt(cipherParams, key, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    const slug = bytes.toString(CryptoJS.enc.Utf8);
    return slug || null;
  } catch {
    return null;
  }
}
