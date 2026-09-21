/**
 * Phase 4 (evening-students/phase 4 eveing): Computer Science, Pre-Engineering, Pre-Medical.
 * Splits Morning vs Evening by roll ranges, merges into src/data, prints gcpeshawar.com URLs.
 *
 * Medical  M: 1–500     E: 500–1000  (500 → Evening)
 * Eng      M: 1001–1500 E: 1501–2000
 * Computer M: 2001–2100 E: 2101–2500
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

const PHASE4 = 'public/student/evening-students/phase 4 eveing';

const SOURCES = [
  {
    key: 'cs',
    className: 'Computer Science',
    excel: `${PHASE4}/computer_science_eveing_R/computer science.xlsx`,
    photoDir: `${PHASE4}/computer_science_eveing_R/Computer science evening 3_pic_R`,
    photoPrefix: `${PHASE4}/computer_science_eveing_R/Computer science evening 3_pic_R`.replace(
      /^public\/student\//,
      ''
    ),
    morningRange: [2001, 2100],
    eveningRange: [2101, 2500],
  },
  {
    key: 'eng',
    className: 'Pre-Engineering',
    excel: `${PHASE4}/Pre-engineering evening 1_R/pre-engineering.xlsx`,
    photoDir: `${PHASE4}/Pre-engineering evening 1_R/pre-engineering-pic eveing`,
    photoPrefix: `${PHASE4}/Pre-engineering evening 1_R/pre-engineering-pic eveing`.replace(
      /^public\/student\//,
      ''
    ),
    morningRange: [1001, 1500],
    eveningRange: [1501, 2000],
  },
  {
    key: 'med',
    className: 'Pre-Medical',
    excel: `${PHASE4}/pre_medical_R/Medical_Students.xlsx`,
    photoDir: `${PHASE4}/pre_medical_R/medical_stuedent_pic`,
    photoPrefix: `${PHASE4}/pre_medical_R/medical_stuedent_pic`.replace(/^public\/student\//, ''),
    morningRange: [1, 500],
    eveningRange: [500, 1000],
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

/** Strip "2141 (Evening)" / "2044 (Morning)" → "2141" */
function parseRollNo(raw) {
  const s = String(raw || '').trim();
  const m = s.match(/^(\d+)/);
  return m ? m[1] : '';
}

function rollNum(roll) {
  const n = parseInt(String(roll).replace(/\D/g, ''), 10);
  return Number.isFinite(n) ? n : NaN;
}

function inRange(n, [lo, hi]) {
  return Number.isFinite(n) && n >= lo && n <= hi;
}

