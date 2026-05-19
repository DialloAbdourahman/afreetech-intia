import React from "react";
import { logout } from "../store/authSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";

const DashboardPage: React.FC = () => {
  const auth = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  function handleLogout() {
    dispatch(logout());
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        {auth.admin && (
          <div className="dashboard-user">
            <span>
              {auth.admin.name} ({auth.admin.email})
            </span>
            <button onClick={handleLogout}>Logout</button>
          </div>
        )}
      </header>
      <main>
        <p>Welcome to the insurance admin panel. More pages will be added here.</p>
      </main>
    </div>
  );
};

export default DashboardPage;
