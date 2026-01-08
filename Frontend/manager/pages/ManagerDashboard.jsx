import React, { useEffect, useMemo, useState } from "react";
import NavBar from "../../src/components/NavBar";
import Profil from "./Profil";
import styles from "../../src/style/style.ts";
import TeamsApi from "../../services/TeamsApi";
import ClocksApi from "../../services/ClocksApi";
import AttendanceService from "../../services/AttendanceService";
import Pointage from "../../src/pages/employee/Pointage";

export default function ManagerDashboard({ user, token, onLogout, onUpdateUser }) {
  const [showProfile, setShowProfile] = useState(false);
  const [activeTab, setActiveTab] = useState("Pointage");
  const [currentUser, setCurrentUser] = useState(user);

  const [loadingTeam, setLoadingTeam] = useState(true);
  const [allTeams, setAllTeams] = useState([]);
  const [managedTeams, setManagedTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [teamFilterId, setTeamFilterId] = useState("all");
  const [teamSortKey, setTeamSortKey] = useState("name_asc");
  const [allUsers, setAllUsers] = useState([]);
  const [presenceLoading, setPresenceLoading] = useState(true);
  const [todayStatusByUserId, setTodayStatusByUserId] = useState({});
  const [clocksByUserId, setClocksByUserId] = useState({});
  const [presenceRefreshNonce, setPresenceRefreshNonce] = useState(0);
  const [selectedMonthKey, setSelectedMonthKey] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  useEffect(() => {
    let cancelled = false;

    const loadTeamData = async () => {
      try {
        setLoadingTeam(true);
        const allTeams = await TeamsApi.list({ token });
        if (cancelled) return;

        const safeTeams = allTeams || [];
        setAllTeams(safeTeams);

        const managerId = currentUser?.user_id ?? currentUser?.userId;
        const teams = (safeTeams || []).filter((t) => (t.manager_id ?? t.manager?.user_id) === managerId);
        setManagedTeams(teams);
        setSelectedTeamId((prev) => prev || teams?.[0]?.team_id || null);

        // Build a local users list from team.members (backend /api/users on main is a light DTO)
        const usersById = new Map();
        (safeTeams || []).forEach((team) => {
          const members = Array.isArray(team?.members) ? team.members : [];
          members.forEach((m) => {
            const id = m?.user_id ?? m?.userId;
            if (!id) return;
            // attach team_id inferred from the team
            const withTeam = { ...m, team_id: team.team_id };
            if (!usersById.has(id)) usersById.set(id, withTeam);
          });
        });
        setAllUsers(Array.from(usersById.values()));
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

  const teamsById = useMemo(() => {
    const map = new Map();
    (allTeams || []).forEach((t) => map.set(t.team_id, t));
    return map;
  }, [allTeams]);

  const allEmployees = useMemo(() => {
    return (allUsers || []).filter((u) => u.role === "employee");
  }, [allUsers]);

  const teamEmployees = useMemo(() => {
    if (!selectedTeamId) return [];
    return (allUsers || []).filter((u) => u.role === "employee" && u.team_id === selectedTeamId);
  }, [allUsers, selectedTeamId]);

  const employeesForPresence = useMemo(() => {
    // For manager views we want presence/status across all employees
    return allEmployees;
  }, [allEmployees]);

  useEffect(() => {
    let cancelled = false;
    let intervalId = null;

    const loadPresence = async () => {
      try {
        setPresenceLoading(true);

        if (!employeesForPresence.length) {
          if (!cancelled) setTodayStatusByUserId({});
          if (!cancelled) setClocksByUserId({});
          return;
        }

        const results = await Promise.allSettled(
          employeesForPresence.map((u) => ClocksApi.listForUser(u.user_id, { token }))
        );

        const nextMap = {};
        const nextClocks = {};
        employeesForPresence.forEach((u, index) => {
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
  }, [employeesForPresence, token, presenceRefreshNonce]);

  const presenceRows = useMemo(() => {
    return (teamEmployees || []).map((u) => ({
      user: u,
      status: todayStatusByUserId[u.user_id]?.status || "—"
    }));
  }, [teamEmployees, todayStatusByUserId]);

  const allPresenceRows = useMemo(() => {
    return (allEmployees || []).map((u) => ({
      user: u,
      status: todayStatusByUserId[u.user_id]?.status || "—"
    }));
  }, [allEmployees, todayStatusByUserId]);

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

  const formatClockTime = (value) => {
    const t = AttendanceService.toIsoTime(value);
    return t ? t.slice(0, 5) : "";
  };

  const statusCountsFromRows = (rows) => {
    const total = rows.length;
    const present = rows.filter((r) => r.status === "Présent").length;
    const late = rows.filter((r) => r.status === "En retard").length;
    const absent = rows.filter((r) => r.status === "Absent").length;
    return { total, present, late, absent };
  };

  const renderStackedBar = ({ present, late, absent, total }) => {
    const safeTotal = total || 0;
    const p = safeTotal ? (present / safeTotal) * 100 : 0;
    const l = safeTotal ? (late / safeTotal) * 100 : 0;
    const a = safeTotal ? (absent / safeTotal) * 100 : 0;

    const presentBg = styles.history.statusBadgeComplete.background;
    const lateBg = styles.history.statusBadgeDelay.background;
    const absentBg = styles.history.statusBadgeIncomplete.background;

    return (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "12px",
          borderRadius: "999px",
          overflow: "hidden",
          background: "#e2e8f0"
        }}
      >
        <div style={{ width: `${p}%`, background: presentBg }} />
        <div style={{ width: `${l}%`, background: lateBg }} />
        <div style={{ width: `${a}%`, background: absentBg }} />
      </div>
    );
  };

  const filteredEmployees = useMemo(() => {
    const base = allEmployees || [];
    if (teamFilterId === "all") return base;
    return base.filter((u) => String(u.team_id) === String(teamFilterId));
  }, [allEmployees, teamFilterId]);

  const statusRank = (status) => {
    if (status === "Absent") return 3;
    if (status === "En retard") return 2;
    if (status === "Présent") return 1;
    return 0;
  };

  const sortedFilteredEmployees = useMemo(() => {
    const list = [...(filteredEmployees || [])];
    if (teamSortKey === "status_desc") {
      list.sort((a, b) => {
        const sa = statusRank(todayStatusByUserId[a.user_id]?.status);
        const sb = statusRank(todayStatusByUserId[b.user_id]?.status);
        if (sb !== sa) return sb - sa;
        const an = `${a.first_name || ""} ${a.last_name || ""}`.trim().toLowerCase();
        const bn = `${b.first_name || ""} ${b.last_name || ""}`.trim().toLowerCase();
        return an.localeCompare(bn);
      });
      return list;
    }

    // default: name_asc
    list.sort((a, b) => {
      const an = `${a.first_name || ""} ${a.last_name || ""}`.trim().toLowerCase();
      const bn = `${b.first_name || ""} ${b.last_name || ""}`.trim().toLowerCase();
      return an.localeCompare(bn);
    });
    return list;
  }, [filteredEmployees, teamSortKey, todayStatusByUserId]);

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
    setActiveTab("Pointage");
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
            <p>Vue globale des employés et de leur statut du jour.</p>

            {loadingTeam || presenceLoading ? (
              <p>Chargement...</p>
            ) : (
              <>
                <div style={styles.profile.infoCard}>
                  <div style={styles.profile.infoTitle}>Résumé du jour</div>
                  <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "12px" }}>
                    <div style={styles.resume.card}>
                      <div style={styles.resume.cardContent}>
                        <div style={styles.resume.cardLabel}>Total</div>
                        <div style={styles.resume.cardValue}>{statusCountsFromRows(allPresenceRows).total}</div>
                      </div>
                    </div>
                    <div style={styles.resume.card}>
                      <div style={styles.resume.cardContent}>
                        <div style={styles.resume.cardLabel}>Présents</div>
                        <div style={styles.resume.cardValue}>{statusCountsFromRows(allPresenceRows).present}</div>
                      </div>
                    </div>
                    <div style={styles.resume.card}>
                      <div style={styles.resume.cardContent}>
                        <div style={styles.resume.cardLabel}>En retard</div>
                        <div style={styles.resume.cardValue}>{statusCountsFromRows(allPresenceRows).late}</div>
                      </div>
                    </div>
                    <div style={styles.resume.card}>
                      <div style={styles.resume.cardContent}>
                        <div style={styles.resume.cardLabel}>Absents</div>
                        <div style={styles.resume.cardValue}>{statusCountsFromRows(allPresenceRows).absent}</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: "12px" }}>{renderStackedBar(statusCountsFromRows(allPresenceRows))}</div>
                </div>

                <div style={styles.profile.infoCard}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                    <div style={styles.profile.infoTitle}>Employés</div>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <select
                        value={teamFilterId}
                        onChange={(e) => setTeamFilterId(e.target.value)}
                        style={styles.history.monthSelector}
                      >
                        <option value="all">Toutes les équipes</option>
                        {(allTeams || []).map((t) => (
                          <option key={t.team_id} value={String(t.team_id)}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                      <select
                        value={teamSortKey}
                        onChange={(e) => setTeamSortKey(e.target.value)}
                        style={styles.history.monthSelector}
                      >
                        <option value="name_asc">Tri: Nom</option>
                        <option value="status_desc">Tri: Statut</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
                    {sortedFilteredEmployees.length ? (
                      sortedFilteredEmployees.map((emp) => {
                        const status = todayStatusByUserId[emp.user_id]?.status || "—";
                        const teamName = teamsById.get(emp.team_id)?.name || "Aucune équipe";

                        return (
                          <div
                            key={emp.user_id}
                            style={styles.mergeStyles(
                              {
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "14px 16px",
                                borderRadius: "8px"
                              },
                              { background: getRowBackground(status) }
                            )}
                          >
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                              <div style={{ fontWeight: 700 }}>
                                {emp.first_name} {emp.last_name}
                              </div>
                              <div style={{ fontSize: "12px", opacity: 0.75 }}>
                                {teamName} · {emp.email} {emp.phone_number ? `· ${emp.phone_number}` : ""}
                              </div>
                            </div>

                            <span style={styles.mergeStyles(styles.history.statusBadge, getBadgeStyle(status))}>
                              {status}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <p>Aucun employé.</p>
                    )}
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
            ) : (
              <>
                <div style={styles.profile.infoCard}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                    <div style={styles.profile.infoTitle}>Filtre</div>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <select
                        value={teamFilterId}
                        onChange={(e) => setTeamFilterId(e.target.value)}
                        style={styles.history.monthSelector}
                      >
                        <option value="all">Toutes les équipes</option>
                        {(allTeams || []).map((t) => (
                          <option key={t.team_id} value={String(t.team_id)}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                      <select
                        value={teamSortKey}
                        onChange={(e) => setTeamSortKey(e.target.value)}
                        style={styles.history.monthSelector}
                      >
                        <option value="name_asc">Tri: Nom</option>
                        <option value="status_desc">Tri: Statut</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
                    {sortedFilteredEmployees.length ? (
                      sortedFilteredEmployees.map((emp) => {
                        const status = todayStatusByUserId[emp.user_id]?.status || "—";
                        const teamName = teamsById.get(emp.team_id)?.name || "Aucune équipe";

                        return (
                          <div
                            key={emp.user_id}
                            style={styles.mergeStyles(
                              {
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "14px 16px",
                                borderRadius: "8px"
                              },
                              { background: getRowBackground(status) }
                            )}
                          >
                            <div>
                              <div style={{ fontWeight: 700 }}>
                                {emp.first_name} {emp.last_name}
                              </div>
                              <div style={{ fontSize: "12px", opacity: 0.7 }}>{teamName} · {emp.email}</div>
                            </div>

                            <span style={styles.mergeStyles(styles.history.statusBadge, getBadgeStyle(status))}>
                              {status}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <p>Aucun employé.</p>
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
            ) : (
              <>
                <div style={styles.profile.infoCard}>
                  <div style={styles.profile.infoTitle}>Présences (aujourd'hui)</div>
                  <div style={{ marginTop: "12px" }}>
                    {renderStackedBar(statusCountsFromRows(allPresenceRows))}
                  </div>
                  <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "12px" }}>
                    <span style={styles.mergeStyles(styles.history.statusBadge, styles.history.statusBadgeComplete)}>Présent</span>
                    <span style={styles.mergeStyles(styles.history.statusBadge, styles.history.statusBadgeDelay)}>En retard</span>
                    <span style={styles.mergeStyles(styles.history.statusBadge, styles.history.statusBadgeIncomplete)}>Absent</span>
                  </div>
                </div>

                <div style={styles.profile.infoCard}>
                  <div style={styles.profile.infoTitle}>Présences par équipe (aujourd'hui)</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
                    {(allTeams || []).length ? (
                      (allTeams || []).map((team) => {
                        const rows = (allEmployees || [])
                          .filter((u) => u.team_id === team.team_id)
                          .map((u) => ({ user: u, status: todayStatusByUserId[u.user_id]?.status || "—" }))
                          .filter((r) => r.status === "Présent" || r.status === "En retard" || r.status === "Absent");

                        if (!rows.length) return null;
                        const counts = statusCountsFromRows(rows);

                        return (
                          <div key={team.team_id} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                              <div style={{ fontWeight: 700 }}>{team.name}</div>
                              <div style={{ fontSize: "12px", opacity: 0.75 }}>
                                Total: {counts.total} · Présent: {counts.present} · Retard: {counts.late} · Absent: {counts.absent}
                              </div>
                            </div>
                            {renderStackedBar(counts)}
                          </div>
                        );
                      })
                    ) : (
                      <p>Aucune équipe.</p>
                    )}
                  </div>
                </div>

                <div style={styles.profile.infoCard}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                    <div style={styles.profile.infoTitle}>Heures et retards (mois)</div>
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
            {loadingTeam || presenceLoading ? (
              <p>Chargement...</p>
            ) : !selectedTeam ? (
              <p>Aucune donnée.</p>
            ) : (
              <>
                <div style={styles.profile.infoCard}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                    <div style={styles.profile.infoTitle}>Émargements du jour</div>
                    <select
                      value={teamFilterId}
                      onChange={(e) => setTeamFilterId(e.target.value)}
                      style={styles.history.monthSelector}
                    >
                      <option value="all">Toutes les équipes</option>
                      {(allTeams || []).map((t) => (
                        <option key={t.team_id} value={String(t.team_id)}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <p style={{ margin: "10px 0 0 0", opacity: 0.8 }}>
                    Vue récapitulative basée sur les pointages enregistrés. La validation/annotation manuelle sera possible quand le backend émargements sera disponible.
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
                    {sortedFilteredEmployees.length ? (
                      sortedFilteredEmployees.map((emp) => {
                        const status = todayStatusByUserId[emp.user_id]?.status || "—";
                        const clocks = clocksByUserId[emp.user_id] || [];
                        const todayClock = ClocksApi.getTodayClock(clocks);
                        const arrivee = todayClock ? formatClockTime(todayClock.arrival_time) : "";
                        const depart = todayClock && todayClock.departure_time ? formatClockTime(todayClock.departure_time) : "";
                        const detailed = todayClock ? AttendanceService.getClockDetailedStatus(todayClock, null) : null;
                        const lateMinutes = detailed?.arrivalStatus?.status === "late" ? detailed.arrivalStatus?.lateMinutes || 0 : 0;
                        const workedMinutes = detailed?.workedHours?.totalMinutes ?? (todayClock && !todayClock.departure_time
                          ? AttendanceService.calculateWorkedHours(todayClock.arrival_time, new Date().toISOString()).totalMinutes
                          : null);
                        const workedLabel = workedMinutes != null ? AttendanceService.formatDuration(Math.max(0, workedMinutes)) : "";
                        const teamName = teamsById.get(emp.team_id)?.name || "Aucune équipe";

                        return (
                          <div
                            key={emp.user_id}
                            style={styles.mergeStyles(
                              {
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "14px 16px",
                                borderRadius: "8px"
                              },
                              { background: getRowBackground(status) }
                            )}
                          >
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                              <div style={{ fontWeight: 600 }}>
                                {emp.first_name} {emp.last_name}
                              </div>
                              <div style={{ fontSize: "12px", opacity: 0.75 }}>
                                {teamName}
                                {emp.email ? ` · ${emp.email}` : ""}
                                {emp.phone_number ? ` · ${emp.phone_number}` : ""}
                                {` · Arrivée: ${arrivee || "—"}`}
                                {` · Départ: ${depart || (todayClock && !todayClock.departure_time ? "en cours" : "—")}`}
                                {lateMinutes ? ` · Retard: ${lateMinutes} min` : ""}
                                {workedLabel ? ` · Temps: ${workedLabel}` : ""}
                              </div>
                            </div>

                            <span style={styles.mergeStyles(styles.history.statusBadge, getBadgeStyle(status))}>
                              {status}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <p>Aucun employé.</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        );

      case "Pointage":
        return (
          <div style={styles.dashboard.contentContainer}>
            <h2>⏱️ Pointage</h2>
            <p>Pointer votre arrivée / départ (manager).</p>
            <Pointage
              userId={currentUser?.userId ?? currentUser?.user_id}
              token={token}
              onTimeUpdate={() => setPresenceRefreshNonce((n) => n + 1)}
            />
          </div>
        );
      
      case "Plannings":
        return (
          <div style={styles.dashboard.contentContainer}>
            <h2>📅 Gestion des plannings</h2>
            {loadingTeam ? (
              <p>Chargement...</p>
            ) : !selectedTeam ? (
              <p>Aucune équipe assignée.</p>
            ) : (
              <>
                <div style={styles.profile.infoCard}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                    <div style={styles.profile.infoTitle}>Planning ({selectedTeam.name})</div>
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

                  <p style={{ margin: "10px 0 0 0", opacity: 0.8 }}>
                    Planning standard affiché (09:00–18:00, pause 12:00–14:00). La gestion des plannings personnalisés nécessite l’API work_schedules (à venir).
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
                    {teamEmployees.length ? (
                      teamEmployees.map((emp) => (
                        <div
                          key={emp.user_id}
                          style={styles.mergeStyles(
                            {
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "14px 16px",
                              borderRadius: "8px"
                            },
                            { background: "white" }
                          )}
                        >
                          <div>
                            <div style={{ fontWeight: 600 }}>
                              {emp.first_name} {emp.last_name}
                            </div>
                            <div style={{ fontSize: "12px", opacity: 0.7 }}>{emp.email}</div>
                          </div>
                          <div style={{ fontSize: "13px", opacity: 0.9 }}>
                            Lun–Ven: 09:00–18:00 · Pause: 12:00–14:00
                          </div>
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

                  <p style={{ margin: "10px 0 0 0", opacity: 0.8 }}>
                    Export CSV disponible. Les rapports avancés (PDF/KPIs côté backend) sont en cours de développement.
                  </p>

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
          {["Pointage", "Tableau de bord", "Mon équipe", "Statistiques", "Émargements", "Plannings", "Rapports"].map((tab) => (
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
              {tab === "Pointage" && "⏱️"}
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