function classifyShift(n, source) {
  // Evening checked first so Medical roll 500 (in both bands) → Evening
  if (inRange(n, source.eveningRange)) return 'Evening Shift';
  if (inRange(n, source.morningRange)) return 'Morning Shift';
  return null;
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
  // Prefer exact roll base, then "roll (2)" style duplicates
  const matches = [...photos].filter((file) => {
    const base = file.replace(/\.[^.]+$/, '');
    return (
      base === roll ||
      base === rollN ||
      base.startsWith(`${roll} `) ||
      base.startsWith(`${rollN} `) ||
      base.startsWith(`${roll}(`) ||
      base.startsWith(`${rollN}(`)
    );
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
    const hasRoll = cells.some((c) => c === 'roll no' || c === 'rollno' || c === 'roll number');
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
  const morning = [];
  const evening = [];
  const skipped = [];
  const seenInBatch = new Set();
  let missingPhotos = 0;

  for (const r of rows) {
    const name = String(cell(r, 'Student Name', 'Name') || '').trim();
    const rollRaw = cell(r, 'Roll No', 'Roll Number', 'RollNo');
    const rollNo = parseRollNo(rollRaw);
    if (!name || !rollNo) continue;

    const n = rollNum(rollNo);
    const shift = classifyShift(n, source);
    if (!shift) {
      skipped.push({ name, rollNo, reason: 'out_of_range' });
      continue;
    }

    // Allow duplicate rolls in excel (e.g. 118, 325) as distinct if different names —
    // but slug must be unique; second gets slug with father or suffix.
    let slug = makeStudentSlug(name, rollNo);
    const batchKey = `${rollNo}::${slug}`;
    if (seenInBatch.has(batchKey)) {
      skipped.push({ name, rollNo, reason: 'duplicate_row' });
      continue;
    }
    seenInBatch.add(batchKey);

    const photoName = String(cell(r, 'Photo File Name', 'Photo') || '').trim() || `${rollNo}.png`;
    const matched = findPhotoFile(photos, photoName, rollNo, usedPhotos);
    if (matched) usedPhotos.add(matched);
    else missingPhotos += 1;

    const phone = normalizeOptional(
      cell(r, 'Guardian Contact Number', 'Contact Number', 'Phone', 'Contact')
    );
    const student = {
      slug,
      name,
      fatherName: String(cell(r, "Father's Name", 'Father Name', 'Father') || '').trim(),
      class: source.className,
      rollNo,
      enrollmentType: shift,
      session: '2026-2028',
      admissionNo: rollNo,
      dob: formatDob(cell(r, 'Date of Birth', 'DOB')),
      bloodGroup: normalizeBlood(cell(r, 'Blood Group')),
      cnic: '',
      phone,
      address: normalizeOptional(cell(r, 'Permanent Address', 'Address')),
      status: normalizeOptional(cell(r, 'Status', 'Student Status')) || 'Active',
      ...(matched ? { photoFile: `${source.photoPrefix}/${matched}` } : {}),
    };

    if (shift === 'Morning Shift') morning.push(student);
    else evening.push(student);
  }

  morning.sort((a, b) => rollNum(a.rollNo) - rollNum(b.rollNo));
  evening.sort((a, b) => rollNum(a.rollNo) - rollNum(b.rollNo));

  return { morning, evening, skipped, missingPhotos, photos: photos.size };
}

function mergeStudents(existingStudents, newcomers) {
  // Key by slug so duplicate roll numbers (different people) stay separate
  const bySlug = new Map(existingStudents.map((s) => [s.slug, s]));
  const added = [];
  const updated = [];
  for (const s of newcomers) {
    if (bySlug.has(s.slug)) {
      const prev = bySlug.get(s.slug);
      bySlug.set(s.slug, {
        ...prev,
        ...s,
        slug: prev.slug,
      });
      updated.push(s.slug);
    } else {
      bySlug.set(s.slug, s);
      added.push(s);
    }
  }
  const merged = [...bySlug.values()].sort(
    (a, b) => rollNum(a.rollNo) - rollNum(b.rollNo) || a.slug.localeCompare(b.slug)
  );
  return { merged, added, updated };
}

/** Existing generated files are JS object literals with single quotes — eval safely. */
function parseTsStudents(tsPath) {
  const full = path.join(root, tsPath);
  if (!fs.existsSync(full)) return [];
  const text = fs.readFileSync(full, 'utf8');
  const match = text.match(/=\s*(\[[\s\S]*\]);?\s*$/m);
  if (!match) {
    console.error('Failed to locate array in', tsPath);
    return [];
  }
  try {
    // Generated files are plain object literals (no expressions) — safe to evaluate.
    return new Function(`"use strict"; return (${match[1]});`)();
  } catch (err) {
    console.error('Failed to parse', tsPath, err.message);
    process.exit(1);
  }
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

// --- main ---
const allMorningNew = [];
const allEveningNew = [];
const report = [];

for (const source of SOURCES) {
  console.log(`\n=== ${source.className} ===`);
  const { morning, evening, skipped, missingPhotos, photos } = parseSource(source);
  console.log(
    `photos=${photos} morning=${morning.length} evening=${evening.length} skipped=${skipped.length}` +
      (missingPhotos ? ` missingPhotos=${missingPhotos}` : '')
  );
  if (skipped.length) {
    console.log('skipped:', skipped);
  }
  allMorningNew.push(...morning);
  allEveningNew.push(...evening);
  report.push({ key: source.key, morning, evening, skipped });
}

// Merge morning into existing morning files
const morningTargets = {
  cs: {
    path: 'src/data/morningComputerScienceStudents.ts',
    exportName: 'MORNING_CS_STUDENTS',
    comment:
      'Morning Shift — Computer Science 1st Year (2026-2028), phase 1 + phase 2 + remains + phase 4.',
    students: report.find((r) => r.key === 'cs').morning,
  },
  eng: {
    path: 'src/data/morningPreEngineeringStudents.ts',
    exportName: 'MORNING_PRE_ENGINEERING_STUDENTS',
    comment:
      'Morning Shift — Pre-Engineering 1st Year (2026-2028), phase 1–3 + morning_1 + phase 4.',
    students: report.find((r) => r.key === 'eng').morning,
  },
  med: {
    path: 'src/data/morningPreMedicalStudents.ts',
    exportName: 'MORNING_PRE_MEDICAL_STUDENTS',
    comment: 'Morning Shift — Pre-Medical 1st Year (2026-2028), phase 1 + phase 2 + phase 4.',
    students: report.find((r) => r.key === 'med').morning,
  },
};

const morningAddedAll = [];
for (const [key, cfg] of Object.entries(morningTargets)) {
  const eveningSlugs = new Set((report.find((r) => r.key === key)?.evening || []).map((s) => s.slug));
  let existing = parseTsStudents(cfg.path);
  // Drop phase-4 rows that now belong in evening (range correction)
  const before = existing.length;
  existing = existing.filter((s) => !eveningSlugs.has(s.slug));
  const removed = before - existing.length;
  if (!existing.length && fs.existsSync(path.join(root, cfg.path))) {
    console.error(`Abort: parsed 0 students from ${cfg.path}`);
    process.exit(1);
  }
  const { merged, added, updated } = mergeStudents(existing, cfg.students);
  fs.writeFileSync(path.join(root, cfg.path), toTsArray(cfg.exportName, cfg.comment, merged));
  console.log(
    `\nMorning ${key}: existing=${before} removedToEvening=${removed} +new=${added.length} updated=${updated.length} -> ${merged.length}`
  );
  morningAddedAll.push(...added.map((s) => ({ ...s, _batch: key })));
  for (const slug of updated) {
    const s = merged.find((x) => x.slug === slug);
    if (s) morningAddedAll.push({ ...s, _batch: key, _updated: true });
  }
}

// Evening CS: merge with existing
{
  const pathTs = 'src/data/eveningComputerScienceStudents.ts';
  const morningSlugs = new Set(report.find((r) => r.key === 'cs').morning.map((s) => s.slug));
  let existing = parseTsStudents(pathTs);
  const before = existing.length;
  existing = existing.filter((s) => !morningSlugs.has(s.slug));
  const newcomers = report.find((r) => r.key === 'cs').evening;
  if (!existing.length) {
    console.error(`Abort: parsed 0 students from ${pathTs}`);
    process.exit(1);
  }
  const { merged, added, updated } = mergeStudents(existing, newcomers);
  fs.writeFileSync(
    path.join(root, pathTs),
    toTsArray(
      'EVENING_CS_STUDENTS',
      'Evening Shift — Computer Science 1st Year (2026-2028), including computer_science_eveing_1 + phase 4.',
      merged
    )
  );
  console.log(
    `\nEvening CS: existing=${before} removedToMorning=${before - existing.length} +new=${added.length} updated=${updated.length} -> ${merged.length}`
  );
}

// Evening Pre-Medical: merge
{
  const pathTs = 'src/data/eveningPreMedicalStudents.ts';
  const morningSlugs = new Set(report.find((r) => r.key === 'med').morning.map((s) => s.slug));
  let existing = parseTsStudents(pathTs);
  const before = existing.length;
  existing = existing.filter((s) => !morningSlugs.has(s.slug));
  const newcomers = report.find((r) => r.key === 'med').evening;
  if (!existing.length) {
    console.error(`Abort: parsed 0 students from ${pathTs}`);
    process.exit(1);
  }
  const { merged, added, updated } = mergeStudents(existing, newcomers);
  fs.writeFileSync(
    path.join(root, pathTs),
    toTsArray(
      'EVENING_PRE_MEDICAL_STUDENTS',
      'Evening Shift — Pre-Medical 1st Year (2026-2028), including phase 4.',
      merged
    )
  );
  console.log(
    `\nEvening Med: existing=${before} removedToMorning=${before - existing.length} +new=${added.length} updated=${updated.length} -> ${merged.length}`
  );
}

// Evening Pre-Engineering: create / replace from phase 4 evening only (no prior file)
{
  const pathTs = 'src/data/eveningPreEngineeringStudents.ts';
  const morningSlugs = new Set(report.find((r) => r.key === 'eng').morning.map((s) => s.slug));
  let existing = parseTsStudents(pathTs);
  const before = existing.length;
  existing = existing.filter((s) => !morningSlugs.has(s.slug));
  const newcomers = report.find((r) => r.key === 'eng').evening;
  const { merged, added, updated } = mergeStudents(existing, newcomers);
  fs.writeFileSync(
    path.join(root, pathTs),
    toTsArray(
      'EVENING_PRE_ENGINEERING_STUDENTS',
      'Evening Shift — Pre-Engineering 1st Year (2026-2028), phase 4.',
      merged
    )
  );
  console.log(
    `\nEvening Eng: existing=${before} removedToMorning=${before - existing.length} +new=${added.length} updated=${updated.length} -> ${merged.length}`
  );
}

// Wire studentsData.ts
{
  const dataFile = path.join(root, 'src/data/studentsData.ts');
  let text = fs.readFileSync(dataFile, 'utf8');
  if (!text.includes('eveningPreEngineeringStudents')) {
    text = text.replace(
      "import { EVENING_PRE_MEDICAL_STUDENTS } from './eveningPreMedicalStudents';",
      "import { EVENING_PRE_MEDICAL_STUDENTS } from './eveningPreMedicalStudents';\nimport { EVENING_PRE_ENGINEERING_STUDENTS } from './eveningPreEngineeringStudents';"
    );
    text = text.replace(
      '...EVENING_PRE_MEDICAL_STUDENTS,',
      '...EVENING_PRE_MEDICAL_STUDENTS,\n  ...EVENING_PRE_ENGINEERING_STUDENTS,'
    );
    fs.writeFileSync(dataFile, text);
    console.log('\nUpdated studentsData.ts with EVENING_PRE_ENGINEERING_STUDENTS');
  }
}

// URL lists (phase 4 only — morning + evening from this batch)
const outDir = path.join(root, 'public/student/evening-students/phase 4 eveing');
const phase4Morning = allMorningNew;
const phase4Evening = allEveningNew;
const phase4All = [...phase4Morning, ...phase4Evening].sort(
  (a, b) => rollNum(a.rollNo) - rollNum(b.rollNo) || a.class.localeCompare(b.class)
);

writeUrls(path.join(outDir, 'URLS-morning-phase4.txt'), phase4Morning, 'Phase 4 — Morning students');
writeUrls(path.join(outDir, 'URLS-evening-phase4.txt'), phase4Evening, 'Phase 4 — Evening students');
writeUrls(path.join(outDir, 'URLS-all-phase4.txt'), phase4All, 'Phase 4 — All students (M+E)');

console.log('\n========== MORNING URLs (phase 4) ==========');
for (const s of phase4Morning) {
  console.log(`${s.rollNo}\t${s.name}\t${s.class}\t${studentUrl(s.slug)}`);
}
console.log('\n========== EVENING URLs (phase 4) ==========');
for (const s of phase4Evening) {
  console.log(`${s.rollNo}\t${s.name}\t${s.class}\t${studentUrl(s.slug)}`);
}
console.log(
  `\nDone. Morning=${phase4Morning.length} Evening=${phase4Evening.length} All=${phase4All.length}`
);
console.log(`URL files written under: ${outDir}`);
