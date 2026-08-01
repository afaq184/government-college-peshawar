import { useEffect, useState } from 'react';
import { Loader2, Trash2, ExternalLink, Search } from 'lucide-react';
import { ENROLLMENT_TYPES, type EnrollmentType, type StudentRecord } from '../../types/student';
import { fetchStudentsByEnrollment, fetchDeletedSlugs, markStudentDeleted } from '../../lib/studentService';
import { encryptStudentSlug } from '../../utils/studentToken';
import { STUDENTS, studentPhotoUrl } from '../../data/studentsData';

export default function AdminStudents() {
  const [activeType, setActiveType] = useState<EnrollmentType>('Self Finance');
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  const load = async (type: EnrollmentType = activeType) => {
    setLoading(true);
    setError('');
    try {
      const deleted = await fetchDeletedSlugs();
      const local = STUDENTS.filter(
        (s) => s.enrollmentType === type && !deleted.has(s.slug.toLowerCase()),
      );
      let remote: StudentRecord[] = [];
      try {
        remote = (await fetchStudentsByEnrollment(type)).filter(
          (s) => !deleted.has(s.slug.toLowerCase()),
        );
      } catch {
        remote = [];
      }

      const bySlug = new Map<string, StudentRecord>();
      for (const s of local) bySlug.set(s.slug.toLowerCase(), s);
      for (const s of remote) {
        const prev = bySlug.get(s.slug.toLowerCase());
        bySlug.set(s.slug.toLowerCase(), {
          ...prev,
          ...s,
          photoFile: s.photoFile || prev?.photoFile,
          photoUrl: s.photoUrl || prev?.photoUrl,
        });
      }
      setStudents(
        [...bySlug.values()].sort((a, b) =>
          String(a.rollNo).localeCompare(String(b.rollNo), undefined, { numeric: true }),
        ),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load students');
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
      s.name.toLowerCase().includes(q) ||
      s.rollNo.toLowerCase().includes(q) ||
      s.fatherName.toLowerCase().includes(q) ||
      s.admissionNo.toLowerCase().includes(q)
    );
  });

  const openProfile = (student: StudentRecord) => {
    const token = encryptStudentSlug(student.slug);
    window.location.hash = `#/student/${token}`;
  };

  const handleDelete = async (student: StudentRecord) => {
    if (
      !confirm(
        `Delete profile for ${student.name} (Roll ${student.rollNo})?\n\nTheir profile link will no longer work.`,
      )
    ) {
      return;
    }
    setDeletingSlug(student.slug);
    setError('');
    try {
      await markStudentDeleted({
        slug: student.slug,
        name: student.name,
        id: student.id,
      });
      setStudents((prev) => prev.filter((s) => s.slug !== student.slug));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not delete student');
    } finally {
      setDeletingSlug(null);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-academy-green mb-1">Students</h1>
        <p className="text-slate-500 text-sm">
          View student profiles by category. Open a profile to review it, or delete to revoke URL access.
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
          <h2 className="font-bold text-slate-800">{activeType} students</h2>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            {filtered.length} shown
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center py-16 text-slate-400">
            <Loader2 className="animate-spin" size={28} />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-slate-500 py-16 text-sm">No students in this category.</p>
        ) : (
          <div className="divide-y divide-slate-50">
            {filtered.map((s) => (
              <div
                key={s.id || s.slug}
                className="flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-4 hover:bg-slate-50/80 transition-colors"
              >
                <button
                  type="button"
                  onClick={() => openProfile(s)}
                  className="flex items-center gap-4 flex-1 min-w-0 text-left"
                >
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                    {(s.photoUrl || s.photoFile) ? (
                      <img
                        src={studentPhotoUrl(s)}
                        alt={s.name}
                        className="w-full h-full object-cover object-top"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 truncate group-hover:text-academy-green">
                      {s.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      Roll {s.rollNo} · S/O {s.fatherName} · {s.class}
                    </p>
                  </div>
                </button>

                <div className="flex flex-wrap gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => openProfile(s)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-academy-green/10 text-academy-green text-xs font-bold hover:bg-academy-green/15"
                  >
                    <ExternalLink size={14} /> Open profile
                  </button>
                  <button
                    type="button"
                    disabled={deletingSlug === s.slug}
                    onClick={() => void handleDelete(s)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 disabled:opacity-60"
                  >
                    {deletingSlug === s.slug ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                    Delete
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
