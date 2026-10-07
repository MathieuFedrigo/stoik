import { FormEvent, useState } from 'react';
import { ReadonlyCopyField } from '../components/shared/ReadonlyCopyField';
import { USButton } from '../components/generic/USButton';
import {
  createUrlShortener,
  UrlShortenerNetworkError,
} from '../services/UrlShortener.service';

export function UrlShortenerHome() {
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
      const data = await createUrlShortener(url.trim());
      setShortUrl(data.shortUrl);
    } catch (err) {
      if (err instanceof UrlShortenerNetworkError) {
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
          <ReadonlyCopyField
            id="short-url"
            value={shortUrl}
            copyAriaLabel="Copier le lien raccourci"
            onCopyError={setError}
          />
        )}

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        <div className="actions">
          {isShortened ? (
            <USButton variant="primary" href={shortUrl}>
              Visiter la page
            </USButton>
          ) : (
            <USButton
              variant="primary"
              type="submit"
              disabled={loading || !url.trim()}
            >
              {loading ? 'Raccourcissement…' : 'Raccourcir'}
            </USButton>
          )}
        </div>
      </form>
    </main>
  );
}
