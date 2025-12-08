# 📊 DataService - Guide d'utilisation

## 📖 Vue d'ensemble

Le `DataService.js` est un service qui centralise l'accès aux données de l'application. Il agit comme une couche d'abstraction entre les composants React et les sources de données (actuellement mockées, mais préparées pour une vraie API).

## 🎯 Objectifs

- ✅ Centraliser la logique d'accès aux données
- ✅ Simuler des appels API réels (avec délai)
- ✅ Faciliter la transition vers une vraie API backend
- ✅ Fournir des méthodes utiles et réutilisables
- ✅ Garder les composants propres et focalisés sur l'affichage

---

## 📁 Structure des données

### Fichiers
```
Frontend/src/
  ├── data/
  │   └── mockData.json          # Données mockées (teams, users, schedules, clocks)
  └── services/
      └── DataService.js          # Service d'accès aux données
```

### Données disponibles dans `mockData.json`

- **teams** : Équipes de l'entreprise
- **users** : Utilisateurs (admin, managers, employees)
- **work_schedules** : Plannings de travail par jour
- **clocks** : Historique des pointages (arrivée/départ)

---

## 🚀 Utilisation

### Import du service

```javascript
import DataService from '../services/DataService';
```

### Exemple dans un composant React

```javascript
import React, { useState, useEffect } from 'react';
import DataService from '../../src/services/DataService';

function ManagerDashboard({ user }) {
  const [stats, setStats] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Récupérer les statistiques de l'équipe
      const teamStats = await DataService.getTeamStats(1);
      
      // Récupérer les employés du manager
      const teamEmployees = await DataService.getManagerEmployees(user.user_id);
      
      // Récupérer les pointages en attente
      const pending = await DataService.getPendingClocks(1);
      
      setStats(teamStats);
      setEmployees(teamEmployees);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div>
      <h2>📊 Statistiques</h2>
      <p>Total employés : {stats?.totalMembers}</p>
      <p>Présents aujourd'hui : {stats?.presentToday}</p>
      <p>En retard : {stats?.lateToday}</p>
      
      <h2>👥 Mon équipe</h2>
      {employees.map(emp => (
        <div key={emp.user_id}>
          {emp.first_name} {emp.last_name}
        </div>
      ))}
    </div>
  );
}

export default ManagerDashboard;
```

---

## 📚 API du DataService

### 🏢 Gestion des équipes (Teams)

| Méthode | Description | Paramètres | Retour |
|---------|-------------|------------|--------|
| `getAllTeams()` | Récupère toutes les équipes | - | `Array<Team>` |
| `getTeamById(teamId)` | Récupère une équipe par ID | `teamId: number` | `Team` |
| `getTeamsByManagerId(managerId)` | Récupère les équipes d'un manager | `managerId: number` | `Array<Team>` |

### 👥 Gestion des utilisateurs (Users)

| Méthode | Description | Paramètres | Retour |
|---------|-------------|------------|--------|
| `getAllUsers()` | Récupère tous les utilisateurs | - | `Array<User>` |
| `getUserById(userId)` | Récupère un utilisateur par ID | `userId: number` | `User` |
| `getUsersByTeamId(teamId)` | Récupère les membres d'une équipe | `teamId: number` | `Array<User>` |
| `getUsersByRole(role)` | Récupère les utilisateurs par rôle | `role: string` | `Array<User>` |

### 📅 Gestion des plannings (Work Schedules)

| Méthode | Description | Paramètres | Retour |
|---------|-------------|------------|--------|
| `getAllSchedules()` | Récupère tous les plannings | - | `Array<Schedule>` |
| `getSchedulesByUserId(userId)` | Récupère le planning d'un utilisateur | `userId: number` | `Array<Schedule>` |
| `getScheduleByUserIdAndDay(userId, day)` | Récupère le planning d'un jour spécifique | `userId: number, day: string` | `Schedule` |

### ⏰ Gestion des pointages (Clocks)

| Méthode | Description | Paramètres | Retour |
|---------|-------------|------------|--------|
| `getAllClocks()` | Récupère tous les pointages | - | `Array<Clock>` |
| `getClocksByUserId(userId)` | Récupère les pointages d'un utilisateur | `userId: number` | `Array<Clock>` |
| `getClocksByTeamId(teamId)` | Récupère les pointages d'une équipe | `teamId: number` | `Array<Clock>` |
| `getPendingClocks(teamId)` | Récupère les pointages en attente (sans départ) | `teamId: number` | `Array<Clock>` |

