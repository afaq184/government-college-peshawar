/**
 * Remap Self Finance photos from Excel "Photo File Name" → exact files
 * in public/student/GCP-Students-Self-Finance/student pic/
 */
import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const studentDir = path.join(root, 'public', 'student');
const excelPath = path.join(studentDir, 'Updated_Student_Data_PhotoNames.xlsx');
const photoSrc = path.join(studentDir, 'GCP-Students-Self-Finance', 'student pic');
const dataOut = path.join(root, 'src', 'data', 'selfFinanceStudents.ts');
const PHOTO_PUBLIC_PREFIX = 'GCP-Students-Self-Finance/student pic';

function makeSlug(name, rollNo) {
  return `${name}-${rollNo}`
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function esc(s) {
  return String(s ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\r?\n/g, ' ');
}

if (!fs.existsSync(photoSrc)) {
  console.error('Photo folder missing:', photoSrc);
  process.exit(1);
}

const photosOnDisk = new Map();
for (const name of fs.readdirSync(photoSrc)) {
  const full = path.join(photoSrc, name);
  if (!fs.statSync(full).isFile()) continue;
  photosOnDisk.set(name.toLowerCase(), name);
}

const buf = fs.readFileSync(excelPath);
const wb = XLSX.read(buf, { type: 'buffer' });
const rows = XLSX.utils.sheet_to_json(wb.Sheets['Students'] || wb.Sheets[wb.SheetNames[0]], { defval: '' });

const students = [];
const missing = [];
let matched = 0;

for (const row of rows) {
  const name = String(row['Name'] || '').trim();
  const rollNo = String(row['Roll No'] ?? '').trim();
  if (!name || !rollNo) continue;

  const photoNameRaw = String(row['Photo File Name'] || '').trim();
  const diskName = photosOnDisk.get(photoNameRaw.toLowerCase());

  if (!diskName) {
    missing.push({ name, rollNo, photoNameRaw });
  } else {
    matched += 1;
  }

  const slug = makeSlug(name, rollNo);
  students.push({
    slug,
    name,
    fatherName: String(row['Father Name'] || '').trim(),
    class: String(row['Class/Degree Program'] || '').trim(),
    rollNo,
    enrollmentType: 'Self Finance',
    session: String(row['Academic Session'] || '').trim(),
    admissionNo: String(row['Admission Number'] || rollNo).trim(),
    regNo: String(row['University Reg. Number'] || '').trim() || undefined,
    dob: String(row['Date of Birth'] || '').trim(),
    bloodGroup: String(row['Blood Group'] || '').trim(),
    cnic: String(row['CNIC / Form-B'] || '').trim(),
    phone: String(row['Guardian Contact Number'] || '').trim(),
    address: String(row['Permanent Address'] || '').trim(),
    status: String(row['Status'] || 'Regular').trim() || 'Regular',
    photoFile: diskName ? `${PHOTO_PUBLIC_PREFIX}/${diskName}` : undefined,
  });
}

const ts = `import type { StudentRecord } from '../types/student';

/** Self Finance students — photos mapped from Excel Photo File Name column */
export const SELF_FINANCE_STUDENTS: StudentRecord[] = [
${students
  .map((s) => {
    const lines = [
      `    slug: '${esc(s.slug)}',`,
      `    name: '${esc(s.name)}',`,
      `    fatherName: '${esc(s.fatherName)}',`,
      `    class: '${esc(s.class)}',`,
      `    rollNo: '${esc(s.rollNo)}',`,
      `    enrollmentType: 'Self Finance',`,
      `    session: '${esc(s.session)}',`,
      `    admissionNo: '${esc(s.admissionNo)}',`,
    ];
    if (s.regNo) lines.push(`    regNo: '${esc(s.regNo)}',`);
    lines.push(
      `    dob: '${esc(s.dob)}',`,
      `    bloodGroup: '${esc(s.bloodGroup)}',`,
      `    cnic: '${esc(s.cnic)}',`,
      `    phone: '${esc(s.phone)}',`,
      `    address: '${esc(s.address)}',`,
      `    status: '${esc(s.status)}',`,
    );
    if (s.photoFile) lines.push(`    photoFile: '${esc(s.photoFile)}',`);
    return `  {\n${lines.join('\n')}\n  }`;
  })
  .join(',\n')}
];
`;

fs.writeFileSync(dataOut, ts, 'utf8');

console.log(`Students: ${students.length}`);
console.log(`Photos matched from Excel names: ${matched}`);
console.log(`Photos folder: ${photoSrc}`);
if (missing.length) {
  console.log('Missing photo matches:', missing);
} else {
  console.log('Every student row with data has a matching photo filename.');
}

// Spot-check Bilal Mehmood
const bilal = students.find((s) => s.rollNo === '1004');
console.log('Bilal Mehmood 1004 photoFile:', bilal?.photoFile);
console.log('File exists:', bilal?.photoFile ? fs.existsSync(path.join(studentDir, bilal.photoFile)) : false);
