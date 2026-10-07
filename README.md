# Stoik — URL shortener

Mini application full stack : création de liens courts, résolution par hash, page interstitielle avant redirection.

## Stack

| Couche | Technologie |
| ------ | ----------- |
| Frontend | Node.js, TypeScript, React (Vite) |
| Backend | Node.js, TypeScript, NestJS, TypeORM |
| Base de données | PostgreSQL 16 |
| Orchestration | Docker Compose |

## Prérequis

- [Docker](https://docs.docker.com/get-docker/) et Docker Compose (recommandé pour tout lancer d’un coup)
- **Optionnel** : Node.js 22+ pour exécuter le front et/ou le back hors conteneurs

---

## Run

### Tout lancer avec Docker (recommandé)

À la racine du dépôt :

```bash
docker compose up --build
```

Au premier démarrage, `npm install` dans les conteneurs peut prendre quelques minutes.

| Service | URL / accès |
| ------- | ----------- |
| **Frontend** | http://localhost:5174 |
| **Backend API** | http://localhost:3001 |
| **PostgreSQL** | `localhost:5433` — user / password / database : `stoik` |

**Parcours utilisateur**

1. Ouvrir http://localhost:5174
2. Saisir une URL longue → obtenir un lien court du type `http://localhost:5174/<hash>`
3. Ouvrir le lien court → page interstitielle puis redirection vers la destination

**Arrêter**

```bash
docker compose down
```

Supprimer aussi les données PostgreSQL (volume) :

```bash
docker compose down -v
```

### Développement local (sans conteneurs front/back)

PostgreSQL peut rester sous Docker :

```bash
docker compose up postgres -d
```

**Backend**

```bash
cd backend
npm install
export PORT=3001
export DATABASE_URL=postgres://stoik:stoik@localhost:5433/stoik
export SHORT_URL_ORIGIN=http://localhost:5174
npm run start:dev
```

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

En mode `vite dev`, les appels API passent par le **proxy Vite** (`/url-shortener`, `/health`) vers le backend — pas besoin de `VITE_API_URL` en dev. En build/preview production, définir `VITE_API_URL` (ex. `http://localhost:3001`).

### Variables d’environnement

| Variable | Service | Rôle |
| -------- | ------- | ---- |
| `DATABASE_URL` | Backend | Connexion PostgreSQL (obligatoire) |
| `PORT` | Backend | Port HTTP (défaut `3001`) |
| `SHORT_URL_ORIGIN` | Backend | Origine des liens courts renvoyés par l’API (ex. `http://localhost:5174`) |
| `VITE_API_URL` | Frontend | URL de l’API en build/preview (hors proxy dev) |
| `VITE_PROXY_TARGET` | Frontend (Docker) | Cible du proxy Vite vers le backend (`http://backend:3001` dans Compose) |
| `ENVIRONMENT=non-regression` | Backend | Désactive le blocage des IP privées après résolution DNS (tests uniquement) |

### API (exemples)

**Santé**

```bash
curl http://localhost:3001/health
# {"status":"ok"}
```

**Créer un raccourci**

```bash
curl -s -X POST http://localhost:3001/url-shortener \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://example.com"}'
```

Réponse (200) :

```json
{
  "shortUrl": "http://localhost:5174/Ab12Cd34",
  "originalUrl": "https://example.com"
}
```

**Résoudre un hash** (utilisé par la page interstitielle)

```bash
curl http://localhost:3001/url-shortener/Ab12Cd34
# {"destinationUrl":"https://example.com"}
```

Codes d’erreur courants : `400` (URL refusée à la création), `403` (destination plus autorisée à la redirection), `404` (hash inconnu ou invalide), `429` (rate limit sur le POST), `503` (collision rare sur l’unicité du hash — « Please try again later. »).

---

## Architecture

### Vue d’ensemble

```text
Navigateur
    │
    ├─ /                    → React : formulaire de raccourcissement
    ├─ /:hash (8 car. alnum) → React : interstitielle → fetch API → redirect
    │
    └─ (dev) proxy Vite ──→ NestJS ──→ PostgreSQL
```

Le **frontend sert aussi les liens courts** : ce n’est pas le backend qui répond en `302` sur `/:hash`. L’API expose uniquement du JSON ; la SPA route sur le pathname, affiche une interstitielle, puis redirige côté client.

### Choix principaux

**Redirection via SPA + interstitielle (pas de `302` API)**  
- Permet d’afficher la destination, un délai minimum (~5 s) et des messages clairs (404, 403, erreur réseau).  
- En production « classique », on pourrait placer un reverse proxy ou un domaine dédié qui fait le `302` ; ici le scope privilégie l’UX et la transparence pour l’utilisateur.

**Validation SSRF à la création et à la résolution**  
- Schémas `http` / `https` uniquement, résolution DNS, rejet des plages IP privées / locales (`security.util.ts`).  
- Politique distincte : `400` à la création, `403` si un lien déjà enregistré pointe vers une destination devenue interdite (re-vérification au clic).

**Hash aléatoire (8 caractères alphanumériques)**  
- Généré côté serveur (`crypto`), contrainte **unique** en base. Collision → réponse générique `503` sans exposer le détail SQL.

**Rate limiting sur `POST /url-shortener`**  
- Limite en mémoire par client (IP / `X-Forwarded-For` avec `trust proxy`), 10 requêtes / minute — suffisant pour un POC ; Redis serait indiqué en multi-instance.

**Couches backend**  
- Controller → service (`UrlShortenerService`) → entité TypeORM ; erreurs métier (`AppHttpError`) centralisées dans un filtre HTTP ; formatters pour les réponses API.

**Types frontend**  
- Modèles domaine (`types/models`), contrats route/API (`types/routes`), services fetch (`services/`) — une seule source de vérité pour les shapes JSON.

**Base de données**  
- `synchronize: true` en développement pour itérer vite ; en production il faudrait des migrations TypeORM et `synchronize: false`.

**Docker Compose**  
- Postgres avec healthcheck ; backend attend la DB ; volumes montés pour le hot reload ; proxy Vite cible le service `backend` sur le réseau Docker.

**Hors scope volontaire**  
- Pas d’authentification, pas de dédoublonnage URL → même lien court, pas d’analytics de clics, pas de slugs personnalisés.

---

## Structure du dépôt

```text
.
├── docker-compose.yml
├── backend/
│   └── src/
│       ├── url-shortener/   # API raccourcissement + entité
│       ├── health/          # GET /health
│       ├── rate-limit/      # garde-fou POST
│       ├── common/          # erreurs HTTP, filtre global
│       └── utils/           # hash, sécurité URL, helpers DB
├── frontend/
│   └── src/
│       ├── pages/           # accueil + interstitielle
│       ├── services/        # appels API
│       └── types/           # modèles et contrats API
└── README.md
```
