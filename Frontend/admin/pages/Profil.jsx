import React, { useEffect, useState } from "react";
import styles from "../../src/style/style.ts";
import UsersApi from "../../services/UsersApi";

export default function AdminProfil({ user, token, onUpdateUser, onBack }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: ""
  });
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    if (!user) return;
    setFormData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      phoneNumber: user.phoneNumber || ""
    });
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError("");
    setSaveMessage("");
    if (!user) return;
    setFormData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      phoneNumber: user.phoneNumber || ""
    });
  };

  const handleSave = async () => {
    const userId = user?.userId ?? user?.user_id;
    if (!userId) {
      setError("Impossible de déterminer l'identifiant utilisateur");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSaveMessage("");

      const updated = await UsersApi.update(
        userId,
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phoneNumber: formData.phoneNumber
        },
        { token }
      );

      if (onUpdateUser) onUpdateUser(updated);
      setIsEditing(false);
      setSaveMessage("Profil mis à jour avec succès !");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (err) {
      setError(err?.message || "Erreur lors de la mise à jour");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.dashboard.main}>
      <div style={styles.dashboard.contentContainer}>
        <div style={{ padding: "24px" }}>
          <div style={styles.profile.header}>
            <button style={styles.profile.backBtn} onClick={onBack}>
              ← Retour
            </button>
            <h2 style={styles.profile.title}>Mon profil (Admin)</h2>
          </div>

          {saveMessage && <div style={styles.profile.successMessage}>✓ {saveMessage}</div>}
          {error && <div style={styles.login.errorMessage}>{error}</div>}

          <div style={styles.profile.card}>
            <div style={styles.profile.cardHeader}>
              <div style={styles.profile.avatar}>👤</div>
              <div style={styles.profile.userInfo}>
                <h3 style={styles.profile.userName}>
                  {formData.firstName} {formData.lastName}
                </h3>
                <span style={styles.profile.userRole}>Admin</span>
              </div>
              {!isEditing && (
                <button style={styles.profile.editBtn} onClick={() => setIsEditing(true)}>
                  ✏️ Modifier
                </button>
              )}
            </div>

            <div style={styles.profile.form}>
              <div style={styles.profile.formRow}>
                <div style={styles.profile.formGroup}>
                  <label style={styles.profile.label}>Prénom</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    style={
                      isEditing
                        ? styles.profile.input
                        : styles.mergeStyles(styles.profile.input, styles.profile.inputDisabled)
                    }
                  />
                </div>
                <div style={styles.profile.formGroup}>
                  <label style={styles.profile.label}>Nom</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    style={
                      isEditing
                        ? styles.profile.input
                        : styles.mergeStyles(styles.profile.input, styles.profile.inputDisabled)
                    }
                  />
                </div>
              </div>

              <div style={styles.profile.formGroup}>
                <label style={styles.profile.label}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  style={
                    isEditing
                      ? styles.profile.input
                      : styles.mergeStyles(styles.profile.input, styles.profile.inputDisabled)
                  }
                />
              </div>

              <div style={styles.profile.formGroup}>
                <label style={styles.profile.label}>Téléphone</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  style={
                    isEditing
                      ? styles.profile.input
                      : styles.mergeStyles(styles.profile.input, styles.profile.inputDisabled)
                  }
                />
              </div>
            </div>

            {isEditing && (
              <div style={styles.profile.actions}>
                <button type="button" style={styles.profile.cancelBtn} onClick={handleCancel} disabled={saving}>
                  Annuler
                </button>
                <button type="button" style={styles.profile.saveBtn} onClick={handleSave} disabled={saving}>
                  {saving ? "Sauvegarde..." : "Sauvegarder"}
                </button>
              </div>
            )}
          </div>

          <div style={styles.profile.infoCard}>
            <div style={styles.profile.infoTitle}>Informations du compte</div>
            <div style={styles.profile.infoRow}>
              <span style={styles.profile.infoLabel}>Rôle</span>
              <span style={styles.profile.infoValue}>{user?.role || "super_admin"}</span>
            </div>
            <div style={styles.profile.infoRow}>
              <span style={styles.profile.infoLabel}>ID</span>
              <span style={styles.profile.infoValue}>{user?.userId ?? user?.user_id ?? "—"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
