# Frontend — overview & tree

## Tech
- React + Vite
- App role-based: Employee / Manager / Super Admin
- Services `Frontend/services/*` pour communiquer avec l’API

## Auth (important)
- Login via `AuthApi`
- Session persistée en `localStorage` (clé: `tm_auth`) dans `Frontend/src/App.jsx`
- Déconnexion = suppression de `tm_auth`

## Arborescence (principale)
```text
Frontend/
  admin/
    pages/
      dashboard/
        TableauDeBordRH.jsx
      employees/
        BaseSalaries.jsx
        AddOrEditSalarie.jsx
  manager/
    pages/
      ManagerDashboard.jsx
      Profil.jsx
  services/
    ApiClient.js          # fetch + baseURL (VITE_API_URL)
    AuthApi.js            # /api/auth
    UsersApi.js           # /api/users
    TeamsApi.js           # /api/teams
    ClocksApi.js          # /api/clocks + /api/users/:id/clocks
    AttendanceService.js  # calculs présence/retards/heures
    DataService.js        # mock (à éviter si possible)
  src/
    App.jsx               # routing par rôle + auth persistée
    main.jsx              # bootstrap React
    components/
      NavBar.jsx
    pages/
      Login.jsx
      EmployeeDashboard.jsx
      employee/
        Pointage.jsx      # pointer arrivée/départ (backend clocks)
        MonResume.jsx     # résumé semaine + mensuel (backend clocks)
        Historique.jsx    # historique + résumé mensuel (backend clocks)
        Profil.jsx
    style/
      style.ts
```

## Flux “présence / pointage”
- `Pointage.jsx` appelle `ClocksApi.toggle(userId)`
- Les dashboards (RH/Manager) chargent `ClocksApi.listForUser(userId)` et calculent:
  - `Présent` / `En retard` / `Absent`
  - stats mensuelles (heures, heures sup, retards)
  - export CSV (absences + émargements)

## Variables d’environnement (Docker)
- Dans `.env.docker`:
  - `FRONTEND_PORT=3000`
  - `VITE_API_URL=http://localhost:5001`

Pour le dev hors Docker, tu peux aussi définir `VITE_API_URL` dans un `.env` Vite côté `Frontend/`.
