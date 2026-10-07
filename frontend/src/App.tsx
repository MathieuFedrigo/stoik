import { ApiStatusIndicator } from '@/components/shared/ApiStatusIndicator';
import { RedirectInterstitial } from '@/pages/RedirectInterstitial';
import { UrlShortenerHome } from '@/pages/UrlShortenerHome';
import { parseShortHashFromPathname } from '@/utils/Hash';

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
