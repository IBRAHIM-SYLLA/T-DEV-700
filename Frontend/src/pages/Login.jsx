import React, { useState } from "react";
import "../style/Login.css";

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
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-container">
            <span className="logo-icon">🕰</span>
            <h1 className="app-title">TimeTrack Pro</h1>
          </div>
          <p className="app-subtitle">Système de pointage entreprise</p>
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Identifiant</label>
            <input
              type="text"
              className="input-field"
              placeholder="Votre identifiant"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label className="input-label">Mot de passe</label>
            <input
              type="password"
              className="input-field"
              placeholder="Votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button 
              type="button" 
              className="forgot-password-btn"
              onClick={() => alert("Fonctionnalité à venir")}
            >
              Mot de passe oublié ?
            </button>
          </div>
          <button type="submit" className="login-button">
            Se connecter
          </button>
        </form>
        {error && <div className="error-message">{error}</div>}
        <div className="demo-accounts">
          <p className="demo-title">Comptes de démonstration :</p>
          <div className="demo-list">
            {demoAccounts.map((acc) => (
              <p key={acc.role} className="demo-item">
                <strong>{acc.role}:</strong> {acc.username} / {acc.password}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}