# Stratégie Git & Convention de Commits

## Workflow GitFlow Simplifié

main (production-ready)
├── feature/nom-feature
├── fix/nom-fix
└── devops/nom-tache

text

## Nomenclature des Branches

### Features
Format : `feature/<description-courte>`
- `feature/auth-jwt`
- `feature/dashboard-kpi`
- `feature/team-management`

### Fixes
Format : `fix/<description-probleme>`
- `fix/docker-volumes-path`
- `fix/auth-401-error`

### DevOps
Format : `devops/<tache>`
- `devops/ci-setup`
- `devops/nginx-proxy`
- `devops/prod-environment`

## Convention de Commits (Conventional Commits)

Format : `<type>(<scope>): <description>`

### Types
- **feat** : Nouvelle fonctionnalité
- **fix** : Correction de bug
- **docs** : Documentation uniquement
- **style** : Formatage, syntaxe
- **refactor** : Refactoring sans changement fonctionnel
- **test** : Ajout/modification de tests
- **chore** : Maintenance (dépendances, config)
- **ci** : Modifications CI/CD
- **devops** : Infrastructure, Docker, déploiement

### Exemples
```bash
feat(api): add JWT authentication middleware
fix(docker): resolve volume path inconsistencies  
docs(readme): add setup instructions and architecture
ci(lint): add ESLint blocking quality gate
devops(nginx): configure reverse proxy for production
test(auth): add unit tests for login endpoint
Workflow de Travail
Créer une branche depuis main

bash
git checkout -b feature/nouvelle-fonctionnalite
Développer avec commits atomiques

bash
git add .
git commit -m "feat(users): add user profile endpoint"
Push et créer une Pull Request

bash
git push origin feature/nouvelle-fonctionnalite
Review + Merge vers main après validation CI