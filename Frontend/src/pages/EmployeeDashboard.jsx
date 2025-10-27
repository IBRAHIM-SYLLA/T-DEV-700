import React, { useState } from "react";
import styles from "../style/style.ts";
import Pointage from "./employee/Pointage";
import MonResume from "./employee/MonResume";
import Historique from "./employee/Historique";
import Profil from "./employee/Profil";

export default function EmployeeDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("Pointage");
  const [timeData, setTimeData] = useState(null);
  const [currentUser, setCurrentUser] = useState(user);
  const [showProfile, setShowProfile] = useState(false);

  // Handle time updates from Pointage component
  const handleTimeUpdate = (data) => {
    setTimeData(data);
  };

  // Handle user profile updates
  const handleUpdateUser = (updatedUser) => {
    setCurrentUser(updatedUser);
  };

  const renderTabContent = () => {
    if (showProfile) {
      return (
        <Profil 
          user={currentUser} 
          onUpdateUser={handleUpdateUser}
          onBack={() => setShowProfile(false)}
        />
      );
    }

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
    <div style={styles.dashboard.container}>
      {/* Header avec logo cliquable */}
      <header style={styles.dashboard.header}>
        <div style={styles.dashboard.headerLeft}>
          <div style={styles.dashboard.logoSection}>
          <button 
            style={logoHovered ? 
              styles.mergeStyles(styles.dashboard.logoSection, styles.dashboard.logoSectionHover) : 
              styles.dashboard.logoSection
            }
            onClick={() => {
              setActiveTab("Pointage");
              setShowProfile(false);
            }}
            onMouseEnter={() => setLogoHovered(true)}
            onMouseLeave={() => setLogoHovered(false)}
            title="Retour à l'accueil - Pointage"
          >
            <span style={styles.dashboard.logoIcon}>⏰</span>
            <span style={styles.dashboard.appName}>TimeTrack Pro</span>
          </div>
          <span style={styles.dashboard.userRole}>Employé</span>
        </div>
        <div style={styles.dashboard.headerRight}>
          <span style={styles.dashboard.userInfo}>
            Connecté en tant que <strong>{user?.firstName || 'Utilisateur'} {user?.lastName || ''}</strong>
          </span>
          <button 
            style={styles.dashboard.editProfileBtn} 
            onClick={() => setShowProfile(true)}
          >
            ✏️ Profil
          </button>
          <button style={styles.dashboard.logoutBtn} onClick={onLogout}>
            Déconnexion
          </button>
        </div>
      </header>

      {/* Navigation Tabs - Hide when showing profile */}
      {!showProfile && (
        <nav style={styles.dashboard.nav}>
          {["Pointage", "Mon résumé", "Historique"].map((tab) => (
            <button
              key={tab}
              style={activeTab === tab ? 
                styles.mergeStyles(styles.dashboard.navTab, styles.dashboard.navTabActive) : 
                styles.dashboard.navTab
              }
              onClick={() => setActiveTab(tab)}
            >
              {tab === "Pointage" && "⏰"} 
              {tab === "Mon résumé" && "📊"} 
              {tab === "Historique" && "📈"} 
              {tab}
            </button>
          ))}
        </nav>
      )}

      {/* Main Content */}
      <main style={styles.dashboard.main}>
        <div style={styles.dashboard.contentContainer}>
          {renderTabContent()}
        </div>
      </main>
    </div>
  );
}
