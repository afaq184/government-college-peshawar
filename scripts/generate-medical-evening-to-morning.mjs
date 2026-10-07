/**
 * Evening → Morning Pre-Medical transfers (medical_evening_to_morning).
 * Merges into morningPreMedicalStudents.ts, removes matched evening rows,
 * writes URL list + slug aliases for old evening cards.
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

const COHORT = 'public/student/morning-students/medical_evening_to_morning';
const EXCEL = `${COHORT}/Medical_Students_Data.xlsx`;
const PHOTO_DIR = `${COHORT}/Medical_pic`;
const PHOTO_PREFIX = 'morning-students/medical_evening_to_morning/Medical_pic';
const MORNING_TS = 'src/data/morningPreMedicalStudents.ts';
const EVENING_TS = 'src/data/eveningPreMedicalStudents.ts';
const STUDENTS_DATA = 'src/data/studentsData.ts';

/** Old evening slug → new morning slug (keep printed cards working). */
const TRANSFER_ALIASES = {
  'abubakar-siddique-521': 'abubakar-siddique-342',
  'muhammad-sudais-522': 'muhammad-sudais-335',
  'muhammad-hamza-535': 'muhammad-hamza-348',
  'm-mashhood-ullah-626': 'muhammad-mashhood-ullah-302',
  'mehran-jalal-681': 'muhammad-jalal-152',
};

const REMOVE_EVENING_ROLLS = new Set(['521', '522', '535', '626', '681']);

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
  if (!v || v === '--' || v === '-' || /^n\/?a$/i.test(v) || /^none$/i.test(v)) return '';
  if (/^not\s*(specified|provided|mentioned)$/i.test(v)) return '';
  return v;
}

function normalizeBlood(value) {
  return normalizeOptional(value);
}

function normalizeClassYear(value) {
  const v = String(value || '')
    .trim()
    .toLowerCase();
  if (/2nd|second|f\s*2\b|f2\b/.test(v)) return '2nd year';
  if (/f\s*iv|f4|f\s*4/.test(v)) return '1st year';
  if (/\bbs\b/.test(v)) return 'BS';
  if (/1st|first/.test(v)) return '1st year';
  return '1st year';
}

