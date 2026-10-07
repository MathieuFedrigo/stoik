import { apiUrl } from '@/services/ApiConfig';

export type HealthResponse = { status: 'ok' };

export async function fetchHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${apiUrl}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return false;
    const data = (await response.json()) as HealthResponse;
    return data.status === 'ok';
  } catch {
    return false;
  }
}
