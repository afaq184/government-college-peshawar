/**
 * gcp_18_missing cohort: 18 students with Excel Discipline carrying Morning/Evening.
 * Creates new profiles and updates existing ones that match by name+father (wrong roll/class/photo).
 *
 * Photos: public/student/gcp_18_missing/gcp_pic/{roll}.jpeg
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
const COHORT = 'public/student/gcp_18_missing';
const PHOTO_MARKER = 'gcp_18_missing/';

const SOURCE = {
  excel: `${COHORT}/gcp_18_data.xlsx`,
  photoDir: `${COHORT}/gcp_pic`,
  photoPrefix: 'gcp_18_missing/gcp_pic',
};

const DATA_FILES = [
  {
    key: 'csM',
    path: 'src/data/morningComputerScienceStudents.ts',
    exportName: 'MORNING_CS_STUDENTS',
    className: 'Computer Science',
    shift: 'Morning Shift',
  },
  {
    key: 'engM',
    path: 'src/data/morningPreEngineeringStudents.ts',
    exportName: 'MORNING_PRE_ENGINEERING_STUDENTS',
    className: 'Pre-Engineering',
    shift: 'Morning Shift',
  },
  {
    key: 'medM',
    path: 'src/data/morningPreMedicalStudents.ts',
    exportName: 'MORNING_PRE_MEDICAL_STUDENTS',
    className: 'Pre-Medical',
    shift: 'Morning Shift',
  },
  {
    key: 'csE',
    path: 'src/data/eveningComputerScienceStudents.ts',
    exportName: 'EVENING_CS_STUDENTS',
    className: 'Computer Science',
    shift: 'Evening Shift',
  },
  {
    key: 'engE',
    path: 'src/data/eveningPreEngineeringStudents.ts',
    exportName: 'EVENING_PRE_ENGINEERING_STUDENTS',
    className: 'Pre-Engineering',
    shift: 'Evening Shift',
  },
  {
    key: 'medE',
    path: 'src/data/eveningPreMedicalStudents.ts',
    exportName: 'EVENING_PRE_MEDICAL_STUDENTS',
    className: 'Pre-Medical',
    shift: 'Evening Shift',
  },
];

/** Extra files that may hold a misplaced profile (strip only, do not add gcp_18 here). */
const EXTRA_STRIP_FILES = [
  { path: 'src/data/morningArtsStudents.ts', exportName: 'MORNING_ARTS_STUDENTS' },
  { path: 'src/data/morningSportsStudents.ts', exportName: 'MORNING_SPORTS_STUDENTS' },
  { path: 'src/data/selfFinanceStudents.ts', exportName: 'SELF_FINANCE_STUDENTS' },
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
  return v.replace(/\s*positive$/i, '+').replace(/\s*negative$/i, '-').replace(/\s+/g, '').trim();
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

function normPerson(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/\./g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\b(m|md|muhammad|mohammad)\b/g, 'm')
    .replace(/\s+/g, ' ')
    .trim();
}

function samePerson(a, b) {
  const an = normPerson(a.name);
  const bn = normPerson(b.name);
  const af = normPerson(a.fatherName);
  const bf = normPerson(b.fatherName);
  if (!an || !bn || !af || !bf) return false;
  // Exact name + father only (avoids collapsing distinct students who share a father name)
  return an === bn && af === bf;
}

