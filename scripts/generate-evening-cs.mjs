import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import CryptoJS from 'crypto-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const EVENING_ROLLS = new Set(['2276', '2277', '2101', '2181', '2102']);

const STUDENT_URL_SECRET =
  process.env.VITE_STUDENT_URL_SECRET || 'GCP-STUDENT-PORTAL-AES-2026-KP';

function makeStudentSlug(name, rollNo) {
  return `${name}-${rollNo}`
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function deriveKeyAndIv() {
  const key = CryptoJS.SHA256(STUDENT_URL_SECRET);
  const ivHash = CryptoJS.SHA256(`${STUDENT_URL_SECRET}:iv`);
  const iv = CryptoJS.lib.WordArray.create(ivHash.words.slice(0, 4), 16);
  return { key, iv };
}

function toUrlSafe(base64) {
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function encryptStudentSlug(slug) {
  const { key, iv } = deriveKeyAndIv();
  const encrypted = CryptoJS.AES.encrypt(slug, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return toUrlSafe(encrypted.ciphertext.toString(CryptoJS.enc.Base64));
}

function findPhotoFile(photos, photoName, rollNo) {
  const roll = String(rollNo).trim();
  const alts = ['.png', '.jpg', '.jpeg', '.PNG'];
  const candidates = new Set([photoName, ...alts.flatMap((e) => [`${roll}${e}`, `${roll} M${e}`, `${roll}_b${e}`])]);
  for (const c of candidates) if (c && photos.has(c)) return c;
  for (const file of photos) {
    const base = file.replace(/\.[^.]+$/, '');
    if (base === roll || base.startsWith(`${roll} `)) return file;
  }
  return null;
}

// Source evening excel (first row is data, no proper header)
const srcExcel = path.join(
  'D:\\',
  '`Gcp student data',
  '2 phase',
  'second_phase',
  'computer',
  'computer eveing.xlsx'
);
const wb = XLSX.readFile(srcExcel);
const raw = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: '' });

const studentsRaw = raw
  .map((r) => {
    const name = String(r[0] || '').trim();
    const fatherName = String(r[1] || '').trim();
    const rollNo = String(r[2] || '').trim();
    const dob = String(r[6] || '').trim();
    const phone = String(r[7] || '').trim();
    const address = String(r[8] || '').trim();
    const status = String(r[10] || '').trim() || 'Active';
    const photoName = String(r[11] || '').trim() || `${rollNo}.png`;
    if (!name || !rollNo) return null;
    return { name, fatherName, rollNo, dob, phone, address, status, photoName };
  })
  .filter(Boolean);

// Write a clean Excel with Evening Shift for the website assets
const outExcelDir = path.join(root, 'public/student/evening-students');
fs.mkdirSync(outExcelDir, { recursive: true });
const excelRows = [
  [
    'Name',
    "Father's Name",
    'Roll No',
    'Class',
    'Discipline',
    'Blood Group',
    'Date of Birth',
    'Guardian Contact Number',
    'Permanent Address',
    'Enrollment Type',
    'Status',
    'Photo File Name',
    'Academic Session',
  ],
  ...studentsRaw.map((s) => [
    s.name,
    s.fatherName,
    s.rollNo,
    '1st Year',
    'Computer Science',
    '',
    s.dob,
    s.phone,
    s.address,
    'Evening Shift',
    s.status,
    s.photoName,
    '2026-27',
  ]),
];
const outWb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(outWb, XLSX.utils.aoa_to_sheet(excelRows), 'Students');
const outExcel = path.join(outExcelDir, 'computer-science-evening.xlsx');
XLSX.writeFile(outWb, outExcel);
console.log('Wrote', outExcel, 'rows', studentsRaw.length);

const photoDir = path.join(root, 'public/student/evening-students/computer-science-pic');
fs.mkdirSync(photoDir, { recursive: true });
const photos = new Set(fs.readdirSync(photoDir).filter((f) => /\.(png|jpe?g)$/i.test(f)));

const students = studentsRaw.map((s) => {
  const matched = findPhotoFile(photos, s.photoName, s.rollNo);
  return {
    slug: makeStudentSlug(s.name, s.rollNo),
    name: s.name,
    fatherName: s.fatherName,
    class: 'Computer Science',
    rollNo: s.rollNo,
    enrollmentType: 'Evening Shift',
    session: '2026-27',
    admissionNo: s.rollNo,
    dob: s.dob,
    bloodGroup: '',
    cnic: '',
    phone: s.phone,
    address: s.address,
    status: s.status,
    ...(matched
      ? { photoFile: `evening-students/computer-science-pic/${matched}` }
      : {}),
  };
});

const body = JSON.stringify(students, null, 2)
  .replace(/'/g, "\\'")
  .replace(/"([^"]+)":/g, '$1:')
  .replace(/"/g, "'");

const outTs = `import type { StudentRecord } from '../types/student';

/** Evening Shift — Computer Science 1st Year (2026-27). */
export const EVENING_CS_STUDENTS: StudentRecord[] = ${body};
`;
const outFile = path.join(root, 'src/data/eveningComputerScienceStudents.ts');
fs.writeFileSync(outFile, outTs);
console.log('Wrote', students.length, 'students ->', outFile);

console.log('\nURLs:');
for (const s of students) {
  const url = `https://gcpeshawar.com/student/${encryptStudentSlug(s.slug)}`;
  console.log(`${s.rollNo} | ${s.name}`);
  console.log(`  ${url}`);
  console.log(`  photo: ${s.photoFile || 'MISSING'}`);
}

console.log('\nEvening rolls to exclude from morning:', [...EVENING_ROLLS].join(', '));