function findPhotoFile(photos, photoName, rollNo) {
  const roll = String(rollNo).trim();
  const alts = ['.png', '.jpg', '.jpeg', '.jfif', '.PNG', '.JPG', '.JPEG', '.JFIF'];
  const candidates = [];
  const push = (c) => {
    if (c && !candidates.includes(c)) candidates.push(c);
  };
  if (photoName) {
    push(photoName);
    const base = photoName.replace(/\.[^.]+$/, '');
    for (const e of alts) push(`${base}${e}`);
  }
  for (const e of alts) {
    push(`${roll}${e}`);
  }
  for (const c of candidates) {
    if (photos.has(c)) return c;
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

function parseExcelStudents() {
  const wb = XLSX.readFile(path.join(root, EXCEL));
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  const photoDir = path.join(root, PHOTO_DIR);
  const photos = new Set(
    fs.existsSync(photoDir)
      ? fs.readdirSync(photoDir).filter((f) => /\.(png|jpe?g|jfif|webp|gif)$/i.test(f))
      : []
  );

  const students = [];
  for (const r of rows) {
    const name = cell(r, 'Name', 'Student Name');
    const rollNo = cell(r, 'Roll No', 'RollNo', 'Roll Number', 'Class Roll No');
    if (!name || !/^\d+$/.test(rollNo)) continue;

    const photo = cell(r, 'Photo File Name', 'Photo');
    const matched = findPhotoFile(photos, photo, rollNo);
    const classYear = normalizeClassYear(cell(r, 'Class', 'Class Year'));

    students.push({
      slug: makeStudentSlug(name, rollNo),
      name,
      fatherName: cell(r, "Father's Name", 'Father Name', 'Father'),
      class: 'Pre-Medical',
      classYear,
      rollNo,
      enrollmentType: 'Morning Shift',
      session: '2026-2028',
      admissionNo: rollNo,
      dob: normalizeOptional(cell(r, 'Date of Birth', 'DOB')),
      bloodGroup: normalizeBlood(cell(r, 'Blood Group')),
      cnic: '',
      phone: normalizeOptional(
        cell(r, 'Guardian Contact Number', 'Contact Number', 'Phone', 'Contact')
      ),
      address: normalizeOptional(cell(r, 'Permanent Address', 'Address')),
      status: normalizeOptional(cell(r, 'Status')) || 'Active',
      ...(matched ? { photoFile: `${PHOTO_PREFIX}/${matched}` } : {}),
    });
  }
  return students;
}

function parseTsArray(filePath, exportName) {
  const src = fs.readFileSync(path.join(root, filePath), 'utf8');
  const marker = `export const ${exportName}`;
  const idx = src.indexOf(marker);
  if (idx < 0) throw new Error(`export ${exportName} not found in ${filePath}`);
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
  if (end < 0) throw new Error(`could not find array end in ${filePath}`);
  const header = src.slice(0, start);
  const footer = src.slice(end + 1);
  // Convert TS object array literal to JSON-ish for eval via Function
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

function writeTs(filePath, header, students, footer) {
  // header ends right before '['; footer starts after ']'
  const out = `${header}${toTsArrayBody(students)}${footer}`;
  fs.writeFileSync(path.join(root, filePath), out);
}

function upsertAliases(aliases) {
  const file = path.join(root, STUDENTS_DATA);
  let src = fs.readFileSync(file, 'utf8');
  for (const [from, to] of Object.entries(aliases)) {
    if (src.includes(`'${from}'`)) continue;
    const insert = `  '${from}': '${to}',\n`;
    src = src.replace(
      /(const STUDENT_SLUG_ALIASES: Record<string, string> = \{\n)/,
      `$1${insert}`
    );
  }
  fs.writeFileSync(file, src);
}

// --- main ---
const incoming = parseExcelStudents();
console.log(`Parsed ${incoming.length} transfer students`);

const morning = parseTsArray(MORNING_TS, 'MORNING_PRE_MEDICAL_STUDENTS');
const byRoll = new Map(morning.students.map((s) => [String(s.rollNo), s]));
let updated = 0;
let added = 0;
for (const s of incoming) {
  if (byRoll.has(s.rollNo)) {
    Object.assign(byRoll.get(s.rollNo), s);
    updated += 1;
  } else {
    morning.students.push(s);
    byRoll.set(s.rollNo, s);
    added += 1;
  }
}
writeTs(MORNING_TS, morning.header, morning.students, morning.footer);
console.log(`Morning Pre-Medical: updated=${updated} added=${added} total=${morning.students.length}`);

const evening = parseTsArray(EVENING_TS, 'EVENING_PRE_MEDICAL_STUDENTS');
const before = evening.students.length;
evening.students = evening.students.filter((s) => !REMOVE_EVENING_ROLLS.has(String(s.rollNo)));
writeTs(EVENING_TS, evening.header, evening.students, evening.footer);
console.log(`Evening Pre-Medical: removed ${before - evening.students.length} (rolls ${[...REMOVE_EVENING_ROLLS].join(',')})`);

upsertAliases(TRANSFER_ALIASES);
console.log('Slug aliases updated for old evening cards');

const urlLines = [
  '# Medical evening → morning — Student URLs',
  `# Domain: ${DOMAIN}`,
  '# Shift: Morning',
  `# Count: ${incoming.length}`,
  '',
];
for (const s of incoming) {
  const url = studentUrl(s.slug);
  urlLines.push(
    `${s.rollNo}\t${s.name}\t${s.class}\t${s.classYear}\tMorning Shift\t${url}` +
      (s.photoFile ? '' : '\tNO_PHOTO')
  );
  console.log(`${s.rollNo}\t${s.name}\t${url}`);
}
fs.writeFileSync(path.join(root, COHORT, 'URLS-medical-evening-to-morning.txt'), urlLines.join('\n') + '\n');
console.log(`Wrote ${COHORT}/URLS-medical-evening-to-morning.txt`);
