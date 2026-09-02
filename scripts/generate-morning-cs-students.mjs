import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

function makeStudentSlug(name, rollNo) {
  return `${name}-${rollNo}`
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const wb = XLSX.readFile(path.join(root, 'public/morning-students/computer-science-data.xlsx'));
const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
const photoDir = path.join(root, 'public/student/morning-students/computer-science-pic');
const photos = new Set(fs.readdirSync(photoDir));

const students = rows.map((r) => {
  const roll = String(r['Roll No']).trim();
  const photo = r['Photo File Name'];
  const photoPath =
    photo && photos.has(photo) ? `morning-students/computer-science-pic/${photo}` : undefined;
  return {
    slug: makeStudentSlug(r.Name, roll),
    name: r.Name,
    fatherName: r["Father's Name"] || '',
    class: 'Computer Science',
    rollNo: roll,
    enrollmentType: 'Morning Shift',
    session: r['Academic Session'],
    admissionNo: roll,
    dob: r['Date of Birth'],
    bloodGroup: '',
    cnic: '',
    phone: r['Guardian Contact Number'],
    address: r['Permanent Address'],
    status: r.Status || 'Active',
    ...(photoPath ? { photoFile: photoPath } : {}),
  };
});

const out = `import type { StudentRecord } from '../types/student';

/** Morning Shift — Computer Science 1st Year (2026-27). */
export const MORNING_CS_STUDENTS: StudentRecord[] = ${JSON.stringify(students, null, 2)
  .replace(/"([^"]+)":/g, '$1:')
  .replace(/"/g, "'")};
`;

fs.writeFileSync(path.join(root, 'src/data/morningComputerScienceStudents.ts'), out);
console.log(`Wrote ${students.length} students`);
