/**
 * Second-year cohort (enrollment from Shift column / photo tag / overrides).
 * Sources: public/student/second year data/
 * Writes: src/data/morningSecondYearStudents.ts + URL lists
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
const COHORT = 'public/student/second year data';
const DATA_TS = 'src/data/morningSecondYearStudents.ts';
const EXPORT_NAME = 'MORNING_SECOND_YEAR_STUDENTS';
const PHOTO_MARKER = 'second year data/';

/** Manual enrollment corrections (roll → type). Keeps regen from wiping fixes. */
const ENROLLMENT_OVERRIDES = {
  718: 'Evening Shift',
  6305: 'Self Finance',
  6515: 'Self Finance',
  6560: 'Self Finance',
  6579: 'Self Finance',
  8096: 'Self Finance',
  8236: 'Self Finance',
};

/** Excel roll typos corrected by photo filename (e.g. 263 → 8263). */
const ROLL_CORRECTIONS = {
  263: '8263',
};

const SOURCES = [
  {
    excel: `${COHORT}/second year.xlsx`,
    photoDir: `${COHORT}/Second year`,
    photoPrefix: 'second year data/Second year',
  },
  {
    excel: `${COHORT}/second_year_batch2/Second_Year_Students_data.xlsx`,
    photoDir: `${COHORT}/second_year_batch2/Second-year_pic`,
    photoPrefix: 'second year data/second_year_batch2/Second-year_pic',
  },
];

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
  return v.replace(/\s*positive$/i, '+').replace(/\s*negative$/i, '-').trim();
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
  const raw = String(value).trim();
  if (!raw || /^not\s*(specified|provided)$/i.test(raw)) return '';
  return raw;
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

function resolveDiscipline(discipline, classCell, rollN) {
  const d = String(discipline || '').toLowerCase().trim();
  const c = String(classCell || '').toLowerCase().trim();
  if (/arts|humanities|fa\b|general\s*arts/.test(d) || /arts|humanities/.test(c)) return 'Arts';
  if (/cis|computer|comp\.?\s*sc|c\.?\s*s/.test(d) || /computer|comp\.?\s*sc|c\.?\s*s/.test(c)) {
    return 'Computer Science';
  }
  if (/eng/.test(d) || /eng/.test(c)) return 'Pre-Engineering';
  if (/med|medical/.test(d) || /med|medical|f-?\s*[678]|c-?\s*3/.test(c)) return 'Pre-Medical';
  // High 6xxx rolls in this cohort are Medical; 8xxx are CS
  if (rollN >= 8000) return 'Computer Science';
  if (rollN >= 6000) return 'Pre-Medical';
  if (rollN >= 3001 && rollN <= 3999) return 'Arts';
  if (rollN >= 2001) return 'Computer Science';
  if (rollN >= 1001) return 'Pre-Engineering';
  return 'Pre-Medical';
}

function normalizeEnrollment(shiftCell, photoFile, rollNo) {
  if (ENROLLMENT_OVERRIDES[rollNo]) return ENROLLMENT_OVERRIDES[rollNo];
  const shift = String(shiftCell || '')
    .trim()
    .toLowerCase();
  if (/evening|eveing/.test(shift)) return 'Evening Shift';
  if (/self/.test(shift)) return 'Self Finance';
  if (/morning|moning/.test(shift)) return 'Morning Shift';
  const photo = String(photoFile || '').toLowerCase();
  if (/eveing|evening/.test(photo)) return 'Evening Shift';
  if (/self/.test(photo)) return 'Self Finance';
  if (/morning|moning/.test(photo)) return 'Morning Shift';
  return 'Morning Shift';
}

