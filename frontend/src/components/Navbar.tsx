import React from "react";
import { logout } from "../store/authSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";

const Navbar: React.FC = () => {
  const auth = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  if (!auth.admin) return null;

  function handleLogout() {
    dispatch(logout());
  }

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <span className="navbar-brand">INTIA Admin</span>
      </div>
      <div className="navbar-right">
        <span className="navbar-user-email">{auth.admin.email}</span>
        <button className="navbar-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
