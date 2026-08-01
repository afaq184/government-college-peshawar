import { decryptStudentToken } from '../utils/studentToken';
import { fetchStudentBySlug, isStudentDeleted } from '../lib/studentService';
import type { StudentRecord } from '../types/student';
import { SELF_FINANCE_STUDENTS } from './selfFinanceStudents';

export type Student = StudentRecord;

export type StudentResolveResult =
  | { status: 'ok'; student: Student }
  | { status: 'deleted' }
  | { status: 'not_found' };

const DEMO_STUDENTS: Student[] = [
  {
    slug: 'muhammad-ali-khan-2181',
    name: 'Muhammad Ali Khan',
    fatherName: 'Muhammad Khan',
    class: 'BS Computer Science',
    rollNo: '2181',
    enrollmentType: 'BS Level',
    session: '2024–2028',
    admissionNo: '2181',
    regNo: 'UOP-2024-REG-9812',
    dob: '15 March 2005',
    bloodGroup: 'B+',
    cnic: '17301-3829103-5',
    phone: '+92 333 9876543',
    address: 'Aslam Dheri Colony, Peshawar',
    status: 'Regular',
    photoFile: 'MUHAMMAD ALI KHAN  2181.png',
  },
  {
    slug: 'muhammad-raza-2182',
    name: 'Muhammad Raza',
    fatherName: 'Abdul Rauf',
    class: 'BS Computer Science',
    rollNo: '2182',
    enrollmentType: 'Morning Shift',
    session: '2026–2028',
    admissionNo: '2182',
    dob: '5 March 2004',
    bloodGroup: 'A+',
    cnic: '17301-3829107-7',
    phone: '+92 333 9876543',
    address: 'University Town, Peshawar',
    status: 'Regular',
    photoFile: 'MUHAMMAD Raza 2182.png',
  },
  {
    slug: 'usman-khan-2183',
    name: 'Usman Khan',
    fatherName: 'Gul Rahman',
    class: 'BS Computer Science',
    rollNo: '2183',
    enrollmentType: 'Evening Shift',
    session: '2026–2028',
    admissionNo: '2183',
    dob: '25 June 2000',
    bloodGroup: 'A-',
    cnic: '17301-3213104-1',
    phone: '+92 334 8765432',
    address: 'Hayatabad Phase 3, Peshawar',
    status: 'Regular',
    photoFile: 'Usman Khan 2183.png',
  },
  {
    slug: 'bilal-ahmad-2184',
    name: 'Bilal Ahmad',
    fatherName: 'Muhammad Sadiq',
    class: 'BS Computer Science',
    rollNo: '2184',
    enrollmentType: 'Self Finance',
    session: '2026–2028',
    admissionNo: '2184',
    dob: '15 June 2002',
    bloodGroup: 'O+',
    cnic: '17301-3882107-7',
    phone: '+92 300 6543210',
    address: 'Tehkal Bala, Peshawar',
    status: 'Regular',
    photoFile: 'Bilal Ahmad 2184.png',
  },
];

/** Demo samples + imported Self Finance cohort */
export const STUDENTS: Student[] = [...DEMO_STUDENTS, ...SELF_FINANCE_STUDENTS];

export function getStudentBySlug(slug: string | undefined): Student | undefined {
  if (!slug) return undefined;
  return STUDENTS.find((s) => s.slug === slug.toLowerCase());
}

export function studentPhotoUrl(student: Pick<Student, 'photoUrl' | 'photoFile'>): string {
  if (student.photoUrl) return student.photoUrl;
  if (student.photoFile) {
    // Encode each path segment so folders like self-finance/ stay as real slashes
    const encoded = student.photoFile
      .split('/')
      .map((part) => encodeURIComponent(part))
      .join('/');
    return `${import.meta.env.BASE_URL}student/${encoded}`;
  }
  return '';
}

/** Resolve a student from an encrypted URL token only (plain name-roll URLs fail). */
export function getStudentByToken(token: string | undefined): Student | undefined {
  const slug = decryptStudentToken(token);
  if (!slug) return undefined;
  return getStudentBySlug(slug);
}

/** Local first, then remote. Honours admin deletions. */
export async function resolveStudentByToken(token: string | undefined): Promise<StudentResolveResult> {
  const slug = decryptStudentToken(token);
  if (!slug) return { status: 'not_found' };

  try {
    if (await isStudentDeleted(slug)) return { status: 'deleted' };
  } catch {
    /* continue lookup */
  }

  const local = getStudentBySlug(slug);
  if (local) return { status: 'ok', student: local };

  try {
    const remote = await fetchStudentBySlug(slug);
    if (remote) return { status: 'ok', student: remote };
  } catch {
    /* ignore */
  }

  return { status: 'not_found' };
}

export { encryptStudentSlug, decryptStudentToken } from '../utils/studentToken';
