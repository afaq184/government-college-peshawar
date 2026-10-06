/**
 * max_new_One cohort: Pre-Medical, Pre-Engineering, Computer Science, Arts.
 * Splits Morning vs Evening by roll ranges, merges into src/data, prints gcpeshawar.com URLs.
 *
 * Medical  M: 1–500     E: 501–1000
 * Eng      M: 1001–1500 E: 1501–2000
 * Computer M: 2001–2100 E: 2101–2500
 * Arts     M: 3001+ (Morning)
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
const COHORT = 'public/student/max_new_One';
const PHOTO_MARKER = 'max_new_One/';

const RANGES = {
  'Pre-Medical': { morning: [1, 500], evening: [501, 1000] },
  'Pre-Engineering': { morning: [1001, 1500], evening: [1501, 2000] },
  'Computer Science': { morning: [2001, 2100], evening: [2101, 2500] },
  Arts: { morning: [3001, 3999], evening: [3001, 3999] },
};

const SOURCES = [
  {
    excel: `${COHORT}/max_new_One.xlsx`,
    photoDir: `${COHORT}/max_new_One_pic`,
    photoPrefix: 'max_new_One/max_new_One_pic',
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
  const raw = String(value).trim();
  if (!raw || /^not\s*(specified|provided)$/i.test(raw)) return '';
  if (typeof value === 'number' && Number.isFinite(value)) {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (parsed) {
      const dd = String(parsed.d).padStart(2, '0');
      const mm = String(parsed.m).padStart(2, '0');
      return `${dd}/${mm}/${parsed.y}`;
    }
  }
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

function inRange(n, [lo, hi]) {
  return Number.isFinite(n) && n >= lo && n <= hi;
}

function resolveClass(discipline, rollN) {
  const d = String(discipline || '').toLowerCase();
  if (/^not\s*(specified|provided)$/i.test(d) || !d.trim()) return null;
  if (/arts|humanities|fa\b/.test(d)) return 'Arts';
  if (/med|medical/.test(d)) return 'Pre-Medical';
  if (/eng/.test(d)) return 'Pre-Engineering';
  if (/cis|computer|comp\.?\s*sc|c\.?\s*s/.test(d)) return 'Computer Science';
  if (rollN >= 3001 && rollN <= 3999) return 'Arts';
  if (rollN >= 2001) return 'Computer Science';
  if (rollN >= 1001) return 'Pre-Engineering';
  return 'Pre-Medical';
}

function classifyShift(className, n) {
  if (className === 'Arts') return 'Morning Shift';
  const ranges = RANGES[className];
  if (!ranges) return null;
  if (inRange(n, ranges.evening) && className !== 'Arts') {
    // Morning and evening ranges may overlap only for Arts; for others evening checked first when n in evening band
  }
  if (inRange(n, ranges.evening) && !inRange(n, ranges.morning)) return 'Evening Shift';
  if (inRange(n, ranges.morning) && !inRange(n, ranges.evening)) return 'Morning Shift';
  if (inRange(n, ranges.evening)) return 'Evening Shift';
  if (inRange(n, ranges.morning)) return 'Morning Shift';
  if (className === 'Computer Science' && n > ranges.evening[1]) return 'Evening Shift';
  return null;
}

function normName(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/\./g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\b(m|md|muhammad|mohammad)\b/g, 'm')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Same person if names match loosely (spelling / abbreviated variants). */
function namesRelated(a, b) {
  const na = normName(a);
  const nb = normName(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  if (na.includes(nb) || nb.includes(na)) return true;
  // daniyal / danyal
  const compact = (x) => x.replace(/\s+/g, '');
  const ca = compact(na);
  const cb = compact(nb);
  if (ca === cb) return true;
  if (Math.abs(ca.length - cb.length) <= 2) {
    let diff = 0;
    const longer = ca.length >= cb.length ? ca : cb;
    const shorter = ca.length >= cb.length ? cb : ca;
    let j = 0;
    for (let i = 0; i < longer.length && j < shorter.length; i++) {
      if (longer[i] === shorter[j]) j++;
      else diff++;
      if (diff > 2) return false;
    }
    return j === shorter.length && diff <= 2;
  }
  return false;
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
    // Excel may say .png while disk has .jpeg
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
      cell(r, 'Roll No', 'Roll Number', 'RollNo', 'Roll No / Enrollment No', 'Enrollment No / Roll No')
    );
    if (!name || !rollNo) continue;
    rollNo = String(parseInt(rollNo, 10));

    const subject = cell(r, 'Subject', 'Discipline', 'Class/Degree Program');
    const className = resolveClass(subject, rollNum(rollNo));
    if (!className) {
      skipped.push({ name, rollNo, subject: String(subject || ''), reason: 'no_subject' });
      continue;
    }

    const n = rollNum(rollNo);
    const shift = classifyShift(className, n);
    if (!shift) {
      skipped.push({ name, rollNo, className, reason: 'out_of_range' });
      continue;
    }

    const slug = makeStudentSlug(name, rollNo);
    const batchKey = `${rollNo}::${slug}`;
    if (seenInBatch.has(batchKey)) {
      skipped.push({ name, rollNo, reason: 'duplicate_row' });
      continue;
    }
    seenInBatch.add(batchKey);

    const excelPhoto = String(cell(r, 'Photo File Name', 'Photo') || '').trim();
    const matched =
      findPhotoFile(photos, excelPhoto, rollNo, usedPhotos) ||
      findPhotoFile(photos, `${rollNo}.jpeg`, rollNo, usedPhotos) ||
      findPhotoFile(photos, `${rollNo}.png`, rollNo, usedPhotos);
    if (matched) usedPhotos.add(matched);
    else missingPhotos += 1;

    students.push({
      slug,
      name,
      fatherName: String(
        cell(r, "Father's Name", 'Father Name', 'Father / Guardian Name', 'Father', 'S/O') || ''
      ).trim(),
      class: className,
      rollNo,
      enrollmentType: shift,
      session: '2026-2028',
      admissionNo: rollNo,
      dob: formatDob(cell(r, 'Date of Birth', 'DOB')),
      bloodGroup: normalizeBlood(cell(r, 'Blood Group')),
      cnic: '',
      phone: normalizeOptional(
        cell(r, 'Contact Number', 'Guardian Contact Number', 'Phone', 'Contact')
      ),
      address: normalizeOptional(cell(r, 'Permanent Address', 'Address')),
      status: normalizeOptional(cell(r, 'Status', 'Student Status')) || 'Active',
      ...(matched ? { photoFile: `${source.photoPrefix}/${matched}` } : {}),
    });
  }

  return { students, skipped, missingPhotos, photos: photos.size, excel: source.excel };
}

