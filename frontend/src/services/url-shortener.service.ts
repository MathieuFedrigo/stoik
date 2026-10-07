import { apiUrl } from './api-config';

export type CreateUrlShortenerResponse = {
  shortUrl: string;
  originalUrl: string;
};

export type ResolveRedirectResponse = {
  destinationUrl: string;
};

export type ResolveRedirectFailure =
  | { reason: 'notFound' }
  | { reason: 'forbidden' }
  | { reason: 'network' }
  | { reason: 'error'; message: string };

export type ResolveRedirectResult =
  | { ok: true; data: ResolveRedirectResponse }
  | { ok: false; failure: ResolveRedirectFailure };

export class UrlShortenerNetworkError extends Error {
  constructor() {
    super('Failed to fetch');
    this.name = 'UrlShortenerNetworkError';
  }
}

export async function createUrlShortener(
  url: string,
): Promise<CreateUrlShortenerResponse> {
  let res: Response;
  try {
    res = await fetch(`${apiUrl}/url-shortener`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
  } catch (err) {
    if (err instanceof TypeError && err.message === 'Failed to fetch') {
      throw new UrlShortenerNetworkError();
    }
    throw err;
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }

  return (await res.json()) as CreateUrlShortenerResponse;
}

export async function resolveUrlShortenerRedirect(
  hash: string,
): Promise<ResolveRedirectResult> {
  let res: Response;
  try {
    res = await fetch(`${apiUrl}/url-shortener/${hash}`);
  } catch (err) {
    if (err instanceof TypeError && err.message === 'Failed to fetch') {
      return { ok: false, failure: { reason: 'network' } };
    }
    throw err;
  }

  if (res.status === 404) {
    return { ok: false, failure: { reason: 'notFound' } };
  }

  if (res.status === 403) {
    return { ok: false, failure: { reason: 'forbidden' } };
  }

  if (!res.ok) {
    const text = await res.text();
    return {
      ok: false,
      failure: {
        reason: 'error',
        message: text || `HTTP ${res.status}`,
      },
    };
  }

  const data = (await res.json()) as ResolveRedirectResponse;
  return { ok: true, data };
}
