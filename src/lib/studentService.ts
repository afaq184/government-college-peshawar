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

/** Soft-delete: hide profile everywhere; URL shows deleted message. */
export async function markStudentDeleted(student: {
  slug: string;
  name?: string;
  id?: string;
}): Promise<void> {
  const key = student.slug.toLowerCase();
  writeLocalDeleted([...readLocalDeleted(), key]);

  try {
    await setDoc(doc(db, DELETED, key), {
      slug: key,
      name: student.name || '',
      deletedAt: Date.now(),
    });
  } catch {
    /* local list still applies on this browser */
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

export async function deleteStudent(id: string): Promise<void> {
  await deleteDoc(doc(db, STUDENTS, id));
}

export async function getStudentDoc(id: string): Promise<StudentRecord | null> {
  const snap = await getDoc(doc(db, STUDENTS, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<StudentRecord, 'id'>) };
}
