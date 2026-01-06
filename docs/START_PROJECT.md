# Démarrer le projet (local)

## Pré-requis
- Docker + Docker Compose (plugin `docker compose`)
- (Optionnel) Node.js + npm si tu veux lancer sans Docker

## Démarrage rapide (recommandé: Docker)
Depuis la racine du repo:

```bash
cd /path/to/T-DEV-700

docker compose --env-file .env.docker up -d --build
```

## URLs (valeurs par défaut via `.env.docker`)
- Frontend: http://localhost:3000
- Backend API: http://localhost:5001
- phpMyAdmin: http://localhost:8081
- MariaDB (port host): `localhost:3308`

## Comptes de démo
Utilise les comptes affichés sur la page Login (ex: `admin@timemanager.com`, etc.).

## Stop / reset
Stopper:

```bash
docker compose down
```

Stopper + supprimer la DB (⚠️ supprime les données):

```bash
docker compose down -v
```

Logs:

```bash
docker compose logs -f backend
docker compose logs -f frontend
```

## Développement sans Docker (optionnel)
### Backend
```bash
cd API
npm install
npm run dev
```

### Frontend
```bash
cd Frontend
npm install
npm run dev
```

⚠️ Dans ce mode, assure-toi que `VITE_API_URL` pointe vers l’API (voir `.env.docker` pour l’exemple).

## Dépannage rapide
- **Ports déjà utilisés**: modifie `FRONTEND_PORT`, `BACKEND_PORT`, `DB_PORT_OUT` dans `.env.docker`, puis relance `docker compose up -d --build`.
- **DB pas prête**: le backend attend la DB via healthcheck, mais si ça bloque, regarde `docker compose logs -f mariadb`.
