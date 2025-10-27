# T-DEV-700 - TimeTrack Pro

## 🕰️ Système de Pointage Entreprise

Application de gestion des temps de travail avec système de pointage intelligent et suivi de ponctualité.

### 📋 Règles de Pointage

**Horaires de travail :** 9h00 - 18h00  
**Pause déjeuner :** 12h00 - 14h00 (non comptée)  
**Tolérance :** +5 minutes après 9h00  

### ⚡ Statuts Automatiques
- **À l'heure** : Pointage avant 9h05
- **Retard (Xmin)** : Pointage après 9h05 avec calcul précis
- **Pause déjeuner** : Pointage entre 12h-14h
- **Hors horaires** : Pointage en dehors de 9h-18h

### 📁 Documentation Complète
Voir [POINTAGE_RULES.md](Frontend/POINTAGE_RULES.md) pour les règles détaillées.

## 🚀 Démarrage Rapide

```bash
# Frontend
cd Frontend
npm install
npm run dev

# Backend
cd API  
npm install
npm run dev
```