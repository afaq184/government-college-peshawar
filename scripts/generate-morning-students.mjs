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

/** Match Excel photo name to disk (handles 01.png vs 1.png, roll_b.png, "2276 M.png", .jpeg, .jfif, etc.). */
function findPhotoFile(photos, photoName, rollNo) {
  const ext = path.extname(photoName || '.png') || '.png';
  const base = (photoName || '').replace(/\.[^.]+$/, '');
  const roll = String(rollNo).trim();
  const rollNum = Number.isFinite(parseInt(roll, 10)) ? String(parseInt(roll, 10)) : roll;
  const alts = [ext, '.png', '.jpg', '.jpeg', '.jfif', '.JFIF', '.PNG', '.JPG', '.JPEG'];
  const candidates = new Set();
  for (const e of alts) {
    candidates.add(photoName);
    candidates.add(`${roll}${e}`);
    candidates.add(`${rollNum}${e}`);
    if (base) {
      candidates.add(`${base}${e}`);
      candidates.add(`${base.replace(/^0+/, '')}${e}`);
      candidates.add(`${base}_b${e}`);
      candidates.add(`${base} M${e}`);
    }
    candidates.add(`${roll.replace(/^0+/, '')}${e}`);
    candidates.add(`${roll}_b${e}`);
    candidates.add(`${rollNum}_b${e}`);
    candidates.add(`${roll} M${e}`);
    candidates.add(`${rollNum} M${e}`);
  }
  for (const candidate of candidates) {
    if (candidate && photos.has(candidate)) return candidate;
  }
  // Fallback: any file that starts with the roll number (e.g. "2276 M.png")
  for (const file of photos) {
    if (file === photoName) return file;
    const fileBase = file.replace(/\.[^.]+$/, '');
    if (
      fileBase === roll ||
      fileBase === rollNum ||
      fileBase.startsWith(`${roll} `) ||
      fileBase.startsWith(`${rollNum} `)
    ) {
      return file;
    }
  }
  return null;
}

