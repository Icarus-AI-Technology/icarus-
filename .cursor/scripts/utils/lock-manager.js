// Minimal, safer file-based lock manager with TTL
import { promises as fs } from 'fs';
import path from 'node:path';

const locksDir = path.resolve(process.cwd(), '.cursor/locks');
const DEFAULT_TTL_MS = 30_000; // 30s

async function ensureDir() {
  await fs.mkdir(locksDir, { recursive: true });
}

async function isStale(file, ttlMs) {
  try {
    const stat = await fs.stat(file);
    const age = Date.now() - stat.mtimeMs;
    return age > ttlMs;
  } catch {
    return false;
  }
}

export async function acquire(lockId, ownerId = 'orchestrator', ttlMs = DEFAULT_TTL_MS) {
  await ensureDir();
  const file = path.join(locksDir, lockId.replace(/[\/]/g, '_') + '.lock');
  const content = JSON.stringify({ ownerId, createdAt: new Date().toISOString(), ttlMs });
  try {
    const handle = await fs.open(file, 'wx');
    await handle.writeFile(content);
    await handle.close();
    return true;
  } catch (e) {
    // If exists, check TTL and try to steal if stale
    if (await isStale(file, ttlMs)) {
      try {
        await fs.unlink(file);
        const handle = await fs.open(file, 'wx');
        await handle.writeFile(content);
        await handle.close();
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
}

export async function release(lockId) {
  const file = path.join(locksDir, lockId.replace(/[\/]/g, '_') + '.lock');
  try {
    await fs.unlink(file);
  } catch {
    // ignore
  }
}

export async function cleanExpired(ttlMs = DEFAULT_TTL_MS) {
  await ensureDir();
  const files = await fs.readdir(locksDir).catch(() => []);
  const now = Date.now();
  for (const name of files) {
    if (!name.endsWith('.lock')) continue;
    const file = path.join(locksDir, name);
    try {
      const stat = await fs.stat(file);
      if (now - stat.mtimeMs > ttlMs) {
        await fs.unlink(file);
      }
    } catch {
      // ignore
    }
  }
}

