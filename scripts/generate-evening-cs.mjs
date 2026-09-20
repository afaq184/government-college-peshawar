import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import CryptoJS from 'crypto-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const STUDENT_URL_SECRET =
  process.env.VITE_STUDENT_URL_SECRET || 'GCP-STUDENT-PORTAL-AES-2026-KP';

const SRC_EXCEL = path.join(
  root,
  'public/student/evening-students/computer_science_eveing_1/cs eveing data.xlsx'
);
const PHOTO_DIR = path.join(
  root,
  'public/student/evening-students/computer_science_eveing_1/computer science eveing pic_R'
);
const PHOTO_PREFIX =
  'evening-students/computer_science_eveing_1/computer science eveing pic_R';

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
      return row[found];
    }
  }
  return '';
}

function formatDob(value) {
  if (value == null || value === '') return '';
  if (typeof value === 'number' && Number.isFinite(value)) {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (parsed) {
      const dd = String(parsed.d).padStart(2, '0');
      const mm = String(parsed.m).padStart(2, '0');
      return `${dd}/${mm}/${parsed.y}`;
    }
  }
  return String(value).trim();
}

function findPhotoFile(photos, photoName, rollNo) {
  const roll = String(rollNo).trim();
  const alts = ['.png', '.jpg', '.jpeg', '.jfif', '.PNG', '.JPG', '.JPEG'];
  const candidates = new Set();
  for (const e of alts) {
    candidates.add(photoName);
    candidates.add(`${roll}${e}`);
  }
  for (const c of candidates) if (c && photos.has(c)) return c;
  for (const file of photos) {
    const base = file.replace(/\.[^.]+$/, '');
    if (base === roll || base.startsWith(`${roll} `)) return file;
  }
  return null;
}

function encryptStudentSlug(slug) {
  const key = CryptoJS.SHA256(STUDENT_URL_SECRET);
  const iv = CryptoJS.lib.WordArray.create(
    CryptoJS.SHA256(`${STUDENT_URL_SECRET}:iv`).words.slice(0, 4),
    16
  );
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

const PREVIOUS_EVENING_ROLLS = new Set(['2276', '2277', '2101', '2181', '2102']);

const wb = XLSX.readFile(SRC_EXCEL);
const sheet =
  wb.Sheets[
    wb.SheetNames.find((n) => !/instructions|verification/i.test(n)) || wb.SheetNames[0]
  ];
const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
const photos = new Set(
  fs.existsSync(PHOTO_DIR)
    ? fs.readdirSync(PHOTO_DIR).filter((f) => /\.(png|jpe?g|jfif|webp|gif)$/i.test(f))
    : []
);

const seen = new Set();
let missingPhotos = 0;
const students = [];

for (const r of rows) {
  const name = String(cell(r, 'Student Name', 'Name') || '').trim();
  const rollNo = String(cell(r, 'Roll No', 'Roll Number', 'RollNo') || '').trim();
  if (!name || !rollNo || !/^\d+[a-z]?$/i.test(rollNo)) continue;
  if (seen.has(rollNo)) {
    console.warn(`skip duplicate roll ${rollNo}`);
    continue;
  }
  seen.add(rollNo);

  const photoName = String(cell(r, 'Photo File Name', 'Photo') || '').trim() || `${rollNo}.png`;
  const matched = findPhotoFile(photos, photoName, rollNo);
  if (!matched) missingPhotos += 1;

  students.push({
    slug: makeStudentSlug(name, rollNo),
    name,
    fatherName: String(cell(r, "Father's Name", 'Father Name', 'Father') || '').trim(),
    class: 'Computer Science',
    rollNo,
    enrollmentType: 'Evening Shift',
    session: '2026-2028',
    admissionNo: rollNo,
    dob: formatDob(cell(r, 'Date of Birth', 'DOB')),
    bloodGroup: '',
    cnic: '',
    phone: String(cell(r, 'Contact Number', 'Guardian Contact Number', 'Phone') || '').trim(),
    address: String(cell(r, 'Permanent Address', 'Address') || '').trim(),
    status: String(cell(r, 'Student Status', 'Status') || '').trim() || 'Active',
    ...(matched ? { photoFile: `${PHOTO_PREFIX}/${matched}` } : {}),
  });
}

students.sort((a, b) => Number(a.rollNo) - Number(b.rollNo));

const body = JSON.stringify(students, null, 2)
  .replace(/'/g, "\\'")
  .replace(/"([^"]+)":/g, '$1:')
  .replace(/"/g, "'");

const outTs = `import type { StudentRecord } from '../types/student';

/** Evening Shift — Computer Science 1st Year (2026-2028), including computer_science_eveing_1. */
export const EVENING_CS_STUDENTS: StudentRecord[] = ${body};
`;

const outFile = path.join(root, 'src/data/eveningComputerScienceStudents.ts');
fs.writeFileSync(outFile, outTs);
console.log(
  `Wrote ${students.length} students -> ${outFile}` +
    (missingPhotos ? ` (${missingPhotos} without matched photo)` : '')
);

const newlyAdded = students.filter((s) => !PREVIOUS_EVENING_ROLLS.has(s.rollNo));
console.log(`\nNEWLY_ADDED=${newlyAdded.length}`);
for (const s of newlyAdded) {
  console.log(
    `${s.rollNo}\t${s.name}\thttps://gcpeshawar.com/student/${encryptStudentSlug(s.slug)}` +
      (s.photoFile ? '' : '\tNO_PHOTO')
  );
}

console.log('\nALL_EVENING_ROLLS=' + students.map((s) => s.rollNo).join(','));
