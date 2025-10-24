import React, { useState, useEffect } from "react";
import styles from "../../style/style.ts";

export default function Historique({ timeData }) {
  const [selectedMonth, setSelectedMonth] = useState("Ce mois");
  const [historyRecords, setHistoryRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);

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
      const today = new Date();
      const currentMonth = (today.getMonth() + 1).toString().padStart(2, '0');
      const prevMonth = today.getMonth() === 0 ? '12' : (today.getMonth()).toString().padStart(2, '0');
      const currentYear = today.getFullYear();
      const prevYear = today.getMonth() === 0 ? currentYear - 1 : currentYear;
      
      const demoData = [
        // Ce mois
        {
          date: `22/${currentMonth}/${currentYear}`,
          clockIn: "08:15",
          clockOut: "17:30",
          duration: 8.75,
          overtime: 0.75,
          status: "Complet"
        },
        {
          date: `21/${currentMonth}/${currentYear}`,
          clockIn: "08:45",
          clockOut: "17:30",
          duration: 8.25,
          overtime: 0.25,
          status: "Retard"
        },
        {
          date: `20/${currentMonth}/${currentYear}`,
          clockIn: "08:00",
          clockOut: "17:00",
          duration: 8.0,
          overtime: 0,
          status: "Complet"
        },
        // Mois précédent
        {
          date: `28/${prevMonth}/${prevYear}`,
          clockIn: "08:30",
          clockOut: "17:15",
          duration: 8.25,
          overtime: 0.25,
          status: "Complet"
        },
        {
          date: `27/${prevMonth}/${prevYear}`,
          clockIn: "09:00",
          clockOut: "18:00",
          duration: 8.5,
          overtime: 0.5,
          status: "Retard"
        },
        // Il y a 2 mois (pour test 3 mois)
        {
          date: `15/${(today.getMonth() - 1).toString().padStart(2, '0')}/${currentYear}`,
          clockIn: "08:00",
          clockOut: "16:30",
          duration: 7.5,
          overtime: 0,
          status: "Incomplet"
        }
      ];
      localStorage.setItem('timeTrack_history', JSON.stringify(demoData));
      setHistoryRecords(demoData);
      setFilteredRecords(filterRecords(demoData, selectedMonth));
    } else {
      setHistoryRecords(history);
      setFilteredRecords(filterRecords(history, selectedMonth));
    }
  }, []);

  // Update statistics when filtered records change
  useEffect(() => {
    if (filteredRecords.length > 0) {
      const totalDays = filteredRecords.length;
      const totalHours = filteredRecords.reduce((sum, record) => sum + record.duration, 0);
      const totalOvertime = filteredRecords.reduce((sum, record) => sum + record.overtime, 0);
      const delays = filteredRecords.filter(record => record.status === "Retard").length;
      
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

  // Add today's record if timeData is provided and complete
  useEffect(() => {
    // Reload history from localStorage when timeData changes (after clock out)
    if (timeData && timeData.clockOutTime) {
      const history = JSON.parse(localStorage.getItem('timeTrack_history') || '[]');
      setHistoryRecords(history);
      setFilteredRecords(filterRecords(history, selectedMonth));
    }
  }, [timeData, selectedMonth]);

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
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record, index) => (
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
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{...styles.history.td, textAlign: 'center', padding: '2rem', color: '#6b7280'}}>
                    Aucun enregistrement trouvé pour la période sélectionnée
                  </td>
                </tr>
              )}
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