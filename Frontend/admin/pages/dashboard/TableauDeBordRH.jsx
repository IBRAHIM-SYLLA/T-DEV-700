import React, { useEffect, useMemo, useState } from "react";
import styles from "../../../src/style/style.ts";
import UsersApi from "../../../services/UsersApi";
import TeamsApi from "../../../services/TeamsApi";

function computeTodayStatus() {
  return { status: "—" };
}

export default function TableauDeBordRH({ token }) {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        const [allUsers, allTeams] = await Promise.all([
          UsersApi.list({ token }),
          TeamsApi.list({ token })
        ]);
        if (!mounted) return;
        setUsers(allUsers);
        setTeams(allTeams);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const { employees, managerById, teamById } = useMemo(() => {
    const teamMap = new Map((teams || []).map((t) => [t.team_id, t]));
    const userMap = new Map((users || []).map((u) => [u.user_id, u]));

    return {
      employees: (users || []).filter((u) => u.role === "employee"),
      managerById: userMap,
      teamById: teamMap
    };
  }, [teams, users]);

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  const presenceRows = useMemo(() => {
    return employees.map((user) => {
      const { status } = computeTodayStatus();
      const team = user.team_id ? teamById.get(user.team_id) : null;
      const manager = team?.manager_id ? managerById.get(team.manager_id) : null;

      return {
        user,
        status,
        department: team?.name || "—",
        managerName: manager ? `${manager.first_name} ${manager.last_name}` : "—"
      };
    });
  }, [employees, managerById, teamById, today]);

  const kpis = useMemo(() => {
    const total = presenceRows.length;
    const present = 0;
    const late = 0;
    const absent = 0;

    return { total, present, late, absent };
  }, [presenceRows]);

  const kpiCardsStyle = useMemo(
    () =>
      styles.mergeStyles(styles.resume.cards, {
        gridTemplateColumns: "repeat(4, 1fr)",
        width: "100%"
      }),
    []
  );

  const getRowBackground = (status) => {
    if (status === "Présent") return styles.history.statusBadgeComplete.background;
    if (status === "En retard") return styles.history.statusBadgeDelay.background;
    return styles.history.statusBadgeIncomplete.background;
  };

  const getBadgeStyle = (status) => {
    if (status === "Présent") return styles.history.statusBadgeComplete;
    if (status === "En retard") return styles.history.statusBadgeDelay;
    return styles.history.statusBadgeIncomplete;
  };

  return (
    <div style={styles.dashboard.main}>
      <div style={styles.dashboard.contentContainer}>
        <div style={{ padding: "24px" }}>
          <h2 style={styles.profile.title}>Tableau de bord RH</h2>
        </div>

        <div style={{ padding: "0 24px 24px" }}>
          {loading ? (
            <p>Chargement...</p>
          ) : (
            <>
              <div style={kpiCardsStyle}>
                <div style={styles.resume.card}>
                  <div style={styles.resume.cardContent}>
                    <div style={styles.resume.cardLabel}>Total salariés</div>
                    <div style={styles.resume.cardValue}>{kpis.total}</div>
                  </div>
                  <div style={styles.resume.cardIcon}>👥</div>
                </div>

                <div style={styles.resume.card}>
                  <div style={styles.resume.cardContent}>
                    <div style={styles.resume.cardLabel}>Présents</div>
                    <div style={styles.resume.cardValue}>{kpis.present}</div>
                  </div>
                  <div style={styles.resume.cardIcon}>✅</div>
                </div>

                <div style={styles.resume.card}>
                  <div style={styles.resume.cardContent}>
                    <div style={styles.resume.cardLabel}>En retard</div>
                    <div style={styles.resume.cardValue}>{kpis.late}</div>
                  </div>
                  <div style={styles.resume.cardIcon}>⚠️</div>
                </div>

                <div style={styles.resume.card}>
                  <div style={styles.resume.cardContent}>
                    <div style={styles.resume.cardLabel}>Absents</div>
                    <div style={styles.resume.cardValue}>{kpis.absent}</div>
                  </div>
                  <div style={styles.resume.cardIcon}>❌</div>
                </div>
              </div>

              <div style={styles.profile.infoCard}>
                <div style={styles.profile.infoTitle}>État des présences aujourd'hui</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {presenceRows.map((row) => (
                    <div
                      key={row.user.user_id}
                      style={styles.mergeStyles(
                        {
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "14px 16px",
                          borderRadius: "8px",
                          border: "1px solid #e2e8f0"
                        },
                        { background: getRowBackground(row.status) }
                      )}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={styles.profile.avatar}>👤</div>
                        <div>
                          <div style={{ fontWeight: 600, color: "#1e293b" }}>
                            {row.user.first_name} {row.user.last_name}
                          </div>
                          <div style={{ fontSize: "12px", color: "#64748b" }}>{row.department}</div>
                        </div>
                      </div>

                      <span style={styles.mergeStyles(styles.history.statusBadge, getBadgeStyle(row.status))}>
                        {row.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
