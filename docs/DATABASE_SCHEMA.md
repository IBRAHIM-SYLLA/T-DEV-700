# Schéma de Base de Données

## Tables Principales

### users
```sql
- id (INT, PK, AUTO_INCREMENT)
- username (VARCHAR)
- email (VARCHAR, UNIQUE)
- password (VARCHAR) -- bcrypt hash
- role (ENUM: 'employee', 'manager', 'admin')
- created_at (TIMESTAMP)
```
### teams
```sql
- id (INT, PK)
- name (VARCHAR)
- manager_id (INT, FK → users.id)
- created_at (TIMESTAMP)
```
### clocks
```sql
- id (INT, PK)
- user_id (INT, FK → users.id)
- time (TIMESTAMP)
- status (BOOLEAN) -- true=clock_in, false=clock_out
```
### working_times
```sql
- id (INT, PK)
- user_id (INT, FK → users.id)
- start (TIMESTAMP)
- end (TIMESTAMP)
- duration (INT) -- en minutes
```

##Relations
- Un utilisateur peut avoir plusieurs clocks
- Un manager gère une équipe (team)
- Les working_times sont calculés à partir des clocks