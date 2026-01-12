import React, { useMemo } from "react";
import styles from "../../src/style/style.ts";
import AttendanceService from "../../services/AttendanceService";
import WaterfallChart from "../../src/components/WaterfallChart.jsx";

function formatClockTime(value) {
  const t = AttendanceService.toIsoTime(value);
  return t ? t.slice(0, 5) : "";
}

export default function EmployeeFicheModal({ employee, teamName, clocks, todayStatus, monthKey, onClose, onExportCsv }) {
  const monthClocks = useMemo(() => {
    const list = Array.isArray(clocks) ? clocks : [];
    return list
      .filter((c) => AttendanceService.toIsoDateKey(c.arrival_time)?.startsWith(monthKey))
      .slice()
      .sort((a, b) => String(b.arrival_time).localeCompare(String(a.arrival_time)));
  }, [clocks, monthKey]);

  const monthStats = useMemo(() => {
    let totalMinutes = 0;
    let completeDays = 0;
    let incompleteDays = 0;
    let delays = 0;

    const byDay = new Map();

    monthClocks.forEach((clock) => {
      const dayKey = AttendanceService.toIsoDateKey(clock.arrival_time);
      if (!dayKey) return;
      if (!byDay.has(dayKey)) byDay.set(dayKey, []);
      byDay.get(dayKey).push(clock);

      if (!clock.departure_time) return;
      const detailed = AttendanceService.getClockDetailedStatus(clock, null);
      const worked = detailed?.workedHours?.totalMinutes || 0;
      totalMinutes += Math.max(0, worked);
      completeDays += 1;
      if (detailed?.arrivalStatus?.status === "late") delays += 1;
    });

    // day considered incomplete if there is any clock without departure that day
    for (const clocksOfDay of byDay.values()) {
      if ((clocksOfDay || []).some((c) => c && !c.departure_time)) incompleteDays += 1;
    }

    const totalHours = totalMinutes / 60;
    const overtimeHours = Math.max(0, totalHours - completeDays * 7);

    return { totalHours, overtimeHours, completeDays, incompleteDays, delays };
  }, [monthClocks]);

  const waterfall = useMemo(() => {
    const byDay = new Map();
    (monthClocks || []).forEach((clock) => {
      const dayKey = AttendanceService.toIsoDateKey(clock.arrival_time);
      if (!dayKey) return;
      if (!byDay.has(dayKey)) byDay.set(dayKey, []);
      byDay.get(dayKey).push(clock);
    });

    const dayKeys = Array.from(byDay.keys()).sort((a, b) => a.localeCompare(b));

    const points = dayKeys.map((dayKey) => {
      const clocksOfDay = byDay.get(dayKey) || [];
      // Take last completed clock of the day
      const completed = clocksOfDay.filter((c) => c?.departure_time);
      if (!completed.length) return { label: dayKey.slice(8), delta: 0 };

      const minutes = completed.reduce((acc, c) => {
        const detailed = AttendanceService.getClockDetailedStatus(c, null);
        const worked = detailed?.workedHours?.totalMinutes || 0;
        return acc + Math.max(0, worked);
      }, 0);

      const hours = minutes / 60;
      const delta = hours - 7;
      return { label: dayKey.slice(8), delta: Number(delta.toFixed(2)) };
    });

    return points.slice(-15);
  }, [monthClocks]);

  const recent = useMemo(() => {
    return (monthClocks || []).slice(0, 10);
  }, [monthClocks]);

  if (!employee) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        zIndex: 1200
      }}
      onClick={onClose}
    >
      <div style={{ width: "min(980px, 100%)" }} onClick={(ev) => ev.stopPropagation()}>
        <div style={styles.profile.card}>
          <div style={styles.profile.cardHeader}>
            <div style={styles.profile.avatar}>👤</div>
            <div style={styles.profile.userInfo}>
              <h3 style={styles.profile.userName}>
                {employee.first_name} {employee.last_name}
              </h3>
              <span style={styles.profile.userRole}>Fiche salarié</span>
              <div style={{ fontSize: "12px", opacity: 0.75, marginTop: "4px" }}>
                {teamName || "Aucune équipe"}
                {employee.email ? ` · ${employee.email}` : ""}
                {employee.phone_number ? ` · ${employee.phone_number}` : ""}
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              {typeof onExportCsv === "function" && (
                <button style={styles.profile.saveBtn} onClick={onExportCsv}>
                  📤 Exporter CSV
                </button>
              )}
              <button style={styles.profile.cancelBtn} onClick={onClose}>
                Fermer
              </button>
            </div>
          </div>

          <div style={{ padding: "0 24px 24px" }}>
            <div style={styles.profile.infoCard}>
              <div style={styles.profile.infoTitle}>Statut du jour</div>
              <div style={{ marginTop: "10px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <div style={styles.resume.card}>
                  <div style={styles.resume.cardContent}>
                    <div style={styles.resume.cardLabel}>Statut</div>
                    <div style={styles.resume.cardValue}>{todayStatus?.status || "—"}</div>
                  </div>
                </div>
                <div style={styles.resume.card}>
                  <div style={styles.resume.cardContent}>
                    <div style={styles.resume.cardLabel}>Retard</div>
                    <div style={styles.resume.cardValue}>{todayStatus?.lateMinutes ? `${todayStatus.lateMinutes} min` : "0 min"}</div>
                  </div>
                </div>
              </div>
            </div>

            <div style={styles.profile.infoCard}>
              <div style={styles.profile.infoTitle}>Résumé ({monthKey})</div>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "12px" }}>
                <div style={styles.resume.card}>
                  <div style={styles.resume.cardContent}>
                    <div style={styles.resume.cardLabel}>Heures totales</div>
                    <div style={styles.resume.cardValue}>{AttendanceService.formatDuration(Math.round((monthStats.totalHours || 0) * 60))}</div>
                  </div>
                </div>
                <div style={styles.resume.card}>
                  <div style={styles.resume.cardContent}>
                    <div style={styles.resume.cardLabel}>Heures sup.</div>
                    <div style={styles.mergeStyles(styles.resume.cardValue, styles.resume.cardValueOvertime)}>
                      {AttendanceService.formatDuration(Math.round((monthStats.overtimeHours || 0) * 60))}
                    </div>
                  </div>
                </div>
                <div style={styles.resume.card}>
                  <div style={styles.resume.cardContent}>
                    <div style={styles.resume.cardLabel}>Jours complets</div>
                    <div style={styles.resume.cardValue}>{monthStats.completeDays}</div>
                  </div>
                </div>
                <div style={styles.resume.card}>
                  <div style={styles.resume.cardContent}>
                    <div style={styles.resume.cardLabel}>Jours incomplets</div>
                    <div style={styles.resume.cardValue}>{monthStats.incompleteDays}</div>
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

            <div style={styles.profile.infoCard}>
              <div style={styles.profile.infoTitle}>Activité (écart vs 7h / jour)</div>
              <div style={{ marginTop: "12px" }}>
                <WaterfallChart
                  deltas={waterfall.map((p) => p.delta)}
                  width={860}
                  height={180}
                />
                <div style={{ fontSize: "12px", opacity: 0.7, marginTop: "6px" }}>
                  Positif = au-dessus de 7h, négatif = en-dessous.
                </div>
              </div>
            </div>

            <div style={styles.profile.infoCard}>
              <div style={styles.profile.infoTitle}>Derniers pointages (mois)</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
                {recent.length ? (
                  recent.map((c) => {
                    const dayKey = AttendanceService.toIsoDateKey(c.arrival_time);
                    const arrivee = formatClockTime(c.arrival_time);
                    const depart = c.departure_time ? formatClockTime(c.departure_time) : "";
                    const detailed = c.departure_time ? AttendanceService.getClockDetailedStatus(c, null) : null;
                    const worked = detailed?.workedHours?.totalMinutes || 0;
                    return (
                      <div
                        key={c.clock_id || `${c.arrival_time}-${c.departure_time}`}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: "12px",
                          padding: "10px 12px",
                          borderRadius: "8px",
                          border: "1px solid #e2e8f0",
                          background: "#fff"
                        }}
                      >
                        <div style={{ fontWeight: 600 }}>{dayKey || "—"}</div>
                        <div style={{ fontSize: "12px", opacity: 0.8 }}>
                          Arrivée: {arrivee || "—"} · Départ: {depart || (c.departure_time ? "—" : "en cours")} · Temps: {worked ? AttendanceService.formatDuration(worked) : "—"}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p>Aucun pointage sur ce mois.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
