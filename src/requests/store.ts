import { mkdir, open, readFile, rename, readdir, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

export class Store<T> {
  constructor(readonly directory: string) {}
  path(id: string): string {
    if (!/^[a-zA-Z0-9_-]{1,100}$/.test(id)) throw new Error('Invalid record ID');
    return join(this.directory, id + '.json');
  }
  async read(id: string): Promise<T | undefined> {
    try { return JSON.parse(await readFile(this.path(id), 'utf8')) as T; }
    catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined; throw error; }
  }
  async write(id: string, value: T): Promise<void> {
    await mkdir(this.directory, { recursive: true });
    const target = this.path(id);
    const temp = target + '.' + randomUUID() + '.tmp';
    const file = await open(temp, 'wx', 0o600);
    try { await file.writeFile(JSON.stringify(value, null, 2)); await file.sync(); }
    finally { await file.close(); }
    await rename(temp, target);
  }
  async all(): Promise<T[]> {
    await mkdir(this.directory, { recursive: true });
    const records = await Promise.all((await readdir(this.directory)).filter(name => name.endsWith('.json')).map(name => this.read(name.slice(0, -5))));
    return records.filter(record => record !== undefined) as T[];
  }
}
/** One writer across CLI/server processes. A crash leaves a fail-closed lock.
 * Operator must confirm old process exited before explicitly removing it. */
export async function processLock(directory = 'data'): Promise<() => Promise<void>> {
  await mkdir(directory, { recursive: true });
  const path = join(directory, 'writer.lock');
  const handle = await open(path, 'wx', 0o600).catch(() => { throw new Error('Writer locked. Stop other writer; after a crash, inspect data/writer.lock before removing it.'); });
  await handle.writeFile(JSON.stringify({ pid: process.pid, startedAt: new Date().toISOString() }));
  await handle.sync();
  return async () => { await handle.close(); await unlink(path); };
}
