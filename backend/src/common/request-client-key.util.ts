type RequestLike = {
  ip?: string;
  socket: { remoteAddress?: string | null };
  headers: Record<string, string | string[] | undefined>;
};

export function getRequestClientKey(request: RequestLike): string {
  const forwarded = request.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0]?.trim() || 'unknown';
  }
  if (Array.isArray(forwarded) && forwarded[0]) {
    return forwarded[0].trim();
  }

  return request.ip ?? request.socket.remoteAddress ?? 'unknown';
}
