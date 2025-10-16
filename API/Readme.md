# 🧱 API Backend - Node.js / TypeScript

Ce projet est une API REST construite avec **Node.js**, **Express** et **TypeScript**, connectée à une base de données **MariaDB**.  
L’objectif est de fournir une architecture claire, modulaire et maintenable pour gérer les utilisateurs et autres entités futures.

---

## 🚀 Stack Technique

- **Node.js** — runtime JavaScript côté serveur  
- **Express** — framework HTTP léger et rapide  
- **TypeScript** — typage fort pour un code plus robuste  
- **MySQL** — base de données relationnelle  
- **mysql2/promise** — client MySQL compatible avec `async/await`  
- **bcrypt** — pour le hashage sécurisé des mots de passe  
- **Docker** — pour l’exécution isolée et reproductible  

---

## 🧩 Structure du projet

API/
│
├── src/
│ ├── config/ # Fichiers de configuration (DB, environnement, etc.)
│ ├── helpers/ # Fonctions utilitaires réutilisables
│ ├── models/ # Définition des classes et interfaces (ex: UserModel)
│ ├── repository/ # Accès aux données (requêtes SQL, interactions avec MySQL)
│ ├── routes/ # Définition des routes Express (API REST)
│ ├── services/ # Logique métier (traitement, validation, etc.)
│ ├── utils/ # Outils généraux (gestion des erreurs, logger, etc.)
│ ├── index.ts # Point d’entrée logique (initialisation des routes)
│ ├── server.ts # Serveur Express principal
│ └── init.sql # Script SQL de création de la base/tables
│
├── Dockerfile # Image Docker pour exécuter l’API
├── package.json # Dépendances et scripts npm
├── tsconfig.json # Configuration TypeScript
└── README.md # Ce fichier 😎