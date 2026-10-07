/**
 * 1st-year batch (new_cards_max_student/1st year data).
 * Enrollment from photo tag (_morning / _eveing / _self-Finance).
 * Merges into morning/evening Pre-Medical or Pre-Engineering TS files.
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

const COHORT = 'public/student/morning-students/first_year_batch';
const EXCEL = `${COHORT}/Students_1st_Year_data.xlsx`;
const PHOTO_DIR = `${COHORT}/1st year_pic`;
const PHOTO_PREFIX = 'morning-students/first_year_batch/1st year_pic';

const FILES = {
  'Morning Shift|Pre-Medical': {
    path: 'src/data/morningPreMedicalStudents.ts',
    exportName: 'MORNING_PRE_MEDICAL_STUDENTS',
  },
  'Morning Shift|Pre-Engineering': {
    path: 'src/data/morningPreEngineeringStudents.ts',
    exportName: 'MORNING_PRE_ENGINEERING_STUDENTS',
  },
  'Evening Shift|Pre-Medical': {
    path: 'src/data/eveningPreMedicalStudents.ts',
    exportName: 'EVENING_PRE_MEDICAL_STUDENTS',
  },
  'Evening Shift|Pre-Engineering': {
    path: 'src/data/eveningPreEngineeringStudents.ts',
    exportName: 'EVENING_PRE_ENGINEERING_STUDENTS',
  },
};

/** Prefer updating these existing rows (roll → current slug) when same person. */
const UPDATE_BY_ROLL = {
  286: 'abdul-basit-286', // morning Pre-Medical
  679: 'muhaib-ukasha-679', // evening Pre-Medical → rename to m-ukashah-679
};

const SLUG_ALIASES = {
  'muhaib-ukasha-679': 'm-ukashah-679',
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
  const v = normalizeOptional(value);
  if (!v) return '';
  return v.replace(/\s*positive$/i, '+').replace(/\s*negative$/i, '-').trim();
}

function resolveDiscipline(discipline, classCell) {
  const d = String(discipline || '').toLowerCase();
  const c = String(classCell || '').toLowerCase();
  if (/eng/.test(d) || /eng/.test(c)) return 'Pre-Engineering';
  if (/computer|comp\.?\s*sc|c\.?\s*s/.test(d)) return 'Computer Science';
  if (/arts|humanities/.test(d)) return 'Arts';
  if (/med|medical|f\d/.test(d) || /med|medical|f\d/.test(c)) return 'Pre-Medical';
  return 'Pre-Medical';
}

function enrollmentFromPhoto(photoFile, classCell) {
  const photo = String(photoFile || '').toLowerCase();
  if (/eveing|evening/.test(photo)) return 'Evening Shift';
  if (/self/.test(photo)) return 'Self Finance';
  if (/morning|moning/.test(photo)) return 'Morning Shift';
  const c = String(classCell || '').toLowerCase();
  if (/\be\d\b|evening/.test(c)) return 'Evening Shift';
  return 'Morning Shift';
}

function findPhotoFile(photos, photoName, rollNo) {
  const roll = String(rollNo).trim();
  const alts = ['.png', '.jpg', '.jpeg', '.jfif', '.PNG', '.JPG', '.JPEG'];
  const candidates = [];
  const push = (c) => {
    if (c && !candidates.includes(c)) candidates.push(c);
  };
  if (photoName) {
    push(photoName);
    const base = photoName.replace(/\.[^.]+$/, '');
    for (const e of alts) push(`${base}${e}`);
  }
  for (const e of alts) push(`${roll}${e}`);
  for (const c of candidates) {
    if (photos.has(c)) return c;
  }
  const tagged = [...photos].filter((file) => {
    const base = file.replace(/\.[^.]+$/, '');
    return base === roll || base.startsWith(`${roll}_`);
  });
  tagged.sort((a, b) => a.length - b.length);
  return tagged[0] || null;
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
  fs.writeFileSync(path.join(root, filePath), `${header}${toTsArrayBody(students)}${footer}`);
}

