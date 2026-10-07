import { RedirectDestination, ShortLink } from "../models/UrlShortener";

/** Corps de `POST /url-shortener`. */
export type UrlShortenerPostBody = {
  url: string;
};

/** Réponse de `POST /url-shortener`. */
export type UrlShortenerPostResponse = ShortLink;

/** Réponse de `GET /url-shortener/:hash`. */
export type UrlShortenerRedirectResponse = RedirectDestination;
