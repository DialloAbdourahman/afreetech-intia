import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import { getStats } from "../services/stats.service";
import type { StatsDto } from "../types/stats";
import Navbar from "../components/Navbar";

const DashboardPage: React.FC = () => {
  const auth = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const [stats, setStats] = useState<StatsDto | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      if (!auth.token) return;

      try {
        setLoading(true);
        setError(null);
        const result = await getStats(auth.token);

        if (result.code !== "SUCCESS" || !result.data) {
          setError(result.message || "Failed to load statistics");
          return;
        }

        setStats(result.data);
      } catch (e: any) {
        setError(
          e?.payload?.message || e?.message || "Failed to load statistics",
        );
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, [auth.token]);

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <div className="dashboard-inner">
          <h1>Dashboard</h1>
          {loading && <p>Loading statistics...</p>}
          {error && <p className="error-text">{error}</p>}
          {stats && (
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-label">Total Clients</span>
                <span className="stat-value">{stats.clientsCount}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Total Insurances</span>
                <span className="stat-value">{stats.insurancesCount}</span>
              </div>
            </div>
          )}
          <div style={{ marginTop: "24px" }}>
            <button
              type="button"
              className="primary-button"
              onClick={() => navigate("/clients")}
            >
              View clients list
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
