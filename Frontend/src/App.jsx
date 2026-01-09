import React, { useState, useEffect } from "react";
import Login from "./pages/Login";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import ManagerDashboard from "../manager/pages/ManagerDashboard";
import AdminDashboard from "../admin/pages/AdminDashboard";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

function App() {
  const [currentPage, setCurrentPage] = useState("login");
  const [auth, setAuth] = useState(() => {
    try {
      const raw = localStorage.getItem("tm_auth");
      if (!raw) return { user: null, token: null };
      const parsed = JSON.parse(raw);
      if (!parsed?.token || !parsed?.user) return { user: null, token: null };
      return { user: parsed.user, token: parsed.token };
    } catch {
      return { user: null, token: null };
    }
  });

  // Gérer le routing basique
  useEffect(() => {
    const path = window.location.pathname;
    if (path === "/forgot-password") {
      setCurrentPage("forgot-password");
    } else if (path === "/reset-password" || window.location.search.includes("token=")) {
      setCurrentPage("reset-password");
    } else {
      setCurrentPage("login");
    }
       // Écouter les changements d'URL
    const handlePopState = () => {
      const newPath = window.location.pathname;
      if (newPath === "/forgot-password") {
        setCurrentPage("forgot-password");
      } else if (newPath === "/reset-password") {
        setCurrentPage("reset-password");
      } else {
        setCurrentPage("login");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleLogin = ({ user, token }) => {
    setAuth({ user, token });
    try {
      localStorage.setItem("tm_auth", JSON.stringify({ user, token }));
      window.history.pushState({}, "", "/");
      setCurrentPage("dashboard");
    } catch {
      // ignore
    }
  };

  const handleLogout = () => {
    setAuth({ user: null, token: null });
    try {
      localStorage.removeItem("tm_auth");
      window.history.pushState({}, "", "/");
      setCurrentPage("login");
    } catch {
      // ignore
    }
  };

  const handleUpdateUser = (updatedUser) => {
    setAuth((prev) => {
      const next = { ...prev, user: updatedUser };
      try {
        if (next?.token && next?.user) {
          localStorage.setItem("tm_auth", JSON.stringify({ user: next.user, token: next.token }));
        }
      } catch {
        // ignore
      }
      return next;
    });
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


  // Router logic
  const renderPage = () => {
    // Si l'utilisateur est connecté et qu'il n'est pas sur une page publique
    if (auth.user && currentPage !== "forgot-password" && currentPage !== "reset-password") {
      return renderDashboard();
    }

    // Pages publiques
    switch (currentPage) {
      case "forgot-password":
        return <ForgotPassword />;
      case "reset-password":
        return <ResetPassword />;
      default:
        return <Login onLogin={handleLogin} />;
    }
  };

  return <div className="app">{renderPage()}</div>;
}

export default App;
