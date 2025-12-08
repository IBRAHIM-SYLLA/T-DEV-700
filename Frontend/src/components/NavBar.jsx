import React, { useState } from "react";
import styles from "../style/style.ts";

export default function NavBar({ user, role, onLogout, onShowProfile, onHomeClick }) {
  const [logoHovered, setLogoHovered] = useState(false);

  return (
    <header style={styles.dashboard.header}>
      <div style={styles.dashboard.headerLeft}>
        <button 
          style={logoHovered ? 
            styles.mergeStyles(styles.dashboard.logoSection, styles.dashboard.logoSectionHover) : 
            styles.dashboard.logoSection
          }
          onClick={onHomeClick}
          onMouseEnter={() => setLogoHovered(true)}
          onMouseLeave={() => setLogoHovered(false)}
          title="Retour à l'accueil"
        >
          <span style={styles.dashboard.logoIcon}>⏰</span>
          <span style={styles.dashboard.appName}>TimeTrack Pro</span>
        </button>
        <span style={styles.dashboard.userRole}>{role}</span>
      </div>
      <div style={styles.dashboard.headerRight}>
        <span style={styles.dashboard.userInfo}>
          Connecté en tant que <strong>{user?.firstName || 'Utilisateur'} {user?.lastName || ''}</strong>
        </span>
        <button 
          style={styles.dashboard.editProfileBtn} 
          onClick={onShowProfile}
        >
          ✏️ Profil
        </button>
        <button style={styles.dashboard.logoutBtn} onClick={onLogout}>
          Déconnexion
        </button>
      </div>
    </header>
  );
}
