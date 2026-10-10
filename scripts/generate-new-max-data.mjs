/**
 * New_MAX_DATA batch — enrollment + year from Excel Roll No / Class columns.
 * Merges into morning/evening/self-finance/second-year TS files by slug.
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
const COHORT = 'public/student/max_new_data';
const EXCEL = `${COHORT}/max_data.xlsx`;
const PHOTO_DIR = `${COHORT}/pic`;
const PHOTO_PREFIX = 'max_new_data/pic';

const FILES = {
  'Morning Shift|Pre-Medical|1st year': {
    path: 'src/data/morningPreMedicalStudents.ts',
    exportName: 'MORNING_PRE_MEDICAL_STUDENTS',
  },
  'Morning Shift|Arts|1st year': {
    path: 'src/data/morningArtsStudents.ts',
    exportName: 'MORNING_ARTS_STUDENTS',
  },
  'Morning Shift|Arts|2nd year': {
    path: 'src/data/morningSecondYearStudents.ts',
    exportName: 'MORNING_SECOND_YEAR_STUDENTS',
  },
  'Morning Shift|Pre-Medical|2nd year': {
    path: 'src/data/morningSecondYearStudents.ts',
    exportName: 'MORNING_SECOND_YEAR_STUDENTS',
  },
  'Morning Shift|Computer Science|2nd year': {
    path: 'src/data/morningSecondYearStudents.ts',
    exportName: 'MORNING_SECOND_YEAR_STUDENTS',
  },
  'Morning Shift|Pre-Engineering|2nd year': {
    path: 'src/data/morningSecondYearStudents.ts',
    exportName: 'MORNING_SECOND_YEAR_STUDENTS',
  },
  'Evening Shift|Pre-Medical|1st year': {
    path: 'src/data/eveningPreMedicalStudents.ts',
    exportName: 'EVENING_PRE_MEDICAL_STUDENTS',
  },
  'Evening Shift|Pre-Engineering|1st year': {
    path: 'src/data/eveningPreEngineeringStudents.ts',
    exportName: 'EVENING_PRE_ENGINEERING_STUDENTS',
  },
  'Evening Shift|Computer Science|1st year': {
    path: 'src/data/eveningComputerScienceStudents.ts',
    exportName: 'EVENING_CS_STUDENTS',
  },
  'Self Finance|Computer Science|1st year': {
    path: 'src/data/selfFinanceStudents.ts',
    exportName: 'SELF_FINANCE_STUDENTS',
  },
  'Self Finance|Computer Science|2nd year': {
    path: 'src/data/selfFinanceStudents.ts',
    exportName: 'SELF_FINANCE_STUDENTS',
  },
  'Self Finance|Pre-Medical|1st year': {
    path: 'src/data/selfFinanceStudents.ts',
    exportName: 'SELF_FINANCE_STUDENTS',
  },
  'Self Finance|Pre-Medical|2nd year': {
    path: 'src/data/selfFinanceStudents.ts',
    exportName: 'SELF_FINANCE_STUDENTS',
  },
};

/** Known same-person slug updates (old slug → keep updating that row). */
const UPDATE_BY_ROLL = {
  579: 'rahat-ullah-579',
  2191: 'amir-mehmood-khan-2191',
  2233: 'sahibzada-ahmad-zia-2233',
  1565: 'malik-farhan-muhammad-1565',
};

const SLUG_ALIASES = {
  'sahibzada-ahmad-zia-2233': 'shahzada-ahmad-zia-2233',
  'malik-farhan-muhammad-1565': 'muhammad-farhan-malik-1565',
  'amir-mehmood-khan-2191': 'aamir-mehmood-khan-2191',
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
  if (!v || v === '--' || v === '-' || /^n\/?a$/i.test(v) || /^none$/i.test(v) || /^nill$/i.test(v)) {
    return '';
  }
  if (/^not\s*(specified|provided|mentioned)$/i.test(v)) return '';
  return v;
}

function normalizeBlood(value) {
  const v = normalizeOptional(value);
  if (!v) return '';
  return v.replace(/\s*positive$/i, '+').replace(/\s*negative$/i, '-').trim();
}

function parseRollAndEnrollment(raw) {
  const s = String(raw || '').trim();
  const m = s.match(/^(\d+)\s*(.*)$/i);
  if (!m) return { rollNo: '', enrollmentType: 'Morning Shift' };
  const rollNo = String(parseInt(m[1], 10));
  const rest = m[2].toLowerCase();
  let enrollmentType = 'Morning Shift';
  if (/eveing|evening/.test(rest)) enrollmentType = 'Evening Shift';
  else if (/self/.test(rest)) enrollmentType = 'Self Finance';
  else if (/morning|moning/.test(rest)) enrollmentType = 'Morning Shift';
  return { rollNo, enrollmentType };
}

