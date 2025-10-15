import React, { useState } from "react";
import "../style/EmployeeDashboard.css";
import Pointage from "./employee/Pointage";
import MonResume from "./employee/MonResume";
import Historique from "./employee/Historique";

export default function EmployeeDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("Pointage");
  const [timeData, setTimeData] = useState(null);

  // Handle time updates from Pointage component
  const handleTimeUpdate = (data) => {
    setTimeData(data);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "Pointage":
        return <Pointage onTimeUpdate={handleTimeUpdate} />;
      
      case "Mon résumé":
        return <MonResume timeData={timeData} />;
      
      case "Historique":
        return <Historique timeData={timeData} />;
      
      default:
        return null;
    }
  };

  return (
    <div className="employee-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo-section">
            <span className="logo-icon">⏰</span>
            <span className="app-name">TimeTrack Pro</span>
          </div>
          <span className="user-role">Salarié</span>
        </div>
        <div className="header-right">
          <span className="user-info">
            Connecté en tant que <strong>{user.username}</strong>
          </span>
          <button className="logout-btn" onClick={onLogout}>
            Déconnexion
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="dashboard-nav">
        {["Pointage", "Mon résumé", "Historique"].map((tab) => (
          <button
            key={tab}
            className={`nav-tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "Pointage" && "⏰"} 
            {tab === "Mon résumé" && "📊"} 
            {tab === "Historique" && "📈"} 
            {tab}
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="content-container">
          {renderTabContent()}
        </div>
      </main>
    </div>
  );
}