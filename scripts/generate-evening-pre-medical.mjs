import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import CryptoJS from 'crypto-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const EVENING_ROLLS = ['501', '502', '503', '504', '505', '506', '210', '507', '508'];

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

function cleanCell(value) {
  return String(value || '')
    .replace(/\s*\(Note:[\s\S]*$/i, '')
    .trim();
}

function normalizeBlood(value) {
  const v = cleanCell(value);
  if (!v || /^not\s*specified$/i.test(v) || v === '--') return '';
  return v;
}

function findPhotoFile(photos, photoName, rollNo) {
  const roll = String(rollNo).trim();
  const alts = ['.png', '.jpg', '.jpeg', '.PNG'];
  const candidates = new Set([
    photoName,
    ...alts.flatMap((e) => [`${roll}${e}`, `${roll} M${e}`, `${roll}_b${e}`]),
  ]);
  for (const c of candidates) if (c && photos.has(c)) return c;
  for (const file of photos) {
    const base = file.replace(/\.[^.]+$/, '');
    if (base === roll || base.startsWith(`${roll} `)) return file;
  }
  return null;
}

const srcExcel = path.join(
  'D:\\',
  '`Gcp student data',
  '2 phase',
  'second_phase',
  'medical',
  'pre-medical-eveing.xlsx'
);
const wb = XLSX.readFile(srcExcel);
const raw = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: '' });

const studentsRaw = raw
  .map((r) => {
    const name = String(r[0] || '').trim();
    const fatherName = String(r[1] || '').trim();
    const rollNo = String(r[2] || '').trim();
    const bloodGroup = normalizeBlood(r[5]);
    const dob = cleanCell(r[6]);
    const phone = cleanCell(r[7]);
    const address = String(r[10] || '').trim();
    const status = String(r[11] || '').trim() || 'Active';
    const photoName = String(r[12] || '').trim() || `${rollNo}.png`;
    if (!name || !rollNo) return null;
    return { name, fatherName, rollNo, bloodGroup, dob, phone, address, status, photoName };
  })
  .filter(Boolean);

// Update source excel Enrollment Type column (index 9) to Evening Shift
for (const row of raw) {
  if (Array.isArray(row) && row.length > 9) row[9] = 'Evening Shift';
}
wb.Sheets[wb.SheetNames[0]] = XLSX.utils.aoa_to_sheet(raw);
XLSX.writeFile(wb, srcExcel);
console.log('Updated source excel Enrollment Type -> Evening Shift');

// Clean website excel
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
    'Pre-Medical',
    s.bloodGroup,
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
const outExcel = path.join(outExcelDir, 'pre-medical-evening.xlsx');
XLSX.writeFile(outWb, outExcel);
console.log('Wrote', outExcel, 'rows', studentsRaw.length);

const photoDir = path.join(root, 'public/student/evening-students/pre-medical-pic');
fs.mkdirSync(photoDir, { recursive: true });
const photos = new Set(fs.readdirSync(photoDir).filter((f) => /\.(png|jpe?g)$/i.test(f)));

const students = studentsRaw.map((s) => {
  const matched = findPhotoFile(photos, s.photoName, s.rollNo);
  return {
    slug: makeStudentSlug(s.name, s.rollNo),
    name: s.name,
    fatherName: s.fatherName,
    class: 'Pre-Medical',
    rollNo: s.rollNo,
    enrollmentType: 'Evening Shift',
    session: '2026-27',
    admissionNo: s.rollNo,
    dob: s.dob,
    bloodGroup: s.bloodGroup,
    cnic: '',
    phone: s.phone,
    address: s.address,
    status: s.status,
    ...(matched ? { photoFile: `evening-students/pre-medical-pic/${matched}` } : {}),
  };
});

const body = JSON.stringify(students, null, 2)
  .replace(/'/g, "\\'")
  .replace(/"([^"]+)":/g, '$1:')
  .replace(/"/g, "'");

const outTs = `import type { StudentRecord } from '../types/student';

/** Evening Shift - Pre-Medical 1st Year (2026-27). */
export const EVENING_PRE_MEDICAL_STUDENTS: StudentRecord[] = ${body};
`;
const outFile = path.join(root, 'src/data/eveningPreMedicalStudents.ts');
fs.writeFileSync(outFile, outTs);
console.log('Wrote', students.length, 'students ->', outFile);

console.log('\nURLs:');
for (const s of students) {
  const url = `https://gcpeshawar.com/student/${encryptStudentSlug(s.slug)}`;
  console.log(`${s.rollNo} | ${s.name}`);
  console.log(`  ${url}`);
  console.log(`  photo: ${s.photoFile || 'MISSING'}`);
}

console.log('\nExclude from morning:', EVENING_ROLLS.join(', '));
