/**
 * MIX batch (public/student/mix): arts/sports, medical, corrections, mixed, 2nd year.
 * Upserts by rollNo (corrects wrong existing profiles), classifies shift by roll ranges:
 *   Medical  M: 1–500     E: 501–1000
 *   Eng      M: 1001–1500 E: 1501–2000
 *   Computer M: 2001–2100 E: 2101–2500
 *   Arts     M: 3001–3999
 *   Self Finance: roll ≥ 7000 (or explicit / medical-correction enrollment nos)
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
const COHORT = 'public/student/mix';
const PHOTO_DIR = `${COHORT}/pic`;
const PHOTO_PREFIX = 'mix/pic';

const RANGES = {
  'Pre-Medical': { morning: [1, 500], evening: [501, 1000] },
  'Pre-Engineering': { morning: [1001, 1500], evening: [1501, 2000] },
  'Computer Science': { morning: [2001, 2100], evening: [2101, 2500] },
  Arts: { morning: [3001, 3999], evening: null },
};

const DATA_FILES = [
  {
    path: 'src/data/morningPreMedicalStudents.ts',
    exportName: 'MORNING_PRE_MEDICAL_STUDENTS',
  },
  {
    path: 'src/data/morningPreEngineeringStudents.ts',
    exportName: 'MORNING_PRE_ENGINEERING_STUDENTS',
  },
  {
    path: 'src/data/morningComputerScienceStudents.ts',
    exportName: 'MORNING_CS_STUDENTS',
  },
  {
    path: 'src/data/morningArtsStudents.ts',
    exportName: 'MORNING_ARTS_STUDENTS',
  },
  {
    path: 'src/data/eveningPreMedicalStudents.ts',
    exportName: 'EVENING_PRE_MEDICAL_STUDENTS',
  },
  {
    path: 'src/data/eveningPreEngineeringStudents.ts',
    exportName: 'EVENING_PRE_ENGINEERING_STUDENTS',
  },
  {
    path: 'src/data/eveningComputerScienceStudents.ts',
    exportName: 'EVENING_CS_STUDENTS',
  },
  {
    path: 'src/data/selfFinanceStudents.ts',
    exportName: 'SELF_FINANCE_STUDENTS',
  },
  {
    path: 'src/data/morningSecondYearStudents.ts',
    exportName: 'MORNING_SECOND_YEAR_STUDENTS',
  },
];

const FILES = {
  'Morning Shift|Pre-Medical|1st year': DATA_FILES[0],
  'Morning Shift|Pre-Engineering|1st year': DATA_FILES[1],
  'Morning Shift|Computer Science|1st year': DATA_FILES[2],
  'Morning Shift|Arts|1st year': DATA_FILES[3],
  'Evening Shift|Pre-Medical|1st year': DATA_FILES[4],
  'Evening Shift|Pre-Engineering|1st year': DATA_FILES[5],
  'Evening Shift|Computer Science|1st year': DATA_FILES[6],
  'Self Finance|Pre-Medical|1st year': DATA_FILES[7],
  'Self Finance|Pre-Engineering|1st year': DATA_FILES[7],
  'Self Finance|Computer Science|1st year': DATA_FILES[7],
  'Self Finance|Arts|1st year': DATA_FILES[7],
  'Self Finance|Pre-Medical|2nd year': DATA_FILES[7],
  'Self Finance|Pre-Engineering|2nd year': DATA_FILES[7],
  'Self Finance|Computer Science|2nd year': DATA_FILES[7],
  // 2nd year (morning/evening) live in morningSecondYearStudents
  'Morning Shift|Pre-Medical|2nd year': DATA_FILES[8],
  'Morning Shift|Pre-Engineering|2nd year': DATA_FILES[8],
  'Morning Shift|Computer Science|2nd year': DATA_FILES[8],
  'Morning Shift|Arts|2nd year': DATA_FILES[8],
  'Evening Shift|Pre-Medical|2nd year': DATA_FILES[8],
  'Evening Shift|Pre-Engineering|2nd year': DATA_FILES[8],
  'Evening Shift|Computer Science|2nd year': DATA_FILES[8],
};

const SOURCES = [
  {
    excel: `${COHORT}/arts and sports.xlsx`,
    forceSelfFinance: false,
    enrollmentFromEnrollmentNo: false,
  },
  {
    excel: `${COHORT}/medical..xlsx`,
    forceSelfFinance: false,
    enrollmentFromEnrollmentNo: false,
  },
  {
    excel: `${COHORT}/medical correction duplicate and self.xlsx`,
    forceSelfFinance: true,
    enrollmentFromEnrollmentNo: true,
  },
  {
    excel: `${COHORT}/Mixed.xlsx`,
    forceSelfFinance: false,
    enrollmentFromEnrollmentNo: false,
  },
  {
    excel: `${COHORT}/second year.xlsx`,
    forceSelfFinance: false,
    enrollmentFromEnrollmentNo: false,
    forceClassYear: '2nd year',
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
  return v
    .replace(/\s*positive$/i, '+')
    .replace(/\s*\(positive\)/i, '+')
    .replace(/\s*negative$/i, '-')
    .replace(/\s*\(negative\)/i, '-')
    .replace(/\s+/g, '')
    .replace(/positive/i, '+')
    .replace(/negative/i, '-')
    .trim();
}

function normalizeClassYear(value, forced) {
  if (forced) return forced;
  const v = String(value || '').trim().toLowerCase();
  if (/2nd|second/.test(v)) return '2nd year';
  if (/\bbs\b/.test(v)) return 'BS';
  return '1st year';
}

function resolveDiscipline(discipline, classCell, rollN) {
  const d = `${discipline} ${classCell}`.toLowerCase();
  if (/computer|comp\.?\s*sc|c\/s|\bc\.?\s*s\b|\bit\b/.test(d)) return 'Computer Science';
  if (/eng/.test(d)) return 'Pre-Engineering';
  if (/arts|humanities|fa\b/.test(d)) return 'Arts';
  if (/med|medical/.test(d)) return 'Pre-Medical';
  // roll fallback
  if (rollN >= 3001 && rollN <= 3999) return 'Arts';
  if (rollN >= 2001 && rollN <= 2500) return 'Computer Science';
  if (rollN >= 1001 && rollN <= 2000) return 'Pre-Engineering';
  return 'Pre-Medical';
}

function parseRollHints(raw) {
  const s = String(raw || '').trim();
  const m = s.match(/(\d+)/);
  const rollNo = m ? String(parseInt(m[1], 10)) : '';
  const lower = s.toLowerCase();
  return {
    rollNo,
    hintSelf: /self/.test(lower),
    hintEvening: /eveing|evening/.test(lower),
    hintMorning: /morning|moning/.test(lower),
  };
}

function inRange(n, range) {
  if (!range) return false;
  return Number.isFinite(n) && n >= range[0] && n <= range[1];
}

function classifyEnrollment(discipline, rollN, hints, forceSelfFinance) {
  if (forceSelfFinance || hints.hintSelf || rollN >= 7000) return 'Self Finance';
  if (hints.hintEvening) return 'Evening Shift';
  if (hints.hintMorning) return 'Morning Shift';
  // 6xxx second-year / SF-adjacent (e.g. 6579)
  if (rollN >= 6000 && rollN < 7000) return 'Self Finance';

  const ranges = RANGES[discipline];
  if (ranges) {
    if (inRange(rollN, ranges.evening)) return 'Evening Shift';
    if (inRange(rollN, ranges.morning)) return 'Morning Shift';
  }
  // CS rolls above evening band still evening (legacy)
  if (discipline === 'Computer Science' && rollN > 2500 && rollN < 3000) {
    return 'Evening Shift';
  }
  return 'Morning Shift';
}

function findPhotoFile(photos, rollNo, usedPhotos) {
  const roll = String(rollNo).trim();
  const alts = ['.png', '.jpg', '.jpeg', '.jfif', '.PNG', '.JPG', '.JPEG', '.JFIF'];
  for (const e of alts) {
    const plain = `${roll}${e}`;
    if (photos.has(plain) && !usedPhotos.has(plain)) return plain;
  }
  const rollMatches = [...photos].filter((file) => {
    if (usedPhotos.has(file)) return false;
    const base = file.replace(/\.[^.]+$/, '');
    return (
      base === roll ||
      base.startsWith(`${roll}_`) ||
      base.startsWith(`${roll} `) ||
      base.startsWith(`${roll}(`)
    );
  });
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
  return {
    header: src.slice(0, start),
    footer: src.slice(end + 1),
    students: Function(`"use strict"; return (${src.slice(start, end + 1)});`)(),
  };
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
    if (from === to) continue;
    if (src.includes(`'${from}'`)) continue;
    const insert = `  '${from}': '${to}',\n`;
    src = src.replace(
      /(const STUDENT_SLUG_ALIASES: Record<string, string> = \{\r?\n)/,
      `$1${insert}`
    );
  }
  fs.writeFileSync(file, src);
}

function parseIncoming() {
  const photoDir = path.join(root, PHOTO_DIR);
  const photos = new Set(
    fs.existsSync(photoDir)
      ? fs.readdirSync(photoDir).filter((f) => /\.(png|jpe?g|jfif|webp|gif)$/i.test(f))
      : []
  );
  const usedPhotos = new Set();
  const byRoll = new Map();

  for (const src of SOURCES) {
    const wb = XLSX.readFile(path.join(root, src.excel));
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' });

    for (const r of rows) {
      const name = cell(r, 'Name', 'Student Name');
      if (!name) continue;

      let rollRaw = cell(r, 'Roll No');
      if (src.enrollmentFromEnrollmentNo || !rollRaw) {
        rollRaw = cell(r, 'Enrollment No', 'Enrollment', 'Roll No');
      }
      const hints = parseRollHints(rollRaw);
      // Prefer numeric roll from Roll No; for SF correction sheet Enrollment No is the roll
      if (!hints.rollNo) continue;
      const rollNo = hints.rollNo;
      const rollN = parseInt(rollNo, 10);

      const classCell = cell(r, 'Class');
      const classYear = normalizeClassYear(classCell, src.forceClassYear);
      const discipline = resolveDiscipline(cell(r, 'Discipline'), classCell, rollN);
      const enrollmentType = classifyEnrollment(
        discipline,
        rollN,
        hints,
        src.forceSelfFinance
      );

      const matched = findPhotoFile(photos, rollNo, usedPhotos);
      if (matched) usedPhotos.add(matched);

      const phone = normalizeOptional(
        cell(r, 'Guardian Contact Number', 'Contact Number', 'Contact', 'Phone')
      );

      const student = {
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
        phone,
        address: normalizeOptional(cell(r, 'Address', 'Permanent Address')),
        status: 'Active',
        ...(matched ? { photoFile: `${PHOTO_PREFIX}/${matched}` } : {}),
        _source: path.basename(src.excel),
      };

      byRoll.set(rollNo, student);
    }
  }

  return {
    students: [...byRoll.values()],
    photos: photos.size,
    used: usedPhotos.size,
  };
}

// --- main ---
const { students: incoming, photos, used } = parseIncoming();
console.log(`Parsed ${incoming.length} unique students (photos=${photos} used=${used})`);

const fileCache = new Map();
function loadFile(meta) {
  const cacheKey = `${meta.path}|${meta.exportName}`;
  if (!fileCache.has(cacheKey)) {
    fileCache.set(cacheKey, { ...meta, ...parseTsArray(meta.path, meta.exportName) });
  }
  return fileCache.get(cacheKey);
}

// Index existing students by roll across all data files
const rollIndex = new Map(); // rollNo -> [{file, idx, student}]
for (const meta of DATA_FILES) {
  const file = loadFile(meta);
  file.students.forEach((s, idx) => {
    const roll = String(s.rollNo);
    if (!rollIndex.has(roll)) rollIndex.set(roll, []);
    rollIndex.get(roll).push({ file, idx, student: s });
  });
}

const aliases = {};
let added = 0;
let updated = 0;
let removedDupes = 0;

for (const s of incoming) {
  const key = `${s.enrollmentType}|${s.class}|${s.classYear}`;
  const meta = FILES[key];
  if (!meta) throw new Error(`No target file for ${key} (roll ${s.rollNo} ${s.name})`);
  const target = loadFile(meta);
  const clean = { ...s };
  delete clean._source;

  const existing = rollIndex.get(s.rollNo) || [];
  // Prefer best name/slug match so corrections keep the right row when roll has dupes
  function nameKey(n) {
    return String(n || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '');
  }
  function matchScore(e) {
    let score = 0;
    if (e.file.path === target.path) score += 10;
    if (e.student.slug === clean.slug) score += 100;
    const a = nameKey(e.student.name);
    const b = nameKey(clean.name);
    if (a && b && a === b) score += 80;
    else if (a && b && (a.includes(b) || b.includes(a))) score += 40;
    else {
      // token overlap (e.g. M. Hassan vs Muhammad Hassan)
      const ta = new Set(a.match(/[a-z]+/g) || []);
      const tb = [...(b.match(/[a-z]+/g) || [])];
      const overlap = tb.filter((t) => t.length > 2 && [...ta].some((x) => x.includes(t) || t.includes(x)));
      score += overlap.length * 15;
    }
    return score;
  }
  let primary = null;
  if (existing.length) {
    primary = [...existing].sort((a, b) => matchScore(b) - matchScore(a))[0];
  }

  if (primary) {
    const oldSlug = primary.student.slug;
    if (oldSlug && oldSlug !== clean.slug) {
      aliases[oldSlug] = clean.slug;
    }

    if (primary.file.path === target.path) {
      primary.file.students[primary.idx] = {
        ...primary.file.students[primary.idx],
        ...clean,
      };
      updated += 1;
      console.log(
        `  update ${s.rollNo}\t${s.name}\t${s.enrollmentType}\t${s.class}\t${s.classYear}\t(${s._source})`
      );
    } else {
      // Move: remove from old file(s), add to target
      primary.file.students[primary.idx] = null;
      target.students.push(clean);
      updated += 1;
      console.log(
        `  move   ${s.rollNo}\t${s.name}\t${primary.file.path} -> ${target.path}\t(${s._source})`
      );
    }

    // Remove other duplicate roll rows (keep only the corrected one)
    for (const e of existing) {
      if (e === primary) continue;
      if (e.file.students[e.idx] && e.file.students[e.idx].rollNo === s.rollNo) {
        const dupSlug = e.file.students[e.idx].slug;
        if (dupSlug && dupSlug !== clean.slug) aliases[dupSlug] = clean.slug;
        e.file.students[e.idx] = null;
        removedDupes += 1;
        console.log(`  drop-dupe roll ${s.rollNo} slug ${dupSlug} from ${e.file.path}`);
      }
    }
  } else {
    target.students.push(clean);
    added += 1;
    console.log(
      `  add    ${s.rollNo}\t${s.name}\t${s.enrollmentType}\t${s.class}\t${s.classYear}\t(${s._source})`
    );
  }
}

// Compact nulls from removals
for (const file of fileCache.values()) {
  file.students = file.students.filter(Boolean);
}

const written = new Set();
for (const file of fileCache.values()) {
  if (!file.path || written.has(file.path)) continue;
  writeTs(file.path, file.header, file.students, file.footer);
  written.add(file.path);
  console.log(`Wrote ${file.students.length} -> ${file.path}`);
}

upsertAliases(aliases);

function shiftRank(enr) {
  if (enr === 'Morning Shift') return 0;
  if (enr === 'Evening Shift') return 1;
  if (enr === 'Self Finance') return 2;
  return 3;
}

const sorted = [...incoming].sort((a, b) => {
  const sr = shiftRank(a.enrollmentType) - shiftRank(b.enrollmentType);
  if (sr !== 0) return sr;
  return parseInt(a.rollNo, 10) - parseInt(b.rollNo, 10);
});

const urlLines = [
  '# MIX batch — Student URLs (Morning → Evening → Self Finance, by roll)',
  `# Domain: ${DOMAIN}`,
  `# Count: ${sorted.length}`,
  '',
];

const sections = [
  ['MORNING SHIFT', (s) => s.enrollmentType === 'Morning Shift'],
  ['EVENING SHIFT', (s) => s.enrollmentType === 'Evening Shift'],
  ['SELF FINANCE', (s) => s.enrollmentType === 'Self Finance'],
];

for (const [title, pred] of sections) {
  const group = sorted.filter(pred);
  urlLines.push(`## ${title} (${group.length})`);
  for (const s of group) {
    urlLines.push(
      `${s.rollNo}\t${s.name}\t${s.class}\t${s.classYear}\t${s.enrollmentType}\t${studentUrl(s.slug)}` +
        (s.photoFile ? '' : '\tNO_PHOTO')
    );
  }
  urlLines.push('');
}

fs.writeFileSync(path.join(root, COHORT, 'URLS-mix.txt'), urlLines.join('\n'));
fs.writeFileSync(
  path.join(root, COHORT, 'URLS-mix-morning.txt'),
  sorted
    .filter((s) => s.enrollmentType === 'Morning Shift')
    .map((s) => `${s.rollNo}\t${s.name}\t${s.class}\t${studentUrl(s.slug)}`)
    .join('\n') + '\n'
);
fs.writeFileSync(
  path.join(root, COHORT, 'URLS-mix-evening.txt'),
  sorted
    .filter((s) => s.enrollmentType === 'Evening Shift')
    .map((s) => `${s.rollNo}\t${s.name}\t${s.class}\t${studentUrl(s.slug)}`)
    .join('\n') + '\n'
);
fs.writeFileSync(
  path.join(root, COHORT, 'URLS-mix-self-finance.txt'),
  sorted
    .filter((s) => s.enrollmentType === 'Self Finance')
    .map((s) => `${s.rollNo}\t${s.name}\t${s.class}\t${studentUrl(s.slug)}`)
    .join('\n') + '\n'
);

console.log(`\nadded=${added} updated=${updated} removedDupes=${removedDupes}`);
console.log(`aliases=${Object.keys(aliases).length}`);
console.log(`Wrote ${COHORT}/URLS-mix.txt`);
console.log('\n=== URLS (Morning → Evening → Self Finance) ===');
for (const s of sorted) {
  console.log(
    `${s.rollNo}\t${s.name}\t${s.enrollmentType}\t${s.class}\t${s.classYear}\t${studentUrl(s.slug)}`
  );
}
