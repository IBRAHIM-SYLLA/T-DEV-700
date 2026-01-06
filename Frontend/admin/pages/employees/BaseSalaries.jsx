import React, { useEffect, useMemo, useState } from "react";
import styles from "../../../src/style/style.ts";
import UsersApi from "../../../services/UsersApi";
import TeamsApi from "../../../services/TeamsApi";
import AddOrEditSalarie from "./AddOrEditSalarie";
import { generateTempPassword } from "../../utils/password";

function downloadTextFile(filename, content, type = "text/plain") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function statusForUserToday() {
  return "—";
}

export default function BaseSalaries({ token }) {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [createdCredentials, setCreatedCredentials] = useState(null);

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  const reload = async () => {
    setLoading(true);
    try {
      const [allUsers, allTeams] = await Promise.all([
        UsersApi.list({ token }),
        TeamsApi.list({ token })
      ]);
      setUsers(allUsers);
      setTeams(allTeams);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const teamById = useMemo(() => new Map((teams || []).map((t) => [t.team_id, t])), [teams]);
  const userById = useMemo(() => new Map((users || []).map((u) => [u.user_id, u])), [users]);

  const rows = useMemo(() => {
    return (users || [])
      .filter((u) => u.role !== "super_admin")
      .map((u) => {
        const team = u.team_id ? teamById.get(u.team_id) : null;
        const manager = team?.manager_id ? userById.get(team.manager_id) : null;
        const status = statusForUserToday();
        return {
          user: u,
          department: team?.name || "—",
          managerName: manager ? `${manager.first_name} ${manager.last_name}` : "—",
          status
        };
      });
  }, [teamById, today, userById, users]);

  const badgeStyle = (status) => {
    if (status === "Présent") return styles.history.statusBadgeComplete;
    if (status === "En retard") return styles.history.statusBadgeDelay;
    return styles.history.statusBadgeIncomplete;
  };

  const handleExport = () => {
    const header = ["user_id", "first_name", "last_name", "email", "role", "team_id"].join(",");
    const lines = rows.map((r) =>
      [
        r.user.user_id,
        JSON.stringify(r.user.first_name || ""),
        JSON.stringify(r.user.last_name || ""),
        JSON.stringify(r.user.email || ""),
        JSON.stringify(r.user.role || ""),
        r.user.team_id ?? ""
      ].join(",")
    );
    downloadTextFile(`base-salaries-${today}.csv`, [header, ...lines].join("\n"), "text/csv");
  };

  const startAdd = () => {
    setEditUser(null);
    setCreatedCredentials(null);
    setShowForm(true);
  };

  const startEdit = (user) => {
    setCreatedCredentials(null);
    setEditUser(user);
    setShowForm(true);
  };

  const handleDelete = async (user) => {
    const ok = window.confirm(`Supprimer ${user.first_name} ${user.last_name} ?`);
    if (!ok) return;
    await UsersApi.remove(user.user_id, { token });
    await reload();
  };

  const handleSubmit = async (payload) => {
    if (editUser) {
      await UsersApi.update(editUser.user_id, payload, { token });
      setShowForm(false);
      setEditUser(null);
      await reload();
      return;
    }

    const tempPassword = generateTempPassword(16);
    const created = await UsersApi.create({ ...payload, password: tempPassword }, { token });
    setCreatedCredentials({ email: created.email, password: tempPassword });
    setShowForm(false);
    await reload();
  };

  return (
    <div style={styles.dashboard.main}>
      <div style={styles.dashboard.contentContainer}>
        <div style={{ padding: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={styles.profile.title}>Base des salariés</h2>
          <div style={{ display: "flex", gap: "10px" }}>
            <button style={styles.profile.saveBtn} onClick={startAdd}>
              ➕ Ajouter salarié
            </button>
            <button style={styles.dashboard.editProfileBtn} onClick={handleExport}>
              📤 Exporter
            </button>
          </div>
        </div>

        <div style={{ padding: "0 24px 24px" }}>
          {createdCredentials && (
            <div style={styles.profile.successMessage}>
              Utilisateur créé — Email: <strong>{createdCredentials.email}</strong> · Mot de passe temporaire: <strong>{createdCredentials.password}</strong>
            </div>
          )}

          {showForm && (
            <AddOrEditSalarie
              mode={editUser ? "edit" : "create"}
              existingUsers={users}
              teams={teams}
              initialUser={editUser}
              onCancel={() => {
                setShowForm(false);
                setEditUser(null);
              }}
              onSubmit={handleSubmit}
            />
          )}

          {loading ? (
            <p>Chargement...</p>
          ) : (
            <div style={styles.history.tableContainer}>
              <table style={styles.history.table}>
                <thead>
                  <tr>
                    <th style={styles.history.th}>SALARIÉ</th>
                    <th style={styles.history.th}>DÉPARTEMENT</th>
                    <th style={styles.history.th}>MANAGER</th>
                    <th style={styles.history.th}>STATUT</th>
                    <th style={styles.history.th}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.user.user_id}>
                      <td style={styles.history.td}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={styles.profile.avatar}>👤</div>
                          <div>
                            <div style={{ fontWeight: 600 }}>
                              {r.user.first_name} {r.user.last_name}
                            </div>
                            <div style={{ fontSize: "12px", color: "#64748b" }}>ID: {r.user.user_id}</div>
                          </div>
                        </div>
                      </td>
                      <td style={styles.history.td}>{r.department}</td>
                      <td style={styles.history.td}>{r.managerName}</td>
                      <td style={styles.history.td}>
                        <span style={styles.mergeStyles(styles.history.statusBadge, badgeStyle(r.status))}>{r.status}</span>
                      </td>
                      <td style={styles.history.td}>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            style={styles.mergeStyles(styles.dashboard.editProfileBtn, { padding: "6px 10px", fontSize: "12px" })}
                            onClick={() => startEdit(r.user)}
                          >
                            Modifier
                          </button>
                          <button
                            style={styles.mergeStyles(styles.dashboard.logoutBtn, { padding: "6px 10px", fontSize: "12px" })}
                            onClick={() => handleDelete(r.user)}
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
