import React, { useState } from "react";
import styles from "../style/style.ts";

// Database users based on init.sql
const databaseUsers = [
  { 
    userId: 1,
    firstName: "Admin", 
    lastName: "System", 
    email: "admin@timemanager.com", 
    phoneNumber: "+33612345678", 
    username: "admin@timemanager.com", 
    password: "admin123", 
    teamId: null, 
    role: "super_admin" 
  },
  { 
    userId: 2,
    firstName: "Alice", 
    lastName: "Dupont", 
    email: "alice.dupont@timemanager.com", 
    phoneNumber: "+33623456789", 
    username: "alice.dupont@timemanager.com", 
    password: "password123", 
    teamId: null, 
    role: "manager" 
  },
  { 
    userId: 3,
    firstName: "Bruno", 
    lastName: "Martin", 
    email: "bruno.martin@timemanager.com", 
    phoneNumber: "+33634567890", 
    username: "bruno.martin@timemanager.com", 
    password: "securepass", 
    teamId: 1, 
    role: "employee" 
  },
  { 
    userId: 4,
    firstName: "Claire", 
    lastName: "Bernard", 
    email: "claire.bernard@timemanager.com", 
    phoneNumber: "+33645678901", 
    username: "claire.bernard@timemanager.com", 
    password: "azerty2025", 
    teamId: 1, 
    role: "employee" 
  },
  { 
    userId: 5,
    firstName: "Son", 
    lastName: "Goku", 
    email: "songoku@timemanager.com", 
    phoneNumber: "+33656789012", 
    username: "songoku@timemanager.com", 
    password: "kamehameha", 
    teamId: 2, 
    role: "employee" 
  },
  { 
    userId: 6,
    firstName: "David", 
    lastName: "Leroy", 
    email: "david.leroy@timemanager.com", 
    phoneNumber: "+33667890123", 
    username: "david.leroy@timemanager.com", 
    password: "mypassword", 
    teamId: 2, 
    role: "employee" 
  }
];

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const user = databaseUsers.find(
      (u) => (u.username === username || u.email === username) && u.password === password
    );
    if (user) {
      setError("");
      // Save to localStorage for persistence
      localStorage.setItem('currentUser', JSON.stringify(user));
      onLogin(user);
    } else {
      setError("Email/identifiant ou mot de passe incorrect");
    }
  }

  return (
    <div style={styles.login.container}>
      <div style={styles.login.card}>
        <div style={styles.login.header}>
          <div style={styles.login.logoContainer}>
            <span style={styles.login.logoIcon}>🕰</span>
            <h1 style={styles.login.appTitle}>Time Manager</h1>
          </div>
          <p style={styles.login.appSubtitle}>Système de pointage entreprise</p>
        </div>
        <form style={styles.login.form} onSubmit={handleSubmit}>
          <div style={styles.login.formGroup}>
            <label htmlFor="username" style={styles.login.inputLabel}>Identifiant</label>
            <input
              id="username"
              name="username"
              type="text"
              style={styles.login.inputField}
              placeholder="Votre identifiant"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
          </div>
          <div style={styles.login.formGroup}>
            <label htmlFor="password" style={styles.login.inputLabel}>Mot de passe</label>
            <input
              id="password"
              name="password"
              type="password"
              style={styles.login.inputField}
              placeholder="Votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <button 
              type="button" 
              style={styles.login.forgotPasswordBtn}
              onClick={() => alert("Fonctionnalité à venir")}
            >
              Mot de passe oublié ?
            </button>
          </div>
          <button type="submit" style={styles.login.loginButton}>
            Se connecter
          </button>
        </form>
        {error && <div style={styles.login.errorMessage}>{error}</div>}
        <div style={styles.login.demoAccounts}>
          <p style={styles.login.demoTitle}>Comptes de démonstration :</p>
          <div style={styles.login.demoList}>
            <p style={styles.login.demoItem}>
              <strong>Super Admin:</strong> admin@timemanager.com / admin123
            </p>
            <p style={styles.login.demoItem}>
              <strong>Manager:</strong> alice.dupont@timemanager.com / password123
            </p>
            <p style={styles.login.demoItem}>
              <strong>Employé:</strong> bruno.martin@timemanager.com / securepass
            </p>
            <p style={styles.login.demoItem}>
              <strong>Employé:</strong> songoku@timemanager.com / kamehameha
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}