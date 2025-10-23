
import React, { useState } from "react";
import Login from "./pages/Login";
import EmployeeDashboard from "./pages/EmployeeDashboard";

function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  // Role-based routing - currently only Employee dashboard
  const renderDashboard = () => {
    if (!user) return null;

    switch (user.role) {
      case "Salarié":
        return <EmployeeDashboard user={user} onLogout={handleLogout} />;
      case "Manager":
        return (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>Manager Dashboard</h1>
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
      case "RH":
        return (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>Admin Dashboard (RH)</h1>
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
        return <div>Rôle non reconnu</div>;
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
