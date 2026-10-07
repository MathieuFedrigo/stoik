/** Lien raccourci créé ou affiché dans l’UI. */
export type ShortLink = {
  shortUrl: string;
  originalUrl: string;
};

/** Destination résolue pour une redirection. */
export type RedirectDestination = {
  destinationUrl: string;
};

export type ResolveRedirectFailure =
  | { reason: 'notFound' }
  | { reason: 'forbidden' }
  | { reason: 'network' }
  | { reason: 'error'; message: string };

export type ResolveRedirectResult =
  | { ok: true; destination: RedirectDestination }
  | { ok: false; failure: ResolveRedirectFailure };

export type RedirectInterstitialViewState =
  | { kind: 'loading' }
  | { kind: 'ready'; destinationUrl: string }
  | { kind: 'forbidden' }
  | { kind: 'notFound' }
  | { kind: 'error'; message: string };
