import { parseShortHashFromPathname } from './utils/hash';
import { RedirectInterstitial } from './pages/RedirectInterstitial';
import { UrlShortenerHome } from './pages/UrlShortenerHome';

export default function App() {
  const shortHash = parseShortHashFromPathname(window.location.pathname);
  if (shortHash) {
    return <RedirectInterstitial hash={shortHash} />;
  }

  return <UrlShortenerHome />;
}
