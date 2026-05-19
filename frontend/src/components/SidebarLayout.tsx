import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { logout } from "../store/authSlice";

interface SidebarLayoutProps {
  children: React.ReactNode;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);

  function handleNavigate(path: string) {
    if (location.pathname !== path) {
      navigate(path);
    }
  }

  function handleLogout() {
    dispatch(logout());
  }

  const isDashboard = location.pathname === "/";
  const isClients =
    location.pathname === "/clients" ||
    location.pathname.startsWith("/clients/");
  const isAssurances = location.pathname === "/assurances";

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-header">INTIA Admin</div>
        <nav className="sidebar-nav">
          <button
            type="button"
            className={"sidebar-nav-button" + (isDashboard ? " active" : "")}
            onClick={() => handleNavigate("/")}
          >
            Dashboard
          </button>
          <button
            type="button"
            className={"sidebar-nav-button" + (isClients ? " active" : "")}
            onClick={() => handleNavigate("/clients")}
          >
            Clients
          </button>
          <button
            type="button"
            className={"sidebar-nav-button" + (isAssurances ? " active" : "")}
            onClick={() => handleNavigate("/assurances")}
          >
            Assurances
          </button>
        </nav>
        {auth.admin && (
          <div className="sidebar-footer">
            <div className="sidebar-user">
              <span className="sidebar-user-name">{auth.admin.name}</span>
              <span className="sidebar-user-email">{auth.admin.email}</span>
            </div>
            <button
              type="button"
              className="sidebar-logout"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        )}
      </aside>
      <main className="app-content">{children}</main>
    </div>
  );
};

export default SidebarLayout;
