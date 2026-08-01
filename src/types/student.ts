export const ENROLLMENT_TYPES = [
  'BS Level',
  'Morning Shift',
  'Evening Shift',
  'Self Finance',
] as const;

export type EnrollmentType = (typeof ENROLLMENT_TYPES)[number];

export type StudentRecord = {
  id?: string;
  /** Internal id: name-roll (never used in public URLs) */
  slug: string;
  name: string;
  fatherName: string;
  class: string;
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
