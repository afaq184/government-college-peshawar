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

/** Match Excel photo name to disk (handles 01.png vs 1.png, roll_b.png, etc.). */
function findPhotoFile(photos, photoName, rollNo) {
  const ext = path.extname(photoName || '.png') || '.png';
  const base = (photoName || '').replace(/\.[^.]+$/, '');
  const roll = String(rollNo).trim();
  const rollNum = String(parseInt(roll, 10));
  const candidates = new Set([
    photoName,
    `${roll}${ext}`,
    `${rollNum}${ext}`,
    `${base.replace(/^0+/, '')}${ext}`,
    `${roll.replace(/^0+/, '')}${ext}`,
    `${roll}_b${ext}`,
    `${rollNum}_b${ext}`,
    `${base}_b${ext}`,
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
    // Phase 1 + phase 2 Arts merged into one export
    sources: [
      {
        excel: 'public/student/morning-students/Arts.xlsx',
        photoDir: 'public/student/morning-students/arts-pic',
        photoPrefix: 'morning-students/arts-pic',
      },
      {
        excel: 'public/student/morning-students/second_phase/Arts.xlsx',
        photoDir: 'public/student/morning-students/second_phase/arts second phase student',
        photoPrefix: 'morning-students/second_phase/arts second phase student',
      },
    ],
    className: 'Arts',
    outFile: 'src/data/morningArtsStudents.ts',
    exportName: 'MORNING_ARTS_STUDENTS',
    comment: 'Morning Shift — Arts 1st Year (2026-27), phase 1 + phase 2.',
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

function normalizeBloodGroup(value) {
  const v = String(value || '').trim();
  if (!v || v === '--' || v === '-') return '';
  return v;
}

function parseSourceRows(source, className) {
  const wb = XLSX.readFile(path.join(root, source.excel));
  const sheetName = wb.SheetNames.find((n) => n.toLowerCase() !== 'instructions') || wb.SheetNames[0];
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName]);
  const photoDir = path.join(root, source.photoDir);
  const photos = new Set(fs.existsSync(photoDir) ? fs.readdirSync(photoDir) : []);
  let missingPhotos = 0;

  const students = rows
    .map((r) => {
      const name = cell(r, 'Name');
      const roll = cell(r, 'Roll No', 'RollNo', 'Roll Number');
      if (!name || !roll) return null;

      const photo = cell(r, 'Photo File Name', 'Photo', 'Photo File');
      const discipline = cell(r, 'Discipline', 'Degree Program') || className;
      const matchedPhoto = findPhotoFile(photos, photo, roll);
      if (!matchedPhoto) missingPhotos += 1;
      const photoPath = matchedPhoto ? `${source.photoPrefix}/${matchedPhoto}` : undefined;

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
        bloodGroup: normalizeBloodGroup(cell(r, 'Blood Group')),
        cnic: cell(r, 'CNIC / Form-B', 'CNIC', 'Form-B'),
        phone: cell(r, 'Guardian Contact Number', 'Phone', 'Contact'),
        address: cell(r, 'Permanent Address', 'Address'),
        status: cell(r, 'Status') || 'Active',
        ...(photoPath ? { photoFile: photoPath } : {}),
      };
    })
    .filter(Boolean);

  return { students, missingPhotos, excel: source.excel };
}

function generateCohort(config) {
  const sources = config.sources || [
    {
      excel: config.excel,
      photoDir: config.photoDir,
      photoPrefix: config.photoPrefix,
    },
  ];

  const students = [];
  const seenSlugs = new Set();

  for (const source of sources) {
    const { students: batch, missingPhotos, excel } = parseSourceRows(source, config.className);
    let added = 0;
    for (const student of batch) {
      if (seenSlugs.has(student.slug)) {
        console.warn(`  skip duplicate slug ${student.slug} from ${excel}`);
        continue;
      }
      seenSlugs.add(student.slug);
      students.push(student);
      added += 1;
    }
    console.log(
      `  ${excel}: ${added} students` +
        (missingPhotos ? ` (${missingPhotos} without matched photo)` : '')
    );
  }

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
