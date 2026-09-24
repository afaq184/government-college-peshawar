/**
 * Phase 7 (evening-students/7_phase): CS, Pre-Engineering, Pre-Medical.
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
const PHASE7 = 'public/student/evening-students/7_phase';

const RANGES = {
  'Pre-Medical': { morning: [1, 500], evening: [500, 1000] },
  'Pre-Engineering': { morning: [1001, 1500], evening: [1501, 2000] },
  'Computer Science': { morning: [2001, 2100], evening: [2101, 2500] },
};

const SOURCES = [
  {
    excel: `${PHASE7}/eveving cs enginering and medical_governmner.xlsx`,
    photoDir: `${PHASE7}/Government clg _pic`,
    photoPrefix: 'evening-students/7_phase/Government clg _pic',
    className: 'auto',
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

function resolveClass(discipline, rollN, forced) {
  if (forced && forced !== 'auto') return forced;
  const d = String(discipline || '').toLowerCase();
  if (/med|medical/.test(d)) return 'Pre-Medical';
  if (/eng/.test(d)) return 'Pre-Engineering';
  if (/cis|computer|comp\.?\s*sc|c\.?\s*s/.test(d)) return 'Computer Science';
  if (rollN >= 2001) return 'Computer Science';
  if (rollN >= 1001) return 'Pre-Engineering';
  return 'Pre-Medical';
}

function classifyShift(className, n) {
  const ranges = RANGES[className];
  if (!ranges) return null;
  if (inRange(n, ranges.evening)) return 'Evening Shift';
  if (inRange(n, ranges.morning)) return 'Morning Shift';
  return null;
}

/** Fix known data typos: eng "098" → "1098" when 1098 photo exists. */
function fixRollNo(rollNo, photos, className) {
  const n = String(parseInt(rollNo, 10));
  if (
    className === 'Pre-Engineering' &&
    (rollNo === '098' || rollNo === '98' || n === '98') &&
    [...photos].some((f) => f.replace(/\.[^.]+$/, '') === '1098')
  ) {
    return '1098';
  }
  return String(parseInt(rollNo, 10)); // normalize leading zeros except we keep as number string
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
    // 1222.png typo on disk as 12222.png
    push(`${rollN}${rollN.slice(-1)}${e}`);
  }
  for (const c of candidates) {
    if (photos.has(c) && !usedPhotos.has(c)) return c;
  }
  const matches = [...photos].filter((file) => {
    const base = file.replace(/\.[^.]+$/, '');
    return (
      base === roll ||
      base === rollN ||
      base === `${rollN}${rollN.slice(-1)}` ||
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
  const students = [];
  const skipped = [];
  const seenInBatch = new Set();
  let missingPhotos = 0;

  for (const r of rows) {
    const name = String(cell(r, 'Student Name', 'Name') || '').trim();
    let rollNo = parseRollNo(cell(r, 'Roll No', 'Roll Number', 'RollNo'));
    if (!name || !rollNo) continue;

    const className = resolveClass(cell(r, 'Discipline'), rollNum(rollNo), source.className);
    rollNo = fixRollNo(rollNo, photos, className);
    const n = rollNum(rollNo);
    const shift = classifyShift(className, n);
    if (!shift) {
      skipped.push({ name, rollNo, className, reason: 'out_of_range' });
      continue;
    }

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

    students.push({
      slug,
      name,
      fatherName: String(cell(r, "Father's Name", 'Father Name', 'Father') || '').trim(),
      class: className,
      rollNo,
      enrollmentType: shift,
      session: '2026-2028',
      admissionNo: rollNo,
      dob: formatDob(cell(r, 'Date of Birth', 'DOB')),
      bloodGroup: normalizeBlood(cell(r, 'Blood Group')),
      cnic: '',
      phone: normalizeOptional(
        cell(r, 'Guardian Contact Number', 'Enrollment Guardian Contact Number', 'Contact Number', 'Phone')
      ),
      address: normalizeOptional(cell(r, 'Permanent Address', 'Address')),
      status: normalizeOptional(cell(r, 'Status', 'Student Status')) || 'Active',
      ...(matched ? { photoFile: `${source.photoPrefix}/${matched}` } : {}),
    });
  }

  return { students, skipped, missingPhotos, photos: photos.size, excel: source.excel };
}

function mergeStudents(existingStudents, newcomers) {
  const bySlug = new Map(existingStudents.map((s) => [s.slug, s]));
  const added = [];
  const updated = [];
  for (const s of newcomers) {
    if (bySlug.has(s.slug)) {
      const prev = bySlug.get(s.slug);
      bySlug.set(s.slug, { ...prev, ...s, slug: prev.slug });
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

function writeDisciplineUrls(filePath, students) {
  const order = ['Pre-Medical', 'Pre-Engineering', 'Computer Science'];
  let out = '# Phase 7 Student URLs — by Discipline (Morning / Evening)\n';
  out += `# Domain: ${DOMAIN}\n`;
  out += `# Count: ${students.length}\n\n`;
  for (const cls of order) {
    const all = students.filter((s) => s.class === cls);
    const morning = all.filter((s) => s.enrollmentType === 'Morning Shift');
    const evening = all.filter((s) => s.enrollmentType === 'Evening Shift');
    out += `## ${cls}\n\n`;
    out += `### Morning (${morning.length})\n`;
    for (const s of morning) out += `${s.rollNo}\t${s.name}\t${studentUrl(s.slug)}\n`;
    out += `\n### Evening (${evening.length})\n`;
    for (const s of evening) out += `${s.rollNo}\t${s.name}\t${studentUrl(s.slug)}\n`;
    out += '\n';
  }
  fs.writeFileSync(filePath, out);
}

// --- main ---
const allNew = [];
for (const source of SOURCES) {
  console.log(`\n=== ${source.excel} ===`);
  const { students, skipped, missingPhotos, photos } = parseSource(source);
  console.log(
    `photos=${photos} students=${students.length} skipped=${skipped.length}` +
      (missingPhotos ? ` missingPhotos=${missingPhotos}` : '')
  );
  if (skipped.length) console.log('skipped:', skipped);
  allNew.push(...students);
}

const byBucket = {
  csM: allNew.filter((s) => s.class === 'Computer Science' && s.enrollmentType === 'Morning Shift'),
  csE: allNew.filter((s) => s.class === 'Computer Science' && s.enrollmentType === 'Evening Shift'),
  engM: allNew.filter((s) => s.class === 'Pre-Engineering' && s.enrollmentType === 'Morning Shift'),
  engE: allNew.filter((s) => s.class === 'Pre-Engineering' && s.enrollmentType === 'Evening Shift'),
  medM: allNew.filter((s) => s.class === 'Pre-Medical' && s.enrollmentType === 'Morning Shift'),
  medE: allNew.filter((s) => s.class === 'Pre-Medical' && s.enrollmentType === 'Evening Shift'),
};

const targets = [
  {
    key: 'csM',
    path: 'src/data/morningComputerScienceStudents.ts',
    exportName: 'MORNING_CS_STUDENTS',
    comment:
      'Morning Shift — Computer Science 1st Year (2026-2028), including phase 4–7.',
    students: byBucket.csM,
  },
  {
    key: 'engM',
    path: 'src/data/morningPreEngineeringStudents.ts',
    exportName: 'MORNING_PRE_ENGINEERING_STUDENTS',
    comment:
      'Morning Shift — Pre-Engineering 1st Year (2026-2028), including phase 4–7.',
    students: byBucket.engM,
  },
  {
    key: 'medM',
    path: 'src/data/morningPreMedicalStudents.ts',
    exportName: 'MORNING_PRE_MEDICAL_STUDENTS',
    comment: 'Morning Shift — Pre-Medical 1st Year (2026-2028), including phase 4–7.',
    students: byBucket.medM,
  },
  {
    key: 'csE',
    path: 'src/data/eveningComputerScienceStudents.ts',
    exportName: 'EVENING_CS_STUDENTS',
    comment:
      'Evening Shift — Computer Science 1st Year (2026-2028), including phase 4–7.',
    students: byBucket.csE,
  },
  {
    key: 'engE',
    path: 'src/data/eveningPreEngineeringStudents.ts',
    exportName: 'EVENING_PRE_ENGINEERING_STUDENTS',
    comment:
      'Evening Shift — Pre-Engineering 1st Year (2026-2028), including phase 4–7.',
    students: byBucket.engE,
  },
  {
    key: 'medE',
    path: 'src/data/eveningPreMedicalStudents.ts',
    exportName: 'EVENING_PRE_MEDICAL_STUDENTS',
    comment: 'Evening Shift — Pre-Medical 1st Year (2026-2028), including phase 4–7.',
    students: byBucket.medE,
  },
];

for (const cfg of targets) {
  const existing = parseTsStudents(cfg.path);
  if (!existing.length && fs.existsSync(path.join(root, cfg.path))) {
    console.error(`Abort: parsed 0 students from ${cfg.path}`);
    process.exit(1);
  }
  const { merged, added, updated } = mergeStudents(existing, cfg.students);
  fs.writeFileSync(path.join(root, cfg.path), toTsArray(cfg.exportName, cfg.comment, merged));
  console.log(
    `\n${cfg.key}: existing=${existing.length} +new=${added.length} updated=${updated.length} -> ${merged.length}`
  );
}

const outDir = path.join(root, PHASE7);
const morning = allNew.filter((s) => s.enrollmentType === 'Morning Shift');
const evening = allNew.filter((s) => s.enrollmentType === 'Evening Shift');
allNew.sort((a, b) => rollNum(a.rollNo) - rollNum(b.rollNo) || a.class.localeCompare(b.class));

writeUrls(path.join(outDir, 'URLS-morning-phase7.txt'), morning, 'Phase 7 — Morning students');
writeUrls(path.join(outDir, 'URLS-evening-phase7.txt'), evening, 'Phase 7 — Evening students');
writeUrls(path.join(outDir, 'URLS-all-phase7.txt'), allNew, 'Phase 7 — All students (M+E)');
writeDisciplineUrls(path.join(outDir, 'URLS-by-discipline-phase7.txt'), allNew);

console.log('\n========== SUMMARY ==========');
console.log(
  `Pre-Medical M=${byBucket.medM.length} E=${byBucket.medE.length}`
);
console.log(
  `Pre-Engineering M=${byBucket.engM.length} E=${byBucket.engE.length}`
);
console.log(
  `Computer Science M=${byBucket.csM.length} E=${byBucket.csE.length}`
);
console.log(`Total Morning=${morning.length} Evening=${evening.length} All=${allNew.length}`);
console.log(`URL files under: ${outDir}`);
