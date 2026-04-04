import fs from 'fs';
import path from 'path';

const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.cwd(), process.env.DATA_DIR)
  : path.resolve(__dirname, '../../../..', 'data');

export function dataPath(filename: string): string {
  return path.join(DATA_DIR, filename);
}

export function readJson<T>(filename: string): T {
  const fp = dataPath(filename);
  if (!fs.existsSync(fp)) {
    return [] as unknown as T;
  }
  const raw = fs.readFileSync(fp, 'utf-8').trim();
  if (!raw) return [] as unknown as T;
  return JSON.parse(raw) as T;
}

export function writeJson<T>(filename: string, data: T): void {
  const fp = dataPath(filename);
  const dir = path.dirname(fp);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  // Atomic write: write to temp file then rename
  const tmp = fp + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tmp, fp);
}