### 📊 Statistiques

| Méthode | Description | Paramètres | Retour |
|---------|-------------|------------|--------|
| `getTeamStats(teamId)` | Calcule les stats d'une équipe | `teamId: number` | `Object` |
| `getUserStats(userId)` | Calcule les stats d'un utilisateur | `userId: number` | `Object` |

### 👨‍💼 Fonctions Manager

| Méthode | Description | Paramètres | Retour |
|---------|-------------|------------|--------|
| `getManagerTeams(managerId)` | Récupère toutes les équipes d'un manager | `managerId: number` | `Array<Team>` |
| `getManagerEmployees(managerId)` | Récupère tous les employés d'un manager | `managerId: number` | `Array<User>` |

---

## 📊 Exemples de retour

### `getTeamStats(teamId)`
```javascript
{
  totalMembers: 2,
  presentToday: 1,
  lateToday: 0,
  absentToday: 1,
  pendingValidations: 2
}
```

### `getUserStats(userId)`
```javascript
{
  totalHours: 152.5,
  totalDays: 20,
  lateCount: 3,
  currentMonth: {
    hours: 152.5,
    days: 20
  }
}
```

---

## 🔄 Migration vers une vraie API

Lorsque vous serez prêt à connecter une vraie API, il suffit de modifier les méthodes du DataService :

### Avant (Mock)
```javascript
async getUsersByTeamId(teamId) {
  await this.delay();
  return mockData.users.filter(u => u.team_id === teamId);
}
```

### Après (API)
```javascript
async getUsersByTeamId(teamId) {
  const response = await fetch(`${API_URL}/teams/${teamId}/users`);
  if (!response.ok) throw new Error('Erreur API');
  return response.json();
}
```

**Vos composants ne changent pas ! 🎉**

---

## ⚠️ Bonnes pratiques

1. **Toujours utiliser `async/await`**
```javascript
// ✅ Correct
const data = await DataService.getUsersByTeamId(1);

// ❌ Éviter
DataService.getUsersByTeamId(1).then(data => ...);
```

2. **Gérer les erreurs**
```javascript
try {
  const data = await DataService.getTeamStats(1);
  setStats(data);
} catch (error) {
  console.error('Erreur:', error);
  setError('Impossible de charger les données');
}
```

3. **Utiliser dans `useEffect` pour le chargement initial**
```javascript
useEffect(() => {
  const loadData = async () => {
    const data = await DataService.getManagerEmployees(managerId);
    setEmployees(data);
  };
  loadData();
}, [managerId]);
```

---

## 🎓 Cas d'usage par page Manager

### 📊 Tableau de bord
```javascript
const stats = await DataService.getTeamStats(teamId);
const pending = await DataService.getPendingClocks(teamId);
```

### 👥 Mon équipe
```javascript
const employees = await DataService.getManagerEmployees(managerId);
```

### 📈 Statistiques
```javascript
const teamClocks = await DataService.getClocksByTeamId(teamId);
const userStats = await DataService.getUserStats(userId);
```

### ✅ Émargements
```javascript
const pending = await DataService.getPendingClocks(teamId);
```

### 📅 Plannings
```javascript
const schedules = await DataService.getSchedulesByUserId(userId);
```

---

## 🛠️ Personnalisation

Pour ajouter de nouvelles méthodes au DataService :

1. Ouvrir `Frontend/src/services/DataService.js`
2. Ajouter votre méthode dans la classe
3. Suivre le pattern existant (async + delay)

```javascript
async getMaNouvelleFonction(param) {
  await this.delay();
  // Votre logique ici
  return result;
}
```

---

## 📞 Support

Pour toute question ou problème :
- Consultez les exemples ci-dessus
- Vérifiez que `mockData.json` contient les données nécessaires
- Assurez-vous d'utiliser `async/await` correctement

---

## 🚀 Prochaines étapes

1. ✅ Créer les composants Manager (Dashboard, Mon équipe, etc.)
2. ✅ Utiliser le DataService dans chaque composant
3. ⏳ Plus tard : Remplacer par de vrais appels API

**Le DataService est prêt à l'emploi ! Bon développement ! 🎉**
