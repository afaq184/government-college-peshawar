import type { FormEvent, ChangeEvent } from 'react';
import { useState } from 'react';
import { Loader2, Upload, Copy, Check, ExternalLink, Plus } from 'lucide-react';
import {
  ENROLLMENT_TYPES,
  CLASS_YEARS,
  DISCIPLINES,
  FIXED_INTER_SESSION,
  type EnrollmentType,
  type ClassYear,
  type Discipline,
  type StudentRecord,
} from '../../types/student';
import { makeStudentSlug, upsertStudent } from '../../lib/studentService';
import { uploadToImgBB } from '../../lib/imgbb';
import { encryptStudentSlug } from '../../utils/studentToken';
import { waitForImage } from '../../components/StableImage';

type FormState = {
  name: string;
  fatherName: string;
  discipline: Discipline;
  classYear: ClassYear;
  rollNo: string;
  session: string;
  dob: string;
  bloodGroup: string;
  enrollmentType: EnrollmentType;
  phone: string;
  address: string;
  photoUrl: string;
};

const emptyForm: FormState = {
  name: '',
  fatherName: '',
  discipline: 'Computer Science',
  classYear: '1st year',
  rollNo: '',
  session: FIXED_INTER_SESSION,
  dob: '',
  bloodGroup: '',
  enrollmentType: 'Morning Shift',
  phone: '',
  address: '',
  photoUrl: '',
};

type CreatedResult = {
  student: StudentRecord;
  profileUrl: string;
};

function isInterYear(year: ClassYear): boolean {
  return year === '1st year' || year === '2nd year';
}