const COHORTS = [
  {
    sources: [
      {
        excel: 'public/student/morning-students/computer-science-data.xlsx',
        photoDir: 'public/student/morning-students/computer-science-pic',
        photoPrefix: 'morning-students/computer-science-pic',
      },
      {
        excel: 'public/student/morning-students/second_phase/computer_science_student_data.xlsx',
        photoDir: 'public/student/morning-students/second_phase/computer_second_phase_pic',
        photoPrefix: 'morning-students/second_phase/computer_second_phase_pic',
        // These students belong to Evening Shift (see computer eveing.xlsx)
        excludeRolls: ['2276', '2277', '2101', '2181', '2102'],
      },
      {
        excel: 'public/student/morning-students/cs_morning_remains/cs morning data.xlsx',
        photoDir: 'public/student/morning-students/cs_morning_remains/cs_morning_remaning_pic',
        photoPrefix: 'morning-students/cs_morning_remains/cs_morning_remaning_pic',
      },
    ],
    className: 'Computer Science',
    outFile: 'src/data/morningComputerScienceStudents.ts',
    exportName: 'MORNING_CS_STUDENTS',
    comment: 'Morning Shift — Computer Science 1st Year (2026-27), phase 1 + phase 2 + remains.',
  },
  {
    // Phase 1 + phase 2 + phase 3 Arts merged into one export
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
      {
        excel: 'public/student/morning-students/phase_3_arts_Pre_engineeing/arts/Arts data.xlsx',
        photoDir: 'public/student/morning-students/phase_3_arts_Pre_engineeing/arts/arts pic',
        photoPrefix: 'morning-students/phase_3_arts_Pre_engineeing/arts/arts pic',
      },
      {
        excel: 'public/student/morning-students/phase_fifith_arts/arts.xlsx',
        photoDir: 'public/student/morning-students/phase_fifith_arts/arts_pics',
        photoPrefix: 'morning-students/phase_fifith_arts/arts_pics',
      },
    ],
    className: 'Arts',
    outFile: 'src/data/morningArtsStudents.ts',
    exportName: 'MORNING_ARTS_STUDENTS',
    comment: 'Morning Shift — Arts 1st Year (2026-27), phase 1 + phase 2 + phase 3 + phase 5.',
  },
  {
    sources: [
      {
        excel: 'public/student/morning-students/pre-engineering.xlsx',
        photoDir: 'public/student/morning-students/pre-engineering-pic',
        photoPrefix: 'morning-students/pre-engineering-pic',
      },
      {
        excel: 'public/student/morning-students/second_phase/Pre-Engineering_Students_student_data.xlsx',
        photoDir: 'public/student/morning-students/second_phase/pre-enginering-pic',
        photoPrefix: 'morning-students/second_phase/pre-enginering-pic',
      },
      {
        excel:
          'public/student/morning-students/phase_3_arts_Pre_engineeing/pre-engineering/Pre-Engineering data.xlsx',
        photoDir:
          'public/student/morning-students/phase_3_arts_Pre_engineeing/pre-engineering/pre-engineering pic',
        photoPrefix:
          'morning-students/phase_3_arts_Pre_engineeing/pre-engineering/pre-engineering pic',
      },
      {
        excel: 'public/student/morning-students/Pre_engineering_morning_1/pre-engineering moring.xlsx',
        photoDir:
          'public/student/morning-students/Pre_engineering_morning_1/pre-enginerring_morning_pic',
        photoPrefix:
          'morning-students/Pre_engineering_morning_1/pre-enginerring_morning_pic',
      },
    ],
    className: 'Pre-Engineering',
    outFile: 'src/data/morningPreEngineeringStudents.ts',
    exportName: 'MORNING_PRE_ENGINEERING_STUDENTS',
    comment:
      'Morning Shift — Pre-Engineering 1st Year (2026-27), phase 1 + phase 2 + phase 3 + morning_1.',
  },
  {
    sources: [
      {
        excel: 'public/student/morning-students/pre-medical.xlsx',
        photoDir: 'public/student/morning-students/Pre-medical-pic',
        photoPrefix: 'morning-students/Pre-medical-pic',
      },
      {
        excel: 'public/student/morning-students/second_phase/Pre-Medical.xlsx',
        photoDir: 'public/student/morning-students/second_phase/pre-medical',
        photoPrefix: 'morning-students/second_phase/pre-medical',
        // These students belong to Evening Shift (see pre-medical-eveing.xlsx)
        excludeRolls: ['501', '502', '503', '504', '505', '506', '210', '507', '508'],
      },
    ],
    className: 'Pre-Medical',
    outFile: 'src/data/morningPreMedicalStudents.ts',
    exportName: 'MORNING_PRE_MEDICAL_STUDENTS',
    comment: 'Morning Shift — Pre-Medical 1st Year (2026-27), phase 1 + phase 2.',
  },
  {
    sources: [
      {
        excel: 'public/student/morning-students/sports/sports_data.xlsx',
        photoDir: 'public/student/morning-students/sports/Sports_pic',
        photoPrefix: 'morning-students/sports/Sports_pic',
      },
    ],
    className: 'Sports',
    outFile: 'src/data/morningSportsStudents.ts',
    exportName: 'MORNING_SPORTS_STUDENTS',
    comment:
      'Morning Shift — Sports quota 1st Year (2026-27). Discipline field keeps each student academic track.',
  },
];

function normalizeBloodGroup(value) {
  const v = String(value || '').trim();
  if (!v || v === '--' || v === '-' || /^not\s*(specified|provided)$/i.test(v)) return '';
  return v;
}

function normalizeOptional(value) {
  const v = String(value || '').trim();
  if (!v || v === '--' || v === '-' || /^not\s*(specified|provided)$/i.test(v)) return '';
  return v;
}

function normalizeDiscipline(value, className) {
  const v = String(value || '').trim();
  if (!v || /^not\s*specified$/i.test(v)) return className;
  if (/^medical$/i.test(v)) return 'Pre-Medical';
  if (/^engineering$/i.test(v)) return 'Pre-Engineering';
  if (/^(c\.?\s*science|computer\s*science(\s*\(c\/s\))?)$/i.test(v)) return 'Computer Science';
  return v;
}

