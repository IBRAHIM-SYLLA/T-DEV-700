import React, { useState, useEffect } from "react";
import styles from "../../style/style.ts";
import AttendanceService from "../../../services/AttendanceService";
import ClocksApi from "../../../services/ClocksApi";

export default function MonResume({ userId = 3, token }) {
  const [weeklyData, setWeeklyData] = useState({
    totalHours: 0,
    overtimeHours: 0,
    daysWorked: 0,
    totalDays: 5
  });

  const [weekDays, setWeekDays] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedMonthKey, setSelectedMonthKey] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  const [monthlyData, setMonthlyData] = useState({
    totalHours: 0,
    overtimeHours: 0,
    daysWorked: 0,
    delays: 0
  });

  // Calculer la semaine courante (Lundi - Vendredi)
  const getCurrentWeekDates = () => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Dimanche, 1 = Lundi, ...
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Lundi de cette semaine
    
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    
    const dates = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };

  // Charger les données de la semaine
  const loadWeekData = async () => {
    try {
      setLoading(true);
      const weekDates = getCurrentWeekDates();
      const dayNames = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
      
      // Récupérer les pointages réels depuis l'API
      const allClocks = await ClocksApi.listForUser(userId, { token });

      // ===== Mensuel (basé sur le mois sélectionné) =====
      const monthClocks = (allClocks || [])
        .filter((c) => AttendanceService.toIsoDateKey(c.arrival_time)?.startsWith(selectedMonthKey))
        .filter((c) => c.departure_time);

      const monthTotals = monthClocks.reduce(
        (acc, clock) => {
          const detailed = AttendanceService.getClockDetailedStatus(clock, null);
          const workedMinutes = detailed.workedHours?.totalMinutes || 0;
          const workedHours = workedMinutes / 60;
          const overtime = Math.max(0, workedHours - 7);
          const isDelay = detailed.arrivalStatus?.status === "late";

          acc.totalHours += workedHours;
          acc.overtimeHours += overtime;
          acc.daysWorked += 1;
          if (isDelay) acc.delays += 1;
          return acc;
        },
        { totalHours: 0, overtimeHours: 0, daysWorked: 0, delays: 0 }
      );

      setMonthlyData({
        totalHours: monthTotals.totalHours,
        overtimeHours: monthTotals.overtimeHours,
        daysWorked: monthTotals.daysWorked,
        delays: monthTotals.delays
      });
      
      // Mapper chaque jour de la semaine
      const weekData = weekDates.map((date, index) => {
        const dateStr = AttendanceService.toIsoDateKey(date);
        
        // Trouver les pointages pour ce jour
        const dayClocks = allClocks.filter(clock => 
          AttendanceService.toIsoDateKey(clock.arrival_time) === dateStr
        );
        
        if (dayClocks.length === 0) {
          return {
            day: dayNames[index],
            date: dateStr,
            clockIn: "--:--",
            clockOut: "--:--",
            worked: 0,
            overtime: 0,
            present: false,
            attendanceStatus: null
          };
        }
        
        // Prendre le premier pointage du jour
        const clock = dayClocks[0];
        const clockIn = (AttendanceService.toIsoTime(clock.arrival_time) || "--:--").substring(0, 5);
        const clockOut = clock.departure_time ? (AttendanceService.toIsoTime(clock.departure_time) || "--:--").substring(0, 5) : "--:--";
        
        // Calculer le statut détaillé avec AttendanceService
        const detailedStatus = AttendanceService.getClockDetailedStatus(clock, null);
        
        // Calculer les heures supplémentaires (> 7h)
        const workedTotalMinutes = detailedStatus.workedHours?.totalMinutes || 0;
        const overtime = Math.max(0, (workedTotalMinutes / 60) - 7);
        
        return {
          day: dayNames[index],
          date: dateStr,
          clockIn,
          clockOut,
          worked: workedTotalMinutes / 60,
          overtime,
          present: true,
          attendanceStatus: detailedStatus.arrivalStatus.status === 'late' 
            ? (detailedStatus.arrivalStatus.duringBreak 
                ? `Retard (pause déj)` 
                : `Retard (+${detailedStatus.arrivalStatus.lateMinutes}min)`)
            : "À l'heure"
        };
      });
      
      setWeekDays(weekData);
      
      // Calculer les totaux
      const totalHours = weekData.reduce((sum, day) => sum + day.worked, 0);
      const totalOvertime = weekData.reduce((sum, day) => sum + day.overtime, 0);
      const daysWorked = weekData.filter(day => day.present).length;
      
      setWeeklyData({
        totalHours,
        overtimeHours: totalOvertime,
        daysWorked,
        totalDays: 5
      });
      
    } catch (error) {
      console.error("Erreur chargement résumé:", error);
    } finally {
      setLoading(false);
    }
  };

  // Charger au montage
  useEffect(() => {
    loadWeekData();
  }, [userId, selectedMonthKey, token]);

  const monthOptions = (() => {
    const now = new Date();
    const options = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
      options.push({ key, label });
    }
    return options;
  })();

  const formatDuration = (hours) => {
    if (hours === 0) return "0h 00m";
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h}h ${m.toString().padStart(2, '0')}m`;
  };

  if (loading) {
    return (
      <div style={styles.resume.container}>
        <h2 style={styles.resume.title}>Mon résumé hebdomadaire</h2>
        <div style={{ textAlign: 'center', padding: '40px' }}>Chargement...</div>
      </div>
    );
  }

  return (
    <div style={styles.resume.container}>
      <h2 style={styles.resume.title}>Mon résumé hebdomadaire</h2>
      
      <div style={styles.resume.cards}>
        <div style={styles.resume.card}>
          <div style={styles.resume.cardIcon}>⏰</div>
          <div style={styles.resume.cardContent}>
            <div style={styles.resume.cardLabel}>Heures travaillées</div>
            <div style={styles.resume.cardValue}>{formatDuration(weeklyData.totalHours)}</div>
          </div>
        </div>
        
        <div style={styles.resume.card}>
          <div style={styles.resume.cardIcon}>💰</div>
          <div style={styles.resume.cardContent}>
            <div style={styles.resume.cardLabel}>Heures supplémentaires</div>
            <div style={styles.mergeStyles(styles.resume.cardValue, styles.resume.cardValueOvertime)}>
              {formatDuration(weeklyData.overtimeHours)}
            </div>
          </div>
        </div>
        
        <div style={styles.resume.card}>
          <div style={styles.resume.cardIcon}>📅</div>
          <div style={styles.resume.cardContent}>
            <div style={styles.resume.cardLabel}>Jours présents</div>
            <div style={styles.resume.cardValue}>{weeklyData.daysWorked}/{weeklyData.totalDays}</div>
          </div>
        </div>
      </div>

      <div style={styles.resume.weekDetail}>
        <h3 style={styles.resume.weekTitle}>Détail de la semaine</h3>
        
        <div style={styles.resume.weekDays}>
          {weekDays.map((dayData, index) => (
            <div key={index} style={styles.resume.dayRow}>
              <div style={styles.resume.dayInfo}>
                <div style={styles.mergeStyles(
                  styles.resume.dayIndicator,
                  dayData.present ? styles.resume.dayIndicatorActive : {}
                )}></div>
                <span style={styles.resume.dayName}>{dayData.day}</span>
              </div>
              <div style={styles.resume.dayTimes}>
                <span style={styles.resume.timeRange}>
                  {dayData.present ? `${dayData.clockIn} - ${dayData.clockOut || '--:--'}` : 'Absent'}
                </span>
                {/* Statut de ponctualité */}
                {dayData.present && (
                  <span style={{
                    ...styles.resume.attendanceStatus,
                    ...(dayData.attendanceStatus && dayData.attendanceStatus.includes("Retard") 
                      ? styles.resume.attendanceStatusLate 
                      : styles.resume.attendanceStatusOnTime)
                  }}>
                    {dayData.attendanceStatus || "À l'heure"}
                  </span>
                )}
                <span style={styles.resume.hoursWorked}>
                  {dayData.present ? formatDuration(dayData.worked) : '--:--'}
                </span>
                <span style={styles.resume.overtime}>
                  {dayData.overtime > 0 ? `+${formatDuration(dayData.overtime)}` : ''}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        <div style={styles.resume.overtimeSummary}>
          <div style={styles.resume.overtimeText}>
            <span style={styles.resume.overtimeLabel}>Total heures supplémentaires</span>
            <span style={styles.resume.overtimeNote}>Rémunération majorée à 125%</span>
          </div>
          <div style={styles.resume.overtimeTotal}>{formatDuration(weeklyData.overtimeHours)}</div>
        </div>
      </div>

      <div style={styles.resume.weekDetail}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
          <h3 style={styles.resume.weekTitle}>Mon résumé mensuel</h3>
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

        <div style={styles.resume.cards}>
          <div style={styles.resume.card}>
            <div style={styles.resume.cardIcon}>⏱️</div>
            <div style={styles.resume.cardContent}>
              <div style={styles.resume.cardLabel}>Heures totales</div>
              <div style={styles.resume.cardValue}>{formatDuration(monthlyData.totalHours)}</div>
            </div>
          </div>

          <div style={styles.resume.card}>
            <div style={styles.resume.cardIcon}>💰</div>
            <div style={styles.resume.cardContent}>
              <div style={styles.resume.cardLabel}>Heures sup.</div>
              <div style={styles.mergeStyles(styles.resume.cardValue, styles.resume.cardValueOvertime)}>
                {formatDuration(monthlyData.overtimeHours)}
              </div>
            </div>
          </div>

          <div style={styles.resume.card}>
            <div style={styles.resume.cardIcon}>📅</div>
            <div style={styles.resume.cardContent}>
              <div style={styles.resume.cardLabel}>Jours pointés</div>
              <div style={styles.resume.cardValue}>{monthlyData.daysWorked}</div>
            </div>
          </div>

          <div style={styles.resume.card}>
            <div style={styles.resume.cardIcon}>⚠️</div>
            <div style={styles.resume.cardContent}>
              <div style={styles.resume.cardLabel}>Retards</div>
              <div style={styles.resume.cardValue}>{monthlyData.delays}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}