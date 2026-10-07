import { useEffect, useState } from 'react';
import { apiUrl } from './api';

const MIN_DISPLAY_MS = 5000;

type ResolveResponse = {
  destinationUrl: string;
};

type ViewState =
  | { kind: 'loading' }
  | { kind: 'ready'; destinationUrl: string }
  | { kind: 'forbidden' }
  | { kind: 'notFound' }
  | { kind: 'error'; message: string };

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

type Props = {
  hash: string;
};

export function RedirectInterstitial({ hash }: Props) {
  const [view, setView] = useState<ViewState>({ kind: 'loading' });

  useEffect(() => {
    let cancelled = false;
    const pageStarted = Date.now();

    async function run() {
      try {
        const res = await fetch(`${apiUrl}/url-shortener/${hash}`);

        if (res.status === 404) {
          if (!cancelled) setView({ kind: 'notFound' });
          return;
        }

        if (res.status === 403) {
          if (!cancelled) setView({ kind: 'forbidden' });
          return;
        }

        if (!res.ok) {
          const text = await res.text();
          if (!cancelled) {
            setView({
              kind: 'error',
              message: text || `HTTP ${res.status}`,
            });
          }
          return;
        }

        const data = (await res.json()) as ResolveResponse;
        if (!cancelled) {
          setView({ kind: 'ready', destinationUrl: data.destinationUrl });
        }

        const elapsed = Date.now() - pageStarted;
        const totalWait = Math.max(MIN_DISPLAY_MS, elapsed);
        const remaining = totalWait - (Date.now() - pageStarted);
        if (remaining > 0) {
          await sleep(remaining);
        }

        if (!cancelled) {
          window.location.assign(data.destinationUrl);
        }
      } catch (err) {
        if (cancelled) return;
        if (err instanceof TypeError && err.message === 'Failed to fetch') {
          setView({
            kind: 'error',
            message:
              'Impossible de joindre l’API. Vérifiez que le backend tourne ou relancez docker compose up.',
          });
          return;
        }
        setView({
          kind: 'error',
          message: err instanceof Error ? err.message : 'Une erreur est survenue',
        });
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [hash]);

  return (
    <main>
      <h1>stoik</h1>

      {view.kind === 'loading' && (
        <>
          <p className="tagline">vous quittez notre site</p>
          <p className="muted">
            Vérification de la destination… Vous serez redirigé dans quelques
            instants.
          </p>
        </>
      )}

      {view.kind === 'ready' && (
        <>
          <p className="tagline">vous quittez notre site</p>
          <p className="muted">
            Vous allez être redirigé vers une adresse externe. Vérifiez l’URL
            ci-dessous avant de continuer.
          </p>
          <p className="destination">{view.destinationUrl}</p>
          <p className="muted">Redirection en cours…</p>
        </>
      )}

      {view.kind === 'forbidden' && (
        <>
          <p className="tagline">lien plus autorisé</p>
          <p className="muted">
            Ce raccourci ne peut plus être utilisé : la destination n’est pas
            autorisée ou n’est plus joignable.
          </p>
          <div className="actions">
            <a className="button button-secondary" href="/">
              Retour à l’accueil
            </a>
          </div>
        </>
      )}

      {view.kind === 'notFound' && (
        <>
          <p className="tagline">lien introuvable</p>
          <p className="muted">Ce raccourci n’existe pas ou a été supprimé.</p>
          <div className="actions">
            <a className="button button-secondary" href="/">
              Retour à l’accueil
            </a>
          </div>
        </>
      )}

      {view.kind === 'error' && (
        <>
          <p className="tagline">erreur</p>
          <p className="error" role="alert">
            {view.message}
          </p>
          <div className="actions">
            <a className="button button-secondary" href="/">
              Retour à l’accueil
            </a>
          </div>
        </>
      )}
    </main>
  );
}
