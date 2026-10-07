import { FormEvent, useState } from 'react';

/** En dev, les requêtes passent par le proxy Vite (évite CORS). */
const apiUrl = import.meta.env.DEV
  ? ''
  : (import.meta.env.VITE_API_URL ?? 'http://localhost:3001');

console.log(apiUrl);
type UrlShortenerResponse = {
  shortUrl: string;
  originalUrl: string;
};

export default function App() {
  const [url, setUrl] = useState('');
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isShortened = shortUrl !== null;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (isShortened || loading || !url.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${apiUrl}/url-shortener`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }

      const data = (await res.json()) as UrlShortenerResponse;
      setShortUrl(data.shortUrl);
    } catch (err) {
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        setError(
          'Impossible de joindre l’API. Vérifiez que le backend tourne (port 3001) ou relancez docker compose up.',
        );
      } else {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <h1>stoik</h1>
      <p className="tagline">url shortener</p>

      <form onSubmit={handleSubmit} className="form">
        <label htmlFor="url">URL</label>
        <input
          id="url"
          type="url"
          name="url"
          placeholder="https://example.com/..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          autoComplete="url"
        />

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        <div className="actions">
          {isShortened ? (
            <a className="button button-primary" href={shortUrl}>
              Visite link
            </a>
          ) : (
            <button type="submit" className="button button-primary" disabled={loading || !url.trim()}>
              {loading ? 'Raccourcissement…' : 'Raccourcir'}
            </button>
          )}
        </div>

        {isShortened && (
          <p className="result">
            <span className="result-label">short:</span>{' '}
            <code>{shortUrl}</code>
          </p>
        )}
      </form>
    </main>
  );
}
