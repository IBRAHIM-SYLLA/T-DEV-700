-- Script d'initialisation de la base de données

CREATE TABLE IF NOT EXISTS teams (
    team_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    manager_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

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

ALTER TABLE teams
ADD CONSTRAINT fk_teams_manager FOREIGN KEY (manager_id) REFERENCES users(user_id) ON DELETE SET NULL;


CREATE TABLE IF NOT EXISTS clocks (
    clock_id INT AUTO_INCREMENT PRIMARY KEY,
    arrival_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    departure_time TIMESTAMP NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_clocks_users FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Table WORK_SCHEDULES: Planning hebdomadaire des horaires prévus (comme EduSign/EDSquare)
CREATE TABLE IF NOT EXISTS work_schedules (
    schedule_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    day_of_week ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday') NOT NULL,
    expected_arrival_time TIME NULL,
    expected_departure_time TIME NULL,
    is_working_day BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_schedules_users FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_day (user_id, day_of_week)
);


INSERT INTO teams (name, description, manager_id) VALUES 
('Development Team', 'Software development team', NULL),
('Marketing Team', 'Marketing and communication team', NULL);



INSERT INTO users (
    first_name, 
    last_name,
    email, 
    phone_number,
    password, 
    team_id, 
    role
) VALUES
('Admin', 'System', 'admin@timemanager.com', '+33612345678', 'admin123', NULL, 'super_admin'),
('Alice', 'Dupont', 'alice.dupont@timemanager.com', '+33623456789', 'password123', NULL, 'manager'),
('Bruno', 'Martin', 'bruno.martin@timemanager.com', '+33634567890', 'securepass', 1, 'employee'),
('Claire', 'Bernard', 'claire.bernard@timemanager.com', '+33645678901', 'azerty2025', 1, 'employee'),
('Son', 'Goku', 'songoku@timemanager.com', '+33656789012', 'kamehameha', 2, 'employee'),
('David', 'Leroy', 'david.leroy@timemanager.com', '+33667890123', 'mypassword', 2, 'employee');

UPDATE teams SET manager_id = 2 WHERE team_id IN (1, 2);

-- Insertion des plannings hebdomadaires (horaires prévus)
-- Bruno: Lundi-Vendredi 9h-18h
INSERT INTO work_schedules (user_id, day_of_week, expected_arrival_time, expected_departure_time, is_working_day) VALUES
(3, 'monday', '09:00:00', '18:00:00', TRUE),
(3, 'tuesday', '09:00:00', '18:00:00', TRUE),
(3, 'wednesday', '09:00:00', '18:00:00', TRUE),
(3, 'thursday', '09:00:00', '18:00:00', TRUE),
(3, 'friday', '09:00:00', '18:00:00', TRUE),
(3, 'saturday', NULL, NULL, FALSE),
(3, 'sunday', NULL, NULL, FALSE);

-- Claire: Lundi-Vendredi 8h-17h (temps partiel)
INSERT INTO work_schedules (user_id, day_of_week, expected_arrival_time, expected_departure_time, is_working_day) VALUES
(4, 'monday', '08:00:00', '17:00:00', TRUE),
(4, 'tuesday', '08:00:00', '17:00:00', TRUE),
(4, 'wednesday', '08:00:00', '17:00:00', TRUE),
(4, 'thursday', '08:00:00', '17:00:00', TRUE),
(4, 'friday', '08:00:00', '12:00:00', TRUE),
(4, 'saturday', NULL, NULL, FALSE),
(4, 'sunday', NULL, NULL, FALSE);

-- Son Goku: Mardi-Samedi 10h-19h
INSERT INTO work_schedules (user_id, day_of_week, expected_arrival_time, expected_departure_time, is_working_day) VALUES
(5, 'monday', NULL, NULL, FALSE),
(5, 'tuesday', '10:00:00', '19:00:00', TRUE),
(5, 'wednesday', '10:00:00', '19:00:00', TRUE),
(5, 'thursday', '10:00:00', '19:00:00', TRUE),
(5, 'friday', '10:00:00', '19:00:00', TRUE),
(5, 'saturday', '10:00:00', '19:00:00', TRUE),
(5, 'sunday', NULL, NULL, FALSE);

-- Indexes for query optimization
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_schedules_user_day ON work_schedules(user_id, day_of_week);

-- ============================================
-- DONNÉES DE TEST : CLOCKS ( Pointages )
-- Avec des dates anciennes pour tester les KPIs
-- ============================================

-- Bruno (user_id = 3) - Semaine du 24-28 Nov
INSERT INTO clocks (user_id, arrival_time, departure_time, created_at, updated_at) VALUES
(3, '2025-11-24 09:15:00', '2025-11-24 18:30:00', '2025-11-24 09:15:00', '2025-11-24 18:30:00'),  -- Lundi - RETARD 15min
(3, '2025-11-25 08:55:00', '2025-11-25 18:00:00', '2025-11-25 08:55:00', '2025-11-25 18:00:00'),  -- Mardi - À L'HEURE
(3, '2025-11-26 09:20:00', '2025-11-26 18:15:00', '2025-11-26 09:20:00', '2025-11-26 18:15:00'),  -- Mercredi - RETARD 20min
(3, '2025-11-27 09:00:00', '2025-11-27 17:50:00', '2025-11-27 09:00:00', '2025-11-27 17:50:00'),  -- Jeudi - À L'HEURE
(3, '2025-11-28 09:05:00', '2025-11-28 18:10:00', '2025-11-28 09:05:00', '2025-11-28 18:10:00'),  -- Vendredi - À L'HEURE (limite)

-- Bruno - Semaine du 01-05 Déc
(3, '2025-12-01 09:30:00', '2025-12-01 18:20:00', '2025-12-01 09:30:00', '2025-12-01 18:20:00'),  -- Lundi - RETARD 30min
(3, '2025-12-02 09:10:00', '2025-12-02 18:00:00', '2025-12-02 09:10:00', '2025-12-02 18:00:00'),  -- Mardi - RETARD 10min
(3, '2025-12-03 09:00:00', '2025-12-03 17:55:00', '2025-12-03 09:00:00', '2025-12-03 17:55:00'),  -- Mercredi - À L'HEURE
(3, '2025-12-04 09:45:00', '2025-12-04 18:30:00', '2025-12-04 09:45:00', '2025-12-04 18:30:00'),  -- Jeudi - RETARD 45min
(3, '2025-12-05 09:00:00', NULL, '2025-12-05 09:00:00', NOW());                                   -- Vendredi - PRÉSENT (pas de départ)

-- Claire (user_id = 4) - Semaine du 24-28 Nov (8h-17h)
INSERT INTO clocks (user_id, arrival_time, departure_time, created_at, updated_at) VALUES
(4, '2025-11-24 08:00:00', '2025-11-24 17:00:00', '2025-11-24 08:00:00', '2025-11-24 17:00:00'),  -- Lundi - À L'HEURE
(4, '2025-11-25 08:30:00', '2025-11-25 17:30:00', '2025-11-25 08:30:00', '2025-11-25 17:30:00'),  -- Mardi - À L'HEURE
(4, '2025-11-26 08:15:00', '2025-11-26 17:15:00', '2025-11-26 08:15:00', '2025-11-26 17:15:00'),  -- Mercredi - À L'HEURE
(4, '2025-11-27 08:05:00', '2025-11-27 17:05:00', '2025-11-27 08:05:00', '2025-11-27 17:05:00'),  -- Jeudi - À L'HEURE
(4, '2025-11-28 08:00:00', '2025-11-28 12:00:00', '2025-11-28 08:00:00', '2025-11-28 12:00:00'),  -- Vendredi - À L'HEURE (demi-jour)

-- Claire - Semaine du 01-05 Déc
(4, '2025-12-01 08:10:00', '2025-12-01 17:00:00', '2025-12-01 08:10:00', '2025-12-01 17:00:00'),  -- Lundi - À L'HEURE
(4, '2025-12-02 08:00:00', '2025-12-02 17:00:00', '2025-12-02 08:00:00', '2025-12-02 17:00:00'),  -- Mardi - À L'HEURE
(4, '2025-12-03 08:45:00', '2025-12-03 17:45:00', '2025-12-03 08:45:00', '2025-12-03 17:45:00'),  -- Mercredi - À L'HEURE
(4, '2025-12-04 08:00:00', '2025-12-04 17:00:00', '2025-12-04 08:00:00', '2025-12-04 17:00:00'),  -- Jeudi - À L'HEURE
(4, '2025-12-05 08:30:00', '2025-12-05 12:00:00', '2025-12-05 08:30:00', '2025-12-05 12:00:00'),  -- Vendredi - À L'HEURE (demi-jour)

-- Son Goku (user_id = 5) - Horaires décalés (Mar-Sam 10h-19h) - Semaine du 25-29 Nov
INSERT INTO clocks (user_id, arrival_time, departure_time, created_at, updated_at) VALUES
(5, '2025-11-25 10:20:00', '2025-11-25 19:00:00', '2025-11-25 10:20:00', '2025-11-25 19:00:00'),  -- Mardi - RETARD 20min
(5, '2025-11-26 10:00:00', '2025-11-26 19:15:00', '2025-11-26 10:00:00', '2025-11-26 19:15:00'),  -- Mercredi - À L'HEURE
(5, '2025-11-27 10:15:00', '2025-11-27 19:30:00', '2025-11-27 10:15:00', '2025-11-27 19:30:00'),  -- Jeudi - RETARD 15min
(5, '2025-11-28 10:05:00', '2025-11-28 19:00:00', '2025-11-28 10:05:00', '2025-11-28 19:00:00'),  -- Vendredi - RETARD 5min
(5, '2025-11-29 10:00:00', '2025-11-29 19:20:00', '2025-11-29 10:00:00', '2025-11-29 19:20:00'),  -- Samedi - À L'HEURE

-- Son Goku - Semaine du 02-06 Déc
(5, '2025-12-02 10:30:00', '2025-12-02 19:00:00', '2025-12-02 10:30:00', '2025-12-02 19:00:00'),  -- Mardi - RETARD 30min
(5, '2025-12-03 10:00:00', '2025-12-03 19:10:00', '2025-12-03 10:00:00', '2025-12-03 19:10:00'),  -- Mercredi - À L'HEURE
(5, '2025-12-04 10:10:00', '2025-12-04 19:00:00', '2025-12-04 10:10:00', '2025-12-04 19:00:00'),  -- Jeudi - RETARD 10min
(5, '2025-12-05 10:00:00', '2025-12-05 19:15:00', '2025-12-05 10:00:00', '2025-12-05 19:15:00'),  -- Vendredi - À L'HEURE
(5, '2025-12-06 10:00:00', NULL, '2025-12-06 10:00:00', NOW());                                   -- Samedi - PRÉSENT (pas de départ)

-- David (user_id = 6) - On laisse sans pointages pour tester les cas vides

