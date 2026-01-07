import React, { useEffect, useMemo, useState } from "react";
import NavBar from "../../src/components/NavBar";
import Profil from "./Profil";
import styles from "../../src/style/style.ts";
import UsersApi from "../../services/UsersApi";
import TeamsApi from "../../services/TeamsApi";
import ClocksApi from "../../services/ClocksApi";
import AttendanceService from "../../services/AttendanceService";

export default function ManagerDashboard({ user, token, onLogout, onUpdateUser }) {
  const [showProfile, setShowProfile] = useState(false);
  const [activeTab, setActiveTab] = useState("Tableau de bord");
  const [currentUser, setCurrentUser] = useState(user);

  const [loadingTeam, setLoadingTeam] = useState(true);
  const [managedTeams, setManagedTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [presenceLoading, setPresenceLoading] = useState(true);
  const [todayStatusByUserId, setTodayStatusByUserId] = useState({});
  const [clocksByUserId, setClocksByUserId] = useState({});
  const [selectedMonthKey, setSelectedMonthKey] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  useEffect(() => {
    let cancelled = false;

    const loadTeamData = async () => {
      try {
        setLoadingTeam(true);
        const [allUsers, allTeams] = await Promise.all([
          UsersApi.list({ token }),
          TeamsApi.list({ token })
        ]);
        if (cancelled) return;

        setAllUsers(allUsers || []);

        const teams = (allTeams || []).filter((t) => t.manager_id === currentUser.user_id);
        setManagedTeams(teams);
        setSelectedTeamId((prev) => prev || teams?.[0]?.team_id || null);
      } finally {
        if (!cancelled) setLoadingTeam(false);
      }
    };

    loadTeamData();
    return () => {
      cancelled = true;
    };
  }, [currentUser.user_id, token]);

  const selectedTeam = useMemo(() => {
    return (managedTeams || []).find((t) => t.team_id === selectedTeamId) || null;
  }, [managedTeams, selectedTeamId]);

  const teamEmployees = useMemo(() => {
    if (!selectedTeamId) return [];
    return (allUsers || []).filter((u) => u.role === "employee" && u.team_id === selectedTeamId);
  }, [allUsers, selectedTeamId]);

  useEffect(() => {
    let cancelled = false;
    let intervalId = null;

    const loadPresence = async () => {
      try {
        setPresenceLoading(true);

        if (!teamEmployees.length) {
          if (!cancelled) setTodayStatusByUserId({});
          if (!cancelled) setClocksByUserId({});
          return;
        }

        const results = await Promise.allSettled(
          teamEmployees.map((u) => ClocksApi.listForUser(u.user_id, { token }))
        );

        const nextMap = {};
        const nextClocks = {};
        teamEmployees.forEach((u, index) => {
          const result = results[index];
          if (result.status !== "fulfilled") {
            nextMap[u.user_id] = { status: "—", clock: null, lateMinutes: 0 };
            return;
          }
          nextClocks[u.user_id] = result.value;
          nextMap[u.user_id] = ClocksApi.getTodayStatusFromClocks(result.value);
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
  }, [teamEmployees, token]);

  const presenceRows = useMemo(() => {
    return (teamEmployees || []).map((u) => ({
      user: u,
      status: todayStatusByUserId[u.user_id]?.status || "—"
    }));
  }, [teamEmployees, todayStatusByUserId]);

  const kpis = useMemo(() => {
    const total = presenceRows.length;
    const present = presenceRows.filter((r) => r.status === "Présent").length;
    const late = presenceRows.filter((r) => r.status === "En retard").length;
    const absent = presenceRows.filter((r) => r.status === "Absent").length;
    return { total, present, late, absent };
  }, [presenceRows]);

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

  const monthStats = useMemo(() => {
    const employees = teamEmployees || [];
    if (!employees.length) {
      return { totalHours: 0, overtimeHours: 0, daysWorked: 0, delays: 0 };
    }

    return employees.reduce(
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
  }, [clocksByUserId, selectedMonthKey, teamEmployees]);

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
      if (day === 0 || day === 6) continue; // week-ends
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

  const handleHomeClick = () => {
    setActiveTab("Tableau de bord");
    setShowProfile(false);
  };

  const handleShowProfile = () => {
    console.log("Bouton Profil cliqué - showProfile:", showProfile);
    setShowProfile(true);
    console.log("showProfile mis à jour à true");
  };

  const handleUpdateUser = (updatedUser) => {
    setCurrentUser(updatedUser);
    if (onUpdateUser) onUpdateUser(updatedUser);
  };

  const renderTabContent = () => {
    if (showProfile) {
      return (
        <Profil 
          user={currentUser} 
          token={token}
          onUpdateUser={handleUpdateUser}
          onBack={() => setShowProfile(false)}
        />
      );
    }

    switch (activeTab) {
      case "Tableau de bord":
        return (
          <div style={styles.dashboard.contentContainer}>
            <h2>📊 Tableau de bord Manager</h2>
            <p>Bienvenue sur votre espace Manager</p>

            {loadingTeam || presenceLoading ? (
              <p>Chargement...</p>
            ) : !selectedTeam ? (
              <p>Aucune équipe assignée.</p>
            ) : (
              <>
                <div style={styles.profile.infoCard}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                    <div style={styles.profile.infoTitle}>État des présences aujourd'hui</div>
                    {managedTeams.length > 1 ? (
                      <select
                        value={selectedTeamId || ""}
                        onChange={(e) => setSelectedTeamId(Number(e.target.value))}
                        style={styles.history.monthSelector}
                      >
                        {managedTeams.map((t) => (
                          <option key={t.team_id} value={t.team_id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    ) : null}
                  </div>
                  <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    <div style={styles.resume.card}>
                      <div style={styles.resume.cardContent}>
                        <div style={styles.resume.cardLabel}>Total</div>
                        <div style={styles.resume.cardValue}>{kpis.total}</div>
                      </div>
                    </div>
                    <div style={styles.resume.card}>
                      <div style={styles.resume.cardContent}>
                        <div style={styles.resume.cardLabel}>Présents</div>
                        <div style={styles.resume.cardValue}>{kpis.present}</div>
                      </div>
                    </div>
                    <div style={styles.resume.card}>
                      <div style={styles.resume.cardContent}>
                        <div style={styles.resume.cardLabel}>En retard</div>
                        <div style={styles.resume.cardValue}>{kpis.late}</div>
                      </div>
                    </div>
                    <div style={styles.resume.card}>
                      <div style={styles.resume.cardContent}>
                        <div style={styles.resume.cardLabel}>Absents</div>
                        <div style={styles.resume.cardValue}>{kpis.absent}</div>
                      </div>
                    </div>
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
                            borderRadius: "8px"
                          },
                          { background: getRowBackground(row.status) }
                        )}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div style={styles.profile.avatar}>👤</div>
                          <div style={{ fontWeight: 600 }}>
                            {row.user.first_name} {row.user.last_name}
                          </div>
                        </div>

                        <span
                          style={styles.mergeStyles(styles.history.statusBadge, getBadgeStyle(row.status))}
                        >
                          {row.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        );
      
      case "Mon équipe":
        return (
          <div style={styles.dashboard.contentContainer}>
            <h2>👥 Gestion de l'équipe</h2>
            {loadingTeam || presenceLoading ? (
              <p>Chargement...</p>
            ) : !selectedTeam ? (
              <p>Aucune équipe assignée.</p>
            ) : (
              <>
                <div style={styles.profile.infoCard}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                    <div style={styles.profile.infoTitle}>Membres ({selectedTeam.name})</div>
                    {managedTeams.length > 1 ? (
                      <select
                        value={selectedTeamId || ""}
                        onChange={(e) => setSelectedTeamId(Number(e.target.value))}
                        style={styles.history.monthSelector}
                      >
                        {managedTeams.map((t) => (
                          <option key={t.team_id} value={t.team_id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    ) : null}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
                    {presenceRows.length ? (
                      presenceRows.map((row) => (
                        <div
                          key={row.user.user_id}
                          style={styles.mergeStyles(
                            {
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "14px 16px",
                              borderRadius: "8px"
                            },
                            { background: getRowBackground(row.status) }
                          )}
                        >
                          <div>
                            <div style={{ fontWeight: 600 }}>
                              {row.user.first_name} {row.user.last_name}
                            </div>
                            <div style={{ fontSize: "12px", opacity: 0.7 }}>{row.user.email}</div>
                          </div>

                          <span style={styles.mergeStyles(styles.history.statusBadge, getBadgeStyle(row.status))}>
                            {row.status}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p>Aucun employé dans cette équipe.</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        );
      
      case "Statistiques":
        return (
          <div style={styles.dashboard.contentContainer}>
            <h2>📈 Statistiques de l'équipe</h2>
            {loadingTeam || presenceLoading ? (
              <p>Chargement...</p>
            ) : !selectedTeam ? (
              <p>Aucune équipe assignée.</p>
            ) : (
              <>
                <div style={styles.profile.infoCard}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                    <div style={styles.profile.infoTitle}>Statistiques ({selectedTeam.name})</div>
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

                  <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "12px" }}>
                    <div style={styles.resume.card}>
                      <div style={styles.resume.cardContent}>
                        <div style={styles.resume.cardLabel}>Heures totales</div>
                        <div style={styles.resume.cardValue}>{formatDuration(monthStats.totalHours)}</div>
                      </div>
                    </div>
                    <div style={styles.resume.card}>
                      <div style={styles.resume.cardContent}>
                        <div style={styles.resume.cardLabel}>Heures sup.</div>
                        <div style={styles.mergeStyles(styles.resume.cardValue, styles.resume.cardValueOvertime)}>
                          {formatDuration(monthStats.overtimeHours)}
                        </div>
                      </div>
                    </div>
                    <div style={styles.resume.card}>
                      <div style={styles.resume.cardContent}>
                        <div style={styles.resume.cardLabel}>Jours pointés</div>
                        <div style={styles.resume.cardValue}>{monthStats.daysWorked}</div>
                      </div>
                    </div>
                    <div style={styles.resume.card}>
                      <div style={styles.resume.cardContent}>
                        <div style={styles.resume.cardLabel}>Retards</div>
                        <div style={styles.resume.cardValue}>{monthStats.delays}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        );
      
      case "Émargements":
        return (
          <div style={styles.dashboard.contentContainer}>
            <h2>✅ Validation des émargements</h2>
            {/* Liste des émargements à valider */}
          </div>
        );
      
      case "Plannings":
        return (
          <div style={styles.dashboard.contentContainer}>
            <h2>📅 Gestion des plannings</h2>
            {/* Plannings de l'équipe */}
          </div>
        );
      
      case "Rapports":
        return (
          <div style={styles.dashboard.contentContainer}>
            <h2>📄 Rapports de l'équipe</h2>
            {loadingTeam || presenceLoading ? (
              <p>Chargement...</p>
            ) : !selectedTeam ? (
              <p>Aucune équipe assignée.</p>
            ) : (
              <>
                <div style={styles.profile.infoCard}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                    <div style={styles.profile.infoTitle}>Télécharger rapports ({selectedTeam.name})</div>
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
                    {(teamEmployees || []).length ? (
                      (teamEmployees || []).map((emp) => (
                        <div
                          key={emp.user_id}
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
                              {emp.first_name} {emp.last_name}
                            </div>
                            <div style={{ fontSize: "12px", opacity: 0.7 }}>{emp.email}</div>
                          </div>

                          <button
                            style={styles.dashboard.navTab}
                            onClick={() => downloadEmployeeCsv(emp)}
                          >
                            Télécharger CSV
                          </button>
                        </div>
                      ))
                    ) : (
                      <p>Aucun employé dans cette équipe.</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div style={styles.dashboard.container}>
      {/* NavBar commune */}
      <NavBar
        user={currentUser}
        role="Manager"
        onLogout={onLogout}
        onShowProfile={handleShowProfile}
        onHomeClick={handleHomeClick}
      />

      {/* Navigation Tabs - Hide when showing profile */}
      {!showProfile && (
        <nav style={styles.dashboard.nav}>
          {["Tableau de bord", "Mon équipe", "Statistiques", "Émargements", "Plannings", "Rapports"].map((tab) => (
            <button
              key={tab}
              style={activeTab === tab ? 
                styles.mergeStyles(styles.dashboard.navTab, styles.dashboard.navTabActive) : 
                styles.dashboard.navTab
              }
              onClick={() => setActiveTab(tab)}
            >
              {tab === "Tableau de bord" && "📊"} 
              {tab === "Mon équipe" && "👥"} 
              {tab === "Statistiques" && "📈"} 
              {tab === "Émargements" && "✅"} 
              {tab === "Plannings" && "📅"} 
              {tab === "Rapports" && "📄"} 
              {" "}{tab}
            </button>
          ))}
        </nav>
      )}

      {/* Main Content */}
      <main style={styles.dashboard.main}>
        {renderTabContent()}
      </main>
    </div>
  );
}
