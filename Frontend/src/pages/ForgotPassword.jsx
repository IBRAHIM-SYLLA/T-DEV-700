import React, { useState } from "react";
import styles from "../style/style.ts";

const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Si on est dans le navigateur, utiliser l'hôte actuel
  if (typeof window !== 'undefined') {
    return window.location.origin.replace(':3000', ':5001');
  }
  return 'http://localhost:5001';
};

const API_URL = getApiUrl();

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    if (!email) {
      setErrorMessage("Veuillez entrer votre email");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(
          "Si cet email existe dans notre système, vous recevrez un lien de réinitialisation dans quelques instants."
        );
        setEmail("");

        // Rediriger vers login après 5 secondes
        setTimeout(() => {
          window.location.href = "/";
        }, 5000);
      } else {
        setErrorMessage(data.message || "Une erreur est survenue");
      }
    } catch (error) {
      console.error("Erreur lors de la demande:", error);
      setErrorMessage("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={forgotPasswordStyles.container}>
      <div style={forgotPasswordStyles.card}>
        <div style={forgotPasswordStyles.header}>
          <h1 style={forgotPasswordStyles.title}>Mot de passe oublié</h1>
          <p style={forgotPasswordStyles.subtitle}>
            Entrez votre email pour recevoir un lien de réinitialisation
          </p>
        </div>

        {successMessage && (
          <div style={forgotPasswordStyles.alertSuccess}>
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div style={forgotPasswordStyles.alertError}>
            {errorMessage}
          </div>
        )}

        {!successMessage && (
          <form onSubmit={handleSubmit} style={forgotPasswordStyles.form}>
            <div style={forgotPasswordStyles.formGroup}>
              <label htmlFor="email" style={forgotPasswordStyles.label}>
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre.email@example.com"
                required
                disabled={loading}
                style={forgotPasswordStyles.input}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...forgotPasswordStyles.submitButton,
                ...(loading ? forgotPasswordStyles.submitButtonDisabled : {}),
              }}
            >
              {loading ? "Envoi en cours..." : "Envoyer le lien"}
            </button>
          </form>
        )}

        <div style={forgotPasswordStyles.footerLinks}>
          <a
            href="/"
            style={forgotPasswordStyles.backLink}
            onClick={(e) => {
              e.preventDefault();
              window.location.href = "/";
            }}
          >
            ← Retour à la connexion
          </a>
        </div>
      </div>
    </div>
  );
}

// Styles pour la page ForgotPassword
const forgotPasswordStyles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "20px",
  },
  card: {
    background: "white",
    padding: "40px",
    borderRadius: "12px",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
    width: "100%",
    maxWidth: "450px",
  },
  header: {
    marginBottom: "30px",
  },
  title: {
    margin: "0 0 10px 0",
    color: "#333",
    fontSize: "28px",
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    color: "#666",
    margin: "0",
    fontSize: "14px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  formGroup: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    color: "#333",
    fontWeight: "500",
  },
  input: {
    width: "100%",
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "14px",
    boxSizing: "border-box",
    transition: "border-color 0.3s",
  },
  submitButton: {
    width: "100%",
    padding: "12px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  submitButtonDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
  alertSuccess: {
    padding: "12px 16px",
    borderRadius: "6px",
    marginBottom: "20px",
    fontSize: "14px",
    backgroundColor: "#d4edda",
    border: "1px solid #c3e6cb",
    color: "#155724",
  },
  alertError: {
    padding: "12px 16px",
    borderRadius: "6px",
    marginBottom: "20px",
    fontSize: "14px",
    backgroundColor: "#f8d7da",
    border: "1px solid #f5c6cb",
    color: "#721c24",
  },
  footerLinks: {
    marginTop: "20px",
    textAlign: "center",
  },
  backLink: {
    color: "#667eea",
    textDecoration: "none",
    fontSize: "14px",
    transition: "color 0.3s",
  },
};
