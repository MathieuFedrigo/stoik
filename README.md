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

### Lancer avec Docker

À la racine du dépôt :

```bash
docker compose up --build
```

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


### Variables d’environnement

| Variable | Service | Rôle |
| -------- | ------- | ---- |
| `DATABASE_URL` | Backend | Connexion PostgreSQL (obligatoire) |
| `PORT` | Backend | Port HTTP (défaut `3001`) |
| `SHORT_URL_ORIGIN` | Backend | Origine des liens courts renvoyés par l’API (ex. `http://localhost:5174`) |
| `VITE_API_URL` | Frontend | URL de l’API en build/preview (hors proxy dev) |
| `VITE_PROXY_TARGET` | Frontend (Docker) | Cible du proxy Vite vers le backend (`http://backend:3001` dans Compose) |
| `ENVIRONMENT=non-regression` | Backend | Désactive le blocage des IP privées après résolution DNS (tests uniquement) |


## Choix d'architecture

**Redirection via SPA + interstitielle (pas de `302` API)**  
- Permet d’afficher la destination, un délai minimum (~5 s) et des messages clairs (404, 403, erreur réseau).
- En production « classique », on pourrait placer un reverse proxy ou un domaine dédié qui fait le `302` ; ici le scope privilégie l’UX et la transparence pour l’utilisateur.

**Validation SSRF à la création et à la résolution**  
- Schémas `http` / `https` uniquement, résolution DNS, rejet des plages IP privées / locales (`security.util.ts`).
- Politique distincte : `400` à la création, `403` si un lien déjà enregistré pointe vers une destination devenue interdite (re-vérification au clic).

**Hash aléatoire (8 caractères alphanumériques)**  
- Généré côté serveur (`crypto`), contrainte **unique** en base. Collision → réponse générique `503` sans exposer le détail SQL.

**Rate limiting sur `POST /url-shortener`**  
- Limite en mémoire par client (IP / `X-Forwarded-For` avec `trust proxy`), 10 requêtes / minute — suffisant pour un POC ; Redis serait indiqué en multi-instance. Et surtout protection par creation d'un compte avec une limite de liens gratuit.

**Couches backend**  
- Controller → service (`UrlShortenerService`) → entité TypeORM
- Erreurs métier (`AppHttpError`) centralisées dans un filtre HTTP
- Formatters pour les réponses API.

**Base de données**  
- `synchronize: true` en développement pour itérer vite ; en production il faudrait des migrations TypeORM et `synchronize: false`.


**Authentification**  
- Volontairement pas fait car aurait demandé beaucoup plus de model, d'endpoint, etc pour etre coherent. Et si on l'avait fait on aurait voulu mettre GoogleAuth plutot qu'un auth maison donc encore un peu plus penible
