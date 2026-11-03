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
import { SELF_FINANCE_STUDENTS } from './selfFinanceStudents';
import { MORNING_SECOND_YEAR_STUDENTS } from './morningSecondYearStudents';
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
  ...MORNING_SECOND_YEAR_STUDENTS,
  ...MORNING_CS_STUDENTS,
  ...MORNING_ARTS_STUDENTS,
  ...MORNING_PRE_ENGINEERING_STUDENTS,
  ...MORNING_PRE_MEDICAL_STUDENTS,
  ...EVENING_CS_STUDENTS,
  ...EVENING_PRE_MEDICAL_STUDENTS,
  ...EVENING_PRE_ENGINEERING_STUDENTS,
  ...SELF_FINANCE_STUDENTS,
];

export function getStudentBySlug(slug: string | undefined): Student | undefined {
  if (!slug) return undefined;
  const key = resolveStudentSlug(slug);
  return STUDENTS.find((s) => s.slug === key);
}

/** Old published slugs that must keep working after a roll-number correction. */
const STUDENT_SLUG_ALIASES: Record<string, string> = {
  'asim-khan-770': 'muhammad-hasnain-770',
  'abdul-kabeer-khan-514': 'abdul-kabeer-khan-329',
  'muhammad-okasha-1123': 'okasha-khilji-1123',
  'mohammad-abuzar-3054': 'abuzar-khan-3054',
  'rahman-akmal-515': 'rahman-akmal-333',
  'shamir-malik-608': 'shahmir-malik-608',
  'shahzaib-rahman-19': 'syed-m-sudais-ali-shah-19',
  's-ali-nami-shah-3040': 'syed-ali-naqi-shah-3040',
  'aftab-ahmad-1043': 'noor-muhammad-1043',
  'safeen-ullah-633': 'safeenullah-633',
  'm-talha-606': 'muhammad-hassan-606',
  'amjad-ali-06': 'amjid-ali-06',
  'sohail-khan-605': 'muneeb-ur-rehman-605',
  'salman-khan-7354': 'salman-khan-71',
  'm-ibrahim-shah-3309': 'ibrahim-shah-3309',
  'manzoor-ahmad-793': 'manzoor-ahmad-122',
  'shoaibullah-7302': 'sohaib-ullah-7302',
  'mubeen-saqib-55': 'muhammad-saqib-55',
  'hamad-ali-1554': 'hammad-ali-1554',
  'muhammad-arman-khan-630': 'm-arman-khan-630',
  'tahseen-ullah-3062': 'tehseen-ullah-3062',
  'm-adil-khan-8103': 'muhammad-kashif-8103',
  'abbas-ahmad-642': 'abbas-ahmad-134',
  'yasir-amin-3024': 'yasir-amin-756',
  'm-awais-2162': 'm-awais-2163',
  'm-rohan-1223': 'muhammad-rohan-1223',
  'm-ali-7185': 'muhammad-ali-7185',
  'm-ismail-7268': 'm-ismail-7264',
  'm-noor-ahmad-7163': 'muhammad-noor-ahmad-7163',
  'm-ishaq-8060': 'muhammad-ishaq-8059',
  'abdul-rafay-7214': 'abdul-rafay-8096',
  // Evening 1610 → Morning 1117 (Muhammad Afnan; Uzair Hayat cancelled)
  'muhammad-afnan-1610': 'muhammad-afnan-1117',
  // MIX batch corrections (old printed cards keep working)
  'm-ijaz-khan-171': 'muhammad-ijaz-khan-171',
  'muhammad-ahmad-609': 'sufyan-609',
  'muhammad-yousas-610': 'm-atif-afridi-610',
  'mukhtair-aziz-603': 'tanveer-ahmed-603',
  'm-hassan-8128': 'muhammad-hassan-8128',
  'm-sanan-7052': 'muhammad-sanan-7052',
  'm-sohaib-7058': 'muhammad-sohail-7058',
  'hammad-khan-7246': 'hamad-khan-7246',
  'munsif-khan-6579': 'muhammad-daniyal-6579',
  'm-ahmad-7372': 'muhammad-ahmad-7372',
  'm-akbar-7219': 'muhammad-akbar-7219',
  'ahmad-bilal-116': 'syed-muhammad-idrees-116',
  'abdur-rehman-1073': 'abdul-rehman-1073',
  'musannif-ahmad-129': 'junaid-khan-129',
  'ikram-ullah-266': 'abraham-cyril-kanwal-266',
  'sanan-khan-266': 'abraham-cyril-kanwal-266',
  'mehtab-khan-1091': 'mustaf-khan-1091',
  'talha-atta-271': 'm-ahmad-271',
  'abu-huraira-41': 'muhammad-umar-farooq-41',
  'muhammad-shayan-42': 'shafiullah-42',
  'm-aleem-siddiqui-2063': 'huzaif-khalil-2063',
  'm-salal-1639': 'muhammad-oraish-khan-1639',
  // New_MAX_DATA renames (old printed cards keep working)
  'sahibzada-ahmad-zia-2233': 'shahzada-ahmad-zia-2233',
  'malik-farhan-muhammad-1565': 'muhammad-farhan-malik-1565',
  'amir-mehmood-khan-2191': 'aamir-mehmood-khan-2191',
  // 1st-year evening rename (Muhaib Ukasha → M. Ukashah)
  'muhaib-ukasha-679': 'm-ukashah-679',
  // Medical evening → morning transfers (old evening cards keep working)
  'abubakar-siddique-521': 'abubakar-siddique-342',
  'muhammad-sudais-522': 'muhammad-sudais-335',
  'muhammad-hamza-535': 'muhammad-hamza-348',
  'm-mashhood-ullah-626': 'muhammad-mashhood-ullah-302',
  'mehran-jalal-681': 'muhammad-jalal-152',
  // Yas Barki briefly published under 1674; correct roll is 1671
  'm-yas-barki-zai-1674': 'm-yas-barki-zai-1671',
  // Umar Ali was imported as 1670; correct roll/photo is 1674
  'm-umar-ali-1670': 'm-umar-ali-1674',
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
