/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_INTRO_VIDEO_URL?: string;
  readonly VITE_STUDENT_URL_SECRET?: string;
  readonly VITE_ADMIN_PATH?: string;
  readonly VITE_ADMIN_ID_HASH?: string;
  readonly VITE_ADMIN_PASS_HASH?: string;
  readonly VITE_SUPER_ADMIN_PATH?: string;
  readonly VITE_SUPER_ADMIN_ID_HASH?: string;
  readonly VITE_SUPER_ADMIN_PASS_HASH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
