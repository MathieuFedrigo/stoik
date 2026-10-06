# Stoik — mini projet test technique

Stack locale :

- **Frontend** : Node.js, TypeScript, React (Vite)
- **Backend** : Node.js, TypeScript, NestJS
- **Base de données** : PostgreSQL 16
- **Orchestration** : Docker Compose

## Prérequis

- [Docker](https://docs.docker.com/get-docker/) et Docker Compose (inclus avec Docker Desktop)
- Optionnel : Node.js 22+ si vous voulez lancer front/back sans Docker

## Démarrage avec Docker (recommandé)

À la racine du projet :

```bash
docker compose up --build
```

Au premier lancement, l’installation des dépendances npm peut prendre quelques minutes.

| Service    | URL                          |
| ---------- | ---------------------------- |
| Frontend   | http://localhost:5174        |
| Backend    | http://localhost:3001        |
| PostgreSQL | `localhost:5433` (user/pass/db : `stoik`) |

### Endpoint API

```bash
curl http://localhost:3001/hello-word
```

Réponse attendue :

```json
{ "message": "Hello Word" }
```

Le frontend appelle cet endpoint au chargement de la page.

### Arrêter les services

```bash
docker compose down
```

Pour supprimer aussi le volume PostgreSQL :

```bash
docker compose down -v
```

## Développement sans Docker

### PostgreSQL seul (Docker)

```bash
docker compose up postgres -d
```

### Backend

```bash
cd backend
npm install
export PORT=3001
export DATABASE_URL=postgres://stoik:stoik@localhost:5433/stoik
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
export VITE_API_URL=http://localhost:3001
npm run dev
```

## Structure du dépôt

```
.
├── docker-compose.yml
├── backend/          # NestJS
├── frontend/         # React + Vite
└── README.md
```

La base PostgreSQL est démarrée et configurée via `DATABASE_URL` côté backend ; aucune migration n’est requise pour l’endpoint `/hello-word` actuel.