function findPhotoFile(photos, photoName, rollNo, usedPhotos) {
  const roll = String(rollNo).trim();
  const rollN = String(parseInt(roll, 10));
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
    push(`${rollN}${e}`);
  }
  for (const c of candidates) {
    if (photos.has(c) && !usedPhotos.has(c)) return c;
  }
  // Match tagged photos: 286_morning.jpeg, 789_eveing.jpeg, 8263_self-Finance.jpeg
  const tagged = [...photos].filter((file) => {
    if (usedPhotos.has(file)) return false;
    const base = file.replace(/\.[^.]+$/, '');
    return (
      base === roll ||
      base === rollN ||
      base.startsWith(`${roll}_`) ||
      base.startsWith(`${rollN}_`)
    );
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

function findHeaderRowIndex(matrix) {
  for (let i = 0; i < matrix.length; i++) {
    const cells = (matrix[i] || []).map((c) => String(c || '').trim().toLowerCase());
    const hasRoll = cells.some(
      (c) =>
        c === 'roll no' ||
        c === 'rollno' ||
        c === 'roll number' ||
        c === 'enrollment' ||
        c.includes('roll no') ||
        c.includes('enrollment')
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

function parseSource(source) {
  const wb = XLSX.readFile(path.join(root, source.excel));
  const sheetName =
    wb.SheetNames.find((n) => !/instructions|verification/i.test(n)) || wb.SheetNames[0];
  const rows = readSheetRows(wb.Sheets[sheetName]);
  const photoDir = path.join(root, source.photoDir);
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
    let rollNo = parseRollNo(
      cell(r, 'Enrollment', 'Enrollment ', 'Roll No', 'Roll Number', 'RollNo')
    );
    if (!name || !rollNo) {
      skipped.push({ name, rollNo, reason: 'missing_name_or_roll' });
      continue;
    }
    rollNo = String(parseInt(rollNo, 10));
    if (ROLL_CORRECTIONS[rollNo]) rollNo = ROLL_CORRECTIONS[rollNo];
    const n = rollNum(rollNo);
    const classCell = cell(r, 'Class');
    const discipline = resolveDiscipline(
      cell(r, 'Discipline', 'Subject', 'Group / Discipline', 'Group'),
      classCell,
      n
    );

    const slug = makeStudentSlug(name, rollNo);
    if (seenInBatch.has(slug)) {
      skipped.push({ name, rollNo, reason: 'duplicate_row' });
      continue;
    }
    seenInBatch.add(slug);

    const excelPhoto = String(cell(r, 'Photo File Name', 'Photo') || '').trim();
    const matched =
      findPhotoFile(photos, excelPhoto, rollNo, usedPhotos) ||
      findPhotoFile(photos, `${rollNo}.jpeg`, rollNo, usedPhotos) ||
      findPhotoFile(photos, `${rollNo}.png`, rollNo, usedPhotos);
    if (matched) usedPhotos.add(matched);
    else missingPhotos += 1;

    const enrollmentType = normalizeEnrollment(
      cell(r, 'Shift', 'Enrollment Type', 'Type'),
      matched,
      rollNo
    );

    students.push({
      slug,
      name,
      fatherName: String(
        cell(r, "Father's Name", 'Father Name', 'Father / Guardian Name', 'Father', 'S/O') || ''
      ).trim(),
      class: discipline,
      classYear: '2nd year',
      rollNo,
      enrollmentType,
      session: '2026-2028',
      admissionNo: rollNo,
      dob: formatDob(cell(r, 'Date of Birth', 'DOB')),
      bloodGroup: normalizeBlood(cell(r, 'Blood Group')),
      cnic: '',
      phone: normalizeOptional(
        cell(r, 'Guardian Contact Number', 'Contact Number', 'Phone', 'Contact')
      ),
      address: normalizeOptional(cell(r, 'Permanent Address', 'Address')),
      status: normalizeOptional(cell(r, 'Status', 'Student Status')) || 'Active',
      ...(matched ? { photoFile: `${source.photoPrefix}/${matched}` } : {}),
    });
  }

  return { students, skipped, missingPhotos, photos: photos.size, excel: source.excel };
}

function writeUrls(filePath, students, title) {
  const lines = [
    `# ${title}`,
    `# Generated ${new Date().toISOString()}`,
    `# Count: ${students.length}`,
    '',
  ];
  for (const s of students) {
    lines.push(
      `${s.rollNo}\t${s.name}\t${s.class}\t${s.classYear}\t${s.enrollmentType}\t${studentUrl(s.slug)}` +
        (s.photoFile ? '' : '\tNO_PHOTO')
    );
  }
  fs.writeFileSync(filePath, lines.join('\n') + '\n');
}

function writeDisciplineUrls(filePath, students) {
  const order = ['Pre-Medical', 'Pre-Engineering', 'Computer Science', 'Arts'];
  let out = '# Second Year Morning — Student URLs by Discipline\n';
  out += `# Domain: ${DOMAIN}\n`;
  out += `# Count: ${students.length}\n\n`;
  for (const cls of order) {
    const all = students.filter((s) => s.class === cls);
    if (!all.length) continue;
    out += `## ${cls} (${all.length})\n`;
    for (const s of all) out += `${s.rollNo}\t${s.name}\t${studentUrl(s.slug)}\n`;
    out += '\n';
  }
  fs.writeFileSync(filePath, out);
}

// --- main ---
const students = [];
const seenSlugs = new Set();
const allSkipped = [];

for (const source of SOURCES) {
  if (!fs.existsSync(path.join(root, source.excel))) {
    console.log(`\n=== skip missing ${source.excel} ===`);
    continue;
  }
  console.log(`\n=== ${source.excel} ===`);
  const { students: batch, skipped, missingPhotos, photos, excel } = parseSource(source);
  let added = 0;
  for (const s of batch) {
    if (seenSlugs.has(s.slug)) {
      console.warn(`  skip duplicate slug ${s.slug} from ${excel}`);
      continue;
    }
    seenSlugs.add(s.slug);
    students.push(s);
    added += 1;
  }
  console.log(
    `photos=${photos} added=${added} skipped=${skipped.length}` +
      (missingPhotos ? ` missingPhotos=${missingPhotos}` : '')
  );
  if (skipped.length) {
    console.log('skipped:', skipped);
    allSkipped.push(...skipped);
  }
}

students.sort((a, b) => rollNum(a.rollNo) - rollNum(b.rollNo) || a.slug.localeCompare(b.slug));

for (const s of students) {
  console.log(
    `  ${s.rollNo}\t${s.name}\t${s.class}\t${s.classYear}\t${s.enrollmentType}\t${
      s.photoFile ? path.basename(s.photoFile) : 'NO_PHOTO'
    }`
  );
}

const comment =
  '2nd Year (2026-2028) — Morning / Evening / Self Finance from second year data cohorts.';
fs.writeFileSync(path.join(root, DATA_TS), toTsArray(EXPORT_NAME, comment, students));
console.log(`\nWrote ${students.length} students -> ${DATA_TS}`);

const outDir = path.join(root, COHORT);
writeUrls(path.join(outDir, 'URLS-all-second-year-morning.txt'), students, 'Second Year — All students');
writeDisciplineUrls(path.join(outDir, 'URLS-by-discipline-second-year-morning.txt'), students);
writeUrls(
  path.join(outDir, 'second_year_batch2', 'URLS-second-year-batch2.txt'),
  students.filter((s) => (s.photoFile || '').includes('second_year_batch2')),
  'Second Year batch2 — Student URLs'
);

const byClass = {};
const byEnroll = {};
for (const s of students) {
  byClass[s.class] = (byClass[s.class] || 0) + 1;
  byEnroll[s.enrollmentType] = (byEnroll[s.enrollmentType] || 0) + 1;
}
console.log('\n========== SUMMARY ==========');
for (const [k, v] of Object.entries(byClass)) console.log(`${k}: ${v}`);
for (const [k, v] of Object.entries(byEnroll)) console.log(`${k}: ${v}`);
console.log(`Total: ${students.length} (2nd year)`);
console.log(`URL files under: ${outDir}`);
console.log(`PHOTO_MARKER: ${PHOTO_MARKER}`);