function resolveClassAndShift(discipline, rollN) {
  const d = String(discipline || '').toLowerCase();
  let className = null;
  if (/med|medical/.test(d)) className = 'Pre-Medical';
  else if (/eng/.test(d)) className = 'Pre-Engineering';
  else if (/cis|computer|comp\.?\s*sc|c\.?\s*s|eveing/.test(d) && /computer|comp/.test(d))
    className = 'Computer Science';
  else if (/computer|comp\.?\s*sc|c\.?\s*s/.test(d)) className = 'Computer Science';

  if (!className) {
    if (rollN >= 2001) className = 'Computer Science';
    else if (rollN >= 1001) className = 'Pre-Engineering';
    else className = 'Pre-Medical';
  }

  let shift = null;
  if (/\b(evening|even|eveing)\b/.test(d)) shift = 'Evening Shift';
  else if (/\bmorning\b/.test(d)) shift = 'Morning Shift';

  if (!shift) {
    // Fallback roll ranges
    if (className === 'Pre-Medical') shift = rollN >= 500 ? 'Evening Shift' : 'Morning Shift';
    else if (className === 'Pre-Engineering')
      shift = rollN >= 1501 ? 'Evening Shift' : 'Morning Shift';
    else shift = rollN >= 2101 ? 'Evening Shift' : 'Morning Shift';
  }

  return { className, shift };
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

function atomicWrite(relPath, contents) {
  const full = path.join(root, relPath);
  const tmp = `${full}.tmp`;
  fs.writeFileSync(tmp, contents, { encoding: 'utf8' });
  const check = fs.readFileSync(tmp, 'utf8');
  if (check !== contents) throw new Error(`write verify failed: ${relPath}`);
  const match = check.match(/=\s*(\[[\s\S]*\]);?\s*$/m);
  if (!match) throw new Error(`wrote unparsable array: ${relPath}`);
  new Function(`"use strict"; return (${match[1]});`)();
  fs.renameSync(tmp, full);
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

function readExistingComment(tsPath, fallback) {
  const full = path.join(root, tsPath);
  if (!fs.existsSync(full)) return fallback;
  const text = fs.readFileSync(full, 'utf8');
  const m = text.match(/\/\*\*\s*([\s\S]*?)\s*\*\//);
  if (!m) return fallback;
  let comment = m[1].replace(/\s+/g, ' ').trim();
  if (!/gcp_18_missing/i.test(comment)) {
    comment = comment.replace(/\.$/, '') + ' + gcp_18_missing.';
  }
  return comment;
}

function parseSource() {
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
    let rollNo = parseRollNo(cell(r, 'Roll No', 'Roll Number', 'RollNo'));
    if (!name || !rollNo) continue;
    rollNo = String(parseInt(rollNo, 10));

    const discipline = cell(r, 'Discipline');
    const { className, shift } = resolveClassAndShift(discipline, rollNum(rollNo));
    if (!shift) {
      skipped.push({ name, rollNo, className, reason: 'no_shift' });
      continue;
    }

    const slug = makeStudentSlug(name, rollNo);
    if (seenInBatch.has(slug)) {
      skipped.push({ name, rollNo, reason: 'duplicate_row' });
      continue;
    }
    seenInBatch.add(slug);

    const excelPhoto = String(cell(r, 'Photo File Name', 'Photo') || '').trim();
    const matched =
      findPhotoFile(photos, `${rollNo}.jpeg`, rollNo, usedPhotos) ||
      findPhotoFile(photos, `${rollNo}.png`, rollNo, usedPhotos) ||
      findPhotoFile(photos, excelPhoto || `${rollNo}.png`, rollNo, usedPhotos);
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
        cell(r, 'Guardian Contact Number', 'Contact Number', 'Phone')
      ),
      address: normalizeOptional(cell(r, 'Permanent Address', 'Address')),
      status: normalizeOptional(cell(r, 'Status', 'Student Status')) || 'Active',
      ...(matched ? { photoFile: `${SOURCE.photoPrefix}/${matched}` } : {}),
    });
  }

  return { students, skipped, missingPhotos, photos: photos.size };
}

/**
 * Remove prior gcp_18 rows and any existing profile that is the same person
 * (name+father) so wrong-roll / wrong-class entries are replaced.
 */
function stripForUpdate(existingStudents, newcomers) {
  const removed = [];
  const kept = existingStudents.filter((s) => {
    if ((s.photoFile || '').includes(PHOTO_MARKER)) {
      removed.push({ slug: s.slug, reason: 'gcp_18_photo' });
      return false;
    }
    const hit = newcomers.find((n) => samePerson(n, s));
    if (hit) {
      removed.push({
        slug: s.slug,
        reason: `same_person→${hit.slug}`,
        oldRoll: s.rollNo,
        newRoll: hit.rollNo,
      });
      return false;
    }
    return true;
  });
  return { kept, removed };
}

