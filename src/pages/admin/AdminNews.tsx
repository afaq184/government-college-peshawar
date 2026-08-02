import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Loader2, X, Upload } from 'lucide-react';
import { fetchNews, addNewsItem, updateNewsItem, deleteNewsItem } from '../../services/cmsService';
import { uploadToImgBB } from '../../lib/imgbb';
import StableImage, { waitForImage } from '../../components/StableImage';
import type { NewsItem } from '../../types/cms';
import { SITE } from '../../site';

type FormState = {
  category: string;
  date: string;
  title: string;
  desc: string;
  link: string;
  href: string;
  external: boolean;
  image: string;
  order: number;
};

const emptyForm: FormState = {
  category: 'Notice',
  date: '',
  title: '',
  desc: '',
  link: 'Read more',
  href: SITE.facebookUrl,
  external: true,
  image: '',
  order: 1,
};

export default function AdminNews() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setItems(await fetchNews());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load news');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, order: 1, href: SITE.facebookUrl });
    setShowForm(true);
  };

  const openEdit = (item: NewsItem) => {
    setEditingId(item.id);
    setForm({
      category: item.category,
      date: item.date,
      title: item.title,
      desc: item.desc,
      link: item.link,
      href: item.href,
      external: item.external,
      image: item.image,
      order: item.order,
    });
    setShowForm(true);
  };

  const handleImageUpload = async (file: File | null) => {
    if (!file) return;
    const previous = form.image;
    const localPreview = URL.createObjectURL(file);
    setForm((f) => ({ ...f, image: localPreview }));
    setUploading(true);
    setError('');
    try {
      const result = await uploadToImgBB(file);
      const remote = result.displayUrl || result.url;
      await waitForImage(remote);
      setForm((f) => ({ ...f, image: remote }));
    } catch (e) {
      setForm((f) => ({ ...f, image: previous }));
      setError(e instanceof Error ? e.message : 'Image upload failed');
    } finally {
      window.setTimeout(() => URL.revokeObjectURL(localPreview), 1000);
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.image.trim()) {
      setError('Title and image are required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        category: form.category.trim(),
        date: form.date.trim() || 'Undated',
        title: form.title.trim(),
        desc: form.desc.trim(),
        link: form.link.trim() || 'Read more',
        href: form.href.trim() || SITE.facebookUrl,
        external: form.external,
        image: form.image.trim(),
        order: Number(form.order) || 1,
      };
      if (editingId) {
        await updateNewsItem(editingId, payload);
      } else {
        await addNewsItem(payload);
      }
      setShowForm(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this news item?')) return;
    try {
      await deleteNewsItem(id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-academy-green mb-1">News</h1>
          <p className="text-slate-500 text-sm">
            Existing notices stay on the public News page. New items you add here appear above them.
          </p>
        </div>
        <button type="button" onClick={openCreate} className="btn-primary inline-flex items-center gap-2">
          <Plus size={18} /> Add news
        </button>
      </div>

      {error && <p className="mb-4 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">{error}</p>}

      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-lg">{editingId ? 'Edit news' : 'Add news'}</h2>
            <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Category</label>
              <input
                className="w-full px-4 py-3 rounded-xl border border-slate-200"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Date</label>
              <input
                className="w-full px-4 py-3 rounded-xl border border-slate-200"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                placeholder="e.g. 16-06-2026"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Title</label>
              <input
                className="w-full px-4 py-3 rounded-xl border border-slate-200"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Description</label>
              <textarea
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-slate-200"
                value={form.desc}
                onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Button label</label>
              <input
                className="w-full px-4 py-3 rounded-xl border border-slate-200"
                value={form.link}
                onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Link</label>
              <input
                className="w-full px-4 py-3 rounded-xl border border-slate-200"
                value={form.href}
                onChange={(e) => setForm((f) => ({ ...f, href: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Order</label>
              <input
                type="number"
                className="w-full px-4 py-3 rounded-xl border border-slate-200"
                value={form.order}
                onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) }))}
              />
            </div>
            <div className="flex items-end pb-3">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.external}
                  onChange={(e) => setForm((f) => ({ ...f, external: e.target.checked }))}
                  className="rounded"
                />
                Open link in new tab
              </label>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Image</label>
              <label className="btn-secondary cursor-pointer inline-flex items-center gap-2 py-2.5 px-4">
                {uploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                {uploading ? 'Uploading…' : form.image ? 'Change image' : 'Upload image'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => {
                    const selected = e.target.files?.[0] ?? null;
                    e.target.value = '';
                    void handleImageUpload(selected);
                  }}
                />
              </label>
              {form.image && (
                <StableImage
                  src={form.image}
                  alt="Preview"
                  className="mt-4 h-32 w-auto max-w-full rounded-xl object-cover border border-slate-100 bg-slate-100"
                />
              )}
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <button type="button" onClick={() => void handleSave()} disabled={saving || uploading} className="btn-primary inline-flex items-center gap-2">
              {saving && <Loader2 className="animate-spin" size={16} />}
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-5 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50">
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20 text-slate-400">
          <Loader2 className="animate-spin" size={32} />
        </div>
      ) : items.length === 0 ? (
        <p className="text-slate-500 text-center py-16">
          No extra news yet. Original notices still show on the public News page. Click &quot;Add news&quot; to publish new ones.
        </p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row overflow-hidden">
              <div className="sm:w-40 h-32 sm:h-auto bg-slate-100 shrink-0">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-5 flex-1 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-academy-gold mb-1">
                    {item.category} · {item.date}
                  </p>
                  <h3 className="font-bold text-slate-800 mb-1 line-clamp-1">{item.title}</h3>
                  <p className="text-sm text-slate-500 line-clamp-2">{item.desc}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button type="button" onClick={() => openEdit(item)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-50 text-slate-600 text-xs font-bold hover:bg-slate-100">
                    <Pencil size={14} /> Edit
                  </button>
                  <button type="button" onClick={() => void handleDelete(item.id)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100">
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
