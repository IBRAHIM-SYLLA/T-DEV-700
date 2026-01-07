import React, { useEffect, useMemo, useState } from "react";
import styles from "../../../src/style/style.ts";
import UsersApi from "../../../services/UsersApi";
import TeamsApi from "../../../services/TeamsApi";
import ClocksApi from "../../../services/ClocksApi";
import AttendanceService from "../../../services/AttendanceService";

export default function TableauDeBordRH({ token }) {
  const [loading, setLoading] = useState(true);
  const [presenceLoading, setPresenceLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [todayStatusByUserId, setTodayStatusByUserId] = useState({});
  const [clocksByUserId, setClocksByUserId] = useState({});

  const [selectedMonthKey, setSelectedMonthKey] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

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
  }, [token]);

  const { employees, managerById, teamById } = useMemo(() => {
    const teamMap = new Map((teams || []).map((t) => [t.team_id, t]));
    const userMap = new Map((users || []).map((u) => [u.user_id, u]));

    return {
      employees: (users || []).filter((u) => u.role === "employee"),
      managerById: userMap,
      teamById: teamMap
    };
  }, [teams, users]);

  useEffect(() => {
    let cancelled = false;
    let intervalId = null;

    const loadPresence = async () => {
      try {
        setPresenceLoading(true);

        if (!employees.length) {
          if (!cancelled) setTodayStatusByUserId({});
          return;
        }

        const results = await Promise.allSettled(
          employees.map((user) => ClocksApi.listForUser(user.user_id, { token }))
        );

        const nextMap = {};
        const nextClocks = {};
        employees.forEach((user, index) => {
          const result = results[index];
          if (result.status !== "fulfilled") {
            nextMap[user.user_id] = { status: "—", clock: null, lateMinutes: 0 };
            return;
          }
          nextClocks[user.user_id] = result.value;
          nextMap[user.user_id] = ClocksApi.getTodayStatusFromClocks(result.value);
        });

        if (!cancelled) {
          setClocksByUserId(nextClocks);
          setTodayStatusByUserId(nextMap);
        }
      } finally {
        if (!cancelled) setPresenceLoading(false);
      }
    };

    const onVisibilityOrFocus = () => {
      if (document.visibilityState === "visible") loadPresence();
    };

    loadPresence();
    intervalId = setInterval(loadPresence, 7_200_000);
    window.addEventListener("focus", onVisibilityOrFocus);
    document.addEventListener("visibilitychange", onVisibilityOrFocus);

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
      window.removeEventListener("focus", onVisibilityOrFocus);
      document.removeEventListener("visibilitychange", onVisibilityOrFocus);
    };
  }, [employees, token]);

  const monthOptions = useMemo(() => {
    const now = new Date();
    const options = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
      options.push({ key, label });
    }
    return options;
  }, []);

  const formatDuration = (hours) => {
    if (!hours) return "0h 00m";
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h}h ${m.toString().padStart(2, "0")}m`;
  };

  const getWeekdaysOfMonth = (monthKey) => {
    const [y, m] = monthKey.split("-").map(Number);
    const first = new Date(y, m - 1, 1);
    const dates = [];
    for (let d = new Date(first); d.getMonth() === first.getMonth(); d.setDate(d.getDate() + 1)) {
      const day = d.getDay();
      if (day === 0 || day === 6) continue;
      dates.push(new Date(d));
    }
    return dates;
  };

  const downloadEmployeeCsv = (employee) => {
    const clocks = clocksByUserId[employee.user_id] || [];
    const days = getWeekdaysOfMonth(selectedMonthKey);

    const clocksByDay = new Map();
    clocks.forEach((c) => {
      const dayKey = AttendanceService.toIsoDateKey(c.arrival_time);
      if (!dayKey || !dayKey.startsWith(selectedMonthKey)) return;
      if (!clocksByDay.has(dayKey)) clocksByDay.set(dayKey, []);
      clocksByDay.get(dayKey).push(c);
    });

    const rows = [];
    rows.push(["date", "arrivee", "depart", "statut", "heures_travaillees"].join(";"));

    days.forEach((d) => {
      const dayKey = d.toISOString().slice(0, 10);
      const dayClocks = clocksByDay.get(dayKey) || [];
      const clock = dayClocks[0] || null;

      if (!clock) {
        rows.push([dayKey, "", "", "Absent", "0"].join(";"));
        return;
      }

      const detailed = AttendanceService.getClockDetailedStatus(clock, null);
      const arrivee = (AttendanceService.toIsoTime(clock.arrival_time) || "").slice(0, 5);
      const depart = clock.departure_time ? (AttendanceService.toIsoTime(clock.departure_time) || "").slice(0, 5) : "";
      const status = detailed.arrivalStatus?.status === "late" ? "En retard" : "Présent";
      const workedHours = (detailed.workedHours?.totalMinutes || 0) / 60;

      rows.push([dayKey, arrivee, depart, status, String(Math.round(workedHours * 100) / 100)].join(";"));
    });

    const csv = `\uFEFF${rows.join("\n")}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rapport_${employee.first_name}_${employee.last_name}_${selectedMonthKey}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const monthStats = useMemo(() => {
    const emps = employees || [];
    if (!emps.length) return { totalHours: 0, overtimeHours: 0, daysWorked: 0, delays: 0 };

    return emps.reduce(
      (acc, user) => {
        const clocks = clocksByUserId[user.user_id] || [];
        const monthClocks = clocks
          .filter((c) => AttendanceService.toIsoDateKey(c.arrival_time)?.startsWith(selectedMonthKey))
          .filter((c) => c.departure_time);

        monthClocks.forEach((clock) => {
          const detailed = AttendanceService.getClockDetailedStatus(clock, null);
          const workedMinutes = detailed.workedHours?.totalMinutes || 0;
          const workedHours = workedMinutes / 60;
          acc.totalHours += workedHours;
          acc.overtimeHours += Math.max(0, workedHours - 7);
          acc.daysWorked += 1;
          if (detailed.arrivalStatus?.status === "late") acc.delays += 1;
        });

        return acc;
      },
      { totalHours: 0, overtimeHours: 0, daysWorked: 0, delays: 0 }
    );
  }, [clocksByUserId, employees, selectedMonthKey]);

  const teamMonthStats = useMemo(() => {
    const emps = employees || [];
    const statsByTeam = new Map();

    emps.forEach((user) => {
      const teamName = (user.team_id ? teamById.get(user.team_id)?.name : null) || "—";
      if (!statsByTeam.has(teamName)) {
        statsByTeam.set(teamName, { teamName, totalHours: 0, overtimeHours: 0, daysWorked: 0, delays: 0 });
      }
      const teamStats = statsByTeam.get(teamName);

      const clocks = clocksByUserId[user.user_id] || [];
      const monthClocks = clocks
        .filter((c) => AttendanceService.toIsoDateKey(c.arrival_time)?.startsWith(selectedMonthKey))
        .filter((c) => c.departure_time);

      monthClocks.forEach((clock) => {
        const detailed = AttendanceService.getClockDetailedStatus(clock, null);
        const workedMinutes = detailed.workedHours?.totalMinutes || 0;
        const workedHours = workedMinutes / 60;
        teamStats.totalHours += workedHours;
        teamStats.overtimeHours += Math.max(0, workedHours - 7);
        teamStats.daysWorked += 1;
        if (detailed.arrivalStatus?.status === "late") teamStats.delays += 1;
      });
    });

    return Array.from(statsByTeam.values()).sort((a, b) => b.totalHours - a.totalHours);
  }, [clocksByUserId, employees, selectedMonthKey, teamById]);

  const presenceRows = useMemo(() => {
    return employees.map((user) => {
      const status = todayStatusByUserId[user.user_id]?.status || "—";
      const team = user.team_id ? teamById.get(user.team_id) : null;
      const manager = team?.manager_id ? managerById.get(team.manager_id) : null;

      return {
        user,
        status,
        department: team?.name || "—",
        managerName: manager ? `${manager.first_name} ${manager.last_name}` : "—"
      };
    });
  }, [employees, managerById, teamById, todayStatusByUserId]);

  const kpis = useMemo(() => {
    const total = presenceRows.length;
    const present = presenceRows.filter((r) => r.status === "Présent").length;
    const late = presenceRows.filter((r) => r.status === "En retard").length;
    const absent = presenceRows.filter((r) => r.status === "Absent").length;

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
          {loading || presenceLoading ? (
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

              <div style={styles.profile.infoCard}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                  <div style={styles.profile.infoTitle}>Statistiques mensuelles</div>
                  <select
                    value={selectedMonthKey}
                    onChange={(e) => setSelectedMonthKey(e.target.value)}
                    style={styles.history.monthSelector}
                  >
                    {monthOptions.map((opt) => (
                      <option key={opt.key} value={opt.key}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={kpiCardsStyle}>
                  <div style={styles.resume.card}>
                    <div style={styles.resume.cardContent}>
                      <div style={styles.resume.cardLabel}>Heures totales</div>
                      <div style={styles.resume.cardValue}>{formatDuration(monthStats.totalHours)}</div>
                    </div>
                    <div style={styles.resume.cardIcon}>⏱️</div>
                  </div>

                  <div style={styles.resume.card}>
                    <div style={styles.resume.cardContent}>
                      <div style={styles.resume.cardLabel}>Heures sup.</div>
                      <div style={styles.mergeStyles(styles.resume.cardValue, styles.resume.cardValueOvertime)}>
                        {formatDuration(monthStats.overtimeHours)}
                      </div>
                    </div>
                    <div style={styles.resume.cardIcon}>💰</div>
                  </div>

                  <div style={styles.resume.card}>
                    <div style={styles.resume.cardContent}>
                      <div style={styles.resume.cardLabel}>Jours pointés</div>
                      <div style={styles.resume.cardValue}>{monthStats.daysWorked}</div>
                    </div>
                    <div style={styles.resume.cardIcon}>📅</div>
                  </div>

                  <div style={styles.resume.card}>
                    <div style={styles.resume.cardContent}>
                      <div style={styles.resume.cardLabel}>Retards</div>
                      <div style={styles.resume.cardValue}>{monthStats.delays}</div>
                    </div>
                    <div style={styles.resume.cardIcon}>⚠️</div>
                  </div>
                </div>

                <div style={{ marginTop: "14px" }}>
                  <div style={{ fontWeight: 600, marginBottom: "8px" }}>Par équipe</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {teamMonthStats.map((t) => (
                      <div
                        key={t.teamName}
                        style={styles.mergeStyles(
                          {
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "14px 16px",
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0"
                          },
                          {}
                        )}
                      >
                        <div style={{ fontWeight: 600 }}>{t.teamName}</div>
                        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", fontSize: "12px", opacity: 0.85 }}>
                          <span>Heures: {formatDuration(t.totalHours)}</span>
                          <span>Sup: {formatDuration(t.overtimeHours)}</span>
                          <span>Jours: {t.daysWorked}</span>
                          <span>Retards: {t.delays}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={styles.profile.infoCard}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                  <div style={styles.profile.infoTitle}>Rapports (CSV)</div>
                  <select
                    value={selectedMonthKey}
                    onChange={(e) => setSelectedMonthKey(e.target.value)}
                    style={styles.history.monthSelector}
                  >
                    {monthOptions.map((opt) => (
                      <option key={opt.key} value={opt.key}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
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
                        {}
                      )}
                    >
                      <div>
                        <div style={{ fontWeight: 600 }}>
                          {row.user.first_name} {row.user.last_name}
                        </div>
                        <div style={{ fontSize: "12px", opacity: 0.7 }}>{row.department}</div>
                      </div>

                      <button style={styles.dashboard.navTab} onClick={() => downloadEmployeeCsv(row.user)}>
                        Télécharger CSV
                      </button>
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
