import React, { useState } from "react";
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

  const title = mode === "edit" ? "Modifier salarié" : "Ajouter salarié";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return;
    if (!email.trim()) return;

    onSubmit({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim().toLowerCase(),
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
          <div style={{ fontSize: "13px", color: "#64748b" }}>Email requis</div>
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
              placeholder="email@domaine.com"
            />
          </div>

          <div style={styles.profile.formGroup}>
            <label style={styles.profile.label}>Téléphone</label>
            <input style={styles.profile.input} value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
        </div>

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
