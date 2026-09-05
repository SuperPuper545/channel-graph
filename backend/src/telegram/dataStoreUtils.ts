import fs from 'fs';
import path from 'path';

export function getResolvedDataDir(): string {
  const rootBackendData = path.resolve(process.cwd(), 'backend', 'data');
  if (fs.existsSync(rootBackendData)) {
    return rootBackendData;
  }

  const cwdData = path.resolve(process.cwd(), 'data');
  if (fs.existsSync(cwdData)) {
    return cwdData;
  }

  if (path.basename(process.cwd()) === 'backend') {
    if (!fs.existsSync(cwdData)) {
      try { fs.mkdirSync(cwdData, { recursive: true }); } catch {}
    }
    return cwdData;
  }

  if (!fs.existsSync(rootBackendData)) {
    try { fs.mkdirSync(rootBackendData, { recursive: true }); } catch {}
  }
  return rootBackendData;
}