/** Find the header row index when sheets have title/summary rows above the table. */
function findHeaderRowIndex(matrix) {
  for (let i = 0; i < matrix.length; i++) {
    const cells = (matrix[i] || []).map((c) => String(c || '').trim().toLowerCase());
    const hasRoll = cells.some((c) => c === 'roll no' || c === 'rollno' || c === 'roll number');
    const hasName = cells.some((c) => c === 'name' || c === 'student name');
    if (hasRoll && hasName) return i;
  }
  return 0;
}

function readSheetRows(sheet) {
  const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  const headerIdx = findHeaderRowIndex(matrix);
  const headers = (matrix[headerIdx] || []).map((h) => String(h || '').trim());
  const rows = [];
  for (let i = headerIdx + 1; i < matrix.length; i++) {
    const line = matrix[i] || [];
    if (!line.some((c) => String(c || '').trim())) continue;
    const obj = {};
    headers.forEach((h, col) => {
      if (!h) return;
      obj[h] = line[col];
    });
    rows.push(obj);
  }
  return rows;
}

function parseSourceRows(source, className) {
  const wb = XLSX.readFile(path.join(root, source.excel));
  const sheetName =
    wb.SheetNames.find((n) => {
      const lower = n.toLowerCase();
      return lower !== 'instructions' && lower !== 'verification';
    }) || wb.SheetNames[0];
  const rows = readSheetRows(wb.Sheets[sheetName]);
  const photoDir = path.join(root, source.photoDir);
  const photos = new Set(
    fs.existsSync(photoDir)
      ? fs.readdirSync(photoDir).filter((f) => /\.(png|jpe?g|jfif|webp|gif)$/i.test(f))
      : []
  );
  let missingPhotos = 0;
  const excludeRolls = new Set((source.excludeRolls || []).map(String));

  const students = rows
    .map((r) => {
      const name = cell(r, 'Name', 'Student Name');
      const roll = cell(r, 'Roll No', 'RollNo', 'Roll Number', 'Enrollment');
      if (!name || !roll) return null;
      if (excludeRolls.has(roll)) return null;
      // Skip summary / non-data rows mistakenly parsed as students
      if (!/^\d+[a-z]?$/i.test(roll)) return null;

      const photo = cell(r, 'Photo File Name', 'Photo', 'Photo File');
      const discipline = normalizeDiscipline(
        cell(r, 'Discipline', 'Discipline/Subject', 'Degree Program'),
        className
      );
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
        session: cell(r, 'Academic Session', 'Session') || '2026-27',
        admissionNo: cell(r, 'Admission Number', 'Admission No') || roll,
        dob: normalizeOptional(cell(r, 'Date of Birth', 'DOB')),
        bloodGroup: normalizeBloodGroup(cell(r, 'Blood Group')),
        cnic: normalizeOptional(cell(r, 'CNIC / Form-B', 'CNIC', 'Form-B')),
        phone: normalizeOptional(
          cell(
            r,
            'Guardian Contact Number',
            'Enrollment Guardian Contact Number',
            'Contact Number',
            'Phone',
            'Contact'
          )
        ),
        address: normalizeOptional(cell(r, 'Permanent Address', 'Address')),
        status: normalizeOptional(cell(r, 'Status', 'Student Status')) || 'Active',
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

  // Keep valid TS string literals: escape apostrophes before switching JSON "..." to '...'
  const body = JSON.stringify(students, null, 2)
    .replace(/'/g, "\\'")
    .replace(/"([^"]+)":/g, '$1:')
    .replace(/"/g, "'");

  const out = `import type { StudentRecord } from '../types/student';

/** ${config.comment} */
export const ${config.exportName}: StudentRecord[] = ${body};
`;

  fs.writeFileSync(path.join(root, config.outFile), out);
  console.log(`Wrote ${students.length} students -> ${config.outFile}`);
}

for (const cohort of COHORTS) {
  generateCohort(cohort);
}
