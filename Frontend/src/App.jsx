
import React, { useState } from "react";
import Login from "./pages/Login";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import ManagerDashboard from "../manager/pages/ManagerDashboard";
import AdminDashboard from "../admin/pages/AdminDashboard";

function App() {
  const [auth, setAuth] = useState({ user: null, token: null });

  const handleLogin = ({ user, token }) => {
    setAuth({ user, token });
  };

  const handleLogout = () => {
    setAuth({ user: null, token: null });
  };

  const handleUpdateUser = (updatedUser) => {
    setAuth((prev) => ({ ...prev, user: updatedUser }));
  };

  // Role-based routing with database roles
  const renderDashboard = () => {
    if (!auth.user) return null;

    switch (auth.user.role) {
      case "employee":
        return (
          <EmployeeDashboard
            user={auth.user}
            token={auth.token}
            onLogout={handleLogout}
            onUpdateUser={handleUpdateUser}
          />
        );
      case "manager":
        return (
          <ManagerDashboard
            user={auth.user}
            token={auth.token}
            onLogout={handleLogout}
            onUpdateUser={handleUpdateUser}
          />
        );
      case "super_admin":
        return (
          <AdminDashboard
            user={auth.user}
            token={auth.token}
            onLogout={handleLogout}
            onUpdateUser={handleUpdateUser}
          />
        );
      default:
        return (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>Rôle non reconnu</h1>
            <p>Rôle utilisateur : <strong>{auth.user.role}</strong></p>
            <p>Utilisateur : <strong>{auth.user.firstName} {auth.user.lastName}</strong></p>
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
      {!auth.user ? (
        <Login onLogin={handleLogin} />
      ) : (
        renderDashboard()
      )}
    </div>
  );
}

export default App;
