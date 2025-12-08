
import React, { useState } from "react";
import Login from "./pages/Login";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import ManagerDashboard from "../manager/pages/ManagerDashboard";

function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  // Role-based routing with database roles
  const renderDashboard = () => {
    if (!user) return null;

    switch (user.role) {
      case "employee":
        return <EmployeeDashboard user={user} onLogout={handleLogout} />;
      case "manager":
        return <ManagerDashboard user={user} onLogout={handleLogout} />;
      case "super_admin":
        return (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>Admin Dashboard</h1>
            <p>Connecté en tant que : <strong>{user.firstName} {user.lastName}</strong></p>
            <p>En cours de développement...</p>
            <button 
              onClick={handleLogout}
              style={{
                background: '#dc2626',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                cursor: 'pointer',
                marginTop: '20px'
              }}
            >
              Déconnexion
            </button>
          </div>
        );
      default:
        return (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>Rôle non reconnu</h1>
            <p>Rôle utilisateur : <strong>{user.role}</strong></p>
            <p>Utilisateur : <strong>{user.firstName} {user.lastName}</strong></p>
            <button 
              onClick={handleLogout}
              style={{
                background: '#dc2626',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                cursor: 'pointer',
                marginTop: '20px'
              }}
            >
              Déconnexion
            </button>
          </div>
        );
    }
  };

  return (
    <div className="app">
      {!user ? (
        <Login onLogin={handleLogin} />
      ) : (
        renderDashboard()
      )}
    </div>
  );
}

export default App;
