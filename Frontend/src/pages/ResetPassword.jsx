import React, { useState, useEffect } from "react";
import styles from "../style/style.ts";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function ResetPassword() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [verifying, setVerifying] = useState(true);

  // Vérifier le token au chargement
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get("token");

    if (!tokenParam) {
      setTokenValid(false);
      setErrorMessage("Aucun token fourni");
      setVerifying(false);
      return;
    }

    setToken(tokenParam);

    // Vérifier la validité du token
    async function verifyToken() {
      try {
        const response = await fetch(
          `${API_URL}/api/auth/verify-reset-token/${tokenParam}`
        );
        const data = await response.json();

        setTokenValid(data.valid);
        if (!data.valid) {
          setErrorMessage("Ce lien de réinitialisation est invalide ou a expiré.");
        }
      } catch (error) {
        console.error("Erreur lors de la vérification du token:", error);
        setTokenValid(false);
        setErrorMessage("Impossible de vérifier le lien de réinitialisation.");
      } finally {
        setVerifying(false);
      }
    }

    verifyToken();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    if (password !== confirmPassword) {
      setErrorMessage("Les mots de passe ne correspondent pas");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          new_password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(
          "✅ Mot de passe modifié avec succès ! Redirection vers la page de connexion..."
        );

        // Rediriger vers login après 3 secondes
        setTimeout(() => {
          window.location.href = "/";
        }, 3000);
      } else {
        setErrorMessage(data.message || "Une erreur est survenue");
      }
    } catch (error) {
      console.error("Erreur lors de la réinitialisation:", error);
      setErrorMessage("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  function goToForgotPassword() {
    window.location.href = "/forgot-password";
  }

  if (verifying) {
    return (
      <div style={resetPasswordStyles.container}>
        <div style={resetPasswordStyles.card}>
          <p style={{ textAlign: "center" }}>Vérification du lien...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={resetPasswordStyles.container}>
      <div style={resetPasswordStyles.card}>
        <h1 style={resetPasswordStyles.title}>Nouveau mot de passe</h1>

        {!tokenValid && (
          <div style={resetPasswordStyles.alertError}>
            <p>
              <strong>⚠️ Lien invalide ou expiré</strong>
            </p>
            <p>
              Ce lien de réinitialisation n'est plus valide. Veuillez demander un
              nouveau lien.
            </p>
            <button
              onClick={goToForgotPassword}
              style={resetPasswordStyles.secondaryButton}
            >
              Demander un nouveau lien
            </button>
          </div>
        )}

        {successMessage && (
          <div style={resetPasswordStyles.alertSuccess}>{successMessage}</div>
        )}

        {errorMessage && tokenValid && (
          <div style={resetPasswordStyles.alertError}>{errorMessage}</div>
        )}

        {tokenValid && !successMessage && (
          <form onSubmit={handleSubmit} style={resetPasswordStyles.form}>
            <div style={resetPasswordStyles.formGroup}>
              <label htmlFor="password" style={resetPasswordStyles.label}>
                Nouveau mot de passe
              </label>
              <div style={resetPasswordStyles.passwordInput}>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 caractères"
                  required
                  disabled={loading}
                  minLength={8}
                  style={resetPasswordStyles.input}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  style={resetPasswordStyles.togglePassword}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              <small style={resetPasswordStyles.passwordHint}>
                Le mot de passe doit contenir au moins 8 caractères
              </small>
            </div>

            <div style={resetPasswordStyles.formGroup}>
              <label htmlFor="confirmPassword" style={resetPasswordStyles.label}>
                Confirmer le mot de passe
              </label>
              <div style={resetPasswordStyles.passwordInput}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Retapez votre mot de passe"
                  required
                  disabled={loading}
                  style={resetPasswordStyles.input}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                  style={resetPasswordStyles.togglePassword}
                >
                  {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            {password && confirmPassword && password !== confirmPassword && (
              <div style={resetPasswordStyles.validationError}>
                ⚠️ Les mots de passe ne correspondent pas
              </div>
            )}

            <button
              type="submit"
              disabled={
                loading ||
                password !== confirmPassword ||
                password.length < 8
              }
              style={{
                ...resetPasswordStyles.submitButton,
                ...(loading ||
                password !== confirmPassword ||
                password.length < 8
                  ? resetPasswordStyles.submitButtonDisabled
                  : {}),
              }}
            >
              {loading ? "Modification en cours..." : "Changer le mot de passe"}
            </button>
          </form>
        )}

        {!successMessage && (
          <div style={resetPasswordStyles.footerLinks}>
            <a
              href="/"
              style={resetPasswordStyles.backLink}
              onClick={(e) => {
                e.preventDefault();
                window.location.href = "/";
              }}
            >
              ← Retour à la connexion
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

// Styles pour la page ResetPassword
const resetPasswordStyles = {
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
    maxWidth: "500px",
  },
  title: {
    margin: "0 0 30px 0",
    color: "#333",
    fontSize: "28px",
    textAlign: "center",
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
  passwordInput: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  input: {
    width: "100%",
    padding: "12px",
    paddingRight: "50px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "14px",
    boxSizing: "border-box",
    transition: "border-color 0.3s",
  },
  togglePassword: {
    position: "absolute",
    right: "10px",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "18px",
    padding: "5px",
  },
  passwordHint: {
    display: "block",
    marginTop: "5px",
    color: "#666",
    fontSize: "12px",
  },
  validationError: {
    color: "#dc3545",
    fontSize: "14px",
    marginBottom: "15px",
    padding: "8px",
    backgroundColor: "#f8d7da",
    borderRadius: "4px",
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
  secondaryButton: {
    width: "100%",
    padding: "12px",
    background: "#6c757d",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "15px",
  },
  alertSuccess: {
    padding: "16px",
    borderRadius: "6px",
    marginBottom: "20px",
    fontSize: "14px",
    backgroundColor: "#d4edda",
    border: "1px solid #c3e6cb",
    color: "#155724",
  },
  alertError: {
    padding: "16px",
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
