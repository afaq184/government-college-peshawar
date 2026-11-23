/**
 * BS HPE 1st semester (+ one BS Economics row in the same sheet).
 * Photos: public/student/BS/HPE/BS_HPE_student_pic/
 * Writes src/data/bsHpeStudents.ts and public/student/BS/HPE/URLS-bs-hpe-1st.txt
 */
import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import CryptoJS from 'crypto-js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const picDir = path.join(root, 'public/student/BS/HPE/BS_HPE_student_pic');
const photos = new Set(fs.readdirSync(picDir));
const wb = XLSX.readFile(path.join(root, 'public/student/BS/HPE/bs_HPE_1st_semester.xlsx'));
const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' });

function slugify(name, roll) {
  return `${name}-${roll}`
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function esc(value) {
  return String(value ?? '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function photoFor(roll, discipline) {
  if (/economics/i.test(String(discipline)) || /economics/i.test(String(roll))) {
    return 'ecnomics_37.jpg';
  }
  const match = String(roll).match(/(\d+)\s*$/);
  if (!match) return null;
  const n = String(parseInt(match[1], 10));
  if (n === '37') return photos.has('HPE-37.jpg') ? 'HPE-37.jpg' : null;
  for (const ext of ['.jpg', '.jpeg', '.JPG', '.JPEG']) {
    const file = `${n}${ext}`;
    if (photos.has(file)) return file;
  }
  return null;
}

function program(discipline) {
  if (String(discipline).trim().toLowerCase() === 'economics') return 'BS Economics';
  return 'BS Health & Physical Education';
}

const SECRET = process.env.VITE_STUDENT_URL_SECRET || 'GCP-STUDENT-PORTAL-AES-2026-KP';

function encrypt(slug) {
  const key = CryptoJS.SHA256(SECRET);
  const iv = CryptoJS.lib.WordArray.create(CryptoJS.SHA256(`${SECRET}:iv`).words.slice(0, 4), 16);
  const encrypted = CryptoJS.AES.encrypt(slug, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return encrypted.ciphertext
    .toString(CryptoJS.enc.Base64)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

const used = new Set();
const students = [];
const missing = [];

for (const row of rows) {
  const name = String(row.Name).trim();
  const roll = String(row['Roll No']).trim();
  let slug = slugify(name, roll);
  if (used.has(slug)) slug = `${slug}-${row['S.No']}`;
  used.add(slug);
  const photo = photoFor(roll, row.Discipline);
  if (!photo || !photos.has(photo)) missing.push(`${roll} ${name} -> ${photo}`);
  const classYear = String(row.Class || '').toLowerCase().includes('1st')
    ? '1st Semester'
    : String(row.Class).trim();
  students.push({
    slug,
    name,
    fatherName: String(row['Father Name'] || '').trim(),
    class: program(row.Discipline),
    classYear,
    rollNo: roll,
    phone: String(row['Contact Number'] || '').trim(),
    address: String(row.Address || '').trim(),
    photoFile: `BS/HPE/BS_HPE_student_pic/${photo}`,
  });
}

if (missing.length) {
  console.error('MISSING PHOTOS');
  console.error(missing.join('\n'));
  process.exit(1);
}

const body = students
  .map(
    (s) => `  {
    slug: '${esc(s.slug)}',
    name: '${esc(s.name)}',
    fatherName: '${esc(s.fatherName)}',
    class: '${esc(s.class)}',
    classYear: '${esc(s.classYear)}',
    rollNo: '${esc(s.rollNo)}',
    enrollmentType: 'BS Level',
    session: '2026-2030',
    admissionNo: '${esc(s.rollNo)}',
    dob: '',
    bloodGroup: '',
    cnic: '',
    phone: '${esc(s.phone)}',
    address: '${esc(s.address)}',
    status: 'Active',
    photoFile: '${esc(s.photoFile)}',
  }`
  )
  .join(',\n');

const ts = `import type { StudentRecord } from '../types/student';

/** BS Health & Physical Education — 1st Semester, plus one BS Economics student
 *  included in the same sheet. Photos live under public/student/BS/HPE/.
 */
export const BS_HPE_STUDENTS: StudentRecord[] = [
${body},
];
`;

fs.writeFileSync(path.join(root, 'src/data/bsHpeStudents.ts'), ts);

const lines = ['# BS HPE 1st Semester', `# Count: ${students.length}`, ''];
for (const s of students) {
  lines.push(
    [s.rollNo, s.name, s.class, 'BS Level', `https://gcpeshawar.com/student/${encrypt(s.slug)}`].join('\t')
  );
}
fs.writeFileSync(path.join(root, 'public/student/BS/HPE/URLS-bs-hpe-1st.txt'), `${lines.join('\n')}\n`);
console.log(`wrote ${students.length} students`);
