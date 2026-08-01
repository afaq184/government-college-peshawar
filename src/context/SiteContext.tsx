import { createContext, useContext, type ReactNode } from 'react';
import { useSiteSettings } from '../hooks/useCms';
import { getDefaultSiteSettings } from '../data/cmsDefaults';
import type { SiteSettings } from '../types/cms';

const SiteContext = createContext<SiteSettings>(getDefaultSiteSettings());

export function SiteProvider({ children }: { children: ReactNode }) {
  const { settings } = useSiteSettings();
  return <SiteContext.Provider value={settings}>{children}</SiteContext.Provider>;
}

export function useSite() {
  return useContext(SiteContext);
}
