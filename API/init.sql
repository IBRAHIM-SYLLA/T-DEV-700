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


