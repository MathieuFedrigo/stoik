import { useEffect, useState } from 'react';
import './ApiStatusIndicator.css';
import { fetchHealth } from '@/services/Health.service';

const POLL_INTERVAL_MS = 15_000;

export function ApiStatusIndicator() {
  const [online, setOnline] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      const ok = await fetchHealth();
      if (!cancelled) setOnline(ok);
    }

    void check();
    const id = window.setInterval(() => void check(), POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  const dotClass =
    online === null
      ? 'api-status-dot api-status-dot--unknown'
      : online
        ? 'api-status-dot api-status-dot--ok'
        : 'api-status-dot api-status-dot--error';

  return (
    <div className="api-status" aria-live="polite">
      <span className={dotClass} aria-hidden />
      <span className="api-status-label">API</span>
    </div>
  );
}
