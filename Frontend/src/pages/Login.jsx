import React, { useState } from "react";
import styles from "../style/style.ts";

const demoAccounts = [
  { role: "RH", username: "rh", password: "rh123" },
  { role: "Manager", username: "manager", password: "manager123" },
  { role: "Salarié", username: "salarie", password: "salarie123" }
];

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const user = demoAccounts.find(
      (u) => u.username === username && u.password === password
    );
    if (user) {
      setError("");
      onLogin(user);
    } else {
      setError("Identifiants incorrects");
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
            <label style={styles.login.inputLabel}>Identifiant</label>
            <input
              type="text"
              style={styles.login.inputField}
              placeholder="Votre identifiant"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div style={styles.login.formGroup}>
            <label style={styles.login.inputLabel}>Mot de passe</label>
            <input
              type="password"
              style={styles.login.inputField}
              placeholder="Votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
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
            {demoAccounts.map((acc) => (
              <p key={acc.role} style={styles.login.demoItem}>
                <strong>{acc.role}:</strong> {acc.username} / {acc.password}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}