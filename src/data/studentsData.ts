import { decryptStudentToken } from '../utils/studentToken';

export interface Student {
  /** Internal id: name-roll (never used in public URLs) */
  slug: string;
  name: string;
  fatherName: string;
  class: string;
  rollNo: string;
  /** Enrollment type (e.g. BS Level, Morning Shift, Self Finance) */
  enrollmentType: string;
  session: string;
  admissionNo: string;
  /** Omit for students without a university registration number */
  regNo?: string;
  dob: string;
  bloodGroup: string;
  cnic: string;
  phone: string;
  address: string;
  status: string;
  /** Exact filename under public/student/ */
  photoFile: string;
}

export const STUDENTS: Student[] = [
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

export function getStudentBySlug(slug: string | undefined): Student | undefined {
  if (!slug) return undefined;
  return STUDENTS.find((s) => s.slug === slug.toLowerCase());
}

export function studentPhotoUrl(photoFile: string): string {
  return `${import.meta.env.BASE_URL}student/${encodeURIComponent(photoFile)}`;
}

/** Resolve a student from an encrypted URL token only (plain name-roll URLs fail). */
export function getStudentByToken(token: string | undefined): Student | undefined {
  const slug = decryptStudentToken(token);
  if (!slug) return undefined;
  return getStudentBySlug(slug);
}

export { encryptStudentSlug, decryptStudentToken } from '../utils/studentToken';
