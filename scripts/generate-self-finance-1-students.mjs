/**
 * Self-finance cohort 1 (public/student/self-finance/gcp_self-finance_1).
 * Sets enrollmentType: 'Self Finance', writes src/data/selfFinanceStudents.ts,
 * and prints gcpeshawar.com encrypted student URLs.
 */
import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import CryptoJS from 'crypto-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const STUDENT_URL_SECRET =
  process.env.VITE_STUDENT_URL_SECRET || 'GCP-STUDENT-PORTAL-AES-2026-KP';
const DOMAIN = 'https://gcpeshawar.com';
const COHORT = 'public/student/self-finance/gcp_self-finance_1';

const SOURCE = {
  excel: `${COHORT}/self-finance_matched_students.xlsx`,
  photoDir: `${COHORT}/renamed_pics_1`,
  photoPrefix: 'self-finance/gcp_self-finance_1/renamed_pics_1',
};

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

function normalizeOptional(value) {
  const v = String(value || '').trim();
  if (!v || v === '--' || v === '-' || /^n\/?a$/i.test(v) || /^none$/i.test(v)) return '';
  if (/^not\s*(specified|provided)$/i.test(v)) return '';
  return v;
}

function normalizeBlood(value) {
  const v = normalizeOptional(value);
  if (!v || /^none$/i.test(v)) return '';
  return v;
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

function parseRollNo(raw) {
  const s = String(raw || '').trim();
  const m = s.match(/^(\d+)/);
  return m ? m[1] : '';
}

function rollNum(roll) {
  const n = parseInt(String(roll).replace(/\D/g, ''), 10);
  return Number.isFinite(n) ? n : NaN;
}

function resolveClass(discipline, classCell) {
  const d = String(discipline || '').toLowerCase();
  const c = String(classCell || '').toLowerCase();
  // Prefer Discipline; Class column is usually "1st" / "1st Year"
  if (/c\.?\s*s|cis|computer|comp\.?\s*sc/.test(d)) return 'Computer Science';
  if (/med|medical/.test(d)) return 'Pre-Medical';
  if (/eng/.test(d)) return 'Pre-Engineering';
  if (/c\.?\s*s|cis|computer|comp\.?\s*sc/.test(c)) return 'Computer Science';
  if (/med|medical/.test(c)) return 'Pre-Medical';
  if (/eng/.test(c)) return 'Pre-Engineering';
  return 'Pre-Medical';
}

function findPhotoFile(photos, photoName, rollNo, usedPhotos) {
  const roll = String(rollNo).trim();
  const rollN = String(parseInt(roll, 10));
  const alts = ['.png', '.jpg', '.jpeg', '.jfif', '.PNG', '.JPG', '.JPEG', '.JFIF'];
  const candidates = [];
  const push = (c) => {
    if (c && !candidates.includes(c)) candidates.push(c);
  };
  if (photoName) push(photoName);
  for (const e of alts) {
    push(`${roll}${e}`);
    push(`${rollN}${e}`);
  }
  for (const c of candidates) {
    if (photos.has(c) && !usedPhotos.has(c)) return c;
  }
  const matches = [...photos].filter((file) => {
    const base = file.replace(/\.[^.]+$/, '');
    return base === roll || base === rollN;
  });
  matches.sort((a, b) => a.length - b.length);
  for (const file of matches) {
    if (!usedPhotos.has(file)) return file;
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

function studentUrl(slug) {
  return `${DOMAIN}/student/${encryptStudentSlug(slug)}`;
}

function findHeaderRowIndex(matrix) {
  for (let i = 0; i < matrix.length; i++) {
    const cells = (matrix[i] || []).map((c) => String(c || '').trim().toLowerCase());
    const hasRoll = cells.some(
      (c) =>
        c === 'roll no' ||
        c === 'rollno' ||
        c === 'roll number' ||
        c === 'enrollment no' ||
        c === 'enrollment number'
    );
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

function toTsArray(exportName, comment, students) {
  const body = JSON.stringify(students, null, 2)
    .replace(/'/g, "\\'")
    .replace(/"([^"]+)":/g, '$1:')
    .replace(/"/g, "'");
  return `import type { StudentRecord } from '../types/student';

/** ${comment} */
export const ${exportName}: StudentRecord[] = ${body};
`;
}

function writeUrls(filePath, students, title) {
  const lines = [`# ${title}`, `# Generated ${new Date().toISOString()}`, `# Count: ${students.length}`, ''];
  for (const s of students) {
    lines.push(
      `${s.rollNo}\t${s.name}\t${s.class}\t${s.enrollmentType}\t${studentUrl(s.slug)}` +
        (s.photoFile ? '' : '\tNO_PHOTO')
    );
  }
  fs.writeFileSync(filePath, lines.join('\n') + '\n');
}

function writeDisciplineUrls(filePath, students) {
  const order = ['Pre-Medical', 'Pre-Engineering', 'Computer Science'];
  let out = '# Self Finance Cohort 1 — Student URLs by Discipline\n';
  out += `# Domain: ${DOMAIN}\n`;
  out += `# Count: ${students.length}\n\n`;
  for (const cls of order) {
    const list = students.filter((s) => s.class === cls);
    out += `## ${cls} (${list.length})\n`;
    for (const s of list) out += `${s.rollNo}\t${s.name}\t${studentUrl(s.slug)}\n`;
    out += '\n';
  }
  fs.writeFileSync(filePath, out);
}

// --- main ---
const wb = XLSX.readFile(path.join(root, SOURCE.excel));
const sheetName =
  wb.SheetNames.find((n) => !/instructions|verification/i.test(n)) || wb.SheetNames[0];
const rows = readSheetRows(wb.Sheets[sheetName]);
const photoDir = path.join(root, SOURCE.photoDir);
const photos = new Set(
  fs.existsSync(photoDir)
    ? fs.readdirSync(photoDir).filter((f) => /\.(png|jpe?g|jfif|webp|gif)$/i.test(f))
    : []
);
const usedPhotos = new Set();
const students = [];
const skipped = [];
const seenInBatch = new Set();
let missingPhotos = 0;

for (const r of rows) {
  const name = String(cell(r, 'Student Name', 'Name') || '').trim();
  const rollNo = parseRollNo(
    cell(r, 'Enrollment No', 'Enrollment Number', 'Roll No', 'Roll Number', 'RollNo')
  );
  if (!name || !rollNo) {
    skipped.push({ name, rollNo, reason: 'missing_name_or_roll' });
    continue;
  }

  const className = resolveClass(cell(r, 'Discipline'), cell(r, 'Class'));
  let slug = makeStudentSlug(name, rollNo);
  const batchKey = `${rollNo}::${slug}`;
  if (seenInBatch.has(batchKey)) {
    skipped.push({ name, rollNo, reason: 'duplicate_row' });
    continue;
  }
  seenInBatch.add(batchKey);

  const excelPhoto = String(cell(r, 'Photo File Name', 'Photo') || '').trim();
  const matched =
    findPhotoFile(photos, `${rollNo}.png`, rollNo, usedPhotos) ||
    findPhotoFile(photos, `${rollNo}.jpeg`, rollNo, usedPhotos) ||
    findPhotoFile(photos, excelPhoto || `${rollNo}.png`, rollNo, usedPhotos);
  if (matched) usedPhotos.add(matched);
  else missingPhotos += 1;

  students.push({
    slug,
    name,
    fatherName: String(
      cell(r, 'Guardian Name', "Father's Name", 'Father Name', 'Father') || ''
    ).trim(),
    class: className,
    rollNo,
    enrollmentType: 'Self Finance',
    session: '2026-2028',
    admissionNo: rollNo,
    dob: formatDob(cell(r, 'Date of Birth', 'DOB')),
    bloodGroup: normalizeBlood(cell(r, 'Blood Group')),
    cnic: '',
    phone: normalizeOptional(cell(r, 'Contact Number', 'Guardian Contact Number', 'Phone')),
    address: normalizeOptional(cell(r, 'Permanent Address', 'Address')),
    status: normalizeOptional(cell(r, 'Status', 'Student Status')) || 'Active',
    ...(matched ? { photoFile: `${SOURCE.photoPrefix}/${matched}` } : {}),
  });
}

students.sort((a, b) => rollNum(a.rollNo) - rollNum(b.rollNo) || a.slug.localeCompare(b.slug));

const outTs = path.join(root, 'src/data/selfFinanceStudents.ts');
fs.writeFileSync(
  outTs,
  toTsArray(
    'SELF_FINANCE_STUDENTS',
    'Self Finance — 1st Year (2026-2028), cohort gcp_self-finance_1.',
    students
  )
);

const outDir = path.join(root, COHORT);
writeUrls(path.join(outDir, 'URLS-all-self-finance-1.txt'), students, 'Self Finance Cohort 1 — All students');
writeDisciplineUrls(path.join(outDir, 'URLS-by-discipline-self-finance-1.txt'), students);

const byClass = {
  cs: students.filter((s) => s.class === 'Computer Science'),
  med: students.filter((s) => s.class === 'Pre-Medical'),
  eng: students.filter((s) => s.class === 'Pre-Engineering'),
};

console.log('\n========== SELF FINANCE 1 SUMMARY ==========');
console.log(`photos=${photos.size} students=${students.length} skipped=${skipped.length}`);
if (skipped.length) console.log('skipped:', skipped);
if (missingPhotos) console.log(`missingPhotos=${missingPhotos}`);
console.log(`Computer Science=${byClass.cs.length}`);
console.log(`Pre-Medical=${byClass.med.length}`);
console.log(`Pre-Engineering=${byClass.eng.length}`);
console.log(`Wrote: ${outTs}`);
console.log(`URL files under: ${outDir}`);
console.log('\n--- URLs ---');
for (const s of students) {
  console.log(`${s.rollNo}\t${s.name}\t${s.class}\t${studentUrl(s.slug)}`);
}
