import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

function makeStudentSlug(name, rollNo) {
  return `${name}-${rollNo}`
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function cell(row, ...keys) {
  for (const key of keys) {
    const found = Object.keys(row).find((k) => k.trim().toLowerCase() === key.toLowerCase());
    if (found != null && row[found] != null && String(row[found]).trim() !== '') {
      return String(row[found]).trim();
    }
  }
  return '';
}

/** Match Excel photo name to disk (handles 01.png vs 1.png, roll-only names, etc.). */
function findPhotoFile(photos, photoName, rollNo) {
  const ext = path.extname(photoName || '.png') || '.png';
  const base = (photoName || '').replace(/\.[^.]+$/, '');
  const roll = String(rollNo).trim();
  const candidates = new Set([
    photoName,
    `${roll}${ext}`,
    `${String(parseInt(roll, 10))}${ext}`,
    `${base.replace(/^0+/, '')}${ext}`,
    `${roll.replace(/^0+/, '')}${ext}`,
  ]);
  for (const candidate of candidates) {
    if (candidate && photos.has(candidate)) return candidate;
  }
  return null;
}

const COHORTS = [
  {
    excel: 'public/student/morning-students/computer-science-data.xlsx',
    photoDir: 'public/student/morning-students/computer-science-pic',
    photoPrefix: 'morning-students/computer-science-pic',
    className: 'Computer Science',
    outFile: 'src/data/morningComputerScienceStudents.ts',
    exportName: 'MORNING_CS_STUDENTS',
    comment: 'Morning Shift — Computer Science 1st Year (2026-27).',
  },
  {
    excel: 'public/student/morning-students/Arts.xlsx',
    photoDir: 'public/student/morning-students/arts-pic',
    photoPrefix: 'morning-students/arts-pic',
    className: 'Arts',
    outFile: 'src/data/morningArtsStudents.ts',
    exportName: 'MORNING_ARTS_STUDENTS',
    comment: 'Morning Shift — Arts 1st Year (2026-27).',
  },
  {
    excel: 'public/student/morning-students/pre-engineering.xlsx',
    photoDir: 'public/student/morning-students/pre-engineering-pic',
    photoPrefix: 'morning-students/pre-engineering-pic',
    className: 'Pre-Engineering',
    outFile: 'src/data/morningPreEngineeringStudents.ts',
    exportName: 'MORNING_PRE_ENGINEERING_STUDENTS',
    comment: 'Morning Shift — Pre-Engineering 1st Year (2026-27).',
  },
  {
    excel: 'public/student/morning-students/pre-medical.xlsx',
    photoDir: 'public/student/morning-students/Pre-medical-pic',
    photoPrefix: 'morning-students/Pre-medical-pic',
    className: 'Pre-Medical',
    outFile: 'src/data/morningPreMedicalStudents.ts',
    exportName: 'MORNING_PRE_MEDICAL_STUDENTS',
    comment: 'Morning Shift — Pre-Medical 1st Year (2026-27).',
  },
];

function generateCohort(config) {
  const wb = XLSX.readFile(path.join(root, config.excel));
  const sheetName = wb.SheetNames.find((n) => n.toLowerCase() !== 'instructions') || wb.SheetNames[0];
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName]);
  const photoDir = path.join(root, config.photoDir);
  const photos = new Set(fs.readdirSync(photoDir));

  const students = rows
    .map((r) => {
      const name = cell(r, 'Name');
      const roll = cell(r, 'Roll No', 'RollNo', 'Roll Number');
      if (!name || !roll) return null;

      const photo = cell(r, 'Photo File Name', 'Photo', 'Photo File');
      const discipline = cell(r, 'Discipline', 'Degree Program') || config.className;
      const matchedPhoto = findPhotoFile(photos, photo, roll);
      const photoPath = matchedPhoto ? `${config.photoPrefix}/${matchedPhoto}` : undefined;

      return {
        slug: makeStudentSlug(name, roll),
        name,
        fatherName: cell(r, 'Father Name', "Father's Name", 'Father', 'S/O'),
        class: discipline,
        rollNo: roll,
        enrollmentType: 'Morning Shift',
        session: cell(r, 'Academic Session', 'Session'),
        admissionNo: cell(r, 'Admission Number', 'Admission No') || roll,
        dob: cell(r, 'Date of Birth', 'DOB'),
        bloodGroup: cell(r, 'Blood Group'),
        cnic: cell(r, 'CNIC / Form-B', 'CNIC', 'Form-B'),
        phone: cell(r, 'Guardian Contact Number', 'Phone', 'Contact'),
        address: cell(r, 'Permanent Address', 'Address'),
        status: cell(r, 'Status') || 'Active',
        ...(photoPath ? { photoFile: photoPath } : {}),
      };
    })
    .filter(Boolean);

  const out = `import type { StudentRecord } from '../types/student';

/** ${config.comment} */
export const ${config.exportName}: StudentRecord[] = ${JSON.stringify(students, null, 2)
    .replace(/"([^"]+)":/g, '$1:')
    .replace(/"/g, "'")};
`;

  fs.writeFileSync(path.join(root, config.outFile), out);
  console.log(`Wrote ${students.length} students -> ${config.outFile}`);
}

for (const cohort of COHORTS) {
  generateCohort(cohort);
}
