export const ENROLLMENT_TYPES = [
  'BS Level',
  'Morning Shift',
  'Evening Shift',
  'Self Finance',
] as const;

export type EnrollmentType = (typeof ENROLLMENT_TYPES)[number];

export const CLASS_YEARS = ['1st year', '2nd year', 'BS'] as const;
export type ClassYear = (typeof CLASS_YEARS)[number];

export const DISCIPLINES = ['Computer Science', 'Pre-Medical', 'Pre-Engineering', 'Arts'] as const;
export type Discipline = (typeof DISCIPLINES)[number];

/** Fixed academic session for 1st year / 2nd year profiles. */
export const FIXED_INTER_SESSION = '2026-2028';

export type StudentRecord = {
  id?: string;
  /** Internal id: name-roll (never used in public URLs) */
  slug: string;
  name: string;
  fatherName: string;
  /** Discipline / degree program (shown as Discipline on profile) */
  class: string;
  /** Year level: 1st year | 2nd year | BS (shown as Class on profile) */
  classYear?: string;
  rollNo: string;
  enrollmentType: string;
  session: string;
  admissionNo: string;
  regNo?: string;
  dob: string;
  bloodGroup: string;
  cnic: string;
  phone: string;
  address: string;
  status: string;
  /** Legacy local file under public/student/ */
  photoFile?: string;
  /** Remote hosted photo (preferred when set) */
  photoUrl?: string;
  createdAt?: number;
};

export const STUDENT_EXCEL_HEADERS = [
  'Name',
  'Father Name',
  'Roll No',
  'Class/Degree Program',
  'Academic Session',
  'Admission Number',
  'University Reg. Number',
  'Date of Birth',
  'Blood Group',
  'CNIC / Form-B',
  'Guardian Contact Number',
  'Permanent Address',
  'Status',
  'Photo File Name',
] as const;
