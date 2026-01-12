import React, { useEffect, useMemo, useState } from "react";
import styles from "../../../src/style/style.ts";

export default function AddOrEditSalarie({
  mode,
  existingUsers,
  teams,
  initialUser,
  onCancel,
  onSubmit
}) {
  const [firstName, setFirstName] = useState(initialUser?.first_name || "");
  const [lastName, setLastName] = useState(initialUser?.last_name || "");
  const [role, setRole] = useState(initialUser?.role || "employee");
  const [teamId, setTeamId] = useState(initialUser?.team_id ?? "");
  const [phone, setPhone] = useState(initialUser?.phone_number || "");
  const [email, setEmail] = useState(initialUser?.email || "");
  const [error, setError] = useState("");

  const existingEmails = useMemo(
    () => (existingUsers || []).map((u) => u.email).filter(Boolean),
    [existingUsers]
  );

  const title = mode === "edit" ? "Modifier salarié" : "Ajouter salarié";

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!firstName.trim() || !lastName.trim()) return;

    const normalizedEmail = String(email || "").trim().toLowerCase();
    if (!normalizedEmail) {
      setError("Email requis.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Email invalide.");
      return;
    }
    const isDuplicate = (existingEmails || []).some((e2) => String(e2 || "").trim().toLowerCase() === normalizedEmail);
    if (mode !== "edit" && isDuplicate) {
      setError("Cet email existe déjà.");
      return;
    }

    onSubmit({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: normalizedEmail,
      phone_number: phone.trim() || null,
      role,
      team_id: teamId === "" ? null : Number(teamId)
    });
  };

  return (
    <div style={styles.profile.card}>
      <div style={styles.profile.cardHeader}>
        <div style={styles.profile.avatar}>➕</div>
        <div style={styles.profile.userInfo}>
          <h3 style={styles.profile.userName}>{title}</h3>
        </div>
      </div>

      <form style={styles.profile.form} onSubmit={handleSubmit}>
        <div style={styles.profile.formRow}>
          <div style={styles.profile.formGroup}>
            <label style={styles.profile.label}>Prénom</label>
            <input style={styles.profile.input} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>

          <div style={styles.profile.formGroup}>
            <label style={styles.profile.label}>Nom</label>
            <input style={styles.profile.input} value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
        </div>

        <div style={styles.profile.formRow}>
          <div style={styles.profile.formGroup}>
            <label style={styles.profile.label}>Rôle</label>
            <select style={styles.profile.input} value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
            </select>
          </div>

          <div style={styles.profile.formGroup}>
            <label style={styles.profile.label}>Équipe</label>
            <select style={styles.profile.input} value={teamId} onChange={(e) => setTeamId(e.target.value)}>
              <option value="">—</option>
              {(teams || []).map((t) => (
                <option key={t.team_id} value={t.team_id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={styles.profile.formRow}>
          <div style={styles.profile.formGroup}>
            <label style={styles.profile.label}>Email</label>
            <input
              style={styles.profile.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div style={styles.profile.formGroup}>
            <label style={styles.profile.label}>Téléphone</label>
            <input style={styles.profile.input} value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
        </div>

        {!!error && <div style={styles.login.errorMessage}>{error}</div>}

        <div style={styles.profile.actions}>
          <button type="button" style={styles.profile.cancelBtn} onClick={onCancel}>
            Annuler
          </button>
          <button type="submit" style={styles.profile.saveBtn}>
            {mode === "edit" ? "Enregistrer" : "Créer"}
          </button>
        </div>
      </form>
    </div>
  );
}
