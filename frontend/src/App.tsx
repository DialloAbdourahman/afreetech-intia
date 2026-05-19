import React, { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import "./App.css";
import { fetchCurrentAdmin } from "./store/authSlice";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";

interface ProtectedRouteProps {
  children: React.ReactElement;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const auth = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const location = useLocation();

  useEffect(() => {
    if (auth.token && !auth.admin && auth.status === "idle") {
      dispatch(fetchCurrentAdmin());
    }
  }, [auth.token, auth.admin, auth.status, dispatch]);

  if (!auth.token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (auth.status === "loading" && !auth.admin) {
    return <div className="loading-screen">Loading...</div>;
  }

  if (!auth.admin && auth.status === "failed") {
    return <Navigate to="/login" replace />;
  }

  return children;
}

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
