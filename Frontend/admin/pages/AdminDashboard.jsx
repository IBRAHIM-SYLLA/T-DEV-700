import React, { useState } from "react";
import NavBar from "../../src/components/NavBar";
import styles from "../../src/style/style.ts";

import TableauDeBordRH from "./dashboard/TableauDeBordRH";
import RapportsEtStatistiques from "./reports/RapportsEtStatistiques";
import BaseSalaries from "./employees/BaseSalaries";
import AdminProfil from "./Profil";

export default function AdminDashboard({ user, token, onLogout, onUpdateUser }) {
  const [activeTab, setActiveTab] = useState("Tableau de bord");
  const [showProfile, setShowProfile] = useState(false);

  const handleHomeClick = () => {
    setActiveTab("Tableau de bord");
    setShowProfile(false);
  };

  const renderContent = () => {
    if (showProfile) {
      return (
        <AdminProfil
          user={user}
          token={token}
          onUpdateUser={onUpdateUser}
          onBack={() => setShowProfile(false)}
        />
      );
    }

    switch (activeTab) {
      case "Tableau de bord":
        return <TableauDeBordRH token={token} />;
      case "Rapports":
        return <RapportsEtStatistiques token={token} />;
      case "Base salariés":
        return <BaseSalaries token={token} />;
      default:
        return null;
    }
  };

  return (
    <div style={styles.dashboard.container}>
      <NavBar
        user={user}
        role="RH"
        onLogout={onLogout}
        onShowProfile={() => setShowProfile(true)}
        onHomeClick={handleHomeClick}
      />

      {!showProfile && (
        <nav style={styles.dashboard.nav}>
          {["Tableau de bord", "Rapports", "Base salariés"].map((tab) => (
            <button
              key={tab}
              style={
                activeTab === tab
                  ? styles.mergeStyles(styles.dashboard.navTab, styles.dashboard.navTabActive)
                  : styles.dashboard.navTab
              }
              onClick={() => setActiveTab(tab)}
            >
              {tab === "Tableau de bord" && "📊"}
              {tab === "Rapports" && "📈"}
              {tab === "Base salariés" && "👥"} {tab}
            </button>
          ))}
        </nav>
      )}

      {renderContent()}
    </div>
  );
}
