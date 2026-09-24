import { decryptStudentToken } from '../utils/studentToken';
import { fetchStudentBySlug, isStudentDeleted } from '../lib/studentService';
import { MORNING_ARTS_STUDENTS } from './morningArtsStudents';
import { MORNING_CS_STUDENTS } from './morningComputerScienceStudents';
import { MORNING_PRE_MEDICAL_STUDENTS } from './morningPreMedicalStudents';
import { MORNING_PRE_ENGINEERING_STUDENTS } from './morningPreEngineeringStudents';
import { MORNING_SPORTS_STUDENTS } from './morningSportsStudents';
import { EVENING_CS_STUDENTS } from './eveningComputerScienceStudents';
import { EVENING_PRE_MEDICAL_STUDENTS } from './eveningPreMedicalStudents';
import { EVENING_PRE_ENGINEERING_STUDENTS } from './eveningPreEngineeringStudents';
import type { StudentRecord } from '../types/student';

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
    session: '2026-2028',
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
    class: 'Computer Science',
    rollNo: '2182',
    enrollmentType: 'Morning Shift',
    session: '2026-2028',
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
    class: 'Computer Science',
    rollNo: '2183',
    enrollmentType: 'Evening Shift',
    session: '2026-2028',
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
    class: 'Computer Science',
    rollNo: '2184',
    enrollmentType: 'Self Finance',
    session: '2026-2028',
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

/** Local demo samples + imported cohorts (Admin also merges Firestore). */
export const STUDENTS: Student[] = [
  ...DEMO_STUDENTS,
  // Sports quota listed first so sports photos win when roll/slug already exists in another cohort.
  ...MORNING_SPORTS_STUDENTS,
  ...MORNING_CS_STUDENTS,
  ...MORNING_ARTS_STUDENTS,
  ...MORNING_PRE_ENGINEERING_STUDENTS,
  ...MORNING_PRE_MEDICAL_STUDENTS,
  ...EVENING_CS_STUDENTS,
  ...EVENING_PRE_MEDICAL_STUDENTS,
  ...EVENING_PRE_ENGINEERING_STUDENTS,
];

export function getStudentBySlug(slug: string | undefined): Student | undefined {
  if (!slug) return undefined;
  const key = resolveStudentSlug(slug);
  return STUDENTS.find((s) => s.slug === key);
}

/** Old published slugs that must keep working after a roll-number correction. */
const STUDENT_SLUG_ALIASES: Record<string, string> = {
  'm-yas-barki-zai-1674': 'm-yas-barki-zai-1671',
};

function resolveStudentSlug(slug: string): string {
  const key = slug.toLowerCase();
  return STUDENT_SLUG_ALIASES[key] || key;
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
  const rawSlug = decryptStudentToken(token);
  if (!rawSlug) return { status: 'not_found' };
  const slug = resolveStudentSlug(rawSlug);

  try {
    if (await isStudentDeleted(slug) || await isStudentDeleted(rawSlug)) return { status: 'deleted' };
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
