import { BlockList, isIPv4, isIPv6 } from 'node:net';
import { lookup } from 'node:dns/promises';

export class UnacceptableAddressError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnacceptableAddressError';
  }
}

/** Host has no DNS record (customer-side issue), not a security rejection. */
export class UnresolvableHostError extends UnacceptableAddressError {
  constructor(message: string) {
    super(message);
    this.name = 'UnresolvableHostError';
  }
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
blockSubnet('::ffff:0:0', 96, 'ipv6');

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

function isIpAllowed(addrIp: string): boolean {
  const ip = normalizeIp(addrIp);
  if (isIPv4(ip)) {
    return !blockedAddresses.check(ip, 'ipv4');
  }
  if (isIPv6(ip)) {
    return !blockedAddresses.check(ip, 'ipv6');
  }
  throw new UnacceptableAddressError('The given Host is not allowed');
}

export async function checkUrlAllowed(url: string): Promise<void> {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new UnacceptableAddressError('The url does not match the scheme');
  }

  if (parsed.hostname === '') {
    throw new UnacceptableAddressError('The hostname was not given');
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    throw new UnacceptableAddressError('The url does not match the scheme');
  }

  const port =
    parsed.port !== ''
      ? Number(parsed.port)
      : parsed.protocol === 'https:'
        ? 443
        : 80;

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new UnacceptableAddressError('The given Host is not allowed');
  }

  await checkHostPortAllowed(parsed.hostname, port);
}

export async function checkHostPortAllowed(
  host: string,
  _port: number,
): Promise<void> {
  let addresses: { address: string; family: number }[];
  try {
    addresses = await lookup(host, { all: true, verbatim: true });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    throw new UnresolvableHostError(
      `The hostname ${host} could not be resolved (${detail})`,
    );
  }

  if (process.env.ENVIRONMENT === 'non-regression') {
    return;
  }

  for (const { address } of addresses) {
    if (!isIpAllowed(address)) {
      throw new UnacceptableAddressError('The given Host is not allowed');
    }
  }
}