function prefer(newVal, oldVal) {
  const n = String(newVal ?? '').trim();
  return n ? newVal : oldVal;
}

/**
 * Merge by slug, or by roll when the existing holder is the same / related person.
 * Different person on same roll → replace with new slug.
 */
function mergeStudents(existingStudents, newcomers) {
  const list = existingStudents.map((s) => ({ ...s }));
  const bySlug = new Map(list.map((s, i) => [s.slug, i]));
  const byRoll = new Map(list.map((s, i) => [String(s.rollNo), i]));
  const added = [];
  const updated = [];

  for (const s of newcomers) {
    let idx = bySlug.has(s.slug) ? bySlug.get(s.slug) : undefined;
    if (idx == null && byRoll.has(String(s.rollNo))) {
      idx = byRoll.get(String(s.rollNo));
    }

    if (idx != null) {
      const prev = list[idx];
      const related = namesRelated(prev.name, s.name);
      if (related || prev.slug === s.slug) {
        // Keep stable URL slug; refresh photo / contacts; don't wipe filled fields with blanks.
        // If Excel name is a shorter form of existing (e.g. "Saad" vs "Saad Riaz"), keep existing.
        const prevN = normName(prev.name);
        const newN = normName(s.name);
        const keepLongerName =
          prevN && newN && prevN !== newN && (prevN.includes(newN) || newN.includes(prevN))
            ? prevN.length >= newN.length
              ? prev.name
              : s.name
            : prefer(s.name, prev.name);
        // If Excel father equals the student name, treat as swap and keep previous father.
        const fatherLooksSwapped =
          normName(s.fatherName) &&
          (normName(s.fatherName) === prevN || normName(s.fatherName) === normName(keepLongerName));
        const next = {
          ...prev,
          ...s,
          slug: prev.slug,
          name: keepLongerName,
          fatherName: fatherLooksSwapped ? prefer('', prev.fatherName) : prefer(s.fatherName, prev.fatherName),
          dob: prefer(s.dob, prev.dob),
          bloodGroup: prefer(s.bloodGroup, prev.bloodGroup),
          phone: prefer(s.phone, prev.phone),
          address: prefer(s.address, prev.address),
          cnic: prefer(s.cnic, prev.cnic),
          photoFile: s.photoFile || prev.photoFile,
        };
        list[idx] = next;
        updated.push(next.slug);
      } else {
        // Different person reusing the roll — replace entry
        bySlug.delete(prev.slug);
        list[idx] = s;
        bySlug.set(s.slug, idx);
        byRoll.set(String(s.rollNo), idx);
        updated.push(s.slug);
        console.log(
          `  replace roll ${s.rollNo}: "${prev.name}" (${prev.slug}) -> "${s.name}" (${s.slug})`
        );
      }
    } else {
      list.push(s);
      bySlug.set(s.slug, list.length - 1);
      byRoll.set(String(s.rollNo), list.length - 1);
      added.push(s);
    }
  }

  const merged = list.sort(
    (a, b) => rollNum(a.rollNo) - rollNum(b.rollNo) || a.slug.localeCompare(b.slug)
  );
  return { merged, added, updated };
}

