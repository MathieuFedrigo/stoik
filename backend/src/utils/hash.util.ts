import { randomBytes } from 'node:crypto';

const ALPHANUM =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export const HASH_PATTERN = /^[A-Za-z0-9]{8}$/;

export function generateHash(): string {
  const bytes = randomBytes(8);
  return Array.from(bytes, (byte) => ALPHANUM[byte % ALPHANUM.length]).join(
    '',
  );
}
