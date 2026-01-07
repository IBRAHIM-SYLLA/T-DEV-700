import React, { useState, useEffect } from "react";
import styles from "../../style/style.ts";
import AttendanceService from "../../../services/AttendanceService";
import ClocksApi from "../../../services/ClocksApi";

export default function Historique({ timeData, userId }) {
  const [selectedMonth, setSelectedMonth] = useState("Ce mois");
  const [historyRecords, setHistoryRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const [monthlyStats, setMonthlyStats] = useState({
    daysWorked: 0,
    totalHours: 0,
    overtimeHours: 0,
    delays: 0
  });

  const CURRENT_USER_ID = userId || 3;

  // Charger / rafraîchir l'historique (backend)
  useEffect(() => {
    let cancelled = false;
    let intervalId = null;

    const refresh = async () => {
      if (cancelled) return;
      await loadAttendanceHistory();
    };

    const onVisibilityOrFocus = () => {
      if (document.visibilityState === "visible") refresh();
    };

    refresh();
    intervalId = setInterval(refresh, 7_200_000);
    window.addEventListener("focus", onVisibilityOrFocus);
    document.addEventListener("visibilitychange", onVisibilityOrFocus);

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
      window.removeEventListener("focus", onVisibilityOrFocus);
      document.removeEventListener("visibilitychange", onVisibilityOrFocus);
    };
  }, [selectedMonth, CURRENT_USER_ID]);

  const loadAttendanceHistory = async () => {
    try {
      setLoading(true);
      
      // Récupérer les données
      const clocks = await ClocksApi.listForUser(CURRENT_USER_ID);
      
      // Convertir les pointages en historique avec calculs
      const history = clocks
        .filter(clock => clock.departure_time) // Seulement les journées complètes
        .map(clock => {
          const clockDate = AttendanceService.toIsoDateKey(clock.arrival_time);
          
          // Obtenir le statut détaillé
          const detailedStatus = AttendanceService.getClockDetailedStatus(clock, null);

          const workedTotalMinutes = detailedStatus.workedHours?.totalMinutes || 0;
          const workedHours = workedTotalMinutes / 60;
          const overtimeHours = Math.max(0, workedHours - 7);
          
          // Formater la date
          const [year, month, day] = clockDate.split('-');
          const formattedDate = `${day}/${month}/${year}`;
          
          // Déterminer le statut avec vérification de la pause déjeuner
          let status = 'À l\'heure';
          let lateMinutes = 0;
          
          if (detailedStatus.arrivalStatus) {
            if (detailedStatus.arrivalStatus.status === 'late') {
              status = 'Retard';
              lateMinutes = detailedStatus.arrivalStatus.lateMinutes;
              
              // Si pointé pendant la pause, ajouter un indicateur
              if (detailedStatus.arrivalStatus.duringBreak) {
                status = 'Retard (pause déj)';
              }
            }
          }
          
          return {
            date: formattedDate,
            clockIn: (AttendanceService.toIsoTime(clock.arrival_time) || '--:--').substring(0, 5),
            clockOut: (AttendanceService.toIsoTime(clock.departure_time) || '--:--').substring(0, 5),
            duration: workedHours || 0,
            overtime: overtimeHours,
            status: status,
            lateMinutes: lateMinutes,
            earlyMinutes: detailedStatus.arrivalStatus?.earlyMinutes || 0,
            expectedArrival: detailedStatus.expectedArrival,
            rawDate: clockDate
          };
        })
        .sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate)); // Trier par date décroissante
      
      setHistoryRecords(history);
      setFilteredRecords(filterRecords(history, selectedMonth));
      setLoading(false);
    } catch (error) {
      console.error("Erreur chargement historique:", error);
      setLoading(false);
    }
  };

  // Update statistics when filtered records change
  useEffect(() => {
    if (filteredRecords.length > 0) {
      const totalDays = filteredRecords.length;
      const totalHours = filteredRecords.reduce((sum, record) => sum + record.duration, 0);
      const totalOvertime = filteredRecords.reduce((sum, record) => sum + record.overtime, 0);
      const delays = filteredRecords.filter(record => String(record.status).startsWith("Retard")).length;
      
      setMonthlyStats({
        daysWorked: totalDays,
        totalHours: Math.round(totalHours),
        overtimeHours: Math.round(totalOvertime),
        delays
      });
    } else {
      // Reset stats when no records match filter
      setMonthlyStats({
        daysWorked: 0,
        totalHours: 0,
        overtimeHours: 0,
        delays: 0
      });
    }
  }, [filteredRecords]);

  const formatDuration = (hours) => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h}h ${m.toString().padStart(2, '0')}m`;
  };

  // Filter records based on selected period
  const filterRecords = (records, period) => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    return records.filter(record => {
      // Parse date from "DD/MM/YYYY" format
      const dateParts = record.date.split('/');
      const recordDate = new Date(parseInt(dateParts[2]), parseInt(dateParts[1]) - 1, parseInt(dateParts[0]));
      
      switch (period) {
        case "Ce mois":
          return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
          
        case "Mois précédent":
          const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
          const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
          return recordDate.getMonth() === prevMonth && recordDate.getFullYear() === prevYear;
          
        case "Dernier 3 mois":
          const threeMonthsAgo = new Date(today);
          threeMonthsAgo.setMonth(today.getMonth() - 3);
          return recordDate >= threeMonthsAgo && recordDate <= today;
          
        default:
          return true;
      }
    });
  };

  const handleMonthChange = (event) => {
    const newPeriod = event.target.value;
    setSelectedMonth(newPeriod);
    const filtered = filterRecords(historyRecords, newPeriod);
    setFilteredRecords(filtered);
  };

  return (
    <div style={styles.history.container}>
      <div style={styles.history.content}>
        <div style={styles.history.header}>
          <h2 style={styles.history.title}>Mon historique</h2>
          <select 
            style={styles.history.monthSelector}
            value={selectedMonth}
            onChange={handleMonthChange}
          >
            <option>Ce mois</option>
            <option>Mois précédent</option>
            <option>Dernier 3 mois</option>
          </select>
        </div>
        
        {loading ? (
          <p>Chargement...</p>
        ) : (
          <div style={styles.history.tableContainer}>
            <table style={styles.history.table}>
              <thead>
                <tr>
                  <th style={styles.history.th}>DATE</th>
                  <th style={styles.history.th}>ARRIVÉE</th>
                  <th style={styles.history.th}>DÉPART</th>
                  <th style={styles.history.th}>DURÉE</th>
                  <th style={styles.history.th}>STATUT</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((record, index) => (
                    <tr key={index}>
                      <td style={styles.history.td}>{record.date}</td>
                      <td style={styles.history.td}>
                        {record.clockIn}
                        {record.expectedArrival && (
                          <span style={{opacity: 0.6, fontSize: '0.85em'}}> (prévu: {record.expectedArrival})</span>
                        )}
                      </td>
                      <td style={styles.history.td}>{record.clockOut}</td>
                      <td style={styles.history.td}>{formatDuration(record.duration)}</td>
                      <td style={styles.history.td}>
                        <span style={styles.mergeStyles(
                          styles.history.statusBadge,
                          record.status.includes('À l\'heure') ? styles.history.statusBadgeComplete :
                          styles.history.statusBadgeDelay
                        )}>
                          {record.status.includes('Retard') ? 
                            `⚠️ ${record.status} (+${record.lateMinutes}min)` : 
                            '✅ À l\'heure'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{...styles.history.td, textAlign: 'center', padding: '2rem'}}>
                      Aucun enregistrement pour cette période
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        
        <div style={styles.history.monthlySummary}>
          <h3 style={styles.history.summaryTitle}>Résumé mensuel</h3>
          <div style={styles.history.summaryCards}>
            <div style={styles.history.summaryCard}>
              <div style={styles.history.summaryNumber}>{monthlyStats.daysWorked}</div>
              <div style={styles.history.summaryLabel}>Jours travaillés</div>
            </div>
            <div style={styles.history.summaryCard}>
              <div style={styles.history.summaryNumber}>{monthlyStats.totalHours}h</div>
              <div style={styles.history.summaryLabel}>Heures totales</div>
            </div>
            <div style={styles.history.summaryCard}>
              <div style={styles.mergeStyles(styles.history.summaryNumber, styles.history.summaryNumberOvertime)}>
                {monthlyStats.overtimeHours}h
              </div>
              <div style={styles.history.summaryLabel}>Heures sup.</div>
            </div>
            <div style={styles.history.summaryCard}>
              <div style={styles.mergeStyles(styles.history.summaryNumber, styles.history.summaryNumberDelay)}>
                {monthlyStats.delays}
              </div>
              <div style={styles.history.summaryLabel}>Retards</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
