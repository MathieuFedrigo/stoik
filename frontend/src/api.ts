/** En dev, les requêtes passent par le proxy Vite (évite CORS). */
export const apiUrl = import.meta.env.DEV
  ? ''
  : (import.meta.env.VITE_API_URL ?? 'http://localhost:3001');
