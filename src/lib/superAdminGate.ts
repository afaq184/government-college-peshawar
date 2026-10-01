import CryptoJS from 'crypto-js';

/**
 * Super Admin gate — separate from CMS admin.
 * Only used to create student profiles that appear live on the site.
 *
 * Override via env if needed:
 *   VITE_SUPER_ADMIN_PATH, VITE_SUPER_ADMIN_ID_HASH, VITE_SUPER_ADMIN_PASS_HASH
 */

const PEPPER = 'GCP-SUPER-ADMIN-GATE-v1-KP-PESHAWAR';

/** Obfuscated super-admin base path (not /admin or /super-admin). */
export const SUPER_ADMIN_BASE_PATH =
  (import.meta.env.VITE_SUPER_ADMIN_PATH as string | undefined)?.replace(/^\/+|\/+$/g, '') ||
  'sa/1cfff8c24c009cc078b9cbdc';

const ID_HASH =
  (import.meta.env.VITE_SUPER_ADMIN_ID_HASH as string | undefined) ||
  '95b7d335cc9d8e347b7954539f0932447079c37aafc558cfa7e9ea688e47de86';

const PASS_HASH =
  (import.meta.env.VITE_SUPER_ADMIN_PASS_HASH as string | undefined) ||
  'cc0f384b3c2d69a5e9d9344f49c3f9b2d38830e539f7af54fc333dab73dd4c12';

export const SUPER_ADMIN_SESSION_VALUE = CryptoJS.SHA256(`${PEPPER}|session|ok`).toString().slice(0, 40);

export const SUPER_ADMIN_SESSION_KEY = 'gcp_sa_v1';

function hashCredential(value: string): string {
  return CryptoJS.SHA256(`${PEPPER}|${value}`).toString();
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function verifySuperAdminCredentials(id: string, password: string): boolean {
  const idOk = timingSafeEqual(hashCredential(id.trim()), ID_HASH);
  const passOk = timingSafeEqual(hashCredential(password), PASS_HASH);
  return idOk && passOk;
}

export function superAdminPath(...segments: string[]): string {
  const rest = segments.filter(Boolean).join('/');
  return rest ? `/${SUPER_ADMIN_BASE_PATH}/${rest}` : `/${SUPER_ADMIN_BASE_PATH}`;
}

export function superAdminLoginPath(): string {
  return superAdminPath('enter');
}
