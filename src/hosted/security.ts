import { timingSafeEqual } from 'node:crypto';

export function authorizeHosted(role: 'borrower' | 'broker', supplied: string, tokens: { borrower?: string; broker?: string }) {
  const expected = tokens[role];
  if (!expected || tokens.borrower === tokens.broker || !/^[A-Za-z0-9_-]{24,256}$/.test(expected) ||
      !/^[A-Za-z0-9_-]{24,256}$/.test(supplied) || supplied.length !== expected.length ||
      !timingSafeEqual(Buffer.from(expected), Buffer.from(supplied))) throw new Error('Unauthorized role');
}
export function checkHostedOrigin(origin: string | undefined, host: string | undefined) {
  if (!host || !/^[a-zA-Z0-9.-]+(?::[0-9]+)?$/.test(host)) throw new Error('Origin rejected');
  if (origin && origin !== `https://${host}` && !(host.startsWith('127.0.0.1:') && origin === `http://${host}`)) throw new Error('Origin rejected');
}
