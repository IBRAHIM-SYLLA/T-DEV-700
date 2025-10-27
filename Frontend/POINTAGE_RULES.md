# 📋 Règles de Pointage - TimeTrack Pro

## 🕘 Horaires de Travail

### Horaires Standard
- **Début de journée :** 9h00
- **Fin de journée :** 18h00  
- **Pause déjeuner :** 12h00 - 14h00 (non comptabilisée)
- **Durée quotidienne :** 8 heures (9h-12h + 14h-18h)

### Système de Tolérance
- **Tolérance d'arrivée :** 5 minutes après 9h00
- **À l'heure :** Pointage entre 7h00 et 9h05
- **Retard :** Pointage après 9h05

## 📊 Statuts de Ponctualité

### Statuts Possibles
| Statut | Description | Plage Horaire |
|--------|-------------|---------------|
| **À l'heure** | Arrivée avant 9h05 | 7h00 - 9h05 |
| **Retard (Xmin)** | Arrivée après la tolérance | 9h06 - 11h59 |
| **Pause déjeuner** | Pointage pendant la pause | 12h00 - 13h59 |
| **Reprise après pause** | Retour de pause déjeuner | 14h00 - 18h00 |
| **Hors horaires** | Pointage en dehors des heures | 18h01 - 6h59 |
| **Absent** | Aucun pointage enregistré | - |

## ⚙️ Logique Métier

### Calcul des Retards
- **Base de calcul :** 9h05 (heure limite avec tolérance)
- **Formule :** `Minutes de retard = Heure de pointage - 9h05`
- **Exemple :** Pointage à 9h15 = Retard de 10 minutes

### Gestion des Pauses
- **12h00 - 14h00 :** Période de pause déjeuner
- **Non comptabilisée :** Les pointages pendant cette période ne comptent pas dans le temps de travail
- **Reprise automatique :** Le comptage reprend automatiquement après 14h00

### Heures Supplémentaires
- **Seuil :** Au-delà de 8 heures quotidiennes
- **Calcul :** `Heures sup = Temps total travaillé - 8 heures`
- **Pause déjeuner exclue :** La pause de 12h-14h n'est jamais comptabilisée

## 🔧 Fonctionnalités Techniques

### Alertes Informatives
Le système affiche des messages contextuels selon le statut :
- **Hors horaires :** Avertissement sur les heures de travail
- **Pause déjeuner :** Information sur la période de pause
- **Retard :** Rappel des horaires et de la tolérance

### Stockage des Données
- **LocalStorage :** Sauvegarde locale des sessions
- **Format :** JSON avec horodatage précis
- **Persistance :** Données conservées entre les sessions

### Calculs Automatiques
- **Durée des sessions :** Calcul automatique arrivée/départ
- **Temps quotidien :** Somme de toutes les sessions
- **Statut de ponctualité :** Évaluation en temps réel

## 📱 Interface Utilisateur

### Affichage en Temps Réel
- **Horloge :** Mise à jour chaque seconde
- **Statut :** Présent/Absent en temps réel
- **Compteurs :** Heures travaillées aujourd'hui

### Feedback Utilisateur
- **Alertes :** Confirmation de pointage avec statut
- **Couleurs :** Codes visuels pour les statuts
- **Badges :** Indicateurs dans les résumés

## 🎯 Exemples Pratiques

### Scénarios Typiques

**Journée Standard :**
- `8h55` → À l'heure
- `12h00` → Pause déjeuner  
- `14h00` → Reprise après pause
- `18h00` → Fin de journée

**Journée avec Retard :**
- `9h15` → Retard (10min)
- `12h00` → Pause déjeuner
- `14h00` → Reprise après pause  
- `18h10` → Heure supplémentaire

**Pointage Hors Horaires :**
- `20h08` → Hors horaires (comme dans votre exemple)
- `6h30` → Hors horaires
- `19h30` → Hors horaires

---

*Ce document définit les règles métier du système de pointage TimeTrack Pro. Pour toute modification, veuillez mettre à jour ce fichier en conséquence.*