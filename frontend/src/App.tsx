import { RedirectInterstitial } from './RedirectInterstitial';
import { parseShortHashFromPathname } from './shortHash';
import { UrlShortenerHome } from './UrlShortenerHome';

export default function App() {
  const shortHash = parseShortHashFromPathname(window.location.pathname);
  if (shortHash) {
    return <RedirectInterstitial hash={shortHash} />;
  }

  return <UrlShortenerHome />;
}
