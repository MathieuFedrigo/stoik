import { ApiStatusIndicator } from './components/shared/ApiStatusIndicator';
import { parseShortHashFromPathname } from './utils/hash';
import { RedirectInterstitial } from './pages/RedirectInterstitial';
import { UrlShortenerHome } from './pages/UrlShortenerHome';

export default function App() {
  const shortHash = parseShortHashFromPathname(window.location.pathname);

  return (
    <>
      {shortHash ? (
        <RedirectInterstitial hash={shortHash} />
      ) : (
        <UrlShortenerHome />
      )}
      <ApiStatusIndicator />
    </>
  );
}
