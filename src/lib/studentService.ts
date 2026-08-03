import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { StudentRecord } from '../types/student';

const STUDENTS = 'students';
const DELETED = 'deletedStudents';
const LOCAL_DELETED_KEY = 'gcp_deleted_students';
const LOCAL_DELETED_RECORDS_KEY = 'gcp_deleted_student_records';

function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as T;
}

function readLocalDeleted(): string[] {
  try {
    const raw = localStorage.getItem(LOCAL_DELETED_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function writeLocalDeleted(slugs: string[]) {
  try {
    localStorage.setItem(LOCAL_DELETED_KEY, JSON.stringify([...new Set(slugs)]));
  } catch {
    /* ignore */
  }
}

export function makeStudentSlug(name: string, rollNo: string): string {
  const base = `${name}-${rollNo}`
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base || `student-${rollNo}`;
}

export async function fetchStudentsByEnrollment(enrollmentType: string): Promise<StudentRecord[]> {
  const q = query(collection(db, STUDENTS), where('enrollmentType', '==', enrollmentType));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<StudentRecord, 'id'>) }))
    .sort((a, b) => String(a.rollNo).localeCompare(String(b.rollNo), undefined, { numeric: true }));
}

export async function fetchAllStudents(): Promise<StudentRecord[]> {
  const snap = await getDocs(collection(db, STUDENTS));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<StudentRecord, 'id'>) }));
}

export async function fetchStudentBySlug(slug: string): Promise<StudentRecord | null> {
  const q = query(collection(db, STUDENTS), where('slug', '==', slug.toLowerCase()));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...(d.data() as Omit<StudentRecord, 'id'>) };
}

export async function upsertStudent(student: StudentRecord): Promise<string> {
  const id = student.id || student.slug;
  const { id: _omit, ...data } = student;
  await setDoc(
    doc(db, STUDENTS, id),
    stripUndefined({ ...data, slug: student.slug.toLowerCase(), createdAt: student.createdAt ?? Date.now() } as Record<string, unknown>),
    { merge: true },
  );
  return id;
}

export async function bulkUpsertStudents(students: StudentRecord[]): Promise<number> {
  const batchSize = 400;
  let written = 0;
  for (let i = 0; i < students.length; i += batchSize) {
    const chunk = students.slice(i, i + batchSize);
    const batch = writeBatch(db);
    chunk.forEach((student) => {
      const id = student.id || student.slug;
      const { id: _omit, ...data } = student;
      batch.set(
        doc(db, STUDENTS, id),
        stripUndefined({
          ...data,
          slug: student.slug.toLowerCase(),
          createdAt: student.createdAt ?? Date.now(),
        } as Record<string, unknown>),
        { merge: true },
      );
    });
    await batch.commit();
    written += chunk.length;
  }
  return written;
}

export async function fetchDeletedSlugs(): Promise<Set<string>> {
  const local = new Set(readLocalDeleted().map((s) => s.toLowerCase()));
  try {
    const snap = await getDocs(collection(db, DELETED));
    snap.docs.forEach((d) => local.add(d.id.toLowerCase()));
  } catch {
    /* keep local list */
  }
  return local;
}

export async function isStudentDeleted(slug: string): Promise<boolean> {
  const key = slug.toLowerCase();
  if (readLocalDeleted().map((s) => s.toLowerCase()).includes(key)) return true;
  try {
    const snap = await getDoc(doc(db, DELETED, key));
    return snap.exists();
  } catch {
    return false;
  }
}

export type DeletedStudentRecord = StudentRecord & { deletedAt?: number };

function archiveLocalDeletedRecord(student: DeletedStudentRecord) {
  try {
    const raw = localStorage.getItem(LOCAL_DELETED_RECORDS_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    const list = Array.isArray(parsed) ? (parsed as DeletedStudentRecord[]) : [];
    const key = student.slug.toLowerCase();
    const next = list.filter((s) => String(s.slug).toLowerCase() !== key);
    next.push({ ...student, slug: key });
    localStorage.setItem(LOCAL_DELETED_RECORDS_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

function readLocalDeletedRecords(): DeletedStudentRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_DELETED_RECORDS_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? (parsed as DeletedStudentRecord[]) : [];
  } catch {
    return [];
  }
}

function removeLocalDeletedRecord(slug: string) {
  try {
    const key = slug.toLowerCase();
    const next = readLocalDeletedRecords().filter((s) => String(s.slug).toLowerCase() !== key);
    localStorage.setItem(LOCAL_DELETED_RECORDS_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

/** Soft-delete: archive full profile, hide everywhere; URL shows deleted message. */
export async function markStudentDeleted(student: StudentRecord): Promise<void> {
  const key = student.slug.toLowerCase();
  const { id: _omit, ...data } = student;
  const archived: DeletedStudentRecord = {
    ...data,
    slug: key,
    deletedAt: Date.now(),
  };

  writeLocalDeleted([...readLocalDeleted(), key]);
  archiveLocalDeletedRecord(archived);

  try {
    await setDoc(
      doc(db, DELETED, key),
      stripUndefined({ ...archived } as Record<string, unknown>),
    );
  } catch {
    /* local archive still applies on this browser */
  }

  const ids = new Set<string>([key]);
  if (student.id) ids.add(student.id);
  for (const id of ids) {
    try {
      await deleteDoc(doc(db, STUDENTS, id));
    } catch {
      /* ignore */
    }
  }
}

/** Deleted students for one enrollment tab (archives + local fallback). */
export async function fetchDeletedStudentsByEnrollment(
  enrollmentType: string,
): Promise<DeletedStudentRecord[]> {
  const bySlug = new Map<string, DeletedStudentRecord>();

  for (const s of readLocalDeletedRecords()) {
    if (s.enrollmentType === enrollmentType) {
      bySlug.set(s.slug.toLowerCase(), { ...s, slug: s.slug.toLowerCase() });
    }
  }

  try {
    const snap = await getDocs(collection(db, DELETED));
    snap.docs.forEach((d) => {
      const data = d.data() as Omit<DeletedStudentRecord, 'id'>;
      const slug = (data.slug || d.id).toLowerCase();
      const record: DeletedStudentRecord = { id: d.id, ...data, slug };
      if (record.enrollmentType === enrollmentType) {
        const prev = bySlug.get(slug);
        bySlug.set(slug, { ...prev, ...record });
      }
    });
  } catch {
    /* keep local archives */
  }

  return [...bySlug.values()].sort((a, b) =>
    String(a.rollNo || '').localeCompare(String(b.rollNo || ''), undefined, { numeric: true }),
  );
}

/** Restore a soft-deleted student back to the active students list. */
export async function restoreStudent(student: StudentRecord): Promise<void> {
  const key = student.slug.toLowerCase();
  const { deletedAt: _deletedAt, ...rest } = student as DeletedStudentRecord;
  await upsertStudent({ ...rest, slug: key, id: student.id || key });

  writeLocalDeleted(readLocalDeleted().filter((s) => s.toLowerCase() !== key));
  removeLocalDeletedRecord(key);

  try {
    await deleteDoc(doc(db, DELETED, key));
  } catch {
    /* local lists already cleared */
  }
}

export async function deleteStudent(id: string): Promise<void> {
  await deleteDoc(doc(db, STUDENTS, id));
}

export async function getStudentDoc(id: string): Promise<StudentRecord | null> {
  const snap = await getDoc(doc(db, STUDENTS, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<StudentRecord, 'id'>) };
}
