import { randomBytes } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';

// Local prototype access only. Never print capabilities or copy service keys.
const names = ['BROKER', 'BORROWER', 'OPERATOR'];
const template = await readFile(new URL('../.env.example', import.meta.url), 'utf8');
let configuration = template;
for (const role of names) {
  const key = `PROTOTYPE_${role}_TOKEN`;
  const emptyLine = new RegExp(`^${key}=\\s*$`, 'm');
  if (!emptyLine.test(configuration)) throw Error('Expected empty role entry in .env.example');
  configuration = configuration.replace(emptyLine, `${key}=${randomBytes(32).toString('base64url')}`);
}
try {
  await writeFile(new URL('../.env', import.meta.url), configuration, { flag: 'wx', mode: 0o600 });
  console.log('Created ignored .env with three distinct demo role codes. Open that file locally; share only the assigned role code privately. Restart npm start to load them. No wallet or service key was created or copied.');
} catch (error) {
  if (error.code !== 'EEXIST') throw error;
  console.log('.env already exists and was left unchanged. Configure any missing role codes locally using .env.example; each must be distinct and at least 24 characters.');
}
