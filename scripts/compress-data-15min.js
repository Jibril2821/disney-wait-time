/**
 * data/ 以下の JSON を 9:00〜21:00 の 15 分おきのデータに圧縮する
 * 実行: node scripts/compress-data-15min.js
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

// 9:00〜21:00 の 15 分刻みの時刻セット（"09:00", "09:15", ..., "21:00"）
const validTimes = new Set();
for (let h = 9; h <= 21; h++) {
  for (let m = 0; m < 60; m += 15) {
    if (h === 21 && m > 0) break;
    validTimes.add(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  }
}

function normalizeTime(t) {
  if (!t || typeof t !== 'string') return t;
  return t.replace(/^(\d):/, '0$1');
}

function findJsonFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) findJsonFiles(full, files);
    else if (e.name.endsWith('.json')) files.push(full);
  }
  return files;
}

function compressFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(raw);
  if (!Array.isArray(data.records)) {
    console.warn(`Skip (no records): ${filePath}`);
    return { path: filePath, before: 0, after: 0 };
  }
  const before = data.records.length;
  data.records = data.records.filter((r) => {
    const t = normalizeTime(r.time);
    return validTimes.has(t);
  });
  const after = data.records.length;
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  return { path: filePath, before, after };
}

const files = findJsonFiles(DATA_DIR);
if (files.length === 0) {
  console.log('data/ に JSON がありません');
  process.exit(0);
}

console.log(`9:00〜21:00 の 15 分おきに圧縮します（${files.length} ファイル）\n`);
let totalBefore = 0;
let totalAfter = 0;
for (const f of files) {
  const rel = path.relative(path.join(__dirname, '..'), f);
  const result = compressFile(f);
  totalBefore += result.before;
  totalAfter += result.after;
  console.log(`${rel}: ${result.before} → ${result.after} 件`);
}
console.log(`\n合計: ${totalBefore} → ${totalAfter} 件`);