function upsertAliases(aliases) {
  const file = path.join(root, 'src/data/studentsData.ts');
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

function parseIncoming() {
  const wb = XLSX.readFile(path.join(root, EXCEL));
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' });
  const photoDir = path.join(root, PHOTO_DIR);
  const photos = new Set(
    fs.existsSync(photoDir)
      ? fs.readdirSync(photoDir).filter((f) => /\.(png|jpe?g|jfif|webp|gif)$/i.test(f))
      : []
  );

  const students = [];
  for (const r of rows) {
    const name = cell(r, 'Student Name', 'Name');
    const rollNo = cell(r, 'Enrollment', 'Roll No', 'Roll Number', 'Class Roll No');
    if (!name || !/^\d+$/.test(rollNo)) continue;

    const classCell = cell(r, 'Class');
    const discipline = resolveDiscipline(cell(r, 'Discipline', 'Subject'), classCell);
    const matched = findPhotoFile(photos, cell(r, 'Photo File Name', 'Photo'), rollNo);
    const enrollmentType = enrollmentFromPhoto(matched, classCell);
    const slug = makeStudentSlug(name, rollNo);

    students.push({
      slug,
      name,
      fatherName: cell(r, "Father's Name", 'Father Name', 'Father'),
      class: discipline,
      classYear: '1st year',
      rollNo,
      enrollmentType,
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

// --- main ---
const incoming = parseIncoming();
console.log(`Parsed ${incoming.length} 1st-year students`);

const fileCache = new Map();
function getFile(key) {
  if (!fileCache.has(key)) {
    const meta = FILES[key];
    if (!meta) throw new Error(`No target file for ${key}`);
    fileCache.set(key, { ...meta, ...parseTsArray(meta.path, meta.exportName) });
  }
  return fileCache.get(key);
}

let added = 0;
let updated = 0;

for (const s of incoming) {
  const key = `${s.enrollmentType}|${s.class}`;
  const file = getFile(key);
  // Only update known same-person rows or exact slug — never overwrite another student on roll alone
  const preferSlug = UPDATE_BY_ROLL[s.rollNo];
  let idx = -1;
  if (preferSlug) idx = file.students.findIndex((x) => x.slug === preferSlug);
  if (idx < 0) idx = file.students.findIndex((x) => x.slug === s.slug);

  if (idx >= 0) {
    file.students[idx] = { ...file.students[idx], ...s };
    updated += 1;
    console.log(`  update ${s.rollNo} ${s.name} (${s.enrollmentType} ${s.class})`);
  } else {
    file.students.push(s);
    added += 1;
    console.log(`  add ${s.rollNo} ${s.name} (${s.enrollmentType} ${s.class})`);
  }
}

for (const file of fileCache.values()) {
  writeTs(file.path, file.header, file.students, file.footer);
  console.log(`Wrote ${file.students.length} -> ${file.path}`);
}

upsertAliases(SLUG_ALIASES);

const urlLines = [
  '# 1st year batch — Student URLs',
  `# Domain: ${DOMAIN}`,
  `# Count: ${incoming.length}`,
  '',
];
for (const s of incoming) {
  const url = studentUrl(s.slug);
  urlLines.push(
    `${s.rollNo}\t${s.name}\t${s.class}\t${s.classYear}\t${s.enrollmentType}\t${url}` +
      (s.photoFile ? '' : '\tNO_PHOTO')
  );
  console.log(`${s.rollNo}\t${s.name}\t${s.enrollmentType}\t${url}`);
}
fs.writeFileSync(path.join(root, COHORT, 'URLS-first-year-batch.txt'), urlLines.join('\n') + '\n');
console.log(`\nadded=${added} updated=${updated}`);
console.log(`Wrote ${COHORT}/URLS-first-year-batch.txt`);
