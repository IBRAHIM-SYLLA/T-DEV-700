# 🕒 Time Manager — README

Time Manager est une application permettant aux employés d’enregistrer leurs horaires (arrivées/départs) et aux managers de gérer leurs équipes et consulter divers KPIs.  
Le projet repose sur une architecture **API RESTful + Frontend + base de données MariaDB**, entièrement dockerisée et orchestrée via Docker Compose.

---

## 🚀 Table des matières
1. [Architecture du projet](#architecture-du-projet)  
2. [Technologies utilisées](#technologies-utilisées)  
3. [Structure du repository](#structure-du-repository)  
4. [Configuration des environnements](#configuration-des-environnements)  
5. [Lancement du projet](#lancement-du-projet)  
6. [Services Docker](#services-docker)  
7. [Développement (Dev Mode)](#développement-dev-mode)  
8. [Logs & Persistance](#logs--persistance)  
9. [Tests & Qualité](#tests--qualité)  
10. [CI/CD](#cicd)  
11. [Contribuer au projet](#contribuer-au-projet)

---

# 🏗️ Architecture du projet
```
+-------------------------+
| Frontend (Vite + React) |
| http://localhost:FRONT
|
+-----------+-------------+
| Backend (Node.js) |
| http://localhost:BACK
|
+-----------v-------------+
| MariaDB 11 DB |
| data persisted locally |
+-------------------------+
```

Chaque service tourne dans un conteneur isolé et communique via un réseau Docker interne unique.

---

# 🧰 Technologies utilisées

### Backend
- Node.js + Express  
- JWT pour l’authentification  
- MariaDB (SQL)  
- Tests automatisés (ex : Jest)

### Frontend
- Framework Web React
- Vite pour le développement rapide
- Consommation de l’API REST backend

### Base de données
- **MariaDB 11**
- Initialisation via `API/init.sql`

### DevOps
- Docker & Docker Compose  
- GitHub Actions (Build, Tests, Coverage)  
- Environnements séparés (dev / prod)  
- Logs persistés hors conteneurs

---

# 📁 Structure du repository
```
/
├── API/ # Backend Node.js
│ ├── Dockerfile
│ ├── src/
│ └── init.sql
│
├── Frontend/ # Front Web
│ ├── Dockerfile
│ └── src/
│
├── logs/ # Logs persistés
│ ├── api/
│ ├── frontend/
│ └── db/
│
├── docker-compose.yml # Orchestration des services
├── .env.docker # Variables d'environnement (non commit)
└── README.md
```

---

# ⚙️ Configuration des environnements
Créer un fichier `.env.docker` :
```
DATABASE

DB_NAME=timemanager
DB_USER=root
DB_PASSWORD=yourPassword
DB_PORT_OUT=3307

BACKEND

BACKEND_PORT=3000

FRONTEND

FRONTEND_PORT=5173

PHPMYADMIN

PMA_PORT_OUT=8081
PMA_PORT=80
```
> ⚠️ **Ne jamais commit de mots de passe en clair.**  
> Ajoutez `.env.docker` dans votre `.gitignore`.

---

# ▶️ Lancement du projet

### 1 — Build & run
```
docker-compose up --build
```

### 2 — Accès aux services

| Service        | URL                                   |
|----------------|----------------------------------------|
| Frontend       | http://localhost:FRONTEND_PORT         |
| Backend API    | http://localhost:BACKEND_PORT          |
| PhpMyAdmin     | http://localhost:PMA_PORT_OUT          |
| MariaDB        | localhost:DB_PORT_OUT (3306 interne)   |

---

# 🐳 Services Docker

## ✔️ mariadb
- Image `mariadb:11`
- Initialisation via `/API/init.sql`
- Volume persistant : `mariadb_data`

## ✔️ phpmyadmin
Interface SQL simple d’accès pour manipuler la base.

## ✔️ backend
- Build depuis `API/Dockerfile`
- Commande : `npm run dev`
- Volumes montés pour le hot-reload

## ✔️ frontend
- Build depuis `Frontend/Dockerfile`
- Commande : `npm run dev -- --host`
- Volumes montés pour le rafraîchissement instantané

---

# 🛠️ Développement (Dev Mode)

### Backend
```
cd API
npm install
npm run dev
```

### Frontend
```
cd Frontend
npm install
npm run dev
```
---

# 📦 Logs & Persistance

Les logs sont stockés hors conteneurs dans :
```
logs/
├── api/
├── frontend/
└── db/
```
Les données MariaDB sont stockées dans le volume docker :


---

# ✔️ Tests & Qualité

### Tests backend
```
npm run test
npm run test:coverage
```
### Linting
Coming soon (ESLint, Prettier...).

---

# 🔁 CI/CD

Le pipeline GitHub Actions inclut :

- ⚙️ Build du frontend et backend  
- 🧪 Exécution des tests  
- 📊 Génération du rapport de couverture  
- 🚫 Blocage du merge en cas d’échec  

---

# 🤝 Contribuer au projet

### Workflow Git recommandé :
- `main` → production  
- `dev` → intégration  
- `feature/xxx` → nouvelles fonctionnalités  

### Règles :
- Pull Requests obligatoires  
- Validation par deux reviewers  
- Commits formatés (Conventional Commits recommandé)  
- Branches protégées  
---