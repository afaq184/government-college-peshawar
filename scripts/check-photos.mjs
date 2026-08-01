import fs from 'fs';
import path from 'path';

const root = path.resolve('public/student');
console.log('dirs', fs.readdirSync(root));
const sf = path.join(root, 'self-finance');
const gcp = path.join(root, 'GCP-Students-Self-Finance', 'student pic');
console.log('self-finance exists', fs.existsSync(sf), fs.existsSync(sf) ? fs.readdirSync(sf).length : 0);
console.log('gcp pic exists', fs.existsSync(gcp), fs.existsSync(gcp) ? fs.readdirSync(gcp).length : 0);

const data = fs.readFileSync('src/data/selfFinanceStudents.ts', 'utf8');
const photos = [...data.matchAll(/photoFile: '([^']+)'/g)].map((m) => m[1]);
let ok = 0;
let missing = [];
for (const p of photos) {
  if (fs.existsSync(path.join(root, p.replace(/^student\//, ''))) || fs.existsSync(path.join('public', 'student', p))) {
    ok++;
  } else {
    missing.push(p);
  }
}
console.log('mapped', photos.length, 'ok', ok, 'missing', missing.length);
console.log('missing sample', missing.slice(0, 10));
console.log('check 227', fs.existsSync(path.join(sf, '227.jpeg')), fs.existsSync(path.join(gcp, '227.jpeg')));
console.log('check 247', fs.existsSync(path.join(sf, '247.jpeg')), fs.existsSync(path.join(gcp, '247.jpeg')));