/** Drop stale max_new_One rows; keep ones whose roll is in this import so merge can update in place. */
function stripMaxNewOneCohort(existingStudents, newcomers) {
  const newRolls = new Set(newcomers.map((s) => String(s.rollNo)));
  return existingStudents.filter((s) => {
    if (!(s.photoFile || '').includes(PHOTO_MARKER)) return true;
    return newRolls.has(String(s.rollNo));
  });
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
  if (!/max_new_One/i.test(comment)) {
    comment = comment.replace(/\.$/, '') + ' + max_new_One.';
  }
  return comment;
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
  const order = ['Pre-Medical', 'Pre-Engineering', 'Computer Science', 'Arts'];
  let out = '# max_new_One Student URLs — by Discipline (Morning / Evening)\n';
  out += `# Domain: ${DOMAIN}\n`;
  out += `# Count: ${students.length}\n\n`;
  for (const cls of order) {
    const all = students.filter((s) => s.class === cls);
    if (!all.length) continue;
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
  for (const s of students) {
    console.log(
      `  ${s.rollNo}\t${s.name}\t${s.class}\t${s.enrollmentType}\t${s.photoFile ? path.basename(s.photoFile) : 'NO_PHOTO'}`
    );
  }
  allNew.push(...students);
}

const byBucket = {
  csM: allNew.filter((s) => s.class === 'Computer Science' && s.enrollmentType === 'Morning Shift'),
  csE: allNew.filter((s) => s.class === 'Computer Science' && s.enrollmentType === 'Evening Shift'),
  engM: allNew.filter((s) => s.class === 'Pre-Engineering' && s.enrollmentType === 'Morning Shift'),
  engE: allNew.filter((s) => s.class === 'Pre-Engineering' && s.enrollmentType === 'Evening Shift'),
  medM: allNew.filter((s) => s.class === 'Pre-Medical' && s.enrollmentType === 'Morning Shift'),
  medE: allNew.filter((s) => s.class === 'Pre-Medical' && s.enrollmentType === 'Evening Shift'),
  artsM: allNew.filter((s) => s.class === 'Arts' && s.enrollmentType === 'Morning Shift'),
};

const targets = [
  {
    key: 'csM',
    path: 'src/data/morningComputerScienceStudents.ts',
    exportName: 'MORNING_CS_STUDENTS',
    students: byBucket.csM,
  },
  {
    key: 'engM',
    path: 'src/data/morningPreEngineeringStudents.ts',
    exportName: 'MORNING_PRE_ENGINEERING_STUDENTS',
    students: byBucket.engM,
  },
  {
    key: 'medM',
    path: 'src/data/morningPreMedicalStudents.ts',
    exportName: 'MORNING_PRE_MEDICAL_STUDENTS',
    students: byBucket.medM,
  },
  {
    key: 'csE',
    path: 'src/data/eveningComputerScienceStudents.ts',
    exportName: 'EVENING_CS_STUDENTS',
    students: byBucket.csE,
  },
  {
    key: 'engE',
    path: 'src/data/eveningPreEngineeringStudents.ts',
    exportName: 'EVENING_PRE_ENGINEERING_STUDENTS',
    students: byBucket.engE,
  },
  {
    key: 'medE',
    path: 'src/data/eveningPreMedicalStudents.ts',
    exportName: 'EVENING_PRE_MEDICAL_STUDENTS',
    students: byBucket.medE,
  },
  {
    key: 'artsM',
    path: 'src/data/morningArtsStudents.ts',
    exportName: 'MORNING_ARTS_STUDENTS',
    students: byBucket.artsM,
  },
];

for (const cfg of targets) {
  if (!cfg.students.length) {
    console.log(`\n${cfg.key}: skip (0 newcomers)`);
    continue;
  }
  const existingRaw = parseTsStudents(cfg.path);
  if (!existingRaw.length && fs.existsSync(path.join(root, cfg.path))) {
    console.error(`Abort: parsed 0 students from ${cfg.path}`);
    process.exit(1);
  }
  const existing = stripMaxNewOneCohort(existingRaw, cfg.students);
  const removed = existingRaw.length - existing.length;
  const { merged, added, updated } = mergeStudents(existing, cfg.students);
  const comment = readExistingComment(cfg.path, `${cfg.exportName} (2026-2028), including max_new_One.`);
  fs.writeFileSync(path.join(root, cfg.path), toTsArray(cfg.exportName, comment, merged));
  console.log(
    `\n${cfg.key}: existing=${existingRaw.length} stripped=${removed} +new=${added.length} updated=${updated.length} -> ${merged.length}`
  );
}

const outDir = path.join(root, COHORT);
const morning = allNew.filter((s) => s.enrollmentType === 'Morning Shift');
const evening = allNew.filter((s) => s.enrollmentType === 'Evening Shift');
allNew.sort((a, b) => rollNum(a.rollNo) - rollNum(b.rollNo) || a.class.localeCompare(b.class));

writeUrls(path.join(outDir, 'URLS-morning-max_new_One.txt'), morning, 'max_new_One — Morning students');
writeUrls(path.join(outDir, 'URLS-evening-max_new_One.txt'), evening, 'max_new_One — Evening students');
writeUrls(path.join(outDir, 'URLS-all-max_new_One.txt'), allNew, 'max_new_One — All students (M+E)');
writeDisciplineUrls(path.join(outDir, 'URLS-by-discipline-max_new_One.txt'), allNew);

console.log('\n========== SUMMARY ==========');
console.log(`Pre-Medical M=${byBucket.medM.length} E=${byBucket.medE.length}`);
console.log(`Pre-Engineering M=${byBucket.engM.length} E=${byBucket.engE.length}`);
console.log(`Computer Science M=${byBucket.csM.length} E=${byBucket.csE.length}`);
console.log(`Arts M=${byBucket.artsM.length}`);
console.log(`Total Morning=${morning.length} Evening=${evening.length} All=${allNew.length}`);
console.log(`URL files under: ${outDir}`);
