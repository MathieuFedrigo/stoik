import { randomInt } from 'node:crypto';

const ALPHANUM =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export const HASH_PATTERN = /^[A-Za-z0-9]{8}$/;

export function generateHash(): string {
  return Array.from(
    { length: 8 },
    () => ALPHANUM[randomInt(ALPHANUM.length)],
  ).join('');
}
