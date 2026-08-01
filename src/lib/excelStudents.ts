import * as XLSX from 'xlsx';
import { STUDENT_EXCEL_HEADERS, type EnrollmentType, type StudentRecord } from '../types/student';
import { makeStudentSlug } from './studentService';

type Row = Record<string, unknown>;

const SAMPLE_BY_TYPE: Record<EnrollmentType, Partial<StudentRecord>> = {
  'BS Level': {
    name: 'Muhammad Ali Khan',
    fatherName: 'Muhammad Khan',
    rollNo: '2181',
    class: 'BS Computer Science',
    session: '2024–2028',
    admissionNo: '2181',
    regNo: 'UOP-2024-REG-9812',
    dob: '15 March 2005',
    bloodGroup: 'B+',
    cnic: '17301-3829103-5',
    phone: '+92 333 9876543',
    address: 'Aslam Dheri Colony, Peshawar',
    status: 'Regular',
    photoFile: '2181.jpg',
  },
  'Morning Shift': {
    name: 'Muhammad Raza',
    fatherName: 'Abdul Rauf',
    rollNo: '2182',
    class: 'BS Computer Science',
    session: '2026–2028',
    admissionNo: '2182',
    regNo: '',
    dob: '5 March 2004',
    bloodGroup: 'A+',
    cnic: '17301-3829107-7',
    phone: '+92 333 9876543',
    address: 'University Town, Peshawar',
    status: 'Regular',
    photoFile: '2182.jpg',
  },
  'Evening Shift': {
    name: 'Usman Khan',
    fatherName: 'Gul Rahman',
    rollNo: '2183',
    class: 'BS Computer Science',
    session: '2026–2028',
    admissionNo: '2183',
    regNo: '',
    dob: '25 June 2000',
    bloodGroup: 'A-',
    cnic: '17301-3213104-1',
    phone: '+92 334 8765432',
    address: 'Hayatabad Phase 3, Peshawar',
    status: 'Regular',
    photoFile: '2183.jpg',
  },
  'Self Finance': {
    name: 'Bilal Ahmad',
    fatherName: 'Muhammad Sadiq',
    rollNo: '2184',
    class: 'BS Computer Science',
    session: '2026–2028',
    admissionNo: '2184',
    regNo: '',
    dob: '15 June 2002',
    bloodGroup: 'O+',
    cnic: '17301-3882107-7',
    phone: '+92 300 6543210',
    address: 'Tehkal Bala, Peshawar',
    status: 'Regular',
    photoFile: '2184.jpg',
  },
};

function cell(row: Row, ...keys: string[]): string {
  for (const key of keys) {
    const found = Object.keys(row).find((k) => k.trim().toLowerCase() === key.toLowerCase());
    if (found != null && row[found] != null && String(row[found]).trim() !== '') {
      return String(row[found]).trim();
    }
  }
  return '';
}

export function downloadStudentTemplate(enrollmentType: EnrollmentType): void {
  const sample = SAMPLE_BY_TYPE[enrollmentType];
  const rows = [
    {
      Name: sample.name,
      'Father Name': sample.fatherName,
      'Roll No': sample.rollNo,
      'Class/Degree Program': sample.class,
      'Academic Session': sample.session,
      'Admission Number': sample.admissionNo,
      'University Reg. Number': sample.regNo || '',
      'Date of Birth': sample.dob,
      'Blood Group': sample.bloodGroup,
      'CNIC / Form-B': sample.cnic,
      'Guardian Contact Number': sample.phone,
      'Permanent Address': sample.address,
      Status: sample.status,
      'Photo File Name': sample.photoFile || `${sample.rollNo}.jpg`,
    },
  ];

  const ws = XLSX.utils.json_to_sheet(rows, { header: [...STUDENT_EXCEL_HEADERS] });
  ws['!cols'] = STUDENT_EXCEL_HEADERS.map((h) => ({ wch: Math.max(18, h.length + 2) }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Students');

  const note = XLSX.utils.aoa_to_sheet([
    ['Instructions'],
    ['1. Keep the header row exactly as provided.'],
    [`2. This file is for: ${enrollmentType} students only.`],
    ['3. Replace the sample row and add as many students as you need.'],
    ['4. Photo File Name should match the photo you upload (e.g. 2181.jpg or Name RollNo.png).'],
    ['5. University Reg. Number can be left blank if not available.'],
    ['6. Upload this Excel in Admin → Students, then upload matching photo files.'],
  ]);
  note['!cols'] = [{ wch: 90 }];
  XLSX.utils.book_append_sheet(wb, note, 'Instructions');

  const safeName = enrollmentType.replace(/\s+/g, '-');
  XLSX.writeFile(wb, `GCP-Students-${safeName}.xlsx`);
}

export function parseStudentsExcel(file: ArrayBuffer, enrollmentType: EnrollmentType): StudentRecord[] {
  const wb = XLSX.read(file, { type: 'array' });
  const sheetName = wb.SheetNames.find((n) => n.toLowerCase() !== 'instructions') || wb.SheetNames[0];
  const sheet = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Row>(sheet, { defval: '' });

  const students: StudentRecord[] = [];
  for (const row of rows) {
    const name = cell(row, 'Name');
    const rollNo = cell(row, 'Roll No', 'RollNo', 'Roll Number');
    if (!name || !rollNo) continue;

    const photoFile = cell(row, 'Photo File Name', 'Photo', 'Photo File');
    students.push({
      slug: makeStudentSlug(name, rollNo),
      name,
      fatherName: cell(row, 'Father Name', 'Father', 'S/O'),
      class: cell(row, 'Class/Degree Program', 'Class', 'Degree Program'),
      rollNo,
      enrollmentType,
      session: cell(row, 'Academic Session', 'Session'),
      admissionNo: cell(row, 'Admission Number', 'Admission No') || rollNo,
      regNo: cell(row, 'University Reg. Number', 'Reg No', 'Registration Number') || undefined,
      dob: cell(row, 'Date of Birth', 'DOB'),
      bloodGroup: cell(row, 'Blood Group'),
      cnic: cell(row, 'CNIC / Form-B', 'CNIC', 'Form-B'),
      phone: cell(row, 'Guardian Contact Number', 'Phone', 'Contact'),
      address: cell(row, 'Permanent Address', 'Address'),
      status: cell(row, 'Status') || 'Regular',
      photoFile: photoFile || undefined,
    });
  }
  return students;
}

/** Match a photo file to a student by roll no or photo file name from Excel. */
export function matchPhotoFile(
  file: File,
  student: StudentRecord,
): boolean {
  const base = file.name.replace(/\.[^.]+$/, '').toLowerCase().trim();
  const roll = student.rollNo.toLowerCase().trim();
  const expected = (student.photoFile || '').replace(/\.[^.]+$/, '').toLowerCase().trim();
  if (expected && (base === expected || file.name.toLowerCase() === student.photoFile?.toLowerCase())) {
    return true;
  }
  if (base === roll) return true;
  // e.g. "MUHAMMAD ALI KHAN  2181"
  if (base.includes(roll) && base.replace(/\s+/g, ' ').includes(roll)) return true;
  const slugBits = student.slug.replace(/-/g, ' ');
  if (base.replace(/\s+/g, ' ') === slugBits) return true;
  return false;
}
