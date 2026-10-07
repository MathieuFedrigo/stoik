import { BlockList, isIPv4, isIPv6 } from 'node:net';
import { lookup } from 'node:dns/promises';
import {
  AppHttpError,
  BadRequestError,
  ForbiddenError,
} from '../common/http-error';

/** How URL validation failures map to HTTP status when exposing a stored short link. */
export type UrlValidationPolicy = 'create' | 'redirect';

function rejectUrl(
  message: string,
  policy: UrlValidationPolicy,
): AppHttpError {
  return policy === 'redirect'
    ? new ForbiddenError(message)
    : new BadRequestError(message);
}

const blockedAddresses = new BlockList();

function blockSubnet(subnet: string, prefix: number, type?: 'ipv4' | 'ipv6'): void {
  blockedAddresses.addSubnet(subnet, prefix, type);
}

blockSubnet('0.0.0.0', 8, 'ipv4');
blockSubnet('10.0.0.0', 8, 'ipv4');
blockSubnet('100.64.0.0', 10, 'ipv4');
blockSubnet('127.0.0.0', 8, 'ipv4');
blockSubnet('169.254.0.0', 16, 'ipv4');
blockSubnet('172.16.0.0', 12, 'ipv4');
blockSubnet('192.168.0.0', 16, 'ipv4');
blockSubnet('224.0.0.0', 4, 'ipv4');
blockSubnet('240.0.0.0', 4, 'ipv4');

blockSubnet('::', 128, 'ipv6');
blockSubnet('::1', 128, 'ipv6');
blockSubnet('64:ff9b::', 96, 'ipv6');
blockSubnet('2001:db8::', 32, 'ipv6');
blockSubnet('fc00::', 7, 'ipv6');
blockSubnet('fe80::', 10, 'ipv6');
blockSubnet('ff00::', 8, 'ipv6');
// Do not block `::ffff:0:0/96` here: Node’s BlockList then marks every IPv4
// address as blocked when using check(..., 'ipv4'). IPv4-mapped IPv6 is normalized below.

function normalizeIp(ip: string): string {
  const lower = ip.toLowerCase();
  if (lower.startsWith('::ffff:')) {
    const mapped = lower.slice('::ffff:'.length);
    if (isIPv4(mapped)) {
      return mapped;
    }
  }
  return ip;
}

function isIpAllowed(addrIp: string, policy: UrlValidationPolicy): boolean {
  const ip = normalizeIp(addrIp);
  if (isIPv4(ip)) {
    return !blockedAddresses.check(ip, 'ipv4');
  }
  if (isIPv6(ip)) {
    return !blockedAddresses.check(ip, 'ipv6');
  }
  throw rejectUrl('The given Host is not allowed', policy);
}

export async function checkUrlAllowed(
  url: string,
  policy: UrlValidationPolicy = 'create',
): Promise<void> {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw rejectUrl('The url does not match the scheme', policy);
  }

  if (parsed.hostname === '') {
    throw rejectUrl('The hostname was not given', policy);
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    throw rejectUrl('The url does not match the scheme', policy);
  }

  const port =
    parsed.port !== ''
      ? Number(parsed.port)
      : parsed.protocol === 'https:'
        ? 443
        : 80;

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw rejectUrl('The given Host is not allowed', policy);
  }

  await checkHostPortAllowed(parsed.hostname, port, policy);
}

export async function checkHostPortAllowed(
  host: string,
  _port: number,
  policy: UrlValidationPolicy = 'create',
): Promise<void> {
  let addresses: { address: string; family: number }[];
  try {
    addresses = await lookup(host, { all: true, verbatim: true });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    throw rejectUrl(
      `The hostname ${host} could not be resolved (${detail})`,
      policy,
    );
  }

  if (process.env.ENVIRONMENT === 'non-regression') {
    return;
  }

  for (const { address } of addresses) {
    if (!isIpAllowed(address, policy)) {
      throw rejectUrl('The given Host is not allowed', policy);
    }
  }
}
