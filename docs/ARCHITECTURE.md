# Architecture TimeManager

## Vue d'ensemble
Application web de gestion du temps avec architecture 3-tiers.

## Stack Technique

### Backend
- **Framework** : Express.js + TypeScript
- **ORM** : TypeORM
- **Base de données** : MariaDB 11
- **Authentification** : JWT (jsonwebtoken)
- **Justification** : TypeScript pour la sécurité de typage, Express pour sa simplicité et son écosystème mature.

### Frontend
- **Framework** : Vue.js 3 (Composition API)
- **Build tool** : Vite
- **Justification** : Vue 3 offre des performances optimales avec le Virtual DOM, Vite assure un HMR rapide en développement.

### DevOps
- **Conteneurisation** : Docker + Docker Compose
- **CI/CD** : GitHub Actions
- **Reverse Proxy** : Nginx (production)
- **Monitoring** : Logs persistants dans volumes Docker

## Schéma d'architecture

┌─────────────────┐
│ Client Web │
└────────┬────────┘
│ HTTP/HTTPS
▼
┌─────────────────┐
│ Nginx (Proxy) │ ← Production uniquement
└────────┬────────┘
│
┌────┴────┐
│ │
▼ ▼
┌────────┐ ┌─────────┐
│Frontend│ │ Backend │
│Vue.js │ │Express │
│:3000 │ │:5001 │
└────────┘ └────┬────┘
│ TypeORM
▼
┌─────────┐
│ MariaDB │
│ :3306 │
└─────────┘


## Environnements

### Développement (`docker-compose.yml`)
- Hot reload activé (volumes montés)
- PHPMyAdmin accessible (port 8081)
- Logs en mode verbose

### Production (`docker-compose.prod.yml`)
- Builds optimisés (multi-stage)
- Reverse proxy Nginx
- Logs structurés
- Secrets via fichier `.env.prod` (non versionné)

## Sécurité
- JWT avec expiration
- Mots de passe hashés (bcrypt)
- CORS configuré
- Variables sensibles hors Git
