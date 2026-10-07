import { FormEvent, useState } from 'react';
import { apiUrl } from './api';

type UrlShortenerResponse = {
  shortUrl: string;
  originalUrl: string;
};

export function UrlShortenerHome() {
  const [url, setUrl] = useState('');
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [copied, setCopied] = useState(false);
  const isShortened = shortUrl !== null;

  async function copyShortUrl() {
    if (!shortUrl) return;
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Impossible de copier dans le presse-papier.');
    }
  }

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

        {isShortened && (
          <>
            <div className="readonly-field">
              <output id="short-url" className="readonly-field-value">
                {shortUrl}
              </output>
              <button
                type="button"
                className="readonly-field-copy"
                onClick={() => void copyShortUrl()}
                aria-label={copied ? 'Lien copié' : 'Copier le lien raccourci'}
              >
                <ClipboardIcon />
              </button>
            </div>
          </>
        )}

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        <div className="actions">
          {isShortened ? (
            <a className="button button-primary" href={shortUrl}>
              Visiter la page
            </a>
          ) : (
            <button
              type="submit"
              className="button button-primary"
              disabled={loading || !url.trim()}
            >
              {loading ? 'Raccourcissement…' : 'Raccourcir'}
            </button>
          )}
        </div>
      </form>
    </main>
  );
}

function ClipboardIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden
    >
      <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z" />
      <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z" />
    </svg>
  );
}
