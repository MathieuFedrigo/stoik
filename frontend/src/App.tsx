import { useEffect, useState } from 'react';

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export default function App() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${apiUrl}/hello-word`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: { message: string }) => setMessage(data.message))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main>
      <h1>Stoik — test technique</h1>
      <p>
        Endpoint backend : <code>GET /hello-word</code>
      </p>
      {loading && <p>Chargement…</p>}
      {error && <p role="alert">Erreur : {error}</p>}
      {message && <p>Réponse API : {message}</p>}
    </main>
  );
}
