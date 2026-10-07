import { useEffect, useState } from 'react';
import './RedirectInterstitial.css';
import { USButton } from '@/components/generic/USButton';
import { resolveUrlShortenerRedirect } from '@/services/UrlShortener.service';

const MIN_DISPLAY_MS = 5000;

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
        const result = await resolveUrlShortenerRedirect(hash);

        if (!result.ok) {
          if (cancelled) return;
          switch (result.failure.reason) {
            case 'notFound':
              setView({ kind: 'notFound' });
              return;
            case 'forbidden':
              setView({ kind: 'forbidden' });
              return;
            case 'network':
              setView({
                kind: 'error',
                message:
                  'Impossible de joindre l’API. Vérifiez que le backend tourne ou relancez docker compose up.',
              });
              return;
            case 'error':
              setView({ kind: 'error', message: result.failure.message });
              return;
          }
        }

        const { destinationUrl } = result.data;
        if (!cancelled) {
          setView({ kind: 'ready', destinationUrl });
        }

        const elapsed = Date.now() - pageStarted;
        const totalWait = Math.max(MIN_DISPLAY_MS, elapsed);
        const remaining = totalWait - (Date.now() - pageStarted);
        if (remaining > 0) {
          await sleep(remaining);
        }

        if (!cancelled) {
          window.location.assign(destinationUrl);
        }
      } catch (err) {
        if (cancelled) return;
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
            <USButton variant="secondary" href="/">
              Retour à l’accueil
            </USButton>
          </div>
        </>
      )}

      {view.kind === 'notFound' && (
        <>
          <p className="tagline">lien introuvable</p>
          <p className="muted">Ce raccourci n’existe pas ou a été supprimé.</p>
          <div className="actions">
            <USButton variant="secondary" href="/">
              Retour à l’accueil
            </USButton>
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
            <USButton variant="secondary" href="/">
              Retour à l’accueil
            </USButton>
          </div>
        </>
      )}
    </main>
  );
}
