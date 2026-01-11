import React, { useState, useEffect } from "react";
import styles from "../../src/style/style.ts";
import UsersApi from "../../services/UsersApi";
import TeamsApi from "../../services/TeamsApi";
import { getCachedTeamNameForUser, getCachedTeamNameForTeam } from "../../services/teamCache";

export default function Profil({ user, token, onUpdateUser, onBack }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: ''
  });
  const [teamName, setTeamName] = useState("");
  const [managedTeams, setManagedTeams] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [saveMessage, setSaveMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const roleLabel = user?.role === "manager" ? "Manager" : "Employé";

  // Initialize form data with user info
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || user.first_name || '',
        lastName: user.lastName || user.last_name || '',
        email: user.email || user.username || '',
        phoneNumber: user.phoneNumber || user.phone_number || ''
      });
    }
  }, [user]);

  useEffect(() => {
    let cancelled = false;

    const loadTeamName = async () => {
      const fromRelation = user?._raw?.team?.name || user?.team?.name || "";
      if (fromRelation) {
        if (!cancelled) setTeamName(fromRelation);
        return;
      }

      const userId = user?.userId ?? user?.user_id;
      const fromUserCache = getCachedTeamNameForUser(userId);
      if (fromUserCache) {
        if (!cancelled) setTeamName(fromUserCache);
        return;
      }

      // Manager can read /api/users/:id (verifyManager), which includes relations.team.
      if (userId && token) {
        try {
          const fresh = await UsersApi.getById(userId, { token });
          const freshName = fresh?._raw?.team?.name || fresh?.team?.name || "";
          if (freshName) {
            if (!cancelled) setTeamName(freshName);
            if (onUpdateUser) onUpdateUser(fresh);
            return;
          }
        } catch {
          // ignore
        }
      }

      const teamId = user?.teamId ?? user?.team_id;
      if (!teamId || !token) {
        if (!cancelled) setTeamName("");
        return;
      }

      const fromTeamCache = getCachedTeamNameForTeam(teamId);
      if (fromTeamCache) {
        if (!cancelled) setTeamName(fromTeamCache);
        return;
      }

      if (!cancelled) setTeamName(`Équipe #${teamId}`);
    };

    loadTeamName();
    return () => {
      cancelled = true;
    };
  }, [token, user]);

  useEffect(() => {
    let cancelled = false;

    const loadManagedTeams = async () => {
      const isManager = user?.role === "manager";
      if (!isManager || !token) {
        if (!cancelled) setManagedTeams([]);
        return;
      }

      const managerId = Number(user?.userId ?? user?.user_id);
      if (!Number.isFinite(managerId)) {
        if (!cancelled) setManagedTeams([]);
        return;
      }

      try {
        const teams = (await TeamsApi.list({ token })) || [];
        const mine = teams
          .filter((t) => Number(t?.manager_id ?? t?.manager?.user_id) === managerId)
          .sort((a, b) => String(a?.name || "").localeCompare(String(b?.name || ""), "fr", { sensitivity: "base" }));
        if (!cancelled) setManagedTeams(mine);
      } catch {
        if (!cancelled) setManagedTeams([]);
      }
    };

    loadManagedTeams();
    return () => {
      cancelled = true;
    };
  }, [token, user?.role, user?.userId, user?.user_id]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Le prénom est obligatoire';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Le nom est obligatoire';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est obligatoire';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }
    
    if (formData.phoneNumber && !/^\+?[0-9\s-()]{8,}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Format de téléphone invalide';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      const userId = user?.userId ?? user?.user_id;
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

      // Keep the UI in sync with whatever the backend returns
      if (updated) {
        setFormData({
          firstName: updated.firstName || updated.first_name || formData.firstName,
          lastName: updated.lastName || updated.last_name || formData.lastName,
          email: updated.email || updated.username || formData.email,
          phoneNumber: updated.phoneNumber || updated.phone_number || formData.phoneNumber
        });
      }

      if (onUpdateUser) onUpdateUser(updated);

      setIsEditing(false);
      setSaveMessage('Profil mis à jour avec succès !');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      setSaveMessage("");
      setErrors((prev) => ({ ...prev, _global: err?.message || "Erreur lors de la mise à jour" }));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original values
    if (user) {
      setFormData({
        firstName: user.firstName || user.first_name || '',
        lastName: user.lastName || user.last_name || '',
        email: user.email || user.username || '',
        phoneNumber: user.phoneNumber || user.phone_number || ''
      });
    }
    setIsEditing(false);
    setErrors({});
  };

  return (
    <div style={styles.profile.container}>
      <div style={styles.profile.content}>
        {/* Header */}
        <div style={styles.profile.header}>
          <button style={styles.profile.backBtn} onClick={onBack}>
            ← Retour
          </button>
          <h2 style={styles.profile.title}>Mon Profil</h2>
        </div>

        {/* Success Message */}
        {saveMessage && (
          <div style={styles.profile.successMessage}>
            ✓ {saveMessage}
          </div>
        )}

        {errors._global && (
          <div style={styles.login.errorMessage}>
            {errors._global}
          </div>
        )}

        {/* Profile Card */}
        <div style={styles.profile.card}>
          <div style={styles.profile.cardHeader}>
            <div style={styles.profile.avatar}>
              <span style={styles.profile.avatarIcon}>👤</span>
            </div>
            <div style={styles.profile.userInfo}>
              <h3 style={styles.profile.userName}>
                {formData.firstName} {formData.lastName}
              </h3>
              <span style={styles.profile.userRole}>{roleLabel}</span>
            </div>
            {!isEditing && (
              <button 
                style={styles.profile.editBtn} 
                onClick={() => setIsEditing(true)}
              >
                ✏️ Modifier
              </button>
            )}
          </div>

          {/* Form Fields */}
          <div style={styles.profile.form}>
            <div style={styles.profile.formRow}>
              <div style={styles.profile.formGroup}>
                <label style={styles.profile.label}>Prénom *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  style={{
                    ...styles.profile.input,
                    ...(isEditing ? {} : styles.profile.inputDisabled),
                    ...(errors.firstName ? styles.profile.inputError : {})
                  }}
                  placeholder="Votre prénom"
                />
                {errors.firstName && (
                  <span style={styles.profile.errorText}>{errors.firstName}</span>
                )}
              </div>

              <div style={styles.profile.formGroup}>
                <label style={styles.profile.label}>Nom *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  style={{
                    ...styles.profile.input,
                    ...(isEditing ? {} : styles.profile.inputDisabled),
                    ...(errors.lastName ? styles.profile.inputError : {})
                  }}
                  placeholder="Votre nom"
                />
                {errors.lastName && (
                  <span style={styles.profile.errorText}>{errors.lastName}</span>
                )}
              </div>
            </div>

            <div style={styles.profile.formGroup}>
              <label style={styles.profile.label}>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                style={{
                  ...styles.profile.input,
                  ...(isEditing ? {} : styles.profile.inputDisabled),
                  ...(errors.email ? styles.profile.inputError : {})
                }}
                placeholder="votre.email@exemple.com"
              />
              {errors.email && (
                <span style={styles.profile.errorText}>{errors.email}</span>
              )}
            </div>

            <div style={styles.profile.formGroup}>
              <label style={styles.profile.label}>Téléphone</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                disabled={!isEditing}
                style={{
                  ...styles.profile.input,
                  ...(isEditing ? {} : styles.profile.inputDisabled),
                  ...(errors.phoneNumber ? styles.profile.inputError : {})
                }}
                placeholder="+33 6 12 34 56 78"
              />
              {errors.phoneNumber && (
                <span style={styles.profile.errorText}>{errors.phoneNumber}</span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div style={styles.profile.actions}>
              <button 
                style={styles.profile.cancelBtn} 
                onClick={handleCancel}
              >
                Annuler
              </button>
              <button 
                style={styles.profile.saveBtn} 
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Sauvegarde..." : "Sauvegarder"}
              </button>
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div style={styles.profile.infoCard}>
          <h4 style={styles.profile.infoTitle}>Informations du compte</h4>
          <div style={styles.profile.infoRow}>
            <span style={styles.profile.infoLabel}>Rôle :</span>
            <span style={styles.profile.infoValue}>{roleLabel}</span>
          </div>
          {user?.role === "manager" && (
            <div style={styles.profile.infoRow}>
              <span style={styles.profile.infoLabel}>Équipes gérées :</span>
              <span style={styles.profile.infoValue}>
                {managedTeams.length ? managedTeams.map((t) => t?.name || `Équipe ${t?.team_id}`).join(", ") : "Aucune"}
              </span>
            </div>
          )}
          <div style={styles.profile.infoRow}>
            <span style={styles.profile.infoLabel}>Équipe :</span>
            <span style={styles.profile.infoValue}>
              {teamName || 'Aucune équipe'}
            </span>
          </div>
          <div style={styles.profile.infoRow}>
            <span style={styles.profile.infoLabel}>Date de création :</span>
            <span style={styles.profile.infoValue}>
              {new Date().toLocaleDateString('fr-FR')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}