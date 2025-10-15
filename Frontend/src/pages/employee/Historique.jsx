import React, { useState, useEffect } from "react";
import "../../style/Historique.css";

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
    <div className="history-container">
      <div className="history-content">
        <div className="history-header">
          <h2>Mon historique</h2>
          <select 
            className="month-selector"
            value={selectedMonth}
            onChange={handleMonthChange}
          >
            <option>Ce mois</option>
            <option>Mois précédent</option>
            <option>Dernier 3 mois</option>
          </select>
        </div>
        
        <div className="history-table-container">
          <table className="history-table">
            <thead>
              <tr>
                <th>DATE</th>
                <th>ARRIVÉE</th>
                <th>DÉPART</th>
                <th>DURÉE</th>
                <th>H. SUP.</th>
                <th>STATUT</th>
              </tr>
            </thead>
            <tbody>
              {historyRecords.map((record, index) => (
                <tr key={index}>
                  <td>{record.date}</td>
                  <td>{record.clockIn}</td>
                  <td>{record.clockOut}</td>
                  <td>{formatDuration(record.duration)}</td>
                  <td className="overtime-cell">
                    {record.overtime > 0 ? formatDuration(record.overtime) : '-'}
                  </td>
                  <td>
                    <span className={`status-badge ${record.status.toLowerCase()}`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="monthly-summary">
          <h3>Résumé mensuel</h3>
          <div className="summary-cards">
            <div className="summary-card">
              <div className="summary-number">{monthlyStats.daysWorked}</div>
              <div className="summary-label">Jours travaillés</div>
            </div>
            <div className="summary-card">
              <div className="summary-number">{monthlyStats.totalHours}h</div>
              <div className="summary-label">Heures totales</div>
            </div>
            <div className="summary-card">
              <div className="summary-number overtime">{monthlyStats.overtimeHours}h</div>
              <div className="summary-label">Heures sup.</div>
            </div>
            <div className="summary-card">
              <div className="summary-number delay">{monthlyStats.delays}</div>
              <div className="summary-label">Retards</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}