function mergeStudents(existingStudents, newcomers) {
  const bySlug = new Map(existingStudents.map((s) => [s.slug, s]));
  const added = [];
  const updated = [];
  for (const s of newcomers) {
    if (bySlug.has(s.slug)) {
      const prev = bySlug.get(s.slug);
      bySlug.set(s.slug, { ...prev, ...s, slug: s.slug });
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
  let out = '# gcp_18_missing Student URLs — by Discipline (Morning / Evening)\n';
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
console.log(`\n=== ${SOURCE.excel} ===`);
const { students: allNew, skipped, missingPhotos, photos } = parseSource();
console.log(
  `photos=${photos} students=${allNew.length} skipped=${skipped.length}` +
    (missingPhotos ? ` missingPhotos=${missingPhotos}` : '')
);
if (skipped.length) console.log('skipped:', skipped);
for (const s of allNew) {
  console.log(
    `  ${s.rollNo}\t${s.name}\t${s.class}\t${s.enrollmentType}\t${s.photoFile ? path.basename(s.photoFile) : 'NO_PHOTO'}`
  );
}

const byBucket = {
  csM: allNew.filter((s) => s.class === 'Computer Science' && s.enrollmentType === 'Morning Shift'),
  csE: allNew.filter((s) => s.class === 'Computer Science' && s.enrollmentType === 'Evening Shift'),
  engM: allNew.filter((s) => s.class === 'Pre-Engineering' && s.enrollmentType === 'Morning Shift'),
  engE: allNew.filter((s) => s.class === 'Pre-Engineering' && s.enrollmentType === 'Evening Shift'),
  medM: allNew.filter((s) => s.class === 'Pre-Medical' && s.enrollmentType === 'Morning Shift'),
  medE: allNew.filter((s) => s.class === 'Pre-Medical' && s.enrollmentType === 'Evening Shift'),
};

// Strip misplaced same-person profiles from extra files (Arts / sports / self-finance)
for (const cfg of EXTRA_STRIP_FILES) {
  const existingRaw = parseTsStudents(cfg.path);
  if (!existingRaw.length) continue;
  const { kept, removed } = stripForUpdate(existingRaw, allNew);
  if (!removed.length) continue;
  const comment = readExistingComment(cfg.path, cfg.exportName);
  atomicWrite(cfg.path, toTsArray(cfg.exportName, comment, kept));
  console.log(`\nEXTRA strip ${cfg.path}: removed=${removed.length}`);
  for (const r of removed) console.log('  -', r);
}

for (const cfg of DATA_FILES) {
  const newcomers = byBucket[cfg.key] || [];
  const existingRaw = parseTsStudents(cfg.path);
  if (!existingRaw.length && fs.existsSync(path.join(root, cfg.path))) {
    console.error(`Abort: parsed 0 students from ${cfg.path}`);
    process.exit(1);
  }
  // Always strip same-person / prior cohort even if this bucket has 0 newcomers
  const { kept, removed } = stripForUpdate(existingRaw, allNew);
  const { merged, added, updated } = mergeStudents(kept, newcomers);
  if (!newcomers.length && !removed.length) {
    console.log(`\n${cfg.key}: skip (0 newcomers, 0 stripped)`);
    continue;
  }
  const comment = readExistingComment(
    cfg.path,
    `${cfg.exportName} (2026-2028), including gcp_18_missing.`
  );
  atomicWrite(cfg.path, toTsArray(cfg.exportName, comment, merged));
  console.log(
    `\n${cfg.key}: existing=${existingRaw.length} stripped=${removed.length} +new=${added.length} updated=${updated.length} -> ${merged.length}`
  );
  for (const r of removed) console.log('  stripped:', r);
}

const outDir = path.join(root, COHORT);
const morning = allNew.filter((s) => s.enrollmentType === 'Morning Shift');
const evening = allNew.filter((s) => s.enrollmentType === 'Evening Shift');
allNew.sort((a, b) => rollNum(a.rollNo) - rollNum(b.rollNo) || a.class.localeCompare(b.class));

writeUrls(path.join(outDir, 'URLS-morning-gcp18.txt'), morning, 'gcp_18_missing — Morning students');
writeUrls(path.join(outDir, 'URLS-evening-gcp18.txt'), evening, 'gcp_18_missing — Evening students');
writeUrls(path.join(outDir, 'URLS-all-gcp18.txt'), allNew, 'gcp_18_missing — All students (M+E)');
writeDisciplineUrls(path.join(outDir, 'URLS-by-discipline-gcp18.txt'), allNew);

console.log('\n========== SUMMARY ==========');
console.log(`Pre-Medical M=${byBucket.medM.length} E=${byBucket.medE.length}`);
console.log(`Pre-Engineering M=${byBucket.engM.length} E=${byBucket.engE.length}`);
console.log(`Computer Science M=${byBucket.csM.length} E=${byBucket.csE.length}`);
console.log(`Total Morning=${morning.length} Evening=${evening.length} All=${allNew.length}`);
console.log(`URL files under: ${outDir}`);
