import React, { useState, useEffect } from "react";
import styles from "../../style/style.ts";

export default function Historique({ timeData }) {
  const [selectedMonth, setSelectedMonth] = useState("Ce mois");
  const [historyRecords, setHistoryRecords] = useState([]);

  const [monthlyStats, setMonthlyStats] = useState({
    daysWorked: 0,
    totalHours: 0,
    overtimeHours: 0,
    delays: 0
  });

  // Load history from localStorage on component mount
  useEffect(() => {
    const history = JSON.parse(localStorage.getItem('timeTrack_history') || '[]');
    
    // Add some default demo data if no history exists
    if (history.length === 0) {
      const demoData = [
        {
          date: "14/01/2025",
          clockIn: "08:15",
          clockOut: "17:30",
          duration: 8.75,
          overtime: 0.75,
          status: "Complet"
        },
        {
          date: "13/01/2025",
          clockIn: "08:45",
          clockOut: "17:30",
          duration: 8.25,
          overtime: 0.25,
          status: "Retard"
        },
        {
          date: "12/01/2025",
          clockIn: "08:00",
          clockOut: "17:00",
          duration: 8.0,
          overtime: 0,
          status: "Complet"
        }
      ];
      localStorage.setItem('timeTrack_history', JSON.stringify(demoData));
      setHistoryRecords(demoData);
    } else {
      setHistoryRecords(history);
    }
  }, []);

  // Update statistics when history changes
  useEffect(() => {
    if (historyRecords.length > 0) {
      const totalDays = historyRecords.length;
      const totalHours = historyRecords.reduce((sum, record) => sum + record.duration, 0);
      const totalOvertime = historyRecords.reduce((sum, record) => sum + record.overtime, 0);
      const delays = historyRecords.filter(record => record.status === "Retard").length;
      
      setMonthlyStats({
        daysWorked: totalDays,
        totalHours: Math.round(totalHours),
        overtimeHours: Math.round(totalOvertime),
        delays
      });
    }
  }, [historyRecords]);

  // Add today's record if timeData is provided and complete
  useEffect(() => {
    // Reload history from localStorage when timeData changes (after clock out)
    if (timeData && timeData.clockOutTime) {
      const history = JSON.parse(localStorage.getItem('timeTrack_history') || '[]');
      setHistoryRecords(history);
    }
  }, [timeData]);

  const formatDuration = (hours) => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h}h ${m.toString().padStart(2, '0')}m`;
  };

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
    // Here you could filter records based on selected month
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
        
        <div style={styles.history.tableContainer}>
          <table style={styles.history.table}>
            <thead>
              <tr>
                <th style={styles.history.th}>DATE</th>
                <th style={styles.history.th}>ARRIVÉE</th>
                <th style={styles.history.th}>DÉPART</th>
                <th style={styles.history.th}>DURÉE</th>
                <th style={styles.history.th}>H. SUP.</th>
                <th style={styles.history.th}>STATUT</th>
              </tr>
            </thead>
            <tbody>
              {historyRecords.map((record, index) => (
                <tr key={index}>
                  <td style={styles.history.td}>{record.date}</td>
                  <td style={styles.history.td}>{record.clockIn}</td>
                  <td style={styles.history.td}>{record.clockOut}</td>
                  <td style={styles.history.td}>{formatDuration(record.duration)}</td>
                  <td style={styles.mergeStyles(styles.history.td, styles.history.overtimeCell)}>
                    {record.overtime > 0 ? formatDuration(record.overtime) : '-'}
                  </td>
                  <td style={styles.history.td}>
                    <span style={styles.mergeStyles(
                      styles.history.statusBadge,
                      record.status.toLowerCase() === 'complet' ? styles.history.statusBadgeComplete :
                      record.status.toLowerCase() === 'retard' ? styles.history.statusBadgeDelay :
                      styles.history.statusBadgeIncomplete
                    )}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
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