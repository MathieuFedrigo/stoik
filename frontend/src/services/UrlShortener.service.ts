import { apiUrl } from '@/services/ApiConfig';
import type { ResolveRedirectResult } from '@/types/models/UrlShortener';
import type {
  UrlShortenerPostResponse,
  UrlShortenerRedirectResponse,
} from '@/types/routes/UrlShortener';

export class UrlShortenerNetworkError extends Error {
  constructor() {
    super('Failed to fetch');
    this.name = 'UrlShortenerNetworkError';
  }
}

export async function createUrlShortener(
  url: string,
): Promise<UrlShortenerPostResponse> {
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

  return (await res.json()) as UrlShortenerPostResponse;
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

  const data = (await res.json()) as UrlShortenerRedirectResponse;
  return { ok: true, data };
}
