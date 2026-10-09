/**
 * Self-finance new last batch (public/student/self-finance/self_finance_new_last).
 * Merges into src/data/selfFinanceStudents.ts by slug (does not overwrite other people).
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
const COHORT = 'public/student/self-finance/self_finance_new_last';
const EXCEL = `${COHORT}/Self-finance_data.xlsx`;
const PHOTO_DIR = `${COHORT}/Self-finance_pic`;
const PHOTO_PREFIX = 'self-finance/self_finance_new_last/Self-finance_pic';
const DATA_TS = 'src/data/selfFinanceStudents.ts';
const EXPORT_NAME = 'SELF_FINANCE_STUDENTS';

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

function normalizeOptional(value) {
  const v = String(value || '').trim();
  if (!v || v === '--' || v === '-' || /^n\/?a$/i.test(v) || /^none$/i.test(v) || /^nill$/i.test(v)) {
    return '';
  }
  if (/^not\s*(specified|provided|mentioned)$/i.test(v)) return '';
  if (/^\(left\s*blank\)$/i.test(v)) return '';
  return v;
}

function normalizeBlood(value) {
  const v = normalizeOptional(value);
  if (!v) return '';
  return v.replace(/\s*positive$/i, '+').replace(/\s*negative$/i, '-').trim();
}

function parseRollNo(raw) {
  const s = String(raw || '').trim();
  // 7400/2 → 7400, 08237 → 8237
  const m = s.match(/(\d+)/);
  if (!m) return '';
  return String(parseInt(m[1], 10));
}

function resolveDiscipline(discipline) {
  const d = String(discipline || '').toLowerCase();
  if (/computer|comp\.?\s*sc|c\.?\s*s/.test(d)) return 'Computer Science';
  if (/eng/.test(d)) return 'Pre-Engineering';
  if (/arts|humanities/.test(d)) return 'Arts';
  if (/med|medical/.test(d)) return 'Pre-Medical';
  return 'Pre-Medical';
}

function normalizeNameKey(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

function findPhotoFile(photos, rollNo, studentName, usedPhotos) {
  const roll = String(rollNo).trim();
  const alts = ['.png', '.jpg', '.jpeg', '.jfif', '.PNG', '.JPG', '.JPEG'];
  for (const e of alts) {
    const plain = `${roll}${e}`;
    if (photos.has(plain) && !usedPhotos.has(plain)) return plain;
  }

  const nameKey = normalizeNameKey(studentName);
  const rollMatches = [...photos].filter((file) => {
    if (usedPhotos.has(file)) return false;
    const base = file.replace(/\.[^.]+$/, '');
    return base === roll || base.startsWith(`${roll}_`) || base.startsWith(`${roll} `);
  });

  if (nameKey) {
    const named = rollMatches.filter((file) => {
      const base = file.replace(/\.[^.]+$/, '');
      const suffix = base.replace(new RegExp(`^${roll}[_\\s-]*`), '');
      const suffixKey = normalizeNameKey(suffix);
      return !suffixKey || suffixKey.includes(nameKey) || nameKey.includes(suffixKey);
    });
    named.sort((a, b) => a.length - b.length);
    if (named[0]) return named[0];
  }

  // Name-tagged photo under a nearby/wrong roll (e.g. 7407_Abuzar Jamil for roll 7406)
  if (nameKey) {
    const byName = [...photos].filter((file) => {
      if (usedPhotos.has(file)) return false;
      return normalizeNameKey(file.replace(/\.[^.]+$/, '')).includes(nameKey);
    });
    byName.sort((a, b) => a.length - b.length);
    if (byName[0]) return byName[0];
  }

  rollMatches.sort((a, b) => a.length - b.length);
  return rollMatches[0] || null;
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

function parseTsArray(filePath, exportName) {
  const src = fs.readFileSync(path.join(root, filePath), 'utf8');
  const marker = `export const ${exportName}`;
  const idx = src.indexOf(marker);
  if (idx < 0) throw new Error(`export ${exportName} not found`);
  const eq = src.indexOf('=', idx);
  const start = src.indexOf('[', eq);
  let depth = 0;
  let end = -1;
  for (let i = start; i < src.length; i++) {
    if (src[i] === '[') depth++;
    else if (src[i] === ']') {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  if (end < 0) throw new Error('array end not found');
  const header = src.slice(0, start);
  const footer = src.slice(end + 1);
  const body = src.slice(start, end + 1);
  // eslint-disable-next-line no-new-func
  const students = Function(`"use strict"; return (${body});`)();
  return { header, footer, students };
}

function toTsArrayBody(students) {
  return JSON.stringify(students, null, 2)
    .replace(/'/g, "\\'")
    .replace(/"([^"]+)":/g, '$1:')
    .replace(/"/g, "'");
}

function parseIncoming() {
  const wb = XLSX.readFile(path.join(root, EXCEL));
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' });
  const photoDir = path.join(root, PHOTO_DIR);
  const photos = new Set(
    fs.existsSync(photoDir)
      ? fs.readdirSync(photoDir).filter((f) => /\.(png|jpe?g|jfif|webp|gif)$/i.test(f))
      : []
  );
  const usedPhotos = new Set();
  const students = [];
  const skipped = [];

  for (const r of rows) {
    const name = cell(r, 'Name', 'Student Name');
    const rollNo = parseRollNo(cell(r, 'Roll No', 'Roll Number', 'Enrollment'));
    if (!name || !rollNo) {
      skipped.push({ name, rollNo, reason: 'missing' });
      continue;
    }
    const matched = findPhotoFile(photos, rollNo, name, usedPhotos);
    if (matched) usedPhotos.add(matched);
    students.push({
      slug: makeStudentSlug(name, rollNo),
      name,
      fatherName: cell(r, "Father's Name", 'Father Name', 'Father'),
      class: resolveDiscipline(cell(r, 'Discipline', 'Subject')),
      classYear: '1st year',
      rollNo,
      enrollmentType: 'Self Finance',
      session: '2026-2028',
      admissionNo: rollNo,
      dob: normalizeOptional(cell(r, 'Date of Birth', 'DOB')),
      bloodGroup: normalizeBlood(cell(r, 'Blood Group')),
      cnic: '',
      phone: normalizeOptional(cell(r, 'Contact Number', 'Phone', 'Guardian Contact Number')),
      address: normalizeOptional(cell(r, 'Address', 'Permanent Address')),
      status: 'Active',
      ...(matched ? { photoFile: `${PHOTO_PREFIX}/${matched}` } : {}),
    });
  }
  return { students, skipped, photos: photos.size, used: usedPhotos.size };
}

// --- main ---
const { students: incoming, skipped, photos, used } = parseIncoming();
console.log(`Parsed ${incoming.length} students (photos=${photos} used=${used} skipped=${skipped.length})`);
if (skipped.length) console.log('skipped', skipped);

const file = parseTsArray(DATA_TS, EXPORT_NAME);
const bySlug = new Map(file.students.map((s) => [s.slug, s]));
let added = 0;
let updated = 0;
for (const s of incoming) {
  if (bySlug.has(s.slug)) {
    Object.assign(bySlug.get(s.slug), s);
    updated += 1;
  } else {
    file.students.push(s);
    bySlug.set(s.slug, s);
    added += 1;
  }
}

fs.writeFileSync(
  path.join(root, DATA_TS),
  `${file.header}${toTsArrayBody(file.students)}${file.footer}`
);
console.log(`Self Finance: added=${added} updated=${updated} total=${file.students.length}`);

const urlLines = [
  '# Self Finance new last batch — Student URLs',
  `# Domain: ${DOMAIN}`,
  '# Enrollment: Self Finance',
  `# Count: ${incoming.length}`,
  '',
];
for (const s of incoming) {
  const url = studentUrl(s.slug);
  urlLines.push(
    `${s.rollNo}\t${s.name}\t${s.class}\t${s.enrollmentType}\t${url}` +
      (s.photoFile ? '' : '\tNO_PHOTO')
  );
  console.log(
    `${s.rollNo}\t${s.name}\t${s.class}\t${s.photoFile ? path.basename(s.photoFile) : 'NO_PHOTO'}`
  );
}
fs.writeFileSync(path.join(root, COHORT, 'URLS-self-finance-new-last.txt'), urlLines.join('\n') + '\n');
console.log(`Wrote ${COHORT}/URLS-self-finance-new-last.txt`);
