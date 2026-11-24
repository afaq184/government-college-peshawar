/**
 * BS Urdu 3rd semester.
 * Photos: public/student/BS/Urdu/bs urdu pic/
 * Writes src/data/bsUrduStudents.ts and public/student/BS/Urdu/URLS-bs-urdu-3rd.txt
 */
import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import CryptoJS from 'crypto-js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const picDir = path.join(root, 'public/student/BS/Urdu/bs urdu pic');
const photos = new Set(fs.readdirSync(picDir));
const wb = XLSX.readFile(path.join(root, 'public/student/BS/Urdu/bs_urdu_3rd_semester.xlsx'));
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

function blood(raw) {
  const s = String(raw || '').trim().toLowerCase().replace(/\s+/g, ' ');
  if (!s) return '';
  const map = {
    'o negative': 'O-',
    'o-': 'O-',
    'o positive': 'O+',
    'o+': 'O+',
    'b positive': 'B+',
    'b-positive': 'B+',
    'b+': 'B+',
    'b negative': 'B-',
    'b-': 'B-',
    'a positive': 'A+',
    'a+': 'A+',
    'a negative': 'A-',
    'a-': 'A-',
    'ab positive': 'AB+',
    'ab+': 'AB+',
    'ab negative': 'AB-',
    'ab-': 'AB-',
  };
  return map[s] || String(raw).trim();
}

function dob(raw) {
  const s = String(raw || '').trim();
  const match = s.match(/^(.+?)\s*\(or\b/i);
  return (match ? match[1] : s).trim();
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
  const file = photos.has(`${roll}.jpeg`)
    ? `${roll}.jpeg`
    : photos.has(`${roll}.jpg`)
      ? `${roll}.jpg`
      : null;
  if (!file) missing.push(`${roll} ${name}`);
  students.push({
    slug,
    name,
    fatherName: String(row['Father Name'] || '').trim(),
    class: 'BS Urdu',
    classYear: '3rd Semester',
    rollNo: roll,
    dob: dob(row['Date of Birth']),
    bloodGroup: blood(row['Blood Group']),
    phone: String(row['Contact Number'] || '').trim(),
    address: String(row.Address || '').trim(),
    photoFile: `BS/Urdu/bs urdu pic/${file}`,
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
    class: 'BS Urdu',
    classYear: '3rd Semester',
    rollNo: '${esc(s.rollNo)}',
    enrollmentType: 'BS Level',
    session: '2025-2029',
    admissionNo: '${esc(s.rollNo)}',
    dob: '${esc(s.dob)}',
    bloodGroup: '${esc(s.bloodGroup)}',
    cnic: '',
    phone: '${esc(s.phone)}',
    address: '${esc(s.address)}',
    status: 'Active',
    photoFile: '${esc(s.photoFile)}',
  }`
  )
  .join(',\n');

const ts = `import type { StudentRecord } from '../types/student';

/** BS Urdu — 3rd Semester. Photos live under public/student/BS/Urdu/. */
export const BS_URDU_STUDENTS: StudentRecord[] = [
${body},
];
`;

fs.writeFileSync(path.join(root, 'src/data/bsUrduStudents.ts'), ts);

const lines = ['# BS Urdu 3rd Semester', `# Count: ${students.length}`, ''];
for (const s of students) {
  lines.push(
    [s.rollNo, s.name, s.class, 'BS Level', `https://gcpeshawar.com/student/${encrypt(s.slug)}`].join('\t')
  );
}
fs.writeFileSync(path.join(root, 'public/student/BS/Urdu/URLS-bs-urdu-3rd.txt'), `${lines.join('\n')}\n`);
console.log(`wrote ${students.length} students`);
