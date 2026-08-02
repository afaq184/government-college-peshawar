import { useEffect, useState } from 'react';
import { Loader2, Save, Upload } from 'lucide-react';
import { fetchSiteSettings, saveSiteSettings } from '../../services/cmsService';
import { getDefaultSiteSettings, resolveSiteSettings } from '../../data/cmsDefaults';
import { uploadToImgBB } from '../../lib/imgbb';
import StableImage, { waitForImage } from '../../components/StableImage';
import type { SiteSettings } from '../../types/cms';

type ImageKey = 'heroImage' | 'principalImage' | 'aboutImage' | 'chiefProctorImage';

export default function AdminSite() {
  const [form, setForm] = useState<SiteSettings>(getDefaultSiteSettings());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchSiteSettings();
        setForm(resolveSiteSettings(data));
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load settings');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const set = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const uploadField = async (field: ImageKey, file: File | null) => {
    if (!file) return;
    const previous = form[field];
    const localPreview = URL.createObjectURL(file);
    set(field, localPreview);
    setUploading(field);
    setError('');
    try {
      const result = await uploadToImgBB(file);
      const remote = result.displayUrl || result.url;
      await waitForImage(remote);
      set(field, remote);
    } catch (e) {
      set(field, previous);
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      // Defer revoke so the <img> has already switched to the remote URL
      window.setTimeout(() => URL.revokeObjectURL(localPreview), 1000);
      setUploading(null);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    setError('');
    try {
      await saveSiteSettings(form);
      setMessage('Site settings saved. Refresh public pages to see changes.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-slate-400">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  const field = (label: string, key: keyof SiteSettings, type: 'text' | 'number' | 'textarea' = 'text') => (
    <div>
      <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">{label}</label>
      {type === 'textarea' ? (
        <textarea
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-slate-200"
          value={String(form[key] ?? '')}
          onChange={(e) => set(key, e.target.value as SiteSettings[typeof key])}
        />
      ) : (
        <input
          type={type}
          className="w-full px-4 py-3 rounded-xl border border-slate-200"
          value={String(form[key] ?? '')}
          onChange={(e) =>
            set(key, (type === 'number' ? Number(e.target.value) : e.target.value) as SiteSettings[typeof key])
          }
        />
      )}
    </div>
  );

  const imageField = (label: string, key: ImageKey) => (
    <div>
      <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">{label}</label>
      <label className="btn-secondary cursor-pointer inline-flex items-center gap-2 py-2.5 px-4">
        {uploading === key ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
        {uploading === key ? 'Uploading…' : form[key] ? 'Change image' : 'Upload'}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          disabled={!!uploading}
          onChange={(e) => {
            const selected = e.target.files?.[0] ?? null;
            e.target.value = '';
            void uploadField(key, selected);
          }}
        />
      </label>
      {form[key] && (
        <StableImage
          src={form[key]!}
          alt={label}
          className="mt-3 h-28 w-28 rounded-xl object-cover border border-slate-100 bg-slate-100"
        />
      )}
    </div>
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-academy-green mb-1">Site settings</h1>
          <p className="text-slate-500 text-sm">College identity, contact info, and key page images.</p>
        </div>
        <button type="button" onClick={() => void handleSave()} disabled={saving} className="btn-primary inline-flex items-center gap-2">
          {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          {saving ? 'Saving…' : 'Save settings'}
        </button>
      </div>

      {error && <p className="mb-4 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">{error}</p>}
      {message && <p className="mb-4 text-sm text-academy-green bg-green-50 px-4 py-3 rounded-xl">{message}</p>}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-8">
        <section className="space-y-4">
          <h2 className="font-bold text-slate-800 border-b border-slate-100 pb-2">Identity</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {field('Short name', 'shortName')}
            {field('Full name', 'fullName')}
            <div className="sm:col-span-2">{field('Tagline', 'tagline', 'textarea')}</div>
            {field('Established year', 'established', 'number')}
            {field('Principal', 'principal')}
            {field('Chief proctor', 'chiefProctor')}
            <div className="sm:col-span-2">{field('Vision', 'vision', 'textarea')}</div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-bold text-slate-800 border-b border-slate-100 pb-2">Contact</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {field('Address line', 'addressLine')}
            {field('City', 'city')}
            {field('Phone', 'phone')}
            {field('Email', 'email')}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-bold text-slate-800 border-b border-slate-100 pb-2">Links</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {field('Facebook link', 'facebookUrl')}
            {field('Facebook photos link', 'facebookPhotosUrl')}
            {field('HED admission link', 'hedAdmissionUrl')}
            {field('HED college link', 'hedCollegeUrl')}
            {field('Wikipedia link', 'wikipediaUrl')}
            {field('Map query', 'mapQuery')}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-bold text-slate-800 border-b border-slate-100 pb-2">Page images</h2>
          <div className="space-y-6">
            {imageField('Home hero image', 'heroImage')}
            {imageField('Principal photo', 'principalImage')}
            {imageField('Chief Proctor photo', 'chiefProctorImage')}
            {imageField('About campus image', 'aboutImage')}
          </div>
        </section>
      </div>
    </div>
  );
}
