import React, { useState } from "react";
import NavBar from "../../src/components/NavBar";
import styles from "../../src/style/style.ts";

export default function ManagerDashboard({ user, onLogout }) {
  const [showProfile, setShowProfile] = useState(false);
  const [activeTab, setActiveTab] = useState("Tableau de bord");

  const handleHomeClick = () => {
    setActiveTab("Tableau de bord");
    setShowProfile(false);
  };

  const handleShowProfile = () => {
    setShowProfile(true);
  };

  const renderTabContent = () => {
    if (showProfile) {
      return (
        <div style={styles.dashboard.contentContainer}>
          <h2>Profil Manager</h2>
          <button 
            style={styles.dashboard.navTab}
            onClick={() => setShowProfile(false)}
          >
            ← Retour
          </button>
          {/* Le composant Profil sera ajouté ici */}
        </div>
      );
    }

    switch (activeTab) {
      case "Tableau de bord":
        return (
          <div style={styles.dashboard.contentContainer}>
            <h2>📊 Tableau de bord Manager</h2>
            <p>Bienvenue sur votre espace Manager</p>
            {/* Contenu du dashboard à ajouter */}
          </div>
        );
      
      case "Mon équipe":
        return (
          <div style={styles.dashboard.contentContainer}>
            <h2>👥 Gestion de l'équipe</h2>
            {/* Liste des membres de l'équipe */}
          </div>
        );
      
      case "Statistiques":
        return (
          <div style={styles.dashboard.contentContainer}>
            <h2>📈 Statistiques de l'équipe</h2>
            {/* KPIs, retards, absences */}
          </div>
        );
      
      case "Émargements":
        return (
          <div style={styles.dashboard.contentContainer}>
            <h2>✅ Validation des émargements</h2>
            {/* Liste des émargements à valider */}
          </div>
        );
      
      case "Plannings":
        return (
          <div style={styles.dashboard.contentContainer}>
            <h2>📅 Gestion des plannings</h2>
            {/* Plannings de l'équipe */}
          </div>
        );
      
      case "Rapports":
        return (
          <div style={styles.dashboard.contentContainer}>
            <h2>📄 Rapports de l'équipe</h2>
            {/* Consultation et téléchargement des rapports */}
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
        user={user}
        role="Manager"
        onLogout={onLogout}
        onShowProfile={handleShowProfile}
        onHomeClick={handleHomeClick}
      />

      {/* Navigation Tabs - Hide when showing profile */}
      {!showProfile && (
        <nav style={styles.dashboard.nav}>
          {["Tableau de bord", "Mon équipe", "Statistiques", "Émargements", "Plannings", "Rapports"].map((tab) => (
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
