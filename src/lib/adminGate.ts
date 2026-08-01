import CryptoJS from 'crypto-js';

/**
 * Admin gate — path is obfuscated; credentials are stored only as salted SHA-256 hashes
 * (plaintext id/password are never kept in source).
 *
 * Override via env if needed:
 *   VITE_ADMIN_PATH, VITE_ADMIN_ID_HASH, VITE_ADMIN_PASS_HASH
 */

const PEPPER = 'GCP-ADMIN-GATE-v1-KP-PESHAWAR';

/** Obfuscated admin base path (not /admin). */
export const ADMIN_BASE_PATH =
  (import.meta.env.VITE_ADMIN_PATH as string | undefined)?.replace(/^\/+|\/+$/g, '') ||
  'x/d37a74dc682a417c99fcc5ff';

const ID_HASH =
  (import.meta.env.VITE_ADMIN_ID_HASH as string | undefined) ||
  '4284c30401c1e98f58892d6bcb1fbf273c1611c0ba783733d879facd046574a1';

const PASS_HASH =
  (import.meta.env.VITE_ADMIN_PASS_HASH as string | undefined) ||
  '1dd15a2c77b9de0079ddfc9a9c9720fa8d9cb83521cbcfec9dd7f2d40c362113';

/** Opaque session marker — not a trivial "1". */
export const ADMIN_SESSION_VALUE = CryptoJS.SHA256(`${PEPPER}|session|ok`).toString().slice(0, 40);

export const ADMIN_SESSION_KEY = 'gcp_ag_v1';

function hashCredential(value: string): string {
  return CryptoJS.SHA256(`${PEPPER}|${value}`).toString();
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function verifyAdminCredentials(id: string, password: string): boolean {
  const idOk = timingSafeEqual(hashCredential(id.trim()), ID_HASH);
  const passOk = timingSafeEqual(hashCredential(password), PASS_HASH);
  return idOk && passOk;
}

export function adminPath(...segments: string[]): string {
  const rest = segments.filter(Boolean).join('/');
  return rest ? `/${ADMIN_BASE_PATH}/${rest}` : `/${ADMIN_BASE_PATH}`;
}

export function adminLoginPath(): string {
  return adminPath('enter');
}
