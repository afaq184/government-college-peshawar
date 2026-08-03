import { useEffect, useState } from 'react';
import { Loader2, RotateCcw, Search } from 'lucide-react';
import { ENROLLMENT_TYPES, type EnrollmentType, type StudentRecord } from '../../types/student';
import {
  fetchDeletedStudentsByEnrollment,
  fetchDeletedSlugs,
  restoreStudent,
  type DeletedStudentRecord,
} from '../../lib/studentService';
import { STUDENTS, studentPhotoUrl } from '../../data/studentsData';

export default function AdminDeletedStudents() {
  const [activeType, setActiveType] = useState<EnrollmentType>('Self Finance');
  const [students, setStudents] = useState<DeletedStudentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [restoringSlug, setRestoringSlug] = useState<string | null>(null);

  const load = async (type: EnrollmentType = activeType) => {
    setLoading(true);
    setError('');
    try {
      const deletedSlugs = await fetchDeletedSlugs();
      let archived: DeletedStudentRecord[] = [];
      try {
        archived = await fetchDeletedStudentsByEnrollment(type);
      } catch {
        archived = [];
      }

      const bySlug = new Map<string, DeletedStudentRecord>();

      // Hydrate legacy tombstones (slug-only) from local seed data
      for (const s of STUDENTS) {
        if (s.enrollmentType === type && deletedSlugs.has(s.slug.toLowerCase())) {
          bySlug.set(s.slug.toLowerCase(), { ...s, slug: s.slug.toLowerCase() });
        }
      }

      for (const s of archived) {
        const key = s.slug.toLowerCase();
        const prev = bySlug.get(key);
        bySlug.set(key, {
          ...prev,
          ...s,
          slug: key,
          photoFile: s.photoFile || prev?.photoFile,
          photoUrl: s.photoUrl || prev?.photoUrl,
          name: s.name || prev?.name || key,
          fatherName: s.fatherName || prev?.fatherName || '',
          rollNo: s.rollNo || prev?.rollNo || '',
          class: s.class || prev?.class || '',
          enrollmentType: s.enrollmentType || prev?.enrollmentType || type,
          session: s.session || prev?.session || '',
          admissionNo: s.admissionNo || prev?.admissionNo || '',
          dob: s.dob || prev?.dob || '',
          bloodGroup: s.bloodGroup || prev?.bloodGroup || '',
          cnic: s.cnic || prev?.cnic || '',
          phone: s.phone || prev?.phone || '',
          address: s.address || prev?.address || '',
          status: s.status || prev?.status || 'Deleted',
        });
      }

      setStudents(
        [...bySlug.values()].sort((a, b) =>
          String(a.rollNo || '').localeCompare(String(b.rollNo || ''), undefined, { numeric: true }),
        ),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load deleted students');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load(activeType);
    setSearch('');
  }, [activeType]);

  const filtered = students.filter((s) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (s.name || '').toLowerCase().includes(q) ||
      (s.rollNo || '').toLowerCase().includes(q) ||
      (s.fatherName || '').toLowerCase().includes(q) ||
      (s.admissionNo || '').toLowerCase().includes(q)
    );
  });

  const handleRestore = async (student: StudentRecord) => {
    if (
      !confirm(
        `Restore profile for ${student.name} (Roll ${student.rollNo})?\n\nThey will appear again under Students and their profile link will work.`,
      )
    ) {
      return;
    }
    setRestoringSlug(student.slug);
    setError('');
    try {
      await restoreStudent(student);
      setStudents((prev) => prev.filter((s) => s.slug !== student.slug));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not restore student');
    } finally {
      setRestoringSlug(null);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-academy-green mb-1">Deleted Students</h1>
        <p className="text-slate-500 text-sm">
          Profiles removed from the public site. Review by category, or restore to make a profile link work again.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {ENROLLMENT_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setActiveType(type)}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
              activeType === type
                ? 'bg-academy-green text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="relative mb-6 max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, roll no, or admission no"
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm"
        />
      </div>

      {error && <p className="mb-4 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">{error}</p>}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
          <h2 className="font-bold text-slate-800">Deleted {activeType} students</h2>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            {filtered.length} shown
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center py-16 text-slate-400">
            <Loader2 className="animate-spin" size={28} />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-slate-500 py-16 text-sm">No deleted students in this category.</p>
        ) : (
          <div className="divide-y divide-slate-50">
            {filtered.map((s) => (
              <div
                key={s.id || s.slug}
                className="flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-4 hover:bg-slate-50/80 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                    {s.photoUrl || s.photoFile ? (
                      <img
                        src={studentPhotoUrl(s)}
                        alt={s.name}
                        className="w-full h-full object-cover object-top"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 truncate">{s.name}</p>
                    <p className="text-xs text-slate-500">
                      Roll {s.rollNo} · S/O {s.fatherName} · {s.class}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 shrink-0">
                  <button
                    type="button"
                    disabled={restoringSlug === s.slug}
                    onClick={() => void handleRestore(s)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-academy-green/10 text-academy-green text-xs font-bold hover:bg-academy-green/15 disabled:opacity-60"
                  >
                    {restoringSlug === s.slug ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <RotateCcw size={14} />
                    )}
                    Restore
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
