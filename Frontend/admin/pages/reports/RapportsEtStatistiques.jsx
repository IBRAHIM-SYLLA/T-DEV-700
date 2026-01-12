import React, { useEffect, useMemo, useState } from "react";
import styles from "../../../src/style/style.ts";
import UsersApi from "../../../services/UsersApi";
import TeamsApi from "../../../services/TeamsApi";
import ClocksApi from "../../../services/ClocksApi";
import WaterfallChart from "../../../src/components/WaterfallChart.jsx";
import { downloadCsvFile, sanitizeFilenamePart } from "../../../services/Csv";



export default function RapportsEtStatistiques({ token }) {
  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState("all");

  const [users, setUsers] = useState([]);
  const [userStatsLoading, setUserStatsLoading] = useState(false);
  const [userStatsById, setUserStatsById] = useState({});

  const { from, to } = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { from: start, to: now };
  }, []);

  const isInRange = (dateValue) => {
    const d = new Date(dateValue);
    if (!Number.isFinite(d.getTime())) return false;
    return d >= from && d <= to;
  };

  const hoursBetween = (arrival, departure) => {
    const a = new Date(arrival);
    const d = new Date(departure);
    if (!Number.isFinite(a.getTime()) || !Number.isFinite(d.getTime())) return 0;
    const diff = (d.getTime() - a.getTime()) / (1000 * 60 * 60);
    return diff > 0 ? diff : 0;
  };

  const isLateArrival = (arrivalTime) => {
    // Keep it consistent with ClocksApi.getTodayStatusFromClocks default: 09:00 with 5 min tolerance.
    const t = ClocksApi.toIsoTime(arrivalTime);
    if (!t) return false;
    const parts = t.split(":").map((x) => Number(x));
    if (parts.some((n) => !Number.isFinite(n))) return false;
    const [h = 0, m = 0] = parts;
    const minutes = h * 60 + m;
    const expected = 9 * 60;
    return minutes - expected > 5;
  };

  useEffect(() => {
    let cancelled = false;

    const loadTeams = async () => {
      try {
        let listTeams = [];
        try {
          listTeams = await TeamsApi.list({ token });
        } catch {
          listTeams = [];
        }

        // For RH/SUPER_ADMIN, backend currently returns teams-by-manager on /api/teams,
        // so the list can be empty. In that case (or to enrich names), derive team IDs
        // from users and fetch /api/teams/:id silently.
        const allUsers = await UsersApi.list({ token });
        const derivedIds = Array.from(
          new Set(
            (allUsers || [])
              .map((u) => u.teamId ?? u.team_id)
              .filter((id) => id !== null && id !== undefined)
              .map((id) => Number(id))
              .filter((id) => Number.isFinite(id))
          )
        );

        const derivedTeams = derivedIds.length
          ? (await Promise.all(derivedIds.map((id) => TeamsApi.getByIdSilent(id, { token })))).filter(Boolean)
          : [];

        const byId = new Map();
        [...(listTeams || []), ...(derivedTeams || [])].forEach((t) => {
          if (t?.team_id) byId.set(String(t.team_id), t);
        });

        if (!cancelled) setTeams(Array.from(byId.values()));
      } catch {
        if (!cancelled) setTeams([]);
      }
    };

    if (token) loadTeams();
    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    let cancelled = false;

    const loadUsers = async () => {
      try {
        const allUsers = await UsersApi.list({ token });
        if (!cancelled) setUsers(allUsers || []);
      } catch {
        if (!cancelled) setUsers([]);
      }
    };

    if (token) loadUsers();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const fmtHours = (value) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return "—";
    return `${Math.round(n * 100) / 100}h`;
  };

  const teamById = useMemo(() => new Map((teams || []).map((t) => [String(t.team_id), t])), [teams]);

  const filteredUsers = useMemo(() => {
    const teamIdFilter = selectedTeamId === "all" ? null : Number(selectedTeamId);
    if (!teamIdFilter) return (users || []).filter((u) => u.role !== "super_admin");
    return (users || []).filter((u) => u.role !== "super_admin" && Number(u.teamId) === teamIdFilter);
  }, [selectedTeamId, users]);

  useEffect(() => {
    let cancelled = false;

    const loadUserStats = async () => {
      try {
        setUserStatsLoading(true);

        if (!token || !filteredUsers.length) {
          if (!cancelled) setUserStatsById({});
          return;
        }

        const results = await Promise.allSettled(filteredUsers.map((u) => ClocksApi.listForUser(u.userId, { token })));

        const next = {};
        filteredUsers.forEach((u, idx) => {
          const r = results[idx];
          if (r.status !== "fulfilled") {
            next[u.userId] = { deltas: [], totalHours: 0, lateDays: 0, incomplete: 0 };
            return;
          }

          const clocks = Array.isArray(r.value) ? r.value : [];
          const inRange = clocks.filter((c) => isInRange(c.arrival_time));

          const hoursByDay = new Map();
          let incomplete = 0;
          let lateDays = 0;

          inRange.forEach((c) => {
            const dayKey = ClocksApi.toIsoDateKey(c.arrival_time);
            if (!dayKey) return;

            const hasDeparture = !!c.departure_time;
            if (!hasDeparture) incomplete += 1;

            if (isLateArrival(c.arrival_time)) lateDays += 1;

            const h = hasDeparture ? hoursBetween(c.arrival_time, c.departure_time) : 0;
            hoursByDay.set(dayKey, (hoursByDay.get(dayKey) || 0) + h);
          });

          const deltaKeys = Array.from(hoursByDay.keys()).sort();
          const deltas = deltaKeys.map((k) => hoursByDay.get(k) || 0);
          const totalHours = deltas.reduce((sum, v) => sum + v, 0);

          next[u.userId] = { deltas, totalHours, lateDays, incomplete };
        });

        if (!cancelled) setUserStatsById(next);
      } finally {
        if (!cancelled) setUserStatsLoading(false);
      }
    };

    loadUserStats();
    return () => {
      cancelled = true;
    };
  }, [filteredUsers, token]);

  const handleExportMonthlyReport = async () => {
    try {
      setLoading(true);
      const users = await UsersApi.list({ token });
      const allTeams = (teams || []).length ? teams : await TeamsApi.list({ token });

      const teamById = new Map((allTeams || []).map((t) => [Number(t.team_id), t]));

      const header = ["first_name", "last_name", "email", "role", "team_name"];

      const teamIdFilter = selectedTeamId === "all" ? null : Number(selectedTeamId);
      const filteredUsers = teamIdFilter
        ? (users || []).filter((u) => Number(u.teamId) === teamIdFilter)
        : (users || []);

      const rows = filteredUsers.map((u) => {
        const team = u.teamId ? teamById.get(Number(u.teamId)) : null;
        return [u.firstName ?? "", u.lastName ?? "", u.email ?? "", u.role ?? "", team?.name ?? ""];
      });

      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, "0");
      const suffix = teamIdFilter ? `equipe-${sanitizeFilenamePart(teamById.get(teamIdFilter)?.name || teamIdFilter)}` : "toutes-equipes";
      downloadCsvFile(`rapport-mensuel-${suffix}-${y}-${m}.csv`, header, rows, { separator: ",", excelSeparatorHint: true });
    } catch (err) {
      alert(err?.message || "Erreur export");
    } finally {
      setLoading(false);
    }
  };

  const handleExportTeamCsv = async (team) => {
    try {
      setLoading(true);
      const users = await UsersApi.list({ token });
      const allTeams = (teams || []).length ? teams : await TeamsApi.list({ token });
      const teamById = new Map((allTeams || []).map((t) => [Number(t.team_id), t]));

      const header = ["first_name", "last_name", "email", "role", "team_name"];

      const teamId = team?.team_id;
      const filteredUsers = (users || []).filter((u) => Number(u.teamId) === Number(teamId));

      const rows = filteredUsers.map((u) => {
        const t = u.teamId ? teamById.get(Number(u.teamId)) : null;
        return [u.firstName ?? "", u.lastName ?? "", u.email ?? "", u.role ?? "", t?.name ?? ""];
      });

      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, "0");
      const teamPart = sanitizeFilenamePart(team?.name || teamId);
      downloadCsvFile(`rapport-equipe-${teamPart}-${y}-${m}.csv`, header, rows, { separator: ",", excelSeparatorHint: true });
    } catch (err) {
      alert(err?.message || "Erreur export");
    } finally {
      setLoading(false);
    }
  };

  const monthLabel = from.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  return (
    <div style={styles.dashboard.main}>
      <div style={styles.dashboard.contentContainer}>
        <div style={{ padding: "24px" }}>
          <h2 style={styles.profile.title}>Rapports et statistiques</h2>
        </div>

        <div style={{ padding: "0 24px 24px" }}>
          <div style={styles.profile.infoCard}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
              <div style={styles.profile.infoTitle}>Filtres</div>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <label style={{ fontSize: "13px", color: "#475569" }}>Équipe</label>
                <select
                  style={styles.history.monthSelector}
                  value={selectedTeamId}
                  onChange={(e) => {
                    const next = e.target.value;
                    setSelectedTeamId(next);
                  }}
                >
                  <option value="all">Toutes les équipes</option>
                  {(teams || []).map((t) => (
                    <option key={t.team_id} value={String(t.team_id)}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div style={styles.profile.infoCard}>
            <div style={styles.profile.infoTitle}>Activité par salarié ({monthLabel})</div>

            {userStatsLoading ? (
              <p style={{ margin: "10px 0 0 0", opacity: 0.8 }}>Chargement des graphiques…</p>
            ) : (filteredUsers || []).length ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "12px",
                  marginTop: "12px"
                }}
              >
                {filteredUsers.map((u) => {
                  const s = userStatsById[u.userId] || { deltas: [], totalHours: 0, lateDays: 0, incomplete: 0 };
                  const teamName = u.teamId ? teamById.get(String(u.teamId))?.name : "—";
                  return (
                    <div
                      key={u.userId}
                      style={{
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        padding: "12px 14px",
                        background: "#fff"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "flex-start" }}>
                        <div>
                          <div style={{ fontWeight: 800, color: "#0f172a" }}>
                            {u.firstName} {u.lastName}
                          </div>
                          <div style={{ fontSize: "12px", color: "#64748b" }}>{u.email}</div>
                          <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>Équipe: {teamName || "—"}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: "12px", color: "#64748b" }}>Total</div>
                          <div style={{ fontSize: "16px", fontWeight: 800, color: "#4f46e5" }}>{fmtHours(s.totalHours)}</div>
                        </div>
                      </div>

                      <div style={{ marginTop: "10px", display: "flex", justifyContent: "center" }}>
                        <WaterfallChart deltas={s.deltas} width={340} height={120} />
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", flexWrap: "wrap", marginTop: "8px" }}>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>Jours en retard: <strong style={{ color: "#0f172a" }}>{s.lateDays}</strong></div>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>Pointages incomplets: <strong style={{ color: "#0f172a" }}>{s.incomplete}</strong></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ margin: "10px 0 0 0", opacity: 0.8 }}>Aucun salarié pour ce filtre.</p>
            )}
          </div>

          <div style={styles.profile.infoCard}>
            <div style={styles.profile.infoTitle}>Actions rapides</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "14px" }}>
              <button style={styles.dashboard.editProfileBtn} onClick={handleExportMonthlyReport} disabled={loading}>
                {loading ? "⏳ Export..." : "📊 Exporter rapport mensuel"}
              </button>
            </div>
          </div>

          <div style={styles.profile.infoCard}>
            <div style={styles.profile.infoTitle}>Exporter CSV par équipe</div>
            {(teams || []).length ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", marginTop: "12px" }}>
                {teams.map((t) => (
                  <div
                    key={t.team_id}
                    style={styles.mergeStyles(
                      {
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "12px",
                        padding: "12px 14px",
                        borderRadius: "10px",
                        border: "1px solid #e2e8f0"
                      },
                      {}
                    )}
                  >
                    <div style={{ fontWeight: 700, color: "#0f172a" }}>{t.name}</div>
                    <button style={styles.dashboard.navTab} onClick={() => handleExportTeamCsv(t)} disabled={loading}>
                      {loading ? "⏳" : "Télécharger CSV"}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ margin: "10px 0 0 0", opacity: 0.8 }}>Aucune équipe disponible.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
