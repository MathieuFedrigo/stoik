const HASH_PATTERN = /^[A-Za-z0-9]{8}$/;

export function parseShortHashFromPathname(pathname: string): string | null {
  const segment = pathname.replace(/^\/|\/$/g, '');
  if (!segment.includes('/') && HASH_PATTERN.test(segment)) {
    return segment;
  }
  return null;
}
