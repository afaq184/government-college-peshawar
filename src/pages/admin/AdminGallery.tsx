import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Loader2, X, Upload } from 'lucide-react';
import {
  fetchGallery,
  addGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
} from '../../services/cmsService';
import { uploadToImgBB } from '../../lib/imgbb';
import { GALLERY_CATEGORIES, type GalleryItem } from '../../types/cms';

type FormState = {
  title: string;
  category: string;
  image: string;
  order: number;
};

const emptyForm: FormState = {
  title: '',
  category: 'Campus',
  image: '',
  order: 1,
};

export default function AdminGallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
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
      setItems(await fetchGallery());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load gallery');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    // Order 1 = top of gallery; newer items with same order still float up via createdAt
    setForm({ ...emptyForm, order: 1 });
    setShowForm(true);
  };

  const openEdit = (item: GalleryItem) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      category: item.category,
      image: item.image,
      order: item.order ?? 1,
    });
    setShowForm(true);
  };

  const handleImageUpload = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const result = await uploadToImgBB(file);
      setForm((f) => ({ ...f, image: result.displayUrl || result.url }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Image upload failed');
    } finally {
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
        title: form.title.trim(),
        category: form.category,
        image: form.image.trim(),
        order: Number.isFinite(Number(form.order)) ? Number(form.order) : 1,
        imgClass: 'object-cover object-center',
      };
      if (editingId) {
        await updateGalleryItem(editingId, payload);
      } else {
        await addGalleryItem(payload);
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
    if (!confirm('Delete this gallery image?')) return;
    try {
      await deleteGalleryItem(id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-academy-green mb-1">Gallery</h1>
          <p className="text-slate-500 text-sm">
            Original campus photos stay on the public Gallery. New images you add appear above them.
          </p>
        </div>
        <button type="button" onClick={openCreate} className="btn-primary inline-flex items-center gap-2">
          <Plus size={18} /> Add image
        </button>
      </div>

      {error && <p className="mb-4 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">{error}</p>}

      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-lg">{editingId ? 'Edit image' : 'Add image'}</h2>
            <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Title</label>
              <input
                className="w-full px-4 py-3 rounded-xl border border-slate-200"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Category</label>
              <select
                className="w-full px-4 py-3 rounded-xl border border-slate-200"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              >
                {GALLERY_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                Order <span className="normal-case tracking-normal font-medium text-slate-400">(1 = top)</span>
              </label>
              <input
                type="number"
                min={1}
                step={1}
                className="w-full px-4 py-3 rounded-xl border border-slate-200"
                value={form.order}
                onChange={(e) => {
                  const n = parseInt(e.target.value, 10);
                  setForm((f) => ({ ...f, order: Number.isFinite(n) ? n : 1 }));
                }}
              />
              <p className="mt-1.5 text-xs text-slate-400">Lower number appears higher. New photos show above the original gallery.</p>
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
                  onChange={(e) => void handleImageUpload(e.target.files?.[0] ?? null)}
                />
              </label>
              {form.image && (
                <img src={form.image} alt="Preview" className="mt-4 h-32 rounded-xl object-cover border border-slate-100" />
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
          No extra gallery images yet. Original photos still show on the public Gallery. Click &quot;Add image&quot; to upload new ones.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...items]
            .sort((a, b) => {
              const byOrder = (a.order ?? 0) - (b.order ?? 0);
              if (byOrder !== 0) return byOrder;
              return (b.createdAt ?? 0) - (a.createdAt ?? 0);
            })
            .map((item) => (
            <div key={item.id} className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
              <div className="aspect-square bg-slate-100">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-academy-gold mb-1">
                  {item.category} · Order {item.order ?? '—'}
                </p>
                <h3 className="font-bold text-slate-800 text-sm line-clamp-2 mb-3">{item.title}</h3>
                <div className="flex gap-2">
                  <button type="button" onClick={() => openEdit(item)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-50 text-slate-600 text-xs font-bold hover:bg-slate-100">
                    <Pencil size={14} /> Edit
                  </button>
                  <button type="button" onClick={() => void handleDelete(item.id)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100">
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