function normalizeClassYear(value) {
  const v = String(value || '')
    .trim()
    .toLowerCase();
  if (/2nd|second/.test(v)) return '2nd year';
  if (/\bbs\b/.test(v)) return 'BS';
  return '1st year';
}

function resolveDiscipline(discipline, subject, classCell) {
  const d = `${discipline} ${subject} ${classCell}`.toLowerCase();
  if (/computer|comp\.?\s*sc|c\/s|c\.?\s*s/.test(d)) return 'Computer Science';
  if (/eng/.test(d)) return 'Pre-Engineering';
  if (/arts|humanities|fa\b/.test(d)) return 'Arts';
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
  if (end < 0) throw new Error(`array end not found in ${filePath}`);
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
  const usedPhotos = new Set();
  const students = [];

  for (const r of rows) {
    const name = cell(r, 'Name', 'Student Name');
    const { rollNo, enrollmentType } = parseRollAndEnrollment(cell(r, 'Roll No', 'Enrollment'));
    if (!name || !rollNo) continue;

    const classCell = cell(r, 'Class');
    const classYear = normalizeClassYear(classCell);
    const discipline = resolveDiscipline(
      cell(r, 'Discipline'),
      cell(r, 'Subject'),
      classCell
    );
    const matched = findPhotoFile(photos, rollNo, name, usedPhotos);
    if (matched) usedPhotos.add(matched);

    students.push({
      slug: makeStudentSlug(name, rollNo),
      name,
      fatherName: cell(r, 'Father Name', "Father's Name", 'Father'),
      class: discipline,
      classYear,
      rollNo,
      enrollmentType,
      session: '2026-2028',
      admissionNo: rollNo,
      dob: normalizeOptional(cell(r, 'DOB', 'Date of Birth')),
      bloodGroup: normalizeBlood(cell(r, 'Blood Group')),
      cnic: '',
      phone: normalizeOptional(cell(r, 'Contact', 'Contact Number', 'Phone')),
      address: normalizeOptional(cell(r, 'Address', 'Permanent Address')),
      status: 'Active',
      ...(matched ? { photoFile: `${PHOTO_PREFIX}/${matched}` } : {}),
    });
  }
  return { students, photos: photos.size, used: usedPhotos.size };
}

// --- main ---
const { students: incoming, photos, used } = parseIncoming();
console.log(`Parsed ${incoming.length} students (photos=${photos} used=${used})`);

const fileCache = new Map();
function getFile(key) {
  if (!fileCache.has(key)) {
    const meta = FILES[key];
    if (!meta) throw new Error(`No target file for ${key}`);
    // Reuse same parse if multiple keys map to same path+export
    const cacheKey = `${meta.path}|${meta.exportName}`;
    for (const [k, v] of fileCache) {
      if (k.startsWith('_file:') && k === `_file:${cacheKey}`) {
        fileCache.set(key, v);
        return v;
      }
    }
    const parsed = { ...meta, ...parseTsArray(meta.path, meta.exportName) };
    fileCache.set(key, parsed);
    fileCache.set(`_file:${cacheKey}`, parsed);
  }
  return fileCache.get(key);
}

let added = 0;
let updated = 0;

for (const s of incoming) {
  const key = `${s.enrollmentType}|${s.class}|${s.classYear}`;
  const file = getFile(key);
  const preferSlug = UPDATE_BY_ROLL[s.rollNo];
  let idx = -1;
  if (preferSlug) idx = file.students.findIndex((x) => x.slug === preferSlug);
  if (idx < 0) idx = file.students.findIndex((x) => x.slug === s.slug);

  if (idx >= 0) {
    file.students[idx] = { ...file.students[idx], ...s };
    updated += 1;
    console.log(`  update ${s.rollNo}\t${s.name}\t${s.enrollmentType}\t${s.class}\t${s.classYear}`);
  } else {
    file.students.push(s);
    added += 1;
    console.log(`  add ${s.rollNo}\t${s.name}\t${s.enrollmentType}\t${s.class}\t${s.classYear}`);
  }
}

const written = new Set();
for (const file of fileCache.values()) {
  if (!file.path || written.has(file.path)) continue;
  writeTs(file.path, file.header, file.students, file.footer);
  written.add(file.path);
  console.log(`Wrote ${file.students.length} -> ${file.path}`);
}

upsertAliases(SLUG_ALIASES);

const urlLines = [
  '# New_MAX_DATA — Student URLs',
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
}
fs.writeFileSync(path.join(root, COHORT, 'URLS-new-max-data.txt'), urlLines.join('\n') + '\n');
console.log(`\nadded=${added} updated=${updated}`);
console.log(`Wrote ${COHORT}/URLS-new-max-data.txt`);
for (const s of incoming) {
  console.log(
    `${s.rollNo}\t${s.name}\t${s.enrollmentType}\t${s.classYear}\t${studentUrl(s.slug)}`
  );
}