export default function SuperAdminCreateStudent() {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState<CreatedResult | null>(null);
  const [copied, setCopied] = useState(false);

  const sessionLocked = isInterYear(form.classYear);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setCreated(null);
  };

  const handleClassYearChange = (year: ClassYear) => {
    setForm((f) => ({
      ...f,
      classYear: year,
      session: isInterYear(year) ? FIXED_INTER_SESSION : f.session === FIXED_INTER_SESSION ? '' : f.session,
    }));
    setCreated(null);
  };

  const handlePhotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const previous = form.photoUrl;
    const localPreview = URL.createObjectURL(file);
    setField('photoUrl', localPreview);
    setUploading(true);
    setError('');
    try {
      const result = await uploadToImgBB(file);
      const remote = result.displayUrl || result.url;
      await Promise.race([
        waitForImage(remote),
        new Promise<void>((resolve) => window.setTimeout(resolve, 8000)),
      ]);
      setField('photoUrl', remote);
    } catch (err) {
      setField('photoUrl', previous);
      setError(err instanceof Error ? err.message : 'Photo upload failed');
    } finally {
      window.setTimeout(() => URL.revokeObjectURL(localPreview), 1000);
      setUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setCreated(null);
    setCopied(false);

    const name = form.name.trim();
    const rollNo = form.rollNo.trim();
    if (!name || !rollNo) {
      setError('Name and Roll No are required');
      return;
    }

    const session = sessionLocked ? FIXED_INTER_SESSION : form.session.trim();
    if (!session) {
      setError('Academic Session is required for BS');
      return;
    }

    const slug = makeStudentSlug(name, rollNo);
    const student: StudentRecord = {
      id: slug,
      slug,
      name,
      fatherName: form.fatherName.trim(),
      class: form.discipline.trim(),
      classYear: form.classYear,
      rollNo,
      enrollmentType: form.enrollmentType,
      session,
      admissionNo: '',
      dob: form.dob.trim(),
      bloodGroup: form.bloodGroup.trim(),
      cnic: '',
      phone: form.phone.trim(),
      address: form.address.trim(),
      status: 'Active',
      photoUrl: form.photoUrl.startsWith('blob:') ? undefined : form.photoUrl || undefined,
      createdAt: Date.now(),
    };

    setSaving(true);
    try {
      await upsertStudent(student);
      const token = encryptStudentSlug(slug);
      const profileUrl = `${window.location.origin}/student/${token}`;
      setCreated({ student, profileUrl });
      setForm(emptyForm);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create student profile');
    } finally {
      setSaving(false);
    }
  };

  const copyLink = async () => {
    if (!created) return;
    try {
      await navigator.clipboard.writeText(created.profileUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Could not copy link — select and copy manually');
    }
  };

  const inputClass =
    'w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-academy-green/30 focus:border-academy-green';
  const inputLockedClass =
    'w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-600 cursor-not-allowed';
  const labelClass = 'block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2';

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-academy-green mb-1">Add Student Profile</h1>
        <p className="text-slate-500 text-sm">
          Create a student profile. It appears on the website immediately with a secure profile link.
        </p>
      </div>

      {created && (
        <div className="mb-8 bg-green-50 border border-green-200 rounded-2xl p-6 space-y-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-academy-green mb-1">
              Profile created
            </p>
            <p className="font-bold text-slate-800">
              {created.student.name} · Roll {created.student.rollNo}
            </p>
          </div>
          <div>
            <p className={labelClass}>Secure profile URL</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                readOnly
                value={created.profileUrl}
                className={`${inputClass} font-mono text-xs`}
                onFocus={(e) => e.target.select()}
              />
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => void copyLink()}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-academy-green text-white text-sm font-bold hover:opacity-90"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <a
                  href={created.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50"
                >
                  <ExternalLink size={16} /> Open
                </a>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setCreated(null);
              setCopied(false);
            }}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-academy-green hover:underline"
          >
            <Plus size={16} /> Create another student
          </button>
        </div>
      )}

      {error && (
        <p className="mb-6 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">{error}</p>
      )}

      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-6"
      >
        <div>
          <p className={labelClass}>Photo</p>
          <div className="flex items-start gap-4">
            <div className="w-24 h-28 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
              {form.photoUrl ? (
                <img src={form.photoUrl} alt="" className="w-full h-full object-cover object-top" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">
                  No photo
                </div>
              )}
            </div>
            <label className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-700 cursor-pointer hover:bg-slate-100">
              {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              {uploading ? 'Uploading…' : 'Upload photo'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading || saving}
                onChange={(e) => void handlePhotoUpload(e)}
              />
            </label>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Name *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Father Name</label>
            <input
              type="text"
              value={form.fatherName}
              onChange={(e) => setField('fatherName', e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Academic Profile sequence */}
          <div>
            <label className={labelClass}>Discipline *</label>
            <select
              value={form.discipline}
              onChange={(e) => setField('discipline', e.target.value as Discipline)}
              className={inputClass}
              required
            >
              {DISCIPLINES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Class *</label>
            <select
              value={form.classYear}
              onChange={(e) => handleClassYearChange(e.target.value as ClassYear)}
              className={inputClass}
              required
            >
              {CLASS_YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Roll No *</label>
            <input
              type="text"
              required
              value={form.rollNo}
              onChange={(e) => setField('rollNo', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>
              Academic Session{sessionLocked ? '' : ' *'}
            </label>
            <input
              type="text"
              required={!sessionLocked}
              readOnly={sessionLocked}
              value={form.session}
              onChange={(e) => setField('session', e.target.value)}
              className={sessionLocked ? inputLockedClass : inputClass}
              placeholder={sessionLocked ? FIXED_INTER_SESSION : 'e.g. 2024-2028'}
            />
            {sessionLocked && (
              <p className="mt-1.5 text-[11px] text-slate-400">
                Fixed for 1st year and 2nd year
              </p>
            )}
          </div>

          {/* Personal Information */}
          <div>
            <label className={labelClass}>Date of Birth</label>
            <input
              type="text"
              value={form.dob}
              onChange={(e) => setField('dob', e.target.value)}
              className={inputClass}
              placeholder="DD-MM-YYYY"
            />
          </div>
          <div>
            <label className={labelClass}>Blood Group</label>
            <input
              type="text"
              value={form.bloodGroup}
              onChange={(e) => setField('bloodGroup', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Enrollment Type *</label>
            <select
              value={form.enrollmentType}
              onChange={(e) => setField('enrollmentType', e.target.value as EnrollmentType)}
              className={inputClass}
              required
            >
              {ENROLLMENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <input type="text" readOnly value="Active" className={inputLockedClass} />
            <p className="mt-1.5 text-[11px] text-slate-400">Fixed for all students</p>
          </div>

          {/* Contact Credentials */}
          <div>
            <label className={labelClass}>Guardian Contact Number</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setField('phone', e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Permanent Address</label>
            <textarea
              value={form.address}
              onChange={(e) => setField('address', e.target.value)}
              className={`${inputClass} min-h-[88px] resize-y`}
              rows={3}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving || uploading}
          className="btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 disabled:opacity-60"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
          {saving ? 'Creating…' : 'Create profile'}
        </button>
      </form>
    </div>
  );
}
