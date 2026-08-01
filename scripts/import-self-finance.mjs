/**
 * One-off importer: Excel + extracted photos → student data + URL list
 * Run: node scripts/import-self-finance.mjs
 */
import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import CryptoJS from 'crypto-js';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const studentDir = path.join(root, 'public', 'student');
const excelPath = path.join(studentDir, 'Updated_Student_Data_PhotoNames.xlsx');
const photoSrc = path.join(studentDir, 'self-finance-extract', 'student pic');
const photoDest = path.join(studentDir, 'self-finance');
const dataOut = path.join(root, 'src', 'data', 'selfFinanceStudents.ts');
const urlsOut = path.join(studentDir, 'Self-Finance-Student-URLs.xlsx');
const urlsTxt = path.join(studentDir, 'Self-Finance-Student-URLs.txt');

const STUDENT_URL_SECRET = process.env.VITE_STUDENT_URL_SECRET || 'GCP-STUDENT-PORTAL-AES-2026-KP';

function makeSlug(name, rollNo) {
  return `${name}-${rollNo}`
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function encryptStudentSlug(slug) {
  const key = CryptoJS.SHA256(STUDENT_URL_SECRET);
  const ivHash = CryptoJS.SHA256(`${STUDENT_URL_SECRET}:iv`);
  const iv = CryptoJS.lib.WordArray.create(ivHash.words.slice(0, 4), 16);
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

function esc(s) {
  return String(s ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\r?\n/g, ' ');
}

fs.mkdirSync(photoDest, { recursive: true });

const photosOnDisk = new Map();
for (const name of fs.readdirSync(photoSrc)) {
  photosOnDisk.set(name.toLowerCase(), name);
}

const buf = fs.readFileSync(excelPath);
const wb = XLSX.read(buf, { type: 'buffer' });
const rows = XLSX.utils.sheet_to_json(wb.Sheets['Students'] || wb.Sheets[wb.SheetNames[0]], { defval: '' });

const students = [];
const urlRows = [];
const missingPhotos = [];

for (const row of rows) {
  const name = String(row['Name'] || '').trim();
  const rollNo = String(row['Roll No'] ?? '').trim();
  if (!name || !rollNo) continue;

  const photoNameRaw = String(row['Photo File Name'] || '').trim();
  const diskName = photosOnDisk.get(photoNameRaw.toLowerCase());
  if (!diskName) {
    missingPhotos.push({ name, rollNo, photoNameRaw });
  } else {
    const destFile = path.join(photoDest, diskName);
    if (!fs.existsSync(destFile)) {
      fs.copyFileSync(path.join(photoSrc, diskName), destFile);
    }
  }

  const slug = makeSlug(name, rollNo);
  const photoFile = diskName ? `self-finance/${diskName}` : undefined;
  const student = {
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
    photoFile,
  };
  students.push(student);

  const token = encryptStudentSlug(slug);
  const pathUrl = `/student/${token}`;
  urlRows.push({
    Name: name,
    'Father Name': student.fatherName,
    'Roll No': rollNo,
    Class: student.class,
    'Enrollment Type': 'Self Finance',
    'Photo File': photoFile || '',
    'Profile Path': pathUrl,
    'Full URL (local)': `http://localhost:3000/${pathUrl}`,
  });
}

const ts = `import type { Student } from './studentsData';

/** Self Finance students imported from Updated_Student_Data_PhotoNames.xlsx */
export const SELF_FINANCE_STUDENTS: Student[] = [
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

const outWb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(outWb, XLSX.utils.json_to_sheet(urlRows), 'URLs');
XLSX.writeFile(outWb, urlsOut);

const txt = urlRows
  .map((r) => `${r['Roll No']}\t${r.Name}\t${r['Profile Path']}`)
  .join('\n');
fs.writeFileSync(
  urlsTxt,
  `Self Finance student profile links (open on the college site)\n` +
    `Total: ${urlRows.length}\n` +
    `Format: RollNo \\t Name \\t /student/<token>\n\n` +
    txt +
    '\n',
  'utf8',
);

console.log(`Imported ${students.length} students`);
console.log(`Photos copied to ${photoDest}`);
console.log(`Data file: ${dataOut}`);
console.log(`URL list: ${urlsOut}`);
console.log(`URL txt: ${urlsTxt}`);
if (missingPhotos.length) {
  console.log(`Missing photos (${missingPhotos.length}):`, missingPhotos);
} else {
  console.log('All photos matched.');
}
