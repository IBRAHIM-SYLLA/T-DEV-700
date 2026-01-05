-- ============================================================
-- SCRIPT D'INITIALISATION DE LA BASE DE DONNÉES - TIME MANAGER
-- ============================================================

-- 1. Création de la table TEAMS
CREATE TABLE IF NOT EXISTS teams (
    team_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    manager_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Création de la table USERS
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone_number VARCHAR(20) NULL,
    password VARCHAR(255) NOT NULL,
    team_id INTEGER NULL,
    role ENUM('super_admin', 'manager', 'employee') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_teams FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE SET NULL
);

-- 3. Ajout de la contrainte FK sur TEAMS (pour le manager)
-- On le fait après la création de users pour éviter l'erreur de référence circulaire
ALTER TABLE teams
ADD CONSTRAINT fk_teams_manager FOREIGN KEY (manager_id) REFERENCES users(user_id) ON DELETE SET NULL;

-- 4. Création de la table CLOCKS (Pointages)
CREATE TABLE IF NOT EXISTS clocks (
    clock_id INT AUTO_INCREMENT PRIMARY KEY,
    arrival_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    departure_time TIMESTAMP NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_clocks_users FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 5. Création de la table WORK_SCHEDULES (Planning théorique)
CREATE TABLE IF NOT EXISTS work_schedules (
    schedule_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    /*day_of_week ENUM('wednesday', 'thursday', 'friday', 'saturday', 'sunday') NOT NULL,*/
    schedule_date DATE , -- Nouvelle colonne pour la date complète
    expected_arrival_time TIME NULL,
    expected_departure_time TIME NULL,
    is_working_day BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_schedules_users FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_day (user_id, schedule_date)
);

-- ============================================
-- INSERTION DES DONNÉES (SEEDING)
-- ============================================

-- Équipes
INSERT INTO teams (name, description, manager_id) VALUES 
('Development Team', 'Software development team', NULL),
('Marketing Team', 'Marketing and communication team', NULL);

-- Utilisateurs
INSERT INTO users (first_name, last_name, email, phone_number, password, team_id, role) VALUES
('Admin', 'System', 'admin@timemanager.com', '+33612345678', 'admin123', NULL, 'super_admin'),
('Alice', 'Dupont', 'alice.dupont@timemanager.com', '+33623456789', 'password123', 1, 'manager'),
('Bruno', 'Martin', 'bruno.martin@timemanager.com', '+33634567890', 'securepass', 1, 'employee'),
('Claire', 'Bernard', 'claire.bernard@timemanager.com', '+33645678901', 'azerty2025', 1, 'employee'),
('Son', 'Goku', 'songoku@timemanager.com', '+33656789012', 'kamehameha', 2, 'employee'),
('David', 'Leroy', 'david.leroy@timemanager.com', '+33667890123', 'mypassword', 2, 'employee');

-- Mise à jour du manager des équipes (Alice est manager des deux équipes pour le test)
UPDATE teams SET manager_id = 2 WHERE team_id IN (1, 2);

-- Plannings : Bruno (Lun-Ven 9h-18h) - ADAPTÉ AUX DATES SPÉCIFIQUES
INSERT INTO work_schedules (user_id, schedule_date, expected_arrival_time, expected_departure_time, is_working_day) VALUES
(3, '2025-12-01', '09:00:00', '18:00:00', TRUE),
(3, '2025-12-02', '09:00:00', '18:00:00', TRUE),
(3, '2025-12-03', '09:00:00', '18:00:00', TRUE),
(3, '2025-12-04', '09:00:00', '18:00:00', TRUE),
(3, '2025-12-05', '09:00:00', '18:00:00', TRUE),
(3, '2025-12-06', NULL, NULL, FALSE), -- Samedi
(3, '2025-12-07', NULL, NULL, FALSE); -- Dimanche

-- Plannings : Claire (Lun-Jeu 8h-17h, Ven 8h-12h) - ADAPTÉ AUX DATES SPÉCIFIQUES
INSERT INTO work_schedules (user_id, schedule_date, expected_arrival_time, expected_departure_time, is_working_day) VALUES
(4, '2025-12-01', '08:00:00', '17:00:00', TRUE),
(4, '2025-12-02', '08:00:00', '17:00:00', TRUE),
(4, '2025-12-03', '08:00:00', '17:00:00', TRUE),
(4, '2025-12-04', '08:00:00', '17:00:00', TRUE),
(4, '2025-12-05', '08:00:00', '12:00:00', TRUE),
(4, '2025-12-06', NULL, NULL, FALSE),
(4, '2025-12-07', NULL, NULL, FALSE);

-- Plannings : Goku (Mar-Sam 10h-19h) - ADAPTÉ AUX DATES SPÉCIFIQUES
INSERT INTO work_schedules (user_id, schedule_date, expected_arrival_time, expected_departure_time, is_working_day) VALUES
(5, '2025-12-02', '10:00:00', '19:00:00', TRUE),
(5, '2025-12-03', '10:00:00', '19:15:00', TRUE),
(5, '2025-12-04', '10:15:00', '19:30:00', TRUE),
(5, '2025-12-05', '10:05:00', '19:00:00', TRUE),
(5, '2025-12-06', '10:00:00', '19:20:00', TRUE),
(5, '2025-12-07', NULL, NULL, FALSE); -- Dimanche

-- Index pour optimisation
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_schedules_user_day ON work_schedules(user_id, schedule_date);

-- ============================================
-- INSERTION DES POINTAGES (CLOCKS)
-- ============================================

-- Bruno
INSERT INTO clocks (user_id, arrival_time, departure_time, created_at, updated_at) VALUES
(3, '2025-11-24 09:15:00', '2025-11-24 18:30:00', '2025-11-24 09:15:00', '2025-11-24 18:30:00'),
(3, '2025-11-25 08:55:00', '2025-11-25 18:00:00', '2025-11-25 08:55:00', '2025-11-25 18:00:00'),
(3, '2025-11-26 09:20:00', '2025-11-26 18:15:00', '2025-11-26 09:20:00', '2025-12-08 18:15:00'),
(3, '2025-11-27 09:00:00', '2025-11-27 17:50:00', '2025-11-27 09:00:00', '2025-11-27 17:50:00'),
(3, '2025-11-28 09:05:00', '2025-11-28 18:10:00', '2025-11-28 09:05:00', '2025-11-28 18:10:00'),
(3, '2025-12-01 09:30:00', '2025-12-01 18:20:00', '2025-12-01 09:30:00', '2025-12-01 18:20:00'),
(3, '2025-12-02 09:10:00', '2025-12-02 18:00:00', '2025-12-02 09:10:00', '2025-12-02 18:00:00'),
(3, '2025-12-03 09:00:00', '2025-12-03 17:55:00', '2025-12-03 09:00:00', '2025-12-03 17:55:00'),
(3, '2025-12-04 09:45:00', '2025-12-04 18:30:00', '2025-12-04 09:45:00', '2025-12-04 18:30:00'),
(3, '2025-12-05 09:00:00', NULL, '2025-12-05 09:00:00', NOW());

-- Claire
INSERT INTO clocks (user_id, arrival_time, departure_time, created_at, updated_at) VALUES
(4, '2025-11-24 08:00:00', '2025-11-24 17:00:00', '2025-11-24 08:00:00', '2025-11-24 17:00:00'),
(4, '2025-11-25 08:30:00', '2025-11-25 17:30:00', '2025-11-25 08:30:00', '2025-11-25 17:30:00'),
(4, '2025-11-26 08:15:00', '2025-11-26 17:15:00', '2025-11-26 08:15:00', '2025-11-26 17:15:00'),
(4, '2025-11-27 08:05:00', '2025-11-27 17:05:00', '2025-11-27 08:05:00', '2025-11-27 17:05:00'),
(4, '2025-11-28 08:00:00', '2025-11-28 12:00:00', '2025-11-28 08:00:00', '2025-11-28 12:00:00'),
(4, '2025-12-01 08:10:00', '2025-12-01 17:00:00', '2025-12-01 08:10:00', '2025-12-01 17:00:00'),
(4, '2025-12-02 08:00:00', '2025-12-02 17:00:00', '2025-12-02 08:00:00', '2025-12-02 17:00:00'),
(4, '2025-12-03 08:45:00', '2025-12-03 17:45:00', '2025-12-03 08:45:00', '2025-12-03 17:45:00'),
(4, '2025-12-04 08:00:00', '2025-12-04 17:00:00', '2025-12-04 08:00:00', '2025-12-04 17:00:00'),
(4, '2025-12-05 08:30:00', '2025-12-05 12:00:00', '2025-12-05 08:30:00', '2025-12-05 12:00:00');

-- Goku
INSERT INTO clocks (user_id, arrival_time, departure_time, created_at, updated_at) VALUES
(5, '2025-11-25 10:20:00', '2025-11-25 19:00:00', '2025-11-25 10:20:00', '2025-11-25 19:00:00'),
(5, '2025-11-26 10:00:00', '2025-11-26 19:15:00', '2025-11-26 10:00:00', '2025-11-26 19:15:00'),
(5, '2025-11-27 10:15:00', '2025-11-27 19:30:00', '2025-11-27 10:15:00', '2025-11-27 19:30:00'),
(5, '2025-11-28 10:05:00', '2025-11-28 19:00:00', '2025-11-28 10:05:00', '2025-11-28 19:00:00'),
(5, '2025-11-29 10:00:00', '2025-11-29 19:20:00', '2025-11-29 10:00:00', '2025-11-29 19:20:00'),
(5, '2025-12-02 10:30:00', '2025-12-02 19:00:00', '2025-12-02 10:30:00', '2025-12-02 19:00:00'),
(5, '2025-12-03 10:00:00', '2025-12-03 19:10:00', '2025-12-03 10:00:00', '2025-12-03 19:10:00'),
(5, '2025-12-04 10:10:00', '2025-12-04 19:00:00', '2025-12-04 10:10:00', '2025-12-04 19:00:00'),
(5, '2025-12-05 10:00:00', '2025-12-05 19:15:00', '2025-12-05 10:00:00', '2025-12-05 19:15:00'),
(5, '2025-12-06 10:00:00', NULL, '2025-12-06 10:00:00', NOW());

-- ============================================
-- VUE POUR LES KPIS
-- ============================================

CREATE OR REPLACE VIEW DailyWorkingHours AS
SELECT 
    c.user_id,
    u.first_name, 
    u.last_name, 
    t.name as team_name,
    c.arrival_time, 
    c.departure_time,
    w.expected_arrival_time,
    w.expected_departure_time,
    w.schedule_date, 
    DAYNAME(c.arrival_time) as jour_reel, 
    YEARWEEK(c.arrival_time, 3) as semaine,
    MONTH(c.arrival_time) as mois, 
    CASE 
        WHEN TIMESTAMPDIFF(MINUTE, w.expected_arrival_time, TIME(c.arrival_time)) > 10 THEN TRUE 
        ELSE FALSE 
    END AS is_late_over_10min ,
    TIMESTAMPDIFF(MINUTE, w.expected_arrival_time, TIME(c.arrival_time)) as retard_minut
FROM clocks c 
JOIN users u ON c.user_id = u.user_id 
JOIN teams t ON t.team_id = u.team_id 
-- Jointure sur le user ET le jour de la semaine
JOIN work_schedules w ON w.user_id = c.user_id 
    AND DATE(c.arrival_time) = w.schedule_date
WHERE u.role = 'employee';