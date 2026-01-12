import { useState } from "react";
import Login from "./pages/Login";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import ManagerDashboard from "../manager/pages/ManagerDashboard";
import AdminDashboard from "../admin/pages/AdminDashboard";

function App() {
  const [auth, setAuth] = useState({ user: null });

  const handleLogin = ({ user }) => {
    setAuth({ user });
  };

  const handleLogout = async () => {
    await AuthApi.logout();
    setAuth({ user: null });
  };

  useEffect(() => {
    apiFetch("/api/auth/me")
      .then((res) => setAuth({ user: res.user }))
      .catch(() => setAuth({ user: null }));
  }, []);


  const renderDashboard = () => {
    if (!auth.user) return null;

    switch (auth.user.role) {
      case "employee":
        return <EmployeeDashboard user={auth.user} onLogout={handleLogout} />;
      case "manager":
        return <ManagerDashboard user={auth.user} onLogout={handleLogout} />;
      case "super_admin":
        return <AdminDashboard user={auth.user} onLogout={handleLogout} />;
      default:
        return null;
    }
  };

  return (
    <div className="app">
      {!auth.user ? <Login onLogin={handleLogin} /> : renderDashboard()}
    </div>
  );
}

export default App;