/**
 * BS English 1st semester.
 * Photos: public/student/BS/english/bs_english_/
 * Writes src/data/bsEnglishStudents.ts and public/student/BS/english/URLS-bs-english-1st.txt
 */
import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import CryptoJS from 'crypto-js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const picDir = path.join(root, 'public/student/BS/english/bs_english_');
const photos = new Set(fs.readdirSync(picDir));
const wb = XLSX.readFile(path.join(root, 'public/student/BS/english/bs_english_1st_semester.xlsx'));
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

function dob(raw) {
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    const utc = new Date(Date.UTC(1899, 11, 30) + Math.round(raw) * 86400000);
    const d = String(utc.getUTCDate()).padStart(2, '0');
    const m = String(utc.getUTCMonth() + 1).padStart(2, '0');
    return `${d}/${m}/${utc.getUTCFullYear()}`;
  }
  return String(raw || '').trim();
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
  const sno = Number(row['S.No']);
  let slug = slugify(name, roll);
  if (used.has(slug)) slug = `${slug}-${sno}`;
  used.add(slug);

  const padded = String(sno).padStart(2, '0');
  const file = photos.has(`${padded}.jpg`)
    ? `${padded}.jpg`
    : photos.has(`${sno}.jpg`)
      ? `${sno}.jpg`
      : null;
  if (!file) missing.push(`${sno} ${roll} ${name}`);

  students.push({
    slug,
    name,
    fatherName: String(row['Father Name'] || '').trim(),
    rollNo: roll,
    dob: dob(row['Date of Birth']),
    phone: String(row['Contact Number'] || '').trim(),
    address: String(row.Address || '').trim(),
    photoFile: `BS/english/bs_english_/${file}`,
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
    class: 'BS English',
    classYear: '1st Semester',
    rollNo: '${esc(s.rollNo)}',
    enrollmentType: 'BS Level',
    session: '2026-2030',
    admissionNo: '${esc(s.rollNo)}',
    dob: '${esc(s.dob)}',
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

/** BS English — 1st Semester. Photos live under public/student/BS/english/bs_english_/. */
export const BS_ENGLISH_STUDENTS: StudentRecord[] = [
${body},
];
`;

fs.writeFileSync(path.join(root, 'src/data/bsEnglishStudents.ts'), ts);

const lines = ['# BS English 1st Semester', `# Count: ${students.length}`, ''];
for (const s of students) {
  lines.push(
    [s.rollNo, s.name, 'BS English', 'BS Level', `https://gcpeshawar.com/student/${encrypt(s.slug)}`].join('\t')
  );
}
fs.writeFileSync(path.join(root, 'public/student/BS/english/URLS-bs-english-1st.txt'), `${lines.join('\n')}\n`);
console.log(`wrote ${students.length} students`);
