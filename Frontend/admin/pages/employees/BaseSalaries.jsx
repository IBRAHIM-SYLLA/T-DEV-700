import React, { useEffect, useMemo, useState } from "react";
import styles from "../../../src/style/style.ts";
import UsersApi from "../../../services/UsersApi";
import TeamsApi from "../../../services/TeamsApi";
import ClocksApi from "../../../services/ClocksApi";
import AddOrEditSalarie from "./AddOrEditSalarie";
import { generateTempPassword } from "../../utils/password";
import { downloadCsvFile } from "../../../services/Csv";

function statusForUserToday() {
  return "—";
}

export default function BaseSalaries({ token }) {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [presenceLoading, setPresenceLoading] = useState(true);
  const [todayStatusByUserId, setTodayStatusByUserId] = useState({});

  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [createTeamName, setCreateTeamName] = useState("");
  const [createTeamManagerId, setCreateTeamManagerId] = useState("");
  const [createTeamLoading, setCreateTeamLoading] = useState(false);
  const [createTeamError, setCreateTeamError] = useState("");

  const [showManageTeams, setShowManageTeams] = useState(false);
  const [editTeam, setEditTeam] = useState(null);
  const [editTeamName, setEditTeamName] = useState("");
  const [editTeamDescription, setEditTeamDescription] = useState("");
  const [editTeamManagerId, setEditTeamManagerId] = useState("");
  const [editTeamLoading, setEditTeamLoading] = useState(false);
  const [editTeamError, setEditTeamError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [createdCredentials, setCreatedCredentials] = useState(null);

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  const managerCandidates = useMemo(() => {
    const nonSuper = (users || []).filter((u) => u.role !== "super_admin");
    const managers = nonSuper.filter((u) => u.role === "manager");
    return managers.length ? managers : nonSuper;
  }, [users]);

  const reload = async () => {
    setLoading(true);
    try {
      const allUsers = await UsersApi.list({ token });

      let allTeams = [];
      try {
        allTeams = await TeamsApi.list({ token });
      } catch {
        allTeams = [];
      }

      // Workaround when backend team listing is restricted for some roles:
      // derive teams from users' teamId and fetch /api/teams/:id (admin/RH route).
      const derivedIds = Array.from(
        new Set(
          (allUsers || [])
            .map((u) => u.teamId ?? u.team_id)
            .filter((id) => id !== null && id !== undefined)
            .map((id) => Number(id))
            .filter((id) => Number.isFinite(id))
        )
      );

      let derivedTeams = [];
      if (derivedIds.length) {
        const results = await Promise.allSettled(derivedIds.map((id) => TeamsApi.getById(id, { token })));
        derivedTeams = results
          .filter((r) => r.status === "fulfilled")
          .map((r) => r.value);
      }

      const byId = new Map();
      [...(allTeams || []), ...(derivedTeams || [])].forEach((t) => {
        if (t?.team_id) byId.set(t.team_id, t);
      });

      setUsers(allUsers);
      setTeams(Array.from(byId.values()));
    } finally {
      setLoading(false);
    }
  };

  const startCreateTeam = () => {
    const first = managerCandidates[0];
    setCreateTeamName("");
    setCreateTeamManagerId(first?.user_id ? String(first.user_id) : "");
    setCreateTeamError("");
    setShowCreateTeam(true);
  };

  const startManageTeams = () => {
    setEditTeam(null);
    setEditTeamName("");
    setEditTeamDescription("");
    setEditTeamManagerId("");
    setEditTeamError("");
    setShowManageTeams(true);
  };

  const startEditTeam = (team) => {
    setEditTeam(team);
    setEditTeamName(team?.name || "");
    setEditTeamDescription(team?.description || "");
    const managerId = team?.manager_id ?? team?.manager?.user_id ?? "";
    setEditTeamManagerId(managerId ? String(managerId) : "");
    setEditTeamError("");
  };

  const handleUpdateTeam = async (e) => {
    e.preventDefault();
    setEditTeamError("");
    if (!editTeam?.team_id) return;

    const name = String(editTeamName || "").trim();
    if (!name) {
      setEditTeamError("Nom d'équipe requis.");
      return;
    }
    if (!editTeamManagerId) {
      setEditTeamError("Veuillez sélectionner un manager.");
      return;
    }

    try {
      setEditTeamLoading(true);
      await TeamsApi.update(
        editTeam.team_id,
        {
          name,
          description: editTeamDescription,
          managerId: Number(editTeamManagerId)
        },
        { token }
      );
      setEditTeam(null);
      setEditTeamName("");
      setEditTeamDescription("");
      setEditTeamManagerId("");
      await reload();
    } catch (err) {
      setEditTeamError(err?.message || "Erreur lors de la mise à jour de l'équipe.");
    } finally {
      setEditTeamLoading(false);
    }
  };

  const handleDeleteTeam = async (team) => {
    const teamId = team?.team_id;
    if (!teamId) return;
    const ok = window.confirm(`Supprimer l'équipe « ${team?.name || teamId} » ?`);
    if (!ok) return;
    try {
      await TeamsApi.remove(teamId, { token });
      if (editTeam?.team_id === teamId) {
        setEditTeam(null);
        setEditTeamName("");
        setEditTeamDescription("");
        setEditTeamManagerId("");
      }
      await reload();
    } catch (err) {
      window.alert(err?.message || "Erreur lors de la suppression de l'équipe.");
    }
  };

  const addTeamToCaches = (team) => {
    if (!team?.team_id) return;

    setTeams((prev) => {
      const byId = new Map((prev || []).map((t) => [t.team_id, t]));
      byId.set(team.team_id, team);
      return Array.from(byId.values());
    });

    setDiscoveredTeamsCache((prev) => {
      const byId = new Map((prev || []).map((t) => [t.team_id, t]));
      byId.set(team.team_id, team);
      return Array.from(byId.values());
    });
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setCreateTeamError("");

    const name = String(createTeamName || "").trim();
    if (!name) {
      setCreateTeamError("Nom d'équipe requis.");
      return;
    }
    if (!createTeamManagerId) {
      setCreateTeamError("Veuillez sélectionner un manager.");
      return;
    }

    try {
      setCreateTeamLoading(true);
      const created = await TeamsApi.create({ name, managerId: Number(createTeamManagerId) }, { token });
      addTeamToCaches(created);
      setShowCreateTeam(false);
      setCreateTeamName("");
      setCreateTeamManagerId("");
      await reload();
    } catch (err) {
      setCreateTeamError(err?.message || "Erreur lors de la création de l'équipe.");
    } finally {
      setCreateTeamLoading(false);
    }
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadPresence = async () => {
      try {
        setPresenceLoading(true);

        if (!users.length) {
          if (!cancelled) setTodayStatusByUserId({});
          return;
        }

        const results = await Promise.allSettled(users.map((u) => ClocksApi.listForUser(u.user_id, { token })));
        const nextMap = {};

        users.forEach((u, index) => {
          const result = results[index];
          if (result.status !== "fulfilled") {
            nextMap[u.user_id] = { status: "—", clock: null, lateMinutes: 0 };
            return;
          }
          nextMap[u.user_id] = ClocksApi.getTodayStatusFromClocks(result.value, u.user_id);
        });

        if (!cancelled) setTodayStatusByUserId(nextMap);
      } finally {
        if (!cancelled) setPresenceLoading(false);
      }
    };

    if (token) loadPresence();
    return () => {
      cancelled = true;
    };
  }, [token, users]);

  const teamById = useMemo(() => new Map((teams || []).map((t) => [String(t.team_id), t])), [teams]);
  const userById = useMemo(() => new Map((users || []).map((u) => [String(u.user_id), u])), [users]);

  const teamsSorted = useMemo(() => {
    return (teams || [])
      .filter((t) => t?.team_id)
      .slice()
      .sort((a, b) => String(a?.name || "").localeCompare(String(b?.name || ""), "fr"));
  }, [teams]);

  const rows = useMemo(() => {
    return (users || [])
      .map((u) => {
        const team = u.team_id ? teamById.get(String(u.team_id)) : null;
        const manager = team?.manager_id ? userById.get(String(team.manager_id)) : null;
        const status = todayStatusByUserId[u.user_id]?.status || "—";
        return {
          user: u,
          department: team?.name || (u.team_id ? `Équipe ${u.team_id}` : "—"),
          managerName: manager
            ? `${manager.first_name} ${manager.last_name}`
            : team?.manager_id
              ? `Manager ${team.manager_id}`
              : "—",
          roleLabel: u.role === "manager" ? "manager" : u.role === "employee" ? "employee" : u.role || "—",
          status
        };
      });
  }, [teamById, todayStatusByUserId, userById, users]);

  const badgeStyle = (status) => {
    if (status === "Présent") return styles.history.statusBadgeComplete;
    if (status === "En retard") return styles.history.statusBadgeDelay;
    return styles.history.statusBadgeIncomplete;
  };

  const handleExport = () => {
    const header = ["first_name", "last_name", "email", "role", "team_name", "manager_name"]; 
    const dataRows = rows.map((r) => [
      r.user.first_name || "",
      r.user.last_name || "",
      r.user.email || "",
      r.user.role || "",
      r.department || "",
      r.managerName || ""
    ]);

    downloadCsvFile(`base-salaries-${today}.csv`, header, dataRows, { separator: ",", excelSeparatorHint: true });
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

    const tempPassword = generateTempPassword(8);
    const created = await UsersApi.create({ ...payload, password: tempPassword }, { token });
    setCreatedCredentials({ email: created.email, password: tempPassword });
    setShowForm(false);
    await reload();
  };

  return (
    <div style={styles.dashboard.main}>
      <div style={styles.dashboard.contentContainer}>
        <div style={{ padding: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={styles.profile.title}>Base des salariés ({rows.length})</h2>
          <div style={{ display: "flex", gap: "10px" }}>
            <button style={styles.profile.saveBtn} onClick={startAdd}>
              ➕ Ajouter salarié
            </button>
            <button style={styles.profile.saveBtn} onClick={startCreateTeam}>
              ➕ Créer équipe
            </button>
              <button style={styles.profile.saveBtn} onClick={startManageTeams}>
                ⚙️ Gérer équipes
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

          {showCreateTeam && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(15, 23, 42, 0.45)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px",
                zIndex: 1000
              }}
              onClick={() => {
                if (!createTeamLoading) setShowCreateTeam(false);
              }}
            >
              <div style={{ width: "min(720px, 100%)" }} onClick={(ev) => ev.stopPropagation()}>
                <div style={styles.profile.card}>
                  <div style={styles.profile.cardHeader}>
                    <div style={styles.profile.avatar}>🏷️</div>
                    <div style={styles.profile.userInfo}>
                      <h3 style={styles.profile.userName}>Créer une équipe</h3>
                    </div>
                  </div>

                  <form style={styles.profile.form} onSubmit={handleCreateTeam}>
                    <div style={styles.profile.formRow}>
                      <div style={styles.profile.formGroup}>
                        <label style={styles.profile.label}>Nom</label>
                        <input
                          style={styles.profile.input}
                          value={createTeamName}
                          onChange={(ev) => setCreateTeamName(ev.target.value)}
                          placeholder="Ex: Équipe Backend"
                        />
                      </div>

                      <div style={styles.profile.formGroup}>
                        <label style={styles.profile.label}>Manager</label>
                        <select
                          style={styles.profile.input}
                          value={createTeamManagerId}
                          onChange={(ev) => setCreateTeamManagerId(ev.target.value)}
                        >
                          <option value="">—</option>
                          {(managerCandidates || []).map((u) => (
                            <option key={u.user_id} value={String(u.user_id)}>
                              {u.first_name} {u.last_name} ({u.email})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {!!createTeamError && <div style={styles.login.errorMessage}>{createTeamError}</div>}

                    <div style={styles.profile.actions}>
                      <button
                        type="button"
                        style={styles.profile.cancelBtn}
                        onClick={() => setShowCreateTeam(false)}
                        disabled={createTeamLoading}
                      >
                        Annuler
                      </button>
                      <button type="submit" style={styles.profile.saveBtn} disabled={createTeamLoading}>
                        {createTeamLoading ? "Création..." : "Créer"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {showManageTeams && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(15, 23, 42, 0.45)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px",
                zIndex: 1000
              }}
              onClick={() => {
                if (!editTeamLoading) setShowManageTeams(false);
              }}
            >
              <div style={{ width: "min(960px, 100%)" }} onClick={(ev) => ev.stopPropagation()}>
                <div style={styles.profile.card}>
                  <div style={styles.profile.cardHeader}>
                    <div style={styles.profile.avatar}>🏷️</div>
                    <div style={styles.profile.userInfo}>
                      <h3 style={styles.profile.userName}>Gestion des équipes</h3>
                    </div>
                  </div>

                  {editTeam ? (
                    <form style={styles.profile.form} onSubmit={handleUpdateTeam}>
                      <div style={styles.profile.formRow}>
                        <div style={styles.profile.formGroup}>
                          <label style={styles.profile.label}>Nom</label>
                          <input
                            style={styles.profile.input}
                            value={editTeamName}
                            onChange={(ev) => setEditTeamName(ev.target.value)}
                            placeholder="Ex: Équipe SAV"
                          />
                        </div>

                        <div style={styles.profile.formGroup}>
                          <label style={styles.profile.label}>Manager</label>
                          <select
                            style={styles.profile.input}
                            value={editTeamManagerId}
                            onChange={(ev) => setEditTeamManagerId(ev.target.value)}
                          >
                            <option value="">—</option>
                            {(managerCandidates || []).map((u) => (
                              <option key={u.user_id} value={String(u.user_id)}>
                                {u.first_name} {u.last_name} ({u.email})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div style={styles.profile.formGroup}>
                        <label style={styles.profile.label}>Description</label>
                        <input
                          style={styles.profile.input}
                          value={editTeamDescription}
                          onChange={(ev) => setEditTeamDescription(ev.target.value)}
                          placeholder="(optionnel)"
                        />
                      </div>

                      {!!editTeamError && <div style={styles.login.errorMessage}>{editTeamError}</div>}

                      <div style={styles.profile.actions}>
                        <button
                          type="button"
                          style={styles.profile.cancelBtn}
                          onClick={() => {
                            if (editTeamLoading) return;
                            setEditTeam(null);
                            setEditTeamName("");
                            setEditTeamDescription("");
                            setEditTeamManagerId("");
                            setEditTeamError("");
                          }}
                          disabled={editTeamLoading}
                        >
                          Retour
                        </button>
                        <button type="submit" style={styles.profile.saveBtn} disabled={editTeamLoading}>
                          {editTeamLoading ? "Sauvegarde..." : "Sauvegarder"}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div style={{ padding: "16px 24px 24px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {teamsSorted.length ? (
                          teamsSorted.map((t) => {
                            const managerId = t?.manager_id ?? t?.manager?.user_id;
                            const manager = managerId ? userById.get(String(managerId)) : null;
                            const managerLabel = manager
                              ? `${manager.first_name} ${manager.last_name}`
                              : managerId
                                ? `Manager ${managerId}`
                                : "—";

                            return (
                              <div
                                key={t.team_id}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  padding: "12px 14px",
                                  borderRadius: "8px",
                                  border: "1px solid #e2e8f0",
                                  background: "#fff"
                                }}
                              >
                                <div>
                                  <div style={{ fontWeight: 700 }}>{t.name || `Équipe ${t.team_id}`}</div>
                                  <div style={{ fontSize: "12px", opacity: 0.75 }}>
                                    Manager: {managerLabel}
                                    {t.description ? ` · ${t.description}` : ""}
                                  </div>
                                </div>

                                <div style={{ display: "flex", gap: "8px" }}>
                                  <button
                                    style={styles.mergeStyles(styles.dashboard.editProfileBtn, { padding: "6px 10px", fontSize: "12px" })}
                                    onClick={() => startEditTeam(t)}
                                  >
                                    Modifier
                                  </button>
                                  <button
                                    style={styles.mergeStyles(styles.dashboard.logoutBtn, { padding: "6px 10px", fontSize: "12px" })}
                                    onClick={() => handleDeleteTeam(t)}
                                  >
                                    Supprimer
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <p>Aucune équipe.</p>
                        )}
                      </div>

                      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "14px" }}>
                        <button
                          type="button"
                          style={styles.profile.cancelBtn}
                          onClick={() => setShowManageTeams(false)}
                        >
                          Fermer
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
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

          {loading || presenceLoading ? (
            <p>Chargement...</p>
          ) : (
            <div style={styles.history.tableContainer}>
              <table style={styles.history.table}>
                <thead>
                  <tr>
                    <th style={styles.history.th}>SALARIÉ</th>
                    <th style={styles.history.th}>DÉPARTEMENT</th>
                    <th style={styles.history.th}>RÔLE</th>
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
                          </div>
                        </div>
                      </td>
                      <td style={styles.history.td}>{r.department}</td>
                      <td style={styles.history.td}>{r.roleLabel}</td>
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
