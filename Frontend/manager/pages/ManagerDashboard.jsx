import React, { useEffect, useMemo, useState } from "react";
import NavBar from "../../src/components/NavBar";
import Profil from "./Profil";
import styles from "../../src/style/style.ts";
import TeamsApi from "../../services/TeamsApi";
import ClocksApi from "../../services/ClocksApi";
import AttendanceService from "../../services/AttendanceService";
import Pointage from "../../src/pages/employee/Pointage";
import Historique from "../../src/pages/employee/Historique";
import DonutChart from "../../src/components/DonutChart.jsx";
import { toUiUser } from "../../services/mappers";
import { downloadCsvFile, sanitizeFilenamePart } from "../../services/Csv";
import EmployeeFicheModal from "./EmployeeFicheModal";
import ReportsApi from "../../services/ReportsApi";

export default function ManagerDashboard({ user, token, onLogout, onUpdateUser }) {
  const [showProfile, setShowProfile] = useState(false);
  const [activeTab, setActiveTab] = useState("Pointage");
  const [currentUser, setCurrentUser] = useState(user);
  const [ficheEmployee, setFicheEmployee] = useState(null);

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

  const [presencePeriod, setPresencePeriod] = useState("today"); // "today" | "month"
  const [monthActiveUsersByTeamId, setMonthActiveUsersByTeamId] = useState({});
  const [monthTeamsLoading, setMonthTeamsLoading] = useState(false);

  const [monthKpisLoading, setMonthKpisLoading] = useState(false);
  const [monthKpis, setMonthKpis] = useState({
    totalWorkedTime: 0,
    averageWorkedTime: 0,
    lateRate: 0,
    activeUsers: 0,
    incompleteClocks: 0
  });

  const getMonthRange = (monthKey) => {
    const [y, m] = String(monthKey || "").split("-").map((v) => Number(v));
    if (!Number.isFinite(y) || !Number.isFinite(m) || m < 1 || m > 12) return null;
    const from = new Date(y, m - 1, 1, 0, 0, 0, 0);
    const to = new Date(y, m, 0, 23, 59, 59, 999);
    return { from, to };
  };

  useEffect(() => {
    let cancelled = false;

    const loadTeamData = async () => {
      try {
        setLoadingTeam(true);
        const allTeams = await TeamsApi.list({ token });
        if (cancelled) return;

        const safeTeams = allTeams || [];
        setAllTeams(safeTeams);

        const managerId = Number(currentUser?.user_id ?? currentUser?.userId);
        const hasManagerAssignmentInfo = (safeTeams || []).some(
          (t) => t?.manager_id !== null && t?.manager_id !== undefined
            || t?.manager?.user_id !== null && t?.manager?.user_id !== undefined
        );

        // If the API provides manager assignment info, scope manager view to managed teams only.
        // Otherwise, fall back to showing all teams (cannot enforce scoping without backend support).
        const scopedTeams = hasManagerAssignmentInfo && Number.isFinite(managerId)
          ? (safeTeams || []).filter((t) => Number(t.manager_id ?? t.manager?.user_id) === managerId)
          : safeTeams;

        setManagedTeams(scopedTeams);
        setSelectedTeamId((prev) => prev || scopedTeams?.[0]?.team_id || null);

        // Build a local users list from team.members (team.members often doesn't include role)
        // IMPORTANT: for manager views, only include members of managed teams.
        const usersById = new Map();
        (scopedTeams || []).forEach((team) => {
          const members = Array.isArray(team?.members) ? team.members : [];
          members.forEach((m) => {
            const u = toUiUser(m);
            const id = u?.user_id ?? u?.userId;
            if (!id) return;
            // attach team_id inferred from the team (and keep both snake_case and camelCase)
            const withTeam = { ...u, team_id: team.team_id, teamId: team.team_id };
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

  useEffect(() => {
    if (teamFilterId === "all") return;
    const exists = (managedTeams || []).some((t) => String(t.team_id) === String(teamFilterId));
    if (!exists) setTeamFilterId("all");
  }, [managedTeams, teamFilterId]);

  const selectedTeam = useMemo(() => {
    return (managedTeams || []).find((t) => t.team_id === selectedTeamId) || null;
  }, [managedTeams, selectedTeamId]);

  const teamsById = useMemo(() => {
    const map = new Map();
    (managedTeams || []).forEach((t) => map.set(t.team_id, t));
    return map;
  }, [managedTeams]);

  const teamManagerIds = useMemo(() => {
    const ids = new Set();
    (allTeams || []).forEach((t) => {
      const id = t?.manager_id ?? t?.manager?.user_id;
      if (id) ids.add(Number(id));
    });
    return ids;
  }, [allTeams]);

  const allEmployees = useMemo(() => {
    return (allUsers || [])
      .filter((u) => {
        const id = u?.user_id ?? u?.userId;
        if (!id) return false;
        if (teamManagerIds.has(Number(id))) return false;
        // When role is missing from /teams members, assume it's an employee.
        if (!u.role) return true;
        return u.role === "employee";
      })
      .map((u) => ({ ...u, user_id: u.user_id ?? u.userId }));
  }, [allUsers, teamManagerIds]);

  const teamEmployees = useMemo(() => {
    if (!selectedTeamId) return [];
    return (allEmployees || []).filter((u) => u.team_id === selectedTeamId);
  }, [allEmployees, selectedTeamId]);

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

        const currentUserId = Number(currentUser?.user_id ?? currentUser?.userId);

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

          const clocks = Array.isArray(result.value) ? result.value : [];
          const hasUserIdField = clocks.some(
            (c) => c && (typeof c.user_id !== "undefined" || (c.user && typeof c.user.user_id !== "undefined"))
          );

          // If the backend response doesn't carry any user identifier, we cannot reliably
          // attribute clocks to the requested employee. In that case, only trust the payload
          // for the currently logged-in user; keep others as Absent until backend supports scoping.
          const safeClocks = !hasUserIdField && Number(u.user_id) !== currentUserId ? [] : clocks;

          nextClocks[u.user_id] = safeClocks;
          nextMap[u.user_id] = ClocksApi.getTodayStatusFromClocks(safeClocks, u.user_id);
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

  useEffect(() => {
    let cancelled = false;

    const loadMonthKpis = async () => {
      const teamId = Number(selectedTeamId);
      const range = getMonthRange(selectedMonthKey);
      if (!Number.isFinite(teamId) || !range) {
        if (!cancelled) {
          setMonthKpis({
            totalWorkedTime: 0,
            averageWorkedTime: 0,
            lateRate: 0,
            activeUsers: 0,
            incompleteClocks: 0
          });
        }
        return;
      }

      try {
        setMonthKpisLoading(true);
        const [twt, awt, lr, au, ic] = await Promise.all([
          ReportsApi.getTotalWorkedTime({ teamId, from: range.from, to: range.to }, { token }),
          ReportsApi.getAverageWorkedTime({ teamId, from: range.from, to: range.to }, { token }),
          ReportsApi.getLateRate({ teamId, from: range.from, to: range.to }, { token }),
          ReportsApi.getActiveUsers({ teamId, from: range.from, to: range.to }, { token }),
          ReportsApi.getIncompleteClocks({ teamId, from: range.from, to: range.to }, { token })
        ]);

        if (cancelled) return;

        setMonthKpis({
          totalWorkedTime: Number(twt?.totalWorkedTime) || 0,
          averageWorkedTime: Number(awt?.averageWorkedTime) || 0,
          lateRate: Number(lr?.lateRate) || 0,
          activeUsers: Number(au?.activeUsers) || 0,
          incompleteClocks: Number(ic?.incompleteClocks) || 0
        });
      } catch {
        if (!cancelled) {
          setMonthKpis({
            totalWorkedTime: 0,
            averageWorkedTime: 0,
            lateRate: 0,
            activeUsers: 0,
            incompleteClocks: 0
          });
        }
      } finally {
        if (!cancelled) setMonthKpisLoading(false);
      }
    };

    loadMonthKpis();
    return () => {
      cancelled = true;
    };
  }, [selectedTeamId, selectedMonthKey, token]);

  useEffect(() => {
    let cancelled = false;

    const loadMonthTeams = async () => {
      if (presencePeriod !== "month") return;

      const range = getMonthRange(selectedMonthKey);
      if (!range) {
        if (!cancelled) setMonthActiveUsersByTeamId({});
        return;
      }

      const teams = managedTeams || [];
      if (!teams.length) {
        if (!cancelled) setMonthActiveUsersByTeamId({});
        return;
      }

      try {
        setMonthTeamsLoading(true);
        const results = await Promise.allSettled(
          teams.map((t) =>
            ReportsApi.getActiveUsers({ teamId: t.team_id, from: range.from, to: range.to }, { token })
          )
        );

        if (cancelled) return;

        const next = {};
        teams.forEach((t, i) => {
          const r = results[i];
          next[t.team_id] = r.status === "fulfilled" ? Number(r.value?.activeUsers) || 0 : 0;
        });
        setMonthActiveUsersByTeamId(next);
      } finally {
        if (!cancelled) setMonthTeamsLoading(false);
      }
    };

    loadMonthTeams();
    return () => {
      cancelled = true;
    };
  }, [presencePeriod, managedTeams, selectedMonthKey, token]);

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

  const selectedMonthLabel = useMemo(() => {
    return monthOptions.find((o) => o.key === selectedMonthKey)?.label || selectedMonthKey;
  }, [monthOptions, selectedMonthKey]);

  const formatDuration = (hours) => {
    if (!hours) return "0h 00m";
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h}h ${m.toString().padStart(2, "0")}m`;
  };

  const formatPercent = (value) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return "0%";
    return `${Math.round(n)}%`;
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

    const header = ["date", "arrivee", "depart", "statut", "heures_travaillees"];
    const rows = [];

    days.forEach((d) => {
      const dayKey = d.toISOString().slice(0, 10);
      const dayClocks = clocksByDay.get(dayKey) || [];
      const clock = dayClocks[0] || null;

      if (!clock) {
        rows.push([dayKey, "", "", "Absent", "0"]);
        return;
      }

      const detailed = AttendanceService.getClockDetailedStatus(clock, null);
      const arrivee = (AttendanceService.toIsoTime(clock.arrival_time) || "").slice(0, 5);
      const depart = clock.departure_time ? (AttendanceService.toIsoTime(clock.departure_time) || "").slice(0, 5) : "";
      const status = detailed.arrivalStatus?.status === "late" ? "En retard" : "Présent";
      const workedHours = (detailed.workedHours?.totalMinutes || 0) / 60;

      rows.push([dayKey, arrivee, depart, status, String(Math.round(workedHours * 100) / 100)]);
    });

    downloadCsvFile(`rapport_${employee.first_name}_${employee.last_name}_${selectedMonthKey}.csv`, header, rows, {
      separator: ",",
      excelSeparatorHint: true
    });
  };

  const downloadTeamCsv = (team) => {
    const teamId = team?.team_id;
    const teamName = team?.name || `team-${teamId}`;
    const employees = (allEmployees || []).filter((u) => Number(u.team_id) === Number(teamId));
    const days = getWeekdaysOfMonth(selectedMonthKey);

    const header = ["team_name", "employee_nom", "date", "arrivee", "depart", "statut", "heures_travaillees"];
    const rows = [];

    employees.forEach((employee) => {
      const empName = `${employee.first_name || ""} ${employee.last_name || ""}`.trim();
      const clocks = clocksByUserId[employee.user_id] || [];
      const clocksByDay = new Map();
      clocks.forEach((c) => {
        const dayKey = AttendanceService.toIsoDateKey(c.arrival_time);
        if (!dayKey || !dayKey.startsWith(selectedMonthKey)) return;
        if (!clocksByDay.has(dayKey)) clocksByDay.set(dayKey, []);
        clocksByDay.get(dayKey).push(c);
      });

      days.forEach((d) => {
        const dayKey = d.toISOString().slice(0, 10);
        const dayClocks = clocksByDay.get(dayKey) || [];
        const clock = dayClocks[0] || null;

        if (!clock) {
          rows.push([teamName, empName, dayKey, "", "", "Absent", "0"]);
          return;
        }

        const detailed = AttendanceService.getClockDetailedStatus(clock, null);
        const arrivee = (AttendanceService.toIsoTime(clock.arrival_time) || "").slice(0, 5);
        const depart = clock.departure_time ? (AttendanceService.toIsoTime(clock.departure_time) || "").slice(0, 5) : "";
        const status = detailed.arrivalStatus?.status === "late" ? "En retard" : "Présent";
        const workedHours = (detailed.workedHours?.totalMinutes || 0) / 60;

        rows.push([teamName, empName, dayKey, arrivee, depart, status, String(Math.round(workedHours * 100) / 100)]);
      });
    });

    downloadCsvFile(`rapport_equipe_${sanitizeFilenamePart(teamName)}_${selectedMonthKey}.csv`, header, rows, {
      separator: ",",
      excelSeparatorHint: true
    });
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

  const pageTitleStyle = useMemo(
    () =>
      styles.mergeStyles(styles.profile.title, {
        textAlign: "center",
        width: "100%",
        marginBottom: "12px"
      }),
    []
  );

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
      case "Historique":
        return (
          <div style={styles.dashboard.contentContainer}>
            <h2 style={pageTitleStyle}>📅 Historique</h2>
            <Historique
              userId={currentUser?.userId ?? currentUser?.user_id}
              token={token}
            />
          </div>
        );

      case "Tableau de bord":
        return (
          <div style={styles.dashboard.contentContainer}>
            <h2 style={pageTitleStyle}>📊 Tableau de bord Manager</h2>

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
                        <option value="all">Toutes mes équipes</option>
                        {(managedTeams || []).map((t) => (
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
                        const statusInfo = todayStatusByUserId[emp.user_id] || {};
                        const status = statusInfo.status || "—";
                        const lateMinutes = statusInfo.lateMinutes || 0;
                        const arrival = statusInfo.clock?.arrival_time ? formatClockTime(statusInfo.clock.arrival_time) : "";
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
                                {teamName}
                                {emp.email ? ` · ${emp.email}` : ""}
                                {emp.phone_number ? ` · ${emp.phone_number}` : ""}
                                {arrival ? ` · Arrivée: ${arrival}` : ""}
                              </div>
                            </div>

                            <span style={styles.mergeStyles(styles.history.statusBadge, getBadgeStyle(status))}>
                              {status === "En retard" && lateMinutes ? `En retard (+${lateMinutes}m)` : status}
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
            <h2 style={pageTitleStyle}>👥 Gestion de l'équipe</h2>
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
                        <option value="all">Toutes mes équipes</option>
                        {(managedTeams || []).map((t) => (
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
                        const statusInfo = todayStatusByUserId[emp.user_id] || {};
                        const status = statusInfo.status || "—";
                        const lateMinutes = statusInfo.lateMinutes || 0;
                        const arrival = statusInfo.clock?.arrival_time ? formatClockTime(statusInfo.clock.arrival_time) : "";
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
                              <div style={{ fontSize: "12px", opacity: 0.7 }}>
                                {teamName}
                                {emp.email ? ` · ${emp.email}` : ""}
                                {arrival ? ` · Arrivée: ${arrival}` : ""}
                              </div>
                            </div>

                            <span style={styles.mergeStyles(styles.history.statusBadge, getBadgeStyle(status))}>
                              {status === "En retard" && lateMinutes ? `En retard (+${lateMinutes}m)` : status}
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
            <h2 style={pageTitleStyle}>📈 Statistiques de l'équipe</h2>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginBottom: "12px", flexWrap: "wrap" }}>
              <select
                value={selectedMonthKey}
                onChange={(e) => setSelectedMonthKey(e.target.value)}
                style={styles.history.monthSelector}
                aria-label="Mois sélectionné"
              >
                {monthOptions.map((opt) => (
                  <option key={opt.key} value={opt.key}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            {loadingTeam || presenceLoading || monthKpisLoading || monthTeamsLoading ? (
              <p>Chargement...</p>
            ) : (
              <>
                <div style={styles.profile.infoCard}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                    <div style={styles.profile.infoTitle}>
                      {presencePeriod === "today" ? "Présences (aujourd'hui)" : `Présences (${selectedMonthLabel})`}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                      <select
                        value={presencePeriod}
                        onChange={(e) => setPresencePeriod(e.target.value)}
                        style={styles.history.monthSelector}
                        aria-label="Période des présences"
                      >
                        <option value="today">Aujourd'hui</option>
                        <option value="month">Mois</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ marginTop: "12px" }}>
                    {(() => {
                      if (presencePeriod === "month") {
                        const total = (allEmployees || []).length;
                        const sumActive = Object.values(monthActiveUsersByTeamId || {}).reduce(
                          (acc, v) => acc + (Number(v) || 0),
                          0
                        );
                        const active = Math.min(total, Math.max(0, sumActive));
                        const inactive = Math.max(0, total - active);
                        return (
                          <DonutChart
                            segments={[
                              { label: "Ont pointé", value: active, color: styles.history.statusBadgeComplete.background },
                              { label: "Sans pointage", value: inactive, color: styles.history.statusBadgeIncomplete.background }
                            ]}
                            centerLabel={String(total || 0)}
                            centerSubLabel="employés"
                          />
                        );
                      }

                      const counts = statusCountsFromRows(allPresenceRows);
                      return (
                        <DonutChart
                          segments={[
                            { label: "Présent", value: counts.present, color: styles.history.statusBadgeComplete.background },
                            { label: "En retard", value: counts.late, color: "#facc15" },
                            { label: "Absent", value: counts.absent, color: styles.history.statusBadgeIncomplete.background }
                          ]}
                          centerLabel={String(counts.total || 0)}
                          centerSubLabel="employés"
                        />
                      );
                    })()}
                  </div>
                </div>

                <div style={styles.profile.infoCard}>
                  <div style={styles.profile.infoTitle}>
                    {presencePeriod === "today" ? "Présences par équipe (aujourd'hui)" : `Présences par équipe (${selectedMonthLabel})`}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
                    {(managedTeams || []).length ? (
                      (managedTeams || []).map((team) => {
                        if (presencePeriod === "month") {
                          const teamTotal = (allEmployees || []).filter((u) => u.team_id === team.team_id).length;
                          const active = Math.min(teamTotal, Math.max(0, Number(monthActiveUsersByTeamId[team.team_id]) || 0));
                          const inactive = Math.max(0, teamTotal - active);
                          if (!teamTotal) return null;
                          const counts = { total: teamTotal, present: active, late: 0, absent: inactive };

                          return (
                            <div key={team.team_id} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                                <div style={{ fontWeight: 700 }}>{team.name}</div>
                                <div style={{ fontSize: "12px", opacity: 0.75 }}>
                                  Total: {counts.total} · Ont pointé: {counts.present} · Sans pointage: {counts.absent}
                                </div>
                              </div>
                              {renderStackedBar(counts)}
                            </div>
                          );
                        }

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
                    <div style={styles.profile.infoTitle}>{`Indicateurs (${selectedMonthLabel})`}</div>
                  </div>

                  <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "12px" }}>
                    <div style={styles.resume.card}>
                      <div style={styles.resume.cardContent}>
                        <div style={styles.resume.cardLabel}>Heures totales</div>
                        <div style={styles.resume.cardValue}>{formatDuration(monthKpis.totalWorkedTime)}</div>
                      </div>
                    </div>
                    <div style={styles.resume.card}>
                      <div style={styles.resume.cardContent}>
                        <div style={styles.resume.cardLabel}>Moyenne / salarié</div>
                        <div style={styles.resume.cardValue}>{formatDuration(monthKpis.averageWorkedTime)}</div>
                      </div>
                    </div>
                    <div style={styles.resume.card}>
                      <div style={styles.resume.cardContent}>
                        <div style={styles.resume.cardLabel}>Taux de retard</div>
                        <div style={styles.resume.cardValue}>{formatPercent(monthKpis.lateRate)}</div>
                      </div>
                    </div>
                    <div style={styles.resume.card}>
                      <div style={styles.resume.cardContent}>
                        <div style={styles.resume.cardLabel}>Salariés actifs</div>
                        <div style={styles.resume.cardValue}>{monthKpis.activeUsers}</div>
                      </div>
                    </div>
                    <div style={styles.resume.card}>
                      <div style={styles.resume.cardContent}>
                        <div style={styles.resume.cardLabel}>Pointages incomplets</div>
                        <div style={styles.resume.cardValue}>{monthKpis.incompleteClocks}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={styles.profile.infoCard}>
                  <div style={styles.profile.infoTitle}>Salariés gérés (aujourd'hui)</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
                    {(allEmployees || [])
                      .slice()
                      .sort((a, b) => {
                        const an = `${a.last_name || ""} ${a.first_name || ""}`.toLowerCase();
                        const bn = `${b.last_name || ""} ${b.first_name || ""}`.toLowerCase();
                        return an.localeCompare(bn);
                      })
                      .map((emp) => {
                        const entry = todayStatusByUserId[emp.user_id] || { status: "—", clock: null, lateMinutes: 0 };
                        const status = entry.status || "—";
                        const arrival = entry.clock?.arrival_time ? formatClockTime(entry.clock.arrival_time) : "";

                        return (
                          <div
                            key={emp.user_id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: "12px",
                              padding: "12px 14px",
                              borderRadius: "12px",
                              background: "#f8fafc",
                              border: "1px solid #e2e8f0"
                            }}
                          >
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                              <div style={{ fontWeight: 700 }}>
                                {emp.first_name} {emp.last_name}
                              </div>
                              <div style={{ fontSize: "12px", opacity: 0.75 }}>
                                {teamsById.get(emp.team_id)?.name || "—"}
                                {arrival ? ` · Arrivée: ${arrival}` : ""}
                              </div>
                            </div>
                            <span style={styles.mergeStyles(styles.history.statusBadge, getBadgeStyle(status))}>{status}</span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </>
            )}
          </div>
        );
      
      case "Émargements":
        return (
          <div style={styles.dashboard.contentContainer}>
            <h2 style={pageTitleStyle}>✅ Validation des émargements</h2>
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
                      <option value="all">Toutes mes équipes</option>
                      {(managedTeams || []).map((t) => (
                        <option key={t.team_id} value={String(t.team_id)}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
                    {sortedFilteredEmployees.length ? (
                      sortedFilteredEmployees.map((emp) => {
                        const status = todayStatusByUserId[emp.user_id]?.status || "—";
                        const clocks = clocksByUserId[emp.user_id] || [];
                        const todayClock = ClocksApi.getTodayClock(clocks, emp.user_id);
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

                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <button
                                style={styles.mergeStyles(styles.dashboard.editProfileBtn, { padding: "6px 10px", fontSize: "12px" })}
                                onClick={() => setFicheEmployee({ employee: emp, teamName })}
                              >
                                Fiche
                              </button>
                              <span style={styles.mergeStyles(styles.history.statusBadge, getBadgeStyle(status))}>
                                {status}
                              </span>
                            </div>
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
            <h2 style={pageTitleStyle}>⏱️ Pointage</h2>
            <Pointage
              userId={currentUser?.userId ?? currentUser?.user_id}
              token={token}
              onTimeUpdate={() => setPresenceRefreshNonce((n) => n + 1)}
            />
          </div>
        );
      
      case "Rapports":
        return (
          <div style={styles.dashboard.contentContainer}>
            <h2 style={pageTitleStyle}>📄 Rapports</h2>
            {loadingTeam || presenceLoading ? (
              <p>Chargement...</p>
            ) : (
              <>
                <div style={styles.profile.infoCard}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                    <div style={styles.profile.infoTitle}>Télécharger rapports par équipe</div>
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
                    {(managedTeams || []).length ? (
                      (managedTeams || []).map((team) => {
                        const teamId = team?.team_id;
                        const employees = (allEmployees || []).filter((u) => Number(u.team_id) === Number(teamId));
                        const count = employees.length;

                        return (
                          <div
                            key={teamId}
                            style={styles.mergeStyles(
                              {
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "14px 16px",
                                borderRadius: "8px",
                                border: "1px solid #e2e8f0",
                                background: "#fff"
                              },
                              {}
                            )}
                          >
                            <div>
                              <div style={{ fontWeight: 700 }}>{team?.name || `Équipe ${teamId}`}</div>
                              <div style={{ fontSize: "12px", opacity: 0.75 }}>
                                {count} employé{count > 1 ? "s" : ""}
                              </div>
                            </div>

                            <button style={styles.dashboard.navTab} onClick={() => downloadTeamCsv(team)}>
                              Télécharger CSV
                            </button>
                          </div>
                        );
                      })
                    ) : (
                      <p>Aucune équipe.</p>
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
      {!!ficheEmployee && (
        <EmployeeFicheModal
          employee={ficheEmployee.employee}
          teamName={ficheEmployee.teamName}
          clocks={clocksByUserId[ficheEmployee.employee.user_id] || []}
          todayStatus={todayStatusByUserId[ficheEmployee.employee.user_id]}
          monthKey={selectedMonthKey}
          onExportCsv={() => downloadEmployeeCsv(ficheEmployee.employee)}
          onClose={() => setFicheEmployee(null)}
        />
      )}
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
          {["Pointage", "Historique", "Tableau de bord", "Mon équipe", "Statistiques", "Émargements", "Rapports"].map((tab) => (
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
              {tab === "Historique" && "📅"}
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
